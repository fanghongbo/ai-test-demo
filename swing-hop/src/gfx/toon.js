// 全游戏的材质只有这一种画风：三段式的柔和明暗（亮面、灰面、暗面）、天光的补光、轮廓上一圈很淡的 rim、
// 世界坐标的斑驳（像手绘的颜料深浅）。叶尖一类的顶点带 aSway 权重，会被风吹得轻轻摆。
// 做法是拿 three 的卡通材质，在编译着色器之前把明暗曲线和这几样补丁换进去——灯光、阴影、雾都还是 three 自己的。
import * as THREE from 'three';
import { noiseTexture } from './textures.js';

export const SHARED = {
  uTime: { value: 0 },
  uWind: { value: new THREE.Vector2(0.05, 0.016) },              // 风把叶尖吹偏多少（米，x 和 z）
  uRimColor: { value: new THREE.Color('#EAF7FF') },
  uSunColor: { value: new THREE.Color('#FFF2D2') },
};

let noiseTex = null;
export function initToon() {
  if (!noiseTex) noiseTex = noiseTexture();
}

// 明暗曲线：法线和光的夹角分成三段。暗面是 0，灰面 0.58，亮面 1，交界处柔一点
const RAMP = /* glsl */`
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float d = dot( normal, lightDirection ) * 0.5 + 0.5;
	float a = smoothstep( 0.36, 0.47, d );
	float b = smoothstep( 0.63, 0.74, d );
	return vec3( a * ( 1.0 - b ) * 0.58 + b );
}`;

export function toon(opt = {}) {
  const {
    color = 0xffffff, map = null, vertexColors = false, sway = false, rim = 0.12, spec = 0, grain = 0.1, grainScale = 0.42,
    side = THREE.FrontSide, emissive = 0x000000, emissiveIntensity = 1, fog = true, transparent = false, opacity = 1, depthWrite = true,
  } = opt;
  const mat = new THREE.MeshToonMaterial({ color, map, vertexColors, side, fog, emissive, emissiveIntensity, transparent, opacity, depthWrite });
  if (sway) mat.defines = { USE_SWAY: 1 };
  const u = { uRim: { value: rim }, uSpec: { value: spec }, uGrain: { value: grain }, uGrainScale: { value: grainScale } };
  mat.userData.u = u;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, SHARED, u, { uNoise: { value: noiseTex } });
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
attribute float aSway;
uniform float uTime;
uniform vec2 uWind;
varying vec3 vWpos;
varying vec3 vWnor;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
{
	vec4 wp0 = modelMatrix * vec4( transformed, 1.0 );
	float ph = wp0.x * 0.31 + wp0.z * 0.57;
	vec2 gust = uWind * ( 0.65 + 0.35 * sin( uTime * 1.1 + ph ) ) + vec2( 0.012, 0.0 ) * sin( uTime * 2.3 + ph * 1.7 );
	transformed += vec3( gust.x, 0.25 * gust.y, gust.y ) * aSway;
}`)
      .replace('#include <project_vertex>', `#include <project_vertex>
vec4 wp1 = modelMatrix * vec4( transformed, 1.0 );
vWpos = wp1.xyz;
vWnor = normalize( mat3( modelMatrix ) * objectNormal );`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <gradientmap_pars_fragment>', RAMP)
      .replace('#include <common>', `#include <common>
uniform sampler2D uNoise;
uniform float uGrain, uGrainScale, uRim, uSpec;
uniform vec3 uRimColor, uSunColor;
varying vec3 vWpos;
varying vec3 vWnor;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
	vec3 w = abs( vWnor );
	vec2 uv = vWpos.xz * w.y + vWpos.xy * w.z + vWpos.zy * w.x;
	vec3 nz = texture2D( uNoise, uv * uGrainScale ).rgb;
	vec3 nz2 = texture2D( uNoise, uv * uGrainScale * 0.23 + 0.37 ).rgb;
	diffuseColor.rgb *= 1.0 + uGrain * ( ( nz.r - 0.5 ) * 1.2 + ( nz.g - 0.5 ) * 0.35 + ( nz2.b - 0.5 ) * 0.9 );
}`)
      .replace('#include <opaque_fragment>', `{
	vec3 V = normalize( vViewPosition );
	float fres = pow( 1.0 - saturate( dot( normal, V ) ), 3.0 );
	outgoingLight += uRimColor * ( fres * uRim );
	#if NUM_DIR_LIGHTS > 0
	vec3 H = normalize( directionalLights[0].direction + V );
	outgoingLight += uSunColor * ( smoothstep( 0.90, 0.985, dot( normal, H ) ) * uSpec );
	#endif
}
#include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'swing-toon';
  return mat;
}
