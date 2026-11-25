"""帧耗时：每个画质档、每种分辨率，各量 30 帧的单帧耗时（渲染后读回一个像素，逼 GPU 同步）。
python tools/qa/perf.py            输出一张表，并写 shots/game/perf.json"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = ROOT / 'shots' / 'game'
OUT.mkdir(parents=True, exist_ok=True)
PLACE = "(() => { const g = __game.game, p = g.player; g.actors.forEach((a) => { if (a.isBot) a.frozen = true; }); p.protect = 1e9; Object.assign(p.body, { x: -23.5, y: 0, z: 4.5, vx: 0, vy: 0, vz: 0 }); p.yaw = -0.5; p.pitch = 0.03; __game.pause(); })()"
rows = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    for w, h in [(1280, 720), (1920, 1080)]:
        page = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1).new_page()
        page.goto((ROOT / 'index.html').as_uri() + '?auto=1&seed=7')
        page.wait_for_function('window.__sceneReady === true', timeout=60000)
        page.wait_for_timeout(1500)
        for q in (2, 1, 0):
            page.evaluate(f'__game.stage.setQuality({q}); __game.game.settings.quality = "auto"')
            page.evaluate(PLACE)
            page.wait_for_timeout(400)
            r = page.evaluate('(() => { const s = __game.stage; const ms = __game.measure(30); return { ms, calls: s.renderer.info.render.calls, tris: s.renderer.info.render.triangles, dpr: s.renderer.getPixelRatio() }; })()')
            rows.append(dict(w=w, h=h, q=q, **r))
            print(f"{w}×{h} 档位 {q}: {r['ms']:.2f} ms/帧  {r['calls']} 次绘制  {r['tris']} 三角形  dpr {r['dpr']}")
        page.evaluate('__game.resume()')
        page.close()
    b.close()
(OUT / 'perf.json').write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding='utf-8')
