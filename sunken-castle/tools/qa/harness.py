"""QA 夹具：Playwright + 系统 Edge 的启动、进程调度、一次启动多张截图、收集 console / pageerror。"""
import base64
import ctypes
import json
import pathlib
import subprocess
import sys
import time
from ctypes import wintypes
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # Windows 控制台默认不是 UTF-8

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA_FLAGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
RENDERER_JS = """() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2');
  if (!gl) return 'no-webgl2'; const i = gl.getExtension('WEBGL_debug_renderer_info');
  return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : 'unknown'; }"""
SETTLE_JS = 'window.__game && window.__game.measure ? window.__game.measure(2) : null'      # 同步画两帧：让着色器编译、阴影贴图更新都做完再截图
BASE = (ROOT / 'index.html').as_uri()
AUDIO_FLAG = '--autoplay-policy=no-user-gesture-required'                 # 自动化里没有真实的点击，让 AudioContext 直接起来


def open_page(browser, query='', size=(1280, 720), init=None, mobile=False, scale=1, timeout=120):
    """开一个页面，等到场景就绪（window.__sceneReady）。返回 (ctx, page, logs)。

    logs 里是 console 的 error / warning 和没接住的异常。init 是开页面之前先执行的脚本（比如往 localStorage 写设置）；
    mobile：触屏手机（有 touch、窄屏按手机排）
    """
    kw = {'viewport': {'width': size[0], 'height': size[1]}, 'device_scale_factor': scale}
    if mobile:
        kw.update({'has_touch': True, 'is_mobile': True})
    ctx = browser.new_context(**kw)
    if init:
        ctx.add_init_script(init)
    page = ctx.new_page()
    logs = []
    page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto(BASE + query, wait_until='load', timeout=timeout * 1000)
    page.wait_for_function('window.__sceneReady === true', timeout=timeout * 1000)
    return ctx, page, logs


_PS = r"""
$ProgressPreference = 'SilentlyContinue'
Get-CimInstance Win32_Processor | ForEach-Object { 'cpu|{0}|{1}' -f [int]$_.NumberOfCores, [int]$_.NumberOfLogicalProcessors }
Get-CimInstance Win32_Process -Filter "Name='msedge.exe' OR Name='chrome.exe' OR Name='headless_shell.exe'" |
  Where-Object { $_.CommandLine -like '*playwright_chromiumdev_profile*' } | ForEach-Object { 'proc|{0}' -f $_.ProcessId }
"""


def _browser_processes():
    """(性能核的亲和掩码, Playwright 启动的浏览器的 pid)：只列命令行里带着 Playwright 建的临时用户目录的进程，不碰用户自己开着的浏览器"""
    if sys.platform != 'win32':
        return 0, []
    enc = base64.b64encode(_PS.encode('utf-16-le')).decode()
    out = subprocess.run(['powershell', '-NoProfile', '-NonInteractive', '-EncodedCommand', enc], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    cores = logical = 0
    pids = []
    for line in out.splitlines():
        f = line.strip().split('|')
        if f[0] == 'cpu' and len(f) == 3:
            cores, logical = cores + int(f[1]), logical + int(f[2])
        elif f[0] == 'proc' and len(f) == 2:
            pids.append(int(f[1]))
    extra = logical - cores                                  # 混合架构的 CPU 上，开了超线程的性能核每个多出一个逻辑处理器，而且排在前面
    n = 2 * extra if 0 < extra < logical else logical
    return ((1 << n) - 1 if n else 0), pids


def pin_browser():
    """把 Playwright 启动的浏览器进程钉到性能核、提到高优先级。返回改了几个进程（做不到时是 0）。

    混合架构的 CPU（这台机器是 6 个性能核 + 4 个能效核）上，Windows 有时会把无头的浏览器排到能效核：同一个包、同一帧，
    脚本侧的耗时从 5.5 毫秒变成 12 毫秒，按真实时间写的按键脚本也会错位。真实玩的时候浏览器在前台，本来就跑在性能核上，
    所以检查时统一钉过去，数字才稳。只在这里钉一次就够：之后浏览器自己起的子进程（渲染进程等）会继承亲和掩码。
    不要挪到页面加载之后去做：查进程要花三秒左右，会把脚本里按时间排好的步骤整体往后推。"""
    mask, pids = _browser_processes()
    if not pids:
        return 0
    k32 = ctypes.windll.kernel32
    k32.OpenProcess.restype = wintypes.HANDLE
    k32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    k32.SetProcessAffinityMask.argtypes = [wintypes.HANDLE, ctypes.c_size_t]
    k32.SetPriorityClass.argtypes = [wintypes.HANDLE, wintypes.DWORD]
    k32.CloseHandle.argtypes = [wintypes.HANDLE]
    done = 0
    for pid in pids:
        h = k32.OpenProcess(0x0200 | 0x1000, False, pid)               # PROCESS_SET_INFORMATION | PROCESS_QUERY_LIMITED_INFORMATION
        if not h:
            continue
        if mask:
            k32.SetProcessAffinityMask(h, mask)
        k32.SetPriorityClass(h, 0x00000080)                            # HIGH_PRIORITY_CLASS
        k32.CloseHandle(h)
        done += 1
    return done


def launch(p, headless=True, args=None):
    """启动系统 Edge，并把它的进程钉到性能核（见 pin_browser）"""
    browser = p.chromium.launch(channel='msedge', headless=headless, args=args or UA_FLAGS)
    time.sleep(0.4)                                                    # 等显卡进程、渲染进程这些子进程起来
    pin_browser()
    return browser


def run(url, shots, out_dir, viewport=(1280, 720), headed=False, gpu=True, timeout=60):
    """shots: [{name, js?, wait_ms?, settle?, size?}] → 结果字典（同时写 last-run.json）"""
    out = pathlib.Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    logs = []
    renderer = None
    stats = None
    with sync_playwright() as p:
        browser = launch(p, headless=not headed, args=(UA_FLAGS if gpu else ['--enable-unsafe-swiftshader']))
        ctx = browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, device_scale_factor=1)
        page = ctx.new_page()
        page.on('console', lambda m: logs.append(f'[{m.type}] {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
        page.on('pageerror', lambda e: logs.append('[stack] ' + ' | '.join(str(getattr(e, 'stack', '')).splitlines()[1:7])))
        page.goto(url, wait_until='load', timeout=timeout * 1000)
        try:
            page.wait_for_function('window.__sceneReady === true', timeout=timeout * 1000)
        except Exception as e:  # noqa: BLE001
            logs.append(f'[harness] __sceneReady timeout: {e}')
        try:
            renderer = page.evaluate(RENDERER_JS)
        except Exception as e:  # noqa: BLE001
            logs.append(f'[harness] renderer probe failed: {e}')
        for s in shots:
            if s.get('size'):
                page.set_viewport_size({'width': s['size'][0], 'height': s['size'][1]})
            if s.get('js'):
                try:
                    r = page.evaluate(s['js'])
                    if r is not None:
                        logs.append(f'[eval:{s["name"]}] {json.dumps(r, ensure_ascii=False)[:800]}')
                except Exception as e:  # noqa: BLE001
                    logs.append(f'[eval-error:{s["name"]}] {e}')
            page.wait_for_timeout(s.get('wait_ms', 400))
            if s.get('settle', True):
                try:
                    page.evaluate(SETTLE_JS)
                except Exception:  # noqa: BLE001
                    pass
                page.wait_for_timeout(s.get('settle_ms', 150))
            f = out / f'{s["name"]}.jpg'
            page.screenshot(path=str(f), type='jpeg', quality=90)
            results.append({'name': s['name'], 'file': str(f)})
        try:
            stats = page.evaluate('window.__game && window.__game.stats ? window.__game.stats() : null')
        except Exception:  # noqa: BLE001
            pass
        browser.close()
    meta = {'url': url, 'renderer': renderer, 'stats': stats, 'logs': logs, 'shots': results}
    (out / 'last-run.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding='utf-8')
    return meta


def report(meta, limit=40):
    print('renderer:', meta['renderer'])
    print('stats:', json.dumps(meta['stats'], ensure_ascii=False)[:500])
    for line in meta['logs'][:limit]:
        print(line[:900])
    print('shots:', ', '.join(s['file'] for s in meta['shots']))
    bad = [l for l in meta['logs'] if l.startswith(('[pageerror]', '[error]', '[harness]', '[eval-error'))]
    return 1 if bad else 0
