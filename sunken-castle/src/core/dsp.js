// 音频里纯计算的东西（不依赖 WebAudio，可在 Node 里测试）：循环起来无缝的粉红 / 布朗噪声、混响用的立体声脉冲响应。
import { mulberry32 } from './mathx.js';

/** 带种子的白噪声，n 个采样，都在 −1..1 之间 */
export function noise(n, seed = 1) {
  const r = mulberry32(seed), x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
  return x;
}

/** 把多算了 fade 个采样的噪声变成首尾相接的循环：开头那一段和末尾多出来的一段交叉淡化，接缝处就没有“咔”声 */
function seamless(x, fade) {
  const n = x.length - fade, out = new Float32Array(n);
  for (let i = 0; i < fade; i++) out[i] = x[i] * (i / fade) + x[n + i] * (1 - i / fade);
  out.set(x.subarray(fade, n), fade);
  return out;
}

/** 粉红噪声（每个倍频程低 3 分贝）。n 是循环一圈的采样数；fade > 0 时首尾相接 */
export function pinkNoise(n, seed = 1, fade = 0) {
  const w = noise(n + fade, seed), x = new Float32Array(n + fade);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < x.length; i++) { b0 = 0.99765 * b0 + w[i] * 0.099046; b1 = 0.963 * b1 + w[i] * 0.2965164; b2 = 0.57 * b2 + w[i] * 1.0526913; x[i] = (b0 + b1 + b2 + w[i] * 0.1848) * 0.18; }
  return fade ? seamless(x, fade) : x;
}

/** 布朗噪声（每个倍频程低 6 分贝，很低沉）：白噪声积起来，再慢慢漏掉，免得直流漂走 */
export function brownNoise(n, seed = 1, fade = 0) {
  const w = noise(n + fade, seed), x = new Float32Array(n + fade);
  let last = 0;
  for (let i = 0; i < x.length; i++) { last = (last + 0.02 * w[i]) * 0.995; x[i] = last * 1.75; }
  return fade ? seamless(x, fade) : x;
}

/**
 * 立体声脉冲响应（一个厅）：十几毫秒的预延迟 + 头 40 毫秒里的七个早期反射 + 指数衰减的噪声尾巴。
 * decay 是尾巴的时间常数（秒）；尾巴越到后面越闷——高频在厅里消失得快。两个声道各用各的噪声，听起来才有宽度
 */
export function impulse(seconds, sr, decay = 0.5, seed = 7, preDelay = 0.014) {
  const n = Math.round(seconds * sr), r = mulberry32(seed), out = [];
  for (let ch = 0; ch < 2; ch++) {
    const x = new Float32Array(n), p = Math.round(preDelay * sr);
    let lp = 0;
    for (let i = p; i < n; i++) {
      const t = (i - p) / sr, fc = 6000 * Math.pow(400 / 6000, Math.min(1, t / (decay * 3)));
      lp += (1 - Math.exp((-2 * Math.PI * fc) / sr)) * (r() * 2 - 1 - lp);              // 截止频率一路往下走的一阶低通
      x[i] = lp * 1.6 * Math.pow(1 - (i - p) / (n - p), 1.6) * Math.exp(-t / decay);
    }
    for (let k = 0; k < 7; k++) { const t = p + Math.round((0.004 + r() * 0.03) * sr); if (t < n) x[t] += (r() > 0.5 ? 1 : -1) * (0.5 - k * 0.05); }
    out.push(x);
  }
  return out;
}
