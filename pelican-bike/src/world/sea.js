// 海面：一张覆盖到地平线的非均匀网格（岛边密、远处分块变大），顶点做方向波叠加。
// 赛璐璐：片元里做色阶 + 岸沫 + 碎金；写实：水面法线贴图 + 天空 / 平面反射 + 菲涅尔 + 粲光 + 大气透视雾。
// CPU 端有同一套波高函数供水面漂浮物使用。
import * as THREE from 'three';
import { terrainHeight } from '../core/track.js';
import { DEG } from '../core/mathx.js';
import { waterNormalTexture } from '../gfx/datatex.js';
import { createPlanarReflection } from '../gfx/reflector.js';
import { EQUIRECT_GLSL, MOON_COLOR } from '../gfx/skyenv.js';

const NW = 5;
/** 波列：[振幅 m, 波长 m, 方向角°, 相位 rad] */
export const WAVES = Object.freeze([[0.20, 27, 18, 0.0], [0.13, 15, 64, 1.3], [0.075, 8.2, -28, 2.1], [0.045, 4.6, 112, 0.6], [0.03, 2.6, 38, 3.0]]);
const G = 9.81;
const params = WAVES.map(([A, L, dir, ph]) => ({ A, k: (2 * Math.PI) / L, w: Math.sqrt(G * (2 * Math.PI) / L) * 0.8, dx: Math.cos(dir * DEG), dz: Math.sin(dir * DEG), ph }));
export const MAX_AMP = WAVES.reduce((n, w) => n + w[0], 0);

/** 与着色器一致的波高（CPU）。depth：该处水深，浅水衰减 */
const smooth = (d) => { const x = Math.min(1, Math.max(0, d / 2.2)); return x * x * (3 - 2 * x); };
export function waveHeight(x, z, t, depth = 8) {
  const att = smooth(depth);
  let h = 0;
  for (const p of params) h += p.A * att * Math.sin(p.k * (p.dx * x + p.dz * z) - p.w * t + p.ph);
  return h;
}

const VERT = /* glsl */`
attribute float aDepth;
uniform vec4 uWaveA[ ${NW} ];      // x 振幅 y 波数 z 角频率 w 相位
uniform vec2 uWaveD[ ${NW} ];
uniform float uTime, uAmp;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;
varying float vH;
varying float vViewZ;
void main() {
  vec3 p = position;
  float att = smoothstep( 0.0, 2.2, aDepth ) * uAmp;
  float h = 0.0; vec2 slope = vec2( 0.0 ); vec2 dxz = vec2( 0.0 );
  for ( int i = 0; i < ${NW}; i ++ ) {
    float th = uWaveA[ i ].y * dot( uWaveD[ i ], p.xz ) - uWaveA[ i ].z * uTime + uWaveA[ i ].w;
    float A = uWaveA[ i ].x * att, c = cos( th );
    h += A * sin( th );
    slope += uWaveD[ i ] * ( A * uWaveA[ i ].y * c );
    dxz += uWaveD[ i ] * ( A * 0.35 * c );
  }
  p.x += dxz.x; p.z += dxz.y; p.y += h;
  vN = normalize( vec3( - slope.x, 1.0, - slope.y ) );
  vWorld = p; vDepth = aDepth; vH = h;
  vec4 mv = modelViewMatrix * vec4( p, 1.0 );
  vViewZ = - mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */`
uniform vec3 uDeep, uShallow, uFoam, uSpec, uSand, uSunDir, uGlitDir, uLitTint, uShadeTint, uFogColor, uPaper, uInk;
uniform float uTime, uFogNear, uFogFar, uGlitter, uMaxH, uStyle, uMode, uAmp;
// —— 写实 ——
uniform sampler2D uSkyTex, uWaterN, uRefl, uNoiseTex;
uniform mat4 uReflMatrix;
uniform float uHasRefl, uFogDensity, uFogMist, uGlitterBoost;
uniform vec3 uKeyDir, uKeyCol, uSkyIrr, uDeepL, uShallowL, uFogL, uFogSunL, uFogSunDir;
varying vec3 vWorld;
varying vec3 vN;
varying float vDepth;
varying float vH;
varying float vViewZ;
${ EQUIRECT_GLSL }
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float vnoise( vec2 p ) {
  vec2 i = floor( p ), f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( hash2( i ), hash2( i + vec2( 1.0, 0.0 ) ), f.x ), mix( hash2( i + vec2( 0.0, 1.0 ) ), hash2( i + vec2( 1.0, 1.0 ) ), f.x ), f.y );
}
// 写实海面：两层滚动的水面法线；反射 = 天空烘焙图（远处）/ 镜像相机画出来的倒影（近处）；菲涅尔决定反射与水色的比例
vec3 realSea( vec3 N0, vec3 V, float dist ) {
  vec2 p = vWorld.xz;
  float det = exp( - dist * 0.03 );
  vec3 n1 = texture2D( uWaterN, p * 0.19 + vec2( uTime * 0.010, uTime * 0.007 ) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( uWaterN, p * 0.63 + vec2( - uTime * 0.017, uTime * 0.023 ) ).xyz * 2.0 - 1.0;
  vec2 rip = ( n1.xy * 0.5 + n2.xy * 0.3 * ( 0.3 + 0.7 * det ) ) * uAmp;
  vec3 Nw = normalize( N0 + vec3( rip.x, 0.0, rip.y ) * mix( 0.5, 1.0, det ) );
  float ndv = max( dot( Nw, V ), 0.0 );
  float F = 0.02 + 0.98 * pow( 1.0 - ndv, 5.0 );
  vec3 R = reflect( - V, Nw );
  R.y = max( R.y, 0.012 );
  vec3 refl = texture2D( uSkyTex, equirectUv2( R ) ).rgb;
  if ( uHasRefl > 0.5 ) {
    vec4 rc = uReflMatrix * vec4( vWorld, 1.0 );
    vec2 ruv = rc.xy / rc.w + Nw.xz * 0.11 * clamp( 5.0 / dist, 0.2, 1.0 );
    refl = mix( refl, texture2D( uRefl, clamp( ruv, 0.003, 0.997 ) ).rgb, clamp( 70.0 / dist, 0.0, 1.0 ) );
  }
  // 水体：浅处透出沙底的青绿，深处是吸收后的深蓝；由天光与主光（太阳或月亮）照亮
  vec3 body = mix( uShallowL, uDeepL, smoothstep( 0.3, 5.5, vDepth ) );
  vec3 light = uSkyIrr + uKeyCol * 0.2 * max( uKeyDir.y, 0.0 );
  float crest = smoothstep( 0.35, 0.9, vH / uMaxH );
  vec3 col = mix( body * light * ( 1.0 + 0.6 * crest ), refl, F );
  // 粲光：GGX 高光。粗糙度随距离变大，远处的高光带才不会闪烁
  vec3 H = normalize( uKeyDir + V );
  float ndh = max( dot( Nw, H ), 0.0 ), a = 0.09 + 0.12 * ( 1.0 - det ), a2 = a * a;
  float D = a2 / ( 3.14159 * pow( ndh * ndh * ( a2 - 1.0 ) + 1.0, 2.0 ) );
  col += uKeyCol * uGlitterBoost * min( D * 0.5, 30.0 ) * F * ( 0.25 + 0.75 * det ) / max( 4.0 * ndv, 0.08 );
  // 岸沫：两条向岸推进的碎浪线 + 紧贴岸线的白边，再用噪声打碎
  float fn = vnoise( vWorld.xz * 0.22 + vec2( 0.0, uTime * 0.03 ) );
  float band = fract( vDepth * 1.25 - uTime * 0.42 + fn * 0.9 );
  float shore = 1.0 - smoothstep( 0.9, 2.6, vDepth );
  float foam = smoothstep( 0.80, 0.84, band ) * smoothstep( 0.10, 0.35, vDepth ) * shore;
  foam = max( foam, 1.0 - smoothstep( 0.0, 0.16, vDepth ) );
  foam = max( foam, step( 0.93, fn ) * ( 1.0 - smoothstep( 0.2, 1.2, vDepth ) ) * 0.6 );
  float fl = texture2D( uNoiseTex, vWorld.xz * 0.8 + vec2( uTime * 0.04, - uTime * 0.03 ) ).b;
  foam *= clamp( 0.35 + fl * 2.2 + foam * 0.6, 0.0, 1.0 );
  col = mix( col, ( uSkyIrr + uKeyCol * 0.2 ) * 0.9, clamp( foam, 0.0, 1.0 ) );
  // 大气透视雾：与实体材质同一个公式
  float fd = uFogDensity * ( 1.0 + uFogMist * exp( - max( vWorld.y, 0.0 ) / 7.0 ) );
  float f = 1.0 - exp( - fd * fd * vViewZ * vViewZ );
  vec3 fv = vWorld - cameraPosition; fv.y = 0.0;
  col = mix( col, mix( uFogL, uFogSunL, pow( max( dot( normalize( fv ), uFogSunDir ), 0.0 ), 5.0 ) ), f );
  return col;
}
void main() {
  vec3 N = normalize( vN );
  vec3 V = normalize( cameraPosition - vWorld );
  float dist = length( cameraPosition - vWorld );
  if ( uMode > 0.5 ) { gl_FragColor = vec4( realSea( N, V, dist ), 1.0 ); return; }
  // 细碎涟漪：纯视觉的高频法线扰动，随距离衰减以免远处闪烁
  float rip = exp( - dist * 0.012 );
  vec2 q = vWorld.xz * 1.7;
  float n1 = vnoise( q + vec2( uTime * 0.35, uTime * 0.2 ) ), n2 = vnoise( q * 1.3 - vec2( uTime * 0.3, uTime * 0.42 ) );
  N = normalize( N + vec3( ( n1 - 0.5 ) * 0.24 * rip, 0.0, ( n2 - 0.5 ) * 0.24 * rip ) );
  float ndl = dot( N, uSunDir );
  float lit = smoothstep( - 0.02, 0.04, ndl );
  vec3 base = mix( uShallow, uDeep, smoothstep( 0.5, 6.5, vDepth ) );
  base = mix( uSand, base, smoothstep( 0.02, 0.55, vDepth ) );                 // 极浅处透出沙底
  vec3 col = mix( base * uShadeTint, base * uLitTint, lit );
  col = mix( col, col * 1.10 + uFoam * 0.05, smoothstep( 0.55, 0.85, vH / uMaxH ) );   // 波峰提亮一档
  // 岸沫：两条向岸推进的碎浪线 + 紧贴岸线的白边
  float fn = vnoise( vWorld.xz * 0.22 + vec2( 0.0, uTime * 0.03 ) );
  float band = fract( vDepth * 1.25 - uTime * 0.42 + fn * 0.9 );
  float shore = 1.0 - smoothstep( 0.9, 2.6, vDepth );
  float foam = smoothstep( 0.80, 0.84, band ) * smoothstep( 0.10, 0.35, vDepth ) * shore;
  foam = max( foam, 1.0 - smoothstep( 0.0, 0.16, vDepth ) );
  foam = max( foam, step( 0.93, fn ) * ( 1.0 - smoothstep( 0.2, 1.2, vDepth ) ) * 0.6 );
  col = mix( col, uFoam, clamp( foam, 0.0, 1.0 ) );
  // 太阳 / 月光碎金：只在反射方向附近的高光带里，按格点断成一格格短划
  vec3 R = reflect( - V, N );
  float sg = pow( max( dot( R, uGlitDir ), 0.0 ), 140.0 );
  vec2 gcell = floor( vec2( vWorld.x * 2.4, vWorld.z * 0.7 ) + vec2( 0.0, uTime * 0.6 ) );
  float glint = smoothstep( 0.22, 0.9, sg ) * step( 0.70, hash2( gcell ) ) * ( 0.45 + 0.55 * hash2( gcell + 3.1 ) );
  col = mix( col, uSpec, clamp( glint * 1.7, 0.0, 1.0 ) * uGlitter * rip );
  // 画风：排线 = 淡彩；线稿 = 纸白，只留岸沫的墨线
  if ( uStyle > 1.5 ) col = mix( uPaper, uInk, foam * 0.55 );
  else if ( uStyle > 0.5 ) col = mix( col, uPaper, 0.42 );
  col = mix( col, uFogColor, smoothstep( uFogNear, uFogFar, vViewZ ) );
  gl_FragColor = vec4( col, 1.0 );
}
`;

/** 非均匀坐标轴：[lo, hi] 内均匀，外侧步长按 growth 增长到 max */
function axisCoords(lo, hi, step, growth = 1.38, max = 3400) {
  const n = Math.max(2, Math.ceil((hi - lo) / step));
  const mid = []; for (let i = 0; i <= n; i++) mid.push(lo + ((hi - lo) * i) / n);
  const side = (start, dir) => { const out = []; let s = step * 1.7, v = start; while (Math.abs(v) < max && out.length < 40) { v += dir * s; out.push(v); s *= growth; } return out; };
  return [...side(lo, -1).reverse(), ...mid, ...side(hi, 1)];
}

export function createSea(U, track, o = {}) {
  const B = track.bounds, margin = 34;
  const step = o.step ?? 2.6;
  const xs = axisCoords(B.minX - margin, B.maxX + margin, step), zs = axisCoords(B.minZ - margin, B.maxZ + margin, step);
  const nx = xs.length, nz = zs.length;
  const pos = new Float32Array(nx * nz * 3), dep = new Float32Array(nx * nz);
  const n = {};
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = xs[i], z = zs[j];
    pos[k * 3] = x; pos[k * 3 + 2] = z;
    let d = 6.5;                                      // 深度在 6.5 m 处饱和：网格内外颜色一致
    if (x > B.minX - margin && x < B.maxX + margin && z > B.minZ - margin && z < B.maxZ + margin) {
      const y = terrainHeight(track, x, z, n);
      d = Math.min(6.5, Math.max(0, -y));
    }
    dep[k] = d;
  }
  const idx = new Uint32Array((nx - 1) * (nz - 1) * 6);
  let q = 0;
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aDepth', new THREE.BufferAttribute(dep, 1));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const uniforms = {
    uWaveA: { value: params.map((p) => new THREE.Vector4(p.A, p.k, p.w, p.ph)) },
    uWaveD: { value: params.map((p) => new THREE.Vector2(p.dx, p.dz)) },
    uTime: U.uTime, uAmp: { value: 1 },
    uDeep: { value: new THREE.Color() }, uShallow: { value: new THREE.Color() }, uFoam: { value: new THREE.Color() }, uSpec: { value: new THREE.Color() }, uSand: { value: new THREE.Color() },
    uSunDir: U.uSunDir, uGlitDir: { value: new THREE.Vector3(0, 1, 0) }, uLitTint: U.uLitTint, uShadeTint: U.uShadeTint, uFogColor: U.uFogColor, uFogNear: U.uFogNear, uFogFar: U.uFogFar,
    uGlitter: { value: 0.8 }, uMaxH: { value: MAX_AMP }, uStyle: U.uStyle, uPaper: U.uPaper, uInk: U.uInk,
    // 写实
    uMode: U.uMode, uSkyTex: { value: null }, uWaterN: { value: waterNormalTexture() }, uRefl: { value: null }, uNoiseTex: { value: null }, uReflMatrix: { value: new THREE.Matrix4() },
    uHasRefl: { value: 0 }, uFogDensity: { value: 0.0007 }, uFogMist: { value: 0 }, uGlitterBoost: { value: 1 },
    uKeyDir: { value: new THREE.Vector3(0, 1, 0) }, uKeyCol: { value: new THREE.Color() }, uSkyIrr: { value: new THREE.Color() },
    uDeepL: { value: new THREE.Color(0.004, 0.028, 0.085) }, uShallowL: { value: new THREE.Color(0.06, 0.42, 0.40) },
    uFogL: { value: new THREE.Color() }, uFogSunL: { value: new THREE.Color() }, uFogSunDir: { value: new THREE.Vector3(0, 0, -1) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'sea'; mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = false;
  mesh.renderOrder = -10;
  const moon = new THREE.Vector3();
  let K = null, refl = null;
  const api = {
    mesh, uniforms,
    /** @param {THREE.Vector3} moonDir 用于夜间碎金 */
    applyPalette(p, sunDir, moonDir) {
      uniforms.uDeep.value.setRGB(...p.seaDeep); uniforms.uShallow.value.setRGB(...p.seaShallow);
      uniforms.uFoam.value.setRGB(...p.seaFoam); uniforms.uSpec.value.setRGB(...p.seaSpec); uniforms.uSand.value.setRGB(...p.sand);
      const sunUp = sunDir.y > 0.03;
      uniforms.uGlitDir.value.copy(sunUp ? sunDir : moonDir);
      uniforms.uGlitter.value = sunUp ? Math.min(1, p.sunDisc * 0.9 + 0.1) : p.moon * 0.7;
    },
    /** 接上写实渲染层：天空烘焙图、噪声贴图、平面反射 */
    enableReal(kit, renderer) {
      K = kit.K;
      uniforms.uSkyTex.value = K.sky.texture; uniforms.uNoiseTex.value = K.tex.noise;
      refl = createPlanarReflection(renderer, 0);
      uniforms.uRefl.value = refl.texture; uniforms.uReflMatrix.value = refl.textureMatrix;
    },
    /** 写实：每当时刻变化，同步主光、天光、雾 */
    applyReal(look) {
      const m = look.isMoon;
      const dir = m ? look.moonDir : look.sunDir, col = m ? MOON_COLOR.map((c) => c * look.moonE) : look.sunT.map((c) => c * look.sunE);
      uniforms.uKeyDir.value.set(dir[0], dir[1], dir[2]);
      uniforms.uKeyCol.value.setRGB(col[0], col[1], col[2]);
      uniforms.uGlitterBoost.value = m ? 2.6 : 1;
      uniforms.uSkyIrr.value.setRGB(look.irr[0] / Math.PI, look.irr[1] / Math.PI, look.irr[2] / Math.PI);
      uniforms.uFogL.value.setRGB(...look.fog); uniforms.uFogSunL.value.setRGB(...look.fogSun);
      uniforms.uFogDensity.value = look.fogDensity; uniforms.uFogMist.value = look.mist;
      if (K) uniforms.uFogSunDir.value.copy(K.uni.uFogSunDir.value);
    },
    /** 写实：用镜像相机把场景画进倒影贴图。低画质关掉，只反射天空 */
    setQuality(l) { uniforms.uHasRefl.value = l >= 1 && !!refl ? 1 : 0; if (refl) refl.setSize([256, 512, 512][l]); uniforms.uAmp.value = l === 0 ? 0.85 : 1; },
    renderReflection(scene, camera, hide) { if (refl && uniforms.uHasRefl.value > 0.5) refl.update(scene, camera, hide); },
    setQualityToon(l) { uniforms.uAmp.value = l === 0 ? 0.85 : 1; },
  };
  return api;
}
