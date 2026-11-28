"""交互检查：用真实的键盘、鼠标事件把页面走一遍。标题 → 巡游（换镜头、暂停）→ 潜泳（游、疾游、升降、转向、撞墙、回起点）→
菜单（暂停、设置、说明）→ 快捷键 → 设置存下来、下次打开还在 → 地址栏参数 → 手机（触屏的摇杆和按键）→ 改窗口大小。
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
fails, lines, shots = [], [], []


def check(name, ok, detail=''):
    lines.append(f'[{"ok" if ok else "FAIL"}] {name}' + (f'  {detail}' if detail else ''))
    if not ok:
        fails.append(name)
    return ok


def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def shot(page, name, ms=900):
    page.wait_for_timeout(ms)
    f = OUT / f'{name}.jpg'
    page.screenshot(path=str(f), type='jpeg', quality=86)
    shots.append((name, f))


def hidden(page, sel):
    return page.evaluate("(s) => document.querySelector(s).hidden", sel)


t_start = time.time()
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, logs = open_page(browser, size=(1600, 900))
    page.evaluate('() => localStorage.clear()')                                # 从干净的浏览器状态开始（不留上一次检查存下的设置）
    page.reload()
    page.wait_for_function('window.__sceneReady === true', timeout=120000)
    check('启动：场景就绪', True, f'{time.time() - t_start:.1f} 秒（含浏览器启动）')
    page.wait_for_function("document.getElementById('load').classList.contains('is-done')", timeout=15000)
    check('启动：加载层揭开', True)
    st = page.evaluate(STATE)
    check('标题画面', st['mode'] == 'title' and not hidden(page, '#title') and hidden(page, '#hud') and hidden(page, '#caption') and hidden(page, '#panel'), json.dumps(st, ensure_ascii=False))
    check('标题上写着“本项目由 GLM-5.4 开发”', '本项目由 GLM-5.4 开发' in page.evaluate("() => document.querySelector('#title .credit').textContent"))
    check('画质默认自动、从最高档起步', st['quality'] == 'auto' and st['level'] == 2, f"quality {st['quality']} level {st['level']}")
    shot(page, '1-title', 2600)

    # ── 巡游 ──
    page.keyboard.press('Enter')
    page.wait_for_timeout(900)
    st = page.evaluate(STATE)
    cap = page.evaluate("() => [document.getElementById('capIdx').textContent, document.getElementById('capPlace').textContent, document.getElementById('capText').textContent.length]")
    check('回车开始巡游', st['mode'] == 'tour' and st['shot'] == 'bridge' and hidden(page, '#title') and not hidden(page, '#caption') and cap[0] == '01 / 16' and len(cap[1]) >= 2 and cap[2] > 8, f'{st["mode"]} {st["shot"]} 字幕 {cap}')
    page.keyboard.press('ArrowRight'); page.wait_for_timeout(700)
    check('→ 下一个镜头', page.evaluate(STATE)['shot'] == 'gate')
    page.keyboard.press('ArrowLeft'); page.wait_for_timeout(700)
    check('← 上一个镜头', page.evaluate(STATE)['shot'] == 'bridge')
    shot(page, '2-tour', 1800)
    page.keyboard.press('Space'); page.wait_for_timeout(300)
    paused = page.evaluate(STATE)
    check('空格暂停巡游', paused['paused'] is True and page.evaluate("() => document.getElementById('toast').textContent") == '暂停')
    page.keyboard.press('Space'); page.wait_for_timeout(300)
    check('空格继续', page.evaluate(STATE)['paused'] is False)

    # ── 潜泳 ──
    before = page.evaluate(STATE)['pos']
    page.keyboard.press('KeyT'); page.wait_for_timeout(900)
    st = page.evaluate(STATE)
    check('T 切到自由潜泳，镜头留在原地', st['mode'] == 'free' and dist(st['pos'], before) < 2.5 and not hidden(page, '#hud') and hidden(page, '#caption'), f'{st["mode"]} 从 {before} 到 {st["pos"]}，指针锁定 {st["locked"]}')
    depth = page.evaluate("() => document.getElementById('depthV').textContent")
    check('仪表：深度读数对得上', abs(int(depth) + st['pos'][1]) < 1.5, f'深度 {depth}，镜头 y = {st["pos"][1]}')
    locked = page.evaluate("() => document.pointerLockElement === document.getElementById('view')")
    if locked:
        y0 = page.evaluate('() => window.__game.swim.state.yaw')
        page.mouse.move(800, 450); page.mouse.move(1000, 450, steps=4)
        page.wait_for_timeout(200)
        y1 = page.evaluate('() => window.__game.swim.state.yaw')
        check('鼠标转视角（指针锁定）', y1 < y0 - 0.2, f'朝向 {y0:.2f} → {y1:.2f}')
    else:
        page.evaluate('() => window.__game.swim.lookDelta(200, 0)')
        check('转视角（这台无头浏览器没给指针锁定，走的是拖动的接口）', page.evaluate('() => window.__game.swim.state.yaw') < -0.5)
    page.evaluate('() => window.__game.swim.enter({ pos: new window.__game.THREE.Vector3(1.2, -30.6, 13), quat: new window.__game.THREE.Quaternion().setFromEuler(new window.__game.THREE.Euler(0.05, 0.06, 0, "YXZ")), fov: 62 })')
    page.wait_for_timeout(600)
    p0 = page.evaluate(STATE)['pos']
    page.keyboard.down('KeyW'); page.wait_for_timeout(1500); page.keyboard.up('KeyW')
    p1 = page.evaluate(STATE)['pos']
    check('W 往前游', dist(p0, p1) > 2 and p1[2] < p0[2] - 1.5 and abs(p1[0] - p0[0]) < 1.5, f'{p0} → {p1}')
    page.keyboard.down('ShiftLeft'); page.keyboard.down('KeyW'); page.wait_for_timeout(600)
    page.wait_for_timeout(900)
    fast = page.evaluate('() => [window.__game.swim.state.speed, document.getElementById("speedV").classList.contains("on"), window.__game.stage.camera.fov]')
    page.keyboard.up('KeyW'); page.keyboard.up('ShiftLeft')
    check('Shift 疾游：更快、视野略宽、速度亮出来', fast[0] > 6 and fast[1] and fast[2] > 64, f'速度 {fast[0]:.1f}，视野 {fast[2]:.1f}')
    page.evaluate('() => window.__game.swim.enter({ pos: new window.__game.THREE.Vector3(40, -30, 60), quat: new window.__game.THREE.Quaternion(), fov: 62 })')
    page.wait_for_timeout(500)
    y0 = page.evaluate(STATE)['pos'][1]
    page.keyboard.down('Space'); page.wait_for_timeout(900); page.keyboard.up('Space'); page.wait_for_timeout(800)
    y1 = page.evaluate(STATE)['pos'][1]
    page.keyboard.down('KeyC'); page.wait_for_timeout(900); page.keyboard.up('KeyC'); page.wait_for_timeout(800)
    y2 = page.evaluate(STATE)['pos'][1]
    check('空格上升、C 下降', y1 > y0 + 0.8 and y2 < y1 - 0.8, f'y {y0:.1f} → {y1:.1f} → {y2:.1f}')
    x0 = page.evaluate(STATE)['pos'][0]
    page.keyboard.down('KeyD'); page.wait_for_timeout(900); page.keyboard.up('KeyD'); page.wait_for_timeout(700)
    check('D 往右平移', page.evaluate(STATE)['pos'][0] > x0 + 0.6)
    # 从起点一直疾游到城门：被吊着一半的铁闸挡住，穿不过去
    page.evaluate('() => window.__game.swim.enter({ pos: new window.__game.THREE.Vector3(1.2, -30.6, 13), quat: new window.__game.THREE.Quaternion().setFromEuler(new window.__game.THREE.Euler(0.05, 0.06, 0, "YXZ")), fov: 62 })')
    page.keyboard.down('ShiftLeft'); page.keyboard.down('KeyW'); page.wait_for_timeout(5200)
    page.keyboard.up('KeyW'); page.keyboard.up('ShiftLeft'); page.wait_for_timeout(900)
    end = page.evaluate('() => { const s = window.__game.state(); return { pos: s.pos, clear: window.__game.colliders.clear(s.pos[0], s.pos[1], s.pos[2], 0.5), ground: window.__game.colliders.clear(s.pos[0], -30, s.pos[2], 0.5) }; }')
    check('疾游到城门，被铁闸挡住、不穿墙', -30.5 < end['pos'][2] < -26 and end['clear'] and end['pos'][1] < -1, json.dumps(end))
    page.keyboard.press('KeyR'); page.wait_for_timeout(900)
    back = page.evaluate(STATE)['pos']
    check('R 回到石桥', dist(back, [1.2, -30.6, 13]) < 0.05 and page.evaluate("() => document.getElementById('toast').textContent") == '回到石桥', str(back))
    shot(page, '3-free', 1600)

    # ── 菜单 ──
    page.keyboard.press('Escape'); page.wait_for_timeout(600)
    st = page.evaluate(STATE)
    check('Esc 打开暂停菜单，画面停住', st['panel'] == 'pause' and st['paused'] is True, json.dumps(st, ensure_ascii=False))
    shot(page, '4-pause', 300)
    page.click('#panel [data-act="settings"]'); page.wait_for_timeout(400)
    rows = page.evaluate("() => [...document.querySelectorAll('#panel .row label')].map((e) => e.textContent)")
    check('设置面板有七项', page.evaluate(STATE)['panel'] == 'settings' and rows == ['时刻', '水质', '画质', '视角灵敏度', '镜头晃动', '巡游字幕', '声音'], ' '.join(rows))
    shot(page, '5-settings', 300)
    page.click('#panel .seg[data-key="hour"] button[data-v="night"]')
    page.click('#panel .seg[data-key="clarity"] button[data-v="hazy"]')
    page.click('#panel .seg[data-key="quality"] button[data-v="1"]')
    page.click('#panel .seg[data-key="sway"] button[data-v="false"]')
    page.click('#panel .seg[data-key="captions"] button[data-v="false"]')
    page.wait_for_timeout(1500)
    st = page.evaluate(STATE)
    extra = page.evaluate('() => [window.__game.tour.state.handheld, window.__game.ui.state.captions, document.querySelector("#panel .seg[data-key=hour] button[aria-pressed=true]").dataset.v, document.getElementById("meta").textContent]')
    proj = page.evaluate("() => ['snow', 'bubbles'].map((n) => { const u = window.__game.stage.scene.getObjectByName(n).material.uniforms.uProj.value; return Number.isFinite(u) && u > 0; })")
    check('设置点了就生效', st['hour'] == 'night' and st['night'] > 0.9 and st['clarity'] == 'hazy' and st['quality'] == '1' and st['level'] == 1 and extra[0] == 0 and extra[1] is False and extra[2] == 'night' and '夜晚' in extra[3], f'{json.dumps(st, ensure_ascii=False)} 晃动 {extra[0]} 字幕 {extra[1]}')
    check('换了画质档，海雪和气泡的投影系数还是正常的数', proj == [True, True], str(proj))
    page.evaluate("() => { const i = document.querySelector('#panel input[data-key=volume]'); i.value = '0.45'; i.dispatchEvent(new Event('input', { bubbles: true })); }")
    page.wait_for_timeout(200)
    check('音量滑块', page.evaluate('() => window.__game.settings.volume') == 0.45)
    saved = page.evaluate("() => JSON.parse(localStorage.getItem('sunken-castle.settings.v1'))")
    check('设置存进浏览器', saved['hour'] == 'night' and saved['clarity'] == 'hazy' and saved['quality'] == '1' and saved['sway'] is False and saved['volume'] == 0.45, json.dumps(saved, ensure_ascii=False))
    page.click('#panel .seg[data-key="sound"] button[data-v="false"]'); page.wait_for_timeout(300)
    page.click('#panel [data-act="back"]'); page.wait_for_timeout(500)
    st = page.evaluate(STATE)
    check('返回：关掉菜单、继续潜泳', st['panel'] is None and st['paused'] is False and st['mode'] == 'free' and page.evaluate('() => window.__game.audio.state.on') is False, json.dumps(st, ensure_ascii=False))
    page.keyboard.press('KeyM'); page.wait_for_timeout(300)
    check('M 静音开关', page.evaluate('() => window.__game.audio.state.on') is True and page.evaluate("() => document.getElementById('toast').textContent") == '声音：开')
    page.keyboard.press('KeyH'); page.wait_for_timeout(300)
    hid = page.evaluate("() => document.body.classList.contains('ui-hidden')")
    shot(page, '6-night-free-no-ui', 400)
    page.keyboard.press('KeyH'); page.wait_for_timeout(300)
    check('H 隐藏界面、再按一次回来', hid and not page.evaluate("() => document.body.classList.contains('ui-hidden')"))
    names = []
    for k in range(1, 6):
        page.keyboard.press(f'Digit{k}'); page.wait_for_timeout(700)
        names.append(page.evaluate('() => window.__game.state().hour'))
    check('1…5 换时刻', names == ['morning', 'noon', 'afternoon', 'dusk', 'night'], ' '.join(names))
    page.keyboard.press('KeyT'); page.wait_for_timeout(800)
    st = page.evaluate(STATE)
    check('T 切回巡游', st['mode'] == 'tour' and isinstance(st['shot'], str))
    page.keyboard.press('Escape'); page.wait_for_timeout(600)
    page.click('#panel [data-act="title"]'); page.wait_for_timeout(900)
    check('回到标题', page.evaluate(STATE)['mode'] == 'title' and not hidden(page, '#title') and hidden(page, '#hud'))
    page.click('#title [data-act="help"]'); page.wait_for_timeout(500)
    body = page.evaluate("() => [document.getElementById('panelBody').textContent, document.getElementById('panelFoot').textContent, document.querySelectorAll('#panelBody .row').length]")
    check('标题上打开操作说明', page.evaluate(STATE)['panel'] == 'help' and '疾游' in body[0] and '触屏' in body[0] and body[1] == '本项目由 GLM-5.4 开发', f'{len(body[0])} 字')
    shot(page, '7-help', 300)
    page.keyboard.press('Escape'); page.wait_for_timeout(500)
    check('Esc 关掉说明，标题没被暂停', page.evaluate(STATE)['panel'] is None and page.evaluate(STATE)['paused'] is False)
    page.click('#title [data-act="settings"]'); page.wait_for_timeout(400)
    page.click('#panel [data-act="back"]'); page.wait_for_timeout(400)
    check('标题上的设置也开得了、关得上', page.evaluate(STATE)['panel'] is None and page.evaluate(STATE)['mode'] == 'title')
    page.click('#title [data-act="tour"]'); page.wait_for_timeout(900)
    check('点“开始巡游”', page.evaluate(STATE)['mode'] == 'tour')
    page.keyboard.press('Escape'); page.wait_for_timeout(600)
    page.click('#panel [data-act="resume"]'); page.wait_for_timeout(400)
    check('“继续巡游”', page.evaluate(STATE)['panel'] is None and page.evaluate(STATE)['paused'] is False)

    # ── 同一个浏览器里再开一页：设置还在 ──
    page2 = ctx.new_page()
    logs2 = []
    page2.on('pageerror', lambda e: logs2.append(f'[pageerror] {e}'))
    page2.goto(page.url.split('?')[0], wait_until='load')
    page2.wait_for_function('window.__sceneReady === true', timeout=120000)
    st2 = page2.evaluate(STATE)
    check('设置存下来：重新打开还是上次的', st2['hour'] == 'night' and st2['clarity'] == 'hazy' and st2['quality'] == '1' and st2['level'] == 1 and page2.evaluate('() => [window.__game.settings.volume, window.__game.settings.sway, window.__game.settings.sound]') == [0.45, False, True], json.dumps(st2, ensure_ascii=False))
    page2.close()
    if logs2:
        logs.extend(logs2)

    # ── 地址栏参数 ──
    ctx3, page3, logs3 = open_page(browser, query='?hour=dusk&clarity=soft&q=1&mode=tour&shot=5&ui=0', init="localStorage.removeItem('sunken-castle.settings.v1')")
    st3 = page3.evaluate(STATE)
    check('地址栏参数：时刻、水质、画质、巡游第几个镜头、藏起界面', page3.url.endswith('?hour=dusk&clarity=soft&q=1&mode=tour&shot=5&ui=0') and st3['hour'] == 'dusk' and st3['clarity'] == 'soft' and st3['quality'] == '1' and st3['mode'] == 'tour' and st3['shot'] == 'hall' and st3['hidden'] is True, json.dumps(st3, ensure_ascii=False))
    page3.evaluate("() => window.__game.setQuality('0')"); page3.wait_for_timeout(8000)                  # 自动画质每 45 帧看一次，升一档要连续 4 次：8 秒足够它动手
    lv0 = page3.evaluate('() => [window.__game.stats().level, window.__game.settings.quality]')
    check('选了流畅档就停在流畅档：过 8 秒没有被自动画质偷偷升回去', lv0 == [0, '0'], str(lv0))
    ctx3.close()
    if logs3:
        logs.extend(logs3)
    ctx4, page4, logs4 = open_page(browser, query='?mode=free&nolock&hour=nope&q=9&t=abc', init="localStorage.removeItem('sunken-castle.settings.v1')")
    st4 = page4.evaluate(STATE)
    check('地址栏参数：直接潜泳、不锁鼠标；乱填的参数退回默认值', st4['mode'] == 'free' and st4['locked'] is False and st4['hour'] == 'afternoon' and st4['quality'] == 'auto' and st4['level'] == 2, json.dumps(st4, ensure_ascii=False))
    page4.set_viewport_size({'width': 900, 'height': 1500}); page4.wait_for_timeout(900)
    size = page4.evaluate("() => { const c = document.getElementById('view'), a = window.__game.stage.camera.aspect, s = window.__game.stage.scene.getObjectByName('snow').material.uniforms.uProj.value; return [c.clientWidth, c.clientHeight, c.width, c.height, +a.toFixed(3), Number.isFinite(s) && s > 0]; }")
    check('窗口改成竖的：画布的绘制缓冲、镜头的宽高比、悬浮物的投影都跟着变', size[0] == 900 and size[1] == 1500 and size[2] == 900 and size[3] == 1500 and size[4] == 0.6 and size[5], str(size))
    ctx4.close()
    if logs4:
        logs.extend(logs4)

    # ── 手机（触屏）──
    ctx5, page5, logs5 = open_page(browser, size=(844, 390), mobile=True, scale=2, init="localStorage.removeItem('sunken-castle.settings.v1')")
    check('手机：标题排得下', page5.evaluate("() => { const b = document.querySelector('#title .menu').getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight; }"))
    shot(page5, '8-m-title', 2000)
    page5.tap('#title [data-act="free"]'); page5.wait_for_timeout(1200)
    st5 = page5.evaluate(STATE)
    check('手机：点“自由潜泳”出摇杆和按键', st5['mode'] == 'free' and not hidden(page5, '#touch') and not hidden(page5, '#hud') and st5['locked'] is False, json.dumps(st5, ensure_ascii=False))
    stick = page5.evaluate("() => { const r = document.getElementById('stick').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    cdp = ctx5.new_cdp_session(page5)                                           # 真的按下去、停一会儿、再抬起来（合成的指针事件没有活动的指针）
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': stick[0] + 50, 'y': stick[1] - 10}]})
    page5.wait_for_timeout(300)
    s1 = page5.evaluate('() => window.__game.swim.state.stick')
    p5a = page5.evaluate(STATE)['pos']
    page5.wait_for_timeout(1300)
    p5b = page5.evaluate(STATE)['pos']
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    page5.wait_for_timeout(200)
    check('手机：推摇杆就游', s1[0] > 0.5 and s1[1] > 0.05 and dist(p5a, p5b) > 0.8 and page5.evaluate('() => window.__game.swim.state.stick') == [0, 0], f'摇杆 {s1}，游了 {dist(p5a, p5b):.1f} 米')
    pad = "([k, type]) => { const b = document.querySelector(`#touch .pad button[data-key=${k}]`); b.dispatchEvent(new PointerEvent(type, { pointerId: 9, bubbles: true })); }"
    page5.evaluate(pad, ['up', 'pointerdown']); page5.wait_for_timeout(150)
    up = page5.evaluate('() => window.__game.swim.state.vert')
    page5.evaluate(pad, ['up', 'pointerup']); page5.evaluate(pad, ['boost', 'pointerdown']); page5.wait_for_timeout(150)
    boost = page5.evaluate('() => [window.__game.swim.state.tBoost, document.querySelector("#touch .pad button[data-key=boost]").classList.contains("on")]')
    page5.evaluate(pad, ['boost', 'pointerup'])
    check('手机：▲ 上升、“疾游”加速', up == 1 and boost[0] is True and boost[1] is True, f'升降 {up}，疾游 {boost}')
    look0 = page5.evaluate('() => window.__game.swim.state.yaw')
    page5.evaluate("() => { const v = document.getElementById('view'); v.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, pointerType: 'touch', clientX: 600, clientY: 200 })); v.dispatchEvent(new PointerEvent('pointermove', { pointerId: 3, pointerType: 'touch', clientX: 420, clientY: 200 })); v.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, pointerType: 'touch' })); }")
    page5.wait_for_timeout(200)
    check('手机：拖着看', page5.evaluate('() => window.__game.swim.state.yaw') > look0 + 0.5)
    shot(page5, '9-m-free', 900)
    ctx5.close()
    if logs5:
        logs.extend(logs5)
    browser.close()

# 界面总图
if shots:
    tw = 800
    th = round(tw * 9 / 16)
    cols = 3
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 26) + 6), (14, 16, 20))
    d = ImageDraw.Draw(sheet)
    for i, (name, f) in enumerate(shots):
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
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
