"""Quick look: open the page, run a JS snippet, save a screenshot and a few evaluated values."""
import json
import pathlib
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()
FLAGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
args = sys.argv[1:]
query = args[0] if args and args[0].startswith('?') else ''
js = args[1] if len(args) > 1 else ''
out = args[2] if len(args) > 2 else 'shots/look/a.jpg'
size = (1600, 900)
if out.startswith('s'):
    pass
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=FLAGS)
    ctx = b.new_context(viewport={'width': size[0], 'height': size[1]}, device_scale_factor=1)
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto(BASE + query, wait_until='load')
    try:
        page.wait_for_function('window.__sceneReady === true', timeout=60000)
    except Exception as e:  # noqa: BLE001
        logs.append('not ready: ' + str(e)[:200])
    page.wait_for_timeout(1200)
    if js:
        r = page.evaluate(js)
        print('js:', json.dumps(r, ensure_ascii=False)[:600] if r is not None else None)
        page.wait_for_timeout(900)
    pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=out, type='jpeg', quality=84)
    print('shot', out, pathlib.Path(out).stat().st_size // 1024, 'KB')
    for l in logs[:14]:
        print(l[:700])
    b.close()
