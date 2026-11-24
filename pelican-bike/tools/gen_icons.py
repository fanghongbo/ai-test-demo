"""把 assets_src/icons/*.svg（Phosphor Icons, MIT）整理成 src/ui/icons.js。
只保留 <svg> 内部的形状元素，并校验标签白名单。用法：python -I tools/gen_icons.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets_src' / 'icons'
OUT = ROOT / 'src' / 'ui' / 'icons.js'
ALLOWED = {'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g'}
TAG = re.compile(r'<([a-zA-Z]+)([^>]*)>')
ATTR = re.compile(r'([a-zA-Z:-]+)\s*=\s*"([^"]*)"')
ALLOWED_ATTR = {'d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'points', 'fill', 'transform', 'opacity', 'fill-rule', 'stroke-linecap', 'stroke-linejoin', 'stroke-width'}

icons = {}
for f in sorted(SRC.glob('*.svg')):
    text = f.read_text(encoding='utf-8')
    m = re.search(r'<svg[^>]*viewBox="([^"]+)"[^>]*>(.*)</svg>', text, re.S)
    if not m or len(text) < 60:
        print('skip (not a valid icon):', f.name, file=sys.stderr)
        continue
    body = m.group(2)
    parts = []
    for tag, attrs in TAG.findall(body):
        if tag not in ALLOWED:
            print('skip file, unexpected tag', tag, f.name, file=sys.stderr)
            parts = None
            break
        clean = ' '.join(f'{k}="{v}"' for k, v in ATTR.findall(attrs) if k in ALLOWED_ATTR)
        parts.append(f'<{tag} {clean}/>' if not attrs.rstrip().endswith('/') else f'<{tag} {clean}/>')
    if parts is None:
        continue
    icons[f.stem] = ''.join(parts)

OUT.parent.mkdir(parents=True, exist_ok=True)
lines = ['// 图标：Phosphor Icons (https://phosphoricons.com) — MIT License, Copyright (c) 2023 Phosphor Icons.',
         '// 由 tools/gen_icons.py 从 assets_src/icons/*.svg 生成；只保留形状数据，颜色跟随 currentColor。',
         "export const ICONS = {\n" + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in icons.items()) + ',\n};',
         '/** 生成内联 SVG 字符串（图标只做装饰，真正的可访问名称在按钮的 aria-label 上） */',
         'export function icon(name, size = 20) {',
         '  return `<svg viewBox="0 0 256 256" fill="currentColor" width="${size}" height="${size}" aria-hidden="true" focusable="false">${ICONS[name] || ""}</svg>`;',
         '}', '']
OUT.write_text('\n'.join(lines), encoding='utf-8')
print('wrote', OUT, 'icons:', len(icons))
