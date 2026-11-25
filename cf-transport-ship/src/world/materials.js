// 材质库。每种材质本身不带颜色：颜色来自顶点色（batch.js），所以一套“漆面”材质能画出所有带漆的钢构件。
// orm 贴图：R = 遮蔽、G = 粗糙度、B = 金属度（texgen.bake 的输出），同时接到 aoMap / roughnessMap / metalnessMap。
import * as THREE from 'three';

/** 各材质一张贴图覆盖几米（建几何时按它缩放 UV） */
export const TEXEL = Object.freeze({ paint: 2, metal: 1, wood: 1.2, deck: 4, hull: 16 });

function pbr(bake, o = {}) {
  return new THREE.MeshStandardMaterial({ map: bake.map, normalMap: bake.normalMap, aoMap: bake.ormMap, roughnessMap: bake.ormMap, metalnessMap: bake.ormMap, roughness: 1, metalness: 1, aoMapIntensity: 1, vertexColors: true, ...o });
}

export function createMaterials(T) {
  const M = {};
  M.paint = pbr(T.paint);                                              // 带漆的钢：栏杆、舱壁、集装箱、舰桥、吊机……
  M.paintFlat = pbr(T.paint, { normalScale: new THREE.Vector2(0.5, 0.5) });
  M.metal = pbr(T.metal);                                              // 裸金属
  M.wood = pbr(T.wood);                                                // 木板（木箱、枪托）
  M.deck = pbr(T.deck, { vertexColors: false });                       // 甲板钢板
  M.deckV = pbr(T.deck);                                               // 同上，带顶点色（舱底要压暗的地方）
  M.hull = pbr(T.hull, { vertexColors: false, normalScale: new THREE.Vector2(0.55, 0.55) });   // 船壳
  M.clothGR = new THREE.MeshStandardMaterial({ map: T.clothGR.map, normalMap: T.clothGR.normalMap, roughness: 0.95, metalness: 0, vertexColors: true });
  M.clothBL = new THREE.MeshStandardMaterial({ map: T.clothBL.map, normalMap: T.clothBL.normalMap, roughness: 0.95, metalness: 0, vertexColors: true });
  M.glass = new THREE.MeshPhysicalMaterial({ color: 0x10191d, roughness: 0.05, metalness: 0.0, envMapIntensity: 1.5, emissive: new THREE.Color(0xffc478), emissiveIntensity: 0 });
  M.lamp = new THREE.MeshStandardMaterial({ color: 0xfff3d6, emissive: new THREE.Color(0xffd08a), emissiveIntensity: 8, roughness: 0.35, metalness: 0 });
  M.lampRed = new THREE.MeshStandardMaterial({ color: 0x5a0c08, emissive: new THREE.Color(0xff2a12), emissiveIntensity: 10, roughness: 0.4 });
  M.lampGreen = new THREE.MeshStandardMaterial({ color: 0x063a18, emissive: new THREE.Color(0x28ff66), emissiveIntensity: 10, roughness: 0.4 });
  M.matte = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.86, metalness: 0, vertexColors: true });     // 橡胶、塑料、帆布
  M.webbing = pbr(T.paint, { metalness: 0, roughness: 1.8, normalScale: new THREE.Vector2(0.7, 0.7), envMapIntensity: 0.5 });   // 尼龙织物：护甲、弹匣包、头盔（士兵用）
  M.decal = new THREE.MeshStandardMaterial({ map: T.decal, alphaTest: 0.45, roughness: 0.78, metalness: 0, vertexColors: true, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  M.grating = new THREE.MeshStandardMaterial({ map: T.grating, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.75, vertexColors: true });
  M.fence = new THREE.MeshStandardMaterial({ map: T.fence, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.7, vertexColors: true });
  M.orange = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, vertexColors: true, map: T.paint.map, normalMap: T.paint.normalMap, aoMap: T.paint.ormMap, roughnessMap: T.paint.ormMap, metalnessMap: T.paint.ormMap });
  return M;
}

/** 夜里窗和灯的发光强度随“人造光系数”变化 */
export function setLampLevel(M, level, night = 0) {
  M.lamp.emissiveIntensity = 0.15 + 7.5 * level;
  M.lampRed.emissiveIntensity = 2 + 10 * level; M.lampGreen.emissiveIntensity = 2 + 10 * level;
  M.glass.emissiveIntensity = 0.9 * level;
}
