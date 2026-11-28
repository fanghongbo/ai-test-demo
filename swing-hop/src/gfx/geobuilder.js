// 拼几何的小工具：把一堆小零件（位置已经摆好的）合成一个大网格，带顶点色和“随风摆”的权重。
// 一座岛连同草、花、树冠合成一个网格，画一次就行。
// 带索引的零件先按“每个顶点算一次颜色和位置”，再按三角形展开——树冠那种一个顶点被好几个三角形共用的零件能省好几倍。
import * as THREE from 'three';

const IDENT = new THREE.Matrix4();

export class GeoBuilder {
  constructor() {
    this.pos = []; this.nor = []; this.col = []; this.sway = [];
    this.tmp = null;
  }

  _tmp(n) {
    if (!this.tmp || this.tmp.p.length < n * 3) this.tmp = { p: new Float32Array(n * 3), n: new Float32Array(n * 3), c: new Float32Array(n * 3), s: new Float32Array(n) };
    return this.tmp;
  }

  // geo：零件；matrix：摆到哪儿；
  // color：颜色，或者 (颜色, 局部坐标, 局部法线) => 颜色 的函数，或者 null（沿用零件自己的顶点色）；
  // sway：常数，或者 (世界坐标) => 0 … 1 的函数，或者 null（沿用零件自己的权重）
  add(geo, matrix, color, sway = 0) {
    const p = geo.attributes.position, n = geo.attributes.normal, count = p.count;
    const gc = color === null ? geo.attributes.color : null;
    const gs = sway === null ? geo.attributes.aSway : null;
    const hasFn = typeof color === 'function', hasSway = typeof sway === 'function';
    const plain = matrix.equals(IDENT);
    const T = this._tmp(count), P = T.p, N = T.n, C = T.c, S = T.s;
    const nm = plain ? null : new THREE.Matrix3().getNormalMatrix(matrix);
    const v = new THREE.Vector3(), w = new THREE.Vector3(), c = new THREE.Color();
    for (let k = 0; k < count; k++) {
      const x = p.getX(k), y = p.getY(k), z = p.getZ(k), nx = n.getX(k), ny = n.getY(k), nz = n.getZ(k);
      if (gc) { c.fromBufferAttribute(gc, k); }
      else if (hasFn) color(c, v.set(x, y, z), w.set(nx, ny, nz));
      else c.copy(color);
      if (!plain) {
        v.set(x, y, z).applyMatrix4(matrix);
        w.set(nx, ny, nz).applyMatrix3(nm).normalize();
      } else { v.set(x, y, z); w.set(nx, ny, nz); }
      P[k * 3] = v.x; P[k * 3 + 1] = v.y; P[k * 3 + 2] = v.z;
      N[k * 3] = w.x; N[k * 3 + 1] = w.y; N[k * 3 + 2] = w.z;
      C[k * 3] = c.r; C[k * 3 + 1] = c.g; C[k * 3 + 2] = c.b;
      S[k] = gs ? gs.getX(k) : hasSway ? sway(v) : sway;
    }
    const emit = (k) => {
      this.pos.push(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]);
      this.nor.push(N[k * 3], N[k * 3 + 1], N[k * 3 + 2]);
      this.col.push(C[k * 3], C[k * 3 + 1], C[k * 3 + 2]);
      this.sway.push(S[k]);
    };
    if (geo.index) { const idx = geo.index.array; for (let k = 0; k < idx.length; k++) emit(idx[k]); }
    else for (let k = 0; k < count; k++) emit(k);
    return this;
  }

  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setAttribute('aSway', new THREE.Float32BufferAttribute(this.sway, 1));
    g.computeBoundingSphere();
    return g;
  }
}

// 常用的摆法：平移、绕 y 转转、缩放（另外可以绕 x、z 倾斜）
export function place(x = 0, y = 0, z = 0, ry = 0, s = 1, rx = 0, rz = 0) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, s, s));
}

export const col = (hex) => new THREE.Color(hex);
export const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
