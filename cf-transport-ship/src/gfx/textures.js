// 这条船的全部贴图：逐像素烘焙 + Canvas 叠字。颜色贴图里只有“中性”的表面细节，颜色由顶点色 / 实例色 / 材质色给，
// 这样一套贴图能派生出很多种漆面（黄的栏杆、灰绿的舱壁、各色集装箱、白的舰桥……）。
import * as THREE from 'three';
import { Fbm, bake, canvasTex, stencil, drips, scratches, rng, clamp01, mix, touch } from './texgen.js';
import { noiseTexture, waterNormalTexture } from './datatex.js';

const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const fract = (v) => v - Math.floor(v);
const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7 + 0.5) * 43758.5453);
const tint = (c, k) => { c[0] *= k; c[1] *= k; c[2] *= k; };
const blend = (c, d, t) => { c[0] += (d[0] - c[0]) * t; c[1] += (d[1] - c[1]) * t; c[2] += (d[2] - c[2]) * t; };
const RUST = [0.42, 0.235, 0.135], RUST_DARK = [0.27, 0.145, 0.085];

/** 主甲板：2×2 m 钢板 + 细接缝和铆钉 + 每 2 m 一个系留 D 环 + 防滑砂粒 + 少量锈渍油渍。贴图 = 4×4 m */
function deckTex() {
  const big = new Fbm(3, 3, 21), fine = new Fbm(64, 3, 22), grit = new Fbm(200, 2, 23, 0.55), rust = new Fbm(9, 3, 24), stain = new Fbm(3, 3, 25);
  return bake(1024, 1024, (u, v, s) => {
    const xm = u * 4, ym = v * 4;
    const du = Math.min(fract(u * 2), 1 - fract(u * 2)) * 2, dv = Math.min(fract(v * 2), 1 - fract(v * 2)) * 2, dseam = Math.min(du, dv);
    const seam = 1 - sstep(0.006, 0.02, dseam);
    const b = 1 + (big.at(u, v) - 0.5) * 0.10 + (hash2(Math.floor(u * 2), Math.floor(v * 2)) - 0.5) * 0.05 + (fine.at(u, v) - 0.5) * 0.09 + (grit.at(u, v) - 0.5) * 0.07;
    const col = [0.29 * b, 0.302 * b, 0.312 * b];
    // 系留环：每 2 m 一个，环 + 凹槽 + 周围一圈淡淡的锈晕
    const dx = (fract(xm / 2) - 0.5) * 2, dy = (fract(ym / 2) - 0.5) * 2, d = Math.hypot(dx, dy);
    const ring = 1 - sstep(0.010, 0.016, Math.abs(d - 0.055)), recess = 1 - sstep(0.028, 0.040, d), halo = (1 - sstep(0.06, 0.17, d)) * 0.5;
    // 铆钉：接缝两侧 8 cm，每 25 cm 一颗
    const rv = Math.hypot(du - 0.08, (fract(ym * 4) - 0.5) * 0.25), rh = Math.hypot(dv - 0.08, (fract(xm * 4) - 0.5) * 0.25);
    const rivet = 1 - sstep(0.008, 0.012, Math.min(rv, rh)), rivetRing = (1 - sstep(0.013, 0.019, Math.min(rv, rh))) * (1 - rivet);
    const rustAmt = sstep(0.70, 0.81, rust.at(u, v)) * 0.55 + halo * 0.45;
    const st = sstep(0.70, 0.82, stain.at(u + 0.37, v + 0.11));
    blend(col, RUST_DARK, rustAmt * 0.75);
    blend(col, [0.10, 0.105, 0.11], st * 0.7);
    tint(col, 1 + rivet * 0.14 - rivetRing * 0.22 - ring * 0.0);
    blend(col, [0.10, 0.105, 0.11], ring);
    blend(col, [0.045, 0.047, 0.05], Math.max(recess * 0.85, seam));
    s.rgb = col;
    s.h = 0.5 + (grit.at(u, v) - 0.5) * 0.09 + (fine.at(u, v) - 0.5) * 0.03 - Math.max(recess * 0.85, seam) * 0.30 + (rivet + ring) * 0.20;
    s.r = clamp01(0.60 + (fine.at(u, v) - 0.5) * 0.16 + rustAmt * 0.25 - st * 0.34 + Math.max(seam, recess) * 0.16 - (ring + rivet) * 0.2);
    s.m = clamp01((ring * 0.85 + rivet * 0.3) * (1 - rustAmt));
    s.a = 1 - Math.max(recess * 0.85, seam) * 0.5 - rivetRing * 0.3;
  }, { normal: 1.1 });
}

/** 漆面（中性灰）：色斑、细划痕露出底金属、掉漆的小黑边、竖向的脏水痕。贴图 = 2×2 m */
function paintTex() {
  const mott = new Fbm(6, 3, 31), fine = new Fbm(90, 2, 32), chip = new Fbm(16, 3, 33, 0.6), dirt = new Fbm(4, 3, 34, 0.55, 9), streak = new Fbm(34, 3, 35, 0.6, 16);
  return bake(512, 512, (u, v, s) => {
    const f = fine.at(u, v), m = mott.at(u, v), c0 = chip.at(u, v), d = sstep(0.56, 0.82, dirt.at(u, v));
    const chipAmt = sstep(0.862, 0.888, c0) * 0.8, edge = (sstep(0.848, 0.862, c0) - chipAmt / 0.8) * 0.2;   // 掉漆：少而小，露出的是发灰的底材
    const b = 0.90 + (m - 0.5) * 0.10 + (f - 0.5) * 0.05;
    const col = [b, b, b * 0.99];
    blend(col, [0.60, 0.60, 0.61], chipAmt);
    tint(col, 1 - d * 0.22 - edge * 0.5 - sstep(0.60, 0.86, streak.at(u, v)) * 0.09);          // 后一项：往下淌的细脏水痕
    s.rgb = col;
    s.h = 0.5 + (f - 0.5) * 0.03 - chipAmt * 0.2 - edge * 0.08;
    s.r = clamp01(0.50 + (m - 0.5) * 0.10 + d * 0.14 - chipAmt * 0.05 + edge * 0.1);
    s.m = chipAmt * 0.75;
    s.a = 1 - edge * 0.4;
  }, { normal: 1.0 });
}

/** 裸金属（中性）：拉丝、油污。贴图 = 1×1 m */
function metalTex() {
  const brush = new Fbm(8, 3, 61, 0.55, 40), grime = new Fbm(4, 3, 62), scuff = new Fbm(40, 2, 63);
  return bake(256, 256, (u, v, s) => {
    const g = sstep(0.55, 0.8, grime.at(u, v)), b = 0.60 + (brush.at(u, v) - 0.5) * 0.16 + (scuff.at(u, v) - 0.5) * 0.08;
    const col = [b, b, b * 1.005];
    tint(col, 1 - g * 0.45);
    s.rgb = col;
    s.h = 0.5 + (scuff.at(u, v) - 0.5) * 0.03;
    s.r = clamp01(0.30 + (brush.at(u, v) - 0.5) * 0.16 + g * 0.35);
    s.m = 0.92 - g * 0.6;
    s.a = 1 - g * 0.15;
  }, { normal: 0.8 });
}

/** 木纹（浅色胶合板，可再染成枪托木色）：顺纹的条纹、斑块、棕眼、板缝。贴图 = 1.2×1.2 m */
function woodTex() {
  const grain = new Fbm(6, 4, 41, 0.55, 16), blotch = new Fbm(3, 2, 42), pore = new Fbm(110, 2, 43, 0.5, 30);
  return bake(512, 512, (u, v, s) => {
    const g = grain.at(u, v), p = sstep(0.72, 0.82, pore.at(u, v)), seam = 1 - sstep(0.002, 0.006, Math.min(fract(v), 1 - fract(v)));
    const b = 1 + (g - 0.5) * 0.22 + (blotch.at(u, v) - 0.5) * 0.10 - p * 0.12;
    const col = [0.80 * b, 0.69 * b, 0.52 * b];
    tint(col, 1 - seam * 0.5);
    s.rgb = col;
    s.h = 0.5 + (g - 0.5) * 0.06 - p * 0.05 - seam * 0.3;
    s.r = clamp01(0.70 + (g - 0.5) * 0.14 + p * 0.1 + seam * 0.1);
    s.m = 0;
    s.a = 1 - seam * 0.5;
  }, { normal: 1.1 });
}

/** 船壳：2 m 一列的钢板、铆钉、从接缝往下淌的重锈痕。贴图 = 16×8 m（横向 16 m） */
function hullTex() {
  const plate = new Fbm(5, 2, 51), streak = new Fbm(26, 4, 52, 0.6, 46), blotch = new Fbm(5, 4, 53, 0.55, 3), grime = new Fbm(3, 2, 54);
  return bake(1024, 512, (u, v, s) => {
    const xm = u * 16, ym = v * 8;
    const row = Math.floor(ym / 2), off = (row % 2) * 2;
    const dv = (0.5 - Math.abs(fract(v * 4) - 0.5)) * 2, du = (0.5 - Math.abs(fract((xm + off) / 4) - 0.5)) * 4;
    const seam = 1 - sstep(0.006, 0.022, Math.min(du, dv));
    const rv = Math.hypot(du - 0.10, (fract(ym * 5) - 0.5) * 0.2), rivet = 1 - sstep(0.014, 0.02, rv);
    const under = 1 - sstep(0.0, 0.45, dv);                                  // 接缝下方：锈从这里往下淌
    const rustAmt = clamp01(sstep(0.73, 0.88, streak.at(u, v) + under * 0.10) * 0.7 + sstep(0.84, 0.94, blotch.at(u, v)) * 0.4);
    const b = 1 + (plate.at(u, v) - 0.5) * 0.25;
    const col = [0.165 * b, 0.178 * b, 0.20 * b];
    blend(col, grime.at(u + 0.2, v) > 0.6 ? RUST_DARK : [0.07, 0.074, 0.082], sstep(0.6, 0.8, grime.at(u + 0.2, v)) * 0.42);
    blend(col, RUST, rustAmt * 0.8);
    blend(col, RUST_DARK, rivet * 0.6 + seam * 0.5);
    s.rgb = col;
    s.h = 0.5 + rivet * 0.25 - seam * 0.3 + (plate.at(u, v) - 0.5) * 0.03;
    s.r = clamp01(0.62 + (plate.at(u, v) - 0.5) * 0.12 + rustAmt * 0.26);
    s.m = 0.08 * (1 - rustAmt);
    s.a = 1 - seam * 0.5 - rivet * 0.0;
  }, { normal: 1.4 });
}

/** 布料：base 色 + 编织纹的法线；camo = 三色沙漠斑点 */
function clothTex(base, camo, seed) {
  const weave = (u, v) => Math.sin(u * Math.PI * 128) * Math.sin(v * Math.PI * 128);
  const mott = new Fbm(8, 3, seed), blotch = camo ? new Fbm(5, 4, seed + 1) : null;
  return bake(256, 256, (u, v, s) => {
    const w = weave(u, v), m = mott.at(u, v);
    const col = [base[0], base[1], base[2]];
    if (blotch) {
      const b = blotch.at(u, v);
      if (b > 0.60) { col[0] = 0.34; col[1] = 0.29; col[2] = 0.19; } else if (b < 0.40) { col[0] = 0.27; col[1] = 0.28; col[2] = 0.18; }
    }
    tint(col, 1 + (m - 0.5) * 0.14 + w * 0.03);
    s.rgb = col;
    s.h = 0.5 + w * 0.10 + (m - 0.5) * 0.05;
    s.r = 0.90;
    s.m = 0;
    s.a = 1;
  }, { normal: 0.9, aniso: 4 });
}

/** 标志与字的图集（带透明通道）。DECALS 里记下每一格的 UV，建贴花几何时按它取。 */
const CELLS = {
  logo1: [0, 0, 512, 256], logo2: [512, 0, 512, 256], codes: [1024, 0, 512, 256], weights: [1536, 0, 512, 256],
  hazard: [0, 256, 512, 256], rust: [512, 256, 512, 512], crate: [1024, 256, 512, 512], floor: [1536, 256, 512, 512],
  signs: [0, 768, 1024, 256], exit: [1024, 768, 404, 256], bay: [1440, 768, 600, 256],
  banner1: [0, 1024, 512, 256], banner2: [512, 1024, 512, 256], name: [1024, 1024, 1024, 256],
};
const AW = 2048, AH = 1280;
export const FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif';
const HEAVY = '"Arial Black", Impact, "Microsoft YaHei", sans-serif';

function decalAtlas() {
  const t = canvasTex(AW, AH, (ctx) => {
    const r = rng(9);
    // —— 集装箱标志 ——
    stencil(ctx, 'PETREL LINE', 300, 70, { size: 62, font: HEAVY, color: '#f2f2ea', spacing: 4 });
    stencil(ctx, '海燕航运', 300, 150, { size: 58, font: FONT, weight: 900, color: '#f2f2ea', spacing: 10 });
    ctx.save(); ctx.translate(90, 128); ctx.fillStyle = '#f2f2ea';
    ctx.beginPath(); ctx.moveTo(-70, 20); ctx.quadraticCurveTo(-10, -70, 60, -50); ctx.quadraticCurveTo(10, -20, -20, 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-30, 34); ctx.quadraticCurveTo(40, -10, 96, 6); ctx.quadraticCurveTo(50, 30, 10, 52); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#b3261e'; ctx.fillRect(512, 150, 512, 70);
    stencil(ctx, 'ORIENT CARGO', 768, 100, { size: 70, font: HEAVY, color: '#f4f1ea', spacing: 6 });
    stencil(ctx, 'OCL', 768, 186, { size: 44, font: HEAVY, color: '#f4f1ea', spacing: 24 });
    stencil(ctx, 'CRLU 204-31', 1044, 62, { size: 62, font: HEAVY, color: '#ecebe4', align: 'left' });
    stencil(ctx, '22G1', 1044, 150, { size: 62, font: HEAVY, color: '#ecebe4', align: 'left' });
    stencil(ctx, 'TYPE 22', 1400, 150, { size: 34, font: HEAVY, color: '#ecebe4', align: 'left' });
    stencil(ctx, 'MAX GROSS', 1558, 44, { size: 30, font: FONT, weight: 700, color: '#ecebe4', align: 'left' });
    stencil(ctx, '30,480 KG', 1558, 84, { size: 44, font: HEAVY, color: '#ecebe4', align: 'left' });
    stencil(ctx, 'TARE 3,780 KG   PAYLOAD 26,700 KG', 1558, 150, { size: 27, font: FONT, weight: 700, color: '#ecebe4', align: 'left' });
    stencil(ctx, 'CUBE 67.7 CU.M', 1558, 200, { size: 30, font: FONT, weight: 700, color: '#ecebe4', align: 'left' });
    // 危险品小标：白底红框红字，4 × 2
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
      const x = i * 128 + 12, y = 256 + j * 128 + 12;
      ctx.fillStyle = '#efece2'; ctx.fillRect(x, y, 104, 104);
      ctx.fillStyle = (i + j) % 3 === 1 ? '#1d1d1d' : '#b3261e';
      ctx.fillRect(x + 8, y + 8, 88, 88); ctx.fillStyle = '#efece2';
      ctx.font = `900 44px ${HEAVY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(['4', '3', '8', '2.2'][i], x + 52, y + 44); ctx.font = `700 18px ${FONT}`; ctx.fillText(['FLAMMABLE', 'CLASS 3', 'CORROSIVE', '↑↑'][i], x + 52, y + 82);
    }
    // 锈痕：一片竖向的橙褐色流痕（带透明），贴花时裁一小块用
    for (let i = 0; i < 70; i++) drips(ctx, 512 + r() * 512, 256 + r() * 60, 100 + r() * 340, 40, r() > 0.5 ? '150,78,36' : '108,52,26', 0.16 + r() * 0.30, 4, r);
    // —— 木箱喷字 ——
    stencil(ctx, 'AMMO', 1160, 310, { size: 76, font: HEAVY, color: '#23261f', spacing: 8 });
    stencil(ctx, '5.56×45  800 RDS', 1160, 372, { size: 30, font: FONT, weight: 800, color: '#23261f', spacing: 3 });
    stencil(ctx, '↑ ↑', 1160, 450, { size: 86, font: HEAVY, color: '#23261f', spacing: 20 });
    stencil(ctx, 'THIS SIDE UP', 1160, 516, { size: 27, font: FONT, weight: 800, color: '#23261f', spacing: 4 });
    stencil(ctx, '↑ ↑', 1400, 450, { size: 86, font: HEAVY, color: '#23261f', spacing: 20 });
    stencil(ctx, '小心轻放', 1400, 516, { size: 34, font: FONT, weight: 900, color: '#23261f', spacing: 8 });
    stencil(ctx, '弹药', 1400, 330, { size: 96, font: FONT, weight: 900, color: '#23261f', spacing: 14 });
    ctx.save(); ctx.translate(1400, 420); ctx.fillStyle = '#23261f'; ctx.beginPath();                                   // 五角星
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 18 : 44; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.restore();
    stencil(ctx, '40 GRENADE', 1530, 300, { size: 34, font: HEAVY, color: '#dfe3d2', align: 'left', spacing: 3 });
    stencil(ctx, 'LOT 88-214', 1530, 345, { size: 26, font: FONT, weight: 700, color: '#dfe3d2', align: 'left' });
    stencil(ctx, 'APPROVED', 1080, 730, { size: 34, font: FONT, weight: 700, color: '#3a3a34', align: 'left', spacing: 6 });
    // —— 甲板标线 ——
    ctx.save(); ctx.translate(1536, 256);                                                                    // 黄黑警示条（横向可平铺）
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#15130f' : '#e0a81c'; ctx.beginPath(); ctx.moveTo(i * 64 - 40, 0); ctx.lineTo(i * 64 + 24, 0); ctx.lineTo(i * 64 - 40 + 70, 70); ctx.lineTo(i * 64 + 24 - 70 + 140, 70); ctx.lineTo(i * 64 + 24 + 100, 70); ctx.lineTo(i * 64 - 40 + 100, 70); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = '#e6b31f'; ctx.fillRect(1536, 350, 512, 22);                                             // 黄线（可平铺）
    ctx.save(); ctx.translate(1660, 470); ctx.fillStyle = '#e9e6da'; ctx.beginPath(); ctx.moveTo(-90, -14); ctx.lineTo(20, -14); ctx.lineTo(20, -40); ctx.lineTo(96, 0); ctx.lineTo(20, 40); ctx.lineTo(20, 14); ctx.lineTo(-90, 14); ctx.closePath(); ctx.fill(); ctx.restore();
    stencil(ctx, '02', 1900, 470, { size: 150, font: HEAVY, color: '#e9e6da' });
    stencil(ctx, '3', 1620, 680, { size: 180, font: HEAVY, color: '#e9e6da' });
    stencil(ctx, '1', 1900, 680, { size: 180, font: HEAVY, color: '#e9e6da' });
    // —— 舱牌 ——
    for (const [i, text] of ['船头舱 BOW', '船尾舱 STERN', '主甲板 MAIN DECK', '通道 PASSAGE'].entries()) {
      const x = i * 256;
      ctx.fillStyle = '#d9d6c8'; ctx.fillRect(x + 8, 776, 240, 88); ctx.fillStyle = '#1b2a38'; ctx.fillRect(x + 16, 784, 224, 72);
      stencil(ctx, text, x + 128, 820, { size: text.length > 9 ? 26 : 34, font: FONT, weight: 900, color: '#e8e6dc', spacing: 2 });
    }
    for (const [i, text] of ['危险', 'EXIT →', '禁止吸烟', '高压'].entries()) {
      const x = 1024 + (i % 2) * 200, y = 776 + Math.floor(i / 2) * 124;
      ctx.fillStyle = i % 3 === 1 ? '#1f6b3a' : '#b3261e'; ctx.fillRect(x, y, 184, 108);
      ctx.strokeStyle = '#efece2'; ctx.lineWidth = 6; ctx.strokeRect(x + 10, y + 10, 164, 88);
      stencil(ctx, text, x + 92, y + 54, { size: text.length > 3 ? 34 : 48, font: FONT, weight: 900, color: '#efece2', spacing: 2 });
    }
    for (let i = 0; i < 6; i++) stencil(ctx, `0${i + 1}`, 1440 + (i % 3) * 200, 820 + Math.floor(i / 3) * 124, { size: 104, font: HEAVY, color: 'rgba(236,234,224,0.85)' });
    // —— 通道两端的广告横幅 ——
    ctx.fillStyle = '#0f2d46'; ctx.fillRect(0, 1024, 512, 256); ctx.fillStyle = '#e0a81c'; ctx.fillRect(0, 1024, 512, 46);
    stencil(ctx, 'PETREL 海燕航运', 256, 1134, { size: 50, font: FONT, weight: 900, color: '#f2f2ea', spacing: 2 });
    stencil(ctx, '横跨两大洋 · 每周班期', 256, 1206, { size: 30, font: FONT, weight: 700, color: '#dfe6ea', spacing: 3 });
    stencil(ctx, 'WWW.PETREL-LINE.EXAMPLE', 256, 1252, { size: 20, font: FONT, weight: 700, color: '#a9bcc8', spacing: 2 });
    ctx.fillStyle = '#15171a'; ctx.fillRect(512, 1024, 512, 256); ctx.fillStyle = '#2f6fb0'; ctx.fillRect(512, 1024, 512, 46);
    stencil(ctx, 'GLOBAL RISK', 768, 1134, { size: 58, font: HEAVY, color: '#f2f2ea', spacing: 4 });
    stencil(ctx, '安保 · 护航 · 风险管控', 768, 1206, { size: 30, font: FONT, weight: 700, color: '#cfd8df', spacing: 3 });
    stencil(ctx, 'TASK FORCE 3', 768, 1252, { size: 20, font: FONT, weight: 700, color: '#8fa3b3', spacing: 4 });
    stencil(ctx, 'PETREL TRADER', 1536, 1110, { size: 92, font: HEAVY, color: '#efece2', spacing: 8 });
    stencil(ctx, 'MONROVIA', 1536, 1210, { size: 60, font: HEAVY, color: '#efece2', spacing: 20 });
  }, { aniso: 16 });
  return t;
}

/** 图集里任意一个矩形（像素坐标）的 UV 矩形 */
export function decalRect(x, y, w, h) { return [x / AW, 1 - (y + h) / AH, (x + w) / AW, 1 - y / AH]; }
/** 某一格（或格内第 (i, j) 小格，共 n × m 个）的 UV 矩形 [u0, v0, u1, v1] */
export function decalUV(name, i = 0, j = 0, n = 1, m = 1) {
  const [x, y, w, h] = CELLS[name];
  return [(x + (w * i) / n) / AW, 1 - (y + (h * (j + 1)) / m) / AH, (x + (w * (i + 1)) / n) / AW, 1 - (y + (h * j) / m) / AH];
}

function gratingTex() {
  return canvasTex(64, 64, (ctx) => {
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#9aa0a2';
    for (let k = 0; k < 8; k++) { ctx.fillRect(k * 8, 0, 3, 64); ctx.fillRect(0, k * 8, 64, 3); }
  }, { aniso: 8 });
}
function fenceTex() {
  return canvasTex(128, 128, (ctx) => {
    ctx.clearRect(0, 0, 128, 128);
    ctx.strokeStyle = '#c8ccce'; ctx.lineWidth = 2.4;
    for (let k = -8; k < 16; k++) {
      ctx.beginPath(); ctx.moveTo(k * 16, 0); ctx.lineTo(k * 16 + 128, 128); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k * 16 + 128, 0); ctx.lineTo(k * 16, 128); ctx.stroke();
    }
  }, { aniso: 8 });
}

/**
 * 生成全部贴图。onProgress(done, total) 用于加载进度。每张之间让出一次事件循环，加载界面才刷得动。
 * @returns {Promise<object>} T：贴图集合（deck / paint / metal / wood / hull / cloth / decal / grating / fence / noise / waterN）
 */
export async function createTextures(onProgress = () => {}) {
  const T = {};
  const steps = [
    ['deck', () => { T.deck = deckTex(); }],
    ['paint', () => { T.paint = paintTex(); }],
    ['metal', () => { T.metal = metalTex(); }],
    ['wood', () => { T.wood = woodTex(); }],
    ['hull', () => { T.hull = hullTex(); }],
    ['cloth', () => { T.clothGR = clothTex([0.215, 0.25, 0.315], false, 71); T.clothBL = clothTex([0.55, 0.47, 0.33], true, 81); }],
    ['decal', () => { T.decal = decalAtlas(); }],
    ['misc', () => { T.grating = gratingTex(); T.fence = fenceTex(); T.noise = noiseTexture(256); T.waterN = waterNormalTexture(256); }],
  ];
  for (let i = 0; i < steps.length; i++) {
    onProgress(i, steps.length);
    await new Promise((r) => setTimeout(r, 0));
    steps[i][1]();
  }
  onProgress(steps.length, steps.length);
  return T;
}
