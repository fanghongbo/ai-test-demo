// 地标与活物：灯塔（旋转光束）、栈桥鱼铺、海鸥、浮标、文字招牌。
import * as THREE from 'three';
import { ToonBatch, toonMaterial, beamMaterial } from '../gfx/toon.js';
import * as S from '../gfx/shapes.js';
import { PC, putter } from './props.js';
import { canvasTexture } from '../gfx/textures.js';
import { TAU, clamp, lerp } from '../core/mathx.js';


// ———————————————————————— 灯塔 ————————————————————————
export function createLighthouse(U, x, y, z, o = {}) {
  const group = new THREE.Group(); group.name = 'lighthouse'; group.position.set(x, y, z); group.rotation.y = o.rotY ?? 0;
  const b = new ToonBatch('lighthouse');
  const put = putter(b, 0, 0, 0, 0);
  put(S.cyl(3.9, 4.3, 0.6, 28).translate(0, 0.3, 0), PC.stone, { outline: 1 });
  put(S.cyl(3.3, 3.7, 0.6, 28).translate(0, 0.9, 0), PC.stone, { outline: 1 });
  const H0 = 1.2, H1 = 19.5, rAt = (yy) => lerp(2.95, 2.05, (yy - H0) / (H1 - H0));
  for (let k = 0; k < 6; k++) {
    const y0 = lerp(H0, H1, k / 6), y1 = lerp(H0, H1, (k + 1) / 6);
    put(S.cyl(rAt(y1), rAt(y0), y1 - y0, 28).translate(0, (y0 + y1) / 2, 0), k % 2 ? PC.coral : PC.white, { outline: 1 });
  }
  put(S.cyl(3.05, 2.95, 0.32, 28).translate(0, H1 + 0.16, 0), PC.iron, { outline: 1 });                  // 环形观景台
  for (let i = 0; i < 20; i++) { const a = (i / 20) * TAU; put(S.cyl(0.03, 0.03, 0.95, 5).translate(Math.cos(a) * 2.88, H1 + 0.8, Math.sin(a) * 2.88), PC.iron, { outline: 0.6 }); }
  put(S.torus(2.88, 0.035, 6, 40).rotateX(Math.PI / 2).translate(0, H1 + 1.28, 0), PC.iron, { outline: 0.7 });
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; put(S.box(0.08, 2.2, 0.08, 0.01).rotateY(-a).translate(Math.cos(a) * 1.56, H1 + 1.45, Math.sin(a) * 1.56), PC.iron, { outline: 0.7 }); }
  put(S.cyl(1.7, 1.7, 0.16, 20).translate(0, H1 + 0.4, 0), PC.iron, { outline: 0.8 });
  put(S.cyl(0.08, 1.95, 1.3, 12).translate(0, H1 + 3.7, 0), PC.coral, { outline: 1 });                      // 穹顶
  put(S.sphere(0.17, 10, 8).translate(0, H1 + 4.42, 0), PC.iron, { outline: 0.8 });
  put(S.box(1.05, 2.0, 0.3, 0.06).translate(0, H0 + 1.0, 2.82), PC.navy, { outline: 0.9 });                // 门
  for (let i = 0; i < 4; i++) { const a = 0.9 + i * 1.9, yy = 5 + i * 3.4, r = rAt(yy); put(S.box(0.42, 0.66, 0.3, 0.05).rotateY(-a).translate(Math.cos(a) * r, yy, Math.sin(a) * r), PC.navy, { outline: 0.8 }); }
  // 守塔人小屋
  put(S.box(5.0, 2.8, 3.8, 0.08).translate(7.2, 1.4, 0.6), PC.cream, { outline: 1 });
  put(S.extrude([[-2.9, 0], [2.9, 0], [0, 1.5]], 4.4, { bevel: 0.03 }).translate(7.2, 2.8, 0.6), PC.sky, { outline: 1 });
  put(S.box(0.9, 1.9, 0.2, 0.05).translate(6.0, 0.95, 2.55), PC.woodDark, { outline: 0.8 });
  for (const wx of [7.6, 8.7]) put(S.box(0.9, 0.9, 0.2, 0.05).translate(wx, 1.6, 2.55), 0xfff1c4, { lamp: 1, outline: 0.8 });
  put(S.box(0.6, 1.2, 0.6, 0.04).translate(8.6, 4.3, 0.2), PC.stone, { outline: 0.8 });                     // 烟囱
  const body = b.build(U); group.add(body);

  // 灯室玻璃 + 灯芯：夜里点亮
  const glassMat = toonMaterial(U, 0xfff6d8, { spec: 0.9, specSize: 0.3, emissive: 0xffd977, emissiveLevel: 0, opacity: 1 });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2.2, 20, 1, true), glassMat);
  glass.position.y = H1 + 1.45; glass.castShadow = false; group.add(glass);
  const bulbMat = toonMaterial(U, 0xfffbe8, { emissive: 0xfff0b0, emissiveLevel: 0.1 });
  const bulb = new THREE.Mesh(S.sphere(0.72, 16, 12), bulbMat); bulb.position.y = H1 + 1.45; group.add(bulb);

  // 光束：两个对置的长锥，夜里绕竖轴缓慢旋转
  const beam = new THREE.Group(); beam.position.y = H1 + 1.45; group.add(beam);
  const beamMat = beamMaterial(U, 0xfff1b8, { opacity: 0, power: 0.55 });
  for (const flip of [0, Math.PI]) {
    const g = new THREE.CylinderGeometry(0.6, 19, 190, 20, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 95);   // uv.y 从宽口(远)到灯口(近)……下面统一成“离灯越远 y 越大”
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
    const m = new THREE.Mesh(g, beamMat); m.rotation.y = flip; m.frustumCulled = false; beam.add(m);
  }
  const lampPos = new THREE.Vector3(), lightDir = new THREE.Vector3(0, 0, 1);
  let lamp = 0, ang = 0;
  const api = {
    group, lampPos, lightDir, beam,
    get top() { return new THREE.Vector3(x, y + H1 + 4.5, z); },
    update(dt, ctx) {
      const target = ctx.lampLevel ?? 0;
      lamp += (target - lamp) * Math.min(1, dt * 2);
      ang += dt * 0.42;
      beam.rotation.y = ang;
      beamMat.uniforms.uOpacity.value = 0.42 * lamp;
      beam.visible = lamp > 0.02;
      glassMat.uniforms.uEmissiveLevel.value = lamp * 0.85;
      bulbMat.uniforms.uEmissiveLevel.value = 0.1 + lamp * 0.9;
      group.updateMatrixWorld();
      lampPos.set(0, H1 + 1.45, 0).applyMatrix4(group.matrixWorld);
      lightDir.set(Math.sin(ang), -0.03, Math.cos(ang)).normalize();
    },
    /** 供 toon 材质的局部光源槽使用 */
    light() { return { pos: lampPos, dir: lightDir, color: new THREE.Color(1, 0.93, 0.72), cosInner: 0.985, cosOuter: 0.95, range: 260, intensity: 0.55 * lamp }; },
  };
  return api;
}

// ———————————————————————— 文字招牌 ————————————————————————
export function textSign(U, text, o = {}) {
  const w = o.w ?? 1.6, h = o.h ?? 0.5, bg = o.bg ?? '#2f7f86', fg = o.fg ?? '#fff8e6';
  const tex = canvasTexture(512, 512 * h / w, (g, cw, ch) => {
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = fg; g.lineWidth = 10; g.strokeRect(14, 14, cw - 28, ch - 28);
    g.fillStyle = fg; g.font = `700 ${Math.round(ch * 0.52)}px "Microsoft YaHei UI","Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, cw / 2, ch / 2 + ch * 0.03);
  }, { wrap: false, aniso: 8 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toonMaterial(U, 0xffffff, { map: tex, rim: 0.2 }));
  m.castShadow = false; m.receiveShadow = false;
  return m;
}

// ———————————————————————— 栈桥 + 鱼铺 ————————————————————————
/**
 * @param {THREE.Vector3} origin 步道外缘（海侧）上的点，y = 步道面高度
 * @param {THREE.Vector3} dir 伸向海面的水平单位向量
 */
export function createPier(U, origin, dir, o = {}) {
  const group = new THREE.Group(); group.name = 'pier';
  const rotY = Math.atan2(dir.x, dir.z);
  const L = o.len ?? 32, W = 4.4, dy = origin.y;
  const b = new ToonBatch('pier');
  const put = putter(b, origin.x, 0, origin.z, rotY);          // 局部 +Z 伸向海面
  const seaFloor = -3.2;
  for (let d = 1.5; d <= L; d += 4) for (const sx of [-W / 2 + 0.25, W / 2 - 0.25]) {
    put(S.cyl(0.15, 0.18, dy - seaFloor, 10).translate(sx, (dy + seaFloor) / 2 - 0.1, d), PC.woodDark, { outline: 0.9 });
    put(S.cyl(0.17, 0.17, 0.1, 10).translate(sx, dy + 0.62, d), PC.woodDark, { outline: 0.7 });        // 系缆桩
  }
  for (let k = 0; k < 5; k++) put(S.box(W / 5 - 0.04, 0.14, L, 0.02).translate(-W / 2 + (W / 10) * (k * 2 + 1), dy - 0.07, L / 2), k % 2 ? PC.wood : PC.woodLight, { outline: 0.9 });
  for (const sx of [-W / 2, W / 2]) put(S.box(0.14, 0.22, L, 0.02).translate(sx, dy - 0.2, L / 2), PC.woodDark, { outline: 0.8 });
  for (const sx of [-W / 2 + 0.1, W / 2 - 0.1]) {
    for (let d = 1; d <= L - 1; d += 2.5) if (d < L - 5) put(S.cyl(0.04, 0.045, 1.0, 6).translate(sx, dy + 0.5, d), PC.white, { spec: 0.3 });
    put(S.tube([[sx, dy + 0.98, 1], [sx, dy + 0.98, L - 5]], 0.03, { tubular: 1, radial: 6 }), PC.white, { spec: 0.3, outline: 0.7 });
  }
  const lamps = [];
  for (const [sx, d] of [[-W / 2 + 0.2, 9], [W / 2 - 0.2, 20]]) { put(S.cyl(0.045, 0.055, 2.6, 8).translate(sx, dy + 1.3, d), PC.teal, {}); put(S.sphere(0.14, 10, 8).translate(sx, dy + 2.7, d), PC.lampGlass, { lamp: 1, spec: 0.5 }); lamps.push(new THREE.Vector3(sx, dy + 2.7, d).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).add(new THREE.Vector3(origin.x, 0, origin.z))); }
  // 尽头的鱼铺
  const zs = L - 3.4;
  put(S.box(3.8, 0.3, 3.4, 0.03).translate(0, dy + 0.15, zs), PC.woodDark, { outline: 0.9 });
  put(S.box(3.6, 2.4, 3.0, 0.06).translate(0, dy + 1.5, zs + 0.2), PC.cream, { outline: 1 });
  put(S.box(4.2, 0.14, 3.8, 0.03).rotateX(-0.12).translate(0, dy + 2.85, zs + 0.2), PC.sky, { outline: 1 });
  put(S.box(3.2, 0.9, 0.2, 0.03).translate(0, dy + 1.75, zs - 1.32), PC.navy, { outline: 0.8 });        // 柜台窗口
  put(S.box(3.4, 0.1, 0.9, 0.02).translate(0, dy + 1.2, zs - 1.75), PC.woodLight, { outline: 0.8 });    // 台面
  for (let k = 0; k < 8; k++) put(S.box(0.42, 0.05, 1.1, 0.01).rotateX(0.35).translate(-1.68 + k * 0.48, dy + 2.5, zs - 1.75), k % 2 ? PC.coral : PC.cream, { outline: 0.8 });   // 条纹雨棚
  for (const [cx, cz, s2] of [[-2.3, zs - 1.6, 0.5], [-2.5, zs - 0.7, 0.4], [2.4, zs - 1.4, 0.48], [0.9, zs - 2.2, 0.36]]) put(S.box(s2, s2 * 0.8, s2, 0.03).translate(cx, dy + s2 * 0.4, cz), PC.wood, { outline: 0.9 });
  for (const bx of [1.9, 2.5]) put(S.cyl(0.24, 0.2, 0.6, 12).translate(bx, dy + 0.3, zs - 2.5), PC.teal, { outline: 0.9 });
  put(S.torus(0.3, 0.05, 6, 18).rotateX(Math.PI / 2).translate(-1.4, dy + 0.05, 6), PC.cream, { outline: 0.7 });   // 盘起来的缆绳
  const mesh = b.build(U); group.add(mesh);
  const sign = textSign(U, o.sign ?? '鲜鱼 · 每日现捕', { w: 2.6, h: 0.62, bg: '#c9503f', fg: '#fff8e6' });
  sign.position.set(0, dy + 3.18, zs - 0.6).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).add(new THREE.Vector3(origin.x, 0, origin.z));
  sign.rotation.y = rotY + Math.PI; group.add(sign);
  const sign2 = textSign(U, '栈桥', { w: 1.1, h: 0.4, bg: '#2f7f86', fg: '#fff8e6' });
  sign2.position.set(-W / 2 + 0.1, dy + 1.25, 1.2).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).add(new THREE.Vector3(origin.x, 0, origin.z));
  sign2.rotation.y = rotY + Math.PI / 2; group.add(sign2);
  const end = new THREE.Vector3(0, dy, L).applyMatrix4(new THREE.Matrix4().makeRotationY(rotY)).add(new THREE.Vector3(origin.x, 0, origin.z));
  return { group, lamps, end };
}

// ———————————————————————— 海鸥 ————————————————————————
export function createGull(U, o = {}) {
  const g = new THREE.Group(); g.name = 'gull';
  const b = new ToonBatch('gullBody');
  b.add(S.ellipsoid(0.11, 0.095, 0.32, 12, 9), null, PC.white, { outline: 1 });
  b.add(S.sphere(0.085, 10, 8).translate(0, 0.06, 0.24), null, PC.white, { outline: 1 });
  b.add(S.cyl(0.004, 0.02, 0.12, 6).rotateX(Math.PI / 2).translate(0, 0.05, 0.37), null, PC.orange, { outline: 0.6 });
  b.add(S.extrude([[-0.05, 0], [0.05, 0], [0.11, -0.2], [-0.11, -0.2]], 0.016, { bevel: 0.003 }).rotateX(-Math.PI / 2).translate(0, 0.01, -0.2), null, PC.gullGray, { outline: 0.8 });
  g.add(b.build(U));
  const inner = [[0, -0.12], [0.44, -0.07], [0.44, 0.1], [0, 0.13]], tip = [[0.44, -0.07], [0.74, -0.015], [0.76, 0.035], [0.44, 0.1]];
  const wings = [];
  for (const side of [1, -1]) {
    const wb = new ToonBatch('gullWing');
    wb.add(S.extrude(inner, 0.02, { bevel: 0.004 }), null, PC.white, { outline: 1 });
    wb.add(S.extrude(tip, 0.02, { bevel: 0.004 }), null, PC.gullGray, { outline: 1 });
    const pivot = new THREE.Group(); pivot.position.set(side * 0.07, 0.03, 0.02);
    const m = wb.build(U); if (side < 0) m.scale.x = -1;          // 负缩放：three 会自动翻转正面绕序
    pivot.add(m); g.add(pivot); wings.push({ pivot, side });
  }
  const st = { phase: Math.random() * 10, flap: 7 + Math.random() * 3, glide: 0 };
  return {
    group: g,
    update(t, o2 = {}) {
      const flapping = o2.flapping ?? true;
      st.glide += (flapping ? -1 : 1) * 0.08;
      st.glide = clamp(st.glide, 0, 1);
      const f = Math.sin(t * st.flap + st.phase) * 0.62 - 0.08;
      const a = lerp(f, 0.12, st.glide);
      for (const w of wings) w.pivot.rotation.z = -w.side * a;
    },
  };
}

// ———————————————————————— 浮标 ————————————————————————
export function createBuoy(U, color = PC.coral) {
  const b = new ToonBatch('buoy');
  const put = putter(b, 0, 0, 0, 0);
  put(S.sphere(0.36, 16, 12), color, { spec: 0.4 });
  put(S.cyl(0.365, 0.365, 0.1, 16).translate(0, 0.06, 0), PC.cream, { outline: 0.7 });
  put(S.cyl(0.028, 0.03, 0.8, 6).translate(0, 0.62, 0), PC.iron, { outline: 0.6 });
  put(S.torus(0.11, 0.014, 5, 14).rotateX(Math.PI / 2).translate(0, 0.86, 0), PC.iron, { outline: 0.5 });
  put(S.sphere(0.075, 10, 8).translate(0, 1.05, 0), 0xfff1c4, { lamp: 1, spec: 0.6 });
  return b.build(U);
}
