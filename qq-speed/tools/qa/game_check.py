"""玩法自检：真开一局。用 Playwright 按真实键位开车，在关键节点截图，并把车的状态读回来。
系统 Edge + 真实 GPU（无头）。

  python tools/qa/game_check.py drive            # 按脚本开：倒计时、油门、漂移、小喷、氮气、暂停、名次表
  python tools/qa/game_check.py ai [--sec 90]    # 让电脑代开，沿途隔几秒截一张，最后进结算
  python tools/qa/game_check.py menu             # 大厅、车库翻页、操作说明
  python tools/qa/game_check.py item [--sec 120]  # 道具赛：电脑代开，见到导弹、水炸弹、护罩、磁铁就慢放截图
"""
import argparse
import io
import json
import pathlib
import sys
import time
from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()
FLAGS = UA_FLAGS
STATE = """() => { const g = window.__game, r = g.race, P = r.player, S = P.S;
  return { state: g.state, rs: r.state, paused: g.paused, kmh: Math.hypot(S.vx, S.vz) * 3.6, rank: P.rank, lap: P.lap, e: S.e, s: S.s,
    drifting: S.drifting, nitro: S.nitro, gas: S.gas, nitroT: S.nitroT, miniT: S.miniT, raceT: r.raceT, stats: P.stats }; }"""


class Session:
    def __init__(self, p, out, size=(1600, 900), query='', init=None):
        self.out = pathlib.Path(out)
        self.out.mkdir(parents=True, exist_ok=True)
        self.logs = []
        self.browser = launch(p)                                                        # 系统的 Edge，进程钉在性能核上（见 harness.pin_browser）
        self.ctx = self.browser.new_context(viewport={'width': size[0], 'height': size[1]}, device_scale_factor=1)
        if init:
            self.ctx.add_init_script(init)                                              # 页面脚本之前先跑：改 localStorage 里的设置
        self.page = self.ctx.new_page()
        self.page.on('console', lambda m: self.logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        self.page.on('pageerror', lambda e: (self.logs.append(f'[pageerror] {e}'), self.logs.append('[stack] ' + ' | '.join(str(getattr(e, 'stack', '')).splitlines()[1:6]))))
        self.t0 = time.time()
        self.dark_ok = False                                                           # set True for a shot that is meant to be dark
        self.page.goto(BASE + ('?' + query if query else ''), wait_until='load')
        try:
            self.page.wait_for_function('window.__sceneReady === true', timeout=90000)
        except Exception:
            self.report()
            raise

    def wait(self, ms):
        self.page.wait_for_timeout(ms)

    def state(self):
        return self.page.evaluate(STATE)

    def shot(self, name):
        path = self.out / f'{name}.jpg'
        for attempt in range(4):                                                      # headless Edge sometimes hands back a page shot with a blank canvas: retake it
            data = self.page.screenshot(type='jpeg', quality=80)
            dark = ImageStat.Stat(Image.open(io.BytesIO(data)).convert('L').crop((300, 280, 1300, 620))).mean[0] < 5
            if not dark or self.dark_ok:
                break
            self.logs.append(f'[harness] blank capture, retaking {name}')
            self.wait(120)
        path.write_bytes(data)
        st = self.state()
        print(f"  [{name}] t={st['raceT']:.1f}s state={st['state']} v={st['kmh']:.0f}km/h rank={st['rank']} lap={st['lap']} e={st['e']:.1f} drift={st['drifting']} N2O={st['nitro']} gas={st['gas']:.2f}")

    def down(self, *keys):
        for k in keys:
            self.page.keyboard.down(k)

    def up(self, *keys):
        for k in keys:
            self.page.keyboard.up(k)

    def eval(self, js):
        try:
            return self.page.evaluate(js)
        except Exception as e:  # noqa: BLE001
            self.logs.append(f'[eval-error] {e}')

    def report(self):
        for line in self.logs[:40]:
            print('  ' + line[:700])

    def close(self):
        self.report()
        self.browser.close()


def wait_state(s, pred, limit, what):
    t = time.time()
    while time.time() - t < limit:
        st = s.state()
        if pred(st):
            return st
        s.wait(100)
    s.logs.append(f'[harness] 等待超时：{what}')
    return s.state()


def mode_drive(p, a):
    s = Session(p, a.out, query='autostart=1&skipintro=1&quality=' + str(a.quality))
    wait_state(s, lambda st: st['state'] == 'countdown', 20, '进入倒计时')
    s.wait(700)
    s.shot('01_countdown')
    s.page.wait_for_function('window.__game.race.goT < 0.33', timeout=8000)
    s.down('ArrowUp')                                       # GO 之前 0.33 秒踩下油门：完美起步
    st = wait_state(s, lambda st: st['state'] == 'race', 8, 'GO')
    print('  完美起步', st['stats'].get('perfect'))
    s.wait(450)
    s.shot('02_go')
    s.wait(2600)
    s.shot('03_accel')                                      # 直线加速
    s.down('ArrowRight', 'Shift')                           # 右漂移
    s.wait(330)
    s.shot('04_drift')
    s.wait(260)
    s.up('Shift', 'ArrowRight', 'ArrowUp')                  # 收漂移：松 Shift、松油门
    s.wait(110)
    s.down('ArrowUp')                                       # 再按一次油门 = 小喷
    s.wait(180)
    s.shot('05_mini')
    s.wait(500)
    st = s.state()
    print('  小喷次数', st['stats'].get('mini'), '集气', round(st['gas'], 2))
    if st['nitro'] > 0:
        s.page.keyboard.press('Control')
        s.wait(260)
        s.shot('06_nitro')
    s.wait(2500)
    s.shot('07_racing')
    s.page.keyboard.press('Escape')
    s.wait(500)
    s.shot('08_pause')
    s.page.keyboard.press('Escape')
    s.wait(300)
    s.down('Tab')
    s.wait(400)
    s.shot('09_standings')
    s.up('Tab')
    s.up('ArrowUp')
    print('  最终', json.dumps(s.state(), ensure_ascii=False))
    s.close()


def mode_ai(p, a):
    init = f"localStorage.setItem('nova.settings', JSON.stringify({{ laps: {a.laps} }}));" if a.laps else None
    s = Session(p, a.out, query='autostart=1&skipintro=1&ai=' + a.pilot + '&quality=' + str(a.quality) + (f'&hour={a.hour}' if a.hour is not None else ''), init=init)
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    n = 0
    t = time.time()
    while time.time() - t < a.sec:
        s.wait(3300)
        st = s.state()
        if st['state'] == 'finish':
            s.wait(900)
            s.shot('80_finish_slowmo')
            wait_state(s, lambda x: x['state'] == 'results', 12, '结算')
            s.wait(1200)
            s.shot('81_results')
            break
        if st['state'] == 'results':
            s.shot('81_results')
            break
        n += 1
        s.shot(f'ai_{n:02d}')
    print('  结算:', json.dumps(s.eval("() => window.__game.race.cars.map((c) => [c.rank, c.name, c.def.name, c.finished ? c.finishT.toFixed(1) : '-', c.laps.map((x) => x.toFixed(1)), c.stats.hits, c.stats.mini, c.stats.dbl, c.stats.nitro])"), ensure_ascii=False))
    s.close()


ITEM_STATE = """() => { const g = window.__game, r = g.race, it = r.items, P = r.player;
  return { state: g.state, raceT: r.raceT, mine: P.items.slice(), slot: P.slot, missiles: it.missiles.length, bombs: it.bombs.length, bananas: it.bananas.length,
    shield: P.S.shieldT, magnet: P.S.magnetT, spinT: P.S.spinT, anyShield: r.cars.some((c) => c.S.shieldT > 0), anyMagnet: r.cars.some((c) => c.S.magnetT > 0), stats: P.stats }; }"""
GIVE = """(keys) => { const cs = window.__game.race.cars; keys.forEach((k, i) => { const c = cs[i % cs.length]; if (!c.items[0] && !c.items[1]) c.items[c.slot] = k; }); }"""
# 每个材质的数值都得是有限数：透明度一旦是 NaN（曾经有个参数名把外层对象遮蔽了），加色混合会写出 NaN 像素，泛光再把它抹成整屏黑
FINITE = """() => { const seen = new Set(), bad = []; const chk = (m, o) => { if (!m || seen.has(m)) return; seen.add(m);
  let name = ''; for (let p = o; p && !name; p = p.parent) name = p.name;                      // 自己没有名字就往上找第一个有名字的祖先
  if (!Number.isFinite(m.opacity)) bad.push(name + ' opacity'); if (m.emissiveIntensity !== undefined && !Number.isFinite(m.emissiveIntensity)) bad.push(name + ' emissive');
  for (const c of ['color', 'emissive']) if (m[c] && ![m[c].r, m[c].g, m[c].b].every(Number.isFinite)) bad.push(name + ' ' + c);
  if (m.uniforms) for (const [k, u] of Object.entries(m.uniforms)) if (typeof u.value === 'number' && !Number.isFinite(u.value)) bad.push(name + ' ' + k); };
  window.__game.stage.scene.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => chk(m, o)); });
  return bad.slice(0, 8); }"""
# 看到什么就截一张：{ 条件: (文件名, 慢放倍率, 最多几张) }
CATCH = [
    ('missiles', ('it_missile', 0.2, 3)), ('bombs', ('it_bomb', 0.2, 2)), ('bananas', ('it_banana', 0.35, 2)),
    ('anyShield', ('it_shield', 0.5, 2)), ('anyMagnet', ('it_magnet', 0.5, 2)), ('spinT', ('it_spun', 0.5, 2)),
]


def mode_item(p, a):
    init = f"localStorage.setItem('nova.settings', JSON.stringify({{ mode: 'item', laps: {a.laps or 2} }}));"
    s = Session(p, a.out, query='autostart=1&skipintro=1&ai=' + a.pilot + '&quality=' + str(a.quality), init=init)
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    print('  道具赛：', s.eval("() => { const r = window.__game.race; return [r.mode, r.items.on, r.items.boxes.length]; }"))
    s.wait(1500)
    s.shot('it_00_boxes')
    keys = ['missile', 'bomb', 'banana', 'magnet', 'angel', 'nitro']
    got, n, t0, lastGive, lastLoop, lastFinite, badMats = {}, 0, time.time(), 0, time.time(), 0, set()
    while time.time() - t0 < a.sec:
        st = s.eval(ITEM_STATE)
        if st['state'] == 'results':
            s.wait(1000)
            s.shot('it_results')
            break
        if st['state'] not in ('race', 'countdown', 'finish'):
            s.wait(200)
            continue
        now = time.time()
        if now - lastFinite > 1:
            lastFinite = now
            badMats.update(s.eval(FINITE) or [])
        if now - lastGive > 2.5:                                                        # 不停往各辆车手里塞道具，让场面热闹起来
            lastGive = now
            s.eval(f'({GIVE})({json.dumps(keys)})')
        for cond, (name, slow, cap) in CATCH:
            if st[cond] > 0 and got.get(name, 0) < cap:
                got[name] = got.get(name, 0) + 1
                s.eval(f'() => window.__game.slow({slow})')
                s.wait(160)
                s.shot(f'{name}_{got[name]}')
                s.eval('() => window.__game.slow(1)')
        if now - lastLoop > 4:
            lastLoop = now
            n += 1
            s.shot(f'it_{n:02d}')
        s.wait(110)
    print('  道具统计:', json.dumps(s.eval("() => window.__game.race.cars.map((c) => [c.rank, c.name, c.stats.items, c.stats.itemHits, c.stats.spun, c.stats.blocks])")))
    print('  玩家:', json.dumps(s.eval(ITEM_STATE), ensure_ascii=False))
    retakes = sum(1 for line in s.logs if 'blank capture' in line)
    problem = badMats or retakes or any(line.startswith('[pageerror]') or '[error]' in line for line in s.logs)
    print('  ITEM PROBLEM: 非有限的材质数值 ' + json.dumps(sorted(badMats)) + f'，黑屏重拍 {retakes} 次' if problem else f'  ITEM OK（材质数值都是有限数，没有黑屏重拍；道具用出 {sum(c[2] for c in s.eval("() => window.__game.race.cars.map((c) => [0, 0, c.stats.items])"))} 次）')
    s.close()


def mode_menu(p, a):
    s = Session(p, a.out, query='quality=' + str(a.quality))
    s.wait(1200)
    s.shot('10_menu')
    s.page.keyboard.press('ArrowRight')
    s.wait(700)
    s.shot('11_menu_car2')
    s.page.keyboard.press('ArrowLeft')
    s.page.keyboard.press('ArrowLeft')
    s.wait(700)
    s.shot('12_menu_car0')
    s.page.click('#helpBtn')
    s.wait(500)
    s.shot('13_help')
    s.page.keyboard.press('Escape')
    s.wait(300)
    s.shot('14_intro_0') if False else None
    s.page.click('#startBtn')
    s.wait(900)
    s.shot('14_intro_a')
    s.wait(1500)
    s.shot('15_intro_b')
    st = wait_state(s, lambda st: st['state'] == 'countdown', 8, '倒计时')
    s.wait(600)
    s.shot('16_countdown')
    s.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['drive', 'ai', 'menu', 'item'])
    ap.add_argument('--out', default='shots/game')
    ap.add_argument('--sec', type=int, default=90)
    ap.add_argument('--quality', type=int, default=2)
    ap.add_argument('--laps', type=int, default=0)
    ap.add_argument('--hour', type=float, default=None)
    ap.add_argument('--pilot', default='1', help='1 = 转向量直通；keys = 用方向键代开')
    ap.add_argument('--size', default='1600x900')
    a = ap.parse_args()
    with sync_playwright() as p:
        if a.mode == 'drive':
            mode_drive(p, a)
        elif a.mode == 'ai':
            mode_ai(p, a)
        elif a.mode == 'item':
            mode_item(p, a)
        else:
            mode_menu(p, a)


if __name__ == '__main__':
    main()
