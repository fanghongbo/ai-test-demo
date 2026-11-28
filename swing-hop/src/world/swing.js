// 秋千的可见部分：两根系在树枝上的绳子、中间吊着的木板、侧面刷的一条颜色、绳子顶上系的蝴蝶结。
// 树枝上两点各系一根绳（两点隔着 0.86 米），所以绳子始终是平行的，木板在下面保持水平——和真的秋千一样。
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { toon } from '../gfx/toon.js';
import { woodTexture } from '../gfx/textures.js';
import { PAL } from '../core/palette.js';
import { ACCENTS, CLOUD_Y } from '../core/course.js';

export const ROPE_X = 0.43, BOARD_D = 0.6, BOARD_T = 0.09;
let MATS = null, GEO = null;

function init() {
  if (MATS) return;
  MATS = {
    rope: toon({ color: PAL.rope, grain: 0.22, grainScale: 2.5 }),
    plain: toon({ color: '#ffffff', map: woodTexture({}), grain: 0.05 }),
    wide: toon({ color: '#ffffff', map: woodTexture({ seed: 12 }), grain: 0.05 }),
    gold: toon({ color: '#ffffff', map: woodTexture({ base: PAL.gold, dark: PAL.goldDark, light: '#FFE79A', seed: 21 }), spec: 0.3, rim: 0.36 }),
    cracked: toon({ color: '#ffffff', map: woodTexture({ base: '#8F7B64', dark: '#5E4C3A', light: '#B7A58C', crack: true, seed: 5 }), grain: 0.08 }),
    paint: {},
    goldStripe: toon({ color: '#E0A22E', grain: 0.04, rim: 0.3 }),
    bell: toon({ color: PAL.gold, spec: 0.5, rim: 0.3, grain: 0 }),
  };
  for (const a of ACCENTS) MATS.paint[a] = toon({ color: PAL.accent[a], grain: 0, rim: 0.3 });
  const rope = new THREE.CylinderGeometry(0.028, 0.028, 1, 8).translate(0, -0.5, 0);
  const knotTop = new THREE.SphereGeometry(0.05, 10, 8).translate(0, -0.03, 0), knotBot = new THREE.SphereGeometry(0.045, 10, 8).translate(0, -0.97, 0);
  GEO = {
    rope: mergeSimple([rope, knotTop, knotBot]),
    board: new RoundedBoxGeometry(ROPE_X * 2 - 0.02, BOARD_T, BOARD_D, 3, 0.028),
    boardWide: new RoundedBoxGeometry(1.86, BOARD_T, BOARD_D, 3, 0.028),
    stripe: new THREE.BoxGeometry(ROPE_X * 2 + 0.004, 0.03, BOARD_D + 0.014),
    stripeWide: new THREE.BoxGeometry(1.864, 0.03, BOARD_D + 0.014),
    bowL: new THREE.ConeGeometry(0.05, 0.16, 6).translate(0, 0.08, 0).rotateZ(1.1),
    bowR: new THREE.ConeGeometry(0.05, 0.16, 6).translate(0, 0.08, 0).rotateZ(-1.1),
    knot: new THREE.SphereGeometry(0.045, 10, 8),
    bell: new THREE.SphereGeometry(0.06, 12, 10).scale(1, 1.1, 1),
    loop: new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6),
    half: new RoundedBoxGeometry(ROPE_X - 0.02, BOARD_T, BOARD_D, 2, 0.024),
    halfWide: new RoundedBoxGeometry(0.9, BOARD_T, BOARD_D, 2, 0.024),
  };
}

function mergeSimple(list) {
  const parts = list.map((g) => g.toNonIndexed());
  let n = 0;
  for (const g of parts) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

export class SwingView {
  constructor(node) {
    init();
    const w = node.swing, wide = w.kind === 'wide';
    this.node = node;
    this.L = w.L;
    this.kind = w.kind;
    this.group = new THREE.Group();
    this.group.position.set(w.tipX, w.tipY, w.tipZ);
    const add = (geo, mat, parent = this.group, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    this.ropeL = add(GEO.rope, MATS.rope, this.group, -ROPE_X, 0, 0);
    this.ropeR = add(GEO.rope, MATS.rope, this.group, ROPE_X, 0, 0);
    this.board = new THREE.Group();
    this.group.add(this.board);
    this.plank = add(wide ? GEO.boardWide : GEO.board, MATS[w.kind] || MATS.plain, this.board);
    const paint = MATS.paint[node.islet.accent];
    this.stripe = add(wide ? GEO.stripeWide : GEO.stripe, w.kind === 'gold' ? MATS.goldStripe : paint, this.board);
    for (const sx of [-ROPE_X, ROPE_X]) {                      // 绳子顶上的蝴蝶结
      const bow = new THREE.Group();
      bow.position.set(sx, -0.05, 0.07);
      bow.rotation.x = -0.5;
      add(GEO.bowL, paint, bow); add(GEO.bowR, paint, bow); add(GEO.knot, paint, bow);
      this.group.add(bow);
    }
    if (w.kind === 'gold') {                                   // 金色秋千的前沿挂两个小铃铛，一晃就响
      this.bells = [0.33, -0.33].map((bx) => {
        const loop = add(GEO.loop, MATS.bell, this.board, bx, -0.07, BOARD_D / 2 - 0.03);
        loop.castShadow = false;
        return add(GEO.bell, MATS.bell, this.board, bx, -0.15, BOARD_D / 2 - 0.03);
      });
    }
    this.tilt = 0;
    this.shake = 0;
    this.broken = false;
    this.bits = null;
    this.halves = [];
  }

  // th：秋千的角度；tilt：木板因为站偏了倾斜的角度；stretch：绳子被拽长了多少（比例）
  update(th, tilt, stretch, dt) {
    const L = this.L * (1 + stretch), s = Math.sin(th), c = Math.cos(th);
    for (const r of [this.ropeL, this.ropeR]) { r.rotation.z = th; r.scale.y = L; }
    this.board.position.set(L * s, -L * c, 0);
    this.tilt += (tilt - this.tilt) * Math.min(1, dt * 14);
    this.board.rotation.z = this.tilt + (this.shake > 0 ? Math.sin(this.shake * 70) * 0.05 : 0);
    this.shake = Math.max(0, this.shake - dt);
    if (this.bells) { const k = Math.sin(th * 3 + performance.now() * 0.004) * 0.3; for (const b of this.bells) b.rotation.z = k; }
    if (this.bits) this.stepBits(dt);
  }

  // 断了：木板裂成两半往下掉
  break() {
    if (this.broken) return;
    this.broken = true;
    this.plank.visible = false;
    this.stripe.visible = false;                                   // 涂在板侧面的色带和铃铛跟着木板一起没了
    if (this.bells) for (const b of this.bells) b.visible = false;
    const wide = this.kind === 'wide';
    this.bits = [];
    for (const sgn of [-1, 1]) {
      const m = new THREE.Mesh(wide ? GEO.halfWide : GEO.half, MATS[this.kind] || MATS.plain);
      m.castShadow = true;
      const p = this.plank.getWorldPosition(new THREE.Vector3());
      m.position.copy(p);
      this.group.parent.add(m);
      this.halves.push(m);
      this.bits.push({ m, v: new THREE.Vector3(sgn * 1.6 + 0.4, 1.2, (Math.random() - 0.5) * 1.5), w: new THREE.Vector3((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6, sgn * 7) });
    }
  }

  stepBits(dt) {
    for (const b of this.bits) {
      b.v.y -= 22 * dt;
      b.m.position.addScaledVector(b.v, dt);
      b.m.rotation.x += b.w.x * dt; b.m.rotation.y += b.w.y * dt; b.m.rotation.z += b.w.z * dt;
      if (b.m.position.y < CLOUD_Y - 1.5) { this.group.parent.remove(b.m); b.dead = true; }
    }
    if (this.bits.every((b) => b.dead)) this.bits = null;
  }
}
