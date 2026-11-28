// 「深海王城」的布局和海底地形的高度场。纯计算，不依赖 three，可在 Node 里测试。
// 坐标：x 向东，z 向南，y 向上，水面在 y = 0。所有高度都是负的。
//
// 布局（从上往下看，北在上）：
//   中央偏北是王城所在的石灰岩台地；台地南面是一道石堤，跨过潟湖，接到南边的岬角（进城的路线）；
//   东边是珊瑚花园（礁丘、石柱群），西边是巨藻林所在的岩脊，西南坡上躺着一艘沉船；
//   东北方向地面在一条圆弧上断开，掉进三百多米深的深渊（断崖），断崖边上有一圈神庙遗迹和一尊半埋的巨像。
import { clamp01, smoothstep, fbm2 } from './mathx.js';

export const WORLD = Object.freeze({
  inner: 260, extent: 1120, floor: -54,
  mount: { x: 0, z: -75, top: -36, plateau: 72, cliff: 86, foot: 120 },
  lagoon: { x: 0, z: 62, rx: 84, rz: 66, y: -51.5 },
  spur: { x: 0, z: 128, rx: 40, rz: 46, top: -39 },
  garden: { x: 128, z: 36, r: 98, top: -24 },
  kelp: { x: -154, z: -40, r: 104, top: -17 },
  abyss: { x: -60, z: 40, r: 292, rim: 14, wall: 46, floor: -330 },
});

const lerp = (a, b, t) => a + (b - a) * t;
const ridge = (v) => 1 - Math.abs(v);
const dist = (x, z, c) => Math.hypot(x - c.x, z - c.z);

/** 王城的平面（相对台地中心的局部坐标：x 向东，z 向南）。ring 是城墙的中心线，从南面的城门起按“城外在左”的走向绕一圈 */
export const CASTLE = Object.freeze({
  x: WORLD.mount.x, z: WORLD.mount.z, y: WORLD.mount.top,
  ring: [[0, 45], [27, 40], [45, 23], [52, -2], [44, -27], [18, -45], [-16, -47], [-42, -33], [-54, -6], [-42, 28]],
  wallH: 8, wallT: 2.6, floor: 0.9,                                     // 庭院的铺地面比台地顶高这么多
  hall: { hx: 10, z0: -23, z1: 4, h: 14.5, rise: 9.4, rc: 10.82, drum: 16, domeR: 11.1, domeH: 8.6 },   // 王座厅：半宽、后殿中心、檐口高、屋脊再高、鼓座高、穹顶
  bridge: { z0: -30, z1: 96, span: 14, y: -35.9, w: 9 },                 // 石桥：从城门往南跨过潟湖，每 14 米一个桥墩
});
/** 几处“留空地”的地方：沉船、断崖边的神庙和巨像、村落。别的东西不往这里撒，留给它们自己 */
export const SITES = Object.freeze({
  wreck: { x: -64, z: 160, r: 30 }, temple: { x: 60, z: -200, r: 30 }, statue: { x: 66, z: -214, r: 18 }, village: { x: -118, z: 150, r: 34 },
});
/** 这一点上能不能随便放东西（不在留空地里，也不在石桥的轴线上） */
export function siteClear(x, z, pad = 0) {
  if (Math.abs(x) < 9 && z > -36 && z < 100) return false;
  for (const s of Object.values(SITES)) if (Math.hypot(x - s.x, z - s.z) < s.r + pad) return false;
  return true;
}

/** 海底冒泡口的位置（[x, z]）：台地南缘石桥旁边、潟湖、礁盘、巨藻林、王城的庭院里、沉船东边的平原 */
export const VENTS = Object.freeze([[-16, -2], [27, 66], [150, -12], [-134, -26], [-20, -47], [60, 150]]);

/** 点在不在王座厅里（连后殿）。厅上有屋顶，海床的沙不该堆进来 */
export function inHall(x, z) {
  const lx = x - CASTLE.x, lz = z - CASTLE.z, H = CASTLE.hall;
  return Math.abs(lx) < H.hx + 1.2 && lz > H.z0 - H.rc - 1.2 && lz < H.z1 + 1.5;
}

/** 点在不在城墙里面 */
export function insideCastle(x, z) {
  const P = CASTLE.ring; let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const xi = P[i][0] + CASTLE.x, zi = P[i][1] + CASTLE.z, xj = P[j][0] + CASTLE.x, zj = P[j][1] + CASTLE.z;
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * 海底高度（米）。
 * @param {number} [detail=1] 0 = 只算大形状（远处粗网格用，省时间）
 */
export function height(x, z, detail = 1) {
  const W = WORLD;
  let h = W.floor + 2.4 * fbm2(x / 130, z / 130, 3, 11) + (detail ? 1.1 * fbm2(x / 33, z / 33, 3, 12) + 0.35 * fbm2(x / 7.5, z / 7.5, 2, 13) : 0);
  // 潟湖：平、细沙，中间略深
  const L = W.lagoon, el = Math.hypot((x - L.x) / L.rx, (z - L.z) / L.rz);
  if (el < 1.6) { const t = smoothstep(1.6, 0.9, el), hl = L.y - 1.6 * (1 - Math.min(1, el) ** 2) + 0.5 * fbm2(x / 40, z / 40, 2, 14); h = lerp(h, hl, t); }
  // 南边的岬角：石堤的起点
  const S = W.spur, es = Math.hypot((x - S.x) / S.rx, (z - S.z) / S.rz);
  if (es < 1.5) h = Math.max(h, lerp(h, S.top + 2.2 * fbm2(x / 22, z / 22, 3, 15), smoothstep(1.5, 0.55, es)));
  // 王城的台地：顶上是平的，南面留一道供石堤上来的缓坡，其余三面是陡崖和碎石坡
  const M = W.mount, r = dist(x, z, M);
  if (r < M.foot + 24) {
    const south = smoothstep(-16, 26, z - M.z);                                             // 1 = 台地南侧
    const cliffIn = lerp(M.cliff, M.cliff + 16, south), foot = lerp(M.foot, M.foot + 22, south);
    const t = smoothstep(M.plateau, cliffIn, r), u = smoothstep(cliffIn, foot, r);
    const rocky = fbm2(x / 9, z / 9, 3, 16) * (detail ? 1 : 0.4);
    let m = M.top + 0.9 * fbm2(x / 26, z / 26, 2, 17);
    if (r < 60 && insideCastle(x, z) && !inHall(x, z)) {                                        // 城里：铺地面上盖着一片片的沙，靠墙的地方积得厚（王座厅里不堆）
      const rc = dist(x, z, { x: 0, z: -46 });
      m = Math.max(m, M.top + CASTLE.floor - 0.08 + 0.85 * smoothstep(-0.05, 0.42, fbm2(x / 12 + 5, z / 12, 2, 26)) + 0.3 * smoothstep(22, 44, rc));
    }
    m = lerp(m, M.top - 11 + rocky * 2.6, t);                                               // 崖
    m = lerp(m, W.floor + 1.5, u * u * (3 - 2 * u));                                        // 碎石坡
    h = Math.max(h, m);
  }
  // 珊瑚花园：一堆礁丘
  const G = W.garden, rg = dist(x, z, G);
  if (rg < G.r) {
    const lumps = 0.70 + 0.26 * fbm2(x / 24 + 3, z / 24, 3, 18) + 0.10 * ridge(fbm2(x / 15, z / 15 + 7, 2, 25)) + 0.14 * fbm2(x / 6, z / 6, 2, 19);
    const reef = W.floor + (G.top - W.floor) * Math.exp(-((rg / (G.r * 0.74)) ** 2)) * lumps * 1.25;
    h = Math.max(h, reef);
  }
  // 巨藻林的岩脊
  const K = W.kelp, rk = dist(x, z, K);
  if (rk < K.r) {
    const t = smoothstep(K.r, K.r * 0.35, rk);
    h = Math.max(h, W.floor + (K.top - W.floor) * t + (detail ? 2.6 * fbm2(x / 16, z / 16, 3, 20) : 0));
  }
  // 深渊：圆弧之外地面掉下去，崖壁上有台阶和沟槽
  const A = WORLD.abyss, ra = dist(x, z, A), out = smoothstep(A.r - A.rim, A.r + A.wall, ra);
  if (out > 0) {
    const wallBand = smoothstep(A.r - A.rim, A.r + 6, ra) * (1 - smoothstep(A.r + 6, A.r + A.wall + 20, ra));
    const ledges = ridge(fbm2(x / 13, z / 13, 3, 21)) * 26 * wallBand;
    const deep = A.floor + 26 * fbm2(x / 190, z / 190, 3, 22) + 7 * fbm2(x / 48, z / 48, 2, 23);
    h = lerp(h, deep, out * out * (3 - 2 * out)) + ledges * out;
  }
  return h;
}

/** 高度场的法线（有限差分），写进 out[0..2] */
export function normalAt(x, z, out = [0, 1, 0], e = 0.6) {
  const dx = height(x + e, z) - height(x - e, z), dz = height(x, z + e) - height(x, z - e), l = Math.hypot(dx, 2 * e, dz);
  out[0] = -dx / l; out[1] = 2 * e / l; out[2] = -dz / l;
  return out;
}

/** 这一点的地名（给界面用）：室里和几处古迹优先，然后才按区 */
export function placeAt(x, y, z) {
  if (y > -36 && Math.abs(x) < 10.6 && z > -108 && z < -70.6) return '王座厅';
  if (y > -37.5 && Math.abs(x) < 5 && z > -30 && z < 82) return '石桥';
  if (y > -37.5 && Math.abs(x) < 9.5 && z >= -36 && z < -18) return '王城 · 南门';
  if (dist(x, z, SITES.temple) < 20) return '断崖 · 神庙';
  if (dist(x, z, SITES.statue) < 24) return '深渊巨像';
  if (dist(x, z, SITES.village) < 24) return '圆屋村落';
  if (dist(x, z, SITES.wreck) < 30) return '沉船';
  if (Math.hypot(x - 96, z - 48) < 14) return '石拱';
  const r = regionAt(x, z);
  if (r === 'castle') return insideCastle(x, z) ? '王城 · 城内' : '王城 · 城墙';
  return { slope: '王城 · 台地', causeway: '潟湖', garden: '珊瑚花园', kelp: '巨藻林', lagoon: '潟湖', wreck: '沉船', north: '北面的平原', plain: '海底平原', wall: '深渊断崖', abyss: '深渊' }[r] ?? '深海';
}

/** 这一点在哪个区（给散布规则用） */
export function regionAt(x, z) {
  const W = WORLD;
  if (dist(x, z, W.abyss) > W.abyss.r) return dist(x, z, W.abyss) > W.abyss.r + W.abyss.wall ? 'abyss' : 'wall';
  const r = dist(x, z, W.mount);
  if (r < W.mount.plateau + 10) return 'castle';
  if (r < W.mount.foot + 24) return 'slope';
  if (Math.abs(x) < 30 && z > -28 && z < 118) return 'causeway';
  if (dist(x, z, W.garden) < W.garden.r) return 'garden';
  if (dist(x, z, W.kelp) < W.kelp.r) return 'kelp';
  if (Math.hypot((x - W.lagoon.x) / W.lagoon.rx, (z - W.lagoon.z) / W.lagoon.rz) < 1.3) return 'lagoon';
  if (z > 100 && z < 190 && Math.abs(x) < 80) return 'wreck';
  if (z < -150) return 'north';
  return 'plain';
}
