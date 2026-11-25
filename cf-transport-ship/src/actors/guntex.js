// 枪和手专用的细纹贴图 + 材质。枪模离镜头只有半米，船的那套贴图（一张覆盖一两米）放到枪上等于没有细节，
// 这里另烤一套密得多的：烤蓝钢、层压木、聚合物、手套皮革、袖子布料。颜色仍然走顶点色，贴图只管中性的明暗和粗糙度。
import * as THREE from 'three';
import { Fbm, bake, clamp01 } from '../gfx/texgen.js';

/** 每种材质一张贴图覆盖几米（建几何时按它投影 UV） */
export const GUN_TEXEL = Object.freeze({ metal: 0.07, wood: 0.12, paint: 0.05, glove: 0.045, cloth: 0.07, lens: 0.05, blade: 0.07 });
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** 烤蓝 / 磷化钢：发乌的底色、顺着一个方向的拉丝、零星的细划痕露出亮钢 */
function steelTex() {
  const mott = new Fbm(10, 3, 301), brush = new Fbm(60, 2, 302, 0.5, 34), scuff = new Fbm(110, 2, 303), grime = new Fbm(4, 2, 304);
  return bake(256, 256, (u, v, s) => {
    const m = mott.at(u, v), b = brush.at(v, u), scratch = sstep(0.855, 0.93, scuff.at(v * 0.35, u)), g = sstep(0.58, 0.86, grime.at(u, v));
    const k = 0.84 + (m - 0.5) * 0.16 + (b - 0.5) * 0.07 + scratch * 0.26 - g * 0.10;
    s.rgb = [k, k, k * 1.012];
    s.h = 0.5 + (b - 0.5) * 0.05 + (m - 0.5) * 0.03 - scratch * 0.10;
    s.r = clamp01(0.52 + (m - 0.5) * 0.16 + g * 0.14 - scratch * 0.26);
    s.m = 1;
    s.a = 1 - g * 0.12;
  }, { normal: 1.3 });
}

/** 层压枪木（AK 的护木和枪托）：顺着 u 方向的年轮条纹、棕眼、清漆的光泽 */
function woodTex() {
  const warp = new Fbm(4, 3, 311), fine = new Fbm(9, 3, 312, 0.55, 26), pore = new Fbm(150, 2, 313, 0.5, 44), tone = new Fbm(2, 2, 314);
  return bake(512, 512, (u, v, s) => {
    const w = warp.at(u, v) - 0.5, f = fine.at(u, v) - 0.5, p = sstep(0.74, 0.86, pore.at(v, u));
    const rings = 0.5 + 0.5 * Math.sin((v * 9 + w * 1.7) * Math.PI * 2);
    const line = Math.pow(rings, 5), t = tone.at(u, v) - 0.5;
    const k = 0.90 + f * 0.20 - line * 0.34 - p * 0.14 + t * 0.08;
    s.rgb = [k * 1.0, k * 0.985, k * 0.96];
    s.h = 0.5 + f * 0.07 - line * 0.05 - p * 0.10;
    s.r = clamp01(0.40 + line * 0.10 + p * 0.12 + f * 0.06);
    s.m = 0;
    s.a = 1 - line * 0.10;
  }, { normal: 1.1 });
}

/** 聚合物 / 胶木：细密的点纹，磨亮的地方 */
function polyTex() {
  const n = new Fbm(120, 2, 321), rub = new Fbm(6, 3, 322), swirl = new Fbm(5, 3, 323, 0.6, 5);
  return bake(256, 256, (u, v, s) => {
    const a = n.at(u, v) - 0.5, r = sstep(0.62, 0.84, rub.at(u, v)), sw = swirl.at(u, v) - 0.5;
    const k = 0.86 + a * 0.10 + sw * 0.10 + r * 0.08;
    s.rgb = [k, k, k];
    s.h = 0.5 + a * 0.16;
    s.r = clamp01(0.56 + a * 0.10 - r * 0.20 + sw * 0.08);
    s.m = 0;
    s.a = 1;
  }, { normal: 1.0 });
}

/** 手套皮革：颗粒面 + 折纹 */
function leatherTex() {
  const n = new Fbm(34, 2, 331), crease = new Fbm(14, 3, 332, 0.6, 6), fibre = new Fbm(200, 2, 333);
  return bake(256, 256, (u, v, s) => {
    const c = n.at(u, v), pebble = 1 - Math.abs(2 * c - 1), cr = sstep(0.80, 0.90, crease.at(v, u)), f = fibre.at(u, v) - 0.5;
    const k = 0.80 + (pebble - 0.5) * 0.14 - cr * 0.26 + f * 0.05;
    s.rgb = [k, k, k];
    s.h = 0.5 + pebble * 0.10 - cr * 0.30 + f * 0.05;
    s.r = clamp01(0.60 + (1 - pebble) * 0.10 + cr * 0.14);
    s.m = 0;
    s.a = 1 - cr * 0.2;
  }, { normal: 1.4 });
}

/** 作战服的斜纹布：一根根斜着的布纹，加纤维的毛糙 */
function clothTex() {
  const fibre = new Fbm(180, 2, 341), wear = new Fbm(7, 3, 342);
  return bake(256, 256, (u, v, s) => {
    const tw = Math.sin((u * 56 + v * 28) * Math.PI * 2), f = fibre.at(u, v) - 0.5, w = wear.at(u, v) - 0.5;
    const k = 0.82 + tw * 0.05 + f * 0.06 + w * 0.10;
    s.rgb = [k, k, k];
    s.h = 0.5 + tw * 0.09 + f * 0.06;
    s.r = clamp01(0.92 - Math.max(0, w) * 0.16);
    s.m = 0;
    s.a = 1;
  }, { normal: 1.0 });
}

let cache = null;
/** 枪模、手、袖子的材质（全页面共用一套） */
export function createGunMaterials() {
  if (cache) return cache;
  const std = (b, o = {}) => new THREE.MeshStandardMaterial({ map: b.map, normalMap: b.normalMap, aoMap: b.ormMap, roughnessMap: b.ormMap, metalnessMap: b.ormMap, roughness: 1, metalness: 1, aoMapIntensity: 1, vertexColors: true, ...o });
  const S = steelTex(), W = woodTex(), P = polyTex(), L = leatherTex(), C = clothTex();
  cache = {
    metal: std(S, { metalness: 0.78, envMapIntensity: 0.6 }),                                                                  // 烤蓝钢
    blade: std(S, { metalness: 0.6, roughness: 0.5, normalScale: new THREE.Vector2(0.25, 0.25), envMapIntensity: 1.5 }),   // 刀锋：磨过的，亮
    wood: new THREE.MeshPhysicalMaterial({ map: W.map, normalMap: W.normalMap, aoMap: W.ormMap, roughnessMap: W.ormMap, metalnessMap: W.ormMap, roughness: 1, metalness: 1, vertexColors: true, clearcoat: 0.5, clearcoatRoughness: 0.28 }),
    paint: new THREE.MeshPhysicalMaterial({ map: P.map, normalMap: P.normalMap, aoMap: P.ormMap, roughnessMap: P.ormMap, metalnessMap: P.ormMap, roughness: 1, metalness: 1, vertexColors: true, specularIntensity: 0.5, envMapIntensity: 0.5 }),                                                            // 黑色聚合物、胶木、喷漆
    glove: new THREE.MeshPhysicalMaterial({ map: L.map, normalMap: L.normalMap, aoMap: L.ormMap, roughnessMap: L.ormMap, metalnessMap: L.ormMap, roughness: 1, metalness: 1, vertexColors: true, specularIntensity: 0.25, envMapIntensity: 0.3 }),   // 皮革很哑光，掠射角也别把天空整片反射回来
    cloth: new THREE.MeshPhysicalMaterial({ map: C.map, normalMap: C.normalMap, aoMap: C.ormMap, roughnessMap: C.ormMap, metalnessMap: C.ormMap, roughness: 1, metalness: 1, vertexColors: true, specularIntensity: 0.2, envMapIntensity: 0.3, sheen: 0.4, sheenRoughness: 0.8, sheenColor: new THREE.Color(0x6d7684) }),
    lens: new THREE.MeshPhysicalMaterial({ color: 0x8fb8e6, vertexColors: true, roughness: 0.04, metalness: 0, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.03 }),
  };
  return cache;
}
