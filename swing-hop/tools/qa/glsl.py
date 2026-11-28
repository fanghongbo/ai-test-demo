"""启动诊断：实时收集页面的 console 输出和着色器编译错误（three 把 GLSL 日志用 console.error 打出来）。
主线程被卡住时 page.evaluate 不会返回，所以日志靠事件回调攒在 Python 这边，另有看门狗兜底。
python tools/qa/glsl.py [--query "a=1&b=2"] [--all] [--wait 800]      退出码：0 没有错误；1 有；2 看门狗超时（页面卡死）。"""
import argparse
import os
import pathlib
import sys
import threading

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from harness import UA_FLAGS, launch  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--query', default='')
ap.add_argument('--all', action='store_true', help='连 log / warning 一起打印')
ap.add_argument('--wait', type=int, default=800, help='场景就绪后再等多久（毫秒）')
ap.add_argument('--limit', type=int, default=2600)
ap.add_argument('--timeout', type=int, default=45, help='看门狗（秒）')
a = ap.parse_args()
url = (ROOT / 'index.html').as_uri() + (('?' + a.query) if a.query else '')
logs = []                                                   # [kind, text]，按到达顺序


def watchdog():
    print(f'!! 看门狗：{a.timeout} 秒内没有跑完，页面主线程多半卡死了。已收到的日志：')
    for kind, msg in logs[-14:]:
        print(f'[{kind}] {msg[: a.limit]}')
    sys.stdout.flush()
    os._exit(2)


threading.Timer(a.timeout, watchdog).start()
with sync_playwright() as p:
    b = launch(p, args=UA_FLAGS)
    page = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1).new_page()
    page.on('console', lambda m: logs.append((m.type, m.text)))
    page.on('pageerror', lambda e: logs.append(('pageerror', str(e))))
    try:
        page.goto(url, timeout=20_000)
        page.wait_for_function('window.__sceneReady === true', timeout=a.timeout * 1000 - 8000)
        ready = True
    except Exception as e:  # noqa: BLE001
        ready = False
        print('scene not ready:', str(e)[:160])
    if ready:
        page.wait_for_timeout(a.wait)
    try:
        b.close()
    except Exception:
        pass
err = [l for l in logs if l[0] in ('error', 'pageerror', 'warning', 'warn')]
print(f'ready={ready}  logs={len(logs)}  errors/warnings={len(err)}')
shown = 0
for kind, msg in logs:
    if kind == 'log' and not a.all:
        continue
    print(f'[{kind}] {msg[: a.limit]}')
    shown += 1
    if shown >= (8 if not a.all else 80):
        break
bad = any(l[0] in ('error', 'pageerror') for l in logs)
sys.stdout.flush()
os._exit(1 if bad else 0)
