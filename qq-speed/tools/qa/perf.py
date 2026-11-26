"""Performance: how long one rendered frame takes (CPU + GPU, forced to sync by reading a pixel back), at each quality level and
viewport size, both in the lobby and while racing. This machine's browser caps requestAnimationFrame at ~32 Hz over RDP, so frame
rate is meaningless here: the single-frame time is what matters.

  python tools/qa/perf.py [--sizes 1600x900,1920x1080] [--quality 0,1,2] [--hours 15.5] [--json out.json]
"""
import argparse
import json
import pathlib
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from game_check import Session, wait_state  # noqa: E402

with sync_playwright() as p:
    ap = argparse.ArgumentParser()
    ap.add_argument('--sizes', default='1600x900,1920x1080')
    ap.add_argument('--quality', default='0,1,2')
    ap.add_argument('--hours', default='15.5')
    ap.add_argument('--json', default='')
    a = ap.parse_args()
    rows = []
    for size in a.sizes.split(','):
        w, h = (int(v) for v in size.split('x'))
        for q in (int(v) for v in a.quality.split(',')):
            for hour in (float(v) for v in a.hours.split(',')):
                s = Session(p, 'shots/perf', size=(w, h), query=f'quality={q}&hour={hour}', init=f"localStorage.setItem('nova.settings', JSON.stringify({{ quality: {q} }}));")
                s.wait(2500)
                s.eval('() => window.__game.measure(150)')                          # 先连续画两三秒：显卡从最低功耗档升到工作频率要一两秒，不预热的话头几十帧都偏慢
                lobby = s.eval('() => window.__game.measure(30)')
                lobby_stats = s.eval('() => window.__game.stats()')
                s.eval('() => window.__game.start()')
                wait_state(s, lambda st: st['state'] == 'countdown', 30, 'countdown')
                s.wait(7500)                                                    # let the cars get out onto the bridge
                s.eval('() => window.__game.measure(150)')
                race = s.eval('() => window.__game.measure(30)')
                race_stats = s.eval('() => window.__game.stats()')
                boot = s.eval('() => performance.now()')
                row = {'size': size, 'quality': q, 'hour': hour, 'lobbyMs': lobby, 'raceMs': race, 'raceCalls': race_stats['calls'], 'raceTris': race_stats['tris'], 'dpr': race_stats['dpr'], 'effective': f"{w}x{h} @x{race_stats['dpr']}"}
                rows.append(row)
                print(f"{size:>11} q{q} {hour:5.2f}h  lobby {lobby:6.2f} ms  race {race:6.2f} ms  ({race_stats['calls']} calls, {race_stats['tris'] / 1e6:.2f}M tris, dpr {race_stats['dpr']})")
                if s.logs:
                    print('   logs:', s.logs[:4])
                s.browser.close()
    if a.json:
        pathlib.Path(a.json).write_text(json.dumps(rows, indent=1), encoding='utf-8')
