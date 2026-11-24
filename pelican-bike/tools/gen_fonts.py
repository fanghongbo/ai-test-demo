"""把站酷快乐体（SIL OFL）子集化成 woff2 并内嵌为 fonts.css，供品牌字 / 标题使用。
只取界面里用作标题的字，所以体积很小。用法：python -I tools/gen_fonts.py
"""
import base64
import pathlib
import re
import sys

from fontTools import subset

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets_src' / 'fonts' / 'ZCOOLKuaiLe-Regular.ttf'
OUT_CSS = ROOT / 'fonts.css'
OUT_WOFF2 = ROOT / 'assets' / 'fonts' / 'ZCOOLKuaiLe-subset.woff2'
LIC_SRC = ROOT / 'assets_src' / 'fonts' / 'ZCOOLKuaiLe-OFL.txt'

# 用到这款字体的文本：index.html 里的品牌名与标题
html = (ROOT / 'index.html').read_text(encoding='utf-8')
logo_chars = set()
for m in re.finditer(r'class="(?:brand__name|intro__title)[^"]*"[^>]*>([^<]+)<', html):
    logo_chars.update(m.group(1))
text = ''.join(sorted(logo_chars)) + 'PelicanRide' + '0123456789' + '·'
text = ''.join(dict.fromkeys(text))
print('glyph text:', text)

OUT_WOFF2.parent.mkdir(parents=True, exist_ok=True)
opts = subset.Options()
opts.flavor = 'woff2'
opts.desubroutinize = True
opts.name_IDs = ['*']
opts.notdef_outline = True
font = subset.load_font(str(SRC), opts)
sub = subset.Subsetter(options=opts)
sub.populate(text=text)
sub.subset(font)
subset.save_font(font, str(OUT_WOFF2), opts)
(OUT_WOFF2.parent / 'LICENSE-ZCOOLKuaiLe.txt').write_text(LIC_SRC.read_text(encoding='utf-8'), encoding='utf-8')

b64 = base64.b64encode(OUT_WOFF2.read_bytes()).decode('ascii')
css = (
    '/* 品牌字：站酷快乐体（ZCOOL KuaiLe）子集，SIL Open Font License 1.1。\n'
    '   由 tools/gen_fonts.py 生成；以 base64 内嵌，file:// 直接打开也能加载（外链字体会被跨域策略拦住）。 */\n'
    '@font-face {\n  font-family: "ZCOOL KuaiLe";\n  font-style: normal;\n  font-weight: 400;\n  font-display: swap;\n'
    f'  src: url(data:font/woff2;base64,{b64}) format("woff2");\n}}\n'
)
OUT_CSS.write_text(css, encoding='utf-8')
print('wrote', OUT_WOFF2, OUT_WOFF2.stat().st_size, 'bytes; css', OUT_CSS.stat().st_size, 'bytes')
sys.exit(0)
