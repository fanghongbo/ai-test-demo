// 海面：覆盖到地平线的非均匀网格（船边密、远处格子变大），顶点做方向波叠加；
// 片元里两层滚动的法线贴图 + 天空烘焙图 / 镜像相机画出来的倒影 + 菲涅尔 + 粲光 + 贴着船壳的泡沫和船尾的尾流。
// 船在页面里不动：让波形和尾流朝着 -X 流过船体，看起来就像船在以 uShipV 的速度前进。
import * as THREE from 'three';
import { DEG } from '../core/mathx.js';
import { waterNormalTexture } from '../gfx/datatex.js';
import { createPlanarReflection } from '../gfx/reflector.js';
import { EQUIRECT_GLSL, MOON_COLOR } from '../gfx/skyenv.js';

const NW = 5;
/** 波列：[振幅 m, 波长 m, 方向角°, 相位 rad] */
export const WAVES = Object.freeze([[0.22, 38, 24, 0.0], [0.13, 19, 70, 1.3], [0.07, 10.5, -22, 2.1], [0.036, 5.4, 118, 0.6], [0.02, 2.9, 40, 3.0]]);
const G = 9.81;
const params = WAVES.map(([A, L, dir, ph]) => ({ A, k: (2 * Math.PI) / L, w: Math.sqrt(G * (2 * Math.PI) / L) * 0.85, dx: Math.cos(dir * DEG), dz: Math.sin(dir * DEG), ph }));
const SHIP_V = 7.5, HL = 66, HB = 11.2;      // 航速（米/秒）、船体半长、半宽

const VERT = /* glsl */`
uniform vec4 uWaveA[ ${NW} ];
uniform vec2 uWaveD[ ${NW} ];
uniform float uTime, uAmp;
varying vec3 vWorld;
varying vec3 vN;
varying float vH;
varying float vViewZ;
void main() {
  vec3 p = position;
  vec2 q = p.xz + vec2( uTime * ${ SHIP_V.toFixed( 1 ) }, 0.0 );
  float h = 0.0; vec2 slope = vec2( 0.0 );
  float att = uAmp * ( 1.0 - smoothstep( 60.0, 240.0, length( p.xz ) ) );        // 远处格子很大：顶点波衰减掉，只剩法线贴图的细节
  for ( int i = 0; i < ${NW}; i ++ ) {
    float th = uWaveA[ i ].y * dot( uWaveD[ i ], q ) - uWaveA[ i ].z * uTime + uWaveA[ i ].w;
    float A = uWaveA[ i ].x * att, c = cos( th );
    h += A * sin( th );
    slope += uWaveD[ i ] * ( A * uWaveA[ i ].y * c );
  }
  p.y += h;
  vN = normalize( vec3( - slope.x, 1.0, - slope.y ) );
  vWorld = p; vH = h;
  vec4 mv = modelViewMatrix * vec4( p, 1.0 );
  vViewZ = - mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */`
uniform float uTime, uAmp;
uniform sampler2D uSkyTex, uWaterN, uRefl, uNoiseTex;
uniform mat4 uReflMatrix;
uniform float uHasRefl, uFogDensity, uGlitterBoost, uFoam, uMaxH;
uniform vec3 uKeyDir, uKeyCol, uSkyIrr, uDeepL, uFogL, uBodyL;
varying vec3 vWorld;
varying vec3 vN;
varying float vH;
varying float vViewZ;
${ EQUIRECT_GLSL }
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float vnoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( hash2( i ), hash2( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash2( i + vec2( 0.0, 1.0 ) ), hash2( i + vec2( 1.0, 1.0 ) ), f.x ), f.y );
}
// 船壳平面轮廓的半宽（与 world/ship.js 的船型一致）
float hullBeam( float x ) {
  float ax = abs( x );
  if ( ax < 40.0 ) return ${ HB.toFixed( 1 ) };
  if ( x > 0.0 ) return ${ HB.toFixed( 1 ) } * sqrt( max( 0.0, 1.0 - pow( ( x - 40.0 ) / 26.0, 2.0 ) ) );
  return ${ HB.toFixed( 1 ) } * ( 1.0 - pow( min( ( - x - 40.0 ) / 26.0, 1.0 ), 2.0 ) * 0.55 );
}
void main() {
  vec3 N = normalize( vN );
  vec3 V = normalize( cameraPosition - vWorld );
  float dist = length( cameraPosition - vWorld );
  float det = exp( - dist * 0.03 );
  vec2 p = vWorld.xz + vec2( uTime * ${ SHIP_V.toFixed( 1 ) }, 0.0 );
  vec3 n1 = texture2D( uWaterN, p * 0.11 + vec2( uTime * 0.010, uTime * 0.007 ) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( uWaterN, p * 0.47 + vec2( - uTime * 0.017, uTime * 0.023 ) ).xyz * 2.0 - 1.0;
  vec2 rip = ( n1.xy * 0.55 + n2.xy * 0.32 * ( 0.3 + 0.7 * det ) ) * uAmp;
  vec3 Nw = normalize( N + vec3( rip.x, 0.0, rip.y ) * mix( 0.5, 1.0, det ) );
  float ndv = max( dot( Nw, V ), 0.0 );
  float F = 0.02 + 0.98 * pow( 1.0 - ndv, 5.0 );
  vec3 R = reflect( - V, Nw );
  R.y = max( R.y, 0.012 );
  vec3 refl = texture2D( uSkyTex, equirectUv2( R ) ).rgb;
  if ( uHasRefl > 0.5 ) {
    vec4 rc = uReflMatrix * vec4( vWorld, 1.0 );
    vec2 ruv = rc.xy / rc.w + Nw.xz * 0.13 * clamp( 6.0 / dist, 0.2, 1.0 );
    refl = mix( refl, texture2D( uRefl, clamp( ruv, 0.003, 0.997 ) ).rgb, clamp( 60.0 / dist, 0.0, 1.0 ) );
  }
  // 水体：深海的蓝，由天光与主光（太阳或月亮）照亮；迎光的波峰略亮
  float crest = smoothstep( 0.30, 0.9, vH / uMaxH );
  vec3 body = uBodyL * ( uSkyIrr + uKeyCol * 0.10 * max( uKeyDir.y, 0.0 ) ) * ( 1.0 + 0.5 * crest );
  vec3 col = mix( body, refl, F );
  // 粲光：GGX 高光。粗糙度随距离变大，远处的高光带才不会闪烁
  vec3 H = normalize( uKeyDir + V );
  float ndh = max( dot( Nw, H ), 0.0 ), a = 0.07 + 0.10 * ( 1.0 - det ), a2 = a * a;
  float D = a2 / ( 3.14159 * pow( ndh * ndh * ( a2 - 1.0 ) + 1.0, 2.0 ) );
  col += uKeyCol * uGlitterBoost * min( D * 0.35, 10.0 ) * F * ( 0.25 + 0.75 * det ) / max( 4.0 * ndv, 0.08 );
  // 泡沫：贴着船壳的一条白边（船头最旺）+ 船尾拖出去、慢慢散开的尾流 + 零星白浪
  float fn = vnoise( vWorld.xz * 0.55 + vec2( uTime * 0.9, 0.0 ) ) * 0.6 + vnoise( vWorld.xz * 1.7 - vec2( uTime * 1.3, uTime * 0.2 ) ) * 0.4;
  float off = max( abs( vWorld.z ) - hullBeam( vWorld.x ), 0.0 );
  float along = abs( vWorld.x );
  // 水线泡沫：贴着船壳约 1 m 宽的一条，被噪声打碎，船头最旺
  float hullFoam = exp( - off * 2.4 ) * ( 1.0 - smoothstep( 62.0, 70.0, along ) ) * ( 0.40 + 0.60 * smoothstep( 20.0, 62.0, vWorld.x ) ) * smoothstep( 0.22, 0.60, fn );
  // 尾流：船尾拖出去、慢慢变宽散开的湍流带
  float stern = max( - 64.0 - vWorld.x, 0.0 );
  float wakeW = 4.2 + stern * 0.085;
  float wake = ( 1.0 - smoothstep( wakeW * 0.35, wakeW, abs( vWorld.z ) ) ) * exp( - stern * 0.0032 ) * step( vWorld.x, - 63.0 ) * smoothstep( 0.30, 0.72, fn );
  float caps = smoothstep( 0.90, 0.985, vnoise( vWorld.xz * 0.03 + vec2( uTime * 0.03, uTime * 0.012 ) ) ) * 0.16;
  float foam = clamp( ( hullFoam * 0.8 + wake * 0.7 + caps ) * uFoam, 0.0, 1.0 );
  vec3 foamCol = ( uSkyIrr + uKeyCol * 0.22 ) * 0.5;
  col = mix( col, foamCol, foam );
  // 大气透视雾：与实体材质（three 的 FogExp2）同一个公式
  float f = 1.0 - exp( - uFogDensity * uFogDensity * vViewZ * vViewZ );
  col = mix( col, uFogL, f );
  gl_FragColor = vec4( col, 1.0 );
}
`;

/** 非均匀坐标轴：[lo, hi] 内均匀，外侧步长按 growth 增长到 max */
function axisCoords(lo, hi, step, growth = 1.38, max = 7400) {
  const n = Math.max(2, Math.ceil((hi - lo) / step));
  const mid = []; for (let i = 0; i <= n; i++) mid.push(lo + ((hi - lo) * i) / n);
  const side = (start, dir) => { const out = []; let s = step * 1.7, v = start; while (Math.abs(v) < max && out.length < 40) { v += dir * s; out.push(v); s *= growth; } return out; };
  return [...side(lo, -1).reverse(), ...mid, ...side(hi, 1)];
}

export function createSea(o = {}) {
  const step = o.step ?? 2.8;
  const xs = axisCoords(-130, 130, step), zs = axisCoords(-110, 110, step);
  const nx = xs.length, nz = zs.length;
  const pos = new Float32Array(nx * nz * 3), idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i; pos[k * 3] = xs[i]; pos[k * 3 + 2] = zs[j]; }
  let q = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const uniforms = {
    uWaveA: { value: params.map((p) => new THREE.Vector4(p.A, p.k, p.w, p.ph)) },
    uWaveD: { value: params.map((p) => new THREE.Vector2(p.dx, p.dz)) },
    uTime: { value: 0 }, uAmp: { value: 1 }, uMaxH: { value: WAVES.reduce((n, w) => n + w[0], 0) },
    uSkyTex: { value: null }, uWaterN: { value: o.waterN ?? waterNormalTexture() }, uRefl: { value: null }, uNoiseTex: { value: null }, uReflMatrix: { value: new THREE.Matrix4() },
    uHasRefl: { value: 0 }, uFogDensity: { value: 0.0007 }, uGlitterBoost: { value: 1 }, uFoam: { value: 1 },
    uKeyDir: { value: new THREE.Vector3(0, 1, 0) }, uKeyCol: { value: new THREE.Color() }, uSkyIrr: { value: new THREE.Color() },
    uDeepL: { value: new THREE.Color(0.004, 0.028, 0.085) }, uBodyL: { value: new THREE.Color(0.010, 0.052, 0.120) },
    uFogL: { value: new THREE.Color() },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'sea'; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false;
  mesh.renderOrder = -10; mesh.position.y = o.y ?? 0;                       // 海面在吃水线上（甲板面以下 9.6 m）
  mesh.updateMatrix();
  const moon = new THREE.Vector3();
  const api = {
    mesh, uniforms, y: o.y ?? 0,
    /** 接上天空烘焙图、噪声贴图、平面反射 */
    bind(skyTex, noiseTex, renderer) {
      uniforms.uSkyTex.value = skyTex; uniforms.uNoiseTex.value = noiseTex;
      api.refl = createPlanarReflection(renderer, api.y);
      uniforms.uRefl.value = api.refl.texture; uniforms.uReflMatrix.value = api.refl.textureMatrix;
    },
    /** 每当时刻变化，同步主光、天光、雾 */
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
      if (api.refl) api.refl.setSize([192, 384, 512][l]);
      uniforms.uAmp.value = l === 0 ? 0.85 : 1;
    },
    renderReflection(scene, camera, hide) { if (api.refl && uniforms.uHasRefl.value > 0.5) api.refl.update(scene, camera, hide); },
    update(time) { uniforms.uTime.value = time; },
  };
  return api;
}
