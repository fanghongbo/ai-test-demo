// 时刻关键帧：太阳高度 / 方位 → 物理大气（gfx/skyenv.js），另带曝光、雾、云量。纯数据，可 Node 测试。
// 方位与 core/skymodel.js 的 sunVector 同一套约定：0° = +Z（南），90° = +X（东），180° = −Z（北），270° = −X（西）。
// 十一城是北半球的海上城市：太阳从东边升起，越过南天，从西边落下。
import { clamp01, lerp } from './mathx.js';

/** 大气层顶的太阳辐照度（场景单位） */
export const SUN_E = 7;
export const MIE_G = 0.76;                 // 米氏散射的非对称参数
export const MULTI_SCATTER = 0.12;         // 多次散射的经验补光
const K = (sunEl, sunAz, turbidity, cloud, fog, exposure) => ({ sunEl, sunAz, turbidity, cloud, fog, exposure });
const NIGHT = K(-34, 300, 2.6, 0.30, 0.85e-3, 6.02);

export const KEYS = Object.freeze([
  { h: 0, p: NIGHT }, { h: 4.8, p: NIGHT },
  { h: 5.6, p: K(-5, 96, 3.8, 0.40, 1.20e-3, 2.75) },      // 天亮前
  { h: 6.4, p: K(4, 95, 3.6, 0.42, 1.05e-3, 1.33) },      // 日出
  { h: 7.4, p: K(15, 90, 2.2, 0.38, 0.70e-3, 0.95) },
  { h: 9.5, p: K(40, 72, 1.5, 0.38, 0.44e-3, 0.76) },
  { h: 12.0, p: K(68, 14, 1.25, 0.36, 0.35e-3, 0.69) },
  { h: 13.6, p: K(74, 342, 1.2, 0.36, 0.33e-3, 0.67) },   // 默认：正午过后一点，太阳在南偏西、很高
  { h: 15.5, p: K(55, 312, 1.4, 0.36, 0.36e-3, 0.72) },   // 午后：影子开始拉长
  { h: 17.4, p: K(24, 288, 2.6, 0.44, 0.40e-3, 0.80) },
  { h: 18.4, p: K(6, 281, 4.2, 0.42, 0.50e-3, 0.82) },    // 黄金时刻
  { h: 19.1, p: K(-3, 278, 3.8, 0.38, 0.70e-3, 1.70) },
  { h: 20.2, p: K(-16, 290, 3.2, 0.34, 1.00e-3, 4.47) },
  { h: 21.4, p: K(-30, 298, 2.8, 0.32, 0.90e-3, 5.68) },
  { h: 24, p: NIGHT },
]);

/** 可选时刻（大厅里选） */
export const TIMES = Object.freeze([
  { id: 'morning', name: '上午', hour: 9.5 }, { id: 'day', name: '白天', hour: 13.6 },
  { id: 'afternoon', name: '午后', hour: 15.5 }, { id: 'dusk', name: '黄昏', hour: 18.25 }, { id: 'night', name: '夜晚', hour: 22.0 },
]);
export const DEFAULT_HOUR = 15.5;                                 // 午后：太阳在西南、高 55°，影子拉长，光偏暖

/** 月亮：方位 335°（南偏西）、高度 40° */
export const MOON = Object.freeze({ el: 40, az: 335 });

export function sampleHour(hour, out = {}) {
  hour = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYS.length - 2 && hour >= KEYS[i + 1].h) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = clamp01((hour - a.h) / (b.h - a.h)), u = t * t * (3 - 2 * t);
  for (const k of Object.keys(a.p)) out[k] = lerp(a.p[k], b.p[k], u);
  out.hour = hour;
  return out;
}

/** 太阳高度角（度）→ 夜晚系数：太阳在 2° 以上为 0，落到 -6° 以下为 1 */
export function nightFactor(sunEl) { const t = clamp01((sunEl + 6) / 4); return 1 - t * t * (3 - 2 * t); }

/** 人造光（路灯、窗、霓虹、车灯）的强度：太阳落到 +4° 开始亮，到 -4° 全亮 */
export function lampFactor(sunEl) { const t = clamp01((4 - sunEl) / 8); return t * t * (3 - 2 * t); }
