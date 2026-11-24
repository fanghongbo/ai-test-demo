// 岛屿地形（世界网格高度场，按草 / 沙拆成两个网格）+ 路面 / 人行道 / 路缘石条带。
// 高度的唯一权威是 core/track.js 的 terrainHeight。
// 写实风格（enableReal）：地表换成“世界坐标投影”的程序贴图材质（草地 / 沙地 + 陡坡岩石），路面与步道加法线贴图，
// 并沿路撒一丛丛的草卡片。赛璐璐材质原样保留，切换画风时由 style kit 换装。
import * as THREE from 'three';
import { terrainHeight, terrainZone, ROAD } from '../core/track.js';
import { toonMaterial } from '../gfx/toon.js';
import { noise2 } from '../core/mathx.js';
import { roadTexture, pavingTexture } from '../gfx/textures.js';
import { grassTextures, sandTextures, rockTextures, asphaltNormalTexture, pavingNormalTexture, pavingAlbedoTexture } from '../gfx/datatex.js';
import { createTufts } from './tufts.js';

const SURF_COMMON = /* glsl */`
uniform sampler2D tSurfA, tSurfN, tRockA, tRockN, tAltA, tAltN;
uniform float uSurfScale;
uniform vec3 uSurfTint;
#ifdef SURF_BLEND
  varying float vKind;
#endif
// 细节贴图 × 两个尺度的大尺度明暗变化（打散平铺感）
vec3 surfAlbedo( sampler2D tex, vec3 p, float scale ) {
  return texture2D( tex, p.xz * scale ).rgb
       * mix( vec3( 1.0 ), texture2D( tex, p.xz * scale * 0.143 + 0.37 ).rgb * 1.9, 0.45 )
       * mix( vec3( 1.0 ), texture2D( tex, p.zx * scale * 0.051 + 0.61 ).rgb * 1.9, 0.5 );
}
// 两层细节法线（贴图的 +v 对应世界 +z），返回 xy 偏移
vec2 surfNormal( sampler2D tex, vec3 p, float scale ) {
  vec2 tA = texture2D( tex, p.xz * scale ).xy * 2.0 - 1.0;
  vec2 tB = texture2D( tex, p.xz * scale * 0.317 + 0.21 ).xy * 2.0 - 1.0;
  return tA + tB * 0.6;
}
`;
// 颜色：地表贴图；陡坡上按朝向把岩石投到 XY / ZY 平面。“路面之下”那一片按顶点在草地 / 沙地两种材质间混合
const SURF_ALBEDO = /* glsl */`
vec3 sN = inverseTransformDirection( vNormal, viewMatrix );
vec3 sP = vFogWorld;
vec3 sAlb = surfAlbedo( tSurfA, sP, uSurfScale );
vec2 sNxy = surfNormal( tSurfN, sP, uSurfScale );
float sRockW = 0.0;
vec2 rUv = vec2( 0.0 );
#if SURF_BLEND
  sAlb = mix( sAlb, surfAlbedo( tAltA, sP, uSurfScale * 0.9 ), vKind );
  sNxy = mix( sNxy, surfNormal( tAltN, sP, uSurfScale * 0.9 ), vKind );
#endif
#if SURF_ROCK
  sRockW = smoothstep( 0.24, 0.5, 1.0 - clamp( sN.y, 0.0, 1.0 ) );
  rUv = ( abs( sN.x ) > abs( sN.z ) ? sP.zy : sP.xy ) * 0.35;
  sAlb = mix( sAlb, texture2D( tRockA, rUv ).rgb * mix( vec3( 1.0 ), texture2D( tRockA, rUv * 0.19 ).rgb * 1.9, 0.5 ), sRockW );
#endif
diffuseColor.rgb *= sAlb * uSurfTint;
`;
// 法线：细节法线随距离淡出
const SURF_NORMAL = /* glsl */`
{
  vec3 sP = vFogWorld;
  float sDet = 0.5 + 0.5 * exp( - length( vViewPosition ) * 0.045 );
  vec3 sBump = vec3( sNxy.x, 0.0, sNxy.y ) * 0.24 * sDet;
  #if SURF_ROCK
    if ( sRockW > 0.001 ) {
      vec2 rN = texture2D( tRockN, rUv ).xy * 2.0 - 1.0;
      sBump = mix( sBump, ( abs( sN.x ) > abs( sN.z ) ? vec3( 0.0, rN.y * 0.5, rN.x * 0.5 ) : vec3( rN.x * 0.5, rN.y * 0.5, 0.0 ) ), sRockW );
    }
  #endif
  normal = normalize( ( viewMatrix * vec4( normalize( sN + sBump ), 0.0 ) ).xyz );
}
`;

/** 世界坐标投影的地表材质（没有 uv 也能用：土径、地形网格）。
 *  o.blend：按顶点属性 aKind（0 = ground，1 = alt）混合两种地表 —— 给“路面之下”那一片用 */
function surfaceMaterial(K, o) {
  const m = new THREE.MeshStandardMaterial({ vertexColors: !!o.vertexColors, roughness: o.rough ?? 0.95, metalness: 0, side: o.doubleSide ? THREE.DoubleSide : THREE.FrontSide });
  m.defines = { USE_FOG_SUN: '', SURF_ROCK: o.rock ? 1 : 0, SURF_BLEND: o.blend ? 1 : 0 };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, K.uni, {
      tSurfA: { value: o.ground.albedo }, tSurfN: { value: o.ground.normal }, tRockA: { value: o.rock?.albedo ?? null }, tRockN: { value: o.rock?.normal ?? null },
      tAltA: { value: o.alt?.albedo ?? null }, tAltN: { value: o.alt?.normal ?? null },
      uSurfScale: { value: o.scale ?? 0.5 }, uSurfTint: { value: new THREE.Color(o.tint ?? 0xffffff) },
    });
    for (const [a, b] of [['#include <common>', '#include <common>\n' + SURF_COMMON], ['#include <map_fragment>', SURF_ALBEDO], ['#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + SURF_NORMAL]]) {
      if (!shader.fragmentShader.includes(a)) throw new Error('地表材质补丁找不到锚点: ' + a);
      shader.fragmentShader = shader.fragmentShader.replace(a, b);
    }
    if (o.blend) {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nattribute float aKind;\nvarying float vKind;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvKind = aKind;');
    }
  };
  m.customProgramCacheKey = () => 'pelican-surf' + (o.rock ? '-rock' : '') + (o.blend ? '-blend' : '');
  return m;
}
/** 带贴图的写实材质（路面、步道）：颜色贴图 + 法线贴图 + 同一套雾 */
function texturedMaterial(K, map, normalMap, o = {}) {
  const m = new THREE.MeshStandardMaterial({ map, normalMap, roughness: o.rough ?? 0.85, metalness: 0, normalScale: new THREE.Vector2(o.normalScale ?? 0.8, o.normalScale ?? 0.8) });
  if (o.side !== undefined) m.side = o.side;
  m.defines = { USE_FOG_SUN: '' };
  m.onBeforeCompile = (shader) => Object.assign(shader.uniforms, K.uni);
  m.customProgramCacheKey = () => 'pelican-tex';
  return m;
}

export function createTerrain(U, track, o = {}) {
  const B = track.bounds, margin = 30, step = o.step ?? 1.7;
  const nx = Math.ceil((B.maxX - B.minX + margin * 2) / step) + 1, nz = Math.ceil((B.maxZ - B.minZ + margin * 2) / step) + 1;
  const corridor = ROAD.half + ROAD.curbW + Math.max(ROAD.walkOut, ROAD.walkIn);
  const P = new Float32Array(nx * nz * 3), NRM = new Float32Array(nx * nz * 3), C = new Float32Array(nx * nz * 3), Z = new Uint8Array(nx * nz);
  const n = {};
  const height = (i, j) => P[(Math.min(nz - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))) * 3 + 1];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = B.minX - margin + i * step, z = B.minZ - margin + j * step;
    let y = terrainHeight(track, x, z, n);
    // 路面条带下面的地形压低：路面下 5 cm；步道下压到路面以下（步道比路面高 13 cm，只降 5 cm 的话会从路缘石一侧冒出来）
    if (Math.abs(n.u) <= ROAD.half) y -= 0.05;
    else if (Math.abs(n.u) <= corridor) y = n.y - 0.04;
    P[k * 3] = x; P[k * 3 + 1] = y; P[k * 3 + 2] = z;
    const zone = terrainZone(n.u, y);
    Z[k] = zone === 1 ? 1 : zone >= 2 ? 2 : 0;                   // 0 草，1 沙，2 路面 / 步道之下
    // 草地：大尺度色斑（偏黄的草甸 / 偏深的草丛）+ 细碎变化；沙滩只做细碎变化
    const low = noise2(x * 0.022, z * 0.022, 4), fine = noise2(x * 0.6, z * 0.6, 6) * 0.5 + 0.5;
    const v = 0.90 + 0.045 * low + 0.07 * fine;
    C[k * 3] = v * (1 + 0.10 * low); C[k * 3 + 1] = v; C[k * 3 + 2] = v * (1 - 0.14 * low);
  }
  // 整张高度场统一求法线：草 / 沙两个网格接缝处的光照才连续
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, hx = height(i - 1, j) - height(i + 1, j), hz = height(i, j - 1) - height(i, j + 1), l = Math.hypot(hx, 2 * step, hz);
    NRM[k * 3] = hx / l; NRM[k * 3 + 1] = (2 * step) / l; NRM[k * 3 + 2] = hz / l;
  }
  // 三角形按质心分区装进各自的几何体
  const index = [[], [], []], used = [new Set(), new Set(), new Set()];
  const nc = {};
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    const ymax = Math.max(P[a * 3 + 1], P[b * 3 + 1], P[c * 3 + 1], P[d * 3 + 1]);
    if (ymax < -1.7) continue;                                 // 水下太深的部分不建
    // 碰到路面 / 步道的三角带（那里的顶点压低了，藏在条带下面）归入条带外面那几角的分区：
    // 伸出步道边缘的部分与相邻地表同材质，两种画风下都不会露出锯齿边。路面条带只有一格多宽，
    // 还可能从两个角之间斜穿过去，所以中心点也测一次
    const zs = [Z[a], Z[b], Z[c], Z[d]];
    let zoneB = zs.includes(1) && !zs.includes(0) ? 1 : 0;     // 没碰到路面：多数是沙就是沙
    if (zs.includes(2) || terrainZone(nc.u, terrainHeight(track, (P[a * 3] + P[b * 3] + P[c * 3] + P[d * 3]) / 4, (P[a * 3 + 2] + P[b * 3 + 2] + P[c * 3 + 2] + P[d * 3 + 2]) / 4, nc)) >= 2) {
      const nat = zs.find((z) => z !== 2);
      zoneB = nat !== undefined ? nat : (nc.u < 0 ? 0 : 1);    // 四个角都在路面之下：按所在一侧（陆侧草地、海侧沙地）
    }
    index[zoneB].push(a, c, b, b, c, d);
    for (const v of [a, b, c, d]) used[zoneB].add(v);
  }
  const mats = [
    toonMaterial(U, 0x7cc46b, { vertexColors: true, rim: 0.5 }),
    toonMaterial(U, 0xefd9a7, { vertexColors: true, rim: 0.5 }),
    toonMaterial(U, 0x9aa39a, { vertexColors: true, rim: 0.3 }),
  ];
  const group = new THREE.Group(); group.name = 'terrain';
  const names = ['terrainGrass', 'terrainSand', 'terrainUnder'];
  const meshes = {};
  index.forEach((list, b) => {
    if (!list.length) return;
    const verts = [...used[b]], map = new Map(); verts.forEach((v, i) => map.set(v, i));
    const pos = new Float32Array(verts.length * 3), col = new Float32Array(verts.length * 3), nrm = new Float32Array(verts.length * 3);
    verts.forEach((v, i) => { pos.set(P.subarray(v * 3, v * 3 + 3), i * 3); col.set(C.subarray(v * 3, v * 3 + 3), i * 3); nrm.set(NRM.subarray(v * 3, v * 3 + 3), i * 3); });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    g.setIndex(list.map((v) => map.get(v)));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mats[b]); m.name = names[b]; m.castShadow = false; m.receiveShadow = true;
    group.add(m); meshes[names[b]] = m;
  });

  // ————— 沿路线的条带 —————
  const f = {};
  function ribbon(u0, u1, lift, ds, vScale = 1, crown = false) {
    const count = Math.ceil(track.length / ds) + 1;
    const pos = new Float32Array(count * 2 * 3), uv = new Float32Array(count * 2 * 2), nrm = new Float32Array(count * 2 * 3);
    for (let i = 0; i < count; i++) {
      const s = Math.min(i * ds, track.length);
      track.frameAt(s, f);
      for (const [k, u] of [[0, u0], [1, u1]]) {
        const y = crown ? 0.05 * (1 - (u / ROAD.half) ** 2) : 0;
        const q = (i * 2 + k) * 3;
        pos[q] = f.pos[0] + f.right[0] * u; pos[q + 1] = f.pos[1] + y + lift; pos[q + 2] = f.pos[2] + f.right[2] * u;
        uv[(i * 2 + k) * 2] = k; uv[(i * 2 + k) * 2 + 1] = s / vScale;
        nrm[q + 1] = 1;
      }
    }
    const idx = new Uint32Array((count - 1) * 6); let q = 0;
    for (let i = 0; i < count - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      // u0 在右、u1 在左（u 越大越靠海）：保证正面朝上
      idx[q++] = a; idx[q++] = b; idx[q++] = c; idx[q++] = b; idx[q++] = d; idx[q++] = c;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere();
    return g;
  }
  const mesh = (geo, color, o2 = {}) => { const m = new THREE.Mesh(geo, toonMaterial(U, color, { ...o2 })); m.receiveShadow = true; m.castShadow = false; group.add(m); return m; };

  // 路面
  const roadMat = toonMaterial(U, 0xffffff, { map: roadTexture(), spec: 0.08, specSize: 0.9, rim: 0.25 });
  roadMat.uniforms.uMap.value.repeat.set(1, 1);
  const road = new THREE.Mesh(ribbon(-ROAD.half, ROAD.half, 0, 1.5, 9, true), roadMat);   // 一张贴图 = 9 m：虚线 4.5 m + 间隔 4.5 m
  road.name = 'road'; road.receiveShadow = true; group.add(road);
  // 人行道 / 滨海步道
  const inner = ROAD.half + ROAD.curbW;
  const walkMats = [];
  for (const [name, u0, u1] of [['walkSea', inner, inner + ROAD.walkOut], ['walkLand', -inner - ROAD.walkIn, -inner]]) {
    const g = ribbon(u0, u1, ROAD.curbH, 2.0, 3.3);
    const wm = toonMaterial(U, 0xffffff, { map: pavingTexture(), spec: 0.08, specSize: 0.9, rim: 0.3 });
    walkMats.push(wm);
    const m = new THREE.Mesh(g, wm);
    m.name = name; m.receiveShadow = true; group.add(m);
  }
  // 路缘石立面
  const curbMats = [];
  for (const side of [1, -1]) {
    const g = new THREE.BufferGeometry();
    const ds = 2.0, count = Math.ceil(track.length / ds) + 1;
    const pos = new Float32Array(count * 2 * 3);
    for (let i = 0; i < count; i++) {
      const s = Math.min(i * ds, track.length); track.frameAt(s, f);
      const u = side * ROAD.half;
      pos.set([f.pos[0] + f.right[0] * u, f.pos[1] - 0.02, f.pos[2] + f.right[2] * u], (i * 2) * 3);
      pos.set([f.pos[0] + f.right[0] * u, f.pos[1] + ROAD.curbH + 0.002, f.pos[2] + f.right[2] * u], (i * 2 + 1) * 3);
    }
    const idx = new Uint32Array((count - 1) * 6); let q = 0;
    for (let i = 0; i < count - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; if (side > 0) { idx.set([a, c, b, b, c, d], q); } else { idx.set([a, b, c, b, d, c], q); } q += 6; }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals(); g.computeBoundingSphere();
    const cm = toonMaterial(U, 0xe9e2d2, { side: THREE.DoubleSide, spec: 0.1, rim: 0.3 });
    curbMats.push(cm);
    const m = new THREE.Mesh(g, cm);
    m.name = 'curb' + (side > 0 ? 'Sea' : 'Land'); m.receiveShadow = true; group.add(m);
  }
  // 路缘石顶面：路面与步道之间那 26 cm 的窄条（原先露着下面的地形）
  for (const [name, u0, u1] of [['curbTopSea', ROAD.half, inner], ['curbTopLand', -inner, -ROAD.half]]) {
    const m = new THREE.Mesh(ribbon(u0, u1, ROAD.curbH + 0.004, 1.5, 1.5), curbMats[0]);
    m.name = name; m.receiveShadow = true; group.add(m);
  }
  // 通往灯塔的土径：从最近的路边（陆侧）直到塔基，贴着地形起伏
  const pathMats = [];
  function dirtPath(from, to, width, color) {
    const steps = 46, pos = new Float32Array((steps + 1) * 2 * 3), idx = new Uint32Array(steps * 6);
    const dx = to.x - from.x, dz = to.z - from.z, len = Math.hypot(dx, dz), nx = -dz / len, nz = dx / len;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, bend = Math.sin(t * Math.PI) * len * 0.08;
      const px = from.x + dx * t + nx * bend, pz = from.z + dz * t + nz * bend;
      for (const [k, sgn] of [[0, -1], [1, 1]]) {
        const qx = px + nx * sgn * width / 2, qz = pz + nz * sgn * width / 2, q = (i * 2 + k) * 3;
        pos[q] = qx; pos[q + 1] = terrainHeight(track, qx, qz) + 0.04; pos[q + 2] = qz;
      }
    }
    for (let i = 0; i < steps; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.set([a, c, b, b, c, d], i * 6); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeVertexNormals(); g.computeBoundingSphere();
    const pm = toonMaterial(U, color, { side: THREE.DoubleSide, rim: 0.2 }); pathMats.push(pm);
    const m = new THREE.Mesh(g, pm); m.receiveShadow = true; m.name = 'dirtPath'; group.add(m);
    return { from: new THREE.Vector3(from.x, 0, from.z), dir: new THREE.Vector3(nx, 0, nz), len };
  }

  let tufts = null;
  return {
    group, dirtPath, meshes,
    applyPalette(p) { mats[0].uniforms.uColor.value.setRGB(...p.grass).convertSRGBToLinear(); mats[1].uniforms.uColor.value.setRGB(...p.sand).convertSRGBToLinear(); mats[2].uniforms.uColor.value.setRGB(...p.sand).convertSRGBToLinear().multiplyScalar(0.86); },
    /** 写实：给每个赛璐璐材质登记一个 PBR 替身（style kit 换装时取用），并生成沿路的草丛 */
    enableReal(kit) {
      const K = kit.K, grass = grassTextures(), sand = sandTextures(), rock = rockTextures(), asphaltN = asphaltNormalTexture();
      const real = {
        grass: surfaceMaterial(K, { ground: grass, rock, vertexColors: true, rough: 0.97, scale: 0.5 }),
        sand: surfaceMaterial(K, { ground: sand, vertexColors: true, rough: 0.92, scale: 0.45 }),
        road: texturedMaterial(K, roadTexture({ asphalt: '#2c2e33', line: '#cfc6ae' }), asphaltN, { rough: 0.93, normalScale: 0.22 }),
        walk: texturedMaterial(K, pavingAlbedoTexture(), pavingNormalTexture(192, 6), { rough: 0.84, normalScale: 0.5 }),
        curb: texturedMaterial(K, null, asphaltN, { rough: 0.86, side: THREE.DoubleSide, normalScale: 0.2 }),   // 路缘石：混凝土色 + 细颗粒法线
        path: surfaceMaterial(K, { ground: sand, scale: 0.6, rough: 0.95, tint: 0xa08a62, doubleSide: true }),
      };
      real.curb.color.set(0x9c978c);
      for (const [i, zone] of [[0, 'grass'], [1, 'sand']]) mats[i].userData.pbrOverride = real[zone];
      roadMat.userData.pbrOverride = real.road;
      for (const wm of walkMats) wm.userData.pbrOverride = real.walk;
      for (const cm of curbMats) cm.userData.pbrOverride = real.curb;
      for (const pm of pathMats) pm.userData.pbrOverride = real.path;
      tufts = createTufts(track, K);
      group.add(tufts.mesh);
      kit.postHide.push(tufts.mesh);
      return real;
    },
    get tufts() { return tufts; },
  };
}
