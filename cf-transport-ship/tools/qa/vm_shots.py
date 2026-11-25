"""枪模图鉴：每件武器的腰射、瞄准、侧后方特写各一张，拼成一张大图。
python tools/qa/vm_shots.py [--hour 15.5] [--team 0]      输出 shots/game/vm_<武器>_<角度>.png 和 shots/game/vm_sheet.png"""
import argparse
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--hour', type=float, default=15.5)
ap.add_argument('--team', type=int, default=0)
ap.add_argument('--guns', default='ak47,m4a1,awm,deagle,usp,knife,he')
ap.add_argument('--tag', default='')
ap.add_argument('--out', default='shots/game')
a = ap.parse_args()
OUT = ROOT / a.out
OUT.mkdir(parents=True, exist_ok=True)
SLOT = dict(ak47=1, m4a1=1, awm=1, deagle=2, usp=2, knife=3, he=4)

SIDE = "__game.vmSide(0.5, 0.14, 0.36); __game.render()"
BACK = "__game.vmBack(); __game.step(1/60, 2)"
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': 960, 'height': 540}, device_scale_factor=1).new_page()
    page.goto((ROOT / 'index.html').as_uri() + f'?auto=1&freeze=1&nolock=1&hud=0&seed=7&hour={a.hour}&team={a.team}')
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.wait_for_timeout(300)
    names = []
    for gid in a.guns.split(','):
        page.evaluate(f"__game.start({{ primary: '{gid if SLOT[gid] == 1 else 'ak47'}', team: {a.team} }})")
        page.evaluate("""(() => { const g = __game.game, p = g.player; g.actors.forEach((x) => { if (x.isBot) x.frozen = true; if (x.model) x.model.group.visible = false; }); p.protect = 1e9;
          Object.assign(p.body, { x: -22.5, y: 0, z: 2.5, vx: 0, vy: 0, vz: 0 }); p.yaw = 0.9; p.pitch = 0.0; __game.step(1/60, 2); })()""")
        page.evaluate(f"(() => {{ const g = __game.game, p = g.player; g.switchTo(p, {SLOT[gid]}); p.w.draw = 0; __game.step(1/60, 120); }})()")
        page.screenshot(path=str(OUT / f'vm_{gid}_hip.png'))
        page.evaluate('__game.mouse(2, true); __game.step(1/60, 110); __game.mouse(2, false); __game.step(1/60, 1)')
        page.screenshot(path=str(OUT / f'vm_{gid}_ads.png'))
        page.evaluate('__game.step(1/60, 100)')
        page.evaluate(SIDE)
        page.screenshot(path=str(OUT / f'vm_{gid}_side.png'))
        page.evaluate(BACK)
        names += [f'vm_{gid}_hip.png', f'vm_{gid}_ads.png', f'vm_{gid}_side.png']
    b.close()
subprocess.run([sys.executable, str(HERE / 'montage.py'), *[str(OUT / n) for n in names], '--out', str(OUT / f'vm_sheet{a.tag}.png'), '--cols', '3', '--w', '640'], check=True)
