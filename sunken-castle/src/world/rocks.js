// 礁石：八种“捏”出来的石头（扁的、圆的、板状的、立着的，还有两种石柱），用实例铺满海床——礁丘上密、台地坡脚大、断崖边一排石柱。
// 石头的形状：正二十面体细分之后，沿半径按三个尺度的噪声推拉，再在噪声过零的地方压出褶皱；几个随机的平面“切”出起伏的断裂面；底部压平，坐在地上。
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { fbm3 } from '../gfx/organic.js';
import { rockMaterial } from '../gfx/triplanar.js';
import { instanced, groupOf } from '../gfx/instances.js';
import { scatter, randLog, tiltQuat } from '../core/scatter.js';
import { mulberry32 } from '../core/mathx.js';
import { height, regionAt, insideCastle, siteClear, WORLD, SITES } from '../core/seabed.js';

export const ROCK_VARIANTS = Object.freeze([
  { seed: 11, stretch: [1.3, 0.72, 1.0], big: 0.24, mid: 0.12, fine: 0.05, crease: 0.10, detail: 7 },     // 0 扁圆的
  { seed: 23, stretch: [1.0, 0.9, 1.15], big: 0.24, mid: 0.12, fine: 0.05, crease: 0.14, detail: 7, cuts: 4 },    // 1 圆的
  { seed: 37, stretch: [1.55, 0.55, 0.95], big: 0.20, mid: 0.10, fine: 0.04, crease: 0.08, detail: 6, cuts: 6 },  // 2 板状
  { seed: 41, stretch: [0.9, 1.3, 0.95], big: 0.24, mid: 0.12, fine: 0.05, crease: 0.12, detail: 6, cuts: 4 },    // 3 立着的
  { seed: 53, stretch: [1.25, 0.75, 1.05], big: 0.26, mid: 0.14, fine: 0.06, crease: 0.16, detail: 5 },  // 4 小石头
  { seed: 67, stretch: [1.0, 0.85, 1.2], big: 0.24, mid: 0.13, fine: 0.06, crease: 0.10, detail: 4, cuts: 4 },    // 5 小石头
  { seed: 71, stretch: [0.72, 2.5, 0.85], big: 0.16, mid: 0.09, fine: 0.04, crease: 0.14, detail: 3, taper: 0.30 },   // 6 石柱
  { seed: 83, stretch: [0.60, 3.4, 0.90], big: 0.14, mid: 0.08, fine: 0.04, crease: 0.10, detail: 3, taper: 0.36 },   // 7 石柱,
]);

const GEO = new Map();
/** 一种石头的几何（只算一次） */
export function rockGeometry(v) {
  if (!GEO.has(v.seed)) GEO.set(v.seed, buildRock(v));
  return GEO.get(v.seed);
}

function buildRock(v) {
  let g = new THREE.IcosahedronGeometry(1, v.detail);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g);                                                                                 // 先焊成一个连通的球
  const p = g.attributes.position, q = new THREE.Vector3(), S = [v.seed * 7 + 1, v.seed * 13 + 5, v.seed * 3 + 9];
  // 几个随机的平面把石头“切”出断裂面：朝向这个面的那半个球，半径不能超过到平面的距离
  const r = mulberry32(v.seed * 101 + 7), planes = [];
  for (let k = 0; k < (v.cuts ?? 5); k++) { const a = r() * Math.PI * 2, b = Math.acos(r() * 2 - 1); planes.push([Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a), 0.72 + r() * 0.34]); }
  let minY = 1e9, maxY = -1e9;
  for (let i = 0; i < p.count; i++) {
    q.fromBufferAttribute(p, i).normalize();
    const big = fbm3(q.x * 1.5 + 3, q.y * 1.5, q.z * 1.5, 3, S[0]), mid = fbm3(q.x * 3.6, q.y * 3.6 + 7, q.z * 3.6, 3, S[1]), fine = fbm3(q.x * 9, q.y * 9, q.z * 9 + 2, 2, S[2]);
    const crease = 1 - Math.abs(fbm3(q.x * 2.4 + 11, q.y * 2.4, q.z * 2.4, 2, S[1]));                  // 噪声过零的地方凹进去一道
    let rad = 1 + v.big * big + v.mid * mid + v.fine * fine - v.crease * crease;
    if (v.taper) rad *= 1 + v.taper * (0.5 - (q.y + 1) / 2);                                           // 石柱：下粗上细
    for (const [nx, ny, nz, c] of planes) { const d = q.x * nx + q.y * ny + q.z * nz; if (d > 0.3) rad = Math.min(rad, c / d + v.mid * mid * 0.7 + v.big * big * 0.4 + v.fine * fine); }   // 断裂面不是平的：顺着噪声一起鼓一鼓、凹一凹
    q.multiplyScalar(rad);
    p.setXYZ(i, q.x * v.stretch[0], q.y * v.stretch[1], q.z * v.stretch[2]);
    minY = Math.min(minY, q.y * v.stretch[1]); maxY = Math.max(maxY, q.y * v.stretch[1]);
  }
  const cut = minY + (maxY - minY) * 0.12;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setY(i, y < cut ? cut - (cut - y) * 0.15 : y); }
  g.translate(0, -cut, 0);                                                                              // 原点挪到贴地的那个面
  g.computeVertexNormals();                                                                             // 光滑的法线
  const flat = g.toNonIndexed(), sn = g.attributes.normal, fn = flat.attributes.normal, ix = g.index, n = new THREE.Vector3(), m = new THREE.Vector3();
  flat.computeVertexNormals();                                                                          // 每个三角形自己的法线
  for (let i = 0; i < fn.count; i++) {                                                                  // 按夹角分光滑组：和光滑法线差得远的顶点在断裂面的棱上，用三角形自己的
    const o = ix.getX(i);                                                                               // 非索引几何的第 i 个顶点原来是谁
    n.set(sn.getX(o), sn.getY(o), sn.getZ(o)); m.set(fn.getX(i), fn.getY(i), fn.getZ(i));
    const d = n.dot(m);
    if (d < 0.86) n.copy(m); else n.multiplyScalar(0.86).addScaledVector(m, 0.14);
    n.normalize();
    fn.setXYZ(i, n.x, n.y, n.z);
  }
  return flat;
}

const TOP = new Map();
/**
 * 一种石头顶面的高度表（石头自己的坐标、没有缩放）：N×N 个格子，每格记落在里面的最高点。ext 是格子网覆盖的半宽（米）
 */
export function rockTop(v) {
  if (!TOP.has(v.seed)) {
    const g = rockGeometry(v), N = 10, ext = 1.1 * Math.max(v.stretch[0], v.stretch[2]), p = g.attributes.position, cell = new Float32Array(N * N).fill(-1e9);
    for (let i = 0; i < p.count; i++) {
      const cx = Math.min(N - 1, Math.max(0, (p.getX(i) / ext * 0.5 + 0.5) * N | 0)), cz = Math.min(N - 1, Math.max(0, (p.getZ(i) / ext * 0.5 + 0.5) * N | 0)), k = cz * N + cx;
      if (p.getY(i) > cell[k]) cell[k] = p.getY(i);
    }
    TOP.set(v.seed, { N, ext, cell });
  }
  return TOP.get(v.seed);
}
/** 石头表面在某一点（石头自己的坐标、没有缩放）的高度：取这一格和隔壁八格里的最高点（顶面是斜的、有尖，取高一点，让东西的脚扎进石头里） */
export function rockSurfaceY(T, x, z) {
  const N = T.N, cx = Math.min(N - 1, Math.max(0, (x / T.ext * 0.5 + 0.5) * N | 0)), cz = Math.min(N - 1, Math.max(0, (z / T.ext * 0.5 + 0.5) * N | 0));
  let best = -1e9;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { const i = cz + dz, j = cx + dx; if (i < 0 || j < 0 || i >= N || j >= N) continue; const h = T.cell[i * N + j]; if (h > best) best = h; }
  return Math.max(best, 0);
}

/** 礁石的几种颜色（线性）：石灰岩的本色、盖满钙化藻的粉、盖满藻皮的绿、湿的灰 */
const ROCK_TINTS = [[1.0, 0.98, 0.94], [1.18, 0.80, 0.84], [0.70, 0.86, 0.58], [0.90, 0.93, 0.98], [1.0, 0.98, 0.94]];

/** 按大小挑变体：小的用细分少的两种（省面），大的四种轮着来 */
const boulder = (r, s) => (s < 2 ? 4 + ((r() * 2) | 0) : (r() * 4) | 0);

/** 把礁石撒到海床上，按变体分组成实例。顺便登记碰撞体（太小的不管） */
export function scatterRocks(seed = 5) {
  const items = ROCK_VARIANTS.map(() => []), colliders = [];
  const put = (v, x, z, s, r, tilt = 0.3, embed = 0.12) => {
    const reach = s * Math.max(ROCK_VARIANTS[v].stretch[0], ROCK_VARIANTS[v].stretch[2]);               // 这块石头伸出去多远
    if (!siteClear(x, z, reach * 0.9) || (Math.abs(x) < 5.5 + reach && z > -44 && z < 106)) return;     // 石头越大，离桥、离留空地越远
    const y = height(x, z) - s * embed, st = ROCK_VARIANTS[v].stretch, pal = ROCK_TINTS[(r() * ROCK_TINTS.length) | 0], k = 0.62 + r() * 0.36;
    items[v].push({ x, y, z, q: tiltQuat(r, tilt, new THREE.Quaternion()), s, color: [pal[0] * k, pal[1] * k, pal[2] * k] });
    if (s > 1.4 && s < 10) colliders.push({ x, z, r: s * Math.max(st[0], st[2]) * 0.78, y0: y - 2, y1: y + s * st[1] * 1.45 });
  };
  const G = WORLD.garden, K = WORLD.kelp, M = WORLD.mount, A = WORLD.abyss, I = WORLD.inner;     // 圆之外就是深渊，礁石只撒在岛上
  const inDisc = (c, k = 1) => (x, z) => Math.hypot(x - c.x, z - c.z) < c.r * k;
  const rules = [
    { x0: G.x - G.r, x1: G.x + G.r, z0: G.z - G.r, z1: G.z + G.r, cell: 5.0, seed: 101, keep: 0.74, jitter: 0.95,         // 珊瑚花园：礁丘上挤满了石头
      accept: (x, z) => siteClear(x, z) && inDisc(G, 0.95)(x, z), each: (x, z, r) => { const s = randLog(r, 0.6, 3.0); put(boulder(r, s), x, z, s, r); } },
    { x0: M.x - 150, x1: M.x + 150, z0: M.z - 150, z1: M.z + 150, cell: 7.5, seed: 102, keep: 0.5,                         // 台地的崖壁和坡脚
      accept: (x, z) => siteClear(x, z, 4) && regionAt(x, z) === 'slope', each: (x, z, r) => { const s = randLog(r, 1.4, 7); put(boulder(r, s), x, z, s, r); } },
    { x0: -84, x1: 84, z0: M.z - 84, z1: M.z + 84, cell: 8, seed: 103, keep: 0.5,                                           // 城墙外面的台地顶
      accept: (x, z) => siteClear(x, z, 5) && !insideCastle(x, z), each: (x, z, r) => { const s = randLog(r, 0.6, 2.2); put(boulder(r, s), x, z, s, r); } },
    { x0: K.x - K.r, x1: K.x + K.r, z0: K.z - K.r, z1: K.z + K.r, cell: 6.2, seed: 104, keep: 0.6,                          // 巨藻林的岩脊
      accept: (x, z) => siteClear(x, z) && inDisc(K, 0.98)(x, z), each: (x, z, r) => { const s = randLog(r, 0.7, 3.4); put(boulder(r, s), x, z, s, r); } },
    { x0: A.x - 360, x1: A.x + 360, z0: A.z - 360, z1: A.z + 360, cell: 9, seed: 105, keep: 0.5,                            // 断崖的崖壁和崖沿
      accept: (x, z) => siteClear(x, z, 6) && regionAt(x, z) === 'wall', each: (x, z, r) => { const s = randLog(r, 1.5, 6.5); put(boulder(r, s), x, z, s, r); } },
    { x0: -120, x1: 120, z0: -10, z1: 140, cell: 13, seed: 106, keep: 0.4,                                                 // 潟湖：几块小石头
      accept: (x, z) => siteClear(x, z) && regionAt(x, z) === 'lagoon', each: (x, z, r) => { const s = randLog(r, 0.4, 1.3); put(4 + ((r() * 2) | 0), x, z, s, r); } },
    { x0: -I, x1: I, z0: -I, z1: I, cell: 15, seed: 107, keep: 0.5,                                                        // 平原
      accept: (x, z) => siteClear(x, z, 8) && (regionAt(x, z) === 'plain' || regionAt(x, z) === 'north'), each: (x, z, r) => { const s = randLog(r, 1, 5); put(boulder(r, s), x, z, s, r); } },
  ];
  for (const rl of rules) scatter({ jitter: 0.9, ...rl });
  // 石柱：花园里一片；神庙旁边的崖沿上一排，像海蚀柱
  const r = mulberry32(seed * 977 + 3);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + r() * 0.5, d = 18 + r() * 36; put(6 + (i % 2), G.x + Math.cos(a) * d, G.z + Math.sin(a) * d, 2.0 + r() * 1.3, r, 0.12); }
  const T = SITES.statue, dir = Math.atan2(T.z - A.z, T.x - A.x);
  for (let i = 0; i < 12; i++) { const a = dir + (i - 5.5) * 0.055 + (r() - 0.5) * 0.02, d = A.r + (r() - 0.5) * 30; put(6 + (i % 2), A.x + Math.cos(a) * d, A.z + Math.sin(a) * d, 1.6 + r() * 1.6, r, 0.14); }
  // 礁盘西边的一座天然石拱：两根石柱，顶上架着一块长条的大石
  const ax = 96, az = 48, ya = height(ax, az);
  put(6, ax - 5, az + 2.7, 3.0, r, 0.05, 0.05); put(6, ax + 5, az - 2.7, 3.0, r, 0.05, 0.05);
  const pal = ROCK_TINTS[0];
  items[2].push({ x: ax, y: ya + 10.0, z: az, q: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(5.4, 10)), s: 4.6, color: pal.map((c) => c * 0.85) });
  colliders.push({ x: ax, z: az, r: 7.5, y0: ya + 9.6, y1: ya + 14.5 });
  return { items, colliders };
}

/** 生成几何和材质，搭成一组实例化网格 */
export function buildRocks(W, TX, sc) {
  const material = rockMaterial(W, TX);
  const meshes = sc.items.flatMap((items, i) => instanced(rockGeometry(ROCK_VARIANTS[i]), material, items, { name: `rocks.${i}`, chunk: 110 }));
  return { group: groupOf(meshes, 'rocks'), meshes, material };
}
