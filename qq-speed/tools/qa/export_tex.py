# -*- coding: utf-8 -*-
"""导出页面里的 Canvas 贴图（看程序化贴图有没有接缝、脏块）。

  python tools/qa/export_tex.py asphaltTex.canvas paver.map.canvas ...     # 表达式从 window.__game.M 起写
"""
import base64
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import launch  # noqa: E402

OUT = ROOT / 'shots' / 'dev'
OUT.mkdir(parents=True, exist_ok=True)
exprs = sys.argv[1:] or ['asphaltTex.canvas']
with sync_playwright() as p:
    b = launch(p)
    page = b.new_context(viewport={'width': 640, 'height': 360}).new_page()
    page.goto((ROOT / 'index.html').as_uri() + '?cam=70,2.0,159,90,4,62', wait_until='load')
    page.wait_for_function('window.__sceneReady === true', timeout=90000)
    for e in exprs:
        url = page.evaluate(f"(() => {{ const c = window.__game.M.{e}; const cv = c.canvas || c; return cv.toDataURL('image/png'); }})()")
        name = e.replace('.', '_').replace('canvas', 'png').replace('__', '_')
        f = OUT / (name if name.endswith('.png') else name + '.png')
        f.write_bytes(base64.b64decode(url.split(',', 1)[1]))
        print('saved', f, f.stat().st_size)
    b.close()
