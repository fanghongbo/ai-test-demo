// 特效：曳光、枪口焰、弹着火花 / 灰尘 / 木屑、血雾、抛壳、弹孔和焦痕、手雷爆炸。全部是对象池 + 实例化 / 点精灵，状态再乱也只有十来次绘制。
// 坐标都在船的坐标系里（挂在这条船的根节点下）；画海水倒影时整组藏起来。
import * as THREE from 'three';
import { rng } from '../gfx/texgen.js';

const PI = Math.PI, _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new THREE.Vector3(), _z = new THREE.Vector3(0, 0, 1), _p = new THREE.Vector3(), _e = new THREE.Euler();
const R = rng(1234);
const rnd = (a, b) => a + (b - a) * R();

function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  return t;
}
const dotTex = () => canvasTex(64, (ctx, n) => { const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, n, n); });
const flashTex = () => canvasTex(160, (ctx, n) => {                                       // 枪口焰：几片放射状的花瓣 + 炽白的芯
  const c = n / 2, r = rng(77);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.39996 + r() * 0.3, len = n * (0.26 + r() * 0.22), w = n * (0.05 + r() * 0.05);
    ctx.save(); ctx.translate(c, c); ctx.rotate(a);
    const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.45, 'rgba(255,255,255,0.42)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(len * 0.5, 0, len * 0.52, w, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const g = ctx.createRadialGradient(c, c, 0, c, c, n * 0.21); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
});
const puffTex = () => canvasTex(128, (ctx, n) => {
  for (let i = 0; i < 16; i++) { const x = n / 2 + (R() - 0.5) * n * 0.4, y = n / 2 + (R() - 0.5) * n * 0.4, r = n * (0.14 + R() * 0.2), g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, n, n); }
});
const holeTex = () => canvasTex(64, (ctx, n) => {
  ctx.clearRect(0, 0, n, n);
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, 'rgba(12,10,9,1)'); g.addColorStop(0.3, 'rgba(22,18,16,0.96)'); g.addColorStop(0.42, 'rgba(150,142,132,0.55)'); g.addColorStop(0.7, 'rgba(90,84,78,0.16)'); g.addColorStop(1, 'rgba(60,56,52,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
  ctx.strokeStyle = 'rgba(200,192,180,0.35)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) { const a = R() * PI * 2, l = n * (0.2 + R() * 0.22); ctx.beginPath(); ctx.moveTo(n / 2 + Math.cos(a) * n * 0.12, n / 2 + Math.sin(a) * n * 0.12); ctx.lineTo(n / 2 + Math.cos(a + 0.2) * l, n / 2 + Math.sin(a + 0.2) * l); ctx.stroke(); }
});
const scorchTex = () => canvasTex(128, (ctx, n) => {
  ctx.clearRect(0, 0, n, n);
  for (let i = 0; i < 22; i++) { const x = n / 2 + (R() - 0.5) * n * 0.36, y = n / 2 + (R() - 0.5) * n * 0.36, r = n * (0.1 + R() * 0.22), g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(14,12,11,0.85)'); g.addColorStop(0.6, 'rgba(26,22,20,0.45)'); g.addColorStop(1, 'rgba(30,26,24,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, n, n); }
});

const VERT = /* glsl */`
attribute float aSize;
attribute float aAlpha;
attribute vec3 aColor;
uniform float uScale;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min( aSize * uScale / max( - mv.z, 0.06 ), 1400.0 );
  vColor = aColor; vAlpha = aAlpha;
}`;
const FRAG = /* glsl */`
uniform sampler2D uTex;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 t = texture2D( uTex, gl_PointCoord );
  float a = t.a * vAlpha;
  if ( a < 0.004 ) discard;
  gl_FragColor = vec4( vColor * t.rgb, a );
}`;

/** 一池点精灵。颜色可以大于 1（HDR，交给泛光）。 */
class Pool {
  constructor(cap, additive, tex) {
    this.cap = cap; this.n = 0;
    for (const k of 'x y z vx vy vz life max s0 s1 r g b a drag grav'.split(' ')) this[k] = new Float32Array(cap);
    this.pos = new Float32Array(cap * 3); this.col = new Float32Array(cap * 3); this.size = new Float32Array(cap); this.alpha = new Float32Array(cap);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(this.alpha, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 4, 0), 400);
    const mat = new THREE.ShaderMaterial({ uniforms: { uTex: { value: tex }, uScale: { value: 800 } }, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: true, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false; this.points.renderOrder = additive ? 30 : 20;
  }
  /** o：{ x, y, z, vx, vy, vz, life, s0, s1, r, g, b, a, drag, grav }，缺省为 0 */
  emit(o) {
    const i = this.n; this.n = (i + 1) % this.cap;
    for (const k of 'x y z vx vy vz life max s0 s1 r g b a drag grav'.split(' ')) this[k][i] = o[k] || 0;
    this.max[i] = o.life || 1;
  }
  update(dt) {
    const P = this;
    for (let i = 0; i < P.cap; i++) {
      if (P.life[i] <= 0) { P.alpha[i] = 0; continue; }
      P.life[i] -= dt;
      if (P.life[i] <= 0) { P.alpha[i] = 0; continue; }
      const dr = Math.exp(-P.drag[i] * dt);
      P.vx[i] *= dr; P.vz[i] *= dr; P.vy[i] = P.vy[i] * dr - P.grav[i] * dt;
      P.x[i] += P.vx[i] * dt; P.y[i] += P.vy[i] * dt; P.z[i] += P.vz[i] * dt;
      const k = 1 - P.life[i] / P.max[i];
      P.pos[i * 3] = P.x[i]; P.pos[i * 3 + 1] = P.y[i]; P.pos[i * 3 + 2] = P.z[i];
      P.size[i] = P.s0[i] + (P.s1[i] - P.s0[i]) * k;
      P.alpha[i] = P.a[i] * Math.min(1, k * 8) * (1 - k) * (1 - k * 0.3);
      P.col[i * 3] = P.r[i]; P.col[i * 3 + 1] = P.g[i]; P.col[i * 3 + 2] = P.b[i];
    }
    const g = this.points.geometry.attributes;
    g.position.needsUpdate = g.aColor.needsUpdate = g.aSize.needsUpdate = g.aAlpha.needsUpdate = true;
  }
  alive() { let n = 0; for (let i = 0; i < this.cap; i++) if (this.life[i] > 0) n++; return n; }
  clear() { this.life.fill(0); this.alpha.fill(0); this.n = 0; }
}

function burst(pool, n, fn) { for (let i = 0; i < n; i++) pool.emit(fn(i)); }
/** 在以 dir 为轴的锥里取一个方向 */
function cone(dir, spread, speed, out) {
  _v.set(dir[0], dir[1], dir[2]).normalize();
  _v2.set(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(spread);
  _v.add(_v2).normalize().multiplyScalar(speed);
  out[0] = _v.x; out[1] = _v.y; out[2] = _v.z;
  return out;
}

/**
 * @param {THREE.Group} root 特效挂在这个节点下（船的根节点）
 * @param {THREE.Material} decalMat 弹孔材质（可换成焦痕材质的实例）
 */
export function createEffects(root, vm = null) {
  const fxRoot = new THREE.Group(); fxRoot.name = 'fx'; root.add(fxRoot);
  const dot = dotTex(), glow = new Pool(1800, true, dot), smoke = new Pool(700, false, puffTex());
  fxRoot.add(glow.points, smoke.points);
  const vmGlow = vm ? new Pool(200, true, flashTex()) : null;                       // 玩家自己的枪口焰：跟枪模画在同一个场景里
  if (vmGlow) vm.root.add(vmGlow.points);

  // ———— 曳光 ————
  const tracers = [], TR_N = 48;
  const tracerMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 6, 2.6), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), TR_N);
  tracerMesh.frustumCulled = false; tracerMesh.renderOrder = 31; tracerMesh.count = 0;
  fxRoot.add(tracerMesh);

  // ———— 抛壳 ————
  const CASE_N = 40, cases = [];
  const caseMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0045, 0.005, 0.024, 6), new THREE.MeshStandardMaterial({ color: 0xc59a44, metalness: 1, roughness: 0.28, vertexColors: false }), CASE_N);
  caseMesh.frustumCulled = false; caseMesh.count = 0; caseMesh.castShadow = false;
  fxRoot.add(caseMesh);

  // ———— 弹孔 / 焦痕 ————
  const DEC_N = 240, decalMat = new THREE.MeshStandardMaterial({ map: holeTex(), transparent: true, depthWrite: false, roughness: 0.9, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const decalMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), decalMat, DEC_N);
  decalMesh.frustumCulled = false; decalMesh.count = 0; decalMesh.renderOrder = 5;
  fxRoot.add(decalMesh);
  const SC_N = 12, scorchMat = new THREE.MeshStandardMaterial({ map: scorchTex(), transparent: true, depthWrite: false, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const scorchMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), scorchMat, SC_N);
  scorchMesh.frustumCulled = false; scorchMesh.count = 0; scorchMesh.renderOrder = 4;
  fxRoot.add(scorchMesh);

  // ———— 灯：玩家枪口、附近机器人枪口、爆炸 ————
  const lights = [0, 1, 2].map(() => { const l = new THREE.PointLight(0xffb060, 0, 10, 2); l.castShadow = false; fxRoot.add(l); return l; });
  const boom = new THREE.PointLight(0xff9040, 0, 34, 2); fxRoot.add(boom);

  let decalI = 0, scorchI = 0, shake = 0, flash = 0, lightI = 0, flashI = 0;
  const api = {
    root: fxRoot, hide: [fxRoot],
    pools: { glow, smoke },
    /** 镜头受到的冲击（像素抖动量）和白闪（0..1），由游戏层读取 */
    shake: () => shake, flash: () => flash,

    tracer(from, to) {
      _v.set(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
      const len = _v.length();
      if (len < 1.2) return;
      _v.divideScalar(len);
      tracers.push({ x: from[0], y: from[1], z: from[2], dx: _v.x, dy: _v.y, dz: _v.z, len, head: 0.6 });
      if (tracers.length > TR_N) tracers.shift();
    },

    /** 枪口焰。near = 是不是玩家自己的枪（离镜头近，缩小一点免得糊住画面） */
    muzzle(x, y, z, dx, dy, dz, scale = 1, near = false) {
      const s = scale * (near ? 0.75 : 1);
      glow.emit({ x: x + dx * 0.04, y: y + dy * 0.04, z: z + dz * 0.04, life: 0.06, s0: 0.34 * s, s1: 0.12 * s, r: 22, g: 14, b: 5.5, a: 1 });
      glow.emit({ x: x + dx * 0.12, y: y + dy * 0.12, z: z + dz * 0.12, life: 0.07, s0: 0.16 * s, s1: 0.03 * s, r: 30, g: 19, b: 7, a: 1 });
      for (let i = 0; i < 6; i++) { const v = cone([dx, dy, dz], 0.4, rnd(2, 7), [0, 0, 0]); glow.emit({ x, y, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.05, 0.1), s0: 0.1 * s, s1: 0.02, r: 16, g: 9, b: 3, a: 1, drag: 6, grav: 4 }); }
      if (R() < 0.4) { const v = cone([dx, dy, dz], 0.6, rnd(0.5, 1.3), [0, 0, 0]); smoke.emit({ x: x + dx * 0.1, y: y + dy * 0.1, z: z + dz * 0.1, vx: v[0], vy: v[1] + 0.3, vz: v[2], life: rnd(0.4, 0.8), s0: 0.04, s1: 0.22, r: 0.5, g: 0.5, b: 0.5, a: 0.28, drag: 3, grav: -0.2 }); }
      const l = lights[lightI]; lightI = (lightI + 1) % lights.length;
      l.position.set(x + dx * 0.15, y + dy * 0.15, z + dz * 0.15); l.intensity = (near ? 16 : 55) * scale; l.distance = near ? 6 : 11;
    },

    /** 玩家自己的枪口焰（镜头坐标系）。照亮环境用的点光仍然由 muzzle() 放到船里 */
    muzzleVM(p, dir, scale = 1) {
      if (!vmGlow) return;
      const [x, y, z] = p, [dx, dy, dz] = dir;
      vmGlow.emit({ x: x + dx * 0.05, y: y + dy * 0.05, z: z + dz * 0.05, life: 0.05, s0: 0.17 * scale, s1: 0.09 * scale, r: 20, g: 13, b: 5.5, a: 1 });
      vmGlow.emit({ x: x + dx * 0.16, y: y + dy * 0.16, z: z + dz * 0.16, life: 0.06, s0: 0.10 * scale, s1: 0.03 * scale, r: 30, g: 18, b: 6.5, a: 1 });
      for (let i = 0; i < 7; i++) { const v = cone(dir, 0.33, rnd(2, 8), [0, 0, 0]); vmGlow.emit({ x, y, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.05, 0.11), s0: 0.02 * scale, s1: 0.004, r: 18, g: 10, b: 3.5, a: 1, drag: 5, grav: 4 }); }
      vm.flash.position.set(x - dx * 0.02, y, z - dz * 0.02); flashI = 0.22 * scale;
    },

    /** 弹着点。mat：steel / metal / wood / deck / flesh */
    impact(x, y, z, nx, ny, nz, mat, hole = true) {
      const n = [nx, ny, nz];
      if (mat === 'flesh') return;
      const sparks = mat === 'wood' ? 4 : 11, sc = mat === 'wood' ? [2.6, 1.4, 0.5] : [7, 3.6, 1.2];
      burst(glow, sparks, () => { const v = cone(n, 1.1, rnd(1.5, mat === 'wood' ? 4 : 8.5), [0, 0, 0]); return { x, y, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.18, 0.5), s0: 0.014, s1: 0.004, r: sc[0], g: sc[1], b: sc[2], a: 1, drag: 1.6, grav: 9.8 }; });
      burst(smoke, mat === 'wood' ? 3 : 4, () => { const v = cone(n, 0.9, rnd(0.4, 1.5), [0, 0, 0]); const c = mat === 'wood' ? [0.5, 0.37, 0.22] : [0.44, 0.44, 0.42]; return { x: x + nx * 0.02, y: y + ny * 0.02, z: z + nz * 0.02, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.4, 0.9), s0: 0.06, s1: 0.3, r: c[0], g: c[1], b: c[2], a: 0.5, drag: 3, grav: -0.25 }; });
      if (hole && Math.abs(ny) < 0.9) api.decal(decalMesh, decalI = (decalI + 1) % DEC_N, x + nx * 0.006, y + ny * 0.006, z + nz * 0.006, n, rnd(0.045, 0.06));
    },

    blood(x, y, z, dx, dy, dz, big) {
      burst(smoke, big ? 14 : 7, () => { const v = cone([dx, dy, dz], 0.9, rnd(0.8, big ? 4.2 : 2.6), [0, 0, 0]); return { x, y, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.25, 0.6), s0: 0.05, s1: 0.16, r: 0.34, g: 0.018, b: 0.016, a: 0.75, drag: 2.2, grav: 6 }; });
      burst(glow, big ? 5 : 2, () => { const v = cone([dx, dy, dz], 1.2, rnd(1, 3.5), [0, 0, 0]); return { x, y, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.2, 0.4), s0: 0.02, s1: 0.006, r: 1.6, g: 0.08, b: 0.06, a: 0.9, drag: 1, grav: 8 }; });
    },

    /** 抛壳：从枪的右侧抛出 */
    casing(x, y, z, right, fwd) {
      const c = { x, y, z, vx: right[0] * rnd(1.4, 2.6) + fwd[0] * rnd(-0.4, 0.6), vy: rnd(1.6, 2.8), vz: right[2] * rnd(1.4, 2.6) + fwd[2] * rnd(-0.4, 0.6), ax: rnd(-1, 1), ay: rnd(-1, 1), az: rnd(-1, 1), w: rnd(18, 34), rx: R() * 6, rz: R() * 6, life: 4, bounces: 0 };
      if (cases.length >= CASE_N) cases.shift();
      cases.push(c);
    },

    /** 在某个面上放一块贴花（弹孔 / 焦痕共用的摆法） */
    decal(mesh, i, x, y, z, n, size, roll = R() * PI * 2) {
      _v.set(n[0], n[1], n[2]).normalize();
      _q.setFromUnitVectors(_z, _v);
      _m.compose(_p.set(x, y, z), _q.multiply(new THREE.Quaternion().setFromAxisAngle(_z, roll)), _s.set(size, size, size));
      mesh.setMatrixAt(i, _m);
      mesh.count = Math.max(mesh.count, i + 1);
      mesh.instanceMatrix.needsUpdate = true;
    },

    explosion(x, y, z) {
      glow.emit({ x, y: y + 0.4, z, life: 0.13, s0: 3.2, s1: 6.5, r: 34, g: 20, b: 8, a: 1 });
      burst(glow, 18, () => { const v = cone([0, 0.4, 0], 1, rnd(1.5, 7), [0, 0, 0]); return { x, y: y + 0.3, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.3, 0.75), s0: 0.7, s1: 2.6, r: 7.5, g: 2.7, b: 0.7, a: 1, drag: 2.6, grav: -1.4 }; });
      burst(glow, 56, () => { const v = cone([0, 0.3, 0], 1, rnd(7, 25), [0, 0, 0]); return { x, y: y + 0.3, z, vx: v[0], vy: v[1], vz: v[2], life: rnd(0.45, 1.2), s0: 0.034, s1: 0.01, r: 10, g: 5.5, b: 1.6, a: 1, drag: 0.6, grav: 9.8 }; });
      burst(smoke, 24, () => { const a = R() * PI * 2, sp = rnd(0.6, 2.8); return { x: x + Math.cos(a) * 0.4, y: y + 0.2, z: z + Math.sin(a) * 0.4, vx: Math.cos(a) * sp, vy: rnd(1.2, 4), vz: Math.sin(a) * sp, life: rnd(2.4, 4.6), s0: 1.1, s1: 5.6, r: 0.065, g: 0.06, b: 0.056, a: 0.78, drag: 1.1, grav: -0.5 }; });
      burst(smoke, 18, () => { const a = R() * PI * 2, sp = rnd(5, 11.5); return { x, y: y + 0.15, z, vx: Math.cos(a) * sp, vy: rnd(0.2, 1.2), vz: Math.sin(a) * sp, life: rnd(0.7, 1.3), s0: 0.5, s1: 2.5, r: 0.46, g: 0.44, b: 0.41, a: 0.5, drag: 3, grav: 0.4 }; });
      boom.position.set(x, y + 0.8, z); boom.intensity = 1600;
      if (y < 1.6) api.decal(scorchMesh, scorchI = (scorchI + 1) % SC_N, x, 0.012, z, [0, 1, 0], rnd(3.4, 4.4));
    },

    stats: () => ({ tracers: tracers.length, cases: cases.length, decals: decalMesh.count, scorch: scorchMesh.count, glow: glow.alive(), vmGlow: vmGlow ? vmGlow.alive() : 0, smoke: smoke.alive(), lights: lights.filter((l) => l.intensity > 1).length }),
    /** 手雷 / 落地 / 受击的镜头冲击 */
    kick(amount, white = 0) { shake = Math.min(1.4, shake + amount); flash = Math.max(flash, white); },

    update(dt, fov, viewH, vmFov = fov) {
      const scale = viewH / (2 * Math.tan((fov * PI) / 360));
      glow.points.material.uniforms.uScale.value = scale; smoke.points.material.uniforms.uScale.value = scale;
      if (vmGlow) { vmGlow.points.material.uniforms.uScale.value = viewH / (2 * Math.tan((vmFov * PI) / 360)); vmGlow.update(dt); }
      if (vm && vmGlow) { flashI *= Math.exp(-dt * 46); vm.flash.intensity = flashI; }
      glow.update(dt); smoke.update(dt);
      for (const t of tracers) t.head += 420 * dt;
      for (let i = tracers.length - 1; i >= 0; i--) if (tracers[i].head - 6 > tracers[i].len) tracers.splice(i, 1);
      tracers.forEach((t, i) => {
        const a = Math.max(0, t.head - 6), b = Math.min(t.head, t.len), len = Math.max(b - a, 0.05), mid = a + len / 2;
        _v.set(t.dx, t.dy, t.dz);
        _q.setFromUnitVectors(_z, _v);
        const k = 1 - 0.55 * (mid / t.len);
        _m.compose(_p.set(t.x + t.dx * mid, t.y + t.dy * mid, t.z + t.dz * mid), _q, _s.set(0.011 * k, 0.011 * k, len));
        tracerMesh.setMatrixAt(i, _m);
      });
      tracerMesh.count = tracers.length;
      if (tracers.length) tracerMesh.instanceMatrix.needsUpdate = true;
      for (let i = cases.length - 1; i >= 0; i--) {
        const c = cases[i];
        c.life -= dt;
        if (c.life <= 0) { cases.splice(i, 1); continue; }
        c.vy -= 9.8 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
        if (c.y < 0.012 && c.vy < 0) {
          c.y = 0.012; c.vy = -c.vy * 0.36; c.vx *= 0.62; c.vz *= 0.62; c.w *= 0.55;
          if (++c.bounces > 2) { c.vx = c.vy = c.vz = 0; c.w = 0; c.rx = PI / 2; }
        }
        if (c.w) { c.rx += c.ax * c.w * dt; c.rz += c.az * c.w * dt; }
        _q.setFromEuler(_e.set(c.rx, c.ry, c.rz));
        const k = c.life < 0.4 ? c.life / 0.4 : 1;
        _m.compose(_p.set(c.x, c.y, c.z), _q, _s.set(k, k, k));
        caseMesh.setMatrixAt(cases.length - 1 - i, _m);
      }
      caseMesh.count = cases.length;
      if (cases.length) caseMesh.instanceMatrix.needsUpdate = true;
      for (const l of lights) if (l.intensity > 0.05) l.intensity *= Math.exp(-dt * 46); else l.intensity = 0;
      boom.intensity = boom.intensity > 0.5 ? boom.intensity * Math.exp(-dt * 7.5) : 0;
      shake *= Math.exp(-dt * 7); flash *= Math.exp(-dt * 9);
    },
    clear() { glow.clear(); smoke.clear(); if (vmGlow) { vmGlow.clear(); flashI = 0; vm.flash.intensity = 0; } tracers.length = 0; cases.length = 0; tracerMesh.count = caseMesh.count = 0; for (const l of lights) l.intensity = 0; boom.intensity = 0; shake = flash = 0; },
  };
  return api;
}
