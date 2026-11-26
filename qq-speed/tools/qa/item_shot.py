"""道具特写：让电脑代开一局道具赛，把每件道具依次摆到镜头前，冻结画面、用自由镜头拍下来。
系统 Edge + 真实 GPU（无头）。

  python tools/qa/item_shot.py [--quality 2] [--hour 15.5] [--out shots/itemfx]
"""
import argparse
import json
import math
import pathlib
import sys
import time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from game_check import Session, wait_state  # noqa: E402

INIT = "localStorage.setItem('nova.settings', JSON.stringify({ mode: 'item', laps: 2 }));"
CAR = "() => { const S = window.__game.race.player.S; return [S.x, S.z, S.psi]; }"
ST = "() => { const g = window.__game, r = g.race, P = r.player, it = r.items; return { t: r.raceT, rank: P.rank, shield: P.S.shieldT, magnet: P.S.magnetT, spin: P.S.spinT, blocks: P.stats.blocks, spun: P.stats.spun, missiles: it.missiles.length, bombs: it.bombs.length, bananas: it.bananas.length, kmh: Math.hypot(P.S.vx, P.S.vz) * 3.6 }; }"
# 前车离得够远（30 米以上，或者前面没车）才给玩家一枚导弹
GIVE_MISSILE = """() => { const g = window.__game, r = g.race, P = r.player; const a = r.items.aheadOf(P, r);
  if (a && a.prog - P.prog < 30) return; P.items[P.slot] = 'missile'; }"""
# 名次顺序上紧跟在玩家后面的那辆车存在
FIRE_READY = "() => { const r = window.__game.race, P = r.player, o = [...r.cars].sort((a, b) => b.prog - a.prog); return o.indexOf(P) < o.length - 1; }"
# 让紧跟在玩家后面的那辆车朝玩家放一枚导弹（天上还有导弹在飞就先不给）
FIRE = """() => { const r = window.__game.race, P = r.player, o = [...r.cars].sort((a, b) => b.prog - a.prog), b = o[o.indexOf(P) + 1];
  if (b && b.prog < P.prog - 4 && r.items.missiles.length === 0) { b.items[b.slot] = 'missile'; b.itemCd = 0; b.itemWait = 0; } }"""


def freeze(s, on):
    """on=True：物理停住、镜头交给 orbit；off：恢复"""
    s.eval(f"() => window.__game.slow({0 if on else 1})")
    s.eval(f"() => window.__game.cam({'true' if on else 'false'})")


def orbit(s, x, z, d, az, el, fov=42, y=0.8):
    s.eval(f"() => window.__game.orbit([{x:.2f}, {y}, {z:.2f}], {d}, {az}, {el}, {fov})")


def orbit_car(s, sgn=1, back=0.8, side=0.6, d=10, el=20, fov=40, ahead=0.0):
    """从车的后侧方看车。back / side：镜头相对车头方向往后再往左（sgn<0 往右）多少（按镜头距离算）"""
    x, z, psi = s.eval(CAR)
    cs, sn = math.cos(psi), math.sin(psi)
    ox, oz = -back * cs - side * sgn * sn, -back * sn + side * sgn * cs
    orbit(s, x + ahead * cs, z + ahead * sn, d, math.degrees(math.atan2(ox, -oz)), el, fov)


def wait_js(s, js, limit, what):
    t = time.time()
    while time.time() - t < limit:
        if s.eval(js):
            return True
        s.wait(40)
    s.logs.append(f'[harness] 等待超时：{what}')
    return False


def run(p, a):
    s = Session(p, a.out, query='autostart=1&skipintro=1&ai=1&quality=' + str(a.quality) + (f'&hour={a.hour}' if a.hour is not None else ''), init=INIT)
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    s.wait(900)

    # 道具箱
    bx, bz = s.eval("() => { const b = window.__game.race.items.boxes[1]; return [b.x, b.z]; }")
    freeze(s, True)
    orbit(s, bx, bz, 13, 205, 16, 44)
    s.wait(350)
    s.shot('01_boxes')
    orbit(s, bx, bz, 6.5, 150, 24, 44)
    s.wait(250)
    s.shot('02_boxes_close')
    freeze(s, False)
    s.wait(1500)

    # 香蕉皮：丢在车前面一点，凑近看
    ba = s.eval("""() => { const g = window.__game, r = g.race, S = r.player.S, cs = Math.cos(S.psi), sn = Math.sin(S.psi);
      const x = S.x + cs * 9 - sn * 2.2, z = S.z + sn * 9 + cs * 2.2; r.items.bananas.push({ id: 900 + Math.random(), owner: r.player, x, z, t: 40, age: 9, ry: 0.6 }); return [x, z]; }""")
    freeze(s, True)
    orbit(s, ba[0], ba[1], 9, 235, 22, 42)
    s.wait(300)
    s.shot('03_banana')
    orbit(s, ba[0], ba[1], 3.6, 300, 38, 44, y=0.9)
    s.wait(250)
    s.shot('04_banana_close')
    freeze(s, False)

    # 导弹：前车离得够远的时候往手里塞一枚（离得太近导弹一出手就命中，镜头里看不到它飞）
    t = time.time()
    launched = False
    while time.time() - t < 45:
        s.eval(GIVE_MISSILE)
        if s.eval("() => window.__game.race.items.missiles.length > 0"):
            launched = True
            break
        s.wait(60)
    if launched:
        s.eval('() => window.__game.slow(0.08)')
        s.wait(220)
        s.shot('05_missile_chase')
        m = s.eval("() => { const m = window.__game.race.items.missiles[0]; return m ? [m.x, m.z, m.th] : null; }")
        if m:
            s.eval('() => window.__game.cam(true)')
            orbit(s, m[0], m[1], 8, -m[2] * 57.3 + 140, 14, 42, y=1.2)
            s.wait(250)
            s.shot('06_missile_close')
            s.eval('() => window.__game.cam(false)')
        s.eval('() => window.__game.slow(1)')
    else:
        print('  导弹一直没找到出手的机会')
    s.wait(600)

    # 水炸弹：扔出去、落地炸开
    s.eval("() => window.__game.item('bomb')")
    if wait_js(s, "() => window.__game.race.items.bombs.length > 0", 30, '水炸弹出手'):
        s.eval('() => window.__game.slow(0.12)')
        s.wait(200)
        s.shot('07_bomb_chase')
        b = s.eval("() => { const b = window.__game.race.items.bombs[0]; return b ? [b.x, b.z] : null; }")
        if b:
            s.eval('() => window.__game.cam(true)')
            orbit(s, b[0], b[1], 7, 120, 16, 42, y=1.5)
            s.wait(250)
            s.shot('08_bomb_close')
            s.eval('() => window.__game.cam(false)')
        s.eval('() => window.__game.slow(1)')
        if wait_js(s, "() => window.__game.race.items.bombs.length === 0", 6, '水炸弹落地'):
            s.wait(120)
            s.shot('09_splash')
            s.wait(260)
            s.shot('10_splash_late')
    s.wait(500)

    # 天使：护罩和翅膀
    s.eval("() => window.__game.item('angel')")
    if wait_js(s, "() => window.__game.race.player.S.shieldT > 0", 40, '放出天使'):
        s.wait(250)
        freeze(s, True)
        orbit_car(s, 1, 0.82, 0.6, 9.5, 18, 42)
        s.wait(300)
        s.shot('11_shield_rear')
        orbit_car(s, -1, -0.75, 0.7, 10, 20, 42)
        s.wait(250)
        s.shot('12_shield_front')
        orbit_car(s, 1, 0.15, 0.25, 7, 52, 46)
        s.wait(250)
        s.shot('13_shield_top')
        freeze(s, False)

    # 磁铁：光束吸向前车
    s.wait(1200)
    s.eval("() => window.__game.item('magnet')")
    if wait_js(s, "() => window.__game.race.player.S.magnetT > 0", 40, '放出磁铁'):
        s.wait(200)
        freeze(s, True)
        orbit_car(s, 1, 0.1, 0.95, 17, 13, 50, ahead=9)
        s.wait(300)
        s.shot('14_magnet_side')
        orbit_car(s, -1, 0.9, 0.3, 11, 16, 52)
        s.wait(250)
        s.shot('15_magnet_rear')
        freeze(s, False)

    # 天使挡下导弹：先张开护罩，再让紧跟着的那辆车朝玩家放导弹（天上一枚没打完不再给）
    s.eval("() => window.__game.item('angel')")
    if wait_js(s, "() => window.__game.race.player.S.shieldT > 1.5", 45, '放出天使'):
        was = s.eval("() => window.__game.race.player.stats.blocks")
        t = time.time()
        while time.time() - t < 25:
            s.eval(FIRE)
            if s.eval("() => window.__game.race.player.stats.blocks") > was:
                s.wait(110)
                s.shot('18_blocked')
                break
            s.wait(100)
    else:
        print('  没能张开护罩：', json.dumps(s.eval(ST)))

    # 被导弹打中：护罩没了以后，让身后的车再放一枚
    t = time.time()
    while time.time() - t < 40:
        s.eval(FIRE)
        if s.eval("() => window.__game.race.player.S.spinT > 0"):
            s.wait(80)
            s.shot('16_hit')
            s.wait(420)
            s.shot('17_hit_late')
            break
        s.wait(100)
    else:
        print('  一直没被打中：', json.dumps(s.eval(ST)))
    print('  状态:', json.dumps(s.eval(ST), ensure_ascii=False))
    s.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='shots/itemfx')
    ap.add_argument('--quality', type=int, default=2)
    ap.add_argument('--hour', type=float, default=None)
    a = ap.parse_args()
    with sync_playwright() as p:
        run(p, a)


if __name__ == '__main__':
    main()
