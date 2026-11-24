"""对比两组同名截图的像素差异。用法：python tools/qa/compare.py 目录A 目录B 名字..."""
import pathlib
import sys

import numpy as np
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
a_dir, b_dir = sys.argv[1], sys.argv[2]
for n in sys.argv[3:]:
    fa, fb = pathlib.Path(a_dir) / f'{n}.png', pathlib.Path(b_dir) / f'{n}.png'
    if not (fa.exists() and fb.exists()):
        print(n, '缺少文件'); continue
    a = np.asarray(Image.open(fa).convert('RGB')).astype(float)
    b = np.asarray(Image.open(fb).convert('RGB')).astype(float)
    if a.shape != b.shape:
        print(n, '尺寸不同', a.shape, b.shape); continue
    d = np.abs(a - b)
    print(f'{n}: 平均差 {d.mean():.2f}/255, 98 分位 {np.percentile(d, 98):.1f}, 最大 {d.max():.0f}')
    # 左右拼一张：左 A 右 B（各取中间 640 列），便于并排看
    h, w = a.shape[:2]
    sheet = Image.new('RGB', (w, h))
    sheet.paste(Image.fromarray(a.astype('uint8')).crop((0, 0, w // 2, h)), (0, 0))
    sheet.paste(Image.fromarray(b.astype('uint8')).crop((w // 2, 0, w, h)), (w // 2, 0))
    sheet.save(pathlib.Path(b_dir) / f'cmp_{n}.png')
