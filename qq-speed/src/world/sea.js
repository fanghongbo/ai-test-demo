// 海面：覆盖到地平线的非均匀网格（城市边密、远处格子变大），顶点做方向波叠加；
// 片元里两层滚动的法线贴图 + 天空烘焙图 / 镜像相机画出来的倒影 + 菲涅耳 + 粲光 + 贴岸的浪花。
// 水色由离岸距离决定：岸边是浅绿松石色，远处是深海蓝。
import * as THREE from 'three';
import { waterNormalTexture } from '../gfx/datatex.js';
import { createPlanarReflection } from '../gfx/reflector.js';
import { EQUIRECT_GLSL, MOON_COLOR } from '../gfx/skyenv.js';
import { distToLand } from './landdef.js';

const NW = 5;
/** 波列：[振幅 m, 波长 m, 方向角°, 相位 rad] */
export const WAVES = Object.freeze([[0.11, 31, 24, 0.0], [0.06, 17, 70, 1.3], [0.035, 9.5, -22, 2.1], [0.02, 5.1, 118, 0.6], [0.012, 2.7, 40, 3.0]]);
const G = 9.81;
const params = WAVES.map(([A, L, dir, ph]) => ({ A, k: (2 * Math.PI) / L, w: Math.sqrt(G * (2 * Math.PI) / L) * 0.9, dx: Math.cos(dir * Math.PI / 180), dz: Math.sin(dir * Math.PI / 180), ph }));

const VERT = /* glsl */`
uniform vec4 uWaveA[ ${NW} ];
uniform vec2 uWaveD[ ${NW} ];
uniform float uTime, uAmp;
attribute float aShore;
varying vec3 vWorld;
varying vec3 vN;
varying float vShore;
varying float vViewZ;
void main() {
  vec3 p = position;
  float h = 0.0; vec2 slope = vec2( 0.0 );
  float att = uAmp * ( 1.0 - smoothstep( 160.0, 520.0, length( p.xz ) ) );        // 远处格子很大：顶点波衰减掉，只剩法线贴图的细节
  for ( int i = 0; i < ${NW}; i ++ ) {
    float th = uWaveA[ i ].y * dot( uWaveD[ i ], p.xz ) - uWaveA[ i ].z * uTime + uWaveA[ i ].w;
    float A = uWaveA[ i ].x * att, c = cos( th );
    h += A * sin( th );
    slope += uWaveD[ i ] * ( A * uWaveA[ i ].y * c );
  }
  p.y += h;
  vN = normalize( vec3( - slope.x, 1.0, - slope.y ) );
  vWorld = p; vShore = aShore;
  vec4 mv = modelViewMatrix * vec4( p, 1.0 );
  vViewZ = - mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */`
uniform float uTime, uAmp;
uniform sampler2D uSkyTex, uWaterN, uRefl, uNoiseTex;
uniform mat4 uReflMatrix;
uniform float uHasRefl, uFogDensity, uGlitterBoost;
uniform vec3 uKeyDir, uKeyCol, uSkyIrr, uFogL, uShallow, uDeep;
varying vec3 vWorld;
varying vec3 vN;
varying float vShore;
varying float vViewZ;
${ EQUIRECT_GLSL }
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float vnoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( hash2( i ), hash2( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash2( i + vec2( 0.0, 1.0 ) ), hash2( i + vec2( 1.0, 1.0 ) ), f.x ), f.y );
}
void main() {
  vec3 N = normalize( vN );
  vec3 V = normalize( cameraPosition - vWorld );
  float dist = length( cameraPosition - vWorld );
  float det = exp( - dist * 0.022 );
  vec2 p = vWorld.xz;
  vec3 n1 = texture2D( uWaterN, p * 0.085 + vec2( uTime * 0.012, uTime * 0.008 ) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( uWaterN, p * 0.37 + vec2( - uTime * 0.021, uTime * 0.027 ) ).xyz * 2.0 - 1.0;
  vec2 rip = ( n1.xy * 0.42 + n2.xy * 0.26 * ( 0.3 + 0.7 * det ) ) * uAmp;
  vec3 Nw = normalize( N + vec3( rip.x, 0.0, rip.y ) * mix( 0.5, 1.0, det ) );
  float ndv = max( dot( Nw, V ), 0.0 );
  float F = 0.02 + 0.98 * pow( 1.0 - ndv, 5.0 );
  vec3 R = reflect( - V, Nw );
  R.y = max( R.y, 0.012 );
  vec3 refl = texture2D( uSkyTex, equirectUv2( R ) ).rgb;
  if ( uHasRefl > 0.5 ) {
    vec4 rc = uReflMatrix * vec4( vWorld, 1.0 );
    vec2 ruv = rc.xy / rc.w + Nw.xz * 0.16 * clamp( 8.0 / dist, 0.2, 1.0 );
    refl = mix( refl, texture2D( uRefl, clamp( ruv, 0.003, 0.997 ) ).rgb, clamp( 90.0 / dist, 0.0, 1.0 ) );
  }
  // 水体：岸边浅、远处深，由天光与主光（太阳或月亮）照亮
  float deep = smoothstep( 2.0, 46.0, vShore );
  vec3 body = mix( uShallow, uDeep, deep ) * ( uSkyIrr + uKeyCol * 0.10 * max( uKeyDir.y, 0.0 ) );
  vec3 col = mix( body, refl, F );
  // 粲光：GGX 高光。粗糙度随距离变大，远处的高光带才不会闪烁
  vec3 H = normalize( uKeyDir + V );
  float ndh = max( dot( Nw, H ), 0.0 ), a = 0.06 + 0.10 * ( 1.0 - det ), a2 = a * a;
  float D = a2 / ( 3.14159 * pow( ndh * ndh * ( a2 - 1.0 ) + 1.0, 2.0 ) );
  col += uKeyCol * uGlitterBoost * min( D * 0.35, 10.0 ) * F * ( 0.25 + 0.75 * det ) / max( 4.0 * ndv, 0.08 );
  // 浪花：贴着岸线的一条白边，被噪声打碎、随时间起伏
  float fn = vnoise( vWorld.xz * 0.9 + vec2( uTime * 0.5, 0.0 ) ) * 0.6 + vnoise( vWorld.xz * 2.6 - vec2( uTime * 0.9, uTime * 0.2 ) ) * 0.4;
  float foam = ( 1.0 - smoothstep( 0.6, 3.4, vShore ) ) * smoothstep( 0.30, 0.72, fn + 0.18 * sin( uTime * 1.3 + vShore ) );
  float caps = smoothstep( 0.93, 0.99, vnoise( vWorld.xz * 0.03 + vec2( uTime * 0.03, uTime * 0.012 ) ) ) * 0.10;
  col = mix( col, ( uSkyIrr + uKeyCol * 0.22 ) * 0.55, clamp( foam + caps, 0.0, 1.0 ) );
  // 大气透视雾：与实体材质（three 的 FogExp2）同一个公式
  float f = 1.0 - exp( - uFogDensity * uFogDensity * vViewZ * vViewZ );
  col = mix( col, uFogL, f );
  gl_FragColor = vec4( col, 1.0 );
}
`;

/** 非均匀坐标轴：[lo, hi] 内均匀，外侧步长按 growth 增长到 max */
function axisCoords(lo, hi, step, growth = 1.4, max = 9000) {
  const n = Math.max(2, Math.ceil((hi - lo) / step));
  const mid = []; for (let i = 0; i <= n; i++) mid.push(lo + ((hi - lo) * i) / n);
  const side = (start, dir) => { const out = []; let s = step * 1.6, v = start; while (Math.abs(v) < max && out.length < 34) { v += dir * s; out.push(v); s *= growth; } return out; };
  return [...side(lo, -1).reverse(), ...mid, ...side(hi, 1)];
}

export function createSea(o = {}) {
  const step = o.step ?? 5;
  const xs = axisCoords(-420, 420, step), zs = axisCoords(-380, 380, step);
  const nx = xs.length, nz = zs.length;
  const pos = new Float32Array(nx * nz * 3), shore = new Float32Array(nx * nz), idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i; pos[k * 3] = xs[i]; pos[k * 3 + 2] = zs[j];
    shore[k] = Math.min(60, distToLand(xs[i], zs[j]));
  }
  let q = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aShore', new THREE.BufferAttribute(shore, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const uniforms = {
    uWaveA: { value: params.map((p) => new THREE.Vector4(p.A, p.k, p.w, p.ph)) },
    uWaveD: { value: params.map((p) => new THREE.Vector2(p.dx, p.dz)) },
    uTime: { value: 0 }, uAmp: { value: 1 },
    uSkyTex: { value: null }, uWaterN: { value: o.waterN ?? waterNormalTexture() }, uRefl: { value: null }, uNoiseTex: { value: null }, uReflMatrix: { value: new THREE.Matrix4() },
    uHasRefl: { value: 0 }, uFogDensity: { value: 0.0006 }, uGlitterBoost: { value: 1 },
    uKeyDir: { value: new THREE.Vector3(0, 1, 0) }, uKeyCol: { value: new THREE.Color() }, uSkyIrr: { value: new THREE.Color() },
    uShallow: { value: new THREE.Color(0.020, 0.150, 0.170) }, uDeep: { value: new THREE.Color(0.006, 0.040, 0.120) }, uFogL: { value: new THREE.Color() },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'sea'; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false;
  mesh.renderOrder = -10; mesh.position.y = o.y ?? 0;
  mesh.updateMatrix();
  const api = {
    mesh, uniforms, y: o.y ?? 0,
    bind(skyTex, noiseTex, renderer) {
      uniforms.uSkyTex.value = skyTex; uniforms.uNoiseTex.value = noiseTex;
      api.refl = createPlanarReflection(renderer, api.y);
      uniforms.uRefl.value = api.refl.texture; uniforms.uReflMatrix.value = api.refl.textureMatrix;
    },
    setLook(look, moonDir) {
      const m = look.isMoon;
      const dir = m ? moonDir : look.sunDir, col = m ? MOON_COLOR.map((c) => c * look.moonE) : look.sunT.map((c) => c * look.sunE);
      uniforms.uKeyDir.value.set(dir[0], dir[1], dir[2]);
      uniforms.uKeyCol.value.setRGB(col[0], col[1], col[2]);
      uniforms.uGlitterBoost.value = m ? 2.6 : 1;
      uniforms.uSkyIrr.value.setRGB(look.irr[0] / Math.PI, look.irr[1] / Math.PI, look.irr[2] / Math.PI);
      uniforms.uFogL.value.setRGB(...look.fog);
      uniforms.uFogDensity.value = look.fogDensity;
    },
    setQuality(l) {
      uniforms.uHasRefl.value = l >= 1 && api.refl ? 1 : 0;
      if (api.refl) api.refl.setSize([128, 256, 384][l]);
      uniforms.uAmp.value = l === 0 ? 0.85 : 1;
    },
    renderReflection(scene, camera, hide) { if (api.refl && uniforms.uHasRefl.value > 0.5) api.refl.update(scene, camera, hide); },
    update(time) { uniforms.uTime.value = time; },
  };
  return api;
}
