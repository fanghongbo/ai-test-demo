"""README 用的运行截图：1600×900、最高画质，存进 docs/gallery/。每个画面都是真的玩到那一步、在最合适的一瞬把规则停住截下来的
（界面照常显示，所以蓄力条、加分、提示都在）。另有一张不带界面的 1280×720 封面，给仓库首页的表格用；界面总图来自交互检查。

  python tools/qa/gallery.py [--out docs/gallery] [--only name,name]
"""
import argparse
import pathlib
import shutil
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--out', default='docs/gallery')
ap.add_argument('--only', default='')
a = ap.parse_args()
OUT = pathlib.Path(a.out)
OUT.mkdir(parents=True, exist_ok=True)
ONLY = {s.strip() for s in a.only.split(',') if s.strip()}
Q = '?seed=5&q=2'
STATE = '() => window.__game.state()'
logs_all = []


def want(name):
    return not ONLY or name in ONLY


def snap(page, name, settle=350, size=None, noui=False):
    """规则停住 → 等镜头的弹簧缓过来（规则停了镜头还在跟）→ 同步画三帧（阴影、后期都做完）→ 截图。
    飘字、提示是按真实时间走的，规则停住它们照常会淡掉，所以带飘字的画面 settle 要短。size / noui：封面用的尺寸和不带界面"""
    page.evaluate('() => window.__game.freeze(true)')
    if size:
        page.set_viewport_size({'width': size[0], 'height': size[1]})
    if noui:
        page.evaluate("() => document.body.classList.add('no-ui')")
    page.wait_for_timeout(settle)
    page.evaluate('() => window.__game.measure(3)')
    f = OUT / f'{name}.jpg'
    page.screenshot(path=str(f), type='jpeg', quality=90)
    page.evaluate('() => window.__game.freeze(false)')
    if noui:
        page.evaluate("() => document.body.classList.remove('no-ui')")
    if size:
        page.set_viewport_size({'width': 1600, 'height': 900})
        page.wait_for_timeout(250)
    st = page.evaluate(STATE)
    print(f'  {name:14s} {Image.open(f).size[0]}x{Image.open(f).size[1]}  {f.stat().st_size // 1024:5d} KB  第 {st["node"]} 个秋千  {st["score"]} 分  狼 {st["wolf"]}', flush=True)


def first(page, test):
    """第 12 个秋千往后，第一个满足条件的"""
    return page.evaluate("(test) => { const c = window.__game.course(); c.ensure(600); const f = new Function('n', 'return ' + test); return c.nodes.findIndex((n) => n.i >= 12 && f(n)); }", test)


PLAIN_SWAY = "n.swing.kind === 'plain' && n.swing.amp > 0 && !n.islet.blossom"
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)

    # ── 标题 ──
    if want('title'):
        ctx, page, logs = open_page(browser, size=(1600, 900), query=Q)
        logs_all.append(logs)
        page.wait_for_timeout(2000)
        snap(page, 'title')
        ctx.close()

    # ── 开局、蓄力、起跳、落在正中 ──
    if want('start') or want('charge') or want('jump') or want('perfect'):
        ctx, page, logs = open_page(browser, size=(1600, 900), query=Q)
        logs_all.append(logs)
        page.evaluate('() => window.__game.retry(5)')
        page.wait_for_timeout(1600)
        if want('start'):
            snap(page, 'start')
        page.evaluate('() => window.__game.press()')
        page.wait_for_function('() => window.__game.state().charge >= 0.48', timeout=6000)
        if want('charge'):
            snap(page, 'charge')
        page.evaluate('() => window.__game.release()')
        page.wait_for_function("() => window.__game.state().state === 'air'", timeout=5000)
        page.wait_for_timeout(260)                                             # 飞到快到最高点的地方
        if want('jump'):
            snap(page, 'jump', settle=450)                                     # 兔子定在半空，镜头跟上来
        # “落在正中”要跳得准：刚才那一下是随手按的，多半跳过头了。重来一局，让机器人跳
        page.evaluate('() => window.__game.retry(5)')
        page.wait_for_timeout(700)
        page.evaluate('() => window.__game.bot(true)')
        page.wait_for_function("() => window.__game.state().state === 'ride' && window.__game.state().node === 1", timeout=20000)
        page.evaluate('() => window.__game.bot(false)')
        page.wait_for_timeout(240)                                             # 等“完美”那一行字冒出来
        if want('perfect'):
            snap(page, 'perfect', settle=120)
        ctx.close()

    # ── 金色秋千、裂缝的旧秋千：让机器人从上一个秋千真的跳上去 ──
    for name in ('gold', 'cracked'):
        if not want(name) and not (name == 'cracked' and want('broken')):
            continue
        ctx, page, logs = open_page(browser, size=(1600, 900), query=Q)
        logs_all.append(logs)
        k = first(page, f"n.swing.kind === '{name}'")
        page.evaluate('(i) => window.__game.retry(5)', k)
        page.wait_for_timeout(500)
        page.evaluate('(i) => window.__game.warp(i - 1, { wolf: 300 })', k)
        page.wait_for_timeout(1200)
        page.evaluate('() => window.__game.bot(true)')
        page.wait_for_function('(i) => window.__game.state().node === i && window.__game.state().state === "ride"', arg=k, timeout=20000)
        page.evaluate('() => window.__game.bot(false)')                        # 落上去了就别再跳：旧秋千要等它断
        page.wait_for_timeout(260)
        snap(page, name, settle=120)                                           # 落上去那一瞬：加分和提示都在
        if name == 'cracked' and want('broken'):
            page.wait_for_function("() => window.__game.state().state === 'fall'", timeout=5000)
            snap(page, 'broken', settle=260)                                   # 木板裂成两半往下掉
        ctx.close()

    # ── 风暴狼、被扑倒、结算 ──
    if want('wolf') or want('caught') or want('over') or want('cover'):
        ctx, page, logs = open_page(browser, size=(1600, 900), query=Q)
        logs_all.append(logs)
        k = first(page, PLAIN_SWAY)
        page.evaluate('(i) => window.__game.retry(5)', k)
        page.wait_for_timeout(500)
        page.evaluate('(i) => window.__game.warp(i, { wolf: 11 })', k)
        page.wait_for_timeout(1300)                                            # 镜头放宽，把狼框进来
        if want('wolf'):
            snap(page, 'wolf')
        if want('cover'):
            page.evaluate('() => window.__game.wolf(5.6)')                     # 截封面要换尺寸、等镜头，先把狼的距离重新摆好
            snap(page, 'cover', size=(1280, 720), noui=True, settle=700)
        page.evaluate('() => window.__game.wolf(3.4)')
        page.wait_for_function("() => window.__game.state().mode === 'over'", timeout=15000)
        if want('caught'):
            page.wait_for_timeout(430)                                         # 等白闪散掉：狼扑在半空（慢动作）
            snap(page, 'caught', settle=80)
        page.wait_for_function("() => !document.getElementById('over').hidden", timeout=12000)
        if want('over'):
            page.wait_for_timeout(600)
            snap(page, 'over', settle=100)
        ctx.close()

    # ── 手机横屏 ──
    if want('mobile'):
        ctx, page, logs = open_page(browser, size=(844, 390), mobile=True, scale=2, query='?seed=5&q=1')
        logs_all.append(logs)
        page.tap('#title [data-act="start"]')
        page.wait_for_timeout(400)
        page.evaluate('() => window.__game.press()')
        page.wait_for_function('() => window.__game.state().charge >= 0.48', timeout=6000)
        snap(page, 'mobile')
        ctx.close()
    browser.close()

sheet = pathlib.Path('shots/app/_sheet.jpg')
if sheet.exists():
    shutil.copy(sheet, OUT / 'ui.jpg')
    print('  ui             （交互检查顺手截的界面总图）')
bad = [l for logs in logs_all for l in logs if l.startswith(('[pageerror]', '[error]'))]
print('console:', ' | '.join(bad[:4]) if bad else '干净')
print('gallery ->', OUT)
sys.exit(1 if bad else 0)
