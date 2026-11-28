"""一次跑完所有检查，把每项的输出存进 docs/evidence/，最后打印一张汇总表。

  python tools/qa/run_all.py [--skip perf,gallery] [--only npm-test,pixel-check] [--no-build]

顺序：单元测试 → 发布版打包 → 启动日志 → 交互 → 画面 → 声音 → 场景审计 → 性能 → README 截图。
每项靠退出码和输出里的关键字判断通过与否；验证报告（docs/validation-report.md）里的数字就来自这里的输出。
用的是系统 Edge + 真实显卡（无头）。
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

# 名字、命令、必须出现的关键字、出现就算失败的关键字
CHECKS = [
    ('npm-test', 'npm test', ['ℹ fail 0'], ['✖', 'Traceback']),
    ('build', 'node build.mjs --prod', ['built app.js (prod)'], ['ERROR', 'Traceback']),
    ('glsl', f'{PY} tools/qa/glsl.py --wait 2500', ['errors/warnings=0'], ['Traceback', '看门狗', 'not ready']),
    ('app-check', f'{PY} tools/qa/app_check.py', ['APP OK'], ['APP PROBLEM', 'Traceback']),
    ('pixel-check', f'{PY} tools/qa/pixel_check.py', ['PIXEL OK'], ['PIXEL PROBLEM', 'Traceback']),
    ('audio-check', f'{PY} tools/qa/audio_check.py', ['AUDIO OK'], ['AUDIO PROBLEM', 'Traceback']),
    ('audit-scene', f'{PY} tools/qa/audit_scene.py', ['AUDIT OK'], ['AUDIT PROBLEM', 'Traceback']),
    ('perf', f'{PY} tools/qa/perf.py', ['1920x1080 极致 wolf'], ['Traceback', '> 16.7 ms', 'console:']),
    ('gallery', f'{PY} tools/qa/gallery.py --out docs/gallery', ['gallery ->'], ['Traceback', '[pageerror]', '[error]']),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--evidence', default='docs/evidence')
    ap.add_argument('--skip', default='')
    ap.add_argument('--only', default='')
    ap.add_argument('--no-build', action='store_true', help='不重新打包（调试单项的时候省时间）')
    a = ap.parse_args()
    skip = {s.strip() for s in a.skip.split(',') if s.strip()}
    only = {s.strip() for s in a.only.split(',') if s.strip()}
    if a.no_build:
        skip.add('build')
    out_dir = ROOT / a.evidence
    out_dir.mkdir(parents=True, exist_ok=True)
    rows, failed = [], []
    for name, cmd, must, bad in CHECKS:
        if name in skip or (only and name not in only):
            continue
        t0 = time.time()
        r = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
        text = (r.stdout or '') + (r.stderr or '')
        why = []
        if r.returncode != 0 and name != 'npm-test':                # npm test 的通过与否只看输出（Windows 上 node --test 的退出码不可靠）
            why.append(f'exit {r.returncode}')
        for m in must:
            if m not in text:
                why.append(f'缺少 {m!r}')
        for b in bad:
            if b in text:
                why.append(f'出现 {b!r}')
        if name == 'npm-test':                                      # 通过数要等于总数
            t, p = re.search(r'tests (\d+)', text), re.search(r'pass (\d+)', text)
            if not (t and p and t.group(1) == p.group(1)):
                why.append('有测试没通过')
        if name == 'app-check':                                     # 每一项都要过
            m = re.search(r'(\d+)/(\d+) 项通过', text)
            if not (m and m.group(1) == m.group(2)):
                why.append('有项目没通过')
        ok = not why
        stamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
        (out_dir / f'{name}.txt').write_text(f'$ {cmd}\n# {stamp}，{time.time() - t0:.0f} 秒，{"通过" if ok else "没通过：" + "；".join(why)}\n\n{text.strip()}\n', encoding='utf-8')
        rows.append((name, 'OK' if ok else 'PROBLEM', f'{time.time() - t0:.0f}s', '' if ok else '；'.join(why)))
        if not ok:
            failed.append(name)
        print(f'  {name:14s} {"OK" if ok else "PROBLEM":8s} {time.time() - t0:4.0f}s  {"" if ok else "；".join(why)}', flush=True)
    print()
    for name, status, secs, why in rows:
        print(f'  {name:14s} {status:8s} {secs:>5s}  {why}')
    print('ALL OK' if not failed else f'{len(failed)} 项没通过：{", ".join(failed)}')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
