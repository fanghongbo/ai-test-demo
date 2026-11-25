// 程序化枪模：AK-47 / M4A1 / AWM / 沙漠之鹰 / USP / 军刀 / 高爆手雷，以及握着它的手和前臂。
// 全部是圆角盒、圆柱、球拼出来的：边缘一律倒角，高光沿着棱边走，近看才有“金属件”的感觉。
// 枪的坐标系：原点在机匣下方（握把顶端附近），枪管朝 -Z，+Y 向上，+X 是右手一侧。单位：米（真实尺寸）。
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { colored } from '../gfx/batch.js';
import { rng } from '../gfx/texgen.js';
import { createGunMaterials, GUN_TEXEL } from './guntex.js';

const PI = Math.PI;
/** [材质键, 颜色]。材质键：metal 烤蓝钢 / paint 聚合物、胶木、喷漆 / wood 层压木 / glove 手套皮革 / cloth 袖子（队伍色） */
const STEEL = ['metal', 0x363940], STEEL_L = ['metal', 0x4c4f57], STEEL_D = ['metal', 0x222428], BLADE = ['blade', 0xd3d8dd];
const BLACK = ['paint', 0x1d1f22], POLY = ['paint', 0x27292d], WOOD = ['wood', 0xb84a0c], BAKELITE = ['paint', 0x2c1a13];
const OLIVE = ['paint', 0x5e6a3e], GLOVE = ['glove', 0x3a3430], GLOVE_T = ['glove', 0x74604a], LENS = ['lens', 0xffffff];
const SLEEVE = [['cloth', 0x404856], ['cloth', 0x9c8b66]];                // 保卫者蓝灰 / 潜伏者卡其

/** 每把枪的挂点：枪口、照门高度（瞄准时镜头要对齐的高度）、握把、护木（左手）、腰射 / 瞄准时枪在镜头坐标系里的位置 */
export const GUN_INFO = Object.freeze({
  ak47:   { muzzle: [0, 0.035, -0.565], sightY: 0.096, grip: [0, -0.045, 0.05], support: [0, -0.012, -0.235], hip: [0.2, -0.15, -0.42], ads: [0, -0.096, -0.36] },
  m4a1:   { muzzle: [0, 0.062, -0.53], sightY: 0.132, grip: [0, -0.048, 0.058], support: [0, 0.038, -0.225], hip: [0.2, -0.16, -0.42], ads: [0, -0.132, -0.37] },
  awm:    { muzzle: [0, 0.05, -0.82], sightY: 0.135, grip: [0, -0.02, 0.02], support: [0, -0.004, -0.30], hip: [0.22, -0.165, -0.42], ads: [0, -0.135, -0.2] },
  deagle: { muzzle: [0, 0.058, -0.245], sightY: 0.083, grip: [0, -0.048, 0.03], support: [-0.024, -0.066, 0.038], wrap: true, hip: [0.17, -0.14, -0.4], ads: [0, -0.083, -0.36] },
  usp:    { muzzle: [0, 0.052, -0.15], sightY: 0.072, grip: [0, -0.042, 0.025], support: [-0.022, -0.058, 0.032], wrap: true, hip: [0.16, -0.135, -0.4], ads: [0, -0.072, -0.36] },
  knife:  { muzzle: [0, 0, -0.21], sightY: 0, grip: [0, -0.004, 0.03], support: null, hip: [0.2, -0.15, -0.33], ads: [0.2, -0.15, -0.33], rot0: [0.72, 0.05, 0.8] },   // rot0：腰射时枪的基本姿态（军刀刀尖朝上斜指着前方）
  he:     { muzzle: [0, 0, -0.08], sightY: 0, grip: [0, -0.03, 0.02], support: null, hip: [0.18, -0.14, -0.38], ads: [0.18, -0.14, -0.38] },
});

// ———————————————————————— 造型小工具 ————————————————————————
const R0 = rng(77), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const _U = new THREE.Vector3(), _N = new THREE.Vector3(), _W = new THREE.Vector3(), _fp = new THREE.Vector3(), _d = new THREE.Vector3(), _c = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3();

/** 按顶点自己的位置投影 UV（盒子投影）：上下两面纹路顺着 Z（枪身方向），两侧也是；grainY 的件（握把、枪托）纹路顺着 Y */
function projectUV(geo, texel, grainY) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv, d = 1 / texel, ou = R0() * 64, ov = R0() * 64;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u, v;
    if (ay >= ax && ay >= az) { u = grainY ? x : z; v = grainY ? z : x; }
    else if (ax >= az) { u = grainY ? y : z; v = grainY ? z : y; }
    else { u = grainY ? y : x; v = grainY ? x : y; }
    uv.setXY(i, u * d + ou, v * d + ov);
  }
}
/** 圆柱、球用自带的 UV，按真实周长缩放 */
function nativeUV(geo, texel, su, sv) {
  const uv = geo.attributes.uv, ou = R0() * 64, ov = R0() * 64;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su / texel + ou, uv.getY(i) * sv / texel + ov);
}
function collector() {
  const lists = {};
  return {
    lists,
    add(key, g, color, t = {}) {
      const geo = colored(g, color), texel = GUN_TEXEL[key] ?? 0.06, uv = g.userData.uv;
      if (uv) nativeUV(geo, texel, uv[0], uv[1]); else projectUV(geo, texel, t.grainY);
      if (t && t.isMatrix4) { geo.applyMatrix4(t); (lists[key] ||= []).push(geo); return; }   // 直接给矩阵的（管子、手指、手臂）
      geo.applyMatrix4(_m.compose(_p.set(t.x || 0, t.y || 0, t.z || 0), _q.setFromEuler(_e.set(t.rx || 0, t.ry || 0, t.rz || 0)), _s.set(t.sx ?? t.s ?? 1, t.sy ?? t.s ?? 1, t.sz ?? t.s ?? 1)));
      (lists[key] ||= []).push(geo);
    },
  };
}
const RBOX = new Map();
function rounded(w, h, d, r, seg) {
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const k = `${w}|${h}|${d}|${r}|${seg}`;
  if (!RBOX.has(k)) RBOX.set(k, new RoundedBoxGeometry(w, h, d, seg, Math.max(r, 0.0002)));
  return RBOX.get(k);
}
/** 盒子：默认带 1.2 mm 的倒角 */
const box = (P, w, h, d, x, y, z, m, o = {}) => P.add(m[0], rounded(w, h, d, o.r ?? 0.0012, o.seg ?? 2), m[1], { x, y, z, rx: o.rx, ry: o.ry, rz: o.rz, grainY: o.grainY });
const rbox = (P, w, h, d, r, x, y, z, m, o = {}) => P.add(m[0], rounded(w, h, d, r, o.seg ?? 3), m[1], { x, y, z, rx: o.rx, ry: o.ry, rz: o.rz, grainY: o.grainY });
const cylUV = (g, r, h) => { g.userData.uv = [PI * 2 * r, h]; return g; };
const cylZ = (P, rf, rr, len, x, y, z, m, seg = 18) => P.add(m[0], cylUV(new THREE.CylinderGeometry(rr, rf, len, seg), Math.max(rf, rr), len), m[1], { x, y, z, rx: PI / 2 });
const cylX = (P, rl, rr_, len, x, y, z, m, seg = 14) => P.add(m[0], cylUV(new THREE.CylinderGeometry(rr_, rl, len, seg), Math.max(rl, rr_), len), m[1], { x, y, z, rz: -PI / 2 });
const cylY = (P, rt, rb, len, x, y, z, m, seg = 14) => P.add(m[0], cylUV(new THREE.CylinderGeometry(rt, rb, len, seg), Math.max(rt, rb), len), m[1], { x, y, z });
const ball = (P, r, x, y, z, m, s, seg = 14) => P.add(m[0], cylUV(new THREE.SphereGeometry(r, seg, Math.max(6, (seg * 0.7) | 0)), r * Math.max(1, s?.[0] ?? 1, s?.[1] ?? 1, s?.[2] ?? 1), PI * r), m[1], { x, y, z, sx: s?.[0], sy: s?.[1], sz: s?.[2] });
const basis = (x, y, z, p, out = new THREE.Matrix4()) => out.makeBasis(x, y, z).setPosition(p);
/** 从 a 到 b 的圆台（管子、手臂）：ra = a 端半径，rb = b 端半径 */
function taper(P, a, b, ra, rb, m, seg = 16) {
  _x.set(a[0], a[1], a[2]); _y.set(b[0], b[1], b[2]);
  _d.subVectors(_y, _x);
  const len = _d.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), _d.normalize());
  P.add(m[0], cylUV(new THREE.CylinderGeometry(rb, ra, len, seg), Math.max(ra, rb), len), m[1], new THREE.Matrix4().compose(_c.addVectors(_x, _y).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
}
const torus = (P, r, tube, x, y, z, m, o = {}) => P.add(m[0], new THREE.TorusGeometry(r, tube, 10, 24), m[1], { x, y, z, rx: o.rx, ry: o.ry, rz: o.rz });

/** 弧形弹匣：n 段，从顶端开始往下，每段再往前多转一点；两侧带加强筋，底下一块底板 */
function curvedMag(P, n, w0, w1, segH, d, x, yTop, zTop, a0, da, m) {
  let y = yTop, z = zTop, a = a0;
  for (let i = 0; i < n; i++) {
    const dy = (segH / 2) * Math.cos(a), dz = -(segH / 2) * Math.sin(a), w = w0 + (w1 - w0) * (i / Math.max(1, n - 1));
    rbox(P, w, segH + 0.006, d, 0.004, x, y - dy, z + dz, m, { rx: a });
    for (const sx of [-1, 1]) box(P, 0.0018, segH * 0.9, 0.008, x + sx * (w / 2 + 0.0003), y - dy, z + dz + d * 0.27, m, { rx: a, r: 0.0006 });
    y -= 2 * dy; z += 2 * dz; a += da;
  }
  box(P, w1 + 0.005, 0.008, d + 0.008, x, y, z, STEEL_L, { rx: a - da });
}
function triggerGuard(P, y, z0, z1, m = STEEL) {
  box(P, 0.006, 0.004, z1 - z0, 0, y, (z0 + z1) / 2, m);
  box(P, 0.006, 0.034, 0.004, 0, y + 0.017, z0, m);
  box(P, 0.006, 0.024, 0.004, 0, y + 0.012, z1, m);
  box(P, 0.005, 0.02, 0.004, 0, y + 0.016, (z0 + z1) / 2 + 0.004, STEEL_L, { rx: 0.25 });
}

// ———————————————————————— 手和前臂 ————————————————————————
/** 四根手指：三节指骨的长度和半径（米） */
const FING = [[0.040, 0.026, 0.021, 0.0094], [0.044, 0.029, 0.022, 0.0097], [0.040, 0.027, 0.021, 0.0091], [0.032, 0.022, 0.018, 0.0080]];
/**
 * 一只握着东西的手（戴手套）。
 * o：at 手腕位置；u 手指根部的朝向；n 掌心朝向（垂直于 u）；side +1 右手 / -1 左手；curl 三个关节的弯曲角（弧度，往掌心一侧卷）；
 *    index 食指单独的弯曲角（扣扳机）；thumb 拇指第一节的朝向；thumbCurl 拇指第二节再弯多少；glove 手套颜色；scale
 */
function hand(P, o) {
  const side = o.side ?? 1, k = o.scale ?? 1, G = o.glove ?? GLOVE;
  _U.fromArray(o.u).normalize();
  _N.fromArray(o.n).addScaledVector(_U, -new THREE.Vector3().fromArray(o.n).dot(_U)).normalize();
  if (side > 0) _W.crossVectors(_N, _U); else _W.crossVectors(_U, _N);           // 食指 → 小指
  _c.fromArray(o.at);
  P.add('glove', rounded(0.082 * k, 0.090 * k, 0.030 * k, 0.013 * k, 3), G, basis(_U, _W, _N, _p.copy(_c).addScaledVector(_U, 0.042 * k)));   // 手掌
  P.add('glove', rounded(0.03 * k, 0.062 * k, 0.034 * k, 0.012 * k, 2), G, basis(_U, _W, _N, _p.copy(_c).addScaledVector(_U, 0.006 * k)));   // 腕
  P.add('glove', rounded(0.036 * k, 0.024 * k, 0.008 * k, 0.003 * k, 2), G, basis(_U, _W, _N, _p.copy(_c).addScaledVector(_U, 0.05 * k).addScaledVector(_W, -0.03 * k).addScaledVector(_N, -0.016 * k)));   // 虎口处的加厚
  for (let j = 0; j < 4; j++) {
    const [a, b, c2, r] = FING[j], cj = (o.index && j === 0) ? o.index : (o.curl ?? [1.4, 1.6, 0.9]), lens = [a, b, c2];
    _fp.copy(_c).addScaledVector(_U, 0.079 * k).addScaledVector(_W, (j - 1.5) * 0.0208 * k);
    let ang = 0;
    for (let s = 0; s < 3; s++) {
      ang += cj[s];
      _d.copy(_U).multiplyScalar(Math.cos(ang)).addScaledVector(_N, Math.sin(ang));
      _y.copy(_N).addScaledVector(_d, -_N.dot(_d)).normalize(); _x.crossVectors(_y, _d);
      if (s > 0) P.add('glove', new THREE.SphereGeometry(r * 1.03 * k, 10, 8), G, _p.copy(_fp));
      P.add('glove', rounded(2 * r * k, 1.8 * r * k, (lens[s] + 0.005) * k, r * 0.72 * k, 2), G, basis(_x, _y, _d, _p.copy(_fp).addScaledVector(_d, lens[s] * k * 0.5)));
      _fp.addScaledVector(_d, lens[s] * k);
    }
  }
  const tl = o.thumb ?? [-0.55, 0.55, -0.63], tc = o.thumbCurl ?? 0.45;
  _fp.copy(_c).addScaledVector(_U, 0.026 * k).addScaledVector(_W, -0.049 * k);
  _d.fromArray(tl).normalize();
  for (const [len, r] of [[0.044, 0.0118], [0.034, 0.0098]]) {
    _y.copy(_N).addScaledVector(_d, -_N.dot(_d)).normalize(); _x.crossVectors(_y, _d);
    P.add('glove', new THREE.SphereGeometry(r * 1.05 * k, 10, 8), G, _p.copy(_fp));
    P.add('glove', rounded(2 * r * k, 1.85 * r * k, (len + 0.005) * k, r * 0.72 * k, 2), G, basis(_x, _y, _d, _p.copy(_fp).addScaledVector(_d, len * k * 0.5)));
    _fp.addScaledVector(_d, len * k);
    _d.multiplyScalar(Math.cos(tc)).addScaledVector(_N, Math.sin(tc)).normalize();      // 指尖再往掌心一侧扣一点
  }
}
/** 前臂：袖口 + 布袖子，中间两道褶 */
function forearm(P, wrist, elbow, sleeve, r0 = 0.037, r1 = 0.05) {
  const d = new THREE.Vector3(elbow[0] - wrist[0], elbow[1] - wrist[1], elbow[2] - wrist[2]).normalize(), at = (t, r) => [wrist[0] + d.x * t, wrist[1] + d.y * t, wrist[2] + d.z * t, r];
  taper(P, wrist, at(0.035, r0 * 1.06), r0 * 1.02, r0 * 1.06, sleeve);
  taper(P, at(0.035, r0 * 1.06), at(0.055, r0 * 1.12), r0 * 1.06, r0 * 1.12, sleeve);
  taper(P, at(0.055, r0 * 1.12), elbow, r0 * 1.12, r1, sleeve);
  for (const [t, rr] of [[0.10, 1.16], [0.17, 1.14], [0.26, 1.1]]) { const a = at(t, 0), b = at(t + 0.016, 0); taper(P, a, b, r0 * rr, r0 * rr * 0.97, sleeve); }
}

/** 右手握住手枪式握把（g = 握把中心）。返回手腕位置，给前臂用 */
function gripHand(P, g, o = {}) {
  const glove = o.glove, at = [g[0] + 0.038, g[1] + 0.012, g[2] + 0.056];
  hand(P, { at, u: [-0.10, 0.06, -0.992], n: [-0.985, 0.05, 0.16], side: 1, curl: o.curl ?? [1.42, 1.5, 0.85], index: o.trigger ? [0.55, 0.7, 0.35] : null, thumb: o.thumb ?? [-0.62, 0.5, -0.6], glove });
  forearm(P, [at[0] + 0.004, at[1] - 0.004, at[2] + 0.012], o.elbow ?? [g[0] + 0.16, g[1] - 0.3, g[2] + 0.42], o.sleeve);
  return at;
}
/** 左手托在护木下面（s = 护木中心偏下的点） */
function supportHand(P, s, o = {}) {
  const at = o.at ?? [s[0], s[1] - 0.02, s[2] + 0.09];
  hand(P, { at, u: o.u ?? [-0.4, 0.03, -0.916], n: [0, 1, 0], side: -1, curl: o.curl ?? [1.25, 1.35, 0.8], thumb: o.thumb ?? [0.34, 0.62, -0.71], glove: o.glove, scale: 1.04 });
  forearm(P, [at[0] - 0.004, at[1] - 0.006, at[2] + 0.012], o.elbow ?? [s[0] - 0.15, s[1] - 0.34, s[2] + 0.46], o.sleeve);
}

// ———————————————————————— 各枪 ————————————————————————
function buildAK(B, mag, bolt) {
  box(B, 0.044, 0.06, 0.25, 0, 0.03, 0.005, STEEL);                                     // 机匣
  rbox(B, 0.04, 0.024, 0.23, 0.008, 0, 0.07, 0, STEEL_L);                              // 防尘盖
  for (const z of [0.07, 0.03, -0.01, -0.05]) box(B, 0.038, 0.003, 0.006, 0, 0.0815, z, STEEL_L, { r: 0.001 });   // 加强筋
  for (const sx of [-1, 1]) for (const z of [0.1, 0.04, -0.08]) ball(B, 0.0042, sx * 0.0225, 0.03, z, STEEL_L, null, 8);   // 铆钉
  for (const sx of [-1, 1]) box(B, 0.0015, 0.026, 0.075, sx * 0.0225, 0.034, -0.03, STEEL_D, { r: 0.0006 });         // 两侧的铣削凹槽
  box(B, 0.034, 0.012, 0.03, 0, 0.086, -0.105, STEEL);                                  // 表尺座
  box(B, 0.022, 0.003, 0.05, 0, 0.089, -0.118, STEEL_L);                                // 表尺板
  box(B, 0.02, 0.0026, 0.009, 0, 0.0915, -0.0965, STEEL_D);                             // 照门滑座
  for (const sx of [-1, 1]) box(B, 0.0065, 0.0056, 0.009, sx * 0.00675, 0.0932, -0.0965, STEEL_D, { r: 0.0008 });   // 照门两耳（缺口 7 mm）
  rbox(B, 0.036, 0.05, 0.235, 0.006, 0, 0.028, 0.245, WOOD, { rx: 0.1, grainY: false }); // 枪托
  rbox(B, 0.038, 0.056, 0.03, 0.006, 0, 0.026, 0.138, STEEL_D);                         // 托座
  box(B, 0.042, 0.085, 0.014, 0, -0.004, 0.362, STEEL_L);                               // 托底板
  box(B, 0.036, 0.03, 0.03, 0, 0.045, 0.135, STEEL);
  rbox(B, 0.03, 0.088, 0.038, 0.011, 0, -0.042, 0.052, BAKELITE, { rx: -0.32, grainY: true });   // 握把
  triggerGuard(B, -0.034, -0.016, 0.04);
  rbox(B, 0.056, 0.044, 0.19, 0.012, 0, 0.012, -0.225, WOOD);                           // 下护木
  for (const sx of [-1, 1]) box(B, 0.004, 0.028, 0.17, sx * 0.0285, 0.012, -0.225, WOOD); // 护木两侧的掌托
  rbox(B, 0.046, 0.03, 0.17, 0.01, 0, 0.062, -0.215, WOOD);                             // 上护木
  box(B, 0.05, 0.052, 0.014, 0, 0.035, -0.128, STEEL);                                  // 护木卡箍
  box(B, 0.054, 0.058, 0.016, 0, 0.035, -0.326, STEEL);                                 // 护木前箍
  cylZ(B, 0.011, 0.011, 0.06, 0, 0.066, -0.34, STEEL_L);                                // 导气管（露出来的那一段）
  cylZ(B, 0.0095, 0.0095, 0.22, 0, 0.035, -0.42, STEEL);                                // 枪管
  box(B, 0.026, 0.046, 0.03, 0, 0.05, -0.345, STEEL);                                   // 导气箍
  box(B, 0.024, 0.034, 0.026, 0, 0.062, -0.5, STEEL);                                   // 准星座
  for (const sx of [-1, 1]) box(B, 0.003, 0.026, 0.004, sx * 0.0095, 0.09, -0.5, STEEL, { r: 0.001 });
  box(B, 0.0022, 0.02, 0.0022, 0, 0.086, -0.5, STEEL_L, { r: 0.0005 });                 // 准星
  cylZ(B, 0.0125, 0.0135, 0.038, 0, 0.035, -0.545, STEEL_L);                            // 斜切防跳器
  box(B, 0.004, 0.01, 0.078, 0.0225, 0.02, -0.005, STEEL_L);                            // 快慢机（右侧那根长柄）
  box(B, 0.03, 0.016, 0.036, 0, -0.052, 0.058, STEEL_D);                                // 弹匣卡榫
  torus(B, 0.011, 0.0022, 0.021, 0.0, 0.1, STEEL_L, { ry: PI / 2 });                    // 背带环
  box(bolt, 0.012, 0.012, 0.03, 0.03, 0.052, -0.02, STEEL_L);                           // 拉机柄（活动件）
  curvedMag(mag, 6, 0.031, 0.027, 0.042, 0.062, 0, -0.004, -0.03, 0.06, 0.17, STEEL_D); // 弯弹匣
}

function buildM4(B, mag, bolt) {
  box(B, 0.04, 0.046, 0.17, 0, 0.023, 0.02, POLY);                                      // 下机匣
  rbox(B, 0.042, 0.046, 0.2, 0.004, 0, 0.068, -0.02, STEEL_D);                          // 上机匣
  box(B, 0.022, 0.012, 0.18, 0, 0.097, -0.02, STEEL_D);                                 // 顶部导轨
  for (let i = 0; i < 9; i++) box(B, 0.021, 0.005, 0.009, 0, 0.105, -0.1 + i * 0.02, STEEL_D, { r: 0.0008 });
  box(B, 0.03, 0.03, 0.03, 0, 0, 0.135, STEEL_L);                                       // 缓冲座
  cylZ(B, 0.014, 0.014, 0.16, 0, 0.03, 0.22, STEEL_L);                                  // 缓冲管
  rbox(B, 0.042, 0.08, 0.15, 0.012, 0, 0.025, 0.3, BLACK);                              // 伸缩枪托
  box(B, 0.046, 0.09, 0.016, 0, 0.025, 0.378, POLY);
  rbox(B, 0.03, 0.092, 0.042, 0.011, 0, -0.046, 0.058, BLACK, { rx: -0.36 });           // 握把
  triggerGuard(B, -0.026, -0.018, 0.036);
  rbox(B, 0.05, 0.05, 0.19, 0.017, 0, 0.062, -0.215, POLY);                             // 圆护木
  for (let i = 0; i < 5; i++) cylZ(B, 0.0256, 0.0256, 0.004, 0, 0.062, -0.152 - i * 0.033, BLACK, 20);   // 护木上的散热槽
  cylZ(B, 0.0265, 0.0265, 0.012, 0, 0.062, -0.117, STEEL_D);                            // 三角圈
  cylZ(B, 0.008, 0.008, 0.17, 0, 0.062, -0.4, STEEL);                                   // 枪管
  box(B, 0.026, 0.03, 0.03, 0, 0.082, -0.385, STEEL);                                   // 准星座
  for (const sx of [-1, 1]) taper(B, [sx * 0.011, 0.097, -0.372], [0, 0.136, -0.398], 0.0035, 0.0035, STEEL);
  box(B, 0.0022, 0.018, 0.0022, 0, 0.125, -0.398, STEEL_L, { r: 0.0005 });              // 准星
  cylZ(B, 0.011, 0.011, 0.045, 0, 0.062, -0.505, STEEL_L);                              // 消焰器
  box(B, 0.026, 0.02, 0.028, 0, 0.118, 0.06, STEEL);                                    // 后照门座
  torus(B, 0.0065, 0.0018, 0, 0.13, 0.047, STEEL_D);
  box(B, 0.002, 0.004, 0.004, 0, 0.124, 0.06, STEEL_D);
  cylX(B, 0.008, 0.007, 0.02, 0.025, 0.062, 0.03, STEEL_L);                             // 前推助进器
  box(B, 0.002, 0.018, 0.06, 0.0215, 0.066, -0.02, STEEL_D, { r: 0.0005 });             // 抛壳口
  box(bolt, 0.03, 0.008, 0.03, 0, 0.106, 0.09, STEEL_L);                                // 拉机柄（活动件）
  box(bolt, 0.012, 0.01, 0.012, 0.019, 0.106, 0.1, STEEL_D);
  curvedMag(mag, 5, 0.026, 0.025, 0.04, 0.07, 0, -0.003, -0.035, 0.03, 0.07, POLY);     // STANAG 弹匣
}

function buildAWM(B, mag, bolt) {
  rbox(B, 0.046, 0.12, 0.3, 0.014, 0, 0.02, 0.27, OLIVE);                               // 枪托
  rbox(B, 0.042, 0.05, 0.2, 0.012, 0, 0.095, 0.24, OLIVE);                               // 贴腮板
  box(B, 0.05, 0.125, 0.022, 0, 0.02, 0.425, BLACK);                                     // 托底板
  rbox(B, 0.044, 0.085, 0.2, 0.012, 0, 0.006, 0.05, OLIVE);                              // 握把区
  rbox(B, 0.05, 0.062, 0.4, 0.014, 0, 0.03, -0.26, OLIVE);                               // 前托
  box(B, 0.052, 0.012, 0.36, 0, -0.004, -0.26, BLACK);
  triggerGuard(B, -0.03, -0.006, 0.03);
  cylZ(B, 0.021, 0.021, 0.27, 0, 0.05, 0, STEEL_D);                                     // 机匣（圆柱形）
  cylZ(B, 0.0115, 0.0115, 0.64, 0, 0.05, -0.44, STEEL_D);                               // 枪管
  cylZ(B, 0.016, 0.016, 0.075, 0, 0.05, -0.78, STEEL_L);                                // 枪口制退器
  for (const z of [-0.76, -0.795]) cylZ(B, 0.0175, 0.0175, 0.006, 0, 0.05, z, STEEL);
  taper(bolt, [0, 0.05, 0.08], [0.058, 0.008, 0.1], 0.0065, 0.0065, STEEL_L);           // 枪机柄（活动件）
  ball(bolt, 0.014, 0.062, 0.002, 0.103, STEEL_D);
  cylZ(B, 0.015, 0.015, 0.25, 0, 0.135, -0.03, BLACK);                                  // 镜筒
  cylZ(B, 0.027, 0.015, 0.09, 0, 0.135, -0.2, BLACK);                                   // 物镜钟
  cylZ(B, 0.019, 0.015, 0.07, 0, 0.135, 0.135, BLACK);                                  // 目镜
  cylZ(B, 0.0255, 0.0255, 0.004, 0, 0.135, -0.246, LENS);                               // 物镜镜片
  cylZ(B, 0.0175, 0.0175, 0.004, 0, 0.135, 0.171, LENS);
  cylY(B, 0.012, 0.012, 0.024, 0, 0.159, -0.03, BLACK);                                  // 高低旋钮
  cylX(B, 0.012, 0.012, 0.024, 0.028, 0.135, -0.03, BLACK);                              // 风偏旋钮
  for (const z of [-0.11, 0.05]) { torus(B, 0.017, 0.004, 0, 0.135, z, STEEL_D); box(B, 0.02, 0.05, 0.02, 0, 0.1, z, STEEL_D); }
  box(mag, 0.034, 0.05, 0.075, 0, -0.02, -0.045, STEEL_D);                              // 弹匣
  box(mag, 0.04, 0.01, 0.085, 0, -0.047, -0.045, STEEL_L);
}

function buildDeagle(B, mag, bolt) {
  rbox(bolt, 0.033, 0.036, 0.205, 0.004, 0, 0.058, -0.055, STEEL);                      // 套筒（活动件）
  for (let i = 0; i < 5; i++) box(bolt, 0.035, 0.022, 0.003, 0, 0.058, -0.005 - i * 0.009, STEEL_L);
  box(bolt, 0.02, 0.006, 0.008, 0, 0.079, 0.035, STEEL_D);
  box(bolt, 0.004, 0.008, 0.006, 0, 0.079, -0.15, STEEL_D);
  rbox(B, 0.03, 0.03, 0.14, 0.004, 0, 0.045, -0.165, STEEL_L);                          // 枪管
  cylZ(B, 0.0095, 0.0095, 0.012, 0, 0.058, -0.238, STEEL_D);
  box(B, 0.03, 0.02, 0.12, 0, 0.03, -0.02, STEEL);                                      // 套筒座
  box(B, 0.022, 0.01, 0.12, 0, 0.037, -0.12, STEEL_L);
  rbox(B, 0.032, 0.1, 0.05, 0.01, 0, -0.045, 0.03, BLACK, { rx: 0.26 });                 // 握把
  triggerGuard(B, -0.016, -0.012, 0.012);
  box(B, 0.008, 0.014, 0.012, 0, 0.07, 0.052, STEEL_L);                                 // 击锤
  box(mag, 0.022, 0.09, 0.034, 0, -0.05, 0.035, STEEL_D, { rx: 0.26 });                  // 弹匣（在握把里）
}

function buildUSP(B, mag, bolt) {
  rbox(bolt, 0.028, 0.028, 0.175, 0.003, 0, 0.052, -0.045, POLY);                       // 套筒（活动件）
  for (let i = 0; i < 4; i++) box(bolt, 0.03, 0.016, 0.003, 0, 0.052, 0, i * 0.008, BLACK);
  box(bolt, 0.016, 0.005, 0.006, 0, 0.069, 0.03, STEEL_D);
  box(bolt, 0.003, 0.006, 0.005, 0, 0.069, -0.125, STEEL_D);
  cylZ(B, 0.0075, 0.0075, 0.022, 0, 0.052, -0.14, STEEL);
  box(B, 0.026, 0.018, 0.11, 0, 0.03, -0.02, BLACK);                                    // 套筒座
  box(B, 0.02, 0.008, 0.11, 0, 0.036, -0.035, STEEL_L);
  rbox(B, 0.028, 0.095, 0.046, 0.01, 0, -0.04, 0.025, POLY, { rx: 0.24 });               // 握把
  triggerGuard(B, -0.018, -0.004, 0.016);
  box(B, 0.007, 0.012, 0.01, 0, 0.064, 0.046, STEEL_L);
  box(mag, 0.02, 0.085, 0.03, 0, -0.045, 0.03, STEEL_D, { rx: 0.24 });
}

function buildKnife(B) {
  const sh = new THREE.Shape([[-0.028, -0.012], [-0.13, -0.017], [-0.212, 0.0], [-0.142, 0.016], [-0.028, 0.012]].map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0042, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0022, bevelSegments: 2 });
  g.translate(0, 0, -0.0021);
  B.add('metal', g, BLADE[1], { ry: PI / 2 });
  box(B, 0.006, 0.044, 0.008, 0, 0, -0.028, STEEL_L);                                   // 护手
  rbox(B, 0.022, 0.028, 0.105, 0.008, 0, -0.002, 0.03, BLACK);                           // 刀柄
  for (const z of [0.005, 0.03, 0.055]) box(B, 0.0235, 0.003, 0.004, 0, -0.002, z, STEEL_D);
  ball(B, 0.013, 0, -0.002, 0.088, STEEL_D);
}

function buildHE(B) {
  ball(B, 0.033, 0, 0, -0.03, OLIVE, [1, 1.28, 1], 18);
  for (const y of [-0.05, -0.03, -0.01]) torus(B, 0.0335, 0.0015, 0, y, -0.03, STEEL_D, { rx: PI / 2 });
  cylY(B, 0.012, 0.012, 0.02, 0, 0.045, -0.03, STEEL_L);                                // 引信体
  box(B, 0.012, 0.006, 0.014, 0, 0.058, -0.03, STEEL);                                  // 保险销
  box(B, 0.004, 0.1, 0.016, 0.026, 0.012, -0.024, STEEL_L, { rx: -0.16 });               // 保险握片
  torus(B, 0.011, 0.0022, -0.016, 0.062, -0.03, STEEL_L, { ry: PI / 2 });               // 拉环
}

const BUILDERS = { ak47: buildAK, m4a1: buildM4, awm: buildAWM, deagle: buildDeagle, usp: buildUSP, knife: buildKnife, he: buildHE };
/** 各枪的握法：手怎么摆 */
const HOLD = {
  ak47: { g: [0, -0.042, 0.052], s: [0, -0.012, -0.235] },
  m4a1: { g: [0, -0.046, 0.058], s: [0, 0.038, -0.225] },
  awm: { g: [0, -0.012, 0.03], s: [0, 0.0, -0.30] },
};

// ———————————————————————— 组装 ————————————————————————
function toMeshes(P, GM) {
  const g = new THREE.Group();
  for (const key of Object.keys(P.lists)) {
    const geo = mergeGeometries(P.lists[key], false);
    for (const x of P.lists[key]) x.dispose();
    if (!geo) continue;
    const mesh = new THREE.Mesh(geo, GM[key]);
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.name = key;
    g.add(mesh);
  }
  return g;
}

/**
 * 造一把枪（带手）。
 * @param {string} id ak47 / m4a1 / awm / deagle / usp / knife / he
 * @param {{team?: number, hands?: boolean}} o team = 队伍（决定袖子和手套的颜色）；hands = 带手和前臂
 * @returns {{group, mag, bolt, leftArm, muzzle, info}} mag / bolt / leftArm 可能是 null
 */
export function createGun(id, o = {}) {
  const info = GUN_INFO[id], GM = createGunMaterials(), body = collector(), mag = collector(), bolt = collector(), larm = collector();
  BUILDERS[id](body, mag, bolt);
  const team = o.team ?? 0, glove = team === 0 ? GLOVE : GLOVE_T, sleeve = SLEEVE[team], common = { glove, sleeve };
  if (o.hands !== false) {
    if (id === 'knife') {
      const at = [0.062, -0.034, 0.034];
      hand(body, { at, u: [-0.985, 0.17, 0], n: [-0.17, 0.985, 0], side: 1, curl: [1.35, 1.45, 0.8], thumb: [-0.55, 0.5, -0.67], glove });
      forearm(body, [at[0] + 0.012, at[1] - 0.006, at[2] + 0.02], [at[0] + 0.17, at[1] - 0.27, at[2] + 0.4], sleeve);
    } else if (id === 'he') {
      const at = [0.066, -0.04, 0.004];
      hand(body, { at, u: [-0.28, 0.26, -0.924], n: [-0.95, 0.06, 0.3], side: 1, curl: [1.5, 1.45, 0.85], thumb: [-0.6, 0.62, -0.5], glove });
      forearm(body, [at[0] + 0.004, at[1] - 0.006, at[2] + 0.014], [at[0] + 0.15, at[1] - 0.28, at[2] + 0.4], sleeve);
    } else if (info.wrap) {
      gripHand(body, info.grip, { ...common, trigger: true });
      const g = info.grip, at = [g[0] - 0.076, g[1] - 0.022, g[2] + 0.078];
      hand(larm, { at, u: [0.55, 0.02, -0.835], n: [0.86, 0.22, 0.46], side: -1, curl: [1.15, 1.45, 0.85], thumb: [0.3, 0.1, -0.95], thumbCurl: 0.25, glove, scale: 1.04 });
      forearm(larm, [at[0] + 0.01, at[1] - 0.012, at[2] + 0.012], [at[0] + 0.03, at[1] - 0.3, at[2] + 0.42], sleeve);
    } else {
      gripHand(body, HOLD[id].g, { ...common, trigger: true });
      supportHand(larm, HOLD[id].s, { ...common });
    }
  }
  const group = toMeshes(body, GM);
  const mk = (P) => (Object.keys(P.lists).length ? toMeshes(P, GM) : null);
  const magG = mk(mag), boltG = mk(bolt), armG = mk(larm);
  for (const g of [magG, boltG, armG]) if (g) group.add(g);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(...info.muzzle);
  group.add(muzzle);
  return { id, group, mag: magG, bolt: boltG, leftArm: armG, muzzle, info };
}

/** 第三人称用的枪（挂在士兵的胸前骨头上）：返回按材质键分好的几何，还没合并 */
export function rifleSilhouette(id) {
  const P = collector();
  BUILDERS[id](P, collector(), collector());
  return P.lists;
}
