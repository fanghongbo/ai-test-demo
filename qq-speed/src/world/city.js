// 城市楼群：在岛上按“离赛道足够远、不压地标、不在岸边”的格子点撒楼。三种体型——
//   玻璃塔（八角 / 收分 / 板式，幕墙贴图 + 白色檐口和女儿墙 + 屋顶设备 + 尖塔）、
//   白色退台楼（白色楼板一层层叠上去，层间是蓝玻璃带）、
//   远处的天际线（别的岛上成排的方盒子）和青山。
// 全部静态合批：每种材质一两个网格。
import * as THREE from 'three';
import { createBatcher, scaleUV } from '../gfx/batch.js';
import { nearest, SCALE, WALL } from '../core/trackdef.js';
import { mulberry32 } from '../core/mathx.js';
import { distToLand } from './landdef.js';
import { inExclude, inLowrise } from './plan.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const GLASS_U = 12, GLASS_V = 21.6;                    // 幕墙贴图一张铺 12 米 × 6 层
const TINTS = [[0.80, 0.90, 1.00], [0.70, 0.85, 1.00], [0.90, 0.95, 1.00], [0.60, 0.79, 0.98], [0.74, 0.94, 0.97], [0.86, 0.88, 0.96]];
const WHITE = [0.95, 0.96, 0.97], ROOF = [0.52, 0.55, 0.60];
const toPx = (X, Z) => [X / SCALE + 84.5, Z / SCALE + 73.5];

/** 找出所有能盖楼的格子点 */
export function findSites(T, r) {
  const sites = [];
  for (let py = 13; py <= 117; py += 9.5) for (let px = 27; px <= 156; px += 9.5) {
    const jx = px + (r() - 0.5) * 5.5, jy = py + (r() - 0.5) * 5.5;
    const X = (jx - 84.5) * SCALE, Z = (jy - 73.5) * SCALE;
    // 岸边留 13 米步道
    if (distToLand(X, Z) > 0 || distToLand(X + 13, Z) > 0 || distToLand(X - 13, Z) > 0 || distToLand(X, Z + 13) > 0 || distToLand(X, Z - 13) > 0) continue;
    if (inExclude(X, Z)) continue;
    const n = nearest(T, X, Z, -1);
    if (n.d - T.hw[n.i] < WALL + 8.5) continue;
    sites.push({ X, Z, px: jx, py: jy });
  }
  return sites;
}

/** 玻璃盒子的贴图坐标：按“位置 + 法线”算，圆角盒子也适用。每面按真实尺寸铺 */
function glassBoxGeo(w, h, d, r, round = 1.4) {
  const g = round > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.max(0.2, Math.min(round, w / 2 - 0.1, d / 2 - 0.1))) : new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv, ou = r(), ov = r();
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    if (ny > 0.7) uv.setXY(i, p.getX(i) / GLASS_U + ou, p.getZ(i) / GLASS_U + ov);
    else if (nx > nz) uv.setXY(i, p.getZ(i) / GLASS_U + ou, p.getY(i) / GLASS_V + ov);
    else uv.setXY(i, p.getX(i) / GLASS_U + ou, p.getY(i) / GLASS_V + ov);
  }
  return g;
}

/** 一栋玻璃塔 */
function tower(B, s, o) {
  const { X, Z } = s, r = B.r, M = B.M, tint = TINTS[(r() * TINTS.length) | 0];
  const w = 14 + r() * 9, d = 14 + r() * 9, h = o.h, kind = o.kind;
  // 裙房：白色基座 + 一圈蓝玻璃门厅
  const pw = w + 8, pd = d + 8, ph = 7 + r() * 4;
  B.box(M.paint, pw, ph, pd, X, ph / 2, Z, [0.94, 0.95, 0.96], { uv: 3 });
  B.add(M.glass, glassBoxGeo(pw + 0.5, 3.2, pd + 0.5, r, 0.3), { x: X, y: 1.9, z: Z }, [0.60, 0.80, 1.0]);
  B.box(M.paint, pw + 1.4, 0.7, pd + 1.4, X, ph + 0.35, Z, WHITE, { uv: 3 });
  let top = ph;
  if (kind === 'oct' || kind === 'taper') {
    const rt = kind === 'taper' ? 6.4 : 7.4, rb = 7.4, sx = w / 15.1, sz = d / 15.1, th = h - ph;
    const g = new THREE.CylinderGeometry(rt, rb, th, 8, 1, false);
    g.rotateY(Math.PI / 8);
    scaleUV(g, (rt + rb) * 3.06 * (sx + sz) * 0.5 / GLASS_U, th / GLASS_V, r(), 0);
    B.add(M.glass, g, { x: X, y: ph + th / 2, z: Z, sx, sz }, tint);
    const rAt = (y) => rb + (rt - rb) * ((y - ph) / th) + 0.35;              // 塔身在高度 y 处的外接圆半径
    for (let y = ph + 40; y < h - 6; y += 40) B.add(M.paint, new THREE.CylinderGeometry(1, 1, 1.1, 8).rotateY(Math.PI / 8), { x: X, y, z: Z, sx: rAt(y) * sx, sz: rAt(y) * sz }, WHITE);
    const rw = rt * 2 * sx, rd = rt * 2 * sz;
    B.add(M.paint, new THREE.CylinderGeometry(1, 1, 1.4, 8).rotateY(Math.PI / 8), { x: X, y: h + 0.7, z: Z, sx: (rt + 0.9) * sx, sz: (rt + 0.9) * sz }, WHITE);
    B.box(M.dark, rw * 0.55, 4.5, rd * 0.55, X, h + 3.6, Z, ROOF);
    top = h + 6;
    if (o.sail) {                                                            // 塔顶两侧的白色“帆”
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(w * 0.9, o.sail * 0.35, w * 0.35, o.sail); sh.lineTo(0, o.sail); sh.closePath();
      const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: false }); sg.translate(0, 0, -0.45);
      for (const sgn of [1, -1]) B.add(M.paint, sg.clone(), { x: X + sgn * rw * 0.5, y: h - 2, z: Z, ry: sgn > 0 ? 0 : Math.PI }, WHITE);
    }
  } else {                                                                   // 板式
    B.add(M.glass, glassBoxGeo(w, h - ph, d, r, 1.6), { x: X, y: ph + (h - ph) / 2, z: Z }, tint);
    for (let y = ph + 40; y < h - 6; y += 40) B.box(M.paint, w + 1.0, 1.1, d + 1.0, X, y, Z, WHITE, { uv: 3 });
    B.box(M.paint, w + 1.8, 1.4, d + 1.8, X, h + 0.7, Z, WHITE, { uv: 3 });
    B.box(M.dark, w * 0.5, 4.5, d * 0.5, X, h + 3.6, Z, ROOF);
    top = h + 6;
  }
  if (o.spire) {
    B.add(M.steel, new THREE.CylinderGeometry(0.45, 1.3, o.spire, 8), { x: X, y: top + o.spire / 2, z: Z }, [0.92, 0.94, 0.97]);
    B.add(M.led, new THREE.CylinderGeometry(1.9, 1.9, 0.5, 12), { x: X, y: top + o.spire * 0.42, z: Z }, [0.5, 0.85, 1]);
    B.add(M.led, new THREE.CylinderGeometry(1.2, 1.2, 0.4, 12), { x: X, y: top + o.spire * 0.78, z: Z }, [0.5, 0.85, 1]);
  }
  return Math.hypot(pw + 1.4, pd + 1.4) / 2 + 0.5;                                  // 裙房的外接圆半径：摆树、摆灯时避开
}

/** 一栋白色退台楼：白色楼板一层层叠上去，层间是蓝玻璃带 */
function terrace(B, s) {
  const { X, Z } = s, r = B.r, M = B.M, tint = [0.66, 0.86, 1.0];
  let w = 24 + r() * 12, d = 20 + r() * 10, y = 0;
  const w0 = w, d0 = d;
  const tiers = 3 + ((r() * 3) | 0);
  for (let t = 0; t < tiers; t++) {
    const floors = 1 + ((r() * 3) | 0), fh = 3.9 + r() * 0.8;
    for (let f = 0; f < floors; f++) {
      B.box(M.paint, w + 1.6, 1.15, d + 1.6, X, y + 0.575, Z, WHITE, { uv: 3 });           // 楼板 + 白色栏板
      B.add(M.glass, glassBoxGeo(w, fh - 1.15, d, r, 0.5), { x: X, y: y + 1.15 + (fh - 1.15) / 2, z: Z }, tint);
      y += fh;
    }
    B.box(M.hedge, w + 0.4, 0.5, d + 0.4, X, y + 0.25, Z, [0.80, 0.92, 0.78]);               // 退台上的绿化边
    w -= 4 + r() * 4; d -= 3 + r() * 4;
    if (w < 11 || d < 10) { y += 0.5; break; }
  }
  B.box(M.paint, w + 1.6, 1.0, d + 1.6, X, y + 1.0, Z, WHITE, { uv: 3 });
  return Math.hypot(w0 + 1.6, d0 + 1.6) / 2 + 0.5;
}

/** 滨水的低层商铺：两层玻璃店面、一圈挑檐，顶上是花园。不许高，免得挡住商城 */
function shops(B, s) {
  const { X, Z } = s, r = B.r, M = B.M, w = 24 + r() * 6, d = 17 + r() * 5;
  B.box(M.paint, w + 2.4, 0.8, d + 2.4, X, 0.4, Z, WHITE, { uv: 3 });
  B.add(M.glass, glassBoxGeo(w, 5.6, d, r, 1.2), { x: X, y: 3.6, z: Z }, [0.66, 0.84, 1.0]);
  B.box(M.paint, w + 3, 0.9, d + 3, X, 6.85, Z, WHITE, { uv: 3 });
  B.box(M.hedge, w - 5, 0.9, d - 5, X, 7.75, Z, [0.80, 0.92, 0.78]);
  B.box(M.paint, 5, 2.6, 4, X + w * 0.3, 8.6, Z - d * 0.2, WHITE, { uv: 3 });
  return Math.hypot(w + 3, d + 3) / 2 + 0.5;
}

export function buildCity(T, M, onStep = () => {}) {
  const r = mulberry32(20261126), group = new THREE.Group();
  group.name = 'city';
  const sites = findSites(T, r), lots = [];
  onStep(0.1);
  // ——— 本岛的楼 ———
  const B = createBatcher();
  B.r = r; B.M = { glass: M.glassTower, paint: M.paint, dark: M.dark, steel: M.steel, led: M.led, hedge: M.hedge };
  for (const s of sites) {
    const [px, py] = toPx(s.X, s.Z);
    const hero = px > 98 && px < 158 && py > 11 && py < 46;                   // 东北角：超高层群
    const roll = r();
    const lot = hero ? tower(B, s, { h: 120 + r() * 105, kind: roll < 0.4 ? 'taper' : roll < 0.75 ? 'oct' : 'slab', spire: 18 + r() * 34, sail: roll < 0.3 ? 22 + r() * 16 : 0 })
      : roll < 0.42 ? tower(B, s, { h: 44 + r() * 48, kind: roll < 0.16 ? 'taper' : roll < 0.32 ? 'oct' : 'slab', spire: r() < 0.3 ? 8 + r() * 12 : 0, sail: 0 })
      : roll < 0.58 ? tower(B, s, { h: 22 + r() * 20, kind: 'slab', spire: 0, sail: 0 })
      : inLowrise(s.X, s.Z) ? shops(B, s) : terrace(B, s);
    lots.push({ X: s.X, Z: s.Z, r: lot });
  }
  const meshes = B.build(group, { name: 'city', castShadow: true, receiveShadow: true });
  onStep(0.5);

  // ——— 远处的天际线：别的岛上成排的方盒子 ———
  const S = createBatcher(), R2 = mulberry32(99);
  for (let k = 0; k < 26; k++) {
    const a = (k / 26) * Math.PI * 2 + R2() * 0.2, dist = 640 + R2() * 900;
    const cx = Math.sin(a) * dist, cz = -Math.cos(a) * dist;
    const iw = 90 + R2() * 220, id = 70 + R2() * 160;
    S.add(M.hill, new THREE.CylinderGeometry(1, 1.05, 7, 20), { x: cx, y: -2.4, z: cz, sx: iw / 2, sz: id / 2 }, [0.30, 0.40, 0.26]);     // 岛体：长满植被的岸
    S.add(M.paint, new THREE.CylinderGeometry(1.012, 1.012, 0.5, 20), { x: cx, y: 1.25, z: cz, sx: iw / 2, sz: id / 2 }, [0.90, 0.91, 0.92]);   // 岸边的码头面
    const n = 4 + ((R2() * 10) | 0);
    for (let j = 0; j < n; j++) {
      const X = cx + (R2() - 0.5) * iw * 0.7, Z = cz + (R2() - 0.5) * id * 0.7, w = 16 + R2() * 26, d = 16 + R2() * 26, h = 30 + R2() * R2() * 230;
      const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / GLASS_U, uv.getY(i) * h / 60);
      S.add(M.glassTower, g, { x: X, y: h / 2, z: Z }, [0.84, 0.90, 0.98]);
      S.box(M.paint, w + 1, 1.5, d + 1, X, h + 0.75, Z, [0.9, 0.92, 0.95]);
    }
  }
  const far = S.build(group, { name: 'skyline', castShadow: false, receiveShadow: false });
  onStep(0.75);

  // ——— 远山：几条由六七个山包叠出来的山脊，围着城市的北、东、西三面 ———
  const H = createBatcher(), HR = mulberry32(4242), dome = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  for (const [X, Z, span, rad, h] of [[-2200, -2800, 2100, 1250, 400], [1200, -3300, 2400, 1400, 460], [3300, -1200, 1800, 1000, 310], [-3300, 800, 2000, 1050, 340], [2400, 3000, 1900, 950, 280]]) {
    const a = HR() * Math.PI, dx = Math.cos(a), dz = Math.sin(a), n = 9;
    for (let k = 0; k < n; k++) {
      const t = (k / (n - 1) - 0.5) * span, rr = rad * (0.24 + HR() * 0.2), hh = h * (0.5 + HR() * 0.5) * (1 - Math.abs(k / (n - 1) - 0.5) * 1.2), g = 0.85 + HR() * 0.3;
      H.add(M.hill, dome, { x: X + dx * t + (HR() - 0.5) * rad * 0.5, y: -20, z: Z + dz * t + (HR() - 0.5) * rad * 0.5, sx: rr, sy: hh, sz: rr * (0.7 + HR() * 0.5) }, [0.17 * g, 0.31 * g, 0.22 * g]);
    }
  }
  const hills = H.build(group, { name: 'hills', castShadow: false, receiveShadow: false });
  onStep(1);
  return { group, sites: sites.length, lots, meshes, far, hills };
}
