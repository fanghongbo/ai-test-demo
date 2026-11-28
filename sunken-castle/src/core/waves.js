// 海面波谱：一列列深水波叠加（色散关系 ω² = g·k）。水面着色、焦散、浮体的起伏用的都是这一组波，所以三者永远对得上。
// 波数取整数格点（k = 2π·(mx, mz) / TILE），整片海面以 TILE 为周期，焦散贴图才能无缝平铺。
// 纯数据 + 纯计算，不依赖 three，可在 Node 里测试。
import { DEG } from './mathx.js';

export const G = 9.81;
export const TILE = 24;                                       // 一个周期的边长（米）
/** [mx, mz, 振幅 m]：波长 = TILE / √(mx² + mz²) */
const SET = [
  [1, 0, 0.080], [0, 1, 0.040], [2, 1, 0.036], [1, -2, 0.036], [3, 2, 0.032], [-2, 5, 0.024], [5, 3, 0.028], [7, -4, 0.021], [4, 7, 0.021],
  [-5, 9, 0.0144], [9, 5, 0.0144], [11, -8, 0.0096], [6, 13, 0.0088], [15, 4, 0.0072], [8, -15, 0.0064], [17, 11, 0.0036], [13, -16, 0.0032],
];
const TAU = Math.PI * 2;

/** 每列波：kx / kz 波数（rad/m），A 振幅，w 角频率（rad/s） */
export const WAVE_LIST = Object.freeze(SET.map(([mx, mz, A], i) => {
  const kx = (TAU * mx) / TILE, kz = (TAU * mz) / TILE;
  return Object.freeze({ kx, kz, A, w: Math.sqrt(G * Math.hypot(kx, kz)), ph: (i * 2.399963) % TAU, len: TILE / Math.hypot(mx, mz) });
}));

/** 有义波高（米）和坡度均方根，描述这片海况 */
export function seaState() {
  let a2 = 0, s2 = 0;
  for (const w of WAVE_LIST) { a2 += w.A * w.A / 2; s2 += (w.A * w.A) * (w.kx * w.kx + w.kz * w.kz) / 2; }
  return { hs: 4 * Math.sqrt(a2), slopeRms: Math.sqrt(s2) };
}

/** 高度（米）。sea 0..1：海况强度（振幅的倍率），0 是镜面 */
export function waveHeight(x, z, t, sea = 1) {
  let h = 0;
  for (const w of WAVE_LIST) h += sea * w.A * Math.cos(w.kx * x + w.kz * z - w.w * t + w.ph);
  return h;
}

/** 坡度 ∂h/∂x、∂h/∂z，写进 out[0..1] */
export function waveSlope(x, z, t, out = [0, 0], sea = 1) {
  let sx = 0, sz = 0;
  for (const w of WAVE_LIST) {
    const s = sea * w.A * Math.sin(w.kx * x + w.kz * z - w.w * t + w.ph);
    sx -= s * w.kx; sz -= s * w.kz;
  }
  out[0] = sx; out[1] = sz;
  return out;
}

/** 着色器里的同一套波：常量表 + 两个函数。uniform 只有 uWTime（秒）和 uWSea（海况强度） */
export const WAVE_GLSL = /* glsl */`
const int WAVE_N = ${WAVE_LIST.length};
const vec4 WAVE_KA[WAVE_N] = vec4[WAVE_N](${WAVE_LIST.map((w) => `vec4( ${w.kx.toFixed(6)}, ${w.kz.toFixed(6)}, ${w.A.toFixed(5)}, ${w.ph.toFixed(5)} )`).join(', ')});
const vec4 WAVE_WL[WAVE_N] = vec4[WAVE_N](${WAVE_LIST.map((w) => `vec4( ${w.w.toFixed(6)}, ${w.len.toFixed(5)}, 0.0, 0.0 )`).join(', ')});
uniform float uWTime, uWSea;
float waveHeight( vec2 p ) {
  float h = 0.0;
  for ( int i = 0; i < WAVE_N; i ++ ) { vec4 w = WAVE_KA[ i ]; h += w.z * cos( dot( w.xy, p ) - WAVE_WL[ i ].x * uWTime + w.w ); }
  return h * uWSea;
}
void waveSlope( vec2 p, out vec2 s ) {
  s = vec2( 0.0 );
  for ( int i = 0; i < WAVE_N; i ++ ) {
    vec4 w = WAVE_KA[ i ];
    s -= ( w.z * sin( dot( w.xy, p ) - WAVE_WL[ i ].x * uWTime + w.w ) ) * w.xy;
  }
  s *= uWSea;
}
`;
