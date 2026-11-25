"""README 的运行截图：用 URL 参数和调试接口把页面定位到各个状态后截图，压成 JPG 放进 docs/gallery/。
python tools/qa/gallery.py        （需要 Playwright + 系统 Edge；截图是真实渲染出来的画面，没有后期修图）"""
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TMP = ROOT / 'shots' / 'gallery'
OUT = ROOT / 'docs' / 'gallery'
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402
from PIL import Image  # noqa: E402

TMP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1600, 900
FREEZE = 'const g = __game.game; g.actors.forEach((a) => { if (a.isBot) a.frozen = true; });'
PLACE = "Object.assign(p.body, { x: %s, y: 0, z: %s, vx: 0, vy: 0, vz: 0 }); p.yaw = %s; p.pitch = %s; p.protect = 1e9; p.w.draw = 0;"
shots = []


def save(page, name, note):
    f = TMP / f'{name}.png'
    page.screenshot(path=str(f))
    shots.append((name, note))
    print('shot', name)


with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1).new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.goto((ROOT / 'index.html').as_uri() + '?seed=7')
    page.wait_for_function('window.__sceneReady === true', timeout=60000)
    page.wait_for_timeout(2600)
    save(page, '01-lobby', '大厅')

    def start(primary='ak47', team=0, roam=330):
        page.evaluate(f"__game.start({{ primary: '{primary}', team: {team} }})")
        page.evaluate('__game.step(1/60, %d)' % roam)
        page.evaluate(FREEZE)

    # 白天的主甲板： AK-47 腰射、连发、瞄准。对面 10 米站一个敌人当靶子
    TARGET = "(() => { const g = __game.game, p = g.player, e = g.actors.find((a) => a.team !== p.team); if (!e.alive) g.spawn(e); Object.assign(e.body, { x: -5.5, y: 0, z: -3.0, vx: 0, vy: 0, vz: 0 }); e.yaw = 2.85; e.pitch = 0; e.hp = 100; e.armor = 100; e.protect = 1e9; e.frozen = true; })()"
    start()
    page.evaluate("(() => { const p = __game.game.player; " + PLACE % (-16.2, -5.4, 0.3, 0.0) + " __game.step(1/60, 50); })()")
    page.evaluate(TARGET + '; __game.step(1/60, 3)')
    save(page, '02-deck-hip', '主甲板 · AK-47')
    page.evaluate('__game.mouse(2, true); __game.step(1/60, 70); __game.mouse(0, true); __game.step(1/60, 13)')
    save(page, '03-fire', '瞄准连发')
    page.evaluate('__game.mouse(0, false); __game.step(1/60, 3)')
    save(page, '04-ads', '瞄准')
    page.evaluate('__game.mouse(2, false); __game.step(1/60, 60); __game.key("Tab"); __game.step(1/60, 3)')
    save(page, '05-scoreboard', '战绩板')
    page.evaluate('__game.key("Tab", false); __game.step(1/60, 2)')

    # 时刻：从船尾舱门口顺着货舱看过去
    page.evaluate("(() => { const p = __game.game.player; " + PLACE % (24.2, 6.2, 3.24, 0.02) + " __game.step(1/60, 40); })()")
    for name, hour, note in [('06-dusk', 18.25, '黄昏'), ('07-night', 22, '夜晚'), ('08-dawn', 6.9, '清晨')]:
        page.evaluate(f'__game.hour({hour}); __game.step(1/60, 25)')
        save(page, name, note)
    page.evaluate('__game.hour(15.5); __game.step(1/60, 5)')

    # AWM 开镜：对着站在场地中间的敌人
    start('awm')
    page.evaluate("(() => { const p = __game.game.player; " + PLACE % (-21.0, -5.8, 0.17, 0.0) + " __game.step(1/60, 50); })()")
    page.evaluate("(() => { const g = __game.game, p = g.player, e = g.actors.find((a) => a.team !== p.team); if (!e.alive) g.spawn(e); Object.assign(e.body, { x: -5.5, y: 0, z: -3.0, vx: 0, vy: 0, vz: 0 }); e.yaw = 2.9; e.frozen = true; __game.step(1/60, 3); const dx = e.body.x - p.body.x, dz = e.body.z - p.body.z, d = Math.hypot(dx, dz); p.yaw = Math.atan2(dz, dx); p.pitch = Math.atan2(1.3 - 1.64, d); __game.mouse(2, true); __game.step(1/60, 1); __game.mouse(2, false); __game.step(1/60, 100); })()")
    save(page, '09-scope', 'AWM 开镜')

    # 阵亡与结算
    start('m4a1', 1)
    page.evaluate("(() => { const g = __game.game, p = g.player; " + PLACE % (16.5, 6.0, 3.3, 0.0) + " __game.step(1/60, 50); })()")
    save(page, '10-bl-deck', '潜伏者 · M4A1')
    page.evaluate("(() => { const g = __game.game, p = g.player, e = g.actors.find((a) => a.team !== p.team); p.protect = 0; g.hurt(p, 400, e); __game.step(1/60, 24); })()")
    save(page, '11-dead', '阵亡')
    page.evaluate('__game.step(1/60, 200)')
    page.evaluate("(() => { const g = __game.game, p = g.player, e = g.actors.find((a) => a.team !== p.team); g.state.scores[0] = 38; g.state.scores[1] = g.state.target - 1; g.hurt(e, 900, p); __game.step(1/60, 6); })()")
    save(page, '12-result', '结算')

    # 整条船、货舱俯瞰
    page.evaluate('__game.free(-30, 16, 10, -8, -25, 58); __game.render()')
    save(page, '13-overview', '货舱俯瞰')
    page.evaluate('__game.free(97, 11, -60, 147, -3.5, 36); __game.render()')
    save(page, '14-ship', '整条船')
    b.close()

# 枪模图鉴：每件武器腰射、瞄准、侧后方各一张
subprocess.run([sys.executable, str(HERE / 'vm_shots.py'), '--out', 'shots/gallery/vm', '--guns', 'ak47,m4a1,awm,deagle,usp,knife,he'], check=True)
for name, files in [('15-weapons-rifles', ['ak47', 'm4a1', 'awm']), ('16-weapons-sidearms', ['deagle', 'usp', 'knife'])]:
    tiles = [Image.open(TMP / 'vm' / f'vm_{g}_{v}.png').convert('RGB') for g in files for v in ('hip', 'ads', 'side')]
    tw, th = 520, 293
    sheet = Image.new('RGB', (tw * 3 + 8, th * 3 + 8), (16, 18, 22))
    for i, t in enumerate(tiles):
        sheet.paste(t.resize((tw, th), Image.LANCZOS), ((i % 3) * (tw + 4), (i // 3) * (th + 4)))
    sheet.save(OUT / f'{name}.jpg', quality=80, optimize=True)
    print('shot', name)

for name, note in shots:
    im = Image.open(TMP / f'{name}.png').convert('RGB')
    im.save(OUT / f'{name}.jpg', quality=80, optimize=True)
total = sum(f.stat().st_size for f in OUT.glob('*.jpg'))
print(f'{len(shots) + 2} 张，共 {total / 1024:.0f} KB；页面错误 {len(errors)} 个')
for e in errors[:5]:
    print('  ', e[:200])
sys.exit(1 if errors else 0)
