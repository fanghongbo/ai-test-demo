// 一局的规则：兔子站在秋千上，按住蓄力、松开起跳，落到下一个秋千上；踩空掉进云海，或者被后面的风暴狼追上，就结束。
// 这里只有规则和数字，不碰画面：画面那边每一帧来读状态。时间由外面按固定步长推进，所以同一串输入的结果每次一样。
import { makeCourse, CLOUD_Y } from './course.js';
import { G, launch, T_CHARGE, FOOT, PERFECT, clamp } from './physics.js';

const SETTLE = 4.5;        // 落上去以后秋千多快停下来（阻尼）
const SETTLE_W = 6.0;      // 停下来之前晃的那两下的角频率
const SLIP_TIME = 0.55;    // 踩到边上以后滑下去用多久
export const CRACK_HOLD = 2.6;   // 裂了缝的秋千撑多久
const WOLF_START = 30;     // 风暴狼一开始落在后面多远
const WOLF_REACH = 1.0;    // 狼离兔子多近算追上

export const REASONS = {
  fall: '掉进云海了',
  slip: '没踩稳，滑下去了',
  cracked: '秋千断了',
  caught: '被风暴狼追上了',
};

export class Game {
  constructor({ seed = 1 } = {}) {
    this.best = 0;
    this.reset(seed);
  }

  reset(seed = (Math.random() * 4294967296) >>> 0) {
    this.seed = seed >>> 0;
    this.course = makeCourse(this.seed);
    this.mode = 'title';          // title：标题画面；play：玩着；over：结束了
    this.t = 0;
    this.overT = 0;
    this.bun = {
      x: 0, y: 0, vx: 0, vy: 0, node: 0, off: 0, state: 'ride', st: 0, from: 0, c: 0,
      launchX: 0, launchY: 0, off0: 0, fallReason: 'fall', cloud: false,
    };
    this.charge = -1;             // 蓄力已经按了多久；小于 0 表示没在按
    this.score = 0;
    this.combo = 0;
    this.stats = { jumps: 0, perfects: 0, maxCombo: 0, maxNode: 0 };
    this.wolf = { x: 0, v: 0, active: false };
    this.mem = [];                // 每个秋千现在的状态（风吹 / 有人站着 / 刚被蹬了一脚）
    this.events = [];
    this.over = null;
    this.crackT = -1;             // 站在裂了的秋千上已经多久；小于 0 表示没站在上面
    this.broken = [];             // 已经断掉的秋千
    this.attach(0, 0, 'ride');
    this.wolf.x = this.bun.x - WOLF_START;
  }

  // 从标题画面开始玩
  start() {
    if (this.mode === 'title') this.mode = 'play';
  }

  // 再来一局：换一副新的路
  retry(seed) {
    this.reset(seed);
    this.mode = 'play';
  }

  // ---------- 秋千 ----------

  // 秋千此刻的角度（弧度，往前为正）。没人站的时候随风摆；站上去以后带着惯性晃两下就停；跳走时被蹬一脚
  swingAngle(i, t = this.t) {
    const w = this.course.node(i).swing, m = this.mem[i];
    const wind = w.amp * Math.sin(w.omega * t + w.phase);
    if (!m || m.mode === 'wind') return wind;
    const dt = t - m.t0;
    if (m.mode === 'ride') return Math.exp(-SETTLE * dt) * (m.th0 * Math.cos(SETTLE_W * dt) + ((m.w0 + SETTLE * m.th0) / SETTLE_W) * Math.sin(SETTLE_W * dt));
    return wind * clamp(dt / 1.4, 0, 1) + m.kick * Math.exp(-dt / 1.5) * Math.sin(w.omega * dt) + m.th0 * Math.exp(-3 * dt);
  }

  // 座板中心（水平位置、高度）和角度
  seat(i, t = this.t) {
    const w = this.course.node(i).swing, th = this.swingAngle(i, t);
    return { x: w.tipX + w.L * Math.sin(th), y: w.tipY - w.L * Math.cos(th), th };
  }

  // 座板的面（兔子的脚站的地方）
  seatTop(i, t = this.t) {
    return this.seat(i, t).y + 0.045;
  }

  attach(i, off, state) {
    const b = this.bun;
    const th = this.swingAngle(i), dt = 1 / 240;
    this.mem[i] = { mode: 'ride', t0: this.t, th0: th, w0: (this.swingAngle(i, this.t + dt) - this.swingAngle(i, this.t - dt)) / (2 * dt), kick: 0 };
    b.node = i; b.off = off; b.off0 = off; b.state = state; b.st = 0;
    const s = this.seat(i);
    b.x = s.x + off * Math.cos(s.th); b.y = this.seatTop(i);
    b.vx = 0; b.vy = 0;
    if (state !== 'ride') this.charge = -1;
  }

  // 站在第 i 个秋千上、离座板中心偏 off 的时候，脚底在哪儿
  foot(i, off, t = this.t) {
    const s = this.seat(i, t);
    return { x: s.x + off * Math.cos(s.th), y: s.y + 0.045 };
  }

  // ---------- 输入 ----------

  press() {
    const b = this.bun;
    if (this.mode !== 'play' || b.state !== 'ride' || this.charge >= 0) return false;
    this.charge = 0;
    this.events.push({ type: 'press' });
    return true;
  }

  release() {
    if (this.charge < 0) return false;
    const b = this.bun, held = this.charge;
    this.charge = -1;
    if (this.mode !== 'play' || b.state !== 'ride') return false;
    const c = clamp(held / T_CHARGE, 0, 1), v = launch(c);
    const s = this.seat(b.node);
    b.launchX = b.x; b.launchY = b.y;
    b.vx = v.vx; b.vy = v.vy; b.from = b.node; b.c = c; b.state = 'air'; b.st = 0; b.cloud = false;
    this.stats.jumps += 1;
    // 蹬出去的反作用力：秋千往后甩一大下，再慢慢回到风吹的摆动
    const m = this.mem[b.node], w = this.course.node(b.node).swing;
    m.mode = 'kick'; m.t0 = this.t; m.th0 = s.th; m.kick = -(0.5 + 1.5 * c) / w.omega;
    this.events.push({ type: 'jump', c, x: b.x, y: b.y, i: b.node });
    return true;
  }

  // ---------- 推进 ----------

  step(dt) {
    const b = this.bun;
    this.t += dt;
    if (this.mode === 'over') {             // 结束以后狼滑一段停下，云和秋千照常动
      this.overT += dt;
      this.wolf.v *= Math.exp(-dt * 3);
      this.wolf.x += this.wolf.v * dt;
      return;
    }
    if (this.mode !== 'play') return;

    if (this.charge >= 0 && b.state === 'ride') this.charge = Math.min(this.charge + dt, T_CHARGE);

    if (b.state === 'ride') {
      b.st += dt;
      const s = this.seat(b.node);
      b.x = s.x + b.off * Math.cos(s.th);
      b.y = this.seatTop(b.node);
      if (this.crackT >= 0) {
        this.crackT += dt;
        if (this.crackT > CRACK_HOLD) this.breakSwing();
      }
    } else if (b.state === 'slip') {
      b.st += dt;
      const k = clamp(b.st / SLIP_TIME, 0, 1), s = this.seat(b.node);
      b.off = b.off0 + Math.sign(b.off0) * 0.5 * k * k;
      b.x = s.x + b.off;
      b.y = this.seatTop(b.node) - 0.5 * k * k * k;
      if (b.st >= SLIP_TIME) {
        b.state = 'fall'; b.st = 0; b.vx = Math.sign(b.off0) * 0.9; b.vy = -0.4; b.fallReason = 'slip';
        this.freeSwing(b.node);
        this.events.push({ type: 'fall', reason: 'slip', x: b.x, y: b.y });
      }
    } else if (b.state === 'air') {
      this.stepAir(dt);
    } else if (b.state === 'fall') {
      b.st += dt;
      b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      if (!b.cloud && b.y < CLOUD_Y + 0.2) { b.cloud = true; this.events.push({ type: 'cloud', x: b.x, y: CLOUD_Y }); }
      if (b.y < CLOUD_Y - 1.8) this.gameOver(b.fallReason);
    }
    if (this.mode !== 'play') return;
    this.stepWolf(dt);
  }

  stepAir(dt) {
    const b = this.bun, px = b.x, py = b.y;
    b.st += dt;
    b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.vy < 0) {
      // 下落的时候穿过某个座板的面：看落点离座板中心多远（只看下一个和下下个）
      for (let j = b.from + 1; j <= b.from + 2; j++) {
        const y0 = this.seatTop(j, this.t - dt), y1 = this.seatTop(j, this.t);
        if (py >= y0 && b.y < y1) {
          const k = (py - y0) / (py - y0 - (b.y - y1));
          if (k >= -0.2 && k <= 1.2) {
            const xc = px + (b.x - px) * k, tc = this.t - dt + dt * k;
            const d = xc - this.seat(j, tc).x;
            if (Math.abs(d) <= this.course.node(j).swing.halfW + FOOT) { this.land(j, d); return; }
          }
        }
      }
    }
    if (!b.cloud && b.y < CLOUD_Y + 0.2) { b.cloud = true; this.events.push({ type: 'cloud', x: b.x, y: CLOUD_Y }); }
    if (b.y < CLOUD_Y - 1.8) { b.state = 'fall'; b.fallReason = 'fall'; this.gameOver('fall'); }   // 一直是“在空中”的状态掉到底的：也记成往下掉
  }

  land(j, d) {
    const b = this.bun, n = this.course.node(j), half = n.swing.halfW, ax = Math.abs(d);
    if (ax > half - 0.12) {                   // 踩在边上：站不稳
      this.attach(j, d, 'slip');
      this.events.push({ type: 'slip', i: j, x: b.x, y: b.y });
      return;
    }
    const perfect = ax <= PERFECT, skip = j - b.from - 1;
    let pts = 1 + skip * 2, label = skip ? '越级' : '';
    if (perfect) {
      this.combo += 1;
      pts += Math.min(32, 2 * 2 ** (this.combo - 1));
      this.stats.perfects += 1;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
      label = skip ? '越级·完美' : '完美';
    } else {
      this.combo = 0;
    }
    if (n.swing.kind === 'gold') { pts += 5; label = label ? `${label}·金币` : '金币'; }
    this.score += pts;
    this.stats.maxNode = Math.max(this.stats.maxNode, j);
    this.attach(j, d, 'ride');
    this.crackT = n.swing.kind === 'cracked' ? 0 : -1;
    if (n.swing.kind === 'cracked') this.events.push({ type: 'crackWarn', i: j });
    this.events.push({ type: 'land', i: j, perfect, skip, pts, label, combo: this.combo, kind: n.swing.kind, x: b.x, y: b.y, c: b.c });
  }

  breakSwing() {
    const b = this.bun;
    this.broken.push(b.node);
    this.crackT = -1;
    this.charge = -1;
    b.state = 'fall'; b.st = 0; b.vx = 0.3; b.vy = -0.6; b.fallReason = 'cracked';
    this.freeSwing(b.node);
    this.events.push({ type: 'break', i: b.node, x: b.x, y: b.y });
  }

  // 兔子离开某个秋千（掉下去了）：让秋千接着晃
  freeSwing(i) {
    const m = this.mem[i], w = this.course.node(i).swing;
    if (!m) return;
    m.mode = 'kick'; m.t0 = this.t; m.th0 = this.swingAngle(i); m.kick = 0.6 / w.omega;
  }

  stepWolf(dt) {
    const b = this.bun, w = this.wolf;
    if (!w.active) {
      if (b.node >= 2 && b.state === 'ride') {       // 荡过两个秋千以后，狼从后面追上来
        w.active = true; w.x = b.x - WOLF_START;
        this.events.push({ type: 'wolf' });
      }
      return;
    }
    let v = Math.min(2.9, 1.35 + 0.045 * b.node);
    const d = b.x - w.x;
    if (d > 34) v *= 2.4;                            // 落后太多就猛追
    else if (d < 3) v *= 0.85;                       // 快追上时稍微慢一点，留一线
    w.v = v; w.x += v * dt;
    if (b.state !== 'fall' && w.x >= b.x - WOLF_REACH) {
      b.state = 'caught'; b.st = 0;
      this.events.push({ type: 'caught', x: b.x, y: b.y });
      this.gameOver('caught');
    }
  }

  gameOver(reason) {
    if (this.mode === 'over') return;
    this.mode = 'over';
    this.overT = 0;
    this.charge = -1;
    const record = this.score > this.best;
    if (record) this.best = this.score;
    this.over = { reason, text: REASONS[reason], score: this.score, best: this.best, record, ...this.stats };
    this.events.push({ type: 'over', reason, score: this.score, record });
  }

  // 画面和声音把事件取走（每个事件只发一次）
  drain() {
    const e = this.events;
    this.events = [];
    return e;
  }

  // 按住的时候从脚下画一条点状的抛物线，给“落点辅助”用
  arc(c, n = 26, dt = 0.06) {
    const b = this.bun, v = launch(c), out = [];
    for (let k = 0; k <= n; k++) {
      const x = b.x + v.vx * dt * k, y = b.y + v.vy * dt * k - 0.5 * G * (dt * k) ** 2;
      out.push([x, y]);
      if (y < CLOUD_Y) break;
    }
    return out;
  }

  state() {
    const b = this.bun;
    return {
      mode: this.mode, t: +this.t.toFixed(3), score: this.score, combo: this.combo, best: this.best,
      node: b.node, state: b.state, x: +b.x.toFixed(3), y: +b.y.toFixed(3),
      charge: this.charge < 0 ? null : +clamp(this.charge / T_CHARGE, 0, 1).toFixed(3),
      wolf: this.wolf.active ? +(b.x - this.wolf.x).toFixed(2) : null,
      crack: this.crackT < 0 ? null : +this.crackT.toFixed(2), over: this.over,
    };
  }
}
