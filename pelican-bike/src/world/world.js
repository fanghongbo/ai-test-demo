// 环岛世界：天空 / 海 / 地形路面 / 分段合批的道具 / 灯塔与栈桥 / 海鸥与跃鱼 / 水花尘土特效。
// 对外接口见文件末尾 createWorld 的返回对象（main.js 只依赖它）。
import * as THREE from 'three';
import { makeTrack, terrainHeight, ROAD } from '../core/track.js';
import { ToonBatch, flatMaterial } from '../gfx/toon.js';
import * as S from '../gfx/shapes.js';
import { mulberry32, TAU, DEG, clamp, damp } from '../core/mathx.js';
import { createSky, createClouds, createFarIslands } from './sky.js';
import { createSea, waveHeight } from './sea.js';
import { createTerrain } from './terrain.js';
import * as P from './props.js';
import { PC } from './props.js';
import { createLighthouse, createPier, createGull, createBuoy } from './landmarks.js';
import { fishGeometry } from '../actors/bicycle.js';
import { loftGeometry } from '../gfx/loft.js';
import { MOON_COLOR } from '../gfx/skyenv.js';
import { leafletTexture } from '../gfx/datatex.js';

const V = () => new THREE.Vector3();
const _a = V(), _b = V();

export function createWorld(U, o = {}) {
  const track = o.track ?? makeTrack();
  const L = track.length, rng = mulberry32(o.seed ?? 20241124);
  const quality = o.quality ?? 2;
  const group = new THREE.Group(); group.name = 'world';
  const F = {};
  /** 路线坐标 (s, u) → 世界位置、地面高度、朝向 */
  const spot = (s, u, out = {}) => {
    track.frameAt(((s % L) + L) % L, F);
    out.x = F.pos[0] + F.right[0] * u; out.z = F.pos[2] + F.right[2] * u;
    out.y = terrainHeight(track, out.x, out.z); out.roadY = F.pos[1];
    out.yawSea = Math.atan2(F.right[0], F.right[2]); out.yawFwd = Math.atan2(F.fwd[0], F.fwd[2]);
    return out;
  };

  // ———————————— 大块：天空、云、远岛、海、地形 ————————————
  const sky = createSky(U); group.add(sky.dome);
  const clouds = createClouds(U, quality === 0 ? 6 : 10); group.add(clouds.group);
  const far = createFarIslands(U); group.add(far.mesh);
  const sea = createSea(U, track, { step: quality === 0 ? 3.6 : 2.6 }); group.add(sea.mesh);
  const terrain = createTerrain(U, track, { step: quality === 0 ? 2.6 : 1.7 }); group.add(terrain.group);

  // ———————————— 道具：按弧长分成若干段，每段一个合批 ————————————
  const N = o.chunks ?? 24, CS = L / N;
  const chunks = Array.from({ length: N }, (_, i) => new ToonBatch('chunk' + i));
  const batchAt = (s) => chunks[Math.min(N - 1, Math.floor((((s % L) + L) % L) / CS))];
  // 棕榈叶单独合批：赛璐璐画锯齿叶片，写实画小叶卡片，两种画风各显示各的
  const frondB = Array.from({ length: 6 }, () => new ToonBatch('frond')), cardB = Array.from({ length: 6 }, () => new ToonBatch('frondCards'));
  const leafOpt = (s) => ({ blades: frondB[Math.floor((((s % L) + L) % L) / L * 6) % 6], cards: cardB[Math.floor((((s % L) + L) % L) / L * 6) % 6] });
  const walkEdge = ROAD.half + ROAD.curbW + ROAD.walkOut, innerEdge = -(ROAD.half + ROAD.curbW + ROAD.walkIn);
  const sPier = L * 0.37, sLife = L * 0.71, sBeach = L * 0.12;
  const near = (s, c, d) => Math.abs(((s - c + L / 2) % L + L) % L - L / 2) < d;
  const gapRailing = (s) => near(s, sPier, 5) || near(s, sLife, 5) || near(s, sBeach, 6);
  const lampPos = [];
  const sp = {};
  const jitter = (amt) => (rng() - 0.5) * amt;

  for (let s = 0; s < L; s += 2.6) {                                    // 海侧栏杆
    if (gapRailing(s + 1.3)) continue;
    const a = spot(s, walkEdge - 0.24, {}), b2 = spot(s + 2.6, walkEdge - 0.24, {});
    P.addRailing(batchAt(s), [a.x, a.z], [b2.x, b2.z], a.roadY + ROAD.curbH);
  }
  for (let s = 9; s < L; s += 27) {                                     // 路灯
    if (near(s, sPier, 6)) continue;
    const a = spot(s, walkEdge - 0.8, sp);
    P.addLamp(batchAt(s), a.x, a.roadY + ROAD.curbH, a.z, a.yawSea + Math.PI);
    lampPos.push(new THREE.Vector3(a.x, a.roadY + ROAD.curbH + 3.26, a.z + 0));
  }
  for (let s = 21; s < L; s += 34) { const a = spot(s, walkEdge - 1.45, sp); P.addBench(batchAt(s), a.x, a.roadY + ROAD.curbH, a.z, a.yawSea); }
  for (let s = 5; s < L; s += 16.5) {                                   // 海侧棕榈
    s += jitter(3);
    if (near(s, sPier, 11) || near(s, sLife, 7) || rng() < 0.2) continue;
    const a = spot(s, walkEdge + 2.6 + rng() * 1.6, sp); P.addPalm(batchAt(s), a.x, a.y, a.z, rng, leafOpt(s));
  }
  for (let s = 11; s < L; s += 22.5) { const a = spot(s + jitter(4), innerEdge - 4.2 - rng() * 4, sp); P.addPalm(batchAt(s), a.x, a.y, a.z, rng, { h: 5 + rng() * 3, ...leafOpt(s) }); }
  for (let s = 29; s < L; s += 41) { const a = spot(s + jitter(6), innerEdge - 9 - rng() * 15, sp); P.addTree(batchAt(s), a.x, a.y, a.z, rng); }
  for (let s = 3; s < L; s += 5.2) { if (rng() < 0.5) continue; const a = spot(s + jitter(2), innerEdge - 1.3 - rng() * 5.5, sp); P.addBush(batchAt(s), a.x, a.y, a.z, rng, { big: rng() < 0.3 }); }
  for (let s = 6; s < L; s += 7.5) { if (rng() < 0.45) continue; const a = spot(s + jitter(3), innerEdge - 0.5 - rng() * 2.4, sp); P.addFlowers(batchAt(s), a.x, a.y, a.z, rng); }
  for (let s = 17; s < L; s += 38) {                                    // 沙滩伞
    s += jitter(5);
    if (near(s, sPier, 12) || near(s, sLife, 8)) continue;
    const a = spot(s, walkEdge + 6 + rng() * 5, sp);
    if (a.y < 0.35 || a.y > 2.4) continue;
    P.addUmbrella(batchAt(s), a.x, a.y, a.z, rng);
    if (rng() < 0.6) { const c = spot(s + 2.5, walkEdge + 5 + rng() * 5, {}); if (c.y > 0.3) P.addSandcastle(batchAt(s), c.x, c.y, c.z, rng); }
  }
  for (let s = 48; s < L; s += 96) { const a = spot(s, innerEdge + 0.75, sp); P.addSignpost(batchAt(s), a.x, a.roadY + ROAD.curbH, a.z, a.yawFwd, { back: rng() < 0.5 }); }
  for (let s = 63; s < L; s += 87) { const a = spot(s, innerEdge - 7.5 - rng() * 3, sp); P.addPicnicTable(batchAt(s), a.x, a.y, a.z, rng() * TAU); }
  for (const f of [0.55, 0.86]) { const a = spot(L * f, innerEdge - 13 - rng() * 3, sp); P.addTent(batchAt(L * f), a.x, a.y, a.z, rng() * TAU, { color: f > 0.7 ? PC.sky : PC.coral }); }
  for (const f of [0.19, 0.52, 0.80]) { const a = spot(L * f, walkEdge + 9 + rng() * 3, sp); if (a.y > 0.2) P.addRowboat(batchAt(L * f), a.x, a.y + 0.25, a.z, rng() * TAU); }
  { const a = spot(sLife, walkEdge + 6.2, sp); P.addLifeguardTower(batchAt(sLife), a.x, a.y, a.z, a.yawSea); }
  const chunkMeshes = chunks.map((b, i) => { const m = b.build(U); m.name = 'chunk' + i; group.add(m); return m; });
  for (const [i, b] of frondB.entries()) { const m = b.build(U); m.name = 'frond' + i; m.userData.toonOnly = true; group.add(m); chunkMeshes.push(m); }
  const leafTex = leafletTexture();
  for (const [i, b] of cardB.entries()) {                                                                 // 小叶卡片：透明裁形，只在写实画风显示
    const m = b.build(U, { outline: false, map: leafTex }); m.name = 'frondCards' + i; m.userData.realOnly = true; m.userData.alphaCard = true; m.visible = false;
    group.add(m); chunkMeshes.push(m);
  }
  let triCount = 0; for (const m of chunkMeshes) triCount += m.geometry.index.count / 3;

  // ———————————— 灯塔（岛内最高点）与栈桥 ————————————
  const B = track.bounds, n0 = {};
  let best = { y: -1 };
  for (let i = 1; i < 36; i++) for (let j = 1; j < 36; j++) {
    const x = B.minX + ((B.maxX - B.minX) * i) / 36, z = B.minZ + ((B.maxZ - B.minZ) * j) / 36;
    const y = terrainHeight(track, x, z, n0);
    if (n0.u < -20 && y > best.y) best = { y, x, z };
  }
  const lighthouse = createLighthouse(U, best.x ?? 0, (best.y ?? 20) - 0.25, best.z ?? 0);
  group.add(lighthouse.group);
  // 山坡植被：岛内随机撒树和灌木（避开塔基与小径）
  { const far = terrain.dirtPath(spot(track.nearest(best.x, best.z, {}).s, innerEdge - 1.2, {}), { x: best.x, z: best.z }, 1.8, 0xd9c08e);
    const mid = { x: (best.x + far.from.x) / 2, z: (best.z + far.from.z) / 2 };
    const hill = Array.from({ length: 8 }, () => new ToonBatch('hill'));
    for (let i = 0; i < 70; i++) {
      const x = B.minX + rng() * (B.maxX - B.minX), z = B.minZ + rng() * (B.maxZ - B.minZ), nn = track.nearest(x, z, {});
      if (nn.u > -22) continue;
      const dTower = Math.hypot(x - best.x, z - best.z); if (dTower < 13) continue;
      const dPath = Math.abs((x - mid.x) * far.dir.x + (z - mid.z) * far.dir.z); if (dPath < 3.5 && Math.hypot(x - best.x, z - best.z) < far.len) continue;
      const y = terrainHeight(track, x, z, nn), ang = Math.atan2(z - (B.minZ + B.maxZ) / 2, x - (B.minX + B.maxX) / 2);
      const b = hill[Math.min(7, Math.floor(((ang + Math.PI) / TAU) * 8))];          // 按方位分成 8 个合批
      if (rng() < 0.42) P.addTree(b, x, y, z, rng); else P.addBush(b, x, y, z, rng, { big: rng() < 0.5 });
    }
    for (const b of hill) { const m = b.build(U); m.name = 'hillTrees'; group.add(m); } }
  const pierOrigin = spot(sPier, walkEdge - 0.2, {}), pierDir = new THREE.Vector3(Math.sin(pierOrigin.yawSea), 0, Math.cos(pierOrigin.yawSea));
  const pier = createPier(U, new THREE.Vector3(pierOrigin.x, pierOrigin.roadY + ROAD.curbH, pierOrigin.z), pierDir, { len: 34 });
  group.add(pier.group);

  // ———————————— 活物与漂浮物 ————————————
  const gulls = [];
  const gullHomes = [pier.end.clone(), lighthouse.top.clone().add(new THREE.Vector3(0, -8, 0)), new THREE.Vector3((B.minX + B.maxX) / 2, 6, B.maxZ)];
  for (let i = 0; i < (quality === 0 ? 4 : 8); i++) {
    const g = createGull(U); group.add(g.group);
    gulls.push({ g, home: gullHomes[i % 3].clone().add(new THREE.Vector3((rng() - 0.5) * 30, 0, (rng() - 0.5) * 30)), r: 12 + rng() * 22, h: 6 + rng() * 16, w: (0.18 + rng() * 0.12) * (rng() < 0.5 ? -1 : 1), a: rng() * TAU, scare: 0, k: 0, lift: 0, glideT: rng() * 6 });
  }
  const buoys = [];
  for (const f of [0.08, 0.27, 0.46, 0.66, 0.9]) { const a = spot(L * f, walkEdge + 24 + rng() * 10, {}); const m = createBuoy(U, f === 0.46 ? PC.sun : PC.coral); m.position.set(a.x, 0, a.z); group.add(m); buoys.push(m); }
  const boats = [];
  for (const f of [0.31, 0.78]) {
    const a = spot(L * f, walkEdge + 48 + rng() * 30, {});
    const b = new ToonBatch('boat');
    b.add(loftGeometry((t, out) => out.set(0, 0.3 * Math.sin(t * Math.PI) * 0.3, -2.4 + 4.8 * t), (t) => { const w = Math.pow(Math.sin(t * Math.PI), 0.55); return { a: 0.95 * w + 0.01, bt: 0.03, bb: 0.75 * Math.pow(Math.sin(t * Math.PI), 0.5) + 0.01 }; }, { rings: 16, radial: 14 }), null, PC.white, { spec: 0.35 });
    b.add(S.cyl(0.05, 0.07, 6.4, 8).translate(0, 3.4, 0.2), null, PC.woodDark, {});
    b.add(S.extrude([[0, 0], [0, 5.6], [2.6, 0.2]], 0.03, { bevel: 0 }).rotateY(Math.PI / 2).translate(-0.03, 0.55, 0.25), null, PC.cream, { outline: 1 });     // 主帆
    b.add(S.extrude([[0, 0], [0, 4.6], [-1.9, 0.15]], 0.03, { bevel: 0 }).rotateY(Math.PI / 2).translate(0.03, 0.55, 0.35), null, PC.coral, { outline: 1 });   // 前帆
    const m = b.build(U); m.position.set(a.x, 0, a.z); m.rotation.y = rng() * TAU; group.add(m); boats.push({ m, ph: rng() * 6, yaw: m.rotation.y });
  }

  // ———————————— 跃鱼 ————————————
  const fishGeoBatch = fishGeometry(0.62);
  const fishes = [];
  for (let i = 0; i < 5; i++) { const m = fishGeoBatch.build(U); m.visible = false; m.name = 'fish' + i; group.add(m); fishes.push({ m, on: false, t: 0, p0: V(), d: V(), h: 0, dur: 1, pos: V() }); }

  // ———————————— 特效：涟漪 / 水滴 / 尘土 ————————————
  const fxGroup = new THREE.Group(); fxGroup.name = 'fx'; group.add(fxGroup);
  const rippleGeo = new THREE.RingGeometry(0.84, 1, 40).rotateX(-Math.PI / 2);
  const dropGeo = S.sphere(0.05, 8, 6);
  const ripples = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(rippleGeo, flatMaterial(U, 0xffffff, { opacity: 0 })); m.visible = false; fxGroup.add(m); return { m, on: false, t: 0, life: 1, s0: 1 }; });
  const drops = Array.from({ length: 22 }, () => { const m = new THREE.Mesh(dropGeo, flatMaterial(U, 0xffffff, { opacity: 0 })); m.visible = false; fxGroup.add(m); return { m, on: false, v: V(), t: 0 }; });
  const dusts = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(dropGeo, flatMaterial(U, 0xf3ead6, { opacity: 0 })); m.visible = false; fxGroup.add(m); return { m, on: false, v: V(), t: 0 }; });
  let foamColor = new THREE.Color(1, 1, 1);
  const hooks = { onSplash: null };

  // ———————————— 局部光源槽（供 toon 材质） ————————————
  let real = false;
  const lightsOut = [0, 1, 2].map(() => ({ pos: V(), dir: V(), color: new THREE.Color(1, 0.92, 0.7), cosInner: 0.93, cosOuter: 0.80, range: 0, intensity: 0 }));
  const sunDir = V(), moonDir = V();
  let lampLevel = 0, time = 0, qLevel = quality;
  const seaPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const api = {
    group, track, sea, sky, terrain, lighthouse, pier, lightsOut, hooks, fxGroup,
    landmarks: { lighthouse: lighthouse.top.clone(), pier: pier.end.clone(), pierStart: new THREE.Vector3(pierOrigin.x, pierOrigin.roadY + ROAD.curbH, pierOrigin.z) },
    stats() {
      const tris = triCount;
      return { chunks: N, triangles: Math.round(tris), gulls: gulls.length };
    },
    applyPalette(p) {
      const az = p.sunAz * DEG, el = p.sunEl * DEG, ce = Math.cos(el);
      sunDir.set(Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce).normalize();
      moonDir.copy(sky.uniforms.uMoonDir.value);
      sky.applyPalette(p, sunDir); sea.applyPalette(p, sunDir, moonDir); terrain.applyPalette(p); clouds.applyPalette(p); far.applyPalette(p);
      foamColor.setRGB(...p.seaFoam).convertSRGBToLinear();                 // 平面材质的 uColor 统一是线性空间
    },
    setQuality(l) {
      qLevel = l;
      for (const m of chunkMeshes) m.castShadow = l >= 1;
      if (real) sea.setQuality(l);
    },
    /** 接上写实渲染层：地形 / 天空 / 海换成各自的写实材质，并登记随时刻、随画风更新的回调 */
    enableReal(kit) {
      real = true;
      terrain.enableReal(kit);
      sky.enableReal(kit.K);
      sea.enableReal(kit, kit.renderer);
      kit.postHide.push(fxGroup);
      kit.onLook.push((look) => { sky.applyReal(look, MOON_COLOR); sea.applyReal(look); });
      kit.onStyle.push((on) => { clouds.group.visible = !on; });
      sea.setQuality(qLevel);
    },
    /** 写实：画海面倒影（镜像相机把场景再画一遍） */
    renderReflection(scene, camera) { sea.renderReflection(scene, camera, [sea.mesh, fxGroup]); },
    hitSea(raycaster) {
      const pt = V();
      if (!raycaster.ray.intersectPlane(seaPlane, pt)) return null;
      if (pt.lengthSq() > 900 * 900) return null;
      if (terrainHeight(track, pt.x, pt.z) > -0.3) return null;
      pt.y = waveHeight(pt.x, pt.z, time, 8);
      return { point: pt };
    },
    splash(point, strength = 1) {
      for (const r of ripples) if (!r.on) { r.on = true; r.t = 0; r.life = 1.5; r.s0 = 0.35 + strength * 0.3; r.m.position.copy(point); r.m.visible = true; break; }
      let k = 0;
      for (const d of drops) if (!d.on && k < 6 + strength * 6) {
        k++; d.on = true; d.t = 0; d.m.visible = true; d.m.position.copy(point);
        const a = rng() * TAU, sp2 = (0.8 + rng() * 1.6) * strength;
        d.v.set(Math.cos(a) * sp2, 2.6 + rng() * 3.2 * strength, Math.sin(a) * sp2);
        d.m.scale.setScalar(0.6 + rng() * 0.9);
      }
      hooks.onSplash && hooks.onSplash(strength);
    },
    /** 鱼跃：返回 { position, t, alive }（position 随动画更新），没有空闲的鱼时返回 null */
    fishJump(point) {
      const f = fishes.find((x) => !x.on);
      if (!f) return null;
      const a = rng() * TAU;
      f.on = true; f.t = 0; f.dur = 1.15 + rng() * 0.25; f.h = 0.95 + rng() * 0.5;
      f.p0.copy(point); f.d.set(Math.cos(a), 0, Math.sin(a)).multiplyScalar(2.6 + rng() * 1.6);
      f.m.visible = true; f.m.position.copy(point);
      api.splash(point, 0.55);
      return { position: f.pos, get t() { return f.t; }, get alive() { return f.on; } };
    },
    dust(point, strength = 1) {
      let k = 0;
      for (const d of dusts) if (!d.on && k < 3 + strength * 4) {
        k++; d.on = true; d.t = 0; d.m.visible = true; d.m.position.copy(point).add(_a.set((rng() - 0.5) * 0.5, 0.05, (rng() - 0.5) * 0.5));
        const a = rng() * TAU; d.v.set(Math.cos(a) * 1.3, 0.5 + rng() * 0.9, Math.sin(a) * 1.3);
      }
    },
    gullFlock: {
      scatter(center) { for (const gl of gulls) if (gl.g.group.position.distanceTo(center) < 55) gl.scare = Math.max(gl.scare, 1); },
      /** 附近有没有会被惊飞的海鸥（用于提示文案） */
      nearCount(center, radius = 55) { let n = 0; for (const gl of gulls) if (gl.g.group.position.distanceTo(center) < radius) n++; return n; },
    },
    /** 路线坐标 (s, u) → 世界坐标（含地面高度、朝向）；导演机位与交互取点用 */
    spot,
    /** 海侧近处一处水面（世界坐标，y = 0） */
    randomSeaPoint(s, out = new THREE.Vector3()) { const a = spot(s + (Math.random() - 0.3) * 24, walkEdge + 11 + Math.random() * 12, {}); return out.set(a.x, 0, a.z); },
    update(dt, ctx) {
      time = ctx.time ?? (time + dt);
      const hero = ctx.heroPos;
      lampLevel = ctx.lampLevel ?? 0;
      sky.update(time, ctx.camera); clouds.update(dt);
      lighthouse.update(dt, { lampLevel });
      // 浮标与帆船随波
      for (const m of buoys) m.position.y = waveHeight(m.position.x, m.position.z, time, 8) + 0.02;
      for (const b of boats) { b.m.position.y = waveHeight(b.m.position.x, b.m.position.z, time, 8) * 0.8; b.m.rotation.set(Math.sin(time * 0.9 + b.ph) * 0.04, b.yaw + Math.sin(time * 0.2 + b.ph) * 0.05, Math.sin(time * 1.1 + b.ph) * 0.05); }
      // 海鸥：绕巢盘旋；被惊吓后爬升加速
      for (const gl of gulls) {
        // 被惊飞：k 快起慢落；爬升高度经过限速（每秒最多 3.5 m），不会在一帧里“瞬移”上去
        gl.scare = Math.max(0, gl.scare - dt / 6.5);
        gl.k = damp(gl.k, gl.scare, 10, dt);                 // 约 0.3 秒起势，随 scare 在 6.5 秒里消退
        const k = gl.k;
        gl.lift += clamp(12 * k - gl.lift, -3 * dt, 3.5 * dt);  // 最多爬 12 m：每秒 3.5 m 上、3 m 下
        gl.a += dt * gl.w * (1 + 2.2 * k);
        gl.glideT += dt; if (gl.glideT > 5 + (gl.w * 97 % 3)) { gl.glideT = -2 - (gl.w * 53 % 3); }
        const gliding = gl.glideT < 0 && gl.scare < 0.1;
        const r = gl.r * (1 + 0.8 * k), h = gl.h + gl.lift + Math.sin(gl.a * 2.3) * 1.6;
        _a.set(Math.cos(gl.a) * r, h, Math.sin(gl.a) * r).add(gl.home);
        _b.set(Math.cos(gl.a + 0.08) * r, h + Math.cos(gl.a * 2.3) * 0.35, Math.sin(gl.a + 0.08) * r).add(gl.home);
        gl.g.group.position.copy(_a);
        gl.g.group.lookAt(_b);
        gl.g.group.rotateZ(-0.35 * Math.sign(gl.w) * (1 + k));
        gl.g.update(time, { flapping: !gliding });
      }
      // 跃鱼
      for (const f of fishes) {
        if (!f.on) continue;
        f.t += dt / f.dur;
        if (f.t >= 1) { f.on = false; f.m.visible = false; api.splash(f.m.position, 0.9); continue; }
        const u = f.t;
        _a.copy(f.p0).addScaledVector(f.d, u); _a.y = f.h * Math.sin(Math.PI * u) * 1.6 - 0.1;
        f.m.position.copy(_a); f.pos.copy(_a);
        const vy = f.h * Math.PI * Math.cos(Math.PI * u) * 1.6 / f.dur, vh = f.d.length() / f.dur;
        f.m.rotation.set(0, Math.atan2(f.d.x, f.d.z), 0);
        f.m.rotateX(-Math.atan2(vy, vh));
        f.m.rotateZ(Math.sin(u * 38) * 0.25);
      }
      // 特效
      for (const r of ripples) if (r.on) {
        r.t += dt / r.life;
        if (r.t >= 1) { r.on = false; r.m.visible = false; continue; }
        const s = (r.s0 + r.t * 2.6) * 1.0; r.m.scale.set(s, 1, s);
        r.m.material.uniforms.uOpacity.value = (1 - r.t) * 0.85;
        r.m.material.uniforms.uColor.value.copy(foamColor);
        r.m.position.y = waveHeight(r.m.position.x, r.m.position.z, time, 8) + 0.05;
      }
      for (const d of drops) if (d.on) {
        d.t += dt; d.v.y -= 9.81 * dt; d.m.position.addScaledVector(d.v, dt);
        const life = 0.85; if (d.t > life || d.v.y < 0 && d.m.position.y < waveHeight(d.m.position.x, d.m.position.z, time, 8)) { d.on = false; d.m.visible = false; continue; }
        d.m.material.uniforms.uOpacity.value = 1 - d.t / life;
      }
      for (const d of dusts) if (d.on) {
        d.t += dt; d.v.multiplyScalar(1 - dt * 2.2); d.v.y += dt * 0.3; d.m.position.addScaledVector(d.v, dt);
        if (d.t > 0.75) { d.on = false; d.m.visible = false; continue; }
        const s = 1.6 + d.t * 6; d.m.scale.set(s, s * 0.8, s);
        d.m.material.uniforms.uOpacity.value = (1 - d.t / 0.75) * 0.55;
      }
      // 局部光源：灯塔光束 + 离主体最近的两盏路灯
      lightsOut[0].range = lampLevel > 0.02 ? 260 : 0;
      lightsOut[0].pos.copy(lighthouse.lampPos); lightsOut[0].dir.copy(lighthouse.lightDir); lightsOut[0].intensity = 0.5 * lampLevel;
      if (lampLevel > 0.02 && hero) {
        const nearLamps = lampPos.map((p) => ({ p, d: p.distanceToSquared(hero) })).filter((x) => x.d < 70 * 70).sort((a, b) => a.d - b.d).slice(0, 2);
        for (let i = 0; i < 2; i++) {
          const slot = lightsOut[1 + i], lp = nearLamps[i]?.p;
          // 一盏灯就是地上一汪暖光：半径约 10 m（灯距 27 m，光斑之间留出暗处）
          if (lp) { slot.pos.copy(lp); slot.dir.set(0, -1, 0); slot.range = 10.5; slot.intensity = 0.96 * lampLevel; slot.cosInner = 0.2; slot.cosOuter = -1; slot.color.setRGB(1, 0.84, 0.56); }
          else slot.range = 0;
        }
      } else { lightsOut[1].range = 0; lightsOut[2].range = 0; }
      for (let i = 0; i < 3; i++) {                                          // 写入 toon 材质的 1~3 号光源槽
        const sl = lightsOut[i], k = i + 1;
        U.uLightsPos.value[k].copy(sl.pos); U.uLightsDir.value[k].copy(sl.dir); U.uLightsColor.value[k].copy(sl.color);
        U.uLightsParam.value[k].set(sl.cosInner, sl.cosOuter, sl.intensity, sl.range);
      }
    },
  };
  return api;
}
