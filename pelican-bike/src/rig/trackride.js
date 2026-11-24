// 把骑手安放到环线路线上：位置 / 朝向 / 侧倾 / 离地
import * as THREE from 'three';

const _m = new THREE.Matrix4(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
const G = 9.81;

/**
 * @param {THREE.Object3D} hero
 * @param {object} track core/track.js
 * @param {number} s 弧长位置
 * @param {{airY?:number, speed?:number, curvature?:number, jumpPitch?:number}} st
 * @param {object} f 复用的路线坐标系
 */
export function placeOnTrack(hero, track, s, st, f) {
  track.frameAt(s, f);
  hero.position.set(f.pos[0], f.pos[1] + (st.airY || 0), f.pos[2]);
  // 整车局部轴：+X 左、+Y 上、+Z 前；right 指向海侧，所以左 = -right
  _x.set(-f.right[0], 0, -f.right[2]); _y.set(f.up[0], f.up[1], f.up[2]); _z.set(f.fwd[0], f.fwd[1], f.fwd[2]);
  hero.quaternion.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
  // 过弯侧倾：向弯心倾（左弯 κ>0 → 左侧下沉 → 绕 +Z 负向旋转）；跳起时车头随竖直速度俯仰
  const lean = -Math.atan(((st.speed || 0) ** 2 * (st.curvature || 0)) / G) * 0.85;
  hero.rotateZ(lean);
  if (st.jumpPitch) hero.rotateX(st.jumpPitch);
  return f;
}
