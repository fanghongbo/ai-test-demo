"""Gallery: the screenshots the README shows. System Edge, real GPU, headless.

  python tools/qa/gallery.py [--out docs/gallery] [--size 1600x900] [--only world,race,items,night]

World views come from the debug camera; race views from real races driven by the AI, caught at the right moment."""
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

CAR = "() => { const S = window.__game.race.player.S; return [S.x, S.z, S.psi]; }"
AHEAD_FAR = """() => { const r = window.__game.race, P = r.player, a = r.items.aheadOf(P, r); return !a || a.prog - P.prog >= 30; }"""                  # nobody close in front: a missile has room to fly


def wait_js(s, js, limit, what):
    t = time.time()
    while time.time() - t < limit:
        if s.eval(js):
            return True
        s.wait(50)
    print(f'   (gave up waiting for {what})')
    return False


def orbit_car(s, sgn=1, back=0.8, side=0.6, d=10, el=20, fov=40):
    x, z, psi = s.eval(CAR)
    cs, sn = math.cos(psi), math.sin(psi)
    ox, oz = -back * cs - side * sgn * sn, -back * sn + side * sgn * cs
    s.eval(f"() => window.__game.orbit([{x:.2f}, 0.8, {z:.2f}], {d}, {math.degrees(math.atan2(ox, -oz)):.1f}, {el}, {fov})")


def world(p, a):
    s = Session(p, a.out, size=a.size, query='quality=2')
    s.wait(3200)
    s.shot('01-lobby')
    s.eval("() => { window.__game.ui.show('menu', false); window.__game.cam(true); }")
    for name, c, d, az, el, fov in [
        ('02-city-aerial', [20, 0, -12], 760, 180, 44, 42),
        ('03-start-waterfront', [60, 8, 215], 260, 250, 12, 44),
        ('04-mall-hairpin', [39, 12, 28.5], 190, 270, 16, 46),
        ('05-canopy-plaza', [10.5, 6, 88.5], 105, 205, 30, 46),
        ('06-tower-bridge', [-34.5, 14, 159.3], 150, 0, 10, 46),
    ]:
        s.eval(f"() => window.__game.orbit({json.dumps(c)}, {d}, {az}, {el}, {fov})")
        s.wait(900)
        s.shot(name)
    s.browser.close()


def race(p, a):
    init = "localStorage.setItem('nova.settings', JSON.stringify({ laps: 1 }));"
    s = Session(p, a.out, size=a.size, query='autostart=1&ai=1&quality=2', init=init)       # with the intro
    s.wait(2100)
    s.shot('07-intro')
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    if wait_js(s, "() => { const g = window.__game, S = g.race.player.S; return S.drifting && Math.abs(S.slip) > 0.35 && S.vF > 20 && S.driftT > 0.45 && S.driftT < 1.3 && S.nitroT <= 0 && S.miniT <= 0 && g.stage.camera.position.y < 3.4; }", 90, 'a drift'):
        s.eval('() => window.__game.slow(0.25)')
        s.wait(200)
        s.shot('08-drift')
        s.eval('() => window.__game.slow(1)')
    if wait_js(s, "() => { const g = window.__game, S = g.race.player.S; return S.nitroT > 1.7 && S.vF > 40 && Math.abs(S.e) < g.track.hw[S.i] * 0.5 && Math.abs(g.RL.k[S.i]) < 0.006 && S.hit < 0.05; }", 120, 'nitro on a straight'):     # just fired, fast, mid-road, no wall nearby
        s.wait(450)
        s.shot('09-nitro')
    wait_js(s, "() => window.__game.state === 'finish'", 120, 'the finish')
    s.wait(1300)
    s.shot('14-finish')
    wait_state(s, lambda x: x['state'] == 'results', 12, 'results')
    s.wait(900)
    s.shot('15-results')
    s.browser.close()


def items(p, a):
    init = "localStorage.setItem('nova.settings', JSON.stringify({ mode: 'item', laps: 2 }));"
    s = Session(p, a.out, size=a.size, query='autostart=1&skipintro=1&ai=1&quality=2', init=init)
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    wait_js(s, """() => { const P = window.__game.race.player.S; let best = 1e9; for (const b of window.__game.race.items.boxes) best = Math.min(best, Math.hypot(b.x - P.x, b.z - P.z)); return best < 20 && best > 13; }""", 20, 'a row of item boxes')
    s.shot('10-item-boxes')
    s.eval("() => window.__game.item('angel')")
    if wait_js(s, "() => window.__game.race.player.S.shieldT > 0", 45, 'the angel'):
        s.wait(300)
        s.eval('() => { window.__game.slow(0); window.__game.cam(true); }')
        orbit_car(s, 1, 0.7, 0.5, 10.5, 40, 42)                                          # from behind and above, where the wings show
        s.wait(350)
        s.shot('11-angel-shield')
        s.eval('() => { window.__game.cam(false); window.__game.slow(1); }')
    if wait_js(s, AHEAD_FAR, 120, 'room for a missile'):
        s.eval('() => window.__game.slow(0.1)')
        s.wait(150)
        s.eval("() => window.__game.fire('missile')")
        s.wait(260)
        s.shot('12-missile')
        s.eval('() => window.__game.slow(1)')
    s.browser.close()


def night(p, a):
    init = "localStorage.setItem('nova.settings', JSON.stringify({ laps: 1 }));"
    s = Session(p, a.out, size=a.size, query='autostart=1&skipintro=1&ai=1&quality=2&hour=22', init=init)
    wait_state(s, lambda st: st['state'] == 'race', 20, 'GO')
    s.wait(7200)
    s.shot('13-night')
    if wait_js(s, "() => window.__game.race.player.S.nitroT > 1.2", 60, 'nitro at night'):
        s.wait(450)
        s.shot('13b-night-nitro')
    s.browser.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='docs/gallery')
    ap.add_argument('--size', default='1600x900')
    ap.add_argument('--only', default='world,race,items,night')
    a = ap.parse_args()
    w, h = (int(v) for v in a.size.split('x'))
    a.size = (w, h)
    pathlib.Path(a.out).mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        for name in a.only.split(','):
            print(' ', name)
            globals()[name](p, a)


if __name__ == '__main__':
    main()
