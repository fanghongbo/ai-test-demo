// 环岛骑行路线：闭合 Catmull-Rom + 弧长参数化 + 横向投影 + 地形剖面。纯逻辑，零依赖。
import { TAU, clamp, smoothstep, fbm2 } from './mathx.js';

export const ROAD = Object.freeze({
  half: 2.6,        // 路面半宽
  curbW: 0.26,      // 路缘石宽
  curbH: 0.13,      // 路缘石高
  walkOut: 3.3,     // 海侧步道宽
  walkIn: 1.7,      // 陆侧人行道宽
});

function ctrlPoint(R0, sx, sz, phi) {
  const r = R0 * (1 + 0.10 * Math.cos(2 * phi - 0.6) + 0.055 * Math.sin(3 * phi + 1.0) + 0.030 * Math.sin(7 * phi + 2.0));
  return [r * Math.sin(phi) * sx, r * Math.cos(phi) * sz];
}

/**
 * @param {{R0?:number, sx?:number, sz?:number, n?:number, sub?:number}} o
 */
export function makeTrack(o = {}) {
  const R0 = o.R0 ?? 150, sx = o.sx ?? 0.60, sz = o.sz ?? 1.0;
  const N = o.n ?? 48, SUB = o.sub ?? 32;
  const ctrl = [];
  for (let i = 0; i < N; i++) ctrl.push(ctrlPoint(R0, sx, sz, (i / N) * TAU));

  const evalCurve = (seg, t, outP, outD) => {
    const p0 = ctrl[(seg + N - 1) % N], p1 = ctrl[seg], p2 = ctrl[(seg + 1) % N], p3 = ctrl[(seg + 2) % N];
    const t2 = t * t, t3 = t2 * t;
    for (let k = 0; k < 2; k++) {
      const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      if (outP) outP[k] = 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      if (outD) outD[k] = 0.5 * ((-a + c) + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t2);
    }
  };

  // 弧长表
  const M = N * SUB;
  const cum = new Float64Array(M + 1);
  const px = new Float64Array(M + 1), pz = new Float64Array(M + 1);
  { const P = [0, 0]; let prev = null;
    for (let i = 0; i <= M; i++) {
      evalCurve(Math.floor(i / SUB) % N, (i % SUB) / SUB, P, null);
      px[i] = P[0]; pz[i] = P[1];
      if (prev) cum[i] = cum[i - 1] + Math.hypot(P[0] - prev[0], P[1] - prev[1]);
      prev = [P[0], P[1]];
    }
  }
  const length = cum[M];

  // 路面高程：随弧长平滑起伏（周期闭合）
  const k1 = TAU * 2 / length, k2 = TAU * 5 / length;
  const roadY = (s) => 3.3 + 1.25 * Math.sin(k1 * s + 0.4) + 0.65 * Math.sin(k2 * s + 1.7);
  const slope = (s) => 1.25 * k1 * Math.cos(k1 * s + 0.4) + 0.65 * k2 * Math.cos(k2 * s + 1.7);

  const P = [0, 0], D = [0, 0];
  /** 弧长 s → (paramSeg, paramT) */
  const paramAt = (s) => {
    s = ((s % length) + length) % length;
    let lo = 0, hi = M;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const segLen = cum[lo + 1] - cum[lo] || 1e-9;
    return [Math.floor(lo / SUB) % N, ((lo % SUB) + (s - cum[lo]) / segLen) / SUB];
  };

  const _f = { pos: [0, 0, 0], fwd: [0, 0, 1], right: [-1, 0, 0], up: [0, 1, 0], yaw: 0, slope: 0, y: 0, s: 0, bank: 0 };
  /**
   * 路线坐标系（右手系，+Y 上）。right = fwd × up：海的右侧。
   * fwd 含坡度，yaw 为水平航向角（绕 +Y，0 = +Z 方向）。
   */
  function frameAt(s, out = _f) {
    const [seg, t] = paramAt(s);
    evalCurve(seg, t, P, D);
    const dl = Math.hypot(D[0], D[1]) || 1e-9;
    const tx = D[0] / dl, tz = D[1] / dl;
    const sl = slope(s), y = roadY(s);
    out.pos ||= [0, 0, 0]; out.fwd ||= [0, 0, 1]; out.right ||= [0, 0, 0]; out.up ||= [0, 1, 0];
    const fl = Math.hypot(1, sl);
    out.pos[0] = P[0]; out.pos[1] = y; out.pos[2] = P[1];
    out.fwd[0] = tx / fl; out.fwd[1] = sl / fl; out.fwd[2] = tz / fl;
    out.right[0] = -tz; out.right[1] = 0; out.right[2] = tx;
    // up = right × fwd（随坡度倾斜，保持正交）；right 保持水平
    out.up[0] = -tx * (sl / fl); out.up[1] = 1 / fl; out.up[2] = -tz * (sl / fl);
    out.yaw = Math.atan2(tx, tz);
    out.slope = sl; out.y = y; out.s = ((s % length) + length) % length;
    return out;
  }

  // 曲率（用于车身侧倾）：航向角差分
  function curvatureAt(s) {
    const a = frameAt(s - 1.5, {}).yaw, b = frameAt(s + 1.5, {}).yaw;
    let d = b - a; d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI;
    return d / 3;
  }

  const COARSE = 4;
  const _n = { s: 0, u: 0, x: 0, z: 0, d2: 0 };
  /** 世界点 → {s 弧长, u 横向偏移(+ = 海侧/右侧), x,z 最近点, d2} */
  function nearest(x, z, out = _n) {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < M; i += COARSE) {
      const dx = px[i] - x, dz = pz[i] - z, d = dx * dx + dz * dz;
      if (d < bd) { bd = d; bi = i; }
    }
    let bestS = cum[bi], bx = px[bi], bz = pz[bi], bestD = bd;
    for (let i = Math.max(0, bi - COARSE); i < Math.min(M, bi + COARSE); i++) {
      const ax = px[i], az = pz[i], ex = px[i + 1] - ax, ez = pz[i + 1] - az;
      const L2 = ex * ex + ez * ez || 1e-12;
      let t = ((x - ax) * ex + (z - az) * ez) / L2; t = clamp(t, 0, 1);
      const qx = ax + ex * t, qz = az + ez * t;
      const dx = x - qx, dz = z - qz, d = dx * dx + dz * dz;
      if (d < bestD) { bestD = d; bx = qx; bz = qz; bestS = cum[i] + (cum[i + 1] - cum[i]) * t; }
    }
    const [seg, t] = paramAt(bestS);
    evalCurve(seg, t, P, D);
    const dl = Math.hypot(D[0], D[1]) || 1e-9;
    const tx = D[0] / dl, tz = D[1] / dl;                  // 前进方向
    const rx = -tz, rz = tx;                                // 右侧
    out.s = bestS; out.x = bx; out.z = bz; out.d2 = bestD;
    out.u = (x - bx) * rx + (z - bz) * rz;
    out.y = roadY(bestS);
    return out;
  }

  const bounds = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (let i = 0; i < M; i++) { bounds.minX = Math.min(bounds.minX, px[i]); bounds.maxX = Math.max(bounds.maxX, px[i]); bounds.minZ = Math.min(bounds.minZ, pz[i]); bounds.maxZ = Math.max(bounds.maxZ, pz[i]); }

  return { length, ctrl, roadY, slope, frameAt, nearest, curvatureAt, bounds, evalXY: (s) => { const f = frameAt(s, {}); return [f.pos[0], f.pos[2]]; } };
}

/**
 * 地形高度（世界 Y）。roadY：最近路线点路面高程；u：横向偏移（+ 海侧）。
 * 这是地形、道具落地、海水深度的唯一高度权威。
 */
export function terrainHeight(track, x, z, n) {
  n = track.nearest(x, z, n || {});                            // 每次都重新投影；n 只是用来复用对象、避免分配
  const ry = n.y, u = n.u, au = Math.abs(u);
  const inner = ROAD.half + ROAD.curbW;
  if (au <= ROAD.half) { const q = au / ROAD.half; return ry + 0.05 * (1 - q * q); }            // 路拱
  if (au <= inner) return ry + ROAD.curbH;                                                        // 路缘石
  const w = au - inner;
  const edge = ROAD.half + 2.5;                     // 距路远近 → 噪声幅度
  const amp = smoothstep(edge, edge + 9, au);
  if (u > 0) {
    // 海侧：步道 → 栏杆外沙坡 → 水下
    if (w <= ROAD.walkOut) return ry + ROAD.curbH;
    const b = w - ROAD.walkOut;
    const top = ry + ROAD.curbH - 0.30;
    const slopeB = 0.30;
    let y = top - b * slopeB;
    if (y < -2.5) y = -2.5 - (b - (top + 2.5) / slopeB) * 0.06;      // 水下变缓
    // 步道到沙滩的圆角过渡
    if (b < 2.0) y = (ry + ROAD.curbH) * (1 - smoothstep(0, 2, b)) + y * smoothstep(0, 2, b);
    return y + fbm2(x * 0.09, z * 0.09, 2, 3) * 0.10 * smoothstep(0, 4, b);
  }
  // 陆侧：人行道 → 草坡抬升为岛心的山丘
  if (w <= ROAD.walkIn) return ry + ROAD.curbH;
  const d = w - ROAD.walkIn;
  // 岛心高度不依赖“最近的是哪一侧路段”：离路 25m 后过渡到统一基准面，
  // 这样在两侧距离相等的分水岭上地形仍然连续（否则会出现断崖）。
  const base = 4.0, ryEff = ry + (base - ry) * smoothstep(0, 25, d);
  const hill = 17 * Math.pow(smoothstep(0, 78, d), 1.15);
  const y = ryEff + ROAD.curbH + hill + fbm2(x * 0.035, z * 0.035, 3, 5) * 2.2 * smoothstep(0, 25, d) + fbm2(x * 0.2, z * 0.2, 2, 9) * 0.25 * amp;
  // 路肩：人行道外侧先低 4.5 cm（一道小沿），再以 1.2% 缓升。没有它，紧贴步道的草坡会比步道面高，
  // 跨过步道边缘的地形三角形就会从步道下面钻出来（路面条带比地形网格低，藏不住）。高出路肩的部分在 2.4~4.5 m 内平滑放回自然地形。
  const verge = ry + ROAD.curbH - 0.045 * (1 - smoothstep(0, 1.2, d)) + 0.012 * d;
  return y + Math.min(0, verge - y) * (1 - smoothstep(2.4, 4.5, d));
}

/** 人行道外沿的 |u|（陆侧）与滨海步道外沿的 |u|（海侧） */
export const WALK_EDGE = ROAD.half + ROAD.curbW + ROAD.walkIn, SEA_EDGE = ROAD.half + ROAD.curbW + ROAD.walkOut;

/** 地表材质分类（用于顶点色）：0 草 1 沙 2 铺装 3 沥青 */
export function terrainZone(u, y) {
  const au = Math.abs(u);
  if (au <= ROAD.half) return 3;
  if (au <= ROAD.half + ROAD.curbW + (u > 0 ? ROAD.walkOut : ROAD.walkIn)) return 2;
  if (u > 0) return y > 0.9 ? 0 : 1;
  return 0;
}

export { TAU };
