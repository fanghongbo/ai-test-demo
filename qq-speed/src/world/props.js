// 赛道和广场上的小件：棕榈树、路灯、凉亭、广告牌、旗子、帆船、起点门架、滨水栏杆、花池、行人。
// 沿赛道每隔一段“走”一遍，按离路距离、离岸距离、是否压着地标或楼房来决定能不能放。同一种小件用实例化网格。
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createBatcher, plane } from '../gfx/batch.js';
import { nearest, pointAt, WALL } from '../core/trackdef.js';
import { mulberry32 } from '../core/mathx.js';
import { PLAN } from './plan.js';
import { WATER_Y, distToLand } from './landdef.js';
import { inLandmark } from './landmarks.js';
import { SIGN_UV } from './materials.js';

const WHITE = [0.95, 0.96, 0.97], STEEL = [0.9, 0.92, 0.95], BARK = [0.34, 0.25, 0.17];
const SHIRT = [0xd9d9d4, 0x3c5892, 0xb94e44, 0xd8a644, 0x41885f, 0x4b98ad, 0xcf7c42, 0x7c68a6, 0x3c3f46, 0xcf8ea2], SKIN = [0xf2c9a6, 0xe0ac86, 0xc48a62, 0x8d5a3c];
const KIOSK_COLORS = [[0.95, 0.45, 0.16], [0.16, 0.42, 0.86], [0.2, 0.66, 0.5]], HULLS = [[0.96, 0.96, 0.95], [0.12, 0.22, 0.5], [0.85, 0.2, 0.16], [0.96, 0.96, 0.95], [0.2, 0.45, 0.4]];
const _c = new THREE.Color(), UP = new THREE.Vector3(0, 1, 0);

const ni = (g) => (g.index ? g.toNonIndexed() : g);                  // 合并前统一成非索引
const merge = (list) => mergeGeometries(list.map(ni));
/** 给几何补一份常量顶点色（材质按顶点色上色） */
function tinted(geo, c) {
  const g = ni(geo), n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}
/** 沿赛道每隔 stepM 米取一个采样号 */
function* walk(T, stepM) { const k = Math.max(1, Math.round(stepM / T.ds)); for (let i = 0; i < T.N; i += k) yield i; }
/** 两点之间的圆台，摆好姿态 */
function rodGeo(a, b, r0, r1, seg = 7) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A);
  const g = new THREE.CylinderGeometry(r1, r0, d.length(), seg, 1, false);
  return g.applyMatrix4(new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(UP, d.normalize()), new THREE.Vector3(1, 1, 1)));
}
const pose = (x, y, z, ry = 0, s = 1, sy = s) => ({ x, y, z, ry, s, sy });

// ————————————————— 几何 —————————————————

/** 棕榈树：{ trunk, fronds }。树干五段渐细、微微弯曲；十片叶子从树顶散开、往下垂 */
function palmGeometry() {
  const P = [[0, -0.4, 0], [0.22, 2.2, 0.04], [0.62, 4.6, 0.2], [1.12, 6.9, 0.46], [1.5, 8.6, 0.72]], segs = [];
  for (let k = 0; k + 1 < P.length; k++) segs.push(rodGeo(P[k], P[k + 1], 0.31 - k * 0.03, 0.31 - (k + 1) * 0.03, 7));
  const top = P[P.length - 1], fronds = [];
  for (let k = 0; k < 10; k++) {
    const g = new THREE.PlaneGeometry(4.9, 1.5, 10, 1), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + 2.45, v = (p.getY(i) / 1.5) * 2;                      // x：沿叶片 0→4.9；v：横向 −1→1
      p.setXYZ(i, x, -0.085 * x * x + (1 - Math.abs(v)) * 0.22, v * 0.75);
    }
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i));       // 贴图的竖轴是叶柄
    const m = new THREE.Matrix4().makeTranslation(top[0], top[1], top[2])
      .multiply(new THREE.Matrix4().makeRotationY((k / 10) * Math.PI * 2 + (k % 2) * 0.2))      // 先让叶片沿 +X 下垂，再绕竖轴转到各自的方向
      .multiply(new THREE.Matrix4().makeRotationZ(-0.12 - ((k * 7) % 10) * 0.062));
    g.applyMatrix4(m); g.computeVertexNormals(); fronds.push(g);
  }
  return { trunk: merge(segs), fronds: merge(fronds) };
}

/** 路灯：{ pole, head }。灯臂朝本地的 +Z，摆的时候让 +Z 指向路面 */
function lampGeometry(h = 7.4) {
  const pole = merge([rodGeo([0, -0.3, 0], [0, h - 0.3, 0], 0.15, 0.085, 8), rodGeo([0, h - 0.3, 0], [0, h + 0.5, 1.9], 0.075, 0.06, 6)]);
  const head = new THREE.BoxGeometry(0.36, 0.14, 0.95); head.translate(0, h + 0.46, 1.95);
  return { pole, head };
}

/** 凉亭：{ base, roof } */
function kioskGeometry() {
  const base = new THREE.CylinderGeometry(1.9, 2.0, 2.9, 10); base.translate(0, 1.45, 0);
  const roof = merge([new THREE.CylinderGeometry(0.06, 3.0, 2.1, 10).translate(0, 3.95, 0), new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6).translate(0, 5.4, 0)]);
  return { base, roof };
}

/** 广告牌：{ frame, panel }。牌面朝本地 +Z，中心离地 9.7 米 */
function boardGeometry(uv) {
  const frame = merge([new THREE.BoxGeometry(10.5, 5.5, 0.3).translate(0, 9.7, -0.2), new THREE.BoxGeometry(0.32, 7.2, 0.32).translate(-3.7, 3.6, -0.3), new THREE.BoxGeometry(0.32, 7.2, 0.32).translate(3.7, 3.6, -0.3)]);
  return { frame, panel: plane(10, 5, uv).translate(0, 9.7, 0) };
}

/** 帆船：{ hull, deck, sail }。船长沿着 X，船顶朝上，吃水线在 y = 0 */
function boatGeometry() {
  const sh = new THREE.Shape();
  sh.moveTo(-3.3, 0); sh.quadraticCurveTo(-2.6, 1.3, 0.6, 1.3); sh.quadraticCurveTo(2.7, 1.1, 3.8, 0); sh.quadraticCurveTo(2.7, -1.1, 0.6, -1.3); sh.quadraticCurveTo(-2.6, -1.3, -3.3, 0);
  const hull = new THREE.ExtrudeGeometry(sh, { depth: 1.05, bevelEnabled: false }); hull.rotateX(-Math.PI / 2); hull.translate(0, -0.55, 0);
  const deck = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }); deck.rotateX(-Math.PI / 2); deck.scale(0.97, 1, 0.9); deck.translate(0, 0.5, 0);
  const tri = new THREE.Shape(); tri.moveTo(0.56, 1.8); tri.lineTo(0.56, 10.5); tri.lineTo(-2.5, 1.95); tri.closePath();
  const jib = new THREE.Shape(); jib.moveTo(0.66, 2.2); jib.lineTo(0.66, 9.0); jib.lineTo(3.3, 1.0); jib.closePath();
  return {
    hull,
    deck: merge([deck, new THREE.BoxGeometry(2.0, 0.75, 1.25).translate(-0.7, 0.9, 0), new THREE.CylinderGeometry(0.07, 0.1, 10.2, 6).translate(0.5, 5.6, 0),
      new THREE.CylinderGeometry(0.05, 0.05, 3.3, 5).rotateZ(Math.PI / 2).translate(-0.9, 1.75, 0)]),
    sail: merge([new THREE.ShapeGeometry(tri), new THREE.ShapeGeometry(jib)]),
  };
}

// ————————————————— 入口 —————————————————

export function buildProps(T, M, lots, onStep = () => {}) {
  const group = new THREE.Group();
  group.name = 'props';
  const r = mulberry32(2026);
  const B = createBatcher(), S = createBatcher();

  /** 离最近一段路面的距离（米，已扣掉路宽和墙厚） */
  const roadGap = (X, Z) => { const n = nearest(T, X, Z, -1); return n.d - T.hw[n.i] - WALL; };
  const onLand = (X, Z) => [[0, 0], [1.7, 0], [-1.7, 0], [0, 1.7], [0, -1.7]].every(([dx, dz]) => distToLand(X + dx, Z + dz) === 0);
  /** 这块地方能不能放东西：离路够远、（需要时）在岸上、不压地标和楼房 */
  const ok = (X, Z, road, land, pad = 1) => roadGap(X, Z) >= road && (!land || onLand(X, Z)) && !inLandmark(X, Z) && lots.every((l) => Math.hypot(X - l.X, Z - l.Z) > l.r + pad);

  /** 实例化网格。items：[{ x, y, z, ry, s, sy, c, look: [X, Z] }]，给了 look 就让本地的 +Z 指向那个点 */
  const inst = (geo, mat, items, name, o = {}) => {
    if (!items.length) return null;
    const m = new THREE.InstancedMesh(geo, mat, items.length), ob = new THREE.Object3D();
    items.forEach((it, k) => {
      ob.position.set(it.x, it.y ?? 0, it.z); ob.scale.set(it.s ?? 1, it.sy ?? it.s ?? 1, it.s ?? 1);
      ob.rotation.set(0, 0, 0);
      if (it.look) ob.lookAt(it.look[0], it.y ?? 0, it.look[1]); else ob.rotation.y = it.ry ?? 0;
      ob.updateMatrix(); m.setMatrixAt(k, ob.matrix);
      if (it.c) m.setColorAt(k, Array.isArray(it.c) ? _c.setRGB(it.c[0], it.c[1], it.c[2]) : _c.set(it.c));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true; m.name = name;
    group.add(m);
    return m;
  };

  const [ccx, ccz] = PLAN.canopy.c, CR = PLAN.canopy.r, { c: [mcx, mcz], d: md } = PLAN.mall.hall, fz = mcz + md / 2, shoreZ = (119 - 73.5) * 3;

  // ——— 棕榈树：赛道两侧 + 几处广场 ———
  const palms = [];
  const palm = (X, Z, s = 1) => palms.push({ ...pose(X, 0, Z, r() * 6.28, (0.85 + r() * 0.3) * s, (0.9 + r() * 0.3) * s), c: [0.85 + r() * 0.3, 0.9 + r() * 0.2, 0.8 + r() * 0.2] });
  for (const i of walk(T, 9)) for (const sd of [-1, 1]) {
    if (r() < 0.52) continue;
    const p = pointAt(T, i, sd * (T.hw[i] + WALL + 4.4));
    if (ok(p[0], p[1], 3.2, true, 2.2)) palm(p[0], p[1]);
  }
  /** 以 (cx, cz) 为心、半径 rad 的一圈，角度从 a0 到 a1 */
  const ring = (cx, cz, rad, n, a0, a1, s = 1) => {
    for (let k = 0; k < n; k++) {
      const a = a0 + ((a1 - a0) * (k + 0.5)) / n, X = cx + Math.cos(a) * rad, Z = cz + Math.sin(a) * rad;
      if (ok(X, Z, 2.6, true, 1.5)) palm(X, Z, s);
    }
  };
  ring(ccx, ccz, CR + 9.5, 18, -0.25, Math.PI + 0.25);                                         // 穹顶广场外圈（朝着商城的一面不放）
  for (let z = fz + 17; z < shoreZ - 7; z += 8.5) for (const sx of [-1, 1]) {                   // 步行大道两排
    const X = mcx + sx * 21.5; if (ok(X, z, 2.6, true, 1)) palm(X, z, 1.05);
  }
  PLAN.domes.forEach((d) => ring(d.c[0], d.c[1], d.r + 6.5, d.r > 20 ? 14 : 9, Math.PI + 0.6, Math.PI * 3 - 0.6));   // 展览馆四周，留出南门
  ring(PLAN.ring.c[0], PLAN.ring.c[1], 36, 16, 0, Math.PI * 2);
  for (let k = 0; k < 900; k++) {                                                        // 大块草坪上再散一些，成小片
    const X = (r() - 0.5) * 400, Z = (r() - 0.5) * 330;
    if (r() < 0.62 || !ok(X, Z, 10, true, 4) || palms.some((q) => Math.hypot(q.x - X, q.z - Z) < 5.5)) continue;
    palm(X, Z, 0.8 + r() * 0.5);
  }
  const PG = palmGeometry();
  inst(tinted(PG.trunk, BARK), M.trunk, palms, 'palmTrunks');
  inst(tinted(PG.fronds, [1, 1, 1]), M.frond, palms, 'palmFronds');
  onStep(0.25);

  // ——— 路灯：沿赛道交替放在两侧，广场上再补几盏 ———
  const lamps = [];
  let side = 1;
  for (const i of walk(T, 18)) {
    const p = pointAt(T, i, side * (T.hw[i] + WALL + 1.5));
    if (roadGap(p[0], p[1]) >= 0.5 && !inLandmark(p[0], p[1]) && lots.every((l) => Math.hypot(p[0] - l.X, p[1] - l.Z) > l.r + 0.6)) lamps.push({ x: p[0], z: p[1], look: [T.x[i], T.z[i]] });
    side = -side;
  }
  for (let z = fz + 19; z < shoreZ - 4; z += 15) for (const sx of [-1, 1]) {                    // 步行大道两侧
    const X = mcx + sx * 24.6; if (ok(X, z, 1.2, true, 0.6)) lamps.push({ x: X, z, look: [X - sx * 3, z] });
  }
  for (let k = 0; k < 8; k++) {                                                                // 穹顶广场外圈
    const a = (k / 8) * Math.PI * 2 + 0.2, X = ccx + Math.cos(a) * (CR + 7), Z = ccz + Math.sin(a) * (CR + 7);
    if (ok(X, Z, 1.2, true, 0.6)) lamps.push({ x: X, z: Z, look: [ccx, ccz] });
  }
  const LG = lampGeometry();
  inst(tinted(LG.pole, STEEL), M.steel, lamps, 'lampPoles', { cast: false });
  inst(LG.head, M.lamp, lamps, 'lampHeads', { cast: false });
  onStep(0.4);

  // ——— 凉亭：穹顶广场南侧一排，展览馆旁边几座 ———
  const kiosks = [];
  for (let k = 0; k < 7; k++) {
    const a = 0.32 + (k / 7) * (Math.PI - 0.64), X = ccx + Math.cos(a) * (CR + 13), Z = ccz + Math.sin(a) * (CR + 13);
    if (ok(X, Z, 4.5, true, 3)) kiosks.push({ ...pose(X, 0, Z, r() * 6.28), c: KIOSK_COLORS[k % 3] });
  }
  PLAN.domes.forEach((d) => { for (let k = 0; k < 3; k++) { const a = 0.5 + k * 0.75, X = d.c[0] + Math.cos(a) * (d.r + 11), Z = d.c[1] + Math.sin(a) * (d.r + 11); if (ok(X, Z, 4.5, true, 3)) kiosks.push({ ...pose(X, 0, Z, r() * 6.28), c: KIOSK_COLORS[k % 3] }); } });
  const KG = kioskGeometry();
  inst(tinted(KG.base, [0.97, 0.97, 0.96]), M.paint, kiosks, 'kiosks');
  inst(tinted(KG.roof, [1, 1, 1]), M.gloss, kiosks, 'kioskRoofs');
  onStep(0.5);

  // ——— 广告牌：十一城 / NOVA 交替，朝着驶来的车 ———
  const boards = [[], []];
  let lastS = 30;                                                                       // 把起点线当成一块已占的牌：终点前那段直道上也不再立牌子
  for (const i of walk(T, 12)) {
    const s = i * T.ds, gap = Math.min(s - lastS, T.L - (s - lastS));                   // 到上一块牌的沿程距离（跨过起点也算）
    if (s < 270 || gap < 215) continue;
    for (const sd of [1, -1]) {
      const p = pointAt(T, i, sd * (T.hw[i] + WALL + 3.8)), up = pointAt(T, (i - 20 + T.N) % T.N, 0);
      if (!ok(p[0], p[1], 1.5, true, 2.5) || Math.hypot(p[0] - T.x[0], p[1] - T.z[0]) < 125 || palms.some((q) => Math.hypot(q.x - p[0], q.z - p[1]) < 3.5)) continue;   // 赛道会折叠：离起点的直线距离也要够远
      boards[boards[0].length <= boards[1].length ? 0 : 1].push({ x: p[0], z: p[1], look: [up[0], up[1]] });
      lastS = s; break;
    }
  }
  ['eleven', 'nova'].forEach((k, j) => {
    const g = boardGeometry(SIGN_UV[k]);
    inst(tinted(g.frame, STEEL), M.steel, boards[j], 'boardFrames' + j);
    inst(g.panel, M.sign, boards[j], 'boardPanels' + j, { cast: false });
  });
  onStep(0.6);

  // ——— 旗子：跨海大桥两侧的墙顶上，顺着风（向东）飘 ———
  const flags = [];
  for (const i of walk(T, 10)) {
    const name = T.zoneNames[T.zone[i]];
    if (name !== 'start' && name !== 'final') continue;
    for (const sd of [-1, 1]) { const p = pointAt(T, i, sd * (T.hw[i] + WALL - 0.35)); flags.push(pose(p[0], WALL + 2.05, p[1], (r() - 0.5) * 0.4)); }
  }
  inst(tinted(new THREE.CylinderGeometry(0.04, 0.06, 4.4, 5).translate(0, 2.2, 0), STEEL), M.steel, flags, 'flagPoles', { cast: false });
  inst(tinted(new THREE.PlaneGeometry(1.5, 0.95, 10, 1).translate(0.75, -0.5, 0), [1, 1, 1]), M.flag, flags, 'flags', { cast: false });
  onStep(0.7);

  // ——— 帆船：外海和港湾里（不停在桥底下） ———
  const boats = [];
  for (let k = 0; k < 500 && boats.length < 26; k++) {
    const X = (r() - 0.5) * 980, Z = (r() - 0.5) * 840;
    if (distToLand(X, Z) < 28 || (Math.abs(Z - T.z[0]) < 18 && X > -44 && X < 160) || boats.some((b) => Math.hypot(b.x - X, b.z - Z) < 26)) continue;
    boats.push({ ...pose(X, WATER_Y, Z, r() * 6.28), ph: r() * 6.28, c: HULLS[boats.length % HULLS.length] });
  }
  const BG = boatGeometry(), boatMeshes = [];
  for (const [g, mat, nm] of [[BG.hull, M.gloss, 'boatHulls'], [BG.deck, M.paint, 'boatDecks'], [BG.sail, M.sail, 'boatSails']]) boatMeshes.push(inst(tinted(g, [1, 1, 1]), mat, boats, nm, { cast: false, recv: false }));
  onStep(0.75);

  // ——— 起点门架 ———
  const lights = startGantry(B, S, M, T);
  for (const l of lights) group.add(l.mesh);
  onStep(0.8);

  // ——— 港湾北岸的栏杆、步行大道边的花池 ———
  quayRails(B, M);
  for (let k = 0; k < 7; k++) for (const sgn of [-1, 1]) {
    const X = mcx + sgn * 24.2, Z = fz + 24 + k * 9.5;
    if (!ok(X, Z, 1.2, true, 0.6)) continue;
    B.box(M.stone, 1.6, 0.75, 5.2, X, 0.37, Z, [1.02, 1.01, 0.98], { uv: 2 });
    B.box(M.hedge, 1.3, 0.7, 4.7, X, 1.05, Z, [0.80, 0.95, 0.78]);
  }
  onStep(0.9);

  // ——— 行人：步行大道和穹顶广场上（不站进喷泉池） ———
  const people = [];
  for (let k = 0; k < 120; k++) {
    const onAve = r() < 0.55, a = r() * Math.PI * 2, rad = CR + 1 + r() * 6.5;
    const X = onAve ? mcx + (r() - 0.5) * 46 : ccx + Math.cos(a) * rad, Z = onAve ? fz + 15 + r() * (shoreZ - fz - 20) : ccz + Math.sin(a) * rad;
    if (distToLand(X, Z) > 0 || Math.hypot(X - ccx, Z - ccz) < 9.5) continue;
    people.push(pose(X, 0, Z, r() * 6.28, 0.92 + r() * 0.16));
  }
  inst(new THREE.CapsuleGeometry(0.2, 0.6, 3, 6).translate(0, 0.52, 0), new THREE.MeshStandardMaterial({ roughness: 0.85 }), people.map((p) => ({ ...p, c: SHIRT[(r() * SHIRT.length) | 0] })), 'people');
  inst(new THREE.SphereGeometry(0.135, 7, 5).translate(0, 1.2, 0), new THREE.MeshStandardMaterial({ roughness: 0.7 }), people.map((p) => ({ ...p, c: SKIN[(r() * SKIN.length) | 0] })), 'peopleHeads', { cast: false });

  B.build(group, { name: 'props' });
  S.build(group, { name: 'propsFx', castShadow: false, receiveShadow: true });
  onStep(1);

  const ob = new THREE.Object3D();
  return {
    group, lights,
    counts: { palms: palms.length, lamps: lamps.length, kiosks: kiosks.length, boards: boards[0].length + boards[1].length, flags: flags.length, boats: boats.length, people: people.length },
    update(time) {
      M.flagUni.value = time;
      boats.forEach((b, k) => {                                                         // 帆船随浪起伏、慢慢荡开
        ob.position.set(b.x + Math.sin(time * 0.05 + b.ph) * 6, WATER_Y + 0.12 * Math.sin(time * 0.9 + b.ph), b.z + Math.cos(time * 0.04 + b.ph) * 6);
        ob.rotation.set(0.035 * Math.sin(time * 0.8 + b.ph * 1.3), b.ry + Math.sin(time * 0.05 + b.ph) * 0.3, 0.03 * Math.sin(time * 0.7 + b.ph));
        ob.scale.set(1, 1, 1); ob.updateMatrix();
        for (const m of boatMeshes) m.setMatrixAt(k, ob.matrix);
      });
      for (const m of boatMeshes) m.instanceMatrix.needsUpdate = true;
    },
  };
}

/** 起点门架：两侧立柱 + 桁架横梁 + 横幅 + 五盏信号灯。返回灯 [{ mesh, mat }]（比赛逻辑改 emissiveIntensity） */
function startGantry(B, S, M, T) {
  const i = 0, X = T.x[i], Z = T.z[i], th = T.th[i], dx = Math.cos(th), dz = Math.sin(th), rx = -Math.sin(th), rz = Math.cos(th), L = T.hw[i] + WALL + 1.0;
  const at = (s, lat, y) => [X + dx * s + rx * lat, y, Z + dz * s + rz * lat];
  for (const sd of [-1, 1]) {
    const p = at(0, sd * L, 0);
    B.box(M.steel, 0.9, 11.6, 0.9, p[0], 5.8, p[2], STEEL, { ry: -th });
    B.box(M.concrete, 2.2, 0.7, 2.2, p[0], 0.35, p[2], [0.97, 0.97, 0.96], { ry: -th, uv: 3 });
  }
  const H0 = 9.9, H1 = 11.6;
  for (const y of [H0, H1]) for (const s of [-0.45, 0.45]) B.rod(M.steel, at(s, -L, y), at(s, L, y), 0.2, STEEL, 6);
  for (let k = 0; k <= 12; k++) {
    const lat = -L + (2 * L * k) / 12;
    B.rod(M.steel, at(-0.45, lat, H0), at(0.45, lat, H1), 0.09, STEEL, 4);
    if (k === 12) continue;
    const lat2 = -L + (2 * L * (k + 1)) / 12;
    B.rod(M.steel, at(0.45, lat, H0), at(-0.45, lat2, H0), 0.09, STEEL, 4);
    B.rod(M.steel, at(0.45, lat, H1), at(-0.45, lat2, H1), 0.09, STEEL, 4);
    B.rod(M.steel, at(0, lat, H0), at(0, lat2, H1), 0.08, STEEL, 4);
  }
  // 横幅：黑底箱 + 画面，朝着驶来的车（起点线的东侧）
  const bw = 2 * L - 3, bb = at(0, 0, 8.3), bp = at(-0.31, 0, 8.3);
  B.box(M.dark, bw, 2.6, 0.5, bb[0], bb[1], bb[2], [0.1, 0.1, 0.12], { ry: -th });
  S.add(M.banner, plane(bw - 0.4, 2.3).rotateY(Math.atan2(-dx, -dz)), { x: bp[0], y: bp[1], z: bp[2] }, [1, 1, 1]);
  // 五盏信号灯嵌在桁架里，两面都看得见
  const lights = [];
  for (let k = 0; k < 5; k++) {
    const p = at(0, (k - 2) * 1.7, 10.75), mat = new THREE.MeshStandardMaterial({ color: 0x1a0a08, emissive: new THREE.Color(0xff2a18), emissiveIntensity: 0, roughness: 0.4 });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.7, 14), mat);
    m.position.set(p[0], p[1], p[2]); m.rotation.set(Math.PI / 2, Math.atan2(dx, dz), 0, 'YXZ'); m.name = 'startLight';
    lights.push({ mesh: m, mat });
  }
  return lights;
}

/** 港湾北岸的白色栏杆（看台那一段不留） */
function quayRails(B, M) {
  const z = (119 - 73.5) * 3 - 1.3, x0 = (76 - 84.5) * 3 + 1.5, x1 = (126 - 84.5) * 3 - 1.5, { stand } = PLAN;
  for (const [a, b] of [[x0, stand.x0 - 2.5], [stand.x1 + 2.5, x1]]) {
    if (b - a < 4) continue;
    const len = b - a, cx = (a + b) / 2;
    B.box(M.paint, len, 0.09, 0.09, cx, 1.12, z, WHITE);
    B.box(M.paint, len, 0.06, 0.06, cx, 0.66, z, WHITE);
    for (let x = a; x <= b + 0.01; x += 2.4) B.box(M.paint, 0.1, 1.14, 0.1, x, 0.57, z, WHITE);
  }
}
