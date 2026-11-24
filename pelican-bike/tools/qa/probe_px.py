"""量截图里若干矩形区域的平均色（sRGB 0..255）。用法：python tools/qa/probe_px.py 图片 "名字:x0,y0,x1,y1" ..."""
import sys
import numpy as np
from PIL import Image
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
for spec in sys.argv[2:]:
    name, box = spec.split(':')
    x0, y0, x1, y1 = (int(v) for v in box.split(','))
    r = im[y0:y1, x0:x1].reshape(-1, 3)
    m = r.mean(0)
    print(f'{name:14s} mean {m.round(0).astype(int)}  min {r.min(0).astype(int)}  max {r.max(0).astype(int)}  p95 {np.percentile(r, 95, axis=0).round(0).astype(int)}')
