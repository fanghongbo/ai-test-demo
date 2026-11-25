// 船体与舱外的一切：船壳、露天甲板、舰桥、烟囱、桅杆、甲板吊机、船首楼的集装箱、栏杆、系缆桩、救生筏。
// 玩家在货舱里时，隔着 7.2 m 的高墙能看到的只有舰桥、吊机、桅杆和船首楼上的箱堆；在菜单的环绕镜头里则整条船都在画面里。
import * as THREE from 'three';
import { L, CONTAINER_COLORS } from '../core/config.js';
import { createBatcher, plane, scaleUV, colored, uvBox } from '../gfx/batch.js';
import { railing, pipe } from './parts.js';
import { PAINT } from './deck.js';
import { decalRect } from '../gfx/textures.js';
import { TEXEL } from './materials.js';

const PI = Math.PI;
const YELLOW = 0xd2a21f, WHITE = 0xdedcd2, DARK = 0x2b2d2f, HL = 66;

/** 船壳平面轮廓的半宽（和 sea.js 着色器里的 hullBeam 一致） */
export const hullBreadth = (x) => {
  const ax = Math.abs(x);
  if (ax < 40) return 11.2;
  if (x > 0) return 11.2 * Math.sqrt(Math.max(0, 1 - ((x - 40) / 26) ** 2));
  return 11.2 * (1 - Math.min((-x - 40) / 26, 1) ** 2 * 0.55);
};
/** 舷墙顶的高度：货舱段是 7.2 m 的高墙，向首尾各用 4.2 m 斜收到 0.42 m 的矮舷墙 */
const topAt = (x) => {
  const a = Math.abs(x);
  if (a <= 31.8) return L.houseH;
  if (a < 36) return L.houseH + (0.42 - L.houseH) * (a - 31.8) / 4.2;      // 货舱高墙收到矮舷墙
  if (x < 44) return 0.42;
  return x < 46 ? 0.42 + 2.6 * (x - 44) / 2 : 3.02;                         // 抬到船首楼面
};

function strip(pos, nrm, uv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}
/** 一串四边形组成的条带生成器（平面法线，朝外） */
function quads() {
  const pos = [], nrm = [], uv = [];
  const quad = (a, b, c, d, fu, fv) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (const p of [a, b, c, a, c, d]) { pos.push(p[0], p[1], p[2]); nrm.push(nx, ny, nz); uv.push(fu ? fu(p) : p[0] / TEXEL.hull, fv ? fv(p) : p[1] / 8); }
  };
  return { quad, geo: () => strip(pos, nrm, uv) };
}

export function buildShip(shipRoot, M, o = {}) {
  const B = createBatcher();
  const anim = { radar: null, funnelTop: new THREE.Vector3(-62.3, 17.6, 0), navLights: [] };
  const st = [];
  for (let x = -HL; x < HL - 0.01; x += 1.5) st.push(x);
  st.push(HL);

  // ———————————————— 船壳 ————————————————
  const hull = quads(), white = quads(), red = quads(), fence = quads();
  const levels = [0, -1.0, -3.0, -6.0, -9.6, -10.8], zf = [1, 1, 0.998, 0.992, 0.985, 0.962];
  const sideQuad = (q, a, b, c, d, s, fu, fv) => { if (s > 0) q.quad(a, b, c, d, fu, fv); else q.quad(a, d, c, b, fu, fv); };
  for (let i = 0; i < st.length - 1; i++) {
    const xa = st[i], xb = st[i + 1], ba = hullBreadth(xa), bb = hullBreadth(xb), ta = topAt(xa), tb = topAt(xb);
    for (const s of [-1, 1]) {
      sideQuad(hull, [xa, 0, s * ba], [xb, 0, s * bb], [xb, tb, s * bb], [xa, ta, s * ba], s);
      for (let k = 0; k < levels.length - 1; k++) sideQuad(hull, [xa, levels[k + 1], s * ba * zf[k + 1]], [xb, levels[k + 1], s * bb * zf[k + 1]], [xb, levels[k], s * bb * zf[k]], [xa, levels[k], s * ba * zf[k]], s);
      sideQuad(white, [xa, -0.56, s * ba * 1.006], [xb, -0.56, s * bb * 1.006], [xb, -0.2, s * bb * 1.006], [xa, -0.2, s * ba * 1.006], s, (p) => p[0] / TEXEL.paint, (p) => p[1] / TEXEL.paint);
      sideQuad(red, [xa, -10.8, s * ba * zf[5] * 1.004], [xb, -10.8, s * bb * zf[5] * 1.004], [xb, -9.35, s * bb * 0.987], [xa, -9.35, s * ba * 0.987], s, (p) => p[0] / TEXEL.paint, (p) => p[1] / TEXEL.paint);
      B.rod(M.paint, [xa, ta, s * ba], [xb, tb, s * bb], 0.07, WHITE, 6);                             // 舷墙顶的压条
      if (Math.abs(xa) > 36) {                                                                          // 首尾段：矮舷墙上的立柱、扶手、铁丝网
        const u0 = i * 1.5 / 0.6, u1 = (i + 1) * 1.5 / 0.6, za = s * (ba - 0.1), zb = s * (bb - 0.1);
        if (i % 2 === 0) B.cyl(M.metal, 0.028, 0.028, 0.95, xa, 0.42 + 0.475, za, WHITE, { seg: 6 });
        for (const h of [0.5, 0.95]) B.rod(M.metal, [xa, 0.42 + h, za], [xb, 0.42 + h, zb], 0.02, WHITE, 6);
        sideQuad(fence, [xa, 0.5, za], [xb, 0.5, zb], [xb, 1.3, zb], [xa, 1.3, za], s, (p) => u0 + (p[0] - xa) / 1.5 * (u1 - u0), (p) => (p[1] - 0.5) / 0.8 * 1.33);
      } else if (i % 2 === 0 && Math.abs(xa) < 31) {
        B.box(M.paint, 0.3, L.houseH - 0.3, 0.14, xa, (L.houseH - 0.3) / 2, s * (ba + 0.07), DARK, { uv: TEXEL.paint });   // 货舱段外侧的竖向加强筋
      }
    }
  }
  const bt = hullBreadth(-HL);
  hull.quad([-HL, 0, -bt], [-HL, 0, bt], [-HL, 0.42, bt], [-HL, 0.42, -bt]);
  for (let k = 0; k < levels.length - 1; k++) hull.quad([-HL, levels[k + 1], -bt * zf[k + 1]], [-HL, levels[k + 1], bt * zf[k + 1]], [-HL, levels[k], bt * zf[k]], [-HL, levels[k], -bt * zf[k]]);
  white.quad([-HL, -0.56, -bt * 1.006], [-HL, -0.56, bt * 1.006], [-HL, -0.2, bt * 1.006], [-HL, -0.2, -bt * 1.006], (p) => p[2] / TEXEL.paint, (p) => p[1] / TEXEL.paint);
  B.add(M.hull, hull.geo(), null, 0xffffff);
  B.add(M.paint, white.geo(), null, 0xe4e2d8);
  B.add(M.paint, red.geo(), null, 0x7a2a1e);
  B.add(M.fence, fence.geo(), null, 0xb9bcb8);

  // ———————————————— 露天甲板 ————————————————
  const plate = (pts, y, color = 0xffffff) => {
    const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))));
    scaleUV(g, 1 / TEXEL.deck, 1 / TEXEL.deck);
    return B.add(M.deck, g, { y, rx: -PI / 2 }, color);
  };
  const taper = (x0, x1, inset, step = 2) => { const p = []; for (let x = x0; x1 > x0 ? x <= x1 + 0.01 : x >= x1 - 0.01; x += x1 > x0 ? step : -step) p.push([Math.min(x, x1), hullBreadth(Math.min(x, x1)) - inset]); return p; };
  const aftSide = taper(-40, -HL, 0.08), foreSide = taper(46, HL, 0.12);
  plate([[31.8, -11.12], [46, -11.12], ...foreSide.map(([x, z]) => [x, -z]), ...foreSide.slice().reverse(), [46, 11.12], [31.8, 11.12]], 0);   // 首部主甲板
  plate([[-31.8, -11.12], [-40, -11.12], ...aftSide.map(([x, z]) => [x, -z]), ...aftSide.slice().reverse(), [-40, 11.12], [-31.8, 11.12]], 0); // 尾部主甲板
  plate(foreSide.map(([x, z]) => [x, -z]).reverse().concat(foreSide), 2.6);                                                               // 船首楼顶
  B.box(M.paint, 0.3, 2.6, 21.0, 46, 1.3, 0, PAINT.wall, { uv: TEXEL.paint });                                                            // 首楼前的挡浪板
  // 货舱高墙与矮舷墙之间的斜面封板
  for (const sx of [-1, 1]) for (const s of [-1, 1]) {
    const q = quads();
    q.quad([sx * 31.8, 0, s * 11.2], [sx * 31.8, L.houseH, s * 11.2], [sx * 36, 0.42, s * 11.2], [sx * 36, 0, s * 11.2], (p) => p[0] / TEXEL.paint, (p) => p[1] / TEXEL.paint);
    B.add(M.paint, q.geo(), null, PAINT.wall);
  }
  // 首楼斜壁：从主甲板抬到首楼面

  // ———————————————— 舰桥（船尾的上层建筑） ————————————————
  const tier = (x0, x1, y0, h, hz) => B.box(M.paint, x1 - x0, h, 2 * hz, (x0 + x1) / 2, y0 + h / 2, 0, WHITE, { uv: TEXEL.paint });
  tier(-64, -40, 0, 2.9, 10.2); tier(-64, -41.6, 2.9, 2.9, 10.2); tier(-64, -43.4, 5.8, 2.9, 9.6); tier(-61, -46.5, 8.7, 2.9, 9.0);
  B.box(M.paint, 2.6, 0.3, 22.8, -47.8, 8.55, 0, WHITE, { uv: TEXEL.paint });                                // 驾驶室两翼
  const win = (x, y, z, w, h, ry = 0) => B.add(M.glass, uvBox(w, h, 0.05, 2), { x, y, z, ry }, 0xffffff);
  for (let x = -62.6; x < -42; x += 2.2) for (const sz of [-1, 1]) win(x, 4.45, sz * 10.22, 1.2, 0.85, 0);
  for (let x = -62.6; x < -44; x += 2.2) for (const sz of [-1, 1]) win(x, 7.35, sz * 9.62, 1.2, 0.85, 0);
  for (let z = -8.8; z <= 8.8; z += 2.2) win(-41.58, 4.45, z, 1.2, 0.85, PI / 2);
  for (let z = -8.2; z <= 8.2; z += 2.05) win(-43.38, 7.35, z, 1.2, 0.85, PI / 2);
  for (let z = -6.3; z <= 6.3; z += 2.1) win(-46.42, 10.55, z, 1.6, 1.2, PI / 2);
  for (const sz of [-1, 1]) for (const x of [-60.2, -57.8, -55.4, -53.0, -50.6, -48.2]) win(x, 10.55, sz * 9.02, 1.5, 1.2, 0);
  for (const sz of [-1, 1]) {                                                                                // 两翼端头的窗与舷灯（左红右绿）
    win(-47.8, 10.0, sz * 11.3, 1.8, 1.0, sz > 0 ? 0 : PI);
    B.add(sz < 0 ? M.lampGreen : M.lampRed, new THREE.SphereGeometry(0.12, 10, 8), { x: -47.8, y: 9.3, z: sz * 11.45 }, 0xffffff);
    anim.navLights.push({ x: -47.8, y: 9.3, z: sz * 11.45, color: sz < 0 ? 0x28ff66 : 0xff2a12 });
    railing(B, M.metal, [[-49.0, 8.7, sz * 9.15], [-49.0, 8.7, sz * 11.35], [-46.6, 8.7, sz * 11.35]], 1.05, WHITE, { spacing: 1.2 });
    railing(B, M.metal, [[-63.8, 5.8, sz * 9.55], [-43.6, 5.8, sz * 9.55]], 1.0, WHITE, { spacing: 1.6 });
  }
  railing(B, M.metal, [[-40.2, 2.9, -10.1], [-40.2, 2.9, 10.1]], 1.0, WHITE, { spacing: 1.6 });
  for (const sz of [-1, 1]) railing(B, M.metal, [[-63.8, 2.9, sz * 10.1], [-40.2, 2.9, sz * 10.1]], 1.0, WHITE, { spacing: 1.6 });
  railing(B, M.metal, [[-43.6, 5.8, -9.5], [-43.6, 5.8, 9.5]], 1.0, WHITE, { spacing: 1.6 });
  for (const z of [-6.5, 6.5]) {                                                                            // 水密门
    B.box(M.paint, 0.1, 1.95, 0.95, -39.96, 1.0, z, 0x7c8082, { uv: TEXEL.paint });
    B.add(M.metal, new THREE.TorusGeometry(0.2, 0.03, 8, 18), { x: -39.86, y: 1.0, z: z, ry: PI / 2 }, 0x9a9c9c);
  }
  // 两段舷梯：主甲板 → 一层顶 → 二层顶
  const stair = (x, z0, z1, y0, y1, w = 1.0) => {
    const len = Math.hypot(z1 - z0, y1 - y0), a = Math.atan2(y1 - y0, Math.abs(z1 - z0)) * (z1 > z0 ? -1 : 1);
    B.box(M.paint, w, 0.07, len, x, (y0 + y1) / 2, (z0 + z1) / 2, 0x6c7072, { uv: TEXEL.paint, rot: [a, 0, 0] });
    B.box(M.paint, 1.6, 0.1, 1.3, x - 0.5, y1 - 0.05, z1 - 0.5 * (z1 > z0 ? 1 : -1), 0x6c7072, { uv: TEXEL.paint });       // 顶层的小平台，搭到上一层屋顶边
    for (const sx of [-1, 1]) railing(B, M.metal, [[x + sx * w * 0.5, y0 + 0.07, z0], [x + sx * w * 0.5, y1 + 0.07, z1]], 0.95, YELLOW, { spacing: 1.4, rails: [1, 0.5], seg: 5 });
  };
  stair(-39.4, -9.4, -4.6, 0, 2.9); stair(-40.8, 9.4, 4.6, 2.9, 5.8);
  // 烟囱：白底 + 黑白格箍 + 黑口
  const fx = -62.3;
  B.add(M.paint, new THREE.CylinderGeometry(1, 1, 8.6, 28), { x: fx, y: 8.7 + 4.3, z: 0, sx: 2.2, sz: 1.6 }, WHITE);
  for (let row = 0; row < 2; row++) for (let k = 0; k < 18; k++) {
    const a = (k / 18) * 2 * PI;
    B.box(M.paint, 0.84, 0.78, 0.14, fx + 2.22 * Math.cos(a), 14.75 + row * 0.8, 1.62 * Math.sin(a), (k + row) % 2 ? 0x161616 : 0xe8e6dc, { uv: TEXEL.paint, rot: [0, PI / 2 - a, 0] });
  }
  B.add(M.paint, new THREE.CylinderGeometry(1, 1, 0.5, 28), { x: fx, y: 17.15, z: 0, sx: 2.26, sz: 1.66 }, 0x161616);
  B.add(M.matte, new THREE.CylinderGeometry(1, 1, 0.2, 24), { x: fx, y: 17.3, z: 0, sx: 1.9, sz: 1.3 }, 0x050505);
  anim.funnelTop.set(fx, 17.6, 0);
  // 雷达桅杆：四根收分立杆 + 横撑 + 平台 + 旋转雷达条 + 天线 + 桅顶白灯
  const mx = -56.5, legs = [[-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]];
  legs.forEach(([lx, lz], i) => B.rod(M.paint, [mx + lx, 11.6, lz], [mx + lx * 0.45, 21.2, lz * 0.45], 0.07, WHITE, 6));
  for (const y of [14.4, 17.2, 20.0]) for (let i = 0; i < 4; i++) {
    const a = legs[i], b = legs[(i + 1) % 4], k = 1 - (y - 11.6) / 9.6 * 0.55;
    B.rod(M.paint, [mx + a[0] * k, y, a[1] * k], [mx + b[0] * k, y, b[1] * k], 0.035, WHITE, 5);
  }
  B.box(M.paint, 2.4, 0.1, 2.4, mx, 17.25, 0, 0x6c7072, { uv: TEXEL.paint });
  B.rod(M.paint, [mx, 21.2, 0], [mx, 24.6, 0], 0.05, WHITE, 6);
  B.add(M.lamp, new THREE.SphereGeometry(0.13, 10, 8), { x: mx, y: 24.7, z: 0 }, 0xffffff);
  for (const [dx, dz, h] of [[0.9, 0.5, 2.2], [-0.9, -0.5, 1.8], [0.3, -0.9, 1.5]]) B.rod(M.metal, [mx + dx, 17.3, dz], [mx + dx, 17.3 + h, dz], 0.018, 0x9a9c9c, 5);
  const radar = new THREE.Mesh(colored(uvBox(3.4, 0.16, 0.36, 2)), M.paint);
  radar.position.set(mx, 19.3, 0); radar.castShadow = true; shipRoot.add(radar); anim.radar = radar;
  // 救生艇：挂在二层顶两侧的吊架上
  for (const sz of [-1, 1]) {
    B.add(M.paint, new THREE.CapsuleGeometry(1.15, 4.2, 6, 14), { x: -53, y: 7.5, z: sz * 11.6, rz: PI / 2, sx: 1, sy: 0.95, sz: 1 }, 0xd9651c);
    B.box(M.paint, 3.6, 0.5, 1.7, -53, 8.35, sz * 11.6, 0xe9e6dc, { uv: TEXEL.paint });
    for (const dx of [-2.2, 2.2]) { B.rod(M.paint, [-53 + dx, 5.8, sz * 10.0], [-53 + dx, 8.9, sz * 11.4], 0.09, WHITE, 8); B.rod(M.metal, [-53 + dx, 8.9, sz * 11.4], [-53 + dx, 8.5, sz * 11.5], 0.02, 0x555, 5); }
  }

  // ———————————————— 甲板吊机 ————————————————
  const crane = (x, z, heading) => {
    const Y = YELLOW, th = 0.72, c = Math.cos(heading), s = Math.sin(heading);
    const P = (lx, ly, lz) => { const px = lx * Math.cos(th) - ly * Math.sin(th), py = lx * Math.sin(th) + ly * Math.cos(th); return [x + px * c + lz * s, 6.5 + py, z - px * s + lz * c]; };
    B.cyl(M.paint, 1.5, 1.9, 3.2, x, 1.6, z, DARK, { seg: 24 });
    B.cyl(M.paint, 1.2, 1.2, 1.5, x, 3.95, z, Y, { seg: 24 });
    B.box(M.paint, 4.6, 2.7, 3.3, x + 0.2 * c, 6.05, z - 0.2 * s, Y, { uv: TEXEL.paint, rot: [0, heading, 0] });
    B.add(M.glass, uvBox(2.6, 1.0, 0.06, 2), { x: x + 2.34 * c, y: 6.5, z: z - 2.34 * s, ry: heading }, 0xffffff);
    B.box(M.paint, 5.0, 0.14, 3.7, x + 0.2 * c, 7.47, z - 0.2 * s, 0xe9e6dc, { uv: TEXEL.paint, rot: [0, heading, 0] });
    for (const sz of [-1, 1]) {                                                                            // 吊臂：下弦两根 + 上弦两根 + 腹杆
      B.rod(M.paint, P(0, 0, sz * 0.62), P(27, 0, sz * 0.3), 0.13, Y, 8);
      B.rod(M.paint, P(0, 1.1, sz * 0.62), P(27, 0.3, sz * 0.3), 0.11, Y, 8);
      for (let k = 0; k < 12; k++) {
        const a = k * 2.25, b = a + 2.25;
        B.rod(M.paint, P(a, 0, sz * 0.62), P(b, k % 2 ? 1.1 : 0.62, sz * 0.5), 0.05, Y, 5);
        B.rod(M.paint, P(a, k % 2 ? 1.0 : 0.5, sz * 0.56), P(b, k % 2 ? 0.6 : 1.05, sz * 0.56), 0.045, Y, 5);
      }
    }
    for (let k = 0; k <= 12; k++) { B.rod(M.paint, P(k * 2.25, 0, -0.6), P(k * 2.25, 0, 0.6), 0.05, Y, 5); B.rod(M.paint, P(k * 2.25, 1.0, -0.55), P(k * 2.25, 1.0, 0.55), 0.045, Y, 5); }
    const apex = [x - 1.6 * c, 12.6, z + 1.6 * s];
    for (const sz of [-1, 1]) { B.rod(M.paint, [x - 0.4 * c + sz * 1.3 * s, 7.5, z + 0.4 * s + sz * 1.3 * c], apex, 0.11, Y, 8); B.rod(M.metal, apex, P(12.5, 1.0, sz * 0.45), 0.04, 0x555, 5); }
    const tip = P(27.4, 0.05, 0);
    B.rod(M.metal, tip, [tip[0], tip[1] - 7.5, tip[2]], 0.025, 0x2a2a2a, 5);
    B.box(M.paint, 0.5, 0.7, 0.35, tip[0], tip[1] - 7.9, tip[2], 0x3a3c3e, { uv: TEXEL.paint });
    B.add(M.metal, new THREE.TorusGeometry(0.2, 0.05, 8, 16, PI * 1.3), { x: tip[0], y: tip[1] - 8.45, z: tip[2] }, 0x8a8c8c);
  };
  crane(38.6, 0, 0);
  crane(-36.2, 0, PI);

  // ———————————————— 首部：舱盖、箱堆、桅杆、锚 ————————————————
  B.box(M.paint, 11.5, 0.85, 19.2, 38.4, 0.425, 0, 0x4e5356, { uv: TEXEL.paint });                                 // 舱盖
  const cargo = [];
  for (const [cx, cz, n] of [[35.6, -8.2, 2], [35.6, 8.2, 2], [42.0, -8.3, 1], [42.0, 8.3, 2], [35.6, 0, 1]]) for (let k = 0; k < n; k++) cargo.push({ t: { x: cx, y: 0.85 + k * L.contH, z: cz, ry: k % 2 ? PI : 0 }, color: CONTAINER_COLORS[['blue', 'red', 'grey', 'green', 'white'][(cargo.length * 3 + k) % 5]] });
  for (const cx of [50.6, 56.8]) for (const cz of [-3.0, 0, 3.0]) for (let k = 0; k < 3; k++) cargo.push({ t: { x: cx, y: 2.6 + k * L.contH, z: cz, ry: k % 2 ? PI : 0 }, color: CONTAINER_COLORS[['green', 'grey', 'olive', 'blue', 'red', 'white'][(cargo.length * 5 + k) % 6]] });
  for (const cz of [-6.0, 6.0]) for (let k = 0; k < 2; k++) cargo.push({ t: { x: 50.6, y: 2.6 + k * L.contH, z: cz }, color: CONTAINER_COLORS[k ? 'white' : 'blue'] });
  if (o.g20) { const m = B.instances(M.paint, o.g20, cargo, { name: 'cargo' }); if (m) shipRoot.add(m); }
  // 首楼挡浪板顶的栏杆、首楼上的小舱口与绞盘
  railing(B, M.metal, [[46.1, 2.6, -10.6], [46.1, 2.6, 10.6]], 1.05, YELLOW, { spacing: 1.8 });
  B.box(M.paint, 2.6, 0.7, 2.0, 61.6, 2.95, 0, DARK, { uv: TEXEL.paint });
  for (const sz of [-1, 1]) {
    B.cyl(M.paint, 0.55, 0.55, 1.1, 60.6, 3.15, sz * 2.6, 0x3a3c3e, { rot: [PI / 2, 0, 0], seg: 16 });
    const hx = 61.5, hz = hullBreadth(hx), ha = 0.58;                                                                                            // 锚链孔、锚、船名
    B.box(M.matte, 1.3, 1.9, 0.06, hx + 0.05, -0.2, sz * (hz + 0.03), 0x0a0a0a, { rot: [0, sz > 0 ? ha : PI - ha, 0] });
    B.rod(M.metal, [hx + 0.5, -0.1, sz * (hz + 0.22)], [hx + 0.1, -1.8, sz * (hullBreadth(hx + 0.1) + 0.22)], 0.09, 0x2a2a2a, 8);
    B.box(M.metal, 1.0, 0.25, 0.2, hx + 0.05, -1.85, sz * (hullBreadth(hx) + 0.22), 0x2a2a2a, { rot: [0, sz * 0.6, 0] });
    const nx = 57.4, nz = hullBreadth(nx), na = 0.36;
    B.add(M.decal, plane(5.6, 1.4, decalRect(1024, 1024, 1024, 512)), { x: nx, y: -2.5, z: sz * (nz + 0.03), ry: sz > 0 ? na : PI - na }, 0xffffff);
  }
  // 首桅：杆、横桁、桅顶白灯
  B.rod(M.paint, [63.6, 2.6, 0], [63.6, 17.5, 0], 0.2, WHITE, 10);
  B.rod(M.paint, [63.6, 14.0, -4.2], [63.6, 14.0, 4.2], 0.07, WHITE, 6);
  B.add(M.lamp, new THREE.SphereGeometry(0.13, 10, 8), { x: 63.6, y: 17.6, z: 0 }, 0xffffff);
  for (const sz of [-1, 1]) B.rod(M.paint, [63.6, 16.2, 0], [63.6, 14.0, sz * 4.2], 0.03, WHITE, 5);
  B.add(M.decal, plane(5.0, 2.5, decalRect(1024, 1024, 1024, 512)), { x: -HL - 0.03, y: -2.6, z: 0, ry: -PI / 2 }, 0xffffff);   // 船尾的船名

  // ———————————————— 甲板杂件：系缆桩、救生筏、消防管、通风帽、舱盖上的货 ————————————————
  const bollard = (x, z) => { B.box(M.metal, 0.9, 0.1, 0.5, x, 0.05, z, 0x2a2c2e, { uv: 1 }); for (const dz of [-0.28, 0.28]) B.cyl(M.metal, 0.17, 0.21, 0.6, x, 0.4, z + dz, 0x2a2c2e, { seg: 12 }); };
  for (const sz of [-1, 1]) for (const x of [33.2, 44.2, -33.6, -38.6]) bollard(x, sz * 9.9);
  for (const sz of [-1, 1]) for (const x of [35.6, 41.0, -34.6]) {
    B.add(M.paint, new THREE.CylinderGeometry(0.46, 0.46, 1.25, 14), { x, y: 1.25, z: sz * 10.45, rz: PI / 2 }, 0xe6e4da);
    B.box(M.paint, 1.0, 0.5, 0.5, x, 0.85, sz * 10.45, DARK, { uv: TEXEL.paint });
  }
  for (const sz of [-1, 1]) pipe(B, M.paint, [[31.9, 0.5, sz * 10.3], [45.6, 0.5, sz * 10.3]], 0.11, PAINT.pipeRed);
  for (const sz of [-1, 1]) pipe(B, M.paint, [[-39.6, 0.5, sz * 10.3], [-31.9, 0.5, sz * 10.3]], 0.11, PAINT.pipeRed);
  for (const [x, z] of [[47.4, -7.6], [47.4, 7.6], [34.4, -5.2], [34.4, 5.2]]) { B.cyl(M.paint, 0.3, 0.34, 1.5, x, 0.75 + (x > 46 ? 2.6 : 0), z, PAINT.white, { seg: 12 }); B.cyl(M.paint, 0.5, 0.42, 0.16, x, 1.58 + (x > 46 ? 2.6 : 0), z, PAINT.steelDark, { seg: 14 }); }

  const meshes = B.build(shipRoot, { name: 'ship' });
  return { meshes, anim };
}
