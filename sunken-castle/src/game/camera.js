// 两套镜头：电影巡游（沿着分镜表的曲线走，带一点手持的呼吸感，镜头之间黑场切换）和自由潜泳（鼠标看、WASD 游，碰到东西会被推开）。
// 两种模式之间切换时镜头留在原地：从巡游切到潜泳，就是从当前画面接着往下游。
import * as THREE from 'three';
import { clamp, damp } from '../core/mathx.js';

const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/** 起停都缓一点，中间接近匀速 */
const ease = (u) => u + 0.26 * (u * u * (3 - 2 * u) - u);
const curveOf = (pts) => (pts.length > 2 ? new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'centripetal') : null);
const _v = new THREE.Vector3();

/** 一个镜头在 u（0..1）时刻的位置和注视点 */
export function sampleShot(s, u, pos, look) {
  s._pc ??= curveOf(s.pos); s._lc ??= curveOf(s.look);
  const k = ease(u);
  if (s._pc) s._pc.getPoint(k, pos); else pos.set(...s.pos[0]).lerp(_v.set(...s.pos[1]), k);
  if (s.look.length === 1) look.set(...s.look[0]);
  else if (s._lc) s._lc.getPoint(k, look);
  else look.set(...s.look[0]).lerp(_v.set(...s.look[1]), k);
}

/**
 * 电影巡游。
 * @param {THREE.PerspectiveCamera} camera
 * @param {Array} shots 分镜表（game/tour.js）
 * @param {{ handheld?: number }} o  handheld：手持感 0..1
 */
export function createTour(camera, shots, o = {}) {
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), T = { index: 0, t: 0, fade: 1, justCut: true, handheld: o.handheld ?? 1 };
  for (const s of shots) { s._pc = curveOf(s.pos); s._lc = curveOf(s.look); }
  return {
    state: T, shots,
    get shot() { return shots[T.index]; },
    update(dt, time) {
      let s = shots[T.index];
      T.t += dt;
      if (T.t >= s.dur) { T.index = (T.index + 1) % shots.length; T.t = 0; T.justCut = true; s = shots[T.index]; }
      sampleShot(s, T.t / s.dur, pos, look);
      const h = T.handheld;
      pos.x += Math.sin(time * 0.31) * 0.07 * h; pos.y += Math.sin(time * 0.23 + 1.3) * 0.05 * h;                       // 极慢极小的漂移，像有人端着
      look.x += Math.sin(time * 0.27 + 0.7) * 0.25 * h; look.y += Math.sin(time * 0.19 + 2.1) * 0.18 * h;
      camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(look);
      camera.rotateZ(Math.sin(time * 0.11) * 0.007 * h);
      camera.fov = damp(camera.fov, s.fov ?? 60, 5, dt); camera.updateProjectionMatrix();
      T.fade = Math.min(smooth(0, 1.1, T.t), smooth(0, 0.8, s.dur - T.t));                                              // 镜头之间黑场：头尾各淡一下
      const cut = T.justCut; T.justCut = false;
      return cut ? 'cut' : null;
    },
    /** 跳到第 i 个镜头的开头 */
    jump(i) { T.index = (i + shots.length) % shots.length; T.t = 0; T.justCut = true; },
    /** 当前镜头的位姿（交给潜泳镜头） */
    pose() { return { pos: camera.position.clone(), quat: camera.quaternion.clone(), fov: camera.fov }; },
  };
}

/**
 * 自由潜泳。鼠标转视角（指针锁定），W/S 前后、A/D 左右、空格上升、C 下降、Shift 疾游；触屏用左边的摇杆和右边的拖动。
 * @param {THREE.PerspectiveCamera} camera
 * @param {HTMLElement} dom 画布：点一下锁定指针
 * @param {object|null} collide game/collide.js 的 createColliders()
 * @param {{ speed?: number, boostSpeed?: number, radius?: number, fov?: number, sens?: number, sway?: number, onUnlock?: Function }} o
 */
export function createSwim(camera, dom, collide, o = {}) {
  const S = { yaw: 0, pitch: 0, roll: 0, vel: new THREE.Vector3(), keys: new Set(), active: false, locked: false, boost: 0, stick: [0, 0], vert: 0, tBoost: false, speed: 0, boost01: 0, sens: o.sens ?? 1, sway: o.sway ?? 1, collide, touches: 0 };
  const _fwd = new THREE.Vector3(), _right = new THREE.Vector3(), _wish = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler(), _a = [0, 0, 0];
  let prevYaw = 0, yawVel = 0, lastT = 0;
  const down = (e) => { if (!S.active) return; if (e.repeat) return; if (GAME_KEYS.has(e.code)) e.preventDefault?.(); S.keys.add(e.code); };
  const up = (e) => S.keys.delete(e.code);
  const move = (e) => { if (S.locked && S.active) { S.yaw -= e.movementX * 0.0021 * S.sens; S.pitch = clamp(S.pitch - e.movementY * 0.0021 * S.sens, -1.5, 1.5); } };
  const lockChange = () => { const was = S.locked; S.locked = document.pointerLockElement === dom; if (was && !S.locked && S.active) o.onUnlock?.(); };
  const blur = () => S.keys.clear();
  addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur);
  document.addEventListener('mousemove', move); document.addEventListener('pointerlockchange', lockChange);
  dom.addEventListener('contextmenu', (e) => e.preventDefault());
  return {
    state: S,
    /** 接着给定的位姿开始游 */
    enter(pose) {
      S.active = true; S.vel.set(0, 0, 0); S.boost = 0; S.keys.clear(); S.stick = [0, 0]; S.vert = 0; S.tBoost = false;
      if (pose) { camera.position.copy(pose.pos); _e.setFromQuaternion(pose.quat, 'YXZ'); S.yaw = _e.y; S.pitch = clamp(_e.x, -1.5, 1.5); camera.fov = pose.fov; camera.updateProjectionMatrix(); }
      prevYaw = S.yaw;
    },
    leave() { S.active = false; S.keys.clear(); if (document.pointerLockElement === dom) document.exitPointerLock(); },
    /** 把鼠标抓进画面。浏览器只在用户刚点过或按过键时才答应（比如用 ?mode=free 直接打开页面时就不行）：不答应也不算错，点一下画面再抓 */
    lock() {
      if (document.pointerLockElement === dom) return;
      try { dom.requestPointerLock?.()?.catch?.(() => {}); } catch { /* 老浏览器同步抛错：一样不管 */ }
    },
    /** 触屏：摇杆（-1..1）、升降、疾游 */
    setStick(x, y) { S.stick = [clamp(x, -1, 1), clamp(y, -1, 1)]; S.touches = (Math.abs(x) + Math.abs(y) > 0.05) ? 2 : 0; },
    setVert(v) { S.vert = clamp(v, -1, 1); },
    setBoost(b) { S.tBoost = !!b; },
    /** 触屏拖动视角 */
    lookDelta(dx, dy) { if (!S.active) return; S.yaw -= dx * 0.005 * S.sens; S.pitch = clamp(S.pitch - dy * 0.005 * S.sens, -1.5, 1.5); },
    update(dt, time) {
      if (!S.active) return;
      const k = S.keys;
      const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + S.stick[1];
      const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + S.stick[0];
      const v = (k.has('Space') ? 1 : 0) - (k.has('KeyC') || k.has('KeyZ') ? 1 : 0) + S.vert;
      const moving = Math.abs(f) + Math.abs(s) + Math.abs(v) > 0.08;
      S.boost01 = damp(S.boost01, (k.has('ShiftLeft') || k.has('ShiftRight') || S.tBoost) && moving ? 1 : 0, 3.5, dt);
      const cp = Math.cos(S.pitch), speed = (o.speed ?? 3.2) * (1 + ((o.boostSpeed ?? 9) / (o.speed ?? 3.2) - 1) * S.boost01);
      _fwd.set(-Math.sin(S.yaw) * cp, Math.sin(S.pitch), -Math.cos(S.yaw) * cp); _right.set(Math.cos(S.yaw), 0, -Math.sin(S.yaw));
      const len = Math.hypot(f, s, v) || 1;
      _wish.set(0, 0, 0).addScaledVector(_fwd, f).addScaledVector(_right, s); _wish.y += v; _wish.multiplyScalar((Math.min(1, len) / len) * speed);   // 斜着游不更快
      const lam = (wish) => (wish ? 2.4 : 1.6) * (1 + 1.6 * S.boost01);
      S.vel.x = damp(S.vel.x, _wish.x, lam(_wish.x), dt); S.vel.y = damp(S.vel.y, _wish.y, lam(_wish.y), dt); S.vel.z = damp(S.vel.z, _wish.z, lam(_wish.z), dt);
      _p.copy(camera.position).addScaledVector(S.vel, dt);
      _a[0] = _p.x; _a[1] = _p.y; _a[2] = _p.z;
      collide?.resolve(_a, o.radius ?? 0.6);
      S.vel.set(_a[0] - camera.position.x, _a[1] - camera.position.y, _a[2] - camera.position.z).divideScalar(Math.max(dt, 1e-4));   // 被挡住以后，速度跟着消失
      camera.position.set(_a[0], _a[1], _a[2]);
      S.speed = S.vel.length();
      yawVel = (S.yaw - prevYaw) / Math.max(dt, 1e-4); prevYaw = S.yaw;
      S.roll = damp(S.roll, clamp(-yawVel * 0.045, -0.14, 0.14) + clamp(s * 0.03, -0.035, 0.035), 3, dt);             // 转弯的时候身子略微侧倾
      const w = S.sway;
      camera.quaternion.setFromEuler(_e.set(S.pitch + Math.sin(time * 0.7) * 0.0045 * w, S.yaw + Math.sin(time * 0.53) * 0.0045 * w, S.roll, 'YXZ'));
      camera.fov = damp(camera.fov, (o.fov ?? 62) + 9 * S.boost01 * Math.min(1, S.speed / speed + 0.25), 3, dt);     // 疾游的时候视野略宽
      camera.updateProjectionMatrix();
      lastT = time;
    },
    dispose() { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur); document.removeEventListener('mousemove', move); document.removeEventListener('pointerlockchange', lockChange); },
  };
}

/** 游戏里用到的键：按下时不许浏览器干别的（空格滚屏之类） */
const GAME_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyC', 'KeyZ', 'Space', 'ShiftLeft', 'ShiftRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
