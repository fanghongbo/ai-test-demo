// 纯样本数学：Karplus–Strong 拨弦、循环噪声。零依赖，可在 Node 中直接测试。
import { mulberry32 } from '../core/mathx.js';

/** 延迟线长度（整数采样）与由此产生的实际频率 */
export const ksPeriod = (freq, sampleRate) => Math.max(2, Math.round(sampleRate / freq));
export const ksRate = (freq, sampleRate) => freq / (sampleRate / ksPeriod(freq, sampleRate));   // 播放速率修正 → 精准音高

/**
 * 反馈系数 ρ：延迟环每转一圈损失 ρ·cos(πf/sr)（两点平均低通），
 * 要让振幅在 t60 秒内降 60 dB（×0.001），需 (ρ·cos)^f = 0.001^(1/t60)。
 */
export function ksDecay(freq, sampleRate, t60) {
  const avg = Math.max(0.2, Math.cos(Math.PI * freq / sampleRate));
  const perSec = Math.pow(0.001, 1 / Math.max(0.05, t60));
  return Math.min(0.99995, Math.pow(perSec, 1 / freq) / avg);
}

/**
 * Karplus–Strong 拨弦：噪声激励 → 带损耗的平均低通延迟环。
 * @param {number} freq 目标频率 Hz（整数延迟线的音高误差由 ksRate 修正）
 * @param {number} sampleRate
 * @param {number} seconds
 * @param {{t60?:number, brightness?:number, seed?:number}} [o]
 * @returns {Float32Array} 峰值归一到 0.9，结尾 30ms 淡出
 */
export function ksBuffer(freq, sampleRate, seconds, o = {}) {
  const t60 = o.t60 ?? 2.2, bright = o.brightness ?? 0.5, seed = o.seed ?? 1;
  const n = Math.max(64, Math.round(seconds * sampleRate));
  const out = new Float32Array(n);
  const N = ksPeriod(freq, sampleRate);
  const rng = mulberry32(seed >>> 0);
  const dl = new Float32Array(N);
  const lp = 0.12 + 0.88 * Math.max(0, Math.min(1, bright));     // 激励低通：越小音色越暗
  let prev = 0, mean = 0;
  for (let i = 0; i < N; i++) { prev += lp * (rng() * 2 - 1 - prev); dl[i] = prev; mean += prev; }
  mean /= N;
  for (let i = 0; i < N; i++) dl[i] -= mean;                      // 去直流，避免低频砰声
  const rho = ksDecay(freq, sampleRate, t60);
  for (let i = 0, k = 0; i < n; i++) {
    const a = dl[k], b = k + 1 === N ? dl[0] : dl[k + 1];
    out[i] = a;
    dl[k] = rho * 0.5 * (a + b);
    k = k + 1 === N ? 0 : k + 1;
  }
  const fade = Math.min(n, Math.round(0.03 * sampleRate));
  for (let i = 0; i < fade; i++) out[n - 1 - i] *= i / fade;
  let peak = 1e-9;
  for (let i = 0; i < n; i++) { const v = Math.abs(out[i]); if (v > peak) peak = v; }
  const g = Math.min(8, 0.9 / peak);
  for (let i = 0; i < n; i++) out[i] *= g;
  return out;
}

/**
 * 可无缝循环的噪声（首尾交叉淡化后截短）。
 * @param {'white'|'pink'|'brown'} [o.color]
 */
export function noiseBuffer(seconds, sampleRate, o = {}) {
  const color = o.color ?? 'white', seed = o.seed ?? 1;
  const n = Math.max(256, Math.round(seconds * sampleRate));
  const out = new Float32Array(n);
  const rng = mulberry32(seed >>> 0);
  if (color === 'pink') {                                        // Paul Kellet 经济粉噪
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = rng() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else if (color === 'brown') {
    let y = 0;
    for (let i = 0; i < n; i++) { y = (y + 0.02 * (rng() * 2 - 1)) / 1.02; out[i] = y * 3.5; }
  } else {
    for (let i = 0; i < n; i++) out[i] = rng() * 2 - 1;
  }
  // 交叉淡化：把尾部接到头部，循环点两侧样本连续
  const f = Math.min(n >> 2, Math.round(0.02 * sampleRate));
  for (let i = 0; i < f; i++) { const t = i / f; out[i] = out[i] * t + out[n - f + i] * (1 - t); }
  let peak = 1e-9;
  for (let i = 0; i < n - f; i++) { const v = Math.abs(out[i]); if (v > peak) peak = v; }
  const g = Math.min(1, 0.9 / peak);
  for (let i = 0; i < n - f; i++) out[i] *= g;
  return out.subarray(0, n - f);
}

/** 软削波曲线（沙哑的“嘎”声） */
export function driveCurve(amount = 6, size = 1024) {
  const c = new Float32Array(size);
  for (let i = 0; i < size; i++) { const x = (i / (size - 1)) * 2 - 1; c[i] = Math.tanh(x * amount) / Math.tanh(amount); }
  return c;
}
