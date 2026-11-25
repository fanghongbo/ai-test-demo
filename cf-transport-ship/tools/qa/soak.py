"""浸泡测试：真实时间跑一局，乱按键盘鼠标，每隔几秒体检一次——有没有报错、有没有 NaN、有没有人掉出甲板、
特效池有没有被占满（粒子不消散）、内存和几何 / 贴图数量有没有一直涨；最后来回切几次暂停 / 大厅 / 开局看状态干不干净。
python tools/qa/soak.py [--seconds 45]        结果写 docs/evidence/soak.json；有问题时退出码 1"""
import argparse
import json
import pathlib
import random
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--seconds', type=int, default=45)
ap.add_argument('--seed', type=int, default=3)
a = ap.parse_args()
random.seed(a.seed)
KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ControlLeft', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'KeyR', 'KeyG', 'KeyQ', 'Tab']
HEALTH = """(() => { const g = __game.game, s = g.state, p = g.player;
  const bad = g.actors.filter((x) => ![x.body.x, x.body.y, x.body.z, x.yaw, x.pitch, x.hp].every(Number.isFinite)
    || (x.alive && (Math.abs(x.body.x) > 31.6 || Math.abs(x.body.z) > 10.7 || x.body.y < -0.5))).length;
  return { mode: __game.mode(), phase: s.phase, scores: s.scores, bad, alive: g.actors.filter((x) => x.alive).length, shots: p.w.shot, deaths: p.deaths,
    heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null, fx: g.fx.stats(),
    geometries: __game.stage.renderer.info.memory.geometries, textures: __game.stage.renderer.info.memory.textures, quality: __game.stage.quality }; })()"""
EXPECT = {'pause': ['paused', 'playing', True, True, False, True], 'resume': ['playing', 'playing', True, True, True, True], 'lobby': ['menu', 'lobby', False, False, True, True],
          'start': ['playing', 'playing', True, True, True, True], 'pause2': ['paused', 'playing', True, True, False, True], 'lobby2': ['menu', 'lobby', False, False, True, True]}
errors, health = [], []
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    page.on('pageerror', lambda e: errors.append(f'[pageerror] {e}'))
    page.on('console', lambda m: errors.append(f'[{m.type}] {m.text}') if m.type == 'error' else None)
    page.goto((ROOT / 'index.html').as_uri() + f'?auto=1&seed={a.seed}')
    page.wait_for_function('window.__sceneReady === true', timeout=60000)
    frames0 = page.evaluate('__game.frames()')
    t0 = time.time()
    held, next_health = set(), t0 + 4
    while time.time() - t0 < a.seconds:
        for _ in range(random.randint(1, 3)):
            k = random.choice(KEYS)
            if k in held:
                page.keyboard.up(k); held.discard(k)
            else:
                page.keyboard.down(k); held.add(k)
        if random.random() < 0.7:
            page.mouse.move(640 + random.randint(-160, 160), 360 + random.randint(-90, 90), steps=3)
        if random.random() < 0.35:
            btn = random.choice(['left', 'left', 'right'])
            page.mouse.down(button=btn); page.wait_for_timeout(random.randint(40, 260)); page.mouse.up(button=btn)
        page.wait_for_timeout(random.randint(90, 260))
        if time.time() >= next_health:
            next_health += 5
            health.append(dict(t=round(time.time() - t0, 1), **page.evaluate(HEALTH)))
    for k in list(held):
        page.keyboard.up(k)
    fps = page.evaluate(f'(__game.frames() - {frames0}) / {round(time.time() - t0, 2)}')
    page.evaluate('(() => { const g = __game.game; if (!g.player.alive) g.spawn(g.player); })()')     # 接下来看的是模式切换：先让玩家活着，枪模才该在画面里
    page.wait_for_timeout(300)
    switches = []
    for name, js in [('pause', '__game.pause()'), ('resume', '__game.resume()'), ('lobby', '__game.lobby()'), ('start', "__game.start({ team: 1, primary: 'awm' })"), ('pause2', '__game.pause()'), ('lobby2', '__game.lobby()')]:
        page.evaluate(js); page.wait_for_timeout(700)
        switches.append([name] + page.evaluate('[__game.mode(), __game.game.state.phase, __game.stage.vm.root.visible, document.getElementById("menu").hidden, document.getElementById("pause").hidden, document.getElementById("result").hidden]'))
    page.wait_for_timeout(800)
    health.append(dict(t=round(time.time() - t0, 1), **page.evaluate(HEALTH)))
    b.close()
ok_switch = all(EXPECT.get(s[0]) == s[1:] for s in switches)
sat = any(h['fx']['glow'] >= 1700 or h['fx']['smoke'] >= 650 for h in health)      # 池子被占满 = 粒子没有消散
grow = health[-1]['geometries'] > max(h['geometries'] for h in health[:-1]) or health[-1]['textures'] > max(h['textures'] for h in health[:-1]) + 2
out = dict(seconds=a.seconds, avgFps=round(fps, 1), errors=errors, health=health, switches=switches, saturated=sat, grewAfterRelobby=grow)
(ROOT / 'docs' / 'evidence').mkdir(parents=True, exist_ok=True)
(ROOT / 'docs' / 'evidence' / 'soak.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'{a.seconds} 秒，平均 {fps:.0f} 帧/秒（帧率的上限来自这台机器当前的显示器刷新率），报错 {len(errors)} 个')
for h in health:
    f = h['fx']
    print(f"  t={h['t']:>5} s  {h['mode']}/{h['phase']}  比分 {h['scores']}  活着 {h['alive']}  异常 {h['bad']}  堆 {h['heapMB']} MB  几何 {h['geometries']}  贴图 {h['textures']}  "
          f"粒子 发光 {f['glow']} / 烟 {f['smoke']} / 枪口 {f['vmGlow']}  弹孔 {f['decals']}")
for s in switches:
    print('  切换', s, 'OK' if EXPECT.get(s[0]) == s[1:] else '不符合预期 ' + str(EXPECT.get(s[0])))
for e in errors[:8]:
    print('  ', e[:240])
bad = bool(errors) or any(h['bad'] for h in health) or sat or grow or not ok_switch
print('结论：', '有问题' if bad else '全部正常', '（粒子池占满：%s，回大厅后资源没释放：%s，切换异常：%s）' % (sat, grow, not ok_switch))
sys.exit(1 if bad else 0)
