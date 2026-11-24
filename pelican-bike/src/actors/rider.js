// 骑手 = 自行车 + 鹈鹕。整车坐标系：+Z 前进、+Y 上、+X 鹈鹕左手侧。
import * as THREE from 'three';
import { createBicycle } from './bicycle.js';
import { createPelican, createWingHand } from './pelican.js';
import { BIKE, pedalPos } from '../core/bike.js';

/** 释放一棵对象树的几何体与材质。贴图不在这里释放：头盔与围巾贴图是全场景共享的一份。 */
function disposeTree(root) {
  const geos = new Set(), mats = new Set();
  root.traverse((o) => { if (o.geometry) geos.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => mats.add(m)); });
  for (const m of [...mats]) if (m.userData?.pbrSibling) mats.add(m.userData.pbrSibling);     // 写实风格的替身材质一并释放
  geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose());
}

const _p = [0, 0, 0];

export function createRider(U, o = {}) {
  const hero = new THREE.Group(); hero.name = 'hero';
  const bike = createBicycle(U, o);
  let pelican = createPelican(U);
  hero.add(bike.root, pelican.root);
  // 翼指挂在抓握锚点上，并把转向轴的倾斜抵消掉，使它的坐标轴与整车一致
  const tilt = bike.steer.parent.quaternion.clone().invert();
  for (const [anchor, side] of [[bike.gripL, 1], [bike.gripR, -1]]) {
    const hand = createWingHand(U, side);
    hand.quaternion.copy(tilt);
    anchor.add(hand);
  }
  const anchors = { gripL: new THREE.Vector3(BIKE.grip[0], BIKE.grip[1], BIKE.grip[2]), gripR: new THREE.Vector3(-BIKE.grip[0], BIKE.grip[1], BIKE.grip[2]), pedalL: new THREE.Vector3(), pedalR: new THREE.Vector3() };
  const api = {
    hero, bike, pelican, anchors,
    /**
     * @param {object} state 骑行状态
     * @param {number} dt
     * @param {object} x { curvature, lampLevel, ringBell, look, mouth }
     */
    update(state, dt, x = {}) {
      bike.update(state, dt, x);
      hero.updateMatrixWorld(true);
      bike.gripL.getWorldPosition(anchors.gripL); hero.worldToLocal(anchors.gripL);
      bike.gripR.getWorldPosition(anchors.gripR); hero.worldToLocal(anchors.gripR);
      pedalPos(1, state.crank, _p); anchors.pedalL.set(_p[0], _p[1], _p[2]);
      pedalPos(-1, state.crank, _p); anchors.pedalR.set(_p[0], _p[1], _p[2]);
      pelican.update({ state, dt, anchors, look: x.look, mouth: x.mouth, curvature: x.curvature });
    },
    /** 造型工坊：用新参数重建鹈鹕（自行车不动） */
    setSculpt(params) {
      hero.remove(pelican.root); disposeTree(pelican.root);
      pelican = createPelican(U, params); api.pelican = pelican;
      hero.add(pelican.root);
    },
  };
  api.update({ wheel: 0, crank: Math.PI / 2, crankVel: 0, v: 0, time: 0, air: false, accel: 0, airVy: 0, landImpact: 0 }, 0.016, {});
  return api;
}
