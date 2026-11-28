// “长了东西”的着色层，挂在石头一类的材质上：浸在水里的石头，朝上的面、背光的角落，会按世界坐标的三维噪声长出藻膜（深橄榄绿）
// 和钙化藻的壳（粉紫）；有藻膜的地方略亮一点（湿）。可以带顶点色，也可以不带：
//   顶点色是灰度倍率时（1 = 干净），倍率越小 = 风化得越厉害 = 长出来的越多；实例化网格里这个倍率走实例色。
// 需要材质里有 vWPos（world 位置，waterify 会加）。
import * as THREE from 'three';

const PARS = /* glsl */`
uniform float uGrowth;
varying vec3 vAUp;
vec3 aHash3( vec3 p ) { p = fract( p * 0.3183099 + vec3( 0.1, 0.2, 0.3 ) ); p *= 17.0; return fract( p.xxy * p.yzz * p.zzx + p ); }
float aNoise( vec3 x ) {
  vec3 i = floor( x ), f = fract( x ); f = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( mix( aHash3( i ).x, aHash3( i + vec3( 1.0, 0.0, 0.0 ) ).x, f.x ), mix( aHash3( i + vec3( 0.0, 1.0, 0.0 ) ).x, aHash3( i + vec3( 1.0, 1.0, 0.0 ) ).x, f.x ), f.y ),
              mix( mix( aHash3( i + vec3( 0.0, 0.0, 1.0 ) ).x, aHash3( i + vec3( 1.0, 0.0, 1.0 ) ).x, f.x ), mix( aHash3( i + vec3( 0.0, 1.0, 1.0 ) ).x, aHash3( i + vec3( 1.0, 1.0, 1.0 ) ).x, f.x ), f.y ), f.z );
}
`;
const BODY = /* glsl */`
{
  vec3 gN = normalize( vAUp );
  float up = clamp( gN.y, 0.0, 1.0 );
  float n1 = aNoise( vWPos * 0.19 ) * 0.62 + aNoise( vWPos * 0.47 + 7.7 ) * 0.38;
  float n2 = aNoise( vWPos * 1.9 + 3.3 );
  float grow = uGrowth * GROWTH_BIAS;
  aFilm = smoothstep( 0.47, 0.68, n1 * 0.80 + up * 0.26 + grow * 0.22 );
  aCrust = smoothstep( 0.58, 0.76, n2 + up * 0.16 + grow * 0.16 );
  diffuseColor.rgb = mix( diffuseColor.rgb, mix( vec3( 0.026, 0.046, 0.018 ), vec3( 0.070, 0.076, 0.028 ), n2 ), aFilm * 0.88 );
  diffuseColor.rgb = mix( diffuseColor.rgb, mix( vec3( 0.19, 0.080, 0.105 ), vec3( 0.31, 0.16, 0.17 ), n1 ), aCrust * aFilm * 0.5 );
}
`;
const ROUGH = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif
	roughnessFactor = mix( roughnessFactor, 0.58, aFilm );`;

/**
 * @param {THREE.Material} mat 已经 waterify 过的材质
 * @param {{ bias?: string }} o  bias：GLSL 表达式，“风化程度”0..1。默认取顶点色：( 1.0 - vColor.r ) * 4.5
 */
export function growable(mat, o = {}) {
  const base = mat.onBeforeCompile;
  mat.userData.uGrowth = { value: 1 };
  mat.onBeforeCompile = (shader) => {
    base(shader);
    shader.uniforms.uGrowth = mat.userData.uGrowth;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vAUp;')
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        #ifdef USE_INSTANCING
          vAUp = normalize( ( modelMatrix * instanceMatrix * vec4( objectNormal, 0.0 ) ).xyz );
        #else
          vAUp = normalize( ( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz );
        #endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + PARS + 'float aFilm = 0.0, aCrust = 0.0;\n#define GROWTH_BIAS (' + (o.bias ?? '( 1.0 - vColor.r ) * 4.5') + ')')
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + BODY)
      .replace('#include <roughnessmap_fragment>', ROUGH);
    if (!shader.fragmentShader.includes('aFilm = smoothstep') || !shader.vertexShader.includes('vAUp =')) throw new Error('附着层没接上：three 的着色器片段变了');
  };
  const key = mat.customProgramCacheKey?.bind(mat);
  mat.customProgramCacheKey = () => `water|${key ? key() : ''}|growable|${o.bias ?? 'vc'}`;      // 不带 name：石头、铺地、大理石注入的代码一模一样，共用一个着色器程序
  return mat;
}
