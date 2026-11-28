"""性能：画一帧要多久（CPU + GPU，最后逼着显卡同步），各档画质 × 几种窗口大小 × 几个有代表性的画面。
这台机器通过远程桌面用时刷新率封在 32 赫兹，帧率本身说明不了问题，单帧耗时才是显卡的负担。

  python tools/qa/perf.py [--sizes 1280x720,1920x1080] [--quality 0,1,2] [--json shots/perf.json]
"""
import argparse
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--sizes', default='1280x720,1920x1080')
ap.add_argument('--quality', default='0,1,2')
ap.add_argument('--json', default='')
a = ap.parse_args()

# （名字，摆到那个画面的 JS）
VIEWS = [
    ('title', "() => { window.__game.title(); }"),
    ('start', "() => { window.__game.retry(5); }"),
    ('mid', "() => { window.__game.warp(14, { wolf: 22 }); }"),
    ('wolf', "() => { window.__game.wolf(7); }"),
]
rows = []
NAMES = dict(quality={0: '流畅', 1: '均衡', 2: '极致'})
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, logs = open_page(browser, size=(1280, 720), query='?seed=5&q=2')
    renderer = page.evaluate("() => { const c = document.createElement('canvas'), gl = c.getContext('webgl2'), i = gl.getExtension('WEBGL_debug_renderer_info'); return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : 'unknown'; }")
    print('renderer:', renderer)
    for size in a.sizes.split(','):
        w, h = (int(v) for v in size.split('x'))
        page.set_viewport_size({'width': w, 'height': h})
        for q in (int(v) for v in a.quality.split(',')):
            page.evaluate("(q) => window.__game.quality(String(q))", q)
            for name, js in VIEWS:
                page.evaluate(js)
                page.wait_for_timeout(1500)                                   # 换了画质、换了地方都在编译着色器、传几何
                page.evaluate('() => window.__game.freeze(true)')             # 画面停住，只量渲染本身
                page.evaluate('() => window.__game.measure(40)')              # 预热：显卡从省电档升到工作频率要一会儿
                ms = page.evaluate('() => window.__game.measure(40)')
                st = page.evaluate('() => window.__game.stats()')
                page.evaluate('() => window.__game.freeze(false)')
                row = {'size': size, 'q': q, 'view': name, 'ms': ms, 'calls': st['calls'], 'tris': st['triangles'], 'ratio': st['ratio'], 'level': st['level'], 'nodes': st['nodes']}
                rows.append(row)
                flag = '' if ms < 16.7 else ('  (> 16.7 ms：掉到 60 帧以下)' if ms < 33.4 else '  (> 33 ms：掉到 30 帧以下)')
                print(f"{size:>11} {NAMES['quality'][q]} {name:6s} {ms:6.2f} ms  实际档 {st['level']}  {st['calls']:4d} 次绘制  {st['triangles'] / 1e6:5.2f} 百万个三角形  像素比 {st['ratio']}{flag}", flush=True)
    browser.close()
if logs:
    print('console:', ' | '.join(logs[:5]))
if a.json:
    pathlib.Path(a.json).write_text(json.dumps({'renderer': renderer, 'rows': rows}, indent=1), encoding='utf-8')
sys.exit(1 if any(l.startswith(('[pageerror]', '[error]')) for l in logs) else 0)
