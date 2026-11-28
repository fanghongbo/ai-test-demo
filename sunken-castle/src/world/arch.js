// 建筑积木：带门窗洞的墙、城齿、塔楼、穹顶、柱子、扶壁、台阶……
// 全部输出“UV 以贴图为单位”的几何，交给合批器按材质合并；顺手登记碰撞体（墙体、塔身）和生长点（顶面、檐口——珊瑚和海藻之后散布在这里）。
// 约定：墙从 a=[x,z] 走到 b=[x,z]；局部 x 沿墙、y 向上、z 是墙的外侧（把 a→b 当作逆时针绕城一圈走，外侧就在左边）。
import * as THREE from 'three';
import { uvBox } from '../gfx/batch.js';
import { mulberry32, TAU } from '../core/mathx.js';
import { meshBuilder, V } from '../gfx/organic.js';
import { GLASS_DESIGNS, ROSE_REGION } from './glass_tex.js';

const V2 = (x, y) => new THREE.Vector2(x, y);

/**
 * 洞的轮廓（局部：x 沿墙居中，y 从洞底往上）。kind：pointed 尖拱（默认）/ round 半圆拱 / rect 矩形。
 * 尖拱是真正的两心拱：拱脚在 spring·h 的高度，两个圆心都落在拱脚连线上。
 */
export function openingPoints(w, h, o = {}) {
  const hw = w / 2, pts = [[-hw, 0]], kind = o.kind ?? 'pointed';
  if (kind === 'rect') { pts.push([-hw, h], [hw, h], [hw, 0]); return pts; }
  const n = o.n ?? 7;
  if (kind === 'round') {
    const hs = Math.max(h - hw, 0), nn = o.n ?? 8;
    for (let i = 0; i <= nn; i++) { const a = Math.PI - (i / nn) * Math.PI; pts.push([hw * Math.cos(a), hs + hw * Math.sin(a)]); }
    pts.push([hw, 0]); return pts;
  }
  const hs = h * (o.spring ?? 0.68), dy = Math.max(h - hs, 0.02), c = (dy * dy - hw * hw) / (2 * hw), R = hw + c, phi = Math.atan2(dy, -c);
  for (let i = 0; i <= n; i++) { const a = Math.PI + (phi - Math.PI) * (i / n); pts.push([c + R * Math.cos(a), hs + R * Math.sin(a)]); }
  for (let i = n - 1; i >= 0; i--) { const a = Math.PI + (phi - Math.PI) * (i / n); pts.push([-(c + R * Math.cos(a)), hs + R * Math.sin(a)]); }
  pts.push([hw, 0]);
  return pts;
}

/** 十字形的箭孔 */
export function slitPoints(w = 0.9, h = 1.7, t = 0.22) {
  const a = t / 2, b = w / 2, m = h * 0.56;
  return [[-a, 0], [a, 0], [a, m - a], [b, m - a], [b, m + a], [a, m + a], [a, h], [-a, h], [-a, m + a], [-b, m + a], [-b, m - a], [-a, m - a]];
}

/** 带洞的板：轮廓和洞都是点数组（绕向随意），沿 +z 拉伸 depth。UV 以米为单位 */
export function slab(outline, holes, depth) {
  const shape = new THREE.Shape(outline.map(([x, y]) => V2(x, y)));
  for (const h of holes ?? []) shape.holes.push(new THREE.Path(h.map(([x, y]) => V2(x, y))));
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}

export function scaleUV(g, su, sv) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  return g;
}
/** 圆柱 / 圆锥的 UV：绕一圈取整数张贴图（接缝处砌块对得上），上下按同样的比例，石头不会被拉扁 */
export function cylUV(g, r, len, tile) {
  const n = Math.max(1, Math.round((TAU * r) / tile));
  return scaleUV(g, n, len / (n * tile) * TAU * r);
}

/** 残破的塔身：一圈有厚度的墙，顶上按 topFn(第几列) 高低不平，里、外、顶面都有。shape(角度) 给半径的倍数（八边形塔用） */
export function ruinedDrum(r, t, topFn, o = {}) {
  const seg = o.seg ?? 32, tile = o.tile ?? 6, mb = meshBuilder();
  const n = Math.max(1, Math.round((TAU * r) / tile)), st = (n * tile) / (TAU * r), vt = 1 / (tile * st), it = 1 / tile;
  const col = (i) => { const a = (i / seg) * TAU, k = o.shape ? o.shape(a) : 1, c = Math.cos(a) * k, s = Math.sin(a) * k; return { c, s, h: topFn(i % seg), u: (i / seg) * n }; };
  for (let i = 0; i < seg; i++) {
    const A = col(i), B = col(i + 1), l = Math.hypot(A.c + B.c, A.s + B.s) || 1, ox = (A.c + B.c) / l, oz = (A.s + B.s) / l;
    mb.quad(V(r * A.c, 0, r * A.s, A.c, 0, A.s, A.u, 0), V(r * B.c, 0, r * B.s, B.c, 0, B.s, B.u, 0), V(r * B.c, B.h, r * B.s, B.c, 0, B.s, B.u, B.h * vt), V(r * A.c, A.h, r * A.s, A.c, 0, A.s, A.u, A.h * vt), [ox, 0, oz]);
    mb.quad(V((r - t) * A.c, 0, (r - t) * A.s, -A.c, 0, -A.s, A.u, 0), V((r - t) * B.c, 0, (r - t) * B.s, -B.c, 0, -B.s, B.u, 0), V((r - t) * B.c, B.h, (r - t) * B.s, -B.c, 0, -B.s, B.u, B.h * vt), V((r - t) * A.c, A.h, (r - t) * A.s, -A.c, 0, -A.s, A.u, A.h * vt), [-ox, 0, -oz]);
    mb.quad(V(r * A.c, A.h, r * A.s, 0, 1, 0, r * A.c * it, r * A.s * it), V(r * B.c, B.h, r * B.s, 0, 1, 0, r * B.c * it, r * B.s * it), V((r - t) * B.c, B.h, (r - t) * B.s, 0, 1, 0, (r - t) * B.c * it, (r - t) * B.s * it), V((r - t) * A.c, A.h, (r - t) * A.s, 0, 1, 0, (r - t) * A.c * it, (r - t) * A.s * it), [0, 1, 0]);
  }
  return mb.build();
}

/** 圆（玫瑰窗的洞） */
export function circlePoints(r, n = 28) { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }

/** 门洞 / 窗洞的石边框几何（以洞的左下角为原点，沿 +z 立起 depth） */
export function frameGeo(w, h, fw, depth, tl, op = {}) {
  return scaleUV(slab(openingPoints(w + fw * 2, h + fw * 1.15, op), [openingPoints(w, h, op)], depth), 1 / tl, 1 / tl);
}

/** 一块和洞一样大的玻璃板。region：用图集里的哪一种花样（glass_tex.js 的 GLASS_DESIGNS），UV 落到它的那一格 */
export function glassPane(w, h, op = {}, region = GLASS_DESIGNS[0]) {
  const g = new THREE.ShapeGeometry(new THREE.Shape(openingPoints(w, h, op).map(([x, y]) => V2(x, y))), 4), uv = g.attributes.uv, du = region.u1 - region.u0, dv = region.v1 - region.v0;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, region.u0 + (uv.getX(i) / w + 0.5) * du, region.v0 + (uv.getY(i) / h) * dv);
  return g;
}

/** a→b 这面墙的朝向角：局部 x 指向 b，局部 z 指向左侧（外） */
export const yawOf = (a, b) => Math.atan2(-(b[1] - a[1]), b[0] - a[0]);

/**
 * @param {object} B 合批器 createBatcher()
 * @param {object} M 材质：stone marble bronze patina gold tile wood dark
 * @param {object} tile 每种材质一张贴图铺几米
 * @param {{ colliders?: Array, spots?: Array, seed?: number, y0?: number }} o  y0：地基的世界高度——所有积木的 y 都是相对它的高度（碰撞体、生长点里存的是世界坐标）
 */
export function createArch(B, M, tile, o = {}) {
  const R = mulberry32(o.seed ?? 7), colliders = o.colliders ?? [], spots = o.spots ?? [];
  const tiles = new Map(Object.entries(tile).map(([k, v]) => [M[k], v]));
  const tileOf = (m) => tiles.get(m) ?? tile.stone;
  const fr = new THREE.Matrix4(), loc = new THREE.Matrix4(), rot = new THREE.Matrix4(), Y0 = o.y0 ?? 0;
  const put = (mat, g, m, tint) => { B.add(mat, g, m, tint); };
  const at = (x, y, z, yaw = 0) => fr.makeTranslation(x, y + Y0, z).multiply(rot.makeRotationY(yaw)).clone();
  const box = (mat, w, h, d, x, y, z, tint, yaw = 0, tl = tile.stone) => put(mat, uvBox(w, h, d, tl, x / tl, y / tl), at(x, y, z, yaw), tint);
  const cyl = (mat, rt, rb, h, x, y, z, tint, seg = 32, open = false, tl = tile.stone) => put(mat, cylUV(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), (rt + rb) / 2, h, tl), at(x, y, z), tint);

  const kit = {
    R, colliders, spots, put, at, box, cyl, y0: Y0,
    /** 从若干区间里挖掉若干区间 */
    subtract(intervals, cuts) {
      let out = intervals;
      for (const [c0, c1] of cuts) out = out.flatMap(([a, b]) => (c1 <= a || c0 >= b) ? [[a, b]] : [...(c0 > a ? [[a, c0]] : []), ...(c1 < b ? [[c1, b]] : [])]);
      return out;
    },
    /** 局部坐标（沿墙 s、高 y、向外 n）→ 世界坐标 */
    world(a, yaw, s, y, n) { return [a[0] + s * Math.cos(yaw) + n * Math.sin(yaw), y + Y0, a[1] - s * Math.sin(yaw) + n * Math.cos(yaw)]; },

    /**
     * 墙。o：h 高、t 厚、base 埋入地下的深度、openings [{ x, w, h, sill, kind, spring }]、gaps [[s0, s1, 最低, 最高]] 塌落的段（高度按比例）、
     * crenel 城齿、course 檐口带的高度数组、plinth 勒脚、tint 颜色倍率（1 干净，小 = 风化得厉害）、slit 每隔几米一个箭孔、
     * glass：洞里的彩窗用图集里的第几种花样（1 起）；pool { list, y, c }：这些彩窗的光斑落在高度 y（相对这堵墙）的地面上，
     * c 是屋里的一个点（世界 xz）——光斑落在它这一侧。每一扇彩窗往 list 里记一条，交给 actors/lightpools.js
     * noCollide 不登记碰撞体（很厚的墙——比如门楼——两头是圆的，会顶进门洞里；那种另外用方盒登记）
     */
    wall(a, b, o = {}) {
      if (!Number.isFinite(a[0] + a[1] + b[0] + b[1] + (o.h ?? 0) + (o.t ?? 0) + (o.yBase ?? 0))) throw new Error(`wall: 参数里有无效的数 ${JSON.stringify([a, b, o.h, o.t, o.yBase])}`);
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, yaw = yawOf(a, b), h = o.h ?? 7, t = o.t ?? 2.4, base = o.base ?? -2.5, tint = o.tint ?? 0.85, tl = tile.stone, yBase = o.yBase ?? 0;
      fr.makeTranslation(a[0], yBase + Y0, a[1]).multiply(rot.makeRotationY(yaw));
      const local = (mat, g, s, y, n, tint2 = tint) => put(mat, g, fr.clone().multiply(loc.makeTranslation(s, y, n)), tint2);
      const lb = (mat, w, hh, d, s, y, n, tint2, yaw2 = 0, tl2 = tl) => put(mat, uvBox(w, hh, d, tl2, s / tl2, (y + yBase + Y0) / tl2), fr.clone().multiply(loc.makeTranslation(s, y, n)).multiply(rot.makeRotationY(yaw2)), tint2);
      const gaps = (o.gaps ?? []).slice().sort((p, q) => p[0] - q[0]);
      const top = [[0, h]];
      for (const [s0, s1, lo, hi] of gaps) { top.push([s0, h]); let s = s0; while (s < s1) { const w = Math.min(0.9 + R() * 2.2, s1 - s), hh = h * (lo + (hi - lo) * R()); top.push([s, hh], [s + w, hh]); s += w; } top.push([s1, h]); }
      top.push([L, h]);
      const holes = (o.openings ?? []).map((op) => (op.kind === 'slit' ? slitPoints(op.w, op.h) : op.kind === 'circle' ? circlePoints(op.w / 2) : openingPoints(op.w, op.h, op)).map(([x, y]) => [x + op.x, y + (op.sill ?? 0)]));
      if (o.slit) for (let s = o.slit * 0.6; s < L - o.slit * 0.3; s += o.slit) holes.push(slitPoints(0.9, 1.7).map(([x, y]) => [x + s, y + (o.slitY ?? h * 0.45)]));
      local(M.stone, scaleUV(slab([[0, base], [L, base], ...top.slice().reverse()], holes, t), 1 / tl, 1 / tl), 0, 0, 0);
      if (o.plinth !== false) lb(M.stone, L, 1.5, t + 0.5, L / 2, -0.55, t / 2, tint);                          // 勒脚：露出地面约 0.7 米
      // 门窗的配套：石边框（外面，室内再一圈）、窗台、窗花、剩下的彩窗玻璃
      for (const op of o.openings ?? []) {
        if (op.kind === 'slit' || op.bare) continue;
        const ox = op.x, oy = op.sill ?? 0, fm = op.frameMat ?? o.frameMat ?? M.stone, ftl = tileOf(fm), ftint = op.frameTint ?? (o.frameTint ?? 0.92), fw = op.fw ?? 0.24;
        if (op.kind === 'circle') {
          put(fm, new THREE.TorusGeometry(op.w / 2 + fw * 0.5, fw * 0.62, 6, 36), fr.clone().multiply(loc.makeTranslation(ox, oy, 0.02)), ftint);
        } else {
          if (op.frame !== false) {
            local(fm, kit.frame(fm, op.w, op.h, fw, 0.3, op, ftl), ox, oy, -0.07, ftint);
            lb(fm, op.w + fw * 2 + 0.34, 0.2, 0.7, ox, oy - 0.08, 0.18, ftint, 0, ftl);
            if (o.inner !== false) put(fm, kit.frame(fm, op.w, op.h, fw * 0.8, 0.24, op, ftl), fr.clone().multiply(loc.makeTranslation(ox, oy, t + 0.06)).multiply(rot.makeRotationY(Math.PI)), ftint * 0.95);
          }
          if (op.tracery) {
            const hs = op.h * (op.spring ?? 0.68), rr = Math.min(op.w * 0.27, (op.h - hs) * 0.5);
            lb(M.marble, 0.17, hs + rr * 0.9, 0.26, ox, oy + (hs + rr * 0.9) / 2, t / 2, ftint, 0, tile.marble);
            put(M.marble, new THREE.TorusGeometry(rr, 0.075, 6, 22), fr.clone().multiply(loc.makeTranslation(ox, oy + hs + rr * 0.95, t / 2)), ftint);
          }
        }
        if (op.glass) {
          const circle = op.kind === 'circle', region = circle ? ROSE_REGION : (GLASS_DESIGNS[op.glass - 1] ?? GLASS_DESIGNS[0]);
          local(circle ? M.rose : M.glass, circle ? new THREE.CircleGeometry(op.w / 2 - 0.05, 40) : glassPane(op.w, op.h, op, region), ox, oy, t * 0.6, [1, 1, 1]);
          if (o.pool) {
            const n = circle ? circlePoints(op.w / 2 - 0.05, 28) : openingPoints(op.w, op.h, op).map(([x, y]) => [x, y - op.h / 2]);
            const side = Math.sign((o.pool.c[0] - a[0]) * Math.sin(yaw) + (o.pool.c[1] - a[1]) * Math.cos(yaw));          // 屋子在墙的哪一侧
            if (side) o.pool.list.push({ c: kit.world(a, yaw, ox, yBase + oy + (circle ? op.w / 2 : op.h / 2), t * 0.6), u: [Math.cos(yaw), 0, -Math.sin(yaw)], n: [side * Math.sin(yaw), 0, side * Math.cos(yaw)], pts: n, w: op.w, h: circle ? op.w : op.h, region, yFloor: Y0 + o.pool.y, run: o.pool.run ?? 15 });
          }
        }
      }
      for (const cy of o.course ?? []) lb(M.stone, L, 0.26, t + 0.26, L / 2, cy, t / 2, tint);                    // 檐口带
      // 完整的段：城齿、护栏、碰撞体、生长点。标了 pass 的洞（门、拱廊）不挡人
      const pass = (o.openings ?? []).filter((op) => op.pass).map((op) => [op.x - op.w / 2 + 0.15, op.x + op.w / 2 - 0.15]);
      const full = []; let s0 = 0;
      for (const g of gaps) { if (g[0] > s0) full.push([s0, g[0]]); s0 = g[1]; }
      if (s0 < L) full.push([s0, L]);
      for (const [f0, f1] of full) {
        const mx = nx * (t / 2), mz = nz * (t / 2);                                                                               // 墙体在 a→b 的左侧（外面），中心线离 a→b 有半个墙厚
        for (const [c0, c1] of kit.subtract([[f0, f1]], pass)) if (!o.noCollide) colliders.push({ ax: a[0] + mx, az: a[1] + mz, bx: b[0] + mx, bz: b[1] + mz, s0: c0, s1: c1, r: t / 2, y1: yBase + Y0 + h + (o.crenel ? 1.5 : 0) });
        if (o.crenel) {
          for (let s = f0 + 0.35; s + 1.25 < f1 - 0.1; s += 2.4) { if (R() < 0.86) lb(M.stone, 1.25, 1.4 + R() * 0.25, 0.55, s + 0.625, h + 0.7, 0.275, tint); }
          lb(M.stone, f1 - f0, 0.45, 0.3, (f0 + f1) / 2, h + 0.22, t - 0.15, tint);
          for (let s = f0 + 0.8; s < f1 - 0.8; s += 1.6 + R() * 2.4) spots.push({ p: kit.world(a, yaw, s, yBase + h + 0.02, 0.3 + R() * (t - 0.9)), s: 0.5 + R() * 0.9 });
        } else if (o.cope !== false) {
          lb(M.stone, f1 - f0, 0.3, t + 0.3, (f0 + f1) / 2, h + 0.15, t / 2, tint);
          if (o.spots !== false) for (let s = f0 + 0.8; s < f1 - 0.8; s += 2 + R() * 3) spots.push({ p: kit.world(a, yaw, s, yBase + h + 0.32, 0.4 + R() * (t - 0.8)), s: 0.4 + R() * 0.8 });
        }
      }
      for (const g of gaps) {                                                                                      // 塌口两侧的顶上也能长东西
        for (const s of [g[0] - 0.3, g[1] + 0.3]) if (s > 0 && s < L) spots.push({ p: kit.world(a, yaw, s, yBase + h + 0.02, t * (0.3 + R() * 0.4)), s: 0.6 + R() * 0.8 });
      }
      return { L, yaw };
    },

    /** 门洞 / 窗洞的石边框：外轮廓比洞大一圈，贴着墙的面立起来 */
    frame(m, w, h, fw, depth, o = {}, tl = tile.marble) {
      return frameGeo(w, h, fw, depth, tl, o);
    },

    /** 灯笼：石座、铜柱、铜笼子、发光的珠子。y 是灯珠的高度；记进 lanterns（世界坐标），光晕和点光源在别处画 */
    lantern(x, y, z, col, power = 1, post = true, r = 2.2, out = []) {
      if (post) {
        box(M.stone, 1.0, 0.9, 1.0, x, y - 4.05, z, 0.86, 0, tile.stone);
        cyl(M.bronze, 0.09, 0.14, 3.0, x, y - 2.05, z, 1, 10, false, tile.bronze);          // 从石座顶上一直接到灯座底下
        cyl(M.bronze, 0.3, 0.1, 0.22, x, y - 0.5, z, 1, 10, false, tile.bronze);
      }
      put(M.bronze, new THREE.TorusGeometry(0.44, 0.035, 6, 20), at(x, y, z));
      put(M.bronze, new THREE.TorusGeometry(0.44, 0.035, 6, 20), at(x, y, z).multiply(rot.makeRotationY(Math.PI / 2)));
      cyl(M.bronze, 0.05, 0.22, 0.2, x, y + 0.52, z, 1, 10, false, tile.bronze);
      put(M.glow, new THREE.SphereGeometry(0.3, 14, 10), at(x, y, z), col);
      out.push({ p: [x, y + Y0, z], c: col, power, r });
    },

    /** 圆塔。o：r h roof('cone' | 'broken' | 'crenel') coneH bands tint y（塔基的高度） */
    tower(x, z, o = {}) {
      const r = o.r ?? 4.2, h = o.h ?? 12, yb = o.y ?? 0, seg = o.seg ?? 36, tint = o.tint ?? 0.82, top = yb + h, roof = o.roof ?? 'cone';
      cyl(M.stone, r + 0.6, r + 1.7, 3.4, x, yb - 1.0, z, tint, seg, true);
      if (roof === 'broken') {
        const jag = []; for (let i = 0; i < seg; i++) jag.push(0.45 + 0.55 * R());
        put(M.stone, ruinedDrum(r, 0.9, (i) => h * (0.45 + 0.5 * (0.5 * jag[i] + 0.5 * jag[(i + 1) % seg])), { seg, tile: tile.stone }), at(x, yb, z), tint);
        put(M.stone, cylUV(new THREE.CylinderGeometry(r - 0.9, r - 0.9, 1, seg), r, 1, tile.stone), at(x, yb + h * 0.32, z), tint * 0.8);     // 里面的碎砖积到这个高度
        for (let i = 0; i < seg; i += 2) spots.push({ p: [x + r * 0.85 * Math.cos((i / seg) * TAU), Y0 + yb + h * (0.45 + 0.5 * jag[i]), z + r * 0.85 * Math.sin((i / seg) * TAU)], s: 0.6 + R() * 0.8 });
        colliders.push({ x, z, r: r + 0.3, y1: Y0 + yb + h * 0.45 });
      } else {
        cyl(M.stone, r * 0.965, r + 0.45, h + 1.6, x, yb + (h + 1.6) / 2 - 1.6, z, tint, seg, true);
        for (const f of o.bands ?? [0.4]) cyl(M.stone, r + 0.16, r + 0.2, 0.26, x, yb + h * f, z, tint, seg);
        const rc = r * 0.965 + 0.2;
        for (let i = 0; i < seg; i += 2) {                                                                        // 挑台下的梁托（盒子顺着半径方向）
          const a = (i / seg) * TAU; box(M.stone, 0.7, 0.7, 0.44, x + (rc + 0.02) * Math.cos(a), top - 0.35, z + (rc + 0.02) * Math.sin(a), tint, -a, tile.stone);
        }
        cyl(M.stone, rc + 0.55, rc + 0.42, 1.0, x, top + 0.5, z, tint, seg, true);                                  // 挑出来的护墙
        cyl(M.stone, rc + 0.55, rc + 0.55, 0.12, x, top + 0.06, z, tint, seg, false);
        if (roof === 'crenel') {
          for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; box(M.stone, 1.1, 1.1, 0.45, x + (rc + 0.3) * Math.cos(a), top + 1.55, z + (rc + 0.3) * Math.sin(a), tint, Math.PI / 2 - a, tile.stone); if (R() < 0.5) spots.push({ p: [x + rc * 0.6 * Math.cos(a + 0.2), top + 1.02 + Y0, z + rc * 0.6 * Math.sin(a + 0.2)], s: 0.5 + R() * 0.8 }); }
          colliders.push({ x, z, r: rc + 0.6, y1: top + Y0 + 2.1 });
        } else {
          const H = o.coneH ?? r * 2.3, rr = rc + 0.95, g = new THREE.ConeGeometry(rr, H, seg, 3, true);
          put(o.roofMat ?? M.patina, cylUV(g, rr * 0.6, Math.hypot(rr, H), tile[o.roofTile ?? 'patina']), at(x, top + 1.0 + H / 2, z));
          for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; B.rod(M.gold, [x, Y0 + top + 1.0 + H + 0.1, z], [x + rr * Math.cos(a), Y0 + top + 1.0, z + rr * Math.sin(a)], 0.07); }   // 从尖顶拉到屋面脚的 8 根金辐条
          cyl(M.gold, 0.02, 0.2, 2.2, x, top + 1.0 + H + 1.1, z, 1, 8, false, tile.gold);
          put(M.gold, cylUV(new THREE.SphereGeometry(0.42, 12, 10), 0.42, 0.8, tile.gold), at(x, top + 1.0 + H + 0.3, z));
          for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; spots.push({ p: [x + (rc + 0.45) * Math.cos(a), top + 1.03 + Y0, z + (rc + 0.45) * Math.sin(a)], s: 0.4 + R() * 0.6 }); }
          colliders.push({ x, z, r: rc + 0.6, y1: top + Y0 + 1.0 + H });
        }
      }
      // 窗：贴在塔身上的尖拱龛（深色）+ 石边框
      for (const w of o.windows ?? [{ a: 0.6, y: 0.55 }, { a: 2.7, y: 0.55 }, { a: 4.5, y: 0.78 }]) {
        const rr = (roof === 'broken' ? r : r * 0.965) + 0.02, ang = w.a, wy = yb + h * w.y, ww = w.w ?? 1.1, wh = w.h ?? 2.6, m = at(x + rr * Math.cos(ang), wy, z + rr * Math.sin(ang), -ang + Math.PI / 2);
        put(M.dark, new THREE.PlaneGeometry(ww, wh), m.clone().multiply(loc.makeTranslation(0, wh / 2, 0.02)), 1);
        put(M.marble, kit.frame('marble', ww, wh, 0.2, 0.22), m.clone().multiply(loc.makeTranslation(0, 0, -0.02)), 0.9);
        put(M.marble, uvBox(ww + 0.8, 0.2, 0.55, tile.marble), m.clone().multiply(loc.makeTranslation(0, -0.06, 0.12)), 0.9);    // 窗台
      }
      return top;
    },

    /** 穹顶：旋转体壳（铜绿）+ 16 条金肋 + 顶上的金球和尖 + 里面那颗夜明珠 */
    dome(x, y, z, Rd, H, o = {}) {
      const prof = [0, 0.1, 0.22, 0.36, 0.5, 0.64, 0.78, 0.9, 1.0], rad = [1, 0.985, 0.945, 0.875, 0.775, 0.645, 0.475, 0.27, 0];
      const pts = [new THREE.Vector2(Rd + 0.35, -0.5), new THREE.Vector2(Rd + 0.35, 0.25), new THREE.Vector2(Rd, 0.45)];
      for (let i = 0; i < prof.length; i++) pts.push(new THREE.Vector2(Rd * rad[i] * (o.flat ?? 1), 0.45 + H * prof[i]));
      const shell = new THREE.LatheGeometry(pts, 48);
      put(M.patina, scaleUV(shell, 16, (Rd + H) / tile.patina), at(x, y, z));
      const ribAt = (k, lift) => { const a = (k / 16) * TAU + Math.PI / 16, c = []; for (let i = 0; i < prof.length; i++) { const rr = Rd * rad[i] * (o.flat ?? 1) + lift; c.push(new THREE.Vector3(x + rr * Math.cos(a), y + 0.45 + H * prof[i] + lift * 0.3, z + rr * Math.sin(a))); } return c; };
      for (let k = 0; k < 16; k++) put(M.gold, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribAt(k, 0.05)), 18, o.rib ?? 0.14, 5, false), at(0, 0, 0));
      const ty = y + 0.45 + H;
      cyl(M.gold, Rd * 0.9, Rd * 0.95, 0.5, x, y + 0.2, z, 1, 48, false, tile.gold);
      put(M.gold, cylUV(new THREE.SphereGeometry(0.8, 16, 12), 0.8, 1.6, tile.gold), at(x, ty + 0.5, z));
      cyl(M.gold, 0.03, 0.3, 4.2, x, ty + 3.1, z, 1, 8, false, tile.gold);
      put(M.gold, new THREE.TorusGeometry(1.25, 0.08, 6, 28), at(x, ty + 1.7, z).multiply(rot.makeRotationX(0.5)));
      return ty + 1.6;
    },

    /** 大理石柱。broken：断柱，顶是斜的 */
    column(x, y, z, h, r = 0.45, o = {}) {
      const tint = o.tint ?? 0.9, broken = !!o.broken, hh = broken ? h * (0.25 + R() * 0.5) : h, mat = o.mat ?? M.marble, tl = o.tile ?? tile.marble;
      kit.box(mat, r * 2.9, 0.32, r * 2.9, x, y + 0.16, z, tint, R(), tl);
      kit.box(mat, r * 2.4, 0.26, r * 2.4, x, y + 0.45, z, tint, 0, tl);
      kit.cyl(mat, r * 1.12, r * 1.2, 0.2, x, y + 0.66, z, tint, 20, false, tl);
      const sh = hh - 0.86 - (broken ? 0 : 0.75);
      kit.cyl(mat, r * 0.88, r, sh, x, y + 0.76 + sh / 2, z, tint, o.seg ?? 20, false, tl);
      if (broken) { kit.put(mat, cylUV(new THREE.CylinderGeometry(r * 0.88, r * 0.9, 0.5, o.seg ?? 20), r, 0.5, tl), at(x, y + 0.76 + sh, z).multiply(loc.makeRotationZ(0.25 + R() * 0.2)), tint * 0.85); spots.push({ p: [x, y + Y0 + 0.9 + sh, z], s: 0.5 + R() * 0.5 }); }
      else { kit.cyl(mat, r * 1.3, r * 0.9, 0.5, x, y + 0.76 + sh + 0.25, z, tint, 20, false, tl); kit.box(mat, r * 2.7, 0.28, r * 2.7, x, y + 0.76 + sh + 0.62, z, tint, 0, tl); }
      return y + hh;
    },

    /** 扶壁：贴着墙往外伸的台阶状石墩。ang：往外指的方向 */
    buttress(x, z, ang, h, o = {}) {
      const w = o.w ?? 1.3, d = o.d ?? 2.4, p = [[0, -1], [d, -1], [d, h * 0.40], [d * 0.62, h * 0.40], [d * 0.62, h * 0.74], [d * 0.4, h * 0.78], [d * 0.4, h * 0.86], [0, h]];
      kit.put(M.stone, scaleUV(slab(p, [], w), 1 / tile.stone, 1 / tile.stone), at(x, o.y ?? 0, z, Math.atan2(-Math.sin(ang), Math.cos(ang))).multiply(loc.makeTranslation(0, 0, -w / 2)), o.tint ?? 0.85);
      if (o.spots !== false) spots.push({ p: [x + Math.cos(ang) * d * 0.8, Y0 + (o.y ?? 0) + h * 0.40, z + Math.sin(ang) * d * 0.8], s: 0.5 + R() * 0.5 });
    },

    /** 台阶：从 (x, y, z) 起，朝着 ang 方向往上 */
    stairs(x, y, z, ang, w, n, rise, run, o = {}) {
      const yaw = Math.atan2(-Math.sin(ang), Math.cos(ang)), m0 = at(x, y, z, yaw), tint = o.tint ?? 0.85, mat = o.mat ?? M.stone, tl = o.tile ?? tile.stone;
      for (let i = 0; i < n; i++) kit.put(mat, uvBox(run, rise * (i + 1), w, tl, 0, y / tl), m0.clone().multiply(loc.makeTranslation(run * (i + 0.5), rise * (i + 1) / 2, 0)), tint);
    },

    /** 塌落的碎砖：around (x, z) 一小片 */
    rubble(x, y, z, n = 6, spread = 2.5, o = {}) {
      for (let i = 0; i < n; i++) {
        const a = R() * TAU, d = Math.sqrt(R()) * spread, w = (o.min ?? 0.4) + R() * ((o.max ?? 1.3) - (o.min ?? 0.4));
        kit.box(M.stone, w, w * (0.5 + R() * 0.5), w * (0.6 + R() * 0.6), x + Math.cos(a) * d, y + w * 0.18, z + Math.sin(a) * d, (o.tint ?? 0.8) * (0.8 + R() * 0.3), R() * TAU, tile.stone);
        if (R() < 0.5) spots.push({ p: [x + Math.cos(a) * d, y + Y0 + w * 0.5, z + Math.sin(a) * d], s: 0.3 + R() * 0.4 });
      }
    },
  };
  return kit;
}
