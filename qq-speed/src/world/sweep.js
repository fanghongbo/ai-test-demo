// 沿赛道把一条截面轮廓扫成几何：路面、桥面板、护栏、墙体都是这样生成的。
// 每一段轮廓边是一条独立的三角带（截面方向上是平直棱边，沿赛道方向连续），法线由几何本身算出。
// 贴图坐标：u = 沿截面轮廓的累计长度（米）× uScale，v = 沿程里程（米）× vScale —— 竖直的墙面上贴图不会被拉成条纹。
import * as THREE from 'three';
import { pointAt } from '../core/trackdef.js';

/** 从 i0 到 i1（含）的采样号序列，允许绕回起点；i1 − i0 ≥ N 表示整圈（首尾各一排）。一定包含最后一个采样 */
export function rowsOf(T, i0, i1, step = 1) {
  const N = T.N, len = i1 - i0, n = len >= N ? len : ((len % N) + N) % N, out = [], a0 = ((i0 % N) + N) % N;   // i0 可以是负数（起点线前后）
  for (let k = 0; k <= n; k += step) out.push((a0 + k) % N);
  if (out[out.length - 1] !== (a0 + n) % N) out.push((a0 + n) % N);
  return out;
}

const latOf = (p, i) => (typeof p.lat === 'function' ? p.lat(i) : p.lat);

/**
 * @param {object} T createTrack() 的结果
 * @param {number} i0 起始采样（含）
 * @param {number} i1 结束采样（含；可以小于 i0 表示绕回起点；i1 − i0 ≥ N 表示整圈）
 * @param {Array<{lat:number|function, y:number, u?:number}>} profile 截面点：lat 横向偏移（米，右为正；可以是 (i) => 数 的函数），y 高度
 * @param {object} o
 *   step    每隔几个采样取一排（默认 1）
 *   closed  轮廓是否闭合（默认 true）
 *   flip    翻转绕序与法线
 *   vScale  沿程 1 米对应多少 v（默认 0.25）
 *   uScale  截面方向 1 米对应多少 u（默认 0.25）
 *   color   (i, lat, y, out3) => 顶点色：往 out3 里写，或者直接返回 [r, g, b]
 *   extra   { name, size, fn(i, lat, y, out) } 额外的顶点属性（每个顶点调用一次 fn，往 out 里写 size 个数）
 * @returns {THREE.BufferGeometry} 非索引几何
 */
export function sweep(T, i0, i1, profile, o = {}) {
  const R = rowsOf(T, i0, i1, o.step ?? 1);
  const closed = o.closed ?? true, nP = profile.length, nE = closed ? nP : nP - 1;
  const nTri = (R.length - 1) * Math.max(0, nE) * 2;
  const pos = new Float32Array(Math.max(1, nTri) * 9), uv = new Float32Array(Math.max(1, nTri) * 6), col = o.color ? new Float32Array(Math.max(1, nTri) * 9) : null;
  const ex = o.extra ? { name: o.extra.name, size: o.extra.size, data: new Float32Array(Math.max(1, nTri) * 3 * o.extra.size) } : null;
  const c = [0, 0, 1], out = ex ? new Float32Array(ex.size) : null, cc = [0, 0, 0];
  const flip = !!o.flip, uS = o.uScale ?? 0.25, vS = o.vScale ?? 0.25;
  let t = 0, sArc = 0;
  const put = (i, lat, y, u, v) => {
    pointAt(T, i, lat, c);
    const k = t * 3;
    pos[k] = c[0]; pos[k + 1] = y; pos[k + 2] = c[1];
    uv[t * 6] = u; uv[t * 6 + 1] = v;
    if (col) { const r = o.color(i, lat, y, cc); if (r) { cc[0] = r[0]; cc[1] = r[1]; cc[2] = r[2]; } col[k] = cc[0]; col[k + 1] = cc[1]; col[k + 2] = cc[2]; }
    if (ex) { out.fill(0); o.extra.fn(i, lat, y, out); ex.data.set(out, t * ex.size); }
    t++;
  };
  for (let r = 0; r < R.length - 1; r++) {
    const ia = R[r], ib = R[r + 1], va = sArc * vS;
    sArc += T.ds * (((ib - ia + T.N) % T.N) || T.N);
    const vb = sArc * vS;
    let u0 = 0;                                                   // 截面方向的累计长度
    for (let e = 0; e < nE; e++) {
      const p0 = profile[e], p1 = profile[(e + 1) % nP];
      const la0 = latOf(p0, ia), la1 = latOf(p1, ia), lb0 = latOf(p0, ib), lb1 = latOf(p1, ib);
      const len = Math.hypot(la1 - la0, p1.y - p0.y);
      const ua = u0 * uS;
      u0 += len;
      if (len < 1e-6) continue;
      const u1 = u0 * uS;
      // 四角：A0 / A1 在第 ia 排，B0 / B1 在第 ib 排。法线 = 轮廓边 × 前进方向
      if (!flip) {
        put(ia, la0, p0.y, ua, va); put(ia, la1, p1.y, u1, va); put(ib, lb0, p0.y, ua, vb);
        put(ia, la1, p1.y, u1, va); put(ib, lb1, p1.y, u1, vb); put(ib, lb0, p0.y, ua, vb);
      } else {
        put(ia, la0, p0.y, ua, va); put(ib, lb0, p0.y, ua, vb); put(ia, la1, p1.y, u1, va);
        put(ia, la1, p1.y, u1, va); put(ib, lb0, p0.y, ua, vb); put(ib, lb1, p1.y, u1, vb);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, t * 3), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv.slice(0, t * 6), 2));
  if (col) geo.setAttribute('color', new THREE.BufferAttribute(col.slice(0, t * 3), 3));
  if (ex) geo.setAttribute(ex.name, new THREE.BufferAttribute(ex.data.slice(0, t * ex.size), ex.size));
  geo.computeVertexNormals();
  return geo;
}

/** 把若干属性一致的几何并成一个（传入的几何会被释放） */
export function mergeGeos(list) {
  const keep = list.filter((g) => g && g.attributes.position && g.attributes.position.count > 0);
  if (!keep.length) return null;
  const names = Object.keys(keep[0].attributes), geo = new THREE.BufferGeometry();
  for (const name of names) {
    const size = keep[0].attributes[name].itemSize, arr = new Float32Array(keep.reduce((n, g) => n + g.attributes[name].array.length, 0));
    let o = 0;
    for (const g of keep) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; }
    geo.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  for (const g of keep) g.dispose();
  return geo;
}

/**
 * 把整条赛道按“每一段的类型”切开：fn(i, side) 返回该采样处这一侧的类型名（null / '' 表示不建）。
 * 返回 [{ type, i0, i1 }]，绕回起点的那一段也是一对合法的 (i0, i1)。
 */
export function splitBySide(T, side, fn) {
  const N = T.N, types = new Array(N);
  for (let i = 0; i < N; i++) types[i] = fn(i, side);
  let start = 0;
  while (start < N && types[start] === types[(start + N - 1) % N]) start++;      // 找一个类型发生变化的起点
  if (start >= N) return types[0] ? [{ type: types[0], i0: 0, i1: N - 1 }] : [];
  const out = [];
  let cur = types[start], from = start;
  for (let k = 1; k <= N; k++) {
    const i = (start + k) % N, ty = k === N ? null : types[i];
    if (ty !== cur) {
      if (cur) out.push({ type: cur, i0: from, i1: (start + k - 1) % N });
      cur = ty; from = i;
    }
  }
  return out;
}

/** i 是否落在 [a, b] 里（a > b 表示绕回起点） */
export function between(i, a, b, N) { return a <= b ? i >= a && i <= b : i >= a || i <= b; }
