// 放样（Loft）：沿中心线扫掠椭圆截面，可逐帧重建。鹈鹕的颈、喙、喉囊、身体、四肢都由它生成。
// 设计要点：
//  - 截面 = (a: 沿 N 的半宽, bt: 沿 +B 的半高, bb: 沿 -B 的半高) —— 上下不对称，才能做出喉囊、肚皮这类形状
//  - 标架用平行传输（rotation-minimizing frames），不会像 Frenet 标架那样在拐点处翻转
//  - 法线由网格中心差分解析求得，光滑；极点法线取切线
import * as THREE from 'three';
import { TAU, clamp01, smoothstep } from '../core/mathx.js';

const AXIS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
const SEC = { u: 0, v: 0 };

export class Loft {
  /**
   * @param {{rings?:number, radial?:number, caps?:[boolean,boolean], tDist?:'cos'|'uniform'}} [o]
   */
  constructor(o = {}) {
    this.rings = o.rings ?? 28;
    this.radial = o.radial ?? 22;
    const caps = o.caps ?? [true, true];
    this.capStart = !!caps[0]; this.capEnd = !!caps[1];
    this.tDist = o.tDist ?? 'cos';
    this.prof = () => ({ a: 1, bt: 1, bb: 1, k: 0.25 });
    this.section = null;
    const R = this.rings, M = this.radial;
    const ringVerts = (R + 1) * M;
    this.poleStart = ringVerts;
    this.poleEnd = ringVerts + (this.capStart ? 1 : 0);
    const n = ringVerts + (this.capStart ? 1 : 0) + (this.capEnd ? 1 : 0);
    this.count = n;
    this.pos = new Float32Array(n * 3);
    this.nrm = new Float32Array(n * 3);
    this.uv = new Float32Array(n * 2);
    const idx = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < M; j++) {
      const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
      idx.push(a, b, c, b, d, c);   // 正面朝外：cross(b-a, c-a) 与 cross(d-b, c-b) 都指向 +N
    }
    if (this.capStart) for (let j = 0; j < M; j++) idx.push(this.poleStart, (j + 1) % M, j);
    if (this.capEnd) for (let j = 0; j < M; j++) idx.push(this.poleEnd, R * M + j, R * M + (j + 1) % M);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('normal', new THREE.BufferAttribute(this.nrm, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2));
    geo.setIndex(n > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
    geo.setAttribute('aOutlineN', geo.attributes.normal);   // 光滑体：描边直接用着色法线
    geo.setAttribute('aOutlineW', new THREE.BufferAttribute(new Float32Array(n).fill(1), 1));
    for (let i = 0; i <= R; i++) for (let j = 0; j < M; j++) { this.uv[(i * M + j) * 2] = j / M; }
    this.geometry = geo;
    const mk = () => Array.from({ length: R + 1 }, () => new THREE.Vector3());
    this.C = mk(); this.T = mk(); this.N = mk(); this.B = mk();
    this._axis = new THREE.Vector3(); this._tmp = new THREE.Vector3();
    this.ts = new Float32Array(R + 1);
    for (let i = 0; i <= R; i++) { const t = i / R; this.ts[i] = this.tDist === 'cos' ? 0.5 * (1 - Math.cos(Math.PI * t)) : t; }
  }

  /** 截面轮廓函数：prof(t) → number（对称半径）或 {a, bt, bb, k?} */
  setProfile(fn) { this.prof = typeof fn === 'function' ? fn : () => fn; return this; }
  /** 自定义截面：section(t, θ, out) 写入 out.u（沿 N）/ out.v（沿 B） */
  setSection(fn) { this.section = fn; return this; }

  /**
   * 重建几何体。
   * @param {(t:number, out:THREE.Vector3)=>void} centerFn 中心线（t ∈ [0,1]）
   * @param {THREE.Vector3} [ref] 初始 N 方向参考（默认取与切线最不平行的坐标轴）
   */
  update(centerFn, ref) {
    const R = this.rings, M = this.radial, C = this.C, T = this.T, N = this.N, B = this.B;
    for (let i = 0; i <= R; i++) centerFn(this.ts[i], C[i]);
    for (let i = 0; i <= R; i++) {
      T[i].subVectors(C[Math.min(i + 1, R)], C[Math.max(i - 1, 0)]);
      if (T[i].lengthSq() < 1e-16) T[i].copy(i > 0 ? T[i - 1] : AXIS[2]);
      T[i].normalize();
    }
    // 平行传输标架
    let r0 = ref;
    if (!r0) { let best = AXIS[0], bd = 1; for (const a of AXIS) { const d = Math.abs(a.dot(T[0])); if (d < bd) { bd = d; best = a; } } r0 = best; }
    N[0].copy(r0).addScaledVector(T[0], -r0.dot(T[0]));
    if (N[0].lengthSq() < 1e-10) N[0].set(T[0].y, T[0].z, T[0].x).addScaledVector(T[0], -T[0].y * T[0].x - T[0].z * T[0].y - T[0].x * T[0].z);
    N[0].normalize();
    const axis = this._axis, tmp = this._tmp;
    for (let i = 1; i <= R; i++) {
      axis.crossVectors(T[i - 1], T[i]);
      const s = axis.length(), c = clamp01(T[i - 1].dot(T[i]));
      if (s > 1e-9) {
        axis.multiplyScalar(1 / s);
        const ang = Math.atan2(s, c), ca = Math.cos(ang), sa = Math.sin(ang);
        const n = N[i - 1];
        tmp.crossVectors(axis, n);
        N[i].copy(n).multiplyScalar(ca).addScaledVector(tmp, sa).addScaledVector(axis, axis.dot(n) * (1 - ca)).normalize();
      } else N[i].copy(N[i - 1]);
    }
    for (let i = 0; i <= R; i++) B[i].crossVectors(T[i], N[i]);

    // 顶点
    const pos = this.pos, uv = this.uv;
    for (let i = 0; i <= R; i++) {
      const t = this.ts[i], c = C[i], n = N[i], b = B[i];
      const pr = this.prof(t);
      const a = pr.a ?? pr, bt = pr.bt ?? pr, bb = pr.bb ?? pr, k = pr.k ?? 0.25;
      const base = i * M;
      for (let j = 0; j < M; j++) {
        const th = (j / M) * TAU;
        let u, v;
        if (this.section) { this.section(t, th, SEC); u = SEC.u; v = SEC.v; }
        else {
          const sn = Math.sin(th), cs = Math.cos(th);
          u = a * cs;
          v = sn * (bb + (bt - bb) * smoothstep(-k, k, sn));
        }
        const q = (base + j) * 3;
        pos[q] = c.x + n.x * u + b.x * v;
        pos[q + 1] = c.y + n.y * u + b.y * v;
        pos[q + 2] = c.z + n.z * u + b.z * v;
        uv[(base + j) * 2 + 1] = t;
      }
    }
    if (this.capStart) { const q = this.poleStart * 3; pos[q] = C[0].x; pos[q + 1] = C[0].y; pos[q + 2] = C[0].z; }
    if (this.capEnd) { const q = this.poleEnd * 3; pos[q] = C[R].x; pos[q + 1] = C[R].y; pos[q + 2] = C[R].z; }

    // 法线：中心差分 n = dP/dθ × dP/dt（指向外侧）
    const nrm = this.nrm, P = pos;
    const get = (i, j, out) => {
      let q;
      if (i < 0) q = this.poleStart * 3;
      else if (i > R) q = this.poleEnd * 3;
      else q = (i * M + ((j % M) + M) % M) * 3;
      out[0] = P[q]; out[1] = P[q + 1]; out[2] = P[q + 2];
    };
    const A = [0, 0, 0], Bv = [0, 0, 0], D1 = [0, 0, 0], D2 = [0, 0, 0];
    const sub3 = (o, a, b) => { o[0] = a[0] - b[0]; o[1] = a[1] - b[1]; o[2] = a[2] - b[2]; };
    for (let i = 0; i <= R; i++) for (let j = 0; j < M; j++) {
      get(i, j + 1, A); get(i, j - 1, Bv); sub3(D1, A, Bv);                       // dP/dθ
      if (i === 0 && !this.capStart) { get(1, j, A); get(0, j, Bv); sub3(D2, A, Bv); }
      else if (i === R && !this.capEnd) { get(R, j, A); get(R - 1, j, Bv); sub3(D2, A, Bv); }
      else { get(i + 1, j, A); get(i - 1, j, Bv); sub3(D2, A, Bv); }              // dP/dt
      const x = D1[1] * D2[2] - D1[2] * D2[1], y = D1[2] * D2[0] - D1[0] * D2[2], z = D1[0] * D2[1] - D1[1] * D2[0];
      const l = Math.hypot(x, y, z), q = (i * M + j) * 3;
      if (l > 1e-12) { nrm[q] = x / l; nrm[q + 1] = y / l; nrm[q + 2] = z / l; }
      else {   // 退化：回退到径向
        const th = (j / M) * TAU, cs = Math.cos(th), sn = Math.sin(th);
        nrm[q] = N[i].x * cs + B[i].x * sn; nrm[q + 1] = N[i].y * cs + B[i].y * sn; nrm[q + 2] = N[i].z * cs + B[i].z * sn;
      }
    }
    if (this.capStart) { const q = this.poleStart * 3; nrm[q] = -T[0].x; nrm[q + 1] = -T[0].y; nrm[q + 2] = -T[0].z; }
    if (this.capEnd) { const q = this.poleEnd * 3; nrm[q] = T[R].x; nrm[q + 1] = T[R].y; nrm[q + 2] = T[R].z; }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
    this.geometry.computeBoundingSphere();
    return this;
  }
}

/** 一次性生成静态放样几何体（用于合批） */
export function loftGeometry(centerFn, prof, o = {}) {
  const l = new Loft(o);
  if (prof) l.setProfile(prof);
  if (o.section) l.setSection(o.section);
  l.update(centerFn, o.ref);
  return l.geometry;
}
