"""一次跑完所有检查，把每项的输出存进 docs/evidence/，最后打印一张汇总表。

  python tools/qa/run_all.py [--skip perf,ai] [--only npm-test,pixel]

系统 Edge + 真实显卡（无头）。每项靠退出码和输出里的关键字判断通过与否；
验证报告（docs/validation-report.md）里的数字就来自这里的输出。全程约十二分钟。
"""
import argparse
import datetime
import pathlib
import re
import subprocess
import sys
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
ROOT = pathlib.Path(__file__).resolve().parents[2]
PY = 'python -X utf8'
PAGE_BAD = ['[pageerror]', '[error]', 'blank capture', 'PROBLEM', '等待超时', 'Traceback']

# 名字、命令、必须出现的关键字、出现就算失败的关键字
CHECKS = [
    ('npm-test', 'npm test', ['TRACK OK'], ['not ok', 'TRACK PROBLEM', 'Traceback']),
    ('game-check-drive', f'{PY} tools/qa/game_check.py drive --out shots/evidence/drive', ['完美起步 1', '小喷次数'], PAGE_BAD),
    ('game-check-menu', f'{PY} tools/qa/game_check.py menu --out shots/evidence/menu', ['[16_countdown]'], PAGE_BAD),
    ('game-check-ai', f'{PY} tools/qa/game_check.py ai --sec 110 --laps 1 --out shots/evidence/ai', ['[81_results]', '结算:'], PAGE_BAD),
    ('game-check-item', f'{PY} tools/qa/game_check.py item --sec 75 --out shots/evidence/item', ['ITEM OK'], PAGE_BAD),
    ('pixel-check', f'{PY} tools/qa/pixel_check.py --sec 14', ['PIXEL OK'], ['PIXEL PROBLEM', 'Traceback']),
    ('audio-check', f'{PY} tools/qa/audio_check.py', ['AUDIO OK'], ['AUDIO PROBLEM', 'Traceback']),
    ('audit-geo', f'{PY} tools/qa/audit_geo.py', ['BLACK (renders black): 0'], ['Traceback']),
    ('glsl', f'{PY} tools/qa/glsl.py', ['[nova] race'], ['Traceback']),
    ('perf', f'{PY} tools/qa/perf.py', ['1600x900 q2'], ['Traceback']),
    ('perf-night', f'{PY} tools/qa/perf.py --hours 22', ['1600x900 q2'], ['Traceback']),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--evidence', default='docs/evidence')
    ap.add_argument('--skip', default='')
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    skip = {s.strip() for s in a.skip.split(',') if s.strip()}
    only = {s.strip() for s in a.only.split(',') if s.strip()}
    out_dir = ROOT / a.evidence
    out_dir.mkdir(parents=True, exist_ok=True)
    rows, failed = [], []
    for name, cmd, must, bad in CHECKS:
        if name in skip or (only and name not in only):
            continue
        t0 = time.time()
        r = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
        text = (r.stdout or '') + (r.stderr or '')
        low = text.lower()
        why = []
        if r.returncode != 0 and name not in ('game-check-drive', 'game-check-menu', 'game-check-ai', 'game-check-item'):   # 这四个只靠输出判断，退出码总是 0
            why.append(f'exit {r.returncode}')
        for m in must:
            if m not in text:
                why.append(f'缺少 {m!r}')
        for b in bad:
            if b in text:
                why.append(f'出现 {b!r}')
        if name == 'npm-test':                                                  # 通过数要等于总数
            t, p = re.search(r'tests (\d+)', text), re.search(r'pass (\d+)', text)
            if not (t and p and t.group(1) == p.group(1)):
                why.append('有测试没通过')
        ok = not why
        stamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        (out_dir / f'{name}.txt').write_text(f'$ {cmd}\n# {stamp}，{time.time() - t0:.0f} 秒，{"通过" if ok else "没通过：" + "；".join(why)}\n\n{text.strip()}\n', encoding='utf-8')
        rows.append((name, 'OK' if ok else 'PROBLEM', f'{time.time() - t0:.0f}s', '' if ok else '；'.join(why)))
        if not ok:
            failed.append(name)
        print(f'  {name:18s} {"OK" if ok else "PROBLEM":8s} {time.time() - t0:4.0f}s  {"" if ok else "；".join(why)}', flush=True)
    print()
    for name, status, secs, why in rows:
        print(f'  {name:18s} {status:8s} {secs:>5s}  {why}')
    print('ALL OK' if not failed else f'{len(failed)} 项没通过：{", ".join(failed)}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
