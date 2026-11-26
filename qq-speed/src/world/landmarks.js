// 「十一城」的地标：NOVA 商城、穹顶广场、展览馆穹顶、NOVA 拱门、斜拉桥塔、石塔桥、港湾看台、环塔。
// 位置取自 world/plan.js（在官方小地图上定点），形状全部程序化建模：不透明的静态合批，透明 / 自发光的另合一组。
import * as THREE from 'three';
import { createBatcher, plane, scaleUV, colored } from '../gfx/batch.js';
import { box as rbox, roundedRectPoints } from '../gfx/shapes.js';
import { nearest, pointAt, toWorld, WALL } from '../core/trackdef.js';
import { mulberry32 } from '../core/mathx.js';
import { PLAN, FOOTPRINTS } from './plan.js';
import { WATER_Y } from './landdef.js';
import { SIGN_UV } from './materials.js';

const WHITE = [0.95, 0.96, 0.97], BLUE = [0.10, 0.25, 0.66], GOLD = [1.0, 0.82, 0.38], CYAN = [0.5, 0.85, 1.0];
const STONE = [1.0, 0.99, 0.97];
const _q = new THREE.Quaternion(), _up = new THREE.Vector3(0, 1, 0), _m = new THREE.Matrix4(), _one = new THREE.Vector3(1, 1, 1), _t = new THREE.Vector3();
const v3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const DEG = Math.PI / 180;

// ————————————————— 小工具 —————————————————

/** 两点之间的圆台：a 端半径 r0，b 端半径 r1 */
function strut(B, mat, a, b, r0, r1, color, seg = 8) {
  const A = v3(a), C = v3(b), d = new THREE.Vector3().subVectors(C, A), len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  return B.add(mat, g, _m.compose(_t.addVectors(A, C).multiplyScalar(0.5), _q, _one), color);
}
function polyline(B, mat, pts, r, color, radial = 5) { for (let k = 0; k + 1 < pts.length; k++) B.rod(mat, pts[k], pts[k + 1], r, color, radial); }

/** 按“位置 + 法线”给几何铺贴图坐标：每面按真实尺寸铺，圆角盒子、拉伸体都适用 */
function triUV(g, tu, tv, ou = 0, ov = 0) {
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    if (ny > 0.7) uv.setXY(i, p.getX(i) / tu + ou, p.getZ(i) / tu + ov);
    else if (nx > nz) uv.setXY(i, p.getZ(i) / tu + ou, p.getY(i) / tv + ov);
    else uv.setXY(i, p.getX(i) / tu + ou, p.getY(i) / tv + ov);
  }
  return g;
}

/** 赛道上某点的局部坐标架：原点是最近的采样点，s 沿行进方向，lat 向右。 */
function frame(T, X, Z) {
  const i = nearest(T, X, Z, -1).i, th = T.th[i], dx = Math.cos(th), dz = Math.sin(th), rx = -Math.sin(th), rz = Math.cos(th);
  const F = {
    i, X: T.x[i], Z: T.z[i], hw: T.hw[i], L: T.hw[i] + WALL, dx, dz, rx, rz,
    ryH: Math.atan2(-dz, dx),                                   // 把平面转成“面内横轴沿行进方向”
    ryR: Math.atan2(rx, rz),                                    // 把平面转成“法线朝右”
    /** 沿赛道走 s 米、横向 lat 米（右为正）、高度 y */
    at(s, lat, y) { return [F.X + dx * s + rx * lat, y, F.Z + dz * s + rz * lat]; },
    /** 跟着赛道方向的盒子：along 沿路，across 横路 */
    box(B, mat, along, h, across, s, y, lat, color, o = {}) {
      const p = F.at(s, lat, y), a = Math.abs(dx) > Math.abs(dz);
      return B.box(mat, a ? along : across, h, a ? across : along, p[0], y, p[2], color, o);
    },
  };
  return F;
}

// ————————————————— NOVA 商城 —————————————————

function buildMall(B, S, M) {
  const H = PLAN.mall.hall, Wg = PLAN.mall.wing, [cx, cz] = H.c, fz = cz + H.d / 2;       // fz：南立面
  B.box(M.concrete, H.w + 4, 1.0, H.d + 4, cx, 0.5, cz, [0.98, 0.98, 0.97], { uv: 4 });
  for (let k = 0; k < 3; k++) { const hh = 0.75 - k * 0.25; B.box(M.concrete, 56, hh, 1.3, cx, hh / 2, fz + 2.9 + k * 1.3, [0.98, 0.98, 0.97], { uv: 4 }); }
  // 主馆：圆角的“船体”，菱面幕墙
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(roundedRectPoints(H.w - 6, H.d - 6, 12, 10).map((p) => new THREE.Vector2(p[0], p[1]))),
    { depth: H.h - 6, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 4, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); g.translate(0, 4, 0);
  B.add(M.facet, triUV(g, 12, 12), { x: cx, z: cz }, [1, 1, 1]);
  B.add(M.clearGlass, rbox(H.w - 30, 6.5, H.d + 0.6, 1.6), { x: cx, y: 5.4, z: cz }, [0.55, 0.80, 0.95]);   // 底层的通长玻璃带
  // 南门：玻璃门厅 + 挑檐
  B.add(M.clearGlass, rbox(30, 8, 0.8, 0.3), { x: cx, y: 5, z: fz + 0.3 }, [0.55, 0.80, 0.95]);
  B.box(M.paint, 38, 0.6, 10, cx, 10.6, fz + 8, WHITE, { uv: 3 });
  for (const ox of [-16, -6, 6, 16]) B.cyl(M.steel, 0.22, 0.22, 9.7, cx + ox, 5.85, fz + 11.6, [0.9, 0.92, 0.95], { seg: 10 });
  // 屋顶的玻璃拱廊（中庭）
  const vr = 13, vl = H.w - 40, vy = H.h + 1;
  B.add(M.clearGlass, new THREE.CylinderGeometry(vr, vr, vl, 40, 1, true, 0, Math.PI).rotateZ(Math.PI / 2), { x: cx, y: vy, z: cz }, [0.60, 0.84, 0.98]);
  for (const sx of [-1, 1]) B.add(M.paint, new THREE.CircleGeometry(vr, 28, 0, Math.PI).rotateY((sx * Math.PI) / 2), { x: cx + (sx * vl) / 2, y: vy, z: cz }, WHITE);
  for (let x = -vl / 2; x <= vl / 2 + 0.01; x += 6.4) B.add(M.paint, new THREE.TorusGeometry(vr + 0.25, 0.38, 6, 30, Math.PI).rotateY(Math.PI / 2), { x: cx + x, y: vy, z: cz }, WHITE);
  B.box(M.led, vl, 0.35, 0.35, cx, vy + 0.5, cz + vr + 0.2, CYAN);                         // 拱廊脚下的灯带
  B.box(M.led, vl, 0.35, 0.35, cx, vy + 0.5, cz - vr - 0.2, CYAN);
  // 屋顶设备、天线
  for (const ox of [-30, 26]) B.box(M.steel, 13, 3.4, 8, cx + ox, H.h + 2.7, cz - 7, [0.86, 0.88, 0.91], { uv: 1.5 });
  strut(B, M.steel, [cx - 46, H.h + 1, cz - 9], [cx - 46, H.h + 24, cz - 9], 0.3, 0.12, [0.92, 0.94, 0.97], 6);
  B.add(M.led, new THREE.SphereGeometry(0.6, 10, 8), { x: cx - 46, y: H.h + 24.4, z: cz - 9 }, [1, 0.25, 0.2]);
  // 西翼：白楼 + 竖向白色翼片 + 玻璃带 + 屋顶绿化
  const [wx, wz] = Wg.c;
  B.box(M.concrete, Wg.w + 4, 1.0, Wg.d + 4, wx, 0.5, wz, [0.98, 0.98, 0.97], { uv: 4 });
  B.add(M.paint, triUV(rbox(Wg.w, Wg.h, Wg.d, 2.5, 3), 3, 3), { x: wx, y: 1 + Wg.h / 2, z: wz }, WHITE);
  B.add(M.glass, triUV(rbox(Wg.w + 0.5, Wg.h * 0.44, Wg.d + 0.5, 1.2, 2), 12, 21.6, 0.31, 0.57), { x: wx, y: 1 + Wg.h * 0.52, z: wz }, [0.36, 0.56, 0.84]);
  for (let x = -Wg.w / 2 + 2; x <= Wg.w / 2 - 2; x += 4) for (const q of [-1, 1]) {
    B.box(M.paint, 0.3, Wg.h - 2.4, 0.8, wx + x, 1 + (Wg.h - 2.4) / 2, wz + q * (Wg.d / 2 + 0.12), WHITE);
  }
  for (const q of [-1, 1]) B.box(M.led, Wg.w, 0.25, 0.2, wx, 1 + Wg.h - 1.0, wz + q * (Wg.d / 2 + 0.3), CYAN);
  B.box(M.hedge, Wg.w - 8, 1.0, Wg.d - 7, wx - 2, 1 + Wg.h + 0.5, wz, [0.80, 0.92, 0.78]);
  // 字和屏
  S.add(M.mallSign, plane(62, 7.75), { x: cx - 10, y: H.h - 5.5, z: fz + 0.35 }, [1, 1, 1]);
  S.add(M.mallSign, plane(32, 4).rotateY(Math.PI / 2), { x: cx + H.w / 2 + 0.35, y: 15.5, z: cz }, [1, 1, 1]);
  for (const ox of [-39, 39]) {
    B.box(M.dark, 17.8, 9.3, 0.4, cx + ox, 11.5, fz + 0.1, [0.12, 0.13, 0.15]);
    S.add(M.screen, plane(17, 8.5), { x: cx + ox, y: 11.5, z: fz + 0.35 }, [1, 1, 1]);
  }
  // 通往水边的步行大道
  const shoreZ = toWorld(0, 119)[1], len = shoreZ - (fz + 13);
  const eg = new THREE.PlaneGeometry(50, len).rotateX(-Math.PI / 2);
  scaleUV(eg, 50 / M.TEXEL.paver, len / M.TEXEL.paver);
  B.add(M.paver, eg, { x: cx, y: 0.07, z: fz + 13 + len / 2 }, [1.06, 1.05, 1.0]);
  for (const ox of [-24, 24]) B.box(M.stone, 0.9, 0.55, len, cx + ox, 0.27, fz + 13 + len / 2, [1.02, 1.01, 0.98], { uv: 2 });   // 路缘石
}

// ————————————————— 穹顶广场 —————————————————

const HEX_W = 9.006, HEX_H = 15.6;                          // 六边网格一张贴图覆盖的尺寸（米），对应六边形外接半径 2.6 米

function buildCanopy(B, S, M, group) {
  const [cx, cz] = PLAN.canopy.c, r = PLAN.canopy.r, h = PLAN.canopy.h;
  const R = (r * r + h * h) / (2 * h);                       // 穹顶是球面的一部分：这是那个球的半径
  // 广场：浅色铺装 + 一圈白石镶边
  const pg = new THREE.CircleGeometry(r + 7, 56).rotateX(-Math.PI / 2);
  scaleUV(pg, (r + 7) / M.TEXEL.paver, (r + 7) / M.TEXEL.paver);
  B.add(M.paver, pg, { x: cx, y: 0.07, z: cz }, [1.08, 1.07, 1.02]);
  B.add(M.stone, new THREE.RingGeometry(r + 6.6, r + 8.4, 56).rotateX(-Math.PI / 2), { x: cx, y: 0.12, z: cz }, [1.03, 1.02, 0.99]);
  // 穹顶：淡绿玻璃 + 白色六边网格。贴图坐标用俯视投影，网格不会朝顶点汇聚
  const dome = colored(new THREE.SphereGeometry(R, 64, 18, 0, Math.PI * 2, 0, Math.asin(r / R)), [0.60, 0.90, 0.70]);
  const p = dome.attributes.position, uv = dome.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / HEX_W + 0.5, p.getZ(i) / HEX_H + 0.5);
  const glass = new THREE.Mesh(dome, M.canopy);
  glass.name = 'canopyGlass'; glass.position.set(cx, h - R, cz); glass.renderOrder = 4;
  group.add(glass);
  const grid = new THREE.Mesh(dome.clone().scale(1.006, 1.006, 1.006), M.hex);
  grid.name = 'canopyGrid'; grid.position.copy(glass.position); grid.castShadow = true; grid.customDepthMaterial = M.hexDepth;
  group.add(grid);
  // 蘑菇柱
  const col = (x, z, stem, hTop, capR) => {
    B.cyl(M.paint, stem * 0.78, stem, hTop - 1.2, x, (hTop - 1.2) / 2, z, WHITE, { seg: 20 });
    B.cyl(M.paint, capR, stem * 0.9, 1.3, x, hTop - 0.55, z, WHITE, { seg: 32 });
    B.add(M.led, new THREE.TorusGeometry(capR * 0.62, 0.1, 5, 32).rotateX(Math.PI / 2), { x, y: hTop - 1.25, z }, CYAN);
  };
  col(cx, cz, 1.7, 12.5, 8);
  for (let k = 0; k < 6; k++) col(cx + Math.cos(k * Math.PI / 3) * 15, cz + Math.sin(k * Math.PI / 3) * 15, 0.95, 10.5, 4.2);
  // 环形喷泉池（围着中间那根柱子）
  B.add(M.stone, new THREE.TorusGeometry(7.6, 0.55, 8, 48).rotateX(Math.PI / 2), { x: cx, y: 0.45, z: cz }, [1.02, 1.01, 0.98]);
  B.add(M.stone, new THREE.TorusGeometry(3.3, 0.45, 8, 36).rotateX(Math.PI / 2), { x: cx, y: 0.4, z: cz }, [1.02, 1.01, 0.98]);
  const pool = new THREE.Mesh(new THREE.RingGeometry(3.4, 7.3, 48).rotateX(-Math.PI / 2), M.pool);
  pool.position.set(cx, 0.4, cz); pool.name = 'pool'; group.add(pool);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2, x = cx + Math.cos(a) * 5.4, z = cz + Math.sin(a) * 5.4;
    S.add(M.jet, new THREE.CylinderGeometry(0.42, 0.09, 3.6, 7, 1, true), { x, y: 0.4 + 1.8, z }, [1, 1, 1]);
    S.add(M.foam, new THREE.PlaneGeometry(2.2, 2.2).rotateX(-Math.PI / 2), { x, y: 0.47, z }, [1, 1, 1]);
  }
  // 穹顶外一圈旱喷
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2 + 0.08, x = cx + Math.cos(a) * (r + 3.2), z = cz + Math.sin(a) * (r + 3.2);
    S.add(M.jet, new THREE.CylinderGeometry(0.3, 0.07, 5.2, 6, 1, true), { x, y: 2.6, z }, [1, 1, 1]);
    B.cyl(M.steel, 0.26, 0.3, 0.16, x, 0.15, z, [0.9, 0.92, 0.95], { seg: 10 });
  }
}

// ————————————————— 展览馆：测地线穹顶 —————————————————

/** 半球壳上的三角面板（只要 ymin 以上的部分），平直着色 */
function domePanels(r, detail, ymin) {
  const src = new THREE.IcosahedronGeometry(r, detail), p = src.attributes.position, out = [];
  for (let t = 0; t < p.count; t += 3) {
    if (p.getY(t) < ymin || p.getY(t + 1) < ymin || p.getY(t + 2) < ymin) continue;
    for (let k = 0; k < 3; k++) out.push(p.getX(t + k), p.getY(t + k), p.getZ(t + k));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  g.computeVertexNormals();
  return g;
}
/** 面板的棱 → 杆件 */
function domeStruts(B, M, r, detail, x, y, z, rod) {
  const src = new THREE.IcosahedronGeometry(r, detail), p = src.attributes.position, id = new Map(), verts = [], edges = new Set();
  const vi = (i) => {
    const k = `${Math.round(p.getX(i) * 100)},${Math.round(p.getY(i) * 100)},${Math.round(p.getZ(i) * 100)}`;
    let v = id.get(k);
    if (v === undefined) { v = verts.length; verts.push([p.getX(i), p.getY(i), p.getZ(i)]); id.set(k, v); }
    return v;
  };
  for (let t = 0; t < p.count; t += 3) {
    const a = vi(t), b = vi(t + 1), c = vi(t + 2);
    for (const [u, v] of [[a, b], [b, c], [c, a]]) {
      const e = Math.min(u, v) * 100000 + Math.max(u, v);
      if (edges.has(e)) continue;
      edges.add(e);
      if (verts[u][1] > -0.6 || verts[v][1] > -0.6) B.rod(M.paint, [x + verts[u][0], y + verts[u][1], z + verts[u][2]], [x + verts[v][0], y + verts[v][1], z + verts[v][2]], rod, WHITE, 4);
    }
  }
}

function buildDomes(B, S, M, group) {
  PLAN.domes.forEach((d, k) => {
    const [cx, cz] = d.c, r = d.r, big = k === 0, base = 3.4;
    // 基座鼓座 + 入口
    const drum = new THREE.CylinderGeometry(r + 2.0, r + 2.6, base, 56, 1, false);
    scaleUV(drum, (2 * Math.PI * (r + 2.3)) / M.TEXEL.concrete, base / M.TEXEL.concrete);
    B.add(M.concrete, drum, { x: cx, y: base / 2, z: cz }, STONE);
    const eg = new THREE.BoxGeometry(big ? 16 : 11, big ? 7.5 : 5.5, 7);
    B.add(M.clearGlass, eg, { x: cx, y: (big ? 3.75 : 2.75), z: cz + r + 0.5 }, [0.6, 0.82, 0.96]);
    B.box(M.paint, (big ? 19 : 13), 0.6, 10, cx, big ? 7.8 : 5.8, cz + r + 1.5, WHITE, { uv: 3 });
    // 面板 + 杆件
    const panels = new THREE.Mesh(domePanels(r - 0.06, big ? 3 : 2, -0.6), M.domeGlass);
    panels.position.set(cx, base, cz); panels.name = 'domePanels'; panels.renderOrder = 3;
    group.add(panels);
    domeStruts(B, M, r, big ? 3 : 2, cx, base, cz, big ? 0.2 : 0.14);
    B.add(M.paint, new THREE.TorusGeometry(r + 0.1, 0.55, 8, 72).rotateX(Math.PI / 2), { x: cx, y: base, z: cz }, WHITE);
    // 穹顶里的一座小绿丘
    B.add(M.hedge, new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), { x: cx, y: 0.2, z: cz, sx: r * 0.72, sy: big ? 9 : 5.5, sz: r * 0.72 }, [0.80, 0.95, 0.78]);
    // 天窗
    B.cyl(M.paint, big ? 2.4 : 1.5, big ? 3.2 : 2.0, 1.2, cx, base + r - 0.2, cz, WHITE, { seg: 16 });
  });
}

// ————————————————— NOVA 拱门（跨海大桥中段） —————————————————

function buildArch(B, S, M, T) {
  const F = frame(T, PLAN.archX, PLAN.towerBridge[1]), L = F.L, H = 60, foot = L + 4.5;
  for (const sd of [-1, 1]) {
    // A 形的一条腿：一根粗主杆 + 两侧的桁架杆
    strut(B, M.paint, F.at(0, sd * foot, -0.5), F.at(0, 0, H), 2.3, 1.3, WHITE, 10);
    const p = (y, fs) => { const u = y / H; return F.at(fs * (4.6 - 3.3 * u), sd * (foot + 1.6 - foot * u), y); };
    for (const fs of [-1, 1]) strut(B, M.paint, p(0, fs), p(H - 1.5, fs), 0.55, 0.4, WHITE, 6);
    for (let y = 6; y < H - 5; y += 9) {
      strut(B, M.paint, p(y, -1), p(y, 1), 0.22, 0.22, WHITE, 5);
      strut(B, M.paint, p(y, -1), p(y + 9, 1), 0.16, 0.16, WHITE, 4);
      strut(B, M.paint, p(y, 1), p(y + 9, -1), 0.16, 0.16, WHITE, 4);
    }
    F.box(B, M.concrete, 13, 2.0, 6, 0, 0.5, sd * (L + 3.6), [0.97, 0.97, 0.96], { uv: 4 });
  }
  // 横梁 + 两面的 NOVA 牌
  const half = foot * (1 - 21 / H);
  F.box(B, M.paint, 3.2, 4.6, half * 2, 0, 21, 0, WHITE);
  const sw = half * 2 - 2;
  B.add(M.dark, plane(sw + 0.6, 4.0).rotateY(Math.atan2(F.dx, F.dz)), F.at(1.66, 0, 21), [0.1, 0.1, 0.12]);
  B.add(M.dark, plane(sw + 0.6, 4.0).rotateY(Math.atan2(-F.dx, -F.dz)), F.at(-1.66, 0, 21), [0.1, 0.1, 0.12]);
  S.add(M.sign, plane(sw, 3.6, SIGN_UV.nova).rotateY(Math.atan2(-F.dx, -F.dz)), F.at(1.7, 0, 21), [1, 1, 1]);      // 迎着驶来的车
  S.add(M.sign, plane(sw, 3.6, SIGN_UV.nova).rotateY(Math.atan2(F.dx, F.dz)), F.at(-1.7, 0, 21), [1, 1, 1]);
  // 从塔顶撒向两端的吊索
  for (const sd of [-1, 1]) for (let k = 1; k <= 6; k++) {
    B.rod(M.gloss, F.at(0, 0, H - 1.5), F.at(k * 6.5, sd * (L + 1.2), 1.4), 0.085, [0.95, 0.96, 0.97], 4);
    B.rod(M.gloss, F.at(0, 0, H - 1.5), F.at(-k * 6.5, sd * (L + 1.2), 1.4), 0.085, [0.95, 0.96, 0.97], 4);
  }
}

// ————————————————— 斜拉桥塔 —————————————————

/** 格构桅杆：四根主杆从 half0 收到 half1，每层一圈横杆和斜撑 */
function latticeMast(B, M, x, z, y0, h, half0, half1, r0, r1, color) {
  const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const at = (k, y) => { const half = half0 + (half1 - half0) * (y / h); return [x + c[k][0] * half, y0 + y, z + c[k][1] * half]; };
  for (let k = 0; k < 4; k++) strut(B, M.steel, at(k, 0), at(k, h), r0, r1, color, 6);
  for (let y = 0; y < h - 0.1; y += 8) {
    const y2 = Math.min(h, y + 8);
    for (let k = 0; k < 4; k++) {
      const a = at(k, y), b = at((k + 1) % 4, y), c2 = at((k + 1) % 4, y2), d = at(k, y2), t = r1 * 0.5;
      strut(B, M.steel, a, b, t, t, color, 4); strut(B, M.steel, a, c2, t * 0.9, t * 0.9, color, 4); strut(B, M.steel, b, d, t * 0.9, t * 0.9, color, 4);
    }
  }
}

function buildPylons(B, S, M, T) {
  for (const px of PLAN.pylonX) {
    const F = frame(T, px, PLAN.towerBridge[1]), L = F.L, H = 62;
    for (const sd of [-1, 1]) {
      const m = F.at(0, sd * (L + 3.4), 0);
      latticeMast(B, M, m[0], m[2], 0, H, 2.9, 1.5, 0.36, 0.26, [0.92, 0.94, 0.97]);
      F.box(B, M.concrete, 9.6, 6.8, 8.6, 0, WATER_Y + 2.6, sd * (L + 3.4), [0.97, 0.97, 0.96], { uv: 4 });      // 水里的桥墩
      B.add(M.led, new THREE.SphereGeometry(0.55, 10, 8), { x: m[0], y: H + 0.5, z: m[2] }, [1, 0.25, 0.2]);
      // 斜拉索：桥面两侧各 4 根，向大桥两头张开
      for (let k = 1; k <= 4; k++) {
        B.rod(M.gloss, [m[0], H - 3, m[2]], F.at(k * 9.5, sd * (L + 0.5), 1.6), 0.09, [0.95, 0.96, 0.97], 4);
        B.rod(M.gloss, [m[0], H - 3, m[2]], F.at(-k * 9.5, sd * (L + 0.5), 1.6), 0.09, [0.95, 0.96, 0.97], 4);
      }
    }
  }
}

// ————————————————— 石塔桥（大桥西端，内港水道之上） —————————————————

function buildTowerBridge(B, S, M, T) {
  const F = frame(T, ...PLAN.towerBridge), L = F.L, off = L + 0.8 + 4.5, yb = 1.5, bh = 24, top = yb + bh;
  for (const sd of [-1, 1]) {
    const tc = sd * off;                                     // 塔心（横向）
    F.box(B, M.concrete, 10.4, 9.5, 10.2, 0, (WATER_Y - 3 + 0.3) / 2, tc, [0.9, 0.9, 0.88], { uv: 4 });           // 水中的桥墩
    F.box(B, M.stone, 10.6, 1.2, 10.6, 0, 0.9, tc, [0.92, 0.92, 0.9], { uv: 6 });
    F.box(B, M.stone, 9, bh, 9, 0, yb + bh / 2, tc, STONE, { uv: 6 });
    F.box(B, M.paint, 11.8, 0.7, 11.8, 0, 15, tc, WHITE);
    F.box(B, M.paint, 12.4, 1.0, 12.4, 0, top + 0.5, tc, WHITE);
    // 城垛
    for (const a of [-3.4, 0, 3.4]) {
      for (const q of [-1, 1]) {
        F.box(B, M.stone, 1.7, 1.7, 0.9, a, top + 1.85, tc + q * 4.55, STONE, { uv: 6 });
        F.box(B, M.stone, 0.9, 1.7, 1.7, q * 4.55, top + 1.85, tc + a, STONE, { uv: 6 });
      }
    }
    // 八角塔楼 + 蓝色洋葱顶 + 金顶
    const oc = F.at(0, tc, 0);
    const oct = new THREE.CylinderGeometry(4.4, 4.9, 6.6, 8).rotateY(Math.PI / 8);
    scaleUV(oct, 7 / M.TEXEL.stone, 6.6 / M.TEXEL.stone);
    B.add(M.stone, oct, { x: oc[0], y: top + 1 + 3.3, z: oc[2] }, STONE);
    B.cyl(M.paint, 5.3, 5.3, 0.6, oc[0], top + 8.1, oc[2], WHITE, { seg: 8 });
    const prof = [[1, 0], [1.08, 0.22], [1.0, 0.55], [0.78, 0.92], [0.5, 1.28], [0.24, 1.58], [0.07, 1.82], [0, 1.95]].map(([r, y]) => new THREE.Vector2(r * 5.2, y * 5.2));
    B.add(M.gloss, new THREE.LatheGeometry(prof, 28), { x: oc[0], y: top + 8.4, z: oc[2] }, BLUE);
    strut(B, M.gold, [oc[0], top + 17.6, oc[2]], [oc[0], top + 22.6, oc[2]], 0.2, 0.1, GOLD, 6);
    B.add(M.gold, new THREE.SphereGeometry(0.55, 12, 10), { x: oc[0], y: top + 18.5, z: oc[2] }, GOLD);
    // 四角的角楼
    for (const a of [-1, 1]) for (const q of [-1, 1]) {
      const cc = F.at(a * 4.6, tc + q * 4.6, 0);
      B.cyl(M.stone, 0.95, 1.05, 8.5, cc[0], 24.5, cc[2], STONE, { seg: 10 });
      B.cyl(M.gloss, 0.04, 1.3, 3.8, cc[0], 30.7, cc[2], BLUE, { seg: 12 });
      B.add(M.gold, new THREE.SphereGeometry(0.32, 10, 8), { x: cc[0], y: 32.8, z: cc[2] }, GOLD);
    }
    // 窗：尖拱窗（两扇）+ 大拱窗
    const WIN = [0.06, 0.09, 0.13];
    for (const q of [-1, 1]) {
      for (const a of [-2.2, 2.2]) {
        F.box(B, M.window, 1.1, 3.6, 0.3, a, 20.5, tc + q * 4.5, WIN);
        F.box(B, M.window, 0.3, 3.6, 1.1, q * 4.5, 20.5, tc + a, WIN);
      }
      F.box(B, M.window, 2.6, 6.0, 0.3, 0, 9.5, tc + q * 4.5, WIN);
      F.box(B, M.window, 0.3, 6.0, 2.6, q * 4.5, 9.5, tc, WIN);
    }
    // 吊索的锚块
    for (const ds of [-1, 1]) for (const ss of [-1, 1]) F.box(B, M.stone, 1.8, 2.4, 2.0, ds * 5.1, 24.4, ss * (L + 1.9), STONE, { uv: 3 });
  }
  // 两塔之间的上层步道：蓝色桁架 + 玻璃 + 白顶
  const lw = 2 * (off - 4.5), y0 = 22.1, y1 = 25.9;
  F.box(B, M.stone, 5.2, 0.5, lw, 0, 21.8, 0, [0.9, 0.9, 0.9], { uv: 4 });
  for (const fs of [-1, 1]) {
    F.box(B, M.clearGlass, 0.12, 3.6, lw, fs * 2.45, 23.9, 0, [0.6, 0.82, 0.98]);
    for (const y of [y0, y1]) B.rod(M.gloss, F.at(fs * 2.7, -lw / 2, y), F.at(fs * 2.7, lw / 2, y), 0.3, BLUE, 6);
    for (let k = 0; k <= 8; k++) {
      const la = -lw / 2 + (k * lw) / 8;
      B.rod(M.gloss, F.at(fs * 2.7, la, y0), F.at(fs * 2.7, la, y1), 0.15, BLUE, 5);
      if (k < 8) B.rod(M.gloss, F.at(fs * 2.7, la, y0), F.at(fs * 2.7, la + lw / 8, y1), 0.13, BLUE, 4);
      for (const y of [y0, y1]) B.rod(M.gloss, F.at(-2.7, la, y), F.at(2.7, la, y), 0.15, BLUE, 5);
    }
  }
  F.box(B, M.paint, 6.0, 0.35, lw + 0.6, 0, 26.3, 0, WHITE);
  F.box(B, M.gloss, 1.2, 0.5, lw + 0.6, 0, 26.7, 0, BLUE);
  // 悬链：从每座塔身两侧垂到桥面，吊杆拉住桥边
  for (const sd of [-1, 1]) for (const ds of [-1, 1]) for (const ss of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 14; k++) {
      const s = 5.0 + 35 * (k / 14), u = (40 - s) / 35;
      pts.push(F.at(ds * s, ss * (L + 1.9), 2.0 + 23 * Math.pow(u, 1.7)));
    }
    polyline(B, M.gloss, pts, 0.26, BLUE, 6);
    for (let k = 1; k < 14; k += 2) B.rod(M.gloss, pts[k], F.at(ds * (5.0 + 35 * (k / 14)), ss * (L + 0.5), 1.2), 0.09, BLUE, 4);
  }
}

// ————————————————— 港湾看台 —————————————————

function buildStand(B, S, M, group, r) {
  const { x0, x1, z0, z1 } = PLAN.stand, len = x1 - x0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const tread = 2.0, rise = 0.8, rows = Math.floor((z1 - z0) / tread);
  // 阶梯坐席：剖面是一个台阶形，沿东西方向拉出去
  const sh = new THREE.Shape();
  sh.moveTo(z1, 0);
  for (let k = 0; k < rows; k++) { const y = 0.95 + k * rise, z = z1 - tread * k; sh.lineTo(z, y); sh.lineTo(z - tread, y); }
  sh.lineTo(z0, 0); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  g.rotateY(-Math.PI / 2); g.translate(x0 + len, 0, 0);
  B.add(M.concrete, triUV(g, 3, 3), [1.02, 1.01, 0.99]);
  // 座椅 + 观众：一个座位一块椅背，八成座位上有人；坐着的矮一截，站着的高一些，衣服、肤色、发色各不相同
  const seatPts = [];
  for (let k = 0; k < rows; k++) for (let j = 0, n = Math.floor(len / 0.64); j < n; j++) seatPts.push([x0 + (j + 0.5) * 0.64, 0.95 + k * rise, z1 - tread * (k + 0.55), j]);
  const people = seatPts.filter(() => r() < 0.8);
  const chairG = new THREE.BoxGeometry(0.5, 0.46, 0.5).translate(0, 0.62, -0.02);
  const bodyG = new THREE.CapsuleGeometry(0.19, 0.52, 3, 7).translate(0, 0.45, 0), headG = new THREE.SphereGeometry(0.125, 8, 6).translate(0, 1.08, 0);
  const hairG = new THREE.SphereGeometry(0.136, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.52).translate(0, 1.085, 0);
  const plastic = new THREE.MeshStandardMaterial({ roughness: 0.55 }), cloth = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  const chairs = new THREE.InstancedMesh(chairG, plastic, seatPts.length), bodies = new THREE.InstancedMesh(bodyG, cloth, people.length);
  const heads = new THREE.InstancedMesh(headG, plastic, people.length), hair = new THREE.InstancedMesh(hairG, cloth, people.length);
  const o = new THREE.Object3D(), c = new THREE.Color();
  const shirt = [0xd9d9d4, 0x3c5892, 0xb94e44, 0xd8a644, 0x41885f, 0x4b98ad, 0xcf7c42, 0x7c68a6, 0x3c3f46, 0xcf8ea2], skin = [0xf2c9a6, 0xe0ac86, 0xc48a62, 0x8d5a3c];
  const hairC = [0x14100c, 0x2a1a10, 0x4a2c18, 0x7a5530, 0xb89660, 0x1c1c22];
  seatPts.forEach(([x, y, z, j], i) => {
    o.position.set(x, y, z); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix();
    chairs.setMatrixAt(i, o.matrix); chairs.setColorAt(i, c.setHex(((j / 12) | 0) % 2 ? 0x2f5fa8 : 0xc23a34));
  });
  people.forEach(([x, y, z], i) => {
    const sit = r() < 0.7, s = 1.38 + r() * 0.12;
    o.position.set(x + (r() - 0.5) * 0.08, y, z + (r() - 0.5) * 0.1); o.rotation.set(0, (r() - 0.5) * 0.5, 0); o.scale.set(s, sit ? s * 0.74 : s, s); o.updateMatrix();
    for (const m of [bodies, heads, hair]) m.setMatrixAt(i, o.matrix);
    bodies.setColorAt(i, c.setHex(shirt[(r() * shirt.length) | 0])); heads.setColorAt(i, c.setHex(skin[(r() * skin.length) | 0])); hair.setColorAt(i, c.setHex(hairC[(r() * hairC.length) | 0]));
  });
  bodies.castShadow = heads.castShadow = true; bodies.name = 'crowd'; heads.name = 'crowdHeads'; hair.name = 'crowdHair'; chairs.name = 'seats';
  group.add(chairs, bodies, heads, hair);
  // 后墙、屏幕、顶棚、柱子
  B.box(M.paint, len, 0.95 + rows * rise + 3.2, 0.7, cx, (0.95 + rows * rise + 3.2) / 2, z0 - 0.35, WHITE, { uv: 3 });
  B.add(M.glass, rbox(len - 6, 3.2, 0.6, 0.2), { x: cx, y: 0.95 + rows * rise + 1.6, z: z0 - 0.4 }, [0.62, 0.82, 1.0]);
  B.box(M.dark, 22.6, 12.2, 0.7, cx, 20.2, z0 - 0.9, [0.12, 0.13, 0.15]);
  S.add(M.screen, plane(21.5, 11), { x: cx, y: 20.2, z: z0 - 0.5 }, [1, 1, 1]);
  B.box(M.paint, len + 3, 0.45, z1 - z0 + 5, cx, 14.4, cz + 0.8, WHITE, { rot: [0.1, 0, 0], uv: 3 });
  B.box(M.paint, len + 3, 1.3, 0.35, cx, 13.5, z1 + 2.9, WHITE);
  B.box(M.led, len + 2, 0.2, 0.15, cx, 13.2, z1 + 3.1, CYAN);
  for (let k = 0; k < 6; k++) {
    const x = x0 + (len * (k + 0.5)) / 6;
    strut(B, M.paint, [x, 0, z0 + 1.0], [x, 15.2, z0 + 1.0], 0.55, 0.45, WHITE, 10);
    B.rod(M.paint, [x, 9.6, z0 + 1.0], [x, 13.5, z1 + 1.2], 0.26, WHITE, 6);
  }
  // 灯杆
  for (const f of [0.14, 0.38, 0.62, 0.86]) {
    const x = x0 + len * f;
    strut(B, M.steel, [x, 0, z0 - 2.2], [x, 27, z0 - 2.2], 0.42, 0.28, [0.9, 0.92, 0.95], 8);
    B.box(M.lamp, 4.4, 1.7, 0.6, x, 26.4, z0 - 1.4, [1, 0.97, 0.9], { rot: [0.55, 0, 0] });
  }
}

// ————————————————— 环塔：观景塔 + 悬顶的六边形环 —————————————————

function buildRingTower(B, S, M) {
  const { c: [cx, cz], y, r } = PLAN.ring;
  // 裙房、塔身、观景舱
  B.cyl(M.paint, 30, 31, 3, cx, 1.5, cz, WHITE, { seg: 56 });
  const skin = (rt, rb, h, yb, tint) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, 48, 1, false);
    scaleUV(g, (2 * Math.PI * (rt + rb) * 0.5) / M.TEXEL.glass[0], h / M.TEXEL.glass[1]);
    return B.add(M.glassTower, g, { x: cx, y: yb + h / 2, z: cz }, tint);
  };
  skin(24, 25, 15, 3, [0.86, 0.93, 1.0]);
  B.cyl(M.paint, 25.8, 25.8, 1.2, cx, 18.6, cz, WHITE, { seg: 56 });
  skin(8.2, 12.5, 171, 19.2, [0.84, 0.92, 1.0]);
  B.cyl(M.paint, 20.6, 20.6, 1.2, cx, 190.2, cz, WHITE, { seg: 48 });
  skin(19, 17, 11, 190.8, [0.95, 0.98, 1.0]);
  B.cyl(M.paint, 20.2, 20.6, 1.2, cx, 202.0, cz, WHITE, { seg: 48 });
  latticeMast(B, M, cx, cz, 203, 37, 3.6, 1.0, 0.32, 0.22, WHITE);
  // 六边形环：立在环平面里，正面朝向起点线
  const [sx, sz] = toWorld(108, 126.6);
  const nrm = new THREE.Vector3(sx - cx, 0, sz - cz).normalize(), ex = new THREE.Vector3().crossVectors(nrm, _up).normalize();
  const V = (a) => new THREE.Vector3().addScaledVector(ex, r * Math.cos(a)).addScaledVector(_up, r * Math.sin(a)).add(new THREE.Vector3(cx, y, cz));
  const C0 = new THREE.Vector3(cx, y, cz);
  for (let k = 0; k < 6; k++) {
    const a0 = -Math.PI / 2 + (k * Math.PI) / 3, a1 = a0 + Math.PI / 3;
    B.rod(M.paint, V(a0).toArray(), V(a1).toArray(), 2.8, WHITE, 12);
    // 内侧的灯带：贴着环的内缘，两头各让出一点
    const P0 = V(a0), P1 = V(a1), A = P0.clone().lerp(P1, 0.04), C = P0.clone().lerp(P1, 0.96);
    const inward = C0.clone().sub(P0.clone().lerp(P1, 0.5)).normalize();
    A.addScaledVector(inward, 3.5); C.addScaledVector(inward, 3.5);
    const D = C.clone().sub(A), g = new THREE.CylinderGeometry(0.55, 0.55, D.length(), 8, 1, true), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, k);
    _q.setFromUnitVectors(_up, D.normalize());
    S.add(M.ringLed, g, _m.compose(_t.addVectors(A, C).multiplyScalar(0.5), _q, _one), [1, 1, 1]);
  }
  for (const sd of [-1, 1]) {                               // 两根斜撑把环的下沿拉到桅杆上
    const a = -Math.PI / 2 + (sd * Math.PI) / 3;
    strut(B, M.paint, [cx, 214, cz], V(a).toArray(), 0.9, 0.7, WHITE, 8);
  }
}

// ————————————————— 入口 —————————————————

export function buildLandmarks(T, M, onStep = () => {}) {
  const group = new THREE.Group();
  group.name = 'landmarks';
  const B = createBatcher(), S = createBatcher(), r = mulberry32(1111);
  const steps = [
    () => buildMall(B, S, M), () => buildCanopy(B, S, M, group), () => buildDomes(B, S, M, group),
    () => buildArch(B, S, M, T), () => buildPylons(B, S, M, T), () => buildTowerBridge(B, S, M, T),
    () => buildStand(B, S, M, group, r), () => buildRingTower(B, S, M),
  ];
  steps.forEach((fn, k) => { fn(); onStep((k + 1) / (steps.length + 1)); });
  B.build(group, { name: 'lm' });
  S.build(group, { name: 'lmfx', castShadow: false, receiveShadow: true });
  onStep(1);
  return { group };
}

/** 世界坐标 (X, Z) 是否压在某个地标的占地上（摆树、摆灯的时候避开） */
export function inLandmark(X, Z) {
  for (const f of FOOTPRINTS) {
    if (f.kind === 'rect') { if (X >= f.x0 && X <= f.x1 && Z >= f.z0 && Z <= f.z1) return true; }
    else if (f.kind === 'poly') {
      let inside = false;
      for (let i = 0, j = f.pts.length - 1; i < f.pts.length; j = i++) {
        const a = f.pts[i], b = f.pts[j];
        if ((a[1] > Z) !== (b[1] > Z) && X < ((b[0] - a[0]) * (Z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      if (inside) return true;
    } else if (Math.hypot(X - f.c[0], Z - f.c[1]) <= f.r) return true;
  }
  return false;
}
