// 可玩的货舱甲板：两端出生舱、两条舷侧通道、中间的集装箱场。
// 舱壁、通道、出生舱都是“盒子 + 贴图”，每一块墙同时登记成碰撞体——移动、子弹、视线、寻路共用这一份。
import * as THREE from 'three';
import { L, CONTAINERS, CRATES, CONTAINER_COLORS, FRAMES } from '../core/config.js';
import { createBatcher, plane, scaleUV, colored, uvBox } from '../gfx/batch.js';
import { corrugated, containerGeometry, crateGeometry, railing, pipe, mergeParts } from './parts.js';
import { decalUV, decalRect } from '../gfx/textures.js';
import { rng } from '../gfx/texgen.js';
import { TEXEL } from './materials.js';

const PI = Math.PI;
export const PAINT = Object.freeze({
  wall: 0x868e80, wallIn: 0x8f9297, band: 0xadaea3, ceiling: 0x777a74,
  yellow: 0xd8a21c, white: 0xd9d7cc, steelDark: 0x4b4f51, steel: 0x8b9093,
  pipeGrey: 0x8d9293, pipeYellow: 0xc9a02a, pipeRed: 0x9c2a1e, red: 0xb32a1e, orange: 0xd9651c,
});
const ALT = ['grey', 'blue', 'red', 'white'];                 // 叠在上层的集装箱换个别的颜色
const CRATE_DECALS = [[1040, 268, 250, 84], [1040, 396, 250, 100], [1290, 276, 220, 108], [1348, 372, 104, 96], [1524, 278, 280, 44]];

/**
 * @param {THREE.Group} shipRoot 整条船的根节点
 * @param {object} M materials.js 的材质库
 * @param {StaticWorld} world 碰撞体集合
 */
export function buildDeck(shipRoot, M, world, o = {}) {
  const B = createBatcher(), R = rng(7);
  const lamps = { night: [] };                               // 夜里才亮的光（点光 / 泛光灯）
  const DX = L.deckX, DZ = L.deckZ, HZ = L.houseZ, HH = L.houseH, TH = L.tunH, CH = L.cabinH, len = 2 * DX;

  /** 盒子：画出来，同时登记为碰撞体。(x, y, z) = 底面中心 */
  const wall = (x, y, z, w, h, d, color, tag = 'wall') => {
    B.box(M.paint, w, h, d, x, y + h / 2, z, color, { uv: TEXEL.paint });
    return world.aabb(x - w / 2, x + w / 2, z - d / 2, z + d / 2, y, y + h, 'steel', tag);
  };
  /** 贴花：w × h 的平面，中心 (x, y, z)，rot = [绕 X, 绕 Y, 绕 Z] */
  const dec = (uv, w, h, x, y, z, rot = [0, 0, 0], tint = 0xffffff) => B.add(M.decal, plane(w, h, uv), { x, y, z, rx: rot[0], ry: rot[1], rz: rot[2] }, tint);
  const night = (l, base) => { l.intensity = 0; l.userData.base = base; shipRoot.add(l); lamps.night.push(l); return l; };
  const cagedLamp = (x, y, z) => {
    B.cyl(M.metal, 0.03, 0.03, 0.1, x, y + 0.12, z, PAINT.steelDark, { seg: 8 });
    B.add(M.lamp, new THREE.SphereGeometry(0.075, 12, 8), { x, y, z }, 0xffffff);
    for (const dy of [-0.05, 0.05]) B.add(M.metal, new THREE.TorusGeometry(0.09, 0.007, 6, 14), { x, y: y + dy, z, rx: PI / 2 }, 0x3a3c3e);
    for (let k = 0; k < 4; k++) {
      const a = k * PI / 2 + PI / 4;
      B.rod(M.metal, [x + Math.cos(a) * 0.09, y - 0.07, z + Math.sin(a) * 0.09], [x + Math.cos(a) * 0.09, y + 0.07, z + Math.sin(a) * 0.09], 0.006, 0x3a3c3e, 5);
    }
  };

  // ————————————————— 货舱底板 —————————————————
  B.add(M.deck, uvBox(L.cabinX * 2 + 0.8, 0.3, 2 * HZ + 0.6, TEXEL.deck), { y: -0.15 }, 0xffffff);

  // ————————————————— 两侧的舷侧舱室：高墙 + 通道 + 顶部走道 —————————————————
  for (const side of [-1, 1]) {
    const zc = side * (L.tunZ0 + L.tunZ1) / 2, tw = L.tunZ1 - L.tunZ0;
    B.add(M.paint, corrugated(len, HH, 0.6, 0.09, { grime: 0.72 }), { z: side * DZ, ry: side > 0 ? PI : 0 }, PAINT.wall);   // 朝甲板的瓦楞舱壁
    wall(0, 0, side * (DZ + 0.006 + (L.tunZ0 - DZ - 0.012) / 2), len, HH, L.tunZ0 - DZ - 0.012, PAINT.wallIn);           // 舱壁实体，内侧面就是通道的内墙
    wall(0, 0, side * (L.tunZ1 + 0.25), len, HH, 0.5, PAINT.wallIn);                                                      // 通道外墙
    wall(0, TH, zc, len, HH - TH, tw, PAINT.ceiling, 'ceiling');                                                          // 通道顶板以上填实（底面就是通道的顶）
    B.box(M.paint, len, 1.05, 0.03, 0, 0.525, side * (DZ - 0.105), PAINT.band, { uv: TEXEL.paint });                       // 下部浅色护板
    B.box(M.paint, len + 0.4, 0.14, 0.46, 0, HH + 0.07, side * (DZ - 0.02), PAINT.steelDark, { uv: TEXEL.paint });        // 墙顶压条
    // 通道：顶板、横梁、立柱、管线、门框
    for (let x = -DX + 1.2; x < DX; x += 2.4) {
      B.box(M.paint, 0.26, 0.24, tw, x, TH - 0.12, zc, PAINT.steelDark, { uv: TEXEL.paint });
      for (const zz of [L.tunZ0 + 0.07, L.tunZ1 - 0.07]) B.box(M.paint, 0.22, TH, 0.14, x, TH / 2, side * zz, PAINT.steelDark, { uv: TEXEL.paint });
    }
    pipe(B, M.paint, [[-DX, 2.52, side * (L.tunZ1 - 0.14)], [DX, 2.52, side * (L.tunZ1 - 0.14)]], 0.075, PAINT.pipeGrey);
    pipe(B, M.paint, [[-DX, 2.36, side * (L.tunZ1 - 0.13)], [DX, 2.36, side * (L.tunZ1 - 0.13)]], 0.045, PAINT.pipeYellow);
    B.box(M.paint, len, 0.04, 0.2, 0, 2.18, side * (L.tunZ1 - 0.14), PAINT.steelDark, { uv: TEXEL.paint });
    for (const x of side < 0 ? FRAMES.north : FRAMES.south) {
      for (const zz of [L.tunZ0 + 0.09, L.tunZ1 - 0.09]) B.box(M.paint, 0.24, TH, 0.18, x, TH / 2, side * zz, PAINT.yellow, { uv: TEXEL.paint });
      B.box(M.paint, 0.24, 0.18, tw, x, TH - 0.09, zc, PAINT.yellow, { uv: TEXEL.paint });
    }
    for (let x = -DX + 2.6; x < DX - 1; x += 6.4) cagedLamp(x, TH - 0.22, zc);
    for (const x of [-17, 0, 17]) night(new THREE.PointLight(0xffcf9a, 0, 12, 2), 7).position.set(x, TH - 0.35, zc);
    // 通道死端的广告横幅（北通道在左端封死，南通道在右端封死）
    dec(decalUV(side < 0 ? 'banner1' : 'banner2'), 1.9, 0.95, side < 0 ? -DX + 0.012 : DX - 0.012, 1.78, zc, [0, side < 0 ? PI / 2 : -PI / 2, 0]);
    // 顶板：走道、栏杆、铁丝网、通风帽
    B.box(M.paint, len + 0.4, 0.16, HZ - DZ + 0.5, 0, HH + 0.08, side * ((DZ + HZ) / 2 - 0.05), PAINT.steelDark, { uv: TEXEL.paint });
    B.add(M.grating, scaleUV(new THREE.PlaneGeometry(len - 1, 1.0), (len - 1) / 0.5, 2), { y: HH + 0.17, z: side * 9.7, rx: -PI / 2 }, 0x9a9c98);
    const railZ = side * (DZ - 0.02);
    railing(B, M.metal, [[-DX - 0.2, HH + 0.14, railZ], [DX + 0.2, HH + 0.14, railZ]], 1.1, PAINT.yellow, { spacing: 2, seg: 6 });
    railing(B, M.metal, [[-DX - 0.2, HH + 0.14, side * (HZ - 0.08)], [DX + 0.2, HH + 0.14, side * (HZ - 0.08)]], 1.1, PAINT.yellow, { spacing: 2, seg: 6 });
    B.add(M.fence, scaleUV(new THREE.PlaneGeometry(len + 0.4, 0.78), (len + 0.4) / 0.6, 1.3), { y: HH + 0.72, z: railZ, ry: side > 0 ? PI : 0 }, 0xb9bcb8);
    for (let x = -DX + 5; x < DX; x += 9.6) {
      B.cyl(M.paint, 0.2, 0.24, 0.62, x, HH + 0.47, side * 9.2, PAINT.white, { seg: 12 });
      B.cyl(M.paint, 0.36, 0.3, 0.12, x, HH + 0.82, side * 9.2, PAINT.steelDark, { seg: 14 });
    }
    // 墙上的泛光灯（夜里照亮甲板）与舱位号、护板上的危险品小标
    for (const x of [-16, 0, 16]) {
      const rx = side > 0 ? PI - 0.52 : 0.52;
      B.box(M.paint, 0.5, 0.3, 0.26, x, 6.36, side * (DZ - 0.26), PAINT.steelDark, { uv: TEXEL.paint, rot: [rx, 0, 0] });
      B.add(M.lamp, plane(0.42, 0.2), { x, y: 6.33, z: side * (DZ - 0.39), rx }, 0xffffff);
    }
    for (const [k, x] of [-17, 0, 17].entries()) dec(decalUV('bay', (k + (side > 0 ? 3 : 0)) % 3, Math.floor((k + (side > 0 ? 3 : 0)) / 3) % 2, 3, 2), 1.5, 1.0, x, 4.5, side * (DZ - 0.104), [0, side > 0 ? PI : 0, 0], 0xd8d8d0);
    for (let k = 0; k < 9; k++) dec(decalUV('hazard', k % 4, (k >> 1) % 2, 4, 2), 0.26, 0.26, -22 + k * 5.5, 0.52, side * (DZ - 0.124), [0, side > 0 ? PI : 0, 0]);
    dec(decalRect(1536, 350, 512, 22), len - 1, 0.12, 0, 0.012, side * 6.85, [-PI / 2, 0, 0]);                         // 甲板上的黄线
    for (const x of [-12.8, 12.8]) {                                                                               // 泛光灯
      const s = night(new THREE.SpotLight(0xffdcae, 0, 34, 1.0, 0.55, 1.6), 120);
      s.position.set(x, 6.25, side * (DZ - 0.4)); s.target.position.set(x, 0, side * 3.2);
      shipRoot.add(s.target);
    }
  }

  // ————————————————— 两端的出生舱 —————————————————
  for (const sx of [-1, 1]) {
    const x0 = sx * DX, xt = x0 + sx * 0.15, ts = -sx;                                   // ts：这个舱右手通道所在的舷侧
    wall(xt, 0, -ts * (HZ + L.doorZ) / 2, 0.3, HH, HZ - L.doorZ, PAINT.wallIn);
    wall(xt, 0, ts * (L.doorZ + L.tunZ0) / 2, 0.3, HH, L.tunZ0 - L.doorZ, PAINT.wallIn);
    wall(xt, TH, ts * (L.tunZ0 + L.tunZ1) / 2, 0.3, HH - TH, L.tunZ1 - L.tunZ0, PAINT.wallIn);
    wall(xt, 0, ts * (L.tunZ1 + HZ) / 2, 0.3, HH, HZ - L.tunZ1, PAINT.wallIn);
    wall(xt, 2.8, 0, 0.3, HH - 2.8, 2 * L.doorZ, PAINT.wallIn);
    wall(sx * (L.cabinX + 0.15), 0, 0, 0.3, HH, 2 * HZ + 0.6, PAINT.wallIn);
    for (const sz of [-1, 1]) wall(sx * (DX + (L.cabinX - DX) / 2 + 0.15), 0, sz * (HZ + 0.25), L.cabinX - DX + 0.3, HH, 0.5, PAINT.wallIn);
    B.box(M.paint, L.cabinX - DX + 0.6, 0.3, 2 * HZ + 1, sx * (DX + (L.cabinX - DX) / 2 + 0.15), CH + 0.15, 0, PAINT.ceiling, { uv: TEXEL.paint });
    world.aabb(Math.min(xt, sx * (L.cabinX + 0.3)), Math.max(xt, sx * (L.cabinX + 0.3)), -HZ, HZ, CH, HH, 'steel', 'ceiling');
    for (let x = DX + 0.75; x < L.cabinX; x += 1.5) B.box(M.paint, 0.2, 0.2, 2 * HZ, sx * x, CH - 0.1, 0, PAINT.steelDark, { uv: TEXEL.paint });   // 顶板下的横梁
    wall(sx * 27.75, 0, ts * 5.6, 3.1, 2.6, 0.2, PAINT.wallIn);                          // 舱里的 L 形短墙：绕过它才到通道口
    wall(sx * 26.3, 0, ts * 4.7, 0.2, 2.6, 1.8, PAINT.wallIn);
    // 门框与通道口的门框（黄漆）
    for (const sz of [-1, 1]) B.box(M.paint, 0.42, 2.94, 0.14, xt, 1.47, sz * (L.doorZ + 0.07), PAINT.yellow, { uv: TEXEL.paint });
    B.box(M.paint, 0.42, 0.14, 2 * L.doorZ + 0.28, xt, 2.87, 0, PAINT.yellow, { uv: TEXEL.paint });
    for (const zz of [L.tunZ0 - 0.07, L.tunZ1 + 0.07]) B.box(M.paint, 0.42, TH, 0.14, xt, TH / 2, ts * zz, PAINT.yellow, { uv: TEXEL.paint });
    B.box(M.paint, 0.42, 0.14, L.tunZ1 - L.tunZ0 + 0.28, xt, TH + 0.07, ts * (L.tunZ0 + L.tunZ1) / 2, PAINT.yellow, { uv: TEXEL.paint });
    // 舱内：立柱、灯、舱牌、出口牌、横幅、救生圈、灭火器、门槛警示条、地面箭头
    for (let z = -HZ + 0.6; z <= HZ; z += 1.2) B.box(M.paint, 0.1, CH, 0.14, sx * (L.cabinX - 0.05), CH / 2, z, PAINT.steelDark, { uv: TEXEL.paint });
    for (const z of [-5.2, 5.2]) cagedLamp(sx * (L.cabinX - 2.0), CH - 0.2, z);
    night(new THREE.PointLight(0xffe0b8, 0, 13, 2), 9).position.set(sx * (L.cabinX - 2.4), CH - 0.35, 0);
    const face = sx < 0 ? PI / 2 : -PI / 2, xf = sx * (L.cabinX - 0.012), xw = xt + sx * 0.16;   // face：贴在端墙上朝舱内；xw：贴在内墙（朝舱内的一面）
    dec(decalUV('signs', sx < 0 ? 1 : 0, 0, 4, 1), 2.4, 0.88, xf, 2.42, 0, [0, face, 0]);
    dec(decalUV('exit', 1, 0, 2, 2), 0.96, 0.58, xw, 3.08, 0, [0, -face, 0]);
    dec(decalUV('signs', 3, 0, 4, 1), 1.6, 0.6, xw, 2.28, ts * 5.75, [0, -face, 0]);
    dec(decalUV(sx < 0 ? 'banner1' : 'banner2'), 2.4, 1.2, xw, 1.22, ts * 5.75, [0, -face, 0]);
    dec(decalUV('exit', 0, 0, 2, 2), 0.7, 0.44, xw, 2.3, -ts * 6.4, [0, -face, 0]);
    dec(decalRect(1566, 430, 188, 80), 1.1, 0.55, sx * (DX + 1.9), 0.012, 0, [-PI / 2, 0, sx * PI / 2]);
    dec(decalRect(1536, 256, 512, 70), 7.2, 0.5, sx * (DX - 0.45), 0.012, 0, [-PI / 2, 0, 0]);
    B.add(M.paint, new THREE.TorusGeometry(0.33, 0.07, 10, 24), { x: xf - sx * 0.07, y: 1.9, z: -ts * 4.4, ry: PI / 2 }, PAINT.orange);
    B.cyl(M.paint, 0.075, 0.075, 0.5, xw + sx * 0.1, 0.7, -ts * (L.doorZ + 0.35), PAINT.red, { seg: 12 });
    pipe(B, M.paint, [[sx * (L.cabinX - 0.2), CH - 0.2, -HZ + 0.3], [sx * (L.cabinX - 0.2), CH - 0.2, HZ - 0.3]], 0.06, PAINT.pipeRed);
  }

  // ————————————————— 集装箱（实例化）+ 贴花 —————————————————
  const g20 = o.g20 ?? containerGeometry(6.06), g10 = o.g10 ?? containerGeometry(3.0), items20 = [], items10 = [];
  CONTAINERS.forEach((c, ci) => {
    const items = c.len > 4 ? items20 : items10, stack = c.stack || 1;
    for (let k = 0; k < stack; k++) items.push({ t: { x: c.x, y: k * L.contH, z: c.z, ry: -c.yaw }, color: CONTAINER_COLORS[k ? ALT[(ci * 3 + k) % ALT.length] : c.color] });
    world.add(c.x, c.z, c.len / 2, L.contW / 2, 0, stack * L.contH, c.yaw, 'metal', 'container');
    const w = c.len - 0.36, n = Math.round(w / 0.278), p = w / n, parts = [], big = n >= 16;
    const place = (uv, k, m, h, yb, sideZ) => {
      if (m + k > n) return;
      const g = colored(corrugated(k * p, h, p, 0.036, { uvRect: uv, lift: 0.014 }));
      g.applyMatrix4(new THREE.Matrix4().makeRotationY(sideZ > 0 ? 0 : PI).premultiply(new THREE.Matrix4().makeTranslation(-w / 2 + (m + k / 2) * p, 0.34 + yb, sideZ * (L.contW / 2 - 0.036))));
      parts.push(g);
    };
    for (const sideZ of [-1, 1]) {
      const mLogo = big ? 1 + Math.floor(R() * (n - 14)) : 1;
      place(decalUV(R() < 0.5 ? 'logo1' : 'logo2'), 8, mLogo, 8 * p / 2, 0.52, sideZ);
      if (big) place(decalUV('codes'), 5, (mLogo + 10) % (n - 5), 5 * p / 2, 0.6, sideZ);
      for (let k = 0; k < 3; k++) place(decalUV('hazard', (ci + k) % 4, (ci + k) % 2, 4, 2), 1, (3 + k * 3 + ci) % (n - 1), p, 0, sideZ);
      for (let k = 0; k < (big ? 2 : 1); k++) place(decalRect(512 + R() * 400, 256 + R() * 30, 64, 250), 1, Math.floor(R() * (n - 1)), p * 250 / 64, 0.25 + R() * 0.5, sideZ);   // 锈痕：一道窄的，从上往下淌
    }
    B.add(M.decal, mergeParts(parts), { x: c.x, y: 0, z: c.z, ry: -c.yaw }, 0xffffff);
  });
  const inst = [];
  for (const [g, list] of [[g20, items20], [g10, items10]]) {
    const m = B.instances(M.paint, g, list, { name: 'containers' });
    if (m) { shipRoot.add(m); inst.push(m); }
  }

  // ————————————————— 木箱、铁箱 —————————————————
  CRATES.forEach((c, ci) => {
    const tone = new THREE.Color().setScalar(0.9 + ((ci * 37) % 11) / 50);                           // 每只箱子的木色略有差别
    B.add(c.kind === 'wood' ? M.wood : M.paint, crateGeometry(c.w, c.d, c.h, c.kind), { x: c.x, y: c.y0, z: c.z }, tone);
    world.aabb(c.x - c.w / 2, c.x + c.w / 2, c.z - c.d / 2, c.z + c.d / 2, c.y0, c.y0 + c.h, c.kind, 'crate');
    const stencil = (face, w, h) => {
      const [x, y, bw, bh] = CRATE_DECALS[(ci * 2 + face + (c.kind === 'wood' ? 0 : 4)) % CRATE_DECALS.length];
      const dw = Math.min(w * 0.6, 0.85), dh = dw * bh / bw;
      return dh < h - 0.14 ? [decalRect(x, y, bw, bh), dw, dh] : null;
    };
    const top = !CRATES.some((o) => o !== c && o.y0 >= c.y0 + c.h - 0.01 && Math.abs(o.x - c.x) < (o.w + c.w) / 2 && Math.abs(o.z - c.z) < (o.d + c.d) / 2);
    for (const face of [0, 1, 2, 3]) {                                                                  // 四个侧面各喷一个标志
      const alongZ = face < 2, w = alongZ ? c.w : c.d, s = stencil(face, w, c.h);
      if (!s) continue;
      const px = c.x + (face === 2 ? c.w / 2 + 0.004 : face === 3 ? -c.w / 2 - 0.004 : 0), pz = c.z + (face === 0 ? c.d / 2 + 0.004 : face === 1 ? -c.d / 2 - 0.004 : 0);
      dec(s[0], s[1], s[2], px, c.y0 + c.h * 0.5, pz, [0, [0, PI, PI / 2, -PI / 2][face], 0]);
    }
    if (top && c.w >= 1.6) { const s = stencil(4, c.w, c.d); if (s) dec(s[0], s[1] * 1.25, s[2] * 1.25, c.x, c.y0 + c.h + 0.004, c.z, [-PI / 2, 0, ((ci * 37) % 11) / 11 * PI]); }
  });

  // ————————————————— 甲板标线 —————————————————
  dec(decalRect(1800, 390, 200, 160), 1.6, 1.28, 0, 0.012, 0, [-PI / 2, 0, 0]);
  dec(decalRect(1790, 600, 220, 160), 1.6, 1.16, -22.2, 0.012, -5.2, [-PI / 2, 0, PI / 2]);
  dec(decalRect(1790, 600, 220, 160), 1.6, 1.16, 22.2, 0.012, 5.2, [-PI / 2, 0, -PI / 2]);
  dec(decalRect(1566, 430, 188, 80), 1.3, 0.62, -22.4, 0.012, 5.4, [-PI / 2, 0, PI]);
  dec(decalRect(1566, 430, 188, 80), 1.3, 0.62, 22.4, 0.012, -5.4, [-PI / 2, 0, 0]);

  const meshes = B.build(shipRoot, { name: 'deck' });
  return { meshes, containers: inst, lamps };
}
