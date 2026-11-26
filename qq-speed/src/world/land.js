// 陆地：两座岛（主岛 + 运河以南的西岸）。顶面是一张程序化绘制的“城市地表图”——人行道、广场、草坪、花坛按离赛道的距离和噪声自动分区；
// 侧面是岸壁（下部混凝土，顶上一圈白色压顶石）。运河和南边的港湾里就是海面。
import * as THREE from 'three';
import { SCALE } from '../core/trackdef.js';
import { ISLANDS, WATER_Y } from './landdef.js';
import { mulberry32 } from '../core/mathx.js';

/** 地表图覆盖的世界范围（米） */
const X0 = -255, X1 = 246, Z0 = -216, Z1 = 198, W = X1 - X0, H = Z1 - Z0;
const TEX = 2048;

function shapeOf(poly) {                                // 小地图像素 → 世界 (x, z)；Shape 的 y 取 −z，旋转 −90° 后正好落在 XZ 平面上、法线朝上
  const s = new THREE.Shape();
  poly.forEach(([px, py], k) => { const X = (px - 84.5) * SCALE, Z = -(py - 73.5) * SCALE; if (k === 0) s.moveTo(X, Z); else s.lineTo(X, Z); });
  s.closePath();
  return s;
}

function coverTexture(T, info) {
  // 先按约 1 米的格子算一遍类别和颜色（算离路距离很贵），再在 JS 里双线性放大到整张图并撒上细碎的颗粒。
  // alpha 通道放类别：0 铺装、1 草坪、2 花坛（花坛格子的红色通道是花色种子）。
  const CN = 512, cell = new Float32Array(CN * CN * 4), r = mulberry32(77), pts = [], corner = [];
  for (let i = 0; i < T.N; i += 3) { pts.push([T.x[i], T.z[i], T.hw[i]]); corner.push(info.corner[i]); }
  const G = 24, grid = new Float32Array(G * G); for (let i = 0; i < G * G; i++) grid[i] = r();      // 低频噪声：草坪 / 广场的分布
  // 可平铺的值噪声：坐标超出网格时回绕（坐标放大几倍采第二层时一定会超出去，不回绕就变成外推、数值爆掉）
  const noise = (x, z) => {
    const P = G - 1, wrap = (t) => ((t % P) + P) % P;
    const u = wrap((x - X0) / W * P), v = wrap((z - Z0) / H * P), i = u | 0, j = v | 0, fu = u - i, fv = v - j;
    const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv), q = (a, b) => grid[((b % G) + G) % G * G + ((a % G) + G) % G];
    return (q(i, j) * (1 - su) + q(i + 1, j) * su) * (1 - sv) + (q(i, j + 1) * (1 - su) + q(i + 1, j + 1) * su) * sv;
  };
  for (let j = 0; j < CN; j++) for (let i = 0; i < CN; i++) {
    const x = X0 + (i + 0.5) / CN * W, z = Z0 + (j + 0.5) / CN * H;
    let best = 1e9, hwB = 8, cb = 0;
    for (let k = 0; k < pts.length; k++) { const dd = (pts[k][0] - x) ** 2 + (pts[k][1] - z) ** 2; if (dd < best) { best = dd; hwB = pts[k][2]; cb = corner[k]; } }
    const dist = Math.sqrt(best) - hwB;
    const n1 = noise(x, z), n2 = noise(x * 3.1 + 90, z * 3.1 + 40), sp = r();
    let cr, cg, cb2, kind = 0;
    if (dist < 4.2) { const g = 196 + (sp - 0.5) * 14; cr = g; cg = g * 0.995; cb2 = g * 0.975; }               // 人行道
    else if (cb > 0.5 && dist < 15 && n2 > 0.42) { cr = n2 * 97 % 1; cg = 0; cb2 = 0; kind = 2; }              // 弯道里侧的花坛
    else if (n1 > 0.47 || dist < 8.5) {                                                                     // 草坪
      const k = 0.80 + (n2 - 0.5) * 0.35 + (sp - 0.5) * 0.16; cr = 92 * k; cg = 158 * k; cb2 = 66 * k; kind = 1;
    } else {                                                                                                  // 广场
      const k = 0.86 + (n2 - 0.5) * 0.16 + (sp - 0.5) * 0.10; cr = 208 * k; cg = 206 * k; cb2 = 198 * k;
    }
    const q = (j * CN + i) * 4; cell[q] = cr; cell[q + 1] = cg; cell[q + 2] = cb2; cell[q + 3] = kind;
  }
  // 直接做成 DataTexture，不经过 <canvas>
  const d = new Uint8Array(TEX * TEX * 4), sc = CN / TEX, F = TEX / 4;
  const RG = 128, rg = new Float32Array(RG * RG); for (let i = 0; i < rg.length; i++) rg[i] = r();          // 花丛的细碎噪声（约 1 米一丛）
  const fn = (u, v) => {
    const a = u * RG, b = v * RG, i = Math.floor(a), j = Math.floor(b), fx = a - i, fy = b - j, q = (ii, jj) => rg[(jj % RG) * RG + (ii % RG)];
    return (q(i, j) * (1 - fx) + q(i + 1, j) * fx) * (1 - fy) + (q(i, j + 1) * (1 - fx) + q(i + 1, j + 1) * fx) * fy;
  };
  const at = (i, j, c) => cell[(((j + CN) % CN) * CN + ((i + CN) % CN)) * 4 + c];
  const FLOWER = [[214, 58, 62], [244, 206, 70], [238, 132, 184], [246, 246, 238], [86, 150, 70]];
  for (let j = 0; j < TEX; j++) {
    const fy = (j + 0.5) * sc - 0.5, j0 = Math.floor(fy), ty = fy - j0, ty2 = ty * ty * (3 - 2 * ty);
    for (let i = 0; i < TEX; i++) {
      const fx = (i + 0.5) * sc - 0.5, i0 = Math.floor(fx), tx = fx - i0, tx2 = tx * tx * (3 - 2 * tx);
      const q = (j * TEX + i) * 4, grain = 0.93 + r() * 0.14;                                                 // 细碎颗粒，打破放大后的平滑
      let col = [0, 0, 0], kind = 0, seed = 0;
      for (let c = 0; c < 4; c++) {
        const a = at(i0, j0, c) * (1 - tx2) + at(i0 + 1, j0, c) * tx2, b = at(i0, j0 + 1, c) * (1 - tx2) + at(i0 + 1, j0 + 1, c) * tx2, m = a * (1 - ty2) + b * ty2;
        if (c < 3) col[c] = m; else kind = m;
        if (c === 0) seed = m;
      }
      if (kind > 1.25) {                                                                                       // 花坛：一丛一丛地挑花色，边缘和邻格的颜色柔和过渡
        const pick = (seed * 97 + fn(i / F, j / F) * 1.3) % 1, w = FLOWER[pick < 0.22 ? 0 : pick < 0.40 ? 1 : pick < 0.54 ? 2 : pick < 0.64 ? 3 : 4], k = Math.min(1, (kind - 1.25) / 0.5);
        for (let c = 0; c < 3; c++) col[c] = col[c] * (1 - k) + w[c] * k;
      }
      for (let c = 0; c < 3; c++) d[q + c] = Math.max(0, Math.min(255, col[c] * grain));
      d[q + 3] = Math.max(0, Math.min(255, kind * 127.5));
    }
  }
  const t = new THREE.DataTexture(d, TEX, TEX, THREE.RGBAFormat, THREE.UnsignedByteType);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true;
  return t;
}

export function buildLand(T, M, info, onStep = () => {}) {
  const group = new THREE.Group();
  group.name = 'land';
  onStep(0.1);
  const cover = coverTexture(T, info);
  onStep(0.6);
  // 顶面 = 地表图（色相 + 类别）× 平铺的细部贴图：铺装用铺地砖，草坪用草地。各贴图一张铺“period”米。
  const tiled = (tex, period) => { const t = tex.clone(); t.repeat.set(W / period, H / period); t.needsUpdate = true; return t; };
  const GP = M.TEXEL.grass, PP = 1.1;
  const capMat = new THREE.MeshStandardMaterial({ map: cover, normalMap: tiled(M.paver.normalMap, 22), roughnessMap: tiled(M.paver.roughnessMap, 22), metalnessMap: tiled(M.paver.roughnessMap, 22), roughness: 1, metalness: 1, normalScale: new THREE.Vector2(0.55, 0.55) });
  capMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { tDetail: { value: tiled(M.paver.map, PP) }, tGrassA: { value: tiled(M.grass.map, GP) }, tGrassN: { value: tiled(M.grass.normalMap, GP) }, tGrassR: { value: tiled(M.grass.roughnessMap, GP) }, uRep: { value: new THREE.Vector2(W, H) } });
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <map_pars_fragment>', '#include <map_pars_fragment>\nuniform sampler2D tDetail, tGrassA, tGrassN, tGrassR;\nuniform vec2 uRep;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float gMask = smoothstep( 0.35, 0.65, diffuseColor.a );                              // 1 = 草坪
        diffuseColor.a = 1.0;
        vec2 gUv = vMapUv * uRep / ${GP.toFixed(1)};
        float paveL = dot( texture2D( tDetail, vMapUv * uRep / ${PP.toFixed(2)} ).rgb, vec3( 0.3333 ) );
        float grassL = dot( texture2D( tGrassA, gUv ).rgb, vec3( 0.30, 0.59, 0.11 ) );
        diffuseColor.rgb *= mix( 0.50 * ( 0.55 + paveL * 0.95 ), 2.1 * grassL * ( 0.80 + 0.40 * paveL ), gMask );     // 整体反照率压到混凝土 / 草坪该有的水平`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix( roughnessFactor, texture2D( tGrassR, gUv ).g, gMask );')
      .replace('#include <normal_fragment_maps>', `                                              // 铺装用砖缝的法线，草坪用草叶的法线
        #if defined( USE_NORMALMAP_TANGENTSPACE )
          vec3 mapN = mix( texture2D( normalMap, vNormalMapUv ).xyz, texture2D( tGrassN, gUv ).xyz, gMask ) * 2.0 - 1.0;
          mapN.xy *= normalScale;
          normal = normalize( tbn * mapN );
        #endif`);
  };
  capMat.customProgramCacheKey = () => 'nova-ground2';
  const sideTex = ['map', 'normalMap', 'roughnessMap'].map((k) => { const t = M.concrete[k].clone(); t.needsUpdate = true; return t; });   // 侧面的 uv 已按 0.2 / 米 写好：一张贴图铺 5 米
  const sideMat = new THREE.MeshStandardMaterial({ map: sideTex[0], normalMap: sideTex[1], roughnessMap: sideTex[2], metalnessMap: sideTex[2], roughness: 1, metalness: 1 });
  const bandTex = ['map', 'normalMap', 'roughnessMap'].map((k) => { const t = M.stone[k].clone(); t.repeat.set(1 / 6, 1 / 6); t.needsUpdate = true; return t; });
  const bandMat = new THREE.MeshStandardMaterial({ map: bandTex[0], normalMap: bandTex[1], roughnessMap: bandTex[2], metalnessMap: bandTex[2], roughness: 1, metalness: 1, color: new THREE.Color(0.96, 0.95, 0.92) });
  const DEPTH = -WATER_Y + 0.6, BAND = 0.55;
  for (const [name, poly] of Object.entries(ISLANDS)) {
    const body = new THREE.ExtrudeGeometry(shapeOf(poly, 0), { depth: DEPTH - BAND, bevelEnabled: false, curveSegments: 1 });
    body.rotateX(-Math.PI / 2); body.translate(0, -DEPTH, 0);
    // 顶面的 uv = (x, −z)（米）→ 地表图
    const uv = body.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - X0) / W, (uv.getY(i) + Z1) / H);
    // 侧面材质用另一套 uv（米）：把侧面组的 uv 换成按世界坐标来
    const pos = body.attributes.position, groups = body.groups;
    for (const g of groups) if (g.materialIndex === 1) for (let i = g.start; i < g.start + g.count; i++) { const a = body.index ? body.index.getX(i) : i; uv.setXY(a, pos.getX(a) * 0.2 + pos.getZ(a) * 0.2, pos.getY(a) * 0.2); }
    const mesh = new THREE.Mesh(body, [capMat, sideMat]);
    mesh.name = 'land.' + name; mesh.receiveShadow = true; mesh.castShadow = false;
    group.add(mesh);
    const band = new THREE.ExtrudeGeometry(shapeOf(poly), { depth: BAND, bevelEnabled: false, curveSegments: 1 });
    band.rotateX(-Math.PI / 2); band.translate(0, -BAND, 0);
    // 压顶石只画侧面（第 1 组）；顶面（第 0 组）不画，否则会盖住地表图
    const hidden = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
    const bm = new THREE.Mesh(band, [hidden, bandMat]);
    bm.name = 'land.band.' + name; bm.receiveShadow = true; bm.castShadow = true;
    group.add(bm);
  }
  onStep(1);
  return { group, cover, capMat, sideMat, bandMat, X0, X1, Z0, Z1 };
}
