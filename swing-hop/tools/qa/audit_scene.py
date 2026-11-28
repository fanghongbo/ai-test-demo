"""场景审计：打开页面，把整棵场景树过一遍，找“会画错”的东西。
  BLACK   材质要顶点色、几何和实例却都没有颜色 → 画出来是黑的
  IGNORED 几何带着顶点色、材质却不认 → 调子丢了，画出来是白的
  NaN     几何属性、索引或实例矩阵里有不是数字的值 → 那一块画不出来或者闪
再数一数网格、三角形、贴图、材质、着色器程序；最后一路往前传送、再让机器人打一局，
看岛拆了以后几何体有没有真的放掉（内存不涨）。

  python tools/qa/audit_scene.py
"""
import json
import pathlib
import sys

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from harness import UA_FLAGS, launch, open_page  # noqa: E402

AUDIT = """() => {
  const g = window.__game, S = g.stage(), r = S.renderer, scene = S.scene, out = { black: [], ignored: [], nan: [], meshes: 0, instanced: 0, instances: 0, lights: [], groups: {} };
  const seen = new Set(), tex = new Map(), mats = new Set();
  const top = (o) => { let p = o; while (p.parent && p.parent !== scene) p = p.parent; return p.name || p.type; };
  let tris = 0, objects = 0;
  scene.traverse((o) => {
    objects += 1;
    if (o.isLight) { out.lights.push(`${o.type}${o.castShadow ? '(shadow)' : ''}`); return; }
    if (!(o.isMesh || o.isSprite || o.isLine || o.isPoints) || !o.geometry) return;
    const path = []; for (let p = o; p && p !== scene; p = p.parent) path.unshift(p.name || p.type);
    const where = path.join('/'), t = top(o), geo = o.geometry, n = geo.attributes.position ? geo.attributes.position.count : 0;
    const k = (geo.index ? geo.index.count : n) / 3 * (o.isInstancedMesh ? o.count : 1);
    if (!o.isSprite) { out.meshes += 1; tris += k; }
    if (o.isInstancedMesh) { out.instanced += 1; out.instances += o.count; }
    const grp = out.groups[t] ??= { meshes: 0, instances: 0, tris: 0 };
    grp.meshes += 1; grp.instances += o.isInstancedMesh ? o.count : 0; grp.tris += k;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of list) {
      if (!m) continue;
      mats.add(m);
      for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) if (m[key] && m[key].isTexture) tex.set(m[key].uuid, m[key]);
      for (const u of m.uniforms ? Object.values(m.uniforms) : []) if (u && u.value && u.value.isTexture) tex.set(u.value.uuid, u.value);
      if (m.isShaderMaterial || m.isSpriteMaterial || m.isMeshBasicMaterial) continue;
      const vc = !!m.vertexColors, gc = !!geo.attributes.color, ic = !!o.instanceColor;
      if (vc && !gc && !ic) out.black.push([where, m.type, n]);
      if (!vc && gc && !ic) out.ignored.push([where, m.type, n]);
    }
    if (!seen.has(geo)) {
      seen.add(geo);
      for (const [name, at] of Object.entries(geo.attributes)) { const arr = at.array; for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i])) { out.nan.push([where, name, i]); break; } }
      if (geo.index) { const ix = geo.index.array; for (let i = 0; i < ix.length; i++) if (!(ix[i] >= 0 && ix[i] < n)) { out.nan.push([where, 'index', i]); break; } }
    }
    if (o.isInstancedMesh) { const m = o.instanceMatrix.array; for (let i = 0; i < m.length; i++) if (!Number.isFinite(m[i])) { out.nan.push([where, 'instanceMatrix', i]); break; } }
  });
  const sizes = [];
  for (const t of tex.values()) { const w = t.image?.width || 0, h = t.image?.height || 0; sizes.push([t.name || t.type, w, h, Math.round(w * h * 4 * 1.34 / 1024)]); }
  sizes.sort((a, b) => b[3] - a[3]);
  const geoBytes = [...seen].reduce((s, geo) => s + Object.values(geo.attributes).reduce((u, at) => u + at.array.byteLength, 0) + (geo.index ? geo.index.array.byteLength : 0), 0);
  const mem = r.info.memory, st = g.stats();
  out.summary = { objects, meshesVisible: out.meshes, instancedMeshes: out.instanced, instances: out.instances, trianglesInScene: Math.round(tris), drawnTriangles: st.triangles, drawCalls: st.calls,
    geometries: seen.size, geometryMB: +(geoBytes / 1048576).toFixed(1), materials: mats.size, textures: tex.size, textureMB: sum(sizes.map((s) => s[3])), programs: r.info.programs.length, lights: out.lights.length,
    maxAnisotropy: r.capabilities.getMaxAnisotropy ? r.capabilities.getMaxAnisotropy() : 0, glGeometries: mem.geometries, glTextures: mem.textures, shadowMap: S.sun.shadow.map ? S.sun.shadow.map.width : 0, level: S.level, pixelRatio: r.getPixelRatio() };
  function sum(a) { return a.reduce((x, y) => x + y, 0); }
  out.groups = Object.entries(out.groups).sort((a, b) => b[1].tris - a[1].tris);
  out.biggestTextures = sizes.slice(0, 8);
  out.lights = out.lights.reduce((c, l) => (c[l] = (c[l] || 0) + 1, c), {});
  return out;
}"""

COUNT = """() => { const g = window.__game, r = g.stage().renderer; let n = 0; g.scene().traverse(() => n++); return { geo: r.info.memory.geometries, tex: r.info.memory.textures, objects: n, nodes: g.stats().nodes, node: g.state().node, score: g.state().score }; }"""

with sync_playwright() as p:
    browser = launch(p, args=UA_FLAGS)
    ctx, page, logs = open_page(browser)
    r = page.evaluate(AUDIT)
    page.evaluate('() => window.__game.retry(5)')
    page.wait_for_timeout(1800)
    base = page.evaluate(COUNT)
    # 先热身：把金色、宽板凳、裂缝三种秋千各传送一次（它们的贴图头一回画到才上传），再在裂缝的那个上站到它断（断板的两半也是头一回画才上传）
    kinds = page.evaluate("() => { const c = window.__game.course(); c.ensure(400); return ['gold', 'wide', 'cracked'].map((k) => c.nodes.findIndex((n) => n.swing.kind === k)); }")
    for n in kinds:
        page.evaluate('(n) => window.__game.warp(n, { wolf: 500 })', n)
        page.wait_for_timeout(1500 if n == kinds[-1] else 900)
    page.wait_for_timeout(2600)
    warm = page.evaluate(COUNT)
    warps = []
    for n in (40, 75, 8, 120, 3, 200, 30, 160, 5, 90, 20, 260):
        page.evaluate('(n) => window.__game.warp(n, { wolf: 500 })', n)
        page.wait_for_timeout(1100)
        warps.append((n, page.evaluate(COUNT)))
    page.evaluate('() => window.__game.retry(5)')
    page.wait_for_timeout(600)
    bot0 = page.evaluate(COUNT)
    page.evaluate('() => window.__game.bot(true)')
    page.wait_for_timeout(16000)
    page.evaluate('() => window.__game.bot(false)')
    page.wait_for_timeout(800)
    bot1 = page.evaluate(COUNT)
    browser.close()

s = r['summary']
print('scene:', json.dumps(s, ensure_ascii=False))
print(f"groups ({len(r['groups'])}):")
for name, g in r['groups']:
    print(f"  {name:16s} {g['meshes']:4d} 个网格  {g['instances']:6d} 个实例  {g['tris'] / 1e3:7.1f} 千个三角形")
print('lights:', json.dumps(r['lights']))
print('biggest textures:', ', '.join(f'{n} {w}x{h} {mb}KB' for n, w, h, mb in r['biggestTextures']))
for k in ('black', 'ignored', 'nan'):
    print(k.upper(), len(r[k]))
    for row in r[k][:12]:
        print('  ', row)

bad = r['black'] or r['ignored'] or r['nan']
if logs:
    print('console:', ' | '.join(logs[:5]))
    bad = True


def show(tag, c):
    return f"{tag:12s} 显存里的几何体 {c['geo']:4d}  贴图 {c['tex']:3d}  场景里的对象 {c['objects']:4d}  在看的岛 {c['nodes']:2d}  第 {c['node']} 个秋千"


print(show('开局', base))
print(show('热身以后', warm))
for n, c in warps:
    print(show(f'传送到 {n}', c))
print(show('机器人开局', bot0))
print(show(f"打了 16 秒 {bot1['score']} 分", bot1))

# 热身以后头一回画的东西都上传完了，接下来一路传送，数量必须稳定：每座岛拆掉以后它占的几何体要真的放掉
tail = [c for _, c in warps]
geo_lo, geo_hi = min(c['geo'] for c in tail), max(c['geo'] for c in tail)
obj_lo, obj_hi = min(c['objects'] for c in tail), max(c['objects'] for c in tail)
tex_set = {c['tex'] for c in tail}
print(f'  热身以后传送 12 次：几何体 {geo_lo}–{geo_hi} 个，贴图 {sorted(tex_set)} 张，场景对象 {obj_lo}–{obj_hi} 个（岛的装扮不同，对象数会差一些）')
if any(c['nodes'] != 12 for _, c in warps):
    bad = True
    print('  - 传送以后在看的岛不是 12 座')
if geo_hi - geo_lo > 1:
    bad = True
    print('  - 一路往前传送，显存里的几何体越积越多：拆掉的岛没有放干净')
if len(tex_set) != 1:
    bad = True
    print('  - 一路往前传送，贴图越来越多')
if obj_hi - obj_lo > 40:
    bad = True
    print('  - 一路往前传送，场景里的对象越来越多')
if bot1['geo'] > geo_hi + 1 or bot1['tex'] not in tex_set:
    bad = True
    print('  - 让机器人打了一局以后，几何体或贴图比传送时多')
print('AUDIT OK' if not bad else 'AUDIT PROBLEM')
sys.exit(1 if bad else 0)
