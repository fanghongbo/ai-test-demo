"""画面检查：标题、开局、蓄力、空中、玩到中段、狼追近、被抓、结算、掉进云海、手机横屏和竖屏，每个画面量两样东西。
一是把 HDR 场景缓冲读回来：不许有不是有限数的像素（着色器里出了 NaN 多半是这样露出来的），也不许亮得离谱；
二是整帧截图的亮度分布：查“整帧画错了”——黑屏、一片死白、没有细节。
另外量三件“画面有没有跟着规则走”的事：站着不动时云和树仍在动；狼追近时四角发紫；被抓那一下有白闪。

  python tools/qa/pixel_check.py [--out shots/pixel]
"""
import argparse
import io
import pathlib
import sys
import time

import numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--out', default='shots/pixel')
a = ap.parse_args()
OUT = pathlib.Path(a.out)
OUT.mkdir(parents=True, exist_ok=True)
STATE = '() => window.__game.state()'
rows, bad, logs, notes = [], [], [], []


def corner_tint(x):
    """四个角各取 1/8 × 1/8，算蓝和红的比：危险的时候四角被压成紫色，这个比会变大"""
    h, w = x.shape[:2]
    ch, cw = max(4, h // 8), max(4, w // 8)
    c = np.mean([x[r:r + ch, k:k + cw] for r, k in [(0, 0), (0, w - cw), (h - ch, 0), (h - ch, w - cw)]], axis=(0, 1, 2))
    return float(c[2] / max(c[0], 1e-4))


def frame(page, ms=0):
    page.wait_for_timeout(ms)
    img = Image.open(io.BytesIO(page.screenshot(type='png'))).convert('RGB')
    small = img.resize((640, round(640 * img.height / img.width)), Image.LANCZOS)
    return img, small, np.asarray(small).astype(np.float32) / 255


def grab(page, name, ms=900):
    img, small, x = frame(page, ms)
    lum = x[..., 0] * 0.2126 + x[..., 1] * 0.7152 + x[..., 2] * 0.0722
    nan = page.evaluate('() => window.__game.nanScan(480, 270)')
    st = page.evaluate(STATE)
    r = {'name': name, 'mean': float(lum.mean()), 'std': float(lum.std()), 'p01': float(np.percentile(lum, 1)), 'p99': float(np.percentile(lum, 99)),
         'black': float((lum < 3 / 255).mean()), 'white': float((lum > 250 / 255).mean()), 'rgb': [float(x[..., c].mean()) for c in range(3)],
         'nan': nan['bad'], 'hdrMax': nan['max'], 'tint': corner_tint(x), 'mode': st['mode'], 'state': st['state'], 'flash': st['flash'], 'size': list(img.size)}
    rows.append(r)
    img.save(OUT / f'{name}.jpg', quality=88)
    small.save(OUT / f'{name}-small.jpg', quality=86)
    why = []
    flashing = name == 'caught' and st['flash'] > 0.12                                  # 被抓那一下本来就是一记白闪
    if nan['bad']:
        why.append(f'HDR 缓冲里有 {nan["bad"]} 个不是有限数的像素')
    if nan['max'] > 64:
        why.append(f'有超过 64 的亮度（{nan["max"]}）：多半是发光发飞了')
    if r['std'] < 0.04 and not flashing:
        why.append(f'几乎没有明暗变化（标准差 {r["std"]:.3f}）：一片纯色')
    if r['mean'] < 0.12 or r['black'] > 0.25:
        why.append(f'太黑（平均亮度 {r["mean"]:.3f}，纯黑占 {r["black"] * 100:.0f}%）')
    if (r['mean'] > 0.88 or r['white'] > 0.12) and not flashing:
        why.append(f'过曝（平均亮度 {r["mean"]:.3f}，纯白占 {r["white"] * 100:.1f}%）')
    r['why'] = why
    if why:
        bad.append(name)
    extra = f'  四角蓝红比 {r["tint"]:.2f}' if name in ('mid', 'wolf') else (f'  白闪 {st["flash"]:.2f}' if name == 'caught' else '')
    print(f"  {name:14s} 平均 {r['mean']:.3f}  标准差 {r['std']:.3f}  1%..99% {r['p01']:.2f}..{r['p99']:.2f}  纯黑 {r['black'] * 100:3.0f}%  纯白 {r['white'] * 100:4.1f}%  rgb {[round(v, 2) for v in r['rgb']]}  坏像素 {nan['bad']}  最亮 {nan['max']:5.2f}{extra}  {'OK' if not why else '问题：' + '；'.join(why)}", flush=True)
    return x


def settle(page):
    """等这一下输入处理完、兔子落回秋千（或者掉下去）"""
    page.wait_for_function("() => window.__game.input().queued === 0 && window.__game.state().state !== 'air'", timeout=8000)


def to_air(page, ms=300):
    """让机器人起跳，兔子飞到一半时把规则停住（画面照常画）"""
    page.evaluate('() => window.__game.bot(true)')
    page.wait_for_function("() => window.__game.state().state === 'air'", timeout=15000)
    page.wait_for_timeout(ms)
    page.evaluate('() => { window.__game.freeze(true); window.__game.bot(false); }')


t0 = time.time()
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, l1 = open_page(browser, size=(1280, 720), query='?seed=5&q=2')
    logs += l1
    print(f'启动 {time.time() - t0:.1f} 秒')
    grab(page, 'title', 1800)

    page.evaluate('() => window.__game.retry(5)')
    a0 = grab(page, 'start', 1200)
    a1 = frame(page, 500)[2]
    moved = float(np.abs(a1 - a0).mean())
    print(f'  站着不动的时候画面也在动（云在飘、树在晃、兔子在喘气）：隔 0.5 秒的两帧平均相差 {moved:.4f}')
    if moved < 0.002:
        bad.append('idle')
        print('  问题：站着不动的时候画面是死的')

    page.evaluate('() => window.__game.press()')
    grab(page, 'charge', 450)
    page.evaluate('() => window.__game.release()')
    settle(page)

    page.evaluate('() => window.__game.retry(5)')
    page.wait_for_timeout(500)
    to_air(page)
    grab(page, 'air', 250)
    page.evaluate('() => window.__game.freeze(false)')
    settle(page)

    page.evaluate("() => window.__game.warp(16, { wolf: 26 })")
    grab(page, 'mid', 1600)
    page.evaluate("() => window.__game.warp(34, { wolf: 30 })")
    grab(page, 'far', 1600)

    # 狼追近：找一座会晃、不裂缝的秋千站着等它
    n = page.evaluate("() => { const c = window.__game.course(); c.ensure(80); return c.nodes.findIndex((nd, i) => i >= 18 && nd.swing.kind !== 'cracked' && nd.swing.amp > 0); }")
    page.evaluate("(i) => window.__game.warp(i, { wolf: 6 })", n)
    grab(page, 'wolf', 900)
    page.wait_for_function("() => window.__game.state().mode === 'over'", timeout=15000)
    page.evaluate('() => window.__game.freeze(true)')                                   # 白闪只亮零点几秒：规则一停，闪就定住了
    grab(page, 'caught', 60)
    page.evaluate('() => window.__game.freeze(false)')
    page.wait_for_function("() => !document.getElementById('over').hidden", timeout=12000)
    grab(page, 'over', 500)

    page.evaluate('() => window.__game.retry(5)')
    page.wait_for_timeout(400)
    page.evaluate('() => window.__game.pressFor(0.05)')
    page.wait_for_function("() => window.__game.state().state === 'fall' || window.__game.state().mode === 'over'", timeout=8000)
    grab(page, 'fall', 350)
    ctx.close()

    ctx2, page2, l2 = open_page(browser, size=(844, 390), mobile=True, scale=2, query='?seed=5&q=1')
    logs += l2
    grab(page2, 'mobile-title', 1500)
    page2.tap('#title [data-act="start"]')
    grab(page2, 'mobile-play', 1200)
    ctx2.close()

    ctx3, page3, l3 = open_page(browser, size=(390, 844), mobile=True, scale=2, query='?seed=5&q=1')
    logs += l3
    grab(page3, 'portrait-title', 1500)
    page3.tap('#title [data-act="start"]')
    grab(page3, 'portrait-play', 1200)
    ctx3.close()
    browser.close()

by = {r['name']: r for r in rows}
if 'wolf' in by and 'mid' in by:
    gain = by['wolf']['tint'] / by['mid']['tint']
    print(f"  狼追近时四角发紫：蓝红比从 {by['mid']['tint']:.2f} 变成 {by['wolf']['tint']:.2f}（{gain:.2f} 倍）")
    if gain < 1.06:
        bad.append('danger-tint')
        print('  问题：狼追近了，画面四角没有变紫')
if 'caught' in by and by['caught']['flash'] > 0.12 and 'wolf' in by:
    rose = by['caught']['mean'] - by['wolf']['mean']
    print(f"  被抓那一下的白闪：平均亮度从 {by['wolf']['mean']:.3f} 升到 {by['caught']['mean']:.3f}")
    if rose < 0.2:
        bad.append('flash')
        print('  问题：被抓的时候画面没有闪白')
elif 'caught' in by:
    notes.append(f"被抓那一帧截到时白闪已经散了（{by['caught']['flash']:.2f}），这一项没量到")

# 总图
cols = 5
tw, th = 300, 169
sheet = Image.new('RGB', (cols * (tw + 4) + 4, ((len(rows) + cols - 1) // cols) * (th + 18) + 4), (10, 10, 12))
d = ImageDraw.Draw(sheet)
for i, r in enumerate(rows):
    x, y = 4 + (i % cols) * (tw + 4), 4 + (i // cols) * (th + 18)
    im = Image.open(OUT / f"{r['name']}-small.jpg")
    k = min(tw / im.width, th / im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    sheet.paste(im, (x + (tw - im.width) // 2, y + 14 + (th - im.height) // 2))
    d.text((x + 2, y + 2), f"{r['name']} {r['size'][0]}x{r['size'][1]}"[:46], fill=(230, 90, 90) if r['why'] else (200, 220, 230))
sheet.save(OUT / '_sheet.jpg', quality=84)

errs = [l for l in logs if l.startswith(('[pageerror]', '[error]'))]
print('console:', ' | '.join(errs[:5]) if errs else '干净')
for n_ in notes:
    print('  ', n_)
print(f'{len(rows)} 帧，{len(set(bad))} 项有问题；总图 {OUT / "_sheet.jpg"}')
print('PIXEL OK' if not bad and not errs else 'PIXEL PROBLEM')
sys.exit(1 if bad or errs else 0)
