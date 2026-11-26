# 扫 AI 参数：对每组参数跑一场干跑，汇总圈速和撞墙次数。python tools/qa/sweep.py "lead,driftA,brakeAt,coastAt,aLatDrift,aBr" ...
import re, subprocess, sys
for tn in sys.argv[1:]:
    out = subprocess.run(['node', 'tools/qa/race_sim.mjs', '6', '2', '0.98', '--tune=' + tn], capture_output=True, text=True, encoding='utf-8').stdout
    laps, hits, wb, cb, mini, dbl = [], 0, 0, 0, 0, 0
    for m in re.finditer(r'laps ([\d./ ]+?) top +(\d+) km/h  drifts \d+  mini (\d+)  double (\d+).*? hits (\d+)  wallBumps (\d+)  carBumps (\d+)', out):
        laps.append(float(m.group(1).replace(' ', '').split('/')[-1]))          # 每辆车最后一个数字才是完整的一圈
        mini += int(m.group(3)); dbl += int(m.group(4)); hits += int(m.group(5)); wb += int(m.group(6)); cb += int(m.group(7))
    print(f'{tn:32}  lap avg {sum(laps)/max(1,len(laps)):6.2f}  best {min(laps) if laps else 0:6.2f}  hits {hits:3d}  wallBumps {wb:4d}  carBumps {cb:3d}  mini {mini:3d}  double {dbl:3d}')
