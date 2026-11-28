"""场景审计：打开页面，把整棵场景树过一遍，找“会画错”的东西。
  BLACK   材质要顶点色、几何和实例却都没有颜色 → 画出来是黑的
  IGNORED 几何带着顶点色、材质却不认 → 调子丢了，画出来是白的
  NaN     几何属性或实例矩阵里有不是数字的值 → 那一块画不出来或者闪
另外数一数网格、实例、三角形、贴图、材质、着色器程序，列出来写进验证报告。

  python tools/qa/audit_geo.py
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

AUDIT = """() => {
  const g = window.__game, r = g.stage.renderer, scene = g.stage.scene, out = { black: [], ignored: [], nan: [], meshes: 0, instanced: 0, instances: 0, noCull: [], lights: [], groups: {}, tris: 0 };
  const seen = new Set(), tex = new Map(), mats = new Set();
  const top = (o) => { let p = o; while (p.parent && p.parent !== scene) p = p.parent; return p.name || p.type; };
  scene.traverse((o) => {
    if (o.isLight) { out.lights.push(`${o.type}${o.castShadow ? '(shadow)' : ''}`); return; }
    if (!(o.isMesh || o.isLine || o.isPoints) || !o.geometry) return;
    const path = []; for (let p = o; p; p = p.parent) path.unshift(p.name || p.type);
    const where = path.join('/'), t = top(o), geo = o.geometry, n = geo.attributes.position ? geo.attributes.position.count : 0;
    const tris = (geo.index ? geo.index.count : n) / 3 * (o.isInstancedMesh ? o.count : 0 || 1);
    out.meshes += 1;
    if (o.isInstancedMesh) { out.instanced += 1; out.instances += o.count; }
    out.tris += tris;
    const grp = out.groups[t] ??= { meshes: 0, instances: 0, tris: 0 };
    grp.meshes += 1; grp.instances += o.isInstancedMesh ? o.count : 0; grp.tris += tris;
    if (o.frustumCulled === false && !o.isInstancedMesh) out.noCull.push(where);
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) {
      if (!m) continue;
      mats.add(m);
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) if (m[k] && m[k].isTexture) tex.set(m[k].uuid, m[k]);
      for (const u of m.uniforms ? Object.values(m.uniforms) : []) if (u && u.value && u.value.isTexture) tex.set(u.value.uuid, u.value);
      if (m.isShaderMaterial || m.isShadowMaterial || m.isDepthMaterial || m.isSpriteMaterial) continue;
      const vc = !!m.vertexColors, gc = !!geo.attributes.color, ic = !!o.instanceColor;
      if (vc && !gc && !ic) out.black.push([where, m.type, n, o.count || 1]);
      if (!vc && gc && !ic) out.ignored.push([where, m.type, n, o.count || 1]);
    }
    if (!seen.has(geo)) {
      seen.add(geo);
      for (const [k, at] of Object.entries(geo.attributes)) { const arr = at.array; for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) { out.nan.push([where, k, i]); break; } }
      if (geo.index) { const ix = geo.index.array; for (let i = 0; i < ix.length; i++) if (!(ix[i] >= 0 && ix[i] < n)) { out.nan.push([where, 'index', i]); break; } }
    }
    if (o.isInstancedMesh) { const m = o.instanceMatrix.array; for (let i = 0; i < m.length; i++) if (!Number.isFinite(m[i])) { out.nan.push([where, 'instanceMatrix', i]); break; } }
  });
  let bytes = 0; const sizes = [];
  for (const t of tex.values()) { const w = t.image?.width || 0, h = t.image?.height || 0, b = w * h * 4 * 1.34; bytes += b; sizes.push([t.name || t.type, w, h, Math.round(b / 1024)]); }
  sizes.sort((a, b) => b[3] - a[3]);
  const geoBytes = [...seen].reduce((s, geo) => s + Object.values(geo.attributes).reduce((u, at) => u + at.array.byteLength, 0) + (geo.index ? geo.index.array.byteLength : 0), 0);
  const mem = r.info.memory;
  out.summary = { meshes: out.meshes, instancedMeshes: out.instanced, instances: out.instances, triangles: Math.round(out.tris), geometries: seen.size, geometryMB: +(geoBytes / 1048576).toFixed(1),
    materials: mats.size, textures: tex.size, textureMB: Math.round(bytes / 1048576), programs: r.info.programs.length, lights: out.lights.length, maxAnisotropy: r.capabilities.getMaxAnisotropy ? r.capabilities.getMaxAnisotropy() : 0,
    glGeometries: mem.geometries, glTextures: mem.textures, sampleRateShadow: g.stage.key.shadow.map ? g.stage.key.shadow.map.width : 0 };
  out.groups = Object.entries(out.groups).sort((a, b) => b[1].tris - a[1].tris);
  out.biggestTextures = sizes.slice(0, 8);
  out.lights = out.lights.reduce((c, l) => (c[l] = (c[l] || 0) + 1, c), {});
  return out;
}"""

with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, logs = open_page(browser)
    r = page.evaluate(AUDIT)
    browser.close()

s = r['summary']
print('scene:', json.dumps(s, ensure_ascii=False))
print(f"groups ({len(r['groups'])}):")
for name, g in r['groups']:
    print(f"  {name:14s} {g['meshes']:4d} 个网格  {g['instances']:6d} 个实例  {g['tris'] / 1e6:6.2f} 百万个三角形")
print('lights:', json.dumps(r['lights']))
print('biggest textures:', ', '.join(f'{n} {w}x{h} {mb}KB' for n, w, h, mb in r['biggestTextures']))
print('never culled:', len(r['noCull']), r['noCull'][:8])
for k in ('black', 'ignored', 'nan'):
    print(k.upper(), len(r[k]))
    for row in r[k][:12]:
        print('  ', row)
if logs:
    print('console:', ' | '.join(logs[:5]))
bad = r['black'] or r['ignored'] or r['nan'] or any(l.startswith(('[pageerror]', '[error]')) for l in logs)
print('AUDIT OK' if not bad else 'AUDIT PROBLEM')
sys.exit(1 if bad else 0)
