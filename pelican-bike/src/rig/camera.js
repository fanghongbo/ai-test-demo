// 相机系统：跟拍 / 侧跟 / 特写 / 环绕 / 导演 / 鹈鹕视角
// 约定：整车的航向角 yaw（绕 +Y，0 = +Z）。航向坐标系里“左”= +X 局部，“右”(海侧) = -X 局部。
import * as THREE from 'three';
import { clamp, damp, wrapAngle, mulberry32 } from '../core/mathx.js';
import { ROAD } from '../core/track.js';

export const CAM_MODES = Object.freeze([
  { id: 'follow', label: '跟拍', hint: '拖动环绕，滚轮远近' },
  { id: 'side', label: '侧跟', hint: '从海面一侧平移跟随' },
  { id: 'close', label: '特写', hint: '贴近鹈鹕的头和喙' },
  { id: 'orbit', label: '环绕', hint: '绕着骑手慢慢转圈' },
  { id: 'director', label: '导演', hint: '自动切换机位，像一段短片' },
  { id: 'pov', label: '鹈鹕视角', hint: '从鹈鹕的眼睛往前看' },
]);

const SHOTS = ['tripod', 'lowFront', 'rearWide', 'seaLong', 'topDown', 'wheel', 'front34'];
const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _f = new THREE.Vector3(), _r = new THREE.Vector3();

export function createCameraRig(camera, o = {}) {
  const st = {
    i: 0, az: 0, el: 0, dist: 1, idle: 99, pos: new THREE.Vector3(), tgt: new THREE.Vector3(), fov: 36,
    shot: null, shotT: 0, last: '', shake: 0, rng: mulberry32(o.seed ?? 7), snap: true, time: 0,
  };
  const want = new THREE.Vector3(), wantT = new THREE.Vector3();
  const hooks = { onCut: null };
  const reduced = () => !!o.reducedMotion?.();

  function setMode(idOrIndex) {
    const i = typeof idOrIndex === 'number' ? idOrIndex : CAM_MODES.findIndex((m) => m.id === idOrIndex);
    if (i < 0 || i >= CAM_MODES.length || i === st.i) return false;
    st.i = i; st.snap = true; st.shot = null; st.shotT = 0; st.last = '';
    return true;
  }
  const cycle = (dir = 1) => { st.i = (st.i + dir + CAM_MODES.length) % CAM_MODES.length; st.snap = true; st.shot = null; st.shotT = 0; st.last = ''; return st.i; };
  function orbit(dx, dy) { st.az = wrapAngle(st.az - dx * 0.0062); st.el = clamp(st.el + dy * 0.005, -0.4, 1.25); st.idle = 0; }
  function zoom(f) { st.dist = clamp(st.dist * f, 0.5, 2.6); st.idle = 0; }
  function shakeBy(a) { st.shake = Math.min(1, st.shake + a); }
  function reset() { st.az = 0; st.el = 0; st.dist = 1; st.snap = true; st.shot = null; }

  /** 导演模式：挑下一个机位。c.placeAt(s, u) → { x, y, z }（路线坐标 → 世界） */
  function nextShot(c) {
    let type = SHOTS[Math.floor(st.rng() * SHOTS.length)];
    if (type === st.last) type = SHOTS[(SHOTS.indexOf(type) + 1 + Math.floor(st.rng() * (SHOTS.length - 1))) % SHOTS.length];
    st.last = type;
    const sh = { type, t: 0, max: 9, fixed: null, u: 0, s: 0 };
    if (type === 'tripod') {
      const pick = st.rng(), side = pick < 0.4 ? 0 : pick < 0.72 ? 1 : 2;
      sh.u = side === 0 ? ROAD.half + ROAD.curbW + ROAD.walkOut - 1.0 : side === 1 ? -(ROAD.half + 1.0) : 1.1;
      sh.s = c.s + 26 + st.rng() * 16;
      const a = c.placeAt(sh.s, sh.u);
      sh.fixed = new THREE.Vector3(a.x, a.y + (side === 2 ? 1.15 : 1.55), a.z);
    } else sh.max = 4.2 + st.rng() * 2.6;
    st.shot = sh; st.snap = true;
    hooks.onCut && hooks.onCut();
  }

  /**
   * @param {number} dt
   * @param {object} c { hero, yaw, speed, s, headPos, headQuat, placeAt }
   */
  function update(dt, c) {
    st.idle += dt; st.time += dt;
    const mode = CAM_MODES[st.i].id, hero = c.hero, yaw = c.yaw, speed = c.speed || 0;
    _f.set(Math.sin(yaw), 0, Math.cos(yaw));                 // 前
    _r.set(-Math.cos(yaw), 0, Math.sin(yaw));                // 右（海侧）
    let fovT = 36, lam = 8, lamT = 10;
    if (mode !== 'pov' && mode !== 'director' && st.idle > 5) {   // 一段时间没操作：视角自己回到默认位置
      st.az = damp(st.az, 0, 0.9, dt); st.el = damp(st.el, 0, 0.9, dt);
    }
    if (mode === 'follow') {
      const d = 8.6 * st.dist, el = 0.2 + st.el, a = yaw + Math.PI + st.az;
      want.set(hero.x + Math.sin(a) * Math.cos(el) * d, hero.y + Math.sin(el) * d + 0.5, hero.z + Math.cos(a) * Math.cos(el) * d);
      wantT.copy(hero).addScaledVector(_f, 1.6 + speed * 0.14); wantT.y += 1.0;
      fovT = 36 + speed * 0.25;
    } else if (mode === 'side') {
      want.copy(hero).addScaledVector(_r, 7.2 * st.dist).addScaledVector(_f, st.az * 5); want.y += 2.0 + st.el * 5;
      wantT.copy(hero); wantT.y += 1.15; fovT = 34; lam = 6; lamT = 8;
    } else if (mode === 'close') {
      const d = 3.4 * st.dist, el = 0.1 + st.el, a = yaw + 0.72 + st.az;
      want.set(hero.x + Math.sin(a) * Math.cos(el) * d, hero.y + Math.sin(el) * d + 1.5, hero.z + Math.cos(a) * Math.cos(el) * d);
      wantT.copy(hero).addScaledVector(_f, 0.35); wantT.y += 1.8; fovT = 32; lam = 9;
    } else if (mode === 'orbit') {
      const d = 5.4 * st.dist, el = 0.2 + st.el, a = st.time * 0.22 + st.az + yaw;
      want.set(hero.x + Math.sin(a) * Math.cos(el) * d, hero.y + Math.sin(el) * d + 0.5, hero.z + Math.cos(a) * Math.cos(el) * d);
      wantT.copy(hero); wantT.y += 1.15; fovT = 36; lam = 12;
    } else if (mode === 'pov') {
      want.set(-0.13, 0.035, 0.06).applyQuaternion(c.headQuat).add(c.headPos);
      wantT.set(0, -0.03, 1).applyQuaternion(c.headQuat).multiplyScalar(10).add(want);
      fovT = 62; lam = 60; lamT = 60;
    } else {                                                   // director
      if (!st.shot) nextShot(c);
      const sh = st.shot;
      sh.t += dt;
      let done = sh.t > sh.max;
      switch (sh.type) {
        case 'tripod':
          want.copy(sh.fixed);
          wantT.copy(hero).addScaledVector(_f, 0.4); wantT.y += 1.15;
          done = done || _p.copy(hero).sub(sh.fixed).dot(_f) > 11;
          fovT = 30 + clamp(speed * 1.2, 0, 14); lam = 9; lamT = 7; break;
        case 'lowFront':
          want.copy(hero).addScaledVector(_f, 4.6).addScaledVector(_r, -0.4); want.y += 0.55;
          wantT.copy(hero); wantT.y += 1.2; fovT = 34; lam = 7; break;
        case 'rearWide':
          want.copy(hero).addScaledVector(_f, -9.5).addScaledVector(_r, -2.2); want.y += 3.4;
          wantT.copy(hero); wantT.y += 1.2; fovT = 38; lam = 4; break;
        case 'seaLong':
          want.copy(hero).addScaledVector(_r, 19).addScaledVector(_f, 2); want.y += 2.2;
          wantT.copy(hero); wantT.y += 1.3; fovT = 15; lam = 5; lamT = 9; break;
        case 'topDown':
          want.copy(hero).addScaledVector(_f, 0.6); want.y += 11;
          wantT.copy(hero); wantT.y += 0.6; fovT = 40; lam = 6; break;
        case 'wheel':
          want.copy(hero).addScaledVector(_r, 1.7).addScaledVector(_f, -0.05); want.y += 0.5;
          wantT.copy(hero).addScaledVector(_f, -0.1); wantT.y += 0.45; fovT = 34; lam = 12; break;
        default:                                                // front34
          want.copy(hero).addScaledVector(_f, 3.4).addScaledVector(_r, -2.2); want.y += 1.5;
          wantT.copy(hero); wantT.y += 1.5; fovT = 36; lam = 7; break;
      }
      if (done) { nextShot(c); return update(0, c); }
    }
    if (st.snap) { st.pos.copy(want); st.tgt.copy(wantT); st.fov = fovT; st.snap = false; }   // 切换机位：硬切，不做长距离飞行
    else {
      st.pos.x = damp(st.pos.x, want.x, lam, dt); st.pos.y = damp(st.pos.y, want.y, lam, dt); st.pos.z = damp(st.pos.z, want.z, lam, dt);
      st.tgt.x = damp(st.tgt.x, wantT.x, lamT, dt); st.tgt.y = damp(st.tgt.y, wantT.y, lamT, dt); st.tgt.z = damp(st.tgt.z, wantT.z, lamT, dt);
      st.fov = damp(st.fov, fovT, 6, dt);
    }
    if (c.offset) {                                            // 构图偏移：让主体离开画面正中（开场卡片盖在左侧时用）
      _p.copy(wantT).sub(want).normalize(); _t.crossVectors(_p, THREE.Object3D.DEFAULT_UP).normalize();
      wantT.addScaledVector(_t, -c.offset);
      if (!st.snap) st.tgt.copy(wantT);
    }
    st.shake = Math.max(0, st.shake - dt * 3.2);
    camera.position.copy(st.pos);
    if (st.shake > 0.001 && !reduced()) {
      const k = st.shake * st.shake * 0.09, t = st.time * 38;
      camera.position.x += Math.sin(t * 1.3) * k; camera.position.y += Math.cos(t * 1.7) * k * 0.7;
    }
    camera.lookAt(st.tgt);
    camera.fov = st.fov; camera.updateProjectionMatrix();
    o.onFov && o.onFov();
  }

  return { update, setMode, cycle, orbit, zoom, shakeBy, reset, hooks, st, get mode() { return CAM_MODES[st.i]; }, get index() { return st.i; } };
}
