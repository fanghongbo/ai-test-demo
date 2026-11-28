// 「深海王城」：台地顶上的一圈城墙和角塔、南面的门楼（举着三叉戟的守望者石像、落了一半的铁闸）、
// 王座厅（尖拱长窗和彩窗、玫瑰窗、铜绿的屋面塌了两个洞、鼓座上一圈小尖塔、金肋穹顶、王座和它头顶的明珠）、
// 西侧的八边形残塔、东侧的圆塔、庭院里的喷泉和灯柱、两座只剩墙的偏殿、跨过潟湖的石桥（最后一跨塌了）。
// 全部用 arch.js 的积木搭出来（石像是 statue.js），按材质合成少量网格；同时登记碰撞体、可供珊瑚附着的生长点、灯笼。
import * as THREE from 'three';
import { createBatcher, uvBox } from '../gfx/batch.js';
import { createArch, openingPoints, frameGeo, ruinedDrum, scaleUV, cylUV, yawOf, circlePoints, slab } from './arch.js';
import { CASTLE, height } from '../core/seabed.js';
import { ROSE_REGION } from './glass_tex.js';
import { placeStatue, statueSurface, cloakPoint } from './statue.js';
import { TAU } from '../core/mathx.js';

const C = CASTLE, G = C.y, H = C.hall;
const W2 = (p) => [C.x + p[0], C.z + p[1]];
const K = H.rc * Math.sin(Math.PI / 8);                                    // 八边形的顶点比边的中点多伸出去的距离
const TEAL = [0.30, 1.55, 1.85], WARM = [2.0, 1.15, 0.42], PEARL = [1.5, 2.1, 2.7];
const loc = new THREE.Matrix4(), rotY = new THREE.Matrix4(), rotX = new THREE.Matrix4();

/** 后殿鼓座（八边形）的八个顶点，按角度排。角从东边量起、朝南转 */
function apseVerts() {
  const v = [];
  for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; v.push([H.hx / Math.cos(Math.PI / 8) * Math.cos(a), H.z0 + H.rc * Math.sin(a)]); }
  return v;
}

export function buildCastle(AM) {
  const { M, tile } = AM;
  const B = createBatcher(), colliders = [], spots = [], lanterns = [], pools = [];          // pools：彩窗的光斑（actors/lightpools.js）
  const kit = createArch(B, M, tile, { colliders, spots, seed: 11, y0: G });                 // 城里的积木：y 是相对台地顶的高度
  const kitW = createArch(B, M, tile, { colliders, spots, seed: 11 });                    // 石桥：直接用世界坐标
  const { put, at, box, cyl, R } = kit;
  /** 碎砖堆的高度：落在这一片实际的沙面上（风沙会堆得比台地顶、比庭院的铺地高），最低是 lo */
  const onGround = (x, z, lo) => Math.max(lo, height(x, z) - G - 0.25);
  /** 城的局部坐标（ly 是相对台地顶的高度）→ 世界 */
  const F = (lx, ly, lz, yaw = 0) => at(C.x + lx, ly, C.z + lz, yaw);
  /** 水平的一块板（城的局部 xz 多边形），面朝上 */
  const flat = (mat, pts, y, tl, tint) => put(mat, scaleUV(new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))), 4), 1 / tl, 1 / tl), new THREE.Matrix4().makeTranslation(C.x, G + y, C.z).multiply(rotX.makeRotationX(-Math.PI / 2)), tint);

  /** 灯柱（arch.js 的积木）：y 是地面的高度，灯珠在 4.5 米高。光晕和点光源在别处统一画 */
  const lantern = (x, y, z, col, power = 1, r = 2.2) => kit.lantern(x, y + 4.5, z, col, power, true, r, lanterns);
  const lanternW = (x, y, z, col, power, r) => kitW.lantern(x, y, z, col, power, false, r, lanterns);      // 石桥的桥墩顶上的灯：世界坐标，坐在石墩上
  const chandelier = (x, y, z, r) => {
    B.rod(M.iron, [x, y + G + 1.3, z], [x, y + G, z], 0.05, 0x333333, 6);
    put(M.bronze, new THREE.TorusGeometry(r, 0.09, 6, 36), at(x, y, z).multiply(rotX.makeRotationX(Math.PI / 2)));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU, c = Math.cos(a), s = Math.sin(a);
      B.rod(M.bronze, [x, y + G + 1.2, z], [x + r * c, y + G, z + r * s], 0.04, 0xffffff, 5);
      put(M.glow, new THREE.SphereGeometry(0.2, 10, 8), at(x + r * 0.9 * c, y + 0.28, z + r * 0.9 * s), WARM);
    }
    put(M.glow, new THREE.SphereGeometry(0.36, 12, 10), at(x, y - 0.55, z), WARM);
    lanterns.push({ p: [x, y - 0.2 + G, z], c: WARM, power: 1.5, r: 3.2 });
  };

  // ───── 城墙和角塔 ─────
  const roofs = ['broken', 'cone', 'crenel', 'broken', 'cone', 'cone', 'broken', 'cone', 'crenel'];
  const gaps = { 1: [[15, 18.6, 0.3, 0.55]], 3: [[5.5, 19, 0.12, 0.5]], 6: [[9, 15.5, 0.2, 0.6]], 8: [[12, 16.5, 0.3, 0.7]] };
  /** 把线段的一端往里收 d 米：门楼两边的那两段城墙到门楼的前脸为止，不伸进门洞里 */
  const trim = (p, q, d) => { const l = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + ((q[0] - p[0]) * d) / l, p[1] + ((q[1] - p[1]) * d) / l]; };
  C.ring.forEach((p, i) => {
    const v = C.ring[(i + 1) % C.ring.length], a = W2(p), b = W2(i === 9 ? trim(v, p, 9) : v), L = Math.hypot(b[0] - a[0], b[1] - a[1]), openings = [];
    if (i === 0) { const t = trim(p, v, 9); Object.assign(p, {}); a.length = 0; a.push(C.x + t[0], C.z + t[1]); }
    for (let s = 7; s < L - 6; s += 7.5) openings.push({ kind: 'slit', x: s, w: 0.9, h: 1.7, sill: 4.4 });
    const g = gaps[i] ?? [];
    kit.wall(a, b, { h: C.wallH, t: C.wallT, base: -3.4, openings, gaps: g, crenel: true, course: [3.3], tint: 0.74 });
    for (const [s0, s1] of g) { const m = kit.world(a, yawOf(a, b), (s0 + s1) / 2, 0, C.wallT / 2 + 3.2); kit.rubble(m[0], onGround(m[0], m[2], -0.2), m[2], 18, 7.5, { tint: 0.68, max: 1.8 }); }
    if (i > 0) kit.tower(a[0], a[1], { r: i % 3 === 0 ? 5.0 : 4.3, h: 11 + (i % 2) * 1.1, roof: roofs[i - 1], tint: 0.7 });
  });

  // ───── 门楼：跨在城墙上的方堡 + 一对圆塔 + 落了一半的铁闸 + 两尊守望者 ─────
  const gh = { z: 40, hw: 8.5, d: 10.5, h: 13 }, gz = C.z + gh.z + gh.d;                                           // gz：门楼前脸
  kit.wall(W2([-gh.hw, gh.z]), W2([gh.hw, gh.z]), { h: gh.h, t: gh.d, base: -3.4, tint: 0.82, course: [10.4], plinth: false, noCollide: true, openings: [{ x: gh.hw, w: 5.2, h: 8.8, spring: 0.58, frame: true, frameMat: M.stone, fw: 0.45, pass: true }] });
  for (let i = 0; i < 9; i++) box(M.stone, 0.5, 0.85, 0.75, C.x - 8 + i * 2, 11.5, gz + 0.2, 0.8, 0, tile.stone);           // 挑台下的梁托
  box(M.stone, gh.hw * 2 + 1.0, 1.7, 1.25, C.x, 12.75, gz + 0.35, 0.8, 0, tile.stone);                        // 挑出来的护墙
  for (let i = 0; i < 7; i++) box(M.stone, 1.3, 1.25, 0.9, C.x - 7.5 + i * 2.5, 14.2, gz + 0.45, 0.8, 0, tile.stone);
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) box(M.stone, 0.8, 1.2, 1.2, C.x + sx * (gh.hw - 0.4), 13.6, C.z + gh.z + 1.2 + i * 1.9, 0.8, 0, tile.stone);
  colliders.push({ box: [C.x - gh.hw, C.x - 2.6, C.z + gh.z, gz], y0: G - 3, y1: G + gh.h }, { box: [C.x + 2.6, C.x + gh.hw, C.z + gh.z, gz], y0: G - 3, y1: G + gh.h }, { box: [C.x - 2.6, C.x + 2.6, C.z + gh.z, gz], y0: G + 8.6, y1: G + gh.h });
  for (const sx of [-1, 1]) {
    kit.tower(C.x + sx * 10.4, C.z + 46.5, { r: 4.4, h: 15, coneH: 9, tint: 0.78, windows: [{ a: Math.PI / 2, y: 0.5 }, { a: Math.PI / 2 - 0.5, y: 0.78, w: 0.9, h: 2.0 }, { a: Math.PI / 2 + 0.5, y: 0.78, w: 0.9, h: 2.0 }] });
    box(M.marble, 2.7, 1.8, 2.7, C.x + sx * 6.9, 0.3, C.z + 54.8, 0.8, 0.08, tile.marble);                     // 守望者的基座
    const mS = F(sx * 6.9, 1.2, 54.8, sx * 0.06);
    placeStatue(kit, M, tile, mS, 0.92, 0.7);
    colliders.push({ box: [C.x + sx * 6.9 - 1.35, C.x + sx * 6.9 + 1.35, C.z + 54.8 - 1.35, C.z + 54.8 + 1.35], y0: G - 2, y1: G + 1.2 }, { x: C.x + sx * 6.9, z: C.z + 54.8, r: 1.4, y1: G + 7.4 });   // 基座和像身都挡人（披风的下摆甩出去 1.4 米）
    /** 石像身上的生长点：像自己的坐标（肩头顶上、披风的背面）→ 城的坐标。top：朝上长的那一层 */
    const onStatue = (l, n, s) => { const p = l.applyMatrix4(mS), q = new THREE.Vector3(n[0], n[1], n[2]).transformDirection(mS); return { p: [p.x, p.y, p.z], n: [q.x, q.y, q.z], s, top: true }; };
    spots.push({ p: [C.x + sx * 6.9 + 0.9, G + 1.22, C.z + 54.8 + 0.7], s: 0.5 }, onStatue(statueSurface([-0.6, 4.42, 0], [0, 1, 0], 0, 0.6), [0, 1, 0], 0.22), onStatue(new THREE.Vector3(...cloakPoint(0.3, 0.5)), [0, 0.3, -0.95], 0.22));
  }
  // 铁闸：吊在门洞的上半截，尖朝下，人从下面过
  for (let i = 0; i < 11; i++) {
    const x = C.x - 2.2 + i * 0.44;
    B.rod(M.iron, [x, G + 4.95, C.z + 47], [x, G + 7.9, C.z + 47], 0.065, 0xffffff, 6);
    cyl(M.iron, 0.005, 0.1, 0.55, x, 4.68, C.z + 47, 1, 6, false, tile.bronze);
  }
  for (const y of [5.5, 6.6, 7.6]) box(M.iron, 4.7, 0.1, 0.12, C.x, y, C.z + 47, 1, 0, tile.bronze);
  colliders.push({ box: [C.x - 2.5, C.x + 2.5, C.z + 46.9, C.z + 47.1], y0: G + 4.3, y1: G + 8.6 });
  for (const sx of [-1, 1]) kitW.lantern(C.x + sx * 2.25, G + 5.2, C.z + 43.6, TEAL, 0.9, false, 2.0, lanterns);   // 门洞里两盏挂在闸门边的灯
  for (let i = 0; i < 3; i++) box(M.paving, 5.2, 0.26, 0.9, C.x, 0.77 - i * 0.26, C.z + 45.5 + i * 0.9, 0.85, 0, tile.paving);   // 门洞里下桥的三级台阶

  // ───── 庭院：铺地、喷泉、灯柱、两座只剩墙的偏殿、倒下的柱子 ─────
  flat(M.paving, C.ring, C.floor, tile.paving, 0.8);
  {
    const fc = [0, 25], fr = 4.3 / Math.cos(Math.PI / 8), fv = [];
    for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + (k * Math.PI) / 4; fv.push([fc[0] + fr * Math.cos(a), fc[1] + fr * Math.sin(a)]); }
    for (let k = 0; k < 8; k++) kit.wall(W2(fv[(k + 1) % 8]), W2(fv[k]), { h: 1.3, t: 0.55, base: -0.5, tint: 0.78, plinth: false });
    cyl(M.marble, 0.95, 1.2, 2.6, C.x, 1.6, C.z + fc[1], 0.8, 8, false, tile.marble);
    cyl(M.marble, 1.35, 0.6, 0.35, C.x, 3.05, C.z + fc[1], 0.82, 8, false, tile.marble);
    placeStatue(kit, M, tile, F(fc[0], 3.2, fc[1], -0.5), 0.42, 0.62);
    colliders.push({ x: C.x + fc[0], z: C.z + fc[1], r: 0.7, y1: G + 6.2 });
    for (let k = 0; k < 10; k++) { const a = R() * TAU, d = 0.9 + R() * 2.6; spots.push({ p: [C.x + Math.cos(a) * d, G + C.floor + 0.02, C.z + fc[1] + Math.sin(a) * d], s: 0.5 + R() * 0.7 }); }
  }
  for (const z of [14, 22, 30, 38]) for (const sx of [-1, 1]) lantern(C.x + sx * 4.6, C.floor, C.z + z, TEAL, 1);
  lantern(C.x - 5.8, C.floor, C.z + 7.6, TEAL, 1); lantern(C.x + 5.8, C.floor, C.z + 7.6, TEAL, 1);
  /** 一座只剩墙的偏殿：北墙和西墙还在（西墙上开门），南墙塌了一段，东墙基本没了 */
  const ruinHall = (x0, z0, x1, z1, o = {}) => {
    const w = { h: o.h ?? 6.4, t: 0.9, base: -2.2, tint: 0.72, slit: o.slit ?? 9, slitY: 3.6 }, D = z1 - z0;
    kit.wall(W2([x0, z0]), W2([x1, z0]), { ...w, gaps: o.gN, course: [4.2] });
    kit.wall(W2([x0, z1]), W2([x1, z1]), { ...w, gaps: o.gS ?? [[2, 7, 0.1, 0.45]], course: [4.2] });
    kit.wall(W2([x0, z1]), W2([x0, z0]), { ...w, gaps: o.gW, course: [4.2], openings: [{ x: D / 2, w: 2.4, h: 4.2, pass: true, spring: 0.55 }, { x: D * 0.82, w: 1.4, h: 3, sill: 2.4, frameMat: M.stone }] });
    kit.wall(W2([x1, z0]), W2([x1, z1]), { ...w, gaps: o.gE ?? [[0.5, 2, 0.1, 0.3], [7.5, 11, 0.15, 0.5]], course: [4.2] });
    kit.rubble(C.x + (x0 + x1) / 2 + 2, onGround(C.x + (x0 + x1) / 2 + 2, C.z + (z0 + z1) / 2 + 1, C.floor + 0.2), C.z + (z0 + z1) / 2 + 1, 22, 5.5, { tint: 0.66, max: 1.1 });
  };
  ruinHall(27, 3, 43, 15, { gN: [[6, 9.5, 0.2, 0.55]] });
  ruinHall(-43, 1, -29, 12, { gW: [[3, 6.5, 0.2, 0.5]], gN: [[2.5, 5, 0.25, 0.6], [10, 12, 0.2, 0.5]] });
  for (const sx of [-1, 1]) {
    kit.column(C.x + sx * 6.4, C.floor, C.z + 8.4, 7.4, 0.46, { tint: 0.72 });
    kit.column(C.x + sx * 11.2, C.floor, C.z + 7.2, 7.4, 0.46, { broken: true, tint: 0.68 });
    for (let i = 0; i < 3; i++) put(M.marble, cylUV(new THREE.CylinderGeometry(0.44, 0.44, 1.0, 18), 0.44, 1, tile.marble), at(C.x + sx * (12.6 + i * 1.05), C.floor + 0.4, C.z + 8.6 + (R() - 0.5) * 2, R() * TAU).multiply(rotX.makeRotationX(Math.PI / 2)).multiply(loc.makeTranslation(0, 0.5, 0)), 0.66);   // 倒在地上的柱鼓
  }

  // ───── 王座厅：带扶壁的侧墙和高窗、正门和山墙上的玫瑰窗、后殿的鼓座和穹顶 ─────
  const hallPool = { list: pools, y: C.floor + 0.08 + 0.05, c: [C.x, C.z + H.z0 + 8] };              // 彩窗的光斑落在厅里的地砖上
  // 窗台压得低、窗子开得大：厚墙里斜着进来的日光，只有窗洞下半截能穿到地面，窗子越大，落在地砖上的彩光越大
  const win = { w: 3.4, h: 8.8, sill: 4.0, frame: true, frameMat: M.marble, tracery: true, glass: 1, fw: 0.3 };
  const winM = { w: 2.8, h: 8.0, sill: 4.4, frame: true, frameMat: M.marble, glass: 1, fw: 0.26 };
  const winN = { w: 2.6, h: 9.4, sill: 2.6, frame: true, frameMat: M.marble, tracery: true, glass: 1, fw: 0.3 };
  const clerest = { w: 2.0, h: 3.0, sill: 12.1, frame: true, frameMat: M.marble, fw: 0.22 };
  for (const sx of [1, -1]) {
    const x = sx * H.hx;
    const west = sx < 0, g = west ? [3, 1, 3, 1] : [2, 1, 2, 1];                                 // 西墙上的窗：午后的太阳从这儿进来；东墙上的：清晨
    kit.wall(W2([x, H.z1]), W2([x, H.z0 - K]), { h: H.h, t: 1.3, base: -2.8, tint: 0.86, course: [H.h - 0.35], frameTint: 0.8, pool: hallPool, openings: [{ ...winM, x: H.z1 + 21, glass: g[0] }, { ...win, x: H.z1 + 13.9, glass: g[1] }, { ...win, x: H.z1 + 6.7, glass: g[2] }, { ...win, x: H.z1, glass: g[3] }] });
    kit.wall(W2([x, H.z0 + K]), W2([x, H.z0 - K]), { h: 1.5, yBase: H.h, base: -0.3, tint: 0.8, plinth: false });               // 鼓座这一段比屋檐高出一截
    for (const z of [-17.5, -10.3, -3.1, 3.0]) kit.buttress(C.x + x, C.z + z, sx > 0 ? 0 : Math.PI, 12.6, { tint: 0.78 });
  }
  kit.wall(W2([-H.hx, H.z1]), W2([H.hx, H.z1]), { h: H.h, t: 1.7, base: -2.8, tint: 0.88, course: [H.h - 0.35], frameTint: 0.8, pool: hallPool, openings: [
    { x: H.hx, w: 5.0, h: 8.4, spring: 0.6, frame: true, frameMat: M.marble, fw: 0.5, pass: true },
    { ...win, x: H.hx - 5.6, w: 2.0, h: 6.6, tracery: false, glass: 3 }, { ...win, x: H.hx + 5.6, w: 2.0, h: 6.6, tracery: false, glass: 2 }] });
  const V = apseVerts(), len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  // 鼓座的六个面。外侧的三面（西北、北、东北）走成“外面在左”；朝厅里的三面（东南、南、西南）是大拱廊，人能穿过去
  for (const [name, a, b] of [['SE', V[0], V[1]], ['S', V[1], V[2]], ['SW', V[2], V[3]], ['NW', V[5], V[4]], ['N', V[6], V[5]], ['NE', V[7], V[6]]]) {
    const wa = W2(a), wb = W2(b), l = len(a, b) / 2, arcade = name !== 'N' && name !== 'NW' && name !== 'NE', L = len(a, b);
    kit.wall(wa, wb, {
      h: H.drum, t: 1.5, base: -2.8, tint: arcade ? 0.97 : 0.84, course: [], plinth: false, cope: false, frameTint: arcade ? 0.95 : 0.8, pool: { list: pools, y: C.floor + 0.13, c: [C.x, C.z + H.z0] },
      openings: arcade ? [{ x: l, w: L - 2.3, h: 10.6, spring: 0.64, frame: true, frameMat: M.marble, fw: 0.42, pass: true }]
        : name === 'N' ? [{ ...winN, x: l, w: 2.2, h: 9.6, glass: 4 }, { ...winN, x: l - 2.07, w: 1.7, h: 8.6, sill: 3.0, glass: 5 }, { ...winN, x: l + 2.07, w: 1.7, h: 8.6, sill: 3.0, glass: 4 }, { ...clerest, x: l, w: 2.2, glass: 6 }]
        : [{ ...winN, x: l, glass: name === 'NW' ? 4 : 5 }, { ...clerest, x: l, glass: 6 }],
    });
    const mid = [(wa[0] + wb[0]) / 2, (wa[1] + wb[1]) / 2], n = [-(wb[1] - wa[1]) / L, (wb[0] - wa[0]) / L];        // 鼓座顶上挑出去的一圈檐口
    box(M.stone, L + 0.9, 0.5, 2.3, mid[0] + n[0] * 0.75, H.drum + 0.25, mid[1] + n[1] * 0.75, 0.82, yawOf(wa, wb), tile.stone);
  }
  for (const v of V) {                                                                                                       // 鼓座八个角上的小尖塔
    const [x, z] = W2(v);
    cyl(M.stone, 0.5, 0.62, 1.5, x, H.drum + 1.75, z, 0.84, 8, false, tile.stone);
    put(M.patina, cylUV(new THREE.ConeGeometry(0.72, 2.9, 8), 0.4, 3.0, tile.patina), at(x, H.drum + 3.95, z));
    cyl(M.gold, 0.012, 0.07, 0.9, x, H.drum + 5.85, z, 1, 6, false, tile.gold);
    spots.push({ p: [x + 0.2, H.drum + 2.0 + G, z + 0.25], s: 0.35 });
  }
  const domeTop = kit.dome(C.x, H.drum + 0.05, C.z + H.z0, H.domeR, H.domeH);

  // 山墙和玫瑰窗
  const gw = H.hx + 0.75, gy = H.h - 0.3, gap = H.h + H.rise + 0.2, rc = 2.9, ry = 17.5;
  put(M.stone, scaleUV(slab([[0, gy], [gw * 2, gy], [gw, gap]], [circlePoints(rc).map(([x, y]) => [x + gw, y + ry])], 1.7), 1 / tile.stone, 1 / tile.stone), at(C.x - gw, 0, C.z + H.z1), 0.86);
  {
    const y = ry, z = C.z + H.z1 + 0.12;
    put(M.marble, new THREE.TorusGeometry(rc, 0.1, 6, 44), at(C.x, y, z), 0.8);
    put(M.marble, new THREE.TorusGeometry(rc * 0.3, 0.09, 6, 24), at(C.x, y, z), 0.8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU, c = Math.cos(a), s = Math.sin(a);
      B.rod(M.marble, [C.x + rc * 0.3 * c, y + G + rc * 0.3 * s, z], [C.x + rc * c, y + G + rc * s, z], 0.06, 0.8, 6);
      put(M.marble, new THREE.TorusGeometry(rc * 0.17, 0.06, 6, 18), at(C.x + rc * 0.645 * Math.cos(a + Math.PI / 8), y + rc * 0.645 * Math.sin(a + Math.PI / 8), z), 0.8);
    }
    put(M.rose, new THREE.CircleGeometry(rc - 0.06, 40), at(C.x, y, z + 0.9), [1, 1, 1]);
    pools.push({ c: [C.x, y + G, z + 0.9], u: [1, 0, 0], n: [0, 0, -1], pts: circlePoints(rc - 0.08, 28), w: 2 * rc, h: 2 * rc, region: ROSE_REGION, yFloor: G + hallPool.y, run: 19 });
  }
  // 屋面：两坡，各塌了一个洞；后殿两角上是小平顶
  const board = (e0, e1, r0, r1, z0, z1, thick, mat, tl, tint) => {
    const dx = r0 - e0, dy = r1 - e1, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, s = ux > 0 ? -1 : 1;
    const X = new THREE.Vector3(ux, uy, 0), Y = new THREE.Vector3(-uy * s, ux * s, 0), Z = new THREE.Vector3().crossVectors(X, Y);
    put(mat, uvBox(l, thick, z1 - z0, tl), new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(C.x + (e0 + r0) / 2, G + (e1 + r1) / 2, C.z + (z0 + z1) / 2), tint);
  };
  const ex = H.hx + 0.95, ey = H.h - 0.15, rx = 0.1, ry2 = H.h + H.rise, zb = H.z0 + K, zr = H.z0 - K + 0.05;        // zr：屋面北端（贴着拱廊）
  for (const [z0, z1] of [[zr, -6.4], [-5.1, 1.0], [2.3, H.z1 + 0.45]]) board(ex, ey, rx, ry2, z0, z1, 0.45, M.patina, tile.patina, 0.86);
  for (const [z0, z1] of [[zr, -9.6], [-8.4, -1.4], [0.0, H.z1 + 0.45]]) board(-ex, ey, -rx, ry2, z0, z1, 0.45, M.patina, tile.patina, 0.86);
  box(M.gold, 0.5, 0.55, H.z1 - zr + 0.4, C.x, ry2 + 0.25, C.z + (H.z1 + zr) / 2, 0.9, 0, tile.gold);              // 屋脊
  for (const sx of [-1, 1]) box(M.gold, 0.28, 0.3, H.z1 - zr + 0.6, C.x + sx * ex, ey - 0.1, C.z + (H.z1 + zr) / 2, 0.9, 0, tile.gold);   // 檐口的金边
  flat(M.patina, [[ex - 0.1, H.z0 - K], [ex - 0.1, zb], [K + 0.6, zb]], H.h - 0.3, tile.patina, 0.85);
  flat(M.patina, [[-ex + 0.1, H.z0 - K], [-ex + 0.1, zb], [-K - 0.6, zb]], H.h - 0.3, tile.patina, 0.85);
  // 厅里的木屋架：系梁、宝顶柱、椽、檩
  const slopeY = (x) => ey + (ex - Math.abs(x)) * ((ry2 - ey) / (ex - rx));
  for (const z of [-10.3, -3.1]) { box(M.wood, H.hx * 2, 0.6, 0.6, C.x, 13.3, C.z + z, 0.7, 0, tile.wood); B.rod(M.wood, [C.x, G + 13.3, C.z + z], [C.x, G + ry2 - 0.4, C.z + z], 0.2, 0x8a7a66, 8); chandelier(C.x, 10.9, C.z + z, 1.5); }
  for (let z = zr + 0.6; z < H.z1 - 0.2; z += 3.3) for (const sx of [-1, 1]) B.rod(M.wood, [C.x + sx * (H.hx + 0.7), G + ey + 0.1, C.z + z], [C.x, G + ry2 - 0.25, C.z + z], 0.11, 0x8a7a66, 6);
  for (const sx of [-1, 1]) B.rod(M.wood, [C.x + sx * 5.5, G + slopeY(5.5) - 0.15, C.z + zr], [C.x + sx * 5.5, G + slopeY(5.5) - 0.15, C.z + H.z1], 0.13, 0x8a7a66, 6);
  chandelier(C.x, 11.6, C.z + H.z0, 2.6);
  // 地面、御座前的台阶、王座、明珠
  const rci = H.rc - 0.055, vi = apseVerts().map(([x, z]) => [x * (rci / H.rc), H.z0 + (z - H.z0) * (rci / H.rc)]);
  flat(M.marble, [[-H.hx + 0.05, H.z1 - 0.05], [H.hx - 0.05, H.z1 - 0.05], vi[7], vi[6], vi[5], vi[4]], C.floor + 0.08, tile.marble, 0.9);
  const DC = H.z0 - 3.4, dy0 = C.floor + 0.08;
  put(M.gold, new THREE.TorusGeometry(8.7, 0.09, 6, 64), at(C.x, dy0 + 0.03, C.z + DC).multiply(rotX.makeRotationX(Math.PI / 2)), 0.9);
  for (let i = 0; i < 3; i++) put(M.marble, cylUV(new THREE.CylinderGeometry(7.3 - i, 7.3 - i, 0.5, 8), 7, 0.5, tile.marble), at(C.x, dy0 + 0.25 + i * 0.5, C.z + DC).multiply(rotY.makeRotationY(Math.PI / 8)), 0.9);
  const TZ = H.z0 - 7.0, ty = dy0 + 1.5;
  box(M.gold, 2.6, 0.75, 1.7, C.x, ty + 0.7, C.z + TZ, 0.95, 0, tile.gold);
  put(M.gold, scaleUV(slab(openingPoints(2.6, 6.0, { n: 6 }), [], 0.4), 1 / tile.gold, 1 / tile.gold), at(C.x, ty, C.z + TZ - 1.1), 0.95);
  for (const sx of [-1, 1]) { box(M.gold, 0.4, 0.9, 1.5, C.x + sx * 1.3, ty + 0.85, C.z + TZ, 0.95, 0, tile.gold); put(M.gold, new THREE.SphereGeometry(0.3, 12, 10), at(C.x + sx * 1.3, ty + 1.45, C.z + TZ + 0.65), 0.95); }
  box(M.cloth, 2.2, 0.16, 1.4, C.x, ty + 1.16, C.z + TZ + 0.1, [0.36, 0.012, 0.02], 0, 1);
  for (const sx of [-1, 1]) for (const z of [TZ - 0.6, TZ + 0.6]) box(M.gold, 0.28, 0.85, 0.28, C.x + sx * 1.05, ty - 0.05, C.z + z, 0.9, 0, tile.gold);
  put(M.glow, new THREE.SphereGeometry(0.78, 20, 14), at(C.x, ty + 7.6, C.z + TZ - 0.9), PEARL);
  lanterns.push({ p: [C.x, ty + 7.6 + G, C.z + TZ - 0.9], c: PEARL, power: 2.6, r: 4.5 });
  // 破旗
  const banner = (x, y, z, yaw, col) => {
    const nx = 6, ny = 12, pos = [], colr = [], idx = [], bl = [];
    for (let i = 0; i <= nx; i++) bl.push(7.4 - 1.5 * Math.abs(Math.sin(i * 2.9 + 0.7)) - 0.6 * Math.abs(Math.sin(i * 1.3)));
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const t = j / ny, u = i / nx, gold = t < 0.06 || (Math.abs(u - 0.5) * 2 + Math.abs(t - 0.42) * 2.4 < 0.5), w = 0.72 + 0.28 * Math.cos((u - 0.5) * Math.PI) * (1 - t * 0.25);
      pos.push((u - 0.5) * 2.1, -t * bl[i], 0.17 * Math.sin(t * 6.5 + i * 1.1) * t + 0.05 * Math.sin(i * 2.2));
      colr.push(...(gold ? [0.72, 0.5, 0.14] : col).map((v) => v * w));
    }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((nx + 1) * (ny + 1) * 2).fill(0), 2)); g.setIndex(idx); g.computeVertexNormals();
    put(M.cloth, g, at(x, y, z, yaw), 1);
  };
  for (const [z, col] of [[-17.6, [0.30, 0.012, 0.02]], [-10.3, [0.10, 0.012, 0.17]], [-3.1, [0.30, 0.012, 0.02]]]) for (const sx of [-1, 1]) banner(C.x + sx * (H.hx - 0.06), 12.9, C.z + z, sx > 0 ? -Math.PI / 2 : Math.PI / 2, col);
  kit.rubble(C.x - 5, C.floor + 0.2, C.z - 3.5, 10, 3.2, { tint: 0.7, max: 1.0 }); kit.rubble(C.x + 5.5, C.floor + 0.2, C.z + 2.6, 8, 2.8, { tint: 0.7, max: 0.9 });

  // ───── 西侧的八边形残塔、东侧的圆塔 ─────
  {
    const x = C.x - 30, z = C.z - 16, r = 6.3, hT = 24, jag = []; for (let i = 0; i < 16; i++) jag.push(0.5 + 0.5 * R());
    const top = (i) => hT * (0.42 + 0.55 * (0.5 * jag[i] + 0.5 * jag[(i + 1) % 16]));
    put(M.stone, ruinedDrum(r, 1.2, top, { seg: 16, tile: tile.stone, shape: (a) => (Math.round(a / (Math.PI / 8)) % 2 === 1 ? 0.9239 : 1) }), at(x, -1, z), 0.74);
    cyl(M.stone, r * 0.93 - 1.2, r * 0.93 - 1.2, 1, 16, x, 5.5, z, 0.7, 16, false, tile.stone);
    for (let k = 0; k < 8; k++) {                                                                                   // 八个面上各开几层尖拱龛
      const a = (k * Math.PI) / 4, rr = r * 0.9239 + 0.02;
      for (const yy of [3.2, 9.8, 16.2]) if (yy < top(2 * k + 1) - 3.6) {
        const m = at(x + rr * Math.cos(a), yy, z + rr * Math.sin(a), -a + Math.PI / 2);
        put(M.dark, new THREE.PlaneGeometry(1.3, 3.2), m.clone().multiply(loc.makeTranslation(0, 1.6, 0.02)), 1);
        put(M.marble, kit.frame('marble', 1.3, 3.2, 0.22, 0.24), m.clone().multiply(loc.makeTranslation(0, 0, -0.02)), 0.86);
      }
    }
    for (const yy of [6.6, 13.2]) put(M.stone, cylUV(new THREE.CylinderGeometry(r * 0.9239 + 0.45, r * 0.9239 + 0.5, 0.32, 8), r, 0.32, tile.stone), at(x, yy, z).multiply(rotY.makeRotationY(Math.PI / 8)), 0.76);
    colliders.push({ x, z, r: r + 0.3, y1: G + hT * 0.42 });
    for (let k = 0; k < 16; k += 2) spots.push({ p: [x + r * 0.8 * Math.cos((k / 16) * TAU), G - 1 + top(k), z + r * 0.8 * Math.sin((k / 16) * TAU)], s: 0.6 + R() * 0.8 });
  }
  kit.tower(C.x + 36, C.z - 12, { r: 5.2, h: 15.5, coneH: 9.5, tint: 0.8, windows: [{ a: Math.PI * 0.9, y: 0.35 }, { a: Math.PI * 1.2, y: 0.35 }, { a: Math.PI * 1.05, y: 0.72 }, { a: Math.PI * 1.5, y: 0.72 }] });
  kit.rubble(C.x + 30, onGround(C.x + 30, C.z - 6, 0.1), C.z - 6, 10, 4, { tint: 0.68 });

  // ───── 石桥：桥墩、半圆拱、桥面、石栏、桥墩顶上的灯。最后一跨塌了 ─────
  const BR = C.bridge, bw = BR.w - 0.2, yd = BR.y, yu = yd - 1.3, pw = 2.6, span = BR.span, n = Math.round((BR.z1 - BR.z0) / span), archW = span - pw - 0.3, rA = archW / 2, ys = yu - rA, zEnd = BR.z0 + (n - 1) * span;
  for (let i = 0; i <= n; i++) {
    const z = BR.z0 + i * span;
    kitW.box(M.stone, bw, ys + 0.5 + 56, pw + 0.7, 0, (ys + 0.5 - 56) / 2, z, 0.72, 0, tile.stone);
    kitW.box(M.stone, bw + 0.5, 0.45, pw + 1.2, 0, ys + 0.25, z, 0.74, 0, tile.stone);
    colliders.push({ box: [-bw / 2 - 0.25, bw / 2 + 0.25, z - pw / 2 - 0.6, z + pw / 2 + 0.6], y0: -60, y1: ys + 0.5 });
  }
  const archF = frameGeo(archW, rA + 0.12, 0.5, 0.4, tile.stone, { kind: 'round', n: 12 }), archH = openingPoints(archW, rA + 0.12, { kind: 'round', n: 12 }).map(([x, y]) => [x + span / 2, y + ys]);
  for (let i = 0; i < n - 1; i++) {
    const bay = kitW.at(bw / 2, 0, BR.z0 + i * span, -Math.PI / 2);
    kitW.put(M.stone, scaleUV(slab([[0, ys - 0.3], [span, ys - 0.3], [span, yu], [0, yu]], [archH], bw), 1 / tile.stone, 1 / tile.stone), bay, 0.72);
    kitW.put(M.stone, archF, bay.clone().multiply(loc.makeTranslation(span / 2, ys, 0.06)).multiply(rotY.makeRotationY(Math.PI)), 0.78);     // 两面各一圈拱石
    kitW.put(M.stone, archF, bay.clone().multiply(loc.makeTranslation(span / 2, ys, bw - 0.06)), 0.78);
    for (let k = 0; k < 5; k++) { const th = Math.PI * (0.2 + 0.6 * ((k + 0.5) / 5)), ct = Math.cos(th), st = Math.sin(th);                         // 拱腹（桥洞的内顶面）上的生长点：朝洞里长
      const sy = ys + 0.12 + (rA - 0.06) * st, sz = BR.z0 + i * span + span / 2 + (rA - 0.06) * ct;
      if (height(0, sz) < sy - 0.6) for (const fx of [0.18 + R() * 0.2, -0.18 - R() * 0.2]) spots.push({ p: [C.x + fx * bw, sy, sz], s: 0.4 + R() * 0.5, n: [-ct, -st, 0] }); }   // 靠城门的那几跨埋在缓坡里，不算
  }
  kitW.box(M.stone, BR.w, 1.3, zEnd - BR.z0, 0, yd - 0.78, (BR.z0 + zEnd) / 2, 0.78, 0, tile.stone);
  kitW.box(M.paving, BR.w - 1.5, 0.26, zEnd - BR.z0 - 0.2, 0, yd - 0.13, (BR.z0 + zEnd) / 2, 0.84, 0, tile.paving);
  colliders.push({ box: [-BR.w / 2, BR.w / 2, BR.z0, zEnd], y0: yd - 1.3, y1: yd });
  kitW.wall([BR.w / 2, BR.z0], [BR.w / 2, zEnd - 2], { h: 1.25, t: 0.9, base: -1.5, yBase: yd, tint: 0.7, gaps: [[9, 11.5, 0.1, 0.5], [60, 63.5, 0.2, 0.55], [101, 103, 0.15, 0.45]] });
  kitW.wall([-BR.w / 2, zEnd - 5], [-BR.w / 2, BR.z0], { h: 1.25, t: 0.9, base: -1.5, yBase: yd, tint: 0.7, gaps: [[22, 24.5, 0.1, 0.6], [73, 76, 0.15, 0.5], [95, 98, 0.2, 0.6]] });
  for (const i of [2, 4, 6, 8]) for (const sx of [-1, 1]) {                                                              // 桥墩顶上的灯
    const z = BR.z0 + i * span, x = sx * (BR.w / 2 - 0.45);
    kitW.box(M.stone, 1.25, 1.25, 1.25, x, yd + 0.55, z, 0.8, 0, tile.stone);
    lanternW(x, yd + 1.15, z, TEAL, 1, 2.4);
  }
  for (let i = 0; i < 7; i++) { const sx = R() < 0.5 ? -1 : 1, z = zEnd + 2 + R() * 12, s = 1.6 + R() * 2.2;               // 塌下来的桥面
    const x = sx * (2 + R() * 4);
    kitW.put(M.stone, uvBox(s, 0.9, s * 1.4, tile.stone), kitW.at(x, height(x, z) + 0.3, z, R() * TAU).multiply(rotX.makeRotationZ((R() - 0.5) * 0.5)), 0.7);
  }
  kitW.rubble(0, height(0, zEnd + 6) + 0.2, zEnd + 6, 16, 6, { tint: 0.66, max: 1.4 });

  const group = new THREE.Group(); group.name = 'castle';
  const meshes = B.build(group, { name: 'castle' });
  for (const m of meshes) if (m.material === M.glass || m.material === M.rose) m.castShadow = false;     // 玻璃不挡光：日光穿过彩窗落在地砖上，颜色由光斑（actors/lightpools.js）染
  return { group, meshes, colliders, spots, lanterns, pools, top: G + domeTop };
}
