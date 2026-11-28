// 岛面上的小东西：草丛、花、蘑菇、小石头。每样只建一份几何（带顶点色），摆的时候复制进去。
import * as THREE from 'three';
import { GeoBuilder, place, col } from '../gfx/geobuilder.js';
import { PAL } from '../core/palette.js';

const cache = new Map();

function finish(builder, key) {
  const g = builder.build();
  cache.set(key, g);
  return g;
}

// 一根草叶：三段，底宽顶尖，往外弯。颜色从根的深绿到尖的浅绿
function blade(b, yaw, h, w, lean, c0, c1) {
  const rows = 3, dx = Math.cos(yaw), dz = Math.sin(yaw), px = -dz, pz = dx, pts = [];
  for (let k = 0; k <= rows; k++) {
    const t = k / rows, bend = lean * t * t * h, y = h * t * (1 - 0.3 * lean * t), hw = w * (1 - t * 0.88) * 0.5;
    pts.push([dx * bend - px * hw, y, dz * bend - pz * hw, dx * bend + px * hw, y, dz * bend + pz * hw, t]);
  }
  const pos = [], nor = [], cl = [], sw = [], a = new THREE.Vector3(), v = new THREE.Vector3(), u = new THREE.Vector3();
  const push = (p, t, n) => { pos.push(p[0], p[1], p[2]); nor.push(n.x, n.y, n.z); const c = c0.clone().lerp(c1, t); cl.push(c.r, c.g, c.b); sw.push(t * 0.9); };
  for (let k = 0; k < rows; k++) {
    const p0 = pts[k], p1 = pts[k + 1];
    a.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]); u.set(p1[3] - p1[0], p1[4] - p1[1], p1[5] - p1[2]);
    const n = new THREE.Vector3().crossVectors(a, u).normalize();
    const q = [[p0[0], p0[1], p0[2], p0[6]], [p0[3], p0[4], p0[5], p0[6]], [p1[0], p1[1], p1[2], p1[6]], [p1[3], p1[4], p1[5], p1[6]]];
    push(q[0], q[0][3], n); push(q[2], q[2][3], n); push(q[1], q[1][3], n);
    push(q[2], q[2][3], n); push(q[3], q[3][3], n); push(q[1], q[1][3], n);
    void v;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  b.pos.push(...pos); b.nor.push(...nor); b.col.push(...cl); b.sway.push(...sw);
}

// 草丛：五六根叶子朝四面散开
export function tuftGeo() {
  if (cache.has('tuft')) return cache.get('tuft');
  const b = new GeoBuilder(), c0 = col(PAL.grassDark), c1 = col(PAL.grass[1]);
  const spread = [[0.3, 0.26, 0.055, 0.5], [1.6, 0.22, 0.05, 0.7], [2.9, 0.28, 0.06, 0.45], [4.1, 0.2, 0.045, 0.8], [5.3, 0.24, 0.05, 0.6]];
  for (const [yaw, h, w, lean] of spread) blade(b, yaw, h, w, lean, c0, c1);
  return finish(b, 'tuft');
}

// 花：一根茎，顶上五片花瓣和一个黄心
export function flowerGeo(accent) {
  const key = 'flower-' + accent;
  if (cache.has(key)) return cache.get(key);
  const b = new GeoBuilder(), head = 0.24 + (accent.length % 3) * 0.02;
  const stem = new THREE.CylinderGeometry(0.011, 0.016, head, 5).translate(0, head / 2, 0);
  b.add(stem, place(), col(PAL.grassDark), (v) => (v.y / head) * 0.5);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + 0.4;
    const petal = new THREE.SphereGeometry(0.048, 8, 6).scale(1, 0.32, 0.72);
    b.add(petal, place(Math.cos(a) * 0.052, head, Math.sin(a) * 0.052, -a), col(accent), 0.75);
  }
  b.add(new THREE.SphereGeometry(0.028, 8, 6).scale(1, 0.6, 1), place(0, head + 0.012, 0), col('#FFD75E'), 0.75);
  return finish(b, key);
}

export function mushroomGeo(accent = PAL.accent.coral) {
  const key = 'mush-' + accent;
  if (cache.has(key)) return cache.get(key);
  const b = new GeoBuilder();
  b.add(new THREE.CylinderGeometry(0.036, 0.05, 0.13, 8).translate(0, 0.065, 0), place(), col('#F6ECD6'), 0);
  b.add(new THREE.SphereGeometry(0.105, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.72, 1).translate(0, 0.11, 0), place(), (c, v) => c.copy(col(accent)).lerp(col('#FFFFFF'), v.y > 0.17 ? 0.25 : 0), 0);
  return finish(b, key);
}

export function pebbleGeo() {
  if (cache.has('pebble')) return cache.get('pebble');
  const b = new GeoBuilder();
  b.add(new THREE.IcosahedronGeometry(0.11, 1).scale(1.25, 0.62, 1).translate(0, 0.05, 0), place(), (c, v, n) => c.copy(col(PAL.rock[0])).lerp(col(PAL.rockDark), 0.5 - 0.5 * n.y), 0);
  return finish(b, 'pebble');
}
