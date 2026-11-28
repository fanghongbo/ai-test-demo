// 珊瑚礁上的生物：每种一个“模板”几何（原点在根部、朝上、大小约为 1），用实例铺出去；颜色走实例色——同一个模板换个颜色就是另一个种。
// 鹿角珊瑚（分叉的枝）、桌珊瑚（一张桌子）、脑珊瑚（回旋的沟）、管海绵、桶海绵、软指珊瑚、海扇、海葵、砗磲、海胆、海星、藻丛、海鞭。
import * as THREE from 'three';
import { meshBuilder, V, mixc, ribbon, tube, blob, fbm3, paramSurface } from '../gfx/organic.js';
import { scaleUV } from '../gfx/batch.js';
import { mulberry32, TAU } from '../core/mathx.js';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** 鹿角珊瑚：反复分叉的枝，末梢发白 */
export function staghorn(seed = 1) {
  const r = mulberry32(seed * 101 + 7), mb = meshBuilder(), base = [0.46, 0.28, 0.12], tip = [1.08, 1.0, 0.9];
  const branch = (p, dir, len, rad, depth) => {
    const pts = [p.clone()], d = dir.clone();
    for (let k = 0; k < 2; k++) { d.x += (r() - 0.5) * 0.4; d.z += (r() - 0.5) * 0.4; d.y += 0.14; d.normalize(); pts.push(pts[k].clone().addScaledVector(d, len / 2)); }
    tube(mb, pts, [rad, rad * 0.78, rad * 0.55], { sides: 5, col: (i, t) => mixc(base, tip, depth === 0 ? t * t : t * 0.12), cap: depth === 0 ? 'tip' : 'none', tipLen: rad * 1.2 });
    if (depth === 0) return;
    const kids = depth >= 2 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const a = (k / kids) * TAU + r() * 1.4, nd = v3(d.x * 0.4 + Math.cos(a) * (0.7 + r() * 0.4), 0.45 + r() * 0.45, d.z * 0.4 + Math.sin(a) * (0.7 + r() * 0.4)).normalize();
      branch(pts[2].clone(), nd, len * (0.62 + r() * 0.16), rad * 0.62, depth - 1);
    }
  };
  const trunks = 2 + ((r() * 2) | 0);
  for (let k = 0; k < trunks; k++) branch(v3((r() - 0.5) * 0.12, 0, (r() - 0.5) * 0.12), v3((r() - 0.5) * 0.6, 1, (r() - 0.5) * 0.6).normalize(), 0.30 + r() * 0.08, 0.055, 3);
  return mb.build();
}

/** 桌珊瑚：一根短柱顶着一张起伏的圆桌，边缘发白 */
export function table(seed = 1) {
  const r = mulberry32(seed * 77 + 3), mb = meshBuilder(), NR = 8, NA = 44, centre = [0.30, 0.16, 0.05], rim = [1.0, 0.88, 0.78];
  const rmax = (a) => 1 + 0.07 * Math.sin(a * 7 + seed) + 0.05 * Math.sin(a * 13 + seed * 2.3), yOf = (rr, a) => 0.44 + 0.15 * rr * rr - 0.05 * Math.sin(a * 9 + rr * 5) * rr;
  const pt = (i, j) => {
    const a = (j / NA) * TAU, rr = (i / NR) * rmax(a), x = Math.cos(a) * rr, z = Math.sin(a) * rr, c = mixc(centre, rim, Math.pow(i / NR, 2.2));
    return V(x, yOf(rr, a), z, 0, 1, 0, x * 2, z * 2, c);
  };
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) mb.quad(pt(i, j), pt(i, j + 1), pt(i + 1, j + 1), pt(i + 1, j), [0, 1, 0]);
  const brown = [0.42, 0.24, 0.09];
  tube(mb, [v3(0, -0.08, 0), v3(0, 0.2, 0), v3(0, 0.45, 0)], [0.15, 0.12, 0.09], { sides: 8, col: () => brown });
  for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU + r() * 0.5; tube(mb, [v3(0, 0.28, 0), v3(Math.cos(a) * 0.4, 0.40, Math.sin(a) * 0.4), v3(Math.cos(a) * 0.78, yOf(0.78, a) - 0.01, Math.sin(a) * 0.78)], [0.05, 0.04, 0.02], { sides: 5, cap: 'tip', col: () => brown }); }
  return mb.build();
}

/** 脑珊瑚的一道道沟：三维噪声的等值面——噪声过零的地方是沟，两边是鼓起来的脊 */
function brainRibs(d, seed) {
  const n = fbm3(d.x * 4.2 + seed * 3.1, d.y * 4.2, d.z * 4.2, 3, seed) - 0.47;
  return { ridge: Math.min(1, Math.abs(n) / 0.05), valley: 1 - Math.min(1, Math.abs(n) / 0.09) };
}

/**
 * 脑珊瑚、团块状的石珊瑚：压扁的团块，表面是一道道鼓起来的脊（真的几何，不是贴图画的），沟里用顶点色压暗。
 * fine：大个的用高细分，脊才分得开；不细的分不出脊，就是一颗带小凸点的石头（远处的小个子用它）
 */
export function brain(seed = 1, fine = true) {
  const mb = meshBuilder(), base = (d) => 1 + 0.05 * fbm3(d.x * 3.2 + seed, d.y * 3.2, d.z * 3.2, 3, seed) + 0.02 * fbm3(d.x * 9, d.y * 9 + 4, d.z * 9, 2, seed + 3);
  blob(mb, {
    seg: fine ? 84 : 16, rings: fine ? 46 : 9, sy: 0.60 + (seed % 3) * 0.06, flat: -0.22,
    radius: (d) => { const r = fine ? brainRibs(d, seed) : null; return base(d) * (1 + (fine ? 0.045 * r.ridge - 0.03 * r.valley : 0)); },
    col: (d) => { if (!fine) return [1, 1, 1]; const r = brainRibs(d, seed), k = 0.56 + 0.44 * r.ridge; return [k, k, k]; },
  });
  return scaleUV(mb.build(), fine ? 7 : 3, fine ? 3.4 : 1.6);
}

/** 管海绵：一丛高低不齐的管子，口沿外翻，里面是黑的 */
export function tubeSponge(seed = 1) {
  const r = mulberry32(seed * 131 + 11), mb = meshBuilder(), n = 3 + ((r() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + r() * 1.5, br = 0.10 + r() * 0.16, h = 0.7 + r() * 0.6, out = 0.10 + r() * 0.14, base = v3(Math.cos(a) * br, -0.04, Math.sin(a) * br), pts = [];
    for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push(base.clone().add(v3(Math.cos(a) * out * t * t + Math.sin(t * 5 + k) * 0.02, h * t, Math.sin(a) * out * t * t + Math.cos(t * 4 + k) * 0.02))); }
    tube(mb, pts, [0.13, 0.145, 0.16, 0.17, 0.21], { sides: 12, col: (i, t) => [0.55 + 0.45 * t * t, 0.40 + 0.58 * t * t, 0.32 + 0.6 * t * t], cap: 'flat', lip: 0.5, innerCol: [0.10, 0.07, 0.07] });
  }
  return mb.build();
}

/** 桶海绵：一只带纵棱的大桶 */
export function barrel() {
  const mb = meshBuilder();
  tube(mb, [0, 0.22, 0.5, 0.8, 1.05, 1.18].map((y) => v3(0, y - 0.06, 0)), [0.52, 0.70, 0.87, 0.97, 1.0, 0.90], {
    sides: 44, ribs: [12, 0.035], col: (i, t, k) => { const rib = 0.5 + 0.5 * Math.sin(k * TAU * 12); return [0.55 + 0.45 * rib * (0.5 + 0.5 * t), 0.36 + 0.40 * rib * (0.5 + 0.5 * t), 0.30 + 0.38 * rib * (0.5 + 0.5 * t)]; },
    cap: 'flat', lip: 0.9, innerCol: [0.06, 0.04, 0.05],
  });
  return mb.build();
}

/** 软指珊瑚：一丛指头，会摇 */
export function fingers(seed = 1) {
  const r = mulberry32(seed * 171 + 5), mb = meshBuilder(), n = 7 + ((r() * 5) | 0);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * TAU + r() * 1.2, br = r() * 0.30, h = 0.6 + r() * 0.5, ph = r(), lean = 0.18 + r() * 0.22, pts = [];
    for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push(v3(Math.cos(a) * (br + lean * t * t), h * t - 0.04, Math.sin(a) * (br + lean * t * t))); }
    tube(mb, pts, [0.11, 0.12, 0.115, 0.10, 0.075], { sides: 7, col: (i, t) => [0.55 + 0.5 * t, 0.55 + 0.5 * t, 0.5 + 0.5 * t], cap: 'tip', tipLen: 0.09, extra: (i, t) => [t, ph, 0] });
  }
  return mb.build();
}

/** 海扇：一个梯形的面，枝网在贴图的透明通道里，会摇 */
export function fan(seed = 1) {
  const mb = meshBuilder(), NX = 8, NY = 7;
  const pt = (i, j) => {
    const t = j / NY, u = i / NX, half = 0.26 + 1.34 * t, x = (u - 0.5) * 2 * half, y = 0.02 + t * 1.95, z = 0.16 * x * x - 0.03 * t + 0.03 * Math.sin(x * 5 + seed + y * 3) * t;
    return V(x, y, z, 0, 0, 1, 0.5 + x * 0.475, 1 - y * 0.49, [1, 1, 1], [t * t, 0.3 + u * 0.4, 0]);
  };
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) mb.quad(pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1), [0, 0, 1]);
  return mb.build();
}

/** 海葵：一根短柱，顶上密密的触手，梢部弯向上、会摇 */
export function anemone(seed = 1) {
  const r = mulberry32(seed * 191 + 9), mb = meshBuilder();
  tube(mb, [v3(0, -0.08, 0), v3(0, 0.28, 0), v3(0, 0.46, 0)], [0.44, 0.40, 0.37], { sides: 18, col: (i, t) => [0.50 + 0.2 * t, 0.36 + 0.2 * t, 0.32 + 0.2 * t], cap: 'flat', lip: 0.04, innerCol: [0.45, 0.42, 0.42] });
  const rings = [[9, 0.10, 0.50], [17, 0.22, 0.54], [25, 0.33, 0.58]];
  for (const [count, br, len0] of rings) for (let k = 0; k < count; k++) {
    const a = (k / count) * TAU + br * 9 + r() * 0.2, len = len0 * (0.85 + r() * 0.3), ph = r(), spread = 0.55 + br * 1.5 + r() * 0.25, b = v3(Math.cos(a) * br, 0.46, Math.sin(a) * br), pts = [];
    for (let i = 0; i <= 3; i++) { const t = i / 3, up = t * (1 - t * 0.45), out = spread * t * (1 - t * 0.25); pts.push(b.clone().add(v3(Math.cos(a) * out * len, up * len, Math.sin(a) * out * len))); }
    tube(mb, pts, [0.036, 0.031, 0.024, 0.011], { sides: 4, col: (i, t) => [0.85 + 0.35 * t, 0.85 + 0.35 * t, 0.85 + 0.35 * t], cap: 'tip', tipLen: 0.03, extra: (i, t) => [t, ph, 0] });
  }
  return mb.build();
}

/** 砗磲：两片带放射肋的壳（上面那片从后面的铰链张开），张开的缝里是一圈波浪形的外套膜。返回壳和外套膜两份几何 */
export function clam(seed = 1) {
  const mbS = meshBuilder(), mbM = meshBuilder(), NR = 5, NA = 34, RA = 1.0, RB = 0.66, DEPTH = 0.36, HZ = -RB * 0.86, OPEN = 0.52, N = 56;
  const rib = (a) => 1 + 0.022 * Math.sin(a * 13 + seed) + 0.012 * Math.sin(a * 29);                 // 放射肋
  const hinge = (p) => { const dz = p[2] - HZ, c = Math.cos(OPEN), s = Math.sin(OPEN); return [p[0], 0.03 + p[1] * c + dz * s, HZ - p[1] * s + dz * c]; };   // 绕铰链翻开：前缘抬起
  const turn = (n) => [n.x, n.y * Math.cos(OPEN) + n.z * Math.sin(OPEN), -n.y * Math.sin(OPEN) + n.z * Math.cos(OPEN)];
  /** 一片壳，连外面、里面两层。dir：+1 下壳（碗口朝上），-1 上壳（扣着，再绕铰链翻开） */
  const valve = (dir, top) => {
    const P = (i, j, inner) => { const a = (j / NA) * TAU, rr = (i / NR) * rib(a); return [Math.cos(a) * rr * RA, -dir * DEPTH * Math.pow(Math.max(0, 1 - rr * rr), 0.62) + (inner ? dir * 0.03 : 0), Math.sin(a) * rr * RB, rr, a]; };
    const vtx = (i, j, inner) => {
      const p = P(i, j, inner), pr = P(Math.min(i + 1, NR), j, inner), pm = P(Math.max(i - 1, 0), j, inner), pu = P(i, Math.min(j + 1, NA), inner), pd = P(i, Math.max(j - 1, 0), inner);
      const n = v3(pr[0] - pm[0], pr[1] - pm[1], pr[2] - pm[2]).cross(v3(pu[0] - pd[0], pu[1] - pd[1], pu[2] - pd[2]));
      if (n.lengthSq() < 1e-10) n.set(0, -dir, 0);
      n.normalize(); if (n.y * -dir < 0) n.negate();
      if (inner) n.negate();
      const band = 0.86 + 0.14 * Math.sin(p[3] * 38 + seed), rb = 0.5 + 0.5 * Math.sin(p[4] * 13 + seed);
      const c = inner ? [1.15, 1.12, 1.08] : [0.80 * band + 0.22 * rb, 0.86 * band + 0.18 * rb, 0.72 * band + 0.14 * rb];
      const w = top ? hinge(p) : p, nn = top ? turn(n) : [n.x, n.y, n.z];
      return V(w[0], w[1], w[2], nn[0], nn[1], nn[2], p[0] * 0.9 + 0.5, p[2] * 0.9 + 0.5, c);
    };
    for (let j = 0; j < NA; j++) for (let i = 0; i < NR; i++) for (const inner of [false, true]) {
      const a = vtx(i, j, inner);
      mbS.quad(a, vtx(i + 1, j, inner), vtx(i + 1, j + 1, inner), vtx(i, j + 1, inner), [a[3], a[4], a[5]]);
    }
  };
  valve(1, false); valve(-1, true);
  // 外套膜：沿着张开的缝绕一圈、上下起伏的肉唇；再往里收成一个深色的口
  const centre = v3(0, 0.07, -0.02);
  const loop = (k, f, dy = 0) => { const a = ((k % N) / N) * TAU; return v3(Math.cos(a) * RA * 0.86 * f, 0.07 + (0.065 * Math.sin(a * 4 + 1.3) + 0.04 * Math.sin(a * 7 + 0.4)) * f + dy, Math.sin(a) * RB * 0.80 * f - 0.02); };
  const frame = (k, f, dy) => { const t = loop(k + 1, f, dy).sub(loop(k - 1, f, dy)).normalize(), sd = v3().crossVectors(v3(0, 1, 0), t).normalize(); return { t, sd, nn: v3().crossVectors(t, sd) }; };
  const ringV = (k, m, f, dy, rad, col) => {
    const p = loop(k, f, dy), { sd, nn } = frame(k, f, dy), an = (m / 8) * TAU, d = sd.clone().multiplyScalar(Math.cos(an)).addScaledVector(nn, Math.sin(an) * 1.25), dn = sd.clone().multiplyScalar(Math.cos(an)).addScaledVector(nn, Math.sin(an) / 1.25).normalize();   // 截面是椭圆：法线垂直于椭圆面
    return V(p.x + d.x * rad, p.y + d.y * rad, p.z + d.z * rad, dn.x, dn.y, dn.z, ((k % N) / N) * 2, m / 8, col);
  };
  for (let k = 0; k < N; k++) for (let m = 0; m < 8; m++) mbM.quad(ringV(k, m, 1, 0, 0.12, [1, 1, 1]), ringV(k + 1, m, 1, 0, 0.12, [1, 1, 1]), ringV(k + 1, m + 1, 1, 0, 0.12, [1, 1, 1]), ringV(k, m + 1, 1, 0, 0.12, [1, 1, 1]), loop(k, 1).sub(centre));
  const dark = [0.10, 0.12, 0.16];
  const lipV = (k, f, dy, m) => { const p = loop(k, f, dy), { nn } = frame(k, f, dy); return V(p.x, p.y, p.z, nn.x, nn.y, nn.z, ((k % N) / N) * 2, m, dark); };
  for (let k = 0; k < N; k++) mbM.quad(lipV(k, 0.90, -0.07, 0), lipV(k + 1, 0.90, -0.07, 0), lipV(k + 1, 0.40, -0.20, 1), lipV(k, 0.40, -0.20, 1), [0, 1, 0]);
  return { shell: mbS.build(), mantle: mbM.build() };
}

/** 海胆：一个黑球，插满刺 */
export function urchin(seed = 1) {
  const r = mulberry32(seed * 211 + 13), mb = meshBuilder();
  blob(mb, { seg: 12, rings: 8, radius: () => 0.30, col: () => [0.5, 0.5, 0.5] });
  for (let k = 0; k < 52; k++) {
    const a = r() * TAU, b = Math.acos(1 - r() * 1.05), d = v3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)), len = 0.72 + r() * 0.36, ph = r();   // 刺朝上半球伸（最多离竖直 93°）
    tube(mb, [d.clone().multiplyScalar(0.24), d.clone().multiplyScalar(len)], [0.014, 0.003], { sides: 3, col: (i, t) => [0.8 + 0.5 * t, 0.78 + 0.5 * t, 0.8 + 0.5 * t], extra: () => [0.25, ph, 0] });
  }
  return mb.build();
}

/** 海星：五条腕从中间的盘伸出去，背面鼓成一座小丘（中间高、腕尖薄），皮上有小疙瘩。底面朝下贴在沙上 */
export function star(seed = 1) {
  const rot = seed * 0.7, mb = meshBuilder(), curl = seed % 5, len = [0.84, 1.1, 0.96, 1.04, 0.9].map((v) => v * (0.94 + 0.12 * ((seed * 7) % 5) / 4));
  const armK = (a) => ((Math.floor(((a + rot) * 2.5) / Math.PI + 0.5) % 5) + 5) % 5;                    // 第几条腕
  const arm = (a) => 0.22 + 0.78 * len[armK(a)] * Math.pow(Math.abs(Math.cos((a + rot) * 2.5)), 0.85) * (1 + 0.035 * Math.sin(a * 19 + seed));   // 五条腕长短不一，尖是圆的
  const top = (t, a) => {
    const rr = arm(a) * t, lift = armK(a) === curl ? 0.2 * t * t * t : 0, h = 0.17 * (1 - 0.72 * t) * Math.pow(1 - t * t, 0.55) + 0.014 * Math.sin(a * 46 + t * 38) * t * (1 - t) * 4;   // 皮上的小疙瘩；有一条腕的尖翘起来
    return [rr * Math.cos(a) * (1 - lift * 0.5), 0.012 + h + lift, rr * Math.sin(a) * (1 - lift * 0.5)];
  };
  paramSurface(mb, (u, v) => top(1 - u, v * TAU), 12, 72, { ref: (u, v) => [0, 1, 0], col: (u, v) => { const k = 0.8 + 0.2 * (1 - u) + 0.06 * Math.sin(v * TAU * 46); return [k, k, k]; } });
  paramSurface(mb, (u, v) => { const a = v * TAU, rr = arm(a) * (1 - u) * 0.985; return [rr * Math.cos(a), 0.012 * (1 - u * 0.9), rr * Math.sin(a)]; }, 2, 72, { ref: () => [0, -1, 0], col: () => [0.55, 0.55, 0.55] });   // 底面
  return mb.build();
}

/** 藻丛：一把从一点散开的叶片，会摇 */
export function weed(seed = 1) {
  const r = mulberry32(seed * 251 + 17), mb = meshBuilder(), n = 9 + ((r() * 5) | 0), base = [0.30, 0.34, 0.10], tip = [1.05, 1.15, 0.45];
  for (let k = 0; k < n; k++) {
    const a = r() * TAU, tilt = 0.35 + r() * 0.7, len = 0.5 + r() * 0.7, ph = r(), dir = v3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt)), side = v3(-Math.sin(a), 0, Math.cos(a));
    const pts = [], w = [];
    for (let i = 0; i <= 4; i++) { const t = i / 4; pts.push(dir.clone().multiplyScalar(len * t).add(v3(0, -0.08 * t * t * len, 0))); w.push(0.045 * (1 - t * 0.75) * (0.6 + 0.4 * Math.sin(t * Math.PI)) + 0.006); }
    ribbon(mb, pts, w, pts.map(() => side), (i, t) => mixc(base, tip, t), { crease: 0.35, extra: (i, t) => [t * t, ph, 0] });
  }
  return mb.build();
}

/** 海鞭：几根细长的、略弯的鞭子，会摇 */
export function whip(seed = 1) {
  const r = mulberry32(seed * 271 + 19), mb = meshBuilder(), n = 4 + ((r() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const a = r() * TAU, br = r() * 0.14, h = 1.0 + r() * 0.8, ph = r(), bend = 0.1 + r() * 0.2, w1 = 0.05 + r() * 0.08, w2 = r() * TAU, pts = [];
    for (let i = 0; i <= 7; i++) { const t = i / 7, sway = w1 * Math.sin(t * 3.2 + w2) * t; pts.push(v3(Math.cos(a) * (br + bend * t * t) + Math.cos(w2) * sway, h * t - 0.05, Math.sin(a) * (br + bend * t * t) + Math.sin(w2) * sway)); }
    tube(mb, pts, [0.030, 0.027, 0.024, 0.021, 0.018, 0.014, 0.010, 0.006], { sides: 4, col: (i, t) => [0.6 + 0.45 * t, 0.6 + 0.45 * t, 0.6 + 0.45 * t], cap: 'tip', tipLen: 0.03, extra: (i, t) => [t, ph, 0] });
  }
  return mb.build();
}

/** 各色的调色板（线性）。水把红光吃掉以后，这些颜色在深处会偏暗、偏青——所以取得比岸上饱和 */
export const PAL = {
  staghorn: [[0.45, 0.22, 0.06], [0.60, 0.34, 0.10], [0.28, 0.08, 0.26], [0.06, 0.12, 0.42], [0.16, 0.36, 0.08], [0.66, 0.24, 0.05], [0.50, 0.44, 0.10], [0.36, 0.14, 0.36]],
  table: [[0.42, 0.22, 0.08], [0.26, 0.07, 0.30], [0.12, 0.30, 0.12], [0.50, 0.36, 0.10]],
  brain: [[0.44, 0.42, 0.08], [0.52, 0.36, 0.14], [0.09, 0.28, 0.10], [0.54, 0.20, 0.05], [0.16, 0.22, 0.30], [0.50, 0.12, 0.20], [0.30, 0.30, 0.26]],
  tube: [[0.76, 0.50, 0.04], [0.72, 0.22, 0.03], [0.26, 0.05, 0.36], [0.58, 0.06, 0.05]],
  barrel: [[0.36, 0.07, 0.04], [0.17, 0.07, 0.20]],
  fingers: [[0.62, 0.52, 0.16], [0.30, 0.44, 0.14], [0.52, 0.22, 0.24]],
  fan: [[0.30, 0.05, 0.36], [0.56, 0.05, 0.06], [0.70, 0.26, 0.03], [0.70, 0.55, 0.06], [0.66, 0.60, 0.56]],
  anemone: [[0.52, 0.05, 0.40], [0.72, 0.12, 0.04], [0.20, 0.55, 0.16], [0.30, 0.40, 0.62]],
  clam: [[0.62, 0.66, 0.40], [0.50, 0.56, 0.50]],
  urchin: [[0.06, 0.02, 0.10], [0.03, 0.03, 0.03], [0.26, 0.05, 0.03]],
  star: [[0.76, 0.25, 0.03], [0.62, 0.06, 0.04], [0.05, 0.15, 0.55], [0.72, 0.55, 0.06]],
  weed: [[0.05, 0.22, 0.05], [0.10, 0.30, 0.06], [0.26, 0.05, 0.04], [0.20, 0.24, 0.04]],
  whip: [[0.62, 0.06, 0.05], [0.70, 0.24, 0.03], [0.30, 0.05, 0.36], [0.72, 0.58, 0.06]],
};

/**
 * 生物的材质。L：lifeTextures()；sway：createSway()（会摇的几种挂上去）
 * @returns {{ staghorn, massive, sponge, soft, fan, shell, mantle, weed }} 材质 + 各自的 uv 尺度
 */
export function coralMaterials(W, L, sway) {
  const tex = (T, o = {}) => W.material({ map: T.map, normalMap: T.normalMap, roughnessMap: T.ormMap, aoMap: T.ormMap, metalnessMap: T.ormMap, ...o });
  const M = {
    staghorn: tex(L.polyp, { roughness: 0.72 }),
    massive: tex(L.brain, { roughness: 0.74 }),                                                         // 附生的一层壳：沟回在贴图里
    brain: tex(L.polyp, { roughness: 0.74 }),                                                              // 脑珊瑚：脊是几何，贴图只是细小的珊瑚虫凸点
    sponge: tex(L.sponge, { roughness: 0.85, side: THREE.DoubleSide }),
    fingers: sway.patch(tex(L.polyp, { roughness: 0.7, side: THREE.DoubleSide, leaf: 0.5 }), 0.07, 1.0),
    fan: sway.patch(W.material({ map: L.fan, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8, leaf: 0.7 }), 0.16, 0.8),
    soft: sway.patch(W.material({ color: 0xffffff, roughness: 0.55, side: THREE.DoubleSide, leaf: 0.4 }), 0.07, 1.5),
    shell: tex(L.polyp, { roughness: 0.42 }),
    mantle: W.material({ map: L.mantle, color: 0xffffff, roughness: 0.28, emissive: 0xffffff, emissiveMap: L.mantle, emissiveIntensity: 0.10, side: THREE.DoubleSide }),
    weed: sway.patch(W.material({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide, leaf: 0.6 }), 0.20, 1.1),
    whip: sway.patch(W.material({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide, leaf: 0.4 }), 0.12, 0.9),
    star: tex(L.polyp, { roughness: 0.55 }),
    urchin: W.material({ color: 0xffffff, roughness: 0.45, side: THREE.DoubleSide }),
  };
  return M;
}
