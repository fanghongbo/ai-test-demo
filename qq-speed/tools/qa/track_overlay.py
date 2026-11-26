# -*- coding: utf-8 -*-
"""把 track_check.mjs 导出的中心线叠在官方小地图上，方便核对布局。

  python -I tools/qa/track_overlay.py <track.json> <out.png> [scale]
"""
import sys, json
from PIL import Image, ImageDraw

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
data = json.load(open(sys.argv[1], encoding="utf-8"))
S = int(sys.argv[3]) if len(sys.argv) > 3 else 7
base = Image.open("refs/official_all/track_48.jpg").convert("RGB")
W, H = base.size
img = base.resize((W * S, H * S), Image.BICUBIC).convert("RGBA")
ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
d = ImageDraw.Draw(ov)
pts = data["pts"]
# 路缘：中心线两侧各半个路宽
n = len(pts) - 1
L, R = [], []
for x, y, hw, z, k in pts:
    L.append((x, y - hw)); R.append((x, y + hw))
d.line([(x * S, y * S) for x, y in L], fill=(60, 255, 120, 150), width=2)
d.line([(x * S, y * S) for x, y in R], fill=(60, 255, 120, 150), width=2)
d.line([(x * S, y * S) for x, y, hw, z, k in pts], fill=(255, 60, 60, 230), width=2)
# 弯道：按曲率标色（右转蓝、左转黄）
for i in range(n):
    x, y, hw, z, k = pts[i]
    if abs(k) * data["scale"] * (1 / 3.0) * 3.0 > 1 / 26.7:  # 半径 < 80 m
        c = (80, 170, 255, 255) if k > 0 else (255, 220, 40, 255)
        d.ellipse([x * S - 2, y * S - 2, x * S + 2, y * S + 2], fill=c)
# 起点
for i in range(n):
    if abs(i * data["ds"] - data["startS"]) < data["ds"] * 0.5:
        x, y = pts[i][0] * S, pts[i][1] * S
        d.rectangle([x - 5, y - 14, x + 5, y + 14], fill=(255, 255, 255, 255), outline=(0, 0, 0, 255))
        d.text((x + 8, y - 22), "START", fill=(255, 255, 255, 255))
img = Image.alpha_composite(img, ov).convert("RGB")
img.save(sys.argv[2], quality=82)
print("wrote", sys.argv[2], img.size)
