"""README 用的运行截图：1600×900、最高画质，存进 docs/gallery/。风景照不带界面，另留一张标题画面和一张界面总图。

  python tools/qa/gallery.py [--out docs/gallery] [--only name,name]
"""
import argparse
import json
import pathlib
import shutil
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--out', default='docs/gallery')
ap.add_argument('--only', default='')
ap.add_argument('--w', type=int, default=1600)
a = ap.parse_args()
OUT = pathlib.Path(a.out)
OUT.mkdir(parents=True, exist_ok=True)
ONLY = {s.strip() for s in a.only.split(',') if s.strip()}
Q = '?q=2&nolock'

# 巡游镜头：('tour', 第几个, 走到几分的时候, 时刻, 水质)；自由机位：('pose', 镜头位置, 注视点, 视场, 时刻, 水质)
SHOTS = [
    ('title', ('title', 'afternoon', 'clear')),
    ('gate', ('tour', 1, 0.42, 'afternoon', 'clear')),
    ('guardian', ('tour', 2, 0.5, 'afternoon', 'clear')),
    ('passage', ('tour', 3, 0.55, 'afternoon', 'clear')),
    ('hall', ('tour', 5, 0.45, 'afternoon', 'clear')),
    ('throne', ('tour', 6, 0.5, 'afternoon', 'clear')),
    ('court', ('tour', 4, 0.5, 'dusk', 'clear')),
    ('garden', ('tour', 9, 0.5, 'afternoon', 'clear')),
    ('kelp', ('tour', 10, 0.5, 'afternoon', 'clear')),
    ('wreck', ('tour', 11, 0.5, 'afternoon', 'clear')),
    ('village', ('tour', 12, 0.5, 'dusk', 'clear')),
    ('temple', ('tour', 13, 0.5, 'afternoon', 'clear')),
    ('dome', ('pose', (26, -14, -122), (0, -22, -97), 50, 'afternoon', 'clear')),
    ('arch', ('pose', (24, -41, 51), (0, -41, 45), 55, 'afternoon', 'clear')),
    ('night', ('tour', 3, 0.55, 'night', 'clear')),
    ('hall-night', ('tour', 6, 0.5, 'night', 'clear')),
    ('colossus', ('pose', (112, -60, -262), (66, -34, -214), 50, 'afternoon', 'crystal')),
]
POSE = """async ([eye, target, fov]) => { const g = window.__game, T = g.THREE; g.setMode('free'); g.pause(false); const e = new T.Vector3(...eye), t = new T.Vector3(...target);
  const q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().lookAt(e, t, new T.Vector3(0, 1, 0)));
  g.swim.enter({ pos: e, quat: q, fov }); await new Promise((r) => setTimeout(r, 500)); g.swim.enter({ pos: e, quat: q, fov });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); g.pause(true); }"""

with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    for name, spec in SHOTS:
        if ONLY and name not in ONLY:
            continue
        ui = spec[0] == 'title'
        hour, clarity = (spec[1], spec[2]) if ui else (spec[4], spec[5]) if spec[0] == 'pose' else (spec[3], spec[4])
        query = Q + f'&hour={hour}&clarity={clarity}' + ('' if ui else '&ui=0')
        ctx, page, logs = open_page(browser, query=query, size=(a.w, 900), init="localStorage.setItem('sunken-castle.settings.v1', JSON.stringify({ quality: '2', sway: false, captions: false }))")
        if spec[0] == 'tour':
            page.evaluate("(i) => window.__game.jumpShot(i)", spec[1])
            page.wait_for_function("(k) => window.__game.state().shotT >= k", arg=spec[2], timeout=60000)
            page.evaluate('() => window.__game.pause(true)')
            page.evaluate('() => window.__game.measure(3)')
        elif spec[0] == 'pose':
            page.evaluate(POSE, [list(spec[1]), list(spec[2]), spec[3]])
            page.wait_for_timeout(2600)
        else:
            page.wait_for_timeout(1500)
            page.evaluate('() => window.__game.setFreeze(true)')
        f = OUT / f'{name}.jpg'
        page.screenshot(path=str(f), type='jpeg', quality=88)
        st = page.evaluate('() => window.__game.state()')
        print(f'  {name:11s} {f.stat().st_size // 1024:4d} KB  {st["hour"]:9s} {st["clarity"]:8s} level {st["level"]}  {"" if not logs else logs[:2]}')
        ctx.close()
    browser.close()
sheet = pathlib.Path('shots/app/_sheet.jpg')
if sheet.exists():
    shutil.copy(sheet, OUT / 'ui.jpg')
    print('  ui.jpg （交互检查顺手截的界面总图）')
print('gallery ->', OUT)
