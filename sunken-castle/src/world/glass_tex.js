// 彩窗：铅条隔开的彩色玻璃拼出图案，一块一块画出来（不是现成的图）。
// 图集里横着排六种尖拱窗的花样（王座厅：三叉戟、鲸和月亮、贝壳明珠；后殿：巨藻和鱼、太阳三叉戟；高处小窗的菱格），玫瑰窗单独一张。
// 坐标：窗子里横向 0..1、竖向 0..1（下缘 0、上缘 1）。画的时候换算成等比坐标（竖向 1 = 窗高，横向乘上长宽比），圆才是圆。
import * as THREE from 'three';
import { rng } from '../gfx/texgen.js';

const PAL = {
  ruby: [172, 20, 34], blue: [16, 34, 124], sapphire: [38, 84, 198], sky: [128, 188, 228], emerald: [14, 106, 60], teal: [18, 138, 128],
  gold: [234, 166, 34], amber: [202, 110, 24], violet: [100, 38, 146], lilac: [176, 128, 200], white: [228, 234, 232], ivory: [242, 228, 192], rose: [206, 88, 108],
  whale: [20, 58, 92], night: [44, 24, 100],
};
const NAMES = Object.keys(PAL);
const LEAD = 'rgb(9,9,12)';
const ROW = 1024, BW = 0.05;                                   // 图集里一格的高度（窗高）；花边的宽度（窗高为 1）
const HW = 0.031, HZ = 0.02;                                   // 菱形小玻璃的半宽、半高（等比坐标）
const rgb = (c, k = 1) => `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
const nearest = (c) => { let best = 0, d = 1e9; NAMES.forEach((n, i) => { const p = PAL[n], e = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (e < d) { d = e; best = i; } }); return NAMES[best]; };
const hash = (n, m, k, seed) => { const v = Math.sin(n * 12.9898 + m * 78.233 + k * 37.719 + seed * 4.1) * 43758.5453; return v - Math.floor(v) - 0.5; };

/** 菱形格子的节点：(n + m) 是偶数的地方才有。带抖动（手切的玻璃不方不正） */
const node = (n, m, aspect, seed) => [aspect / 2 - HW + n * HW + (seed ? hash(n, m, 1, seed) * 0.008 : 0), -0.5 + m * HZ + (seed ? hash(n, m, 2, seed) * 0.005 : 0)];
/** 以 (i, j) 编号的一块菱形的四个角和中心 */
function diamond(i, j, aspect, seed) {
  const o = j & 1, L = node(2 * i + o, j, aspect, seed), R = node(2 * i + 2 + o, j, aspect, seed), B = node(2 * i + 1 + o, j - 1, aspect, seed), T = node(2 * i + 1 + o, j + 1, aspect, seed);
  return { pts: [T, R, B, L], m: [(L[0] + R[0]) / 2, (B[1] + T[1]) / 2] };
}

/**
 * 图案的“画笔”。每一笔是一个 Path2D（等比坐标）加颜色。先在小画布上填色（给每一块玻璃取色用），之后带轮廓的几笔再在大画布上描成粗铅条。
 * line：这一笔的轮廓要不要铅条。底色的菱格不用它——菱格自己就是一块块玻璃。
 */
function makeArt(aspect) {
  const ops = [];
  const X = (u) => (u - 0.5) * aspect, Y = (v) => v - 0.5;
  const path = (pts, close = true) => { const p = new Path2D(); pts.forEach(([u, v], i) => (i ? p.lineTo(X(u), Y(v)) : p.moveTo(X(u), Y(v)))); if (close) p.closePath(); return p; };
  const spline = (pts) => {                                   // 过这些点的闭合平滑曲线
    const p = new Path2D(), n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m = mid(pts[n - 1], pts[0]); p.moveTo(X(m[0]), Y(m[1]));
    for (let i = 0; i < n; i++) { const q = pts[i], m2 = mid(q, pts[(i + 1) % n]); p.quadraticCurveTo(X(q[0]), Y(q[1]), X(m2[0]), Y(m2[1])); }
    p.closePath(); return p;
  };
  const metricPath = (pts) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p; };
  const A = {
    ops,
    grad(colA, colB) { ops.push({ rect: true, col: colA, col2: colB }); },
    /** 底色的菱格：两种颜色隔着排。和真贴上去的小玻璃是同一套格子 */
    quilt(colA, colB) {
      for (let j = 1; j * HZ < 1 + HZ * 3; j++) for (let i = -9; (2 * i + (j & 1)) * HW < aspect * 2 + HW * 4; i++) {
        const d = diamond(i, j, aspect, 0);
        ops.push({ path: metricPath(d.pts), col: (i + j) % 2 ? colB : colA });
      }
    },
    poly(pts, col, line = true) { ops.push({ path: path(pts), col, line }); },
    spline(pts, col, line = true) { ops.push({ path: spline(pts), col, line }); },
    disc(u, v, ru, rv, col, line = true) { const p = new Path2D(); p.ellipse(X(u), Y(v), ru * aspect, rv, 0, 0, Math.PI * 2); ops.push({ path: p, col, line }); },
    /** 一条有粗细的线（戟刃、巨藻的叶柄）：填色时按颜色描，上铅时先描一圈更粗的铅、中间再描回颜色 */
    stroke(pts, w, col, line = true) { ops.push({ path: path(pts, false), col, line, w, smooth: true }); },
    curve(pts, w, col, line = false) {                        // 平滑的开放曲线
      const p = new Path2D(); p.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (let i = 1; i < pts.length - 1; i++) p.quadraticCurveTo(X(pts[i][0]), Y(pts[i][1]), X((pts[i][0] + pts[i + 1][0]) / 2), Y((pts[i][1] + pts[i + 1][1]) / 2));
      const l = pts[pts.length - 1]; p.lineTo(X(l[0]), Y(l[1])); ops.push({ path: p, col, line, w, smooth: true });
    },
    /** 曲线以下（或以上）的一片：fn(u) 给出曲线的高度 */
    band(fn, col, below = true, line = true) {
      const pts = [];
      for (let u = -0.2; u <= 1.21; u += 0.04) pts.push([u, fn(u)]);
      ops.push({ path: path([...pts, [1.2, below ? -0.6 : 1.6], [-0.2, below ? -0.6 : 1.6]]), col, line });
    },
    fan(u, v, r, a0, a1, col, n = 10) {                       // 扇面（贝壳）：从 a0 到 a1（度，逆时针，0 = 朝右）
      const pts = [[u, v]];
      for (let i = 0; i <= n * 2; i++) { const a = ((a0 + ((a1 - a0) * i) / (n * 2)) * Math.PI) / 180; pts.push([u + (r * Math.cos(a)) / aspect, v + r * Math.sin(a)]); }
      ops.push({ path: path(pts), col, line: true });
      for (let k = 1; k < n; k++) { const a = ((a0 + ((a1 - a0) * k) / n) * Math.PI) / 180; ops.push({ path: path([[u, v], [u + (r * 0.97 * Math.cos(a)) / aspect, v + r * 0.97 * Math.sin(a)]], false), col: 'ink', line: true, thin: true }); }
    },
    rays(u, v, n, r, w, col, a0 = 0, span = 360) {            // 细长的光芒（没有铅条）
      for (let k = 0; k < n; k++) {
        const a = ((a0 + (span * k) / n) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), hx = (-s * w) / 2, hy = (c * w) / 2, ex = X(u) + r * c, ey = Y(v) + r * s;
        ops.push({ path: metricPath([[X(u), Y(v)], [ex + hx, ey + hy], [ex - hx, ey - hy]]), col, line: false });
      }
    },
    fish(u, v, len, col) {
      A.disc(u, v, len / 2, len / 4.2, col, true);
      A.poly([[u - len * 0.42, v], [u - len * 0.72, v + len * 0.26], [u - len * 0.72, v - len * 0.26]], col, true);
    },
  };
  return A;
}

/** 把一笔画到 ctx 上（ctx 已经设好等比坐标的变换）。lead：只画有粗细的线——先一圈铅，中间描回颜色 */
function paintOp(ctx, op, lead, leadW) {
  if (op.rect) { if (lead) return; const g = ctx.createLinearGradient(0, -0.5, 0, 0.5); g.addColorStop(0, rgb(PAL[op.col])); g.addColorStop(1, rgb(PAL[op.col2])); ctx.fillStyle = g; ctx.fillRect(-1, -0.6, 2, 1.2); return; }   // 渐变只是底色，上铅那一步不再画
  if (lead) {
    ctx.lineCap = ctx.lineJoin = 'round';
    if (op.smooth) { if (!op.line) return; ctx.strokeStyle = LEAD; ctx.lineWidth = op.w + leadW * 2.4; ctx.stroke(op.path); ctx.strokeStyle = rgb(PAL[op.col]); ctx.lineWidth = op.w; ctx.stroke(op.path); }
    else if (op.line) { ctx.strokeStyle = LEAD; ctx.lineWidth = op.thin ? leadW : leadW * 1.25; ctx.stroke(op.path); }
    return;
  }
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.strokeStyle = ctx.fillStyle = op.col === 'ink' ? LEAD : rgb(PAL[op.col]);
  if (op.smooth) { ctx.lineWidth = op.w; ctx.stroke(op.path); }
  else if (op.thin) { ctx.lineWidth = 0.004; ctx.stroke(op.path); }
  else ctx.fill(op.path);
}

/** 图案 */
const ART = {
  /** 三叉戟：金色的戟立在红玉色的圆章里，四周是蓝宝石的菱格 */
  trident(A) {
    A.quilt('blue', 'sapphire');
    A.rays(0.5, 0.5, 12, 0.6, 0.012, 'sky');
    A.disc(0.5, 0.5, 0.37, 0.15, 'ruby');
    A.disc(0.5, 0.5, 0.335, 0.135, 'amber');                  // 圆章里一圈琥珀色的内环
    A.disc(0.5, 0.5, 0.305, 0.122, 'ruby');
    A.stroke([[0.5, 0.1], [0.5, 0.6]], 0.055, 'gold');         // 戟柄
    A.stroke([[0.31, 0.44], [0.69, 0.44]], 0.034, 'gold');     // 横梁
    A.stroke([[0.5, 0.6], [0.5, 0.885]], 0.06, 'gold');        // 中间的戟刃
    for (const s of [-1, 1]) {                                   // 两边的戟刃：从戟头弯出去，再往上收，带倒钩
      A.curve([[0.5, 0.585], [0.5 + s * 0.1, 0.6], [0.5 + s * 0.165, 0.655], [0.5 + s * 0.185, 0.73], [0.5 + s * 0.175, 0.8]], 0.05, 'gold', true);
      A.poly([[0.5 + s * 0.2, 0.79], [0.5 + s * 0.125, 0.815], [0.5 + s * 0.2, 0.845]], 'gold');
    }
    A.stroke([[0.5, 0.596], [0.5, 0.5961]], 0.1, 'ivory');      // 戟头上的白玉：盖住几道戟刃汇过来的线
    for (const [u, v, c] of [[0.24, 0.72, 'white'], [0.76, 0.74, 'white'], [0.2, 0.3, 'ivory'], [0.8, 0.28, 'ivory'], [0.5, 0.2, 'white']]) A.disc(u, v, 0.02, 0.011, c, false);
  },
  /** 鲸和月亮：紫蓝的夜色里，一头鲸从满月下面游过，底下是三层海浪 */
  whale(A) {
    A.grad('blue', 'violet');
    for (const [u, v] of [[0.12, 0.9], [0.3, 0.95], [0.62, 0.93], [0.86, 0.88], [0.08, 0.74], [0.9, 0.7], [0.2, 0.62], [0.84, 0.56], [0.12, 0.4], [0.9, 0.33]]) A.disc(u, v, 0.012, 0.007, 'white', false);
    A.disc(0.5, 0.76, 0.2, 0.1, 'ivory');
    A.disc(0.5, 0.76, 0.165, 0.083, 'white');
    A.disc(0.47, 0.775, 0.04, 0.02, 'ivory', false); A.disc(0.54, 0.74, 0.025, 0.0125, 'ivory', false);   // 月面上的影
    A.spline([[0.25, 0.49], [0.19, 0.535], [0.105, 0.59], [0.135, 0.52], [0.15, 0.47], [0.125, 0.42], [0.1, 0.35], [0.195, 0.405], [0.25, 0.445]], 'whale');   // 两片尾鳍
    A.poly([[0.4, 0.578], [0.47, 0.625], [0.52, 0.583]], 'whale');                                   // 背鳍
    A.spline([[0.24, 0.5], [0.36, 0.555], [0.5, 0.585], [0.64, 0.588], [0.76, 0.572], [0.85, 0.535], [0.89, 0.49], [0.885, 0.445], [0.83, 0.415], [0.72, 0.4], [0.58, 0.395], [0.44, 0.405], [0.33, 0.425], [0.25, 0.44], [0.22, 0.465]], 'whale');
    for (const d of [0, 0.016, 0.032]) A.curve([[0.32 + d, 0.44 + d], [0.5, 0.412 + d], [0.7, 0.412 + d], [0.83, 0.432 + d]], 0.006, 'sky');   // 肚皮上的褶
    A.curve([[0.88, 0.447], [0.82, 0.432], [0.74, 0.43]], 0.007, 'night');                           // 嘴
    A.poly([[0.63, 0.418], [0.7, 0.41], [0.6, 0.325], [0.555, 0.33]], 'night');                       // 很长的胸鳍
    A.disc(0.82, 0.465, 0.012, 0.006, 'white', false);                                                // 眼睛
    A.band((u) => 0.255 + 0.03 * Math.sin(u * 15), 'teal');
    A.band((u) => 0.165 + 0.026 * Math.sin(u * 11 + 1.3), 'emerald');
    A.band((u) => 0.08 + 0.02 * Math.sin(u * 17 + 2.1), 'blue');
    A.curve([[0.0, 0.272], [0.2, 0.29], [0.4, 0.27], [0.6, 0.292], [0.8, 0.27], [1.0, 0.285]], 0.008, 'white');
    A.fish(0.22, 0.2, 0.1, 'gold'); A.fish(0.62, 0.12, 0.08, 'ivory'); A.fish(0.86, 0.21, 0.07, 'amber');
  },
  /** 贝壳明珠：一只张开的粉贝壳里躺着一颗明珠，两边是巨藻的叶子 */
  pearl(A) {
    A.quilt('emerald', 'teal');
    for (const [u, col, ph] of [[0.11, 'emerald', 0], [0.2, 'gold', 1.1], [0.89, 'amber', 2.2], [0.8, 'emerald', 3.3]]) {
      const pts = []; for (let k = 0; k <= 9; k++) pts.push([u + 0.035 * Math.sin(k * 1.3 + ph), -0.02 + k * 0.115]);
      A.curve(pts, 0.022, col, true);
      for (let k = 1; k < 9; k += 2) { const uu = u + 0.035 * Math.sin(k * 1.3 + ph), vv = -0.02 + k * 0.115, s = k % 3 ? 1 : -1; A.poly([[uu, vv], [uu + s * 0.075, vv + 0.05], [uu + s * 0.01, vv + 0.095]], k % 3 ? 'teal' : 'emerald'); }
    }
    A.rays(0.5, 0.4, 9, 0.6, 0.014, 'gold', 28, 124);
    A.band((u) => 0.2 + 0.02 * Math.sin(u * 9), 'sapphire');
    A.fan(0.5, 0.2, 0.44, 22, 158, 'rose', 7);
    A.fan(0.5, 0.2, 0.36, 33, 147, 'lilac', 6);
    A.disc(0.5, 0.4, 0.1, 0.05, 'white');
    A.disc(0.47, 0.415, 0.03, 0.015, 'ivory', false);
  },
  /** 巨藻和鱼（后殿的高窗）：五条巨藻从海底一直长到顶，鱼在叶子中间穿 */
  kelp(A) {
    A.quilt('blue', 'sapphire');
    A.band((u) => 0.1 + 0.03 * Math.sin(u * 12), 'emerald');
    [[0.19, 'emerald', 0, 0.02], [0.81, 'amber', 2.2, 0.02], [0.5, 'teal', 4.1, 0.013]].forEach(([u, col, ph, w]) => {
      const pts = []; for (let k = 0; k <= 10; k++) pts.push([u + 0.04 * Math.sin(k * 0.95 + ph), 0.06 + k * 0.095]);
      A.curve(pts, w, col, true);
      if (w < 0.015) return;
      for (let k = 1; k < 10; k += 1) { const uu = u + 0.04 * Math.sin(k * 0.95 + ph), vv = 0.06 + k * 0.095, s = (k + (u > 0.5 ? 1 : 0)) % 2 ? 1 : -1; A.poly([[uu, vv], [uu + s * 0.06, vv + 0.02], [uu + s * 0.012, vv + 0.045]], k % 2 ? 'teal' : 'emerald'); }
    });
    A.fish(0.34, 0.8, 0.11, 'gold'); A.fish(0.66, 0.62, 0.1, 'ivory'); A.fish(0.34, 0.36, 0.1, 'rose'); A.fish(0.67, 0.2, 0.09, 'gold');
  },
  /** 太阳三叉戟（后殿的高窗）：金色的一轮太阳，一把黑色的三叉戟压在上面 */
  sunTrident(A) {
    A.quilt('violet', 'blue');
    A.disc(0.5, 0.56, 0.46, 0.23, 'amber');
    A.rays(0.5, 0.56, 16, 0.7, 0.02, 'ivory');
    A.disc(0.5, 0.56, 0.4, 0.2, 'gold');
    A.stroke([[0.5, 0.07], [0.5, 0.64]], 0.07, 'whale');
    A.stroke([[0.24, 0.43], [0.76, 0.43]], 0.045, 'whale');
    A.stroke([[0.5, 0.64], [0.5, 0.965]], 0.075, 'whale');
    for (const s of [-1, 1]) {
      A.curve([[0.5, 0.62], [0.5 + s * 0.12, 0.64], [0.5 + s * 0.25, 0.7], [0.5 + s * 0.27, 0.8], [0.5 + s * 0.25, 0.87]], 0.07, 'whale', true);
      A.poly([[0.5 + s * 0.29, 0.86], [0.5 + s * 0.19, 0.895], [0.5 + s * 0.29, 0.93]], 'whale');
    }
    A.disc(0.5, 0.64, 0.07, 0.035, 'ivory');
  },
  /** 纯菱格（高处的小窗） */
  quilt(A) { A.quilt('blue', 'gold'); A.disc(0.5, 0.5, 0.3, 0.2, 'ruby'); A.disc(0.5, 0.5, 0.24, 0.16, 'ivory'); },
};

/** 尖拱轮廓（等比坐标，窗高为 1）和“离边多远” */
function lancet(aspect, spring = 0.68) {
  const hw = aspect / 2, hs = spring - 0.5, dy = 0.5 - hs, c = (dy * dy - hw * hw) / (2 * hw), R = hw + c, phi = Math.atan2(dy, -c);
  const pts = [[-hw, -0.5]];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + ((phi - Math.PI) * i) / 12; pts.push([c + R * Math.cos(a), hs + R * Math.sin(a)]); }
  for (let i = 12; i >= 0; i--) { const a = Math.PI + ((phi - Math.PI) * i) / 12; pts.push([-(c + R * Math.cos(a)), hs + R * Math.sin(a)]); }
  pts.push([hw, -0.5]);
  const depth = (X, Y) => (Y <= hs ? Math.min(hw - Math.abs(X), Y + 0.5) : Math.min(Y + 0.5, R - Math.hypot(Math.abs(X) + c, Y - hs)));
  return { pts, depth, hw, hs, c, R, phi };
}

/** 在图集的第 index 格画一扇尖拱窗 */
function drawLancet(ctx, design) {
  const { aspect, bg, border, seed } = design, r = rng(seed * 1013 + 7), A = makeArt(aspect);
  design.art(A);
  const ops = A.ops;
  const x0px = design.x0, cx = design.x0 + design.w / 2, cy = ROW / 2, S = ROW;
  const px = (X, Y) => [cx + X * S, cy - Y * S];
  const poly = (pts) => { const p = new Path2D(); pts.forEach(([X, Y], i) => { const [a, b] = px(X, Y); if (i) p.lineTo(a, b); else p.moveTo(a, b); }); p.closePath(); return p; };
  const L = lancet(aspect), clip = poly(L.pts);

  // 1. 小画布：只填色，用来给每一块玻璃取色
  const ah = 320, aw = Math.ceil(ah * (aspect + 0.3)), ac = document.createElement('canvas'); ac.width = aw; ac.height = ah;   // 等比：一个单位高 = ah 像素，宽度要装得下整扇窗
  const ax = ac.getContext('2d', { willReadFrequently: true });
  ax.setTransform(ah, 0, 0, -ah, aw / 2, ah / 2);
  for (const op of ops) paintOp(ax, op, false, 0);
  const img = ax.getImageData(0, 0, aw, ah).data;
  const colourAt = (X, Y) => {
    const ix = Math.max(0, Math.min(aw - 1, Math.round(aw / 2 + X * ah))), iy = Math.max(0, Math.min(ah - 1, Math.round(ah / 2 - Y * ah))), i = (iy * aw + ix) * 4;
    return nearest([img[i], img[i + 1], img[i + 2]]);
  };

  // 2. 底色：整扇窗先铺上图案的填色（图形是整块的，菱格只贴在没有图形的地方）
  ctx.save(); ctx.clip(clip);
  ctx.save(); ctx.setTransform(S / ah, 0, 0, S / ah, cx - (aw / 2) * (S / ah), cy - (ah / 2) * (S / ah)); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(ac, 0, 0); ctx.restore();
  ctx.lineJoin = 'round';

  // 3. 菱格：底色上的小玻璃块
  const cells = [];
  for (let j = 1; j * HZ < 1 + HZ; j++) for (let i = -9; (2 * i + (j & 1)) * HW < aspect * 2 + HW * 3; i++) {
    const d = diamond(i, j, aspect, seed), far = Math.min(...d.pts.map(([X, Y]) => L.depth(X, Y)), L.depth(d.m[0], d.m[1]));
    if (far < BW - 0.004 || !bg.includes(colourAt(d.m[0], d.m[1]))) continue;
    cells.push({ p: poly(d.pts), m: d.m, col: colourAt(d.m[0], d.m[1]), w: 2.0 });
  }
  // 4. 花边：贴着窗子轮廓的一圈小长块，两种颜色隔着排；第一种颜色里嵌一粒象牙色的小菱形
  const nSide = Math.round((0.5 + L.hs) / 0.072), nBot = Math.round(aspect / 0.072), bw = BW, rim = [];
  for (let k = 0; k < nSide; k++) { const y0 = -0.5 + ((0.5 + L.hs) * k) / nSide, y1 = -0.5 + ((0.5 + L.hs) * (k + 1)) / nSide; rim.push({ p: poly([[-L.hw, y0], [-L.hw, y1], [-L.hw + bw, y1], [-L.hw + bw, y0]]), m: [-L.hw + bw / 2, (y0 + y1) / 2] }); }
  for (let k = 0; k < 6; k++) {
    const a0 = Math.PI + ((L.phi - Math.PI) * k) / 6, a1 = Math.PI + ((L.phi - Math.PI) * (k + 1)) / 6, at = (rr, a) => [L.c + rr * Math.cos(a), L.hs + rr * Math.sin(a)], mid = (a0 + a1) / 2;
    rim.push({ p: poly([at(L.R, a0), at(L.R, a1), at(L.R - bw, a1), at(L.R - bw, a0)]), m: [L.c + (L.R - bw / 2) * Math.cos(mid), L.hs + (L.R - bw / 2) * Math.sin(mid)] });
    const b0 = (Math.PI - L.phi) * (1 - k / 6), b1 = (Math.PI - L.phi) * (1 - (k + 1) / 6), bm = (b0 + b1) / 2;
    rim.push({ p: poly([at(L.R, b0), at(L.R, b1), at(L.R - bw, b1), at(L.R - bw, b0)].map(([X, Y]) => [-X, Y])), m: [-(L.c + (L.R - bw / 2) * Math.cos(bm)), L.hs + (L.R - bw / 2) * Math.sin(bm)] });
  }
  for (let k = 0; k < nSide; k++) { const y1 = L.hs - ((0.5 + L.hs) * k) / nSide, y0 = L.hs - ((0.5 + L.hs) * (k + 1)) / nSide; rim.push({ p: poly([[L.hw - bw, y0], [L.hw - bw, y1], [L.hw, y1], [L.hw, y0]]), m: [L.hw - bw / 2, (y0 + y1) / 2] }); }
  for (let k = 0; k < nBot; k++) { const x1 = L.hw - ((aspect * k) / nBot), x0 = L.hw - ((aspect * (k + 1)) / nBot); rim.push({ p: poly([[x0, -0.5], [x1, -0.5], [x1, -0.5 + bw], [x0, -0.5 + bw]]), m: [(x0 + x1) / 2, -0.5 + bw / 2] }); }
  rim.forEach((cell, k) => { cell.col = border[k % 2]; cell.w = 2.6; cell.bead = k % 2 === 0; });

  // 5. 一块块玻璃：颜色有一点点差别，里面有一点透亮
  const all = [...rim, ...cells];
  for (const cell of all) {
    const [mx, my] = px(cell.m[0], cell.m[1]), tone = 0.86 + r() * 0.28;
    ctx.fillStyle = rgb(PAL[cell.col].map((v, k) => v * tone * (1 + hash(mx | 0, my | 0, k, 3) * 0.1))); ctx.fill(cell.p);
    ctx.save(); ctx.clip(cell.p);
    const g = ctx.createRadialGradient(mx + (r() - 0.5) * 30, my + (r() - 0.5) * 30, 0, mx, my, 16 + r() * 18);
    g.addColorStop(0, `rgba(255,255,255,${0.14 + r() * 0.2})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(mx - 60, my - 60, 120, 120);
    ctx.restore();
    if (cell.bead) { const b = new Path2D(); b.moveTo(mx, my - 5.5); b.lineTo(mx + 5, my); b.lineTo(mx, my + 5.5); b.lineTo(mx - 5, my); b.closePath(); ctx.fillStyle = rgb(PAL.ivory, 0.9 + r() * 0.15); ctx.fill(b); }
  }
  ctx.globalCompositeOperation = 'source-atop';                                              // 玻璃厚薄不匀：一层深浅不一的斑
  for (let k = 0; k < 70; k++) { const gx = x0px + r() * design.w, gy = r() * ROW, rad = 14 + r() * 40, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad), a = 0.05 + r() * 0.09; g.addColorStop(0, r() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,20,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2); }
  ctx.globalCompositeOperation = 'source-over';
  // 6. 铅条
  ctx.strokeStyle = LEAD;
  for (const cell of all) { ctx.lineWidth = cell.w; ctx.stroke(cell.p); }
  ctx.save(); ctx.setTransform(S, 0, 0, -S, cx, cy);
  for (const op of ops) paintOp(ctx, op, true, 0.005);
  ctx.restore();
  // 7. 缺了几块（上面的先掉），再蒙上一层水垢和泥
  for (const cell of all) {
    const high = Math.max(0, cell.m[1] + 0.1);
    if (r() > 0.035 + high * 0.06) continue;
    ctx.save(); ctx.clip(cell.p);
    const [mx, my] = px(cell.m[0], cell.m[1]); ctx.clearRect(mx - 40, my - 40, 80, 80);
    ctx.restore();
    ctx.lineWidth = cell.w; ctx.strokeStyle = LEAD; ctx.stroke(cell.p);                  // 铅条框还在
  }
  const dirt = (X, Y, rad, a) => { const [gx, gy] = px(X, Y), g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad); g.addColorStop(0, `rgba(8,22,20,${a})`); g.addColorStop(1, 'rgba(8,22,20,0)'); ctx.fillStyle = g; ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2); };
  for (let k = 0; k < 7; k++) dirt((r() - 0.5) * aspect * 0.9, r() * 0.42 - 0.5, 40 + r() * 70, 0.2 + r() * 0.2);
  for (let k = 0; k < 4; k++) dirt((r() < 0.5 ? -1 : 1) * (aspect * 0.5 - 0.03), r() * 0.9 - 0.5, 30 + r() * 40, 0.16);
  ctx.restore();
}

/** 玫瑰窗（单独一张 512 × 512）：中间一颗明珠，一圈八瓣、一圈十六瓣，最外一圈小方块 */
function drawRose(ctx) {
  const N = 512, c = N / 2, S = N * 0.97, r = rng(77), P = (rr, a) => [c + rr * S * Math.cos(a), c - rr * S * Math.sin(a)];
  const cell = (build, col, w = 3.2) => { const p = new Path2D(); build(p); ctx.fillStyle = rgb(PAL[col], 0.86 + r() * 0.26); ctx.fill(p); ctx.lineWidth = w; ctx.strokeStyle = LEAD; ctx.stroke(p); };
  const arc = (p, rr, a0, a1) => { for (let i = 1; i <= 6; i++) { const [x, y] = P(rr, a0 + ((a1 - a0) * i) / 6); p.lineTo(x, y); } };
  const shape = (r0, r1, a0, a1, gap, col, w) => {              // 一瓣：里窄外宽，两个腰是鼓出来的曲线，尖朝外
    const am = (a0 + a1) / 2, [tx, ty] = P(r1, am), [c1x, c1y] = P(r1 * 0.965, a0 + (a1 - a0) * 0.3), [c2x, c2y] = P(r1 * 0.965, a1 - (a1 - a0) * 0.3);
    cell((p) => { p.moveTo(...P(r0, a0 + gap)); p.quadraticCurveTo(c1x, c1y, tx, ty); p.quadraticCurveTo(c2x, c2y, ...P(r0, a1 - gap)); p.closePath(); }, col, w);
  };
  for (let k = 0; k < 32; k++) { const a0 = (k / 32) * Math.PI * 2, a1 = ((k + 1) / 32) * Math.PI * 2; cell((p) => { p.moveTo(...P(0.5, a0)); arc(p, 0.5, a0, a1); p.lineTo(...P(0.462, a1)); arc(p, 0.462, a1, a0); p.closePath(); }, k % 2 ? 'white' : 'violet', 2.6); }
  ctx.beginPath(); ctx.arc(c, c, 0.45 * S, 0, Math.PI * 2); ctx.fillStyle = rgb(PAL.blue); ctx.fill();
  for (let k = 0; k < 16; k++) { const a0 = (k / 16) * Math.PI * 2; shape(0.3, 0.452, a0, a0 + Math.PI / 8, 0.05, k % 2 ? 'gold' : 'teal'); }
  for (let k = 0; k < 8; k++) { const a0 = (k / 8) * Math.PI * 2; shape(0.165, 0.35, a0, a0 + Math.PI / 4, 0.1, k % 2 ? 'sapphire' : 'ruby', 3.6); }
  ctx.beginPath(); ctx.arc(c, c, 0.302 * S, 0, Math.PI * 2); ctx.strokeStyle = LEAD; ctx.lineWidth = 3; ctx.stroke();
  cell((p) => p.arc(c, c, 0.165 * S, 0, Math.PI * 2), 'gold', 3.6);                        // 圆章：金底，八道白玉的光，中间一颗明珠
  ctx.beginPath(); ctx.arc(c, c, 0.125 * S, 0, Math.PI * 2); ctx.fillStyle = rgb(PAL.amber); ctx.fill();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.39; cell((p) => { p.moveTo(...P(0.02, a - 0.5)); p.lineTo(...P(0.125, a - 0.1)); p.lineTo(...P(0.125, a + 0.1)); p.lineTo(...P(0.02, a + 0.5)); p.closePath(); }, 'ivory', 2.2); }
  cell((p) => p.arc(c, c, 0.052 * S, 0, Math.PI * 2), 'white', 3);
  ctx.globalCompositeOperation = 'source-atop';                                              // 水垢
  for (let k = 0; k < 9; k++) { const a = r() * Math.PI * 2, d = r() * 0.45 * S, gx = c + d * Math.cos(a), gy = c + d * Math.sin(a), rad = 30 + r() * 60, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad); g.addColorStop(0, 'rgba(8,22,20,0.30)'); g.addColorStop(1, 'rgba(8,22,20,0)'); ctx.fillStyle = g; ctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2); }
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * 图集里每一种花样占一格（横着排）。aspect：花样是按多宽的窗子画的（宽 / 高）。
 * u0..u1：在图集里的位置（每一格的宽度跟着长宽比走）。玻璃板和落在地上的光斑都按它取贴图。
 */
const DESIGNS = [
  { name: 'trident', aspect: 0.45, art: ART.trident, bg: ['blue', 'sapphire'], border: ['ruby', 'gold'] },
  { name: 'whale', aspect: 0.45, art: ART.whale, bg: ['blue', 'violet', 'night'], border: ['violet', 'gold'] },
  { name: 'pearl', aspect: 0.45, art: ART.pearl, bg: ['emerald', 'teal'], border: ['rose', 'gold'] },
  { name: 'kelp', aspect: 0.28, art: ART.kelp, bg: ['blue', 'sapphire'], border: ['teal', 'gold'] },
  { name: 'sun', aspect: 0.28, art: ART.sunTrident, bg: ['violet', 'blue'], border: ['ruby', 'ivory'] },
  { name: 'quilt', aspect: 0.66, art: ART.quilt, bg: ['blue', 'gold'], border: ['ruby', 'white'] },
];
const WIDTHS = DESIGNS.map((d) => Math.round(d.aspect * ROW)), TOTAL = WIDTHS.reduce((a, b) => a + b, 0);
let acc = 0;
export const GLASS_DESIGNS = Object.freeze(DESIGNS.map((d, i) => { const x0 = acc; acc += WIDTHS[i]; return Object.freeze({ ...d, seed: i + 1, x0, w: WIDTHS[i], u0: x0 / TOTAL, u1: acc / TOTAL, v0: 0, v1: 1 }); }));
/** 玫瑰窗在贴图里的位置（整张） */
export const ROSE_REGION = Object.freeze({ u0: 0, u1: 1, v0: 0, v1: 1 });

/** 两张贴图：尖拱窗的图集、玫瑰窗 */
export function stainedGlassTextures() {
  const make = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const atlas = make(TOTAL, ROW);
  GLASS_DESIGNS.forEach((d) => drawLancet(atlas.getContext('2d'), d));
  const rose = make(512, 512); drawRose(rose.getContext('2d'));
  const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.userData.canvas = c; return t; };
  return { atlas: tex(atlas), rose: tex(rose) };
}
