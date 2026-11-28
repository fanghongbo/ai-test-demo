// 水下光学的纯计算部分：阳光射进水面后的方向和强度、随深度和视距的衰减系数、水色。不依赖 three，可在 Node 里测试。
// 坐标：y 向上，水面在 y = 0。方向向量一律“指向光源”（从水里往上看太阳）。
import { clamp01, lerp } from './mathx.js';
import { sunVector } from './skymodel.js';

export const N_WATER = 1.333;                                 // 折射率
const K = (sunEl, sunAz, turbidity, cloud, exposure) => ({ sunEl, sunAz, turbidity, cloud, exposure });

/**
 * 五个时刻。曝光是在“镜头正前方 30 米深、往水平方向看”的画面上定的，换时刻要重新定。
 * 黄昏那一档太阳只有 7° 高：光从窗口的最边上斜射进来，水里只剩天光的散射，灯笼和荧光开始接管画面。
 */
export const TIMES = Object.freeze([
  { id: 'morning', name: '清晨', hour: 8.6, p: K(28, 84, 2.0, 0.40, 2.05), gain: 1.0 },
  { id: 'noon', name: '正午', hour: 12.4, p: K(70, 4, 1.25, 0.34, 1.55), gain: 1.0 },
  { id: 'afternoon', name: '午后', hour: 15.5, p: K(55, 312, 1.4, 0.36, 1.8), gain: 1.0 },
  { id: 'dusk', name: '黄昏', hour: 18.3, p: K(7.5, 280, 3.6, 0.42, 3.4), gain: 0.62 },
  { id: 'night', name: '夜晚', hour: 22.0, p: K(-34, 300, 2.6, 0.30, 3.2), gain: 0.16 },
]);
export const DEFAULT_TIME = 'afternoon';
/** 月亮：方位 335°、高度 40°。夜里“太阳”就是它 */
export const MOON = Object.freeze({ el: 40, az: 335 });

/**
 * 水质：每米的衰减系数（红、绿、蓝），都是“清澈外海”的量级再按观感调过。
 * view：视线方向上光束的消光（吸收 + 散射），决定远处的东西多快沉进水色、红色多快先没。
 * sun：往下走的日光（直射）；amb：往下走的天光（散射光走的路更长，所以衰减更快一点）。
 * 倍率 1 = 清澈；数字越大越浑。
 */
export const CLARITY = Object.freeze([
  { id: 'crystal', name: '透亮', k: 0.58 },
  { id: 'clear', name: '清澈', k: 1.0 },
  { id: 'soft', name: '微浊', k: 1.6 },
  { id: 'hazy', name: '朦胧', k: 2.5 },
]);
export const DEFAULT_CLARITY = 'clear';
// 日光这一项按“白平衡过的摄影机”定：红光在深处确实先没，但那样 40 米以下就只剩单色蓝，材料的颜色全看不见了。
// 所以日光的逐通道吸收取得很温和（相当于把光源的颜色校正回来），蓝调交给天光：背光处和阴影里只有天光，红光掉到蓝光的三成，沉进蓝色里；
// 被太阳照到的地方亮而中性——明暗两边不光是亮暗不同，色温也不同，画面才有对比。
// 看过去的吸收（view）决定能看多远：60 米外蓝光还剩三成，红光基本没了——城有 120 米宽，再浑就只剩一团蓝了。
export const BASE_EXTINCT = Object.freeze({ view: [0.094, 0.036, 0.020], sun: [0.030, 0.028, 0.025], amb: [0.070, 0.046, 0.036] });
/** 水体自己的颜色（刚好在水面下、正午满日光时的散射源）：远处的水最终会沉到这个颜色 */
export const WATER_TINT = Object.freeze([0.0055, 0.070, 0.330]);

/** 未偏振的菲涅耳透射率（从空气进水），cosA：入射角的余弦（法线朝上） */
export function fresnelTransmit(cosA) {
  const sin2A = Math.max(0, 1 - cosA * cosA), sin2T = sin2A / (N_WATER * N_WATER);
  const cosT = Math.sqrt(Math.max(0, 1 - sin2T));
  const rs = ((cosA - N_WATER * cosT) / (cosA + N_WATER * cosT)) ** 2, rp = ((N_WATER * cosA - cosT) / (N_WATER * cosA + cosT)) ** 2;
  return 1 - 0.5 * (rs + rp);
}

/**
 * 阳光（或月光）穿过水面之后的方向和强度。
 * 入射：太阳高度角、方位角（度）。返回：
 *   dir    水下指向光源的单位向量（比空气里更靠近天顶：折射角最大只有 48.6°）
 *   cosA / cosW  空气里 / 水里光线和竖直方向的夹角的余弦
 *   transmit     水面的透射率
 *   spread       水平面上的照度相对水面上的倍率（= 透射率 × cosW / cosA），光线竖直了，单位面积的照度反而更高
 */
export function sunUnderwater(sunEl, sunAz) {
  const a = sunVector(sunAz, sunEl);                          // 指向太阳
  const cosA = clamp01(a[1]), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  const sinW = Math.min(0.999999, sinA / N_WATER), cosW = Math.sqrt(1 - sinW * sinW);
  const horizontal = Math.hypot(a[0], a[2]);
  const dir = sinW > 1e-9 && horizontal > 1e-9 ? [(a[0] / horizontal) * sinW, cosW, (a[2] / horizontal) * sinW] : [0, 1, 0];
  const transmit = fresnelTransmit(cosA);
  return { dir, cosA, cosW, transmit, spread: (transmit * cosW) / Math.max(cosA, 1e-4), aboveHorizon: sunEl > 0 };
}

/** 某个水质的每米衰减系数，写进 out.view / out.sun / out.amb */
export function extinction(clarityK, out = {}) {
  out.view = BASE_EXTINCT.view.map((v) => v * clarityK);
  out.sun = BASE_EXTINCT.sun.map((v) => v * clarityK);
  out.amb = BASE_EXTINCT.amb.map((v) => v * clarityK);
  return out;
}

/** 视距 t 上的透过率（逐通道），写进 out */
export function transmittance(view, t, out = [0, 0, 0]) {
  for (let k = 0; k < 3; k++) out[k] = Math.exp(-view[k] * t);
  return out;
}

/**
 * 散射光的积分：从镜头出发沿方向 v（单位向量）走到 t 米，沿途水体散射进镜头的亮度（逐通道）。
 *   源强 = σ · A0 · exp(−Kd · 深度)，深度沿途按 v.y 变化；到水面为止。
 * 这是着色器里同一条闭式解的 JS 版，测试用。
 */
export function ambientInscatter(sigma, kd, A0, depthCam, v, t, out = [0, 0, 0]) {
  const tEff = v[1] > 1e-6 ? Math.min(t, depthCam / v[1]) : t;
  for (let k = 0; k < 3; k++) {
    const b = sigma[k] - kd[k] * v[1];
    const integral = Math.abs(b) < 2e-3 ? tEff : (1 - Math.exp(-b * tEff)) / b;
    out[k] = sigma[k] * A0[k] * Math.exp(-kd[k] * depthCam) * integral;
  }
  return out;
}

