// 云团：一片片总是正对镜头的软片子，按纵深分成三层——云面上的大团、岛后面的中层、很远的云堤；另有几朵贴着镜头飘过的前景。
// 都是真的三维位置，镜头往右走的时候各层快慢不一样，2.5D 的层次就从这儿来。
import * as THREE from 'three';
import { rng } from '../core/rng.js';
import { PAL } from '../core/palette.js';
import { CLOUD_Y } from '../core/course.js';
import { SHARED } from './toon.js';

const VERT = /* glsl */`
attribute vec3 iPos;
attribute vec4 iAux;            // x：大小；y：随机相位；z：化进雾色的程度；w：压扁的比例
uniform float uTime;
varying vec2 vUv;
varying float vHaze;
varying float vWy;              // 这一点在世界里的高度
void main() {
	float seed = iAux.y, c = cos( seed * 6.2832 ), s = sin( seed * 6.2832 );
	vec3 p = iPos + vec3( sin( uTime * 0.05 + seed * 6.2832 ) * 1.2, sin( uTime * 0.08 + seed * 9.0 ) * 0.12, 0.0 );
	vec4 mv = modelViewMatrix * vec4( p, 1.0 );
	vec2 q = position.xy * vec2( 1.0, iAux.w );
	mv.xy += mat2( c, - s, s, c ) * q * iAux.x;
	vWy = p.y + ( c * q.y - s * q.x ) * iAux.x;
	vUv = uv;
	vHaze = iAux.z;
	gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */`
uniform sampler2D uMap;
uniform vec3 uLit, uMid, uShade, uHaze, uWarm;
uniform float uOpacity, uFloor;
varying vec2 vUv;
varying float vHaze;
varying float vWy;
void main() {
	vec4 t = texture2D( uMap, vUv );
	float a = t.a * uOpacity;
	a *= smoothstep( uFloor, uFloor + 0.7, vWy );                             // 贴着云海面的高度淡出
	if ( a < 0.004 ) discard;
	float k1 = smoothstep( 0.14, 0.40, t.r ), k2 = smoothstep( 0.42, 0.72, t.r );
	vec3 col = mix( mix( uShade, uMid, k1 ), uLit, k2 );                     // 和场景一样，明暗分成柔和的两段
	col += uWarm * pow( t.r, 3.0 ) * 0.05;                                   // 最亮的顶上带一点暖
	col = mix( col, uHaze, vHaze );
	gl_FragColor = vec4( col, a );
}`;

export class Billboards {
  // floor：片子的下沿从这个世界高度开始淡出（-1e6 = 不淡出）。云海面是一块不透明的平面，片子伸到它下面会被拦腰切出一条直边；
  // 同一团云里各张片子远近略有不同，切口的高低就差几个像素，叠起来成了台阶。所以让片子在挨到云海面之前自己淡掉
  constructor({ texture, count, lit = PAL.cloudLit, mid = PAL.cloudMid, shade = PAL.cloudShade, haze = PAL.haze, warm = '#FFE2B0', opacity = 1, order = 6, floor = -1e6 }) {
    const base = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    this.pos = new Float32Array(count * 3);
    this.aux = new Float32Array(count * 4);
    this.aPos = new THREE.InstancedBufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aAux = new THREE.InstancedBufferAttribute(this.aux, 4).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('iPos', this.aPos);
    geo.setAttribute('iAux', this.aAux);
    geo.instanceCount = count;
    this.count = count;
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: texture }, uTime: SHARED.uTime, uOpacity: { value: opacity }, uFloor: { value: floor },
        uLit: { value: new THREE.Color(lit) }, uMid: { value: new THREE.Color(mid) }, uShade: { value: new THREE.Color(shade) }, uHaze: { value: new THREE.Color(haze) }, uWarm: { value: new THREE.Color(warm) },
      },
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, fog: false,
    });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = order;
    this.tmp = new THREE.Vector3();
    this.nextSort = 0;
  }

  set(i, x, y, z, scale, seed, haze, squash = 1) {
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.aux[i * 4] = scale; this.aux[i * 4 + 1] = seed; this.aux[i * 4 + 2] = haze; this.aux[i * 4 + 3] = squash;
  }

  commit() {
    this.aPos.needsUpdate = true;
    this.aAux.needsUpdate = true;
  }

  // 半透明的片子要从远到近画才叠得对：隔一会儿按离镜头的远近重排一次。返回新的顺序（每一格原来排在第几个），
  // 调用的一方要照着把自己的那份名单也换一遍，名单的第 i 项才还是缓冲区的第 i 格
  sort(camera, t) {
    if (t < this.nextSort) return null;
    this.nextSort = t + 0.3;
    const fwd = camera.getWorldDirection(this.tmp);
    const depth = [];
    for (let i = 0; i < this.count; i++) depth.push([this.pos[i * 3] * fwd.x + this.pos[i * 3 + 1] * fwd.y + this.pos[i * 3 + 2] * fwd.z, i]);
    depth.sort((a, b) => a[0] - b[0]);            // 视线方向：小的远
    const p2 = new Float32Array(this.count * 3), a2 = new Float32Array(this.count * 4), order = [];
    depth.forEach(([, src], k) => {
      p2.set(this.pos.subarray(src * 3, src * 3 + 3), k * 3);
      a2.set(this.aux.subarray(src * 4, src * 4 + 4), k * 4);
      order.push(src);
    });
    this.pos = p2; this.aux = a2;
    this.aPos.array = p2; this.aAux.array = a2;
    this.commit();
    return order;
  }
}

const SPAN = 280;
// 每一层：纵深、底面的高度、一团云的宽度、多少团、化进雾色的程度、从多高开始往下淡出（都贴着云海面 CLOUD_Y）
const LAYERS = [
  { z: [-34, -4], y: [CLOUD_Y - 1.3, CLOUD_Y - 0.7], w: [5, 9], clusters: 15, haze: [0.02, 0.1], shade: PAL.cloudShade, opacity: 0.96, order: 4, squash: 0.62, floor: CLOUD_Y },
  { z: [-70, -28], y: [-4.2, -0.8], w: [14, 26], clusters: 11, haze: [0.2, 0.4], shade: PAL.cloudShade, opacity: 0.93, order: 6, floor: CLOUD_Y + 0.1 },
  { z: [-240, -130], y: [-14, -4], w: [60, 110], clusters: 9, haze: [0.56, 0.76], shade: PAL.cloudMid, opacity: 0.9, order: 3, floor: CLOUD_Y + 0.1 },
];

// 一团积云：底是平的，顶是圆的，越靠中间越高、越大
function cumulus(r, ax, ay, az, w, L = {}) {
  const out = [], n = r.int(5, 9), tall = w * (0.4 + r() * 0.25) * (L.squash || 1);
  for (let k = 0; k < n; k++) {
    const u = n === 1 ? 0 : (k / (n - 1)) * 2 - 1, dome = Math.sqrt(Math.max(0, 1 - u * u * 0.85));
    out.push({
      ax, ay: ay + Math.max(0, dome - 0.3) * tall * r.range(0.6, 1.0), az: az + r.range(-0.25, 0.25) * w,
      dx: u * w * 0.34 * r.range(0.85, 1.05), dz: r.range(-0.12, 0.12) * w,
      // 贴图的轮廓缩进了方块里（边上不留硬边），片子要放大一点补回来
      s: w * (0.26 + 0.2 * dome) * r.range(0.85, 1.12) * 1.22,
      seed: r(), squash: L.squash ? L.squash * r.range(0.9, 1.1) : r.range(0.82, 1.0),
    });
  }
  return out;
}

const _fwd = new THREE.Vector3(), _right = new THREE.Vector3(), _up = new THREE.Vector3();
const lowWisp = (r) => -1.22 - r * 0.3;                  // 前景云离画面中线的距离：-1 是下沿，所以它大半个身子在画面外，只探进来一个头

export class Clouds {
  constructor(texture) {
    this.group = new THREE.Group();
    this.layers = [];
    this.camX = 0;
    for (const L of LAYERS) {
      const r = rng(L.clusters * 131 + 7);
      const specs = [];
      for (let c = 0; c < L.clusters; c++) {
        for (const s of cumulus(r, r() * SPAN, r.range(...L.y), r.range(...L.z), r.range(...L.w), L)) {
          s.haze = r.range(...L.haze);
          specs.push(s);
        }
      }
      const bb = new Billboards({ texture, count: specs.length, shade: L.shade, opacity: L.opacity, order: L.order, floor: L.floor });
      specs.forEach((s, i) => bb.set(i, s.ax + s.dx, s.ay, s.az + s.dz, s.s, s.seed, s.haze, s.squash));
      bb.commit();
      this.layers.push({ bb, specs });
      this.group.add(bb.mesh);
    }
    // 前景：贴着镜头飘过的几朵，位置按屏幕坐标定，只从画面下沿探进来一点（再高就会把秋千和狼罩白）
    this.near = new Billboards({ texture, count: 7, shade: PAL.cloudMid, opacity: 0.26, order: 20 });
    const rn = rng(77);
    this.nearSpec = Array.from({ length: 7 }, (_, k) => ({ u: (k / 7) * 3 - 1.5, v: lowWisp(rn()), depth: rn.range(4.4, 6.2), s: rn.range(1.5, 2.4) * 1.22, speed: rn.range(0.025, 0.06), seed: rn() }));
    this.near.commit();
    this.group.add(this.near.mesh);
  }

  // 镜头往右走，走出范围的云团整团挪到右边去接着用
  update(camera, t, dt) {
    const camX = camera.position.x, moved = camX - this.camX;
    for (const L of this.layers) {
      let dirty = false;
      for (let i = 0; i < L.specs.length; i++) {
        const s = L.specs[i];
        if (s.ax + s.dx < camX - SPAN / 2) { s.ax += SPAN; dirty = true; }
        else if (s.ax + s.dx > camX + SPAN / 2) { s.ax -= SPAN; dirty = true; }
        if (dirty || moved !== 0) L.bb.set(i, s.ax + s.dx, s.ay, s.az + s.dz, s.s, s.seed, s.haze, s.squash);
      }
      if (dirty || moved !== 0) L.bb.commit();
      const order = L.bb.sort(camera, t);
      if (order) L.specs = order.map((src) => L.specs[src]);
    }
    this.camX = camX;
    // 前景：自己往左飘，镜头往右走时它们相对地往后退；飘出画面就从右边回来
    const fwd = camera.getWorldDirection(_fwd);
    const right = _right.crossVectors(fwd, camera.up).normalize();
    const up = _up.crossVectors(right, fwd).normalize();
    const tanH = Math.tan((camera.fov * Math.PI) / 360), halfW = tanH * camera.aspect;
    const { x: cx, y: cy, z: cz } = camera.position;
    this.nearSpec.forEach((s, i) => {
      s.u -= s.speed * dt + moved * 0.12;
      if (s.u < -1.5) { s.u += 3.0; s.v = lowWisp(Math.random()); }
      const d = s.depth, ox = s.u * halfW * d, oy = s.v * tanH * d;
      this.near.set(i, cx + fwd.x * d + right.x * ox + up.x * oy, cy + fwd.y * d + right.y * ox + up.y * oy, cz + fwd.z * d + right.z * ox + up.z * oy, s.s, s.seed, 0, 0.7);
    });
    this.near.commit();
  }
}
