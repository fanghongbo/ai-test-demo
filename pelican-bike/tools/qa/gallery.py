"""README 运行截图 → docs/gallery/*.jpg（桌面 1280×720，手机 390×844 @2x）。
每一张都是用 URL 参数直接打开正式页面（file://，与双击 index.html 同一条路径）后截取的，同样的参数可以复现。
依赖与 app_check.py 相同（Python 3、Pillow、Playwright 及其 Edge 通道）。用法：python tools/qa/gallery.py"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT / 'docs' / 'gallery'
TMP = ROOT / 'shots' / 'gallery'
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS, RENDERER_JS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

BASE = (ROOT / 'index.html').as_uri()
RIDE = 'intro=0&freeze=1&target=15'          # 直接进入骑行、停掉实时循环（下面的 settle 把仿真推进到稳定状态再截）
CLEAN = '&ui=0'                               # 只留画面（电影黑边保留，界面隐藏）
RIDE_5S = '__ride.settle(300)'
TOAST_MS = 5300                               # 等首次骑行的提示条自己淡出（4.8 s + 0.3 s）
OPEN_SETTINGS = "(() => { document.getElementById('btnSettings').click(); const d = document.getElementById('settings'); d.scrollTop = d.scrollHeight; })()"   # 滚到底：露出「电影画质」三个开关
DESK, PHONE = (1280, 720), (390, 844)

# (文件名, URL 参数, 截图前执行的 JS, 视口, 设备像素比, 执行后额外等待的毫秒数)
SHOTS = [
    ('01-ride-day', RIDE + '&hour=15.4', RIDE_5S, DESK, 1, TOAST_MS),
    ('02-side-sunset', RIDE + '&hour=18.2&s=480&cam=side' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('03-close-up', RIDE + '&hour=16.5&s=480&cam=close' + CLEAN, '__ride.settle(330)', DESK, 1, 200),   # 330 帧：鹈鹕正好侧脸（它每隔几秒会看一眼镜头）
    ('04-close-up-sunset', RIDE + '&hour=18.2&s=640&cam=close' + CLEAN, '__ride.settle(380)', DESK, 1, 200),
    ('05-night', RIDE + '&hour=22&s=640' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('06-dawn', RIDE + '&hour=6.5&s=640' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('07-orbit', RIDE + '&hour=16.5&s=480&cam=orbit' + CLEAN, '__ride.settle(400)', DESK, 1, 200),
    ('08-style-real', RIDE + '&hour=15.4&s=480&cam=side&style=0' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('09-style-cel', RIDE + '&hour=15.4&s=480&cam=side&style=1' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('10-style-hatch', RIDE + '&hour=15.4&s=480&cam=side&style=2' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('11-style-ink', RIDE + '&hour=15.4&s=480&cam=side&style=3' + CLEAN, RIDE_5S, DESK, 1, 200),
    ('12-settings', RIDE + '&hour=16.5&s=480&cam=orbit', '__ride.settle(400); ' + OPEN_SETTINGS, DESK, 1, 900),
    ('13-mobile', RIDE + '&hour=15.4&s=480', RIDE_5S, PHONE, 2, TOAST_MS),
]

OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)
errors, renderer = [], None
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    contexts = {}
    for name, query, js, size, dpr, wait in SHOTS:
        if size not in contexts:
            phone = size == PHONE
            contexts[size] = browser.new_context(viewport={'width': size[0], 'height': size[1]}, device_scale_factor=dpr,
                                                 is_mobile=phone, has_touch=phone)
        page = contexts[size].new_page()
        page.on('pageerror', lambda e, name=name: errors.append(f'[{name}][pageerror] {e}'))
        page.on('console', lambda m, name=name: errors.append(f'[{name}][{m.type}] {m.text}') if m.type == 'error' else None)
        page.goto(BASE + '?' + query, wait_until='load', timeout=60 * 1000)
        page.wait_for_function('window.__sceneReady === true', timeout=60 * 1000)
        if renderer is None:
            renderer = page.evaluate(RENDERER_JS)
        page.evaluate(js)
        page.wait_for_timeout(wait)
        png = TMP / f'{name}.png'
        page.screenshot(path=str(png))
        page.close()
        im = Image.open(png).convert('RGB')
        jpg = OUT / f'{name}.jpg'
        im.save(jpg, quality=86, optimize=True)
        print(f'{name}.jpg  {im.width}×{im.height}  {jpg.stat().st_size // 1024} KB')
    browser.close()

for line in errors[:20]:
    print(line[:800])
for old in OUT.glob('*.jpg'):                  # 清掉改名后留下的旧图
    if old.stem not in {n for n, *_ in SHOTS}:
        old.unlink()
total = sum(f.stat().st_size for f in OUT.glob('*.jpg'))
print(f'{len(SHOTS)} 张 → {OUT.relative_to(ROOT)}（共 {total / 1024 / 1024:.1f} MB）；renderer: {renderer}')
sys.exit(1 if errors else 0)
