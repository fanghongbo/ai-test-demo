// 草丛：沿路两侧撒开的三片交叉卡片（一次实例化绘制），只在写实风格下显示。
// 法线统一朝上（草叶按地面受光），风摆在世界空间里做，随卡片高度加大。
import * as THREE from 'three';
import { terrainHeight, terrainZone, ROAD } from '../core/track.js';
import { grassBladeTexture } from '../gfx/datatex.js';
import { mulberry32, TAU } from '../core/mathx.js';

const PROJECT = /* glsl */`
  vec4 tuftP = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    tuftP = batchingMatrix * tuftP;
  #endif
  #ifdef USE_INSTANCING
    tuftP = instanceMatrix * tuftP;
  #endif
  tuftP = modelMatrix * tuftP;
  float tuftW = uv.y * uv.y;
  float tuftPh = uTime * 1.7 + tuftP.x * 0.31 + tuftP.z * 0.27;
  tuftP.xyz += uWindDir * ( sin( tuftPh ) * 0.7 + sin( tuftPh * 2.3 + 1.0 ) * 0.3 ) * 0.09 * tuftW * uWindStrength;
  vec4 mvPosition = viewMatrix * tuftP;
  gl_Position = projectionMatrix * mvPosition;
`;

export function createTufts(track, K, o = {}) {
  const rng = mulberry32(o.seed ?? 517), W = 0.42, H = 0.24;
  const pos = [], nrm = [], uv = [], idx = [];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI, c = Math.cos(a) * W / 2, s = Math.sin(a) * W / 2, b = k * 4;
    pos.push(-c, 0, -s, c, 0, s, c, H, s, -c, H, -s);
    for (let i = 0; i < 4; i++) nrm.push(0, 1, 0);
    uv.push(0, 0, 1, 0, 1, 1, 0, 1);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);

  const mat = new THREE.MeshStandardMaterial({ map: grassBladeTexture(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.88, metalness: 0 });
  mat.defines = { USE_FOG_SUN: '' };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, K.uni);
    for (const [a, b] of [['#include <common>', '#include <common>\nuniform float uTime; uniform vec3 uWindDir; uniform float uWindStrength;'],
      ['#include <project_vertex>', PROJECT],
      ['#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n  normal = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );']]) {
      if (!shader.vertexShader.includes(a) && !shader.fragmentShader.includes(a)) throw new Error('草丛着色器补丁找不到锚点: ' + a);
      shader.vertexShader = shader.vertexShader.replace(a, b);
      shader.fragmentShader = shader.fragmentShader.replace(a, b);
    }
  };
  mat.customProgramCacheKey = () => 'pelican-tuft';

  // 撒点：路两侧的草地分区；越靠路越密（特写镜头里地面才有内容）
  const spots = [], f = {}, n = {};
  const walkEdge = ROAD.half + ROAD.curbW + ROAD.walkOut, innerEdge = -(ROAD.half + ROAD.curbW + ROAD.walkIn);
  for (let s = 0; s < track.length; s += 0.46) {
    track.frameAt(s, f);
    for (const [u0, u1, count] of [[walkEdge + 0.3, walkEdge + 7, 1], [innerEdge - 0.25, innerEdge - 10, 2]]) {
      for (let k = 0; k < count; k++) {
        if (rng() < 0.25) continue;
        const u = u0 + (u1 - u0) * rng() * rng();
        const x = f.pos[0] + f.right[0] * u, z = f.pos[2] + f.right[2] * u, y = terrainHeight(track, x, z, n);
        if (terrainZone(n.u, y) !== 0) continue;
        spots.push(x, y - 0.03, z, rng() * TAU, 0.7 + rng() * 0.9, rng());
      }
    }
  }
  const mesh = new THREE.InstancedMesh(geo, mat, spots.length / 6);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  for (let i = 0; i < spots.length / 6; i++) {
    const [x, y, z, yaw, sc, tone] = spots.slice(i * 6, i * 6 + 6);
    q.setFromAxisAngle(up, yaw);
    m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sc, sc * (0.75 + tone * 0.6), sc));
    mesh.setMatrixAt(i, m);
    mesh.setColorAt(i, col.setRGB(0.75 + tone * 0.6, 0.85 + tone * 0.35, 0.7 + tone * 0.3));
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.name = 'tufts'; mesh.castShadow = false; mesh.receiveShadow = true; mesh.frustumCulled = false;
  mesh.visible = false; mesh.userData.realOnly = true;
  return { mesh, count: spots.length / 6 };
}
