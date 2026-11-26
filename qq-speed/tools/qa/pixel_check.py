"""像素检查：HDR 场景缓冲里不许有一个非有限（NaN / Inf）的像素，材质的数值也不许是。

来由：曾经有个参数名把外层对象遮蔽了，道具光晕和冲击波的透明度算成 NaN，加色混合写出 NaN 像素，
泛光的模糊再把它抹成整屏黑。这种错误在画面上表现为“偶尔黑一帧”，很难靠截图抓到，所以直接读回缓冲来数。

做法：每帧正常渲染完之后，把场景单独再画一遍（不经过后期），读回半精度像素逐通道检查指数位。
  1. 逐个触发道具效果（冲击波、护罩、磁铁、氮气、香蕉、导弹、水炸弹、爆炸），这段时间电脑车手不用道具；
  2. 再让电脑车手混用全部道具跑一局。
系统 Edge + 真实 GPU（无头）。

  python tools/qa/pixel_check.py [--sec 20] [--inject]      退出码：0 干净；1 有问题
"""
import argparse
import json
import pathlib
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import launch  # noqa: E402

INIT = "localStorage.setItem('nova.settings', JSON.stringify({ mode: 'item', laps: 2 }));"
HOOK = """() => { const g = window.__game, st = g.stage, r = st.renderer, pf = st.postfx, S = window.__px = { on: false, clear: false, frames: 0, bad: 0, n: 0, worst: null };
  const bufs = new Map(); let k = 0;
  const orig = st.render.bind(st);
  st.render = (dt, time) => {
    if (S.clear) for (const c of g.race.cars) c.items[0] = c.items[1] = null;                 // 这一段时间不让电脑车手用道具
    orig(dt, time);
    if (!S.on || k++ % 2) return;
    const A = pf.composer.renderTarget1, B = pf.composer.renderTarget2;
    pf.composer.passes[0].render(r, A, B);                                                     // 只画场景：画完 three 会把多重采样缓冲归并掉
    const w = B.width, h = B.height; let buf = bufs.get(B);
    if (!buf || buf.length !== w * h * 4) { buf = new Uint16Array(w * h * 4); bufs.set(B, buf); }
    r.readRenderTargetPixels(B, 0, 0, w, h, buf);
    let n = 0;
    for (let i = 0; i < buf.length; i += 4) { for (let c = 0; c < 3; c++) if ((buf[i + c] & 0x7c00) === 0x7c00) { n++; break; } }   // 半精度的指数位全 1 = NaN 或 Inf
    S.frames++; if (n) { S.bad++; S.n += n; if (!S.worst || n > S.worst.n) S.worst = { n, t: +time.toFixed(1) }; }
  };
  window.__pxReset = () => { S.frames = 0; S.bad = 0; S.n = 0; S.worst = null; };
}"""
# 依次触发。前两条导弹 / 水炸弹把冲击波临时关掉，好让每个效果单独受检；冲击波和爆炸另外受检
EFFECTS = [
    ('control', "0"),
    ('shock ring', "() => { const P = window.__game.race.player.S, c = Math.cos(P.psi), s = Math.sin(P.psi); window.__game.itemFx.shock(P.x + c * 9, P.z + s * 9, 0xffa040, 7); }"),
    ('angel shield', "() => { const g = window.__game; g.item('angel'); g.fire('angel'); }"),
    ('magnet beam', "() => { const g = window.__game; g.item('magnet'); g.fire('magnet'); }"),
    ('nitro flame', "() => { const g = window.__game; g.item('nitro'); g.fire('nitro'); }"),
    ('banana', "() => { const g = window.__game; g.item('banana'); g.fire('banana'); }"),
    ('missile', "() => { const g = window.__game; g.__shock = g.itemFx.shock; g.itemFx.shock = () => {}; g.item('missile'); g.fire('missile'); }"),
    ('water bomb', "() => { const g = window.__game; g.item('bomb'); g.fire('bomb'); }"),
    ('missile hit + shock', "() => { const g = window.__game; g.itemFx.shock = g.__shock; g.item('missile'); g.fire('missile'); }"),
    ('bomb splash + shock', "() => { const g = window.__game; g.item('bomb'); g.fire('bomb'); }"),
]
MATERIALS = """() => { const seen = new Set(), bad = []; const chk = (m, o) => { if (!m || seen.has(m)) return; seen.add(m);
  let name = ''; for (let p = o; p && !name; p = p.parent) name = p.name;                      // 自己没有名字就往上找第一个有名字的祖先
  if (!Number.isFinite(m.opacity)) bad.push(name + ' opacity'); if (m.emissiveIntensity !== undefined && !Number.isFinite(m.emissiveIntensity)) bad.push(name + ' emissive');
  if (m.uniforms) for (const [k, u] of Object.entries(m.uniforms)) if (typeof u.value === 'number' && !Number.isFinite(u.value)) bad.push(name + ' ' + k); };
  window.__game.stage.scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => chk(m, o)); });
  return [...new Set(bad)].slice(0, 8); }"""
GIVE = """(keys) => { const cs = window.__game.race.cars; keys.forEach((k, i) => { const c = cs[i % cs.length]; if (!c.items[0] && !c.items[1]) c.items[c.slot] = k; }); }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sec', type=int, default=20, help='电脑车手混用全部道具的时间（秒）')
    ap.add_argument('--quality', type=int, default=2)
    ap.add_argument('--inject', action='store_true', help='自检：故意把道具的夜间亮度系数改成 NaN，这个工具必须报 PROBLEM')
    a = ap.parse_args()
    problems, logs = [], []
    with sync_playwright() as p:
        browser = launch(p)
        ctx = browser.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1)
        ctx.add_init_script(INIT)
        page = ctx.new_page()
        page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
        page.goto(BASE + f'?autostart=1&skipintro=1&ai=1&quality={a.quality}', wait_until='load')
        page.wait_for_function('window.__sceneReady === true', timeout=90000)
        page.wait_for_function('window.__game.state === "race"', timeout=30000)
        page.evaluate(HOOK)
        if a.inject:
            page.evaluate('() => { window.__game.itemFx.f = NaN; }')
        page.evaluate('() => { window.__px.on = true; window.__px.clear = true; }')
        for name, js in EFFECTS:
            page.wait_for_timeout(2300)                                  # 上一个效果的烟、水花、护罩先散干净
            page.evaluate('() => window.__pxReset()')
            page.evaluate(js)
            page.wait_for_timeout(2400)
            st = page.evaluate('() => window.__px')
            print(f"  {name:24s} 扫了 {st['frames']:3d} 帧，坏的 {st['bad']:3d} 帧，{st['n']:6d} 像素{'   <- 有非有限像素' if st['bad'] else ''}")
            if st['bad']:
                problems.append(f'{name}: {st["bad"]} 帧 / {st["n"]} 像素 {json.dumps(st["worst"])}')
        page.evaluate('() => { window.__px.clear = false; }')
        page.evaluate('() => window.__pxReset()')
        keys = ['missile', 'bomb', 'banana', 'magnet', 'angel', 'nitro']
        t0, t_give, t_mat = time.time(), 0, 0
        while time.time() - t0 < a.sec:
            now = time.time()
            if now - t_give > 0.3:
                t_give = now
                page.evaluate(f'({GIVE})({json.dumps(keys)})')
            if now - t_mat > 1:
                t_mat = now
                problems += [f'material: {x}' for x in (page.evaluate(MATERIALS) or []) if f'material: {x}' not in problems]
            page.wait_for_timeout(110)
        st = page.evaluate('() => window.__px')
        used = page.evaluate('() => window.__game.race.cars.reduce((a, c) => a + c.stats.items, 0)')
        print(f"  {'everything at once':24s} 扫了 {st['frames']:3d} 帧，坏的 {st['bad']:3d} 帧，{st['n']:6d} 像素（道具用出 {used} 次）")
        if st['bad']:
            problems.append(f'everything: {st["bad"]} 帧 / {st["n"]} 像素 {json.dumps(st["worst"])}')
        browser.close()
    for line in logs[:12]:
        print('  ' + line[:400])
    bad = problems or any(line.startswith('[pageerror]') or '[error]' in line for line in logs)
    for x in problems[:10]:
        print('  ' + x)
    print('PIXEL PROBLEM' if bad else 'PIXEL OK（没有非有限的像素，材质数值都是有限数）')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
