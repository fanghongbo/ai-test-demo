"""真实时间下每一帧都花在哪：把 update / 界面 / 渲染 / 反射 各包一层计时，跑几秒求平均。
python tools/qa/profile.py [--seconds 8] [--query "auto=1"]"""
import argparse
import pathlib
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--seconds', type=int, default=8)
ap.add_argument('--query', default='auto=1&seed=7')
a = ap.parse_args()
WRAP = r"""(() => {
  const T = window.__T = { n: 0, total: 0, t: {} }, now = () => performance.now();
  const wrap = (obj, name, label) => { const f = obj[name]; if (!f || f.__w) return; const g = function (...args) { const t0 = now(); try { return f.apply(this, args); } finally { T.t[label] = (T.t[label] || 0) + now() - t0; } }; g.__w = true; obj[name] = g; };
  wrap(__game.game, 'update', 'game.update');
  wrap(__game.hud, 'update', 'hud.update');
  wrap(__game.stage.sea, 'renderReflection', 'sea.reflection');
  wrap(__game.stage, 'render', 'stage.render');
  wrap(__game.stage, 'vmSync', 'vmSync');
  wrap(__game.game.fx, 'update', 'fx.update');
  wrap(__game.game, 'update', 'game.update.total');
  let last = now(); T.gaps = [];
  const loop = () => { const t = now(); T.gaps.push(t - last); last = t; T.n++; T.total = t - T.t0; requestAnimationFrame(loop); };
  T.t0 = now(); requestAnimationFrame(loop);
})()"""
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    page.goto((ROOT / 'index.html').as_uri() + '?' + a.query)
    page.wait_for_function('window.__sceneReady === true', timeout=60000)
    page.wait_for_timeout(2000)
    page.evaluate(WRAP)
    page.keyboard.down('KeyW')
    page.wait_for_timeout(a.seconds * 1000)
    page.keyboard.up('KeyW')
    r = page.evaluate("""(() => { const T = __T, gaps = T.gaps.slice(2).sort((a, b) => a - b), avg = (k) => +(T.t[k] / T.n).toFixed(2);
      return { frames: T.n, fps: +(T.n / (T.total / 1000)).toFixed(1), frameMedianMs: +gaps[gaps.length >> 1].toFixed(1), frameP95Ms: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), frameMaxMs: +gaps[gaps.length - 1].toFixed(1),
        update: avg('game.update'), hud: avg('hud.update'), fx: avg('fx.update'), reflection: avg('sea.reflection'), postfx: avg('postfx'), vmSync: avg('vmSync'),
        stageRender: avg('stage.render'), quality: __game.stage.quality, calls: __game.stage.renderer.info.render.calls }; })()""")
    print(r)
    b.close()
