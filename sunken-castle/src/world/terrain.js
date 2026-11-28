// 海床的几何和着色。几何是两张高度场网格（中央 520 米见方每 2 米一格，外面铺到 2.2 公里每 10 米一格，重叠处压低一点当裙边）。
// 着色按世界坐标混合：平地是沙（成片的涟漪）、成片的淤泥和藻垫，陡的地方是礁石（三向投影），礁石上再染钙化藻和藻皮。
import * as THREE from 'three';
import { WORLD, height, normalAt } from '../core/seabed.js';

const ALBEDO = /* glsl */`
vec2 sbP = vWPos.xz;
vec3 sbN = normalize( vWNrm );
float sbSlope = 1.0 - sbN.y;
float sbFlat = 1.0 - smoothstep( 0.14, 0.40, sbSlope );                 // 平地
float sbRock = smoothstep( 0.10, 0.38, sbSlope );                         // 陡坡和崖壁
vec4 sbNz = texture2D( tNoise, sbP * 0.011 );                             // 四个八度，这张铺 90 米
vec4 sbNz2 = texture2D( tNoise, sbP * 0.047 );
float sbSilt = ( 1.0 - sbFlat * smoothstep( 0.36, 0.60, sbNz.r ) ) * ( 1.0 - sbRock );
vec3 sbSand = texture2D( tSand, sbP / 3.0 ).rgb * ( 0.88 + 0.24 * sbNz2.g );
vec3 sbSiltC = texture2D( tSilt, sbP / 5.0 ).rgb * ( 0.90 + 0.20 * sbNz2.b );
vec3 sbRockC = texture2D( tRock, sbP / 7.5 ).rgb * abs( sbN.y ) + texture2D( tRock, vWPos.yz / 7.5 ).rgb * abs( sbN.x ) + texture2D( tRock, vWPos.xy / 7.5 ).rgb * abs( sbN.z );
sbRockC /= max( abs( sbN.y ) + abs( sbN.x ) + abs( sbN.z ), 0.001 );
vec3 sbTint = mix( vec3( 1.0 ), vec3( 1.14, 0.66, 0.66 ), smoothstep( 0.54, 0.72, sbNz.g ) * 0.85 );             // 钙化藻：粉红的壳
sbTint = mix( sbTint, vec3( 0.46, 0.58, 0.38 ), smoothstep( 0.48, 0.66, sbNz2.r ) * 0.8 * clamp( sbN.y, 0.0, 1.0 ) );   // 藻皮：朝上的石头长一层深绿
sbRockC *= sbTint * ( 0.84 + 0.32 * sbNz2.a );
float sbWd = max( sbFlat * ( 1.0 - sbSilt ) + sbSilt + sbRock, 0.001 );
vec3 sbGround = ( sbSand * sbFlat * ( 1.0 - sbSilt ) + sbSiltC * sbSilt + sbRockC * sbRock ) / sbWd;
// 礁盘里（珊瑚花园、巨藻林的岩脊）：地面不是干净的沙，而是礁岩——盖着粉红的钙化藻壳和深绿的藻皮，沙只积在坑里
vec4 sbR1 = uReef, sbR2 = uReef2;
float sbReef = max( sbR1.w * smoothstep( 1.0, 0.6, length( sbP - sbR1.xy ) / sbR1.z ), sbR2.w * smoothstep( 1.0, 0.6, length( sbP - sbR2.xy ) / sbR2.z ) );
sbReef *= 0.35 + 0.65 * smoothstep( 0.30, 0.50, sbNz.r );
vec4 sbNz3 = texture2D( tNoise, sbP * 0.19 );                                                                                           // 五六米一块的碎珊瑚
float sbRubble = texture2D( tRock, sbP / 1.3 ).r;
sbReef *= 0.2 + 0.8 * smoothstep( 0.34, 0.62, sbNz3.r );                                                                         // 一片一片的，中间露出沙
vec3 sbCrust = sbRockC * 0.60;                                                                                                 // 礁岩比沙暗得多
vec3 sbPinkC = sbCrust * vec3( 1.95, 1.0, 1.1 ), sbRocky = sbCrust * vec3( 0.84, 0.90, 0.78 );                                 // 钙化藻：发灰的藕粉 / 灰绿的礁岩
sbCrust = mix( sbRocky, sbPinkC, smoothstep( 0.44, 0.58, sbNz.b ) );
sbCrust = mix( sbCrust, sbCrust * vec3( 0.20, 0.34, 0.14 ), smoothstep( 0.48, 0.60, sbNz2.a ) );                              // 藻皮：深绿
sbCrust *= 0.78 + 0.44 * sbRubble;                                                                                            // 碎块的斑驳
sbCrust = mix( sbCrust, sbSand, 0.3 * smoothstep( 0.5, 0.78, sbNz3.g ) );                                                     // 盖着一层薄沙
float sbPocket = smoothstep( 0.56, 0.70, sbNz2.b ) * 0.85;                                                                    // 坑里还是积着沙
diffuseColor.rgb *= mix( sbGround, sbCrust, sbReef * sbFlat * ( 1.0 - sbPocket ) );
`;

const ROUGH = 'float roughnessFactor = mix( mix( mix( 0.88, 0.80, sbSilt ), 0.58, sbRock ), 0.74, sbReef * sbFlat );';

const NORMAL = /* glsl */`
{
  vec3 sbNw = normalize( vWNrm );
  vec3 sbTs = texture2D( tSandN, sbP / 3.0 ).xyz * 2.0 - 1.0;
  vec3 sbRp = texture2D( tRipple, sbP / 12.0 ).xyz * 2.0 - 1.0;
  float sbRip = smoothstep( 0.40, 0.70, texture2D( tNoise, sbP * 0.021 ).b ) * sbFlat * ( 1.0 - sbSilt );
  sbTs = normalize( sbTs + vec3( sbRp.xy * 0.95 * sbRip, 0.0 ) );
  vec3 sbSi = texture2D( tSiltN, sbP / 5.0 ).xyz * 2.0 - 1.0;
  vec3 sbTs2 = normalize( mix( sbTs, sbSi, sbSilt ) );
  vec3 sbUp = vec3( 0.0, 1.0, 0.0 ), sbT = normalize( cross( sbUp, sbNw ) + vec3( 0.0015, 0.0, 0.0 ) ), sbB = cross( sbNw, sbT );
  vec3 sbFlatN = normalize( sbNw + ( sbT * sbTs2.x + sbB * sbTs2.y ) * 1.0 );
  vec3 sbRx = texture2D( tRockN, sbP / 7.5 ).xyz * 2.0 - 1.0, sbRy = texture2D( tRockN, vWPos.yz / 7.5 ).xyz * 2.0 - 1.0, sbRz = texture2D( tRockN, vWPos.xy / 7.5 ).xyz * 2.0 - 1.0;
  vec3 sbSteep = normalize( sbNw + ( vec3( sbRx.x, sbRx.z, sbRx.y ) * abs( sbNw.y ) + vec3( sbRy.x, sbRy.y, sbRy.z ) * abs( sbNw.x ) + vec3( sbRz.x, sbRz.y, sbRz.z ) * abs( sbNw.z ) ) * 0.9 );
  normal = normalize( ( viewMatrix * vec4( mix( sbFlatN, sbSteep, max( sbRock, sbReef * sbFlat * ( 1.0 - sbPocket ) * 0.8 ) ), 0.0 ) ).xyz );
}
`;

/** 海床材质：标准的 PBR 材质，贴图换成按世界坐标混合的这套 */
export function terrainMaterial(W, TX) {
  const U = {
    tSand: { value: TX.sand.albedo }, tSandN: { value: TX.sand.normal }, tRipple: { value: TX.ripples.normal },
    tRock: { value: TX.rock.albedo }, tRockN: { value: TX.rock.normal }, tSilt: { value: TX.silt.albedo }, tSiltN: { value: TX.silt.normal }, tNoise: { value: TX.noise },
    // 礁盘：中心、半径、强度
    uReef: { value: new THREE.Vector4(WORLD.garden.x, WORLD.garden.z, WORLD.garden.r * 0.98, 1) }, uReef2: { value: new THREE.Vector4(WORLD.kelp.x, WORLD.kelp.z, WORLD.kelp.r * 0.7, 0.7) },
  };
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, metalness: 0 });
  W.patch(mat);
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader) => {
    base(shader);
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWNrm;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvWNrm = normalize( ( modelMatrix * vec4( objectNormal, 0.0 ) ).xyz );');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D tSand, tSandN, tRipple, tRock, tRockN, tSilt, tSiltN, tNoise;\nuniform vec4 uReef, uReef2;\nvarying vec3 vWNrm;')
      .replace('#include <map_fragment>', ALBEDO)
      .replace('#include <roughnessmap_fragment>', ROUGH)
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + NORMAL);
  };
  mat.customProgramCacheKey = () => 'seabed';
  return mat;
}

/** 一块网格：[x0, x1] × [z0, z1]，步长 step；skip 用来在中间挖洞（洞比细网格小一圈，重叠的裙边压低 skirt 米） */
function patch(mat, x0, x1, z0, z1, step, hole, skirt) {
  const nx = Math.round((x1 - x0) / step), nz = Math.round((z1 - z0) / step);
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3), nrm = new Float32Array((nx + 1) * (nz + 1) * 3), n = [0, 1, 0];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + i * step, z = z0 + j * step, k = (j * (nx + 1) + i) * 3;
    const inHole = hole && x > hole[0] && x < hole[1] && z > hole[2] && z < hole[3];
    const y = height(x, z, step <= 2 ? 1 : 0) - (hole && !inHole && x >= hole[0] - step && x <= hole[1] + step && z >= hole[2] - step && z <= hole[3] + step ? skirt : 0);
    normalAt(x, z, n, step * 0.5);
    pos[k] = x; pos[k + 1] = y; pos[k + 2] = z; nrm[k] = n[0]; nrm[k + 1] = n[1]; nrm[k + 2] = n[2];
  }
  const idx = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const cx = x0 + (i + 0.5) * step, cz = z0 + (j + 0.5) * step;
    if (hole && cx > hole[0] && cx < hole[1] && cz > hole[2] && cz < hole[3]) continue;
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);                                                          // 从上方看是正面
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = false; m.matrixAutoUpdate = false;
  return m;
}

export function buildTerrain(mat) {
  const group = new THREE.Group(); group.name = 'seabed';
  const I = WORLD.inner, E = WORLD.extent;
  for (const [xa, xb, za, zb] of [[-I, 0, -I, 0], [0, I, -I, 0], [-I, 0, 0, I], [0, I, 0, I]]) group.add(patch(mat, xa, xb, za, zb, 2, null, 0));
  const hole = [-I + 10, I - 10, -I + 10, I - 10];
  for (const [xa, xb, za, zb] of [[-E, 0, -E, 0], [0, E, -E, 0], [-E, 0, 0, E], [0, E, 0, E]]) group.add(patch(mat, xa, xb, za, zb, 10, hole, 0.3));
  return group;
}
