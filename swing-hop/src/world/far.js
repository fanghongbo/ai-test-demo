// 远景：雾里若隐若现的几座小岛、天上飞过的鸟。它们是真的三维物体，放在很远的纵深上，
// 镜头往前走的时候它们几乎不动——2.5D 的“远”。走出范围的会挪到另一头接着用。
import * as THREE from 'three';
import { GeoBuilder, place, col } from '../gfx/geobuilder.js';
import { rng } from '../core/rng.js';
import { PAL } from '../core/palette.js';

const SPAN = 340;

// 远处的小岛：低精度的岛身加一棵小树，一个网格
function farIslet(r, blossom) {
  const b = new GeoBuilder(), D = r.range(2.2, 4.5), rx = r.range(1.6, 2.6), rz = rx * r.range(0.7, 0.9);
  const NA = 20, rings = [];
  for (let k = 0; k <= 3; k++) rings.push([k / 3, 0.2 * (1 - (k / 3) ** 2)]);
  rings.push([1.05, -0.4]);
  for (let k = 1; k <= 5; k++) { const u = k / 5; rings.push([0.95 * Math.pow(1 - Math.pow(u, 1.25), 0.72), -0.4 - (D - 0.4) * Math.pow(u, 0.9)]); }
  const grass = col(PAL.grass[1]), rock = col(PAL.rock[1]), rockD = col(PAL.rockDark), dirt = col(PAL.dirt);
  const pos = [], idx = [], cl = [], c = new THREE.Color();
  for (let ri = 0; ri < rings.length; ri++) {
    const [rf, y] = rings[ri], u = Math.max(0, (y + 0.4) / D);
    for (let ai = 0; ai <= NA; ai++) {
      const a = (ai / NA) * Math.PI * 2;
      pos.push(Math.cos(a) * rx * rf, y, Math.sin(a) * rz * rf);
      if (ri < 3) c.copy(grass);
      else if (ri === 3) c.copy(dirt);
      else c.copy(rock).lerp(rockD, u * 0.8);
      cl.push(c.r, c.g, c.b);
    }
  }
  const W = NA + 1;
  for (let ri = 0; ri < rings.length - 1; ri++) for (let ai = 0; ai < NA; ai++) {
    const a = ri * W + ai, b2 = a + W;
    idx.push(a, a + 1, b2, a + 1, b2 + 1, b2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  b.add(geo, place(), null, 0);
  const h = r.range(1.6, 2.6);
  b.add(new THREE.CylinderGeometry(0.12, 0.2, h, 7).translate(0, h / 2, 0), place(0.2, 0.1, -0.2), col(PAL.trunkDark), 0);
  const tones = blossom ? PAL.blossom : PAL.leaf, base = col(tones[0]), light = col(tones[1]);
  b.add(new THREE.SphereGeometry(1.25, 14, 10), place(0.3, h + 0.7, -0.2, 0, 1), (cc, v) => cc.copy(base).lerp(light, 0.5 + 0.5 * v.y), 0);
  b.add(new THREE.SphereGeometry(0.85, 12, 9), place(-0.6, h + 0.35, 0.2, 0, 1), (cc, v) => cc.copy(base).lerp(light, 0.4 + 0.5 * v.y), 0);
  return b.build();
}

export class FarLands {
  constructor(scene, mat) {
    this.group = new THREE.Group();
    this.group.name = 'far';
    scene.add(this.group);
    this.items = [];
    this.geos = [];
    this.camX = 0;
    const r = rng(9091);
    const N = 9;
    for (let k = 0; k < N; k++) {
      const geo = farIslet(r, r() < 0.25);
      this.geos.push(geo);
      const m = new THREE.Mesh(geo, mat);
      m.frustumCulled = false;
      const z = r.range(-125, -58);                                // 越远的做得越大，看着才不至于太小
      const it = { mesh: m, ax: r() * SPAN, y: r.range(-2.5, 4.5), z, s: r.range(1.2, 1.7) * (1 + (-z - 58) / 70), ph: r() * 6.28, rot: r.range(-0.6, 0.6) };
      m.scale.setScalar(it.s);
      this.group.add(m);
      this.items.push(it);
    }
  }

  update(camX, t) {
    for (const it of this.items) {
      if (it.ax < camX - SPAN / 2) it.ax += SPAN;
      else if (it.ax > camX + SPAN / 2) it.ax -= SPAN;
      it.mesh.position.set(it.ax, it.y + Math.sin(t * 0.35 + it.ph) * 0.35, it.z);
      it.mesh.rotation.y = it.rot;
    }
    this.camX = camX;
  }

  dispose() {
    for (const g of this.geos) g.dispose();
    this.group.removeFromParent();
  }
}

// 鸟：两片会扇的翅膀，远远地排成一排往左飞（顺着风）
export class Birds {
  constructor(scene, mat) {
    this.group = new THREE.Group();
    this.group.name = 'birds';
    scene.add(this.group);
    this.birds = [];
    const r = rng(3311), wing = new THREE.BufferGeometry();
    wing.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.5, 0.05, 0, 0.15, 0, -1], 3));
    wing.computeVertexNormals();
    const flocks = [[-27, 3.2, 9], [-44, 4.6, 7]];                     // 贴着云面的上头飞，正好在树冠和云海之间
    for (const [z, y, n] of flocks) {
      const ox = r() * SPAN, oy = y + r.range(-1, 1), oz = z + r.range(-4, 4), s = z < -30 ? 1.3 : 0.9;
      for (let k = 0; k < n; k++) {
        const g = new THREE.Group();
        const L = new THREE.Mesh(wing, mat), R = new THREE.Mesh(wing, mat);
        R.scale.z = -1;
        g.add(L, R);
        g.scale.setScalar(s * r.range(0.85, 1.1));
        this.group.add(g);
        this.birds.push({ g, L, R, ax: ox + k * r.range(0.9, 1.5) + (k % 2) * 0.4, y: oy + r.range(-0.5, 0.5), z: oz + r.range(-1.5, 1.5), ph: r() * 6.28, sp: r.range(1.1, 1.7) });
      }
    }
    this.t = 0;
    this.camX = 0;
  }

  update(camX, dt, t) {
    for (const b of this.birds) {
      b.ax -= b.sp * dt;
      if (b.ax < camX - SPAN / 2) b.ax += SPAN;
      const flap = Math.sin(t * 7.5 + b.ph) * 0.75;
      b.L.rotation.x = flap;
      b.R.rotation.x = -flap;
      b.g.position.set(b.ax, b.y + Math.sin(t * 0.9 + b.ph) * 0.25 + flap * 0.02, b.z);
      b.g.rotation.z = Math.sin(t * 0.9 + b.ph) * 0.08;
    }
    this.camX = camX;
  }
}
