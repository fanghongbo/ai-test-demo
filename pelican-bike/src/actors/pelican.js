// 鹈鹕：全部由放样/拉伸程序化生成，无外部模型。
// 结构（关节链，自躯干向外）：
//   躯干(蛋形放样) ─┬─ 颈(放样，逐帧重建) ─ 头 ─ 上喙 / 下颌+咽喉囊（放样，张口时绕颌关节重建）
//                   ├─ 大腿 → 小腿（双骨 IK，踝点跟随踏板）→ 蹼足（固定在踏板上）
//                   ├─ 上臂 → 前臂（双骨 IK，腕点跟随车把）→ 翼指（深色飞羽，包住把套）
//                   └─ 尾扇、围巾（Verlet 布料）
import * as THREE from 'three';
import { addOutline, toonMaterial, ToonBatch } from '../gfx/toon.js';
import { Loft, loftGeometry } from '../gfx/loft.js';
import * as S from '../gfx/shapes.js';
import { spline, clamp, clamp01, lerp, springStep, spring, smoothstep, TAU, mulberry32 } from '../core/mathx.js';
import { BIKE } from '../core/bike.js';
import { solveTwoBone } from '../core/ik.js';
import { makeCloth, initCloth, stepCloth, rideWind, nodeIndex } from '../core/cloth.js';
import { scarfTexture, helmetTexture } from '../gfx/textures.js';

export const COL = Object.freeze({
  feather: 0xf7f2e6, primary: 0x3b3a4f, beak: 0xf28c2c, pouch: 0xf9cf86, nail: 0xd9502e, mouth: 0x7a2630,
  eyeWhite: 0xfffdf5, eyeDark: 0x272130, skin: 0xf6c56b, leg: 0xf08a3c, scarf: 0x5cc3ae, strap: 0x3b3d4a,
});
export const PEL = Object.freeze({
  bodyCenter: [0, 1.19, -0.12],
  spineFront: [0, 1.10, 0.22], spineBack: [0, 1.33, -0.66],
  neckBase: [0, 1.28, 0.12],                    // 颈从胸口前上方探出
  headCenter: [0, 2.045, 0.455], headRadii: [0.152, 0.150, 0.168],
  neckAttach: [0, -0.085, -0.070],              // 头局部：颈进入头部的位置
  jawPivot: [0, -0.05, 0.115],                  // 头局部：颌关节
  // 上喙：末端下钩成“甲”；下颌：从喉部一直伸到喙尖，下面挂着喉囊
  upper: [[0, -0.045, 0.125], [0, -0.070, 0.335], [0, -0.100, 0.535], [0, -0.130, 0.685], [0, -0.160, 0.742], [0, -0.178, 0.752]],
  lower: [[0, -0.108, 0.020], [0, -0.062, 0.150], [0, -0.086, 0.345], [0, -0.114, 0.545], [0, -0.142, 0.692], [0, -0.168, 0.748]],
});

const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0), FWD = V3(0, 0, 1), XA = V3(1, 0, 0);
const tA = V3(), tB = V3(), tC = V3(), tD = V3(), tE = V3();
const ikOut = [0, 0, 0];
const WHITE = { spec: 0.22, specSize: 0.7 };
const BODY_SPHERES = [0, 1.24, -0.26, 0.33, 0.09, 1.62, 0.11, 0.085, -0.09, 1.62, 0.11, 0.085];   // 围巾碰撞体：背部 + 颈两侧

/** 肢体截面：两端半球收口的香肠形（toon 角色的关节靠两端圆头互相覆盖） */
const ROUND_T = [0, 0.05, 0.12, 0.2, 0.3, 0.5, 0.7, 0.8, 0.88, 0.95, 1];
const ROUND_R = [0.02, 0.62, 0.9, 1, 1, 1, 1, 1, 0.9, 0.62, 0.02];
function limbProfile(r0, r1, flat = 1) {
  return (t) => { const r = lerp(r0, r1, t) * spline(ROUND_T, ROUND_R, t); return { a: r * flat, bt: r, bb: r }; };
}
const lineCenter = (a, b) => (t, out) => out.set(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));

function dynMesh(U, loft, color, o = {}) {
  const m = new THREE.Mesh(loft.geometry, toonMaterial(U, color, o));
  m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
  addOutline(m, U, { px: o.outline ?? 1.2, useNormals: true });
  return m;
}
function staticMesh(U, geo, color, o = {}, px = 1.3) {
  const m = new THREE.Mesh(geo, toonMaterial(U, color, o));
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m, U, { px, useNormals: true });
  return m;
}
/** 头盔与围巾的贴图全场景只有一份：造型工坊反复重建鹈鹕时复用，否则每次都会泄漏一张 Canvas 贴图 */
let sharedTex = null;
const textures = () => (sharedTex ||= { helmet: helmetTexture(), scarf: scarfTexture() });

/** 羽毛片：平面轮廓拉伸出厚度（+Y 方向生长，根部在原点） */
const featherGeo = (len, w, thick = 0.01, o = {}) => S.extrude(S.leafPoints(len, w, { tip: o.tip ?? 0.8, belly: o.belly ?? 0.7, n: 12 }), thick, { bevel: thick * 0.35 });

/** 翼指：包住把套的深色飞羽（挂在车把抓握锚点上，坐标轴与整车对齐） */
export function createWingHand(U, side) {
  const g = new THREE.Group(); g.name = side > 0 ? 'handL' : 'handR';
  const b = new ToonBatch('hand');
  const d = V3(0.877 * side, -0.13, -0.45).normalize();      // 沿把套向外的方向
  b.add(S.ellipsoid(0.05, 0.046, 0.056, 18, 12), new THREE.Matrix4().makeTranslation(d.x * 0.018, 0.004, 0.004), COL.primary, { spec: 0.3, outline: 1.1 });
  for (let i = 0; i < 4; i++) {
    const off = -0.024 + i * 0.024;
    const c = d.clone().multiplyScalar(off);
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const ph = 0.25 + (k / 6) * 2.75;                       // 从上前方绕到把套下面
      pts.push([c.x + side * 0.004 * k, 0.004 + 0.036 * Math.cos(ph), 0.004 + 0.036 * Math.sin(ph) + (k > 4 ? (k - 4) * 0.014 : 0)]);
    }
    b.add(S.tube(pts, 0.0105 - i * 0.0006, { tubular: 14, radial: 7 }).scale(1.25, 1, 1), null, COL.primary, { spec: 0.3, outline: 0.9 });
  }
  g.add(b.build(U));
  return g;
}

/**
 * @param {object} U 共享 uniforms
 * @param {{beak?:number, pouch?:number, neck?:number, body?:number}} [o] 造型参数（1 = 默认）：
 *   喙长沿颌关节向前缩放、喉囊深度、脖子长度（头的静止高度）、躯干粗细
 */
export function createPelican(U, o = {}) {
  const root = new THREE.Group(); root.name = 'pelican';
  const bc = PEL.bodyCenter;
  const loc = (p) => V3(p[0] - bc[0], p[1] - bc[1], p[2] - bc[2]);   // 整车坐标 → 躯干局部
  const k = { beak: o.beak ?? 1, pouch: o.pouch ?? 1, neck: o.neck ?? 1, body: o.body ?? 1 };
  const headCenter = [PEL.headCenter[0], PEL.headCenter[1] + (k.neck - 1) * 0.82, PEL.headCenter[2]];
  const stretchBeak = (pts) => pts.map((p) => [p[0], p[1], PEL.jawPivot[2] + (p[2] - PEL.jawPivot[2]) * k.beak]);
  const upper = stretchBeak(PEL.upper), lower = stretchBeak(PEL.lower);
  const sc = (arr) => arr.map((v) => v * k.body);

  // ———————————— 躯干 ————————————
  const bodyNode = new THREE.Group(); bodyNode.name = 'body'; bodyNode.position.set(bc[0], bc[1], bc[2]); root.add(bodyNode);
  const BK = {
    t: [0, 0.05, 0.14, 0.30, 0.50, 0.70, 0.86, 0.96, 1],
    a: sc([0.004, 0.165, 0.25, 0.30, 0.31, 0.27, 0.20, 0.095, 0.004]),
    bt: sc([0.004, 0.175, 0.27, 0.32, 0.33, 0.30, 0.22, 0.10, 0.004]),
    bb: sc([0.004, 0.19, 0.30, 0.36, 0.37, 0.32, 0.22, 0.09, 0.004]),
  };
  const bodyGeo = loftGeometry((t, out) => out.set(0, lerp(PEL.spineFront[1], PEL.spineBack[1], t) - bc[1], lerp(PEL.spineFront[2], PEL.spineBack[2], t) - bc[2]),
    (t) => ({ a: spline(BK.t, BK.a, t), bt: spline(BK.t, BK.bt, t), bb: spline(BK.t, BK.bb, t) }), { rings: 40, radial: 40, ref: XA });
  const body = staticMesh(U, bodyGeo, COL.feather, WHITE, 1.35);
  body.name = 'bodyMesh'; bodyNode.add(body);
  { // 尾扇：5 片羽毛叠成一把，向后上方翘起
    const tb = new ToonBatch('tail');
    for (let i = -2; i <= 2; i++) {
      const yaw = i * 0.24, len = 0.27 - Math.abs(i) * 0.02;
      const g = featherGeo(len, 0.078 - Math.abs(i) * 0.008, 0.014);
      g.rotateX(-Math.PI / 2 + 0.5); g.rotateY(yaw);
      g.translate(Math.sin(yaw) * 0.03, 0.15 + (2 - Math.abs(i)) * 0.004, -0.52);
      tb.add(g, null, COL.feather, { outline: 1 });
    }
    for (let i = -1; i <= 1; i++) {                                // 尾上覆羽：叠在尾扇根部，打破蛋身的单调
      const g = featherGeo(0.15 - Math.abs(i) * 0.02, 0.075, 0.016);
      g.rotateX(-Math.PI / 2 + 0.74); g.rotateY(i * 0.16); g.translate(i * 0.025, 0.14, -0.43);
      tb.add(g, null, COL.feather, { outline: 1 });
    }
    bodyNode.add(tb.build(U));
  }

  // ———————————— 颈（逐帧重建） ————————————
  const NK = { t: [0, 0.15, 0.35, 0.6, 0.85, 1], r: [0.172, 0.138, 0.118, 0.104, 0.098, 0.100] };
  const neck = new Loft({ rings: 36, radial: 26, caps: [false, false] });
  neck.setProfile((t) => { const r = spline(NK.t, NK.r, t); return { a: r * 0.92, bt: r * 1.04, bb: r * 1.04 }; });
  const neckMesh = dynMesh(U, neck, COL.feather, { ...WHITE, outline: 1.3 });
  neckMesh.name = 'neck'; root.add(neckMesh);

  // ———————————— 头 ————————————
  const headNode = new THREE.Group(); headNode.name = 'head'; root.add(headNode);
  const skull = staticMesh(U, S.ellipsoid(PEL.headRadii[0], PEL.headRadii[1], PEL.headRadii[2], 36, 26), COL.feather, WHITE, 1.35);
  skull.name = 'skull'; headNode.add(skull);
  const eyeDir = V3(0.93, 0.19, 0.33).normalize();
  const eyes = [];
  for (const side of [1, -1]) {
    const n = V3(eyeDir.x * side, eyeDir.y, eyeDir.z);
    const c = V3(n.x * PEL.headRadii[0], n.y * PEL.headRadii[1], n.z * PEL.headRadii[2]).addScaledVector(n, 0.004);
    const g = new THREE.Group(); g.position.copy(c); g.name = side > 0 ? 'eyeL' : 'eyeR'; headNode.add(g);
    // 以 n 为法线、UP 为“上”的正交基
    const ey = UP.clone().addScaledVector(n, -UP.dot(n)).normalize();
    const ex = V3().crossVectors(ey, n).normalize();
    const basis = new THREE.Matrix4().makeBasis(ex, ey, n);
    const patch = new THREE.Mesh(S.sphere(0.058, 18, 12), toonMaterial(U, COL.skin, { spec: 0.2 }));   // 眼周裸皮：一片薄圆盘
    patch.scale.set(1, 1, 0.26); patch.position.copy(n).multiplyScalar(-0.044); patch.quaternion.setFromRotationMatrix(basis); g.add(patch);
    g.add(staticMesh(U, S.sphere(0.040, 20, 14), COL.eyeWhite, { spec: 1.0, specSize: 0.42 }, 1.1));
    const pupil = new THREE.Mesh(S.sphere(0.0285, 18, 12), toonMaterial(U, COL.eyeDark, { spec: 1.0, specSize: 0.3 }));
    pupil.position.copy(n).multiplyScalar(0.019); g.add(pupil);
    const hi = new THREE.Mesh(S.sphere(0.0095, 10, 8), toonMaterial(U, 0xffffff, { emissive: 0xffffff, emissiveLevel: 0.9, pbr: 'hide' }));   // 手画的高光点：写实时有真高光，藏起来
    hi.position.copy(n).multiplyScalar(0.0405).add(V3(0, 0.013, 0.013)); g.add(hi);
    const lid = new THREE.Mesh(S.sphere(0.0428, 20, 10, 0, TAU, 0, 1.5), toonMaterial(U, COL.feather, WHITE));
    lid.castShadow = false;
    const lidPivot = new THREE.Group(); lidPivot.add(lid); g.add(lidPivot);
    const brow = new THREE.Mesh(S.torus(0.049, 0.006, 6, 20, 1.9), toonMaterial(U, COL.primary, { spec: 0.2 }));
    const bg = new THREE.Group(); bg.position.copy(n).multiplyScalar(0.004); bg.quaternion.setFromRotationMatrix(basis);
    bg.rotation.z = Math.PI / 2 - 0.95 + side * 0.07;
    bg.add(brow); g.add(bg);
    eyes.push({ side, n, lidPivot, pupil, ex, ey });
  }
  { // 头盔 + 帽沿 + 下颌带 + 冠羽
    const helm = new THREE.Mesh(S.sphere(1, 40, 18, 0, TAU, 0, 1.05), toonMaterial(U, 0xffffff, { map: textures().helmet, spec: 0.55, specSize: 0.5, pbr: 'carpaint' }));
    helm.scale.set(0.163, 0.148, 0.178); helm.position.set(0, 0.04, -0.025); helm.castShadow = true; helm.name = 'helmet';
    headNode.add(helm); addOutline(helm, U, { px: 1.35, useNormals: true });
    const hb = new ToonBatch('helmetTrim');
    hb.add(S.torus(0.163 * Math.sin(1.05), 0.009, 8, 48).rotateX(Math.PI / 2).scale(1, 1, 0.178 / 0.163).translate(0, 0.04 + 0.148 * Math.cos(1.05), -0.025), null, 0xd94c3d, { spec: 0.4 });
    for (const s of [1, -1]) hb.add(S.tube([[s * 0.138, 0.105, -0.02], [s * 0.145, 0.03, -0.045], [s * 0.115, -0.065, -0.075], [s * 0.07, -0.125, -0.105]], 0.0055, { tubular: 16, radial: 7 }), null, COL.strap, { outline: 0.7 });
    headNode.add(hb.build(U));
    const cb = new ToonBatch('crest');
    for (let i = 0; i < 4; i++) {
      const g = featherGeo(0.10 + (i % 2) * 0.025, 0.024, 0.008, { tip: 0.9 });
      g.rotateX(-Math.PI / 2 - 0.30 - i * 0.07); g.translate((i - 1.5) * 0.024, 0.035 - i * 0.004, -0.150);
      cb.add(g, null, COL.feather, { outline: 0.9 });
    }
    headNode.add(cb.build(U));
  }

  // ———————————— 喙 / 咽喉囊 / 口腔 ————————————
  const UPK = { t: [0, 0.25, 0.55, 0.8, 0.95, 1], a: [0.050, 0.046, 0.040, 0.027, 0.013, 0.002], bt: [0.030, 0.025, 0.019, 0.012, 0.010, 0.002] };
  const PWK = { t: [0, 0.12, 0.28, 0.45, 0.62, 0.78, 0.9, 1], bb: [0.070, 0.145, 0.175, 0.165, 0.130, 0.082, 0.040, 0.003].map((v) => v * k.pouch) };
  const PWK_A = { t: [0, 0.12, 0.35, 0.6, 0.85, 1], a: [0.034, 0.050, 0.050, 0.041, 0.020, 0.003] };
  const jaw = { open: -1, pouch: -1 };
  const upperLoft = new Loft({ rings: 30, radial: 24 });
  // 上喙截面：上半向顶部收窄形成脊，下半平坦贴着下颌
  upperLoft.setSection((t, th, out) => {
    const cs = Math.cos(th), sn = Math.sin(th);
    const a = spline(UPK.t, UPK.a, t), bt = spline(UPK.t, UPK.bt, t), bb = lerp(0.006, 0.002, t);
    if (sn >= 0) { out.u = a * cs * (1 - 0.30 * sn); out.v = bt * Math.pow(sn, 0.72); }
    else { out.u = a * cs; out.v = bb * sn; }
  });
  const upperMesh = dynMesh(U, upperLoft, COL.beak, { spec: 0.5, specSize: 0.55, outline: 1.2, pbr: 'beak' });   // 顶点色染了喙尖：写实时按喙的材质
  upperMesh.name = 'beakUpper'; headNode.add(upperMesh);
  { // 喙尖的红色甲：t > 0.93 用顶点色染红
    const g = upperMesh.geometry, n = g.attributes.position.count, col = new Float32Array(n * 3);
    const c1 = new THREE.Color(COL.beak), c2 = new THREE.Color(COL.nail), uv = g.attributes.uv;
    for (let i = 0; i < n; i++) { const k = smoothstep(0.90, 0.955, uv.getY(i)); col[i * 3] = lerp(c1.r, c2.r, k); col[i * 3 + 1] = lerp(c1.g, c2.g, k); col[i * 3 + 2] = lerp(c1.b, c2.b, k); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    upperMesh.material.vertexColors = true; upperMesh.material.uniforms.uColor.value.set(0xffffff); upperMesh.material.needsUpdate = true;
  }
  const pouchLoft = new Loft({ rings: 32, radial: 24 });
  const pouchMesh = dynMesh(U, pouchLoft, COL.pouch, { spec: 0.35, specSize: 0.7, outline: 1.35 });
  pouchMesh.name = 'pouch'; headNode.add(pouchMesh);
  const mouthLoft = new Loft({ rings: 20, radial: 16, caps: [false, false] });
  const mouthMesh = dynMesh(U, mouthLoft, COL.mouth, { outline: 0 });
  mouthMesh.name = 'mouth'; mouthMesh.castShadow = false; headNode.add(mouthMesh);

  const pivot = V3(...PEL.jawPivot);
  const upperCurve = new THREE.CatmullRomCurve3(upper.map((p) => V3(...p)), false, 'centripetal');
  const lowerCurve = new THREE.CatmullRomCurve3(lower.map((p) => V3(...p)), false, 'centripetal');
  const jawPath = (curve, ang) => (t, out) => { curve.getPoint(t, out); out.sub(pivot).applyAxisAngle(XA, ang).add(pivot); };
  function setJaw(open, pouch) {
    open = clamp01(open); pouch = clamp(pouch, 0.4, 1.8);
    if (Math.abs(open - jaw.open) < 0.004 && Math.abs(pouch - jaw.pouch) < 0.004) return;
    jaw.open = open; jaw.pouch = pouch;
    upperLoft.update(jawPath(upperCurve, -open * 0.30), XA);
    pouchLoft.setProfile((t) => ({ a: spline(PWK_A.t, PWK_A.a, t) * (0.85 + 0.15 * pouch), bt: lerp(0.0075, 0.002, t), bb: Math.max(0.002, spline(PWK.t, PWK.bb, t) * pouch) }));
    pouchLoft.update(jawPath(lowerCurve, open * 0.46), XA);
    const gap = open * 0.76;
    mouthLoft.setProfile((t) => ({ a: spline(PWK_A.t, PWK_A.a, t) * 0.9, bt: Math.max(0.001, gap * 0.62 * t - 0.006), bb: 0.004 }));
    mouthLoft.update(jawPath(lowerCurve, open * 0.46), XA);
  }
  setJaw(0, 1);

  // ———————————— 四肢（IK + 放样） ————————————
  const mkLimb = (r0, r1, color, flat = 1) => {
    const l = new Loft({ rings: 16, radial: 18 }); l.setProfile(limbProfile(r0, r1, flat));
    const m = dynMesh(U, l, color, { spec: 0.24, specSize: 0.7, outline: 1.15 }); root.add(m);
    return { loft: l, mesh: m };
  };
  const limbs = {};
  const elbowNodes = {};      // 肘部飞羽的挂点：局部 Y 沿上臂，局部 -Z 朝下
  for (const side of [1, -1]) {
    const s = side > 0 ? 'L' : 'R';
    limbs['thigh' + s] = mkLimb(0.105, 0.064, COL.feather);
    limbs['shin' + s] = mkLimb(0.042, 0.031, COL.leg);
    limbs['upperArm' + s] = mkLimb(0.10, 0.062, COL.feather, 0.74);
    limbs['foreArm' + s] = mkLimb(0.06, 0.04, COL.feather, 0.78);
    // 肘部飞羽：叶面朝车身两侧（从侧面看得见），竖直下垂并向后扫
    const fb = new ToonBatch('elbowFeathers');
    for (let i = -1; i <= 1; i++) {
      const g = featherGeo(0.17 - Math.abs(i) * 0.028, 0.052, 0.016, { tip: 0.6 });
      g.rotateX(Math.PI / 2); g.rotateY(i * 0.24);
      fb.add(g, null, COL.primary, { spec: 0.25, outline: 1 });
    }
    const node = new THREE.Group(); node.name = 'elbow' + s; node.add(fb.build(U));
    node.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V3(0, 0.34, -0.94), V3(1, 0, 0), V3(0, -0.94, -0.34)));
    root.add(node);
    elbowNodes[s] = node;
  }

  // ———————————— 围巾：领圈 + 两条 Verlet 布料 ————————————
  const collar = staticMesh(U, S.torus(0.126, 0.026, 10, 32).scale(1, 1, 0.78), COL.scarf, { spec: 0.2 }, 1.1);
  collar.name = 'collar'; root.add(collar);
  const scarfTex = textures().scarf;
  const tails = [];
  for (let i = 0; i < 2; i++) {
    const c = makeCloth({ cols: 3, rows: 15 });
    initCloth(c, [0.04 + i * 0.05, 1.47, 0.0], [0, 0, -1], [1, 0, 0], 0.62 - i * 0.1, 0.085);
    const g = new THREE.BufferGeometry();
    const idx = [];
    for (let r = 0; r < c.rows - 1; r++) for (let k = 0; k < c.cols - 1; k++) { const a = nodeIndex(c, r, k), b = nodeIndex(c, r, k + 1), d = nodeIndex(c, r + 1, k), e = nodeIndex(c, r + 1, k + 1); idx.push(a, b, d, b, e, d); }
    const uv = new Float32Array(c.n * 2);
    for (let r = 0; r < c.rows; r++) for (let k = 0; k < c.cols; k++) { uv[nodeIndex(c, r, k) * 2] = k / (c.cols - 1); uv[nodeIndex(c, r, k) * 2 + 1] = 1 - r / (c.rows - 1); }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(c.n * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.Mesh(g, toonMaterial(U, 0xffffff, { map: scarfTex, side: THREE.DoubleSide, spec: 0.1, pbr: 'fabric' }));
    m.castShadow = true; m.frustumCulled = false; m.name = 'scarf' + i; root.add(m);
    tails.push({ cloth: c, mesh: m });
  }

  // ———————————— 次级动画状态 ————————————
  const headPos = V3(...headCenter), headVel = V3(), headRot = V3(-0.05, 0, 0), headRotV = V3();
  const sq = spring(1), pouchS = spring(1);
  const st = { blinkT: 1.5, blink: 0, mouth: 0, t: 0, rng: mulberry32(7), airPrev: false };
  const neckPts = [V3(), V3(), V3(), V3(), V3()];
  const neckCurve = new THREE.CatmullRomCurve3(neckPts, false, 'centripetal');
  const springV = (pos, vel, tx, ty, tz, k, c, dt) => {
    vel.x += ((tx - pos.x) * k - vel.x * c) * dt; pos.x += vel.x * dt;
    vel.y += ((ty - pos.y) * k - vel.y * c) * dt; pos.y += vel.y * dt;
    vel.z += ((tz - pos.z) * k - vel.z * c) * dt; pos.z += vel.z * dt;
  };
  const debug = { hipL: V3(), hipR: V3(), kneeL: V3(), kneeR: V3(), ankleL: V3(), ankleR: V3(), shL: V3(), shR: V3(), elL: V3(), elR: V3(), neckPts };

  const api = {
    root, bodyNode, headNode, eyes, neckMesh, upperMesh, pouchMesh, collar, tails, debug, limbs, shape: k,
    get mouth() { return st.mouth; },
    /**
     * @param {object} c
     * @param {object} c.state  骑行状态（core/ride.js）
     * @param {number} c.dt
     * @param {{gripL:THREE.Vector3,gripR:THREE.Vector3,pedalL:THREE.Vector3,pedalR:THREE.Vector3}} c.anchors 整车坐标下的末端目标
     * @param {{yaw?:number,pitch?:number,roll?:number}} [c.look] 视线
     * @param {number} [c.mouth] 张口 0..1
     */
    update(c) {
      const { state, dt } = c;
      const t = (st.t += dt);                                         // t：布料风场用的仿真时间
      const v = state.v, amp = clamp01(Math.abs(state.crankVel) * 0.28) * (state.air ? 0 : 1);
      // ——— 躯干主运动：踏频带动起伏/摇摆，速度决定前倾，加速度/起跳带来挤压拉伸 ———
      const lean = 0.10 + 0.11 * clamp01(v / 12) - state.accel * 0.012 - (state.air ? state.airVy * 0.03 : 0);
      const bob = 0.012 * Math.sin(2 * state.crank) * amp, sway = 0.008 * Math.sin(state.crank) * amp;
      const roll = 0.03 * Math.cos(state.crank) * amp;
      if (state.air && !st.airPrev) { sq.v += 2.6; pouchS.v += 5; }
      if (!state.air && st.airPrev) { const k = clamp01(state.landImpact / 4.4); sq.v -= 3.4 * k; pouchS.v -= 9 * k; }
      st.airPrev = state.air;
      springStep(sq, 1, 160, 11, dt);
      springStep(pouchS, 1, 90, 5.5, dt);
      const sy = sq.x * (1 + 0.012 * Math.cos(2 * state.crank) * amp), sxz = 1 / Math.sqrt(Math.max(sy, 0.5));
      bodyNode.position.set(bc[0] + sway, bc[1] + bob, bc[2]);
      bodyNode.rotation.set(lean, 0, roll);
      bodyNode.scale.set(sxz, sy, sxz);
      bodyNode.updateMatrix();
      // ——— 头：目标位置只跟随躯干的平移/缩放/侧倾，不跟随前倾（鸟类头部稳定）；
      //          实际位置再经弹簧滞后，形成次级重叠动作 ———
      const hx = (headCenter[0] - bc[0]) * sxz, hy = (headCenter[1] - bc[1]) * sy, hz = (headCenter[2] - bc[2]) * sxz;
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const nod = 0.008 * Math.sin(2 * state.crank) * amp;
      springV(headPos, headVel, bc[0] + sway + hx * cr - hy * sr, bc[1] + bob + hx * sr + hy * cr + nod, bc[2] + hz, 150, 12, dt);
      const look = c.look || {};
      const tp = -lean * 0.5 + (look.pitch || 0) + 0.006 * Math.sin(2 * state.crank) * amp;
      springV(headRot, headRotV, tp, look.yaw || 0, look.roll || 0, 140, 15, dt);
      headNode.position.copy(headPos);
      headNode.rotation.set(headRot.x, headRot.y, headRot.z, 'YXZ');
      headNode.updateMatrix();
      // ——— 颈 ———
      const nb = tB.copy(loc(PEL.neckBase)).applyMatrix4(bodyNode.matrix);
      const ha = tC.set(...PEL.neckAttach).applyMatrix4(headNode.matrix);
      neckPts[0].copy(nb);
      neckPts[1].lerpVectors(nb, ha, 0.30); neckPts[1].z += 0.05;
      neckPts[2].lerpVectors(nb, ha, 0.63); neckPts[2].z -= 0.045;
      neckPts[3].lerpVectors(nb, ha, 0.86); neckPts[3].y -= 0.01; neckPts[3].z += 0.01;
      neckPts[4].copy(ha);
      neck.update((tt, out) => neckCurve.getPoint(tt, out), XA);
      neckCurve.getPoint(0.30, tA); neckCurve.getTangent(0.30, tB).normalize();
      collar.position.copy(tA);
      collar.quaternion.setFromUnitVectors(FWD, tB);
      // ——— 四肢 IK ———
      const A = c.anchors;
      for (const side of [1, -1]) {
        const s = side > 0 ? 'L' : 'R';
        const hip = tA.copy(loc(BIKE.hip).setX(side * BIKE.hip[0])).applyMatrix4(bodyNode.matrix);
        const ankle = tB.copy(side > 0 ? A.pedalL : A.pedalR).add(tE.set(side * 0.105, 0.072, -0.026));
        solveTwoBone([hip.x, hip.y, hip.z], [ankle.x, ankle.y, ankle.z], BIKE.thigh, BIKE.shin, [side * 0.22, 0.05, 1], ikOut);
        const knee = tC.set(ikOut[0], ikOut[1], ikOut[2]);
        limbs['thigh' + s].loft.update(lineCenter(hip, knee), XA);
        limbs['shin' + s].loft.update(lineCenter(knee, ankle), XA);
        debug['hip' + s].copy(hip); debug['knee' + s].copy(knee); debug['ankle' + s].copy(ankle);
        const sh = tD.copy(loc(BIKE.shoulder).setX(side * BIKE.shoulder[0])).applyMatrix4(bodyNode.matrix);
        const wrist = side > 0 ? A.gripL : A.gripR;
        solveTwoBone([sh.x, sh.y, sh.z], [wrist.x, wrist.y, wrist.z], BIKE.upperArm, BIKE.foreArm, [side * 0.55, -0.35, -1], ikOut);
        const shx = sh.x, shy = sh.y, shz = sh.z;
        tE.set(ikOut[0], ikOut[1], ikOut[2]);
        limbs['upperArm' + s].loft.update((tt, out) => out.set(lerp(shx, tE.x, tt), lerp(shy, tE.y, tt), lerp(shz, tE.z, tt)), XA);
        limbs['foreArm' + s].loft.update((tt, out) => out.set(lerp(tE.x, wrist.x, tt), lerp(tE.y, wrist.y, tt), lerp(tE.z, wrist.z, tt)), XA);
        debug['sh' + s].set(shx, shy, shz); debug['el' + s].copy(tE);
        // 肘部飞羽：跟在肘关节后上方（朝向在创建时定好，逐帧只更新位置）
        elbowNodes[s].position.set(lerp(shx, tE.x, 0.9), lerp(shy, tE.y, 0.9), lerp(shz, tE.z, 0.9));
      }
      // ——— 嘴 / 喉囊 / 眨眼 ———
      st.mouth += ((c.mouth || 0) - st.mouth) * Math.min(1, dt * 18);
      setJaw(st.mouth, pouchS.x);
      let blink = 0;
      st.blinkT -= dt;
      if (st.blinkT < 0) { st.blink = 1e-4; st.blinkT = 1.8 + st.rng() * 3.4; }
      if (st.blink > 0) { st.blink += dt / 0.17; if (st.blink >= 1) st.blink = 0; else blink = Math.sin(Math.PI * st.blink); }
      for (const e of eyes) {
        const ang = lerp(1.40, 0.30, blink);
        tA.copy(UP).multiplyScalar(Math.sin(ang)).addScaledVector(e.n, Math.cos(ang)).normalize();
        e.lidPivot.quaternion.setFromUnitVectors(UP, tA);
      }
      // ——— 围巾 ———
      const T = neckCurve.getTangent(0.30, tE).normalize();
      const back = tC.set(0, 0, -1).addScaledVector(T, T.z).normalize();     // 垂直于颈的“向后”方向
      const across = tD.crossVectors(T, back).normalize();
      const cp = collar.position, wind = v + (state.air ? 0.5 : 0);
      const bx = back.x, by = back.y, bz = back.z, ax = across.x, ay = across.y, az = across.z;
      tails.forEach((tl, i) => {
        const off = i === 0 ? -0.02 : 0.05;
        stepCloth(tl.cloth, dt, {
          t,
          pin: (r, k) => { const f = (k - 1) * 0.04 + off; return [cp.x + bx * 0.118 + ax * f, cp.y + by * 0.118 + ay * f, cp.z + bz * 0.118 + az * f]; },
          wind: (x, y, z, tt, out) => rideWind(wind, tt, x, y, z, out, 1),
          spheres: BODY_SPHERES, gravity: 5.5, iter: 6,     // 轻质丝巾：重力项折算
        });
        const p = tl.mesh.geometry.attributes.position;
        p.array.set(tl.cloth.x.subarray(0, tl.cloth.n * 3));
        p.needsUpdate = true;
        tl.mesh.geometry.computeVertexNormals();
      });
    },
  };
  return api;
}
