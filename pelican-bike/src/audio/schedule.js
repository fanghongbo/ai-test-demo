// 纯调度数学：速度平滑、和弦进行、旋律随机游走、前瞻调度器。零依赖，可在 Node 中直接测试。
import { clamp, mulberry32 } from '../core/mathx.js';

/** C 大调五声，两个八度（MIDI） */
export const SCALE = Object.freeze([60, 62, 64, 67, 69, 72, 74, 76, 79, 81]);
/** Am – F – C – G，每小节一个 */
export const PROGRESSION = Object.freeze([
  { name: 'Am', root: 45, tones: [57, 60, 64] },
  { name: 'F', root: 41, tones: [53, 57, 60] },
  { name: 'C', root: 48, tones: [55, 60, 64] },
  { name: 'G', root: 43, tones: [55, 59, 62] },
]);
export const STEPS_PER_BAR = 8;                                  // 八分音符
export const EV = Object.freeze({ LEAD: 0, BASS: 1, PAD: 2, SHAKER: 3 });

export const chordAt = (bar) => PROGRESSION[((bar % 4) + 4) % 4];
const pc = (m) => ((m % 12) + 12) % 12;
export const isChordTone = (chord, midi) => chord.tones.some((t) => pc(t) === pc(midi));
function nearestChordDegree(chord, degree) {
  for (let d = 1; d < SCALE.length; d++) {
    const up = degree + d, down = degree - d;
    if (up < SCALE.length && isChordTone(chord, SCALE[up])) return up;
    if (down >= 0 && isChordTone(chord, SCALE[down])) return down;
  }
  return degree;
}

/** 速度目标：停车 → 70；骑行 → 84 + 踏频×0.9，夹在 [84, 150] */
export function tempoTarget(v, cadence) {
  if (!(v >= 0.05)) return 70;
  return clamp(84 + Math.max(0, cadence || 0) * 0.9, 84, 150);
}

/** 一阶平滑的速度表 */
export function createTempo(o = {}) {
  const min = o.min ?? 70, max = o.max ?? 150, tau = o.tau ?? 1.6;
  const t = { bpm: clamp(o.init ?? 84, min, max), target: 84 };
  t.set = (target) => { t.target = clamp(target, min, max); return t.target; };
  t.update = (dt) => {
    t.bpm += (t.target - t.bpm) * (1 - Math.exp(-Math.max(0, dt) / tau));
    t.bpm = clamp(t.bpm, min, max);
    return t.bpm;
  };
  return t;
}

/**
 * 音序器：给定网格步，产出这一步的全部事件（写入扁平缓冲，不分配）。
 * 事件 = 5 个数：[类型, 时间, 时长, MIDI, 力度]。
 */
export function createSequencer(seed = 1) {
  const rng = mulberry32(seed >>> 0);
  const buf = new Float64Array(5 * 24);      // Float64：时间戳在长时间运行后仍保持采样级精度
  const s = { degree: 4, held: 0 };
  /** @returns {number} 事件数 */
  s.fill = (step, time, stepDur, sparse, out = buf) => {
    let n = 0;
    const put = (type, t, dur, midi, vel) => { const o = n * 5; out[o] = type; out[o + 1] = t; out[o + 2] = dur; out[o + 3] = midi; out[o + 4] = vel; n++; };
    const inBar = step % STEPS_PER_BAR, chord = chordAt((step / STEPS_PER_BAR) | 0);
    put(EV.SHAKER, time, stepDur * 0.5, 0, (inBar % 2 ? 0.45 : 0.8) * (sparse ? 0.35 : 1));
    if (inBar === 0) put(EV.BASS, time, stepDur * 3, chord.root, 0.9);
    if (inBar === 4) put(EV.BASS, time, stepDur * 1.8, rng() < 0.5 ? chord.root : chord.root + 7, 0.7);
    if (inBar === 6 && !sparse && rng() < 0.3) put(EV.BASS, time, stepDur * 0.9, chord.root + 12, 0.5);
    if (inBar === 0) for (let i = 0; i < 3; i++) put(EV.PAD, time, stepDur * STEPS_PER_BAR, chord.tones[i], 0.6);
    // 旋律：种子随机游走 + 休止；长音占两格
    if (s.held > 0) s.held--;
    else {
      const rest = sparse ? 0.6 : inBar % 2 === 1 ? 0.45 : 0.3;
      if (rng() >= rest) {
        const r = rng();
        let d = s.degree;
        if (r < 0.42) d += rng() < 0.5 ? -1 : 1;        // 级进
        else if (r < 0.62) d += rng() < 0.5 ? -2 : 2;    // 跳进
        else if (r < 0.7) d += rng() < 0.5 ? -4 : 4;     // 大跳
        s.degree = clamp(d, 0, SCALE.length - 1);
        let midi = SCALE[s.degree];
        if (inBar === 0 && !isChordTone(chord, midi)) midi = SCALE[nearestChordDegree(chord, s.degree)];   // 强拍落在和弦音上
        const long = !sparse && rng() < 0.22;
        put(EV.LEAD, time, stepDur * (long ? 2 : 1), midi, inBar === 0 ? 0.95 : 0.6 + rng() * 0.3);
        if (long) s.held = 1;
      }
    }
    return n;
  };
  return s;
}

const stepDurOf = (bpm) => 30 / clamp(bpm, 20, 400);              // 八分音符时长（秒）

/**
 * 前瞻调度器：每次 tick 把 [now, now+lookahead) 内的网格步交出去。
 * 时钟被节流（后台标签页）时直接丢弃错过的步 —— 绝不补发、绝不迟到。
 */
export function createScheduler(o = {}) {
  const lookahead = o.lookahead ?? 0.12;
  const s = { step: 0, next: NaN, bpm: o.bpm ?? 84, lookahead };
  s.reset = (now) => { s.step = 0; s.next = now + (o.startDelay ?? 0.06); };
  /** @returns {number} 本次发出的步数 */
  s.tick = (now, emit) => {
    if (!Number.isFinite(s.next)) s.reset(now);
    let skipped = 0;
    while (s.next < now && skipped++ < 100000) { s.next += stepDurOf(s.bpm); s.step++; }
    let n = 0;
    const horizon = now + lookahead;
    while (s.next < horizon && n < 256) { const d = stepDurOf(s.bpm); emit(s.step, s.next, d); s.next += d; s.step++; n++; }
    return n;
  };
  return s;
}
