"""QA 截图：Playwright + 系统 Edge（无头也走真实 GPU）。一次启动，多张截图，收集 console / pageerror。

  python tools/qa/shot.py --out shots/dev --name overview --query "orbit=20,6,70,230,28,24,46"
  python tools/qa/shot.py --out shots/dev --shots shots.json        # 批量：[{name, query, js, wait_ms, size}]
"""
import argparse
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import run, report  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = (ROOT / 'index.html').as_uri()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='shots/dev')
    ap.add_argument('--name', default='shot')
    ap.add_argument('--query', default='')
    ap.add_argument('--js', default='')
    ap.add_argument('--shots', default='', help='JSON 文件：[{name, query, js, wait_ms, size}]')
    ap.add_argument('--size', default='1600x900')
    ap.add_argument('--wait', type=int, default=900)
    ap.add_argument('--headed', action='store_true')
    ap.add_argument('--url', default=BASE)
    a = ap.parse_args()
    w, h = [int(v) for v in a.size.split('x')]
    if a.shots:
        items = json.loads(pathlib.Path(a.shots).read_text(encoding='utf-8'))
    else:
        items = [{'name': a.name, 'query': a.query, 'js': a.js, 'wait_ms': a.wait}]
    groups = {}
    for it in items:
        groups.setdefault(it.get('query', ''), []).append(it)
    bad = 0
    for query, its in groups.items():
        shots = [{'name': it['name'], 'js': it.get('js') or None, 'wait_ms': it.get('wait_ms', a.wait), 'size': it.get('size') and tuple(it['size'])} for it in its]
        url = a.url + ('?' + query if query else '')
        meta = run(url, shots, str(ROOT / a.out), viewport=(w, h), headed=a.headed)
        print('=' * 12, url.replace(BASE, ''))
        bad += report(meta)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
