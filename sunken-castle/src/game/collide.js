// 碰撞：游泳的人不能穿过海床、礁石、城墙、桥墩、船身……也不能浮出水面。纯计算，不依赖 three。
// 碰撞体有三种：圆（{ x, z, r, y1 }，从很深一直到 y1）、带端点的线段（墙：{ ax, az, bx, bz, s0, s1, r, y1 }，a→b 是墙的中心线，s0..s1 是这一段的起止）、方盒（{ box: [x0, x1, z0, z1], y0, y1 }）。
// 所有的碰撞体按地块（cell 米见方）登记；查询时只看脚下那一格。墙的线段高出墙头就不再挡人，所以能从塌口、门洞、墙头上游过去。
import { height, WORLD } from '../core/seabed.js';

const SURFACE = -0.9;                                    // 头顶离水面至少留这么多（浪谷在水下 0.5 米左右）
const abyssCentre = WORLD.abyss;

/** 把点 p（[x, y, z]）挤到所有碰撞体外面。radius：人的半径。结果写回 p 并返回。out：临时用的法线，可省 */
export function createColliders(list, o = {}) {
  const cell = o.cell ?? 24, pad = (o.radius ?? 0.6) + 0.5, grid = new Map();
  const put = (c, x0, z0, x1, z1) => {
    for (let i = Math.floor(x0 / cell); i <= Math.floor(x1 / cell); i++) for (let j = Math.floor(z0 / cell); j <= Math.floor(z1 / cell); j++) {
      const k = i + ',' + j;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(c);
    }
  };
  for (const c of list) {
    if (c.box) put(c, c.box[0] - pad, c.box[2] - pad, c.box[1] + pad, c.box[3] + pad);
    else if (c.ax !== undefined) {
      const dx = c.bx - c.ax, dz = c.bz - c.az, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
      c._a = [c.ax + ux * c.s0, c.az + uz * c.s0]; c._d = [ux * (c.s1 - c.s0), uz * (c.s1 - c.s0)];
      put(c, Math.min(c.ax + ux * c.s0, c.ax + ux * c.s1) - c.r - pad, Math.min(c.az + uz * c.s0, c.az + uz * c.s1) - c.r - pad, Math.max(c.ax + ux * c.s0, c.ax + ux * c.s1) + c.r + pad, Math.max(c.az + uz * c.s0, c.az + uz * c.s1) + c.r + pad);
    } else put(c, c.x - c.r - pad, c.z - c.r - pad, c.x + c.r + pad, c.z + c.r + pad);
  }
  return {
    list, cell, grid, hits: 0,
    /** 这一点附近（上下也算）有没有东西挡着：镜头、分镜的检查用。clearance：要求留出的空隙 */
    clear(x, y, z, radius = 0.6) {
      if (y < height(x, z) + radius || y > SURFACE - radius * 0.5) return false;
      for (const c of grid.get(`${Math.floor(x / cell)},${Math.floor(z / cell)}`) ?? []) {
        if (c.box) { if (x > c.box[0] - radius && x < c.box[1] + radius && z > c.box[2] - radius && z < c.box[3] + radius && y > c.y0 - radius && y < c.y1 + radius) return false; }
        else if (c.ax !== undefined) { if (y < c.y1 + radius * 0.5 && segDist(x, z, c) < c.r + radius) return false; }
        else if (y < c.y1 + radius * 0.5 && Math.hypot(x - c.x, z - c.z) < c.r + radius) return false;
      }
      return true;
    },
    /** 把人挤出去。p 是 [x, y, z]。返回true 表示碰到了东西 */
    resolve(p, radius = o.radius ?? 0.6) {
      let touched = false, x = p[0], y = p[1], z = p[2];
      const floor = height(x, z) + radius * 0.85;                                    // 海床：从头到脚有一多半在沙子外面就算站着
      if (y < floor) { y = floor; touched = true; }
      if (y > SURFACE) { y = SURFACE; touched = true; }
      const rr = Math.hypot(x - abyssCentre.x, z - abyssCentre.z);
      if (rr > WORLD.extent * 0.9) { const k = WORLD.extent * 0.9 / rr; x = abyssCentre.x + (x - abyssCentre.x) * k; z = abyssCentre.z + (z - abyssCentre.z) * k; touched = true; }   // 深渊里别游太远
      const near = grid.get(`${Math.floor(x / cell)},${Math.floor(z / cell)}`) ?? [];
      for (let pass = 0; pass < 3; pass++) {                                          // 角落里要挤两三次才干净
        let moved = false;
        for (const c of near) {
          if (c.box) {
            if (x <= c.box[0] - radius || x >= c.box[1] + radius || z <= c.box[2] - radius || z >= c.box[3] + radius || y <= c.y0 - radius * 0.5 || y >= c.y1 + radius * 0.5) continue;
            const dx0 = x - (c.box[0] - radius), dx1 = c.box[1] + radius - x, dz0 = z - (c.box[2] - radius), dz1 = c.box[3] + radius - z, dy0 = y - (c.y0 - radius * 0.5), dy1 = c.y1 + radius * 0.5 - y;
            const m = Math.min(dx0, dx1, dz0, dz1, dy0, dy1);                         // 从离得最近的那一面挤出去
            if (m === dx0) x = c.box[0] - radius; else if (m === dx1) x = c.box[1] + radius; else if (m === dz0) z = c.box[2] - radius; else if (m === dz1) z = c.box[3] + radius; else if (m === dy0) y = c.y0 - radius * 0.5; else y = c.y1 + radius * 0.5;
          } else if (c.ax !== undefined) {
            if (y >= c.y1 + radius * 0.5) continue;
            const ex = x - c._a[0], ez = z - c._a[1], t = Math.max(0, Math.min(1, (ex * c._d[0] + ez * c._d[1]) / (c._d[0] * c._d[0] + c._d[1] * c._d[1] || 1)));
            let dx = ex - c._d[0] * t, dz = ez - c._d[1] * t;
            let d = Math.hypot(dx, dz);
            if (d >= c.r + radius) continue;
            if (d < 1e-5) { dx = -c._d[1]; dz = c._d[0]; d = Math.hypot(dx, dz); }    // 正好骑在墙的中心线上：随便往一侧推
            const k = (c.r + radius) / d; x = c._a[0] + c._d[0] * t + dx * k; z = c._a[1] + c._d[1] * t + dz * k;
          } else {
            if (y >= c.y1 + radius * 0.5) continue;
            const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz);
            if (d >= c.r + radius) continue;
            if (d < 1e-5) { x = c.x + c.r + radius; z = c.z; } else { const k = (c.r + radius) / d; x = c.x + dx * k; z = c.z + dz * k; }   // 正好在圆心上：随便往一边推
          }
          moved = true; touched = true;
        }
        if (!moved) break;
      }
      const f2 = height(x, z) + radius * 0.85;                                       // 被墙挤出去以后可能又陷进沙里，再托一次
      if (y < f2) { y = f2; touched = true; }
      p[0] = x; p[1] = y; p[2] = z;
      if (touched) this.hits++;
      return touched;
    },
  };
}

function segDist(x, z, c) {
  const ex = x - c._a[0], ez = z - c._a[1], t = Math.max(0, Math.min(1, (ex * c._d[0] + ez * c._d[1]) / (c._d[0] * c._d[0] + c._d[1] * c._d[1] || 1)));
  return Math.hypot(ex - c._d[0] * t, ez - c._d[1] * t);
}
