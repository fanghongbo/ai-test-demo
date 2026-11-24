// 自行车：巡航车（cruiser）。静态件合批成几个网格（车架 / 转向总成 / 车轮），动件分组驱动。
// 运动学全部由 core/bike.js 导出：车轮角、曲柄角、链条位移同源于一个“速度”。
import * as THREE from 'three';
import { addOutline, toonMaterial, ToonBatch } from '../gfx/toon.js';
import { loftGeometry } from '../gfx/loft.js';
import * as S from '../gfx/shapes.js';
import { BIKE, RING_R, COG_R, chainLoop, chainPoint } from '../core/bike.js';
import { TAU, clamp } from '../core/mathx.js';
import { wickerTexture, woodTexture, stripeTexture } from '../gfx/textures.js';

export const PAINT = Object.freeze({
  frame: 0x74cfb8, cream: 0xf4ead2, chrome: 0xe2e6ea, spoke: 0xc9ced6, dark: 0x3b3d4a, tire: 0xefe3c6, tread: 0x4d4956,
  leather: 0xb9703c, brass: 0xe9b94a, wood: 0xc08a55, fish: 0x9fc9ea, fishBack: 0x5589c0, skin: 0xf08a3c,
});

const R = BIKE.wheelR;
const V = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const SPEC = { spec: 0.55, specSize: 0.5 };
const CHROME = { spec: 0.85, specSize: 0.42 };

/** 链轮：齿根/齿顶交替顶点的 extrude 轮廓，轮面法线为 X 轴 */
function gearGeometry(teeth, rPitch, thick, holes = []) {
  const pts = [];
  const rRoot = rPitch - 0.0065, rTip = rPitch + 0.0062, da = TAU / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * da;
    pts.push([rRoot * Math.cos(a), rRoot * Math.sin(a)]);
    pts.push([rRoot * Math.cos(a + da * 0.3), rRoot * Math.sin(a + da * 0.3)]);
    pts.push([rTip * Math.cos(a + da * 0.45), rTip * Math.sin(a + da * 0.45)]);
    pts.push([rTip * Math.cos(a + da * 0.62), rTip * Math.sin(a + da * 0.62)]);
    pts.push([rRoot * Math.cos(a + da * 0.78), rRoot * Math.sin(a + da * 0.78)]);
  }
  const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
  for (const [hx, hy, hr] of holes) { const h = new THREE.Path(); h.absarc(hx, hy, hr, 0, TAU, true); shape.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 12 });
  g.translate(0, 0, -thick / 2);
  g.rotateY(Math.PI / 2);
  return g;
}

function helix(cx, y0, y1, cz, r, turns, tubeR) {
  const pts = [];
  const n = Math.round(turns * 14);
  for (let i = 0; i <= n; i++) { const t = i / n, a = t * turns * TAU; pts.push([cx + r * Math.cos(a), y0 + (y1 - y0) * t, cz + r * Math.sin(a)]); }
  return S.tube(pts, tubeR, { tubular: n * 2, radial: 6 });
}

/** 挡泥板：沿轮周圆弧放样的扁带 */
function fenderGeometry(axleZ, phi0, phi1, radius, halfW = 0.062, halfT = 0.011) {
  return loftGeometry((t, out) => {
    const a = (phi0 + (phi1 - phi0) * t) * Math.PI / 180;
    out.set(0, R + radius * Math.sin(a), axleZ + radius * Math.cos(a));
  }, { a: halfW, bt: halfT, bb: halfT * 1.25 }, { rings: 30, radial: 16, caps: [false, false], ref: new THREE.Vector3(1, 0, 0) });
}

/** 小鱼（头朝 +Z）：车筐里、海里跳的鱼共用 */
export function fishGeometry(len = 0.24) {
  const b = new ToonBatch('fish');
  const k = len / 0.24;
  b.add(loftGeometry((t, out) => out.set(0, 0, -len * 0.5 + len * t), (t) => {
    const h = Math.sin(Math.PI * Math.pow(t, 0.72)) * (1 - 0.25 * t);
    return { a: 0.078 * k * h + 0.002, bt: 0.17 * k * h + 0.002, bb: 0.15 * k * h + 0.002 };
  }, { rings: 18, radial: 16 }), null, PAINT.fish, { spec: 0.7, specSize: 0.5 });
  b.add(loftGeometry((t, out) => out.set(0, 0.012 * k, -len * 0.42 + len * 0.72 * t), (t) => {
    const h = Math.sin(Math.PI * Math.pow(t, 0.8)) * 0.5 + 0.01;
    return { a: 0.06 * k * h, bt: 0.06 * k * h, bb: 0.012 };
  }, { rings: 12, radial: 12 }), null, PAINT.fishBack, { outline: 0 });
  const tail = S.extrude([[-0.05 * k, 0], [-0.12 * k, 0.1 * k], [-0.085 * k, 0], [-0.12 * k, -0.1 * k]], 0.012 * k, { bevel: 0.003 });
  b.add(tail.rotateY(-Math.PI / 2).translate(0, 0, -len * 0.52), null, PAINT.fishBack, { outline: 0.8 });
  for (const s of [1, -1]) b.addAt(S.sphere(0.014 * k, 10, 8), [s * 0.026 * k, 0.02 * k, len * 0.36], [0, 0, 0], [1, 1, 1], 0x1d1a24, { outline: 0 });
  return b;
}

/** 单色网格 + 描边的快捷方式 */
function part(U, geo, color, o = {}, outline = 1) {
  const m = new THREE.Mesh(geo, toonMaterial(U, color, o));
  m.castShadow = o.castShadow ?? true; m.receiveShadow = true;
  if (outline > 0) addOutline(m, U, { px: outline });
  return m;
}

export function createBicycle(U, o = {}) {
  const root = new THREE.Group();
  root.name = 'bicycle';
  const T = BIKE;
  const detail = o.detail ?? 1;

  // ———————————— 车轮（原型，两轮共用） ————————————
  const wb = new ToonBatch('wheel');
  const torusR = R - BIKE.tireR;
  wb.add(S.torus(torusR, BIKE.tireR, 16, 72).rotateY(Math.PI / 2), null, PAINT.tire, { outline: 1 });
  wb.add(S.torus(R - 0.004, 0.012, 8, 80).rotateY(Math.PI / 2), null, PAINT.tread, { outline: 0.35 });
  wb.add(S.cyl(0.256, 0.256, 0.03, 64, true).rotateZ(Math.PI / 2), null, PAINT.cream, { spec: 0.35, outline: 0.7 });
  for (const s of [1, -1]) wb.add(S.torus(0.256, 0.0065, 6, 64).rotateY(Math.PI / 2).translate(s * 0.015, 0, 0), null, PAINT.chrome, { ...CHROME, outline: 0.5 });
  wb.add(S.cyl(0.034, 0.034, 0.09, 16).rotateZ(Math.PI / 2), null, PAINT.chrome, CHROME);
  for (const s of [1, -1]) wb.add(S.cyl(0.048, 0.044, 0.01, 16).rotateZ(Math.PI / 2).translate(s * 0.034, 0, 0), null, PAINT.chrome, { ...CHROME, outline: 0.6 });
  const nSpokes = detail >= 1 ? BIKE.spokes : 16;
  for (let i = 0; i < nSpokes; i++) {
    const a = (i / nSpokes) * TAU, side = i % 2 ? 1 : -1, ah = a + (i % 4 < 2 ? 1.0 : -1.0);
    wb.add(S.rod([side * 0.034, 0.044 * Math.cos(ah), 0.044 * Math.sin(ah)], [0, 0.252 * Math.cos(a), 0.252 * Math.sin(a)], 0.0034, 5), null, PAINT.spoke, { outline: 0 });
  }
  wb.add(S.cyl(0.0065, 0.0065, 0.045, 8).translate(0, -0.225, 0), null, PAINT.chrome, { outline: 0 });
  const wheelProto = wb.build(U);

  const rearWheel = new THREE.Group(); rearWheel.name = 'rearWheel';
  rearWheel.position.set(0, R, BIKE.rearZ); rearWheel.add(wheelProto);
  const cogB = new ToonBatch('cog');
  cogB.add(gearGeometry(BIKE.cogTeeth, COG_R, 0.036, [[0, 0, 0.012]]), null, PAINT.dark, { ...CHROME, outline: 0.8 });
  const cog = cogB.build(U); cog.position.x = BIKE.cogX; rearWheel.add(cog);
  root.add(rearWheel);

  const frontWheel = new THREE.Group(); frontWheel.name = 'frontWheel';
  frontWheel.add(wheelProto.clone());

  // ———————————— 车架等静态件 ————————————
  const fb = new ToonBatch('frame');
  const mint = (pts, r) => fb.add(S.tube(pts, r, { tubular: 22, radial: 12 }), null, PAINT.frame, SPEC);
  const chrome = (pts, r) => fb.add(S.tube(pts, r, { tubular: 18, radial: 10 }), null, PAINT.chrome, CHROME);
  mint([T.headTubeBot, [0, 0.89, 0.435], T.headTubeTop], 0.028);                                   // 头管
  mint([T.headTubeBot, [0, 0.56, 0.24], [0, 0.36, 0.02], T.bb], 0.029);                            // 下管
  mint([T.bb, [0, 0.55, -0.17], [0, 0.80, -0.252]], 0.026);                                        // 立管
  mint([[0, 0.985, 0.405], [0, 1.0, 0.10], [0, 0.86, -0.22], [0, 0.80, -0.252]], 0.024);          // 上管（上拱）
  for (const s of [1, -1]) {
    mint([[s * 0.03, 0.29, -0.09], [s * 0.05, 0.31, -0.32], [s * 0.065, R, BIKE.rearZ]], 0.015);   // 后下叉
    mint([[s * 0.022, 0.79, -0.255], [s * 0.05, 0.58, -0.42], [s * 0.065, R + 0.012, BIKE.rearZ]], 0.013); // 后上叉
  }
  chrome([[0, 0.80, -0.252], [0, 0.845, -0.266]], 0.017);                                          // 座管
  fb.add(loftGeometry((t, out) => out.set(0, 0.850, -0.39 + 0.26 * t), (t) => {                    // 弹簧皮座：顶面恰好贴着鹈鹕肚皮
    const w = 0.004 + 0.098 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.7) * (1 - 0.62 * t);
    return { a: w, bt: 0.006 + 0.013 * Math.sin(Math.PI * t), bb: 0.01 + 0.026 * Math.sin(Math.PI * Math.pow(t, 0.8)) };
  }, { rings: 20, radial: 18 }), null, PAINT.leather, { spec: 0.35, specSize: 0.6 });
  for (const s of [1, -1]) fb.add(helix(s * 0.058, 0.79, 0.838, -0.352, 0.021, 4.5, 0.0055), null, PAINT.chrome, { ...CHROME, outline: 0.7 });
  fb.add(S.box(0.16, 0.012, 0.03, 0.005).translate(0, 0.836, -0.352), null, PAINT.chrome, { ...CHROME, outline: 0.7 });
  fb.add(fenderGeometry(BIKE.rearZ, 52, 198, 0.378), null, PAINT.frame, SPEC);                      // 后挡泥板
  for (const s of [1, -1]) for (const a of [1.05, 2.75]) chrome([[s * 0.068, R + 0.004, BIKE.rearZ], [s * 0.064, R + 0.37 * Math.sin(a), BIKE.rearZ + 0.37 * Math.cos(a)]], 0.006);
  for (const s of [1, -1]) {                                                                        // 后货架
    chrome([[s * 0.065, R + 0.02, BIKE.rearZ], [s * 0.125, 0.73, -0.46], [s * 0.125, 0.73, -0.745]], 0.007);
    chrome([[s * 0.125, 0.73, -0.47], [s * 0.07, 0.80, -0.30]], 0.006);
  }
  chrome([[-0.125, 0.73, -0.745], [0.125, 0.73, -0.745]], 0.007); chrome([[-0.125, 0.73, -0.46], [0.125, 0.73, -0.46]], 0.007);
  { const cb = new ToonBatch('crate'); cb.add(S.box(0.30, 0.15, 0.25, 0.012), null, 0xffffff, { outline: 1 });   // 木箱
    const m = cb.build(U, { map: woodTexture() }); m.position.set(0, 0.81, -0.605); root.add(m); }
  chrome([[0.135, 0.84, -0.70], [0.135, 1.30, -0.72], [0.135, 1.80, -0.755]], 0.0065);             // 旗杆
  fb.add(S.sphere(0.016, 10, 8).translate(0.135, 1.805, -0.755), null, PAINT.brass, { ...CHROME, outline: 0.8 });
  root.add(fb.build(U));

  // ———————————— 转向总成（绕头管轴转动） ————————————
  const pivot = V(T.headTubeTop);
  const axis = V(T.headTubeTop).sub(V(T.headTubeBot)).normalize();
  const q0 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  const rel = (p) => V(p).sub(pivot).applyQuaternion(q0.clone().invert());
  const steerPivot = new THREE.Group(); steerPivot.name = 'steerPivot'; steerPivot.position.copy(pivot); steerPivot.quaternion.copy(q0);
  const steer = new THREE.Group(); steer.name = 'steer'; steerPivot.add(steer); root.add(steerPivot);

  const sb = new ToonBatch('steer');
  const sChrome = (pts, r, col = PAINT.chrome, o = CHROME) => sb.add(S.tube(pts, r, { tubular: 18, radial: 10 }), null, col, o);
  sChrome([T.headTubeTop, T.stemTop], 0.018);                                                      // 把立
  sChrome([[0, 1.062, 0.39], [0, 1.075, 0.415]], 0.016);
  const bar = [[0, 1.075, 0.415], [0.10, 1.078, 0.405], [0.20, 1.072, 0.35], [0.275, 1.057, 0.283], [0.302, 1.05, 0.262]];
  sChrome(bar, 0.0145); sChrome(bar.map((p) => [-p[0], p[1], p[2]]), 0.0145);
  for (const s of [1, -1]) {                                                                        // 把套
    sb.add(S.tube([[s * 0.243, 1.059, 0.295], [s * 0.305, 1.0495, 0.26], [s * 0.33, 1.046, 0.25]], 0.0225, { tubular: 8, radial: 14 }), null, PAINT.leather, { spec: 0.3, specSize: 0.6 });
    sb.add(S.sphere(0.0225, 12, 10).translate(s * 0.33, 1.046, 0.25), null, PAINT.leather, { outline: 0.8 });
  }
  sb.add(S.box(0.125, 0.03, 0.055, 0.01).translate(0, 0.772, 0.482), null, PAINT.chrome, { ...CHROME, outline: 0.8 });  // 前叉肩
  for (const s of [1, -1]) sChrome([[s * 0.052, 0.768, 0.487], [s * 0.059, 0.60, 0.507], [s * 0.059, 0.44, 0.548], [s * 0.053, R + 0.004, BIKE.frontZ]], 0.0155);
  sb.add(fenderGeometry(BIKE.frontZ, -22, 112, 0.378), null, PAINT.frame, SPEC);                   // 前挡泥板
  for (const s of [1, -1]) for (const a of [0.55, 1.75]) sChrome([[s * 0.068, R + 0.004, BIKE.frontZ], [s * 0.064, R + 0.37 * Math.sin(a), BIKE.frontZ + 0.37 * Math.cos(a)]], 0.006);
  sb.add(S.cyl(0.043, 0.047, 0.09, 20).rotateX(Math.PI / 2).translate(0, 0.842, 0.575), null, PAINT.chrome, CHROME);   // 车灯灯身
  sb.add(S.sphere(0.043, 20, 10, 0, TAU, Math.PI / 2, Math.PI / 2).rotateX(-Math.PI / 2).translate(0, 0.842, 0.53), null, PAINT.chrome, { ...CHROME, outline: 0.6 });
  let basketMesh; { const bb = new ToonBatch('basket');                                            // 编织车筐：四个梯形面各占一份完整贴图
    const h = 0.21, y0 = 0.895, cz = 0.505, bw = 0.165, bd = 0.118, tw = 0.215, td = 0.152;
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const face = (k, flip) => {
      const [ax, az] = corners[k], [bx, bz] = corners[(k + 1) % 4];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([ax * bw, y0, cz + az * bd, bx * bw, y0, cz + bz * bd, bx * tw, y0 + h, cz + bz * td, ax * tw, y0 + h, cz + az * td], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      g.setIndex(flip ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]);
      g.computeVertexNormals();
      return g;
    };
    for (let k = 0; k < 4; k++) { bb.add(face(k, false), null, 0xffffff, { outline: 1.1 }); bb.add(face(k, true), null, 0xe6cf9e, { outline: 0 }); }   // 外壁 + 内壁
    bb.add(S.box(bw * 2, 0.014, bd * 2, 0.004).translate(0, y0 + 0.007, cz), null, 0xc99a5e, { outline: 0.7 });
    for (const [sx, sz] of corners) bb.add(S.rod([sx * bw, y0, cz + sz * bd], [sx * tw, y0 + h, cz + sz * td], 0.012, 6), null, 0xa9773f, { outline: 0.8 });   // 四角立柱
    const tex = wickerTexture(); tex.repeat.set(2, 1);
    basketMesh = bb.build(U, { map: tex }); }
  sChrome(S.roundedRectPoints(0.44, 0.314, 0.05, 5).map((p) => [p[0], 1.105, 0.505 + p[1]]).concat([[0.22, 1.105, 0.505]]), 0.016, 0xc99a5e, { spec: 0.1 });   // 卷边筐口
  for (const s of [1, -1]) sChrome([[s * 0.068, R + 0.004, BIKE.frontZ], [s * 0.15, 0.895, 0.57]], 0.0065);
  const steerMesh = sb.build(U);
  steerMesh.position.copy(rel([0, 0, 0]));
  basketMesh.position.copy(rel([0, 0, 0]));
  steer.add(steerMesh, basketMesh);
  frontWheel.position.copy(rel([0, R, BIKE.frontZ])); steer.add(frontWheel);

  // 灯罩（夜里点亮）
  const lens = part(U, S.cyl(0.038, 0.038, 0.006, 20).rotateX(Math.PI / 2).translate(0, 0.842, 0.621), 0xfff4c4, { emissive: 0xffe08a, emissiveLevel: 0, spec: 0.9, specSize: 0.4 }, 0.6);
  const lensToon = lens.material;                                  // 写实风格下网格会换上 PBR 材质：自发光始终写在这份赛璐璐材质上，由 style kit 同步过去
  lens.position.copy(rel([0, 0, 0])); lens.castShadow = false; steer.add(lens);
  const lampAnchor = new THREE.Object3D(); lampAnchor.name = 'lampAnchor'; lampAnchor.position.copy(rel([0, 0.842, 0.63])); steer.add(lampAnchor);   // 车灯位置 / 朝向锚点
  // 车铃（可抖动）
  const bellBase = part(U, S.cyl(0.016, 0.02, 0.024, 12), 0x3b3d4a, { spec: 0.5 }, 0.8);
  bellBase.position.copy(rel([0.15, 1.098, 0.383])); steer.add(bellBase);
  const bell = new THREE.Group(); bell.name = 'bell'; bell.position.copy(rel([0.15, 1.122, 0.383]));
  bell.add(part(U, S.sphere(0.034, 20, 10, 0, TAU, 0, Math.PI / 2), PAINT.brass, { spec: 0.95, specSize: 0.38 }, 0.9));
  bell.add(part(U, S.cyl(0.012, 0.012, 0.02, 10), PAINT.dark, { spec: 0.4 }, 0.5).translateY(-0.008));
  steer.add(bell);
  // 筐里的鱼（尾巴朝上）
  { const f = fishGeometry(0.23).build(U); f.name = 'basketFish';
    const up = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));               // 头朝下、尾朝上插在筐里
    for (const [p, r] of [[[0.075, 1.035, 0.50], [0.16, 0.25, 0.30]], [[-0.07, 1.045, 0.535], [0.12, -0.7, -0.36]]]) {
      const m = f.clone(); m.position.copy(rel(p)); m.quaternion.setFromEuler(new THREE.Euler(r[0], r[1], r[2])).multiply(up); steer.add(m);
    } }
  // 抓握锚点（翅膀 IK 目标）
  const gripL = new THREE.Object3D(); gripL.position.copy(rel([BIKE.grip[0] - 0.02, BIKE.grip[1], BIKE.grip[2] + 0.02])); steer.add(gripL);
  const gripR = new THREE.Object3D(); gripR.position.copy(rel([-BIKE.grip[0] + 0.02, BIKE.grip[1], BIKE.grip[2] + 0.02])); steer.add(gripR);

  // ———————————— 曲柄 / 牙盘 / 踏板 / 蹼足 ————————————
  const crankGroup = new THREE.Group(); crankGroup.name = 'crank'; crankGroup.position.set(0, T.bb[1], T.bb[2]); root.add(crankGroup);
  { const rb = new ToonBatch('ring');
    const holes = [[0, 0, 0.013]]; for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.3; holes.push([0.048 * Math.cos(a), 0.048 * Math.sin(a), 0.019]); }
    rb.add(gearGeometry(BIKE.ringTeeth, RING_R, 0.005, holes), null, PAINT.chrome, { ...CHROME, outline: 0.8 });
    rb.add(S.cyl(0.024, 0.024, 0.03, 14).rotateZ(Math.PI / 2), null, PAINT.dark, { outline: 0.8 });
    const ring = rb.build(U); ring.position.x = BIKE.ringX; crankGroup.add(ring); }
  const pedals = [];
  for (const side of [1, -1]) {
    const arm = new THREE.Group(); arm.position.x = side * 0.105; if (side < 0) arm.rotation.x = Math.PI; crankGroup.add(arm);
    const ab = new ToonBatch('arm');
    ab.add(S.box(0.02, T.crank + 0.045, 0.034, 0.008).translate(0, T.crank / 2, 0), null, PAINT.chrome, { ...CHROME, outline: 0.9 });
    ab.add(S.cyl(0.03, 0.03, 0.022, 16).rotateZ(Math.PI / 2), null, PAINT.chrome, { ...CHROME, outline: 0.8 });
    arm.add(ab.build(U));
    const pedal = new THREE.Group(); pedal.name = side > 0 ? 'pedalL' : 'pedalR'; pedal.position.set(0, T.crank, 0); arm.add(pedal);
    const pb = new ToonBatch('pedal');
    pb.add(S.cyl(0.009, 0.009, 0.085, 10).rotateZ(Math.PI / 2).translate(side * 0.045, 0, 0), null, PAINT.chrome, { outline: 0.5 });
    pb.add(S.box(0.105, 0.02, 0.082, 0.006).translate(side * 0.105, 0.002, 0), null, PAINT.dark, { outline: 1 });
    for (const sz of [1, -1]) pb.add(S.box(0.085, 0.012, 0.006, 0.002).translate(side * 0.105, 0.002, sz * 0.042), null, 0xf2a23c, { outline: 0.6 });
    pedal.add(pb.build(U));
    pedals.push({ side, arm, pedal });
  }
  const feet = {};
  { // 蹼足：脚掌平放在踏板上（随踏板保持水平），三趾 + 蹼
    const fx = new ToonBatch('foot');
    const shape = [[-0.03, -0.035], [0.03, -0.035]];
    for (const a of [0.42, 0, -0.42]) shape.push([0.05 * Math.sin(a) + 0.012, 0.085 * Math.cos(a) + 0.03]);
    fx.add(S.extrude(shape, 0.014, { bevel: 0.004 }), null, PAINT.skin, { spec: 0.25 });
    for (const a of [-0.42, 0, 0.42]) fx.add(S.rod([0.012, 0, 0.0], [0.05 * Math.sin(a) + 0.012, 0, 0.1 * Math.cos(a) + 0.035], 0.0125, 7), null, PAINT.skin, { outline: 0.9 });
    const proto = fx.build(U);
    for (const { side, pedal } of pedals) {
      const f = proto.clone(); f.name = side > 0 ? 'footL' : 'footR';
      f.position.set(side * 0.105, 0.016, -0.012); f.rotation.y = -side * 0.14;   // 略外八
      pedal.add(f); feet[side] = f;
    }
  }

  // ———————————— 链条：实例化链节沿闭合回路滑动 ————————————
  const loop = chainLoop();
  const pitch = BIKE.chainPitch;
  const linkCount = Math.round(loop.length / pitch);
  const chain = new THREE.InstancedMesh(S.box(0.0115, 0.0085, pitch * 0.98, 0.003, 1), toonMaterial(U, PAINT.dark, { spec: 0.6 }), linkCount);
  chain.instanceMatrix.setUsage(THREE.DynamicDrawUsage); chain.castShadow = false; chain.frustumCulled = false; chain.name = 'chain';
  root.add(chain);
  // ———————————— 车尾三角旗：行波随车速变快变平 ————————————
  const FLAG = { cols: 9, rows: 3, len: 0.34, h: 0.17, x: 0.135, y: 1.795, z: -0.758 };
  const flagPos = new Float32Array((FLAG.cols * FLAG.rows) * 3);
  const flagGeo = new THREE.BufferGeometry();
  { const idx = [];
    for (let r = 0; r < FLAG.rows - 1; r++) for (let cIdx = 0; cIdx < FLAG.cols - 1; cIdx++) {
      const a = r * FLAG.cols + cIdx, b = a + 1, d = a + FLAG.cols, e = d + 1; idx.push(a, b, d, b, e, d);
    }
    const uv = new Float32Array(FLAG.cols * FLAG.rows * 2);
    for (let r = 0; r < FLAG.rows; r++) for (let cIdx = 0; cIdx < FLAG.cols; cIdx++) { uv[(r * FLAG.cols + cIdx) * 2] = cIdx / (FLAG.cols - 1); uv[(r * FLAG.cols + cIdx) * 2 + 1] = r / (FLAG.rows - 1); }
    flagGeo.setAttribute('position', new THREE.BufferAttribute(flagPos, 3).setUsage(THREE.DynamicDrawUsage));
    flagGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); flagGeo.setIndex(idx);
  }
  const flag = new THREE.Mesh(flagGeo, toonMaterial(U, 0xffffff, { map: stripeTexture('#ee5f4d', '#fff3dc', 6), side: THREE.DoubleSide, spec: 0.1, pbr: 'fabric' }));
  flag.name = 'flag'; flag.castShadow = true; flag.frustumCulled = false; root.add(flag);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _E = new THREE.Euler();
  const P2 = [0, 0], P2b = [0, 0];
  const state_ = { chainS: 0, bellT: -1, lamp: 0, steerAngle: 0 };

  const api = {
    root, flag, lampAnchor, rearWheel, frontWheel, crankGroup, chain, steer, pedals, feet, bell, gripL, gripR, lens,
    get steerAngle() { return state_.steerAngle; },
    get lamp() { return state_.lamp; },
    /** 每帧：由骑行状态驱动全部动件。extra: { curvature, lampLevel, ringBell } */
    update(state, dt, extra = {}) {
      const st = state_;
      rearWheel.rotation.x = frontWheel.rotation.x = -state.wheel;
      crankGroup.rotation.x = -state.crank;
      for (const { side, pedal } of pedals) pedal.rotation.x = state.crank + (side < 0 ? -Math.PI : 0);
      // 链条：踩踏时以牙盘节圆线速度前进；滑行时静止（飞轮）
      st.chainS = (st.chainS + state.crankVel * dt * RING_R + loop.length) % loop.length;
      for (let i = 0; i < linkCount; i++) {
        const s = i * pitch + st.chainS;
        chainPoint(loop, s, P2); chainPoint(loop, s + 0.004, P2b);
        _E.set(-Math.atan2(P2b[1] - P2[1], P2b[0] - P2[0]), 0, 0);
        _q.setFromEuler(_E); _p.set(BIKE.ringX + (i % 2 ? 0.0035 : -0.0035), P2[1], P2[0]);
        _s.set(i % 2 ? 1.25 : 0.8, 1, 1);
        chain.setMatrixAt(i, _m.compose(_p, _q, _s));
      }
      chain.instanceMatrix.needsUpdate = true;
      // 转向：路径曲率 → 前轮转角；低速时加入轻微的平衡摆动
      const wob = state.v < 2.2 && state.v > 0.05 ? Math.sin(state.time * 5.2) * 0.035 * (1 - state.v / 2.2) : 0;
      st.steerAngle = clamp(Math.atan(extra.curvature ?? 0) * 1.12, -0.5, 0.5) + wob;
      steer.rotation.y = state.air ? st.steerAngle * 0.5 : st.steerAngle;
      if (extra.ringBell) st.bellT = 0;
      if (st.bellT >= 0) {
        st.bellT += dt; const e = Math.exp(-st.bellT * 5.5);
        bell.rotation.z = Math.sin(st.bellT * 85) * 0.16 * e; bell.rotation.x = Math.cos(st.bellT * 63) * 0.07 * e;
        if (st.bellT > 1.6) { st.bellT = -1; bell.rotation.set(0, 0, 0); }
      }
      const target = extra.lampLevel ?? 0;
      st.lamp += (target - st.lamp) * Math.min(1, dt * 3);
      lensToon.uniforms.uEmissiveLevel.value = st.lamp;
      // 旗：向后飘，波速与幅度随车速增大
      const v = Math.min(state.v, 13);
      for (let r = 0; r < FLAG.rows; r++) for (let cIdx = 0; cIdx < FLAG.cols; cIdx++) {
        const u = cIdx / (FLAG.cols - 1), w = r / (FLAG.rows - 1);
        const ph = u * 7.5 - state.time * (3 + v * 1.1) + w * 0.9;
        const amp = (0.006 + 0.028 * Math.min(1, v / 6)) * u;
        const droop = (1 - Math.min(1, v / 2.2)) * u * u * 0.16;          // 低速下垂
        const i = (r * FLAG.cols + cIdx) * 3;
        flagPos[i] = FLAG.x + Math.sin(ph * 0.7 + 1) * amp * 0.8;
        flagPos[i + 1] = FLAG.y - u * 0.012 - FLAG.h * (1 - u * 0.92) * w - droop + Math.cos(ph) * amp;
        flagPos[i + 2] = FLAG.z - FLAG.len * u;
      }
      flagGeo.attributes.position.needsUpdate = true;
      flagGeo.computeVertexNormals();
    },
  };
  api.update({ wheel: 0, crank: Math.PI / 2, crankVel: 0, v: 0, time: 0, air: false }, 0.016, {});
  return api;
}
