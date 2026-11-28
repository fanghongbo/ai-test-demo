// 有机形体的几何工具（纯计算）：一个小网格构建器，加上带子（叶片、海带、触手）、管子（珊瑚枝、海绵）、包络团块（脑珊瑚、贝壳）和三维噪声。
// 顶点格式：[x, y, z, nx, ny, nz, u, v, r, g, b, e0, e1, e2]——位置、法线（给 [0,0,0] 就用所在面的法线）、UV、颜色、三个自定义数（比如摆动的权重）。
import * as THREE from 'three';

const WHITE = () => [1, 1, 1];
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _r = new THREE.Vector3();

export function meshBuilder() {
  const P = [], N = [], UV = [], C = [], E = [];
  let hasExtra = false;
  const mb = {
    /** a b c 是三个顶点。ref：这一面应该朝的方向（绕反了会自动翻过来） */
    tri(a, b, c, ref) {
      _a.set(a[0], a[1], a[2]); _b.set(b[0], b[1], b[2]); _c.set(c[0], c[1], c[2]);
      _n.subVectors(_b, _a).cross(_c.sub(_a));
      const order = _n.dot(_r.set(ref[0], ref[1], ref[2])) < 0 ? [a, c, b] : [a, b, c], l = _n.length() || 1;
      for (const p of order) {
        const own = p[3] * p[3] + p[4] * p[4] + p[5] * p[5] > 1e-12;
        P.push(p[0], p[1], p[2]);
        N.push(own ? p[3] : _n.x / l, own ? p[4] : _n.y / l, own ? p[5] : _n.z / l);
        UV.push(p[6], p[7]); C.push(p[8], p[9], p[10]);
        if (p.length > 11) hasExtra = true;
        E.push(p[11] ?? 0, p[12] ?? 0, p[13] ?? 0);
      }
    },
    quad(a, b, c, d, ref) { mb.tri(a, b, c, ref); mb.tri(a, c, d, ref); },
    get tris() { return P.length / 9; },
    build() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
      g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
      if (hasExtra) g.setAttribute('aExtra', new THREE.Float32BufferAttribute(E, 3));
      return g;
    },
  };
  return mb;
}

/** 顶点的简写 */
export function V(x, y, z, nx, ny, nz, u, v, col = [1, 1, 1], ex) {
  return ex ? [x, y, z, nx, ny, nz, u, v, col[0], col[1], col[2], ex[0], ex[1], ex[2]] : [x, y, z, nx, ny, nz, u, v, col[0], col[1], col[2]];
}

/** 两个颜色之间取值 */
export const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * 一条带子（只铺一面，材质用双面）。c：中心线（Vector3[]），w：每一点的半宽，side：每一点的横向单位向量。
 * col(i, t) 返回这一点的颜色；extra(i, t) 返回三个自定义数；crease > 0 时中间折起一道棱（叶片的叶脉）。
 */
export function ribbon(mb, c, w, side, col, o = {}) {
  const n = c.length, cr = o.crease ?? 0, ex = o.extra, nrm = [];
  for (let i = 0; i < n; i++) {
    const t = i < n - 1 ? c[i + 1].clone().sub(c[i]) : c[i].clone().sub(c[i - 1]);
    nrm.push(new THREE.Vector3().crossVectors(side[i], t).normalize());
  }
  const cols = cr > 0 ? [-1, 0, 1] : [-1, 1];
  const pt = (i, k) => {
    const p = c[i].clone().addScaledVector(side[i], w[i] * k).addScaledVector(nrm[i], cr * w[i] * (1 - Math.abs(k)));
    const t = i / (n - 1), cc = col(i, t);
    return V(p.x, p.y, p.z, nrm[i].x, nrm[i].y, nrm[i].z, (k + 1) / 2, t, cc, ex ? ex(i, t) : undefined);
  };
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < cols.length - 1; k++) mb.quad(pt(i, cols[k]), pt(i, cols[k + 1]), pt(i + 1, cols[k + 1]), pt(i + 1, cols[k]), nrm[i]);
}

/**
 * 一根管子（珊瑚枝、海绵的管、海葵的柱）。pts：中心线，r：每一点的半径，col(i, t, k)：颜色（k 是圆周上的位置 0..1）。
 * cap：'tip' 收成尖，'flat' 平口并画出往里的内壁（海绵的管口），none 不封。ribs：[几道, 多深] 顺着的纵棱。
 * side：每一点的横向单位向量（不给就沿着线平行输运一个）；aspect > 0 时截面是椭圆：沿 side 是 r，垂直的是 r × aspect（带子）
 */
export function tube(mb, pts, r, o = {}) {
  const sides = o.sides ?? 8, n = pts.length, frames = [];
  let t0 = pts[1].clone().sub(pts[0]).normalize(), ref = Math.abs(t0.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), nx = new THREE.Vector3().crossVectors(t0, ref).normalize();
  for (let i = 0; i < n; i++) {
    const t = i < n - 1 ? pts[i + 1].clone().sub(pts[i]).normalize() : pts[i].clone().sub(pts[i - 1]).normalize();
    nx.sub(t.clone().multiplyScalar(nx.dot(t))).normalize();                                        // 平行输运：法线架沿着线转，不绕着线打转
    if (o.side) nx = o.side[i].clone().sub(t.clone().multiplyScalar(o.side[i].dot(t))).normalize();
    frames.push({ t, nx, ny: new THREE.Vector3().crossVectors(t, nx) });
    nx = nx.clone();
  }
  const col = o.col ?? ((i, tt) => [1, 1, 1]), ex = o.extra, aspect = o.aspect ?? 1;
  const ring = (i, k, rad, inset) => {
    const ca = Math.cos((k / sides) * Math.PI * 2), sa = Math.sin((k / sides) * Math.PI * 2), d = frames[i].nx.clone().multiplyScalar(ca).addScaledVector(frames[i].ny, sa * aspect), nn = frames[i].nx.clone().multiplyScalar(ca / rad).addScaledVector(frames[i].ny, sa / (rad * aspect)).normalize();   // 位置在椭圆上，法线是椭圆的法线
    if (o.ribs) rad *= 1 + o.ribs[1] * Math.sin((k / sides) * Math.PI * 2 * o.ribs[0]);          // 纵棱：圆周上一起一伏
    const p = pts[i].clone().addScaledVector(d, rad), t = i / (n - 1), cc = col(i, t, k / sides);
    const n2 = inset ? nn.negate() : nn;
    return V(p.x, p.y, p.z, n2.x, n2.y, n2.z, k / sides, t, cc, ex ? ex(i, t) : undefined);
  };
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < sides; k++) {
    const k1 = (k + 1) % sides, mid = frames[i].nx.clone().multiplyScalar(Math.cos(((k + 0.5) / sides) * Math.PI * 2)).addScaledVector(frames[i].ny, Math.sin(((k + 0.5) / sides) * Math.PI * 2));
    mb.quad(ring(i, k, r[i]), ring(i, k1, r[i]), ring(i + 1, k1, r[i + 1]), ring(i + 1, k, r[i + 1]), mid);
  }
  const last = n - 1, ft = frames[last].t;
  if (o.cap === 'tip') {
    const tip = pts[last].clone().addScaledVector(ft, (o.tipLen ?? r[last] * 2.5)), tc = col(last, 1.15, 0);
    for (let k = 0; k < sides; k++) {
      const k1 = (k + 1) % sides, a = ring(last, k, r[last]), b = ring(last, k1, r[last]);
      mb.tri(a, b, V(tip.x, tip.y, tip.z, ft.x, ft.y, ft.z, (k + 0.5) / sides, 1.2, tc, ex ? ex(last, 1.2) : undefined), ft);
    }
  } else if (o.cap === 'flat') {
    // 管口：一圈口沿（朝上）+ 往里的内壁（朝内）+ 底。海绵的管子从这里往里看是黑洞洞的
    const depth = o.lip ?? r[last] * 1.5, rimCol = col(last, 1, 0), innCol = o.innerCol ?? rimCol.map((v) => v * 0.35), ec = ex ? ex(last, 1) : undefined;
    const inner = pts[last].clone().addScaledVector(ft, -depth), rad = r[last];
    const dirAt = (k) => { const an = (k / sides) * Math.PI * 2; return frames[last].nx.clone().multiplyScalar(Math.cos(an)).addScaledVector(frames[last].ny, Math.sin(an)); };
    const mk = (p, n, k, v, c) => V(p.x, p.y, p.z, n.x, n.y, n.z, k / sides, v, c, ec);
    for (let k = 0; k < sides; k++) {
      const k1 = (k + 1) % sides, dk = dirAt(k), dk1 = dirAt(k1), o0 = pts[last].clone().addScaledVector(dk, rad), o1 = pts[last].clone().addScaledVector(dk1, rad);
      const i0 = pts[last].clone().addScaledVector(dk, rad * 0.78), i1 = pts[last].clone().addScaledVector(dk1, rad * 0.78), b0 = inner.clone().addScaledVector(dk, rad * 0.25), b1 = inner.clone().addScaledVector(dk1, rad * 0.25);
      mb.quad(mk(o0, ft, k, 1, rimCol), mk(o1, ft, k1, 1, rimCol), mk(i1, ft, k1, 1.08, rimCol), mk(i0, ft, k, 1.08, rimCol), ft);
      mb.quad(mk(i0, dk.clone().negate(), k, 1.08, rimCol), mk(i1, dk1.clone().negate(), k1, 1.08, rimCol), mk(b1, dk1.clone().negate(), k1, 1.5, innCol), mk(b0, dk.clone().negate(), k, 1.5, innCol), dk.clone().negate());
      mb.tri(mk(b0, dk.clone().negate(), k, 1.5, innCol), mk(b1, dk1.clone().negate(), k1, 1.5, innCol), mk(inner, ft, k + 0.5, 1.5, innCol), ft);
    }
  }
}

/**
 * 一个团块（脑珊瑚、石芝、海鞘）：经纬球，半径由 dir → r 给出（0.5..1.5），可以压扁。y < flat 以下的部分削平（坐在地上）。
 * col(dir, u, v, r) 返回颜色。extra(dir) 返回三个自定义数。
 */
export function blob(mb, o = {}) {
  const seg = o.seg ?? 28, rings = o.rings ?? 16, R = o.radius ?? ((d) => 1), sy = o.sy ?? 1, flat = o.flat ?? -1, col = o.col ?? (() => [1, 1, 1]), ex = o.extra;
  const d = new THREE.Vector3(), pos = [], nrm = [], cl = [];
  for (let j = 0; j <= rings; j++) for (let i = 0; i <= seg; i++) {
    const ph = (j / rings) * Math.PI, th = (i / seg) * Math.PI * 2, sp = Math.sin(ph);
    d.set(sp * Math.cos(th), Math.cos(ph), sp * Math.sin(th));
    const r = R(d), p = d.clone().multiplyScalar(r);
    if (p.y * sy < flat) p.y = flat / sy;
    pos.push(p); cl.push(col(d, i / seg, j / rings, r));
  }
  const at = (j, i) => pos[j * (seg + 1) + i];
  for (let j = 0; j <= rings; j++) for (let i = 0; i <= seg; i++) {                                   // ∂/∂θ × ∂/∂φ 朝外
    const du = at(j, Math.min(i + 1, seg)).clone().sub(at(j, Math.max(i - 1, 0))), dv = at(Math.min(j + 1, rings), i).clone().sub(at(Math.max(j - 1, 0), i));
    nrm.push(du.cross(dv).normalize());
  }
  const vtx = (j, i) => {
    const p = at(j, i), n = nrm[j * (seg + 1) + i].clone(), k = j * (seg + 1) + i;
    n.y /= sy; n.normalize();
    return V(p.x, p.y * sy, p.z, n.x, n.y, n.z, i / seg, j / rings, cl[k], ex ? ex(p.clone().normalize()) : undefined);
  };
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const c = at(j, i).clone().add(at(j + 1, i)).multiplyScalar(0.5), a = vtx(j, i), b = vtx(j, i + 1), cc = vtx(j + 1, i + 1), dd = vtx(j + 1, i);
    if (j === 0) mb.tri(a, cc, dd, c); else if (j === rings - 1) mb.tri(a, b, cc, c); else mb.quad(a, b, cc, dd, c);
  }
}

/**
 * 一张参数曲面 u（0..1）× v（0..1，可以首尾相接）。法线用数值微分求，绕向按 ref（“这一面朝哪边”）自动定。
 * col(u, v, p) 颜色；uv(u, v, p) 贴图坐标（默认就是 u、v）；extra(u, v, p) 三个自定义数
 */
export function paramSurface(mb, fn, NR, NA, o) {
  const P = (u, v) => fn(u, v % 1), nrm = (u, v) => {
    const e = 1e-3, a = P(Math.min(1, u + e), v), b = P(Math.max(0, u - e), v), c = P(u, Math.min(1, v + e)), d = P(u, Math.max(0, v - e));   // 夹在定义域里：边界上做单侧差分（龙骨那种 v = 0 处截面宽度为 0 的曲面，越界一步就是 NaN）
    const n = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]).cross(new THREE.Vector3(c[0] - d[0], c[1] - d[1], c[2] - d[2])), r = o.ref(u, v % 1);
    if (n.lengthSq() < 1e-14) return new THREE.Vector3(r[0], r[1], r[2]).normalize();
    n.normalize(); return n.dot(new THREE.Vector3(r[0], r[1], r[2])) < 0 ? n.negate() : n;
  };
  const uvf = o.uv ?? ((u, v) => [u, v]);
  const vt = (u, v) => { const p = P(u, v), n = nrm(u, v), t = uvf(u, v % 1, p); return V(p[0], p[1], p[2], n.x, n.y, n.z, t[0], t[1], (o.col ?? WHITE)(u, v % 1, p), o.extra ? o.extra(u, v % 1, p) : undefined); };
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) mb.quad(vt(i / NR, j / NA), vt((i + 1) / NR, j / NA), vt((i + 1) / NR, (j + 1) / NA), vt(i / NR, (j + 1) / NA), o.ref((i + 0.5) / NR, (j + 0.5) / NA));
}

/** 把几何里满足 pred(x, y, z)（三角形的中点）的三角形挖掉：船身上的破洞 */
export function cutTriangles(geo, pred) {
  const names = Object.keys(geo.attributes), sizes = names.map((n) => geo.attributes[n].itemSize), per = sizes.reduce((a, b) => a + b, 0), n = geo.attributes.position.count;
  const vert = (i) => { const v = new Array(per); let o = 0; for (let k = 0; k < names.length; k++) { const at = geo.attributes[names[k]].array, s = sizes[k]; for (let q = 0; q < s; q++) v[o++] = at[i * s + q]; } return v; };
  const kept = [];
  for (let i = 0; i < n; i += 3) {
    const a = vert(i), b = vert(i + 1), c = vert(i + 2);
    if (pred((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3)) continue;
    kept.push(a, b, c);
  }
  const out = new THREE.BufferGeometry();
  let o = 0;
  for (let k = 0; k < names.length; k++) { const s = sizes[k], arr = new Float32Array(kept.length * s); kept.forEach((v, i) => { for (let q = 0; q < s; q++) arr[i * s + q] = v[o + q]; }); out.setAttribute(names[k], new THREE.BufferAttribute(arr, s)); o += s; }
  return out;
}

/** 把几份几何拼成一份（属性相同的非索引几何）：鱼的身体和鳍、海龟的壳和鳍 */
export function mergeParts(list, names = ['position', 'normal', 'uv', 'color', 'aExtra']) {
  const out = new THREE.BufferGeometry();
  for (const n of names.filter((k) => list.every((g) => g.attributes[k]))) {
    const size = list[0].attributes[n].itemSize, arr = new Float32Array(list.reduce((s, g) => s + g.attributes[n].count, 0) * size);
    let o = 0;
    for (const g of list) { arr.set(g.attributes[n].array, o); o += g.attributes[n].array.length; }
    out.setAttribute(n, new THREE.BufferAttribute(arr, size));
  }
  return out;
}

/** 可平铺的三维值噪声（晶格哈希 + 三线性插值），范围约 [-1, 1] */
function hash3(i, j, k, seed) {
  let x = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1103515245) ^ Math.imul(seed, 2246822519);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 2147483647.5 - 1;
}
const fade = (t) => t * t * (3 - 2 * t), lp = (a, b, t) => a + (b - a) * t;
export function noise3(x, y, z, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = fade(x - ix), fy = fade(y - iy), fz = fade(z - iz), s = seed | 0;
  return lp(lp(lp(hash3(ix, iy, iz, s), hash3(ix + 1, iy, iz, s), fx), lp(hash3(ix, iy + 1, iz, s), hash3(ix + 1, iy + 1, iz, s), fx), fy),
    lp(lp(hash3(ix, iy, iz + 1, s), hash3(ix + 1, iy, iz + 1, s), fx), lp(hash3(ix, iy + 1, iz + 1, s), hash3(ix + 1, iy + 1, iz + 1, s), fx), fy), fz);
}
export function fbm3(x, y, z, oct = 3, seed = 0) {
  let s = 0, amp = 0.5, f = 1, norm = 0;
  for (let o = 0; o < oct; o++) { s += noise3(x * f + o * 3.1, y * f, z * f, seed + o * 31) * amp; norm += amp; amp *= 0.5; f *= 2.07; }
  return s / norm;
}
