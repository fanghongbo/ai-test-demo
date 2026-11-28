"""Views: open the page once, run one JS snippet per view, screenshot each, and paste them into a single sheet.

  python tools/qa/views.py views.json [--out shots/sheet] [--size 1600x900] [--cols 2] [--w 900]

views.json: [ { "name": "...", "js": "() => { ... }", "wait": 900, "query": "?hour=..." }, ... ]
The first view's `query` (if any) is used for the page URL; later ones only re-run their `js`.
"""
import argparse
import json
import pathlib
import sys
import time
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, pin_browser  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('views')
ap.add_argument('--out', default='shots/sheet')
ap.add_argument('--size', default='1600x900')
ap.add_argument('--cols', type=int, default=2)
ap.add_argument('--w', type=int, default=900)
ap.add_argument('--init', default='')
a = ap.parse_args()
W, H = (int(v) for v in a.size.split('x'))
views = json.loads(pathlib.Path(a.views).read_text(encoding='utf-8'))
outdir = pathlib.Path(a.out); outdir.mkdir(parents=True, exist_ok=True)
files, logs = [], []
with sync_playwright() as p:
    b = launch(p)
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1)
    if a.init:
        ctx.add_init_script(a.init)
    page = ctx.new_page()
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    t0 = time.time()
    page.goto(BASE + (views[0].get('query') or ''), wait_until='load')
    page.wait_for_function('window.__sceneReady === true', timeout=120000)
    page.wait_for_timeout(1500)
    print(f'boot {time.time() - t0:.1f}s')
    for v in views:
        if v.get('js'):
            r = page.evaluate(v['js'])
            if r is not None:
                print(f"  [{v['name']}] {json.dumps(r, ensure_ascii=False)[:300]}")
        page.wait_for_timeout(v.get('wait', 900))
        f = outdir / f"{v['name']}.jpg"
        page.screenshot(path=str(f), type='jpeg', quality=85)
        files.append(f)
    b.close()
for l in logs[:12]:
    print(l[:600])
tw = a.w
th = round(tw * H / W)
rows = (len(files) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * tw + (a.cols + 1) * 4, rows * (th + 22) + 4), (8, 8, 10))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    x, y = 4 + (i % a.cols) * (tw + 4), 4 + (i // a.cols) * (th + 22)
    sheet.paste(Image.open(f).resize((tw, th), Image.LANCZOS), (x, y + 18))
    d.text((x + 4, y + 3), f.stem, fill=(200, 220, 230))
sheet.save(outdir / '_sheet.jpg', quality=86)
print('sheet', outdir / '_sheet.jpg', sheet.size)
