// 三向投影的礁石材质：贴图按世界坐标从三个方向投上去（和海床用同一张礁石贴图、同一个尺度），礁石和它坐着的海床是一块料。
// 实例化的礁石各有一份顶点色（灰度倍率），倍率越低越长东西——附着层在 gfx/growth.js 里。
import * as THREE from 'three';
import { growable } from './growth.js';

const TP = /* glsl */`
vec3 tpN, tpW, tpBump;
void tpSetup() {
  tpN = normalize( vWNg );
  tpW = pow( abs( tpN ), vec3( 4.0 ) ); tpW /= ( tpW.x + tpW.y + tpW.z );                 // 哪个面朝外就主要取哪个方向的投影
  vec3 bx = texture2D( tRockN, vWPos.zy / uTile ).xyz * 2.0 - 1.0, by = texture2D( tRockN, vWPos.xz / uTile ).xyz * 2.0 - 1.0, bz = texture2D( tRockN, vWPos.xy / uTile ).xyz * 2.0 - 1.0;
  tpBump = vec3( bx.x, bx.z, bx.y ) * tpW.x + vec3( by.x, by.z, by.y ) * tpW.y + vec3( bz.x, bz.y, bz.z ) * tpW.z;   // 每张法线贴图的凹凸转回世界方向
  vec3 dx = texture2D( tRockN, vWPos.zy / ( uTile * 0.17 ) ).xyz * 2.0 - 1.0, dy = texture2D( tRockN, vWPos.xz / ( uTile * 0.17 ) ).xyz * 2.0 - 1.0, dz = texture2D( tRockN, vWPos.xy / ( uTile * 0.17 ) ).xyz * 2.0 - 1.0;
  tpBump += ( vec3( dx.x, dx.z, dx.y ) * tpW.x + vec3( dy.x, dy.z, dy.y ) * tpW.y + vec3( dz.x, dz.y, dz.z ) * tpW.z ) * 0.3;   // 再叠一层细的：近看不是一整块平的面
}
vec3 tpAlbedo() {
  return texture2D( tRock, vWPos.zy / uTile ).rgb * tpW.x + texture2D( tRock, vWPos.xz / uTile ).rgb * tpW.y + texture2D( tRock, vWPos.xy / uTile ).rgb * tpW.z;
}
`;
const ALBEDO = /* glsl */`
tpSetup();
diffuseColor.rgb *= tpAlbedo() * ( 0.78 + 0.44 * texture2D( tNoise, vWPos.xz * 0.011 ).g ) * vec3( 1.06, 0.98, 0.94 );   // 成片的深浅
`;
const NORMAL = 'normal = normalize( ( viewMatrix * vec4( normalize( tpN + tpBump * 0.85 ), 0.0 ) ).xyz );';

/**
 * @param {object} W createWaterLight()
 * @param {object} TX seabedTextures()
 * @param {{ tile?: number, roughness?: number, growth?: number, name?: string }} o
 */
export function rockMaterial(W, TX, o = {}) {
  const U = { tRock: { value: TX.rock.albedo }, tRockN: { value: TX.rock.normal }, tNoise: { value: TX.noise }, uTile: { value: o.tile ?? 7.5 } };
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: o.roughness ?? 0.7, metalness: 0, vertexColors: true });
  W.patch(mat);
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader) => {
    base(shader);
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWNg;')
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        #ifdef USE_INSTANCING
          vWNg = normalize( ( modelMatrix * instanceMatrix * vec4( objectNormal, 0.0 ) ).xyz );
        #else
          vWNg = normalize( ( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz );
        #endif`);
    // 这段代码用到 vWPos，必须排在 waterify 那段声明的后面：<common> 后面紧跟的就是它，所以挂到再往后的 <uv_pars_fragment> 上
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <uv_pars_fragment>', '#include <uv_pars_fragment>\nvarying vec3 vWNg;\nuniform sampler2D tRock, tRockN, tNoise;\nuniform float uTile;\n' + TP)
      .replace('#include <map_fragment>', ALBEDO)
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + NORMAL);
    if (!shader.fragmentShader.includes('tpSetup();')) throw new Error('礁石材质没接上：three 的着色器片段变了');
  };
  return growable(mat, { bias: (o.growth ?? 0.55).toFixed(2) });       // 礁石的风化程度是个定数；实例色只管颜色
}
