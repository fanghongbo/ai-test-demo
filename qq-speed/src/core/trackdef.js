// 「十一城」赛道中心线。
// 坐标：一切在官方赛道小地图的像素上标注（169 × 147，x 向右、y 向下），再按 SCALE 换算成米。
// 世界坐标：X = (x − ORIGIN.x) · SCALE（向东），Z = (y − ORIGIN.y) · SCALE（向南，小地图下方）。路面高度恒为 0。
// 行进方向：起点在底部长直道（跨海大桥）上，向西出发，第一个弯右转。
//
// 顶点按行进顺序排成一个环。每个顶点带：倒角半径 r（像素）、该处的路半宽 hw（米）、区段名 tag。
// 发卡弯 = 相距 2r 的两个顶点，各带半径 r：两段 90° 圆弧首尾相接正好是半圆。
// 这一层是纯数据 + 纯计算，不依赖 three，可以在 Node 里测试。
import { wrapAngle } from './mathx.js';

export const SCALE = 3.0;                      // 米 / 小地图像素
export const ORIGIN = { x: 84.5, y: 73.5 };
export const WALL = 2.2;                         // 墙面离路中的距离 = 半宽 + 2.2 米（可行驶的边界）    // 小地图上的这一点落在世界原点
export const toWorld = (x, y) => [(x - ORIGIN.x) * SCALE, (y - ORIGIN.y) * SCALE];
export const toMap = (X, Z) => [X / SCALE + ORIGIN.x, Z / SCALE + ORIGIN.y];
const D2R = Math.PI / 180;
const SEG = (deg) => [Math.cos(deg * D2R), Math.sin(deg * D2R)];
const right = (d) => [-d[1], d[0]];
const along = (p, d, t) => [p[0] + d[0] * t, p[1] + d[1] * t];
/** 直线 p + t·d 与竖直线 x = x0 的交点的 y */
const yAtX = (p, d, x0) => p[1] + (x0 - p[0]) / d[0] * d[1];
/** 发卡弯：A 是入弯切点（在来向 d 的直线上），转向 s（+1 右 / −1 左），半径 r。返回出弯切点。 */
const hairpin = (A, d, r, s) => along(A, right(d), s * 2 * r);

/** 顶点表。顺序即行进顺序。 */
export function vertices() {
  const V = [];
  const P = (x, y, r, hw, tag) => { V.push({ x, y, r, hw, tag }); return V[V.length - 1]; };
  const pushHP = (A, r, hw, tagA, B, tagB, hwB = hw) => { P(A[0], A[1], r, hw, tagA); P(B[0], B[1], r, hwB, tagB); };

  // ——— 底部长直道（跨海大桥，起点线所在），向西 ———
  P(134.0, 126.6, 3.5, 8.5, 'start');
  // ——— 弯 1：右转 90° 上岸；之字引桥 ———
  P(68.0, 126.6, 3.3, 8.6, 'link');
  P(64.7, 121.5, 3.3, 7.4, 'link');
  P(58.0, 115.6, 3.3, 7.4, 'link');
  // ——— 西岸大道：向北 ———
  P(58.0, 98.8, 3.4, 8.0, 'canal');
  // ——— 西侧横道：左转，尽头右发卡折回 ———
  pushHP([40.4, 94.6], 4.1, 7.6, 'westRoad', hairpin([40.4, 94.6], SEG(180), 4.1, +1), 'westRoad');
  // ——— 东行到头，左转北上，顺势左摆进入长斜路的去程车道 ———
  P(60.7, 86.4, 3.0, 7.0, 'hookC');
  P(60.7, 79.9, 2.7, 6.2, 'laneIn');
  // ——— 长斜路（两条窄车道夹一条隔离带）：去程 NW，最西端右发卡，回程 SE ———
  let A = along([60.7, 79.9], SEG(208), 23.5), B = hairpin(A, SEG(208), 3.1, +1);
  pushHP(A, 3.1, 5.8, 'laneIn', B, 'laneOut');
  // ——— 斜路东端左发卡，进入 V 形回程车道（NW 向） ———
  A = [71.5, yAtX(B, SEG(28), 71.5)]; B = hairpin(A, SEG(28), 3.8, -1);
  pushHP(A, 3.8, 6.0, 'laneOut', B, 'laneV');
  // ——— V 车道到头右弯转西，接顶部横道下的右发卡 ———
  const c13 = along(B, SEG(208), 19.31);
  P(c13[0], c13[1], 4.0, 6.2, 'laneV');
  A = [53.0, c13[1]]; B = hairpin(A, SEG(180), 3.6, +1);
  pushHP(A, 3.6, 6.2, 'uTop', B, 'topBand');
  // ——— 顶部横道：东行到头，左转爬上最高发卡弯的左腿 ———
  const L1 = (y) => 62.7 + (y - 25.3) * 0.5135;        // 左腿所在直线
  P(L1(B[1]), B[1], 2.8, 6.0, 'topBand');
  A = [L1(21.5), 21.5]; B = hairpin(A, SEG(242.8), 3.7, +1);
  pushHP(A, 3.7, 6.4, 'legL1', B, 'legL2');
  // ——— 右腿下来，左转进入横向联络道，再左转北上接 W 形发卡 ———
  P(along(B, SEG(62.8), (60.3 - B[1]) / Math.sin(62.8 * D2R))[0], 60.3, 3.0, 6.4, 'legL2');
  P(96.6, 60.3, 3.0, 6.4, 'crossRoad');
  pushHP([96.6, 53.6], 3.7, 6.0, 'uW1', hairpin([96.6, 53.6], SEG(270), 3.7, +1), 'uW1down');
  // ——— 南下到头，小半径左回旋，甩上东北向斜道；斜道到头右回旋南下 ———
  const DIN = SEG(-76), Q = [114.3, 51.0];              // 斜道：过 Q，方向 DIN
  P(104.0, yAtX(Q, DIN, 104.0), 2.9, 5.8, 'uV1');
  P(along(Q, DIN, -8.3)[0], along(Q, DIN, -8.3)[1], 0, 6.0, 'diagNE');
  P(121.0, yAtX(Q, DIN, 121.0), 2.8, 6.0, 'uN');
  // ——— 南下，左转进入右侧发卡群（四条横向指路） ———
  P(121.0, 72.4, 3.0, 6.4, 'colS');
  let d = [147.6 - 121.0, 67.2 - 72.4], dl = Math.hypot(d[0], d[1]); d = [d[0] / dl, d[1] / dl];
  A = [147.6, 67.2]; B = hairpin(A, d, 3.8, +1);
  pushHP(A, 3.8, 7.0, 'uE1', B, 'fallW', 6.8);
  A = along(B, [-d[0], -d[1]], 24.9); B = hairpin(A, [-d[0], -d[1]], 3.3, -1);
  pushHP(A, 3.3, 6.2, 'uMid', B, 'riseE2', 6.4);
  A = along(B, d, 18.74); B = hairpin(A, d, 3.3, +1);
  pushHP(A, 3.3, 6.5, 'uE2', B, 'fallW2', 6.3);
  A = along(B, [-d[0], -d[1]], 20.6); B = hairpin(A, [-d[0], -d[1]], 4.0, -1);
  pushHP(A, 4.0, 6.2, 'uHook', B, 'final', 6.8);
  // ——— 末段：右转南下，再右转回到起点直道 ———
  P(134.0, yAtX(B, d, 134.0), 3.5, 8.2, 'final');
  return V;
}

/** 区段中文名（HUD、结算里用） */
export const ZONE_CN = {
  start: '跨海大桥', link: '引桥', canal: '西岸大道', westRoad: '滨海横道', hookC: '折角', laneIn: '长斜路·去程', laneOut: '长斜路·回程',
  laneV: '回旋车道', uTop: '顶部发卡', topBand: '高架横道', legL1: '上坡腿', legL2: '下坡腿', crossRoad: '联络道', uW1: 'W 形发卡',
  uW1down: 'W 形发卡', uV1: '回旋弯', diagNE: '斜道', uN: '北发卡', colS: '南廊', uE1: '东发卡一', fallW: '回程一', uMid: '中发卡',
  riseE2: '东行二', uE2: '东发卡二', fallW2: '回程二', uHook: '钩形弯', final: '末段',
};

/**
 * 把顶点环变成等弧长采样。
 * @param {{ds?: number}} o ds 采样间距（米）
 */
export function createTrack(o = {}) {
  const V = vertices(), n = V.length;
  const zoneNames = [...new Set(V.map((v) => v.tag))];
  const zoneId = Object.fromEntries(zoneNames.map((z, i) => [z, i]));
  // 转角与期望半径；相邻两个弯共用一段直线时，按线段长度把它们一起收小
  const din = [], dout = [], ang = new Float64Array(n), rad = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const A = V[(i + n - 1) % n], P = V[i], B = V[(i + 1) % n];
    din[i] = [(P.x - A.x) / Math.hypot(P.x - A.x, P.y - A.y), (P.y - A.y) / Math.hypot(P.x - A.x, P.y - A.y)];
    dout[i] = [(B.x - P.x) / Math.hypot(B.x - P.x, B.y - P.y), (B.y - P.y) / Math.hypot(B.x - P.x, B.y - P.y)];
    ang[i] = Math.atan2(din[i][0] * dout[i][1] - din[i][1] * dout[i][0], din[i][0] * dout[i][0] + din[i][1] * dout[i][1]);   // 带符号转角，正 = 右转
    rad[i] = Math.abs(ang[i]) > 1e-4 ? Math.max(0, V[i].r) : 0;
  }
  const tanHalf = ang.map((a) => Math.tan(Math.abs(a) / 2));
  const segLen = V.map((v, i) => Math.hypot(V[(i + 1) % n].x - v.x, V[(i + 1) % n].y - v.y));
  for (let pass = 0; pass < 24; pass++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ti = rad[i] * tanHalf[i], tj = rad[j] * tanHalf[j], room = 0.997 * segLen[i];
      if (ti + tj > room && ti + tj > 1e-9) {
        const f = room / (ti + tj);
        if (rad[i] * f < rad[i] - 1e-9) { rad[i] *= f; changed = true; }
        if (rad[j] * f < rad[j] - 1e-9) { rad[j] *= f; changed = true; }
      }
    }
    if (!changed) break;
  }
  const T1 = [], T2 = [], arc = [];                   // 每个顶点的入 / 出切点、圆弧上的点（像素）
  for (let i = 0; i < n; i++) {
    const P = V[i], pts = [], r = rad[i];
    if (r > 0) {
      const t = r * tanHalf[i];
      const a = [P.x - din[i][0] * t, P.y - din[i][1] * t], b = [P.x + dout[i][0] * t, P.y + dout[i][1] * t];
      const c = along(a, right(din[i]), Math.sign(ang[i]) * r);
      const a0 = Math.atan2(a[1] - c[1], a[0] - c[0]), m = Math.max(3, Math.ceil(Math.abs(ang[i]) * r / 0.35));
      for (let k = 0; k <= m; k++) { const q = a0 + ang[i] * (k / m); pts.push([c[0] + r * Math.cos(q), c[1] + r * Math.sin(q)]); }
      T1.push(a); T2.push(b);
    } else { T1.push([P.x, P.y]); T2.push([P.x, P.y]); }
    arc.push(pts);
  }
  const VR = rad;
  // 细密折线（像素）：每个顶点先出自己的圆弧，再走通向下一个顶点的直线。区段名 / 路宽都取该顶点的。
  const px = [], phw = [], pzone = [], parc = [];
  for (let i = 0; i < n; i++) {
    const v = V[i], zid = zoneId[v.tag];
    for (const p of arc[i]) { px.push(p); phw.push(v.hw); pzone.push(zid); parc.push(1); }
    const from = T2[i], to = T1[(i + 1) % n];
    const L = Math.hypot(to[0] - from[0], to[1] - from[1]), m = Math.max(1, Math.ceil(L / 0.5));
    for (let k = 0; k < m; k++) { const u = k / m; px.push([from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u]); phw.push(v.hw); pzone.push(zid); parc.push(0); }
  }
  // 弧长
  const M = px.length, sPx = new Float64Array(M + 1);
  for (let k = 0; k < M; k++) { const a = px[k], b = px[(k + 1) % M]; sPx[k + 1] = sPx[k] + Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const Lpx = sPx[M], Lm = Lpx * SCALE;
  const ds = o.ds ?? 1.5, N = Math.max(8, Math.round(Lm / ds)), h = Lm / N;
  const X = new Float64Array(N), Z = new Float64Array(N), HW = new Float32Array(N), K = new Float32Array(N), TH = new Float32Array(N);
  const zone = new Uint8Array(N), inArc = new Uint8Array(N);
  let k = 0;
  for (let j = 0; j < N; j++) {
    const target = (j * h / SCALE) % Lpx;
    while (k < M - 1 && sPx[k + 1] < target) k++;
    while (k > 0 && sPx[k] > target) k--;
    const k2 = (k + 1) % M, seg = (sPx[k + 1] - sPx[k]) || 1, u = (target - sPx[k]) / seg;
    const x = px[k][0] + (px[k2][0] - px[k][0]) * u, y = px[k][1] + (px[k2][1] - px[k][1]) * u;
    [X[j], Z[j]] = toWorld(x, y);
    HW[j] = phw[k] + (phw[k2] - phw[k]) * u;
    zone[j] = u < 0.5 ? pzone[k] : pzone[k2];
    inArc[j] = parc[k];
  }
  // 路宽渐变（环形平滑，两遍 7 点）
  for (let pass = 0; pass < 2; pass++) {
    const src = HW.slice(), W = 7, half = W >> 1;
    for (let j = 0; j < N; j++) { let s = 0; for (let q = -half; q <= half; q++) s += src[(j + q + N) % N]; HW[j] = s / W; }
  }
  // 朝向与曲率（中心差分），曲率再做一次三点平滑
  const raw = new Float32Array(N);
  for (let j = 0; j < N; j++) {
    const a = (j + N - 1) % N, b = (j + 1) % N;
    TH[j] = Math.atan2(Z[b] - Z[a], X[b] - X[a]);
  }
  for (let j = 0; j < N; j++) {
    const a = (j + N - 1) % N, b = (j + 1) % N;
    raw[j] = wrapAngle(TH[b] - TH[a]) / (2 * h);
  }
  for (let j = 0; j < N; j++) K[j] = (raw[(j + N - 1) % N] + raw[j] * 2 + raw[(j + 1) % N]) * 0.25;
  // 内缘不许自叠：转弯半径减去半宽至少还要剩一点
  for (let j = 0; j < N; j++) { const ak = Math.abs(K[j]); if (ak > 1e-6) HW[j] = Math.min(HW[j], 0.82 / ak); }

  // 采样 0 号挪到起点线上：里程 s=0 就是起点 / 终点线
  let best = 0, bd = Infinity;
  const [sx, sz] = toWorld(108, 126.6);
  for (let j = 0; j < N; j++) { const dd = (X[j] - sx) ** 2 + (Z[j] - sz) ** 2; if (dd < bd) { bd = dd; best = j; } }
  const rot = (arr) => { const o = arr.slice(); for (let j = 0; j < N; j++) o[j] = arr[(j + best) % N]; return o; };
  const TX = rot(X), TZ = rot(Z), TR = rot(TH), TK = rot(K), TW = rot(HW), TZn = rot(zone), TA = rot(inArc);

  const T = { N, ds: h, L: Lm, Lpx, x: TX, z: TZ, th: TR, kap: TK, hw: TW, zone: TZn, inArc: TA, zoneNames, zoneId, verts: V, vertR: VR, cornerAng: ang };
  T.zones = {};                                       // 每个区段占哪些采样
  for (let j = 0; j < N; j++) { const nm = zoneNames[TZn[j]]; (T.zones[nm] ??= []).push(j); }
  T.startIdx = 0;
  T.startS = 0;
  T.worldOf = toWorld;
  T.mapOf = toMap;
  return T;
}

/** 第 i 个采样的右向单位向量 */
export function rightAt(T, i, out = [0, 0]) { const t = T.th[i]; out[0] = -Math.sin(t); out[1] = Math.cos(t); return out; }
/** 第 i 个采样、横向偏移 lat（右为正）处的世界坐标 */
export function pointAt(T, i, lat, out = [0, 0]) { const t = T.th[i]; out[0] = T.x[i] - Math.sin(t) * lat; out[1] = T.z[i] + Math.cos(t) * lat; return out; }

/**
 * 最近点查询。hint 是上一次的采样号（不给就全局搜）。
 * @returns {{i:number, e:number, u:number, s:number, d:number}} i 起始采样号，e 横向偏移（右为正，米），u 段内比例，s 沿程里程（米），d 到中心线的距离
 */
export function nearest(T, X, Z, hint = -1) {
  const N = T.N;
  let best = 0, bd = Infinity;
  const scan = (from, count) => { for (let q = 0; q < count; q++) { const j = (from + q + N) % N; const dd = (T.x[j] - X) ** 2 + (T.z[j] - Z) ** 2; if (dd < bd) { bd = dd; best = j; } } };
  if (hint < 0) scan(0, N); else scan(hint - 60, 121);
  if (hint >= 0 && bd > 50 * 50) { bd = Infinity; scan(0, N); }
  // 投影到 (best − 1 → best) 与 (best → best + 1) 两段里较近的一段
  let i0 = best, u = 0;
  for (const j0 of [(best + N - 1) % N, best]) {
    const j1 = (j0 + 1) % N, ax = T.x[j0], az = T.z[j0], ex = T.x[j1] - ax, ez = T.z[j1] - az;
    const uu = Math.max(0, Math.min(1, ((X - ax) * ex + (Z - az) * ez) / (ex * ex + ez * ez)));
    const dd = (ax + ex * uu - X) ** 2 + (az + ez * uu - Z) ** 2;
    if (dd <= bd + 1e-9) { bd = dd; i0 = j0; u = uu; }
  }
  const j1 = (i0 + 1) % N, th = T.th[i0] + wrapAngle(T.th[j1] - T.th[i0]) * u, ct = Math.cos(th), st = Math.sin(th);
  const dx = X - T.x[i0], dz = Z - T.z[i0];
  const e = -dx * st + dz * ct;
  return { i: i0, e, u, s: (i0 + u) * T.ds, d: Math.sqrt(bd) };
}
