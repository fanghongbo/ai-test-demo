// 水下光照：挂在所有材质上的一小段着色代码（随深度衰减的日光和天光、焦散、逐通道的水体雾），
// 加上焦散贴图的实时生成、水下环境贴图、背景（纯水色）穹顶。整个场景的“在水里”都从这里来。
//
// 光学上做了三件事，都是按物理关系写的：
//   1. 日光沿折射后的太阳方向往下走，走到多深就按 Beer–Lambert 律衰减多少（红光最先没）；
//   2. 焦散：波面把光聚散，亮度 = 1 / |雅可比行列式|。用和水面着色同一组波算，所以水面、焦散、光束永远对得上；
//   3. 看东西的光在水里走过 t 米：剩下 exp(−σ t)，同时沿途散射进水色（闭式解），每个通道各算各的——
//      所以远处的东西不是变灰，而是先丢红、再丢绿，最后沉进蓝色里。
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { WAVE_GLSL, TILE } from '../core/waves.js';

const QUAD_VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;

/** 顶点里算世界坐标（实例化网格也算对） */
export const WL_VERT_PARS = 'varying vec3 vWPos;\n';
const WL_VERT_POS = /* glsl */`
{
  vec4 wp4 = vec4( transformed, 1.0 );
  #ifdef USE_INSTANCING
    wp4 = instanceMatrix * wp4;
  #endif
  wp4 = modelMatrix * wp4;
  vWPos = wp4.xyz;
}
`;

/** 片元里的声明和三个函数：直射光倍率、天光倍率、水体雾 */
export const WL_FRAG_PARS = /* glsl */`
uniform vec3 uWSunDir, uWSun, uWKdSun, uWAmb, uWKdAmb, uWSigma;
uniform float uWSurfY, uWCausticMix, uWCausticFocus, uWCausticScale, uWCausticBlur;
uniform sampler2D uWCaustic;
varying vec3 vWPos;

// 这一个像素处的直射光：日光沿折射方向走到这个深度还剩多少 × 焦散（回溯到水面上的入射点去取）
vec3 wSunLight( vec3 n ) {
  float depth = max( 0.0, uWSurfY - vWPos.y );
  float path = depth / max( uWSunDir.y, 0.2 );
  vec2 base = ( vWPos.xz + uWSunDir.xz * path ) * uWCausticScale;
  float lod = abs( depth - uWCausticFocus ) * uWCausticBlur + 0.5;
  float mean = textureLod( uWCaustic, vec2( 0.13, 0.71 ), 12.0 ).r;                    // 最小一级 mip 就是整张图的平均值
  float a = textureLod( uWCaustic, base, lod ).r;
  vec2 rot = vec2( base.x * 0.809 - base.y * 0.588, base.x * 0.588 + base.y * 0.809 ) * 1.37 + 0.211;   // 再取一次转了角度的，打散平铺的周期
  float b = textureLod( uWCaustic, rot, lod + 0.8 ).r;
  float c = clamp( 0.5 * ( a + b ) / max( mean, 0.25 ), 0.3, 2.8 );
  float w = uWCausticMix * smoothstep( 0.0, 0.35 * uWCausticFocus, depth ) * exp( - max( 0.0, depth - uWCausticFocus ) / ( 2.6 * uWCausticFocus ) ) * 0.62 * clamp( n.y * 1.6, 0.0, 1.0 );   // 只有朝上的面才接得住焦散
  return exp( - uWKdSun * path ) * mix( 1.0, c, w );
}
vec3 wSkyLight() { return exp( - uWKdAmb * max( 0.0, uWSurfY - vWPos.y ) ); }

// 从镜头沿方向 v 走 t 米，沿途散射进来的水色（闭式解）。t 给一个很大的数就是“这个方向上的水色”
vec3 wIns( vec3 v, float t ) {
  float depthCam = max( 0.0, uWSurfY - cameraPosition.y );
  vec3 b = sign( uWSigma - uWKdAmb * v.y ) * max( abs( uWSigma - uWKdAmb * v.y ), 0.0025 );
  float tEff = v.y > 1e-5 ? min( t, depthCam / v.y ) : t;                             // 往上看：到水面为止，水面上没有水
  return uWSigma * uWAmb * exp( - uWKdAmb * depthCam ) * ( ( 1.0 - exp( - b * tEff ) ) / b );
}
vec3 wWaterColor( vec3 v ) { return wIns( v, 1e4 ); }

// 水体雾。color 进来是物体自己的亮度，出去是“走到镜头时剩下的 + 沿途散射进来的水色”。
// additive：加色混合的东西（光晕、荧光）只衰减、不再加一遍水色——水色背景里已经有了
void wFog( inout vec3 color, float additive ) {
  vec3 dv = vWPos - cameraPosition;
  float t = length( dv );
  vec3 v = dv / max( t, 1e-4 );
  color = color * exp( - uWSigma * t ) + wIns( v, t ) * additive;
}
`;

/** 叶片的透光（接在 lights_fragment_end 后面）。W_LEAF 是强度 0..1：普通的漫反射只算朝光的那一面，薄叶子背面也漏过来一部分光（包裹光照）；
 *  顺着日光看叶子的时候，再透出一层亮。这是巨藻、海扇、海草在逆光里不变成黑剪影的关键 */
const LEAF_BODY = /* glsl */`
#ifdef W_LEAF
  {
    float wNl = dot( normal, uWSunDir );
    float wWrapped = max( 0.0, ( wNl + 0.6 ) / 1.6 );
    vec3 wThrough = wSunK * uWSun * ( wWrapped - max( wNl, 0.0 ) );
    vec3 wToLeaf = normalize( vWPos - cameraPosition );
    float wToward = pow( max( dot( wToLeaf, uWSunDir ), 0.0 ), 4.0 ) * ( 0.25 + 0.75 * abs( wNl ) );
    reflectedLight.directDiffuse += ( wThrough + wSunK * uWSun * wToward * 1.6 ) * W_LEAF * BRDF_Lambert( material.diffuseColor );
  }
#endif
`;

const DIRECT_CALL = 'getDirectionalLightInfo( directionalLight, directLight );';
// #include 是在 onBeforeCompile 之后才展开的，所以这里自己把这一段展开，再把日光衰减接到平行光上
const LIGHTS_BEGIN = THREE.ShaderChunk.lights_fragment_begin.replace(DIRECT_CALL, `${DIRECT_CALL}\n\t\t\tdirectLight.color *= wSunK;`);

/** 把标准材质挂进水下光照。additive = true：这个材质是加色混合的 */
export function waterify(material, shared, o = {}) {
  const additive = o.additive ?? (material.blending === THREE.AdditiveBlending), leaf = o.leaf ?? 0;
  const lit = material.isMeshStandardMaterial || material.isMeshPhysicalMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);                                                  // 共享同一批 uniform 对象
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + WL_VERT_PARS)
      .replace('#include <project_vertex>', '#include <project_vertex>\n' + WL_VERT_POS);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + WL_FRAG_PARS)
      .replace('#include <opaque_fragment>', '#include <opaque_fragment>\n' + `wFog( gl_FragColor.rgb, ${additive ? '0.0' : '1.0'} );`);
    if (lit) {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <lights_fragment_begin>', 'vec3 wSunK = wSunLight( normal );\n' + LIGHTS_BEGIN)
        .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nvec3 wSkyK = wSkyLight();\nreflectedLight.indirectDiffuse *= wSkyK; reflectedLight.indirectSpecular *= wSkyK;\n' + (leaf ? `#define W_LEAF ${leaf.toFixed(3)}\n` + LEAF_BODY : ''));
      if (!shader.fragmentShader.includes('directLight.color *= wSunK;')) console.warn('[water] 日光衰减没接上：three 的着色器片段变了');
    }
    material.userData.shader = shader;
  };
  material.customProgramCacheKey = () => `water|${lit ? 'lit' : 'unlit'}|${additive ? 'add' : 'blend'}|${leaf ? 'leaf' + leaf : ''}`;
  return material;
}

const CAUSTIC_FRAG = /* glsl */`
varying vec2 vUv;
uniform vec3 uIncident;
uniform float uFocus;
${WAVE_GLSL}
// 波面某一点的折射光：走 1 米深度的横向位移（折射角的正切，x 和 z）
vec2 tanDir( vec2 p ) {
  vec2 s;
  waveSlope( p, s );
  vec3 t = refract( uIncident, normalize( vec3( - s.x, 1.0, - s.y ) ), 0.7502 );
  return t.xz / t.y;
}
void main() {
  vec2 p = ( vUv - 0.5 ) * ${TILE.toFixed(1)}, e = vec2( 0.20, 0.0 );
  vec2 c = tanDir( p ), jx = ( tanDir( p + e.xy ) - c ) * ( uFocus / e.x ), jz = ( tanDir( p + e.yx ) - c ) * ( uFocus / e.x );
  float det = ( 1.0 + jx.x ) * ( 1.0 + jz.y ) - jx.y * jz.x;                            // 映射“水面 → 这个深度”的雅可比行列式
  gl_FragColor = vec4( vec3( 1.0 / max( abs( det ), 0.14 ) ), 1.0 );                      // 光通量守恒：亮度 = 1 / |det|
}
`;

const ENV_VERT = /* glsl */`varying vec3 vD; void main() { vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;
const ENV_FRAG = /* glsl */`
varying vec3 vD;
uniform vec3 uAmb, uSunDir, uSun;
void main() {
  vec3 d = normalize( vD );
  vec3 col = uAmb * mix( 0.40, 1.0, smoothstep( -0.75, 0.65, d.y ) );                   // 光从上面来
  col += uSun * pow( max( dot( d, uSunDir ), 0.0 ), 14.0 );                             // 折射进来的太阳在环境里是一团亮光
  gl_FragColor = vec4( col, 1.0 );
}
`;

const DOME_VERT = /* glsl */`
varying vec3 vWPos;
void main() {
  vWPos = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_Position.z = gl_Position.w * 0.999999;
}
`;
const DOME_FRAG = /* glsl */`
${WL_FRAG_PARS}
void main() { vec3 c = vec3( 0.0 ); wFog( c, 1.0 ); gl_FragColor = vec4( c, 1.0 ); }
`;

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {{ causticSize?: number }} o
 */
export function createWaterLight(renderer, o = {}) {
  const U = {
    uWSunDir: { value: new THREE.Vector3(0, 1, 0) }, uWSun: { value: new THREE.Vector3(1, 1, 1) },
    uWKdSun: { value: new THREE.Vector3(0.05, 0.036, 0.027) }, uWAmb: { value: new THREE.Vector3(0.0055, 0.07, 0.33) },
    uWKdAmb: { value: new THREE.Vector3(0.062, 0.044, 0.034) }, uWSigma: { value: new THREE.Vector3(0.235, 0.072, 0.042) },
    uWSurfY: { value: 0 }, uWCausticMix: { value: 1 }, uWCausticFocus: { value: 12 }, uWCausticScale: { value: 1 / TILE }, uWCausticBlur: { value: 0.10 },
  };
  // 焦散：水面下方 uFocus 米深处的光斑图，每帧重画。带 mip 链：离焦深度越远取越模糊的一级
  const cs = o.causticSize ?? 512;
  const cRT = new THREE.WebGLRenderTarget(cs, cs, { type: THREE.HalfFloatType, format: THREE.RedFormat, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, depthBuffer: false, stencilBuffer: false });
  cRT.texture.name = 'water.caustics'; cRT.texture.wrapS = cRT.texture.wrapT = THREE.RepeatWrapping;
  const cMat = new THREE.ShaderMaterial({
    uniforms: { uIncident: { value: new THREE.Vector3(0, -1, 0) }, uFocus: { value: 12 }, uWTime: { value: 0 }, uWSea: { value: 1 } },
    vertexShader: QUAD_VERT, fragmentShader: CAUSTIC_FRAG, depthTest: false, depthWrite: false,
  });
  const quad = new FullScreenQuad(cMat);
  U.uWCaustic = { value: cRT.texture };
  // 共享给水面和别的自定义着色器的波
  const wave = { uWTime: cMat.uniforms.uWTime, uWSea: cMat.uniforms.uWSea };

  // 背景：只有水色的穹顶，跟着镜头走
  const dome = new THREE.Mesh(new THREE.SphereGeometry(6000, 40, 20), new THREE.ShaderMaterial({ uniforms: U, vertexShader: DOME_VERT, fragmentShader: DOME_FRAG, side: THREE.BackSide, depthWrite: false }));
  dome.name = 'waterDome'; dome.renderOrder = -1000; dome.frustumCulled = false;

  // 水下环境贴图（给金属、鱼鳞、湿石头做间接反射）
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envMat = new THREE.ShaderMaterial({ uniforms: { uAmb: { value: new THREE.Vector3() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSun: { value: new THREE.Vector3() } }, vertexShader: ENV_VERT, fragmentShader: ENV_FRAG, side: THREE.BackSide });
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), envMat));
  let envTex = null;
  const envVersion = { value: 0 };

  const std = (o2 = {}) => { const { leaf = 0, ...rest } = o2; return waterify(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 1, ...rest }), U, { ...o2, leaf }); };   // leaf：薄片的透光，0..1
  const basic = (o2 = {}) => waterify(new THREE.MeshBasicMaterial({ vertexColors: true, ...o2 }), U, o2);

  return {
    U, wave, dome, causticTexture: cRT.texture, causticTarget: cRT, causticUniforms: cMat.uniforms, material: std, basic, patch: (m, o2) => waterify(m, U, o2),
    setSize(s) { cRT.setSize(s, s); },
    /** 每帧：波往前走一步，焦散重画一遍 */
    update(time) {
      cMat.uniforms.uWTime.value = time;
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(cRT); quad.render(renderer); renderer.setRenderTarget(prev);
    },
    /** 焦散最锐利的深度（米） */
    setFocus(d) { cMat.uniforms.uFocus.value = d; U.uWCausticFocus.value = d; },
    /** 换了时刻或水质之后：重做环境贴图。amb：天光的辐射亮度（标量），sun：折射进来的那团太阳的亮度 */
    setEnv(amb, sunDir, sun) {
      envMat.uniforms.uAmb.value.copy(amb); envMat.uniforms.uSunDir.value.copy(sunDir); envMat.uniforms.uSun.value.copy(sun);
      const old = envTex;
      envTex = pmrem.fromScene(envScene, 0.02).texture;
      if (old) old.dispose();
      envVersion.value++;
    },
    get envMap() { return envTex; },
    dispose() { cRT.dispose(); cMat.dispose(); quad.dispose(); pmrem.dispose(); envMat.dispose(); dome.geometry.dispose(); dome.material.dispose(); if (envTex) envTex.dispose(); },
  };
}
