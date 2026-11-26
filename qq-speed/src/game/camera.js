// 镜头 rig：追尾（近景 / 远景 / 引擎盖）、大厅的环绕镜头、开场和冲线时的电影镜头。
// 追尾镜头跟在“车头方向和速度方向的混合方向”的后上方，所以漂移时能看到车横着滑；
// 氮气时视野拉开、镜头往后一顿，撞墙时抖一下。纵向是刚性跟随（先跟着车平移，再平滑横向摆动），车速再快镜头也不会被落远。镜头自己不会被甩进墙里。
import * as THREE from 'three';
import { nearest, WALL } from '../core/trackdef.js';

const damp = (dt, tau) => 1 - Math.exp(-dt / tau);
const lerpAngle = (a, b, t) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * t; };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

export const CAM_MODES = Object.freeze([
  { name: '近景', dist: 7.6, h: 2.95, fov: 63 },
  { name: '远景', dist: 10.8, h: 3.9, fov: 59 },
  { name: '引擎盖', hood: true, fov: 71 },
]);

/**
 * @param {THREE.PerspectiveCamera} camera
 * @param {object} T createTrack()
 */
export function createCameraRig(camera, T) {
  const rig = {
    mode: 0, pos: new THREE.Vector3(), look: new THREE.Vector3(), shake: 0, fov: CAM_MODES[0].fov, roll: 0, az: 0.6, snap: true, hud: 0,
    _fo: 0, _target: new THREE.Vector3(), _tmp: new THREE.Vector3(),
  };

  /**
   * 镜头收杆：追尾镜头想要待的位置如果在路外（墙里），就沿着“车 → 镜头”这根杆往回收，收到路面里为止。
   * 收得越短，镜头抬得越高，所以车始终在画面正中，不会出现镜头被横着推到车顶上的情况。改动 t，返回收了几成（0 = 没收）
   */
  const pullIn = (S, t) => {
    const dx = t.x - S.x, dz = t.z - S.z, len = Math.hypot(dx, dz);
    let k = 1;
    for (let it = 0; it < 4; it++) {
      const n = nearest(T, S.x + dx * k, S.z + dz * k, S.i ?? -1), over = Math.abs(n.e) - (T.hw[n.i] + WALL - 0.6);
      if (over <= 0 || len < 0.01) break;
      k = Math.max(0.34, k - (over * 1.08) / len);
    }
    if (k < 1) { t.set(S.x + dx * k, t.y + (1 - k) * 7.5, S.z + dz * k); return 1 - k; }
    return 0;
  };

  /** 追尾。o：{ boost 氮气 0..1，mini 小喷 0..1，hit 撞击 0..1，brake 刹车 } */
  rig.chase = (dt, S, o = {}) => {
    const m = CAM_MODES[rig.mode], v = Math.hypot(S.vx, S.vz), boost = o.boost || 0;
    rig.shake = Math.max(rig.shake * Math.exp(-dt * 5.5), Math.min(0.5, (o.hit || 0) * 0.45));
    const rumble = boost * 0.022 + (o.mini ? 0.012 : 0);
    const c = Math.cos(S.psi), sn = Math.sin(S.psi);
    if (m.hood) {                                                                          // 引擎盖：固定在车上，没有滞后
      rig.pos.set(S.x + c * 1.0, 1.1, S.z + sn * 1.0);
      rig.look.set(S.x + c * 24, 0.9 + Math.sin(performance.now() * 0.013) * rumble * 2, S.z + sn * 24);
      rig.roll = -S.w * Math.max(0, S.vF) * 0.0022;
    } else {
      const vAng = v > 4 ? Math.atan2(S.vz, S.vx) : S.psi;
      const behind = lerpAngle(S.psi, vAng, 0.55);                                         // 车后的方向：车头和速度方向各取一半
      const dist = m.dist + Math.min(2.4, v * 0.028) + boost * 0.8 - (o.brake ? 0.35 : 0);
      const t = rig._target.set(S.x - Math.cos(behind) * dist, 0.06 + m.h + boost * 0.25, S.z - Math.sin(behind) * dist);
      pullIn(S, t);
      const pc = rig._cp || (rig._cp = new THREE.Vector2());                             // 上一帧车的位置
      if (rig.snap) { rig.pos.copy(t); rig.snap = false; rig.look.set(S.x, 1.0, S.z); }
      else { rig.pos.x += S.x - pc.x; rig.pos.z += S.z - pc.y; rig.look.x += S.x - pc.x; rig.look.z += S.z - pc.y; }   // 先跟着车平移：纵向是刚性的，不会因为车速快就落到更后面
      pc.set(S.x, S.z);
      const kx = damp(dt, 0.10), ky = damp(dt, 0.16);                                    // 再平滑相对车的偏差（弯里、漂移时镜头绕着车的横向摆动）
      rig.pos.x += (t.x - rig.pos.x) * kx; rig.pos.z += (t.z - rig.pos.z) * kx;
      rig.pos.y += (t.y - rig.pos.y) * ky;
      const la = 3 + v * 0.07;
      rig.look.x += (S.x + c * la - rig.look.x) * damp(dt, 0.07);
      rig.look.z += (S.z + sn * la - rig.look.z) * damp(dt, 0.07);
      rig.look.y += (1.15 - rig.look.y) * damp(dt, 0.1);
      rig.roll = -S.slip * 0.11;
    }
    apply(camera, rig, rumble, m.fov + boost * 7.5 + (o.mini ? 3.5 : 0) + Math.min(3, v * 0.045), dt);
  };

  /** 环绕（大厅的车库镜头、冲线后的镜头）。center：车的位置。车在动时镜头先跟着车平移，再平滑绕过去，所以不会把车甩到画面边上。
   *  o.az：直接给定方位角（弧度），不给就按 o.speed 自己转 */
  rig.orbit = (dt, x, z, o = {}) => {
    if (o.az !== undefined) rig.az = o.az; else rig.az += dt * (o.speed ?? 0.3);
    const d = o.dist ?? 8.4, h = o.h ?? 2.2, a = rig.az + (o.phase ?? 0);
    const oc = rig._oc ?? (rig._oc = new THREE.Vector3(x, 0, z));
    rig.pos.x += x - oc.x; rig.pos.z += z - oc.z; rig.look.x += x - oc.x; rig.look.z += z - oc.z;     // 跟着车走
    oc.set(x, 0, z);
    const t = rig._target.set(x + Math.cos(a) * d, 0.06 + h + (o.az !== undefined ? 0 : Math.sin(a * 0.7) * 0.25), z + Math.sin(a) * d);
    if (rig.snap) { rig.pos.copy(t); rig.snap = false; rig.look.set(x, 0.7, z); }
    const k = damp(dt, 0.5), kl = damp(dt, o.az !== undefined ? 0.08 : 0.5);        // a camera steered by az turns slowly: keep the car firmly in place
    rig.pos.lerp(t, k);
    rig.look.x += (x + Math.cos(a) * 0.9 - rig.look.x) * kl; rig.look.z += (z + Math.sin(a) * 0.9 - rig.look.z) * kl;
    rig.look.y += (0.62 - rig.look.y) * k;
    rig.shake *= Math.exp(-dt * 5); rig.roll += (0 - rig.roll) * k;
    apply(camera, rig, 0, o.fov ?? 38, dt);
  };

  /** 开场的电影镜头：从高处、远处一路俯冲到追尾位置。k：0..1 */
  rig.intro = (dt, k, S) => {
    const m = CAM_MODES[rig.mode], v = Math.hypot(S.vx, S.vz), e = smooth(k);
    const c = Math.cos(S.psi), sn = Math.sin(S.psi), rx = -sn, rz = c;
    const ax = S.x - c * 44 + rx * 16, az = S.z - sn * 44 + rz * 16, ay = 30;               // 起点：发车格后上方
    const bx = S.x - c * m.dist, bz = S.z - sn * m.dist, by = 0.06 + m.h;                  // 终点：追尾位置
    const t = rig._target.set(ax + (bx - ax) * e, ay + (by - ay) * e * e, az + (bz - az) * e);
    if (rig.snap) { rig.pos.copy(t); rig.snap = false; rig.look.set(S.x + c * 60, 8, S.z + sn * 60); }
    const kk = damp(dt, 0.6);
    rig.pos.lerp(t, kk);
    rig.look.x += (S.x + c * (60 - 57 * e) - rig.look.x) * kk;
    rig.look.z += (S.z + sn * (60 - 57 * e) - rig.look.z) * kk;
    rig.look.y += ((8 - 6.85 * e) - rig.look.y) * kk;
    rig.roll += (0 - rig.roll) * kk;
    apply(camera, rig, 0, 44 + (m.fov - 44) * e, dt);
  };

  rig.next = () => { rig.mode = (rig.mode + 1) % CAM_MODES.length; return CAM_MODES[rig.mode].name; };
  return rig;
}

function apply(camera, rig, rumble, fov, dt) {
  const t = performance.now() * 0.001, sh = rig.shake;
  camera.position.set(
    rig.pos.x + (Math.sin(t * 61) * rumble + Math.sin(t * 23.7) * sh * 0.6),
    rig.pos.y + (Math.sin(t * 77 + 1) * rumble + Math.sin(t * 31.3) * sh * 0.5),
    rig.pos.z + (Math.sin(t * 53 + 2) * rumble + Math.sin(t * 27.1) * sh * 0.6),
  );
  camera.lookAt(rig.look);
  if (rig.roll) camera.rotateZ(rig.roll);
  rig.fov += (fov - rig.fov) * damp(dt, 0.18);
  if (Math.abs(camera.fov - rig.fov) > 0.01) { camera.fov = rig.fov; camera.updateProjectionMatrix(); }
}
