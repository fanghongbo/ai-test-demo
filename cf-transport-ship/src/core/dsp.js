// 音频合成的基础件（纯函数，不依赖 WebAudio，可在 Node 里测试）：噪声、正弦 / 扫频、双二阶滤波、包络、削波、混响用的脉冲响应。
import { mulberry32 } from './mathx.js';

export function noise(n, seed = 1) {
  const r = mulberry32(seed), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
  return x;
}

/** 指数扫频的频率函数：从 f0 在 t1 秒内扫到 f1，之后保持 */
export const sweepF = (f0, f1, t1) => (t) => (t >= t1 ? f1 : f0 * Math.pow(f1 / f0, t / t1));

/** 正弦 / 扫频。f 是频率，或 t（秒）→ 频率 的函数 */
export function sine(n, f, sr, phase = 0) {
  const x = new Float32Array(n), fn = typeof f === 'function' ? f : () => f;
  let ph = phase;
  for (let i = 0; i < n; i++) { ph += (2 * Math.PI * fn(i / sr)) / sr; x[i] = Math.sin(ph); }
  return x;
}

/** RBJ 双二阶滤波器的系数。type：lp / hp / bp（单位峰值增益）/ notch / peak */
export function coeff(type, f, sr, q = 0.7071, gainDb = 0) {
  const A = Math.pow(10, gainDb / 40), w0 = (2 * Math.PI * Math.min(Math.max(f, 10), sr * 0.49)) / sr, cw = Math.cos(w0), alpha = Math.sin(w0) / (2 * q);
  let b0, b1, b2, a0 = 1 + alpha, a1 = -2 * cw, a2 = 1 - alpha;
  if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
  else if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
  else if (type === 'bp') { b0 = alpha; b1 = 0; b2 = -alpha; }
  else if (type === 'notch') { b0 = 1; b1 = -2 * cw; b2 = 1; }
  else { b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a2 = 1 - alpha / A; }
  return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
}
/** 就地滤波。s（可选）是跨调用保留的滤波器状态 */
export function biquad(x, type, f, sr, q = 0.7071, gainDb = 0, s = { s1: 0, s2: 0 }) {
  const [b0, b1, b2, a1, a2] = coeff(type, f, sr, q, gainDb);
  for (let i = 0; i < x.length; i++) { const xi = x[i], y = b0 * xi + s.s1; s.s1 = b1 * xi - a1 * y + s.s2; s.s2 = b2 * xi - a2 * y; x[i] = y; }
  return x;
}
/** 截止频率从 f0 扫到 f1（t1 秒内），之后保持 */
export function biquadSweep(x, type, f0, f1, t1, sr, q = 0.7071) {
  const s = { s1: 0, s2: 0 }, n = x.length;
  for (let i = 0; i < n; i += 16) {
    const t = i / sr, [b0, b1, b2, a1, a2] = coeff(type, t >= t1 ? f1 : f0 * Math.pow(f1 / f0, t / t1), sr, q, 0), e = Math.min(n, i + 16);
    for (let j = i; j < e; j++) { const xi = x[j], y = b0 * xi + s.s1; s.s1 = b1 * xi - a1 * y + s.s2; s.s2 = b2 * xi - a2 * y; x[j] = y; }
  }
  return x;
}

/** 打击型包络：attack 秒线性起音，然后按 tau 的时间常数指数衰减 */
export function perc(x, attack, tau, sr) {
  for (let i = 0; i < x.length; i++) { const t = i / sr; x[i] *= Math.min(1, t / Math.max(attack, 1e-4)) * Math.exp(-t / tau); }
  return x;
}
/** 起音 a、衰减 d 到延音电平 s、末尾 r 秒释音（铺底音用） */
export function adsr(x, a, d, s, r, sr) {
  const n = x.length;
  for (let i = 0; i < n; i++) {
    const t = i / sr, tr = (n - i) / sr;
    let g = t < a ? t / a : t < a + d ? 1 + (s - 1) * ((t - a) / d) : s;
    if (tr < r) g *= tr / r;
    x[i] *= g;
  }
  return x;
}
/** 末尾淡出，避免爆音 */
export function fadeOut(x, sec, sr) {
  const n = Math.min(x.length, Math.max(2, Math.round(sec * sr)));
  for (let i = 0; i < n; i++) x[x.length - 1 - i] *= i / n;
  return x;
}
export function mix(dst, src, g = 1, off = 0) {
  for (let i = 0; i < src.length && i + off < dst.length; i++) dst[i + off] += src[i] * g;
  return dst;
}
export function clip(x, drive = 1) {
  const k = Math.tanh(drive);
  for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * drive) / k;
  return x;
}
export function normalize(x, peak = 0.9) {
  let m = 0;
  for (let i = 0; i < x.length; i++) m = Math.max(m, Math.abs(x[i]));
  if (m > 1e-6) for (let i = 0; i < x.length; i++) x[i] = (x[i] / m) * peak;
  return x;
}
/** 简单的回声（反馈梳状滤波） */
export function echo(x, delaySec, feedback, wet, sr) {
  const d = Math.max(1, Math.round(delaySec * sr));
  for (let i = d; i < x.length; i++) x[i] += x[i - d] * feedback * wet;
  return x;
}

/** 立体声脉冲响应（钢板大厅：十几毫秒预延迟 + 几个早期反射 + 指数衰减的噪声尾巴） */
export function impulse(seconds, sr, decay = 0.5, seed = 7, preDelay = 0.014) {
  const n = Math.round(seconds * sr), r = mulberry32(seed), out = [];
  for (let ch = 0; ch < 2; ch++) {
    const x = new Float32Array(n), p = Math.round(preDelay * sr);
    for (let i = p; i < n; i++) x[i] = (r() * 2 - 1) * Math.pow(1 - (i - p) / (n - p), 1.6) * Math.exp(-((i - p) / sr) / decay);
    for (let k = 0; k < 7; k++) { const t = p + Math.round((0.004 + r() * 0.03) * sr); if (t < n) x[t] += (r() > 0.5 ? 1 : -1) * (0.5 - k * 0.05); }
    for (let i = 0; i < p && i < n; i++) x[i] = 0;
    out.push(x);
  }
  return out;
}
