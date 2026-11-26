// 一场比赛：发车、计时、圈数、名次、技巧统计、完美起步、救援、逆行提醒、电脑车手的橡皮筋。
// 只做逻辑，不碰画面和声音——发生的事都推进 race.events，由外面（主循环）去做特效、音效、HUD。
import { createCarState, stepCar, collideCars, resetCar } from '../core/carphys.js';
import { pointAt } from '../core/trackdef.js';
import { createAiDriver, aiThink } from './ai.js';
import { createItems } from './items.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const ORDINAL = ['第 1 名', '第 2 名', '第 3 名', '第 4 名', '第 5 名', '第 6 名'];

/**
 * @param {object} T createTrack()
 * @param {object} RL buildRacingLine()
 * @param {object} cfg { laps, mode: 'speed' | 'item', player: 车的数据, rivals: [{ def, skill, name }] }
 */
export function createRace(T, RL, cfg) {
  const L = T.L, N = T.N, EV = [];
  const R = { T, RL, laps: cfg.laps, mode: cfg.mode === 'item' ? 'item' : 'speed', cars: [], player: null, state: 'grid', goT: 0, raceT: 0, events: EV, order: [], bestLap: Infinity, pressT: -1, introT: 0 };
  const items = createItems(T, RL);
  R.items = items;
  const slot = (k) => { const i = (N - Math.round((11 + 7 * (k >> 1)) / T.ds)) % N, p = pointAt(T, i, k % 2 ? 3.1 : -3.1); return { x: p[0], z: p[1], psi: T.th[i] }; };
  const addCar = (def, k, isPlayer, ai, name) => {
    const g = slot(k), S = createCarState(def, g.x, g.z, g.psi, T);
    const c = {
      S, def, name, isPlayer, grid: k, ai: ai ? createAiDriver(ai.skill, name) : null, baseSkill: ai ? ai.skill : 1, cm: null,
      prog: S.s - L, prevS: S.s, lap: 0, lapT0: 0, laps: [], finished: false, finishT: 0, rank: k + 1, resetT: 0, wrongT: 0, acc: 0, prevV: 0,
      stats: { top: 0, drifts: 0, mini: 0, dbl: 0, wcw: 0, cut: 0, swing: 0, side: 0, nitro: 0, gas: 0, hits: 0, perfect: 0, resets: 0, items: 0, itemHits: 0, spun: 0, blocks: 0 },
    };
    R.cars.push(c);
    return c;
  };
  // 发车格：两车一排，玩家排在中后段，电脑车手填其余位置
  const rivals = cfg.rivals || [], n = rivals.length + 1, playerSlot = n > 1 ? Math.min(n - 1, 1 + (n >> 1)) : 0;
  rivals.forEach((r, j) => addCar(r.def, j + (j >= playerSlot ? 1 : 0), false, r, r.name));
  R.player = addCar(cfg.player, playerSlot, true, null, '你');
  R.cars.sort((a, b) => a.grid - b.grid);

  const rubber = (c) => {                                                           // 橡皮筋：离玩家太远就慢一点 / 快一点，别把人甩没影
    if (cfg.noRubber || R.player === c || R.state === "grid" || c.finished) return c.baseSkill;
    const gap = R.player.prog - c.prog;
    return c.baseSkill * (1 + clamp(gap / 2600, -0.07, 0.1));
  };

  /** 发车倒计时 */
  R.start = () => { R.state = 'countdown'; R.goT = 3.3; R.pressT = -1; EV.push({ type: 'countdown' }); };
  /** 回到发车格（再来一局） */
  R.restart = () => {
    for (const c of R.cars) {
      const g = slot(c.grid), S = c.S;
      Object.assign(S, createCarState(c.def, g.x, g.z, g.psi, T));
      Object.assign(c, { prog: S.s - L, prevS: S.s, lap: 0, lapT0: 0, laps: [], finished: false, finishT: 0, resetT: 0, wrongT: 0, acc: 0, prevV: 0 });
      c.stats = { top: 0, drifts: 0, mini: 0, dbl: 0, wcw: 0, cut: 0, swing: 0, side: 0, nitro: 0, gas: 0, hits: 0, perfect: 0, resets: 0, items: 0, itemHits: 0, spun: 0, blocks: 0 };
      if (c.ai) c.ai = createAiDriver(c.baseSkill, c.name);
    }
    if (items.on) items.enable(true, R);
    Object.assign(R, { state: 'grid', goT: 0, raceT: 0, order: [], bestLap: Infinity, pressT: -1, introT: 0 });
    R.rank();
  };

  /**
   * 推进一步。pin：createInput()。倒计时和发车格里不动车。
   * @returns {object[]} 这一帧发生的事（每帧开头的数组，看 finishT 之类要用就现在拷走）
   */
  R.step = (dt, pin) => {
    EV.length = 0;
    if (R.state === 'grid') return EV;
    if (R.state === 'countdown') {
      R.goT -= dt;
      if (pin && pin.pressed('up')) R.pressT = R.goT;                               // 记下离“GO”还有多久按的油门
      if (R.goT <= 0) {
        R.state = 'race'; R.raceT = 0;
        for (const c of R.cars) c.lapT0 = 0;
        if (R.pressT >= -0.02 && R.pressT <= 0.45) {                                  // 完美起步：GO 之前 0.45 秒内按下油门
          R.player.S.miniT = 1.1; R.player.stats.perfect++;
          EV.push({ type: 'perfectStart', car: R.player });
        }
        EV.push({ type: 'go' });
      }
      return EV;
    }
    R.raceT += dt;
    const n0 = EV.length;
    const input = pin ? pin.drive() : null, others = R.cars.map((c) => c.S);            // 电脑车手避让时看的是别的车的“状态”
    for (const c of R.cars) {
      const S = c.S;
      let inp;
      if (c.resetT > 0) { c.resetT -= dt; inp = NO_INPUT; }                           // 救援之后有一下子不能动
      else if (c.isPlayer) {
        if (pin && pin.pressed('reset') && !c.finished) {                                     // R：回到赛道上
          resetCar(S, T); c.resetT = 0.9; c.stats.resets++;
          EV.push({ type: 'rescue', car: c });
        }
        if (items.on && pin && !c.finished) {                                                  // 道具赛：Ctrl 用道具，Alt 在两个格子间切换
          if (pin.pressed('item')) c.slot = items.swap(c);
          if (pin.pressed('nitro')) items.use(c, R, EV);
        }
        inp = c.finished ? AI_INPUT(c, T, RL, dt) : input || NO_INPUT;                      // 冲线之后交给电脑兜一圈
      } else inp = AI_INPUT(c, T, RL, dt, rubber(c), others);
      if (items.on) { if (!c.isPlayer && !c.finished) items.aiThink(c, R, dt, EV); if (S.itemMode) inp = { ...inp, nitro: false }; }
      if (!c.isPlayer && inp.reset) { resetCar(S, T); c.stats.resets++; EV.push({ type: 'rescue', car: c }); inp = NO_INPUT; }
      const len = EV.length;
      stepCar(S, inp, T, dt, EV);
      for (let q = len; q < EV.length; q++) EV[q].car = c;
      // 沿程进度：把“过线时的里程跳变”接上，得到一条连续的里程
      let ds = S.s - c.prevS;
      if (ds < -L / 2) ds += L; else if (ds > L / 2) ds -= L;
      c.prevS = S.s;
      c.prog += ds;
      const lapNow = Math.floor(c.prog / L) + 1;
      if (lapNow > c.lap && c.prog > 0) {                                             // 压线：跑完一圈
        if (c.lap > 0) {                                                             // 第一圈从 GO 开始计，之后每圈从压线开始计
          const t = R.raceT - c.lapT0, best = t < R.bestLap - 1e-6;
          c.laps.push(t);
          R.bestLap = Math.min(R.bestLap, t);
          EV.push({ type: 'lap', car: c, lap: lapNow - 1, time: t, best });
          c.lapT0 = R.raceT;
        }
        c.lap = lapNow;
        if (c.prog >= R.laps * L && !c.finished) {                                     // 跑完全部圈数
          c.finished = true; c.finishT = R.raceT; R.order.push(c);
          EV.push({ type: 'finish', car: c, rank: R.order.length });
          if (c.isPlayer && R.state === 'race') { R.state = 'finish'; EV.push({ type: 'playerFinish', car: c, rank: R.order.length }); }
        }
      } else if (lapNow < c.lap && !c.finished) c.lap = Math.max(0, lapNow);           // 倒车退回线后
      // 逆行：速度和赛道方向相反
      const th = T.th[S.i], along = S.vx * Math.cos(th) + S.vz * Math.sin(th);
      c.wrongT = along < -3 ? c.wrongT + dt : 0;
      const v = Math.hypot(S.vx, S.vz);
      c.acc += (((v - c.prevV) / dt) - c.acc) * Math.min(1, dt * 7);
      c.prevV = v;
      if (c.isPlayer) c.stats.top = Math.max(c.stats.top, v * 3.6);
    }
    for (let a = 0; a < R.cars.length; a++) for (let b = a + 1; b < R.cars.length; b++) {
      const len = EV.length;
      if (collideCars(R.cars[a].S, R.cars[b].S, EV)) for (let q = len; q < EV.length; q++) { EV[q].car = EV[q].a === R.cars[a].S ? R.cars[a] : R.cars[b]; EV[q].other = EV[q].car === R.cars[a] ? R.cars[b] : R.cars[a]; }
    }
    R.rank();
    items.update(dt, R, EV);
    for (let q = n0; q < EV.length; q++) if (EV[q].car && !EV[q].t) { EV[q].t = 1; tally(EV[q].car, EV[q]); }   // 统计放最后：道具的事也是这一步里发生的
    return EV;
  };

  /** 名次：冲线的按冲线顺序，其余按沿程进度 */
  R.rank = () => {
    const done = R.order;
    const rest = R.cars.filter((c) => !c.finished).sort((a, b) => b.prog - a.prog);
    [...done, ...rest].forEach((c, j) => { c.rank = j + 1; });
  };
  /** 玩家是否在逆行（用来在 HUD 上提醒） */
  R.wrongWay = () => R.player && R.player.wrongT > 1.2 && !R.player.finished;
  if (R.mode === 'item') items.enable(true, R);
  return R;
}

const NO_INPUT = { up: false, down: false, left: false, right: false, drift: false, nitro: false };
function AI_INPUT(c, T, RL, dt, skill = c.baseSkill, others = []) {
  if (!c.ai) c.ai = createAiDriver(skill, c.name);
  const think = c.ai;
  think.skill = skill;
  return aiThink(think, c.S, T, RL, dt, others);
}

/** 技巧计数 */
function tally(c, e) {
  const s = c.stats;
  switch (e.type) {
    case 'drift': s.drifts++; break;
    case 'swing': s.drifts++; s.swing++; break;
    case 'driftEnd': if (e.side) s.side++; break;
    case 'mini': s.mini++; break;
    case 'double': s.dbl++; break;
    case 'cutDouble': s.dbl++; s.cut++; break;
    case 'wcw': s.wcw++; break;
    case 'nitro': s.nitro++; break;
    case 'gasFull': s.gas++; break;
    case 'hit': s.hits++; break;
    case 'itemUse': s.items++; break;
    case 'missileHit': case 'bombHit': case 'bananaHit': s.spun++; if (e.by && e.by.stats) e.by.stats.itemHits++; break;
    case 'blocked': s.blocks++; break;
    default: break;
  }
}
