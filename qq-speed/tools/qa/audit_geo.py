"""Geometry audit.
  BLACK: material uses vertex colours but the geometry has none and there is no instance colour -> renders black.
  IGNORED: geometry carries vertex colours but the material ignores them -> the tint is lost (renders white).
Run:  python tools/qa/audit_geo.py"""
import pathlib, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from game_check import Session

AUDIT = """() => { const black = [], ignored = [];
  window.__game.stage.scene.traverse((o) => {
    if (!(o.isMesh || o.isLine || o.isPoints) || !o.geometry) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const path = []; for (let p = o; p; p = p.parent) path.unshift(p.name || p.type);
    for (const m of mats) { if (!m || m.isShaderMaterial || m.isShadowMaterial || m.isDepthMaterial || m.isSpriteMaterial) continue;
      const vc = !!m.vertexColors, gc = !!o.geometry.attributes.color, ic = !!o.instanceColor, n = o.geometry.attributes.position.count;
      if (vc && !gc && !ic) black.push([path.join('/'), m.type, n, o.count || 1]);
      if (!vc && gc && !ic) ignored.push([path.join('/'), m.type, n, o.count || 1]); } });
  const agg = (list) => { const c = {}; for (const [p, t, n, k] of list) { const key = p + ' [' + t + ']'; c[key] = c[key] || [0, 0]; c[key][0] += k; c[key][1] += n * k; } return Object.entries(c).sort((a, b) => b[1][1] - a[1][1]); };
  return { black: agg(black), ignored: agg(ignored) }; }"""
with sync_playwright() as p:
    s = Session(p, 'shots/audit')
    r = s.eval(AUDIT)
    print('BLACK (renders black):', len(r['black']))
    for k, v in r['black']:
        print('  ', v, k[:220])
    print('IGNORED (tint lost):', len(r['ignored']))
    for k, v in r['ignored']:
        print('  ', v, k[:220])
    s.close()
