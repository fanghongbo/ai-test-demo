"""Dump a render target of the page to a PNG so it can be looked at directly (caustics, light shafts, the reflection…).

  python tools/qa/dump_tex.py "<js returning a THREE.RenderTarget or Texture>" out.png [--js "<setup>"] [--gray]
"""
import base64
import pathlib
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import launch  # noqa: E402

args = sys.argv[1:]
expr, out = args[0], args[1]
setup = args[args.index('--js') + 1] if '--js' in args else ''
with sync_playwright() as p:
    b = launch(p)
    ctx = b.new_context(viewport={'width': 800, 'height': 450}, device_scale_factor=1)
    page = ctx.new_page()
    logs = []
    page.on('pageerror', lambda e: logs.append(f'[pageerror] {e}'))
    page.goto(BASE, wait_until='load')
    page.wait_for_function('window.__sceneReady === true', timeout=120000)
    page.wait_for_timeout(1200)
    if setup:
        print('setup:', page.evaluate(setup))
        page.wait_for_timeout(600)
    url = page.evaluate("""(expr) => { const g = window.__game, T = g.THREE, r = g.stage.renderer, obj = (0, eval)(expr);
      const tex = obj.isWebGLRenderTarget ? obj.texture : obj, w = tex.image.width, h = tex.image.height;
      const rt = new T.WebGLRenderTarget(w, h, { type: T.HalfFloatType, depthBuffer: false });
      const s = new T.Scene(), cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      s.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.MeshBasicMaterial({ map: tex })));
      const prev = r.getRenderTarget(), tf = r.toneMapping, cs = r.outputColorSpace; r.toneMapping = T.NoToneMapping; r.outputColorSpace = T.LinearSRGBColorSpace;
      r.setRenderTarget(rt); r.render(s, cam); r.setRenderTarget(prev); r.toneMapping = tf; r.outputColorSpace = cs;
      const buf = new Uint16Array(w * h * 4);
      r.readRenderTargetPixels(rt, 0, 0, w, h, buf); rt.dispose();
      let maxV = 1e-6, bad = 0, vals = new Float32Array(w * h * 3);
      for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) { const v = T.DataUtils.fromHalfFloat(buf[i * 4 + c]); if (Number.isFinite(v)) { vals[i * 3 + c] = v; if (v > maxV) maxV = v; } else bad++; }
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'), img = x.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const i = ((h - 1 - y) * w + xx) * 3; for (let c = 0; c < 3; c++) img.data[((y * w + xx) * 4) + c] = Math.min(255, Math.round(Math.sqrt(vals[i + c] / maxV) * 255)); img.data[((y * w + xx) * 4) + 3] = 255; }
      x.putImageData(img, 0, 0);
      return { url: cv.toDataURL('image/png'), w, h, maxV, bad }; }""", expr)
    pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(out).write_bytes(base64.b64decode(url['url'].split(',')[1]))
    print(out, url['w'], url['h'], 'max', round(url['maxV'], 4), 'non-finite', url['bad'], logs[:3])
    b.close()
