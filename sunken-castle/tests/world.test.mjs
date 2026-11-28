// 把世界在 Node 里搭一遍（不开浏览器、不上显卡）：王城、沉船、三处古迹、礁石、珊瑚、巨藻、石像、彩窗和光斑。
// 检查的是“搭得出来、没有坏数、位置和数量说得通”
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fakeArchMaterials, assertCleanGeometry, assertCleanMeshes } from './helpers.mjs';
import { buildCastle } from '../src/world/castle.js';
import { buildWreck } from '../src/world/wreck.js';
import { buildRuins } from '../src/world/ruins.js';
import { ROCK_VARIANTS, rockGeometry, rockTop, rockSurfaceY, scatterRocks } from '../src/world/rocks.js';
import { createReef, populateReef, SPECIES } from '../src/world/reef.js';
import { scatterKelp, scatterGrass, assignVariants, buildKelp, kelpPlant, grassTuft } from '../src/world/kelp.js';
import * as coral from '../src/world/coral.js';
import { openingPoints, slitPoints, circlePoints, glassPane, frameGeo, ruinedDrum, slab, createArch } from '../src/world/arch.js';
import { createBatcher } from '../src/gfx/batch.js';
import { GLASS_DESIGNS, ROSE_REGION } from '../src/world/glass_tex.js';
import { statueGeometry, bodyPieces, statueField, statueSurface } from '../src/world/statue.js';
import { createLightPools } from '../src/actors/lightpools.js';
import { instanced, groupOf } from '../src/gfx/instances.js';
import { meshBuilder, paramSurface, tube, blob, cutTriangles, mergeParts, noise3, fbm3 } from '../src/gfx/organic.js';
import { mulberry32 } from '../src/core/mathx.js';
import { height, siteClear, CASTLE,  WORLD, regionAt } from '../src/core/seabed.js';
import { sunUnderwater } from '../src/core/wateroptics.js';

const AM = fakeArchMaterials();
const finite = (...v) => v.every(Number.isFinite);
const trisOf = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3;

test('王城、沉船、三处古迹：搭得出来，没有坏数，东西都在水下', (t) => {
  const castle = buildCastle(AM), wreck = buildWreck(AM), ruins = buildRuins(AM);
  let tris = 0;
  for (const [what, b, least] of [['王城', castle, 12], ['沉船', wreck, 8], ['古迹', ruins, 8]]) {
    assert.ok(b.meshes.length >= least, `${what} 只有 ${b.meshes.length} 个网格`);
    tris += assertCleanMeshes({ traverse: (f) => b.meshes.forEach(f) }, what);
    assert.ok(b.colliders.length > 5 && b.spots.length > 5, what);
    for (const c of b.colliders) for (const v of [c.x, c.z, c.r, c.y1, c.y0, c.ax, c.az, c.bx, c.bz, c.s0, c.s1, ...(c.box ?? [])]) if (v !== undefined) assert.ok(Number.isFinite(v), `${what} 的碰撞体`);
    for (const s of b.spots) assert.ok(finite(...s.p) && s.s > 0 && s.s < 3 && s.p[1] < -8, `${what} 的生长点要在水里：${JSON.stringify(s)}`);
    for (const l of b.lanterns) { assert.ok(finite(...l.p, ...l.c) && l.r > 0 && l.power > 0, `${what} 的灯笼`); assert.ok(l.p[1] < -8 && l.p[1] > -60, `灯笼要在水里：${l.p}`); }
  }
  t.diagnostic(`王城 + 沉船 + 古迹：${castle.meshes.length + wreck.meshes.length + ruins.meshes.length} 个网格，${Math.round(tris / 1000)} 千个三角形，${castle.lanterns.length + wreck.lanterns.length + ruins.lanterns.length} 盏灯笼`);
  assert.ok(castle.lanterns.length >= 20, `王城的灯笼 ${castle.lanterns.length}`);
  assert.ok(castle.spots.length >= 150, `王城的生长点 ${castle.spots.length}`);
  assert.ok(castle.top < -8 && castle.top > -11, `穹顶上的金球 ${castle.top}`);
  assert.ok(tris > 150000, '建筑的总面数');
  const box = new THREE.Box3();
  for (const m of castle.meshes) { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); }
  assert.ok(box.min.x > -80 && box.max.x < 80 && box.min.y > -60 && box.max.y < -4 && box.min.z > CASTLE.z - 60 && box.max.z < CASTLE.bridge.z1 + 20, `王城的范围 ${JSON.stringify(box)}`);
  for (const m of castle.meshes.filter((m) => m.material === AM.M.gold)) { m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; assert.ok(b.min.y > CASTLE.y - 1 && b.max.y < -4, `金饰都在城里该在的高度：${b.min.y.toFixed(1)}..${b.max.y.toFixed(1)}`); }
  for (const [w, b] of [['沉船', wreck], ['古迹', ruins]]) { const bx = new THREE.Box3(); for (const m of b.meshes) { m.geometry.computeBoundingBox(); bx.union(m.geometry.boundingBox); } assert.ok(bx.max.y < -8 && Number.isFinite(bx.min.y), `${w} 全都在水下（最高 ${bx.max.y.toFixed(1)}）`); }
  const parapet = castle.spots.filter((s) => !s.n && Math.abs(Math.abs(s.p[0]) - (CASTLE.bridge.w / 2 - 0.45)) < 0.2 && s.p[2] > CASTLE.bridge.z0 && s.p[2] < CASTLE.bridge.z1 - 12);
  assert.ok(parapet.length > 20 && parapet.every((s) => Math.abs(s.p[1] - (CASTLE.bridge.y + 1.57)) < 0.05 || Math.abs(s.p[1] - (CASTLE.bridge.y + 1.27)) < 0.05), `石桥石栏顶上的生长点要落在栏顶上，塌口两侧的落在没有压顶石的墙头上（桥面在 ${CASTLE.bridge.y.toFixed(1)} 米深）：${JSON.stringify(parapet[0])}`);
  const hallRubble = castle.spots.filter((s) => s.p[0] > 27 && s.p[0] < 45 && s.p[2] > CASTLE.z && s.p[2] < CASTLE.z + 16 && s.p[1] > CASTLE.y && s.p[1] < CASTLE.y + 3);
  assert.ok(hallRubble.length > 3 && hallRubble.every((s) => s.p[1] > CASTLE.y + 0.2 && s.p[1] < CASTLE.y + 3 && s.p[1] > height(s.p[0], s.p[2]) - 0.6), `东边偏殿里的碎砖堆在沙面上：${JSON.stringify(hallRubble[0])}`);
  const soffit = castle.spots.filter((s) => s.n && !s.top);
  const onStatue = castle.spots.filter((s) => s.top);                                                                                  // 两尊守望者身上：肩头一个、披风背面一个
  assert.ok(onStatue.length === 4 && onStatue.every((s) => Math.abs(Math.hypot(...s.n) - 1) < 1e-9 && s.n[1] > 0.2 && s.p[1] > CASTLE.y + 2.5 && s.p[1] < CASTLE.y + 6.2 && Math.abs(Math.abs(s.p[0]) - 6.9) < 0.9), `守望者身上的生长点 ${onStatue.length} 个：${JSON.stringify(onStatue[0])}`);
  assert.ok(soffit.length > 40 && soffit.every((s) => Math.abs(Math.hypot(...s.n) - 1) < 1e-9 && s.n[1] < -0.2 && s.p[1] > height(s.p[0], s.p[2]) + 0.3 && Math.abs(s.p[0]) < 4.5 && s.p[2] > 0 && s.p[2] < CASTLE.bridge.z1 - 10), `桥洞内顶面上的生长点 ${soffit.length} 个：${JSON.stringify(soffit[0])}`);
});

test('彩窗：六种花样排满一张图集；带玻璃的洞登记成光斑，UV 落在自己的那一格里', () => {
  assert.equal(GLASS_DESIGNS.length, 6);
  assert.equal(new Set(GLASS_DESIGNS.map((d) => d.name)).size, 6);
  let edge = 0;
  for (const d of GLASS_DESIGNS) {
    assert.ok(d.u0 === edge && d.u1 > d.u0 && d.v0 === 0 && d.v1 === 1 && d.aspect > 0.2 && d.aspect < 0.8, `${d.name} 在图集里的位置`);
    assert.ok(d.bg.length >= 2 && d.border.length === 2, d.name);
    edge = d.u1;
  }
  assert.equal(edge, 1);
  assert.equal(ROSE_REGION.u1 - ROSE_REGION.u0, 1);

  const w = 3.4, h = 8.8;
  assert.equal(openingPoints(w, h).length, 17, '默认的尖拱：两段各七节弧');
  const op = openingPoints(w, h, { n: 14 });
  assert.ok(Math.abs(op[0][0] + w / 2) < 1e-9 && op[0][1] === 0 && Math.abs(op[1][0] + w / 2) < 1e-9 && Math.abs(op[1][1] - h * 0.68) < 1e-9 && Math.abs(op[op.length - 1][0] - w / 2) < 1e-9 && op[op.length - 1][1] === 0, '尖拱从左边的拱脚起、回到右边的拱脚');
  assert.ok(Math.abs(Math.max(...op.map((p) => p[1])) - h) < 1e-6, '拱尖的高度');
  for (const [x, y] of op) {
    assert.ok(finite(x, y) && Math.abs(x) <= w / 2 + 1e-9 && y >= -1e-9 && y <= h + 1e-9);
    assert.ok(op.some(([x2, y2]) => Math.abs(x2 + x) < 1e-9 && Math.abs(y2 - y) < 1e-9), '尖拱左右对称');
  }
  assert.equal(Math.max(...openingPoints(3, 5, { kind: 'round' }).map((p) => p[1])), 5);
  assert.equal(openingPoints(3, 5, { kind: 'round' }).length, 11);
  assert.equal(openingPoints(3, 5, { kind: 'rect' }).length, 4);
  assert.equal(slitPoints().length, 12);
  assert.equal(circlePoints(2, 28).length, 28);
  for (const p of circlePoints(2, 28)) assert.ok(Math.abs(Math.hypot(...p) - 2) < 1e-9);
  assertCleanGeometry(frameGeo(w, h, 0.3, 0.3, 6), '窗框');
  assertCleanGeometry(ruinedDrum(4, 1, (i) => 3 + (i % 5), { seg: 16 }), '残塔');
  assertCleanGeometry(slab([[0, 0], [6, 0], [6, 4], [0, 4]], [circlePoints(1, 12)], 1), '带洞的板');

  const region = GLASS_DESIGNS[3], pane = glassPane(w, h, {}, region), uv = pane.attributes.uv, pos = pane.attributes.position;
  assertCleanGeometry(pane, '玻璃板');
  for (let i = 0; i < uv.count; i++) {
    assert.ok(uv.getX(i) >= region.u0 - 1e-6 && uv.getX(i) <= region.u1 + 1e-6 && uv.getY(i) >= -1e-6 && uv.getY(i) <= 1 + 1e-6, '玻璃板的 UV 落在这一格里');
    assert.ok(Math.abs((uv.getX(i) - region.u0) / (region.u1 - region.u0) - (pos.getX(i) / w + 0.5)) < 1e-5, '贴图跟着窗子的宽度走');
  }

  const B = createBatcher(), pools = [], colliders = [], spots = [], kit = createArch(B, AM.M, AM.tile, { colliders, spots, seed: 3, y0: -36 });
  kit.wall([0, 0], [20, 0], { h: 9, t: 1.3, openings: [{ x: 5, w, h, glass: 2 }, { x: 15, w: 2, h: 2, kind: 'circle', glass: 1 }], pool: { list: pools, y: 0.9, c: [10, 8] } });
  kit.buttress(30, 0, 0, 12.6, {});
  assert.equal(pools.length, 2);
  for (const [i, r] of pools.entries()) {
    assert.ok(Math.abs(Math.hypot(...r.u) - 1) < 1e-9 && Math.abs(Math.hypot(r.n[0], r.n[2]) - 1) < 1e-9 && Math.abs(r.u[0] * r.n[0] + r.u[2] * r.n[2]) < 1e-9, '沿墙和朝屋里的两个方向互相垂直、都是单位向量');
    assert.ok(r.n[2] > 0.99, '屋子在墙的 +z 一侧，光斑朝那边落');
    assert.ok(Math.abs(r.c[0] - [5, 15][i]) < 1e-9 && Math.abs(r.c[2] - 1.3 * 0.6) < 1e-9 && Math.abs(r.c[1] - (-36 + [h, 2][i] / 2)) < 1e-9, `玻璃的中心 ${r.c}`);
    assert.equal(r.region, [GLASS_DESIGNS[1], ROSE_REGION][i]);
    assert.equal(r.yFloor, -36 + 0.9);
    assert.ok(r.pts.length >= 17 && r.run >= 10);
  }
  assert.ok(colliders.length === 1 && spots.length > 0, '墙的碰撞体和生长点照常登记');
  const meshes = B.build(new THREE.Group(), { name: 't' });
  const glass = meshes.filter((m) => m.material === AM.M.glass || m.material === AM.M.rose);
  assert.equal(glass.length, 2);
  for (const m of glass) assertCleanGeometry(m.geometry, '彩窗');
  assert.ok(buildCastle(AM).meshes.filter((m) => m.material === AM.M.glass || m.material === AM.M.rose).every((m) => m.castShadow === false), '玻璃不投影：日光才穿得过来');
});

test('王座厅的彩窗都登记了光斑', () => {
  const pools = buildCastle(AM).pools;
  assert.ok(pools.length >= 17, `${pools.length} 扇`);
  const by = (nx, nz) => pools.filter((r) => r.n[0] * nx + r.n[2] * nz > 0.99);
  assert.ok(by(1, 0).length === 4 && by(-1, 0).length === 4, `东西两墙上各四扇（${by(1, 0).length} / ${by(-1, 0).length}）`);
  assert.ok(by(0, -1).length === 3, '山墙上门两边的两扇和玫瑰窗');
  for (const r of pools) assert.ok(r.yFloor < -34 && r.yFloor > -36.5 && r.c[1] > r.yFloor && r.c[1] < -18, `窗子的高度 ${r.c[1]}`);
  assert.ok(pools.filter((r) => r.region === ROSE_REGION).length === 1 && pools.every((r) => r.region.u1 <= 1));
});

test('光斑：午后的太阳从西墙的窗子进来，清晨从东墙进来；都落在地砖上', () => {
  const records = buildCastle(AM).pools, key = new THREE.DirectionalLight(), pools = createLightPools(records, key, new THREE.Texture());
  const col = pools.mesh.geometry.attributes.color.array, pos = pools.mesh.geometry.attributes.position.array;
  const runs = [];
  let v = 0;
  for (const r of records) { runs.push([v, v + r.pts.length + 1]); v += r.pts.length + 1; }
  assert.equal(v * 3, pos.length, '每个窗子的轮廓加一个中心');
  const strength = (i) => col[runs[i][0] * 3];
  const check = (el, az, westLit) => {
    const s = sunUnderwater(el, az).dir;
    pools.update(new THREE.Vector3(...s));
    let any = 0;
    records.forEach((r, i) => {
      const a = strength(i);
      assert.ok(a >= 0 && a <= 1);
      for (let k = runs[i][0]; k < runs[i][1]; k++) assert.ok(finite(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]) && Math.abs(pos[k * 3 + 1] - (r.yFloor + 0.03)) < 1e-5, '光斑贴着地砖');
      if (Math.abs(r.n[0]) > 0.99) assert.ok(westLit ? (r.n[0] > 0 ? a > 0.8 : a < 1e-6) : (r.n[0] < 0 ? a > 0.6 : a < 1e-6), `${westLit ? '午后' : '清晨'}：法线 ${r.n} 的窗子强度 ${a}`);
      any = Math.max(any, a);
    });
    assert.ok(any > 0.8, '总有窗子透光');
  };
  check(55, 300, true);
  check(40, 72, false);
  pools.update(new THREE.Vector3(-0.3, -0.9, 0.3));
  assert.ok(records.every((_, i) => strength(i) === 0), '太阳在地平线以下就没有光斑');
  pools.sync();
  assert.equal(pools.mesh.visible, false, '还没有阴影贴图的时候先不画');
  pools.dispose();
});

test('礁石：撒出来是确定的，都坐在海床上，不占桥和古迹；八种石头都没有坏数、底是平的', (t) => {
  const a = scatterRocks(5), b = scatterRocks(5);
  assert.deepEqual(a.items.map((l) => l.length), b.items.map((l) => l.length));
  assert.deepEqual(a.items[0].slice(0, 5), b.items[0].slice(0, 5));
  const all = a.items.flat();
  assert.ok(all.length > 500, `礁石 ${all.length} 块`);
  assert.ok(a.colliders.length > 100);
  const ground = all.filter((it) => it.y <= height(it.x, it.z) + 0.05), lintel = all.filter((it) => it.y > height(it.x, it.z) + 0.05);
  assert.equal(lintel.length, 1, '只有天然石拱顶上那块长条的大石不坐在地上');
  for (const it of ground) {
    assert.ok(finite(it.x, it.y, it.z, it.s) && it.s > 0.2 && it.s < 14, `${JSON.stringify([it.x, it.y, it.z, it.s])}`);
    assert.ok(it.y >= height(it.x, it.z) - it.s * 0.16 - 0.2, `礁石没有坐在地上：${[it.x, it.y, it.z, height(it.x, it.z)]}`);
    assert.ok(siteClear(it.x, it.z) && Math.hypot(it.x - WORLD.abyss.x, it.z - WORLD.abyss.z) < WORLD.abyss.r + WORLD.abyss.wall + 10, `礁石撒到了不该撒的地方：${[it.x, it.z]}`);
    assert.ok(Math.abs(it.q.length() - 1) < 1e-9 && finite(...it.color) && it.color.every((c) => c > 0.3 && c < 1.6));
  }
  assert.ok(all.filter((it) => regionAt(it.x, it.z) === 'garden').length > 150, '珊瑚花园里最多');
  let tris = 0;
  for (const v of ROCK_VARIANTS) {
    const g = rockGeometry(v);
    tris += assertCleanGeometry(g, `礁石 ${v.seed}`);
    g.computeBoundingBox();
    const bb = g.boundingBox;
    assert.ok(Math.abs(bb.min.y) < 0.15, `礁石的底面 ${bb.min.y}`);
    assert.ok(bb.max.y > 1.4 * v.stretch[1] && bb.max.y < 2.0 * v.stretch[1], `礁石的高度 ${bb.max.y}，应该是 ${v.stretch[1]} 的 1.6 倍上下`);
    assert.ok(bb.max.x - bb.min.x < 3.2 * v.stretch[0] && bb.max.z - bb.min.z < 3.2 * v.stretch[2]);
    const T = rockTop(v), pp = g.attributes.position;
    assert.equal(T, rockTop(v), '高度表只算一次');
    let peak = 0;
    for (let i = 0; i < pp.count; i += 23) { const y = rockSurfaceY(T, pp.getX(i), pp.getZ(i)); assert.ok(y >= pp.getY(i) - 1e-5 && Number.isFinite(y), `石头表面 (${pp.getX(i).toFixed(2)}, ${pp.getZ(i).toFixed(2)}) 的高度 ${y} 不该低于石头上的点 ${pp.getY(i)}`); peak = Math.max(peak, y); }
    assert.ok(peak > 1.4 * v.stretch[1], `石头最高的地方 ${peak.toFixed(2)}，不是拉伸量 ${v.stretch[1]}：珊瑚要按真实的高度放到顶上`);
  }
  t.diagnostic(`礁石 ${all.length} 块，${ROCK_VARIANTS.length} 种，每种 ${Math.round(Math.min(...ROCK_VARIANTS.map((v) => 20 * 4 ** v.detail)) / 1000)}k–${Math.round(Math.max(...ROCK_VARIANTS.map((v) => 20 * 4 ** v.detail)) / 1000)}k 个三角形`);
  const fake = { vertexColors: true }, meshes = a.items.flatMap((items, i) => instanced(rockGeometry(ROCK_VARIANTS[i]), fake, items, { name: `rocks.${i}`, chunk: 110 }));
  assert.equal(meshes.reduce((s, m) => s + m.count, 0), all.length);
  assertCleanMeshes(groupOf(meshes, 'rocks'), '礁石');
  assert.ok(meshes.length > a.items.length, '按地块分了块');
});

test('珊瑚：每一种都生成得出来；撒满各个群落之后数量对得上', (t) => {
  const gens = { staghorn: [coral.staghorn(2)], table: [coral.table(2)], brain: [coral.brain(2), coral.brain(2, false)], sponge: [coral.tubeSponge(2)], barrel: [coral.barrel()], fingers: [coral.fingers(2)], fan: [coral.fan(2)], anemone: [coral.anemone(2)], clam: Object.values(coral.clam(2)), urchin: [coral.urchin(2)], star: [coral.star(2), coral.star(3)], weed: [coral.weed(2)], whip: [coral.whip(2)] };
  for (const [name, list] of Object.entries(gens)) for (const g of list) {
    assert.ok(trisOf(g) > 20, `${name} 的面数`);
    assertCleanGeometry(g, name);
    g.computeBoundingBox();
    const s = g.boundingBox.getSize(new THREE.Vector3());
    assert.ok(s.x > 0.2 && s.x < 8 && s.y > 0.05 && s.y < 6 && s.z > 0.2 && s.z < 8, `${name} 的大小 ${s.toArray()}`);
  }
  const M = Object.fromEntries(Object.values(SPECIES).flatMap((sp) => [sp.mat, sp.two ? 'shell' : null, sp.two ? 'mantle' : null].filter(Boolean).map((n) => [n, {}])));
  const reef = createReef(M);
  populateReef(reef, scatterRocks(5), buildCastle(AM), 8);
  const items = Object.values(reef.kinds).flatMap((k) => k.items);
  assert.ok(items.length > 2500, `珊瑚和海绵 ${items.length} 个`);
  const up = new THREE.Vector3();
  let hanging = 0;
  for (const [kind, K] of Object.entries(reef.kinds)) for (const it of K.items) {
    assert.ok(finite(it.x, it.y, it.z, it.s, it.sy) && it.s > 0.05 && it.s < 9 && it.sy > 0, `${kind}：${JSON.stringify([it.x, it.y, it.z, it.s])}`);
    assert.ok(it.y < -3 && it.y > WORLD.abyss.floor - 15 && it.y > height(it.x, it.z) - 1.5, `${kind} 要长在水里的东西上：${[it.x, it.y, it.z, height(it.x, it.z)]}`);
    assert.ok(it.v >= 0 && it.v < K.spec.geo.length && Math.abs(it.q.length() - 1) < 1e-6);
    if (up.set(0, 1, 0).applyQuaternion(it.q).y < -0.2) hanging++;
  }
  assert.ok(hanging > 40 && hanging < 200, `贴着桥洞内顶面、朝下长的 ${hanging} 个`);
  assert.ok(reef.kinds.clam.items.length > 50 && reef.kinds.star.items.length > 30, '蛤和海星都撒下去了');
  // 石头顶上的那些：离王城和石桥远远的、悬在地面之上的，必须贴在某块石头的顶面上
  const rocks = scatterRocks(5).items.flatMap((list, v) => list.filter((it) => it.s >= 1.2).map((it) => ({ ...it, v })));
  const onRocks = items.filter((it) => it.y - height(it.x, it.z) > 0.4 && Math.hypot(it.x, it.z + 75) > 95 && !(Math.abs(it.x) < 14 && it.z > -45 && it.z < 105));
  assert.ok(onRocks.length > 150, `石头顶上的珊瑚海绵 ${onRocks.length} 个`);
  const qi = new THREE.Quaternion(), off = new THREE.Vector3();
  const onThisRock = (it, rk) => {                                                                                                      // 转回石头自己的坐标（不缩放、不倾斜）：它的脚要落在顶面的高度表上
    off.set(it.x - rk.x, it.y - rk.y, it.z - rk.z).divideScalar(rk.s).applyQuaternion(qi.copy(rk.q).invert());
    return Math.hypot(off.x, off.z) <= 0.6 && Math.abs(off.y - (rockSurfaceY(rockTop(ROCK_VARIANTS[rk.v]), off.x, off.z) - 0.05)) < 0.02;
  };
  for (const it of onRocks) assert.ok(rocks.some((rk) => onThisRock(it, rk)), `石头顶上的东西悬在半空：${JSON.stringify([it.x.toFixed(1), it.y.toFixed(2), it.z.toFixed(1)])}`);
  const built = reef.build();
  assert.equal(built.count, items.length);
  assert.equal(built.meshes.reduce((s, m) => s + m.count, 0), items.length + reef.kinds.clam.items.length, '砗磲的壳和外套膜各画一遍');
  const tris = assertCleanMeshes(built.group, '珊瑚');
  t.diagnostic(`珊瑚和海绵 ${items.length} 个，${Object.keys(reef.kinds).length} 种，几何 ${Math.round(tris / 1000)} 千个三角形（未乘实例）`);
});

test('巨藻和海草：长在巨藻林的岩脊上、潟湖和平原里，再高也不冒出水面', () => {
  const kelp = scatterKelp(), grass = scatterGrass();
  assert.ok(kelp.length > 150 && kelp.length < 900, `巨藻 ${kelp.length}`);
  assert.ok(grass.length > 800, `海草 ${grass.length}`);
  assert.deepEqual(scatterKelp().slice(0, 20), kelp.slice(0, 20));
  for (const it of kelp) {
    assert.ok(finite(it.x, it.y, it.z, it.s) && it.s >= 5, `${JSON.stringify(it)}`);
    assert.ok(it.y + it.s <= -3.6 + 1e-9, `巨藻的顶 ${it.y + it.s}`);
    assert.ok(Math.abs(it.y - (height(it.x, it.z) - 0.2)) < 1e-9 && Math.hypot(it.x - WORLD.kelp.x, it.z - WORLD.kelp.z) < WORLD.kelp.r * 0.97 && siteClear(it.x, it.z, 2), `巨藻长在岩脊上：${[it.x, it.z]}`);
  }
  for (const it of grass) assert.ok(finite(it.x, it.y, it.z, it.s) && it.s > 0.3 && it.s < 1.3 && it.y < height(it.x, it.z) && it.y > height(it.x, it.z) - 0.1 && ['lagoon', 'plain', 'north'].includes(regionAt(it.x, it.z)) && siteClear(it.x, it.z, 1), `海草：${JSON.stringify(it)}`);
  const M = { kelp: {}, grass: {} }, r = mulberry32(99), group = buildKelp(M, assignVariants(kelp, r), assignVariants(grass, r));
  assert.equal(group.children.filter((m) => m.name.startsWith('kelp')).reduce((s, m) => s + m.count, 0), kelp.length);
  assert.equal(group.children.filter((m) => m.name.startsWith('grass')).reduce((s, m) => s + m.count, 0), grass.length);
  assertCleanMeshes(group, '巨藻');
  for (const v of [1, 2, 3]) { assertCleanGeometry(kelpPlant(v), '巨藻'); assertCleanGeometry(grassTuft(v), '海草'); }
});

test('石像：七米高，脚底在 y = 0，脸朝 +z，石头和青铜两部分都没有坏数', () => {
  const g = statueGeometry(AM.tile.marble, AM.tile.bronze);
  assert.equal(g, statueGeometry(4, 3), '几何只算一次');
  assert.equal(g.height, 7);
  for (const [name, geo] of [['石头', g.marble], ['青铜', g.bronze]]) {
    assert.ok(assertCleanGeometry(geo, `石像的${name}`) > 500);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    assert.ok(bb.min.x > -1.6 && bb.max.x < 1.6 && bb.min.z > -1.6 && bb.max.z < 1.2, `${name} 的横向范围 ${bb.min.toArray()}..${bb.max.toArray()}`);
  }
  assert.ok(g.marble.boundingBox.min.y > -0.05 && g.marble.boundingBox.min.y < 0.05, `脚底 ${g.marble.boundingBox.min.y}`);
  assert.ok(g.marble.boundingBox.max.y > 5.6 && g.marble.boundingBox.max.y < 6.1, '头顶和王冠');
  assert.ok(Math.abs(g.bronze.boundingBox.max.y - 6.98) < 0.05, '戟尖');
  assert.ok(g.bronze.boundingBox.min.y > -0.02 && g.bronze.boundingBox.min.y < 0.05, '戟的底尖杵在基座上');
  assert.ok(g.bronze.boundingBox.max.x < -0.4, '戟握在一只手里，在身体的一侧');
  assert.ok(g.marble.attributes.position.count > 3e5 && g.marble.attributes.position.count < 1.2e6, `大理石的三角形数 ${g.marble.attributes.position.count / 3}`);
});

test('石像的身体是从一个距离场里网格化出来的：三块都是闭合的，里面、外面分得清', () => {
  const pieces = bodyPieces(AM.tile.marble);
  assert.equal(pieces, bodyPieces(4), '只算一次');
  assert.equal(pieces.length, 3, '腰带以下的身子、上身、握戟的右手');
  let tris = 0;
  for (const [i, g] of pieces.entries()) {
    assert.ok(assertCleanGeometry(g, `石像的第 ${i} 块`) > 1000);
    const I = g.index.array, count = new Map();
    for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) { const a = I[t + e], b = I[t + (e + 1) % 3], k = a < b ? a * 1048576 + b : b * 1048576 + a; count.set(k, (count.get(k) ?? 0) + 1); }
    assert.deepEqual([...new Set(count.values())], [2], `第 ${i} 块有不是恰好两个面共用的边`);
    g.computeBoundingBox();
    const bb = g.boundingBox;
    assert.ok(bb.min.x > -1.3 && bb.max.x < 1.3 && bb.min.y > -0.01 && bb.max.y < 5.8 && bb.min.z > -0.8 && bb.max.z < 1.2, `第 ${i} 块的范围 ${bb.min.toArray()}..${bb.max.toArray()}`);
    tris += I.length / 3;
  }
  assert.ok(tris > 1.2e5 && tris < 3.2e5, `三角形数 ${tris}`);
  for (const [x, y, z, inside, what] of [[0, 2, 0, true, '袍子里'], [0, 4.2, 0, true, '胸口'], [0, 5.27, 0, true, '头'], [-0.86, 3.4, 0.2, true, '右小臂'], [0.47, 3.99, 0.62, true, '左手掌'], [-0.93, 2.99, 0.33, true, '右手掌'], [0.108, 5.255, 0.345, false, '眼窝'], [-0.75, 4.0, 0.3, false, '右臂前面的水'], [0, 3.27, 0.5, false, '腰带前面的水'], [1.5, 3, 0, false, '身子旁边'], [0, 6.2, 0, false, '头顶上面']]) {
    assert.equal(statueField(x, y, z) < 0, inside, `${what}（${x}, ${y}, ${z}）${inside ? '该在' : '不该在'}石头里：${statueField(x, y, z).toFixed(4)}`);
  }
  const top = statueSurface([-0.6, 4.42, 0], [0, 1, 0], 0, 0.6);
  assert.ok(Math.abs(top.x + 0.6) < 1e-6 && top.y > 4.6 && top.y < 4.72 && Math.abs(statueField(top.x, top.y, top.z)) < 2e-4, `肩头的顶 ${top.toArray().map((v) => v.toFixed(3))}`);
});

test('有机几何的工具：放样曲面是闭合的球，管子的长度对，裁剪和合并不出错，三维噪声有界', () => {
  const mb = meshBuilder();
  paramSurface(mb, (u, v) => [Math.sin(u * Math.PI) * Math.cos(v * Math.PI * 2), Math.cos(u * Math.PI), Math.sin(u * Math.PI) * Math.sin(v * Math.PI * 2)], 12, 16, { ref: () => [0, 1, 0], col: () => [1, 0.5, 0.25] });
  const sphere = mb.build();
  assertCleanGeometry(sphere, '球');
  const p = sphere.attributes.position;
  for (let i = 0; i < p.count; i++) assert.ok(Math.abs(Math.hypot(p.getX(i), p.getY(i), p.getZ(i)) - 1) < 1e-3);
  assert.deepEqual([...sphere.attributes.color.array.slice(0, 3)], [1, 0.5, 0.25]);
  const tb = meshBuilder();
  tube(tb, [0, 1, 3].map((x) => new THREE.Vector3(x, 0, 0)), [0.5, 0.3, 0.1], { sides: 8, cap: 'tip', tipLen: 0.4 });
  const pipe = tb.build();
  assertCleanGeometry(pipe, '管子');
  pipe.computeBoundingBox();
  assert.ok(Math.abs(pipe.boundingBox.min.x) < 0.01 && Math.abs(pipe.boundingBox.max.x - 3.4) < 0.01 && Math.abs(pipe.boundingBox.max.y - 0.5) < 0.01, `管子的范围 ${pipe.boundingBox.min.toArray()}..${pipe.boundingBox.max.toArray()}`);
  // 扁的带子：横向给定、截面是椭圆
  const sb = meshBuilder(), sp = [0, 1, 2].map((y) => new THREE.Vector3(0, y, 0)), sn = [0, 1, 2].map(() => new THREE.Vector3(1, 0, 0));
  tube(sb, sp, [0.07, 0.07, 0.07], { sides: 12, side: sn, aspect: 0.28 });
  const strap = sb.build();
  assertCleanGeometry(strap, '带子');
  strap.computeBoundingBox();
  assert.ok(Math.abs(strap.boundingBox.max.x - 0.07) < 1e-3 && Math.abs(strap.boundingBox.max.z - 0.0196) < 1e-3, `带子的截面 ${strap.boundingBox.max.toArray().map((v) => v.toFixed(4))}`);
  const bb = meshBuilder();
  blob(bb, { seg: 12, rings: 8, radius: () => 2, sy: 0.5 });
  const whole = bb.build(), blobGeo = cutTriangles(whole, (x, y) => y > 0.2), pa = blobGeo.attributes.position;
  assertCleanGeometry(blobGeo, '团块');
  const low = (g) => { let n = 0; for (let i = 0; i < g.attributes.position.count; i += 3) if ((g.attributes.position.getY(i) + g.attributes.position.getY(i + 1) + g.attributes.position.getY(i + 2)) / 3 <= 0.2 + 1e-6) n++; return n; };
  assert.ok(low(blobGeo) === blobGeo.attributes.position.count / 3 && low(whole) === blobGeo.attributes.position.count / 3, `重心不高于 0.2 的三角形一个不少、别的都裁掉了：${blobGeo.attributes.position.count / 3} / ${whole.attributes.position.count / 3}`);
  // v = 0 那一行上截面宽度是 0 的曲面（船尾的平底、龙骨线）：求法线的时候不能越出定义域
  const kb = meshBuilder();
  paramSurface(kb, (u, v) => [(u * 2 - 1) * Math.sin(v * 1.3), v, -Math.pow(Math.sin(v * 1.3), 0.85)], 4, 6, { ref: () => [0, 0, -1] });
  const keel = kb.build(), kn = keel.attributes.normal;
  assertCleanGeometry(keel, '龙骨线上的曲面');
  for (let i = 0; i < kn.count; i++) assert.ok(Math.abs(Math.hypot(kn.getX(i), kn.getY(i), kn.getZ(i)) - 1) < 1e-5, `第 ${i} 个法线是单位向量`);
  const kb2 = meshBuilder();
  paramSurface(kb2, (u, v) => [u * Math.PI * 2, v, Math.sin(u * Math.PI * 2)], 6, 3, { ref: () => [0, 0, -1] });   // v 首尾相接的曲面
  assertCleanGeometry(kb2.build(), '绕一圈的曲面');
  const merged = mergeParts([sphere, pipe]);
  assert.equal(merged.attributes.position.count, sphere.attributes.position.count + pipe.attributes.position.count);
  assertCleanGeometry(merged, '合并');
  for (let i = 0; i < 300; i++) { const x = i * 0.731, y = i * 0.317, z = i * 1.13; assert.ok(Math.abs(noise3(x, y, z, 5)) <= 1 && Math.abs(fbm3(x, y, z, 3, 5)) <= 1); }
  assert.equal(noise3(1.5, 2.5, 3.5, 9), noise3(1.5, 2.5, 3.5, 9));
});
