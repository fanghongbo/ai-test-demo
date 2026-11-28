// 把整个世界搭起来：海床 → 礁石 → 王城 → 珊瑚礁 → 巨藻和海草。每一步之间让出一帧，加载条上的字才画得出来。
import * as THREE from 'three';
import { seabedTextures } from './seabed_tex.js';
import { castleTextures } from './castle_tex.js';
import { stainedGlassTextures } from './glass_tex.js';
import { lifeTextures } from './coral_tex.js';
import { terrainMaterial, buildTerrain } from './terrain.js';
import { archMaterials } from './arch_mat.js';
import { buildCastle } from './castle.js';
import { scatterRocks, buildRocks } from './rocks.js';
import { coralMaterials } from './coral.js';
import { createReef, populateReef } from './reef.js';
import { scatterKelp, scatterGrass, buildKelp, assignVariants } from './kelp.js';
import { buildWreck } from './wreck.js';
import { buildRuins } from './ruins.js';
import { createSway } from '../gfx/sway.js';
import { mulberry32 } from '../core/mathx.js';
import { VENTS, height } from '../core/seabed.js';

/**
 * @param {object} stage createStage()
 * @param {(label: string, fn: () => any) => Promise<any>} step 换一行加载文字、让出浏览器、再干一件重活
 */
export async function buildWorld(stage, step) {
  const W = stage.W;
  const TX = await step('正在铺沙…', () => seabedTextures(512));
  const terrain = buildTerrain(terrainMaterial(W, TX));
  const rocksSc = scatterRocks(5);
  const rocks = buildRocks(W, TX, rocksSc);
  const glass = stainedGlassTextures();
  const TXA = { ...(await step('正在烧砖…', () => castleTextures())), glassAtlas: glass.atlas, glassRose: glass.rose };   // 建筑的贴图（彩窗的图集也在里面）
  const AM = archMaterials(W, TXA);
  const castle = buildCastle(AM), wreck = buildWreck(AM), ruins = buildRuins(AM);
  const L = await step('正在孵珊瑚虫…', () => lifeTextures());
  const sway = createSway(), CM = coralMaterials(W, L, sway);
  CM.kelp = sway.patch(W.material({ map: L.blade.map, normalMap: L.blade.normalMap, roughnessMap: L.blade.ormMap, metalnessMap: L.blade.ormMap, roughness: 0.62, side: THREE.DoubleSide, leaf: 0.9 }), 0.12, 0.55);
  CM.grass = sway.patch(W.material({ color: 0xffffff, roughness: 0.6, side: THREE.DoubleSide, leaf: 0.5 }), 0.20, 1.2);
  const reef = createReef(CM);
  await step('正在铺珊瑚礁…', () => populateReef(reef, rocksSc, { spots: [...castle.spots, ...wreck.spots, ...ruins.spots] }));
  const reefBuilt = reef.build();
  const r = mulberry32(99);
  const kelp = buildKelp(CM, assignVariants(scatterKelp(), r), assignVariants(scatterGrass(), r));
  const group = new THREE.Group();
  group.name = 'world';
  group.add(terrain, rocks.group, castle.group, wreck.group, ruins.group, reefBuilt.group, kelp);
  return {
    group, terrain, rocks, castle, wreck, ruins, reef: reefBuilt, reefItems: reef.kinds, kelp, AM, CM, sway, TX, TXA, L, pools: castle.pools,
    colliders: [...castle.colliders, ...rocksSc.colliders, ...wreck.colliders, ...ruins.colliders],
    lanterns: [...castle.lanterns, ...wreck.lanterns, ...ruins.lanterns],
    vents: VENTS.map(([x, z], i) => ({ p: [x, height(x, z) + 0.1, z], rate: 5 + (i % 3) * 4, size: 0.035 + (i % 2) * 0.03, spread: 0.7 })),
  };
}
