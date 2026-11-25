// 静态碰撞体（轴对齐或带朝向的盒子）+ 竖直圆柱体的移动 + 射线。纯数学，不依赖 three，可在 Node 里测试。
// 坐标：X 沿船身，Y 向上，Z 横跨。盒子朝向 yaw：从 +X 转向 +Z（弧度）；世界 → 盒子局部：
//   lx = cos·dx + sin·dz，lz = -sin·dx + cos·dz
export const FLOOR = Object.freeze({ x0: -31.5, x1: 31.5, z0: -10.6, z1: 10.6, y: 0 });

export class StaticWorld {
  constructor(floor = FLOOR) {
    this.solids = [];
    this.floor = floor;
  }

  /** 加一个盒子。x, z = 中心；hx, hz = 半宽；y0, y1 = 底和顶；yaw = 朝向；mat = 弹着材质；tag = 给游戏逻辑认的标签 */
  add(x, z, hx, hz, y0, y1, yaw = 0, mat = 'steel', tag = '') {
    const s = { x, z, hx, hz, y0, y1, c: Math.cos(yaw), s: Math.sin(yaw), r: Math.hypot(hx, hz), mat, tag, id: this.solids.length };
    this.solids.push(s);
    return s;
  }
  /** 轴对齐盒子的便捷写法：给两个角 */
  aabb(x0, x1, z0, z1, y0, y1, mat = 'steel', tag = '') { return this.add((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2, y0, y1, 0, mat, tag); }

  /** 竖直圆柱（脚在 y，半径 r，高 h）是否和某个实体相交。返回那个实体或 null。 */
  overlap(x, y, z, r, h, ignore = null) {
    for (const s of this.solids) {
      if (s === ignore || s.y1 <= y + 0.02 || s.y0 >= y + h - 0.02) continue;
      const dx = x - s.x, dz = z - s.z;
      if (dx * dx + dz * dz > (s.r + r) * (s.r + r)) continue;
      const lx = s.c * dx + s.s * dz, lz = -s.s * dx + s.c * dz;
      const px = Math.max(-s.hx, Math.min(s.hx, lx)) - lx, pz = Math.max(-s.hz, Math.min(s.hz, lz)) - lz;
      if (px * px + pz * pz < r * r) return s;
    }
    return null;
  }

  /** 脚下能站的最高面：地板，或顶面不高于 yLimit、且圆柱压在其上的盒子 */
  groundTop(x, z, r, yLimit) {
    const f = this.floor;
    let g = x > f.x0 && x < f.x1 && z > f.z0 && z < f.z1 && f.y <= yLimit ? f.y : -Infinity;
    for (const s of this.solids) {
      if (s.y1 > yLimit || s.y1 <= g) continue;
      const dx = x - s.x, dz = z - s.z;
      if (dx * dx + dz * dz > (s.r + r) * (s.r + r)) continue;
      const lx = s.c * dx + s.s * dz, lz = -s.s * dx + s.c * dz;
      const px = Math.max(-s.hx, Math.min(s.hx, lx)) - lx, pz = Math.max(-s.hz, Math.min(s.hz, lz)) - lz;
      if (px * px + pz * pz < r * r) g = s.y1;
    }
    return g;
  }

  /**
   * 推进一个圆柱体：b = { x, y, z, vx, vy, vz, r, h, step, onGround }。
   * 水平方向推出所碰的盒子（脚边不高于 step 的台面直接迈上去），竖直方向落到最高的支撑面上，顶头时停住。
   */
  move(b, dt) {
    const S = this.solids;
    let nx = b.x + b.vx * dt, nz = b.z + b.vz * dt;
    for (let iter = 0; iter < 4; iter++) {
      let hit = false;
      for (const s of S) {
        if (s.y1 <= b.y + 0.02 || s.y0 >= b.y + b.h - 0.02) continue;              // 高度上不重叠（脚下的台面不算）
        const dx = nx - s.x, dz = nz - s.z;
        if (dx * dx + dz * dz > (s.r + b.r) * (s.r + b.r)) continue;
        const lx = s.c * dx + s.s * dz, lz = -s.s * dx + s.c * dz;
        const ox = lx - Math.max(-s.hx, Math.min(s.hx, lx)), oz = lz - Math.max(-s.hz, Math.min(s.hz, lz));
        const d2 = ox * ox + oz * oz;
        if (d2 >= b.r * b.r) continue;
        if (b.onGround && s.y1 - b.y <= b.step + 1e-3 && s.y1 > b.y) {               // 台阶
          if (!this.overlap(nx, s.y1, nz, b.r, b.h, s)) { b.y = s.y1; hit = true; continue; }
        }
        let kx, kz;
        if (d2 > 1e-9) { const k = (b.r - Math.sqrt(d2)) / Math.sqrt(d2); kx = ox * k; kz = oz * k; }
        else {                                                                        // 圆心在盒子里：沿最薄的方向推出
          const ex = s.hx - Math.abs(lx) + b.r, ez = s.hz - Math.abs(lz) + b.r;
          if (ex < ez) { kx = lx >= 0 ? ex : -ex; kz = 0; } else { kx = 0; kz = lz >= 0 ? ez : -ez; }
        }
        nx += s.c * kx - s.s * kz; nz += s.s * kx + s.c * kz;
        hit = true;
      }
      if (!hit) break;
    }
    b.x = nx; b.z = nz;
    let ny = b.y + b.vy * dt;
    const r = b.r * 0.86;
    const g = this.groundTop(b.x, b.z, r, b.y + (b.onGround ? b.step + 0.02 : 0.06));
    if (b.vy <= 0 && ny <= g + 1e-4) { ny = g; b.vy = 0; b.onGround = true; }
    else b.onGround = false;
    if (b.vy > 0) for (const s of S) {                                                 // 顶头
      if (s.y0 < b.y + b.h - 0.06 || ny + b.h <= s.y0) continue;
      const dx = b.x - s.x, dz = b.z - s.z;
      if (dx * dx + dz * dz > (s.r + r) * (s.r + r)) continue;
      const lx = s.c * dx + s.s * dz, lz = -s.s * dx + s.c * dz;
      const px = Math.max(-s.hx, Math.min(s.hx, lx)) - lx, pz = Math.max(-s.hz, Math.min(s.hz, lz)) - lz;
      if (px * px + pz * pz < r * r) { ny = s.y0 - b.h; b.vy = 0; }
    }
    b.y = ny;
    if (b.y < -30) b.fell = true;
    return b;
  }

  /**
   * 射线：起点 (ox, oy, oz)，单位方向 (dx, dy, dz)，最远 maxDist。
   * 返回 null 或 { t, x, y, z, nx, ny, nz, solid, mat }（先打到地板也算）。
   */
  raycast(ox, oy, oz, dx, dy, dz, maxDist, skip = null) {
    let best = maxDist, hit = null, axis = -1, sign = 0;
    const f = this.floor;
    if (dy < -1e-6 && f.y <= oy) {
      const t = (f.y - oy) / dy, x = ox + dx * t, z = oz + dz * t;
      if (t >= 0 && t < best && x > f.x0 && x < f.x1 && z > f.z0 && z < f.z1) { best = t; hit = f; axis = 1; sign = 1; }
    }
    for (const s of this.solids) {
      if (s === skip) continue;
      const rx = s.x - ox, rz = s.z - oz, tca = rx * dx + rz * dz;
      if (tca < -s.r - 1 || tca - s.r > best) continue;
      const cx = s.c * (ox - s.x) + s.s * (oz - s.z), cz = -s.s * (ox - s.x) + s.c * (oz - s.z);
      const ex = s.c * dx + s.s * dz, ez = -s.s * dx + s.c * dz;
      let tmin = 0, tmax = best, ax = -1, sg = 0, miss = false;
      const slab = (lo, hi, o, d, a) => {
        if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) miss = true; return; }
        let t1 = (lo - o) / d, t2 = (hi - o) / d, s1 = -1;
        if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; s1 = 1; }
        if (t1 > tmin) { tmin = t1; ax = a; sg = s1; }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) miss = true;
      };
      slab(-s.hx, s.hx, cx, ex, 0); slab(s.y0, s.y1, oy, dy, 1); slab(-s.hz, s.hz, cz, ez, 2);
      if (miss || ax < 0 || tmin >= best) continue;
      best = tmin; hit = s; axis = ax; sign = sg;
    }
    if (!hit) return null;
    const n = hit === this.floor ? [0, 1, 0] : axis === 1 ? [0, sign, 0] : axis === 0 ? [hit.c * sign, 0, hit.s * sign] : [-hit.s * sign, 0, hit.c * sign];
    return { t: best, x: ox + dx * best, y: oy + dy * best, z: oz + dz * best, nx: n[0], ny: n[1], nz: n[2], solid: hit, mat: hit === this.floor ? 'deck' : hit.mat };
  }

  /** 从 a 到 b 的视线是否通畅 */
  los(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.hypot(dx, dy, dz);
    if (len < 1e-6) return true;
    return !this.raycast(ax, ay, az, dx / len, dy / len, dz / len, len - 0.05);
  }

  /** 半径 r、高 h 的圆柱沿线段走过去，全程都不撞东西（寻路拉直用；沿途取样） */
  corridorFree(ax, az, bx, bz, r, h = 1.8, y = 0) {
    const len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(len / 0.2));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      if (this.overlap(ax + (bx - ax) * t, y + 0.05, az + (bz - az) * t, r, h - 0.1)) return false;
    }
    return true;
  }
}
