"""写实画风每帧耗时的拆解：逐个关掉后期链 / 倒影 / 阴影更新，看各项占多少。
python tools/qa/perf_breakdown.py [quality=2] [w=1280] [h=720]"""
import pathlib
import sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright  # noqa: E402
from harness import UA_FLAGS, ROOT  # noqa: E402

q = int(sys.argv[1]) if len(sys.argv) > 1 else 2
W, H = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (1280, 720)
MEASURE = """(n) => { const gl = __ride.stage.renderer.getContext(), px = new Uint8Array(4), t0 = performance.now();
  for (let i = 0; i < n; i++) { __ride.step(1 / 60); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
  return +((performance.now() - t0) / n).toFixed(2); }"""
with sync_playwright() as p:
    b = p.chromium.launch(channel='msedge', headless=True, args=UA_FLAGS)
    page = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1).new_page()
    page.goto((ROOT / 'index.html').as_uri() + f'?intro=0&freeze=1&target=12&quality={q}', wait_until='load')
    page.wait_for_function('window.__sceneReady === true', timeout=60_000)
    page.evaluate('__ride.settle(60)')
    m = lambda js='': page.evaluate(MEASURE, 30) if not js else page.evaluate(f'({js}, {MEASURE})(… )') if False else (page.evaluate(js), page.evaluate(MEASURE, 30))[1]
    base = m()
    rows = [('全开', base)]
    rows.append(('不更新倒影', m('__ride.world.sea.uniforms.uHasRefl.value = 0; __ride.step()')))
    rows.append(('+ 关景深', m('__ride.postfx.dof.enabled = false')))
    rows.append(('+ 关遮蔽', m('__ride.postfx.gtao.enabled = false')))
    rows.append(('+ 关辉光', m('__ride.postfx.bloom.enabled = false')))
    rows.append(('+ 阴影只画一次 / 帧', m('__ride.stage.renderer.shadowMap.autoUpdate = false; __ride.stage.renderer.shadowMap.needsUpdate = true')))
    rows.append(('+ 赛璐璐材质（同一套场景，不做后期）', m('__ride.style(1)')))
    for name, v in rows:
        print(f'{name:34s} {v:6.2f} ms')
    print('stats', page.evaluate('({ calls: __ride.stats().calls, tris: __ride.stats().triangles, programs: __ride.stage.renderer.info.programs.length, geoms: __ride.stage.renderer.info.memory.geometries, tex: __ride.stage.renderer.info.memory.textures })'))
    b.close()
