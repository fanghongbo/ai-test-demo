// 基础几何工厂（静态、可合批）。全部返回带法线的 BufferGeometry。
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TAU } from '../core/mathx.js';

const v3 = (p) => (p.isVector3 ? p : new THREE.Vector3(p[0], p[1], p[2]));

/** 圆角盒：完全锐利的棱边在写实光照下没有高光可落脚，倒一个小角才像真的东西 */
export const box = (w, h, d, r = 0.02, seg = 2) => {
  r = Math.max(0.001, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  return new RoundedBoxGeometry(w, h, d, seg, r);
};
export const sphere = (r, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h);
export const ellipsoid = (rx, ry, rz, w = 24, h = 16) => { const g = new THREE.SphereGeometry(1, w, h); g.scale(rx, ry, rz); return g; };
export const cyl = (rt, rb, h, seg = 16, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
export const torus = (r, t, rs = 10, ts = 36, arc = TAU) => new THREE.TorusGeometry(r, t, rs, ts, arc);

/** 沿 Catmull-Rom 的等径管（车架管、辐条、栏杆、灯柱） */
export const tube = (pts, r, o = {}) => new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3(pts.map(v3), !!o.closed, 'centripetal'), o.tubular ?? 24, r, o.radial ?? 10, !!o.closed);

/** 两点之间的直管（辐条、支杆） */
export function rod(a, b, r, radial = 8) {
  const A = v3(a), Bv = v3(b), d = new THREE.Vector3().subVectors(Bv, A), len = d.length();
  const g = new THREE.CylinderGeometry(r, r, len, radial, 1, false);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3().addVectors(A, Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  return g;
}

/** 平面轮廓拉伸成带倒角的板（羽毛、尾鳍、挡泥板、链轮） */
export function extrude(points, depth, o = {}) {
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p[0], p[1])));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: (o.bevel ?? 0.01) > 0, bevelThickness: o.bevel ?? 0.01, bevelSize: (o.bevel ?? 0.01) * (o.bevelW ?? 1),
    bevelSegments: o.bevelSeg ?? 2, curveSegments: o.curveSeg ?? 10,
  });
  g.translate(0, 0, -(depth / 2));
  return g;
}

/** 叶片/羽毛轮廓（2D，沿 +Y 生长，根部在原点） */
export function leafPoints(len, width, o = {}) {
  const pts = [], n = o.n ?? 14, tip = o.tip ?? 0.55, belly = o.belly ?? 0.45;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = width * Math.pow(Math.sin(Math.PI * Math.pow(t, belly * 1.6 + 0.2)), tip) * (1 - 0.15 * t);
    pts.push([w, t * len]);
  }
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const w = width * Math.pow(Math.sin(Math.PI * Math.pow(t, belly * 1.6 + 0.2)), tip) * (1 - 0.15 * t);
    pts.push([-w, t * len]);
  }
  return pts;
}

/** 正多边形/圆角矩形等轮廓点 */
export function roundedRectPoints(w, h, r, seg = 6) {
  const pts = [], hw = w / 2, hh = h / 2;
  r = Math.min(r, hw, hh);
  const corner = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + (i / seg) * (Math.PI / 2); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  corner(hw - r, hh - r, 0); corner(-hw + r, hh - r, Math.PI / 2); corner(-hw + r, -hh + r, Math.PI); corner(hw - r, -hh + r, Math.PI * 1.5);
  return pts;
}
