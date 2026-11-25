"""命令行截图：python tools/qa/shot.py --name a --js "..." [--name b --js "..."] [--query "a=1&b=2"] [--out shots]
每次 --name/--js 是一对；URL 默认 file:// 打开 index.html（顺便验证“双击可开”路径）。"""
import argparse
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import run, report, ROOT  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--name', action='append', default=[])
ap.add_argument('--js', action='append', default=[])
ap.add_argument('--query', default='')
ap.add_argument('--out', default='shots')
ap.add_argument('--w', type=int, default=1280)
ap.add_argument('--h', type=int, default=720)
ap.add_argument('--wait', type=int, default=400)
ap.add_argument('--headed', action='store_true')
ap.add_argument('--cpu', action='store_true')
ap.add_argument('--http', action='store_true')
ap.add_argument('--nosettle', action='store_true')
a = ap.parse_args()
shots = [{'name': n, 'js': (a.js[i] if i < len(a.js) else ''), 'wait_ms': a.wait, 'settle': not a.nosettle} for i, n in enumerate(a.name)]
shots = shots or [{'name': 'shot', 'wait_ms': a.wait, 'settle': not a.nosettle}]
base = 'http://127.0.0.1:5173/index.html' if a.http else (ROOT / 'index.html').as_uri()
url = base + (('?' + a.query) if a.query else '')
meta = run(url, shots, ROOT / a.out, (a.w, a.h), a.headed, not a.cpu)
sys.exit(report(meta))
