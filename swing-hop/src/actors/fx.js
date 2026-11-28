// 粒子：落地扬起的土、进云海的白雾、完美落地时的星星、风暴狼身后的黑雾和电火花。
// 一池一池地管（圆点、星星各一池），每个粒子在 CPU 上算，画的时候是一批正对镜头的小片子。
import * as THREE from 'three';
import { dotTexture, starTexture, petalTexture } from '../gfx/textures.js';

const VERT = /* glsl */`
attribute vec3 iPos;
attribute vec4 iData;            // x：大小；y：透明度；z：旋转；w：不用
attribute vec3 iColor;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
	vUv = uv; vColor = iColor; vAlpha = iData.y;
	float c = cos( iData.z ), s = sin( iData.z );
	vec4 mv = modelViewMatrix * vec4( iPos, 1.0 );
	mv.xy += mat2( c, - s, s, c ) * position.xy * iData.x;
	gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */`
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
void main() {
	vec4 t = texture2D( uMap, vUv );
	float a = t.a * vAlpha;
	if ( a < 0.004 ) discard;
	gl_FragColor = vec4( vColor, a );
}`;

class Pool {
  constructor(scene, texture, count, { additive = false, order = 8 } = {}) {
    const base = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    this.pos = new Float32Array(count * 3);
    this.data = new Float32Array(count * 4);
    this.color = new Float32Array(count * 3);
    const dyn = (arr, n) => { const a = new THREE.InstancedBufferAttribute(arr, n); a.setUsage(THREE.DynamicDrawUsage); return a; };
    geo.setAttribute('iPos', dyn(this.pos, 3));
    geo.setAttribute('iData', dyn(this.data, 4));
    geo.setAttribute('iColor', dyn(this.color, 3));
    geo.instanceCount = count;
    const n = count;
    this.vel = new Float32Array(n * 3);
    this.age = new Float32Array(n); this.life = new Float32Array(n);
    this.s0 = new Float32Array(n); this.s1 = new Float32Array(n);
    this.rot = new Float32Array(n); this.rv = new Float32Array(n);
    this.grav = new Float32Array(n); this.drag = new Float32Array(n); this.tw = new Float32Array(n);
    this.swA = new Float32Array(n); this.swF = new Float32Array(n); this.swP = new Float32Array(n);
    this.alive = new Uint8Array(n);
    this.mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { uMap: { value: texture } }, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    }));
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = order;
    scene.add(this.mesh);
    this.count = n;
    this.next = 0;
  }

  spawn(o) {
    let i = -1;
    for (let k = 0; k < this.count; k++) {                       // 从上次的位置往后找空位
      const j = (this.next + k) % this.count;
      if (!this.alive[j]) { i = j; this.next = (j + 1) % this.count; break; }
    }
    if (i < 0) { i = this.next; this.next = (this.next + 1) % this.count; }
    this.alive[i] = 1;
    this.pos[i * 3] = o.x; this.pos[i * 3 + 1] = o.y; this.pos[i * 3 + 2] = o.z || 0;
    this.vel[i * 3] = o.vx || 0; this.vel[i * 3 + 1] = o.vy || 0; this.vel[i * 3 + 2] = o.vz || 0;
    this.age[i] = 0; this.life[i] = o.life || 0.6;
    this.s0[i] = o.size || 0.2; this.s1[i] = o.size1 ?? this.s0[i] * 0.3;
    this.rot[i] = Math.random() * 6.28; this.rv[i] = (Math.random() - 0.5) * (o.spin ?? 4);
    this.grav[i] = o.gravity ?? 0; this.drag[i] = o.drag ?? 1.5; this.tw[i] = o.twinkle ?? 0;
    this.swA[i] = o.sway ?? 0; this.swF[i] = o.swayF ?? 2; this.swP[i] = Math.random() * 6.28;
    this.color[i * 3] = o.r; this.color[i * 3 + 1] = o.g; this.color[i * 3 + 2] = o.b;
    return i;
  }

  step(dt) {
    for (let i = 0; i < this.count; i++) {
      if (!this.alive[i]) { this.data[i * 4 + 1] = 0; continue; }
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) { this.alive[i] = 0; this.data[i * 4 + 1] = 0; continue; }
      const k = this.age[i] / this.life[i], drag = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= drag; this.vel[i * 3 + 2] *= drag;
      this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * drag - this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt + Math.cos(this.age[i] * this.swF[i] + this.swP[i]) * this.swA[i] * dt;      // 一路打着圈往下飘
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.rot[i] += this.rv[i] * dt;
      this.data[i * 4] = this.s0[i] + (this.s1[i] - this.s0[i]) * k;
      const fade = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
      this.data[i * 4 + 1] = Math.max(0, fade) * (this.tw[i] ? 0.55 + 0.45 * Math.sin(this.age[i] * this.tw[i]) : 1);
      this.data[i * 4 + 2] = this.rot[i];
    }
    this.mesh.geometry.attributes.iPos.needsUpdate = true;
    this.mesh.geometry.attributes.iData.needsUpdate = true;
    this.mesh.geometry.attributes.iColor.needsUpdate = true;
  }

  clear() { this.alive.fill(0); this.data.fill(0); }
}

export class FX {
  constructor(scene) {
    this.dots = new Pool(scene, dotTexture(), 420);
    this.stars = new Pool(scene, starTexture(), 160, { additive: true, order: 9 });
    this.petals = new Pool(scene, petalTexture(), 60);
    this.dots.mesh.name = 'fx-dots'; this.stars.mesh.name = 'fx-stars'; this.petals.mesh.name = 'fx-petals';
    this.C = {
      dust: new THREE.Color('#FFF1D2'), cloud: new THREE.Color('#FFFFFF'), storm: new THREE.Color('#2A2650'),
      gold: new THREE.Color('#FFD75E'), white: new THREE.Color('#FFFFFF'), spark: new THREE.Color('#BFA6FF'), leaf: new THREE.Color('#8BDA6C'),
    };
  }

  // kind：dust 落地扬起的土；cloud 进云海的白雾；storm 风暴狼的黑雾
  puff(x, y, n, kind, spread = 1) {
    const c = this.C[kind] || this.C.dust, P = this.dots;
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI, sp = (0.5 + Math.random() * 1.4) * (kind === 'storm' ? 2.4 : 1) * spread;
      const big = kind === 'cloud' ? 5 : kind === 'storm' ? 2.4 : 1;
      P.spawn({
        x: x + (Math.random() - 0.5) * 0.3 * big, y: y + (Math.random() - 0.5) * 0.15, z: (Math.random() - 0.5) * 0.3,
        vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp * (kind === 'cloud' ? 1.6 : 0.8), vz: (Math.random() - 0.5) * 0.6,
        life: (0.4 + Math.random() * 0.35) * (kind === 'cloud' ? 2 : kind === 'storm' ? 1.3 : 1),
        size: (0.16 + Math.random() * 0.16) * big, size1: (0.34 + Math.random() * 0.2) * big, gravity: kind === 'cloud' ? -1.2 : 0.6, drag: 2.2,
        r: c.r, g: c.g, b: c.b,
      });
    }
  }

  sparkle(x, y, n, gold = false) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 2.4, warm = gold || Math.random() < 0.6;
      const c = warm ? this.C.gold : this.C.white;
      this.stars.spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.9 + 1.2, life: 0.5 + Math.random() * 0.4, size: 0.1 + Math.random() * 0.14, size1: 0.02, gravity: 3.5, drag: 1.2, twinkle: 22, r: c.r, g: c.g, b: c.b });
    }
  }

  // 风暴狼身上的：电火花（紫色的小星星）
  spark(x, y, z) {
    const c = this.C.spark;
    this.stars.spawn({ x: x + (Math.random() - 0.5) * 0.6, y: y + (Math.random() - 0.5) * 0.6, z, vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 1.2, life: 0.14 + Math.random() * 0.12, size: 0.1 + Math.random() * 0.1, size1: 0.03, gravity: 0, drag: 0, twinkle: 60, r: c.r, g: c.g, b: c.b });
  }

  // 风暴狼脚下拖着的一溜黑雾
  trail(x, y, z, vx) {
    this.dots.spawn({
      x: x + (Math.random() - 0.5) * 0.9, y: y + 0.1 + Math.random() * 0.5, z: z + (Math.random() - 0.5) * 0.5,
      vx: -vx * 0.15 + (Math.random() - 0.5) * 0.5, vy: 0.2 + Math.random() * 0.5, vz: (Math.random() - 0.5) * 0.4,
      life: 0.5 + Math.random() * 0.4, size: 0.25 + Math.random() * 0.2, size1: 0.7 + Math.random() * 0.3, gravity: -0.3, drag: 1.5,
      r: 0.07, g: 0.06, b: 0.16,
    });
  }

  // 风从右边吹过来，把花瓣或叶子吹过画面。pink：樱花树的粉花瓣，不然是绿叶
  petal(x, y, pink) {
    const c = pink ? new THREE.Color('#FBD0E0') : this.C.leaf;
    this.petals.spawn({ x, y, z: 0.5 + Math.random() * 0.5, vx: -0.7 - Math.random() * 0.7, vy: -0.12 - Math.random() * 0.1, vz: 0, life: 9, size: 0.1 + Math.random() * 0.07, size1: 0.1, gravity: 0.04, drag: 0, spin: 4, sway: 0.5, swayF: 1.8 + Math.random(), r: c.r, g: c.g, b: c.b });
  }

  step(dt, t) {
    this.dots.step(dt);
    this.stars.step(dt);
    this.petals.step(dt);
    void t;
  }

  clear() {
    this.dots.clear(); this.stars.clear(); this.petals.clear();
  }
}
