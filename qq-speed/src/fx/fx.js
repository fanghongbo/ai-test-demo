// 粒子（漂移的胎烟、蹭墙的火花、氮气的光点）和胎痕。
// 粒子是“无状态”的：每个实例只记出生点、初速度、出生时刻、寿命，位置全在顶点着色器里按时间算出来，
// CPU 每帧只往环形缓冲里写新粒子，不用更新任何矩阵。
import * as THREE from 'three';
import { ROAD_Y } from '../world/track.js';

const MAX = 1400;

const VERT = /* glsl */`
attribute vec3 aPos, aVel;
attribute vec4 aInfo;                                   // 出生时刻、寿命、尺寸、种类
uniform float uTime;
varying vec2 vUv;
varying vec3 vData;                                     // 年龄比例、种类、随机数
#include <fog_pars_vertex>
void main() {
  float age = uTime - aInfo.x, life = max( aInfo.y, 0.01 ), kind = aInfo.w, rnd = fract( aInfo.x * 7.31 );
  float t = clamp( age / life, 0.0, 1.0 );
  vec3 p = aPos;
  if ( kind < 0.5 ) { float k = 2.4; p += aVel * ( 1.0 - exp( - age * k ) ) / k; p.y += 0.35 * age; }     // 胎烟：很快减速、往上飘
  else if ( kind < 1.5 ) { p += aVel * age; p.y -= 4.9 * age * age; }                                       // 火花：抛物线
  else { p += aVel * age; }                                                                                // 光点：匀速
  float size = kind < 0.5 ? aInfo.z * ( 0.5 + 2.6 * t ) : kind < 1.5 ? aInfo.z * ( 1.0 - 0.7 * t ) : aInfo.z * ( 1.0 - 0.5 * t );
  vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
  mvPosition.xy += position.xy * size;
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv; vData = vec3( t, kind, rnd );
  #include <fog_vertex>
}`;

const FRAG = /* glsl */`
uniform sampler2D uMap;
uniform vec3 uSmoke, uWarm;
varying vec2 vUv;
varying vec3 vData;
#include <fog_pars_fragment>
void main() {
  float tex = texture2D( uMap, vUv ).a, t = vData.x, kind = vData.y, rnd = vData.z;
  vec3 col; float a;
  if ( kind < 0.5 ) {                                                             // 胎烟：白灰的团，越来越淡
    col = mix( uSmoke, uWarm, rnd * 0.6 ) * ( 0.85 + 0.3 * tex );
    a = tex * ( 1.0 - t ) * ( 1.0 - t ) * min( 1.0, t * 9.0 ) * 0.34;
  } else if ( kind < 1.5 ) {                                                      // 火花：很亮的橙黄
    col = mix( vec3( 1.0, 0.42, 0.08 ), vec3( 1.0, 0.96, 0.8 ), tex ) * 6.0;
    a = tex * ( 1.0 - t );
  } else {                                                                         // 氮气光点：青蓝
    col = mix( vec3( 0.25, 0.6, 1.0 ), vec3( 0.7, 0.95, 1.0 ), rnd ) * 4.0;
    a = tex * ( 1.0 - t ) * 0.8;
  }
  gl_FragColor = vec4( col, a );
  #include <fog_fragment>
}`;

class Pool {
  constructor(tex, additive, fog) {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    this.aPos = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aVel = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3).setUsage(THREE.DynamicDrawUsage);
    this.aInfo = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 4), 4).setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < MAX; i++) this.aInfo.array[i * 4] = -1e4;                   // 一开始都是“早就死了”的粒子
    geo.setAttribute('aPos', this.aPos); geo.setAttribute('aVel', this.aVel); geo.setAttribute('aInfo', this.aInfo);
    geo.instanceCount = MAX;
    this.uniforms = { uTime: { value: 0 }, uMap: { value: tex }, uSmoke: { value: new THREE.Color(0.62, 0.63, 0.66) }, uWarm: { value: new THREE.Color(0.82, 0.8, 0.78) } };
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, this.uniforms]), vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, fog, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.uniforms = mat.uniforms;
    this.head = 0; this.dirty = false; this.time = 0;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.frustumCulled = false; this.mesh.renderOrder = additive ? 7 : 5;
    this.mesh.name = additive ? 'sparks' : 'smoke';
  }
  emit(x, y, z, vx, vy, vz, life, size, kind) {
    const i = this.head; this.head = (i + 1) % MAX;
    this.aPos.array.set([x, y, z], i * 3); this.aVel.array.set([vx, vy, vz], i * 3); this.aInfo.array.set([this.time, life, size, kind], i * 4);
    this.dirty = true;
  }
  endFrame() {
    if (!this.dirty) return;
    for (const a of [this.aPos, this.aVel, this.aInfo]) a.needsUpdate = true;
    this.dirty = false;
  }
}

/**
 * 粒子系统 + 胎痕
 * @param {THREE.Texture} tex 一张边缘柔化的圆点贴图（alpha 通道）
 */
export function createFx(tex, fog = true) {
  const smoke = new Pool(tex, false, fog), glow = new Pool(tex, true, fog);
  const group = new THREE.Group();
  group.name = 'fx'; group.add(smoke.mesh, glow.mesh);

  // ——— 胎痕：一块环形缓冲的黑色四边形条带，过一分钟慢慢淡掉 ———
  const MAXQ = 5000, pos = new Float32Array(MAXQ * 12), birth = new Float32Array(MAXQ * 4), idx = new Uint32Array(MAXQ * 6);
  for (let q = 0; q < MAXQ; q++) { const v = q * 4; idx.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], q * 6); }
  const sg = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage), birthAttr = new THREE.BufferAttribute(birth, 1).setUsage(THREE.DynamicDrawUsage);
  birth.fill(-1e4);
  sg.setAttribute('position', posAttr); sg.setAttribute('aBirth', birthAttr); sg.setIndex(new THREE.BufferAttribute(idx, 1));
  sg.setDrawRange(0, 0);
  const skidMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
    vertexShader: 'attribute float aBirth; uniform float uTime; varying float vAge;\n#include <fog_pars_vertex>\nvoid main(){ vAge = uTime - aBirth; vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 ); gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: 'varying float vAge;\n#include <fog_pars_fragment>\nvoid main(){ float a = 0.62 * ( 1.0 - smoothstep( 45.0, 70.0, vAge ) ); if ( a <= 0.001 ) discard; gl_FragColor = vec4( 0.012, 0.012, 0.015, a );\n#include <fog_fragment>\n}',
    transparent: true, depthWrite: false, fog, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
  const skids = new THREE.Mesh(sg, skidMat);
  skids.frustumCulled = false; skids.renderOrder = 2; skids.name = 'skids';
  group.add(skids);
  let qHead = 0, qCount = 0, skidDirty = false;
  const trails = new Map();                                                      // 每辆车、每个后轮上一次留痕的位置

  const fx = {
    group, smoke, glow,
    /** 漂移、急刹、蹭墙时在车轮下留胎痕。key：车 + 轮子的名字；on：这一帧该不该留 */
    skid(key, x, z, on, width = 0.32) {
      const last = trails.get(key);
      if (!on) { trails.delete(key); return; }
      if (last) {
        const dx = x - last[0], dz = z - last[1], d = Math.hypot(dx, dz);
        if (d > 0.45) {
          if (d < 4) {
            const nx = (-dz / d) * width * 0.5, nz = (dx / d) * width * 0.5, q = qHead, y = ROAD_Y + 0.014;
            qHead = (qHead + 1) % MAXQ; qCount = Math.min(MAXQ, qCount + 1);
            pos.set([last[0] + nx, y, last[1] + nz, last[0] - nx, y, last[1] - nz, x + nx, y, z + nz, x - nx, y, z - nz], q * 12);
            birth.fill(fx.time, q * 4, q * 4 + 4);
            skidDirty = true;
          }
          trails.set(key, [x, z]);
        }
      } else trails.set(key, [x, z]);
    },
    time: 0,
    endFrame() {
      smoke.endFrame(); glow.endFrame();
      if (skidDirty) { posAttr.needsUpdate = true; birthAttr.needsUpdate = true; sg.setDrawRange(0, qCount * 6); skidDirty = false; }
    },
    update(time, light) {
      fx.time = time;
      smoke.time = glow.time = time;
      smoke.uniforms.uTime.value = glow.uniforms.uTime.value = skidMat.uniforms.uTime.value = time;
      smoke.uniforms.uSmoke.value.setRGB(0.62 * light[0], 0.63 * light[1], 0.66 * light[2]);
    },
  };
  return fx;
}
