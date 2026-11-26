// 「十一城」的平面图：地标都在官方小地图的像素坐标上定点，再换算成世界坐标（米）。
// 赛道之外的地方：主岛中央是 NOVA 商城和它前面的绿色穹顶广场，西北角是展览馆，
// 跨海大桥上有 NOVA 拱门和斜拉桥塔，大桥西端是石塔桥，港湾北岸有看台，东北岸是环塔。
import { toWorld, SCALE } from '../core/trackdef.js';

const W = (px, py) => toWorld(px, py);
const rectAt = (c, w, d) => ({ x0: c[0] - w / 2, x1: c[0] + w / 2, z0: c[1] - d / 2, z1: c[1] + d / 2 });

export const PLAN = Object.freeze({
  mall: { hall: { c: W(97.5, 83), w: 111, d: 42, h: 26 }, wing: { c: W(89.5, 74), w: 63, d: 24, h: 15 } },   // 商城：主馆、西翼
  canopy: { c: W(88, 103), r: 30, h: 14 },                       // 商城前广场上的绿色六边网格穹顶
  domes: [{ c: W(39, 26), r: 27 }, { c: W(50.5, 43), r: 15 }],   // 展览馆：一大一小两个测地线穹顶
  archX: W(97, 0)[0],                                             // NOVA 拱门所在的里程（跨海大桥上）
  pylonX: [W(82, 0)[0], W(117, 0)[0]],                            // 斜拉桥塔
  towerBridge: W(73, 126.6),                                      // 石塔桥：大桥西端跨内港水道处
  stand: rectAt(W(115, 114.6), 66, 24),                           // 港湾北岸看台（面向赛道）
  ring: { c: W(137, 30), y: 290, r: 50 },                         // 东北岸的环塔：观景塔 + 桅杆顶上悬着六边形环
});

/** 地标占地（世界坐标，米），平面自检用。kind：rect | circle | poly */
export const FOOTPRINTS = Object.freeze([
  { name: 'mall', kind: 'poly', pts: [[79, 70], [100, 70], [100, 76], [116, 76], [116, 90], [79, 90]].map(([x, y]) => W(x, y)), minClear: 5 },
  { name: 'canopy', kind: 'circle', c: PLAN.canopy.c, r: PLAN.canopy.r, minClear: 4 },
  { name: 'dome1', kind: 'circle', c: PLAN.domes[0].c, r: PLAN.domes[0].r + 3, minClear: 5 },
  { name: 'dome2', kind: 'circle', c: PLAN.domes[1].c, r: PLAN.domes[1].r + 3, minClear: 5 },
  { name: 'stand', kind: 'rect', x0: PLAN.stand.x0, x1: PLAN.stand.x1, z0: PLAN.stand.z0, z1: PLAN.stand.z1, minClear: 4 },
  { name: 'ring', kind: 'circle', c: PLAN.ring.c, r: 16, minClear: 12 },
]);
/** 地标必须落在陆地还是水面上 */
export const NEED = Object.freeze({ mall: 'land', canopy: 'land', dome1: 'land', dome2: 'land', stand: 'land', ring: 'land' });

/** 不放普通楼房的矩形（像素）：地标自己占的地方 */
export const EXCLUDE = Object.freeze([
  [77, 68, 119, 92],      // 商城
  [76, 92, 102, 119],     // 穹顶广场
  [102, 108, 128, 121],   // 看台
  [24, 12, 60, 53],       // 展览馆
  [60, 50, 84, 70],       // 顶部横道和发卡弯之间留出视野
  [128, 20, 147, 40],     // 环塔脚下留出广场
]);

/** 只盖低层商铺的区块（像素）：商城以东、看台以西的滨水街区，不能挡住从大桥看商城的视线 */
export const LOWRISE = Object.freeze([[101, 90, 130, 109]]);

/** 世界坐标 (X, Z) 是否落在给定像素矩形里 */
const inPxRect = (X, Z, [x0, y0, x1, y1]) => { const px = X / SCALE + 84.5, py = Z / SCALE + 73.5; return px >= x0 && px <= x1 && py >= y0 && py <= y1; };
export const inLowrise = (X, Z) => LOWRISE.some((rc) => inPxRect(X, Z, rc));

/** 世界坐标 (X, Z) 是否落在任何一个不建房的矩形里 */
export function inExclude(X, Z) {
  for (const rc of EXCLUDE) if (inPxRect(X, Z, rc)) return true;
  return false;
}

/** 小地图像素矩形 → 世界坐标 [x0, z0, x1, z1] */
export const rectW = ([x0, y0, x1, y1]) => [...W(x0, y0), ...W(x1, y1)];
