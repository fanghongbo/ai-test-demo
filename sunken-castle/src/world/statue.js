// 石像：拄着三叉戟而立的海之王。长袍、躯干、肩、手臂、手指、头、胡子、头发写成一个符号距离场，网格化成石头——
// 像从一整块大理石里雕出来的，肩和手臂之间没有拼接的缝，衣褶、胸肌、眼窝都是在这个场里鼓出来、挖进去的；凹进去的地方用顶点色压暗。
// 披风是两层面料，王冠、腰带、肩上的胸针、青铜的三叉戟是单独的件。
// 几何只算一次（脚底在 y = 0、脸朝局部 +z，连戟尖约 7 米）。南门的守望者、喷泉上的小像、断崖边的巨像是它的不同倍率。
import * as THREE from 'three';
import { edgeTable, triTable } from 'three/addons/objects/MarchingCubes.js';
import { meshBuilder, paramSurface, tube, blob, mergeParts, noise3 } from '../gfx/organic.js';

const TAU = Math.PI * 2;
const smooth = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const grey = (k) => () => [k, k, k];
const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
const bump = (r) => (r > 1 || r < -1 ? 0 : (1 - r * r) ** 2);                    // 钟形的鼓包：中间 1，两头收到 0

/** 平滑的并、平滑的挖：k 是过渡带的宽度（米） */
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.max(a, b) + h * h * k * 0.25; };
const inBall = (px, py, pz, cx, cy, cz, r2) => { const x = px - cx, y = py - cy, z = pz - cz; return x * x + y * y + z * z < r2; };

/** 椭球 */
function ell(px, py, pz, cx, cy, cz, rx, ry, rz) {
  const x = (px - cx) / rx, y = (py - cy) / ry, z = (pz - cz) / rz, k0 = Math.sqrt(x * x + y * y + z * z);
  if (k0 < 1e-6) return -Math.min(rx, ry, rz);
  return (k0 * (k0 - 1)) / Math.sqrt((x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz));
}

/** 两头粗细不同的圆台，两端是球面（Inigo Quilez 的 sdRoundCone）。用在手臂、手指、鼻梁、眉弓、锁骨上 */
function cone(px, py, pz, ax, ay, az, bx, by, bz, r1, r2) {
  const ux = bx - ax, uy = by - ay, uz = bz - az, l2 = ux * ux + uy * uy + uz * uz, dr = r1 - r2, a2 = l2 - dr * dr, il2 = 1 / l2;
  const wx = px - ax, wy = py - ay, wz = pz - az, t = wx * ux + wy * uy + wz * uz, s = t - l2;
  const ex = wx * l2 - ux * t, ey = wy * l2 - uy * t, ez = wz * l2 - uz * t, x2 = ex * ex + ey * ey + ez * ez, y2 = t * t * l2, z2 = s * s * l2, k = sign(dr) * dr * dr * x2;
  if (sign(s) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (sign(t) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + t * dr) * il2 - r1;
}

/** 二维的值噪声（可平铺的格点哈希 + 双线性插值），范围约 -1..1。衣褶上的风化凹凸用 */
function noise2(x, y, seed) {
  const hash = (i, j) => { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(seed, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 2147483647.5 - 1; };
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** 掌上的明珠：中心（石像自己的坐标）和半径。左手的手指就是贴着它弯的 */
const PEARL = [0.47, 4.17, 0.72], PEARL_R = 0.155;

/** 长袍的半宽（横向、前后），按高度查表：下摆宽、腰细、肩宽，往上收成脖子 */
const PROF = [[0.06, 0.80, 0.62], [0.6, 0.70, 0.52], [1.4, 0.60, 0.44], [2.2, 0.53, 0.40], [2.95, 0.50, 0.38], [3.25, 0.47, 0.36], [3.9, 0.60, 0.42], [4.3, 0.64, 0.38], [4.62, 0.50, 0.30], [4.82, 0.24, 0.215], [5.0, 0.19, 0.185]];
function radiiRaw(y, out) {
  let i = 0;
  while (i < PROF.length - 2 && y > PROF[i + 1][0]) i++;
  const a = PROF[i], b = PROF[i + 1], u = smooth(0, 1, (y - a[0]) / (b[0] - a[0]));
  out[0] = a[1] + (b[1] - a[1]) * u; out[1] = a[2] + (b[2] - a[2]) * u;
}
const topBlend = (y) => smooth(4.3, 4.85, y);
/** 半宽和截面中心的偏移，按 0.5 毫米一步预先算成表：场要算一百多万次，查表比每次现算快 */
const YMIN = -0.1, STEP = 2000, PROF4 = new Float64Array((Math.ceil((5.3 - YMIN) * STEP) + 2) * 4);
for (let i = 0; i * 4 < PROF4.length; i++) {
  const y = YMIN + i / STEP, o = [0, 0], q = i * 4;
  radiiRaw(y, o);
  PROF4[q] = o[0]; PROF4[q + 1] = o[1];
  PROF4[q + 2] = 0.06 * Math.sin((y / 4.6) * Math.PI) * (1 - topBlend(y));                               // 重心略偏一侧：胯和肩错开；到了脖子上回到中轴
  PROF4[q + 3] = (-0.05 * smooth(3.0, 4.7, y)) * (1 - topBlend(y)) + 0.03 * topBlend(y);               // 上身微微后仰
}
/** 查表：out = [横向半宽, 前后半宽, 中心偏 x, 中心偏 z] */
function look(y, out) {
  const f = (Math.min(5.3, Math.max(YMIN, y)) - YMIN) * STEP, i = f | 0, q = i * 4, t = f - i;
  out[0] = PROF4[q] + (PROF4[q + 4] - PROF4[q]) * t; out[1] = PROF4[q + 1] + (PROF4[q + 5] - PROF4[q + 1]) * t;
  out[2] = PROF4[q + 2] + (PROF4[q + 6] - PROF4[q + 2]) * t; out[3] = PROF4[q + 3] + (PROF4[q + 7] - PROF4[q + 3]) * t;
}
const R4 = [0, 0, 0, 0];
const radii = (y) => { look(Math.max(0.06, Math.min(5.0, y)), R4); return [R4[0], R4[1]]; };
const shiftX = (y) => { look(y, R4); return R4[2]; }, shiftZ = (y) => { look(y, R4); return R4[3]; };

/**
 * 胸腹（只在前面、腰带以上）：两片平缓的胸肌、乳尖、胸骨中间宽而浅的沟、微微鼓起的肚子和肚脐。只有宽而缓的起伏——又窄又浅的沟在网格上是锯齿。
 * 腰带以上是光着的上身，腰带以下才是长袍
 * @param {number} y 高度
 * @param {number} a 绕着身子的角度（0 = 正前）
 * @return {number} 往外鼓多少（米）
 */
function torso(y, a) {
  const t = Math.abs(a);
  if (t > 1.5 || y < 3.33 || y > 4.5) return 0;
  const X = 0.5 * a, ay = (y - 4.07) / 0.14, mid = smooth(3.46, 3.56, y) * (1 - smooth(3.9, 3.98, y));
  let d = 0;
  for (const s of [-1, 1]) {
    const cx = (X - s * 0.24) / 0.24, k = clamp01(1 - cx * cx - ay * ay);
    d += 0.017 * k * k * (3 - 2 * k) + 0.011 * bump(Math.hypot(X - s * 0.22, y - 3.985) / 0.045);                 // 胸肌（一片平缓的鼓起）、乳尖
  }
  return smooth(1.5, 1.25, t) * (d - 0.01 * bump(X / 0.07) * smooth(3.95, 4.02, y) * (1 - smooth(4.2, 4.27, y))   // 胸骨：一条宽而浅的沟
    + 0.01 * clamp01(1 - (X / 0.17) ** 2) * mid - 0.012 * bump(Math.hypot(X, y - 3.46) / 0.045));                // 肚子、肚脐
}
/** 衣褶：下摆深、上面浅，九道竖着垂下来的大褶（谷是尖的、脊是圆的）；胯上斜着一圈；腰带底下布料堆出来一道；再带一点风化的凹凸 */
function folds(y, a, u) {
  const t = Math.max(0, 1 - u), s = Math.sqrt(t), hip = smooth(2.5, 2.9, y) * (1 - smooth(3.3, 3.7, y));
  const flute = Math.sqrt(Math.sqrt((1 - Math.cos(9 * a + 1.2 * Math.sin(u * 6))) / 2));                                             // |sin(φ/2)| 的开方：0..1，谷是尖的
  return 0.085 * t * Math.sqrt(s) * (flute - 0.62) + 0.012 * s * Math.sin(23 * a + u * 9) + 0.024 * hip * Math.sin(12 * a + y * 3.4)
    + 0.035 * bump((y - 3.14) / 0.2) + 0.014 * noise2(a * 2.5, y * 1.8, 3);
}

/** 右手（-x 那边）：握着戟杆。戟杆是竖着的，手指一根压着一根绕到杆子的另一头去 */
function rightHand(px, py, pz, d) {
  d = smin(d, ell(px, py, pz, -0.9, 2.99, 0.33, 0.1, 0.17, 0.13), 0.03);
  for (let k = 0; k < 4; k++) {
    const yy = 3.11 - k * 0.07, r = 0.031 - k * 0.001;
    if (!inBall(px, py, pz, -0.985, yy, 0.36, 0.0166)) continue;
    for (let s = 0; s < 4; s++) {
      const t0 = -0.4 + s * 1.075, t1 = t0 + 1.075;
      d = smin(d, cone(px, py, pz, -0.985 + Math.cos(t0) * 0.086, yy, 0.36 + Math.sin(t0) * 0.086, -0.985 + Math.cos(t1) * 0.086, yy - 0.004, 0.36 + Math.sin(t1) * 0.086, r, r * 0.92), 0.012);
    }
  }
  if (inBall(px, py, pz, -0.917, 3.15, 0.445, 0.0196)) d = smin(d, cone(px, py, pz, -0.93, 3.07, 0.44, -0.905, 3.23, 0.45, 0.04, 0.03), 0.02);   // 拇指贴着杆子朝上
  return d;
}
/** 左手：摊开托着明珠。手指贴着珠子的下缘往前、往上拢，拇指顺着珠子的一侧 */
function leftHand(px, py, pz, d) {
  d = smin(d, ell(px, py, pz, 0.47, 3.985, 0.62, 0.2, 0.075, 0.19), 0.03);
  for (let k = 0; k < 4; k++) {
    const x = 0.47 + (k - 1.5) * 0.08;
    if (inBall(px, py, pz, x, 4.073, 0.882, 0.0272)) {
      for (let s = 0; s < 3; s++) {
        const t0 = (26 + s * 22) * Math.PI / 180, t1 = (26 + (s + 1) * 22) * Math.PI / 180;
        const [bx, by, bz] = PEARL, R = PEARL_R + 0.034;
        d = smin(d, cone(px, py, pz, x, by - R * Math.cos(t0), bz + R * Math.sin(t0), x + s * 0.006, by - R * Math.cos(t1), bz + R * Math.sin(t1), 0.04 - s * 0.004, 0.036 - s * 0.003), 0.018);   // 手指的中心线在离珠心 0.189 米的弧上
      }
    }
  }
  if (inBall(px, py, pz, 0.285, 4.06, 0.72, 0.04)) {
    d = smin(d, cone(px, py, pz, 0.29, 3.985, 0.6, 0.28, 4.07, 0.76, 0.042, 0.038), 0.02);
    d = smin(d, cone(px, py, pz, 0.28, 4.07, 0.76, 0.28, 4.13, 0.84, 0.038, 0.032), 0.015);
  }
  return d;
}

/** 头：颅顶连着下颌；脸上长着眉骨、眼窝、颧骨、鼻子、两撇胡子和一绺一绺的大胡子；头发扣在颅顶、后面披到颈后。
 *  每一样东西只有落在它的包围球里才算（头这一块要算二十来万次） */
function head(px, py, pz) {
  let h = smin(ell(px, py, pz, 0, 5.27, -0.01, 0.30, 0.33, 0.35), ell(px, py, pz, 0, 5.08, 0.1, 0.235, 0.21, 0.25), 0.06);
  if (pz > 0.12 && py < 5.42) {
    if (inBall(px, py, pz, 0, 5.22, 0.385, 0.0361)) h = smin(h, cone(px, py, pz, 0, 5.33, 0.34, 0, 5.115, 0.425, 0.048, 0.052), 0.018);                 // 鼻子
    if (inBall(px, py, pz, 0, 5.02, 0.355, 0.0121)) {
      h = smin(h, cone(px, py, pz, -0.072, 5.042, 0.352, 0.072, 5.042, 0.352, 0.017, 0.017), 0.012);                                                     // 上唇
      h = smin(h, ell(px, py, pz, 0, 5.0, 0.35, 0.058, 0.015, 0.022), 0.012);                                                                            // 下唇
      h = smax(h, -cone(px, py, pz, -0.066, 5.022, 0.362, 0.066, 5.022, 0.362, 0.0095, 0.0095), 0.006);                                                 // 嘴缝
    }
    for (const s of [-1, 1]) {
      if (inBall(px, py, pz, s * 0.045, 5.118, 0.395, 0.0036)) h = smin(h, ell(px, py, pz, s * 0.045, 5.118, 0.395, 0.03, 0.026, 0.03), 0.022);         // 鼻翼
      if (inBall(px, py, pz, s * 0.185, 5.17, 0.22, 0.017)) h = smin(h, ell(px, py, pz, s * 0.185, 5.17, 0.22, 0.1, 0.062, 0.095), 0.03);             // 颧骨
      if (inBall(px, py, pz, s * 0.095, 5.3175, 0.3175, 0.0247)) h = smin(h, cone(px, py, pz, 0, 5.33, 0.35, s * 0.19, 5.305, 0.285, 0.034, 0.026), 0.022);   // 眉骨
      if (inBall(px, py, pz, s * 0.1215, 5.0425, 0.396, 0.0324)) h = smin(h, cone(px, py, pz, s * 0.028, 5.085, 0.432, s * 0.215, 5.0, 0.36, 0.046, 0.02), 0.024);   // 两撇胡子
      if (inBall(px, py, pz, s * 0.108, 5.255, 0.345, 0.0081)) h = smax(h, -ell(px, py, pz, s * 0.108, 5.255, 0.345, 0.072, 0.042, 0.062), 0.01);       // 眼窝：挖空的
    }
    if (inBall(px, py, pz, 0, 5.07, 0.26, 0.1225)) {
      const ba = Math.atan2(px, pz - 0.3);
      const beard = ell(px, py, pz, 0, 5.07, 0.26, 0.215, 0.3, 0.17) + 0.014 * Math.sin(ba * 16 + 1.6 * Math.sin(py * 16)) + 0.004 * Math.sin(py * 70);
      h = smin(h, smax(beard, -ell(px, py, pz, 0, 5.22, 0.54, 0.26, 0.26, 0.26), 0.015), 0.03);                                                         // 大胡子：一绺一绺竖着长，嘴、嘴唇和下巴尖留出来
    }
  }
  for (const s of [-1, 1]) if (inBall(px, py, pz, s * 0.3, 5.21, -0.01, 0.0096)) h = smin(h, ell(px, py, pz, s * 0.3, 5.21, -0.01, 0.032, 0.078, 0.052), 0.02);   // 耳朵
  const ph = Math.acos(Math.max(-1, Math.min(1, (py - 5.25) / 0.4))), ha = Math.atan2(px, pz - 0.03);
  let hair = ell(px, py, pz, 0, 5.25, 0.03, 0.355, 0.4, 0.36) + 0.03 * Math.sin(ha * 13 + 1.4 * Math.sin(ph * 6)) + 0.012 * Math.sin(ha * 27 + ph * 9);   // 颅顶：一卷一卷
  const sc = 0.45 + 0.55 * smooth(0.2, -0.6, Math.cos(ha));                                                                         // 后脑勺这一片：正后方最厚，往两边、往脸那一面缩进脖子和头里
  hair = smin(hair, ell(px, py, pz, 0, 5.17, -0.06, 0.375 * sc, 0.42 * sc, 0.36 * sc) + 0.02 * sc * Math.sin(ha * 9 + py * 14), 0.04);   // 披到颈后
  hair = smax(hair, (5.29 - py) * smooth(-0.22, -0.12, pz) * (1 - smooth(0.1, 0.2, pz)), 0.05);                                     // 耳朵那一片：头发只长到耳朵上沿
  hair = smax(hair, (5.19 - py) * smooth(0.06, 0.16, pz) * (1 - smooth(0.34, 0.44, pz)), 0.03);                                     // 耳朵前面也是：鬓角收干净
  hair = smax(hair, -ell(px, py, pz, 0, 5.2, 0.42, 0.46, 0.31, 0.31), 0.03);                                                         // 脸上不长头发
  return smin(h, smax(hair, py - 5.72, 0.03), 0.015);
}

/**
 * 身体的符号距离场（小于 0 在石头里面）。长袍连着躯干，肩上接手臂，脖子上顶着头。
 * 离得远的部位直接跳过不算（整个网格要算几十万次）。测试里拿它检查里外。
 */
export function statueField(px, py, pz) {
  const y = py < 0.06 ? 0.06 : py > 5.0 ? 5.0 : py;
  look(y, R4);
  const dx = px - R4[2], dz = pz - R4[3], rr = dx * dx + dz * dz;
  let d = rr === 0 ? -R4[0] : Math.sqrt(rr) * (1 - 1 / Math.sqrt((dx * dx) / (R4[0] * R4[0]) + (dz * dz) / (R4[1] * R4[1])));   // 长袍（连着躯干）：截面是椭圆
  if (py - 5.1 > d) d = py - 5.1;                                                                                             // 这根柱子到脖子里为止（上面是头，别伸出去）
  const near = d > -0.45 && d < 0.45;
  if (near || py < 0.3) {
    const a = Math.atan2(dx, dz);
    if (near) d -= torso(y, a) + folds(y, a, (y - 0.06) / 4.72);                                       // 贴着面的起伏：胸腹、衣褶
    if (py < 0.3) d = smax(d, 0.09 + 0.035 * (1 + Math.sin(9 * a + 0.6)) - py, 0.02);                    // 下摆：一垂一垂的
  }
  if (inBall(px, py, pz, 0.14, 1.95, 0.16, 0.64)) d = smin(d, ell(px, py, pz, 0.14, 1.95, 0.16, 0.27, 0.55, 0.3), 0.2);                                    // 袍子底下顶着的一条腿
  if (py < 0.75) for (const s of [-1, 1]) d = smin(d, ell(px, py, pz, s * 0.32 + 0.02, 0.12, 0.5, 0.21, 0.12, 0.27), 0.05);   // 从下摆里露出来的脚
  if (inBall(px, py, pz, -0.75, 3.8, 0.16, 1.21)) {                                                                        // 右臂垂下来
    d = smin(d, ell(px, py, pz, -0.6, 4.42, 0, 0.235, 0.25, 0.245), 0.1);                                                 // 肩头
    d = smin(d, cone(px, py, pz, -0.6, 4.42, 0.02, -0.86, 3.72, 0.1, 0.17, 0.135), 0.09);                               // 上臂
    d = smin(d, cone(px, py, pz, -0.86, 3.72, 0.1, -0.885, 3.16, 0.3, 0.135, 0.105), 0.05);                              // 小臂
  }
  if (inBall(px, py, pz, -0.95, 3.0, 0.37, 0.1764)) d = rightHand(px, py, pz, d);
  if (inBall(px, py, pz, 0.75, 4.0, 0.32, 1.21)) {                                                                         // 左臂抬起来
    d = smin(d, ell(px, py, pz, 0.6, 4.42, 0, 0.235, 0.25, 0.245), 0.1);
    d = smin(d, cone(px, py, pz, 0.6, 4.42, 0.02, 0.88, 3.66, 0.14, 0.17, 0.135), 0.09);
    d = smin(d, cone(px, py, pz, 0.88, 3.66, 0.14, 0.58, 3.95, 0.58, 0.135, 0.105), 0.05);
  }
  if (inBall(px, py, pz, 0.47, 4.05, 0.72, 0.1764)) d = leftHand(px, py, pz, d);
  if (inBall(px, py, pz, 0, 4.75, 0.03, 0.2025)) d = smin(d, cone(px, py, pz, 0, 4.5, 0.02, 0, 5.0, 0.03, 0.2, 0.185), 0.09);   // 脖子
  for (const s of [-1, 1]) if (inBall(px, py, pz, s * 0.275, 4.43, 0.225, 0.0576)) d = smin(d, cone(px, py, pz, s * 0.08, 4.415, 0.3, s * 0.5, 4.44, 0.145, 0.014, 0.011), 0.035);   // 锁骨
  if (inBall(px, py, pz, 0, 5.15, 0.02, 0.6084)) d = smin(d, head(px, py, pz), 0.05);
  return d;
}

// ───── 网格化 ─────
const CORN = [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]];   // 一个格子的八个角
const EDGE = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const X0 = -1.25, Y0 = 0, Z0 = -0.75, H = 0.03, AT = (k) => k * H;                                          // 身子的格子：3 厘米，原点在 (X0, Y0, Z0)
const BOX = [X0, Y0, Z0, X0 + AT(82), Y0 + AT(192), Z0 + AT(62)];
/**
 * 要细分的几块（格子是身子的一半）：腰带以上的整个上身——胸腹、两条胳膊、头、托珠的左手——是一块，握戟的右手是另一块。
 * carve：从身子上挖掉的窗口（窗口的面都落在身子的格线上）；box：细格子这一块自己的范围，比窗口往腰带底下、小臂上多伸两格；
 * off：多伸出来的那一段里把面往里收一点点（最多 5 毫米、到窗口的面收回到 0）——身子的粗面在那里露在外面，细格子伸进去把它断口上的毛边盖住。
 * 上身这一块的断口在腰带底下，右手这一块的断口和上身那一块互相伸进对方：看得见的地方没有接缝
 */
const WINDOWS = [
  { carve: [X0 + AT(4), Y0 + AT(110), Z0 + AT(9), X0 + AT(77), Y0 + AT(192), Z0 + AT(57)], box: [X0 + AT(4), Y0 + AT(108), Z0 + AT(9), X0 + AT(77), Y0 + AT(192), Z0 + AT(57)], off: (x, y) => 0.005 * (1 - smooth(3.255, 3.3, y)) },
  { carve: [X0 + AT(4), Y0 + AT(92), Z0 + AT(31), X0 + AT(17), Y0 + AT(110), Z0 + AT(42)], box: [X0 + AT(4), Y0 + AT(92), Z0 + AT(31), X0 + AT(17), Y0 + AT(112), Z0 + AT(42)], off: (x, y) => 0.005 * smooth(3.3, 3.345, y) },
];
/** 点到盒子的距离（在里面是负的） */
function sdBox(px, py, pz, b) {
  const x = Math.max(b[0] - px, px - b[3]), y = Math.max(b[1] - py, py - b[4]), z = Math.max(b[2] - pz, pz - b[5]);
  return Math.sqrt(Math.max(x, 0) ** 2 + Math.max(y, 0) ** 2 + Math.max(z, 0) ** 2) + Math.min(Math.max(x, y, z), 0);
}

/**
 * 步进方格：把一个固体的表面网格化。固体 = pure 的场（小于 0 在里面）再被 clip 限制（小于 0 才算在里面）。
 * 1. 先按 2×2×2 个格子一块粗看一遍：八个角都在一面、离面都远的块是实心的或者空着的，跳过去；
 * 2. 每个格子按查表连三角形（顶点都在格线上，所以面是闭合的），只留连成一大块的那部分——场里偶尔会挤出一个孤立的小珠子；
 * 3. 法线取场的梯度（从格点上的值差分出来），比拿三角形平均出来的细腻。paint(x, y, z, nx, ny, nz) 返回 [u, v, 灰度]
 * @param {number} [reach] 离面这么近的块要细算（米）。场不是严格的距离，衣褶、头发这些起伏大的地方梯度到两倍多，那里要放宽
 * @param {Function} [loose] 这一块里哪些高度上起伏大：返回 true 的地方用 4.5 个格，别处用 reach
 * @returns {THREE.BufferGeometry} 带索引的几何（位置、法线、UV、颜色）
 */
function meshField(pure, clip, box, h, paint, reach = 4.5 * h, loose = null) {
  const [x0, y0, z0] = box, nx = Math.round((box[3] - x0) / h), ny = Math.round((box[4] - y0) / h), nz = Math.round((box[5] - z0) / h);
  const NZ = nz + 1, NY = (ny + 1) * NZ, N = (nx + 1) * NY, wide = 4.5 * h;
  const X = new Float64Array(nx + 1), Y = new Float64Array(ny + 1), Z = new Float64Array(nz + 1);
  for (let i = 0; i <= nx; i++) X[i] = x0 + i * h;
  for (let j = 0; j <= ny; j++) Y[j] = y0 + j * h;
  for (let k = 0; k <= nz; k++) Z[k] = z0 + k * h;
  const V = new Float32Array(N).fill(NaN), P = new Float32Array(N).fill(NaN), need = new Uint8Array(N);   // 格点上的值：V 是固体的，P 是 pure 的（留着求法线）
  const val = (q, x, y, z) => { let v = V[q]; if (Number.isNaN(v)) { const p = pure(x, y, z); P[q] = p; v = V[q] = Math.max(p, clip(x, y, z)); } return v; };
  const pureAt = (q, x, y, z) => { let p = P[q]; if (Number.isNaN(p)) p = P[q] = pure(x, y, z); return p; };

  // 1. 粗看
  for (let bi = 0; bi < nx; bi += 2) {
    const xi = x0 + bi * h, xi2 = xi + 2 * h;
    for (let bj = 0; bj < ny; bj += 2) {
      const yj = y0 + bj * h, yj2 = yj + 2 * h, row = bi * NY + bj * NZ;
      for (let bk = 0; bk < nz; bk += 2) {
        const q = row + bk, zk = z0 + bk * h, zk2 = zk + 2 * h;
        const v0 = val(q, xi, yj, zk), v1 = val(q + 2 * NY, xi2, yj, zk), v2 = val(q + 2 * NY + 2, xi2, yj, zk2), v3 = val(q + 2, xi, yj, zk2);
        const v4 = val(q + 2 * NZ, xi, yj2, zk), v5 = val(q + 2 * NY + 2 * NZ, xi2, yj2, zk), v6 = val(q + 2 * NY + 2 * NZ + 2, xi2, yj2, zk2), v7 = val(q + 2 * NZ + 2, xi, yj2, zk2);
        let lo = v0, hi = v0;
        for (const v of [v1, v2, v3, v4, v5, v6, v7]) { if (v < lo) lo = v; if (v > hi) hi = v; }
        const near = loose && loose(yj + h) ? wide : reach;
        if (lo < near && hi > -near) for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) need.fill(1, q + i * NY + j * NZ, q + i * NY + j * NZ + 2);
      }
    }
  }
  const cells = new Int32Array(N);
  let nc = 0;
  for (let q = 0; q < N; q++) if (need[q]) cells[nc++] = q;

  // 2. 连三角形。顶点记在格线的边上（同一条边上的格子共用一个顶点）
  const ev = new Int32Array(N * 3).fill(-1), pos = [], idx = [], vA = [], vT = [], vAx = [], c = new Float64Array(8);
  for (let n = 0; n < nc; n++) {
    const base = cells[n], i = (base / NY) | 0, r = base - i * NY, j = (r / NZ) | 0, k = r - j * NZ, xi = X[i], yj = Y[j], zk = Z[k], xi2 = X[i + 1], yj2 = Y[j + 1], zk2 = Z[k + 1], q1 = base + NY, q3 = base + 1, q4 = base + NZ;
    c[0] = V[base]; if (c[0] !== c[0]) c[0] = V[base] = val(base, xi, yj, zk);
    c[1] = V[q1]; if (c[1] !== c[1]) c[1] = V[q1] = val(q1, xi2, yj, zk);
    c[2] = V[q1 + 1]; if (c[2] !== c[2]) c[2] = V[q1 + 1] = val(q1 + 1, xi2, yj, zk2);
    c[3] = V[q3]; if (c[3] !== c[3]) c[3] = V[q3] = val(q3, xi, yj, zk2);
    c[4] = V[q4]; if (c[4] !== c[4]) c[4] = V[q4] = val(q4, xi, yj2, zk);
    c[5] = V[q4 + NY]; if (c[5] !== c[5]) c[5] = V[q4 + NY] = val(q4 + NY, xi2, yj2, zk);
    c[6] = V[q4 + NY + 1]; if (c[6] !== c[6]) c[6] = V[q4 + NY + 1] = val(q4 + NY + 1, xi2, yj2, zk2);
    c[7] = V[q4 + 1]; if (c[7] !== c[7]) c[7] = V[q4 + 1] = val(q4 + 1, xi, yj2, zk2);
    const code = (c[0] < 0 ? 1 : 0) | (c[1] < 0 ? 2 : 0) | (c[2] < 0 ? 4 : 0) | (c[3] < 0 ? 8 : 0) | (c[4] < 0 ? 16 : 0) | (c[5] < 0 ? 32 : 0) | (c[6] < 0 ? 64 : 0) | (c[7] < 0 ? 128 : 0);
    if (code === 0 || code === 255) continue;
    for (let t = 0; triTable[code * 16 + t] !== -1; t += 3) for (let m = 0; m < 3; m++) {
      const e = triTable[code * 16 + t + m], da = CORN[EDGE[e][0]], db = CORN[EDGE[e][1]];
      const qa = base + da[0] * NY + da[1] * NZ + da[2], qb = base + db[0] * NY + db[1] * NZ + db[2], axis = da[0] !== db[0] ? 0 : da[1] !== db[1] ? 1 : 2, q = (qa < qb ? qa : qb) * 3 + axis;
      let id = ev[q];
      if (id < 0) {
        const u = c[EDGE[e][0]] / (c[EDGE[e][0]] - c[EDGE[e][1]]);
        pos.push(x0 + (i + da[0] + (db[0] - da[0]) * u) * h, y0 + (j + da[1] + (db[1] - da[1]) * u) * h, z0 + (k + da[2] + (db[2] - da[2]) * u) * h);
        id = pos.length / 3 - 1; ev[q] = id; vA.push(qa); vT.push(u); vAx.push(axis);
      }
      idx.push(id);
    }
  }
  // 只要连成一大块的那部分：场里偶尔会挤出一个孤立的小珠子（胡子梢、耳朵边的头发），不要
  const nv = pos.length / 3, parent = new Int32Array(nv);
  for (let v = 0; v < nv; v++) parent[v] = v;
  const find = (v) => { while (parent[v] !== v) v = parent[v] = parent[parent[v]]; return v; };
  for (let t = 0; t < idx.length; t += 3) { const a = find(idx[t]), b = find(idx[t + 1]); if (a !== b) parent[a] = b; const c2 = find(idx[t + 2]); if (c2 !== find(idx[t])) parent[c2] = find(idx[t]); }
  const size = new Int32Array(nv);
  for (let v = 0; v < nv; v++) size[find(v)]++;
  let main = 0, w = 0;
  for (let v = 0; v < nv; v++) if (size[v] > size[main]) main = v;
  for (let t = 0; t < idx.length; t += 3) { if (find(idx[t]) !== main) continue; idx[w++] = idx[t]; idx[w++] = idx[t + 1]; idx[w++] = idx[t + 2]; }
  idx.length = w;

  // 法线：格点上的值差分出来的梯度（顶点所在那条边的两端各求一次，再按位置插值）；颜色、贴图坐标
  const NRM = new Float32Array(nv * 3), UVQ = new Float32Array(nv * 2), COL = new Float32Array(nv * 3), g = new Float64Array(3), g2 = new Float64Array(3);
  const grad = (q, out) => {
    const i = (q / NY) | 0, r = q - i * NY, j = (r / NZ) | 0, k = r - j * NZ, x = x0 + i * h, y = y0 + j * h, z = z0 + k * h;
    const i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, nx), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, ny), k0 = Math.max(k - 1, 0), k1 = Math.min(k + 1, nz);
    out[0] = (pureAt(i1 * NY + j * NZ + k, x0 + i1 * h, y, z) - pureAt(i0 * NY + j * NZ + k, x0 + i0 * h, y, z)) / ((i1 - i0) * h);
    out[1] = (pureAt(i * NY + j1 * NZ + k, x, y0 + j1 * h, z) - pureAt(i * NY + j0 * NZ + k, x, y0 + j0 * h, z)) / ((j1 - j0) * h);
    out[2] = (pureAt(i * NY + j * NZ + k1, x, y, z0 + k1 * h) - pureAt(i * NY + j * NZ + k0, x, y, z0 + k0 * h)) / ((k1 - k0) * h);
  };
  for (let v = 0; v < nv; v++) {
    const a = vA[v], qb = a + (vAx[v] === 0 ? NY : vAx[v] === 1 ? NZ : 1), t = vT[v];
    grad(a, g); grad(qb, g2);
    let gx = g[0] + (g2[0] - g[0]) * t, gy = g[1] + (g2[1] - g[1]) * t, gz = g[2] + (g2[2] - g[2]) * t;
    const l = Math.sqrt(gx * gx + gy * gy + gz * gz);
    if (l > 1e-9) { gx /= l; gy /= l; gz /= l; } else { gx = 0; gy = 1; gz = 0; }
    NRM[v * 3] = gx; NRM[v * 3 + 1] = gy; NRM[v * 3 + 2] = gz;
    const q = paint(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2], gx, gy, gz);
    UVQ[v * 2] = q[0]; UVQ[v * 2 + 1] = q[1]; COL[v * 3] = COL[v * 3 + 1] = COL[v * 3 + 2] = q[2];
  }
  // 绕向：面的法线该和顶点法线大体同向，多数相反就全部翻过来
  const facing = (a, b, c2) => { const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2], wx = pos[c2 * 3] - pos[a * 3], wy = pos[c2 * 3 + 1] - pos[a * 3 + 1], wz = pos[c2 * 3 + 2] - pos[a * 3 + 2], n = a * 3; return ux * (wy * NRM[n + 2] - wz * NRM[n + 1]) + uy * (wz * NRM[n] - wx * NRM[n + 2]) + uz * (wx * NRM[n + 1] - wy * NRM[n]) >= 0; };
  let agree = 0;
  for (let t = 0; t < Math.min(idx.length, 600); t += 3) agree += facing(idx[t], idx[t + 1], idx[t + 2]) ? 1 : -1;
  if (agree < 0) for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }

  const gout = new THREE.BufferGeometry();
  gout.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  gout.setAttribute('normal', new THREE.BufferAttribute(NRM, 3));
  gout.setAttribute('uv', new THREE.BufferAttribute(UVQ, 2));
  gout.setAttribute('color', new THREE.BufferAttribute(COL, 3));
  gout.setIndex(idx);
  return gout;
}

let PIECES = null;
/**
 * 身体的三块石头：腰带以下的身子（3 厘米的格子，挖掉两个窗口），加上窗口里的上身和右手（1.5 厘米的格子）。
 * 每一块都是闭着的。凹进去的地方（衣褶的沟、脖根、腋下、眼窝、胡子底下）用顶点色压暗，再带一点深浅不匀的风化色
 * @param {number} tile 大理石贴图铺几米
 */
export function bodyPieces(tile) {
  if (PIECES) return PIECES;
  const paint = (x, y, z, nx, ny, nz) => {
    const cavity = statueField(x + nx * 0.09, y + ny * 0.09, z + nz * 0.09) / 0.09, k = Math.min(1.04, Math.max(0.56, 0.68 + 0.32 * cavity)) * (0.92 + 0.08 * noise3(x * 3, y * 0.6, z * 3, 21));
    return [(Math.atan2(x, z) * 0.4) / tile, y / tile, k];
  };
  const f = H / 2, grow = (b) => [b[0] - f, b[1] - f, b[2] - f, b[3] + f, b[4] + f, b[5] + f];
  const carve = (x, y, z) => -Math.min(...WINDOWS.map((w) => sdBox(x, y, z, w.carve))), chunk = (w, reach, loose) => meshField((x, y, z) => statueField(x, y, z) + w.off(x, y, z), (x, y, z) => sdBox(x, y, z, w.box), grow(w.box), f, paint, reach, loose);
  PIECES = [meshField(statueField, carve, BOX, H, paint, 3.8 * H), chunk(WINDOWS[0], 3.2 * f, (y) => y > 4.85), chunk(WINDOWS[1])];
  return PIECES;
}

const scaleUV = (g, su, sv) => { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return g; };
/** 一块部件：单独建出来，缩放、转、挪位，UV 换成“一张贴图铺几米”的单位 */
function part(list, build, o = {}) {
  const mb = meshBuilder(); build(mb); const g = mb.build();
  if (o.scale) g.scale(o.scale[0], o.scale[1], o.scale[2]);
  if (o.rx) g.rotateX(o.rx);
  if (o.pos) g.translate(o.pos[0], o.pos[1], o.pos[2]);
  if (o.uv) scaleUV(g, o.uv[0], o.uv[1]);
  list.push(g);
}
/** 椭球。r：三个半径 */
const ellipsoid = (list, r, pos, tile, col = 1) => part(list, (mb) => blob(mb, { seg: 24, rings: 14, radius: () => 1, col: grey(col) }), { scale: r, pos, uv: [TAU * (r[0] + r[2]) * 0.5 / tile, Math.PI * r[1] / tile] });
/** 一根管子。pts：Vector3[]，r：每一点的半径（或者一个数） */
function pipe(list, pts, r, tile, o = {}) {
  const n = pts.length, rr = Array.isArray(r) ? r : Array(n).fill(r);
  let len = 0;
  for (let i = 1; i < n; i++) len += pts[i].distanceTo(pts[i - 1]);
  part(list, (mb) => tube(mb, pts, rr, { sides: o.sides ?? 12, cap: o.cap, tipLen: o.tipLen }), { uv: [TAU * (rr.reduce((a, b) => a + b, 0) / n) / tile, len / tile] });
}
const along = (pts, n = 12) => new THREE.CatmullRomCurve3(pts.map((p) => v3(...p)), false, 'centripetal').getPoints(n - 1);
const ring = (n, f) => Array.from({ length: n }, (_, i) => v3(...f(i / (n - 1))));
/** 石头表面上的一点：从 axis（在石头里）朝 dir 走 lo 到 hi 这一段，场在那里等于 lift（> 0 是离面这么高）。场在这段里只穿过一次 */
export function statueSurface(axis, dir, lo, hi, lift = 0) {
  const A = v3(axis[0], axis[1], axis[2]), D = v3(dir[0], dir[1], dir[2]).normalize(), at = (m) => statueField(A.x + D.x * m, A.y + D.y * m, A.z + D.z * m);
  let a = lo, b = hi;
  for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (at(m) < lift) a = m; else b = m; }
  return A.addScaledVector(D, (a + b) / 2);
}

/** 披风。u 0..1 从肩到下摆，v 0..1 从 +x 一侧绕过背面到 -x 一侧。inner：贴身的里层 */
export function cloakPoint(u, v, inner = false) {
  const a = (0.13 + 0.74 * v) * Math.PI, top = 4.6 + 0.12 * Math.cos(a) * Math.cos(a), hem = 0.8 - 0.26 * Math.sin(v * Math.PI) + 0.07 * Math.sin(v * 23 + 1), y = top + (hem - top) * u;
  const [rx, rz] = radii(y), ellr = 1 / Math.hypot(Math.cos(a) / rx, Math.sin(a) / rz);
  const billow = 0.5 * u * u * (0.55 + 0.45 * Math.sin(a)), fold = 0.075 * Math.pow(u, 0.8) * Math.sin(v * TAU * 6 + 0.5) + 0.02 * u * (noise3(v * 5, u * 4, 1, 7) - 0.5);   // 往后鼓、带褶
  const r = ellr + 0.07 + 0.1 * (1 - u) ** 3 + billow + fold - (inner ? 0.055 : 0);
  return [shiftX(y) + 0.42 * u * u + r * Math.cos(a), y, shiftZ(y) - 0.26 * u * u - r * Math.sin(a)];
}
const cloakRef = (u, v, s) => { const a = (0.13 + 0.74 * v) * Math.PI; return [s * Math.cos(a), 0.25 * s, -s * Math.sin(a)]; };

let CACHE = null;

/**
 * 石像的几何。顶点色是各部分的明暗倍率
 * @param {number} tileMarble 大理石贴图铺几米
 * @param {number} tileBronze 青铜贴图铺几米
 */
export function statueGeometry(tileMarble, tileBronze) {
  if (CACHE) return CACHE;
  const TM = tileMarble, TB = tileBronze, stone = bodyPieces(TM).map((g) => g.toNonIndexed()), metal = [];
  const surf = (fn, nr, na, o) => part(stone, (mb) => paramSurface(mb, fn, nr, na, o), {});
  const cloth = (u, v) => [u * 4.2 / TM, v * 3.6 / TM];

  // 披风：外层、里层；肩上、两边、下摆各卷一道边，四个角上补一颗珠子把卷边的口堵上
  surf((u, v) => cloakPoint(u, v), 40, 44, { ref: (u, v) => cloakRef(u, v, 1), col: grey(0.94), uv: cloth });
  surf((u, v) => cloakPoint(u, v, true), 40, 44, { ref: (u, v) => cloakRef(u, v, -1), col: grey(0.78), uv: cloth });
  for (const [u0, v0, u1, v1, r] of [[0, 0, 0, 1, 0.065], [0, 0, 1, 0, 0.045], [0, 1, 1, 1, 0.045], [1, 0, 1, 1, 0.05]]) pipe(stone, ring(25, (t) => cloakPoint(u0 + (u1 - u0) * t, v0 + (v1 - v0) * t)), r, TM, { sides: 8 });
  for (const [u, v, r] of [[0, 0, 0.065], [0, 1, 0.065], [1, 0, 0.05], [1, 1, 0.05]]) ellipsoid(stone, [r, r, r], cloakPoint(u, v), TM);
  part(stone, (mb) => blob(mb, { seg: 24, rings: 12, radius: () => 1, col: grey(1.02) }), { scale: [0.115, 0.05, 0.115], rx: -0.3, pos: [0.6, 4.74, -0.1], uv: [0.8 / TM, 0.3 / TM] });   // 左肩上扣住披风的圆胸针
  // 腰带：一根圆的带子，要把衣褶的脊都压在底下
  pipe(stone, ring(65, (t) => { const a = t * TAU, y = 3.27, [rx, rz] = radii(y); return [shiftX(y) + (rx + 0.02) * Math.sin(a), y, shiftZ(y) + (rz + 0.02) * Math.cos(a)]; }), 0.075, TM, { sides: 14 });
  // 从左肩上头绕过来、贴着胸腹的表面斜到右胯、掖进腰带里的扁带子。路径上的点用场本身找：带子踩在真实的表面上
  const strap = [v3(0.6, 4.36, -0.2)], strapN = [v3(0.2, 0.98, 0)];
  strap.push(statueSurface([0.46, 4.2, -0.06], [0.05, 1, 0], 0, 0.7, 0.03)); strapN.push(v3(0.1, 0.99, -0.08));
  for (let i = 0; i <= 22; i++) {
    const t = i / 22, y = 4.56 - t * 1.26, [rx, rz] = radii(y), a = Math.asin((0.3 - t * 0.66) / rx), nx = Math.sin(a) / rx, nz = Math.cos(a) / rz, l = Math.hypot(nx, nz), n = v3(nx / l, 0, nz / l), r0 = 1 / Math.hypot(Math.sin(a) / rx, Math.cos(a) / rz);
    strap.push(statueSurface([shiftX(y), y, shiftZ(y)], [nx / l, 0, nz / l], r0 - 0.2, r0 + 0.2, 0.03)); strapN.push(n);
  }
  const path = new THREE.CatmullRomCurve3(strap, false, 'centripetal').getPoints(60), norms = new THREE.CatmullRomCurve3(strapN, false, 'centripetal').getPoints(60).map((n) => n.normalize());
  const side = path.map((p, i) => new THREE.Vector3().crossVectors(path[Math.min(i + 1, 60)].clone().sub(path[Math.max(i - 1, 0)]).normalize(), norms[i]).normalize());
  part(stone, (mb) => tube(mb, path, [...Array(6).fill(0.04), ...Array(54).fill(0.07), 0.055], { sides: 12, cap: 'tip', tipLen: 0.1, side, aspect: 0.28 }), { uv: [0.45 / TM, 2.4 / TM] });
  // 长袍的下摆卷一道边：下摆的边是刀口一样的薄刃，网格化以后是锯齿，卷边把它盖住
  pipe(stone, ring(97, (t) => { const a = t * TAU, y = 0.12 + 0.035 * (1 + Math.sin(9 * a + 0.6)), [rx, rz] = radii(y), r0 = 1 / Math.hypot(Math.sin(a) / rx, Math.cos(a) / rz); return statueSurface([shiftX(y), y, shiftZ(y)], [Math.sin(a), 0, Math.cos(a)], r0 - 0.2, r0 + 0.1, 0.045); }), 0.045, TM, { sides: 10 });
  ellipsoid(stone, [PEARL_R, PEARL_R, PEARL_R], PEARL, TM, 1.05);                                                // 掌上的明珠
  // 王冠：一圈箍，九根尖
  pipe(stone, ring(33, (t) => { const a = t * TAU; return [0.335 * Math.sin(a), 5.52, 0.02 + 0.325 * Math.cos(a)]; }), 0.075, TM, { sides: 8 });
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * TAU + 0.35, hh = k === 0 ? 0.42 : 0.3;
    pipe(stone, [v3(0.34 * Math.sin(a), 5.58, 0.02 + 0.33 * Math.cos(a)), v3(0.37 * Math.sin(a), 5.58 + hh * 0.75, 0.02 + 0.36 * Math.cos(a))], [0.068, 0.035], TM, { sides: 6, cap: 'tip', tipLen: hh * 0.3 });
  }

  // 青铜的三叉戟：杆、底下的尖（杵在基座上）、横梁、三根带倒钩的戟刃
  const X = -0.985, Z = 0.36;
  pipe(metal, [v3(X, 0.3, Z), v3(X, 3.0, Z), v3(X, 5.9, Z)], 0.055, TB, { sides: 10 });
  pipe(metal, [v3(X, 0.3, Z), v3(X, 0, Z)], [0.075, 0.012], TB, { sides: 10 });
  pipe(metal, [v3(X - 0.44, 5.9, Z), v3(X, 5.9, Z), v3(X + 0.44, 5.9, Z)], 0.05, TB, { sides: 10 });
  pipe(metal, [v3(X, 5.86, Z), v3(X, 6.5, Z), v3(X, 6.98, Z)], [0.06, 0.055, 0.004], TB, { sides: 10 });
  for (const s of [-1, 1]) {
    pipe(metal, along([[X + s * 0.44, 5.9, Z], [X + s * 0.445, 6.3, Z], [X + s * 0.41, 6.66, Z], [X + s * 0.39, 6.86, Z]]), Array.from({ length: 12 }, (_, i) => 0.05 - 0.046 * (i / 11)), TB, { sides: 8 });
    pipe(metal, [v3(X + s * 0.44, 6.3, Z), v3(X + s * 0.3, 6.42, Z)], [0.035, 0.004], TB, { sides: 6 });
    pipe(metal, [v3(X + s * 0.44, 6.3, Z), v3(X + s * 0.56, 6.42, Z)], [0.035, 0.004], TB, { sides: 6 });
  }

  CACHE = { marble: mergeParts(stone, ['position', 'normal', 'uv', 'color']), bronze: mergeParts(metal, ['position', 'normal', 'uv', 'color']), height: 7.0 };
  return CACHE;
}

/**
 * 放一尊石像。m0：脚底的落点（朝向在矩阵里，脸朝局部 +z），s：倍率，tint：灰度倍率（越小 = 风化得越厉害）。返回像高
 */
export function placeStatue(kit, M, tile, m0, s, tint) {
  const g = statueGeometry(tile.marble, tile.bronze), one = m0.clone().multiply(new THREE.Matrix4().makeScale(s, s, s));
  kit.put(M.marble, g.marble, one, tint);
  kit.put(M.patina, g.bronze, one, tint * 0.74);                                     // 青铜压暗一点，和石头分得开
  return g.height * s;
}
