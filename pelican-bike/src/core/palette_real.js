// 写实风格的时刻关键帧（纯数据，可 Node 测试）。与赛璐璐调色盘用同一组时刻点，太阳方位沿用调色盘，
// 太阳高度在这里另行定义：调色盘的“夜晚太阳”是月光的方向标签，写实模式需要真实的日出日落曲线（含曙暮光）。
// 其它参数直接驱动物理大气模型：浑浊度、云量、雾密度、曝光。
import { clamp01, lerp } from './mathx.js';

/** 大气层顶的太阳辐照度（场景单位）。白骨在正午下的辐射 ≈ 2.4，18% 灰 ≈ 0.43 */
export const SUN_E = 7;
export const MIE_G = 0.76;                // 米氏散射的非对称参数（前向散射的集中程度）
export const MULTI_SCATTER = 0.12;      // 多次散射的补光强度（经验值：让天顶亮度对上实测）
const K = (sunEl, turbidity, cloud, fog, exposure, mist) => ({ sunEl, turbidity, cloud, fog, exposure, mist });

const NIGHT = K(-34, 2.8, 0.30, 1.35e-3, 7.0, 0.25);
export const REAL_KEYS = Object.freeze([
  { h: 0, p: NIGHT }, { h: 4.4, p: NIGHT },
  { h: 6.0, p: K(5, 3.6, 0.46, 1.30e-3, 1.5, 0.8) },       // 清晨：薄雾、天光偏暖
  { h: 8.6, p: K(30, 2.4, 0.40, 0.85e-3, 0.78, 0.3) },
  { h: 12.6, p: K(66, 1.6, 0.34, 0.62e-3, 0.72, 0.0) },
  { h: 15.8, p: K(40, 2.0, 0.42, 0.70e-3, 0.76, 0.0) },
  { h: 18.2, p: K(6.5, 3.8, 0.40, 0.95e-3, 0.95, 0.1) },   // 黄金时刻
  { h: 19.3, p: K(-5.5, 3.4, 0.34, 1.15e-3, 2.7, 0.5) },   // 蓝调时刻（民用曙暮光）
  { h: 20.6, p: K(-24, 2.8, 0.30, 1.35e-3, 7.0, 0.25) },
  { h: 24, p: NIGHT },
]);

export function sampleReal(hour, out = {}) {
  hour = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < REAL_KEYS.length - 2 && hour >= REAL_KEYS[i + 1].h) i++;
  const a = REAL_KEYS[i], b = REAL_KEYS[i + 1];
  const t = clamp01((hour - a.h) / (b.h - a.h)), u = t * t * (3 - 2 * t);
  for (const k of Object.keys(a.p)) out[k] = lerp(a.p[k], b.p[k], u);
  out.hour = hour;
  return out;
}

/** 太阳高度角（度）→ 夜晚系数：太阳在 2° 以上为 0，落到 -6° 以下为 1 */
export function nightFactor(sunEl) { return smooth(-2, -6, sunEl); }
function smooth(a, b, x) { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
