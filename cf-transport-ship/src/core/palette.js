// 时刻关键帧：太阳高度 / 方位 → 物理大气（gfx/skyenv.js），另带曝光、雾、云量。纯数据，可 Node 测试。
// 方位与 core/skymodel.js 的 sunVector 同一套约定：sunAz 从 +Z（右舷）转向 +X（船头），即罗盘方位（北 = -Z）。
// 这条太阳路径是艺术设定：从右舷升起，正午前后越过船尾，从左舷船头方向落下——
// 默认的午后时刻，阳光斜着越过左舷（-Z）的高墙照进主甲板，一半明一半暗。
import { clamp01, lerp } from './mathx.js';

/** 大气层顶的太阳辐照度（场景单位） */
export const SUN_E = 7;
export const MIE_G = 0.76;                 // 米氏散射的非对称参数
export const MULTI_SCATTER = 0.12;         // 多次散射的经验补光
const K = (sunEl, sunAz, turbidity, cloud, fog, exposure) => ({ sunEl, sunAz, turbidity, cloud, fog, exposure });
const NIGHT = K(-34, 300, 3.2, 0.34, 1.10e-3, 7.5);

export const KEYS = Object.freeze([
  { h: 0, p: NIGHT }, { h: 4.6, p: NIGHT },
  { h: 5.5, p: K(-4, 358, 3.6, 0.40, 1.30e-3, 3.0) },      // 蓝调时刻
  { h: 6.7, p: K(10, 346, 3.4, 0.44, 1.20e-3, 1.30) },     // 清晨
  { h: 9.0, p: K(34, 290, 2.6, 0.40, 0.85e-3, 0.82) },
  { h: 12.5, p: K(74, 188, 2.0, 0.36, 0.70e-3, 0.74) },    // 正午
  { h: 15.5, p: K(38, 125, 2.4, 0.42, 0.75e-3, 0.92) },    // 默认：午后
  { h: 17.6, p: K(14, 108, 3.2, 0.40, 0.90e-3, 0.90) },
  { h: 18.4, p: K(3.5, 102, 3.8, 0.38, 1.00e-3, 1.55) },   // 黄金时刻
  { h: 19.2, p: K(-5, 100, 3.4, 0.34, 1.15e-3, 2.7) },
  { h: 20.4, p: K(-24, 98, 3.0, 0.32, 1.20e-3, 6.5) },
  { h: 24, p: NIGHT },
]);

/** 可选时刻（大厅里选，也对应按键 T 循环） */
export const TIMES = Object.freeze([
  { id: 'dawn', name: '清晨', hour: 6.9 }, { id: 'day', name: '白天', hour: 15.5 },
  { id: 'dusk', name: '黄昏', hour: 18.25 }, { id: 'night', name: '夜晚', hour: 22.0 },
]);

/** 月亮：方位 300°（船尾偏右舷）、高度 36° */
export const MOON = Object.freeze({ el: 36, az: 300 });

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

/** 人造光（甲板灯、舱室灯、舷灯、窗）的强度：太阳落到 +4° 开始亮，到 -4° 全亮 */
export function lampFactor(sunEl) { const t = clamp01((4 - sunEl) / 8); return t * t * (3 - 2 * t); }
