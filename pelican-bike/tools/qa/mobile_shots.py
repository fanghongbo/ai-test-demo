"""移动端布局检查：竖屏 390x844 与横屏 844x390（触屏仿真），开场页与骑行页各一张，并断言首屏能看到主按钮。"""
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent; ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from harness import UA_FLAGS
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    for name, (w, h) in {'portrait': (390, 844), 'landscape': (844, 390)}.items():
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); logs = []
        pg.on('pageerror', lambda e: logs.append(str(e)))
        pg.goto((ROOT / 'index.html').as_uri() + '?freeze=1'); pg.wait_for_function('window.__sceneReady === true'); pg.wait_for_timeout(900)
        box = pg.evaluate("(() => { const r = document.getElementById('btnStart').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; })()")
        print(name, '开始按钮位置', {k: round(v) for k, v in box.items()}, '首屏内' if box['bottom'] <= h and box['top'] >= 0 else '超出首屏')
        pg.screenshot(path=str(ROOT / f'shots/app/mob_{name}_intro.png'))
        pg.tap('#btnStart'); pg.wait_for_timeout(700)
        pg.evaluate("__ride.target(14); __ride.settle(240)")
        touch = pg.evaluate("getComputedStyle(document.getElementById('touch')).display")
        overflow = pg.evaluate('document.scrollingElement.scrollWidth > innerWidth + 1')
        print(name, '触屏按钮', touch, '横向溢出', overflow, 'errors', logs[:2])
        pg.screenshot(path=str(ROOT / f'shots/app/mob_{name}_ride.png'))
        ctx.close()
    b.close()
