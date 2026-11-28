// 程序化数据贴图（逐像素生成，无外部文件）：可平铺的周期噪声、四通道噪声贴图、水面法线贴图。噪声晶格在贴图边缘回绕。
// 颜色贴图按 sRGB 上传（GPU 解码），法线 / 噪声按线性数据上传。
import * as THREE from 'three';

export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const sm = (t) => t * t * (3 - 2 * t);
const fract = (v) => v - Math.floor(v);

/** 周期性值噪声：晶格 fx × fy 铺满一张贴图，x / y ∈ [0,1) */
export class Lattice {
  constructor(fx, fy, seed) {
    this.fx = fx; this.fy = fy; this.v = new Float32Array(fx * fy);
    const r = rng(seed);
    for (let i = 0; i < fx * fy; i++) this.v[i] = r();
  }
  at(x, y) {
    const { fx, fy, v } = this, px = fract(x) * fx, py = fract(y) * fy, ix = Math.floor(px), iy = Math.floor(py);
    const sx = sm(px - ix), sy = sm(py - iy), i0 = ix % fx, i1 = (i0 + 1) % fx, j0 = iy % fy, j1 = (j0 + 1) % fy;
    const a = v[j0 * fx + i0], b = v[j0 * fx + i1], c = v[j1 * fx + i0], d = v[j1 * fx + i1];
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }
}
export function latticeFbm(x, y, lats, gains) { let s = 0; for (let i = 0; i < lats.length; i++) s += gains[i] * lats[i].at(x, y); return s; }

function tex(data, w, h, o = {}) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.colorSpace = o.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = o.aniso ?? 8;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** 每像素生成颜色：fn(u, v, x, y) → [r, g, b, a]（sRGB 0..255） */
export function colorTex(w, h, fn, o) {
  const d = new Uint8Array(w * h * 4), c = [0, 0, 0, 255];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    c[3] = 255; fn((x + 0.5) / w, (y + 0.5) / h, x, y, c);
    const k = (y * w + x) * 4;
    d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = c[3];
  }
  return tex(d, w, h, { srgb: true, ...o });
}
/** 高度场 → 切线空间法线贴图（+x = +u，+y = +v） */
export function normalTex(w, h, H, strength) {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const hx = H[y * w + ((x + 1) % w)] - H[y * w + ((x - 1 + w) % w)], hy = H[((y + 1) % h) * w + x] - H[((y - 1 + h) % h) * w + x];
    const nx = -hx * strength, ny = -hy * strength, l = Math.hypot(nx, ny, 1), k = (y * w + x) * 4;
    d[k] = (nx / l * 0.5 + 0.5) * 255; d[k + 1] = (ny / l * 0.5 + 0.5) * 255; d[k + 2] = (1 / l * 0.5 + 0.5) * 255; d[k + 3] = 255;
  }
  return tex(d, w, h);
}

// ———————————————————————— 通用噪声 ————————————————————————

/** 四通道可平铺噪声：r/g/b/a 依次是 6 / 12 / 24 / 48 倍频（各带一层细节）。着色器里一次取样就是四个八度 */
export function noiseTexture(size = 256) {
  const r = rng(11), L = [[6, 12], [12, 24], [24, 48], [48, 96]].map(([a, b]) => [new Lattice(a, a, (r() * 1e9) | 0), new Lattice(b, b, (r() * 1e9) | 0)]);
  const d = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size, v = (y + 0.5) / size, k = (y * size + x) * 4;
    for (let c = 0; c < 4; c++) d[k + c] = clamp01((L[c][0].at(u, v) + 0.35 * L[c][1].at(u, v)) / 1.35) * 255;
  }
  return tex(d, size, size, { aniso: 4 });
}

/** 水面法线：几十列可平铺的正弦波叠加成高度场，再求法线 */
export function waterNormalTexture(size = 256) {
  const r = rng(77), waves = [];
  while (waves.length < 30) {
    const kx = Math.round((r() * 2 - 1) * 9), ky = Math.round((r() * 2 - 1) * 9), k2 = kx * kx + ky * ky;
    if (k2 < 1 || k2 > 60) continue;
    waves.push([kx, ky, 1 / Math.pow(k2, 0.75), r() * Math.PI * 2]);
  }
  const H = new Float32Array(size * size);
  let amp = 0;
  for (const w of waves) amp += w[2];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size, v = (y + 0.5) / size;
    let h = 0;
    for (const [kx, ky, a, ph] of waves) h += a * Math.sin(2 * Math.PI * (kx * u + ky * v) + ph);
    H[y * size + x] = h / amp;
  }
  return normalTex(size, size, H, 9);
}
