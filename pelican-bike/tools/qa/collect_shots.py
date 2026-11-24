"""整理证据截图到 docs/screenshots/（JPEG，体积小）。
依赖 app_check.py / mobile_shots.py / world_shots.py 已经跑过（它们把图写在 shots/ 下）；
跃鱼序列与夜景POV 在这里用正式页面现拍。用法：python tools/qa/collect_shots.py"""
import pathlib
import sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SHOTS = ROOT / 'shots'
OUT = ROOT / 'docs' / 'screenshots'
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob('*.jpg'):
    old.unlink()

# (源文件, 输出名)
COPIES = [
    ('app/desk_intro.png', '01-intro-desktop'),
    ('app/desk_final.png', '02-ride-follow'),
    ('app/desk_cam_side.png', '03-camera-side-tracking'),
    ('app/desk_cam_orbit.png', '04-camera-orbit'),
    ('app/desk_cam_close.png', '05-camera-close-up'),
    ('app/desk_cam_director_a.png', '06-camera-director-tripod'),
    ('app/desk_cam_director_b.png', '07-camera-director-top-down'),
    ('app/desk_tod_sunset.png', '08-time-sunset'),
    ('app/desk_tod_night_follow.png', '09-time-night-lamps'),
    ('app/desk_tod_dawn.png', '10-time-dawn'),
    ('app/desk_style_cel.png', '11-style-cel'),
    ('app/desk_style_hatch.png', '12-style-hatch'),
    ('app/desk_style_ink.png', '13-style-ink'),
    ('app/desk_inspect.png', '14-inspector-skeleton'),
    ('app/desk_settings_sculpt.png', '15-settings-sculpting'),
    ('app/desk_help.png', '16-help-dialog'),
    ('app/mob_portrait_ride.png', '18-mobile-portrait'),
    ('app/mob_landscape_ride.png', '19-mobile-landscape'),
    ('app/mob_landscape_intro.png', '20-mobile-landscape-intro'),
    ('world/overview.png', '21-island-overview'),
    ('world/lighthouse.png', '22-lighthouse'),
    ('world/pier.png', '23-pier'),
    ('skillcap/default.png', '24-skill-capture-default'),
    ('app/desk_real_night.png', '26-real-night-lamps'),
    ('app/desk_film_off.png', '27-real-film-options-off'),
    ('app/mob_portrait_settings.png', '28-mobile-portrait-settings'),
]


def save(src, name, max_w=1280):
    im = Image.open(SHOTS / src).convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.jpg', quality=86, optimize=True)
    return name


done = []
for src, name in COPIES:
    if name in done:
        continue
    if (SHOTS / src).exists():
        done.append(save(src, name))
    else:
        print('missing:', src)

# 现拍：鹈鹕视角（夜景）与跃鱼序列
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = browser.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    page.goto((ROOT / 'index.html').as_uri() + '?intro=0&freeze=1&hour=22&target=12&ui=0')
    page.wait_for_function('window.__sceneReady === true')
    page.evaluate("__ride.cam('pov'); __ride.settle(120)")
    page.screenshot(path=str(SHOTS / 'app' / 'final_pov.png'))
    done.append(save('app/final_pov.png', '17-camera-pelican-pov'))
    page.goto((ROOT / 'index.html').as_uri() + '?intro=0&freeze=1&hour=16.5&ui=0')
    page.wait_for_function('window.__sceneReady === true')
    page.evaluate("(() => { const w = __ride.world; const pt = w.randomSeaPoint(__ride.state().s + 10); window.__f = w.fishJump(pt); window.__p0 = pt.toArray(); })()")
    for i, n in enumerate([14, 20, 16, 20]):
        page.evaluate(f'__ride.settle({n})')
        page.evaluate("""(() => { const c = __ride.stage.camera, p0 = window.__p0;
          c.position.set(p0[0] - 7, 2.6, p0[2] - 7); c.lookAt(p0[0], 0.8, p0[2]); c.fov = 40; c.updateProjectionMatrix(); __ride.stage.syncCameraUniforms(); __ride.world.renderReflection(__ride.stage.scene, c); __ride.stage.render(() => __ride.postfx.render(0)); })()""")
        page.screenshot(path=str(SHOTS / 'app' / f'final_fish_{i}.png'))
    browser.close()
ims = [Image.open(SHOTS / 'app' / f'final_fish_{i}.png').convert('RGB') for i in range(4)]
sheet = Image.new('RGB', (1280, 720), (24, 24, 28))
for i, im in enumerate(ims):
    sheet.paste(im.resize((640, 360), Image.LANCZOS), ((i % 2) * 640, (i // 2) * 360))
sheet.save(OUT / '25-fish-jump-sequence.jpg', quality=86, optimize=True)
done.append('25-fish-jump-sequence')

total = sum(f.stat().st_size for f in OUT.glob('*.jpg'))
print(f'{len(done)} 张 → {OUT}（共 {total / 1024 / 1024:.1f} MB）')
