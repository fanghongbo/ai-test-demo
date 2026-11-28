// 巨藻和海草。巨藻（Macrocystis）：一根细茎长到十几二十米，沿茎密密地出窄长的叶子，每片叶子根上有一个气囊；整片“林子”在岩脊上，随涌浪摆。
// 海草（Posidonia 那一类）：一丛细长的叶子，成片地铺在潟湖和平原的沙上。
// 模板几何的高度是 1，实例再放大到实际高度。
import * as THREE from 'three';
import { meshBuilder, mixc, ribbon, tube, V } from '../gfx/organic.js';
import { instanced, groupOf } from '../gfx/instances.js';
import { scatter } from '../core/scatter.js';
import { mulberry32, TAU, fbm2 } from '../core/mathx.js';
import { height, regionAt, siteClear, WORLD } from '../core/seabed.js';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** 一个小气囊（叶片根部让叶子浮起来的那个泡）：上下两个极点加一圈 5 个点，10 个三角形 */
function pea(mb, centre, dir, r, col, ex) {
  const n1 = v3(0, 1, 0).cross(dir).normalize(), n2 = dir.clone().cross(n1), top = centre.clone().addScaledVector(dir, r * 1.35), bot = centre.clone().addScaledVector(dir, -r * 1.35), ring = [];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; ring.push(centre.clone().addScaledVector(n1, Math.cos(a) * r).addScaledVector(n2, Math.sin(a) * r)); }
  for (let i = 0; i < 5; i++) {
    const p = ring[i], q = ring[(i + 1) % 5];
    for (const [a, b, c] of [[top, p, q], [bot, q, p]]) { const m = a.clone().add(b).add(c).divideScalar(3).sub(centre); mb.tri(V(a.x, a.y, a.z, 0, 0, 0, 0.5, 0.5, col, ex), V(b.x, b.y, b.z, 0, 0, 0, 0.5, 0.5, col, ex), V(c.x, c.y, c.z, 0, 0, 0, 0.5, 0.5, col, ex), [m.x, m.y, m.z]); }
  }
}

/**
 * 一棵巨藻（高度 1）：一根细茎长到顶，沿茎按螺旋密密地出六十来片窄长的叶子（中间有一道折起的叶脉、边缘起皱、带一点扭转），
 * 每片叶子的根部有一个小气囊；根部是一个小的固着器
 */
export function kelpPlant(seed = 1) {
  const r = mulberry32(seed * 61 + 3), mb = meshBuilder(), N = 22, c = [], w = [], side = [];
  for (let i = 0; i <= N; i++) { const t = i / N, a = t * 5 + seed; c.push(v3(Math.sin(a) * 0.03 * t, t, Math.cos(a * 0.8) * 0.03 * t)); w.push(0.0045); side.push(v3(Math.cos(a), 0, -Math.sin(a))); }
  ribbon(mb, c, w, side, (i, t) => mixc([0.32, 0.22, 0.05], [0.44, 0.31, 0.07], t), { extra: (i, t) => [t * t, 0, 0] });
  const nb = 58 + ((r() * 16) | 0);
  for (let k = 0; k < nb; k++) {
    const t = 0.05 + (k / nb) * 0.94, base = c[Math.round(t * N)], a = k * 2.39996 + seed, len = 0.060 + r() * 0.042, ph = r(), twist = (r() - 0.5) * 1.4;
    const dir = v3(Math.cos(a), 0.22 + r() * 0.6, Math.sin(a)).normalize(), sd0 = v3(-Math.sin(a), 0, Math.cos(a)), pts = [], ww = [], sds = [];
    for (let j = 0; j <= 6; j++) {
      const u = j / 6;
      pts.push(base.clone().addScaledVector(dir, len * u).add(v3(0, len * (0.16 * u * u + 0.05 * Math.sin(u * 5.2 + ph)), 0)));             // 先顺着长，再微微上翘，带一点波
      ww.push((0.015 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.6)), 0.7) + 0.0022) * (1 + 0.14 * Math.sin(u * 19 + ph)));            // 两头窄、中间宽，边缘起皱
      sds.push(sd0.clone().applyAxisAngle(dir, twist * u));
    }
    ribbon(mb, pts, ww, sds, (j, u) => mixc([0.34, 0.24, 0.045], [0.54, 0.40, 0.10], u), { crease: 0.4, extra: (j, u) => [t * t + 0.08 * u, ph, 0] });
    pea(mb, base.clone().addScaledVector(dir, len * 0.05), dir, 0.0040 + r() * 0.0018, [0.42, 0.30, 0.075], [t * t, ph, 0]);
  }
  tube(mb, [v3(0, -0.012, 0), v3(0, 0.006, 0)], [0.016, 0.006], { sides: 6, col: () => [0.20, 0.14, 0.04], cap: 'tip', tipLen: 0.004 });
  return mb.build();
}

/** 一丛海草（高约 1）：十几片细长的叶子，叶尖往下垂 */
export function grassTuft(seed = 1) {
  const r = mulberry32(seed * 97 + 21), mb = meshBuilder(), n = 12 + ((r() * 6) | 0);
  for (let k = 0; k < n; k++) {
    const a = r() * TAU, tilt = 0.12 + r() * 0.5, len = 0.55 + r() * 0.55, ph = r(), dir = v3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), sd = v3(-Math.sin(a), 0, Math.cos(a)), pts = [], w = [];
    for (let j = 0; j <= 4; j++) { const t = j / 4, droop = 0.28 * len * t * t * t; pts.push(dir.clone().multiplyScalar(len * t).add(v3(0, -droop, 0))); w.push(0.014 * (1 - t * 0.72) * (0.75 + 0.25 * Math.sin(t * Math.PI)) + 0.002); }
    ribbon(mb, pts, w, pts.map(() => sd), (j, t) => mixc([0.36, 0.44, 0.16], [0.95, 1.05, 0.55], t), { crease: 0.3, extra: (j, t) => [t * t, ph, 0] });
  }
  return mb.build();
}

const KELP_GREENS = [[1.0, 1.0, 0.92], [0.86, 0.94, 1.15], [1.12, 0.92, 0.82], [0.95, 1.04, 0.98]];      // 巨藻的颜色在顶点色里；实例色只是一点偏黄、偏绿的色差
const GRASS_GREENS = [[0.045, 0.17, 0.035], [0.06, 0.21, 0.04], [0.08, 0.19, 0.05], [0.14, 0.17, 0.04], [0.05, 0.15, 0.06]];

/** 岩脊上的巨藻林：顶上密、坡上稀，高度 9–22 米 */
export function scatterKelp(seed = 3) {
  const K = WORLD.kelp, items = [];
  scatter({ x0: K.x - K.r, x1: K.x + K.r, z0: K.z - K.r, z1: K.z + K.r, cell: 6, seed, keep: 1, accept: (x, z) => siteClear(x, z, 2) && Math.hypot(x - K.x, z - K.z) < K.r * 0.97 && fbm2(x / 23, z / 23, 2, 44) > -0.15,
    each: (x, z, r) => { if (r() > (height(x, z) > -30 ? 0.82 : 0.3)) return; const g = height(x, z); items.push({ x, y: g - 0.2, z, q: tiltQuatUpright(r), s: Math.max(5, Math.min(9 + r() * 13, -3.6 - g)), color: KELP_GREENS[(r() * KELP_GREENS.length) | 0] }); } });   // 再高也不冒出水面
  return items;
}
function tiltQuatUpright(r) { const q = new THREE.Quaternion().setFromAxisAngle(v3(Math.cos(r() * 6), 0, Math.sin(r() * 6)), r() * 0.06); return q; }

/** 海草床：潟湖里成片，平原上零散 */
export function scatterGrass(seed = 4) {
  const L = WORLD.lagoon, I = WORLD.inner, items = [];
  const patch = (x, z, f) => fbm2(x / f, z / f, 2, 45) > 0.02;
  scatter({ x0: -L.rx * 1.5, x1: L.rx * 1.5, z0: L.z - L.rz * 1.5, z1: L.z + L.rz * 1.5, cell: 2.3, seed, accept: (x, z) => siteClear(x, z, 1) && regionAt(x, z) === 'lagoon' && patch(x, z, 17),
    each: (x, z, r) => { items.push({ x, y: height(x, z) - 0.03, z, q: tiltQuatUpright(r), s: 0.45 + r() * 0.75, color: GRASS_GREENS[(r() * GRASS_GREENS.length) | 0] }); } });
  scatter({ x0: -I, x1: I, z0: -I, z1: I, cell: 3.2, seed: seed + 1, keep: 0.5, accept: (x, z) => siteClear(x, z, 4) && (regionAt(x, z) === 'plain' || regionAt(x, z) === 'north') && patch(x, z, 26),
    each: (x, z, r) => { items.push({ x, y: height(x, z) - 0.03, z, q: tiltQuatUpright(r), s: 0.4 + r() * 0.6, color: GRASS_GREENS[(r() * GRASS_GREENS.length) | 0] }); } });
  return items;
}

export function buildKelp(M, kelpItems, grassItems, o = {}) {
  const meshes = [];
  const kg = [kelpPlant(1), kelpPlant(2), kelpPlant(3)], gg = [grassTuft(1), grassTuft(2), grassTuft(3)];
  for (let v = 0; v < 3; v++) {
    const k = kelpItems.filter((it) => it.v === v), g = grassItems.filter((it) => it.v === v);
    meshes.push(...instanced(kg[v], M.kelp, k, { name: `kelp.${v}`, castShadow: o.kelpShadow ?? true, chunk: 90 }));
    meshes.push(...instanced(gg[v], M.grass, g, { name: `grass.${v}`, castShadow: false, chunk: 70 }));
  }
  return groupOf(meshes, 'kelp');
}

/** 给每一项随机派一个模板（0..2） */
export function assignVariants(items, r) { for (const it of items) it.v = (r() * 3) | 0; return items; }
