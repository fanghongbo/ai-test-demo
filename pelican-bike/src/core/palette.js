// 时刻调色盘：sRGB 颜色以 [r,g,b] (0..1) 表示，纯数据 + 插值，可 Node 测试。
// 注意：太阳方位/高度是“艺术标签”而非天文模型（见 docs/design-system.md）。
import { clamp01, lerp } from './mathx.js';

export const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
const rgb = (r, g, b) => [r, g, b];

const NIGHT = {
  sunAz: 305, sunEl: 46, sunColor: rgb(0.40, 0.50, 0.86), sunDisc: 0, moon: 1, stars: 1,
  litTint: rgb(0.60, 0.68, 1.00), shadeTint: rgb(0.27, 0.32, 0.66), coreTint: rgb(0.66, 0.68, 0.86),
  rimColor: rgb(0.72, 0.80, 1.00), rimStrength: 0.42, terminator: 0.18,
  skyTop: rgb(0.035, 0.055, 0.16), skyHorizon: rgb(0.16, 0.22, 0.44), sunGlow: rgb(0.30, 0.36, 0.66),
  seaDeep: rgb(0.035, 0.10, 0.24), seaShallow: rgb(0.10, 0.34, 0.50), seaFoam: rgb(0.78, 0.86, 1.00), seaSpec: rgb(0.85, 0.90, 1.00),
  sand: rgb(0.62, 0.60, 0.72), grass: rgb(0.22, 0.40, 0.42), ink: rgb(0.045, 0.055, 0.13),
  lamps: 1, fogDensity: 1.0, exposure: 1.0, cloud: rgb(0.30, 0.34, 0.52), cloudShade: rgb(0.14, 0.17, 0.32),
};
const DUSK = {
  sunAz: 268, sunEl: -4, sunColor: rgb(0.70, 0.56, 0.86), sunDisc: 0, moon: 0.35, stars: 0.45,
  litTint: rgb(0.96, 0.84, 0.98), shadeTint: rgb(0.46, 0.40, 0.78), coreTint: rgb(0.70, 0.66, 0.90),
  rimColor: rgb(1.00, 0.74, 0.62), rimStrength: 0.5, terminator: 0.22,
  skyTop: rgb(0.16, 0.18, 0.44), skyHorizon: rgb(0.98, 0.56, 0.44), sunGlow: rgb(1.00, 0.62, 0.46),
  seaDeep: rgb(0.10, 0.12, 0.32), seaShallow: rgb(0.36, 0.28, 0.48), seaFoam: rgb(0.96, 0.80, 0.82), seaSpec: rgb(1.00, 0.72, 0.56),
  sand: rgb(0.72, 0.56, 0.62), grass: rgb(0.26, 0.30, 0.44), ink: rgb(0.10, 0.07, 0.17),
  lamps: 0.85, fogDensity: 1.05, exposure: 1.0, cloud: rgb(0.86, 0.54, 0.56), cloudShade: rgb(0.46, 0.32, 0.56),
};
const SUNSET = {
  sunAz: 262, sunEl: 7, sunColor: rgb(1.00, 0.74, 0.50), sunDisc: 1, moon: 0, stars: 0,
  litTint: rgb(1.08, 0.94, 0.82), shadeTint: rgb(0.58, 0.54, 0.90), coreTint: rgb(0.76, 0.72, 0.94),
  rimColor: rgb(1.00, 0.84, 0.62), rimStrength: 0.55, terminator: 0.24,
  skyTop: rgb(0.30, 0.46, 0.82), skyHorizon: rgb(1.00, 0.74, 0.50), sunGlow: rgb(1.00, 0.72, 0.46),
  seaDeep: rgb(0.09, 0.34, 0.56), seaShallow: rgb(0.42, 0.70, 0.74), seaFoam: rgb(1.00, 0.94, 0.90), seaSpec: rgb(1.00, 0.88, 0.62),
  sand: rgb(0.93, 0.74, 0.56), grass: rgb(0.40, 0.62, 0.42), ink: rgb(0.16, 0.11, 0.25),
  lamps: 0.15, fogDensity: 1.0, exposure: 1.0, cloud: rgb(1.00, 0.88, 0.78), cloudShade: rgb(0.78, 0.58, 0.72),
};
const AFTERNOON = {
  sunAz: 232, sunEl: 40, sunColor: rgb(1.00, 0.94, 0.84), sunDisc: 1, moon: 0, stars: 0,
  litTint: rgb(1.04, 1.00, 0.94), shadeTint: rgb(0.60, 0.66, 0.95), coreTint: rgb(0.80, 0.79, 0.93),
  rimColor: rgb(1.00, 0.98, 0.92), rimStrength: 0.4, terminator: 0.22,
  skyTop: rgb(0.20, 0.58, 0.92), skyHorizon: rgb(0.76, 0.90, 0.97), sunGlow: rgb(1.00, 0.96, 0.84),
  seaDeep: rgb(0.06, 0.52, 0.74), seaShallow: rgb(0.34, 0.84, 0.84), seaFoam: rgb(1.00, 1.00, 1.00), seaSpec: rgb(1.00, 1.00, 0.96),
  sand: rgb(0.95, 0.85, 0.62), grass: rgb(0.46, 0.78, 0.42), ink: rgb(0.13, 0.12, 0.26),
  lamps: 0, fogDensity: 1.0, exposure: 1.0, cloud: rgb(1.00, 1.00, 1.00), cloudShade: rgb(0.74, 0.78, 0.94),
};
const NOON = {
  sunAz: 190, sunEl: 66, sunColor: rgb(1.00, 0.98, 0.92), sunDisc: 1, moon: 0, stars: 0,
  litTint: rgb(1.03, 1.01, 0.97), shadeTint: rgb(0.62, 0.70, 0.98), coreTint: rgb(0.82, 0.82, 0.96),
  rimColor: rgb(1.00, 1.00, 1.00), rimStrength: 0.34, terminator: 0.2,
  skyTop: rgb(0.16, 0.52, 0.92), skyHorizon: rgb(0.80, 0.92, 0.98), sunGlow: rgb(1.00, 1.00, 0.94),
  seaDeep: rgb(0.05, 0.55, 0.78), seaShallow: rgb(0.36, 0.88, 0.86), seaFoam: rgb(1.00, 1.00, 1.00), seaSpec: rgb(1.00, 1.00, 1.00),
  sand: rgb(0.97, 0.88, 0.66), grass: rgb(0.48, 0.80, 0.40), ink: rgb(0.13, 0.12, 0.26),
  lamps: 0, fogDensity: 0.9, exposure: 1.0, cloud: rgb(1.00, 1.00, 1.00), cloudShade: rgb(0.76, 0.80, 0.96),
};
const MORNING = {
  sunAz: 112, sunEl: 30, sunColor: rgb(1.00, 0.90, 0.74), sunDisc: 1, moon: 0, stars: 0,
  litTint: rgb(1.06, 0.98, 0.90), shadeTint: rgb(0.64, 0.66, 0.96), coreTint: rgb(0.82, 0.80, 0.94),
  rimColor: rgb(1.00, 0.96, 0.86), rimStrength: 0.4, terminator: 0.22,
  skyTop: rgb(0.26, 0.60, 0.92), skyHorizon: rgb(0.88, 0.88, 0.86), sunGlow: rgb(1.00, 0.94, 0.80),
  seaDeep: rgb(0.07, 0.50, 0.72), seaShallow: rgb(0.38, 0.82, 0.82), seaFoam: rgb(1.00, 1.00, 1.00), seaSpec: rgb(1.00, 0.98, 0.90),
  sand: rgb(0.95, 0.84, 0.64), grass: rgb(0.46, 0.78, 0.42), ink: rgb(0.14, 0.12, 0.26),
  lamps: 0, fogDensity: 1.15, exposure: 1.0, cloud: rgb(1.00, 0.98, 0.96), cloudShade: rgb(0.78, 0.80, 0.92),
};
const DAWN = {
  sunAz: 94, sunEl: 5, sunColor: rgb(1.00, 0.78, 0.64), sunDisc: 1, moon: 0.15, stars: 0.12,
  litTint: rgb(1.08, 0.96, 0.90), shadeTint: rgb(0.66, 0.62, 0.94), coreTint: rgb(0.82, 0.78, 0.94),
  rimColor: rgb(1.00, 0.86, 0.74), rimStrength: 0.55, terminator: 0.24,
  skyTop: rgb(0.36, 0.54, 0.84), skyHorizon: rgb(1.00, 0.78, 0.66), sunGlow: rgb(1.00, 0.78, 0.60),
  seaDeep: rgb(0.14, 0.40, 0.62), seaShallow: rgb(0.52, 0.74, 0.78), seaFoam: rgb(1.00, 0.96, 0.94), seaSpec: rgb(1.00, 0.86, 0.70),
  sand: rgb(0.93, 0.78, 0.66), grass: rgb(0.44, 0.66, 0.48), ink: rgb(0.18, 0.13, 0.27),
  lamps: 0.25, fogDensity: 1.5, exposure: 1.0, cloud: rgb(1.00, 0.86, 0.82), cloudShade: rgb(0.80, 0.66, 0.80),
};

/** 一天 24 小时的关键帧（h 为小时）。首尾均为深夜，保证循环闭合。 */
export const TOD_KEYS = Object.freeze([
  { h: 0, p: NIGHT }, { h: 4.4, p: NIGHT }, { h: 6.0, p: DAWN }, { h: 8.6, p: MORNING }, { h: 12.6, p: NOON },
  { h: 15.8, p: AFTERNOON }, { h: 18.2, p: SUNSET }, { h: 19.3, p: DUSK }, { h: 20.6, p: NIGHT }, { h: 24, p: NIGHT },
]);

export const TOD_PRESETS = Object.freeze([
  { id: 'dawn', label: '清晨', h: 6.1, emoji: '🌅' },
  { id: 'day', label: '白天', h: 13.0, emoji: '☀️' },
  { id: 'sunset', label: '黄昏', h: 18.2, emoji: '🌇' },
  { id: 'night', label: '夜晚', h: 22.0, emoji: '🌙' },
]);

const COLOR_KEYS = Object.keys(NIGHT).filter((k) => Array.isArray(NIGHT[k]));
const NUM_KEYS = Object.keys(NIGHT).filter((k) => !Array.isArray(NIGHT[k]));
export const PALETTE_KEYS = [...COLOR_KEYS, ...NUM_KEYS];

function mixColor(a, b, t, out) { for (let i = 0; i < 3; i++) out[i] = lerp(a[i], b[i], t); return out; }

/**
 * 在小时 hour（可为任意实数，自动取模 24）处插值调色盘。out 复用已有数组以避免分配。
 */
export function samplePalette(hour, out = {}) {
  hour = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < TOD_KEYS.length - 2 && hour >= TOD_KEYS[i + 1].h) i++;
  const a = TOD_KEYS[i], b = TOD_KEYS[i + 1];
  const t = clamp01((hour - a.h) / (b.h - a.h));
  const u = t * t * (3 - 2 * t); // 平滑过渡，避免折点处亮度折线感
  for (const k of COLOR_KEYS) { out[k] = out[k] || [0, 0, 0]; mixColor(a.p[k], b.p[k], u, out[k]); }
  for (const k of NUM_KEYS) out[k] = lerp(a.p[k], b.p[k], u);
  out.hour = hour;
  out.label = presetForHour(hour).label;
  return out;
}

/** 取最接近的预设（仅用于 UI 标签） */
export function presetForHour(hour) {
  hour = ((hour % 24) + 24) % 24;
  let best = TOD_PRESETS[0], bd = 1e9;
  for (const p of TOD_PRESETS) {
    let d = Math.abs(p.h - hour); d = Math.min(d, 24 - d);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/** 把小时格式化为 HH:MM */
export function formatClock(hour) {
  hour = ((hour % 24) + 24) % 24;
  const h = Math.floor(hour), m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
