// 沉船：一艘四十多米长的大帆船，向右舷斜躺在断桥南面的平原上，半个船身埋在沙里。
// 船身是逐站画出来的曲面（船头尖、船尾平、舷侧上部内收），朝上的左舷被炮弹打穿一个洞；
// 船尾是两层的尾楼，带一排拱窗和后甲板；甲板上有断掉的桅杆、倒下的帆桁、炮门、木桶；船头挂着锚，旁边的沙地上还躺着炮和另一只锚。
// 整条船先在自己的坐标系里搭（+x 是船头，+y 朝上），合批的时候统一乘上“位置 · 朝向 · 倾斜”（F）；碰撞体、生长点、灯笼登记的时候转成世界坐标。
import * as THREE from 'three';
import { createBatcher, uvBox } from '../gfx/batch.js';
import { createArch, scaleUV, cylUV } from './arch.js';
import { meshBuilder, paramSurface, tube, cutTriangles } from '../gfx/organic.js';
import { mulberry32 } from '../core/mathx.js';
import { SITES, height } from '../core/seabed.js';

// sink：船的原点比沙面低多少。倾斜之后左舷的舷缘高出沙面约三米、右舷埋住，龙骨在沙下四五米
const WRECK = Object.freeze({ yaw: -0.7, heel: 0.46, pitch: -0.05, half: 21, sink: 0.6 });
const TEAL = [0.30, 1.55, 1.85], I = new THREE.Matrix4();

export function buildWreck(AM) {
  const { M, tile } = AM, B = createBatcher(), spots = [], lanterns = [], colliders = [], r = mulberry32(77), H = WRECK.half;
  const S = SITES.wreck, yw = height(S.x, S.z);
  const F = new THREE.Matrix4().makeTranslation(S.x, yw - WRECK.sink, S.z)
    .multiply(new THREE.Matrix4().makeRotationY(WRECK.yaw)).multiply(new THREE.Matrix4().makeRotationX(WRECK.heel)).multiply(new THREE.Matrix4().makeRotationZ(WRECK.pitch));
  const W = (x, y, z) => { const p = new THREE.Vector3(x, y, z).applyMatrix4(F); return [p.x, p.y, p.z]; };
  B.frame = F;
  const kit = createArch(B, M, tile, { colliders: [], spots: [], seed: 5 }), { put, at, box, cyl } = kit;
  const L = (x, y, z, s) => spots.push({ p: W(x, y, z), s });

  // ───── 船体：每个横剖面从龙骨到舷缘是一条向外鼓的弧；宽度、吃水、舷缘的高度都顺着船长变 ─────
  const breadth = (x) => { const s = x / H; return s >= 0 ? 5.2 * Math.pow(Math.max(0, 1 - Math.pow(s, 2.4)), 0.62) : 5.2 * (1 - 0.55 * Math.pow(-s, 3.2)); };
  const keel = (x) => { const s = x / H; return 4.6 * (1 - 0.3 * s * s) * (s > 0.72 ? 1 - 0.7 * (s - 0.72) / 0.28 : 1) - (s < -0.9 ? 1.2 * (-s - 0.9) / 0.1 : 0); };
  const rail = (x) => 1.3 + 3.2 * (x / H) ** 2;
  const sec = (x, t) => { const d = keel(x), h = rail(x), w = breadth(x) * Math.pow(Math.sin(Math.PI * 0.5 * Math.min(1, t / 0.8)), 0.85) * (1 - 0.07 * Math.max(0, (t - 0.85) / 0.15)); return [-d + (d + h) * t, w]; };
  const deckY = (x) => rail(x) - 1.15, halfW = (x) => sec(x, 1)[1] * 0.94;
  const plank = (x) => { const k = 0.90 + 0.10 * Math.sin(x * 3.1 + 1.3); return [k, k * 0.98, k * 0.95]; };
  const mb = meshBuilder();
  for (const side of [1, -1]) paramSurface(mb, (u, v) => { const x = -H + 0.05 + (2 * H - 0.1) * u, [y, w] = sec(x, v); return [x, y, side * w]; }, 48, 14,
    { ref: () => [0, 0, side], uv: (u, v, p) => [p[0] / 2, v * 5.5], col: (u, v, p) => plank(p[0]).map((c) => c * (0.55 + 0.45 * v)) });
  paramSurface(mb, (u, v) => { const [y, w] = sec(-H + 0.05, v); return [-H - 1.3 * v * v, y, (u * 2 - 1) * w]; }, 5, 14, { ref: () => [-1, 0, 0], uv: (u, v, p) => [p[2] / 2, v * 5.5], col: (u, v, p) => plank(p[2]) });   // 平的船尾，微微往后仰
  paramSurface(mb, (u, v) => { const x = -H + 0.2 + (2 * H - 0.5) * u; return [x, deckY(x), (v * 2 - 1) * halfW(x)]; }, 30, 4,
    { ref: () => [0, 1, 0], uv: (u, v, p) => [p[0] / 2, p[2] / 2], col: (u, v, p) => plank(p[2] * 2) });                                                                   // 主甲板
  const breach = (x, y, z) => z < 0 && (x + 1.5) ** 2 / 3.6 ** 2 + (y - 0.5) ** 2 / 2.1 ** 2 < 1;                                                                           // 左舷（朝上的那一边）被炮打穿的洞
  put(M.woodD, cutTriangles(mb.build(), breach), I, 0.86);
  const hullAt = (x, t, side) => { const [y, w] = sec(x, t); return [x, y, side * (w + 0.1)]; };
  // 龙骨、船首柱、两道舷侧的厚板
  const wb = meshBuilder(), dk = (x) => new THREE.Vector3(x, -keel(x) - 0.15, 0);
  tube(wb, [dk(-H), dk(-12), dk(0), dk(10), dk(H - 0.4)], [0.42, 0.36, 0.36, 0.34, 0.3], { sides: 4, col: () => [0.7, 0.68, 0.66] });
  tube(wb, [dk(H - 0.4), new THREE.Vector3(H + 0.6, 1.4, 0), new THREE.Vector3(H + 1.0, 4.2, 0), new THREE.Vector3(H + 0.6, 7.4, 0)], [0.34, 0.32, 0.3, 0.24], { sides: 4, col: () => [0.72, 0.7, 0.68] });
  for (const side of [1, -1]) for (const t of [0.52, 0.8]) {
    const spans = side < 0 && t === 0.52 ? [[-H + 0.6, -5.4], [2.4, H - 0.9]] : [[-H + 0.6, H - 0.9]];                                                                    // 厚板在破洞这里断开
    for (const [x0, x1] of spans) { const pts = []; for (let i = 0; i <= 16; i++) { const x = x0 + (x1 - x0) * (i / 16), [y, w] = sec(x, t); pts.push(new THREE.Vector3(x, y, side * (w + 0.08))); } tube(wb, pts, pts.map(() => 0.19), { sides: 4, col: () => [0.62, 0.6, 0.58] }); }
  }
  put(M.wood, wb.build(), I, 0.8);
  // 炮门：一排方口，口上的盖板掀着；左舷还有两门炮伸在外面
  for (const side of [1, -1]) for (let x = -8; x <= 14.5; x += 3.7) {
    if (side < 0 && x > -6 && x < 3.5) continue;
    const p = hullAt(x, 0.63, side);
    box(M.dark, 1.0, 0.9, 0.5, p[0], p[1], p[2], 1, 0, tile.wood);
    box(M.wood, 1.15, 0.14, 0.9, p[0], p[1] + 0.82, p[2] + side * 0.28, 0.78, -side * 0.9, tile.wood);
  }
  for (const x of [-8, 11]) {
    const p = hullAt(x, 0.63, -1), m = at(p[0], p[1], p[2] - 1.1);
    put(M.iron, new THREE.CylinderGeometry(0.2, 0.27, 2.8, 12).rotateX(Math.PI / 2), m, 1);
    put(M.iron, new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12).rotateX(Math.PI / 2), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, -1.35)), 1);
  }

  // ───── 尾楼：四面墙 + 后甲板 + 船尾最高处的小平台 ─────
  const CH = 4.4, wRear = halfW(-H + 0.05) - 0.15, wFront = halfW(-10.5), yR = deckY(-H + 0.05);
  const win = { w: 1.1, h: 1.5, sill: 1.7, kind: 'round', frameMat: M.wood, fw: 0.16 };
  const wall = { h: CH, t: 0.4, base: -0.4, yBase: yR, tint: 0.72, plinth: false, frameTint: 0.8, frameMat: M.wood };
  kit.wall([-H, -wRear], [-10.5, -wFront], { ...wall, openings: [{ ...win, x: 2.6 }, { ...win, x: 6.2 }, { ...win, x: 9.3 }] });
  kit.wall([-10.5, wFront], [-H, wRear], { ...wall, gaps: [[7.5, 9.6, 0.15, 0.5]], openings: [{ ...win, x: 2.4 }, { ...win, x: 5.6 }] });   // 右舷的墙塌了一角
  kit.wall([-10.5, -wFront], [-10.5, wFront], { ...wall, tint: 0.74, openings: [{ x: wFront, w: 1.7, h: 2.7, spring: 0.55, fw: 0.2 }] });
  const xg = -H - 1.5, yG = rail(-H) - 0.3;
  kit.wall([xg, -wRear - 0.2], [xg, wRear + 0.2], { ...wall, base: -0.8, yBase: yG, tint: 0.76, frameTint: 0.85, openings: [1.2, 3.4, 5.6, 7.8].map((x) => ({ ...win, x })) });   // 船尾的廊台：一排四个圆窗
  const qd = meshBuilder(), xq = xg - 0.3;
  paramSurface(qd, (u, v) => { const x = xq + (-10.2 - xq) * u, w = (wRear + 0.25) + ((wFront + 0.25) - (wRear + 0.25)) * u; return [x, rail(x) - 1.15 + CH, (v * 2 - 1) * w]; }, 8, 3, { ref: () => [0, 1, 0], uv: (u, v, p) => [p[0] / 2, p[2] / 2], col: (u, v, p) => plank(p[2] * 2) });
  put(M.woodD, cutTriangles(qd.build(), (x, y, z) => z > 2.2 && x > -13.5), I, 0.82);   // 后甲板：塌了一角，能看进尾楼里面
  for (const side of [-1, 1]) kit.wall([xq, side * (wRear + 0.25)], [-10.2, side * (wFront + 0.25)], { h: 1.1, t: 0.3, base: -0.2, tint: 0.7, plinth: false, yBase: yR + CH, gaps: side > 0 ? [[5, 7, 0.1, 0.4]] : [] });   // 后甲板的栏杆
  const xp = -16.6, wp = wRear - 1.1, yp = yR + CH;                                                                                                                       // 小平台
  for (const [a, b] of [[[xq, -wRear], [xq, wRear]], [[xq, -wRear], [xp, -wp]], [[xq, wRear], [xp, wp]]]) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    kit.wall(a, b, { h: 2.0, t: 0.35, base: -0.3, tint: 0.7, plinth: false, yBase: yp, frameMat: M.wood, openings: [{ ...win, x: len / 2, w: 0.9, h: 1.2, sill: 0.9 }] });
  }
  kit.wall([xp, -wp], [xp, wp], { h: 2.0, t: 0.35, base: -0.3, tint: 0.72, plinth: false, yBase: yp, frameMat: M.wood, openings: [{ x: wp, w: 1.5, h: 2.2, spring: 0.55 }] });
  box(M.woodD, xp - xq + 0.6, 0.3, wRear * 2, (xq + xp) / 2 - 0.3, yp - 0.05, 0, 0.8, 0, tile.wood);
  for (const s of [-1, 1]) kit.lantern(xq + 0.5, yp + 1.5, s * (wRear - 0.5), TEAL, 1, false, 2.4, lanterns);

  // ───── 船首楼：两道矮墙 + 一层小甲板（破了一块）─────
  const yF = rail(13.5) - 0.3, wF = halfW(13.5), wB = halfW(20), fw = { h: 2.3, t: 0.35, base: -0.4, tint: 0.74, plinth: false, yBase: yF, frameMat: M.wood };
  kit.wall([13.5, -wF], [20, -wB], { ...fw, openings: [{ ...win, x: 3.4, w: 0.9, h: 1.2, sill: 0.8 }] });
  kit.wall([13.5, wF], [20, wB], { ...fw, gaps: [[2, 4.2, 0.15, 0.5]] });
  const fd = meshBuilder();
  paramSurface(fd, (u, v) => { const x = 13.5 + 6.5 * u; return [x, yF + 2.3, (v * 2 - 1) * halfW(x)]; }, 6, 4, { ref: () => [0, 1, 0], uv: (u, v, p) => [p[0] / 2, p[2] / 2], col: (u, v, p) => plank(p[2] * 2) });
  put(M.woodD, cutTriangles(fd.build(), (x, y, z) => z > 0.2 && x > 15.4 && x < 19.2), I, 0.8);
  kit.lantern(14.6, yF + 3.5, 0, TEAL, 0.9, false, 2.2, lanterns);

  // ───── 桅杆、帆桁、船首斜桁、索具 ─────
  const mast = (x, hh, baseY) => {
    cyl(M.wood, 0.40, 0.62, hh, x, baseY + hh / 2 - 0.6, 0, 0.7, 14, false, tile.wood);
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; B.rod(M.wood, [x + Math.cos(a) * 0.3, baseY + hh - 1.4, Math.sin(a) * 0.3], [x + Math.cos(a) * 0.36, baseY + hh - 0.8 + r() * 1.3, Math.sin(a) * 0.36], 0.07, 0x8a7a66, 5); }   // 断口上劈开的木刺
    cyl(M.iron, 0.66, 0.66, 0.25, x, baseY + 1.4, 0, 1, 14, false, tile.wood);
  };
  const y0 = deckY(1), y1 = deckY(13.2), y2 = yp;
  mast(1, 11.5, y0); mast(13.2, 5.8, y1);
  cyl(M.wood, 0.34, 0.5, 11, -15.6, y2 + 5, 0, 0.7, 14, false, tile.wood); cyl(M.gold, 0.02, 0.22, 1.2, -15.6, y2 + 11.1, 0, 1, 8, false, tile.gold);
  B.rod(M.wood, [-17.2, y2 + 9.4, -3.2], [-14.0, y2 + 7.4, 8.6], 0.2, 0x8a7a66, 8);                                                   // 后桅上斜挂着的一根帆桁
  B.rod(M.wood, [-3.5, y0 + 0.55, -4.2], [6.5, y0 + 1.0, 4.9], 0.26, 0x8a7a66, 8);                                                  // 主桅的帆桁掉在甲板上
  B.rod(M.wood, [H - 1.6, rail(H - 1.6) + 0.2, 0], [H + 8.6, rail(H - 1.6) + 5.4, 0], 0.26, 0x8a7a66, 8);                          // 船首斜桁
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, x = 1 + Math.cos(a) * 4.6; B.rod(M.iron, [1 + Math.cos(a) * 0.45, y0 + 10.2, Math.sin(a) * 0.45], [x, deckY(x) + 1.3, Math.sin(a) * 4.6], 0.03, 0x333333, 4); }   // 主桅的支索
  // 甲板上的木桶、木箱；船尾的舵
  for (let k = 0; k < 5; k++) { const x = -8 + r() * 16, z = (r() - 0.5) * 6; cyl(M.wood, 0.42, 0.42, 0.95, x, deckY(x) + 0.45, z, 0.8, 12, false, tile.wood); cyl(M.iron, 0.44, 0.44, 0.08, x, deckY(x) + 0.45, z, 1, 12, false, tile.wood); }
  for (let k = 0; k < 4; k++) { const x = -7 + r() * 14, z = (r() - 0.5) * 5, s = 0.7 + r() * 0.5; box(M.wood, s, s * 0.8, s * 0.9, x, deckY(x) + s * 0.4, z, 0.8, r() * 1.5, tile.wood); }
  box(M.woodD, 0.45, 5.2, 2.2, xg - 0.6, rail(-H) - 3.4, 0, 0.75, 0, tile.wood);
  // 锚：船头挂着一只，沙地上躺着一只
  const anchor = (m) => {
    const pt = (x, y) => { const p = new THREE.Vector3(x, y, 0).applyMatrix4(m); return [p.x, p.y, p.z]; };
    B.rod(M.iron, pt(0, 3.4), pt(0, -0.8), 0.15, 0xffffff, 8);
    B.rod(M.iron, pt(-1.1, 2.9), pt(1.1, 2.9), 0.11, 0xffffff, 6);
    put(M.iron, new THREE.TorusGeometry(1.25, 0.14, 6, 18, Math.PI).rotateZ(Math.PI), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.45, 0)), 1);
    put(M.iron, new THREE.TorusGeometry(0.32, 0.07, 6, 14), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 3.7, 0)), 1);
  };
  anchor(new THREE.Matrix4().makeTranslation(H + 1.2, 1.2, -1.4).multiply(new THREE.Matrix4().makeRotationZ(0.35)));
  anchor(new THREE.Matrix4().makeTranslation(H + 7.5, -keel(H) + 2.2, -8.5).multiply(new THREE.Matrix4().makeRotationX(1.35)).multiply(new THREE.Matrix4().makeRotationZ(1.2)));
  for (const [x, z, a] of [[-6, -13.5, 0.4], [2.5, -12, 2.2], [26, -3, 5.1]]) {                                                          // 掉在沙地上的炮
    const m = new THREE.Matrix4().makeTranslation(x, -WRECK.sink + 0.3, z).multiply(new THREE.Matrix4().makeRotationY(a));
    put(M.iron, new THREE.CylinderGeometry(0.2, 0.34, 2.8, 12).rotateZ(Math.PI / 2), m, 1);
    put(M.iron, new THREE.CylinderGeometry(0.37, 0.37, 0.22, 12).rotateZ(Math.PI / 2), m.clone().multiply(new THREE.Matrix4().makeTranslation(-0.9, 0, 0)), 1);
  }
  // ───── 从破洞里滚出来的货物：沙地上散着陶罐、木桶和崩下来的船板（按世界坐标摆在海床上）─────
  const FINV = F.clone().invert(), AX = [Math.cos(WRECK.yaw), -Math.sin(WRECK.yaw)], AZ = [Math.sin(WRECK.yaw), Math.cos(WRECK.yaw)], T = new THREE.Matrix4(), T2 = new THREE.Matrix4();
  const ground = (u, v) => { const x = S.x + u * AX[0] + v * AZ[0], z = S.z + u * AX[1] + v * AZ[1], p = new THREE.Vector3(x, height(x, z) - 0.12, z).applyMatrix4(FINV); return new THREE.Matrix4().makeTranslation(p.x, p.y, p.z); };
  const jar = scaleUV(new THREE.LatheGeometry([[0.03, 0], [0.24, 0.05], [0.34, 0.4], [0.3, 0.72], [0.17, 0.9], [0.15, 1.02], [0.2, 1.07], [0.19, 1.1]].map(([x, y]) => new THREE.Vector2(x, y)), 16), 1.1, 1.1);
  for (const [u, v, yaw, tilt] of [[-13, 9.5, 0.6, 1.2], [6, 10.5, 2.1, 1.45], [12, -9.8, 3.9, 1.3], [-4, 12.5, 5.0, 1.5], [17, 8.6, 1.1, 1.35], [-19, -10.2, 4.2, 1.25], [9, -12.2, 0.3, 1.1]]) {
    put(M.clay, jar, ground(u, v).multiply(T.makeRotationY(yaw)).multiply(T2.makeTranslation(0, 0.3, 0)).multiply(T2.makeRotationX(tilt)), 0.72 + r() * 0.14);   // 横躺着的陶罐
  }
  for (const [u, v, yaw] of [[-9, -10.5, 0.8], [3, -11.6, 2.4], [15, 10.8, 4.1], [-17, 9, 1.0]]) {
    const m = ground(u, v).multiply(T.makeRotationY(yaw)).multiply(T2.makeTranslation(0, 0.42, 0)).multiply(T2.makeRotationZ(1.5));
    put(M.wood, cylUV(new THREE.CylinderGeometry(0.42, 0.42, 0.95, 14), 0.42, 0.95, tile.wood), m, 0.8);
    for (const dy of [-0.36, 0.36]) put(M.iron, new THREE.TorusGeometry(0.43, 0.035, 6, 18), m.clone().multiply(T2.makeTranslation(0, dy, 0)), 1);
  }
  for (let k = 0; k < 10; k++) { const u = -20 + r() * 40, v = (r() < 0.5 ? -1 : 1) * (8 + r() * 6), len = 1.6 + r() * 1.8;                                     // 崩下来的船板
    kit.put(M.woodD, uvBox(len, 0.09, 0.3, tile.wood), ground(u, v).multiply(T.makeRotationY(r() * 3)).multiply(T2.makeRotationZ((r() - 0.5) * 0.2)).multiply(T2.makeTranslation(0, 0.06, 0)), 0.7); }

  // 长东西的地方：舷缘、后甲板、主甲板
  for (const side of [1, -1]) for (let x = -H + 2; x < H - 3; x += 3.4) { const p = hullAt(x, 1, side); L(p[0], p[1] + 0.05, p[2], 0.6 + r() * 0.7); }
  for (let x = xq + 1; x < -11; x += 3) { L(x, rail(x) - 1.15 + CH + 0.05, (r() - 0.5) * 2 * wRear, 0.6 + r() * 0.8); L(x, deckY(x) + 0.05, (r() - 0.5) * 2 * halfW(x) * 0.85, 0.5 + r() * 0.7); }
  for (const l of lanterns) l.p = W(l.p[0], l.p[1], l.p[2]);
  for (const sp of kit.spots) L(sp.p[0], sp.p[1], sp.p[2], sp.s);                                             // 尾楼的墙头、栏杆顶上（积木登记的）
  B.frame = null;
  // 碰撞体（世界坐标）：船身四段、三根桅杆
  for (const [lx, rr, top] of [[-14, 6.2, 8], [-2, 7.2, 7], [9, 6.4, 6], [17, 4, 4.5]]) { const p = W(lx, 0, 0); colliders.push({ x: p[0], z: p[2], r: rr, y0: yw - 6, y1: yw + top }); }
  for (const [lx, ly] of [[1, y0], [13.2, y1], [-15.6, y2]]) { const p = W(lx, ly, 0); colliders.push({ x: p[0], z: p[2], r: 0.9, y0: yw - 4, y1: yw + 13 }); }
  const group = new THREE.Group(); group.name = 'wreck';
  return { group, meshes: B.build(group, { name: 'wreck' }), colliders, spots, lanterns };
}
