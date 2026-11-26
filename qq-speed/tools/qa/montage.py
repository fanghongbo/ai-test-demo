"""拼图：把多张截图拼成一张再读，省上下文。
python tools/qa/montage.py shots/a.png shots/b.png ... --out shots/sheet.png [--cols 2] [--w 640] [--label]"""
import argparse
import pathlib
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('files', nargs='+')
ap.add_argument('--out', required=True)
ap.add_argument('--cols', type=int, default=2)
ap.add_argument('--w', type=int, default=640)
ap.add_argument('--label', action='store_true')
a = ap.parse_args()
imgs = []
for f in a.files:
    im = Image.open(f).convert('RGB')
    h = round(im.height * a.w / im.width)
    im = im.resize((a.w, h), Image.LANCZOS)
    if a.label:
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 260, 18], fill=(0, 0, 0))
        d.text((4, 3), pathlib.Path(f).stem, fill=(255, 255, 255))
    imgs.append(im)
cols = min(a.cols, len(imgs))
rows = (len(imgs) + cols - 1) // cols
cw, ch = imgs[0].size
sheet = Image.new('RGB', (cw * cols + (cols - 1) * 4, ch * rows + (rows - 1) * 4), (24, 24, 28))
for i, im in enumerate(imgs):
    sheet.paste(im, ((i % cols) * (cw + 4), (i // cols) * (ch + 4)))
sheet.save(a.out)
print(a.out, sheet.size)
