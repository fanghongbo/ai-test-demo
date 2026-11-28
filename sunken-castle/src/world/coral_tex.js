// 珊瑚、海绵、巨藻这些生物用的贴图（都很小）：珊瑚虫的小凸点、脑珊瑚回旋的沟、海绵的纵棱和孔、海扇的枝网、砗磲外套膜上的虹彩。
// 颜色大多烘成“灰度的花纹”，真正的颜色走实例色——同一张贴图，换个实例色就是另一个种。
import { bake, canvasTex, rng } from '../gfx/texgen.js';
import { Lattice, latticeFbm } from '../gfx/datatex.js';
import { TAU } from '../core/mathx.js';

/** 珊瑚虫：密密的小圆凸点（桌珊瑚、鹿角珊瑚、海星、海胆的皮）。颜色近乎白，只有一点点深浅 */
function polyp(size = 256) {
  const n = 44, off = new Lattice(n, n, 201), H = new Float32Array(size * size), grain = rng(7);
  const albedo = bake(size, size, (u, v, s) => {
    const x = u * n, y = v * n, ix = Math.floor(x), iy = Math.floor(y);
    const dx = x - ix - (0.5 + (off.at(ix / n, iy / n) - 0.5) * 0.5), dy = y - iy - (0.5 + (off.at(ix / n + 0.37, iy / n + 0.11) - 0.5) * 0.5);
    const d = Math.hypot(dx, dy), bump = Math.max(0, 1 - d * d * 4.2);                                          // 每个格子一个圆凸点
    s.rgb = [0.86 + 0.14 * bump, 0.86 + 0.14 * bump, 0.86 + 0.14 * bump].map((c) => c * (0.96 + 0.08 * grain()));
    s.h = bump * 0.9 + 0.05 * grain();
    s.r = 0.62 + 0.06 * grain(); s.a = 0.92 + 0.08 * bump;
  }, { normal: 1.6, aniso: 4 });
  return { map: albedo.map, normalMap: albedo.normalMap, ormMap: albedo.ormMap };
}

/** 脑珊瑚：噪声过零的地方是弯弯曲曲的沟，沟之间是圆鼓的脊（铺 1 米） */
function brain(size = 512) {
  const w = [new Lattice(2, 2, 210)], f = [new Lattice(4, 4, 212), new Lattice(8, 8, 213), new Lattice(17, 17, 214)], fine = [new Lattice(40, 40, 215), new Lattice(80, 80, 216)], grain = rng(9);
  return bake(size, size, (u, v, s) => {
    const ww = (latticeFbm(u + 0.3, v, w, [1]) - 0.5) * 0.5;
    const n = latticeFbm(u + ww, v + ww * 0.7, f, [0.5, 0.3, 0.14]) - 0.47, g = latticeFbm(u, v, fine, [0.6, 0.4]) - 0.5;    // 晶格噪声的取值在 0..1，减掉中线才是“有正有负”
    const valley = 1 - Math.min(1, Math.abs(n) / 0.05);                                                         // 沟：噪声过零的地方，窄
    const ridge = Math.min(1, Math.abs(n) / 0.028), k = 0.52 + 0.48 * ridge;
    s.rgb = [k * (0.94 + 0.10 * g), k * (0.95 + 0.08 * g), k * (0.92 + 0.08 * g)].map((c) => c * (0.97 + 0.06 * grain()));
    s.h = ridge * 0.85 + g * 0.3 - valley * 0.25;
    s.r = 0.58 + 0.3 * valley + 0.06 * g; s.a = 0.8 + 0.2 * ridge;
  }, { normal: 2.6, aniso: 8 });
}

/** 海绵：顺着的纵棱、散开的孔（铺一圈 × 一段） */
function sponge(size = 256) {
  const pores = new Lattice(34, 34, 221), big = new Lattice(9, 9, 222), grain = rng(11);
  return bake(size, size, (u, v, s) => {
    const rib = 0.5 + 0.5 * Math.sin(u * TAU * 14 + Math.sin(v * TAU * 2) * 0.5), p = pores.at(u, v), hole = Math.max(0, (p - 0.86) / 0.14), b = big.at(u + 0.2, v * 0.5);
    let k = 0.80 + 0.26 * rib * (0.7 + 0.3 * b);
    k *= 1 - 0.7 * hole;
    s.rgb = [k, k * (0.97 + 0.03 * grain()), k * 0.94];
    s.h = rib * 0.7 + 0.2 * b - hole * 0.6;
    s.r = 0.80 - 0.1 * rib + 0.1 * hole; s.a = 1 - 0.35 * hole;
  }, { normal: 2.0, aniso: 4 });
}

/** 海扇的枝网：从根部起不断地二叉分叉，铺满一个扇面，枝之间偶尔连起来（柳珊瑚的网）。白线画在透明底上，用 alpha 剔除 */
function fan(seed = 1) {
  const r = rng(seed * 31 + 5), size = 512;
  return canvasTex(size, size, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.lineCap = 'round'; x.strokeStyle = '#ffffff';
    const segs = [];
    const grow = (px, py, a, len, lw, depth) => {
      const ex = px + Math.cos(a) * len, ey = py - Math.sin(a) * len;
      x.lineWidth = lw; x.beginPath(); x.moveTo(px, py); x.lineTo(ex, ey); x.stroke();
      segs.push([px, py, ex, ey]);
      if (depth <= 0 || ey < 6) return;
      const spread = 0.16 + r() * 0.14, side = a > Math.PI / 2 ? 1 : -1;                                           // 越靠边的枝越往外让一点，扇面才张得开
      const a1 = a + side * spread * (0.4 + r() * 0.6) + (r() - 0.5) * 0.08, a2 = a - side * spread * (0.4 + r() * 0.6) + (r() - 0.5) * 0.08;
      const l1 = len * (0.84 + r() * 0.1), l2 = len * (0.84 + r() * 0.1);
      grow(ex, ey, a1, l1, Math.max(1.6, lw * 0.8), depth - 1);
      grow(ex, ey, a2, l2, Math.max(1.6, lw * 0.8), depth - 1);
    };
    for (const a of [-0.55, 0, 0.55]) grow(256, 508, Math.PI / 2 + a, 62 + r() * 14, 7, 7);
    for (let i = 0; i < 420 && segs.length > 1; i++) {                                                            // 横向的连接：取两段离得近的枝，在中间搭一根细的
      const s1 = segs[(r() * segs.length) | 0], s2 = segs[(r() * segs.length) | 0];
      const mx1 = (s1[0] + s1[2]) / 2, my1 = (s1[1] + s1[3]) / 2, mx2 = (s2[0] + s2[2]) / 2, my2 = (s2[1] + s2[3]) / 2, d = Math.hypot(mx2 - mx1, my2 - my1);
      if (d < 14 || d > 46) continue;
      x.lineWidth = 1.3; x.beginPath(); x.moveTo(mx1, my1); x.quadraticCurveTo((mx1 + mx2) / 2 + (r() - 0.5) * 10, (my1 + my2) / 2 + (r() - 0.5) * 10, mx2, my2); x.stroke();
    }
  }, { clamp: true });
}

/** 砗磲的外套膜：一圈一圈的蓝、青、紫，带细黑边和浅色的斑点（横着绕一圈） */
function mantle() {
  const r = rng(17), pal = [[28, 96, 210], [24, 170, 150], [104, 48, 160], [40, 190, 210], [14, 50, 120], [230, 210, 120]];
  return canvasTex(512, 64, (x, w, h) => {
    for (let i = 0; i < w; i++) {
      const band = pal[Math.floor(i / 9 + 2.2 * Math.sin(i * 0.021)) % pal.length], edge = (i % 9 === 0) ? 0.35 : 1;
      x.fillStyle = `rgb(${band.map((c) => c * edge * (0.85 + 0.3 * r())).join(',')})`; x.fillRect(i, 0, 1, h);
    }
    x.fillStyle = 'rgba(255,255,235,.75)';
    for (let i = 0; i < 260; i++) { const px = r() * w, py = r() * h, s = 1 + r() * 2.4; x.fillRect(px, py, s, s); }
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(4,20,40,.9)'); g.addColorStop(0.3, 'rgba(4,20,40,0)'); g.addColorStop(0.7, 'rgba(4,20,40,0)'); g.addColorStop(1, 'rgba(4,20,40,.9)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, { clamp: false });
}

/** 巨藻的叶片：顺着的细纹和一点深浅（颜色走顶点色） */
function blade(size = 128) {
  const n = new Lattice(6, 2, 231), grain = rng(13);
  return bake(size, size, (u, v, s) => {
    const st = 0.5 + 0.5 * Math.sin(v * TAU * 18 + n.at(u, v) * 3), k = 0.88 + 0.12 * st * (0.7 + 0.3 * n.at(u + 0.4, v * 0.5));
    s.rgb = [k, k, k].map((c) => c * (0.97 + 0.06 * grain()));
    s.h = st * 0.5; s.r = 0.5 + 0.1 * st; s.a = 1;
  }, { normal: 0.8, aniso: 4 });
}

/** 一次烘好所有生物贴图 */
export function lifeTextures(onProgress = () => {}) {
  const steps = [['polyp', polyp], ['brain', brain], ['sponge', sponge], ['blade', blade]];
  const out = { fan: fan(1), fan2: fan(2), mantle: mantle() };
  steps.forEach(([name, fn], i) => { out[name] = fn(); onProgress((i + 1) / steps.length); });
  return out;
}
