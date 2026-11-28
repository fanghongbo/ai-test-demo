"""在真实窗口里打开一次（不是无头）：系统 Edge 弹出一个 1600 × 900 的窗口，用真实的按键按回车开始巡游、按 T 下水游两秒，
截图、量帧间隔，然后关掉。无头模式毕竟不是人看到的样子：这里确认的是真实的窗口里能起来、能玩、控制台是干净的。

  python tools/qa/real_window.py [--out shots/real]
"""
import argparse
import json
import pathlib
import sys
import time

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import launch, open_page  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--out', default='shots/real')
ap.add_argument('--width', type=int, default=1600)
a = ap.parse_args()
OUT = pathlib.Path(a.out)
OUT.mkdir(parents=True, exist_ok=True)

# 4 秒里的帧间隔（requestAnimationFrame）：个数、中位数、一成、九成。再让显卡同步着画 30 帧，量单帧耗时
FRAMES = """async () => {
  const gaps = []; let last = performance.now(); const t0 = last;
  await new Promise((done) => { const tick = (t) => { gaps.push(t - last); last = t; if (t - t0 < 4000) requestAnimationFrame(tick); else done(); }; requestAnimationFrame(tick); });
  gaps.sort((x, y) => x - y);
  const q = (k) => +gaps[Math.min(gaps.length - 1, (gaps.length * k) | 0)].toFixed(1);
  return { frames: gaps.length, median: q(0.5), p10: q(0.1), p90: q(0.9), ms: +window.__game.measure(30).toFixed(2), level: window.__game.stats().level };
}"""

result = {}
with sync_playwright() as p:
    browser = launch(p, headless=False)
    t0 = time.time()
    ctx, page, logs = open_page(browser, query='?nolock', size=(a.width, 900))
    result['toSceneReady_s'] = round(time.time() - t0, 1)
    page.wait_for_timeout(1500)
    page.screenshot(path=str(OUT / 'title.jpg'), type='jpeg', quality=88)
    page.keyboard.press('Enter')                                                   # 真实的按键：开始巡游
    page.wait_for_timeout(6000)
    result['tour'] = page.evaluate(FRAMES)
    page.screenshot(path=str(OUT / 'tour.jpg'), type='jpeg', quality=88)
    result['tourState'] = page.evaluate('() => { const s = window.__game.state(); return { mode: s.mode, shot: s.shot, quality: s.quality, level: s.level, hour: s.hour, clarity: s.clarity }; }')
    page.keyboard.press('KeyT')                                                    # 巡游换潜泳，镜头留在原地
    page.wait_for_timeout(1200)
    page.keyboard.down('KeyW')
    page.wait_for_timeout(2000)
    page.keyboard.up('KeyW')
    result['free'] = page.evaluate(FRAMES)
    page.screenshot(path=str(OUT / 'free.jpg'), type='jpeg', quality=88)
    result['freeState'] = page.evaluate('() => { const s = window.__game.state(); return { mode: s.mode, pos: s.pos.map((v) => +v.toFixed(1)) }; }')
    result['viewport'] = page.evaluate('() => [innerWidth, innerHeight, devicePixelRatio]')
    result['console'] = logs
    ctx.close()
    browser.close()
(OUT / 'last-run.json').write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding='utf-8')
print(json.dumps(result, ensure_ascii=False, indent=1))
sys.exit(1 if any(l.startswith(('[pageerror]', '[error]')) for l in logs) else 0)
