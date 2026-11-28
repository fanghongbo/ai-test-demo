"""画面检查：每个时刻 × 每种水质的标题画面、全部巡游镜头、王座厅里的五个时刻、手机上的两屏，逐帧量亮度分布。
查的是“整帧画错了”：黑屏（着色器里出了 NaN 多半就是这样）、一片死白（曝光炸了）、没有细节（一片纯色）、偏色。
  python tools/qa/pixel_check.py [--out shots/pixel] [--quick]
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
TIMES = ['morning', 'noon', 'afternoon', 'dusk', 'night']
CLARITY = ['crystal', 'clear', 'soft', 'hazy']
rows, bad, logs = [], [], []


def grab(page, name, ms=1500):
    page.wait_for_timeout(ms)
    img = Image.open(io.BytesIO(page.screenshot(type='png'))).convert('RGB').resize((640, 360), Image.LANCZOS)
    x = np.asarray(img).astype(np.float32) / 255
    lum = x[..., 0] * 0.2126 + x[..., 1] * 0.7152 + x[..., 2] * 0.0722
    st = page.evaluate('() => window.__game.state()')
    far = float(lum[:72, 128:512].mean())                                                  # 画面上方中间那一条：多半是远处的海水
    r = {'name': name, 'mean': float(lum.mean()), 'far': far, 'std': float(lum.std()), 'p01': float(np.percentile(lum, 1)), 'p99': float(np.percentile(lum, 99)),
         'black': float((lum < 3 / 255).mean()), 'white': float((lum > 250 / 255).mean()), 'rgb': [float(x[..., c].mean()) for c in range(3)], 'mode': st['mode'], 'shot': st['shot']}
    rows.append(r)
    img.save(OUT / f'{name}.jpg', quality=86)
    why = []
    if r['std'] < 0.015:
        why.append(f'几乎没有明暗变化（标准差 {r["std"]:.3f}）：一片纯色')
    if r['mean'] < 0.015 or r['black'] > 0.6:
        why.append(f'太黑（平均亮度 {r["mean"]:.3f}，纯黑占 {r["black"] * 100:.0f}%）')
    if r['mean'] > 0.9 or r['white'] > 0.03:
        why.append(f'过曝（平均亮度 {r["mean"]:.3f}，纯白占 {r["white"] * 100:.1f}%）')
    if r['rgb'][2] < r['rgb'][0] * 0.8:
        why.append(f'不偏蓝：rgb {[round(v, 3) for v in r["rgb"]]}')
    if name.startswith('title') and st['hour'] in ('morning', 'noon', 'afternoon') and r['mean'] < 0.07:
        why.append(f'白天太暗：平均亮度 {r["mean"]:.3f}')
    if name.startswith('tour') and r['mean'] < 0.05:
        why.append(f'巡游镜头太暗：平均亮度 {r["mean"]:.3f}')
    r['why'] = why
    if why:
        bad.append(name)
    print(f"  {name:26s} 平均 {r['mean']:.3f}  远处 {r['far']:.3f}  标准差 {r['std']:.3f}  1%..99% {r['p01']:.3f}..{r['p99']:.3f}  纯黑 {r['black'] * 100:3.0f}%  纯白 {r['white'] * 100:.1f}%  rgb {[round(v, 2) for v in r['rgb']]}  {'OK' if not why else '问题：' + '；'.join(why)}", flush=True)


t0 = time.time()
with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, l1 = open_page(browser, size=(1280, 720), init="localStorage.setItem('sunken-castle.settings.v1', JSON.stringify({ quality: '2' }))")
    logs += l1
    print(f'启动 {time.time() - t0:.1f} 秒')
    for hour in TIMES:
        page.evaluate("(h) => window.__game.setTime(h)", hour)
        for cl in CLARITY:
            page.evaluate("(c) => window.__game.setClarity(c)", cl)
            grab(page, f'title-{hour}-{cl}', 2600)                                                  # 等眼睛适应曝光稳定下来
    page.evaluate("() => { window.__game.setTime('afternoon'); window.__game.setClarity('clear'); }")
    page.evaluate('() => window.__game.setMode("tour")')
    shots = page.evaluate('() => window.__game.SHOTS.map((s) => s.id)')
    for i, sid in enumerate(shots):
        page.evaluate("(i) => window.__game.jumpShot(i)", i)
        grab(page, f'tour-{i:02d}-{sid}', 1900)
    for hour in TIMES:
        page.evaluate("(h) => window.__game.setTime(h)", hour)
        page.evaluate('() => window.__game.jumpShot(5)')
        grab(page, f'hall-{hour}', 2400)
    ctx.close()
    ctx2, page2, l2 = open_page(browser, size=(844, 390), mobile=True, scale=2, init="localStorage.setItem('sunken-castle.settings.v1', JSON.stringify({ quality: '2' }))")
    logs += l2
    grab(page2, 'mobile-title', 1200)
    page2.tap('#title [data-act="free"]')
    grab(page2, 'mobile-free', 1800)
    ctx2.close()
    browser.close()

# 时刻之间确实不一样：白天越晚不一定越暗，但夜里一定比午后暗，朦胧一定比透亮糊（远处更亮、对比更低）
by = {r['name']: r for r in rows}
if by['title-night-clear']['mean'] >= by['title-afternoon-clear']['mean']:
    bad.append('title-night-clear'); print('  夜晚不比午后暗')
if by['title-afternoon-hazy']['std'] >= by['title-afternoon-crystal']['std']:
    bad.append('title-afternoon-hazy'); print('  朦胧的水不比透亮的水糊（标准差没有变小）')
if by['title-afternoon-hazy']['far'] < by['title-afternoon-crystal']['far'] * 0.9:
    print('  （水越浑，远处的海水并没有更亮：浑浊主要表现为变暗、变糊）')

# 总图
cols = 6
tw, th = 320, 180
sheet = Image.new('RGB', (cols * (tw + 4) + 4, ((len(rows) + cols - 1) // cols) * (th + 18) + 4), (10, 10, 12))
d = ImageDraw.Draw(sheet)
for i, r in enumerate(rows):
    x, y = 4 + (i % cols) * (tw + 4), 4 + (i // cols) * (th + 18)
    sheet.paste(Image.open(OUT / f"{r['name']}.jpg").resize((tw, th), Image.LANCZOS), (x, y + 14))
    d.text((x + 2, y + 2), r['name'][:44], fill=(230, 90, 90) if r['why'] else (200, 220, 230))
sheet.save(OUT / '_sheet.jpg', quality=84)

errs = [l for l in logs if l.startswith(('[pageerror]', '[error]'))]
print('console:', ' | '.join(errs[:5]) if errs else '干净')
print(f'{len(rows)} 帧，{len(set(bad))} 帧有问题；总图 {OUT / "_sheet.jpg"}')
print('PIXEL OK' if not bad and not errs else 'PIXEL PROBLEM')
sys.exit(1 if bad or errs else 0)
