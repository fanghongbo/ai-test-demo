// 「十一城」的陆地轮廓（海上城市：一座大岛 + 西南岸 + 桥下的港湾）。坐标用小地图像素标注。
// 赛道底部那条长直道是跨海大桥：两头在陆地上，中段悬在港湾的水面上（南边是外海，北边是商城前的港湾）。
import { SCALE, toWorld } from '../core/trackdef.js';

/** 岛屿多边形（像素）。A = 主岛，B = 西南岸（引桥拐角那一块）。 */
export const ISLANDS = Object.freeze({
  A: [[22, 8], [160, 8], [160, 131], [126, 131], [126, 119], [76, 119], [76, 112], [22, 112]],
  B: [[22, 112], [70, 112], [70, 131], [22, 131]],
});
/** 陆地的轴对齐矩形并集（像素），用来算“离岸距离” */
export const LAND_RECTS = Object.freeze([[22, 8, 160, 112], [76, 112, 160, 119], [126, 119, 160, 131], [22, 112, 70, 131]]);
/** 港湾（像素）：桥下那片水面。起点线在桥的正中，北岸是商城广场和看台 */
export const BASIN = Object.freeze([70, 119, 126, 140]);
/** 内港水道（像素）：大桥西端跨过它上岸，石塔桥的两个桥塔就立在水道里 */
export const INLET = Object.freeze([70, 112, 76, 140]);
export const WATER_Y = -5;                               // 水面高度（陆地路面为 0）

/** 世界坐标下离最近陆地的距离（米）；在陆地上为 0 */
export function distToLand(X, Z) {
  const px = X / SCALE + 84.5, py = Z / SCALE + 73.5;
  let best = Infinity;
  for (const [x0, y0, x1, y1] of LAND_RECTS) {
    const dx = Math.max(x0 - px, 0, px - x1), dy = Math.max(y0 - py, 0, py - y1);
    const d = Math.hypot(dx, dy);
    if (d < best) best = d;
  }
  return best * SCALE;
}
export const landWorld = (poly) => poly.map(([x, y]) => toWorld(x, y));
