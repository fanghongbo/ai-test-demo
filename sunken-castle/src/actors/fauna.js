// 大个子：两只海龟、一条蝠鲼、一条鲨鱼、三群水母、一头远处巡游的抹香鲸。每个是一份手工几何 + 一条闭合的巡游路线 + 顶点着色器里的形变
// （海龟划鳍、蝠鲼扇翅膀、鲨鱼摆尾、水母一收一放地往上蹿、鲸甩尾巴）。模型的 +x 是头。
import * as THREE from 'three';
import { meshBuilder, V, mixc, ribbon, tube, blob, fbm3, mergeParts, paramSurface } from '../gfx/organic.js';
import { instanced, groupOf } from '../gfx/instances.js';
import { swimify, FISH_BODY, makePath } from './swim.js';
import { mulberry32, TAU } from '../core/mathx.js';

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** 海龟（长约 1.1 米）：扁圆的背甲上有盾片的纹，一个头，两片像翅膀的前鳍、两片小的后鳍 */
function turtleGeometry() {
  const mb = meshBuilder(), shell = [0.13, 0.14, 0.05], seam = [0.05, 0.06, 0.02], belly = [0.52, 0.44, 0.22], skin = [0.17, 0.19, 0.10], pale = [0.45, 0.45, 0.28];
  blob(mb, {
    seg: 28, rings: 15, sy: 0.36, radius: (d) => 1 + 0.025 * fbm3(d.x * 6, d.y * 6, d.z * 6, 2, 5),
    col: (d, u, v) => {
      if (d.y < -0.25) return belly;
      const lane = Math.abs(Math.sin(v * Math.PI * 3.0)) < 0.10 || Math.abs(Math.sin(u * TAU * 5.5 + (v > 0.5 ? 0.3 : 0))) < 0.11;
      return lane ? seam : shell.map((c) => c * (0.9 + 0.2 * fbm3(d.x * 9 + 3, d.y * 9, d.z * 9, 2, 6)));
    }, extra: () => [0, 0, 0],
  });
  const body = mb.build(); body.scale(0.46, 1, 0.37);
  const head = meshBuilder();
  blob(head, { seg: 14, rings: 9, radius: () => 1, col: (d) => mixc(skin, pale, Math.max(0, fbm3(d.x * 14, d.y * 14, d.z * 14, 2, 8)) * 1.6), extra: () => [0, 0.2, 0.2] });
  const hg = head.build(); hg.scale(0.14, 0.105, 0.10); hg.translate(0.55, 0.05, 0);
  const limbs = meshBuilder();
  const paddle = (pts, w, rear) => { for (const s of [-1, 1]) ribbon(limbs, pts.map(([x, y, z]) => v3(x, y, z * s)), w, pts.map(() => v3(1, 0, 0)), (i, t) => mixc(skin, pale, 0.5 + 0.5 * Math.sin(t * 11)), { crease: 0.12, extra: (i, t) => [0, t, rear ? 0.4 : 1] }); };
  paddle([[0.20, -0.02, 0.30], [0.28, -0.03, 0.50], [0.29, -0.03, 0.72], [0.20, -0.03, 0.92], [0.04, -0.03, 1.04]], [0.13, 0.15, 0.115, 0.07, 0.015], false);
  paddle([[-0.34, -0.03, 0.22], [-0.47, -0.03, 0.33], [-0.57, -0.03, 0.40]], [0.08, 0.07, 0.02], true);
  tube(limbs, [v3(-0.44, -0.02, 0), v3(-0.56, -0.02, 0)], [0.04, 0.008], { sides: 6, col: () => skin, cap: 'tip', tipLen: 0.02 });
  return mergeParts([body, hg, limbs.build()]);
}

/** 蝠鲼（翼展 5 米）：一张往后掠的薄片，上面黑、下面白；头前两只头鳍，一根细长的尾巴 */
function mantaGeometry() {
  const mb = meshBuilder(), top = [0.045, 0.05, 0.06], under = [1.15, 1.18, 1.2], T = 0.10;
  const outline = (t) => { const a = t * TAU, s = Math.sin(a); return [Math.cos(a) * 1.25 * (1 - 0.10 * Math.abs(s)) - 0.36 * Math.abs(s), s * 2.5]; };
  for (const side of [1, -1]) {
    paramSurface(mb, (u, v) => { const [ox, oz] = outline(v), th = T * Math.pow(Math.max(0, 1 - u * u), 0.55) + 0.012; return [u * ox, side * th, u * oz]; }, 9, 48,
      { ref: () => [0, side, 0], col: (u, v, p) => { const k = side > 0 ? 1 : 0; const c = k ? top : under; return k && Math.abs(p[2]) < 0.7 && p[0] > 0.2 ? mixc(top, [0.5, 0.52, 0.55], 0.6) : c; }, extra: (u, v) => [Math.pow(Math.abs(Math.sin(v * TAU)) * u, 1.4), 0, 0] });
  }
  paramSurface(mb, (u, v) => { const [ox, oz] = outline(v); return [ox, 0.012 - 0.024 * u, oz]; }, 1, 48, { ref: (u, v) => { const [ox, oz] = outline(v); return [ox, 0, oz]; }, col: () => top, extra: () => [1, 0, 0] });   // 边缘
  for (const s of [-1, 1]) tube(mb, [v3(1.05, 0.0, s * 0.30), v3(1.22, -0.02, s * 0.24), v3(1.36, -0.05, s * 0.16)], [0.055, 0.04, 0.02], { sides: 6, col: () => top, cap: 'tip', tipLen: 0.03, extra: (i, t) => [0.1 + 0.2 * t, 0, 0] });
  const tail = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; tail.push(v3(-1.18 - 2.3 * t, -0.05 * t, 0)); }
  tube(mb, tail, tail.map((_, i) => 0.035 * Math.pow(1 - i / 10, 0.8) + 0.004), { sides: 5, col: () => top, extra: (i, t) => [0.3 + 1.3 * t, 0, 0] });
  return mb.build();
}

/** 礁鲨（长 2.8 米）：上灰下白，背鳍、一对往后掠的长胸鳍、不对称的尾鳍 */
function sharkGeometry() {
  const mb = meshBuilder();
  blob(mb, { seg: 32, rings: 16, radius: (d) => (d.x > 0 ? 1 - 0.22 * d.x * d.x : 1 - 0.82 * Math.pow(-d.x, 1.3)) * (1 - 0.06 * Math.abs(d.y)), col: (d) => { const c = d.y > 0.25 ? 1 : d.y < -0.25 ? 3.6 : 1 + 2.6 * Math.max(0, -d.y); return [0.20 * c, 0.23 * c, 0.27 * c]; }, extra: (d) => [0.14 + 0.45 * Math.max(0, -d.x), 0, 0] });
  const body = mb.build(); body.scale(1.4, 0.20, 0.17);
  const f = meshBuilder(), dark = [0.16, 0.19, 0.22], pale = [0.72, 0.75, 0.78];
  const vx = (x, y, z, bend, col = dark) => V(x, y, z, 0, 1, 0, 0.5, 0.5, col, [bend, 0, 0]);                               // 鳍的法线朝上，接得住光
  f.tri(vx(0.28, 0.16, 0, 0.2), vx(-0.18, 0.17, 0, 0.38), vx(-0.10, 0.66, 0, 0.34), [0, 0, 1]);                                 // 背鳍
  f.tri(vx(-0.75, 0.10, 0, 0.6), vx(-0.98, 0.08, 0, 0.68), vx(-0.98, 0.26, 0, 0.66), [0, 0, 1]);                                 // 第二背鳍
  for (const s of [-1, 1]) {
    f.tri(vx(0.55, -0.09, s * 0.13, 0.05), vx(-0.28, -0.06, s * 1.05, 0.08, pale), vx(-0.02, -0.03, s * 0.22, 0.06), [0, 0, s]); // 胸鳍
    f.tri(vx(-0.62, -0.15, s * 0.10, 0.5), vx(-0.86, -0.14, s * 0.36, 0.56, pale), vx(-0.76, -0.10, s * 0.12, 0.52), [0, 0, s]); // 腹鳍
  }
  f.tri(vx(-1.34, 0.03, 0, 1.0), vx(-1.98, 0.64, 0, 1.55), vx(-1.56, 0.02, 0, 1.2), [0, 0, 1]);                                 // 尾鳍的上叶长、下叶短
  f.tri(vx(-1.34, -0.03, 0, 1.0), vx(-1.66, -0.36, 0, 1.3), vx(-1.42, -0.02, 0, 1.05), [0, 0, 1]);
  return mergeParts([body, f.build()]);
}

/** 抹香鲸（长 13 米）：方方的大头占了三分之一，往尾巴一路变细，尾鳍是横着的两片 */
function whaleGeometry() {
  const mb = meshBuilder();
  blob(mb, { seg: 34, rings: 18, radius: (d) => (d.x > 0 ? 1 - 0.10 * d.x * d.x : 1 - 0.9 * Math.pow(-d.x, 1.05)) * (1 + 0.03 * fbm3(d.x * 5, d.y * 5, d.z * 5, 2, 12)),
    col: (d) => { const k = Math.max(0, Math.min(1, (-d.y + 0.1) * 1.6)) * (d.x > 0 ? 1 : 0.4); return mixc([0.050, 0.050, 0.056], [0.46, 0.45, 0.44], k * (0.6 + 0.4 * fbm3(d.x * 7, d.y * 7 + 2, d.z * 7, 2, 13))); },
    extra: (d) => [0.05 + 0.55 * Math.max(0, -d.x) ** 2, 0, 0] });
  const body = mb.build(); body.scale(6.5, 1.5, 1.9);
  const f = meshBuilder(), dark = [0.050, 0.050, 0.056];
  const vx = (x, y, z, bend) => V(x, y, z, 0, 1, 0, 0.5, 0.5, dark, [bend, 0, 0]);
  for (const s of [-1, 1]) { f.tri(vx(-6.1, 0.1, 0, 1.1), vx(-8.3, 0, s * 2.5, 1.6), vx(-7.6, 0, 0, 1.3), [0, 1, 0]); f.tri(vx(-6.1, -0.1, 0, 1.1), vx(-8.3, 0, s * 2.5, 1.6), vx(-7.6, 0, 0, 1.3), [0, -1, 0]); }   // 尾鳍：上下两面
  f.tri(vx(0.6, 1.42, 0, 0.2), vx(-1.4, 1.30, 0, 0.4), vx(-1.3, 1.75, 0, 0.38), [0, 1, 0]);                                                     // 背上的驼峰
  for (const s of [-1, 1]) ribbon(f, [v3(1.9, -0.9, s * 1.7), v3(1.1, -1.2, s * 2.3), v3(0.1, -1.4, s * 2.6)], [0.42, 0.30, 0.06], [v3(0, 1, 0), v3(0, 1, 0), v3(0, 1, 0)], () => dark, { extra: (i, t) => [0.1 + 0.2 * t, 0, 0] });
  return mergeParts([body, f.build()]);
}

/** 水母（钟的半径是 1，实例再放大）：一顶半透明的钟，口缘一圈细细的触手，中间四条皱褶的口腕 */
function jellyGeometry() {
  const mb = meshBuilder();
  const NR = 9, NA = 40;
  for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) {
    const pt = (ii, jj) => { const ph = (ii / NR) * 1.9, th = ((jj % NA) / NA) * TAU, rr = Math.sin(ph) * (1 + 0.03 * Math.sin(th * 8)), y = Math.cos(ph) * 0.78 + 0.22 - 0.04 * Math.cos(th * 8) * (ii / NR); return V(rr * Math.cos(th), y, rr * Math.sin(th), 0, 0, 0, jj / NA, ii / NR, [0.40 + 0.75 * (ii / NR) ** 2, 0.40 + 0.75 * (ii / NR) ** 2, 0.40 + 0.75 * (ii / NR) ** 2], [0, 0, (ii / NR) ** 2]); };
    mb.quad(pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1), pt(i, j).slice(0, 3));
  }
  for (let k = 0; k < 18; k++) {                                                                                                  // 触手
    const a = (k / 18) * TAU + 0.1, b = v3(Math.cos(a) * 0.97, 0.0, Math.sin(a) * 0.97), len = 2.2 + (k % 3) * 0.9, ph = k * 1.7, pts = [];
    for (let i = 0; i <= 5; i++) { const t = i / 5; pts.push(b.clone().add(v3(Math.sin(ph + t * 2.5) * 0.16 * t, -len * t, Math.cos(ph + t * 2.1) * 0.16 * t))); }
    tube(mb, pts, pts.map((_, i) => 0.009 * (1 - i / 5) + 0.0015), { sides: 4, col: (i, t) => [0.85 - 0.5 * t, 0.85 - 0.5 * t, 0.9 - 0.5 * t], cap: 'tip', tipLen: 0.03, extra: (i, t) => [t, 0, -1] });
  }
  for (let k = 0; k < 4; k++) {                                                                                                   // 口腕：皱褶的带子
    const a = (k / 4) * TAU + 0.4, pts = [], w = [], sd = [];
    for (let i = 0; i <= 7; i++) { const t = i / 7; pts.push(v3(Math.cos(a) * (0.12 + 0.16 * t) + Math.sin(t * 9 + k) * 0.05, -0.08 - 1.9 * t, Math.sin(a) * (0.12 + 0.16 * t) + Math.cos(t * 8 + k) * 0.05)); w.push(0.11 * Math.sin(Math.PI * Math.pow(t, 0.6)) + 0.01); sd.push(v3(-Math.sin(a), 0, Math.cos(a))); }
    ribbon(mb, pts, w, sd, (i, t) => [0.9 - 0.4 * t, 0.85 - 0.4 * t, 0.95 - 0.4 * t], { crease: 0.5, extra: (i, t) => [t, 0, -2] });
  }
  return mb.build();
}


const TURTLE_BODY = /* glsl */`
float ph = uSwimTime * uSwimFreq;
float front = step( 0.8, aExtra.z ), rear = 1.0 - front;
transformed.y += ( sin( ph ) * 0.55 * front + sin( ph * 0.5 + 1.3 ) * 0.12 * rear ) * aExtra.y * abs( transformed.z ) * 1.4;   // 两片前鳍一起划，后鳍慢慢摆
transformed.x -= abs( sin( ph ) ) * 0.10 * aExtra.y * front;
`;
const MANTA_BODY = 'transformed.y += sin( uSwimTime * uSwimFreq - abs( transformed.z ) * 1.05 ) * uSwimAmp * aExtra.x;';        // 翅膀从翼根到翼尖一波一波
const WHALE_BODY = 'transformed.y += sin( uSwimTime * uSwimFreq - aExtra.x * 1.2 ) * uSwimAmp * aExtra.x * aExtra.x;';          // 尾鳍上下甩
const JELLY_BODY = /* glsl */`
float ph = uSwimTime * uSwimFreq + SWIM_PHASE;
float pulse = sin( ph );
transformed.xz *= 1.0 - 0.15 * pulse * ( 0.4 + 0.6 * aExtra.z );                                             // 钟体一收一放，口缘收得最多
transformed.y += 0.06 * pulse * aExtra.z + ( 1.0 - cos( ph ) ) * 0.45;                                       // 收缩的时候往上蹿
float tt = aExtra.x;
transformed.xz += vec2( sin( uSwimTime * 1.3 - tt * 3.0 + SWIM_PHASE ), cos( uSwimTime * 1.1 - tt * 2.6 + SWIM_PHASE * 1.3 ) ) * 0.06 * tt;   // 触手和口腕拖在后面晃
`;

const JELLY_GROUPS = [
  { c: [58, -196], rx: 22, rz: 14, y: -40, dy: 9, n: 14, col: [0.30, 0.85, 1.0] },      // 断崖边：青色
  { c: [-8, 82], rx: 16, rz: 10, y: -42, dy: 4, n: 8, col: [1.0, 0.45, 0.75] },         // 断桥的尽头：粉的
  { c: [-148, -34], rx: 26, rz: 24, y: -26, dy: 7, n: 12, col: [0.62, 0.45, 1.0] },     // 巨藻林里：紫的
];

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion();

/**
 * @param {object} W createWaterLight()
 */
export function createFauna(W) {
  const meshes = [], animals = [], jellies = [], r = mulberry32(55);
  const single = (geo, o, body, deform, lean = 0) => {
    const mat = swimify(W.material({ color: 0xffffff, vertexColors: true, roughness: o.roughness ?? 0.5, side: THREE.DoubleSide }), body, deform);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = o.shadow ?? true; mesh.receiveShadow = true; mesh.frustumCulled = true; mesh.name = o.name;
    mesh.matrixAutoUpdate = false;                                                                         // 位姿每帧直接写进 matrix
    meshes.push(mesh);
    const path = makePath(o.path);
    animals.push({ mesh, path, lean, U: mat.userData.swim });
    return mesh;
  };
  single(turtleGeometry(), { name: 'turtle', roughness: 0.74, path: { c: [0, -75], rx: 70, rz: 66, y: -28, dy: 2.5, w: 0.011, phase: 0.4 } }, TURTLE_BODY, { amp: 0.05, freq: 0.9, phase: 0 });
  single(turtleGeometry(), { name: 'turtle', roughness: 0.74, path: { c: [128, 30], rx: 34, rz: 28, y: -20, dy: 1.5, w: -0.014, phase: 2.1 } }, TURTLE_BODY, { amp: 0.05, freq: 0.8, phase: 2 });
  single(mantaGeometry(), { name: 'manta', roughness: 0.45, path: { c: [-70, 90], rx: 60, rz: 34, y: -24, dy: 3, w: 0.0135, phase: 1.1 } }, MANTA_BODY, { amp: 0.36, freq: 1.25 }, 0.18);
  single(sharkGeometry(), { name: 'shark', roughness: 0.36, path: { c: [60, 60], rx: 95, rz: 55, y: -17, dy: 3, w: 0.028, phase: 4.0 } }, FISH_BODY, { amp: 0.10, freq: 2.3 }, 0.12);
  single(whaleGeometry(), { name: 'whale', roughness: 0.6, shadow: false, path: { c: [-60, 40], rx: 286, rz: 258, y: -40, dy: 9, w: 0.0036, phase: 0.9 } }, WHALE_BODY, { amp: 0.9, freq: 0.9 });
  const jg = jellyGeometry(), jellyMats = [];
  for (const G of JELLY_GROUPS) {
    const mat = swimify(W.material({ color: 0xffffff, vertexColors: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide, roughness: 0.25, emissive: new THREE.Color().setRGB(G.col[0], G.col[1], G.col[2]), emissiveIntensity: 0.5, depthWrite: false }), JELLY_BODY, { freq: 1.5, amp: 0 });
    jellyMats.push(mat);
    const items = [];
    for (let i = 0; i < G.n; i++) { const a = r() * TAU, d = Math.sqrt(r()); items.push({ x: G.c[0] + Math.cos(a) * d * G.rx, y: G.y + (r() - 0.5) * 2 * G.dy, z: G.c[1] + Math.sin(a) * d * G.rz, q: _q.setFromAxisAngle(v3(0, 1, 0), r() * TAU).clone(), s: 0.32 + r() * 0.36, color: [0.9 + r() * 0.3, 0.9 + r() * 0.3, 0.9 + r() * 0.3] }); }
    const list = instanced(jg, mat, items, { name: 'jellyfish', castShadow: false });
    for (const m of list) { m.renderOrder = 5; m.frustumCulled = false; meshes.push(m); }
  }
  return {
    group: groupOf(meshes, 'fauna'), animals, meshes,
    /** 每帧：沿着路线走过去。朝向取路线的切线 */
    update(t) {
      for (const a of animals) { a.U.uSwimTime.value = t; a.path.pose(t, _m, a.lean); a.mesh.matrix.copy(_m); a.mesh.matrixWorldNeedsUpdate = true; }
      for (const m of jellyMats) m.userData.swim.uSwimTime.value = t;
    },
    /** 夜里水母发亮 */
    setNight(n) { for (const m of jellyMats) m.emissiveIntensity = 0.5 + 1.6 * n; },
    dispose() { for (const m of meshes) { m.geometry.dispose?.(); m.material.dispose(); } },
  };
}
