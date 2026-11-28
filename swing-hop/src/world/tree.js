// 岛上的大树：一根有点弯的树干、几条根、一大团鼓鼓的树冠（好几团叠在一起）、一根伸到岛沿外面挂秋千的树枝。
// 整棵树都拼进岛的同一个网格；树冠带着“随风摆”的权重，叶尖会轻轻晃。分三步拼：树干、树冠、树枝。
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { place, col, smooth } from '../gfx/geobuilder.js';
import { makeNoise } from '../core/noise.js';
import { rng } from '../core/rng.js';
import { PAL } from '../core/palette.js';

function base(node) {
  const { h, lean, seed } = node.tree;
  return { h, lean, seed, n: makeNoise(seed), bx: node.x, by: node.y, bz: node.islet.cz + 0.25, tones: node.islet.blossom ? PAL.blossom : PAL.leaf };
}

// 树冠的一团：球面上加鼓包，底下压扁一点
function puff(r, seed, n) {
  const W = 26, H = 18, pos = [], idx = [];
  for (let j = 0; j <= H; j++) {
    const ph = (j / H) * Math.PI, sp = Math.sin(ph), cp = Math.cos(ph);
    for (let i = 0; i < W; i++) {                                 // 接缝处共用顶点，法线才是圆滑的
      const a = (i / W) * Math.PI * 2, dx = -Math.cos(a) * sp, dy = cp, dz = Math.sin(a) * sp;
      const bump = 1 + 0.08 * n.fbm3(dx * 1.7 + seed, dy * 1.7 + seed * 0.7, dz * 1.7, 2) + 0.018 * n.noise3(dx * 4.2, dy * 4.2 + seed, dz * 4.2);
      pos.push(dx * r * bump, (dy < 0 ? dy * 0.86 : dy) * r * bump, dz * r * bump);
    }
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const a = j * W + i, b = j * W + ((i + 1) % W), c = a + W, d = b + W;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// 把一团叶子放进岛里：位置是世界的，颜色上面浅、下面深，叶尖摆得多
function leafBall(b, x, y, z, r, seed, n, tones, strength = 1) {
  const geo = puff(r, seed, n).translate(x, y, z);
  const [baseC, dark, light] = tones.map(col);
  b.add(geo, place(), (c, v) => {
    const k = 0.5 + 0.55 * ((v.y - y) / r) + 0.1 * ((v.x - x) / r) + 0.1 * Math.sin(v.x * 4.3 + v.y * 3.1 + v.z * 2.7 + seed);
    if (k > 0.5) c.copy(baseC).lerp(light, smooth(0.5, 1.1, k));
    else c.copy(baseC).lerp(dark, smooth(0.5, -0.2, k));
  }, (v) => strength * smooth(y - 0.7 * r, y + 0.9 * r, v.y) * 0.045);
}

// 第一步：树干（旋出来一根上细下粗的柱子，再弯一下、加上树皮的棱）和根
export function addTrunk(b, node) {
  const { h, lean, seed, n, bx, by, bz } = base(node), r = rng(seed ^ 0x77);
  const cA = col(PAL.trunk), cB = col(PAL.trunkDark), c = new THREE.Color();
  const pts = [[0.5, -0.3], [0.43, 0.05], [0.37, 0.45], [0.34, h * 0.45], [0.31, h * 0.75], [0.27, h], [0.19, h + 0.4], [0.02, h + 0.55]].map(([a, k]) => new THREE.Vector2(a, k));
  const trunk = mergeVertices(new THREE.LatheGeometry(pts, 16));
  const p = trunk.attributes.position, cols = new Float32Array(p.count * 3);
  for (let k = 0; k < p.count; k++) {
    const x = p.getX(k), y = p.getY(k), z = p.getZ(k), a = Math.atan2(z, x);
    const rr = Math.hypot(x, z) * (1 + 0.05 * n.noise3(Math.cos(a) * 2.2, Math.sin(a) * 2.2, y * 1.1) + 0.018 * Math.sin(a * 9 + y * 2.2));
    p.setXYZ(k, Math.cos(a) * rr + lean * y + 0.06 * Math.sin(y * 1.6 + 1), y, Math.sin(a) * rr + 0.05 * Math.sin(y * 1.2 + 3));
    c.copy(cA).lerp(cB, 0.5 - 0.5 * n.noise3(Math.cos(a) * 3, Math.sin(a) * 3, y * 2.5));
    c.multiplyScalar((1 - 0.22 * smooth(h * 0.55, h + 0.5, y)) * (1 - 0.12 * (1 - smooth(-0.3, 0.5, y))));   // 树冠底下和根边发暗
    cols.set([c.r, c.g, c.b], k * 3);
  }
  trunk.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  trunk.computeVertexNormals();
  b.add(trunk, place(bx, by, bz), null, 0);

  for (let k = 0; k < 5; k++) {                                   // 根：几条往土里扎的锥
    const a = (k / 5) * Math.PI * 2 + r(), len = r.range(0.7, 1.05);
    const m = place(bx + Math.cos(a) * 0.2, by - 0.02, bz + Math.sin(a) * 0.2)
      .multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2 - a)).multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2 + 0.3));
    b.add(new THREE.CylinderGeometry(0.03, 0.15, len, 7).translate(0, len / 2, 0), m, cB.clone().lerp(col(PAL.dirtDark), 0.3), 0);
  }
}

// 第二步：树冠。中间一团大的，周围一圈小的
export function addCanopy(b, node) {
  const { h, lean, seed, n, bx, by, bz, tones } = base(node), r = rng(seed ^ 0x78);
  const s = r.range(0.92, 1.08), cx = bx + lean * h + 0.05, cy = by + h + 0.95, cz = bz - 0.05;
  const shape = [[0, 0.42, 0, 1.02], [0.82, -0.08, 0.28, 0.8], [-0.8, 0.0, 0.36, 0.8], [0.12, -0.25, -0.82, 0.84], [-0.22, -0.28, 0.8, 0.7], [0.92, -0.48, -0.5, 0.6], [-0.9, -0.5, -0.5, 0.58]];
  shape.forEach(([ox, oy, oz, or], k) => {
    const j = () => r.range(-0.12, 0.12);
    leafBall(b, cx + (ox + j()) * s, cy + (oy + j() * 0.5) * s, cz + (oz + j()) * s, or * s, seed + k * 3.3, n, tones, 1);
  });
}

// 第三步：树枝。从树干伸出去，探到岛沿外面，微微下垂再往上一翘；枝上带着两小团叶子
export function addBranch(b, node) {
  const { h, lean, seed, n, bx, by, bz, tones } = base(node);
  const cA = col(PAL.trunk), cB = col(PAL.trunkDark);
  const w = node.swing, start = new THREE.Vector3(bx + lean * h, by + h - 0.04, bz), end = new THREE.Vector3(w.tipX + 0.08, w.tipY + 0.03, w.tipZ);
  const dir = end.clone().sub(start).normalize();
  const curve = new THREE.CatmullRomCurve3([start, start.clone().addScaledVector(dir, 0.6).add(new THREE.Vector3(0, 0.1, 0)), start.clone().lerp(end, 0.6).add(new THREE.Vector3(0, 0.05, 0)), end]);
  const branch = new THREE.TubeGeometry(curve, 16, 0.105, 9, false);
  b.add(branch, place(), (c, v, nrm) => c.copy(cA).lerp(cB, 0.45 + 0.4 * n.noise3(v.x * 2, v.y * 2, v.z * 2) - 0.25 * nrm.y), 0);
  b.add(new THREE.SphereGeometry(0.2, 12, 9).scale(1, 0.9, 1), place(start.x, start.y, start.z), cB, 0);      // 树杈上的疙瘩
  const mid = curve.getPoint(0.6);                                                             // 一团在中途，一团圆在枝头上面（绳子从叶子底下垂下来）
  leafBall(b, mid.x, mid.y + 0.3, mid.z, 0.42, seed + 40, n, tones, 1.4);
  leafBall(b, w.tipX + 0.3, w.tipY + 0.4, w.tipZ - 0.1, 0.5, seed + 44, n, tones, 1.4);
}
