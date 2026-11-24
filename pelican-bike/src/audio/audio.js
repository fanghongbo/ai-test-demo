// WebAudio 引擎门面：解锁、总线、连续层、音效、生成式音乐。所有声音实时合成，零外部资源。
// 用法：必须在用户手势里调用 unlock()；之后每帧 update(state, dt, env)。
import { createTempo, createSequencer, createScheduler, tempoTarget, EV, SCALE } from './schedule.js';
import { ksBuffer, ksRate, noiseBuffer } from './dsp.js';
import * as synth from './synth.js';
import { clamp, clamp01 } from '../core/mathx.js';

const NOP = Object.freeze({});
const ENV0 = Object.freeze({});
const RPM = 60 / (Math.PI * 2);          // rad/s → rpm
const MUSIC_TICK_MS = 25, LOOKAHEAD = 0.12;

export function createAudio() {
  const AC = typeof globalThis !== 'undefined' ? (globalThis.AudioContext || globalThis.webkitAudioContext) : null;
  const A = { ctx: null, master: null, sfx: null, ride: null, amb: null, music: null, send: null, noise: null, beds: null, lead: null, timer: 0 };
  const st = { muted: false, volume: 0.8, musicOn: false, sparse: true, paramT: 1, gullIn: 5, buoyIn: 3, hour: 13 };
  const tempo = createTempo();
  const seq = createSequencer(11);
  const sched = createScheduler({ lookahead: LOOKAHEAD });
  const ev = new Float64Array(5 * 24);
  let leadFlip = false;

  const ready = () => !!A.ctx && A.ctx.state === 'running';

  function build(ctx) {
    A.ctx = ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.22;
    comp.connect(ctx.destination);
    A.master = ctx.createGain(); A.master.gain.value = 0; A.master.connect(comp);      // 从静音起步，避免上电爆音
    const bus = (v) => { const g = ctx.createGain(); g.gain.value = v; g.connect(A.master); return g; };
    A.sfx = bus(0.9); A.ride = bus(0.8); A.amb = bus(0.7); A.music = bus(0);
    A.send = synth.createSpace(ctx, A.master).input;
    A.noise = { white: mkBuffer(ctx, noiseBuffer(3, ctx.sampleRate, { color: 'white', seed: 3 })), pink: mkBuffer(ctx, noiseBuffer(4, ctx.sampleRate, { color: 'pink', seed: 5 })), brown: mkBuffer(ctx, noiseBuffer(4, ctx.sampleRate, { color: 'brown', seed: 7 })) };
    A.beds = synth.createBeds(ctx, A.ride, A.amb, A.noise);
    // 拨弦主奏：每个音高预渲染“亮 / 暗”两个变体
    const sr = ctx.sampleRate;
    A.lead = SCALE.map((m, i) => {
      const f = synth.mtof(m);
      return [0, 1].map((v) => {
        const data = ksBuffer(f, sr, 2.0, { t60: v ? 1.8 : 2.4, brightness: v ? 0.32 : 0.5, seed: 100 + i * 2 + v });
        return { buffer: mkBuffer(ctx, data), rate: ksRate(f, sr) };
      });
    });
  }
  const mkBuffer = (ctx, data) => { const b = ctx.createBuffer(1, data.length, ctx.sampleRate); b.copyToChannel(data, 0); return b; };

  function applyMaster() {
    if (!A.ctx) return;
    A.master.gain.setTargetAtTime(st.muted ? 0 : st.volume * 0.9, A.ctx.currentTime, 0.025);
  }

  // ———————————— 生成式音乐：前瞻调度 ————————————
  const emit = (step, time, stepDur) => {
    const ctx = A.ctx, n = seq.fill(step, time, stepDur, st.sparse, ev);
    for (let i = 0; i < n; i++) {
      const o = i * 5, type = ev[o], t = ev[o + 1], d = ev[o + 2], midi = ev[o + 3], vel = ev[o + 4];
      if (type === EV.LEAD) {
        let idx = 0; while (idx < SCALE.length - 1 && SCALE[idx] !== midi) idx++;
        leadFlip = !leadFlip;
        synth.lead(ctx, A.music, A.send, A.lead[idx][leadFlip ? 1 : 0], t, d, vel, leadFlip ? 0.25 : -0.25);
      } else if (type === EV.BASS) synth.bass(ctx, A.music, t, d, midi, vel);
      else if (type === EV.PAD) synth.pad(ctx, A.music, A.send, t, d, midi, vel);
      else synth.shaker(ctx, A.music, A.noise, t, vel);
    }
  };
  const skip = () => {};
  function tickMusic() {
    const ctx = A.ctx;
    if (!ctx || ctx.state !== 'running') return;        // 挂起时不累积，恢复后由调度器丢弃错过的步
    sched.bpm = tempo.bpm;
    sched.tick(ctx.currentTime, st.muted ? skip : emit);
  }
  function startMusic() {
    if (A.timer || !A.ctx) return;
    sched.reset(A.ctx.currentTime);
    A.music.gain.setTargetAtTime(0.85, A.ctx.currentTime, 0.25);
    A.timer = setInterval(tickMusic, MUSIC_TICK_MS);
    tickMusic();
  }
  function stopMusic() {
    if (A.timer) { clearInterval(A.timer); A.timer = 0; }
    if (A.ctx) A.music.gain.setTargetAtTime(0, A.ctx.currentTime, 0.15);
  }

  // ———————————— 对外接口 ————————————
  /** 每帧调用。O(1)、稳态零分配；静音时只推进速度表与计时器 */
  function update(state, dt, env) {
    const s = state || NOP, e = env || ENV0;
    const v = s.v || 0, d = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    // 踏频：优先用调用方给的；否则由实际曲柄角速度导出（滑行时为 0）
    const cadence = Number.isFinite(e.cadence) ? e.cadence : Math.abs(s.crankVel || 0) * RPM;
    st.sparse = !(v >= 0.05);
    tempo.set(tempoTarget(v, cadence));
    tempo.update(d);
    const hour = Number.isFinite(e.hour) ? e.hour : st.hour;
    st.hour = hour;
    if (!A.ctx || A.ctx.state !== 'running' || st.muted) return;
    const night = hour > 20 || hour < 5;
    st.paramT += d;
    if (st.paramT >= 1 / 30) {                          // 连续层参数 30 Hz 更新，全部走平滑逼近
      st.paramT = 0;
      const now = A.ctx.currentTime, B = A.beds, q = clamp01(v / 12.5), tc = 0.06;
      const w = clamp01(q * q * 0.9 + clamp01(e.wind || 0) * 0.5);
      B.rumbleGain.gain.setTargetAtTime(0.5 * q * q, now, tc);
      B.rumbleFlt.frequency.setTargetAtTime(110 + 190 * q, now, tc);
      B.windGain.gain.setTargetAtTime(0.34 * w, now, tc);
      B.windFlt.frequency.setTargetAtTime(520 + 900 * w, now, tc);
      const coast = s.mode === 'coast' && v > 0.1;
      B.tickOsc.frequency.setTargetAtTime(Math.max(0.5, clamp(v * 9, 0, 95) * 0.5), now, 0.02);
      B.tickGain.gain.setTargetAtTime(coast ? clamp(0.05 + v * 0.012, 0, 0.14) : 0, now, 0.03);
      const ped = s.mode === 'pedal' ? clamp01(s.pedalPower || 0) * (s.air ? 0 : 1) : 0;
      B.chainGain.gain.setTargetAtTime(0.07 * ped, now, tc);
      B.breathGain.gain.setTargetAtTime(0.05 * ped, now, 0.2);
      B.breathLfo.frequency.setTargetAtTime(Math.max(0.05, cadence / 60 * 0.5), now, 0.2);
      B.seaGain.gain.setTargetAtTime(night ? 0.035 : 0.055, now, 0.5);
    }
    // 环境一次性事件
    st.gullIn -= d; st.buoyIn -= d;
    if (st.gullIn <= 0) {
      st.gullIn = 9 + Math.random() * 14;
      if (!(hour > 21.5 || hour < 5.5)) synth.SFX.gull(A.ctx, A.amb, A.send, A.noise, A.ctx.currentTime + 0.02, Math.random() * 1.6 - 0.8);
    }
    if (night && st.buoyIn <= 0) { st.buoyIn = 5 + Math.random() * 4; synth.SFX.buoy(A.ctx, A.amb, A.send, A.noise, A.ctx.currentTime + 0.02); }
    else if (!night && st.buoyIn < 2) st.buoyIn = 2 + Math.random() * 3;
  }

  /** 一次性音效统一入口：未解锁 / 挂起 / 静音时不建节点 */
  function shot(name, arg) {
    if (!ready() || st.muted) return false;
    try { synth.SFX[name](A.ctx, A.sfx, A.send, A.noise, A.ctx.currentTime + 0.003, arg); return true; } catch (e) { return false; }
  }

  const audio = {
    get ready() { return ready(); },
    get muted() { return st.muted; },
    /** 必须在用户手势（点击/按键）里调用。幂等；无 WebAudio 时静默返回 false */
    unlock() {
      try {
        if (!A.ctx) {
          if (!AC) return false;
          build(new AC({ latencyHint: 'interactive' }));
        }
        if (A.ctx.state === 'suspended' || A.ctx.state === 'interrupted') A.ctx.resume().catch(() => {});
        applyMaster();
        if (st.musicOn) startMusic();
        return ready();
      } catch (e) {
        stopMusic();
        if (A.ctx) { try { A.ctx.close(); } catch (e2) { /* 上下文本就不可用 */ } }
        A.ctx = null;
        return false;
      }
    },
    setMuted(b) { st.muted = !!b; applyMaster(); },
    setVolume(v) { st.volume = clamp01(Number.isFinite(v) ? v : 0); applyMaster(); },
    setMusicEnabled(b) {
      const on = !!b;
      if (st.musicOn === on) return;
      st.musicOn = on;
      if (!A.ctx) return;
      if (on) startMusic(); else stopMusic();
    },
    sfx: {
      bell: () => shot('bell'), squawk: () => shot('squawk'), jump: () => shot('jump'),
      land: (impact) => shot('land', impact), splash: (strength) => shot('splash', strength), gulp: () => shot('gulp'),
      click: () => shot('click'), toggle: () => shot('toggle'), shift: () => shot('shift'),
    },
    update,
    getState() {
      const s = A.ctx ? A.ctx.state : 'none';
      return { ctx: s === 'running' ? 'running' : s === 'none' || s === 'closed' ? 'none' : 'suspended', bpm: tempo.bpm, muted: st.muted, music: st.musicOn, volume: st.volume };
    },
    dispose() {
      stopMusic();
      if (A.ctx) { try { A.ctx.close(); } catch (e) { /* 已关闭 */ } }
      A.ctx = A.master = A.sfx = A.ride = A.amb = A.music = A.send = A.noise = A.beds = A.lead = null;
    },
  };
  return audio;
}
