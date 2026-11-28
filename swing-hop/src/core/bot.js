// 自动玩的“机器人”：算出过多久按、按多久，能落在下一个秋千上。单元测试和自动化检查用它把一局真的玩下去。
import { launch, airTime, T_CHARGE, clamp } from './physics.js';

// 返回 { pressIn, hold, err }：过 pressIn 秒按下，按住 hold 秒再松开。aim：故意偏离座板中心多少米；target：跳到后面第几个
export function planJump(game, { aim = 0, target = 1 } = {}) {
  const b = game.bun;
  if (b.state !== 'ride' || game.mode !== 'play') return null;
  const j = b.node + target;
  game.course.ensure(j + 1);
  const period = (Math.PI * 2) / game.course.node(j).swing.omega, now = game.t;
  const finish = (tr, c, err) => ({ at: tr, pressIn: Math.max(0, tr - c * T_CHARGE - now), hold: c * T_CHARGE, err, c });
  let best = null;
  for (let k = 0; k <= 72; k++) {
    const tr = now + (period * k) / 72;                 // 在目标秋千的一个摆动周期里挨个试松开的时刻
    const cMax = clamp((tr - now) / T_CHARGE, 0, 1);    // 到那一刻最多来得及蓄多少力
    if (cMax < 0.02) continue;
    const err = (c) => {
      const p0 = game.foot(b.node, b.off, tr);
      let tl = tr;
      for (let it = 0; it < 3; it++) tl = tr + airTime(c, p0.y - game.seatTop(j, tl));   // 落地时座板的高度跟着晃，多修两次
      const x = p0.x + launch(c).vx * (tl - tr);
      return x - (game.seat(j, tl).x + aim);
    };
    // 力气太小、够不到那么高的秋千时抛物线够不着座板，err 是 NaN：按“还没到”处理
    const eOf = (c) => { const v = err(c); return Number.isNaN(v) ? -1e9 : v; };
    let lo = 0, hi = cMax, e0 = eOf(lo), e1 = eOf(hi), c;
    if (e0 * e1 <= 0) {
      for (let it = 0; it < 20; it++) {                 // 落点随蓄力单调变远，二分找正中
        c = (lo + hi) / 2;
        const e = eOf(c);
        if (e * e0 <= 0) { hi = c; e1 = e; } else { lo = c; e0 = e; }
      }
      c = (lo + hi) / 2;
    } else {
      c = Math.abs(e0) < Math.abs(e1) ? lo : hi;
    }
    const e = Math.abs(eOf(c)), got = finish(tr, c, e);
    if (!Number.isFinite(e)) continue;
    if (e < 0.012) return got;
    if (!best || e < best.err) best = got;
  }
  return best;
}

// 让机器人替玩家把这局玩下去：推进 dt，直到跳满 jumps 次或者这局结束。返回 { jumps, plan }（plan：最后一次的计划）
export function autoplay(game, { jumps = 10, dt = 1 / 240, aim = 0, target = 1, think = 0, rnd = Math.random } = {}) {
  // think：每次落下来先看多久再起跳（模拟人犹豫的时间）；rnd：给 aim 传函数时用它取随机数
  let plan = null, done = 0, wait = -1;
  while (done < jumps && game.mode === 'play') {
    const b = game.bun;
    if (b.state === 'ride' && !plan && game.charge < 0) {
      if (wait < 0) wait = typeof think === 'function' ? think(rnd) : think;
      if (wait > dt) wait -= dt;
      else { wait = -1; plan = planJump(game, { aim: typeof aim === 'function' ? aim(rnd) : aim, target }); plan.at = game.t + plan.pressIn + plan.hold; }
    }
    if (plan) {
      // 按这一步的中点判断时刻，误差不超过半步
      const mid = game.t + dt / 2;
      if (!plan.pressed && mid >= plan.at - plan.hold) { game.press(); plan.pressed = true; }
      if (plan.pressed && mid >= plan.at) { game.release(); plan = null; done += 1; }
    }
    game.step(dt);
  }
  let settle = 0;                                        // 最后一跳松开手以后，等它落下来（或者掉下去）再交还
  while (game.bun.state === 'air' && game.mode === 'play' && settle++ < 120 * 6) game.step(dt);
  return { jumps: done, plan };
}
