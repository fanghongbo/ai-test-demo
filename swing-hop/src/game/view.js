// 把规则里的状态搬到画面上：该有哪些岛、每个秋千此刻的角度、兔子在哪儿是什么姿势。
// 这里不做任何规则上的决定，只读 game。
import * as THREE from 'three';
import { NodeView } from '../world/node.js';
import { Rabbit } from '../actors/rabbit.js';
import { CLOUD_Y } from '../core/course.js';
import { T_CHARGE, launch, clamp, smooth01 } from '../core/physics.js';
import { CRACK_HOLD } from '../core/game.js';

export class WorldView {
  constructor(scene) {
    this.scene = scene;
    this.nodes = new Map();
    this.tilt = new Map();            // 每个秋千的木板倾斜了多少
    this.stretch = new Map();         // 每个秋千的绳子被拽长了多少（落地时弹一下）
    this.rabbit = new Rabbit();
    scene.add(this.rabbit.group);
    this.fallY = 0;
    this.fallV = 0;
    this.falling = false;
  }

  // 保证 [lo, hi] 里的岛都有、更远的都拆掉。没建完的岛每帧最多建 budget 步
  ensure(game, cur, lo, hi, budget) {
    const course = game.course;
    for (let i = Math.max(0, lo); i <= hi; i++) {
      if (!this.nodes.has(i)) {
        const v = new NodeView(course.node(i));
        this.nodes.set(i, v);
        this.scene.add(v.group);
      }
    }
    for (const [i, v] of this.nodes) {
      if (i < lo || i > hi) { v.dispose(); this.nodes.delete(i); this.tilt.delete(i); this.stretch.delete(i); }
    }
    const pending = [...this.nodes.values()].filter((v) => !v.done).sort((a, b) => Math.abs(a.node.i - cur) - Math.abs(b.node.i - cur));
    for (let k = 0; k < budget && k < pending.length; k++) pending[k].step();
    return pending.length;
  }

  // 一局重新开始：把岛全拆了重来
  clear() {
    for (const v of this.nodes.values()) v.dispose();
    this.nodes.clear();
    this.tilt.clear();
    this.stretch.clear();
    this.rabbit.group.visible = true;
    this.falling = false;
  }

  // 落在某个秋千上：绳子被拽长一下
  tug(i) {
    const s = this.stretch.get(i) || { x: 0, v: 0 };
    s.v += 0.55;
    this.stretch.set(i, s);
  }

  step(game, dt, t, budget) {
    const b = game.bun, cur = b.node;
    this.ensure(game, cur, cur - 2, cur + 9, budget);

    // ---------- 秋千 ----------
    const broken = new Set(game.broken);
    for (const [i, v] of this.nodes) {
      const w = v.node.swing;
      let target = 0;
      if (i === cur && b.state === 'ride') target = clamp(b.off / w.halfW, -1, 1) * 0.15;
      else if (i === cur && b.state === 'slip') target = Math.sign(b.off || 1) * (0.25 + 0.75 * smooth01(b.st / 0.5));
      const prev = this.tilt.get(i) || 0;
      this.tilt.set(i, prev + (target - prev) * Math.min(1, dt * 14));
      const s = this.stretch.get(i) || { x: 0, v: 0 };
      s.v += (-520 * s.x - 13 * s.v) * dt;
      s.x = Math.max(0, s.x + s.v * dt);
      this.stretch.set(i, s);
      if (game.crackT >= 0 && i === cur && game.crackT > CRACK_HOLD - 0.9) v.swing.shake = 0.08;    // 快断了：木板抖
      v.swing.update(game.swingAngle(i, t), this.tilt.get(i), s.x, dt);
      if (broken.has(i)) v.swing.break();
    }

    // ---------- 兔子 ----------
    let st;
    if (game.mode === 'title') {
      st = { x: b.x, y: b.y, state: 'ride', st: 0, charge: null, vx: 0, vy: 0, tilt: 0 };
    } else if (game.mode === 'over' && b.state === 'fall') {
      if (!this.falling) { this.falling = true; this.fallY = b.y; this.fallV = Math.min(b.vy, 0); }
      this.fallV -= 22 * dt;
      this.fallY += this.fallV * dt;
      st = { x: b.x, y: this.fallY, state: 'fall', st: b.st, vx: b.vx, vy: this.fallV };
      if (this.fallY < CLOUD_Y - 2.6) this.rabbit.group.visible = false;
    } else {
      st = { x: b.x, y: b.y, state: b.state, st: b.st, charge: game.charge < 0 ? null : clamp(game.charge / T_CHARGE, 0, 1), vx: b.vx, vy: b.vy, c: b.c, off: b.off };
      if (b.state === 'ride') st.tilt = this.tilt.get(cur) || 0;
      if (b.state === 'air' && b.c >= 0.7) {                       // 蓄力足的那一跳在空中翻一个跟头
        const vy0 = launch(b.c).vy;
        st.flip = clamp((vy0 - b.vy) / (2 * vy0), 0, 1);
      }
    }
    this.rabbit.update(st, dt, t);
  }
}
