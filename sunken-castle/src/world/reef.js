// 把珊瑚、海绵、海葵……铺到海底上。每个“种”有几份模板几何、一种材质、一个调色板；实例带上位置、朝向、大小和颜色。
// 几个群落各有一张“谁占多少”的表：礁丘上是一片挤挤挨挨的珊瑚礁，城墙头和石头顶上是附生的一层，断崖的台阶上挂满海扇，
// 潟湖里稀稀拉拉，巨藻林的林下是海胆和海鞭。
import * as THREE from 'three';
import * as C from './coral.js';
import { ROCK_VARIANTS, rockTop, rockSurfaceY } from './rocks.js';
import { instanced, groupOf } from '../gfx/instances.js';
import { scatter, randLog } from '../core/scatter.js';
import { mulberry32, TAU } from '../core/mathx.js';
import { height, normalAt, regionAt, siteClear, insideCastle, WORLD, VENTS } from '../core/seabed.js';

const UP = [0, 1, 0];
/** flat：躺平、贴着地面的法线；squash：再压扁一点（附生的壳）；two：几何分成壳和肉两份（砗磲）；shadow：投影（默认只有大个子才投，小东西的影子看不出来、白费一趟） */
export const SPECIES = {
  staghorn: { geo: [() => C.staghorn(1), () => C.staghorn(2), () => C.staghorn(3)], mat: 'staghorn', pal: C.PAL.staghorn, size: [2.0, 4.6], shadow: true },      // 鹿角珊瑚丛：两三米宽
  table: { geo: [() => C.table(1), () => C.table(2)], mat: 'staghorn', pal: C.PAL.table, size: [2.6, 4.6], flat: true, shadow: true },
  brain: { geo: [() => C.brain(1), () => C.brain(2), () => C.brain(3), () => C.brain(1, false), () => C.brain(2, false)], pick: (s, r) => (s > 2.0 ? (r() * 3) | 0 : 3 + ((r() * 2) | 0)), mat: 'brain', pal: C.PAL.brain, size: [1.1, 3.4], flat: true, shadow: true },   // 大个的用高细分（看得出脊），小个的用低细分
  crust: { geo: [() => C.brain(4, false), () => C.brain(5, false)], mat: 'massive', size: [0.7, 2.2], flat: true, squash: true,
    pal: [[0.62, 0.16, 0.24], [0.80, 0.30, 0.06], [0.72, 0.60, 0.08], [0.30, 0.06, 0.34], [0.60, 0.20, 0.30], [0.16, 0.36, 0.14]] },
  tube: { geo: [() => C.tubeSponge(1), () => C.tubeSponge(2), () => C.tubeSponge(3)], mat: 'sponge', pal: C.PAL.tube, size: [1.2, 3.0], shadow: true },
  barrel: { geo: [() => C.barrel()], mat: 'sponge', pal: C.PAL.barrel, size: [1.2, 2.4], shadow: true },
  fingers: { geo: [() => C.fingers(1), () => C.fingers(2)], mat: 'fingers', pal: C.PAL.fingers, size: [1.2, 3.0], shadow: true },
  fan: { geo: [() => C.fan(1), () => C.fan(2)], mat: 'fan', pal: C.PAL.fan, size: [1.0, 2.4] },
  anemone: { geo: [() => C.anemone(1), () => C.anemone(2)], mat: 'soft', pal: C.PAL.anemone, size: [0.9, 2.0] },
  clam: { geo: [() => C.clam(1), () => C.clam(2)], mat: 'shell', pal: C.PAL.clam, size: [0.6, 1.1], flat: true, two: true },
  urchin: { geo: [() => C.urchin(1), () => C.urchin(2)], mat: 'urchin', pal: C.PAL.urchin, size: [0.4, 0.8], flat: true },
  star: { geo: [() => C.star(1), () => C.star(2), () => C.star(3)], mat: 'star', pal: C.PAL.star, size: [0.28, 0.55], flat: true },
  weed: { geo: [() => C.weed(1), () => C.weed(2), () => C.weed(3)], mat: 'weed', pal: C.PAL.weed, size: [0.8, 2.0], shadow: false },
  whip: { geo: [() => C.whip(1), () => C.whip(2)], mat: 'whip', pal: C.PAL.whip, size: [1.3, 3.0] },
};
/** 群落：[种, 占的份数]。null = 空着 */
const GARDEN = [['staghorn', 12], ['table', 3.5], ['brain', 11], ['crust', 10], ['tube', 7], ['barrel', 1.2], ['fingers', 8], ['fan', 2], ['anemone', 3], ['clam', 2], ['urchin', 10], ['star', 8], ['weed', 12], ['whip', 4], [null, 6]];
const WALL_TOP = [['crust', 40], ['tube', 14], ['weed', 26], ['urchin', 8], ['star', 4], ['fan', 4], ['brain', 4]];
const ROCK_TOP = [['crust', 34], ['tube', 18], ['weed', 22], ['fan', 10], ['brain', 8], ['fingers', 8]];
const LAGOON = [['brain', 20], ['fingers', 20], ['anemone', 15], ['urchin', 10], ['star', 15], ['weed', 20]];
const FOREST = [['urchin', 30], ['fan', 20], ['whip', 20], ['fingers', 15], ['crust', 15]];
const SPARSE = [['crust', 25], ['weed', 30], ['tube', 10], ['urchin', 15], ['star', 10], ['brain', 10]];
const CLIFF = [['fan', 40], ['whip', 25], ['tube', 20], ['barrel', 3], ['crust', 12]];
const SOFFIT = [['crust', 55], ['brain', 12], ['urchin', 15], ['star', 18]];                      // 桥洞的内顶面：贴着石头朝下长的一层
const roll = (table, r) => { let t = r() * table.reduce((s, e) => s + e[1], 0); for (const [kind, w] of table) { t -= w; if (t <= 0) return kind; } return null; };

const _up = new THREE.Vector3(0, 1, 0), _n = new THREE.Vector3(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _nrm = [0, 1, 0];

/** 一个装实例的筐：先 add，最后 build 成一组实例化网格 */
export function createReef(M) {
  const kinds = Object.fromEntries(Object.entries(SPECIES).map(([k, spec]) => [k, { spec, items: [] }]));
  const reef = {
    kinds,
    /**
     * 放一个。o：s 指定大小；size 覆盖大小范围；n 指定“上”的方向（城墙头、石头顶上用，不能取地形的法线）；upright 不躺平
     */
    add(kind, x, y, z, r, o = {}) {
      const K = kinds[kind], spec = K.spec, pal = spec.pal[(r() * spec.pal.length) | 0], sz = o.size ?? spec.size, s = o.s ?? randLog(r, sz[0], sz[1]), k = 0.8 + r() * 0.4;
      _qa.setFromAxisAngle(_up, r() * TAU);
      if (spec.flat && !o.upright) { if (o.n) _n.set(o.n[0], o.n[1], o.n[2]); else { normalAt(x, z, _nrm, 0.5); _n.set(_nrm[0], _nrm[1], _nrm[2]); } _qb.setFromUnitVectors(_up, _n); _qa.premultiply(_qb); }
      K.items.push({ x, y, z, q: _qa.clone(), s, sy: s * (spec.squash ? 0.45 + r() * 0.3 : 1), v: spec.pick ? spec.pick(s, r) : (r() * spec.geo.length) | 0, color: [pal[0] * k, pal[1] * k, pal[2] * k] });
    },
    /** 按群落的表抽一个种放下去（可能抽到“空”） */
    addMany(table, x, y, z, r, o) { const kind = roll(table, r); if (kind) reef.add(kind, x, y, z, r, o); },
    build() {
      const meshes = [];
      for (const [kind, K] of Object.entries(kinds)) {
        for (let v = 0; v < K.spec.geo.length; v++) {
          const items = K.items.filter((it) => it.v === v);
          if (!items.length) continue;
          const g = K.spec.geo[v]();
          if (K.spec.two) { meshes.push(...instanced(g.shell, M.shell, items, { name: `${kind}.shell`, chunk: 90 }), ...instanced(g.mantle, M.mantle, items, { name: `${kind}.mantle`, castShadow: false, chunk: 90 })); }
          else meshes.push(...instanced(g, M[K.spec.mat], items, { name: `${kind}.${v}`, castShadow: K.spec.shadow ?? false, chunk: 90 }));
        }
      }
      return { group: groupOf(meshes, 'reef'), meshes, count: Object.values(kinds).reduce((s, k) => s + k.items.length, 0) };
    },
  };
  return reef;
}

/** 把各个群落铺下去。rocks：scatterRocks() 的结果；castle：buildCastle() 的结果（取它登记的生长点） */
export function populateReef(reef, rocks, castle, seed = 8) {
  const G = WORLD.garden, K = WORLD.kelp, M = WORLD.mount, A = WORLD.abyss, I = WORLD.inner;
  const r = mulberry32(seed * 733 + 1), inDisc = (c, k = 1) => (x, z) => Math.hypot(x - c.x, z - c.z) < c.r * k;
  const place = (table) => (x, z, rr) => reef.addMany(table, x, height(x, z), z, rr);
  const n0 = [0, 0, 0];
  // 礁丘：挤挤挨挨的一片
  scatter({ x0: G.x - G.r, x1: G.x + G.r, z0: G.z - G.r, z1: G.z + G.r, cell: 2.4, seed: 201, keep: 0.66, jitter: 0.95, accept: (x, z) => siteClear(x, z) && inDisc(G, 0.96)(x, z), each: (x, z, rr) => reef.addMany(GARDEN, x, height(x, z), z, rr) });
  // 城墙头、檐口、塌口、桥洞里的碎砖上：附生的一层
  for (const sp of castle.spots) {
    if (sp.p[1] < height(sp.p[0], sp.p[2]) - 0.5) continue;                                                                          // 被沙埋住的点：不放
    const up = sp.n ?? UP, table = sp.n && !sp.top ? SOFFIT : WALL_TOP;                                                               // 给了朝向、又不是朝上的（桥洞的内顶面、小臂的底下）：用贴着石头倒挂着长的那一层
    if (r() < 0.88) reef.addMany(table, sp.p[0], sp.p[1], sp.p[2], r, { s: sp.s * (0.55 + r() * 0.9), n: up });
    if (r() < 0.4) reef.addMany(table, sp.p[0] + (r() - 0.5) * 0.9, sp.p[1], sp.p[2] + (r() - 0.5) * 0.9, r, { s: sp.s * (0.3 + r() * 0.6), n: up });
  }
  // 石头顶上：按石头的大小长一两丛。落在石头真实的顶面上（rockTop 的高度表），脚扎进石头里
  const chance = { garden: 0.85, kelp: 0.55, slope: 0.35, plain: 0.3, lagoon: 0.2, castle: 0.25, wall: 0.5, north: 0.25 }, off = new THREE.Vector3(), qi = new THREE.Quaternion();
  rocks.items.slice(0, 6).forEach((list, v) => {
    const T = rockTop(ROCK_VARIANTS[v]);
    for (const it of list) {
      if (it.s < 1.2 || r() > (chance[regionAt(it.x, it.z)] ?? 0.2)) continue;
      const n = r() < 0.35 ? 2 : 1;
      for (let k = 0; k < n; k++) {
        const a = r() * TAU, d = it.s * 0.55 * r(), dx = Math.cos(a) * d, dz = Math.sin(a) * d;
        off.set(dx, 0, dz).divideScalar(it.s).applyQuaternion(qi.copy(it.q).invert());                                              // 世界里的偏移，转回石头自己的坐标
        off.y = rockSurfaceY(T, off.x, off.z) - 0.05;
        off.applyQuaternion(it.q).multiplyScalar(it.s);                                                                             // 石头顶面上的那个点，再转回世界坐标
        if (it.y + off.y < height(it.x + off.x, it.z + off.z) - 0.3) continue;                                                     // 埋在坡里的那一半：不放
        reef.addMany(ROCK_TOP, it.x + off.x, it.y + off.y, it.z + off.z, r, { s: it.s * (0.16 + r() * 0.26), n: UP });
      }
    }
  });
  // 冒泡口旁边：一丛管虫（红色的管子）
  for (const [x, z] of VENTS) for (let k = 0; k < 3; k++) { const a = k * 2.1, s = 0.9 + r() * 0.6; reef.add('tube', x + Math.cos(a) * 1.1, height(x, z) - 0.05, z + Math.sin(a) * 1.1, r, { s, upright: true, size: [s, s] }); }
  // 潟湖、巨藻林下、台地的坡脚和城墙外、断崖、平原
  scatter({ x0: -120, x1: 120, z0: -10, z1: 140, cell: 9, seed: 206, keep: 0.5, accept: (x, z) => siteClear(x, z) && regionAt(x, z) === 'lagoon', each: place(LAGOON) });
  scatter({ x0: K.x - K.r, x1: K.x + K.r, z0: K.z - K.r, z1: K.z + K.r, cell: 6, seed: 207, keep: 0.45, accept: (x, z) => siteClear(x, z) && inDisc(K, 0.98)(x, z), each: place(FOREST) });
  scatter({ x0: M.x - 150, x1: M.x + 150, z0: M.z - 150, z1: M.z + 150, cell: 9, seed: 208, keep: 0.42,
    accept: (x, z) => siteClear(x, z, 3) && (regionAt(x, z) === 'slope' || (regionAt(x, z) === 'castle' && !insideCastle(x, z))), each: place(SPARSE) });
  scatter({ x0: A.x - 360, x1: A.x + 360, z0: A.z - 360, z1: A.z + 360, cell: 7, seed: 209, keep: 0.42,
    accept: (x, z) => siteClear(x, z, 4) && regionAt(x, z) === 'wall' && (normalAt(x, z, n0, 1), n0[1] > 0.4), each: place(CLIFF) });
  scatter({ x0: -I, x1: I, z0: -I, z1: I, cell: 11, seed: 210, keep: 0.32, accept: (x, z) => siteClear(x, z, 6) && (regionAt(x, z) === 'plain' || regionAt(x, z) === 'north'), each: place(SPARSE) });
}
