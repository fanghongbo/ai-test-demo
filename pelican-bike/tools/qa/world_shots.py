"""世界检视台截图：先打包 lab，再按参数出图。
python tools/qa/world_shots.py --q "hour=14.5" --views overview behind sideSea ahead lighthouse pier
输出 shots/world/<view>.png + sheet.png"""
import argparse
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
from harness import run, report  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument('--q', default='hour=14.5&s=40')
ap.add_argument('--views', nargs='+', default=['overview', 'behind', 'sideSea', 'ahead'])
ap.add_argument('--out', default='shots/world')
ap.add_argument('--w', type=int, default=1280)
ap.add_argument('--h', type=int, default=720)
ap.add_argument('--nosheet', action='store_true')
a = ap.parse_args()

subprocess.run(['node', str(HERE / 'build_lab.mjs')], cwd=ROOT, check=True)
shots = [{'name': v, 'js': f"__ride.setView('{v}')", 'wait_ms': 250} for v in a.views]
url = (HERE / 'world_lab.html').as_uri() + '?' + a.q
meta = run(url, shots, ROOT / a.out, (a.w, a.h))
code = report(meta, limit=12)
if not a.nosheet:
    files = [s['file'] for s in meta['shots']]
    subprocess.run([sys.executable, str(HERE / 'montage.py'), *files, '--out', str(ROOT / a.out / 'sheet.png'), '--cols', '2', '--w', '720', '--label'], check=False)
sys.exit(code)
