// 程序化贴图：全部在 Canvas / ImageData 里现画，没有任何图片文件。
//   noise  —— 世界坐标的噪点，给大块的石头、草地、树皮加上手绘似的斑驳
//   wood   —— 秋千座板的木纹（普通、金色、裂缝的旧板）
//   puff   —— 云团：上亮下暗、边缘是鼓包
//   dot / star / petal / leaf —— 粒子用的形状
import * as THREE from 'three';
import { rng } from '../core/rng.js';
import { makeNoise } from '../core/noise.js';
import { PAL } from '../core/palette.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

const tex = (c, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

export function noiseTexture() {
  const S = 256, c = canvas(S, S), ctx = c.getContext('2d'), img = ctx.createImageData(S, S), n = makeNoise(4242);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4, u = x / S, v = y / S;
      img.data[i] = 128 + 120 * n.fbm2(u * 6, v * 6, 4);
      img.data[i + 1] = 128 + 120 * n.noise2(u * 72, v * 72);
      img.data[i + 2] = 128 + 120 * n.fbm2(u * 2.5 + 9, v * 2.5 + 5, 3);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = tex(c, false);
  t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
  return t;
}

export function woodTexture({ base = PAL.wood, dark = PAL.woodDark, light = '#ECC084', crack = false, seed = 7 } = {}) {
  const W = 512, H = 256, c = canvas(W, H), ctx = c.getContext('2d'), r = rng(seed);
  ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
  ctx.lineCap = 'round';
  for (let k = 0; k < 90; k++) {                      // 顺着板子长边的木纹
    const y0 = r() * H, amp = 1.5 + r() * 4, wl = 60 + r() * 200, ph = r() * 6.28;
    ctx.strokeStyle = r() < 0.72 ? dark : light;
    ctx.globalAlpha = 0.08 + r() * 0.16;
    ctx.lineWidth = 0.6 + r() * 2.0;
    ctx.beginPath();
    for (let x = -8; x <= W + 8; x += 8) {
      const y = y0 + Math.sin((x / wl) * 6.28 + ph) * amp + Math.sin(x / 21 + ph * 2) * 0.9;
      if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let k = 0; k < 3; k++) {                       // 节疤
    const x = r() * W, y = 40 + r() * (H - 80), rr = 7 + r() * 9;
    ctx.globalAlpha = 0.35; ctx.strokeStyle = dark; ctx.lineWidth = 1.6;
    for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(x, y, rr + j * 4, (rr + j * 4) * 0.6, 0, 0, 6.28); ctx.stroke(); }
    ctx.globalAlpha = 0.25; ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(x, y, rr * 0.5, rr * 0.3, 0, 0, 6.28); ctx.fill();
  }
  if (crack) {                                        // 一道裂开的缝：又黑又宽，一头还有一个缺口
    const pts = [];
    let x = W * 0.5, y = -6;
    pts.push([x, y]);
    while (y < H + 6) { x += (r() - 0.5) * 44; y += 12 + r() * 18; pts.push([x, y]); }
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.85; ctx.strokeStyle = '#C9B79B'; ctx.lineWidth = 13;      // 缝两边的白碴
    ctx.beginPath(); pts.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = '#1E140C'; ctx.lineWidth = 7;         // 缝
    ctx.beginPath(); pts.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#1E140C';                            // 板子边上崩掉的一个口
    ctx.beginPath(); ctx.moveTo(W * 0.3, -2); ctx.lineTo(W * 0.42, -2); ctx.lineTo(W * 0.37, H * 0.2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.6; ctx.strokeStyle = '#1E140C'; ctx.lineWidth = 2;        // 往两边岔出去的小缝
    for (let k = 0; k < 4; k++) {
      const [sx, sy] = pts[2 + k % 6];
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (r() < 0.5 ? -1 : 1) * (40 + r() * 60), sy + (r() - 0.5) * 50); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// 云团：alpha 是轮廓（花椰菜似的鼓包），r 是明暗（上面亮、下面暗）
export function puffTexture(seed = 99, squash = 1.0) {
  const S = 256, c = canvas(S, S), ctx = c.getContext('2d'), img = ctx.createImageData(S, S), n = makeNoise(seed);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const i = (y * S + x) * 4, dx = (x / S - 0.5) * 2, dy = (y / S - 0.5) * 2;
      const ang = Math.atan2(dy, dx);
      const bump = 1 + 0.11 * n.fbm2(Math.cos(ang) * 1.1 + 5, Math.sin(ang) * 1.1 + 3, 2) + 0.035 * Math.sin(ang * 5 + seed);
      const rad = Math.hypot(dx, dy * squash) / bump;
      const a = 1 - smooth(0.48, 0.82, rad);                       // 到方块边上必须已经是 0，否则云会带着笔直的边
      const light = clamp(0.55 - 0.62 * dy + 0.12 * n.noise2(dx * 2.2 + 4, dy * 2.2) - 0.12 * smooth(0.3, 1.0, rad), 0, 1);
      img.data[i] = 255 * light; img.data[i + 1] = 255 * a; img.data[i + 2] = 0; img.data[i + 3] = 255 * a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return tex(c, false);
}

const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function dotTexture() {
  const S = 64, c = canvas(S, S), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return tex(c, false);
}

export function starTexture() {
  const S = 64, c = canvas(S, S), ctx = c.getContext('2d'), img = ctx.createImageData(S, S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = (y * S + x) * 4, dx = (x / S - 0.5) * 2, dy = (y / S - 0.5) * 2, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const star = Math.pow(Math.abs(Math.cos(a * 2)), 9) * (1 - smooth(0.2, 1.0, r)) + (1 - smooth(0, 0.3, r)) * 0.9;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = 255 * Math.min(1, star);
  }
  ctx.putImageData(img, 0, 0);
  return tex(c, false);
}

// 一片叶子 / 一片花瓣：尖头椭圆，中间一道浅色的脉
export function petalTexture() {
  const S = 64, c = canvas(S, S), ctx = c.getContext('2d');
  ctx.translate(S / 2, S / 2);
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(0, -30);
  ctx.bezierCurveTo(20, -18, 20, 14, 0, 30); ctx.bezierCurveTo(-20, 14, -20, -18, 0, -30); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 26); ctx.stroke();
  return tex(c, false);
}
