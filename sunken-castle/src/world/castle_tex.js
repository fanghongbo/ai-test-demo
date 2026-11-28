// 城堡（以及沉船、村落、遗迹）用的建筑材质：石灰岩砌块、大理石、生锈的青铜、琉璃瓦、朽木。彩窗在 glass_tex.js。
// 每套是一张可平铺的贴图（颜色 + 法线 + 遮蔽·粗糙度·金属度）。几何上的 UV 按世界尺寸给（见 world/arch.js），所以一张贴图铺几米是固定的。
import { bake, Fbm, rng, clamp01 } from '../gfx/texgen.js';

const W_ = 512;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const tint = (a, k) => [a[0] * k[0], a[1] * k[1], a[2] * k[2]];

/** 石灰岩砌块（一张铺 6 米 × 6 米：6 块宽、14 层高，错缝，一块 1.0 × 0.43 米）。
 *  每块石头有自己的色相、高低和倾斜，边缘被啃出缺口；面上有起伏和溶蚀的小坑，灰缝底下淌着水痕，还有一簇簇的藤壶和成片的藻膜 */
function limestone() {
  const blot = new Fbm(5, 4, 71, 0.55), pit = new Fbm(56, 3, 72, 0.5), drip = new Fbm(4, 3, 73, 0.5), face = new Fbm(13, 3, 74, 0.5), chip = new Fbm(26, 2, 75, 0.5), speck = new Fbm(90, 1, 76, 0.5), grain = rng(7);
  const cols = 6, rows = 14, wide = rows / cols, r = rng(31), n = cols * rows;
  const tone = new Float32Array(n), hue = new Float32Array(n), tilt = new Float32Array(n * 2), lift = new Float32Array(n);
  for (let i = 0; i < n; i++) { tone[i] = (r() - 0.5) * 2; hue[i] = (r() - 0.5) * 2; tilt[i * 2] = (r() - 0.5) * 2; tilt[i * 2 + 1] = (r() - 0.5) * 2; lift[i] = r(); }
  const mortar = 0.035;                                             // 灰缝半宽（以一层石头的高度为单位）
  const base = [176, 168, 150];
  return bake(W_, W_, (u, v, s) => {
    const row = Math.floor(v * rows), off = (row % 2) * 0.5, bu = u * cols + off, bi = Math.floor(bu), ci = ((bi % cols) + cols) % cols, id = row * cols + ci;
    const fx = bu - bi, fy = v * rows - row, dx = (fx - 0.5) * 2, dy = (fy - 0.5) * 2;
    const e = Math.min(Math.min(fx, 1 - fx) * wide, Math.min(fy, 1 - fy));                 // 到砖块边缘的距离（层高单位）
    const bite = (chip.at(u + ci * 0.213, v + row * 0.137) - 0.5) * 0.09;                   // 缺角掉棱：边缘被啃得参差不齐
    const joint = clamp01((e - bite - mortar) / 0.03);                                      // 0 = 灰缝底，1 = 石面
    const b = blot.at(u, v), p = pit.at(u, v), f = face.at(u + lift[id] * 0.5, v + lift[id] * 0.3), g = 0.96 + 0.08 * grain();
    let c = mul(base, (1 + tone[id] * 0.15) * (0.90 + 0.20 * b) * g);
    c = mix(c, tint(c, [1.07, 0.98, 0.90]), Math.max(0, hue[id]));                            // 有的石头含铁偏黄，有的偏青
    c = mix(c, tint(c, [0.92, 0.97, 1.05]), Math.max(0, -hue[id]));
    const algae = clamp01((blot.at(u + 0.37, v + 0.11) - 0.52) * 5);                        // 藻膜：成片的绿褐色
    c = mix(c, [74, 92, 62], algae * 0.62);
    const pits = clamp01((p - 0.62) * 5);
    c = mix(c, [104, 100, 92], pits * 0.5);                                                  // 溶蚀的小坑
    c = mul(c, 1 - clamp01((drip.at(u, v * 0.25) - 0.5) * 3) * 0.12);                       // 顺墙淌下的水渍
    const streak = clamp01((fy - 0.5) / 0.5) * clamp01((drip.at(u * 3, v * 0.6 + 0.3) - 0.56) * 7) * joint;  // 灰缝底下挂下来的深色水痕（v 向上，所以从上一层的缝往下淌）
    c = mul(c, 1 - streak * 0.3);
    const barn = clamp01((speck.at(u, v) - 0.87) * 60) * clamp01((blot.at(u * 0.6 + 0.21, v * 0.6 + 0.5) - 0.56) * 6) * joint;   // 一簇簇的藤壶：浅色的小圆点
    c = mix(c, [208, 204, 190], barn * 0.85);
    c = mix([96, 94, 86], c, joint);
    s.rgb = mul(c, 1 / 255);
    s.h = (0.62 + 0.05 * lift[id] + 0.05 * (dx * tilt[id * 2] + dy * tilt[id * 2 + 1])) * joint + 0.16 * b + 0.07 * (p - 0.5) + 0.05 * (f - 0.5) - 0.16 * pits + 0.06 * barn;
    s.r = 0.78 + 0.10 * b + 0.06 * algae + 0.06 * barn - 0.03 * tone[id];
    s.a = 0.80 + 0.20 * joint - 0.30 * pits;
  }, { normal: 1.5, aniso: 8 });
}

/** 大理石（铺 4 米）：乳白底，顺着石头一路游下去的灰色脉络（粗的主脉带一圈晕，再加几道细纹） */
function marble() {
  const vein = new Fbm(3, 5, 91, 0.55), warp = new Fbm(4, 3, 92, 0.5), fine = new Fbm(40, 2, 93, 0.5), hair = new Fbm(2, 3, 94, 0.5);
  return bake(W_, W_, (u, v, s) => {
    const w1 = warp.at(u, v) * 0.5 - 0.25, w2 = warp.at(u + 0.5, v + 0.2) * 0.5 - 0.25, f = fine.at(u, v);
    const d1 = Math.abs(vein.at(u * 1.2 + v * 0.3 + w1, v * 0.2 + w2) - 0.5), d2 = Math.abs(hair.at(u * 1.7 - v * 0.4 + w2, v * 0.25 + w1 + 0.4) - 0.5), d3 = Math.abs(hair.at(u * 1.1 + v * 0.8 + w1, v * 0.4 + w2 + 0.7) - 0.5);
    const core = 1 - clamp01(d1 / 0.013), halo = 1 - clamp01(d1 / 0.11), thin = Math.max((1 - clamp01(d2 / 0.009)) * (1 - clamp01(d1 / 0.16)), (1 - clamp01(d3 / 0.008)) * (1 - clamp01(d1 / 0.22)) * 0.55);   // 主脉、细纹、分出去的叉
    let c = mix([216, 212, 202], [240, 238, 230], 0.5 + 0.5 * f);
    c = mix(c, [168, 170, 174], halo * 0.20);
    c = mix(c, [128, 136, 148], core * 0.62);
    c = mix(c, [156, 160, 168], thin * 0.4);
    c = mul(c, 0.96 + 0.06 * f);
    s.rgb = mul(c, 1 / 255);
    s.h = 0.5 - 0.012 * core - 0.008 * thin + 0.004 * (f - 0.5);
    s.r = 0.30 + 0.10 * core + 0.10 * halo + 0.05 * f; s.m = 0; s.a = 1;
  }, { normal: 0.6, aniso: 8 });
}

/** 青铜（铺 3 米）：金铜色的金属和铜绿各占一部分。shift 往正里调是铜绿为主（老屋顶），往负里调是金光为主（穹顶、饰条） */
function bronze(shift = 0) {
  const pat = new Fbm(6, 4, 101, 0.55), scratch = new Fbm(30, 2, 102, 0.5), grain = rng(5);
  return bake(W_, W_, (u, v, s) => {
    const p = pat.at(u, v), k = clamp01((p - 0.44 + shift) * 6), q = scratch.at(u + 0.2, v * 0.333);   // k = 1 铜绿，0 金属
    let metal = mix([196, 146, 74], [226, 186, 110], clamp01((q - 0.5) * 4 + 0.5));
    metal = mul(metal, 0.94 + 0.10 * grain());
    const c = mix(metal, mix([46, 118, 102], [86, 160, 136], clamp01((scratch.at(u, v) - 0.5) * 3 + 0.5)), k);
    s.rgb = mul(c, 1 / 255);
    s.h = 0.5 + 0.10 * k * (q - 0.5) + 0.04 * (grain() - 0.5);
    s.r = 0.28 + 0.46 * k; s.m = 1 - 0.86 * k; s.a = 0.9 + 0.1 * k;
  }, { normal: 1.2, aniso: 8 });
}

/** 琉璃瓦（铺 2 米）：鱼鳞一样一层压一层的圆头瓦，蓝绿釉，缝里积着藻 */
function roofTile() {
  const r = rng(17), tone = new Float32Array(12 * 30);
  for (let i = 0; i < tone.length; i++) tone[i] = (r() - 0.5) * 2;
  const grit = new Fbm(64, 2, 111, 0.5), moss = new Fbm(7, 3, 112, 0.55), cols = 12, rows = 30;
  return bake(W_, W_, (u, v, s) => {
    const row = Math.floor(v * rows), off = (row % 2) * 0.5, bu = u * cols + off, ci = ((Math.floor(bu) % cols) + cols) % cols;
    const fx = bu - Math.floor(bu), fy = v * rows - row, dx = (fx - 0.5) * 2;
    const lip = fy < 0.82 ? 1 : Math.sqrt(Math.max(0, 1 - dx * dx));                           // 下缘是圆头：这里露不露得出下层瓦
    const under = clamp01((lip - 0.02) / 0.08);                                                 // 0 = 压在缝里
    const crown = 0.55 + 0.45 * Math.sqrt(Math.max(0, 1 - dx * dx)) * (0.7 + 0.3 * fy);
    const t = tone[(row % 30) * 12 + ci], g = grit.at(u, v), m = clamp01((moss.at(u + 0.3, v) - 0.58) * 6);
    let c = mix([20, 84, 104], [46, 142, 150], crown * (1 + t * 0.14) * (0.9 + 0.2 * g));
    c = mix(c, [92, 104, 58], m * 0.55);
    c = mul(c, 0.30 + 0.70 * under);
    s.rgb = mul(c, 1 / 255);
    s.h = (fy * 0.5 + crown * 0.5) * under; s.r = 0.26 + 0.10 * g + 0.35 * m; s.m = 0; s.a = 0.6 + 0.4 * under;
  }, { normal: 2.2, aniso: 8 });
}

/** 朽木（铺 2 米）：顺 u 方向的木板，木纹、裂缝、船蛆钻的洞、藻膜 */
function rottenWood() {
  const grain = new Fbm(3, 5, 121, 0.55, 16), split = new Fbm(5, 2, 122, 0.5, 24), film = new Fbm(6, 3, 123, 0.55), holes = new Fbm(26, 1, 124, 0.5);
  const boards = 5, r = rng(9), tone = new Float32Array(boards);
  for (let i = 0; i < boards; i++) tone[i] = (r() - 0.5) * 2;
  return bake(W_, W_, (u, v, s) => {
    const b = Math.floor(v * boards), fv = v * boards - b, gap = clamp01((Math.min(fv, 1 - fv) - 0.012) / 0.02);
    const g = grain.at(u, v), sp = split.at(u, v + b * 0.2), f = film.at(u, v), h = holes.at(u + b * 0.2, v);
    let c = mix([86, 70, 52], [152, 128, 96], clamp01(g * 1.3 - 0.1) * (1 + tone[b] * 0.12));
    const crack = clamp01((0.085 - Math.abs(sp - 0.5)) * 22), hole = clamp01((h - 0.74) * 24);
    c = mix(c, [30, 26, 22], crack);
    c = mix(c, [72, 96, 58], clamp01((f - 0.5) * 4) * 0.6);
    c = mix(c, [8, 7, 6], hole);
    c = mul(c, 0.45 + 0.55 * gap);
    s.rgb = mul(c, 1 / 255);
    s.h = 0.55 * gap + 0.12 * g - 0.35 * hole - 0.3 * crack;
    s.r = 0.80 + 0.08 * f; s.m = 0; s.a = 0.7 + 0.3 * gap;
  }, { normal: 2.0, aniso: 8 });
}

/** 铺地的石板（铺 4.8 米）：抖动格子的 Voronoi——每个格子一个略偏格心的“格心”，离哪个格心最近就属于哪块板。
 *  随机去掉两成格心，它们的位置被邻居吞掉，小板就并成大板；格心取周期回绕的，贴图边缘也对得上。缝是弯的，里面填着沙 */
function paving() {
  const n = 4, r = rng(41), ox = new Float32Array(n * n), oy = new Float32Array(n * n), tone = new Float32Array(n * n), keep = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) { ox[i] = 0.5 + (r() - 0.5) * 0.5; oy[i] = 0.5 + (r() - 0.5) * 0.5; tone[i] = r(); keep[i] = r() < 0.8 ? 1 : 0; }
  const grain = rng(43), film = new Fbm(6, 3, 142, 0.55), wear = new Fbm(14, 2, 144, 0.5), wobble = new Fbm(8, 2, 145, 0.5);
  return bake(W_, W_, (u, v, s) => {
    const x = u * n, y = v * n, ix = Math.floor(x), iy = Math.floor(y), wob = 1 + 0.12 * (wobble.at(u, v) - 0.5);
    let f1 = 9, f2 = 9, id = 0;
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {                                     // 周围 5×5 个格子（有的格心被去掉了，得往远一点找）
      const gx = ix + i, gy = iy + j, w = ((gy % n) + n) % n * n + (((gx % n) + n) % n);
      if (!keep[w]) continue;
      const d = Math.hypot(gx + ox[w] - x, gy + oy[w] - y) * wob;
      if (d < f1) { f2 = f1; f1 = d; id = w; } else if (d < f2) f2 = d;
    }
    const joint = clamp01((f2 - f1 - 0.012) / 0.03), g = 0.95 + 0.10 * grain(), fl = clamp01((film.at(u, v) - 0.5) * 4), wr = clamp01((wear.at(u + 0.3, v) - 0.62) * 8);
    let c = mix([132, 126, 114], [190, 182, 162], 0.35 + tone[id] * 0.5);
    c = mul(c, g * (1 - 0.16 * wr));
    c = mix(c, [70, 84, 54], fl * 0.5);                                                                // 石板上的藻膜
    c = mix([118, 108, 86], c, joint);                                                                 // 缝里填着沙
    s.rgb = mul(c, 1 / 255);
    s.h = 0.2 + 0.34 * joint + 0.05 * joint * (1 - Math.min(f1, 0.6)) - 0.03 * wr;
    s.r = mix(0.86, 0.52, joint) + 0.12 * fl; s.m = 0; s.a = 0.75 + 0.25 * joint;
  }, { normal: 1.3, aniso: 8 });
}

/** 一套建筑材质的贴图组 + 每张铺几米（UV 的单位） */
export function castleTextures(onProgress = () => {}) {
  const steps = [['stone', 6, limestone], ['paving', 4.8, paving], ['marble', 4, marble], ['bronze', 3, () => bronze(0)], ['patina', 3, () => bronze(0.2)], ['gold', 3, () => bronze(-0.26)], ['tile', 2, roofTile], ['wood', 2, rottenWood]];
  const out = {};
  steps.forEach(([name, tile, fn], i) => { out[name] = { ...fn(), tile }; onProgress((i + 1) / steps.length); });
  return out;
}
