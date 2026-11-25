// 标量数学、插值、噪声、弹簧（纯函数，零依赖）
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => (b === a ? 0 : (x - a) / (b - a));
export const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const smootherstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
/** 帧率无关的指数趋近：lambda 越大越快 */
export const damp = (cur, target, lambda, dt) => lerp(cur, target, 1 - Math.exp(-lambda * dt));
export const wrap = (x, m) => ((x % m) + m) % m;
export const wrapAngle = (a) => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
export const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
export const easeOutElastic = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1);
export const pulse = (t, decay = 5) => (t < 0 ? 0 : Math.exp(-decay * t)); // 单位脉冲衰减包络

/** 确定性 PRNG */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function rngRange(rng, a, b) { return a + (b - a) * rng(); }
export function rngPick(rng, arr) { return arr[Math.min(arr.length - 1, (rng() * arr.length) | 0)]; }

/** 整数哈希 → [0,1) */
export function hash1(n) {
  let x = Math.imul(n ^ 0x9E3779B9, 0x85EBCA6B);
  x ^= x >>> 13; x = Math.imul(x, 0xC2B2AE35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
/** 1D 值噪声，范围约 [-1,1] */
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash1(i * 374761393 + seed * 668265263) * 2 - 1;
  const b = hash1((i + 1) * 374761393 + seed * 668265263) * 2 - 1;
  return lerp(a, b, fade(f));
}
export function fbm1(x, oct = 3, seed = 0) {
  let s = 0, amp = 0.5, fr = 1, norm = 0;
  for (let o = 0; o < oct; o++) { s += noise1(x * fr, seed + o * 17) * amp; norm += amp; amp *= 0.5; fr *= 2.03; }
  return s / norm;
}
/** 2D 值噪声，范围约 [-1,1] */
export function noise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const h = (i, j) => hash1((i * 374761393 + j * 668265263) ^ (seed * 2246822519)) * 2 - 1;
  const a = h(ix, iy), b = h(ix + 1, iy), c = h(ix, iy + 1), d = h(ix + 1, iy + 1);
  return lerp(lerp(a, b, fade(fx)), lerp(c, d, fade(fx)), fade(fy));
}
export function fbm2(x, y, oct = 3, seed = 0) {
  let s = 0, amp = 0.5, fr = 1, norm = 0;
  for (let o = 0; o < oct; o++) { s += noise2(x * fr, y * fr, seed + o * 17) * amp; norm += amp; amp *= 0.5; fr *= 2.03; }
  return s / norm;
}

/** Catmull-Rom 标量插值（p1..p2 之间） */
export function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
/**
 * 关键帧样条：xs 严格递增，ys 为值。返回在 x 处的平滑值（单调坐标上的 Catmull-Rom，端点夹持）。
 * 用于半径轮廓等“手绘曲线”。
 */
export function spline(xs, ys, x) {
  const n = xs.length;
  if (n === 1 || x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let i = 0;
  while (i < n - 2 && x > xs[i + 1]) i++;
  // 各节点切线：相邻割线平均，并做防过冲限制（极值点切线为 0）
  const slope = (j) => (ys[j + 1] - ys[j]) / (xs[j + 1] - xs[j]);
  const tangent = (j) => {
    if (j <= 0) return slope(0);
    if (j >= n - 1) return slope(n - 2);
    const dL = slope(j - 1), dR = slope(j);
    if (dL * dR <= 0) return 0;
    const lim = 3 * Math.min(Math.abs(dL), Math.abs(dR));
    return clamp((dL + dR) * 0.5, -lim, lim);
  };
  const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h;
  const t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
  return h00 * ys[i] + h10 * h * tangent(i) + h01 * ys[i + 1] + h11 * h * tangent(i + 1);
}

/**
 * 阻尼弹簧（半隐式欧拉）。state = {x, v}，返回同一对象。
 * k 刚度，c 阻尼；c = 2·sqrt(k) 为临界阻尼。
 */
export function springStep(state, target, k, c, dt) {
  const a = -k * (state.x - target) - c * state.v;
  state.v += a * dt;
  state.x += state.v * dt;
  return state;
}
export function spring(target = 0) { return { x: target, v: 0 }; }
