// 命中判定：射线 vs 人物的部位（头 = 球，躯干 / 腿 = 竖直胶囊），再和场景射线的结果比谁更近。纯数学，可在 Node 里测试。
import { HIT } from './config.js';

/** 射线与球：返回最近的正交点距离，没打中返回 -1（起点在球里也算没打中） */
export function raySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, r) {
  const lx = ox - cx, ly = oy - cy, lz = oz - cz;
  const b = lx * dx + ly * dy + lz * dz, c = lx * lx + ly * ly + lz * lz - r * r, disc = b * b - c;
  if (disc < 0) return -1;
  const t = -b - Math.sqrt(disc);
  return t >= 0 ? t : -1;
}

/** 射线与竖直圆柱（上下是平的）：侧面 + 上下两个圆面。返回最近的交点距离，没打中返回 -1 */
export function rayCylinderY(ox, oy, oz, dx, dy, dz, cx, y0, y1, cz, r) {
  let best = -1;
  const ex = ox - cx, ez = oz - cz, a = dx * dx + dz * dz;
  if (a > 1e-9) {                                                     // 侧面
    const b = 2 * (ex * dx + ez * dz), c = ex * ex + ez * ez - r * r, disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t >= 0) { const y = oy + t * dy; if (y >= y0 && y <= y1) return t; }
    }
  }
  for (const [y, need] of [[y1, dy < 0], [y0, dy > 0]]) {             // 上下圆面
    if (!need) continue;
    const t = (y - oy) / dy;
    if (t >= 0 && (best < 0 || t < best)) { const px = ox + t * dx - cx, pz = oz + t * dz - cz; if (px * px + pz * pz <= r * r) best = t; }
  }
  return best;
}

/** 人物的三个部位在当前姿态下的范围：[半径, y0, y1]（相对脚底） */
export function hitVolumes(body) {
  const h = body.h;
  return {
    head: { r: 0.13, y: h - 0.12 },
    body: { r: 0.24, y0: h * 0.54, y1: h * 0.85 },
    legs: { r: 0.2, y0: 0.06, y1: h * 0.54 },
  };
}

/**
 * 开枪的一条射线：先和场景比，再和每个人物的部位比。
 * @returns {null | { t, x, y, z, nx, ny, nz, mat, actor, part }} actor 为 null 表示打在场景上
 */
export function castShot(world, actors, o, d, maxDist, shooter, canHit) {
  const w = world.raycast(o[0], o[1], o[2], d[0], d[1], d[2], maxDist, null);
  let best = w ? w.t : maxDist, hit = w ? { t: w.t, x: w.x, y: w.y, z: w.z, nx: w.nx, ny: w.ny, nz: w.nz, mat: w.mat, actor: null, part: null } : null;
  for (const a of actors) {
    if (a === shooter || !a.alive || (canHit && !canHit(a))) continue;
    const v = hitVolumes(a.body), x = a.body.x, y = a.body.y, z = a.body.z;
    let t = raySphere(o[0], o[1], o[2], d[0], d[1], d[2], x, y + v.head.y, z, v.head.r), part = 'head', r = v.head.r;
    const tb = rayCylinderY(o[0], o[1], o[2], d[0], d[1], d[2], x, y + v.body.y0, y + v.body.y1, z, v.body.r);
    if (tb >= 0 && (t < 0 || tb < t)) { t = tb; part = 'chest'; r = v.body.r; }
    const tl = rayCylinderY(o[0], o[1], o[2], d[0], d[1], d[2], x, y + v.legs.y0, y + v.legs.y1, z, v.legs.r);
    if (tl >= 0 && (t < 0 || tl < t)) { t = tl; part = 'legs'; r = v.legs.r; }
    if (t >= 0 && t < best) {
      best = t;
      const px = o[0] + d[0] * t - x, py = o[1] + d[1] * t - y, pz = o[2] + d[2] * t - z;
      hit = { t, x: o[0] + d[0] * t, y: o[1] + d[1] * t, z: o[2] + d[2] * t, nx: px / r, ny: part === 'head' ? py / r : 0, nz: pz / r, mat: 'flesh', actor: a, part };
    }
  }
  return hit;
}

/** 距离衰减：start 米以内全额，到 end 米降到 min 倍 */
export function falloff(dist, start, end, min) { return dist <= start ? 1 : dist >= end ? min : 1 + (min - 1) * (dist - start) / (end - start); }

/** 这个部位最终造成多少伤害 */
export function damageFor(def, dist, part, armor) {
  const base = def.dmg * falloff(dist, def.range * 0.45, def.range, def.kind === 'sniper' ? 1 : 0.72) * (HIT[part] ?? 1);
  if (part === 'head') return base * (armor > 0 ? 0.84 : 1);
  return base * (armor > 0 ? 0.78 : 1);
}
