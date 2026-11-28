// 海床的贴图：沙、礁石、淤泥，各是一套“颜色 + 法线”，外加一张沙涟漪的法线。全部逐像素烘焙、可平铺。
// 交界处的混合、粉红色的钙化藻和深绿色的藻皮都在地形着色器里按世界坐标现算（见 world/terrain.js），贴图本身不带这些斑块。
import { Lattice, latticeFbm, colorTex, normalTex, rng } from '../gfx/datatex.js';
import { noiseTexture } from '../gfx/datatex.js';

const mix3 = (a, b, t, c) => { c[0] = a[0] + (b[0] - a[0]) * t; c[1] = a[1] + (b[1] - a[1]) * t; c[2] = a[2] + (b[2] - a[2]) * t; };
const lat = (seed, ...fs) => fs.map((f) => new Lattice(f, f, (seed * 7919 + f * 131) | 0));

/** 碳酸钙细沙：米白，带一点深色的碎屑（有孔虫壳、碎珊瑚） */
function sand(size) {
  const grain = rng(9), speck = new Lattice(size / 2, size / 2, 77), H = new Float32Array(size * size);
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const g = 0.94 + 0.09 * grain(), s = speck.at(u, v), dark = s > 0.985 ? 0.62 : s < 0.012 ? 1.06 : 1.0;
    mix3([226, 214, 186], [238, 230, 210], grain(), c);
    c[0] = Math.min(255, c[0] * g * dark); c[1] = Math.min(255, c[1] * g * dark); c[2] = Math.min(255, c[2] * g * dark);
    H[y * size + x] = grain();
  });
  return { albedo, normal: normalTex(size, size, H, 0.9) };
}

/** 底流吹出来的沙涟漪：脊线弯弯曲曲、会分叉。只做高度场，给法线用（铺 12 米） */
function ripples(size) {
  const r = rng(5), warp = lat(3, 3, 7, 14), H = new Float32Array(size * size);
  const a = r() * 6.28, b = r() * 6.28;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size, v = (y + 0.5) / size;
    const w = latticeFbm(u, v, warp, [0.55, 0.3, 0.15]) - 0.5, cross = Math.sin(6.2832 * (u * Math.cos(a) + v * Math.sin(a)) * 1 + latticeFbm(u + 0.3, v, warp, [0.55, 0.3, 0.15]) * 1.4 + b);
    const s = Math.sin(6.2832 * (9 * u * Math.cos(b) + 9 * v * Math.sin(b)) + w * 7.5 + cross * 1.9);
    H[y * size + x] = Math.pow(Math.max(0, 0.5 + 0.5 * s), 1.8) - 0.5;                                  // 脊尖窝圆
  }
  return normalTex(size, size, H, 2.6);
}

/** 礁石灰岩：灰米色，有溶蚀的小坑和细裂缝 */
function rock(size) {
  const n = lat(21, 4, 8, 16, 32, 64), pit = new Lattice(70, 70, 9), crack = lat(23, 9, 18)[0], grain = rng(3);
  const H = new Float32Array(size * size);
  const light = [168, 160, 142], dark = [92, 90, 82];
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const f = latticeFbm(u, v, n, [0.42, 0.26, 0.15, 0.09, 0.05, 0.03]);
    const p = pit.at(u, v), pitW = Math.max(0, (p - 0.87) / 0.13);
    const cr = 1 - Math.min(1, Math.abs(crack.at(u, v) - 0.5) / 0.014), g = 0.92 + 0.16 * grain();
    mix3(dark, light, Math.min(1, f * 1.9), c);
    const k = (1 - 0.3 * pitW) * (1 - 0.38 * cr) * g;
    c[0] *= k; c[1] *= k; c[2] *= k;
    H[y * size + x] = f - 0.3 * pitW - 0.4 * cr;
  });
  return { albedo, normal: normalTex(size, size, H, 4.2) };
}

/** 淤泥和碎屑：灰绿，细碎的有机颗粒 */
function silt(size) {
  const grain = rng(19), n = lat(12, 5, 11, 23, 47), H = new Float32Array(size * size);
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const f = latticeFbm(u, v, n, [0.4, 0.28, 0.2, 0.12]), g = 0.93 + 0.1 * grain();
    mix3([118, 126, 104], [164, 160, 134], f * 1.5, c);
    c[0] *= g; c[1] *= g; c[2] *= g;
    H[y * size + x] = g * 0.4 + f * 0.6;
  });
  return { albedo, normal: normalTex(size, size, H, 1.6) };
}

/** 一次烘好海床要用的所有贴图 */
export function seabedTextures(size = 512, onProgress = () => {}) {
  const out = {};
  const steps = [['sand', () => sand(size)], ['ripples', () => ({ normal: ripples(size / 2) })], ['rock', () => rock(size)], ['silt', () => silt(size)], ['noise', () => noiseTexture(256)]];
  steps.forEach(([name, fn], i) => { out[name] = fn(); onProgress((i + 1) / steps.length); });
  return out;
}
