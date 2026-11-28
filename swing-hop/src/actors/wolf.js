// 风暴狼：靛蓝灰的狼，背上有一溜往后倒的鬃毛，眼睛发着黄光，踩着一团风暴云追在兔子后面。
// 都是球、胶囊和锥拼的；跑动、扑咬都是代码摆出来的姿势。
import * as THREE from 'three';
import { toon } from '../gfx/toon.js';
import { dotTexture } from '../gfx/textures.js';
import { PAL } from '../core/palette.js';
import { clamp, smooth01 } from '../core/physics.js';

let MAT = null;
function mats() {
  if (MAT) return MAT;
  MAT = {
    fur: toon({ color: PAL.wolf, grain: 0.08, grainScale: 0.9, rim: 0.6 }),
    light: toon({ color: PAL.wolfLight, grain: 0.08, rim: 0.5 }),
    dark: toon({ color: PAL.wolfDark, grain: 0.05, rim: 0.4 }),
    nose: toon({ color: '#151226', grain: 0, rim: 0.2, spec: 0.5 }),
    teeth: toon({ color: PAL.teeth, grain: 0, rim: 0.3 }),
    mouth: toon({ color: PAL.mouth, grain: 0, rim: 0.1 }),
    cloud: toon({ color: '#6F6BB0', grain: 0.07, grainScale: 0.9, rim: 0.45 }),
    cloudTop: toon({ color: '#9B98D8', grain: 0.05, rim: 0.45 }),
    eye: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.8, 2.1, 0.5) }),
    glow: new THREE.MeshBasicMaterial({ map: dotTexture(), color: new THREE.Color(1.6, 1.2, 0.3), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }),
  };
  return MAT;
}

export class Wolf {
  constructor(scene) {
    const M = mats();
    this.group = new THREE.Group();
    this.group.visible = false;
    this.group.name = 'wolf';
    scene.add(this.group);
    const root = this.root = new THREE.Group();
    this.group.add(root);
    const mk = (parent, geo, mat, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      parent.add(m);
      return m;
    };
    const sph = (r, sx = 1, sy = 1, sz = 1, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h).scale(sx, sy, sz);
    const capUp = (r, len) => new THREE.CapsuleGeometry(r, len, 5, 12).translate(0, len / 2, 0);
    const capDown = (r, len) => new THREE.CapsuleGeometry(r, len, 5, 12).translate(0, -len / 2, 0);
    const spike = (r, h) => new THREE.ConeGeometry(r, h, 5).translate(0, h / 2, 0);

    // ---------- 身体：修长的躯干，胸口厚，背上有一道浅色的脊背，肚子是深色 ----------
    const body = this.body = new THREE.Group();
    body.position.y = 0.86;
    root.add(body);
    mk(body, sph(1, 0.62, 0.26, 0.24), M.fur, -0.05, 0.02, 0);
    mk(body, sph(0.3, 0.9, 1.05, 0.95), M.fur, 0.4, 0.06, 0);
    mk(body, sph(0.29, 1.05, 1.0, 0.95), M.fur, -0.5, 0.0, 0);
    mk(body, sph(1, 0.6, 0.13, 0.2), M.light, -0.05, 0.17, 0);
    mk(body, sph(1, 0.55, 0.1, 0.2), M.dark, -0.05, -0.17, 0);
    for (let k = 0; k < 7; k++) mk(body, spike(0.085, 0.22), M.light, 0.52 - k * 0.16, 0.29 - k * 0.01, 0).rotation.z = 1.15;   // 脊背上贴着往后倒的鬃毛

    // ---------- 脖子和头 ----------
    const neck = this.neck = new THREE.Group();
    neck.position.set(0.6, 0.16, 0);
    neck.rotation.z = -0.85;
    body.add(neck);
    mk(neck, capUp(0.17, 0.3), M.fur);
    for (const sz of [1, -1]) for (let k = 0; k < 3; k++) {            // 脖子两侧炸开的毛
      const s = mk(neck, spike(0.055, 0.22), M.light, 0.12 + k * 0.11, 0.02 + k * 0.12, 0.15 * sz);
      s.rotation.set(0.5 * sz, 0, 1.5);
    }
    const head = this.head = new THREE.Group();
    head.position.set(0, 0.46, 0);
    head.rotation.z = 0.68;
    neck.add(head);
    mk(head, sph(0.21, 1.05, 0.95, 0.9), M.fur);
    mk(head, new THREE.CylinderGeometry(0.062, 0.12, 0.32, 10).rotateZ(-Math.PI / 2).translate(0.29, -0.05, 0), M.light);    // 吻部
    mk(head, sph(0.05, 1, 0.8, 1.1, 10, 8), M.nose, 0.46, -0.03, 0);
    mk(head, sph(0.095, 1.7, 0.5, 0.75, 10, 8), M.mouth, 0.23, -0.115, 0);                                                 // 口腔
    for (const [sx, h] of [[0.3, 0.1], [0.39, 0.075]]) for (const sz of [-0.062, 0.062]) mk(head, spike(0.019, h).rotateX(Math.PI).translate(0, -h, 0), M.teeth, sx, -0.118, sz);
    for (const sz of [1, -1]) for (let k = 0; k < 2; k++) {                                                              // 腮边的毛往后支棱着
      const s = mk(head, spike(0.045, 0.16), M.light, -0.04 - k * 0.05, -0.04 + k * 0.05, 0.17 * sz);
      s.rotation.set(0.35 * sz, 0, 1.75);
    }
    const jaw = this.jaw = new THREE.Group();                                                                            // 下颌
    jaw.position.set(0.08, -0.12, 0);
    jaw.rotation.z = -0.4;
    head.add(jaw);
    mk(jaw, new THREE.CylinderGeometry(0.035, 0.075, 0.3, 8).rotateZ(-Math.PI / 2).translate(0.15, -0.02, 0), M.fur);
    mk(jaw, sph(0.075, 1.6, 0.3, 0.8, 10, 8), M.mouth, 0.17, 0.015, 0);
    for (const sx of [0.24, 0.31]) for (const sz of [-0.04, 0.04]) mk(jaw, spike(0.015, 0.055), M.teeth, sx, 0.005, sz);
    this.eyes = [1, -1].map((sz) => mk(head, sph(0.045, 1, 1, 0.7, 10, 8), M.eye, 0.09, 0.07, 0.135 * sz));
    this.glows = [1, -1].map((sz) => {                                                   // 眼睛周围一圈柔光
      const s = new THREE.Sprite(M.glow);
      s.position.set(0.12, 0.07, 0.15 * sz);
      s.scale.setScalar(0.3);
      head.add(s);
      return s;
    });
    [1, -1].forEach((sz) => {                                                             // 眉骨压下来，显得凶
      const b = mk(head, new THREE.BoxGeometry(0.14, 0.032, 0.05), M.dark, 0.1, 0.125, 0.15 * sz);
      b.rotation.z = -0.4; b.rotation.y = sz * 0.5;
    });
    this.ears = [1, -1].map((sz) => {
      const e = new THREE.Group();
      e.position.set(-0.07, 0.17, 0.11 * sz);
      e.rotation.x = -0.3 * sz;
      head.add(e);
      mk(e, spike(0.075, 0.27), M.fur);
      mk(e, spike(0.045, 0.19), M.mouth, 0.015, 0.0, 0);
      return e;
    });

    // ---------- 四条腿：大腿上有一块肌肉，小腿细，脚是爪子 ----------
    this.legs = [[0.42, 0.19, 0, 0], [0.42, -0.19, 1, 0], [-0.52, 0.18, 2, 1], [-0.52, -0.18, 3, 1]].map(([x, z, idx, hind]) => {
      const up = new THREE.Group();
      up.position.set(x, -0.04, z);
      body.add(up);
      mk(up, hind ? sph(0.2, 0.9, 1.25, 0.7) : sph(0.12, 0.8, 1.35, 0.7), M.fur, 0, -0.1, 0);
      mk(up, capDown(0.072, 0.24), M.dark);
      const lo = new THREE.Group();
      lo.position.y = -0.38;
      up.add(lo);
      mk(lo, capDown(0.05, 0.26), M.dark);
      mk(lo, sph(0.095, 1.3, 0.5, 0.9, 10, 8), M.nose, 0.035, -0.36, 0);
      return { up, lo, idx, hind };
    });

    // ---------- 尾巴：往下垂着往后拖，尖上一团毛 ----------
    this.tail = [];
    let parent = body;
    const segs = [[-0.7, 0.14, 0.07, 0.24], [0, 0, 0.085, 0.22]];
    segs.forEach(([x, y, r, len], k) => {
      const g = new THREE.Group();
      g.position.set(x, y, 0);
      g.rotation.z = k === 0 ? -0.75 : -0.1;
      parent.add(g);
      mk(g, new THREE.CapsuleGeometry(r, len, 5, 10).rotateZ(Math.PI / 2).translate(-len / 2 - r * 0.5, 0, 0), M.dark);
      this.tail.push(g);
      parent = g;
    });
    const tip = new THREE.Group();
    tip.position.set(-0.3, 0, 0);
    tip.rotation.z = -0.55;
    parent.add(tip);
    mk(tip, sph(0.15, 1.5, 1.0, 1.0, 14, 10), M.dark, -0.12, 0, 0);
    mk(tip, sph(0.1, 1.2, 0.9, 0.9, 12, 8), M.light, -0.2, 0.02, 0);
    this.tail.push(tip);

    // ---------- 脚下的风暴云：底下五团压扁的球铺开，上面四团小一点的浅色球鼓起来。和岛、树用同一种卡通材质，一起被太阳照、一起投影 ----------
    this.cloud = [];
    const blob = (x, y, z, r, sy, mat) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat);
      m.position.set(x, y, z);
      m.scale.set(1, sy, 0.86);
      m.castShadow = true;
      m.userData.sy = sy;
      m.userData.ph = this.cloud.length * 1.7;
      root.add(m);
      this.cloud.push(m);
      return m;
    };
    for (const [x, y, z, r] of [[-1.0, -0.02, 0.06, 0.28], [-0.58, 0.05, 0.1, 0.34], [-0.1, 0.07, -0.02, 0.38], [0.38, 0.05, 0.1, 0.35], [0.84, -0.02, 0.04, 0.29]]) blob(x, y, z, r, 0.7, M.cloud);
    for (const [x, y, z, r] of [[-0.74, 0.2, 0.0, 0.2], [-0.32, 0.27, -0.06, 0.22], [0.12, 0.28, 0.06, 0.22], [0.52, 0.21, -0.02, 0.19]]) blob(x, y, z, r, 0.8, M.cloudTop);

    this.phase = 0;
    this.pounceT = -1;
    this.from = new THREE.Vector3();
    this.to = new THREE.Vector3();
    this.lastIdx = 0;
    this.x = 0;
    this.y = 0;
  }

  // 脚底下该多高：跟着附近的岛面走
  groundY(game, x) {
    const c = game.course;
    let i = clamp(this.lastIdx, 0, c.length - 1);
    while (i > 0 && c.node(i).x > x) i--;
    while (i < c.length - 2 && c.node(i + 1).x < x) i++;
    this.lastIdx = i;
    const a = c.node(i), b2 = c.node(i + 1), k = clamp((x - a.x) / Math.max(0.01, b2.x - a.x), 0, 1);
    return a.y + (b2.y - a.y) * k;
  }

  // 追上了：从它站的地方扑到兔子身上
  pounce() {
    if (this.pounceT >= 0) return;
    this.pounceT = 0;
    this.from.set(this.x, this.y, -1.05);
  }

  // 每一帧：读规则里狼的位置和速度，摆姿势
  sync(game, dt, t, onFx) {
    const w = game.wolf, b = game.bun;
    if (!w.active) { this.group.visible = false; return; }
    this.group.visible = true;
    const speed = Math.abs(w.v), moving = speed > 0.15;
    this.phase += dt * (moving ? 7.5 + speed * 1.5 : 1.4);
    this.to.set(b.x - 0.95, Math.max(b.y - 0.5, this.groundY(game, b.x)), 0);
    let x = w.x, y = this.groundY(game, w.x) + (moving ? Math.abs(Math.sin(this.phase)) * 0.08 : 0), attack = 0, air = 0;
    if (this.pounceT >= 0) {                                             // 扑过去：一条往前上的弧
      this.pounceT = Math.min(1, this.pounceT + dt * 3.6);
      const k = smooth01(this.pounceT);
      x = this.from.x + (this.to.x - this.from.x) * k;
      y = this.from.y + (this.to.y - this.from.y) * k;
      air = Math.sin(Math.PI * Math.min(1, this.pounceT * 1.25)) * 1.5;
      attack = Math.min(1, this.pounceT * 2.2);
    }
    this.x = x; this.y = y;
    this.root.position.set(x, y + air + 0.26, -1.05);                                   // 云的底面贴着岛面，狼踩在云上
    const ph = this.phase, run = moving ? 1 : 0;
    this.body.position.y = 0.86 + 0.06 * Math.sin(ph * 2) * run;
    this.body.rotation.z = 0.08 * Math.sin(ph) * run - 0.4 * attack;
    this.root.rotation.z = -0.1 * attack;
    for (const L of this.legs) {
      const o = L.idx < 2 ? 0 : Math.PI, p = L.idx % 2 ? 0.6 : 0;
      const swing = Math.sin(ph + o + p), fold = Math.max(0, Math.sin(ph + o + p + 1.2));
      const front = L.idx < 2, rest = L.hind ? -0.3 : 0;
      L.up.rotation.z = (rest + 0.75 * swing * run) * (1 - attack) + attack * (front ? 1.2 : -1.0);
      L.lo.rotation.z = ((L.hind ? 0.55 : 0) - 1.0 * fold * run) * (1 - attack) + attack * (front ? 0.15 : 0.55);
    }
    this.neck.rotation.z = -0.85 - 0.1 * Math.sin(ph * 2) * run + 0.5 * attack;
    this.head.rotation.z = 0.68 + 0.08 * Math.sin(ph * 2 + 1) * run - 0.4 * attack;
    this.jaw.rotation.z = -0.38 - 0.1 * (0.5 + 0.5 * Math.sin(ph * 0.7)) - 0.55 * attack;
    for (const [k, g] of this.tail.entries()) {
      g.rotation.y = 0.28 * Math.sin(t * 5.5 - k * 1.1) * (0.4 + 0.6 * run);
      g.rotation.z = (k === 0 ? -0.75 : k === 1 ? -0.1 : -0.55) + 0.1 * Math.sin(t * 4 + k) + 0.5 * attack + 0.25 * run;
    }
    for (const [k, e] of this.ears.entries()) e.rotation.z = 0.28 + 0.1 * Math.sin(t * 6 + k * 2) + 0.65 * attack;
    for (const m of this.cloud) m.scale.y = m.userData.sy * (1 + 0.07 * Math.sin(t * 5 + m.userData.ph));   // 脚下的云一鼓一鼓的
    for (const g of this.glows) g.material.opacity = 0.38 + 0.18 * Math.sin(t * 9) + 0.3 * attack;
    if (onFx && moving) {                                              // 身后的黑雾和身上的电火花
      for (let k = 0; k < 2; k++) onFx.trail(x, y, -1.05, w.v);
      if (Math.random() < 0.25 + speed * 0.08) onFx.spark(x + 0.2, y + 1.0 + Math.random() * 0.6, -1.05);
    }
  }

  where() { return { x: this.x, y: this.y }; }
}
