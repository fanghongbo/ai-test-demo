// 鱼群。三种体形（细长的、侧扁的、长条的），每种一个模板；一群鱼共用一种体形和一种花色，每条鱼带自己的大小、颜色深浅和相位。
// 摆尾在顶点着色器里（actors/swim.js：身体按“离头多远”左右摆）；每一条的位置在 CPU 上算：
// 鱼群沿着一条闭合的椭圆路线走，每条鱼围着群心各自打转、上下晃，朝向取自己的速度方向。一共十几群，一千五百多条鱼。
import * as THREE from 'three';
import { meshBuilder, V, blob, mergeParts } from '../gfx/organic.js';
import { instanced, groupOf } from '../gfx/instances.js';
import { swimify, FISH_BODY, makePath } from './swim.js';
import { bake } from '../gfx/texgen.js';
import { Lattice } from '../gfx/datatex.js';
import { mulberry32, TAU } from '../core/mathx.js';

const FORMS = {
  slim: { h: 0.15, w: 0.055, fork: 1.0, dorsal: 0.7 },      // 小雀鲷、鲹那种：细长
  deep: { h: 0.26, w: 0.05, fork: 0.6, dorsal: 0.9 },        // 蝴蝶鱼、刺尾鱼：侧扁
  long: { h: 0.10, w: 0.055, fork: 0.7, dorsal: 1.1 },       // 鹦嘴鱼、隆头鱼：长条
};

/** 一条鱼（长 1，头在 +x）。身体是拉长的球，背部深、肚子白；尾巴是叉形的，还有背鳍、臀鳍和一对胸鳍 */
function fishGeometry(kind) {
  const K = FORMS[kind], h = K.h, w = K.w;
  const body = meshBuilder();
  blob(body, {
    seg: 22, rings: 11, radius: (d) => (1 - 0.45 * Math.max(0, -d.x)) * (1 - 0.18 * Math.max(0, d.x) ** 2),
    col: (d) => { const c = d.y > 0.35 ? 0.60 : d.y < -0.3 ? 1.45 : 1.06 - 0.4 * d.y; return [c, c, c]; },                  // 背深肚白：水里从上往下看、从下往上看都不显眼
    extra: (d) => [0.28 * Math.max(0, 0.3 - d.x), 0, 0],
  });
  const bg = body.build(), p = bg.attributes.position, uv = bg.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 0.5 + 0.5, Math.atan2(p.getZ(i), p.getY(i)) / TAU + 0.5);        // 贴图坐标：顺着身体、绕着身体（接缝藏在肚子上）
  bg.scale(0.5, h, w);
  const f = meshBuilder(), fin = [0.92, 0.92, 0.92], dfin = [0.8, 0.8, 0.8];
  const tri = (a, b, c) => f.tri(a, b, c, [0, 0, 1]);
  // 鳍是薄片：法线一律朝上，才接得住从上面来的光（照真实的朝向，侧光下鳍就是黑的）
  const vx = (x, y, z, bend, pec = 0, col = fin) => V(x, y, z, 0, 1, 0, 0.5, 0.5, col, [bend, pec, 0]);
  tri(vx(-0.5, h * 0.1, 0, 0.75), vx(-0.5 - 0.28 * K.fork, h * 2.5 * K.fork, 0, 1.35), vx(-0.5 - 0.12 * K.fork, 0, 0, 1.0));   // 尾鳍的上叶
  tri(vx(-0.5, -h * 0.1, 0, 0.75), vx(-0.5 - 0.28 * K.fork, -h * 2.5 * K.fork, 0, 1.35), vx(-0.5 - 0.12 * K.fork, 0, 0, 1.0)); // 下叶
  tri(vx(0.16, h * 0.82, 0, 0.1, 0, dfin), vx(-0.16, h * 0.82, 0, 0.32, 0, dfin), vx(-0.05, h * (1 + 2.2 * K.dorsal), 0, 0.25, 0, dfin));   // 背鳍
  tri(vx(-0.22, -h * 0.78, 0, 0.42, 0, dfin), vx(-0.36, -h * 0.72, 0, 0.5, 0, dfin), vx(-0.35, -h * 1.8, 0, 0.48, 0, dfin));           // 臀鳍
  for (const s of [-1, 1]) tri(vx(0.14, -h * 0.15, s * w * 0.6, 0.05, 1), vx(0.0, -h * 0.6, s * (w + 0.16), 0.05, 1), vx(0.05, -h * 0.2, s * w * 0.6, 0.05, 1));   // 胸鳍
  return mergeParts([bg, f.build()]);
}


/** 鱼皮：细鳞，或者竖着的深色条带（军士鱼那种） */
function fishSkin(banded) {
  const scale = new Lattice(56, 28, 301), grain = new Lattice(23, 11, 302);
  return bake(128, 64, (u, v, s) => {
    let k = 0.94 + 0.10 * scale.at(u, v) + 0.04 * grain.at(u, v);
    if (banded) { const g = (c, w) => Math.exp(-Math.pow((u - c) / w, 2)), b = Math.max(g(0.66, 0.035), g(0.5, 0.03), g(0.34, 0.025)); k *= 1 - 0.72 * b; }
    s.rgb = [k, k, k];
    s.h = scale.at(u, v) * 0.6; s.r = 0.36; s.m = 0.2; s.a = 1;
  }, { normal: 0.8, aniso: 4 });
}

/** 鱼群一览：群心、路线半径、高度起伏、角速度、条数、体形、花色、颜色、大小 */
const SCHOOLS = [
  { c: [128, 36], rx: 20, rz: 16, y: -33, dy: 2.5, w: 0.045, n: 220, kind: 'slim', band: false, col: [0.86, 0.21, 0.03], size: [0.13, 0.18], spread: 1.7, speed: 9 },   // 海金鱼：橙红色的一片，在礁石柱之间
  { c: [110, 62], rx: 15, rz: 12, y: -36, dy: 2, w: -0.05, n: 170, kind: 'slim', band: false, col: [0.10, 0.46, 0.42], size: [0.11, 0.15], spread: 1.4, speed: 8 },    // 光鳃鱼：蓝绿色
  { c: [0, 22], rx: 24, rz: 20, y: -42, dy: 3, w: 0.06, n: 130, kind: 'deep', band: true, col: [0.82, 0.64, 0.10], size: [0.22, 0.3], spread: 2.4, speed: 6 },          // 军士鱼：石桥的桥洞里进进出出
  { c: [152, 18], rx: 12, rz: 12, y: -40, dy: 1.5, w: 0.05, n: 50, kind: 'deep', band: false, col: [0.05, 0.14, 0.76], size: [0.18, 0.24], spread: 1.7, speed: 6 },    // 蓝刺尾鱼
  { c: [-70, -100], rx: 55, rz: 40, y: -21, dy: 5, w: 0.055, n: 300, kind: 'slim', band: false, col: [0.62, 0.68, 0.76], size: [0.22, 0.32], spread: 3.2, speed: 11 },   // 鲹：银色的一大群，在王城上空的水里
  { c: [3, 30], rx: 7, rz: 9, y: -44, dy: 0.6, w: 0.03, n: 50, kind: 'deep', band: false, col: [0.66, 0.10, 0.07], size: [0.2, 0.26], spread: 1.5, speed: 5 },      // 鳂鱼：红的，守在桥墩背后
  { c: [-150, -40], rx: 30, rz: 24, y: -30, dy: 4, w: 0.03, n: 130, kind: 'long', band: false, col: [0.46, 0.40, 0.12], size: [0.2, 0.28], spread: 2.8, speed: 7 },   // 巨藻林里的隆头鱼
  { c: [128, 50], rx: 8, rz: 8, y: -34, dy: 1, w: 0.07, n: 14, kind: 'deep', band: true, col: [0.92, 0.72, 0.08], size: [0.14, 0.18], spread: 1.3, speed: 7 },        // 蝴蝶鱼
  { c: [96, 28], rx: 18, rz: 16, y: -40, dy: 2, w: -0.035, n: 12, kind: 'long', band: false, col: [0.05, 0.56, 0.50], size: [0.42, 0.56], spread: 3.2, speed: 5 },     // 鹦嘴鱼：个大，慢慢啃珊瑚
  { c: [56, -186], rx: 22, rz: 16, y: -40, dy: 3, w: 0.08, n: 260, kind: 'slim', band: false, col: [0.46, 0.56, 0.76], size: [0.15, 0.21], spread: 2.0, speed: 10 }, // 沙丁鱼球：断崖边上挤成一团
  { c: [6, -16], rx: 13, rz: 6, y: -29, dy: 2.2, w: 0.08, n: 210, kind: 'slim', band: false, col: [0.70, 0.78, 0.86], size: [0.24, 0.34], spread: 3.6, speed: 9, phase: 3.1 },   // 银色的鲹：在石桥和城门之间的水里来回穿（phase：标题画面一开始它正好在城门右边，看得见）
  { c: [0, -52], rx: 9, rz: 7, y: -31, dy: 1.4, w: -0.06, n: 60, kind: 'deep', band: false, col: [0.30, 0.62, 0.10], size: [0.13, 0.17], spread: 1.3, speed: 6 },     // 前庭喷泉旁边的刺尾鱼
  { c: [0, -88], rx: 6.5, rz: 5, y: -26.5, dy: 1.2, w: 0.09, n: 46, kind: 'deep', band: false, col: [0.88, 0.54, 0.07], size: [0.14, 0.18], spread: 1.2, speed: 5 },   // 王座厅里、吊灯底下一小群金色的蝴蝶鱼（从屋顶的洞进来的）
];

const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _m = new THREE.Matrix4(), _c0 = new THREE.Vector3(), _c1 = new THREE.Vector3(), _col = new THREE.Color();

export function createFish(W, o = {}) {
  const r = mulberry32(o.seed ?? 21), skins = { plain: fishSkin(false), band: fishSkin(true) }, geos = {};
  const mats = {
    plain: swimify(W.material({ map: skins.plain.map, normalMap: skins.plain.normalMap, roughnessMap: skins.plain.ormMap, metalnessMap: skins.plain.ormMap, roughness: 0.5, side: THREE.DoubleSide }), FISH_BODY, { amp: 0.07, freq: 7 }),
    band: swimify(W.material({ map: skins.band.map, normalMap: skins.band.normalMap, roughnessMap: skins.band.ormMap, metalnessMap: skins.band.ormMap, roughness: 0.5, side: THREE.DoubleSide }), FISH_BODY, { amp: 0.07, freq: 7 }),
  };
  const meshes = [], schools = [];
  for (const S of SCHOOLS) {
    const n = Math.round(S.n * (o.density ?? 1));
    if (!n) continue;
    geos[S.kind] ??= fishGeometry(S.kind);
    const mat = mats[S.band ? 'band' : 'plain'], mesh = new THREE.InstancedMesh(geos[S.kind], mat, n), st = [];
    for (let i = 0; i < n; i++) {
      st.push({ r: (0.35 + 0.65 * Math.sqrt(r())) * S.spread, a: r() * TAU, w: (r() - 0.5) * 0.9, y: (r() - 0.5) * 2.4, p: r() * TAU, j1: 0.6 + r() * 0.9, j2: 0.6 + r() * 0.9, j3: 0.6 + r() * 0.9, s: S.size[0] + (S.size[1] - S.size[0]) * r(), x: 0, yv: 0, z: 0 });
      const k = 0.8 + r() * 0.4; mesh.setColorAt(i, _col.setRGB(S.col[0] * k, S.col[1] * k, S.col[2] * k));
    }
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = false; mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.name = 'fish';
    meshes.push(mesh);
    schools.push({ S, mesh, st, path: makePath({ c: S.c, rx: S.rx, rz: S.rz, y: S.y, dy: S.dy, w: S.w, phase: S.phase }) });
  }
  const times = [mats.plain.userData.swim.uSwimTime, mats.band.userData.swim.uSwimTime];
  /** 一条鱼在 t 时刻的位置（速度用前后两个时刻的位置相减得到） */
  const pos = (f, S, path, t, out) => {
    path.at(t, _c0);
    const sp = S.speed;
    return out.set(_c0.x + Math.cos(f.a + f.w * t) * f.r + 0.35 * Math.sin(t * sp * 0.11 + f.p), _c0.y + f.y + 0.28 * Math.sin(t * sp * 0.085 + f.p * 1.3), _c0.z + Math.sin(f.a + f.w * t) * f.r + 0.35 * Math.cos(t * sp * 0.13 + f.p * 0.7));
  };
  return {
    group: groupOf(meshes, 'fish'), meshes, schools, count: schools.reduce((s, k) => s + k.st.length, 0),
    update(t) {
      for (const u of times) u.value = t;
      const h = 0.06;
      for (const { S, mesh, st, path } of schools) {
        for (let i = 0; i < st.length; i++) {
          const f = st[i];
          pos(f, S, path, t - h, _c1); pos(f, S, path, t, _p);
          const vx = (_p.x - _c1.x) / h, vy = (_p.y - _c1.y) / h, vz = (_p.z - _c1.z) / h, hl = Math.hypot(vx, vz) || 1e-4;
          _q.setFromEuler(_e.set(0, Math.atan2(-vz, vx), Math.atan2(vy, hl) * 0.6, 'XYZ'));
          mesh.setMatrixAt(i, _m.compose(_p, _q, _s.setScalar(f.s)));
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    },
    /** 只有花色和摆尾的频率跟着泳速变：夜里鱼慢下来 */
    setNight(n) { for (const m of [mats.plain, mats.band]) m.userData.swim.uSwimFreq.value = 7 * (1 - 0.45 * n); },
    dispose() { for (const g of Object.values(geos)) g.dispose(); for (const m of Object.values(mats)) m.dispose(); },
  };
}
