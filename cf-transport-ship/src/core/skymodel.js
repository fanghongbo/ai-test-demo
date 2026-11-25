// 大气模型（纯 JS，零依赖）。
// 1) 透射率查找表：高度 × 天顶角 → 沿射向太空的光程（瑞利 / 米氏 / 臭氧三个分量），在球面地球上暴力积分得到，
//    自然包含地球阴影（日落后的曙暮光）和高空样本仍被照亮的效果。表与大气参数无关，启动时建一次。
// 2) 沿视线的内散射积分：JS 与 GLSL（gfx/skyphys_glsl.js）是同一套公式，有单元测试比对。
import { clamp01, lerp } from './mathx.js';

export const ATM = Object.freeze({
  R0: 6360e3, R1: 6420e3,                                    // 地球半径、大气层顶（米）
  HR: 8000, HM: 1200,                                        // 瑞利、米氏的标高（米）
  BETA_R: [5.5e-6, 13.0e-6, 22.4e-6], BETA_M: 21e-6,         // 海平面散射系数（1/m）
  BETA_O3: [0.65e-6, 1.881e-6, 0.085e-6],                    // 臭氧吸收（Chappuis 带）：曙暮光偏蓝靠它
});
export const LUT = Object.freeze({ W: 128, H: 48, TOP: 80000, SHADOW: 1e5 });
export const SKY_SAMPLES = 24;
export const NIGHT_SKY = Object.freeze({ zenith: [0.0022, 0.0040, 0.0105], horizon: [0.0075, 0.0110, 0.0200] });

/** 查找表的两个非线性坐标：高度平方分布（近地面密），天顶角余弦带符号开方（地平线附近密） */
export const lutAlt = (v) => LUT.TOP * v * v;
export const lutCos = (u) => { const s = 2 * u - 1; return s * Math.abs(s); };

function density(h, out) {
  out[0] = Math.exp(-h / ATM.HR);
  out[1] = Math.exp(-h / ATM.HM);
  out[2] = Math.max(0, 1 - Math.abs(h - 25000) / 15000);       // 臭氧层：中心 25 km，半宽 15 km
  return out;
}

/** 建透射率表：Float32(W×H×4)，rgb = (瑞利光程 m, 米氏光程 m, 臭氧光程 m) */
export function buildTransmittanceLUT() {
  const { W, H } = LUT, data = new Float32Array(W * H * 4), N = 96, d0 = [0, 0, 0], d1 = [0, 0, 0];
  for (let j = 0; j < H; j++) {
    const h = lutAlt((j + 0.5) / H), r = ATM.R0 + h;
    for (let i = 0; i < W; i++) {
      const c = lutCos((i + 0.5) / W), k = (j * W + i) * 4, b = r * c;
      const discG = b * b - (r * r - ATM.R0 * ATM.R0);
      if (discG > 0 && -b - Math.sqrt(discG) > 0) { data[k] = data[k + 1] = data[k + 2] = LUT.SHADOW; continue; }   // 射线撞地：在地球阴影里
      const s = Math.sqrt(Math.max(0, 1 - c * c)), sMax = -b + Math.sqrt(Math.max(b * b - (r * r - ATM.R1 * ATM.R1), 0));
      density(h, d0);
      let odR = 0, odM = 0, odO = 0, tPrev = 0, hPrev = h;
      for (let n = 1; n <= N; n++) {                           // 步长三次方分布：起点附近密
        const t = sMax * (n / N) ** 3, x = s * t, y = r + c * t;
        const h1 = Math.max(Math.sqrt(x * x + y * y) - ATM.R0, 0), dh = h1 - hPrev;
        density(h1, d1);
        // 指数密度在“高度沿步长线性变化”的假设下有解析积分：(dt / dh) · H · (ρ(h0) − ρ(h1))，比梯形法准得多
        const expo = (H, r0, r1) => (Math.abs(dh) < 1e-4 ? (t - tPrev) * r0 : ((t - tPrev) / dh) * H * (r0 - r1));
        odR += expo(ATM.HR, d0[0], d1[0]); odM += expo(ATM.HM, d0[1], d1[1]); odO += 0.5 * (d0[2] + d1[2]) * (t - tPrev);
        tPrev = t; hPrev = h1; d0[0] = d1[0]; d0[1] = d1[1]; d0[2] = d1[2];
      }
      data[k] = odR; data[k + 1] = odM; data[k + 2] = odO;
    }
  }
  return data;
}

/** 双线性取样：返回 [瑞利光程, 米氏光程, 臭氧光程]（与 GLSL 的 skyLut 逐式对应）。out 复用，不传则新分配 */
export function lutSample(lut, h, c, out = [0, 0, 0]) {
  const { W, H } = LUT;
  const s = clamp01(c * 0.5 + 0.5) * 2 - 1;
  const v = Math.sqrt(clamp01(h / LUT.TOP)) * H - 0.5, u = (Math.sqrt(Math.abs(s)) * Math.sign(s) + 1) * 0.5 * W - 0.5;
  const j0 = Math.max(0, Math.min(H - 1, Math.floor(v))), i0 = Math.max(0, Math.min(W - 1, Math.floor(u)));
  const j1 = Math.min(H - 1, j0 + 1), i1 = Math.min(W - 1, i0 + 1);
  const fv = clamp01(v - j0), fu = clamp01(u - i0);
  for (let k = 0; k < 3; k++) {
    const a = lut[(j0 * W + i0) * 4 + k], b = lut[(j0 * W + i1) * 4 + k], c2 = lut[(j1 * W + i0) * 4 + k], d = lut[(j1 * W + i1) * 4 + k];
    out[k] = lerp(lerp(a, b, fu), lerp(c2, d, fu), fv);
  }
  return out;
}

/** 从高度 h 沿天顶角余弦 c 的方向看向太空的透射率（即直射光颜色）。out 复用 */
export function transmittance(lut, h, c, turbidity, rayleigh, out = [0, 0, 0]) {
  const od = lutSample(lut, h, c);
  for (let k = 0; k < 3; k++) out[k] = Math.exp(-(ATM.BETA_R[k] * rayleigh * od[0] + ATM.BETA_M * turbidity * od[1] + ATM.BETA_O3[k] * od[2]));
  return out;
}

/** 沿视线的内散射（线性辐射）。视线落到地平线以下时按贴地处理（穹顶下半部延用海平线颜色）。 */
export function skyRadiance(lut, dir, sun, a, o = {}) {
  const N = o.samples ?? SKY_SAMPLES, turb = a.turbidity ?? 2.5, ray = a.rayleigh ?? 1, g = a.mieG ?? 0.8, E = a.sunE ?? 7;
  const n = Math.hypot(dir[0], Math.max(dir[1], 0), dir[2]) || 1;
  const dx = dir[0] / n, dy = Math.max(dir[1], 0) / n, dz = dir[2] / n;
  const b = ATM.R0 * dy, tMax = -b + Math.sqrt(b * b - (ATM.R0 * ATM.R0 - ATM.R1 * ATM.R1));
  const extR = ATM.BETA_R.map((v) => v * ray), extM = ATM.BETA_M * turb;
  const sumR = [0, 0, 0], sumM = [0, 0, 0], odA = [0, 0, 0], odB = [0, 0, 0];
  for (let i = 0; i < N; i++) {
    const f0 = (i / N) ** 3, f1 = ((i + 1) / N) ** 3, t = tMax * 0.5 * (f0 + f1), dt = tMax * (f1 - f0);   // 段中点 + 段长（步长三次方分布）
    const x = dx * t, y = ATM.R0 + dy * t, z = dz * t, r = Math.sqrt(x * x + y * y + z * z), h = r - ATM.R0;
    const ux = x / r, uy = y / r, uz = z / r;
    const Tv = lutSample(lut, h, ux * dx + uy * dy + uz * dz, odA), Ts = lutSample(lut, h, ux * sun[0] + uy * sun[1] + uz * sun[2], odB);
    const rhoR = Math.exp(-h / ATM.HR), rhoM = Math.exp(-h / ATM.HM);
    for (let k = 0; k < 3; k++) {
      const T = Math.exp(-(extR[k] * Tv[0] + extM * Tv[1] + ATM.BETA_O3[k] * Tv[2])) * Math.exp(-(extR[k] * Ts[0] + extM * Ts[1] + ATM.BETA_O3[k] * Ts[2]));
      sumR[k] += T * rhoR * dt; sumM[k] += T * rhoM * dt;
    }
  }
  const mu = dx * sun[0] + dy * sun[1] + dz * sun[2], g2 = g * g;
  const phR = 3 / (16 * Math.PI) * (1 + mu * mu);
  const phM = 3 / (8 * Math.PI) * ((1 - g2) * (1 + mu * mu)) / ((2 + g2) * Math.pow(1 + g2 - 2 * g * mu, 1.5));
  const rgb = [0, 0, 0], sunT = [0, 0, 0], msT = [0, 0, 0];
  transmittance(lut, 0, sun[1], turb, ray, sunT);
  const od0 = lutSample(lut, 0, sun[1], odA);
  const lost = 1 - Math.exp(-(extR[0] + extR[1] + extR[2]) / 3 * od0[0]);     // 被瑞利散射掉的阳光（按平均消光）
  for (let k = 0; k < 3; k++) msT[k] = lost * ATM.BETA_R[k] * ray / 1.3333e-5;     // 多次散射是瑞利主导的：颜色取瑞利系数的比值
  // 多次散射近似：单次散射会把天顶算暗 2~3 倍（实测晴空天顶约为这里单次散射值的 3 倍，地平线则基本吻合），
  // 所以按平坦底光补，颜色取瑞利散射掉的阳光比例；地平线附近单次散射已经饱和，只略多给一点
  const s0 = clamp01((sun[1] + 0.05) / 0.1), ms = (a.multiScatter ?? 0.12) * s0 * s0 * (3 - 2 * s0), w = 0.72 + 0.28 * (1 - dy) * (1 - dy);
  for (let k = 0; k < 3; k++) rgb[k] = E * (sumR[k] * extR[k] * phR + sumM[k] * extM * phM + ms * w * msT[k]);
  return { rgb, sunT };
}

/** 夜空底光（无月光的自然夜空 + 海平线附近的微光），线性辐射 */
export function nightGlow(dir, out = [0, 0, 0]) {
  const t = (1 - Math.max(dir[1], 0)) ** 3;
  for (let k = 0; k < 3; k++) out[k] = lerp(NIGHT_SKY.zenith[k], NIGHT_SKY.horizon[k], t);
  return out;
}

export const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

/** 方位角 / 高度角（度）→ 单位向量。方位 0° = +Z，90° = +X */
export function sunVector(azDeg, elDeg) {
  const az = azDeg * Math.PI / 180, el = elDeg * Math.PI / 180, ce = Math.cos(el);
  return [Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce];
}
