// 士兵（第三人称）：程序化建模 + 骨骼蒙皮 + 程序动画。一个人是一个蒙皮网格（按材质分 4 组），所以再多的机器人也只多几次绘制。
// 模型坐标系：面朝 +X，右手一侧是 +Z，Y 向上，脚底在 y = 0。放成朝向 yaw 时用 group.rotation.y = -yaw（和集装箱、出生点同一套约定）。
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { colored, uvBox } from '../gfx/batch.js';
import { rifleSilhouette } from './guns.js';

const PI = Math.PI;
/** 骨骼：[名字, 父骨骼, 绑定姿势下的位置] */
export const BONES = Object.freeze([
  ['hips', null, 0, 0.96, 0], ['spine', 'hips', 0, 1.10, 0], ['chest', 'spine', 0, 1.28, 0], ['neck', 'chest', 0, 1.50, 0], ['head', 'neck', 0, 1.58, 0],
  ['shoulderR', 'chest', 0, 1.45, 0.17], ['elbowR', 'shoulderR', 0.11, 1.29, 0.15], ['handR', 'elbowR', 0.27, 1.22, 0.03],
  ['shoulderL', 'chest', 0, 1.45, -0.17], ['elbowL', 'shoulderL', 0.24, 1.19, -0.21], ['handL', 'elbowL', 0.46, 1.245, 0.03],
  ['thighR', 'hips', 0, 0.92, 0.10], ['kneeR', 'thighR', 0.02, 0.50, 0.11], ['footR', 'kneeR', -0.02, 0.09, 0.11],
  ['thighL', 'hips', 0, 0.92, -0.10], ['kneeL', 'thighL', -0.04, 0.50, -0.11], ['footL', 'kneeL', 0.05, 0.09, -0.11],
]);

/** 两支队伍的配色。0 = 保卫者（深色作战服、黑色护甲、风镜），1 = 潜伏者（沙色迷彩、橄榄绿护甲、围巾） */
export const TEAM_LOOK = Object.freeze([
  { cloth: 0xffffff, mask: 0x1c2026, skin: 0xb08668, vest: 0x191c22, pouch: 0x3a3f47, helmet: 0x2a2e35, boot: 0x17181b, glove: 0x1c1e22, pad: 0x363b44, accent: 0x3d8bdd, goggles: true, scarf: null },
  { cloth: 0xffffff, mask: 0x1a1714, skin: 0x9c7256, vest: 0x4c5134, pouch: 0x5c6240, helmet: 0x74664a, boot: 0x3a2f22, glove: 0x2b261f, pad: 0x3d3a2a, accent: 0xa8241a, goggles: false, scarf: 0x8a4a3c },
]);

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
const ease = (t) => t * t * (3 - 2 * t);

/**
 * 造一个士兵。
 * @param {object} M materials.js 的材质库
 * @param {0|1} team
 * @param {string} weaponId 背在手里的枪（ak47 / m4a1 / awm）
 */
export function createSoldier(M, team, weaponId) {
  const look = TEAM_LOOK[team], G = { cloth: [], matte: [], metal: [], paint: [] }, bi = {};
  BONES.forEach(([name], i) => { bi[name] = i; });
  /** 一个刚性部件：全部顶点绑到 bone 上 */
  const skinTo = (geo, bone) => {
    const n = geo.attributes.position.count, idx = new Uint16Array(n * 4), w = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { idx[i * 4] = bi[bone]; w[i * 4] = 1; }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4));
    geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(w, 4));
    return geo;
  };
  const part = (bone, key, g, color, t = {}) => {
    const geo = colored(g, color);
    if (t && t.isMatrix4) { G[key].push(skinTo(geo.applyMatrix4(t), bone)); return; }      // 直接给矩阵的（四肢）
    geo.applyMatrix4(_m.compose(_p.set(t.x || 0, t.y || 0, t.z || 0), _q.setFromEuler(_e.set(t.rx || 0, t.ry || 0, t.rz || 0)), _s.set(t.sx ?? t.s ?? 1, t.sy ?? t.s ?? 1, t.sz ?? t.s ?? 1)));
    G[key].push(skinTo(geo, bone));
  };
  const rbox = (bone, key, w, h, d, r, x, y, z, color, t) => part(bone, key, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)), color, { x, y, z, ...t });
  const box = (bone, key, w, h, d, x, y, z, color, t) => part(bone, key, uvBox(w, h, d, 0.5), color, { x, y, z, ...t });
  const ball = (bone, key, r, x, y, z, color, s) => part(bone, key, new THREE.SphereGeometry(r, 16, 12), color, { x, y, z, sx: s?.[0], sy: s?.[1], sz: s?.[2] });
  /** 从 a 到 b 的圆台（四肢） */
  const limb = (bone, key, a, b, ra, rb, color) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(B, A), len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    part(bone, key, new THREE.CylinderGeometry(rb, ra, len, 12), color, new THREE.Matrix4().compose(A.add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
  };

  // ———— 躯干 ————
  rbox('hips', 'cloth', 0.24, 0.17, 0.30, 0.05, 0, 0.99, 0, look.cloth);
  rbox('hips', 'matte', 0.255, 0.045, 0.315, 0.012, 0, 1.075, 0, look.vest);
  rbox('hips', 'matte', 0.06, 0.09, 0.09, 0.012, -0.15, 1.03, 0, look.pouch);
  for (const sz of [-1, 1]) rbox('hips', 'matte', 0.1, 0.08, 0.05, 0.012, 0, 1.03, sz * 0.165, look.pouch);
  rbox('spine', 'cloth', 0.22, 0.2, 0.27, 0.05, 0, 1.19, 0, look.cloth);
  rbox('chest', 'cloth', 0.25, 0.26, 0.32, 0.06, 0, 1.39, 0, look.cloth);
  rbox('chest', 'matte', 0.29, 0.32, 0.36, 0.035, 0, 1.37, 0, look.vest);
  rbox('chest', 'matte', 0.05, 0.26, 0.26, 0.012, 0.155, 1.37, 0, look.vest);
  for (let i = 0; i < 3; i++) rbox('chest', 'matte', 0.055, 0.11, 0.075, 0.01, 0.18, 1.30, -0.09 + i * 0.09, look.pouch);
  for (const sz of [-1, 1]) rbox('chest', 'matte', 0.13, 0.09, 0.11, 0.03, 0, 1.49, sz * 0.19, look.pad);
  part('neck', 'matte', new THREE.CylinderGeometry(0.055, 0.06, 0.11, 12), look.mask, { y: 1.545 });
  if (look.scarf) part('neck', 'matte', new THREE.CylinderGeometry(0.095, 0.11, 0.07, 14), look.scarf, { y: 1.505 });

  // ———— 头 ————
  ball('head', 'matte', 1, 0, 1.675, 0, look.mask, [0.095, 0.112, 0.10]);
  rbox('head', 'matte', 0.02, 0.042, 0.088, 0.008, 0.086, 1.693, 0, look.skin);
  if (look.goggles) {
    rbox('head', 'matte', 0.03, 0.032, 0.125, 0.012, 0.097, 1.703, 0, 0x07090c);
    for (const sz of [-1, 1]) box('head', 'matte', 0.16, 0.022, 0.008, -0.02, 1.703, sz * 0.097, 0x14161a, { ry: sz * 0.25 });
  } else rbox('head', 'matte', 0.012, 0.014, 0.08, 0.005, 0.093, 1.708, 0, 0x070707);
  part('head', 'matte', new THREE.SphereGeometry(1, 20, 12, 0, PI * 2, 0, PI / 2), look.helmet, { y: 1.728, sx: 0.126, sy: 0.118, sz: 0.129 });
  part('head', 'matte', new THREE.TorusGeometry(0.1255, 0.009, 8, 24), look.helmet, { y: 1.731, rx: PI / 2, sz: 1.02 });
  box('head', 'matte', 0.032, 0.03, 0.036, 0.123, 1.775, 0, look.pad);
  for (const sz of [-1, 1]) box('head', 'matte', 0.11, 0.014, 0.012, 0, 1.752, sz * 0.128, look.pad);

  // ———— 手臂（绑定的姿势就是端枪）————
  limb('shoulderR', 'cloth', [0, 1.45, 0.19], [0.11, 1.29, 0.15], 0.058, 0.05, look.cloth);
  limb('elbowR', 'cloth', [0.11, 1.29, 0.15], [0.27, 1.22, 0.03], 0.048, 0.04, look.cloth);
  ball('elbowR', 'matte', 0.052, 0.11, 1.29, 0.15, look.pad);
  rbox('handR', 'matte', 0.085, 0.085, 0.08, 0.028, 0.275, 1.215, 0.03, look.glove);
  limb('shoulderL', 'cloth', [0, 1.45, -0.19], [0.24, 1.19, -0.21], 0.058, 0.05, look.cloth);
  limb('elbowL', 'cloth', [0.24, 1.19, -0.21], [0.46, 1.245, 0.03], 0.048, 0.04, look.cloth);
  ball('elbowL', 'matte', 0.052, 0.24, 1.19, -0.21, look.pad);
  rbox('handL', 'matte', 0.095, 0.05, 0.085, 0.02, 0.465, 1.212, 0.03, look.glove);
  box('shoulderL', 'matte', 0.065, 0.06, 0.005, 0.06, 1.37, -0.247, look.accent, { rz: 0.62 });

  // ———— 腿 ————
  for (const [s, hx, kx, kz] of [['R', 0.10, 0.02, 0.11], ['L', -0.10, -0.04, -0.11]]) {
    limb(`thigh${s}`, 'cloth', [0, 0.92, hx], [kx, 0.50, kz], 0.09, 0.068, look.cloth);
    rbox(`thigh${s}`, 'cloth', 0.12, 0.13, 0.035, 0.012, 0.03, 0.75, hx + (s === 'R' ? 0.085 : -0.085), look.cloth);
    if (s === 'R') rbox('thighR', 'matte', 0.07, 0.17, 0.1, 0.012, 0.05, 0.72, 0.19, look.vest);
    limb(`knee${s}`, 'cloth', [kx, 0.50, kz], [kx - 0.06, 0.09, kz], 0.065, 0.052, look.cloth);
    rbox(`knee${s}`, 'matte', 0.1, 0.11, 0.11, 0.03, kx + 0.035, 0.5, kz, look.pad);
    rbox(`foot${s}`, 'matte', 0.115, 0.105, 0.115, 0.025, kx + 0.07, 0.052, kz, look.boot);
    rbox(`foot${s}`, 'matte', 0.1, 0.09, 0.11, 0.022, kx - 0.03, 0.045, kz, look.boot);
  }

  // ———— 手里的枪（绑在胸口，跟着瞄准俯仰）————
  const gun = rifleSilhouette(weaponId), gr = new THREE.Matrix4().compose(new THREE.Vector3(0.22, 1.265, 0.03), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -PI / 2, 0)), new THREE.Vector3(1, 1, 1));
  for (const key of Object.keys(gun)) for (const g of gun[key]) { g.applyMatrix4(gr); G[key === 'wood' || key === 'lens' ? 'paint' : key === 'blade' ? 'metal' : key].push(skinTo(g, 'chest')); }

  // ———— 骨架与蒙皮 ————
  const bones = [], B = {};
  for (const [name, parent, x, y, z] of BONES) {
    const b = new THREE.Bone(); b.name = name;
    b.position.set(x - (parent ? B[parent].userData.p[0] : 0), y - (parent ? B[parent].userData.p[1] : 0), z - (parent ? B[parent].userData.p[2] : 0));
    b.userData.p = [x, y, z];
    if (parent) B[parent].add(b);
    bones.push(b); B[name] = b;
  }
  const merged = mergeGeometries([G.cloth, G.matte, G.metal, G.paint].map((list) => { const g = mergeGeometries(list, false); for (const x of list) x.dispose(); return g; }), true);
  merged.computeBoundingSphere();
  const clothMat = (team === 0 ? M.clothGR : M.clothBL);
  const mesh = new THREE.SkinnedMesh(merged, [clothMat, M.webbing, M.metal, M.paint]);
  mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  mesh.add(B.hips);
  const group = new THREE.Group();
  group.add(mesh);
  group.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));

  const pose = { crouch: 0, phase: 0, speed: 0, pitch: 0, recoil: 0, flinch: 0, dead: 0, fall: 1, t: 0 };
  /** 把姿态写进骨骼。dead：0 → 1 倒地的进度；fall：倒向（+1 仰面，-1 俯身） */
  function apply(p = pose) {
    const { crouch: c, phase: ph, speed: sp, pitch, dead: d } = p, run = Math.min(1, sp / 4.5), A = 0.62 * run, t = p.t;
    const relax = ease(Math.min(1, d * 1.6));
    B.hips.position.y = 0.96 - 0.31 * c * (1 - relax) + 0.022 * Math.abs(Math.sin(ph)) * run;
    B.hips.rotation.set(0, 0.05 * Math.sin(ph) * run * (1 - relax), 0.012 * Math.sin(ph) * run);
    for (const [s, off, rest] of [['R', 0, 0.05], ['L', PI, -0.09]]) {
      const swing = Math.sin(ph + off) * A, lift = Math.max(0, Math.cos(ph + off)) * 0.95 * run;
      const thigh = B['thigh' + s], knee = B['knee' + s], foot = B['foot' + s];
      thigh.rotation.z = (rest + swing + 0.95 * c * (1 - relax)) * (1 - relax * 0.85);
      knee.rotation.z = (-(0.06 + lift + 1.75 * c * (1 - relax))) * (1 - relax * 0.9);
      foot.rotation.z = -(thigh.rotation.z + knee.rotation.z) * 0.75 * (1 - relax);
    }
    B.spine.rotation.set(0, 0, (-0.05 * run - 0.26 * c) * (1 - relax));
    B.chest.rotation.set(p.flinch * 0.12 + 0.012 * Math.sin(t * 1.7), 0.03 * Math.sin(ph) * run, (0.45 * pitch - 0.07 * run - 0.3 * c) * (1 - relax) + p.recoil * 0.035 - relax * 0.35);
    B.neck.rotation.set(0, 0, 0.25 * pitch * (1 - relax));
    B.head.rotation.set(0, 0, (0.5 * pitch) * (1 - relax) + relax * 0.5);
    B.shoulderR.rotation.set(0, 0, -relax * 1.3);
    B.shoulderL.rotation.set(0, 0, -relax * 1.6);
    B.elbowR.rotation.set(0, 0, -relax * 0.5);
    // 倒地：整个人绕脚跟转下去
    mesh.rotation.set(0, 0, 1.5 * ease(d) * p.fall);
    mesh.position.set(-0.25 * ease(d) * p.fall, 0.1 * Math.sin(PI * Math.min(1, d * 1.3)) - 0.0, 0.05 * ease(d));
    return group;
  }
  apply();
  return { group, mesh, bones: B, apply, pose };
}
