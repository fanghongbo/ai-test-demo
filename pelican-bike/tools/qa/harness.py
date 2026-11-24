"""QA 截图夹具：Playwright + 系统 Edge。一次启动，多张截图，收集 console / pageerror。"""
import json
import sys
import pathlib
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # Windows 控制台默认不是 UTF-8

ROOT = pathlib.Path(__file__).resolve().parents[2]
UA_FLAGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
RENDERER_JS = """() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2');
  if (!gl) return 'no-webgl2'; const i = gl.getExtension('WEBGL_debug_renderer_info');
  return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : 'unknown'; }"""
SETTLE_JS = 'window.__ride && __ride.settle && __ride.settle()'


def run(url, shots, out_dir, viewport=(1280, 720), headed=False, gpu=True, timeout=60):
    """shots: [{name, js?, wait_ms?, settle?, size?}] → 结果字典（同时写 last-run.json）"""
    out = pathlib.Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    logs = []
    renderer = None
    stats = None
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=not headed, args=(UA_FLAGS if gpu else ['--enable-unsafe-swiftshader']))
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
            f = out / f'{s["name"]}.png'
            page.screenshot(path=str(f))
            results.append({'name': s['name'], 'file': str(f)})
        try:
            stats = page.evaluate('window.__ride && __ride.stats ? __ride.stats() : null')
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
