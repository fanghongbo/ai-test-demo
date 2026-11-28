// 程序化贴图工具：可平铺的值噪声 / 多八度，逐像素烘焙一套 PBR 贴图（颜色 + 法线 + 遮蔽·粗糙度·金属度），以及在 Canvas 上叠字、画标志。
// 页面不带任何图片文件：所有贴图在启动时生成。
// 所有 2D 上下文都开 willReadFrequently：强制 CPU 光栅化。某些环境（这台机器的无头 Edge）里 GPU 画布会把大图画出条纹。
import * as THREE from 'three';

export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const fract = (v) => v - Math.floor(v);
const smoothT = (t) => t * t * (3 - 2 * t);
export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const mix = (a, b, t) => a + (b - a) * t;

/** 可平铺的值噪声：一张贴图里铺 fx × fy 个晶格，边缘回绕 */
class Noise {
  constructor(fx, fy, seed) {
    this.fx = fx; this.fy = fy; this.v = new Float32Array(fx * fy);
    const r = rng(seed);
    for (let i = 0; i < this.v.length; i++) this.v[i] = r();
  }
  at(x, y) {
    const { fx, fy, v } = this, px = fract(x) * fx, py = fract(y) * fy;
    let ix = Math.floor(px), iy = Math.floor(py);
    const sx = smoothT(px - ix), sy = smoothT(py - iy), j0 = (iy % fy) * fx, j1 = ((iy + 1) % fy) * fx, i0 = ix % fx, i1 = (ix + 1) % fx;
    const a = v[j0 + i0], b = v[j0 + i1], c = v[j1 + i0], d = v[j1 + i1];
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  }
}

/** 多八度：基础频率 f0（每张贴图 f0 个晶格），每层频率翻倍、增益 × gain；stretchY > 1 时沿 v 方向拉长（锈痕、水渍） */
export class Fbm {
  constructor(f0, octaves, seed, gain = 0.5, stretchY = 1) {
    this.l = []; this.g = []; this.ox = []; this.oy = [];
    const r = rng(seed * 7 + 3);
    let amp = 1, f = f0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      const fy = Math.max(1, Math.round(f / stretchY));
      this.l.push(new Noise(f, fy, seed + i * 131)); this.g.push(amp); norm += amp;
      this.ox.push(r()); this.oy.push(r());
      amp *= gain; f *= 2;
    }
    this.norm = norm || 1;
  }
  at(x, y) {
    let s = 0;
    for (let i = 0; i < this.l.length; i++) s += this.g[i] * this.l[i].at(x + this.ox[i], y + this.oy[i]);
    return s / this.norm;
  }
}

function setup(t, o = {}) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = o.aniso ?? 8;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

/** 高度场 → 切线空间法线（+x = +u，+y = +v） */
function heightToNormal(w, h, H, strength = 1) {
  const d = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const hx = H[y * w + ((x + 1) % w)] - H[y * w + ((x - 1 + w) % w)], hy = H[((y + 1) % h) * w + x] - H[((y - 1 + h) % h) * w + x];
    const nx = -hx * strength, ny = -hy * strength, l = Math.hypot(nx, ny, 1), k = (y * w + x) * 4;
    d[k] = (nx / l * 0.5 + 0.5) * 255; d[k + 1] = (ny / l * 0.5 + 0.5) * 255; d[k + 2] = (1 / l * 0.5 + 0.5) * 255; d[k + 3] = 255;
  }
  const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  return setup(t);
}

/**
 * 逐像素烘焙一套 PBR 贴图。fn(u, v, s) 往 s 里写：
 *   s.rgb（sRGB 0..1）· s.h 高度 0..1 · s.r 粗糙度 · s.m 金属度 · s.a 遮蔽 0..1
 * 返回 { map, normalMap, ormMap, canvas, ctx }。map 是 CanvasTexture：还可以在 ctx 上叠字和标志，画完调用 touch(map)。
 * ormMap：R = 遮蔽、G = 粗糙度、B = 金属度，同时接到 aoMap / roughnessMap / metalnessMap。
 */
export function bake(w, h, fn, o = {}) {
  const img = new ImageData(w, h), H = new Float32Array(w * h), orm = new Uint8Array(w * h * 4);
  const s = { rgb: [0.5, 0.5, 0.5], h: 0.5, r: 0.8, m: 0, a: 1, u: 0, v: 0, x: 0, y: 0 };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    s.h = 0.5; s.r = 0.8; s.m = 0; s.a = 1; s.u = (x + 0.5) / w; s.v = (y + 0.5) / h; s.x = x; s.y = y;
    fn(s.u, s.v, s);
    const k = y * w + x, q = k * 4;
    img.data[q] = clamp01(s.rgb[0]) * 255; img.data[q + 1] = clamp01(s.rgb[1]) * 255; img.data[q + 2] = clamp01(s.rgb[2]) * 255; img.data[q + 3] = 255;
    H[k] = s.h;
    orm[q] = clamp01(s.a) * 255; orm[q + 1] = clamp01(s.r) * 255; orm[q + 2] = clamp01(s.m) * 255; orm[q + 3] = 255;
  }
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.putImageData(img, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  setup(map, o);
  if (o.wrap === 'clamp') { map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping; }
  const ormMap = new THREE.DataTexture(orm, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  setup(ormMap, { aniso: o.aniso });
  return { w, h, canvas, ctx, map, normalMap: heightToNormal(w, h, H, o.normal ?? 1), ormMap, height: H };
}

/** Canvas 上的绘制改过之后让贴图重新上传 */
export function touch(t) { t.needsUpdate = true; return t; }

/** 单独一张带透明通道的 Canvas 贴图（标志、字、铁丝网、格栅） */
export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  setup(t, o);
  if (o.clamp) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.userData.canvas = c;
  return t;
}

/** 一行喷涂字（模板刷字体的感觉：边缘发毛） */
export function stencil(ctx, text, x, y, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (o.rotate) ctx.rotate(o.rotate);
  ctx.font = `${o.weight ?? 800} ${o.size ?? 64}px ${o.font ?? 'Arial Black, Impact, "Microsoft YaHei", sans-serif'}`;
  ctx.textAlign = o.align ?? 'center'; ctx.textBaseline = o.baseline ?? 'middle';
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillStyle = o.color ?? '#e8e8e2';
  if (o.spacing) {                                             // 字距：逐字画
    const chars = [...text], widths = chars.map((c) => ctx.measureText(c).width + o.spacing), total = widths.reduce((a, b) => a + b, 0) - o.spacing;
    let cx = ctx.textAlign === 'center' ? -total / 2 : ctx.textAlign === 'right' ? -total : 0;
    ctx.textAlign = 'left';
    for (let i = 0; i < chars.length; i++) { ctx.fillText(chars[i], cx, 0); cx += widths[i]; }
  } else ctx.fillText(text, 0, 0);
  ctx.restore();
}
