// 写实风格的程序化数据贴图（逐像素生成，无外部文件）。全部可平铺：噪声晶格在贴图边缘回绕。
// 颜色贴图按 sRGB 上传（GPU 解码），法线 / 噪声按线性数据上传。
import * as THREE from 'three';

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const sm = (t) => t * t * (3 - 2 * t);
const fract = (v) => v - Math.floor(v);

/** 周期性值噪声：晶格 fx × fy 铺满一张贴图，x / y ∈ [0,1) */
class Lattice {
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
function fbm(x, y, lats, gains) { let s = 0; for (let i = 0; i < lats.length; i++) s += gains[i] * lats[i].at(x, y); return s; }

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
function colorTex(w, h, fn, o) {
  const d = new Uint8Array(w * h * 4), c = [0, 0, 0, 255];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    c[3] = 255; fn((x + 0.5) / w, (y + 0.5) / h, x, y, c);
    const k = (y * w + x) * 4;
    d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = c[3];
  }
  return tex(d, w, h, { srgb: true, ...o });
}
/** 高度场 → 切线空间法线贴图（+x = +u，+y = +v） */
function normalTex(w, h, H, strength) {
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

// ———————————————————————— 地表材质 ————————————————————————

const mix3 = (a, b, t, c, k) => { c[k] = a[0] + (b[0] - a[0]) * t; c[k + 1] = a[1] + (b[1] - a[1]) * t; c[k + 2] = a[2] + (b[2] - a[2]) * t; };
const scale3 = (a, s, c, k) => { c[k] = a[0] * s; c[k + 1] = a[1] * s; c[k + 2] = a[2] * s; };

/** 草地：深浅草丛的大色斑 + 顺着 v 方向拉长的草叶条纹 */
export function grassTextures(size = 256) {
  const r = rng(21), blotch = [new Lattice(4, 4, (r() * 1e9) | 0), new Lattice(9, 9, (r() * 1e9) | 0), new Lattice(18, 18, (r() * 1e9) | 0)];
  const blade = new Lattice(40, 13, (r() * 1e9) | 0), fine = [new Lattice(48, 48, (r() * 1e9) | 0), new Lattice(96, 96, (r() * 1e9) | 0)];
  const grain = rng(5), H = new Float32Array(size * size), col = [0, 0, 0];
  const dark = [44, 72, 26], mid = [84, 122, 40], dry = [146, 150, 66];
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const b = fbm(u, v, blotch, [0.5, 0.32, 0.18]), bl = blade.at(u, v), f = fine[0].at(u, v) * 0.6 + fine[1].at(u, v) * 0.4, g = grain();
    mix3(dark, mid, clamp01(bl * 1.5 - 0.1 + f * 0.5), col, 0);
    mix3(col, dry, clamp01((b - 0.45) * 2.6), c, 0);
    scale3(c, 0.86 + 0.28 * g, c, 0);
    H[y * size + x] = bl * 0.7 + f * 0.3;
  });
  return { albedo, normal: normalTex(size, size, H, 1.7) };
}

/** 沙：细颗粒 + 风吹成的涟漪 */
export function sandTextures(size = 256) {
  const r = rng(33), warp = new Lattice(6, 6, (r() * 1e9) | 0), fine = [new Lattice(40, 40, (r() * 1e9) | 0), new Lattice(90, 90, (r() * 1e9) | 0)];
  const grain = rng(9), H = new Float32Array(size * size);
  const a = [228, 206, 166], b = [201, 176, 132];
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const rip = 0.5 + 0.5 * Math.sin(2 * Math.PI * (v * 5 + 1.1 * warp.at(u, v))), g = grain(), f = fine[0].at(u, v);
    mix3(b, a, clamp01(0.35 + 0.65 * rip + (f - 0.5) * 0.5), c, 0);
    scale3(c, 0.9 + 0.2 * g, c, 0);
    H[y * size + x] = rip * 0.75 + fine[1].at(u, v) * 0.25;
  });
  return { albedo, normal: normalTex(size, size, H, 3.2) };
}

/** 岩石：灰褐色块面 + 裂隙 + 一点苔藓（陡坡、崖壁用） */
export function rockTextures(size = 256) {
  const r = rng(44), n = [new Lattice(4, 4, (r() * 1e9) | 0), new Lattice(8, 8, (r() * 1e9) | 0), new Lattice(16, 16, (r() * 1e9) | 0), new Lattice(32, 32, (r() * 1e9) | 0)];
  const crack = new Lattice(5, 5, (r() * 1e9) | 0), moss = new Lattice(7, 7, (r() * 1e9) | 0), grain = rng(3), H = new Float32Array(size * size);
  const light = [138, 128, 114], darkc = [82, 78, 72], green = [86, 96, 56], col = [0, 0, 0];
  const albedo = colorTex(size, size, (u, v, x, y, c) => {
    const f = fbm(u, v, n, [0.46, 0.27, 0.17, 0.10]), cr = 1 - clamp01(Math.abs(crack.at(u, v) - 0.5) / 0.035), g = grain();
    mix3(darkc, light, clamp01((f - 0.25) * 1.9), col, 0);
    mix3(col, green, clamp01((moss.at(u, v) - 0.58) * 5) * 0.55, c, 0);
    scale3(c, (0.9 + 0.2 * g) * (1 - 0.5 * cr * cr), c, 0);
    H[y * size + x] = f - 0.4 * cr;
  });
  return { albedo, normal: normalTex(size, size, H, 5) };
}

/** 沥青法线：骨料的颗粒起伏 */
export function asphaltNormalTexture(size = 256) {
  const r = rng(55), n = [new Lattice(24, 24, (r() * 1e9) | 0), new Lattice(56, 56, (r() * 1e9) | 0)], grain = rng(8), H = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) H[y * size + x] = fbm((x + 0.5) / size, (y + 0.5) / size, n, [0.45, 0.3]) + grain() * 0.35;
  return normalTex(size, size, H, 3.4);
}

/** 写实步道砖的颜色：n×n 块灰色混凝土砖，隔行错半格，砖与砖色差很小，带细颗粒 */
export function pavingAlbedoTexture(size = 192, n = 6) {
  const r = rng(165), fine = new Lattice(96, 96, (r() * 1e9) | 0), brickR = rng(14), tone = Array.from({ length: n * n * 2 }, () => (brickR() - 0.5) * 16), grain = rng(21);
  const s = size / n, base = [156, 152, 144];
  return colorTex(size, size, (u, v, x, y, c) => {
    const row = Math.floor(y / s), xx = (x + (row % 2) * s * 0.5) % size, colI = Math.floor(xx / s), lx = xx % s, ly = y % s;
    const edge = Math.min(lx, s - lx, ly, s - ly), t = tone[row * n + colI] + (edge < 2.2 ? -26 : 0) + (fine.at(u, v) - 0.5) * 12 + (grain() - 0.5) * 9;
    c[0] = base[0] + t; c[1] = base[1] + t; c[2] = base[2] + t * 0.92;
  });
}

/** 铺装砖法线：砖面微鼓、砖缝凹陷（n×n 砖，隔行错半格；与 pavingAlbedoTexture 同一布局） */
export function pavingNormalTexture(size = 128, n = 4) {
  const r = rng(66), fine = new Lattice(48, 48, (r() * 1e9) | 0), brickR = rng(13), bricks = Array.from({ length: 72 }, () => 0.86 + brickR() * 0.14), H = new Float32Array(size * size);
  const s = size / n;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const row = Math.floor(y / s), xx = (x + (row % 2) * s * 0.5) % size, colI = Math.floor(xx / s), lx = xx % s, ly = y % s;
    const edge = Math.min(lx, s - lx, ly, s - ly), bulge = clamp01(edge / 3) * (1 - 0.06 * Math.pow(Math.min(lx, s - lx) / (s / 2) - 1, 2) - 0.06 * Math.pow(Math.min(ly, s - ly) / (s / 2) - 1, 2));
    H[y * size + x] = bulge * bricks[(row * n + colI) % 72] + fine.at((x + 0.5) / size, (y + 0.5) / size) * 0.06;
  }
  return normalTex(size, size, H, 2.2);
}

/** 羽毛法线：叠瓦状的一排排羽片（u 环向 4 列，v 纵向 8 排，波状边缘） */
export function featherNormalTexture(size = 256) {
  const r = rng(88), barb = new Lattice(64, 96, (r() * 1e9) | 0), H = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5) / size, v = (y + 0.5) / size, wave = 0.11 * Math.sin(2 * Math.PI * u * 4);
    const row = Math.floor(v * 8 + wave), saw = fract(v * 8 + wave);
    H[y * size + x] = sm(clamp01(saw * 1.6)) * (0.85 + 0.15 * (row % 2)) + barb.at(u, v) * 0.1;
  }
  return normalTex(size, size, H, 2.0);
}

// ———————————————————————— 植物卡片（Canvas 绘制） ————————————————————————

/** 一丛草的透明卡片：二十来根下宽上尖、带弯曲的草叶（256 px：细叶在特写里才有足够分辨率） */
export function grassBladeTexture(size = 256, seed = 5) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d'), r = rng(seed), n = 24;
  g.clearRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    const x0 = size * (0.06 + 0.88 * r()), h = size * (0.45 + 0.55 * r()), lean = (r() - 0.5) * size * 0.6, w0 = size * (0.009 + 0.007 * r());
    const tipX = x0 + lean, tipY = size - h, cx = x0 + lean * 0.25, cy = size - h * 0.55, N = 10, L = [], R = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N, it = 1 - t, px = it * it * x0 + 2 * it * t * cx + t * t * tipX, py = it * it * size + 2 * it * t * cy + t * t * tipY;
      const dx = 2 * it * (cx - x0) + 2 * t * (tipX - cx), dy = 2 * it * (cy - size) + 2 * t * (tipY - cy), len = Math.hypot(dx, dy) || 1, w = w0 * (1 - t) + 0.4;
      L.push([px - (dy / len) * w, py + (dx / len) * w]); R.push([px + (dy / len) * w, py - (dx / len) * w]);
    }
    const grad = g.createLinearGradient(0, size, 0, tipY), tone = r();
    grad.addColorStop(0, `rgb(${34 + tone * 16},${58 + tone * 18},${20 + tone * 8})`);
    grad.addColorStop(1, `rgb(${108 + tone * 50},${132 + tone * 40},${48 + tone * 22})`);
    g.fillStyle = grad;
    g.beginPath(); g.moveTo(L[0][0], L[0][1]);
    for (const p of L) g.lineTo(p[0], p[1]);
    for (let k = R.length - 1; k >= 0; k--) g.lineTo(R[k][0], R[k][1]);
    g.closePath(); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/** 披针形小叶（透明通道裁形）：v = 0 是叶根，v = 1 是叶尖；中间一道主脉 */
export function leafletTexture(w = 64, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.clearRect(0, 0, w, h);
  const half = (v) => w * 0.46 * Math.pow(Math.sin(Math.PI * Math.pow(v, 0.75)), 0.8) * (1 - 0.15 * v);
  g.beginPath();
  g.moveTo(w / 2, h);
  for (let i = 1; i <= 24; i++) { const v = i / 24; g.lineTo(w / 2 + half(v), h * (1 - v)); }
  for (let i = 24; i >= 0; i--) { const v = i / 24; g.lineTo(w / 2 - half(v), h * (1 - v)); }
  g.closePath();
  const grad = g.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, '#2d5620'); grad.addColorStop(0.55, '#4a8530'); grad.addColorStop(1, '#7aa43c');
  g.fillStyle = grad; g.fill();
  g.strokeStyle = 'rgba(28, 52, 20, 0.6)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 4); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.userData.alphaCard = true;
  return t;
}
