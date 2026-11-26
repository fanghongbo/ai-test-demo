// 赛道的可见几何：路面、桥面板、路缘、四种护栏 / 墙体（护栏、防撞墙、桥栏、石栏、矮墙绿篱）、导向牌、起点线、发车格。
// 可行驶的边界是“墙面”：lat = hw + WALL。路面一直铺到墙根，车可以压着路沿和混凝土带走。
import * as THREE from 'three';
import { colored } from '../gfx/batch.js';
import { sweep, splitBySide, mergeGeos, between } from './sweep.js';
import { pointAt, WALL } from '../core/trackdef.js';
import { distToLand } from './landdef.js';

export const ROAD_Y = 0.06;                 // 路面高出陆地的距离（避免和地表图深度冲突）
const Y0 = -0.25;                          // 墙体埋进地里的深度
const H = (T, i) => T.hw[i];

/** 每个采样的附加信息：是否在弯里（平滑过渡）、桥面是否悬在水上 */
export function trackInfo(T) {
  const N = T.N, corner = new Float32Array(N), overWater = new Uint8Array(N), zoneName = new Array(N);
  for (let i = 0; i < N; i++) {
    zoneName[i] = T.zoneNames[T.zone[i]];
    let m = 0;
    for (let q = -6; q <= 6; q++) m = Math.max(m, Math.abs(T.kap[(i + q + N) % N]));
    corner[i] = m > 1 / 58 ? 1 : 0;
  }
  for (let pass = 0; pass < 6; pass++) {                      // 前后各抹开约 9 米
    const s = corner.slice();
    for (let i = 0; i < N; i++) corner[i] = (s[(i + N - 1) % N] + s[i] * 2 + s[(i + 1) % N]) * 0.25;
  }
  for (let i = 0; i < N; i++) overWater[i] = distToLand(T.x[i], T.z[i]) > 1.5 ? 1 : 0;         // 跨海大桥的中段、运河上的小桥
  return { corner, overWater, zoneName };
}

/** 这一侧在这里建什么：guard 护栏 / wall 防撞墙 / parapet 桥栏 / stone 石栏 / low 矮墙绿篱 */
export function wallType(T, info, i, side) {
  const z = info.zoneName[i];
  if (z === 'start') return 'parapet';
  if (z === 'canal') return 'stone';
  if (z === 'laneIn' || z === 'laneOut') return 'low';
  if (z === 'laneV') return side > 0 ? 'low' : 'guard';
  if (info.corner[i] > 0.5) {
    const inner = (side > 0) === (T.kap[i] > 0);
    return inner ? 'low' : 'wall';
  }
  return 'guard';
}

function roadMaterial(M) {
  const mat = new THREE.MeshStandardMaterial({ map: M.asphaltTex.map, normalMap: M.asphaltTex.normalMap, roughnessMap: M.asphaltTex.ormMap, metalnessMap: M.asphaltTex.ormMap, roughness: 1, metalness: 1 });
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aRoad; attribute vec2 aRoad2; varying vec4 vRoad; varying vec2 vRoad2;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRoad = aRoad; vRoad2 = aRoad2;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec4 vRoad; varying vec2 vRoad2;')
      .replace('#include <map_fragment>', /* glsl */`#include <map_fragment>
        vec3 rd_big = texture2D( map, vMapUv * 0.211 + vec2( 0.37, 0.11 ) ).rgb;     // 第二个尺度（非整数比），打破贴图的周期
        diffuseColor.rgb = mix( diffuseColor.rgb, rd_big, 0.55 ) * ( 0.80 + 0.42 * rd_big.g );
        float rd_al = abs( vRoad.y ), rd_hw = vRoad.z;
        float rd_lanes = max( 2.0, floor( 2.0 * rd_hw / 4.2 + 0.5 ) );
        float rd_laneW = 2.0 * rd_hw / rd_lanes;
        float rd_k = floor( rd_al / rd_laneW + 0.5 );
        float rd_dl = abs( rd_al - rd_k * rd_laneW );
        float rd_yellow = vRoad2.y;
        float rd_center = 1.0 - step( 0.25, abs( rd_k - rd_lanes * 0.5 ) );
        float rd_laneLine = ( 1.0 - smoothstep( 0.055, 0.10, rd_dl ) ) * step( 0.75, rd_k ) * step( rd_k, rd_lanes - 0.75 );
        float rd_dash = step( fract( vRoad.x / 9.0 ), 0.40 );
        float rd_apron = smoothstep( rd_hw + 0.84, rd_hw + 0.98, rd_al );                 // 靠墙的混凝土带
        float rd_curb = smoothstep( rd_hw - 0.38, rd_hw - 0.26, rd_al ) * ( 1.0 - rd_apron ) * step( 0.5, vRoad2.x );
        float rd_stripe = step( 0.5, fract( vRoad.x / 3.0 ) );
        vec3 rd_curbCol = mix( vec3( 0.50, 0.030, 0.025 ), vec3( 0.78, 0.78, 0.76 ), rd_stripe );
        float rd_edge = ( smoothstep( rd_hw - 0.64, rd_hw - 0.56, rd_al ) - smoothstep( rd_hw - 0.42, rd_hw - 0.34, rd_al ) ) * ( 1.0 - step( 0.5, vRoad2.x ) );
        float rd_white = max( rd_edge, rd_laneLine * mix( rd_dash, 1.0, rd_yellow ) * ( 1.0 - rd_center * rd_yellow ) );
        float rd_yellowPaint = rd_laneLine * rd_center * rd_yellow;
        vec3 rd_col = diffuseColor.rgb;
        float rd_lanePos = rd_al - ( floor( rd_al / rd_laneW ) + 0.5 ) * rd_laneW;
        float rd_track = exp( - pow( ( abs( rd_lanePos ) - rd_laneW * 0.27 ) / 0.30, 2.0 ) );
        rd_col *= 1.0 - 0.15 * rd_track;                                                 // 每条车道里两条被车轮磨黑的轮迹
        vec3 rd_apronCol = vec3( 0.56, 0.565, 0.555 ) * ( 0.86 + 0.28 * texture2D( map, vMapUv * 1.9 ).g );
        rd_col = mix( rd_col, rd_apronCol, rd_apron );
        rd_col = mix( rd_col, rd_curbCol, rd_curb * ( 0.92 + 0.16 * texture2D( map, vMapUv * 3.1 ).g ) );
        rd_col = mix( rd_col, vec3( 0.84, 0.84, 0.80 ), rd_white * ( 0.90 + 0.10 * texture2D( map, vMapUv * 2.3 ).g ) );
        rd_col = mix( rd_col, vec3( 0.86, 0.58, 0.05 ), rd_yellowPaint );
        diffuseColor.rgb = rd_col;
        float roadPaint = max( max( rd_white, rd_yellowPaint ), rd_curb ), roadApron = rd_apron;`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix( roughnessFactor, 0.60, roadPaint ); roughnessFactor = mix( roughnessFactor, 0.80, roadApron );');
  };
  mat.customProgramCacheKey = () => 'nova-road';
  return mat;
}

export function buildTrack(T, M, info) {
  const group = new THREE.Group();
  group.name = 'track';
  const N = T.N, out = { group, wallType: (i, side) => wallType(T, info, i, side), info };
  const hwf = (i) => T.hw[i], latWall = (i) => T.hw[i] + WALL;

  // ——— 路面：从墙根铺到墙根 ———
  const COLS = 10, prof = [];
  for (let k = 0; k <= COLS; k++) prof.push({ lat: (i) => -(T.hw[i] + WALL) + (k / COLS) * 2 * (T.hw[i] + WALL), y: ROAD_Y });
  const roadGeo = sweep(T, 0, N, prof, {
    closed: false, uScale: 1 / M.TEXEL.asphalt, vScale: 1 / M.TEXEL.asphalt,
    extra: { name: 'aRoad', size: 4, fn: (i, lat, y, o) => { o[0] = i * T.ds; o[1] = lat; o[2] = T.hw[i]; o[3] = 0; } },
  });
  { // 第二个属性（弯道 / 黄中线标记）单独补：sweep 只能带一组附加属性
    const n = roadGeo.attributes.position.count, a2 = new Float32Array(n * 2);
    for (let v = 0; v < n; v++) { const s = roadGeo.attributes.aRoad.getX(v), i0 = Math.min(N - 1, Math.round(s / T.ds)); a2[v * 2] = info.corner[i0]; a2[v * 2 + 1] = info.zoneName[i0] === 'start' ? 1 : 0; }
    roadGeo.setAttribute('aRoad2', new THREE.BufferAttribute(a2, 2));
  }
  const roadMat = roadMaterial(M);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.name = 'road'; road.receiveShadow = true; road.castShadow = false;
  group.add(road);
  out.road = road; out.roadMat = roadMat;

  // ——— 桥面板（悬在水上的那一段）：箱梁外腹板 + 底板 ———
  {
    const list = [];
    for (let i = 0; i < N; i++) if (info.overWater[i]) list.push(i);
    const ranges = [];
    for (const i of list) { const r = ranges[ranges.length - 1]; if (r && i === r[1] + 1) r[1] = i; else ranges.push([i, i]); }
    const geos = [];
    for (const [a, b] of ranges) {
      geos.push(sweep(T, a, b, [
        { lat: (i) => T.hw[i] + 3.2, y: ROAD_Y }, { lat: (i) => T.hw[i] + 3.2, y: -2.9 }, { lat: (i) => T.hw[i] + 2.0, y: -3.6 },
        { lat: (i) => -(T.hw[i] + 2.0), y: -3.6 }, { lat: (i) => -(T.hw[i] + 3.2), y: -2.9 }, { lat: (i) => -(T.hw[i] + 3.2), y: ROAD_Y },
      ], { closed: false, uScale: 1 / M.TEXEL.concrete, vScale: 1 / M.TEXEL.concrete, color: () => [0.78, 0.80, 0.82] }));
    }
    if (geos.length) {
      const deck = new THREE.Mesh(mergeGeos(geos), M.concrete);
      deck.name = 'bridgeDeck'; deck.castShadow = true; deck.receiveShadow = true;
      group.add(deck); out.deck = deck;
    }
  }

  // ——— 墙体：按类型分段扫掠 ———
  const wallGeos = { guard: [], wall: [], parapet: [], stone: [], low: [] }, extraGeos = { rail: [], hedge: [] };
  const white = [0.93, 0.94, 0.95], blue = [0.10, 0.40, 0.86], stoneC = [0.98, 0.96, 0.92], gray = [0.80, 0.81, 0.82];
  const band = (y0, y1, c0, c1) => (i, lat, y, o) => { const t = y >= y0 && y <= y1; o[0] = t ? c1[0] : c0[0]; o[1] = t ? c1[1] : c0[1]; o[2] = t ? c1[2] : c0[2]; };
  for (const side of [1, -1]) {
    const L = (d) => (i) => side * (T.hw[i] + d);
    const parts = splitBySide(T, side, (i) => wallType(T, info, i, side));
    const postAt = [];
    const boardAt = [];
    for (const { type, i0, i1 } of parts) {
      const o = { closed: true, uScale: 1 / 2.5, vScale: 1 / 2.5 };
      if (type === 'guard') {
        wallGeos.guard.push(sweep(T, i0, i1, [{ lat: L(2.2), y: Y0 }, { lat: L(2.2), y: 0.30 }, { lat: L(2.75), y: 0.30 }, { lat: L(2.75), y: Y0 }], { ...o, color: () => gray }));
        extraGeos.rail.push(sweep(T, i0, i1, [{ lat: L(2.36), y: 0.50 }, { lat: L(2.36), y: 0.82 }, { lat: L(2.47), y: 0.82 }, { lat: L(2.47), y: 0.50 }], { ...o, color: () => [0.90, 0.93, 0.97] }));
        for (let k = 0; k < 1e9; k++) { const i = (i0 + k * 4) % N; if (k && !between(i, i0, i1, N)) break; postAt.push([i, side]); }
      } else if (type === 'wall') {
        wallGeos.wall.push(sweep(T, i0, i1, [
          { lat: L(2.2), y: Y0 }, { lat: L(2.2), y: 0.86 }, { lat: L(2.2), y: 1.00 }, { lat: L(2.34), y: 1.14 }, { lat: L(2.66), y: 1.14 }, { lat: L(2.8), y: 1.00 }, { lat: L(2.8), y: 0.86 }, { lat: L(2.8), y: Y0 },
        ], { ...o, color: band(0.88, 1.2, white, blue) }));
        for (let k = 0; k < 1e9; k++) { const i = (i0 + k * 9 + 3) % N; if (k && !between(i, i0, i1, N)) break; if (info.corner[i] > 0.6 && (i1 - i0 + N) % N > 8) boardAt.push([i, side]); }
      } else if (type === 'parapet') {
        wallGeos.parapet.push(sweep(T, i0, i1, [
          { lat: L(2.2), y: Y0 }, { lat: L(2.2), y: 0.95 }, { lat: L(2.2), y: 1.14 }, { lat: L(2.26), y: 1.22 }, { lat: L(3.2), y: 1.22 }, { lat: L(3.26), y: 1.14 }, { lat: L(3.26), y: 0.95 }, { lat: L(3.26), y: Y0 },
        ], { ...o, color: band(0.97, 1.3, white, [0.14, 0.50, 0.90]) }));
      } else if (type === 'stone') {
        wallGeos.stone.push(sweep(T, i0, i1, [
          { lat: L(2.2), y: Y0 }, { lat: L(2.2), y: 0.90 }, { lat: L(2.2), y: 0.98 }, { lat: L(2.3), y: 1.08 }, { lat: L(2.8), y: 1.08 }, { lat: L(2.88), y: 0.98 }, { lat: L(2.88), y: 0.90 }, { lat: L(2.88), y: Y0 },
        ], { ...o, uScale: 1 / M.TEXEL.stone, vScale: 1 / M.TEXEL.stone, color: band(0.92, 1.2, stoneC, [0.16, 0.44, 0.84]) }));
      } else if (type === 'low') {
        wallGeos.low.push(sweep(T, i0, i1, [
          { lat: L(2.2), y: Y0 }, { lat: L(2.2), y: 0.61 }, { lat: L(2.2), y: 0.66 }, { lat: L(2.27), y: 0.74 }, { lat: L(2.73), y: 0.74 }, { lat: L(2.8), y: 0.66 }, { lat: L(2.8), y: 0.61 }, { lat: L(2.8), y: Y0 },
        ], { ...o, color: band(0.63, 0.9, white, [0.30, 0.62, 0.92]) }));
        extraGeos.hedge.push(sweep(T, i0, i1, [{ lat: L(2.8), y: Y0 }, { lat: L(2.8), y: 1.25 }, { lat: L(4.4), y: 1.35 }, { lat: L(4.8), y: 0.9 }, { lat: L(4.8), y: Y0 }], { ...o, uScale: 1 / M.TEXEL.hedge, vScale: 1 / M.TEXEL.hedge, color: () => [0.9, 1.0, 0.85] }));
      }
    }
    out[side > 0 ? 'posts' : 'postsL'] = postAt;
    (out.boards ??= []).push(...boardAt);
  }
  const add = (name, geos, mat, shadow = true) => { const g = mergeGeos(geos); if (!g) return null; const m = new THREE.Mesh(g, mat); m.name = name; m.castShadow = shadow; m.receiveShadow = true; group.add(m); return m; };
  out.walls = {
    guard: add('wall.guard', wallGeos.guard, M.concrete), wall: add('wall.wall', wallGeos.wall, M.concrete), parapet: add('wall.parapet', wallGeos.parapet, M.concrete),
    stone: add('wall.stone', wallGeos.stone, M.stone), low: add('wall.low', wallGeos.low, M.concrete),
  };
  out.rail = add('guard.rail', extraGeos.rail, M.steel);
  out.hedge = add('hedge', extraGeos.hedge, M.hedge);
  out.hedge && (out.hedge.castShadow = true);

  // ——— 护栏立柱 ———
  {
    const all = [...(out.posts ?? []), ...(out.postsL ?? [])];
    const g = colored(new THREE.BoxGeometry(0.14, 0.92, 0.14).translate(0, 0.46, 0));          // 材质按顶点色上色：实例化的几何也要带一份
    const posts = new THREE.InstancedMesh(g, M.steel, all.length);
    const o = new THREE.Object3D(), p = [0, 0];
    all.forEach(([i, side], k) => { pointAt(T, i, side * (T.hw[i] + 2.415), p); o.position.set(p[0], 0.28, p[1]); o.rotation.set(0, -T.th[i], 0); o.updateMatrix(); posts.setMatrixAt(k, o.matrix); posts.setColorAt(k, new THREE.Color(0.86, 0.89, 0.93)); });
    posts.instanceMatrix.needsUpdate = true; posts.castShadow = true; posts.receiveShadow = true; posts.name = 'guardPosts';
    group.add(posts); out.postsMesh = posts;
  }

  // ——— 弯道外侧的导向牌 ———
  {
    const list = out.boards ?? [];
    if (list.length) {
      const panel = new THREE.PlaneGeometry(7.4, 1.85), back = new THREE.BoxGeometry(7.5, 1.95, 0.10); back.translate(0, 0, -0.06);
      const leg = new THREE.BoxGeometry(0.12, 0.6, 0.12); leg.translate(0, -1.2, -0.06);
      const right = list.filter(([i]) => T.kap[i] > 0), left = list.filter(([i]) => T.kap[i] <= 0);
      const mk = (items, mat, name) => {
        if (!items.length) return null;
        const im = new THREE.InstancedMesh(panel, mat, items.length), bk = new THREE.InstancedMesh(colored(back), M.steel, items.length), lg = new THREE.InstancedMesh(colored(leg), M.steel, items.length);
        const o = new THREE.Object3D(), p = [0, 0];
        items.forEach(([i, side], k) => {
          pointAt(T, i, side * (T.hw[i] + 2.55), p);
          o.position.set(p[0], 1.14 + 0.6 + 0.95, p[1]);
          const rx = -Math.sin(T.th[i]) * side, rz = Math.cos(T.th[i]) * side;
          o.lookAt(p[0] - rx, o.position.y, p[1] - rz);                 // 牌面朝向路面
          o.rotateX(0.16);                                                // 上沿向后仰一点
          o.updateMatrix(); im.setMatrixAt(k, o.matrix); bk.setMatrixAt(k, o.matrix);
          o.translateY(-1.22); o.updateMatrix(); lg.setMatrixAt(k, o.matrix);
        });
        for (const m of [im, bk, lg]) { m.instanceMatrix.needsUpdate = true; m.castShadow = true; m.receiveShadow = true; }
        im.name = name; group.add(im, bk, lg); return im;
      };
      out.boardsR = mk(right, M.chevron[0], 'chevronR'); out.boardsL = mk(left, M.chevron[1], 'chevronL');
    }
  }

  // ——— 起点线 + 发车格 ———
  {
    const si = 0, road0 = T.hw[si];
    const line = sweep(T, si - 1, si + 2, [{ lat: (i) => -T.hw[i] + 0.3, y: ROAD_Y + 0.012 }, { lat: (i) => T.hw[i] - 0.3, y: ROAD_Y + 0.012 }], { closed: false, vScale: 1 / 2.0 });
    const lm = new THREE.Mesh(line, M.checker); lm.name = 'startLine'; lm.receiveShadow = true; group.add(lm);
    const slots = [];
    for (let row = 0; row < 3; row++) for (const lat of [-2.9, 2.9]) slots.push([si - 4 - row * 4, lat]);
    const sg = new THREE.PlaneGeometry(5.6, 2.9); sg.rotateX(-Math.PI / 2);
    const im = new THREE.InstancedMesh(sg, M.gridSlot, slots.length);
    const o = new THREE.Object3D(), p = [0, 0];
    // PlaneGeometry 旋转后：原来的 +x 仍是横向、原来的 +y 变成 −z（车头方向）。车头朝西（前进方向），所以横向要贴着路、纵向要顺着前进方向
    slots.forEach(([i, lat], k) => {
      pointAt(T, i, lat, p);
      o.position.set(p[0], ROAD_Y + 0.011, p[1]); o.rotation.set(0, -T.th[i] + Math.PI / 2, 0); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
    });
    im.instanceMatrix.needsUpdate = true; im.receiveShadow = true; im.name = 'gridSlots'; group.add(im);
  }
  return out;
}
