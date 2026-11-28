"""性能：画一帧要多久（CPU + GPU，读一个像素逼着同步），各档画质 × 几种窗口大小 × 几个有代表性的画面。
这台机器远程桌面时刷新率封在 32 赫兹，帧率本身说明不了问题，单帧耗时才是显卡的负担。

  python tools/qa/perf.py [--sizes 1280x720,1920x1080] [--quality 0,1,2] [--views title,gate,hall,garden,kelp,night] [--json out.json]
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
ap.add_argument('--views', default='title,gate,hall,garden,kelp,night')
ap.add_argument('--json', default='')
a = ap.parse_args()
SHOT = {'gate': 1, 'hall': 5, 'garden': 9, 'kelp': 10, 'wreck': 11}
rows = []
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, logs = open_page(browser, size=(1280, 720))
    renderer = page.evaluate("() => { const c = document.createElement('canvas'), gl = c.getContext('webgl2'), i = gl.getExtension('WEBGL_debug_renderer_info'); return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : 'unknown'; }")
    print('renderer:', renderer)
    for size in a.sizes.split(','):
        w, h = (int(v) for v in size.split('x'))
        page.set_viewport_size({'width': w, 'height': h})
        for q in (int(v) for v in a.quality.split(',')):
            page.evaluate("(q) => window.__game.setQuality(String(q))", q)
            for view in a.views.split(','):
                js = "window.__game.setMode('title')"
                if view == 'night':
                    page.evaluate("() => window.__game.setTime('night')")
                else:
                    page.evaluate("() => window.__game.setTime('afternoon')")
                if view in SHOT:
                    js = f"window.__game.jumpShot({SHOT[view]})"
                page.evaluate(f"() => {{ {js}; }}")
                page.wait_for_timeout(3200)                                  # 换了画质、换了镜头都在编译着色器、上传贴图
                page.evaluate('() => window.__game.pause(true)')
                page.evaluate('() => window.__game.measure(60)')             # 预热：显卡从省电档升到工作频率要一两秒
                ms = page.evaluate('() => window.__game.measure(30)')
                st = page.evaluate('() => window.__game.stats()')
                row = {'size': size, 'q': q, 'view': view, 'ms': ms, 'calls': st['calls'], 'tris': st['tris'], 'dpr': st['dpr'], 'level': st['level']}
                rows.append(row)
                flag = '' if ms < 16.7 else ('  (> 16.7 ms：掉到 60 帧以下)' if ms < 33.4 else '  (> 33 ms：掉到 30 帧以下)')
                print(f"{size:>11} q{q} {view:8s} {ms:6.2f} ms  实际档 {st['level']}  {st['calls']:4d} 次绘制  {st['tris'] / 1e6:5.2f} 百万个三角形  dpr {st['dpr']}{flag}", flush=True)   # 量的时候实际在哪一档：自动画质换过档的话这里会对不上
    browser.close()
if logs:
    print('console:', ' | '.join(logs[:5]))
if a.json:
    pathlib.Path(a.json).write_text(json.dumps({'renderer': renderer, 'rows': rows}, indent=1), encoding='utf-8')
sys.exit(1 if any(l.startswith(('[pageerror]', '[error]')) for l in logs) else 0)
