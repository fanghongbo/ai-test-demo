// 道具工厂：每个函数把几何体加进一个 ToonBatch（之后整段路合批成一次绘制）。
// 约定：圆角、纯色、低饱和；条纹一律用“几何分段”实现（一个批次只有一份材质，不能逐件换贴图）；
// 摆动件通过 sway 权重交给顶点着色器做风吹。放在 (x, y, z) 并绕 Y 旋转 rotY。
import * as THREE from 'three';
import { loftGeometry } from '../gfx/loft.js';
import * as S from '../gfx/shapes.js';
import { lerp, TAU } from '../core/mathx.js';

export const PC = Object.freeze({
  white: 0xf6f1e6, cream: 0xefe4c9, coral: 0xef6a55, teal: 0x2f7f86, wood: 0xb98455, woodLight: 0xc99a66, woodDark: 0x8c5f3a, iron: 0x3d4a55,
  trunk: 0xc2966b, trunkDark: 0xa97c52, frond: 0x5cbb78, frondDark: 0x46a565, bush: 0x6fbf6d, bushDark: 0x58a85c, leaf: 0x74c46e,
  coconut: 0x7a5536, lampGlass: 0xfff0c0, navy: 0x2c4f6e, sky: 0x3aa7c9, sun: 0xf7c548, stone: 0xd8d2c4, gullGray: 0x8c93a3, orange: 0xf0923c,
});
const FLOWERS = [0xf26b5e, 0xf7c548, 0xf7f1e3, 0xe88bb0, 0xf59a4a];
const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();

/** 返回 put(geo, color, opts, pos, rot, scale)：把局部坐标的几何体放到 (x,y,z)、朝向 rotY 的位置 */
export function putter(b, x, y, z, rotY = 0) {
  const base = new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y, z);
  const put = (geo, color, o = {}, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) => {
    _q.setFromEuler(_e.set(rot[0], rot[1], rot[2]));
    _m2.compose(_v.set(pos[0], pos[1], pos[2]), _q, _s.set(scale[0], scale[1], scale[2]));
    b.add(geo, _m.multiplyMatrices(base, _m2).clone(), color, o);
    return put;
  };
  return put;
}
export function flipWinding(g) {
  const ix = g.index.array;
  for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
  g.index.needsUpdate = true; g.computeVertexNormals(); return g;
}
/** 绕杆一圈的扇形板（伞面、沙滩球、帐篷条纹都用它拼） */
function wedge(rTop, rBot, h, segs, k) {
  return new THREE.CylinderGeometry(rTop, rBot, h, 1, 1, true, (k / segs) * TAU, TAU / segs);
}

/** 带锯齿边缘、先拱后垂的薄叶片（棕榈叶）。t0..t1 取整片叶中的一段（弧线按整片计算，两段首尾相接） */
export function bladeGeometry(len, width, o = {}) {
  const t0 = o.t0 ?? 0, t1 = o.t1 ?? 1, segs = o.segs ?? 16, arch = o.arch ?? 0.5, droop = o.droop ?? 1.2, serr = o.serr ?? 13, thick = o.thick ?? 0.012;
  const n = segs + 1, top = [], bot = [], idx = [];
  const wAt = (t) => width * Math.pow(Math.max(Math.sin(Math.PI * Math.pow(t, 0.62)), 0), 0.9) * (1 - 0.25 * t) * (0.78 + 0.22 * Math.abs(((t * serr) % 1) * 2 - 1));
  const yAt = (t) => arch * Math.sin(t * Math.PI * 0.5) - droop * t * t;
  for (let i = 0; i < n; i++) {
    const t = lerp(t0, t1, i / segs), d = t * len, w = Math.max(wAt(t), 0.004), y = yAt(t);
    top.push([-w, y + thick, d], [w, y + thick, d]); bot.push([-w, y, d], [w, y, d]);
  }
  const o2 = n * 2;
  for (let i = 0; i < segs; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, c, b, b, c, d, o2 + a, o2 + b, o2 + c, o2 + b, o2 + d, o2 + c, a, b, o2 + a, o2 + a, b, o2 + b, c, o2 + c, d, d, o2 + c, o2 + d);
  }
  idx.push(0, o2, 1, 1, o2, o2 + 1);                              // 根部封口
  const e0 = segs * 2, e1 = e0 + 1; idx.push(e0, e1, o2 + e0, e1, o2 + e1, o2 + e0);   // 叶尖封口
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...top, ...bot].flat()), 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ———————————————————————— 植被 ————————————————————————

/**
 * 棕榈：弯曲树干（4 段，摆动权重递增）+ 8~9 片拱垂的叶（每片两段，叶尖摆得更厉害）+ 椰子。
 * o.blades：锯齿叶片放进单独的合批（只在赛璐璐画风下显示）；o.cards：同一条叶轴上再排一份小叶卡片（只在写实画风下显示）。
 * 两者共用同一组随机数，所以形状严格对应。
 */
export function addPalm(b, x, y, z, rng, o = {}) {
  const rotY = rng() * TAU, h = o.h ?? 5.5 + rng() * 3.5, lean = 0.6 + rng() * 1.1;
  const put = putter(b, x, y - 0.15, z, rotY);
  const putBlade = o.blades ? putter(o.blades, x, y - 0.15, z, rotY) : put;
  const R = [0.02, 0.06, 0.12, 0.2];
  for (let k = 0; k < 4; k++) {
    put(loftGeometry((t, out) => { const tt = (k + t) / 4; out.set(lean * tt * tt, h * tt, 0); }, (t) => {
      const tt = (k + t) / 4, r = lerp(0.20, 0.125, tt) * (tt < 0.07 ? 1 + (0.07 - tt) * 10 : 1);
      return { a: r, bt: r, bb: r };
    }, { rings: 6, radial: 12, caps: [k === 0, k === 3] }), k % 2 ? PC.trunk : PC.trunkDark, { outline: 0.8, sway: R[k] * 0.4, phase: rotY });
  }
  const cx = lean, cy = h + 0.05;
  put(S.sphere(0.27, 12, 9), PC.trunkDark, { outline: 0.8, sway: 0.09, phase: rotY }, [cx, cy - 0.06, 0]);
  const nf = 8 + Math.floor(rng() * 2);
  for (let i = 0; i < nf; i++) {
    const a = (i / nf) * TAU + rng() * 0.3, len = 2.4 + rng() * 0.9, tilt = (rng() - 0.5) * 0.3;
    const col = i % 2 ? PC.frond : PC.frondDark, ph = rotY + i * 1.7, o2 = { segs: 7, arch: 0.55, droop: 1.3, serr: 7 };
    putBlade(bladeGeometry(len, 0.52, { ...o2, t0: 0, t1: 0.52 }), col, { outline: 0.8, sway: 0.10, phase: ph }, [cx, cy + 0.1, 0], [tilt, a, 0]);
    putBlade(bladeGeometry(len, 0.52, { ...o2, t0: 0.52, t1: 1 }), col, { outline: 0.8, sway: 0.26, phase: ph + 0.6 }, [cx, cy + 0.1, 0], [tilt, a, 0]);
    if (o.cards) {
      const base = new THREE.Matrix4().makeRotationY(rotY).setPosition(x, y - 0.15, z);
      o.cards.add(leafletFrondGeometry(len, tilt, a, cx, cy + 0.1), base, col, { sway: 0.2, phase: ph + 0.4 });
    }
  }
  for (let i = 0; i < 3; i++) { const a = rng() * TAU; put(S.sphere(0.14, 10, 8), PC.coconut, { outline: 0.8 }, [cx + Math.cos(a) * 0.2, cy - 0.22, Math.sin(a) * 0.2]); }
}

/**
 * 一片棕榈叶的小叶卡片（写实专用）：沿叶轴（先拱后垂，与 bladeGeometry 同一条曲线）两侧各排 13 片渐短的披针形小叶，
 * 叶形来自带透明通道的贴图。坐标在树冠局部：叶轴从 (cx, cy, 0) 出发，先绕 X 倾斜 tilt，再绕 Y 转到方位 az。
 * 整片叶是一个合批项：风摆权重对整片叶统一。
 */
export function leafletFrondGeometry(len, tilt, az, cx, cy) {
  const arch = 0.55, droop = 1.3, N = 13;
  const yAt = (t) => arch * Math.sin(t * Math.PI * 0.5) - droop * t * t;
  const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, az, 0));
  const pos = [], nrm = [], uv = [], idx = [];
  const T = new THREE.Vector3(), D = new THREE.Vector3(), W = new THREE.Vector3(), o = new THREE.Vector3(), a0 = new THREE.Vector3(), a1 = new THREE.Vector3(), n = new THREE.Vector3();
  const putV = (v) => { v.applyQuaternion(rot).add(o.set(cx, cy, 0)); pos.push(v.x, v.y, v.z); };
  for (let i = 0; i < N; i++) {
    const t = 0.13 + 0.85 * (i / (N - 1));
    T.set(0, (yAt(t + 0.01) - yAt(t - 0.01)) / 0.02, len).normalize();                   // 叶轴切线
    const L = len * (0.17 + 0.15 * Math.sin(Math.PI * Math.pow(t, 0.75)));              // 小叶长度：中段最长
    for (const side of [1, -1]) {
      D.set(side * 0.82, -0.16 - 0.3 * t, -0.46).addScaledVector(T, 0.5).normalize();   // 斜向后下方伸出
      W.crossVectors(D, T).normalize().multiplyScalar(0.075);
      n.crossVectors(W, D).normalize();
      a0.set(0, yAt(t), t * len).addScaledVector(T, -0.03);
      a1.copy(a0).addScaledVector(D, L);
      const b = pos.length / 3;
      putV(a0.clone().add(W)); putV(a0.clone().sub(W)); putV(a1.clone().addScaledVector(W, 0.3)); putV(a1.clone().addScaledVector(W, -0.3));
      for (let k = 0; k < 4; k++) nrm.push(n.x, n.y, n.z);
      uv.push(0, 0, 1, 0, 1, 1, 0, 1);
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

/** 圆冠小树 */
export function addTree(b, x, y, z, rng) {
  const put = putter(b, x, y - 0.1, z, rng() * TAU), h = 1.5 + rng() * 0.8;
  put(S.cyl(0.13, 0.2, h, 10).translate(0, h / 2, 0), PC.trunkDark, { outline: 0.9 });
  const n = 4 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, r = 1.0 + rng() * 0.6;
    put(S.sphere(r, 14, 10), i % 2 ? PC.leaf : PC.bushDark, { outline: 1, sway: 0.05, phase: a }, [Math.cos(a) * 0.8, h + 0.7 + rng() * 0.6, Math.sin(a) * 0.8]);
  }
  put(S.sphere(1.35, 14, 10), PC.leaf, { outline: 1, sway: 0.06 }, [0, h + 1.5, 0]);
}
export function addBush(b, x, y, z, rng, o = {}) {
  const put = putter(b, x, y - 0.08, z, rng() * TAU), k = o.big ? 1.5 : 1, n = 3 + Math.floor(rng() * 2);
  for (let i = 0; i < n; i++) {
    const a = rng() * TAU, r = (0.32 + rng() * 0.26) * k;
    put(S.sphere(r, 12, 9), i % 2 ? PC.bush : PC.bushDark, { outline: 1 }, [Math.cos(a) * 0.3 * k, r * 0.7, Math.sin(a) * 0.3 * k]);
  }
}
export function addFlowers(b, x, y, z, rng) {
  const put = putter(b, x, y, z, 0), n = 5 + Math.floor(rng() * 5), col = FLOWERS[Math.floor(rng() * FLOWERS.length)];
  for (let i = 0; i < n; i++) {
    const px = (rng() - 0.5) * 1.4, pz = (rng() - 0.5) * 1.4, h = 0.16 + rng() * 0.16;
    put(S.cyl(0.008, 0.01, h, 5).translate(0, h / 2, 0), PC.frondDark, { outline: 0, sway: 0.03, phase: i }, [px, 0, pz]);
    put(S.sphere(0.055 + rng() * 0.02, 8, 6), rng() < 0.7 ? col : 0xf7f1e3, { outline: 0.7 }, [px, h + 0.03, pz]);
  }
}

// ———————————————————————— 街具 ————————————————————————

/** 栏杆一跨：p0/p1 为两端 (x,z)，y 为步道面高度 */
export function addRailing(b, p0, p1, y) {
  const dx = p1[0] - p0[0], dz = p1[1] - p0[1], len = Math.hypot(dx, dz), rotY = Math.atan2(dx, dz);
  const put = putter(b, p0[0], y, p0[1], rotY);
  put(S.cyl(0.045, 0.05, 1.0, 8).translate(0, 0.5, 0), PC.white, { spec: 0.3 });
  put(S.sphere(0.075, 10, 8), PC.white, { spec: 0.3 }, [0, 1.03, 0]);
  for (const h of [0.52, 0.95]) put(S.tube([[0, h, 0], [0, h, len]], 0.032, { tubular: 1, radial: 7 }), PC.white, { spec: 0.3, outline: 0.8 });
}
export function addLamp(b, x, y, z, rotY) {
  const put = putter(b, x, y, z, rotY);
  put(S.cyl(0.16, 0.2, 0.12, 12).translate(0, 0.06, 0), PC.teal, { outline: 0.9 });
  put(S.cyl(0.05, 0.075, 3.5, 10).translate(0, 1.8, 0), PC.teal, { spec: 0.3 });
  put(S.tube([[0, 3.5, 0], [0, 3.76, 0.12], [0, 3.83, 0.42], [0, 3.73, 0.62]], 0.04, { tubular: 10, radial: 7 }), PC.teal, { spec: 0.3 });
  put(S.cyl(0.17, 0.12, 0.08, 6).translate(0, 3.47, 0.62), PC.teal, { outline: 0.8 });
  put(S.cyl(0.13, 0.17, 0.34, 6).translate(0, 3.26, 0.62), PC.lampGlass, { lamp: 1, spec: 0.6, specSize: 0.5 });   // 灯罩：夜里点亮
  put(S.cyl(0.19, 0.19, 0.05, 6).translate(0, 3.07, 0.62), PC.teal, { outline: 0.8 });
  put(S.sphere(0.035, 8, 6), PC.coral, { spec: 0.5 }, [0, 3.52, 0.62]);
}
/** 长椅（朝向 +Z 的一面是座位前方） */
export function addBench(b, x, y, z, rotY) {
  const put = putter(b, x, y, z, rotY);
  for (const sx of [-0.78, 0.78]) {
    put(S.tube([[sx, 0, 0.24], [sx, 0.43, 0.22], [sx, 0.43, -0.16], [sx, 0, -0.2]], 0.028, { tubular: 8, radial: 6 }), PC.iron, { outline: 0.8 });
    put(S.tube([[sx, 0.43, -0.16], [sx, 0.9, -0.32]], 0.026, { tubular: 4, radial: 6 }), PC.iron, { outline: 0.8 });
  }
  for (let i = 0; i < 4; i++) put(S.box(1.8, 0.035, 0.1, 0.012), i % 2 ? PC.wood : PC.woodLight, { outline: 0.8 }, [0, 0.455, 0.2 - i * 0.115]);
  for (let i = 0; i < 3; i++) put(S.box(1.8, 0.1, 0.035, 0.012), PC.wood, { outline: 0.8 }, [0, 0.6 + i * 0.125, -0.23 - i * 0.042], [0.3, 0, 0]);
}
/** 遮阳伞：伞面由 12 块扇形板交替两色拼成（含翻面的内侧） */
export function addUmbrella(b, x, y, z, rng) {
  const put = putter(b, x, y, z, rng() * TAU);
  const tilt = [(rng() - 0.5) * 0.35, 0, (rng() - 0.5) * 0.35];
  const pairs = [[PC.coral, PC.cream], [PC.sky, PC.cream], [PC.sun, PC.cream]], [ca, cb] = pairs[Math.floor(rng() * 3)];
  put(S.cyl(0.025, 0.025, 2.3, 8).translate(0, 1.15, 0), PC.cream, { outline: 0.7 }, [0, 0, 0], tilt);
  for (let k = 0; k < 12; k++) {
    const g = wedge(0.03, 1.4, 0.52, 12, k).translate(0, 2.04, 0);
    put(g, k % 2 ? ca : cb, { outline: 0.9 }, [0, 0, 0], tilt);
    put(flipWinding(g.clone()), k % 2 ? ca : cb, { outline: 0 }, [0, 0, 0], tilt, [1, 1, 0.985]);
  }
  put(S.sphere(0.05, 8, 6), PC.wood, { outline: 0.6 }, [-Math.sin(tilt[2]) * 2.3, 2.32, Math.sin(tilt[0]) * 2.3]);
  put(S.box(0.85, 0.02, 1.7, 0.01), ca === PC.sky ? PC.sun : PC.sky, { outline: 0.6 }, [0.95, 0.012, 0.25], [0, 0.3, 0]);
  if (rng() < 0.6) for (let k = 0; k < 6; k++) put(new THREE.SphereGeometry(0.2, 4, 8, (k / 6) * TAU, TAU / 6), k % 2 ? PC.coral : PC.cream, { outline: 0.8 }, [-0.9, 0.2, 1.05]);
}
export function addSandcastle(b, x, y, z, rng) {
  const put = putter(b, x, y - 0.03, z, rng() * TAU);
  const sand = 0xefd9a7;
  put(S.cyl(0.55, 0.65, 0.35, 8).translate(0, 0.17, 0), sand, { outline: 0.8 });
  for (const [px, pz, r, h] of [[0, 0, 0.22, 0.7], [0.42, 0.1, 0.16, 0.5], [-0.36, -0.22, 0.15, 0.45]]) {
    put(S.cyl(r, r * 1.08, h, 8).translate(px, h / 2 + 0.3, pz), sand, { outline: 0.8 });
    for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; put(S.box(r * 0.5, 0.08, r * 0.5, 0.005), sand, { outline: 0.6 }, [px + Math.cos(a) * r * 0.75, h + 0.34, pz + Math.sin(a) * r * 0.75], [0, -a, 0]); }
  }
  put(S.cyl(0.012, 0.012, 0.4, 5).translate(0, 1.2, 0), PC.woodDark, { outline: 0.5 });
  put(S.extrude([[0, 0], [0.2, -0.05], [0, -0.1]], 0.006, { bevel: 0 }), PC.coral, { outline: 0.6 }, [0, 1.38, 0]);
}
/** 救生员瞭望塔 */
export function addLifeguardTower(b, x, y, z, rotY) {
  const put = putter(b, x, y, z, rotY);
  for (const sx of [-1.2, 1.2]) for (const sz of [-1.05, 1.05]) put(S.cyl(0.09, 0.11, 2.5, 8).translate(sx, 1.2, sz), PC.woodDark, { outline: 0.9 });
  put(S.box(3.2, 0.14, 2.8, 0.03).translate(0, 2.45, 0), PC.wood, { outline: 1 });
  put(S.box(2.5, 2.0, 2.2, 0.05).translate(0, 3.5, -0.1), PC.cream, { outline: 1 });
  put(S.cyl(0.05, 2.15, 0.85, 4).rotateY(Math.PI / 4).translate(0, 4.9, -0.1), PC.coral, { outline: 1 });
  put(S.box(1.3, 0.75, 0.06, 0.01).translate(0, 3.75, 1.02), PC.navy, { outline: 0.8 });
  put(S.box(0.06, 0.75, 1.2, 0.01).translate(1.26, 3.75, -0.1), PC.navy, { outline: 0.8 });
  put(S.box(0.9, 0.06, 3.6, 0.02), PC.woodLight, { outline: 0.9 }, [1.95, 1.22, 2.55], [-0.79, 0, 0]);           // 跳板坡道
  for (const sx of [1.55, 2.35]) put(S.tube([[sx, 0.95, 4.1], [sx, 2.2, 1.95], [sx, 3.4, 1.25]], 0.03, { tubular: 6, radial: 6 }), PC.white, { outline: 0.7 });
  put(S.box(1.6, 0.42, 0.06, 0.02).translate(0, 2.95, 1.04), PC.coral, { outline: 0.8 });
}
/** 小划艇（开口船身：放样壳 + 深色内舱 + 两条座板） */
export function addRowboat(b, x, y, z, rotY, o = {}) {
  const put = putter(b, x, y, z, rotY), L = o.len ?? 3.2;
  put(loftGeometry((t, out) => out.set(0, 0.42 * Math.sin(t * Math.PI) * 0.25, -L / 2 + L * t), (t) => {
    const w = Math.pow(Math.sin(t * Math.PI), 0.55);
    return { a: 0.62 * w + 0.01, bt: 0.02, bb: 0.5 * Math.pow(Math.sin(t * Math.PI), 0.5) + 0.01 };
  }, { rings: 18, radial: 16 }), o.color ?? PC.white, { spec: 0.35, outline: 1 });
  put(S.box(0.92, 0.03, L * 0.62, 0.012).translate(0, 0.03, 0), PC.navy, { outline: 0.7 });
  for (const zz of [-0.55, 0.5]) put(S.box(1.0, 0.05, 0.24, 0.012).translate(0, 0.09, zz), PC.woodLight, { outline: 0.8 });
  put(S.tube([[0.55, 0.0, -0.3], [0.75, 0.06, 0.2], [0.6, 0.02, 0.8]], 0.028, { tubular: 6, radial: 6 }), PC.wood, { outline: 0.7 });   // 一支桨
}
/** 路牌：箭头形指示板 */
export function addSignpost(b, x, y, z, rotY, o = {}) {
  const put = putter(b, x, y, z, rotY);
  put(S.box(0.11, 2.7, 0.11, 0.02).translate(0, 1.35, 0), PC.woodDark, { outline: 0.9 });
  put(S.sphere(0.09, 8, 6), PC.coral, { outline: 0.7 }, [0, 2.74, 0]);
  const arrow = (dir, len) => { const h = 0.13, tip = 0.16; return dir > 0 ? [[0, -h], [len - tip, -h], [len, 0], [len - tip, h], [0, h]] : [[0, -h], [tip - len, -h], [-len, 0], [tip - len, h], [0, h]]; };
  put(S.extrude(arrow(1, 0.95), 0.035, { bevel: 0.006 }), PC.teal, { outline: 0.9 }, [0.05, 2.25, 0], [0, 0, 0]);
  put(S.extrude(arrow(-1, 0.85), 0.035, { bevel: 0.006 }), PC.coral, { outline: 0.9 }, [-0.05, 1.95, 0], [0, o.back ? Math.PI : 0, 0]);
}
export function addPicnicTable(b, x, y, z, rotY) {
  const put = putter(b, x, y, z, rotY);
  for (let i = -1; i <= 1; i++) put(S.box(1.8, 0.045, 0.3, 0.012), PC.woodLight, { outline: 0.9 }, [0, 0.76, i * 0.31]);
  for (const sx of [-0.66, 0.66]) put(S.box(1.8, 0.045, 0.28, 0.012), PC.wood, { outline: 0.9 }, [0, 0.45, sx]);
  for (const sx of [-0.7, 0.7]) {
    for (const sz of [-1, 1]) put(S.box(0.09, 0.98, 0.09, 0.012), PC.woodDark, { outline: 0.8 }, [sx, 0.44, sz * 0.46], [sz * 0.5, 0, 0]);
    put(S.box(0.07, 0.06, 1.5, 0.01), PC.woodDark, { outline: 0.7 }, [sx, 0.38, 0]);
  }
}
/** 帐篷：6 片三角棱柱交替两色，门帘是深色小三角 */
export function addTent(b, x, y, z, rotY, o = {}) {
  const put = putter(b, x, y - 0.04, z, rotY), n = 6, w = 2.6, h = 1.6, d = 2.4;
  for (let k = 0; k < n; k++) {
    const tri = [[-w / 2, 0], [w / 2, 0], [0, h]];
    const g = S.extrude(tri, d / n - 0.004, { bevel: 0 }); g.translate(0, 0, -d / 2 + (k * d) / n);
    put(g, k % 2 ? (o.color ?? PC.coral) : PC.cream, { outline: 1 });
  }
  put(S.extrude([[-0.55, 0], [0.55, 0], [0, 1.0]], 0.02, { bevel: 0 }), PC.navy, { outline: 0.8 }, [0, 0.01, d / 2 + 0.005]);
  put(S.cyl(0.02, 0.02, 0.9, 6), PC.woodDark, { outline: 0.5 }, [0, 0.45, d / 2 + 0.5]);
  put(S.extrude([[0, 0], [0.34, -0.07], [0, -0.16]], 0.006, { bevel: 0 }), PC.sun, { outline: 0.6 }, [0, 0.9, d / 2 + 0.5]);
  put(S.box(0.9, 0.22, 0.55, 0.06), PC.sky, { outline: 0.8 }, [1.9, 0.11, 0.5], [0, 0.4, 0]);     // 睡袋卷
}
