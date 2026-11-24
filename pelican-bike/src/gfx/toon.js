// Toon 渲染核心：共享环境 uniforms、三阶赛璐璐材质、反面外扩描边、顶点色合批。
// 颜色约定：ColorManagement 保持开启，所有颜色（uniform、顶点色、贴图）都以线性空间存储——这是物理渲染（写实时风格）的前提。
// 赛璐璐的色阶混合则必须在显示色域完成（阴影 = 固有色色相偏移，而非灰度相乘），所以这份着色器在入口把固有色转回显示色域，
// 在显示色域里做全部光照，再原样输出（renderer.outputColorSpace = LinearSRGB，即不做输出转换）。
// 调色盘里的“色调乘子”（uLitTint、uShadeTint、雾色、墨色…）是显示色域的数值，用 setRGB 直接写入、不做转换。
import * as THREE from 'three';
import { classFor } from './pbrclass.js';

export const MAX_EXTRA_LIGHTS = 4;

/** 全场景共享的 uniforms（同一对象引用被所有材质共享，改一次全场景生效） */
export function createToonEnv() {
  const arr3 = () => Array.from({ length: MAX_EXTRA_LIGHTS }, () => new THREE.Vector3());
  const U = {
    uSunDir: { value: new THREE.Vector3(0.3, 0.8, 0.5) },
    uLitTint: { value: new THREE.Color(1, 1, 1) },
    uShadeTint: { value: new THREE.Color(0.6, 0.66, 0.95) },
    uCoreTint: { value: new THREE.Color(0.8, 0.8, 0.93) },
    uRimDir: { value: new THREE.Vector3(-0.3, 0.2, -0.9) },
    uRimColor: { value: new THREE.Color(1, 1, 1) },
    uRimStrength: { value: 0.4 },
    uHiColor: { value: new THREE.Color(1, 1, 1) },
    uTerminator: { value: 0.22 },
    uCoreStart: { value: -0.28 },
    uInk: { value: new THREE.Color(0.13, 0.12, 0.26) },
    uFogColor: { value: new THREE.Color(0.76, 0.9, 0.97) },
    uFogNear: { value: 70 },
    uFogFar: { value: 520 },
    uStyle: { value: 0 },
    uPaper: { value: new THREE.Color(0.985, 0.965, 0.91) },
    uTime: { value: 0 },
    uWindDir: { value: new THREE.Vector3(0.8, 0, 0.6).normalize() },
    uWindStrength: { value: 1 },
    uLampLevel: { value: 0 },
    uLampColor: { value: new THREE.Color(1, 0.84, 0.56) },
    uLightsPos: { value: arr3() },
    uLightsDir: { value: arr3() },
    uLightsColor: { value: Array.from({ length: MAX_EXTRA_LIGHTS }, () => new THREE.Color(1, 1, 1)) },
    uLightsParam: { value: Array.from({ length: MAX_EXTRA_LIGHTS }, () => new THREE.Vector4(1, 0, 0, 0)) }, // x cos内, y cos外, z 强度, w 范围(0=关)
    uPixelRatio: { value: 1 },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uCamScale: { value: 1 },
    uMode: { value: 0 },                                                   // 0 = 赛璐璐，1 = 写实（物理渲染）
    uBeamK: { value: 1 },                                                  // 写实：体积光束的亮度系数 = 1.6 / 曝光（曝光高的夜景里光束才不会过曝）
    uFogColorL: { value: new THREE.Color(0.45, 0.62, 0.85) },              // 写实风格的雾色（线性）与指数雾密度
    uFogDensity: { value: 0.0022 },
    uOutlinePx: { value: 1.6 },
    uOutlineMul: { value: 1 },
    uFadeNear: { value: 26 },
    uFadeFar: { value: 95 },
  };
  return U;
}
export const SHARED_KEYS = Object.keys(createToonEnv());

// 显示色域(sRGB) ↔ 线性：与 three 的 Color / 贴图解码保持同一条曲线
const SRGB_FN = /* glsl */`
vec3 srgbOETF( vec3 c ) { c = max( c, vec3( 0.0 ) ); return mix( c * 12.92, 1.055 * pow( c, vec3( 1.0 / 2.4 ) ) - 0.055, step( vec3( 0.0031308 ), c ) ); }
vec3 srgbEOTF( vec3 c ) { return mix( c / 12.92, pow( ( c + 0.055 ) / 1.055, vec3( 2.4 ) ), step( vec3( 0.04045 ), c ) ); }
`;

const TOON_VERT = /* glsl */`
#include <common>
#include <batching_pars_vertex>
#include <shadowmap_pars_vertex>
attribute vec4 aMat;    // x 高光强度 y 高光尺寸 z 夜间自发光掩码 w 关闭边缘光
attribute vec2 aSway;   // x 摆动权重 y 相位
uniform float uTime;
uniform vec3 uWindDir;
uniform float uWindStrength;
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vAlbedo;
varying vec4 vMat;
varying vec2 vUvR;
varying float vViewZ;
void main() {
  vUvR = uv;
  #ifdef USE_COLOR
    vAlbedo = color;
  #else
    vAlbedo = vec3( 1.0 );
  #endif
  vMat = aMat;
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  if ( aSway.x > 0.0 ) {
    float ph = uTime * 1.25 + aSway.y + position.x * 0.07 + position.z * 0.05;
    float g = sin( ph ) * 0.6 + sin( ph * 2.17 + 1.3 ) * 0.4;
    transformed += uWindDir * ( g * 0.55 + 0.35 ) * aSway.x * uWindStrength * 0.5;
    transformed.y -= abs( g ) * aSway.x * uWindStrength * 0.12;
  }
  #include <project_vertex>
  // worldPosition 同时供 <shadowmap_vertex> 使用
  vec4 worldPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    worldPosition = batchingMatrix * worldPosition;
  #endif
  #ifdef USE_INSTANCING
    worldPosition = instanceMatrix * worldPosition;
  #endif
  worldPosition = modelMatrix * worldPosition;
  vWorldPos = worldPosition.xyz;
  vNormalW = inverseTransformDirection( transformedNormal, viewMatrix );
  vViewZ = - mvPosition.z;
  #include <shadowmap_vertex>
}
`;

const TOON_FRAG = /* glsl */`
#include <common>
#include <packing>
uniform bool receiveShadow;
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
uniform vec3 uColor;
uniform float uOpacity;
uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uEmissive;
uniform vec4 uSpec;          // x 强度 y 尺寸(0..1)
uniform float uEmissiveLevel;
uniform float uAlphaTest;
uniform float uRimMul;
uniform vec3 uSunDir, uLitTint, uShadeTint, uCoreTint, uRimDir, uRimColor, uHiColor, uInk, uFogColor, uPaper, uLampColor;
uniform float uRimStrength, uTerminator, uCoreStart, uStyle, uLampLevel, uFogNear, uFogFar, uPixelRatio;
uniform vec3 uLightsPos[ ${MAX_EXTRA_LIGHTS} ];
uniform vec3 uLightsDir[ ${MAX_EXTRA_LIGHTS} ];
uniform vec3 uLightsColor[ ${MAX_EXTRA_LIGHTS} ];
uniform vec4 uLightsParam[ ${MAX_EXTRA_LIGHTS} ];
varying vec3 vWorldPos;
varying vec3 vNormalW;
varying vec3 vAlbedo;
varying vec4 vMat;
varying vec2 vUvR;
varying float vViewZ;
// 带导数抗锯齿的色阶边界：边缘宽度随屏幕导数自适应，斜面上也不会出现锯齿
${ SRGB_FN }
float aaBand( float edge, float x ) {
  float w = fwidth( x ) * 0.7 + 0.0035;
  return smoothstep( edge - w, edge + w, x );
}
// 屏幕空间排线：ang 方向、freq 线/px
float hatchLine( vec2 p, float ang, float freq ) {
  vec2 d = vec2( cos( ang ), sin( ang ) );
  float v = dot( p, d ) * freq;
  float f = fract( v );
  float w = fwidth( v ) * 0.7 + 0.002;
  return 1.0 - smoothstep( 0.46 - w, 0.46 + w, f );
}
void main() {
  vec3 N = normalize( vNormalW );
  #ifdef DOUBLE_SIDED
    N *= gl_FrontFacing ? 1.0 : -1.0;
  #endif
  vec3 V = normalize( cameraPosition - vWorldPos );
  // 固有色以线性空间存储；赛璐璐的色阶要在显示色域里混合，所以先转回显示色域
  vec3 baseL = uColor * vAlbedo;
  // sRGB 贴图由 GPU 的 sRGB 像素格式在采样时自动解码，这里拿到的已经是线性值
  if ( uUseMap > 0.5 ) { vec4 tex = texture2D( uMap, vUvR ); baseL *= tex.rgb; if ( tex.a < uAlphaTest ) discard; }
  vec3 base = srgbOETF( baseL );

  // —— 主光：N·L × 阴影贴图 → 三阶 ——
  float ndl = dot( N, uSunDir );
  float shadow = getShadowMask();
  float lit = ndl * mix( 1.0, shadow, step( 0.0, ndl ) );
  float t1 = aaBand( uTerminator, lit );
  float t0 = aaBand( uCoreStart, lit );
  vec3 colL = base * uLitTint;
  vec3 colS = base * uShadeTint;
  vec3 colC = colS * uCoreTint;
  vec3 col = mix( mix( colC, colS, t0 ), colL, t1 );

  if ( uStyle > 0.5 ) {
    vec2 hp = gl_FragCoord.xy / uPixelRatio;
    float level = ( 1.0 - t1 ) * mix( 1.0, 0.3, t0 );
    float h = max( hatchLine( hp, 0.0, 0.15 ) * step( 0.12, level ), hatchLine( hp, 1.0472, 0.15 ) * step( 0.42, level ) );
    h = max( h, hatchLine( hp, 2.0944, 0.15 ) * step( 0.74, level ) );
    if ( uStyle < 1.5 ) {
      vec3 wash = mix( colL, uPaper, 0.42 );
      col = mix( mix( wash, colS, 0.3 ), uInk, h * 0.82 );
    } else {
      col = mix( uPaper, uInk, h * 0.9 );
    }
  }

  // —— 高光块（只给“上釉”的表面：眼睛、车架、头盔、喙）——
  float specStr = uSpec.x + vMat.x;
  if ( uStyle < 0.5 && specStr > 0.001 ) {
    vec3 H = normalize( uSunDir + V );
    float ndh = max( dot( N, H ), 0.0 );
    float sp = aaBand( 1.0 - max( uSpec.y, vMat.y ) * 0.16, ndh ) * step( 0.0, ndl ) * t1 * specStr;
    col = mix( col, uHiColor, sp );
  }

  // —— 边缘光：暗部轮廓上的一圈亮边，让主体从背景里“剥”出来 ——
  float rimMul = uRimMul * ( 1.0 - vMat.w );
  if ( uStyle < 0.5 && rimMul > 0.001 && uRimStrength > 0.0 ) {
    float ndv = clamp( dot( N, V ), 0.0, 1.0 );
    float fres = pow( 1.0 - ndv, 3.2 );
    float back = clamp( dot( N, uRimDir ), 0.0, 1.0 );
    float rim = smoothstep( 0.22, 0.95, fres ) * ( 0.22 + 0.78 * back ) * uRimStrength * rimMul * ( 0.3 + 0.7 * ( 1.0 - t1 ) );
    col += uRimColor * rim * 0.45;
  }

  // —— 局部光源（车灯 / 灯塔光束 / 路灯）：以色阶“光斑”的形式落在表面 ——
  if ( uStyle < 1.5 ) {
    for ( int i = 0; i < ${MAX_EXTRA_LIGHTS}; i ++ ) {
      float range = uLightsParam[ i ].w;
      if ( range <= 0.0 ) continue;
      vec3 toL = uLightsPos[ i ] - vWorldPos;
      float dl = length( toL );
      vec3 Ld = toL / max( dl, 1e-4 );
      float att = 1.0 - smoothstep( range * 0.25, range, dl );
      float cone = uLightsParam[ i ].y >= 0.99 ? 1.0 : smoothstep( uLightsParam[ i ].y, uLightsParam[ i ].x, dot( -Ld, uLightsDir[ i ] ) );
      float band = aaBand( 0.3, max( dot( N, Ld ), 0.0 ) );
      col = mix( col, base * uLightsColor[ i ], band * att * cone * uLightsParam[ i ].z );
    }
  }

  // —— 自发光：材质自带（车灯玻璃）或按夜间掩码点亮（路灯 / 窗户）——
  if ( uEmissiveLevel > 0.001 ) col += srgbOETF( uEmissive ) * uEmissiveLevel;
  if ( uLampLevel > 0.001 && vMat.z > 0.001 ) col += base * uLampColor * vMat.z * uLampLevel;

  float fogF = smoothstep( uFogNear, uFogFar, vViewZ );
  col = mix( col, uStyle > 1.5 ? uPaper : uFogColor, fogF );
  gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), uOpacity );
}
`;

const OUTLINE_VERT = /* glsl */`
attribute vec3 aOutlineN;    // 位置焊接后的平滑法线：硬边几何体的描边才不会在棱角处开裂
attribute float aOutlineW;   // 厚度倍率（0 = 不描）
uniform float uOutlinePx, uPixelRatio, uCamScale, uFadeNear, uFadeFar, uOutlineMul, uOutlineScale;
uniform vec2 uViewport;
varying float vViewZ;
void main() {
  vec3 n = aOutlineN;
  vec3 transformed = position;
  vec4 mvPosition = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    mvPosition = batchingMatrix * mvPosition;
  #endif
  #ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    n = mat3( instanceMatrix ) * n;
  #endif
  mvPosition = modelViewMatrix * mvPosition;
  float dist = max( - mvPosition.z, 0.02 );
  float fade = 1.0 - smoothstep( uFadeNear, uFadeFar, dist );
  fade *= fade;
  float worldPerPx = uCamScale * dist / uViewport.y;   // 该深度处一个物理像素的视空间尺寸
  mvPosition.xyz += normalize( normalMatrix * n ) * ( uOutlinePx * uPixelRatio * worldPerPx * aOutlineW * fade * uOutlineMul * uOutlineScale );
  vViewZ = dist;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const OUTLINE_FRAG = /* glsl */`
uniform vec3 uInk, uFogColor, uPaper;
uniform float uFogNear, uFogFar, uStyle;
varying float vViewZ;
void main() {
  float f = smoothstep( uFogNear * 0.7, uFogFar, vViewZ );
  vec3 ink = uStyle > 1.5 ? uInk * 0.55 : uInk;
  gl_FragColor = vec4( mix( ink, uStyle > 1.5 ? uPaper : uFogColor, f ), 1.0 );
}
`;

function sharedUniforms(U) {
  const o = {};
  for (const k of SHARED_KEYS) o[k] = U[k];   // 引用共享，改一处全场景生效
  return o;
}

/**
 * 创建赛璐璐材质。
 * @param {THREE.Color|number|string} color 固有色（显示色域）
 * @param {object} [o]
 * @param {number} [o.spec]      高光强度 0..1
 * @param {number} [o.specSize]  高光尺寸 0..1（越大块越小）
 * @param {number} [o.rim]       边缘光倍率
 * @param {number|string} [o.emissive] 自发光颜色
 * @param {THREE.Texture} [o.map]
 * @param {boolean} [o.vertexColors]
 * @param {number} [o.opacity]
 * @param {boolean} [o.side]
 */
export function toonMaterial(U, color, o = {}) {
  const m = new THREE.ShaderMaterial({
    lights: true,
    vertexColors: !!o.vertexColors,
    side: o.side ?? THREE.FrontSide,
    transparent: (o.opacity ?? 1) < 1 || !!o.blending,
    depthWrite: o.depthWrite ?? ((o.opacity ?? 1) >= 1),
    blending: o.blending ?? THREE.NormalBlending,
    uniforms: {
      ...THREE.UniformsLib.lights,          // 直接引用库对象：渲染器会把灯光状态写进同一份条目
      ...sharedUniforms(U),
      uColor: { value: new THREE.Color(color ?? 0xffffff) },
      uOpacity: { value: o.opacity ?? 1 },
      uMap: { value: o.map ?? null },
      uUseMap: { value: o.map ? 1 : 0 },
      uEmissive: { value: new THREE.Color(o.emissive ?? 0x000000) },
      uSpec: { value: new THREE.Vector4(o.spec ?? 0, o.specSize ?? 0.5, 0, 0) },
      uEmissiveLevel: { value: o.emissiveLevel ?? (o.emissive ? 1 : 0) },
      uRimMul: { value: o.rim ?? 1 },
      uAlphaTest: { value: o.alphaTest ?? 0 },
    },
    vertexShader: TOON_VERT,
    fragmentShader: TOON_FRAG,
  });
  // 写实风格据此找到 / 生成 PBR 对应物（gfx/pbr.js）：固有色 + 创建参数 → 材质分类
  m.userData.isToon = true;
  m.userData.src = { color: color ?? 0xffffff, pbr: o.pbr, spec: o.spec ?? 0 };
  return m;
}

export function outlineMaterial(U) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      uOutlinePx: U.uOutlinePx, uPixelRatio: U.uPixelRatio, uCamScale: U.uCamScale, uFadeNear: U.uFadeNear, uFadeFar: U.uFadeFar,
      uOutlineMul: U.uOutlineMul, uOutlineScale: { value: 1 }, uViewport: U.uViewport, uInk: U.uInk, uFogColor: U.uFogColor, uPaper: U.uPaper,
      uFogNear: U.uFogNear, uFogFar: U.uFogFar, uStyle: U.uStyle,
    },
    vertexShader: OUTLINE_VERT,
    fragmentShader: OUTLINE_FRAG,
  });
}

/** 无光照平面材质（水花、涟漪、尘土）：同样走雾 */
export function flatMaterial(U, color, o = {}) {
  return new THREE.ShaderMaterial({
    side: o.side ?? THREE.FrontSide,
    transparent: true,
    depthWrite: o.depthWrite ?? false,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color ?? 0xffffff) },
      uOpacity: { value: o.opacity ?? 1 },
      uFogColor: U.uFogColor, uFogNear: U.uFogNear, uFogFar: U.uFogFar,
      uMode: U.uMode, uFogColorL: U.uFogColorL, uFogDensity: U.uFogDensity,
    },
    vertexShader: /* glsl */`
      varying float vViewZ;
      void main() { vec4 mv = modelViewMatrix * vec4( position, 1.0 ); vViewZ = - mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor, uFogColor, uFogColorL; uniform float uOpacity, uFogNear, uFogFar, uMode, uFogDensity;
      varying float vViewZ;
      ${ SRGB_FN }
      void main() {
        float dist = max( vViewZ, 0.0 );
        if ( uMode > 0.5 ) {                                                     // 写实：线性辐射 + 指数雾，交给后期做色调映射
          float f = 1.0 - exp( - uFogDensity * uFogDensity * dist * dist );
          gl_FragColor = vec4( mix( uColor, uFogColorL, f ), uOpacity );
        } else {
          gl_FragColor = vec4( mix( srgbOETF( uColor ), uFogColor, smoothstep( uFogNear, uFogFar, dist ) ), uOpacity );
        }
      }`,
  });
}

/**
 * 体积光束（车灯、灯塔）：加色叠加的锥体。沿长度渐隐、迎面（看得最厚的地方）更亮、单面，
 * 所以从侧面看是一束柔和的楔形光，而不是一块半透明板子。几何体用 CylinderGeometry（uv.y 沿轴 0→1）。
 */
export function beamMaterial(U, color, o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.FrontSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color ?? 0xfff0c4) }, uOpacity: { value: o.opacity ?? 0.1 }, uPower: { value: o.power ?? 0.8 }, uMode: U.uMode, uBeamK: U.uBeamK },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4( position, 1.0 );
        vN = normalize( normalMatrix * normal ); vV = normalize( - mv.xyz );
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity, uPower, uMode, uBeamK;
      ${ SRGB_FN }
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float along = 1.0 - pow( clamp( vUv.y, 0.0, 1.0 ), uPower );          // 离灯越远越淡
        float facing = abs( dot( normalize( vN ), normalize( vV ) ) );
        float a = uOpacity * along * ( 0.18 + 0.82 * facing * facing );
        gl_FragColor = uMode > 0.5 ? vec4( uColor * uBeamK, a ) : vec4( srgbOETF( uColor ), a );     // 写实：光束的辐射亮度按曝光折算
      }`,
  });
}

// —————————————————— 描边法线与描边网格 ——————————————————

/** 位置焊接后的面积加权平滑法线（写入 aOutlineN；没有则顺手补 aOutlineW = 1） */
export function ensureOutlineAttributes(geo, weld = 1e-4) {
  if (geo.getAttribute('aOutlineN')) return geo;
  const pos = geo.attributes.position, nrm = geo.attributes.normal, n = pos.count;
  const sums = new Float32Array(n * 3);
  const keyOf = (i) => `${Math.round(pos.getX(i) / weld)},${Math.round(pos.getY(i) / weld)},${Math.round(pos.getZ(i) / weld)}`;
  const groups = new Map();
  for (let i = 0; i < n; i++) { const k = keyOf(i); let g = groups.get(k); if (!g) { g = []; groups.set(k, g); } g.push(i); }
  const index = geo.index;
  const triCount = index ? index.count / 3 : n / 3;
  const ia = new THREE.Vector3(), ib = new THREE.Vector3(), ic = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), fn = new THREE.Vector3();
  for (let t = 0; t < triCount; t++) {
    const a = index ? index.getX(t * 3) : t * 3, b = index ? index.getX(t * 3 + 1) : t * 3 + 1, c = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    ia.fromBufferAttribute(pos, a); ib.fromBufferAttribute(pos, b); ic.fromBufferAttribute(pos, c);
    fn.copy(e1.subVectors(ib, ia).cross(e2.subVectors(ic, ia)));
    const g = groups.get(keyOf(a));
    for (const i of g) { sums[i * 3] += fn.x; sums[i * 3 + 1] += fn.y; sums[i * 3 + 2] += fn.z; }
  }
  const out = new Float32Array(n * 3), w = new Float32Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    let x = sums[i * 3], y = sums[i * 3 + 1], z = sums[i * 3 + 2];
    const l = Math.hypot(x, y, z);
    if (l < 1e-12) { x = nrm.getX(i); y = nrm.getY(i); z = nrm.getZ(i); const m = Math.hypot(x, y, z) || 1; out[i * 3] = x / m; out[i * 3 + 1] = y / m; out[i * 3 + 2] = z / m; }
    else { out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l; }
  }
  geo.setAttribute('aOutlineN', new THREE.BufferAttribute(out, 3));
  if (!geo.getAttribute('aOutlineW')) geo.setAttribute('aOutlineW', new THREE.BufferAttribute(w, 1));
  return geo;
}

/**
 * 给网格加反面外扩描边。描边网格作为子节点共享同一几何体，几何体逐帧更新时描边自动跟随。
 * @param {THREE.Mesh} mesh
 * @param {object} [o]  { px: 每像素厚度倍率（相对全局 uOutlinePx）, smooth: 是否重新焊接法线 }
 */
export function addOutline(mesh, U, o = {}) {
  ensureOutlineAttributes(mesh.geometry);
  const g = mesh.geometry;
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const og = g; // 共享几何体：position/normal/aOutlineN 同步更新
  const mat = outlineMaterial(U);
  mat.uniforms.uOutlineScale.value = o.px ?? 1;
  const line = new THREE.Mesh(og, mat);
  line.name = (mesh.name || 'mesh') + ':outline';
  line.castShadow = false; line.receiveShadow = false;
  line.frustumCulled = mesh.frustumCulled;
  line.renderOrder = mesh.renderOrder;
  line.userData.isOutline = true;
  mesh.add(line);
  if (o.useNormals) g.setAttribute('aOutlineN', g.getAttribute('normal'));   // 光滑体：直接复用着色法线
  return line;
}

// —————————————————— 静态合批 ——————————————————

/**
 * 把大量静态几何体合并成一个网格（1 次绘制）+ 一个描边网格。
 * 顶点属性：color 固有色，aMat = (高光强度, 高光尺寸, 夜灯掩码, 关边缘光)，aSway = (摆动权重, 相位)，
 * aPBR = (粗糙度, 金属度, 标记, 清漆)（写实风格用，由固有色查表得到）。
 */
export class ToonBatch {
  constructor(name = 'batch') { this.name = name; this.items = []; }

  /**
   * @param {THREE.BufferGeometry} geo
   * @param {THREE.Matrix4} [matrix]
   * @param {THREE.Color|number|string} color
   * @param {object} [o] { spec, specSize, lamp, noRim, outline, sway, phase }
   */
  add(geo, matrix, color, o = {}) { this.items.push({ geo, matrix, color: new THREE.Color(color), o, cls: classFor(color, o) }); return this; }

  /** 便捷：位置 + 欧拉角 + 缩放 */
  addAt(geo, p, r, s, color, o = {}) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])),
      new THREE.Vector3(s[0], s[1], s[2]));
    return this.add(geo, m, color, o);
  }

  build(U, { castShadow = true, receiveShadow = true, outline = true, map = null } = {}) {
    let n = 0, ni = 0;
    for (const it of this.items) { n += it.geo.attributes.position.count; ni += it.geo.index ? it.geo.index.count : it.geo.attributes.position.count; }
    const pos = new Float32Array(n * 3), nrm = new Float32Array(n * 3), col = new Float32Array(n * 3), mat = new Float32Array(n * 4);
    const sway = new Float32Array(n * 2), uv = new Float32Array(n * 2), onx = new Float32Array(n * 3), ow = new Float32Array(n), pbr = new Float32Array(n * 4);
    const IndexType = n > 65535 ? Uint32Array : Uint16Array;
    const idx = new IndexType(ni);
    const m4 = new THREE.Matrix4(), nm = new THREE.Matrix3();
    const v = new THREE.Vector3();
    let vo = 0, io = 0;
    for (const it of this.items) {
      const g = it.geo, p = g.attributes.position, c = p.count;
      m4.copy(it.matrix ?? IDENTITY); nm.getNormalMatrix(m4);
      if (!g.attributes.normal) g.computeVertexNormals();
      ensureOutlineAttributes(g);
      const on = g.getAttribute('aOutlineN'), guv = g.attributes.uv;
      const w = it.o.outline ?? 1;
      const nn = g.attributes.normal;
      const mx = it.o.spec ?? 0, my = it.o.specSize ?? 0.5, mz = it.o.lamp ?? 0, mw = it.o.noRim ? 1 : 0;
      const sx = it.o.sway ?? 0, sy = it.o.phase ?? 0;
      const pc = it.cls;                                                   // (粗糙度, 金属度, 标记, 清漆)
      for (let i = 0; i < c; i++) {
        const k3 = (vo + i) * 3, k2 = (vo + i) * 2, k4 = (vo + i) * 4;
        v.fromBufferAttribute(p, i).applyMatrix4(m4); pos[k3] = v.x; pos[k3 + 1] = v.y; pos[k3 + 2] = v.z;
        v.fromBufferAttribute(nn, i).applyMatrix3(nm).normalize(); nrm[k3] = v.x; nrm[k3 + 1] = v.y; nrm[k3 + 2] = v.z;
        v.fromBufferAttribute(on, i).applyMatrix3(nm).normalize(); onx[k3] = v.x; onx[k3 + 1] = v.y; onx[k3 + 2] = v.z;
        col[k3] = it.color.r; col[k3 + 1] = it.color.g; col[k3 + 2] = it.color.b;
        mat[k4] = mx; mat[k4 + 1] = my; mat[k4 + 2] = mz; mat[k4 + 3] = mw;
        sway[k2] = sx; sway[k2 + 1] = sy;
        uv[k2] = guv ? guv.getX(i) : 0; uv[k2 + 1] = guv ? guv.getY(i) : 0;
        ow[vo + i] = w;
        pbr[k4] = pc.rough; pbr[k4 + 1] = pc.metal; pbr[k4 + 2] = pc.flag; pbr[k4 + 3] = pc.clearcoat;
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.getX(i) + vo;
      else for (let i = 0; i < c; i++) idx[io + i] = i + vo;
      vo += c; io += g.index ? g.index.count : c;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aMat', new THREE.BufferAttribute(mat, 4));
    geo.setAttribute('aSway', new THREE.BufferAttribute(sway, 2));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aOutlineN', new THREE.BufferAttribute(onx, 3));
    geo.setAttribute('aOutlineW', new THREE.BufferAttribute(ow, 1));
    geo.setAttribute('aPBR', new THREE.BufferAttribute(pbr, 4));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere(); geo.computeBoundingBox();
    const mesh = new THREE.Mesh(geo, toonMaterial(U, 0xffffff, { vertexColors: true, map }));
    mesh.name = this.name; mesh.castShadow = castShadow; mesh.receiveShadow = receiveShadow;
    if (outline) {
      const line = new THREE.Mesh(geo, outlineMaterial(U));
      line.name = this.name + ':outline'; line.castShadow = false; line.receiveShadow = false; line.userData.isOutline = true;
      mesh.add(line);
    }
    this.items.length = 0;
    return mesh;
  }
}
const IDENTITY = new THREE.Matrix4();
