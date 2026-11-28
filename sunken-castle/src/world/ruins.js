// 三处古迹：断崖边的柱廊（神庙）、半埋在崖沿上、望着深渊的三十多米高的巨像、平原上一座圆顶石屋的小村落。
// 每一处先在自己的坐标系里搭（原点在地面，y 向上），合批时乘上“位置 · 朝向”（ctx.F）；碰撞体、生长点、灯笼登记时转成世界坐标。
import * as THREE from 'three';
import { createBatcher } from '../gfx/batch.js';
import { createArch, ruinedDrum, cylUV } from './arch.js';
import { placeStatue, statueSurface, cloakPoint } from './statue.js';
import { mulberry32 } from '../core/mathx.js';
import { SITES, WORLD, height } from '../core/seabed.js';

const TEAL = [0.30, 1.55, 1.85];
const TILT = new THREE.Matrix4();

/** 神庙：三层圆台，十二根柱子围着（立着的、断的、倒了的、只剩柱础的），相邻的立柱之间搭着石梁，中间一座祭坛，火一直没灭 */
function temple(kit, ctx, r) {
  const { M, tile, spots, lanterns, colliders } = ctx, { put, at, box, cyl } = kit;
  for (const [rr, y] of [[11.6, 0.27], [10.5, 0.82], [9.4, 1.37]]) put(M.marble, cylUV(new THREE.CylinderGeometry(rr, rr + 0.12, 0.55, 40), rr, 0.55, tile.marble), at(0, y, 0), 0.66);
  const R = 7.4, state = ['up', 'up', 'stump', 'gone', 'up', 'broken', 'fallen', 'up', 'up', 'gone', 'broken', 'up'], pos = [], CH = 8.2, Y0 = 1.65;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.26, x = Math.cos(a) * R, z = Math.sin(a) * R;
    pos.push([x, z]);
    if (state[k] === 'gone') { box(M.marble, 2.1, 0.5, 2.1, x, Y0 + 0.25, z, 0.6, a, tile.marble); continue; }
    if (state[k] === 'fallen') {                                                                                                   // 倒了：三段柱鼓顺着半径的方向滚在外面
      box(M.marble, 2.1, 0.5, 2.1, x, Y0 + 0.25, z, 0.6, a, tile.marble);
      for (let d = 0; d < 3; d++) put(M.marble, cylUV(new THREE.CylinderGeometry(0.58, 0.58, 2.4, 18), 0.58, 2.4, tile.marble), at(Math.cos(a) * (R + 1.4 + d * 2.6), 2.3, Math.sin(a) * (R + 1.4 + d * 2.6), -a).multiply(TILT.makeRotationZ(-Math.PI / 2)), 0.6);
      continue;
    }
    kit.column(x, Y0, z, state[k] === 'up' ? CH : 2.6 + r() * 2.4, 0.62, { broken: state[k] !== 'up', tint: 0.58, seg: 18 });
    spots.push({ p: [x + 0.2, Y0 + (state[k] === 'up' ? CH + 0.75 : 3.6), z], s: 0.5 });
  }
  for (const [i, j] of [[0, 1], [7, 8], [11, 0]]) {                                                                                // 相邻两根立柱之间搭着的石梁
    const [x0, z0] = pos[i], [x1, z1] = pos[j], len = Math.hypot(x1 - x0, z1 - z0), yaw = Math.atan2(-(z1 - z0), x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    box(M.marble, len + 0.4, 0.95, 1.5, mx, Y0 + CH + 0.5, mz, 0.58, yaw, tile.marble);
    box(M.marble, len + 0.9, 0.35, 1.9, mx, Y0 + CH + 1.15, mz, 0.58, yaw, tile.marble);
    for (let d = -len / 2 + 0.6; d < len / 2; d += 2.2) spots.push({ p: [mx + Math.cos(yaw) * d, Y0 + CH + 1.34, mz - Math.sin(yaw) * d], s: 0.6 });
  }
  box(M.marble, 7.2, 0.95, 1.4, 2.5, 2.2, -10.6, 0.55, 0.9, tile.marble);                                                         // 一根倒在地上的石梁
  box(M.marble, 2.8, 1.1, 2.1, 0, Y0 + 0.55, 0, 0.68, 0.2, tile.marble);                                                         // 祭坛
  cyl(M.bronze, 0.66, 0.42, 0.62, 0, Y0 + 1.4, 0, 1, 14, false, tile.bronze);
  put(M.glow, new THREE.SphereGeometry(0.42, 14, 10), at(0, Y0 + 2.05, 0), TEAL);
  lanterns.push({ p: [0, Y0 + 2.05, 0], c: TEAL, power: 1.5, r: 3.4 });
  for (const sx of [-1, 1]) {                                                                                                      // 入口两边的方尖碑：一根立着，一根断了、歪着
    const x = sx * 4.4, h = sx < 0 ? 9.2 : 3.4;
    put(M.marble, cylUV(new THREE.CylinderGeometry(0.30, 0.66, h, 4), 0.5, h, tile.marble), at(x, 1.2 + h / 2, 14.2, 0.3).multiply(TILT.makeRotationZ(sx < 0 ? 0 : 0.16)), 0.58);
    if (sx < 0) put(M.gold, cylUV(new THREE.ConeGeometry(0.46, 0.9, 4), 0.3, 1, tile.gold), at(x, 1.2 + h + 0.45, 14.2, 0.3), 0.9);
    colliders.push({ x, z: 14.2, r: 1.0, y1: 1.2 + h });
  }
  for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.52, x = Math.cos(a) * 9.9, z = Math.sin(a) * 9.9;           // 台阶四角各一盏灯
    box(M.marble, 0.8, 0.7, 0.8, x, 1.95, z, 0.66, 0, tile.marble); kit.lantern(x, 2.6, z, TEAL, 0.9, false, 2.2, lanterns); }
  kit.rubble(9.5, 0.4, 7.5, 14, 3.4, { tint: 0.55, max: 1.2 });
}

/** 巨像：和城门的守望者同一个姿势，只是大四倍、更老——腿埋进了崖沿的石头里，微微前倾，望着外面的深渊 */
function colossus(kit, ctx) {
  const { M, tile, spots, colliders } = ctx, { put, at, box } = kit, S = ctx.site, A = WORLD.abyss;
  ctx.F.makeTranslation(S.x, height(S.x, S.z), S.z).multiply(new THREE.Matrix4().makeRotationY(Math.atan2(S.x - A.x, S.z - A.z)));
  for (const [rr, y] of [[13.4, -1.9], [12.3, -1.3], [11.2, -0.7]]) put(M.marble, cylUV(new THREE.CylinderGeometry(rr, rr + 0.5, 1.2, 12), rr, 1.2, tile.marble), at(0, y, 0).multiply(TILT.makeRotationY(Math.PI / 8)), 0.5);
  const SM = at(0, -8.6, 0).multiply(TILT.makeRotationX(0.06)), SH = placeStatue(kit, M, tile, SM, 5.2, 0.56);   // SM：石像的矩阵；SH：像高（连戟尖）
  ctx.statueTop = SH - 8.6;
  /** 巨像身上的生长点：像自己的坐标（肩头顶上、耳朵上方的头发、托珠的小臂底下、披风的背面）→ 这处古迹的坐标。top：朝上长的那一层 */
  for (const [l, n, s, top] of [[statueSurface([-0.6, 4.42, 0], [0, 1, 0], 0, 0.6), [0, 1, 0], 0.9, true], [statueSurface([0, 5.25, 0.03], [0.5, 0.75, -0.45], 0, 0.8), [0.5, 0.75, -0.45], 0.7, true], [statueSurface([0.72, 3.8, 0.37], [-0.2, -0.97, 0.15], 0, 0.6), [-0.2, -0.97, 0.15], 0.8, false], [new THREE.Vector3(...cloakPoint(0.1, 0.2)), [0.5, 0.3, -0.81], 0.9, true]]) {
    const p = l.applyMatrix4(SM), q = new THREE.Vector3(n[0], n[1], n[2]).transformDirection(SM);
    spots.push({ p: [p.x, p.y, p.z], n: [q.x, q.y, q.z], s, top });
  }
  box(M.stone, 9, 3.5, 7, -9.5, -0.2, 7.5, 0.55, 0.6, tile.stone);                                                                 // 崖沿上崩下来的几块巨石
  box(M.stone, 6, 2.6, 6, 8.5, -0.5, 10.5, 0.5, -0.4, tile.stone);
  colliders.push({ x: 0, z: 0, r: 8, y1: SH - 8.6 + 2 }, { x: 5.4, z: 0.5, r: 1.2, y1: 46 });
}

/** 村落：八座圆顶的石屋（有的顶还在，有的塌了），门朝着村中心，门前有小门廊；屋前的小路、一口井、一座小神龛 */
function village(kit, ctx, r) {
  const { M, tile, spots, lanterns, colliders, B } = ctx, { put, at, box, cyl } = kit, S = ctx.site;
  ctx.F.makeTranslation(S.x, height(S.x, S.z) + 0.4, S.z).multiply(new THREE.Matrix4().makeRotationY(0.9));
  const houses = [[0, 0, 3.3, 1], [10, 3, 2.6, 1], [-9.5, 4, 2.9, 0], [4, -10, 2.5, 1], [-8, -11, 2.4, 2], [15, -7, 3.0, 0], [-17, -5, 2.7, 1], [10, 13, 2.3, 2]];   // x、z、半径、状态（1 完好，0 顶塌了，2 只剩半截墙）
  for (const [x, z, rr, kind] of houses) {
    const h = rr * 0.92 + 0.6, jag = []; for (let i = 0; i < 24; i++) jag.push(0.45 + 0.55 * r());
    const low = kind === 2 ? (i) => h * (0.3 + 0.4 * (0.5 * jag[i] + 0.5 * jag[(i + 1) % 24])) : kind === 1 ? () => h : (i) => h * (0.55 + 0.45 * (0.5 * jag[i] + 0.5 * jag[(i + 1) % 24]));
    put(M.stone, ruinedDrum(rr, 0.55, low, { seg: 24, tile: tile.stone }), at(x, -0.8, z), 0.76);
    colliders.push({ x, z, r: rr + 0.3, y1: kind === 1 ? h + rr + 0.6 : h * 0.7 });
    for (let k = 0; k < 5; k++) { const a = r() * 6.28, d = rr * (0.5 + r() * 0.42); spots.push({ p: [x + Math.cos(a) * d, (kind === 1 ? h : h * 0.75) + 0.05, z + Math.sin(a) * d], s: 0.5 + r() * 0.4 }); }
    if (kind === 2) { kit.rubble(x, 0.2, z, 9, 2.2, { tint: 0.55, max: 1.0 }); continue; }
    const dA = Math.atan2(-z, -x), dx = x + Math.cos(dA) * rr, dz = z + Math.sin(dA) * rr, tx = -Math.sin(dA), tz = Math.cos(dA), dm = at(dx, 0.02, dz, Math.PI / 2 - dA);   // 门朝着村中心
    put(M.dark, new THREE.PlaneGeometry(1.3, 2.2), dm.clone().multiply(TILT.makeTranslation(0, 1.1, 0.03)), 1);
    put(M.stone, kit.frame('stone', 1.3, 2.2, 0.22, 0.3, tile.stone), dm.clone().multiply(TILT.makeTranslation(0, 0, -0.03)), 0.78);
    for (const s of [-1, 1]) kit.wall([dx + Math.cos(dA) * 0.3 + tx * s * 0.95, dz + Math.sin(dA) * 0.3 + tz * s * 0.95], [dx + Math.cos(dA) * 2.3 + tx * s * 0.95, dz + Math.sin(dA) * 2.3 + tz * s * 0.95], { h: 2.3, t: 0.4, base: -0.4, tint: 0.76, plinth: false, spots: false });   // 门廊
    box(M.stone, 2.5, 0.35, 2.5, dx + Math.cos(dA) * 1.3, 2.45, dz + Math.sin(dA) * 1.3, 0.76, dA, tile.stone);
    if (kind === 1) {
      const prof = [new THREE.Vector2(rr + 0.28, h - 0.25), new THREE.Vector2(rr + 0.28, h + 0.05)];
      for (let i = 1; i <= 9; i++) { const a = (i / 9) * 1.28; prof.push(new THREE.Vector2((rr + 0.12) * Math.cos(a), h + 0.05 + rr * Math.sin(a))); }
      put(M.stone, cylUV(new THREE.LatheGeometry(prof, 28), rr, rr * 1.8, tile.stone), at(x, 0, z), 0.8);                 // 穹顶，顶上留着一个圆口
      cyl(M.stone, rr * 0.27, rr * 0.31, 0.75, x, h + rr * 0.96 + 0.1, z, 0.78, 16, false, tile.stone);
      for (const a of [dA + 1.9, dA - 1.9]) { const m = at(x + Math.cos(a) * (rr + 0.02), h * 0.55, z + Math.sin(a) * (rr + 0.02), Math.PI / 2 - a);   // 一扇小窗
        put(M.dark, new THREE.PlaneGeometry(0.6, 0.8), m.clone().multiply(TILT.makeTranslation(0, 0.4, 0.02)), 1); put(M.stone, kit.frame('stone', 0.6, 0.8, 0.14, 0.18, tile.stone), m.clone().multiply(TILT.makeTranslation(0, 0, -0.02)), 0.7); }
    } else kit.rubble(x - 1, 0.2, z + 1, 8, 2.2, { tint: 0.55, max: 1.0 });
  }
  for (let i = 0; i < 24; i++) { const a = -2.3 + (i / 23) * 3.4, x = Math.cos(a) * 5.3 + Math.sin(i * 2.1) * 0.3, z = Math.sin(a) * 5.3 + Math.cos(i * 1.7) * 0.3; box(M.paving, 1.3, 0.14, 0.95, x, 0.05, z, 0.76, -a, tile.paving); }   // 绕着中间那座房子的小路
  for (const [x, z] of [[-5.2, 5.6], [7.6, -1.6], [-13, -10]]) kit.lantern(x, 3.9, z, TEAL, 1, true, 2.2, lanterns);   // 小路边的三根灯柱
  put(M.stone, ruinedDrum(1.15, 0.3, () => 1.05, { seg: 18, tile: tile.stone }), at(2.5, -0.3, -1.5), 0.78);                 // 井
  for (const s of [-1, 1]) cyl(M.wood, 0.11, 0.13, 2.3, 2.5 + s * 1.15, 1.5, -1.5, 0.7, 8, false, tile.wood);
  B.rod(M.iron, [1.35, 2.55, -1.5], [3.65, 2.55, -1.5], 0.09, 0x8a7a66, 6);
  put(M.wood, cylUV(new THREE.ConeGeometry(1.7, 0.8, 4), 0.8, 1.8, tile.wood), at(2.5, 3.0, -1.5, 0.785), 0.84);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) kit.column(-14 + sx * 1.2, 0.1, 15 + sz * 1.2, 2.0, 0.14, { tint: 0.76, seg: 10 });   // 小神龛
  put(M.stone, cylUV(new THREE.SphereGeometry(1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 1.5, 2.4, tile.stone), at(-14, 2.0, 15), 0.8);
  cyl(M.gold, 0.012, 0.12, 0.9, -14, 3.9, 15, 1, 6, false, tile.gold);
}

/** 一处古迹：在自己的坐标系里搭，最后把碰撞体、生长点、灯笼转成世界坐标 */
function site(AM, S, build, seed) {
  const B = createBatcher(), F = new THREE.Matrix4(), ctx = { B, F, site: S, M: AM.M, tile: AM.tile, spots: [], lanterns: [], colliders: [] };
  const kit = createArch(B, AM.M, AM.tile, { colliders: [], spots: ctx.spots, seed });                          // 积木自己登记的生长点（碎砖堆、断柱）也收进来；墙的碰撞体是本地坐标的，不要
  ctx.F.makeTranslation(S.x, height(S.x, S.z) - 0.3, S.z).multiply(new THREE.Matrix4().makeRotationY(0.4));
  B.frame = F;
  build(kit, ctx, mulberry32(seed * 7 + 3));
  B.frame = null;
  const W = (p) => { const v = new THREE.Vector3(p[0], p[1], p[2]).applyMatrix4(F); return [v.x, v.y, v.z]; };
  for (const s of ctx.spots) { s.p = W(s.p); if (s.n) s.n = new THREE.Vector3(s.n[0], s.n[1], s.n[2]).transformDirection(F).toArray(); }   // 朝向也转到世界坐标
  for (const l of ctx.lanterns) l.p = W(l.p);
  const colliders = ctx.colliders.map((c) => { const p = W([c.x, 0, c.z]); return { x: p[0], z: p[2], r: c.r, y0: p[1] - 3, y1: p[1] + c.y1 }; });
  const group = new THREE.Group(); group.name = 'site';
  return { group, meshes: B.build(group, { name: 'site' }), colliders, spots: ctx.spots, lanterns: ctx.lanterns };
}

export function buildRuins(AM) {
  const group = new THREE.Group(), colliders = [], spots = [], lanterns = [], meshes = [];
  group.name = 'ruins';
  for (const [S, build, seed] of [[SITES.temple, temple, 1], [SITES.statue, colossus, 2], [SITES.village, village, 3]]) {
    const s = site(AM, S, build, seed);
    group.add(s.group); meshes.push(...s.meshes); colliders.push(...s.colliders); spots.push(...s.spots); lanterns.push(...s.lanterns);
  }
  return { group, meshes, colliders, spots, lanterns };
}
