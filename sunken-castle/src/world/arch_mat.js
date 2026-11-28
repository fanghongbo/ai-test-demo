// 建筑材质。每套贴图接成标准的 PBR 材质（颜色 + 法线 + 遮蔽·粗糙度·金属度），石头、铺地、大理石、木头再挂一层“附着层”（gfx/growth.js）。
// 顶点色在这里有第二个意思：石头的灰度倍率越小 = 风化得越厉害 = 长的东西越多（1 = 干净的室内石面）。
import * as THREE from 'three';
import { growable } from '../gfx/growth.js';

/** 把一套贴图接到材质上 */
function textured(W, T, o = {}) {
  return W.material({ map: T.map, normalMap: T.normalMap, roughnessMap: T.ormMap, metalnessMap: T.ormMap, aoMap: T.ormMap, ...o });
}

/**
 * @param {object} W createWaterLight()
 * @param {object} TX castleTextures()（每套贴图自带 tile：一张铺几米）
 */
export function archMaterials(W, TX) {
  const tile = { stone: TX.stone.tile, paving: TX.paving.tile, marble: TX.marble.tile, bronze: TX.bronze.tile, patina: TX.patina.tile, gold: TX.gold.tile, tile: TX.tile.tile, wood: TX.wood.tile };
  const glassMat = (map) => W.material({ color: 0x080808, map, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.12, metalness: 0, emissive: 0x000000, emissiveMap: map });
  const M = {
    stone: growable(textured(W, TX.stone, { roughness: 0.86 })),            // 泡在水里的石头没有干石头那种亮反光：粗糙度压高，灯照着是一片哑光，才不像瓷砖
    paving: growable(textured(W, TX.paving, { roughness: 0.84 })),
    marble: growable(textured(W, TX.marble, { roughness: 0.62 })),
    bronze: textured(W, TX.bronze, { roughness: 0.95 }),
    patina: textured(W, TX.patina, { roughness: 0.92 }),
    gold: textured(W, TX.gold, { roughness: 0.55 }),
    tile: textured(W, TX.tile, { roughness: 0.72 }),
    wood: growable(textured(W, TX.wood, { roughness: 0.76 })),
    woodD: growable(textured(W, TX.wood, { roughness: 0.78, side: THREE.DoubleSide })),       // 双面的朽木：船身的破洞里能看到里侧
    clay: growable(W.material({ color: 0x9a6a48, roughness: 0.93 })),                          // 陶罐：素烧的黏土
    dark: W.material({ color: 0x04060a, roughness: 1 }),                                   // 龛和洞里的黑
    iron: W.material({ color: 0x201a16, roughness: 0.64, metalness: 0.7 }),                 // 铁闸、铁条
    cloth: W.material({ color: 0xffffff, roughness: 0.95, side: THREE.DoubleSide }),       // 破旗、坐垫：颜色走顶点色
    glass: glassMat(TX.glassAtlas), rose: glassMat(TX.glassRose),                                       // 彩窗、玫瑰窗：透过来的日光的颜色在 setGlass 里给
    glow: W.basic({ color: 0xffffff }),                                               // 灯珠、明珠：颜色是亮度，可以大于 1
  };
  const grown = Object.values(M).filter((m) => m.userData.uGrowth);
  return {
    M, tile,
    /** 彩窗透出来的光：color 是日光走到窗子那个深度的颜色（线性，THREE.Color 或 Vector3），乘在玻璃的花纹上 */
    setGlass(color, k) { for (const m of [M.glass, M.rose]) m.emissive.setRGB((color.r ?? color.x) * k, (color.g ?? color.y) * k, (color.b ?? color.z) * k); },
    setGrowth(v) { for (const m of grown) m.userData.uGrowth.value = v; },
  };
}
