# 把赛道、陆地、地标占地画成一张带坐标网格的平面图：python tools/qa/plan_map.py [plan.json] [out.png]
# 小地图像素坐标：每格 10 像素 = 30 米。
import json, sys
from PIL import Image, ImageDraw, ImageFont

src = sys.argv[1] if len(sys.argv) > 1 else 'tools/qa/plan.json'
out = sys.argv[2] if len(sys.argv) > 2 else 'tools/qa/plan_map.png'
d = json.load(open(src, encoding='utf-8'))
K = 7                                   # 画面上一个小地图像素占几个点
M = 46                                  # 边距
W, H = 169, 147
im = Image.new('RGB', (W * K + M * 2, H * K + M * 2), (22, 52, 96))
dr = ImageDraw.Draw(im)
try:
    font = ImageFont.truetype('msyh.ttc', 13)
except Exception:
    font = ImageFont.load_default()
P = lambda x, y: (M + x * K, M + y * K)

# 网格
for gx in range(0, W + 1, 10):
    dr.line([P(gx, 0), P(gx, H)], fill=(40, 78, 128), width=1)
    dr.text((P(gx, 0)[0] - 8, M - 22), str(gx), fill=(200, 220, 245), font=font)
for gy in range(0, H + 1, 10):
    dr.line([P(0, gy), P(W, gy)], fill=(40, 78, 128), width=1)
    dr.text((6, P(0, gy)[1] - 7), str(gy), fill=(200, 220, 245), font=font)
dr.rectangle([P(0, 0), P(W, H)], outline=(150, 190, 235), width=2)

# 陆地
for name, poly in d['islands'].items():
    dr.polygon([P(x, y) for x, y in poly], fill=(196, 176, 138), outline=(120, 100, 70))
# 不建房区
for x0, y0, x1, y1 in d.get('excl', []):
    dr.rectangle([P(x0, y0), P(x1, y1)], fill=(170, 150, 112))

# 赛道：两侧路缘连成一条闭合带
pts = d['pts']
n = len(pts)
def edge(side):
    out = []
    for i in range(n):
        x, y, hw = pts[i][0], pts[i][1], pts[i][2]
        a = pts[(i + 1) % n]; b = pts[(i - 1) % n]
        dx, dy = a[0] - b[0], a[1] - b[1]
        L = (dx * dx + dy * dy) ** 0.5 or 1
        out.append((x - dy / L * hw * side, y + dx / L * hw * side))
    return out
dr.polygon([P(x, y) for x, y in edge(1) + edge(-1)[::-1]], fill=(72, 72, 82))
dr.line([P(x, y) for x, y, *_ in pts], fill=(205, 205, 210), width=1)
for i in range(0, n, 90):                                # 行进方向箭头
    x, y = pts[i][0], pts[i][1]
    a = pts[(i + 5) % n]
    dr.line([P(x, y), P(a[0], a[1])], fill=(255, 70, 70), width=3)

# 地标占地
cols = [(255, 70, 70), (80, 230, 90), (255, 230, 50), (255, 150, 40), (60, 220, 230), (240, 240, 240)]
for k, f in enumerate(d['fps']):
    c = cols[k % len(cols)]
    if f['kind'] == 'rect':
        x0, y0, x1, y1 = f['box']
        dr.rectangle([P(x0, y0), P(x1, y1)], outline=c, width=3)
        tx, ty = P(x0, y0)
    elif f['kind'] == 'poly':
        dr.polygon([P(x, y) for x, y in f['pts']], outline=c, width=3)
        tx, ty = P(f['pts'][0][0], f['pts'][0][1])
    else:
        (cx, cy), r = f['c'], f['r']
        dr.ellipse([P(cx - r, cy - r), P(cx + r, cy + r)], outline=c, width=3)
        tx, ty = P(cx, cy - r)
    dr.text((tx + 3, ty + 2), f['name'], fill=c, font=font)
# 跨在赛道上的地标
for name, x, y in d.get('marks', []):
    dr.line([P(x, y - 5), P(x, y + 5)], fill=(255, 255, 255), width=3)
    dr.text((P(x, y - 5)[0] - 16, P(x, y - 5)[1] - 15), name, fill=(255, 255, 255), font=font)

sx, sy = d['start']
dr.ellipse([P(sx - 2, sy - 2), P(sx + 2, sy + 2)], fill=(255, 255, 0), outline=(0, 0, 0))
dr.text((P(sx, sy)[0] - 16, P(sx, sy)[1] + 14), 'START', fill=(255, 255, 0), font=font)
im.save(out)
print('wrote', out, im.size)
