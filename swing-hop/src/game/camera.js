// 镜头：从侧面偏左、略高处看着兔子。看哪儿、看多宽由 core/framing.js 算，这里只负责平滑地跟过去，
// 外加落地、狼追近时的轻微晃动。竖屏的时候镜头正一点、看得窄一点。
import * as THREE from 'three';

const STEP = 1 / 120;

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.x = null; this.y = null; this.w = null;
    this.vx = 0; this.vy = 0; this.vw = 0;
    this.amp = 0;
    this.target = new THREE.Vector3();
  }

  snap(f) {
    this.x = f.x; this.y = f.y; this.w = f.w;
    this.vx = this.vy = this.vw = 0;
  }

  // 顿一下：落地很重、被抓的时候
  bump(amount) { this.amp = Math.min(0.4, this.amp + amount); }

  spring(p, v, target, omega, dt) {
    const a = omega * omega * (target - p) - 2 * omega * v;
    v += a * dt;
    return [p + v * dt, v];
  }

  update(f, dt, t, danger) {
    if (f) {
      if (this.x === null) this.snap(f);
      [this.x, this.vx] = this.spring(this.x, this.vx, f.x, 6.5, dt);
      [this.y, this.vy] = this.spring(this.y, this.vy, f.y, 3.6, dt);
      [this.w, this.vw] = this.spring(this.w, this.vw, f.w, 2.8, dt);
    }
    this.amp *= Math.exp(-dt * 7);
    const a = this.amp + danger * 0.05;                         // 狼追近了，画面一直有一点点抖
    this.target.set(this.x + Math.sin(t * 61) * a, this.y + Math.sin(t * 47 + 1.3) * a * 0.7, 0);
    const portrait = this.camera.aspect < 1.05;
    const yaw = (portrait ? 7 : 14) * (Math.PI / 180), pitch = (portrait ? 15 : 14) * (Math.PI / 180);
    const tanH = Math.tan((this.camera.fov * Math.PI) / 360);
    const fit = (this.w * (portrait ? 0.78 : 1)) / 2 / (tanH * this.camera.aspect);
    const dist = portrait ? Math.max(fit, 8.5 / 2 / tanH) : fit;         // 竖屏：宽度缩一点，但至少留出 8.5 米高
    this.camera.position.set(this.target.x - dist * Math.sin(yaw) * Math.cos(pitch), this.target.y + dist * Math.sin(pitch), dist * Math.cos(yaw) * Math.cos(pitch));
    this.camera.lookAt(this.target);
  }
}

function run(game, span) {
  while (span > 1e-9) {                                         // 每一步最多 STEP 秒
    const k = Math.min(STEP, span);
    game.step(k);
    span -= k;
  }
}

// 把这一帧推进 dt 秒。events：[{ type: 'press' | 'release', at }]，at 是事件在这一帧里发生的时刻（0 … dt 秒）。
// 先走到事件发生的时刻、处理，再往下走：按住多久就是多久，不受帧的长短影响。
export function advance(game, dt, events) {
  let t = 0;
  for (const ev of events.slice().sort((a, b) => a.at - b.at)) {
    if (ev.at > dt) ev.at = dt;                                    // 事件落在了这一帧的末尾之后：就当它在帧末发生
    run(game, Math.min(dt, ev.at) - t);
    if (ev.type === 'press') game.press(); else game.release();
    t = Math.min(dt, ev.at);
  }
  run(game, dt - t);
}
