"""交互检查：用真实的键盘、鼠标、触屏事件把页面走一遍。
启动日志和样式表 → 标题 → 开始 → 蓄力（蓄力条真的画出来了）→ 起跳（鼠标、空格各一次）→ 狼出现 →
暂停 / 设置 / 怎么玩 → 落点辅助 → 快捷键 → 掉进云海 → 结算 → 再来一局 → 被狼追上 → 秋千断 → 回到标题 →
设置存下来、下次打开还在 → 手机横屏和竖屏 → 改窗口大小。
每一步记 [ok] / [FAIL]，最后把几种界面各截一张拼成总图。

  python tools/qa/app_check.py [--out shots/app]
"""
import argparse
import json
import pathlib
import sys
import time

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--out', default='shots/app')
a = ap.parse_args()
OUT = pathlib.Path(a.out)
OUT.mkdir(parents=True, exist_ok=True)
STATE = '() => window.__game.state()'
HINT = '() => window.__game.hint()'
fails, lines, shots = [], [], []


def check(name, ok, detail=''):
    lines.append(f'[{"ok" if ok else "FAIL"}] {name}' + (f'  {detail}' if detail else ''))
    if not ok:
        fails.append(name)
    return ok


def shot(page, name, ms=700):
    page.wait_for_timeout(ms)
    f = OUT / f'{name}.jpg'
    page.screenshot(path=str(f), type='jpeg', quality=86)
    shots.append((name, f))


def hidden(page, sel):
    return page.evaluate("(s) => document.querySelector(s).hidden", sel)


def settled(page):
    """等这一下输入被处理完、兔子落回秋千（或者掉下去）：远程桌面下刷新率只有 32 赫兹，松手以后要过一帧才起跳"""
    page.wait_for_function("() => window.__game.input().queued === 0 && window.__game.state().charge === null", timeout=5000)
    page.wait_for_function("() => ['ride', 'fall', 'slip'].includes(window.__game.state().state) || window.__game.state().mode === 'over'", timeout=8000)


def ready(page):
    page.wait_for_function("() => window.__game.state().state === 'ride' && window.__game.state().charge === null", timeout=8000)


def hold_until(page, charge):
    """一直等到蓄力读数到 charge：截图、发事件都要花时间，掐表不准，盯着读数才稳"""
    page.wait_for_function(f"() => window.__game.state().charge >= {charge:.4f}", timeout=6000)


def jump_mouse(page, hold_ms=None):
    """按住鼠标、松开。不给时长就按机器人算出来的时长"""
    ready(page)
    hold = hold_ms if hold_ms is not None else page.evaluate(HINT)['hold'] * 1000
    page.mouse.move(900, 520)
    page.mouse.down()
    if hold_ms is None:
        hold_until(page, hold / 1000 / 1.1 - 0.02)
    else:
        page.wait_for_timeout(int(hold))
    page.mouse.up()
    settled(page)
    return page.evaluate(STATE)


def jump_key(page, code='Space', hold_ms=None):
    ready(page)
    hold = hold_ms if hold_ms is not None else page.evaluate(HINT)['hold'] * 1000
    page.keyboard.down(code)
    if hold_ms is None:
        hold_until(page, hold / 1000 / 1.1 - 0.02)
    else:
        page.wait_for_timeout(int(hold))
    page.keyboard.up(code)
    settled(page)
    return page.evaluate(STATE)


def wait_over(page):
    page.wait_for_function("() => !document.getElementById('over').hidden", timeout=12000)


t_start = time.time()
try:
  with sync_playwright() as p:
      browser = launch(p, args=UA_FLAGS)
      ctx, page, logs = open_page(browser, size=(1600, 900), query='?seed=5')
      page.evaluate('() => localStorage.clear()')                                # 从干净的浏览器状态开始
      page.reload()
      page.wait_for_function('window.__sceneReady === true', timeout=120000)
      check('启动：场景就绪', True, f'{time.time() - t_start:.1f} 秒（含浏览器启动）')
      page.wait_for_function("() => document.getElementById('load').hidden", timeout=15000)
      st = page.evaluate(STATE)
      check('标题画面', st['mode'] == 'title' and not hidden(page, '#title') and hidden(page, '#hud') and hidden(page, '#panel') and hidden(page, '#over'), json.dumps(st, ensure_ascii=False))
      check('标题上写着“本项目由 GLM-5.4 开发”', '本项目由 GLM-5.4 开发' in page.evaluate("() => document.querySelector('#title .credit').textContent"))
      check('电脑上按钮旁写着按键（空格 / 回车）', page.evaluate("() => document.querySelector('#title [data-act=\"start\"] small').textContent") == '空格 / 回车' and not hidden(page, '#title [data-act="start"] small'))
      s0 = page.evaluate('() => window.__game.settings()')
      check('画质默认自动、从最高档起步', s0['quality'] == 'auto' and st['level'] == 2, f"quality {s0['quality']} level {st['level']}")
      shot(page, '1-title', 2200)

      # 样式表里的每一条规则浏览器都要认：一条规则的尾巴上写了 CSS 不认的注释，会把下一条规则的选择器一起吞掉（蓄力条就这么消失过）。
      # 本地文件页面上读不到已加载样式表的规则，就把源码交给浏览器重新解析一遍来对
      import re
      src = re.sub(r'/\*.*?\*/', '', (pathlib.Path(__file__).resolve().parents[2] / 'styles.css').read_text(encoding='utf-8'), flags=re.S)
      want_sel = {m.group(1).strip() for m in re.finditer(r'(?m)^\s*([^\s@/{\-][^{\n]*?)\s*\{', src)}
      want_sel -= {'from', 'to'}
      have_sel = set(page.evaluate("""(text) => { const sheet = new CSSStyleSheet(); sheet.replaceSync(text); const out = []; const walk = (rules) => { for (const r of rules) { if (r.selectorText) out.push(r.selectorText); if (r.cssRules) walk(r.cssRules); } };
        walk(sheet.cssRules); return out; }""", src))
      lost = sorted(want_sel - have_sel)
      check('样式表里的规则浏览器都认了', not lost, f'{len(want_sel)} 条' + (f'，丢了：{lost[:4]}' if lost else ''))

      # ── 开始 ──
      page.keyboard.press('Space')                                                # 标题上按空格就是“开始”，不会顺带蓄力
      page.wait_for_timeout(500)
      st = page.evaluate(STATE)
      check('空格开始：进入游戏，界面切过来', st['mode'] == 'play' and not st['paused'] and hidden(page, '#title') and not hidden(page, '#hud'), json.dumps(st, ensure_ascii=False))
      check('开始那一下不算蓄力', st['state'] == 'ride' and st['charge'] is None and st['node'] == 0)
      check('一开始有操作提示', not hidden(page, '#hint') and '蓄力' in page.evaluate("() => document.querySelector('#hint').textContent"))

      # ── 蓄力：按住鼠标 ──
      page.mouse.move(900, 520)
      page.mouse.down()
      page.wait_for_timeout(260)
      mid = page.evaluate(STATE)
      # 蓄力条要真的画出来了：有粗细、不透明、底色不是透明、横着居中、贴在画面下沿
      b = page.evaluate("""() => { const e = document.getElementById('charge'), r = e.getBoundingClientRect(), c = getComputedStyle(e);
        return { on: e.classList.contains('on'), fill: parseFloat(document.getElementById('chargeBar').style.width), h: r.height, op: +c.opacity, bg: c.backgroundColor,
          cx: (r.left + r.right) / 2, bottom: innerHeight - r.bottom, fillW: document.getElementById('chargeBar').getBoundingClientRect().width }; }""")
      bar = b['on'] and b['fill'] > 10 and b['h'] >= 12 and b['op'] > 0.9 and b['bg'] != 'rgba(0, 0, 0, 0)' and abs(b['cx'] - 1600 / 2) < 2 and 20 < b['bottom'] < 60 and b['fillW'] > 15
      page.mouse.up()                                                            # 这次只按了一小会儿，是来摔的：先别管，下面重来
      page.wait_for_function("() => window.__game.state().mode === 'over'", timeout=8000)
      wait_over(page)
      page.keyboard.press('Space')                                               # 再来一局
      page.wait_for_function("() => window.__game.state().mode === 'play' && window.__game.state().state === 'ride'", timeout=5000)
      check('按住鼠标在蓄力，画面下沿画出蓄力条', 0.15 < (mid['charge'] or 0) < 0.4 and bar, f"charge {mid['charge']}  {json.dumps(b)}")

      # ── 第一跳：鼠标 ──
      st = jump_mouse(page)
      check('松开鼠标起跳，落在下一个秋千上', st['state'] == 'ride' and st['node'] == 1 and st['score'] >= 1, f"node {st['node']} score {st['score']} state {st['state']}")
      check('第一跳以后操作提示收起来', hidden(page, '#hint'))

      # ── 第二跳：空格 ──
      st = jump_key(page)
      check('空格按住、松开也一样能跳', st['state'] == 'ride' and st['node'] == 2 and st['score'] >= 2, f"node {st['node']} score {st['score']}")
      check('荡过两个秋千，风暴狼开始追', st['wolf'] is not None and 25 < st['wolf'] < 35, f"狼在后面 {st['wolf']} 米")
      page.wait_for_function("() => !document.querySelector('#wolf').hidden", timeout=4000)
      check('左上角出现狼的距离', not hidden(page, '#wolf') and '米' in page.evaluate("() => document.querySelector('#wolf').textContent"))

      # ── 第三跳：↑ 键；这一跳拍下来 ──
      ready(page)
      h = page.evaluate(HINT)
      page.keyboard.down('ArrowUp')
      page.wait_for_function("() => window.__game.state().charge > 0.12", timeout=4000)
      shot(page, '2-charge', 0)
      c = page.evaluate(STATE)['charge']                                     # 截图花了时间：松手前重新看一眼已经蓄了多少
      page.wait_for_timeout(max(0, int(h['hold'] * 1000) - int(c * 1100)))
      page.keyboard.up('ArrowUp')
      page.wait_for_function("() => window.__game.state().state === 'air'", timeout=4000)
      page.wait_for_timeout(260)
      shot(page, '3-air', 0)
      settled(page)
      st = page.evaluate(STATE)
      check('↑ 键和空格一样', st['state'] == 'ride' and st['node'] == 3, f"node {st['node']}")
      shot(page, '4-land', 150)

      # ── 暂停 ──
      t1 = page.evaluate('() => window.__game.state().t')
      page.keyboard.press('Escape')
      page.wait_for_timeout(400)
      t2 = page.evaluate('() => window.__game.state().t')
      st = page.evaluate(STATE)
      check('Esc 暂停：弹出菜单，规则停住', st['paused'] and page.evaluate("() => document.querySelector('#panelTitle').textContent") == '暂停' and abs(t2 - t1) < 0.12, f't {t1} → {t2}')
      shot(page, '5-pause')
      page.keyboard.press('Escape')
      page.wait_for_timeout(300)
      check('再按 Esc 继续', not page.evaluate('() => window.__game.state().paused') and hidden(page, '#panel'))

      # ── 设置 ──
      page.evaluate("() => document.getElementById('btnPause').click()")          # 点界面上的按钮不算蓄力
      page.wait_for_timeout(300)
      check('点暂停按钮：暂停，而且没有顺带蓄力', page.evaluate('() => window.__game.state().paused') and page.evaluate('() => window.__game.state().charge') is None)
      page.click('#panel [data-act="settings"]')
      page.wait_for_timeout(300)
      check('暂停里进设置', page.evaluate("() => document.querySelector('#panelTitle').textContent") == '设置')
      page.click('#panel .seg button:nth-child(2)')                              # 流畅
      page.wait_for_timeout(1200)
      s1 = page.evaluate('() => window.__game.settings()')
      check('画质选“流畅”：马上换过去', s1['quality'] == '0' and page.evaluate('() => window.__game.state().level') == 0, json.dumps(s1))
      page.click('#panel .row:nth-of-type(4) .toggle')                           # 落点辅助
      check('打开落点辅助', page.evaluate('() => window.__game.settings().assist') is True)
      page.click('#panel .seg button:nth-child(4)')                              # 极致
      page.wait_for_timeout(1200)
      check('画质选“极致”', page.evaluate('() => window.__game.settings().quality') == '2' and page.evaluate('() => window.__game.state().level') == 2)
      shot(page, '6-settings')
      page.click('#panel [data-act="back"]')
      page.wait_for_timeout(250)
      check('设置里返回，回到暂停菜单', page.evaluate("() => document.querySelector('#panelTitle').textContent") == '暂停')
      page.keyboard.press('Space')                                                # 暂停菜单上按空格 = 继续
      page.wait_for_timeout(300)
      check('暂停菜单上按空格继续，不蓄力', not page.evaluate('() => window.__game.state().paused') and page.evaluate('() => window.__game.state().charge') is None)

      # ── 落点辅助：按住的时候画出弧线 ──
      ready(page)
      hold = page.evaluate(HINT)['hold'] * 1000
      page.keyboard.down('Space')
      page.wait_for_timeout(250)
      arc = page.evaluate("() => { const g = window.__game, a = g.scene().getObjectByName('assist'); return { ok: a.visible && a.count > 8, visible: a.visible, count: a.count, charge: g.state().charge, inp: g.input() }; }")
      c = page.evaluate(STATE)['charge']
      page.wait_for_timeout(max(0, int(hold) - int(c * 1100)))                  # 这一下按满，落回秋千上
      page.keyboard.up('Space')
      settled(page)
      check('按住时画出这一跳的弧线', arc['ok'], json.dumps(arc))

      # ── 快捷键 ──
      page.keyboard.press('KeyM')
      page.wait_for_timeout(200)
      check('M 静音', page.evaluate('() => window.__game.settings().sound') is False and page.evaluate("() => document.getElementById('btnSound').classList.contains('off')"))
      page.keyboard.press('KeyM')
      check('再按 M 有声', page.evaluate('() => window.__game.settings().sound') is True)

      # ── 掉进云海 ──
      jump_mouse(page, 50)
      page.wait_for_function("() => window.__game.state().mode === 'over'", timeout=8000)
      wait_over(page)
      st = page.evaluate(STATE)
      check('按得太轻：掉下去，这局结束', st['mode'] == 'over' and st['over']['reason'] == 'fall', json.dumps(st['over'], ensure_ascii=False))
      wait_over(page)
      txt = page.evaluate("() => document.querySelector('#overReason').textContent")
      score_shown = page.evaluate("() => document.querySelector('#overScore').textContent")
      check('结算卡片写着“掉进云海了”和分数', txt == '掉进云海了' and score_shown == str(st['score']), f'{txt}，{score_shown}')
      best = page.evaluate("() => JSON.parse(localStorage.getItem('swing-hop.best.v1'))")
      check('最高分存进了浏览器', best == st['score'], f'best {best}')
      shot(page, '7-over')
      page.keyboard.press('Space')
      page.wait_for_timeout(400)
      st = page.evaluate(STATE)
      check('空格再来一局：从头开始', st['mode'] == 'play' and st['node'] == 0 and st['score'] == 0 and hidden(page, '#over') and st['wolf'] is None, json.dumps(st, ensure_ascii=False))

      # ── 被狼追上 ──
      page.evaluate("() => window.__game.warp(8, { wolf: 1.6 })")
      wait_over(page)
      st = page.evaluate(STATE)
      check('被风暴狼追上：结束', st['over']['reason'] == 'caught' and page.evaluate("() => document.querySelector('#overReason').textContent") == '被风暴狼追上了', json.dumps(st['over'], ensure_ascii=False))
      shot(page, '8-caught')
      page.keyboard.press('KeyR')
      page.wait_for_timeout(400)
      st = page.evaluate(STATE)
      check('结算上按 R 也是再来一局', st['mode'] == 'play' and st['node'] == 0 and st['score'] == 0 and hidden(page, '#over'), json.dumps(st, ensure_ascii=False)[:120])

      # ── 秋千断 ──
      page.evaluate('() => window.__game.retry(5)')
      idx = page.evaluate("() => { const c = window.__game.course(); c.ensure(90); return c.nodes.findIndex((n, i) => i >= 14 && n.swing.kind === 'cracked'); }")
      page.evaluate("(i) => window.__game.warp(i, { wolf: 80 })", idx)
      page.wait_for_function("() => window.__game.state().mode === 'over'", timeout=12000)
      wait_over(page)
      st = page.evaluate(STATE)
      check('站在裂缝的旧秋千上太久：秋千断了', idx > 0 and st['over']['reason'] == 'cracked' and page.evaluate("() => document.querySelector('#overReason').textContent") == '秋千断了', f'第 {idx} 个')

      # ── 回到标题、怎么玩 ──
      page.click('#over [data-act="title"]')
      page.wait_for_timeout(500)
      st = page.evaluate(STATE)
      check('回到标题', st['mode'] == 'title' and not hidden(page, '#title') and hidden(page, '#hud') and not hidden(page, '#titleBest'))
      page.click('#title [data-act="help"]')
      page.wait_for_timeout(300)
      check('怎么玩', page.evaluate("() => document.querySelector('#panelTitle').textContent") == '怎么玩' and page.evaluate("() => document.querySelectorAll('#panel .kinds li').length") == 4)
      shot(page, '9-help')
      page.keyboard.press('Escape')
      page.wait_for_timeout(250)
      check('Esc 关掉“怎么玩”', hidden(page, '#panel'))

      # ── 设置存下来、下次打开还在 ──
      page.evaluate('() => window.__game.retry(5)')
      page.wait_for_timeout(300)
      page.evaluate("() => { document.getElementById('btnPause').click(); }")
      page.wait_for_timeout(250)
      page.click('#panel [data-act="settings"]')
      page.click('#panel .seg button:nth-child(1)')                              # 回到自动
      page.wait_for_timeout(200)
      page.reload()
      page.wait_for_function('window.__sceneReady === true', timeout=120000)
      s2 = page.evaluate('() => window.__game.settings()')
      st = page.evaluate(STATE)
      check('设置和最高分都记着，刷新以后还在', s2['assist'] is True and s2['quality'] == 'auto' and st['best'] == best, json.dumps({**s2, 'best': st['best']}))

      # ── 改窗口大小 ──
      for w, h in [(1000, 700), (520, 900), (1600, 900)]:
          page.set_viewport_size({'width': w, 'height': h})
          page.wait_for_timeout(350)
      cw, chh = page.evaluate("() => [document.getElementById('view').clientWidth, document.getElementById('view').clientHeight]")
      check('改窗口大小：画布跟着变', (cw, chh) == (1600, 900) and page.evaluate('() => window.__game.state().mode') == 'title', f'{cw}×{chh}')
      ctx.close()

      # ── 手机横屏：触屏 ──
      ctx3, page3, logs3 = open_page(browser, size=(844, 390), mobile=True, scale=2, query='?seed=5&q=1')
      page3.evaluate('() => localStorage.clear()')
      page3.reload()
      page3.wait_for_function('window.__sceneReady === true', timeout=120000)
      shot(page3, '10-m-title', 1500)
      check('手机：按钮上不写键盘按键', page3.evaluate("() => [...document.querySelectorAll('#title .menu small, #panel .foot small')].length === 2 && [...document.querySelectorAll('#title .menu small, #panel .foot small')].every((s) => s.hidden)"))
      page3.tap('#title [data-act="help"]')
      page3.wait_for_timeout(300)
      check('手机：怎么玩里写的是“按住屏幕”', '按住屏幕' in page3.evaluate("() => document.querySelector('#panel .keys').textContent"))
      check('手机：说明一屏放得下，不用滚动', page3.evaluate("() => { const s = document.querySelector('#panel .sheet'); return s.scrollHeight <= s.clientHeight + 2; }"), page3.evaluate("() => { const s = document.querySelector('#panel .sheet'); return `${s.scrollHeight} / ${s.clientHeight}`; }"))
      shot(page3, '11-m-help', 200)
      page3.tap('#panel [data-act="back"]')
      page3.tap('#title [data-act="start"]')
      page3.wait_for_timeout(500)
      cdp = ctx3.new_cdp_session(page3)
      ready(page3)
      hold = page3.evaluate(HINT)['hold']
      cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': 500, 'y': 250}]})
      page3.wait_for_function("() => window.__game.state().charge > 0.12", timeout=4000)
      st = page3.evaluate(STATE)
      shot(page3, '12-m-charge', 0)
      check('手机：手指按着屏幕在蓄力', st['state'] == 'ride' and 0.1 < (st['charge'] or 0) < 0.5, f"charge {st['charge']}")
      page3.wait_for_function(f"() => window.__game.state().charge >= {hold / 1.1 - 0.02:.4f}", timeout=5000)   # 盯着蓄力读数，蓄够了就松手（截图和触屏事件都要花时间，掐表不准）
      cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
      settled(page3)
      st = page3.evaluate(STATE)
      check('手机：松手起跳，落在下一个秋千上', st['state'] == 'ride' and st['node'] == 1, f"node {st['node']} state {st['state']}")
      shot(page3, '13-m-play')
      logs += logs3
      ctx3.close()

      # ── 手机竖屏 ──
      ctx4, page4, logs4 = open_page(browser, size=(390, 844), mobile=True, scale=2, query='?seed=5&q=1')
      shot(page4, '14-p-title', 1500)
      page4.tap('#title [data-act="start"]')
      page4.wait_for_timeout(900)
      check('竖屏：也能玩，开始按钮和提示都在', page4.evaluate('() => window.__game.state().mode') == 'play' and not hidden(page4, '#hint'))
      shot(page4, '15-p-play')
      logs += logs4
      ctx4.close()
      browser.close()

except Exception:
  for line in lines:
    print(line[:330])
  print('console:', ' | '.join(l[:300] for l in logs[:6]))
  raise

# 界面总图
if shots:
    tw = 640
    th = round(tw * 9 / 16)
    cols = 4
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 26) + 6), (14, 16, 20))
    d = ImageDraw.Draw(sheet)
    for i, (name, f) in enumerate(shots):
        im = Image.open(f).convert('RGB')
        im = im.resize((tw, round(tw * im.height / im.width)), Image.LANCZOS).crop((0, 0, tw, min(th, im.height)))
        x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 26)
        sheet.paste(im, (x, y + 20))
        d.text((x + 2, y + 4), name, fill=(220, 230, 236))
    sheet.save(OUT / '_sheet.jpg', quality=86)
for line in lines:
    print(line[:330])
bad = [l for l in logs if l.startswith(('[pageerror]', '[error]', '[warning]'))]
print('console:', ' | '.join(bad[:6]) if bad else '干净')
print(f'{len(lines) - len(fails)}/{len(lines)} 项通过')
print('APP OK' if not fails and not bad else 'APP PROBLEM')
sys.exit(1 if fails or bad else 0)
