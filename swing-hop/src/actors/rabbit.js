// 兔子：圆滚滚的白兔，系一条珊瑚红的围巾，站在秋千上。
// 全是基本的球和胶囊拼的，动作全靠代码：蓄力时压扁、在空中拉长、落地弹一下，耳朵是带惯性的弹簧，围巾的飘带是布料模拟。
import * as THREE from 'three';
import { toon } from '../gfx/toon.js';
import { PAL } from '../core/palette.js';
import { clamp, smooth01 } from '../core/physics.js';

let MAT = null;
function mats() {
  if (MAT) return MAT;
  MAT = {
    fur: toon({ color: PAL.fur, grain: 0.03, rim: 0.3 }),
    belly: toon({ color: '#FFFDF6', grain: 0, rim: 0.2 }),
    pink: toon({ color: PAL.blush, grain: 0, rim: 0.15 }),
    blush: toon({ color: '#FFCDBC', grain: 0, rim: 0.1 }),
    scarf: toon({ color: PAL.scarf, grain: 0.04, rim: 0.3 }),
    scarfDark: toon({ color: PAL.scarfDark, emissive: 0xE2544A, emissiveIntensity: 0.5, grain: 0.04, rim: 0.2, side: THREE.DoubleSide }),
    scarfRibbon: toon({ color: PAL.scarf, emissive: PAL.scarf, emissiveIntensity: 0.4, grain: 0.04, rim: 0.2, side: THREE.DoubleSide }),
    eye: toon({ color: PAL.eye, grain: 0, rim: 0, spec: 0.9 }),
    white: new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2) }),
  };
  return MAT;
}

// 围巾的飘带：一串质点做 verlet 积分，画成一条带子
class Ribbon {
  constructor(n, seg, w0, w1, mat) {
    this.n = n; this.seg = seg; this.w0 = w0; this.w1 = w1;
    this.p = Array.from({ length: n }, () => new THREE.Vector3());
    this.q = this.p.map((v) => v.clone());
    this.arr = new Float32Array(n * 6);
    this.nor = new Float32Array(n * 6);                          // 法线一开始就填好（朝镜头）：只更新位置的话，显卡里会一直留着零法线，画出来是黑的
    for (let k = 0; k < n; k++) this.nor.set([0, 0, 1, 0, 0, 1], k * 6);
    const idx = [];
    for (let k = 0; k < n - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.arr, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3));
    this.geo.setIndex(idx);
    this.mesh = new THREE.Mesh(this.geo, mat);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.ready = false;
    this.t = new THREE.Vector3(); this.s = new THREE.Vector3(); this.a = new THREE.Vector3(); this.b = new THREE.Vector3();
  }

  // anchor：钉住的那一头（世界坐标）；flow：风和运动把带子往哪儿吹（加速度）
  step(anchor, flow, dt) {
    const { p, q, n, seg } = this;
    if (!this.ready) { for (let k = 0; k < n; k++) p[k].copy(anchor).add(new THREE.Vector3(-seg * k, 0, 0)); q.forEach((v) => v.copy(p[q.indexOf(v)])); this.ready = true; }
    const h = Math.min(dt, 1 / 40);
    for (let k = 1; k < n; k++) {
      const v = this.t.subVectors(p[k], q[k]).multiplyScalar(0.975);
      q[k].copy(p[k]);
      p[k].add(v).addScaledVector(flow, h * h);
    }
    p[0].copy(anchor);
    for (let it = 0; it < 4; it++) for (let k = 1; k < n; k++) {
      const d = this.t.subVectors(p[k], p[k - 1]), len = d.length() || 1e-6;
      p[k].addScaledVector(d, (seg - len) / len);
    }
    for (let k = 0; k < n; k++) {                              // 带子朝向镜头那一面
      const a = p[Math.max(0, k - 1)], b = p[Math.min(n - 1, k + 1)];
      this.s.subVectors(b, a).cross(new THREE.Vector3(0, 0, 1)).normalize();
      const w = (this.w0 + (this.w1 - this.w0) * (k / (n - 1))) / 2;
      this.a.copy(p[k]).addScaledVector(this.s, w);
      this.b.copy(p[k]).addScaledVector(this.s, -w);
      this.arr.set([this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z], k * 6);
      this.nor.set([0, 0, 1, 0, 0, 1], k * 6);
    }
    this.geo.attributes.position.needsUpdate = true;
  }
}

export class Rabbit {
  constructor() {
    const M = mats();
    this.group = new THREE.Group();
    this.group.name = 'rabbit';
    const root = this.root = new THREE.Group();
    this.group.add(root);
    const mk = (parent, geo, mat, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      parent.add(m);
      return m;
    };
    const sph = (r, sx = 1, sy = 1, sz = 1, w = 28, h = 20) => new THREE.SphereGeometry(r, w, h).scale(sx, sy, sz);
    const cap = (r, len, sx = 1, sz = 1) => new THREE.CapsuleGeometry(r, len, 6, 14).scale(sx, 1, sz).translate(0, len / 2, 0);

    const body = this.body = new THREE.Group();
    body.position.y = 0.47;
    root.add(body);
    mk(body, sph(0.3, 0.9, 1.06, 0.84), M.fur);
    mk(body, sph(0.19, 0.6, 0.82, 0.74), M.belly, 0.15, -0.01, 0);
    this.tail = mk(body, sph(0.095, 1, 1, 1, 16, 12), M.belly, -0.27, -0.02, 0);

    this.legs = [1, -1].map((sz) => {                          // 腿：从胯往下，脚踩在座板上
      const g = new THREE.Group();
      g.position.set(0.01, -0.06, 0.135 * sz);
      body.add(g);
      mk(g, cap(0.07, 0.17).translate(0, -0.285, 0), M.fur);
      mk(g, sph(0.1, 1.55, 0.42, 0.95, 20, 12), M.fur, 0.075, -0.43, 0);
      return g;
    });
    this.arms = [1, -1].map((sz) => {                          // 胳膊：肩膀底下垂下来
      const g = new THREE.Group();
      g.position.set(0.03, 0.2, 0.215 * sz);
      body.add(g);
      mk(g, cap(0.042, 0.2), M.fur);
      mk(g, sph(0.056, 1, 1, 1, 16, 12), M.fur, 0, 0.25, 0);
      g.userData.sz = sz;
      return g;
    });

    // 围巾：脖子上一圈，后面打个结，拖着两条飘带
    const ring = mk(body, new THREE.TorusGeometry(0.165, 0.046, 10, 28).rotateX(Math.PI / 2), M.scarf, 0.05, 0.245, 0);
    ring.scale.set(0.95, 1, 1.12);
    this.knot = mk(body, sph(0.055, 1, 0.9, 1, 14, 10), M.scarf, -0.13, 0.235, 0.04);
    this.ribbons = [new Ribbon(7, 0.075, 0.075, 0.05, M.scarfDark), new Ribbon(6, 0.07, 0.07, 0.045, M.scarfRibbon)];
    this.ribbons.forEach((r) => this.group.add(r.mesh));

    const head = this.head = new THREE.Group();
    head.position.set(0.07, 0.43, 0);
    body.add(head);
    mk(head, sph(0.245, 1.02, 0.94, 0.96), M.fur);
    mk(head, sph(0.115, 1.0, 0.7, 1.15), M.belly, 0.19, -0.085, 0);
    mk(head, sph(0.032, 1, 0.8, 1, 12, 10), M.pink, 0.3, -0.035, 0);
    this.mouth = mk(head, sph(0.04, 0.55, 1, 1, 12, 10), M.eye, 0.275, -0.135, 0);
    this.mouth.visible = false;
    const zAxis = new THREE.Vector3(0, 0, 1);
    this.eyes = [1, -1].map((sz) => {
      const e = mk(head, sph(0.052, 1, 1.12, 1, 18, 14), M.eye, 0.175, 0.045, 0.135 * sz);
      mk(e, sph(0.016, 1, 1, 1, 8, 6), M.white, 0.025, 0.022, 0.018 * sz).castShadow = false;
      const x = new THREE.Group();                              // 晕过去时的 X 眼
      x.position.set(0.178, 0.045, 0.138 * sz);
      x.quaternion.setFromUnitVectors(zAxis, new THREE.Vector3(0.6, 0.1, 0.8 * sz).normalize());
      for (const rz of [0.785, -0.785]) mk(x, new THREE.BoxGeometry(0.09, 0.014, 0.012), M.eye, 0, 0, 0.048).rotation.z = rz;
      x.visible = false;
      return { mesh: e, cross: x };
    });
    [1, -1].forEach((sz) => mk(head, sph(0.055, 0.16, 0.5, 1.3, 14, 10), M.blush, 0.15, -0.075, 0.205 * sz));

    // 耳朵：两节，各带一个弹簧，跑起来、落地时会甩
    this.ears = [1, -1].map((sz) => {
      const base = new THREE.Group();
      base.position.set(-0.055, 0.2, 0.09 * sz);
      base.rotation.x = -0.34 * sz;
      head.add(base);
      mk(base, cap(0.066, 0.17, 0.72, 1), M.fur);
      const upper = new THREE.Group();
      upper.position.y = 0.21;
      base.add(upper);
      mk(upper, cap(0.058, 0.2, 0.7, 0.95), M.fur);
      mk(upper, cap(0.034, 0.13, 0.3, 0.55), M.pink, 0.03, 0.03, 0);
      return { base, upper, a1: 0.15 + (sz === 1 ? 0 : 0.16), v1: 0, a2: 0.2, v2: 0, sz };
    });

    this.sq = 1; this.sqV = 0;
    this.prev = null;
    this.blink = 2 + Math.random() * 2;
    this.blinkT = 0;
    this.armZ = [-1.15, 1.25];
    this.armX = [-0.2, 0.2];
    this.legZ = [0, 0];
    this.lean = 0;
    this.flip = 0;
    this.v = new THREE.Vector3(); this.w = new THREE.Vector3();
  }

  // 落地的弹跳、起跳的蹬腿都从这里给一下冲量
  kick(amount) { this.sqV -= amount; }

  // st：{ x, y, state, st（在这个状态里待了多久）, charge, vx, vy, c, flip（空翻的进度 0 … 1，不翻是 null）, tilt }
  update(st, dt, t) {
    const S = st.state;
    if (this.prev === 'air' && (S === 'ride' || S === 'slip')) this.kick(7.5);
    if (this.prev !== 'air' && S === 'air') { this.kick(-5); this.ears.forEach((e) => { e.v1 -= 9; e.v2 -= 13; }); }
    this.prev = S;

    // ---------- 压扁和拉长 ----------
    let syT = 1;
    if (S === 'ride') syT = 1 - 0.3 * (st.charge ?? 0) + 0.012 * Math.sin(t * 2.6);
    else if (S === 'air') syT = 1 + 0.17 * Math.min(1, Math.hypot(st.vx, st.vy) / 13);
    else if (S === 'slip') syT = 0.92;
    this.sqV += (230 * (1 - this.sq) - 17 * this.sqV) * dt;
    this.sq += this.sqV * dt;
    const sy = clamp(this.sq * syT, 0.45, 1.5), sxz = 1 / Math.sqrt(sy);
    this.root.scale.set(sxz, sy, sxz);
    this.root.position.set(st.x, st.y, 0);

    // ---------- 身体的倾斜、空翻 ----------
    let leanT = 0, flip = 0;
    if (S === 'ride') leanT = (st.tilt ?? 0) * 0.7 - 0.14 * (st.charge ?? 0);
    else if (S === 'air') {
      leanT = clamp(Math.atan2(st.vy, Math.max(1, st.vx)) * 0.3, -0.45, 0.5);
      if (st.flip != null) flip = -Math.PI * 2 * smooth01(st.flip);
    } else if (S === 'slip') leanT = Math.sign(st.off || 1) * 0.5 * smooth01(st.st / 0.5);
    else if (S === 'fall') leanT = 0.3 * Math.sin(st.st * 7);
    else if (S === 'caught') leanT = -0.9;
    this.lean += (leanT - this.lean) * Math.min(1, dt * 9);
    this.flip += (flip - this.flip) * Math.min(1, dt * 16);
    this.root.rotation.z = this.lean + this.flip;
    const pivot = 0.55, c0 = Math.cos(this.root.rotation.z), s0 = Math.sin(this.root.rotation.z);
    this.body.position.set(pivot * s0, 0.47 + pivot - pivot * c0, 0);     // 绕着身体中间转，不是绕着脚转

    // ---------- 胳膊 ----------
    let az, ax = [-0.2, 0.2];
    if (S === 'ride') {
      const k = st.charge ?? 0;
      az = [-1.15 + 2.1 * k, 1.25 - 0.45 * k];
      ax = [-0.2 - 0.5 * k, 0.2 + 0.5 * k];
    } else if (S === 'air') {
      const up = st.vy > -2 ? 1 : 0.35;
      az = [-1.15 - 1.25 * up, 1.25 + 1.15 * up];
      ax = [-0.55, 0.55];
    } else if (S === 'slip') az = [-2.7 + 0.5 * Math.sin(t * 34), 2.7 + 0.5 * Math.sin(t * 31)];
    else if (S === 'fall') az = [-2.9 + 0.45 * Math.sin(t * 26), 2.9 - 0.45 * Math.sin(t * 23)];
    else az = [-1.5, 0.5];
    for (let k = 0; k < 2; k++) {
      this.armZ[k] += (az[k] - this.armZ[k]) * Math.min(1, dt * 12);
      this.armX[k] += (ax[k] - this.armX[k]) * Math.min(1, dt * 10);
      this.arms[k].rotation.set(this.armX[k] * this.arms[k].userData.sz, 0, this.armZ[k]);
    }

    // ---------- 腿 ----------
    let lz = [0, 0];
    if (S === 'air') lz = st.vy > -2 ? [-1.0, -0.85] : [-0.55, -0.45];
    else if (S === 'slip' || S === 'fall') lz = [0.5 * Math.sin(t * 24), -0.5 * Math.sin(t * 21)];
    else if (S === 'caught') lz = [-0.9, -0.7];
    for (let k = 0; k < 2; k++) {
      this.legZ[k] += (lz[k] - this.legZ[k]) * Math.min(1, dt * 12);
      this.legs[k].rotation.z = this.legZ[k];
    }

    // ---------- 头 ----------
    this.head.rotation.z = -this.lean * 0.6 + (S === 'ride' ? 0.05 * Math.sin(t * 1.3) + 0.12 * (st.charge ?? 0) : S === 'caught' ? -0.5 : 0);
    this.head.rotation.y = S === 'ride' ? -0.4 : S === 'fall' ? 0.25 * Math.sin(t * 9) : -0.15;

    // ---------- 耳朵：两节的弹簧，目标角度随状态变，运动时被甩起来 ----------
    this.ears.forEach((e, k) => {
      let t1 = 0.15, t2 = 0.2;
      if (S === 'ride') { const c = st.charge ?? 0; t1 = 0.15 * e.sz + 0.45 * c; t2 = 0.2 + 0.35 * c; }
      else if (S === 'air') { const sp = Math.min(1, st.vx / 10); t1 = 0.05 * e.sz + 0.2 * clamp(st.vy / 8, -1, 1); t2 = -0.55 * sp + 0.3 * clamp(st.vy / 8, -1, 1); }
      else if (S === 'fall') { t1 = -0.35 + 0.1 * Math.sin(t * 19 + k); t2 = -0.3; }
      else if (S === 'slip') { t1 = -0.3 + 0.2 * Math.sin(t * 30 + k * 2); t2 = -0.2; }
      else if (S === 'caught') { t1 = 0.9; t2 = 0.9; }
      e.v1 += (110 * (t1 - e.a1) - 7.5 * e.v1) * dt; e.a1 += e.v1 * dt;
      e.v2 += (95 * (t2 - e.a2) - 6 * e.v2) * dt + e.v1 * dt * 30; e.a2 += e.v2 * dt;
      e.base.rotation.z = e.a1;
      e.upper.rotation.z = e.a2 - e.a1 * 0.4;
      e.base.rotation.x = -0.34 * e.sz + 0.06 * Math.sin(t * 2.1 + k * 3);
    });

    // ---------- 眼睛：平时会眨，掉下去和被抓时是 X ----------
    const dizzy = S === 'fall' || S === 'caught' || S === 'slip';
    this.eyes.forEach((e) => { e.cross.visible = dizzy; e.mesh.visible = !dizzy; });
    this.mouth.visible = dizzy;
    this.blink -= dt;
    if (this.blink < 0) { this.blink = 1.8 + Math.random() * 2.6; this.blinkT = 0.11; }
    this.blinkT = Math.max(0, this.blinkT - dt);
    const open = dizzy ? 1 : this.blinkT > 0 ? 0.12 : 1;
    this.eyes.forEach((e) => e.mesh.scale.set(1, 1.12 * open + (1 - open) * 0.02, 1));

    // ---------- 围巾的飘带：风往左吹，兔子往右冲时被拖着走 ----------
    const flow = this.w.set(-9 - st.vx * 0.9 - 1.5 * Math.sin(t * 5.3), -16 + st.vy * 0.6, 0.6 * Math.sin(t * 4.1));
    this.knot.getWorldPosition(this.v);
    this.ribbons[0].step(this.v, flow, dt);
    this.v.z += 0.07;
    this.ribbons[1].step(this.v, flow, dt);
  }
}
