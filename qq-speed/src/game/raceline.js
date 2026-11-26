// 赛车线：在赛道中心线的基础上逐点调整横向偏移，让整条线的曲率平方和最小——弯里自然走出“外—内—外”。
// 再按线上的曲率算一条速度曲线（弯里多慢、直道多快、该从哪里开始刹车）。电脑车手照着它开；不依赖 three。
import { pointAt, rightAt, WALL } from '../core/trackdef.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/**
 * @param {object} T createTrack()
 * @param {object} o margin 离墙至少留几米；aLatDrift 漂移时的横向加速度；aBr 刹车减速度；vMax 速度曲线的上限（m/s）
 * @returns {{ lat: Float32Array, k: Float32Array, v: Float32Array, x: Float32Array, z: Float32Array, tight: number[] }}
 *          lat 每个采样点的横向偏移；k 赛车线的有符号曲率（右弯为正）；v 该点的目标速度；tight 最急的几个弯的采样号
 */
export function buildRacingLine(T, o = {}) {
  const N = T.N, margin = o.margin ?? 3.0, iter = o.iter ?? 420;
  const aLat = o.aLatDrift ?? 28, aBr = o.aBr ?? 20, vMax = o.vMax ?? 54, vMin = o.vMin ?? 10.5;
  const lat = new Float32Array(N), lim = new Float32Array(N), px = new Float64Array(N), pz = new Float64Array(N);
  const ddx = new Float64Array(N), ddz = new Float64Array(N), g = new Float64Array(N), RX = new Float64Array(N), RZ = new Float64Array(N);
  for (let i = 0; i < N; i++) { lim[i] = Math.max(0.6, T.hw[i] + WALL - margin); const r = rightAt(T, i); RX[i] = r[0]; RZ[i] = r[1]; }
  for (let it = 0; it < iter; it++) {
    for (let i = 0; i < N; i++) { px[i] = T.x[i] + RX[i] * lat[i]; pz[i] = T.z[i] + RZ[i] * lat[i]; }
    for (let i = 0; i < N; i++) { const a = (i + N - 1) % N, b = (i + 1) % N; ddx[i] = px[a] - 2 * px[i] + px[b]; ddz[i] = pz[a] - 2 * pz[i] + pz[b]; }
    let gm = 1e-9;
    for (let i = 0; i < N; i++) {
      const a = (i + N - 1) % N, b = (i + 1) % N;
      g[i] = (ddx[a] - 2 * ddx[i] + ddx[b]) * RX[i] + (ddz[a] - 2 * ddz[i] + ddz[b]) * RZ[i];
      gm = Math.max(gm, Math.abs(g[i]));
    }
    const step = 0.5 * Math.pow(1 - it / iter, 0.6) + 0.02;                // 步长先大后小：先快速切弯，再慢慢收细
    for (let i = 0; i < N; i++) lat[i] = clamp(lat[i] - (step * g[i]) / gm, -lim[i], lim[i]);
  }
  // 曲率：相邻两段方向的夹角 / 段长
  const k = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i + N - 1) % N, b = (i + 1) % N;
    const ax = px[i] - px[a], az = pz[i] - pz[a], bx = px[b] - px[i], bz = pz[b] - pz[i];
    k[i] = wrap(Math.atan2(ax * bz - az * bx, ax * bx + az * bz)) / (0.5 * (Math.hypot(ax, az) + Math.hypot(bx, bz)));
  }
  for (let pass = 0; pass < 2; pass++) { const s = k.slice(); for (let i = 0; i < N; i++) k[i] = (s[(i + N - 1) % N] + s[i] * 2 + s[(i + 1) % N]) * 0.25; }
  // 速度曲线：弯里按横向加速度上限，直道封顶；再倒着推两圈，把刹车距离算进去
  const v = new Float32Array(N), ds = T.ds;
  for (let i = 0; i < N; i++) v[i] = clamp(Math.sqrt(aLat / Math.max(Math.abs(k[i]), 1e-4)), vMin, vMax);
  for (let pass = 0; pass < 2; pass++) for (let j = 2 * N - 1; j >= 0; j--) {
    const i = j % N, n = (i + 1) % N;
    v[i] = Math.min(v[i], Math.sqrt(v[n] * v[n] + 2 * aBr * ds));
  }
  // 最急的几个弯（排位、 HUD 提示用）
  const tight = [];
  for (let i = 0; i < N; i++) if (Math.abs(k[i]) > 1 / 34 && (tight.length === 0 || (i - tight[tight.length - 1] + N) % N > 20)) tight.push(i);
  return { lat, k, v, x: Float32Array.from(px), z: Float32Array.from(pz), tight };
}

/** 赛车线上第 i 个采样、再往前 s 米处的点（给 HUD 小地图、镜头用） */
export function lineAt(RL, T, i, s = 0, out = [0, 0]) {
  const j = ((Math.round(i + s / T.ds) % T.N) + T.N) % T.N;
  out[0] = RL.x[j]; out[1] = RL.z[j];
  return out;
}
export { pointAt };
