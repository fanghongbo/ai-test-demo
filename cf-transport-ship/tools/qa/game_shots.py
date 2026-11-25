"""按脚本摆好姿势、推进几帧、截图：看第一人称枪模、开火、瞄准、换弹、各个武器和士兵的样子。
python tools/qa/game_shots.py [--only 名字,名字] [--query "auto=1&freeze=1"]     图写在 shots/game/"""
import argparse
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'shots' / 'game'
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

STEP = 'const S = (n) => __game.step(1 / 60, n);'
# (名字, 准备动作（开一局之后的 JS，S(n) = 推进 n 帧）)
SHOTS = [
    ('spawn', 'S(40)'),
    ('deck', "__game.playCam(-24, 0); S(2)"),
    ('fire', "__game.mouse(0, true); S(3)"),
    ('fire_burst', "S(14)"),
    ('fire_off', "__game.mouse(0, false); S(30)"),
    ('ads', "__game.mouse(2, true); S(24)"),
    ('ads_fire', "__game.mouse(0, true); S(2); __game.mouse(0, false); S(12)"),
    ('reload_1', "__game.mouse(2, false); __game.key('KeyR'); S(1); __game.key('KeyR', false); S(18)"),
    ('reload_2', "S(26)"),
    ('reload_3', "S(22)"),
    ('pistol', "S(40); __game.key('Digit2'); S(1); __game.key('Digit2', false); S(30)"),
    ('pistol_ads', "__game.mouse(2, true); S(20)"),
    ('knife', "__game.mouse(2, false); __game.key('Digit3'); S(1); __game.key('Digit3', false); S(30)"),
    ('knife_swing', "__game.mouse(0, true); S(9)"),
    ('grenade', "__game.mouse(0, false); __game.key('Digit4'); S(1); __game.key('Digit4', false); S(30)"),
    ('grenade_throw', "__game.mouse(0, true); S(12)"),
    ('throw_boom', "__game.mouse(0, false); S(150)"),
    ('soldier', "S(60); const g = __game.game, p = g.player, b = g.actors.find(a => a.team !== p.team); Object.assign(p.body, { x: -26, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }); p.yaw = 0; p.pitch = 0; p.protect = 1e9; Object.assign(b.body, { x: -20.5, y: 0, z: 0.4, vx: 0, vy: 0, vz: 0 }); b.yaw = Math.PI; b.brain.diff = Object.assign({}, b.brain.diff, { react: 99 }); S(6)"),
    ('soldier_side', "const g = __game.game, p = g.player; Object.assign(p.body, { x: -20.5, y: 0, z: -5 }); p.yaw = 1.5708; S(3)"),
    ('soldier_walk', "const g = __game.game, p = g.player, b = g.actors.find(a => a.team !== p.team); Object.assign(p.body, { x: -10, y: 0, z: -6.6 }); p.yaw = 0.9; S(50)"),
    ('teammate', "const g = __game.game, p = g.player, m = g.actors.find(a => a.team === p.team && a !== p); Object.assign(p.body, { x: -26, y: 0, z: -3 }); p.yaw = 0; Object.assign(m.body, { x: -21, y: 0, z: -3.4, vx: 0, vy: 0, vz: 0 }); m.yaw = Math.PI; S(4)"),
    ('board', "__game.key('Tab'); S(2)"),
]
ap = argparse.ArgumentParser()
ap.add_argument('--query', default='auto=1&freeze=1')
ap.add_argument('--only', default='')
a = ap.parse_args()
only = set(a.only.split(',')) if a.only else None
url = (ROOT / 'index.html').as_uri() + '?' + a.query
OUT.mkdir(parents=True, exist_ok=True)
logs = []
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.goto(url)
    try:
        page.wait_for_function('window.__sceneReady === true', timeout=30_000)
    except Exception as e:  # noqa: BLE001
        print('scene not ready:', str(e)[:120])
        for line in logs[:12]:
            print(line[:900])
        try:
            b.close()
        except Exception:
            pass
        sys.exit(2)
    page.wait_for_timeout(300)
    for name, js in SHOTS:
        if only and name not in only:
            continue
        page.evaluate('(() => { ' + STEP + js + ' })()')
        page.screenshot(path=str(OUT / f'{name}.png'))
        print('shot', name, page.evaluate('JSON.stringify(__game.state())')[:260])
    b.close()
for line in logs[:20]:
    print(line[:600])
sys.exit(1 if any(l.startswith(('[pageerror]', '[error]')) for l in logs) else 0)
