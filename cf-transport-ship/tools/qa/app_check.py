"""端到端验收：用真实的按键、鼠标事件驱动页面，逐项断言并留截图。
仿真在 ?freeze=1 下由 window.__game.step 推进（确定、可重复）；指针锁定 / 暂停 / 大厅另开不冻结的页面，走真实时间。
python tools/qa/app_check.py        退出码：0 全部通过；1 有失败。结果写在 shots/game/check.json"""
import json
import pathlib
import re
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = ROOT / 'shots' / 'game'
OUT.mkdir(parents=True, exist_ok=True)
results = []
URL = (ROOT / 'index.html').as_uri()


def check(name, ok, detail=''):
    results.append({'name': name, 'ok': bool(ok), 'detail': str(detail)[:300]})
    print(('PASS ' if ok else 'FAIL ') + name + (f'  — {detail}' if detail else ''))


HELPERS = r"""(() => {
  const g = __game.game;
  const T = window.__T = { events: [] };
  // 事件里只留摘要：人物对象挂着整套模型，整份传回 Python 要好几秒
  const who = (a) => (a ? { id: a.id, name: a.name, team: a.team, isBot: !!a.isBot } : a);
  if (!g.onEvent._wrapped) { const prev = g.onEvent; const w = (ev) => { T.events.push(ev.killer || ev.victim || ev.actor || ev.attacker ? Object.assign({}, ev, { killer: who(ev.killer), victim: who(ev.victim), actor: who(ev.actor), attacker: who(ev.attacker) }) : ev); prev(ev); }; w._wrapped = true; g.onEvent = w; }
  T.freeze = () => g.actors.forEach((a) => { if (a.isBot) a.frozen = true; });
  T.place = (x, z, yawDeg = 0, pitchDeg = 0) => { const p = g.player; Object.assign(p.body, { x, y: 0, z, vx: 0, vy: 0, vz: 0 }); p.yaw = yawDeg * Math.PI / 180; p.pitch = pitchDeg * Math.PI / 180; p.crouch = false; p.body.h = 1.78; p.w.reload = 0; p.w.draw = 0; };
  // 木桩：把一个敌人摆到玩家前方 dx、右方 dz 处，面朝玩家，不会还手也不会走开
  T.dummy = (dx, dz = 0, o = {}) => {
    const p = g.player, c = Math.cos(p.yaw), s = Math.sin(p.yaw), ok = (a) => a.team !== p.team && (!o.kind || a.w.def.kind === o.kind);
    const b = o.bot || g.actors.find((a) => ok(a) && !a._used) || g.actors.find(ok);
    if (!b.alive) g.spawn(b);
    b._used = true; b.frozen = true;
    Object.assign(b.body, { x: p.body.x + c * dx - s * dz, y: p.body.y, z: p.body.z + s * dx + c * dz, vx: 0, vy: 0, vz: 0 });
    b.yaw = p.yaw + Math.PI; b.pitch = 0; b.protect = 0; b.hp = o.hp ?? 100; b.armor = o.armor ?? 0; b.crouch = false; b.body.h = 1.78;
    return b.id;
  };
  T.aim = (id, part = 'chest') => {
    const p = g.player, b = g.actors.find((a) => a.id === id), dx = b.body.x - p.body.x, dz = b.body.z - p.body.z, d = Math.hypot(dx, dz);
    p.yaw = Math.atan2(dz, dx); p.pitch = Math.atan2(b.body.y + (part === 'head' ? b.body.h - 0.12 : 1.2) - (p.body.y + p.eyeH), d);
  };
  T.reset = () => { T.freeze(); T.events.length = 0; const p = g.player; p.protect = 1e9; p.hp = 100; p.armor = 100; if (p.slot !== 1) g.switchTo(p, 1); };
  T.reset();
})()"""
STEP = '__game.step(1/60, %d)'

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    ctx = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    t_start = time.time()

    def step(n=1):
        page.evaluate(STEP % n)

    def st():
        return page.evaluate('__game.state()')

    def ev(js):
        return page.evaluate(js)

    def shot(name):
        page.screenshot(path=str(OUT / f'{name}.png'))

    def mouse(btn, down):
        page.mouse.move(640, 360)
        (page.mouse.down if down else page.mouse.up)(button=btn)

    def tap_key(code, frames=1):
        page.keyboard.down(code)
        step(frames)
        page.keyboard.up(code)

    # ══════════════ 一、开局 ══════════════
    page.goto(URL + '?auto=1&freeze=1&nolock=1&seed=7')                  # 种子固定：机器人的决定和弹道都能复现
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.wait_for_timeout(400)
    bad = [l for l in logs if l.startswith(('[pageerror]', '[error]'))]
    check('开局：启动无错误', not bad, bad[:2])
    page.evaluate(HELPERS)
    s = st()
    check('开局：直接进入对局', s['mode'] == 'playing' and s['phase'] == 'playing', s['mode'])
    check('开局：出生在保卫者舱里', s['x'] < -25.5 and s['alive'] and s['y'] == 0, f"x={s['x']}")
    check('开局：满血满甲、主武器在手', s['hp'] == 100 and s['armor'] == 100 and s['slot'] == 1 and s['weapon'] == 'ak47' and s['ammo'] == 30, s['weapon'])
    acts = ev('__game.game.actors.map((a) => ({ bot: a.isBot, team: a.team, model: !!a.model, alive: a.alive, x: a.body.x, skinned: a.model ? a.model.mesh.isSkinnedMesh : false, name: a.name }))')
    check('开局：4 v 4，除玩家外 7 个机器人', len(acts) == 8 and sum(a['bot'] for a in acts) == 7, len(acts))
    check('开局：每个机器人都有蒙皮士兵模型', all(a['model'] and a['skinned'] for a in acts if a['bot']))
    check('开局：两队各 4 人，都活着、各在各家舱里', [sum(a['team'] == t for a in acts) for t in (0, 1)] == [4, 4] and all(a['alive'] and abs(a['x']) > 25.5 for a in acts))
    check('开局：机器人名字不重复', len({a['name'] for a in acts}) == len(acts))
    ui = ev("""(() => { const q = (s) => document.querySelector(s), vis = (s) => { const e = q(s); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      return { hud: vis('#hud'), radar: vis('#radar'), gr: q('#scoreGR').textContent, bl: q('#scoreBL').textContent, clock: q('#clock').textContent, ammo: q('#ammo').textContent, hp: q('#hpNum').textContent,
        slots: document.querySelectorAll('#slots li').length, cross: !q('#cross').hidden, dead: vis('#dead'), scope: vis('#scope'), board: vis('#board'), menu: vis('#menu'), wname: q('#wname').textContent, on: document.querySelector('#slots li.is-on i').textContent }; })()""")
    check('界面：战斗界面齐全（雷达、比分、计时、弹药、血量）', ui['hud'] and ui['radar'] and ui['gr'] == '0' and ui['bl'] == '0' and ui['clock'] == '10:00' and ui['ammo'] == '30' and ui['hp'] == '100' and ui['wname'] == 'AK-47', ui)
    check('界面：四个武器槽，当前是 1', ui['slots'] == 4 and ui['on'] == '1')
    check('界面：准星显示，阵亡 / 开镜 / 战绩板 / 大厅都收着', ui['cross'] and not (ui['dead'] or ui['scope'] or ui['board'] or ui['menu']))
    check('界面：页面没有横向溢出', ev('document.scrollingElement.scrollWidth <= innerWidth + 1'))
    perf0 = ev('__game.stats()')
    check('规模：绘制调用不超过 260 次（含阴影、倒影两遍）', perf0['calls'] <= 260, perf0)
    shot('t01_spawn')

    # ══════════════ 二、移动与视角 ══════════════
    ev('__T.place(-29.5, 0, 0); __game.step(1/60, 2)')
    page.keyboard.down('KeyW'); step(30)
    s1 = st(); page.keyboard.up('KeyW'); step(30); s2 = st()
    check('移动：W 朝前走（朝 +X 时 x 增大）', 1.0 < s1['x'] - (-29.5) < 2.4, f"Δx={s1['x'] + 29.5:.2f} m")
    check('移动：松开后停下', abs(s2['vx']) < 0.05 and abs(s2['vz']) < 0.05, f"vx={s2['vx']}")
    page.keyboard.down('KeyS'); step(30); sx = st()['x']; page.keyboard.up('KeyW'); page.keyboard.up('KeyS'); step(20)
    check('移动：S 后退', sx < s2['x'] - 0.8, f"Δx={sx - s2['x']:.2f}")
    page.keyboard.down('KeyD'); step(30); sz = st()['z']; page.keyboard.up('KeyD'); step(20)
    check('移动：D 朝右（朝 +X 时 z 增大）', sz > 0.8, f"z={sz:.2f}")
    ev('__T.place(-29.5, 0, 0); __game.step(1/60, 2)')
    page.keyboard.down('ShiftLeft'); page.keyboard.down('KeyW'); step(30); sw = st(); page.keyboard.up('KeyW'); page.keyboard.up('ShiftLeft'); step(20)
    check('移动：Shift 静步明显更慢', 0.3 < sw['x'] + 29.5 < s1['x'] + 29.5 - 0.9, f"静步 Δx={sw['x'] + 29.5:.2f}，正常 {s1['x'] + 29.5:.2f}")
    page.keyboard.down('ControlLeft'); step(20); sc = st()
    check('下蹲：按住 Ctrl 身高变矮、视点下降', sc['crouch'] and sc['fov'] == 75 and ev('__game.game.player.body.h') < 1.3 and ev('__game.game.player.eyeH') < 1.3, f"h={ev('__game.game.player.body.h')}")
    shot('t02_crouch')
    page.keyboard.up('ControlLeft'); step(20)
    check('下蹲：松开后站起来', not st()['crouch'] and ev('__game.game.player.body.h') > 1.7)
    tap_key('Space', 1)
    top = 0
    for _ in range(45):
        step(1)
        top = max(top, st()['y'])
    check('跳跃：起跳后离地再落回甲板', top > 0.6 and st()['y'] == 0 and st()['onGround'], f"最高 {top:.2f} m")
    ev('__T.place(-30.2, 0, 180); __game.step(1/60, 2)')
    page.keyboard.down('KeyW'); step(90); wall = st(); page.keyboard.up('KeyW'); step(10)
    check('碰撞：朝端墙走不会穿过去', wall['x'] > -31.5 + 0.3 and wall['x'] < -30.6, f"x={wall['x']:.2f}（墙在 -31.5）")
    ev('__T.place(-29.5, 0, 0); __game.step(1/60, 2)')
    page.keyboard.down('KeyW'); step(150); door = st(); page.keyboard.up('KeyW')
    check('通路：从出生舱穿过大门洞走上主甲板', door['x'] > -25.5, f"x={door['x']:.2f}")
    y0 = st()['yaw']
    page.mouse.move(600, 360); page.mouse.down(); page.mouse.move(700, 360, steps=4); page.mouse.up(); step(1)
    y1 = st()['yaw']
    check('视角：鼠标向右转，视角跟着向右', abs((y1 - y0) - 100 * 0.00192) < 0.012, f"Δyaw={y1 - y0:.4f}（应为 0.192）")
    page.mouse.move(600, 360); page.mouse.down(); page.mouse.move(600, 660, steps=4); page.mouse.up(); step(1)
    p1 = st()['pitch']
    check('视角：鼠标向下转，镜头向下', abs(p1 - (0 - 300 * 0.00192)) < 0.012 and p1 < 0, f"pitch={p1:.3f}")
    ev('__game.look(0, -100000)'); step(1)
    check('视角：抬头角度有上限', st()['pitch'] == 1.55)
    ev('__T.place(-24.3, 0, 0, 0); __T.reset(); __game.step(1/60, 2)')
    shot('t03_deck')

    # ══════════════ 三、开枪 ══════════════
    f0 = ev('__game.game.fx.stats()')
    mouse('left', True); step(1); s = st(); f1 = ev('__game.game.fx.stats()'); mouse('left', False); step(1)     # 曳光 20 毫秒就飞过去了，开枪那一帧就得读
    check('开枪：一发子弹少一颗', s['ammo'] == 29, s['ammo'])
    check('开枪：枪口亮起、灯闪', f1['glow'] > 0 and f1['lights'] >= 1, f1)
    check('开枪：留下曳光', f1['tracers'] >= 1, f1['tracers'])
    step(3)
    check('开枪：抛壳', ev('__game.game.fx.stats().cases') >= 1)
    step(40)
    check('开枪：子弹在集装箱上留下弹孔', ev('__game.game.fx.stats().decals') >= 1, ev('__game.game.fx.stats().decals'))
    step(150)
    fxq = ev('(() => { const s = __game.game.fx.stats(); return s.glow + s.smoke + s.vmGlow + s.tracers; })()')
    check('特效：枪口焰、火花、硝烟、曳光两秒内全部散尽（不会留在画面里）', fxq == 0, fxq)
    ev('__T.place(-24.3, 0, 0, 0); __T.reset(); __game.step(1/60, 2)')
    s0 = st()
    mouse('left', True); step(60); sb = st(); mouse('left', False)
    check('射速：按住 1 秒，AK-47 打出 10 发', 19 <= sb['ammo'] <= 21, f"剩 {sb['ammo']}（30 发起）")
    check('后坐：连发时准星被抬高', sb['pitch'] > s0['pitch'] + 0.02, f"pitch {s0['pitch']:.3f} → {sb['pitch']:.3f}")
    check('散布：连发后散布变大', sb['spread'] > s0['spread'] + 0.2, f"{s0['spread']} → {sb['spread']}")
    step(60)
    tap_key('KeyR', 1); step(2); sr = st()
    check('换弹：按 R 进入换弹', sr['reload'] > 2.0, sr['reload'])
    mouse('left', True); step(10); mouse('left', False)
    check('换弹：换弹过程中打不出子弹', st()['ammo'] == sr['ammo'])
    step(150); sr2 = st()
    check('换弹：2.45 秒后弹匣回满、备弹减少', sr2['ammo'] == 30 and sr2['reserve'] == 90 - (30 - sr['ammo']), f"{sr2['ammo']} / {sr2['reserve']}")
    check('换弹：弹药数字跟着界面走', ev("document.getElementById('ammo').textContent") == '30' and ev("document.getElementById('reserve').textContent") == '/ 80')
    mouse('right', True); step(40); sa = st()
    check('瞄准：按住右键进入瞄准，视野推近、散布收紧', sa['ads'] > 0.97 and abs(sa['fov'] - 58) < 1.5 and sa['spread'] < s0['spread'], f"ads={sa['ads']} fov={sa['fov']} spread={sa['spread']}")
    check('瞄准：瞄准时准星隐去', not ev("(function(){ const e = document.getElementById('cross'); return !e.hidden; })()"))
    shot('t04_ads')
    mouse('right', False); step(60)
    check('瞄准：松开右键回到腰射', st()['ads'] < 0.02 and abs(st()['fov'] - 75) < 0.6)
    for code, name, slot in [('Digit2', 'usp', 2), ('Digit3', 'knife', 3), ('Digit4', 'he', 4), ('Digit1', 'ak47', 1)]:
        tap_key(code, 30)
        check(f'切枪：{code[5]} 号键切到 {name}', st()['slot'] == slot and st()['weapon'] == name, st()['weapon'])
    tap_key('KeyQ', 30)
    check('切枪：Q 回到上一件武器', st()['slot'] == 4 and st()['weapon'] == 'he', st()['weapon'])
    tap_key('KeyQ', 30)
    check('切枪：再按 Q 切回来', st()['slot'] == 1 and st()['weapon'] == 'ak47')
    tap_key('Digit1', 40)
    # 命中
    ev('__T.place(-23.2, -5.5, 90); __T.reset(); const id = __T.dummy(6); __T.aim(id, "chest"); __T.events.length = 0; window.__id = id; __game.step(1/60, 2)')
    mouse('right', True); step(25)
    mouse('left', True); step(1); mouse('left', False); step(2)
    b = ev('__game.game.actors.find((a) => a.id === window.__id).hp')
    hits = [e for e in page.evaluate('__T.events') if e['type'] == 'hit']
    check('命中：瞄准射击打中前方 6 米的敌人', b < 100 and hits and hits[0]['part'] == 'chest' and not hits[0]['killed'], f"hp={b} {hits[:1]}")
    check('命中：有血雾', ev('__game.game.fx.stats().smoke') > 0)
    check('命中：出现命中标记', ev("document.getElementById('hitmark').className.includes('is-on')"))
    step(20)
    ev('__T.aim(window.__id, "head"); __T.events.length = 0; __game.step(1/60, 2)')
    mouse('left', True); step(1); mouse('left', False); step(3)
    k = [e for e in page.evaluate('__T.events') if e['type'] == 'kill']
    s = st()
    check('爆头：抬高到头部，一枪击倒', bool(k) and k[0]['head'] and ev('__game.game.actors.find((a) => a.id === window.__id).deaths') >= 1, [e['head'] for e in k])
    check('计分：击杀 +1、队伍得分 +1', s['kills'] == 1 and s['scores'][0] == 1, f"kills={s['kills']} scores={s['scores']}")
    check('播报：击杀播报里出现这一条（带枪的图标和爆头标记）', ev("document.querySelectorAll('#feed li').length") >= 1 and ev("[...document.querySelectorAll('#feed li')].some((li) => li.textContent.includes('我') && li.querySelectorAll('svg').length >= 2)"), ev("[...document.querySelectorAll('#feed li')].map((li) => li.textContent).slice(0, 2)"))
    mouse('right', False); step(30)
    d0 = ev('__game.game.actors.find((a) => a.id === window.__id).deaths')
    step(200)
    b2 = ev('__game.game.actors.find((a) => a.id === window.__id)')
    check('重生：被击倒的机器人 3 秒后在自己舱里重生', b2['alive'] and b2['deaths'] == 1 and b2['hp'] == 100 and b2['body']['x'] > 25.5, f"deaths={b2['deaths']} x={b2['body']['x']:.1f}")
    # 连杀：一条命里不死就接着数（上面那一枪是第 1 个）
    ev('__T.events.length = 0; const id2 = __T.dummy(6, 0, { bot: __game.game.actors.filter((a) => a.team === 1)[1] }); __T.aim(id2, "head"); window.__id2 = id2; __game.step(1/60, 2)')
    mouse('right', True); step(25); mouse('left', True); step(1); mouse('left', False); step(3); mouse('right', False)
    ban2 = ev("document.getElementById('banners').textContent")
    ev('window.__id = __T.dummy(6, 0); __T.aim(window.__id, "head"); __game.step(1/60, 2)')
    mouse('right', True); step(25); mouse('left', True); step(1); mouse('left', False); step(3); mouse('right', False); step(2)
    k2 = [e for e in page.evaluate('__T.events') if e['type'] == 'kill' and e['killer'] and not e['killer']['isBot']]
    ban = ev("document.getElementById('banners').textContent")
    check('连杀：不死就接着数，第二个报“双杀”、第三个报“三杀”', len(k2) == 2 and [e['multi'] for e in k2] == [2, 3] and '双杀' in ban2 and '三杀' in ban, [e['multi'] for e in k2] + [ban2, ban])
    shot('t04b_multikill')
    step(120)
    # 军刀
    ev('__T.reset(); __game.step(1/60, 2); const id = __T.dummy(1.2); window.__id = id; __T.aim(id, "chest"); __game.step(1/60, 2)')
    tap_key('Digit3', 25)
    mouse('left', True); step(1); mouse('left', False); step(8)
    hb = ev('__game.game.actors.find((a) => a.id === window.__id).hp')
    check('军刀：轻划一下掉 68 点血', abs(hb - 32) < 0.01, hb)
    step(30); mouse('right', True); step(1); mouse('right', False); step(20)
    check('军刀：右键重击直接放倒', not ev('__game.game.actors.find((a) => a.id === window.__id).alive'))
    step(200)
    # 手雷
    ev('__T.reset(); __game.step(1/60, 2); const id = __T.dummy(3); window.__id = id; __T.aim(id, "chest"); __game.game.player.pitch = -1.35; __game.step(1/60, 2)')   # 往脚下扔
    tap_key('Digit4', 30)
    check('手雷：掏出手雷，剩 1 颗', ev('__game.game.player.slots[4].count') == 1 and ev("document.getElementById('ammo').textContent") == '1')
    shot('t05_grenade')
    mouse('left', True); step(2); mouse('left', False)
    check('手雷：左键扔出去，手雷在飞', ev('__game.game.nades.length') == 1 and ev('__game.game.player.slots[4].count') == 0)
    shot('t06_grenade_air')
    step(200)
    fx = ev('__game.game.fx.stats()')
    check('手雷：约 3 秒后爆炸，留下焦痕', ev('__game.game.nades.length') == 0 and fx['scorch'] >= 1, fx)
    check('手雷：炸伤附近的敌人', ev('__game.game.actors.find((a) => a.id === window.__id).hp') < 100)
    step(50)
    check('手雷：扔完后自动换回枪', st()['slot'] == 1, st()['weapon'])

    # ══════════════ 四、被打 ══════════════
    # 站进南通道再让木桩还手：通道是直的，木桩边打边退也不会退到看不见的地方
    ev('__T.place(-23, 9, 0); const p = __game.game.player; p.protect = 0; p.hp = 100; p.armor = 100; p.pitch = 0; __T.events.length = 0; const id = __T.dummy(5, 0, { kind: "rifle" }); __T.aim(id, "chest"); window.__id = id; __game.step(1/60, 2)')
    ev('const b = __game.game.actors.find((a) => a.id === window.__id); b.frozen = false; b.hp = 100; b.brain.mode = "engage"; b.brain.target = __game.game.player; b.brain.diff = Object.assign({}, b.brain.diff, { react: 0.1, err: 0.2 }); __T.aim(window.__id, "chest"); __game.step(1/60, 2)')
    hurt = None
    for _ in range(40):
        step(3)
        hurt = [e for e in page.evaluate('__T.events') if e['type'] == 'damage']
        if hurt or not st()['alive']:
            break
    s = st()
    check('受击：被击中后掉血，护甲替你分担一部分', bool(hurt) and s['hp'] < 100 and 0 < s['armor'] < 100 and s['hp'] + s['armor'] < 195, f"hp={s['hp']} armor={s['armor']}")
    check('受击：界面指出受击方向', ev("document.querySelectorAll('#dmgdir i').length") >= 1)
    for _ in range(80):
        if not st()['alive']:
            break
        step(5)
    s = st()
    check('阵亡：血打光后倒下', not s['alive'] and s['deaths'] == 1, s['deaths'])
    check('阵亡：显示阵亡提示和重生倒计时', not ev("document.getElementById('dead').hidden") and 1 <= int(ev("document.getElementById('deadCount').textContent")) <= 3, ev("document.getElementById('deadText').textContent"))
    shot('t07_dead')
    step(220)
    s = st()
    check('重生：3 秒后在己方舱里满血复活', s['alive'] and s['hp'] == 100 and s['armor'] == 100 and s['x'] < -25.5, f"x={s['x']:.1f} hp={s['hp']}")
    ev('__T.events.length = 0; const id = __T.dummy(6); __game.game.hurt(__game.game.actors.find((a) => a.id === id), 999, __game.game.player); __game.step(1/60, 2)')
    k3 = [e['multi'] for e in page.evaluate('__T.events') if e['type'] == 'kill']
    check('连杀：阵亡一次以后从头数', k3 == [1], k3)

    # ══════════════ 五、机器人 ══════════════
    ev('__T.reset(); __game.game.actors.forEach((a) => { a.frozen = false; }); window.__p0 = __game.game.actors.filter((a) => a.isBot).map((a) => [a.body.x, a.body.z]); __game.game.actors.forEach((a) => { if (a.isBot) a.brain.diff = Object.assign({}, a.brain.diff, { err: 6 }); }); window.__ammo0 = __game.game.actors.filter((a) => a.isBot).map((a) => a.w.ammo + a.w.reserve)')
    step(600)
    mv = ev('__game.game.actors.filter((a) => a.isBot).map((a, i) => Math.hypot(a.body.x - window.__p0[i][0], a.body.z - window.__p0[i][1]))')
    am = ev('__game.game.actors.filter((a) => a.isBot).map((a, i) => a.w.ammo + a.w.reserve + a.w.shot * 0 - window.__ammo0[i])')
    fired = ev('__game.game.actors.filter((a) => a.isBot).some((a) => a.w.shot > 0)')
    check('机器人：会走动（十秒内有人挪了 5 米以上）', max(mv) > 5, f"最远 {max(mv):.1f} m")
    check('机器人：会开枪', fired)
    # 换弹：单独看一个机器人。只给他 3 发子弹，正前方 6 米站一个不会动的敌人
    ev('''(() => { const g = __game.game, p = g.player; g.actors.forEach((a) => { if (a.isBot) a.frozen = true; });
      __T.place(-20.5, -6.3, 90);
      const s = g.actors.find((a) => a.isBot && a.team === p.team && a.w.def.kind === 'rifle'), e = g.actors.find((a) => a.team !== p.team);
      if (!e.alive) g.spawn(e);
      Object.assign(e.body, { x: -23.2, y: 0, z: 0.5, vx: 0, vy: 0, vz: 0 }); e.yaw = -Math.PI / 2; e.hp = 100; e.armor = 0; e.protect = 0; e.frozen = true;
      if (!s.alive) g.spawn(s);
      g.switchTo(s, 1);
      Object.assign(s.body, { x: -23.2, y: 0, z: -5.5, vx: 0, vy: 0, vz: 0 }); s.yaw = Math.PI / 2; s.pitch = 0;
      s.w.ammo = 3; s.w.reserve = 90; s.w.reload = 0; s.w.draw = 0; s.frozen = false; s.brain.diff = Object.assign({}, s.brain.diff, { react: 0.1 });
      window.__sid = s.id; window.__shot0 = s.w.shot; return 1; })()''')
    ws = None
    for _ in range(80):
        step(5)
        ws = ev('(() => { const s = __game.game.actors.find((a) => a.id === window.__sid); return [s.w.ammo, s.w.reserve, +s.w.reload.toFixed(2), s.w.shot - window.__shot0]; })()')
        if ws[1] < 90:                                           # 备弹少了 = 换过弹
            break
    check('机器人：打空弹匣后会换弹（弹匣补满 30 发，备弹拿走 30 发）', bool(ws) and ws[0] in (29, 30) and ws[1] == 60 and ws[3] >= 3, ws)   # 换完可能紧接着又打了一发
    check('机器人：没有掉进箱子里或掉出甲板', ev('__game.game.actors.filter((a) => a.isBot).every((a) => !a.alive || (!__game.W.world.overlap(a.body.x, 0.3, a.body.z, 0.2, 1.2) && a.body.y > -0.5 && Math.abs(a.body.x) < 31.6 && Math.abs(a.body.z) < 10.7))'))
    check('机器人：状态里没有出现 NaN', ev('__game.game.actors.every((a) => [a.body.x, a.body.y, a.body.z, a.yaw, a.pitch, a.hp].every(Number.isFinite))'))
    # 雷达
    ev('''__T.freeze(); __T.place(-23.2, -5.5, 90); __game.game.actors.forEach((a) => { a.spotted = 0; }); const id = __T.dummy(5); window.__id = id;
      __game.game.actors.filter((a) => a.team !== __game.game.player.team && a.id !== id).forEach((a, i) => { Object.assign(a.body, { x: 29, y: 0, z: (i - 1) * 5, vx: 0, vy: 0, vz: 0 }); });   // 其余敌人挪到对面舱里，隔着整条船
      __game.step(1/60, 20)''')
    sp = ev('__game.game.actors.filter((a) => a.team !== __game.game.player.team).map((a) => a.spotted)')
    check('雷达：看见的敌人会被标出来，没看见的不标', sp[0] >= st()['now'] and all(v == 0 for v in sp[1:]), sp)
    px = ev("""(() => { const c = document.getElementById('radar'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; })()""")
    check('雷达：画了地图（不是空的）', px > 4000, f"{px} 个像素")
    shot('t08_radar')
    page.keyboard.down('Tab'); step(2)
    check('战绩板：按住 Tab 弹出，列出场上所有人', not ev("document.getElementById('board').hidden") and ev("document.querySelectorAll('#boardBody tr td:first-child').length") == 8, ev("document.querySelectorAll('#boardBody td').length"))
    shot('t09_board')
    page.keyboard.up('Tab'); step(2)
    check('战绩板：松开 Tab 收起', ev("document.getElementById('board').hidden"))
    clk = ev("document.getElementById('clock').textContent")
    check('计时：比分牌的倒计时在走', clk != '10:00' and bool(re.match(r'^\d\d:\d\d$', clk)), clk)

    # ══════════════ 六、AWM ══════════════
    ev('__game.start({ primary: "awm", team: 0 }); ' + HELPERS)
    step(5)
    check('AWM：10 发弹匣、备弹 30', st()['weapon'] == 'awm' and st()['ammo'] == 10 and st()['reserve'] == 30, st())
    ev('__T.place(-24.3, 0, 0, 0); __T.reset(); __game.step(1/60, 2)')
    mouse('left', True); step(1); mouse('left', False); s = st()
    mouse('left', True); step(4); mouse('left', False)
    check('AWM：开一枪后要拉栓，拉栓期间打不出第二发', s['ammo'] == 9 and st()['ammo'] == 9, f"{s['ammo']} → {st()['ammo']}")
    shot('t10_awm_bolt')
    step(80); mouse('left', True); step(1); mouse('left', False)
    check('AWM：拉栓完成后可以再打', st()['ammo'] == 8)
    step(80)
    tap_key('KeyR', 1); step(200)
    check('AWM：换弹 3.1 秒', st()['ammo'] == 10 and st()['reserve'] == 28, f"{st()['ammo']} / {st()['reserve']}")
    mouse('right', True); step(1); mouse('right', False); step(70); s = st()
    check('开镜：右键第一下开到 4 倍', s['ads'] > 0.97 and abs(s['fov'] - 17) < 1.2 and not ev("document.getElementById('scope').hidden"), f"fov={s['fov']}")
    shot('t11_scope1')
    mouse('right', True); step(1); mouse('right', False); step(70)
    check('开镜：第二下开到 8 倍', abs(st()['fov'] - 7.5) < 0.8 and ev("document.getElementById('scope').dataset.zoom") == '2', f"fov={st()['fov']}")
    shot('t12_scope2')
    mouse('right', True); step(1); mouse('right', False); step(70)
    check('开镜：第三下收镜', st()['ads'] < 0.03 and abs(st()['fov'] - 75) < 0.6 and ev("document.getElementById('scope').hidden"))

    # ══════════════ 七、潜伏者、时刻、画质、结算 ══════════════
    ev('__game.start({ team: 1, primary: "m4a1" }); ' + HELPERS)
    step(5); s = st()
    check('潜伏者：出生在船头舱，配 M4A1 和沙鹰', s['x'] > 25.5 and s['weapon'] == 'm4a1' and ev('__game.game.player.slots[2].id') == 'deagle' and ev('__game.game.player.slots[1].def.name') == 'M4A1', s['weapon'])
    ev('__T.place(24.3, 0, 180, 0); __T.reset(); __game.step(1/60, 3)')
    shot('t13_bl')
    ev('__game.hour(22); __game.step(1/60, 40)')
    night = ev('({ night: __game.stage.night, lamp: __game.stage.lampLevel, lights: __game.W.deck.lamps.night.filter((l) => l.visible).length, exp: __game.stage.renderer.toneMappingExposure, moon: __game.stage.look.isMoon })')
    check('夜晚：天黑了，舱灯和甲板灯亮起，曝光抬高', night['night'] > 0.9 and night['lamp'] > 0.95 and night['lights'] >= 10 and night['exp'] > 3, night)
    shot('t14_night')
    ev('__game.hour(6.9); __game.step(1/60, 3)'); shot('t15_dawn')
    ev('__game.hour(18.25); __game.step(1/60, 3)'); shot('t16_dusk')
    ev('__game.hour(15.5); __game.stage.setQuality(0); __game.step(1/60, 3)')
    q0 = ev('({ gtao: __game.stage.postfx.gtao.enabled, refl: __game.stage.sea.uniforms.uHasRefl.value, map: __game.stage.key.shadow.mapSize.x })')
    check('画质：低档关掉环境光遮蔽和海水倒影，阴影贴图变小', not q0['gtao'] and q0['refl'] == 0 and q0['map'] == 1024, q0)
    ev('__game.stage.setQuality(2); __game.step(1/60, 3)')
    check('画质：回到高档', ev('__game.stage.postfx.gtao.enabled && __game.stage.sea.uniforms.uHasRefl.value === 1 && __game.stage.key.shadow.mapSize.x === 4096'))
    ev('__T.place(-23.2, -5.5, 90); __T.reset(); __game.game.state.target = __game.game.state.scores[1] + 1; const id = __T.dummy(5); __T.aim(id, "head"); window.__id = id; __game.step(1/60, 2)')
    mouse('right', True); step(25); mouse('left', True); step(1); mouse('left', False); step(4); mouse('right', False); step(2)
    check('结算：先到目标击杀数的一方获胜，对局结束', st()['phase'] == 'ended' and not ev("document.getElementById('result').hidden"), st()['phase'])
    check('结算：写着“胜利”和比分', ev("document.getElementById('resultTitle').textContent") == '胜利' and ev("document.querySelectorAll('#resultTable td').length") >= 32, ev("document.getElementById('resultScore').textContent"))
    shot('t17_result')
    # 帧耗时
    cost = ev('__game.measure(24)')
    check('性能：1280×720 高档，单帧不超过 25 ms（本机 RTX 3080）', cost < 25, f"{cost} ms")
    results.append({'name': '性能读数', 'ok': True, 'detail': f'{cost} ms / 帧，{perf0["calls"]} 次绘制，{perf0["tris"]} 个三角形'})

    # ══════════════ 八、不同窗口下的界面 ══════════════
    page.evaluate("__game.start({ team: 0, primary: 'ak47' })")
    page.wait_for_timeout(300)
    for w, h, label in [(1280, 720, '桌面'), (900, 600, '小窗口'), (390, 844, '手机竖屏')]:
        page.set_viewport_size({'width': w, 'height': h}); page.wait_for_timeout(250)
        inside = ev("""(() => { const ok = (s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.width > 0 && r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; };
          return { radar: ok('#radar'), score: ok('.hud__score'), status: ok('.hud__status'), ammo: ok('.hud__ammo'), overflow: document.scrollingElement.scrollWidth > innerWidth + 1 }; })()""")
        check(f'界面：{label}（{w}×{h}）下雷达、比分、血量、弹药都在画面里', all(inside[k] for k in ('radar', 'score', 'status', 'ammo')) and not inside['overflow'], inside)
        shot(f't18_layout_{w}')
    page.set_viewport_size({'width': 1280, 'height': 720})
    ctx.close()

    # ══════════════ 九、真实时间：指针锁定、暂停 ══════════════
    page = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    logs2 = []
    page.on('pageerror', lambda e: logs2.append(f'[pageerror] {e}'))
    page.goto(URL + '?auto=1')
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.wait_for_timeout(1500)
    t1 = st()['now']; page.wait_for_timeout(700); t2 = st()['now']
    check('实时：不开冻结时对局按真实时间推进', t2 > t1 + 0.3, f"{t1:.2f} → {t2:.2f}")
    page.mouse.move(640, 420); page.mouse.down(); page.mouse.up()
    page.wait_for_timeout(500)
    lock = ev('({ locked: __game.input.locked, fallback: __game.input.fallback, el: document.pointerLockElement === document.getElementById("view") })')
    check('鼠标：点击画面后锁定鼠标，或者进入拖动视角的退路', lock['locked'] or lock['fallback'], lock)
    if lock['locked']:
        page.evaluate('document.exitPointerLock()')
        page.wait_for_timeout(500)
    else:
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
    check('暂停：Esc 释放鼠标后暂停，弹出暂停菜单', not ev("document.getElementById('pause').hidden"), ev("__game.mode()"))
    t3 = st()['now']; page.wait_for_timeout(600); t4 = st()['now']
    check('暂停：暂停期间对局时间不走', abs(t4 - t3) < 0.05, f"{t3:.2f} → {t4:.2f}")
    shot('t19_pause')
    page.click('#btnResume'); page.wait_for_timeout(500)
    check('继续：点“继续战斗”回到对局', ev("document.getElementById('pause').hidden") and ev("__game.mode()") == 'playing')
    check('实时：全程没有页面错误', not logs2, logs2[:2])
    ctx.close()

    # ══════════════ 十、大厅 ══════════════
    page = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    logs3 = []
    page.on('pageerror', lambda e: logs3.append(f'[pageerror] {e}'))
    page.goto(URL)
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.wait_for_timeout(1200)
    check('大厅：打开页面先到大厅，战斗界面藏起来', not ev("document.getElementById('menu').hidden") and ev("document.getElementById('hud').hidden") and ev("__game.mode()") == 'menu')
    shot('t20_lobby')
    page.click('.seg[data-key="team"] button[data-v="1"]'); page.click('.seg[data-key="primary"] button[data-v="m4a1"]'); page.click('.seg[data-key="size"] button[data-v="3"]')
    sset = ev('__game.settings')
    check('大厅：点选阵营、主武器、人数', sset['team'] == 1 and sset['primary'] == 'm4a1' and sset['size'] == 3, sset)
    page.click('.seg[data-key="hour"] button[data-v="22"]'); page.wait_for_timeout(600)
    check('大厅：切到夜晚，背景跟着变暗', ev('__game.stage.night') > 0.9)
    shot('t21_lobby_night')
    page.click('#btnStart'); page.wait_for_timeout(2500)
    s = st()
    check('大厅：开始游戏后按所选设置开局', s['mode'] == 'playing' and s['weapon'] == 'm4a1' and s['x'] > 25.5 and ev('__game.game.actors.length') == 6, s)
    check('大厅：全程没有页面错误', not logs3, logs3[:2])
    browser.close()

bad = [r for r in results if not r['ok']]
(OUT / 'check.json').write_text(json.dumps({'results': results, 'failed': len(bad), 'seconds': round(time.time() - t_start, 1)}, ensure_ascii=False, indent=1), encoding='utf-8')
print(f'\n{len(results) - len(bad)}/{len(results)} 通过，用时 {time.time() - t_start:.0f}s')
sys.exit(1 if bad else 0)
