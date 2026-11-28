// 浮空小岛：上面是鼓起来的草地，边上一圈草皮包着、垂着几条根，往下是土和一层层的岩石，收成一个尖，扎进云海里。
// 草地和草皮是圆滑的；岩石是一块块的平面（低多边形的样子），一层深一层浅。
// 岛连同草、花、蘑菇、小石头都拼进同一个网格；为了建的时候不卡，分三步拼：草地、岩石、小东西。
import * as THREE from 'three';
import { GeoBuilder, place, col, smooth } from '../gfx/geobuilder.js';
import { makeNoise } from '../core/noise.js';
import { rng } from '../core/rng.js';
import { PAL } from '../core/palette.js';
import { tuftGeo, flowerGeo, mushroomGeo, pebbleGeo } from './decor.js';

// 剖面：从岛面中心（s = 0）到岛底的尖（s = 1），返回 [半径系数, 高度]
export function profile(s, D) {
  if (s < 0.28) { const u = s / 0.28; return [u, 0.18 * (1 - u * u)]; }                                 // 岛面：微微鼓起
  if (s < 0.36) { const u = (s - 0.28) / 0.08; return [1 + 0.07 * Math.sin(Math.PI * u) - 0.03 * u, -0.5 * u]; }   // 草皮的边
  const u = (s - 0.36) / 0.64;
  return [0.97 * Math.pow(1 - Math.pow(u, 1.25), 0.72), -0.5 - (D - 0.5) * Math.pow(u, 0.9)];           // 岩石往下收成尖
}

export const topY = (rf) => 0.18 * (1 - Math.min(1, rf) * Math.min(1, rf));

function ctxOf(node) {
  const { cx, cz, rx, rz, depth: D, seed, accent } = node.islet;
  return {
    cx, cz, rx, rz, D, seed, accent, n: makeNoise(seed), O: node.y,
    cGrass: PAL.grass.map(col), cEdge: col(PAL.grassEdge), cDirt: col(PAL.dirt), cDirtD: col(PAL.dirtDark),
    cRock: PAL.rock.map(col), cRockD: col(PAL.rockDark), c: new THREE.Color(),
  };
}

// 第一步：草地和草皮的边（圆滑的）
export function addIsletTop(b, node) {
  const { cx, cz, rx, rz, D, seed, n, O, cGrass, cEdge, cDirtD, c } = ctxOf(node);
  const NA = 64, rings = [];
  for (let k = 0; k <= 8; k++) rings.push((k / 8) * 0.28);
  for (let k = 1; k <= 4; k++) rings.push(0.28 + (k / 4) * 0.08);
  const pos = [], cl = [], idx = [];
  for (const s of rings) {
    const base = profile(s, D);
    for (let ai = 0; ai <= NA; ai++) {
      const a = (ai / NA) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const n1 = n.fbm3(ca * 1.4 + 3, sa * 1.4 + 7, s * 4.5, 3), n3 = n.noise3(ca * 3.1, sa * 3.1, s * 13 + 5);
      let rf = base[0], y = base[1];
      if (s < 0.28) y += 0.035 * n1 * (s / 0.28);
      else { rf *= 1 + 0.02 * n1; y += 0.02 * n3; }
      pos.push(cx + ca * rx * rf, O + y, cz + sa * rz * rf);
      if (s < 0.285) {                                             // 草地：两种绿混着，朝阳的地方带一点黄
        c.copy(cGrass[0]).lerp(cGrass[1], 0.5 + 0.5 * n1);
        if (n3 > 0.2) c.lerp(cGrass[2], Math.min(1, (n3 - 0.2) * 1.6));
        c.multiplyScalar(1 - 0.1 * smooth(0.7, 1, s / 0.28));
      } else {                                                     // 草皮的侧面：深绿过渡到土
        c.copy(cEdge).lerp(cDirtD, smooth(0.5, 1, (s - 0.28) / 0.08));
      }
      cl.push(c.r, c.g, c.b);
    }
  }
  const W = NA + 1;
  for (let ri = 0; ri < rings.length - 1; ri++) for (let ai = 0; ai < NA; ai++) {
    const a = ri * W + ai, b2 = a + W;
    idx.push(a, a + 1, b2, a + 1, b2 + 1, b2);
  }
  const top = new THREE.BufferGeometry();
  top.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  top.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
  top.setIndex(idx);
  top.computeVertexNormals();
  b.add(top, place(), null, 0);
}

// 第二步：岩石（一块块的平面）和草皮底下垂着的根
export function addIsletRock(b, node) {
  const { cx, cz, rx, rz, D, seed, n, O, cEdge, cDirt, cDirtD, cRock, cRockD, c } = ctxOf(node);
  const NB = 34, BR = 15, R = [];
  for (let k = 0; k <= BR; k++) R.push(0.36 + 0.64 * Math.pow(k / BR, 1.3));
  const pAt = (s, ai) => {
    const a = (ai / NB) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), u = (s - 0.36) / 0.64, base = profile(s, D);
    const rib = n.fbm3(ca * 1.9 + 11, sa * 1.9 + 5, s * 2.2, 3), lump = n.noise3(ca * 3.4 + 1, sa * 3.4 + 9, s * 9 + 2);
    const rf = base[0] * (1 + (0.05 + 0.11 * u) * rib + 0.06 * Math.abs(lump) * (0.3 + u));
    return [cx + ca * rx * rf, O + base[1] + 0.1 * u * lump, cz + sa * rz * rf, u, rib, lump];
  };
  const rp = [], rn = [], rc = [];
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), fn = new THREE.Vector3();
  const tri = (p0, p1, p2) => {
    A.set(p0[0], p0[1], p0[2]); B.set(p1[0], p1[1], p1[2]); C.set(p2[0], p2[1], p2[2]);
    fn.copy(e1.subVectors(B, A)).cross(e2.subVectors(C, A)).normalize();
    if (fn.y < 0.2 && p0[3] < 0.12) { fn.y = 0.2; fn.normalize(); }       // 紧挨着草皮的那一圈别朝下
    const u = (p0[3] + p1[3] + p2[3]) / 3, y = (A.y + B.y + C.y) / 3;
    const h = Math.sin(A.x * 12.9898 + A.z * 78.233 + B.y * 37.719) * 43758.5453;
    const shade = 0.93 + 0.14 * (((h % 1) + 1) % 1);                       // 每一块深浅略有不同
    const band = 0.5 + 0.5 * Math.sin(y * 6.5 + p0[4] * 3);
    c.copy(cRock[0]).lerp(cRock[1], band > 0.5 ? 1 : 0.25);
    c.lerp(cRockD, smooth(0.45, 1, u) * 0.5);                         // 越往下越深，化进云里
    c.lerp(cDirt, (1 - smooth(0, 0.14, u)) * 0.92);                   // 顶上一圈是土
    c.multiplyScalar(shade);
    for (const P of [A, B, C]) { rp.push(P.x, P.y, P.z); rn.push(fn.x, fn.y, fn.z); rc.push(c.r, c.g, c.b); }
  };
  for (let ri = 0; ri < BR; ri++) for (let ai = 0; ai < NB; ai++) {
    const p0 = pAt(R[ri], ai), p1 = pAt(R[ri], ai + 1), p2 = pAt(R[ri + 1], ai), p3 = pAt(R[ri + 1], ai + 1);
    if ((ai + ri) % 2) { tri(p0, p1, p3); tri(p0, p3, p2); } else { tri(p0, p1, p2); tri(p1, p3, p2); }
  }
  const body = new THREE.BufferGeometry();
  body.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
  body.setAttribute('normal', new THREE.Float32BufferAttribute(rn, 3));
  body.setAttribute('color', new THREE.Float32BufferAttribute(rc, 3));
  b.add(body, place(), null, 0);

  const lip = profile(0.36, D), rr = rng(seed ^ 0x52), roots = rr.int(3, 6);
  for (let k = 0; k < roots; k++) {
    const a = rr() * Math.PI * 2, len = rr.range(0.9, 2.2);
    const x = cx + Math.cos(a) * rx * lip[0] * 0.92, z = cz + Math.sin(a) * rz * lip[0] * 0.92;
    b.add(new THREE.CylinderGeometry(0.012, 0.035, len, 5).translate(0, -len / 2, 0), place(x, O - 0.42, z, 0, 1, rr.range(-0.12, 0.12), rr.range(-0.12, 0.12)),
      (cc, v) => cc.copy(cDirtD).lerp(cEdge, v.y < -len * 0.6 ? 0.4 : 0), (v) => 0.5 * smooth(O - 0.4, O - 0.4 - len, v.y));
  }
}

// 第三步：岛面上的草丛、花、蘑菇、小石头。树底下留出一圈，别把树根埋了
export function addIsletDecor(b, node) {
  const { cx, cz, rx, rz, seed, accent, O } = ctxOf(node), r = rng(seed ^ 0x61);
  const tx = node.x, tz = cz + 0.25;
  const drop = (count, minD, fn) => {
    for (let k = 0; k < count; k++) {
      const a = r() * Math.PI * 2, rf = Math.sqrt(r()) * 0.9;
      const x = cx + Math.cos(a) * rx * rf, z = cz + Math.sin(a) * rz * rf;
      if (Math.hypot(x - tx, z - tz) > minD) fn(x, O + topY(rf) - 0.012, z);
    }
  };
  drop(r.int(26, 40), 0.8, (x, y, z) => b.add(tuftGeo(), place(x, y, z, r() * 6.28, r.range(0.8, 1.5)), null, null));
  drop(r.int(5, 9), 0.9, (x, y, z) => b.add(flowerGeo(PAL.accent[accent]), place(x, y, z, r() * 6.28, r.range(0.9, 1.3)), null, null));
  drop(r.int(0, 3), 0.55, (x, y, z) => b.add(mushroomGeo(r() < 0.6 ? PAL.accent.coral : PAL.accent.sun), place(x, y, z, r() * 6.28, r.range(0.8, 1.4)), null, null));
  drop(r.int(3, 5), 0.7, (x, y, z) => b.add(pebbleGeo(), place(x, y, z, r() * 6.28, r.range(0.7, 1.6)), null, null));
}
