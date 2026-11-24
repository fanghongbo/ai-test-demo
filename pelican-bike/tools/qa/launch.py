"""启动给人看：用默认浏览器（Edge / Chrome）打开一个可见窗口，连上去确认页面渲染成功，然后把窗口留给用户。
python tools/qa/launch.py [查询串，如 "intro=0&hour=18.2"]
窗口使用临时配置目录和调试端口 9223，不碰你平时的浏览器配置。"""
import os
import pathlib
import subprocess
import sys
import tempfile
import time
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PORT = 9223
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

CANDIDATES = [
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
]
exe = next((p for p in CANDIDATES if os.path.exists(p)), None)
if not exe:
    print('没有找到 Edge 或 Chrome'); sys.exit(2)

query = sys.argv[1] if len(sys.argv) > 1 else ''
url = (ROOT / 'index.html').as_uri() + (('?' + query) if query else '')
profile = os.path.join(tempfile.gettempdir(), 'pelican-ride-profile')

# 如果上次留下的窗口还开着，直接把地址交给它，不再开第二个实例
try:
    targets = __import__('json').loads(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/list', timeout=1).read())
    page_target = next((t for t in targets if t.get('type') == 'page'), None)
    if page_target:
        __import__('urllib.request').request.urlopen(f"http://127.0.0.1:{PORT}/json/new?{url}", data=b'') if False else None
        subprocess.Popen([exe, f'--remote-debugging-port={PORT}', f'--user-data-dir={profile}', url], creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP, close_fds=True)
        print(f'已有窗口在运行，已在其中打开新标签页：{os.path.basename(exe)}')
        sys.exit(0)
except Exception:
    pass

flags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
subprocess.Popen(
    [exe, f'--remote-debugging-port={PORT}', f'--user-data-dir={profile}', '--no-first-run', '--no-default-browser-check',
     '--window-size=1440,900', '--window-position=60,40', url],
    creationflags=flags, close_fds=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 等调试端口起来
for _ in range(80):
    try:
        urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json/version', timeout=1).read()
        break
    except Exception:
        time.sleep(0.25)
else:
    print('浏览器调试端口没有起来'); sys.exit(1)

from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(f'http://127.0.0.1:{PORT}')
    page = None
    for _ in range(120):
        for ctx in browser.contexts:
            for pg in ctx.pages:
                if 'index.html' in pg.url:
                    page = pg
        if page:
            break
        time.sleep(0.25)
    if not page:
        print('没有找到页面'); sys.exit(1)
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    try:
        page.wait_for_function("document.getAnimations().length && document.getAnimations().every(a => a.playState === 'finished')", timeout=15_000)
    except Exception:
        pass
    page.wait_for_timeout(300)
    out = pathlib.Path(tempfile.gettempdir()) / 'pelican-ride-launch.png'
    page.screenshot(path=str(out))
    info = page.evaluate('({ state: __ride.state(), calls: __ride.stats().calls, tris: __ride.stats().triangles, dpr: __ride.stats().dpr, gpu: (() => { const gl = document.createElement("canvas").getContext("webgl2"); const i = gl.getExtension("WEBGL_debug_renderer_info"); return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : "?"; })() })')
    print('浏览器      :', os.path.basename(exe))
    print('地址        :', page.url)
    print('GPU         :', info['gpu'])
    print('渲染        :', info['calls'], '次绘制,', info['tris'], '个三角形, 像素比', info['dpr'])
    print('状态        :', info['state']['phase'], '|', f"{info['state']['kmh']:.1f}", 'km/h |', info['state']['cam'])
    print('页面错误    :', errors or '无')
    print('截图        :', out)
    # 不调用 browser.close()：这是连上去的浏览器，脚本退出即断开，窗口留给用户
