// 全部音效由 WebAudio 实时合成：枪声、换弹、脚步、命中、弹着、手雷、环境（海、风、船体）、菜单音乐。
// 音色在开始时用 core/dsp.js 离线渲染成缓冲区，之后只是播放。世界里的声音带方位（HRTF）和距离衰减，越远越闷、越迟。
import * as D from '../core/dsp.js';

const SEC = (s, sr) => Math.round(s * sr);
const GUNS = {
  ak47:   { f0: 165, f1: 50, tBody: 0.10, fMid: 900, tMid: 0.05, qMid: 0.8, fCrack: 3200, tCrack: 0.013, fTail: 230, tTail: 0.30, drive: 1.7, len: 0.7, gain: 1.0 },
  m4a1:   { f0: 195, f1: 72, tBody: 0.075, fMid: 1300, tMid: 0.04, qMid: 0.9, fCrack: 4200, tCrack: 0.011, fTail: 300, tTail: 0.20, drive: 1.6, len: 0.55, gain: 0.9 },
  awm:    { f0: 110, f1: 36, tBody: 0.22, fMid: 620, tMid: 0.11, qMid: 0.7, fCrack: 2600, tCrack: 0.02, fTail: 160, tTail: 0.6, drive: 2.2, len: 1.5, gain: 1.15 },
  deagle: { f0: 140, f1: 55, tBody: 0.12, fMid: 1100, tMid: 0.055, qMid: 0.8, fCrack: 3800, tCrack: 0.014, fTail: 240, tTail: 0.32, drive: 1.9, len: 0.75, gain: 1.05 },
  usp:    { f0: 225, f1: 92, tBody: 0.06, fMid: 1650, tMid: 0.035, qMid: 1.0, fCrack: 5000, tCrack: 0.009, fTail: 320, tTail: 0.15, drive: 1.5, len: 0.45, gain: 0.75 },
};

export function createAudio() {
  const A = { ready: false, ctx: null, mode: 'off', voices: 0, lx: 0, ly: 1.6, lz: 0, vol: { master: 0.8, sfx: 1, music: 0.55 } };
  let ctx, master, comp, sfx, ui, mus, verbIn, amb, buf = {};

  /** 渲染一段单声道缓冲 */
  function render(seconds, fn, peak = 0.9) {
    const n = SEC(seconds, ctx.sampleRate), x = new Float32Array(n);
    fn(x, ctx.sampleRate);
    D.fadeOut(x, 0.004, ctx.sampleRate);
    if (peak) D.normalize(x, peak);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    b.getChannelData(0).set(x);
    return b;
  }
  const N = (n, seed) => D.noise(n, seed);

  function buildBuffers() {
    const sr = ctx.sampleRate;
    for (const [id, g] of Object.entries(GUNS)) buf['shot_' + id] = render(g.len, (x) => {
      const n = x.length, body = D.perc(D.sine(n, D.sweepF(g.f0, g.f1, 0.09), sr), 0.0015, g.tBody, sr);
      const mid = D.perc(D.biquad(N(n, 11), 'bp', g.fMid, sr, g.qMid), 0.0008, g.tMid, sr);
      const crack = D.perc(D.biquad(N(n, 12), 'hp', g.fCrack, sr, 0.7), 0.0004, g.tCrack, sr);
      const tail = D.perc(D.biquad(N(n, 13), 'lp', g.fTail, sr, 0.7), 0.01, g.tTail, sr);
      const snap = D.perc(N(n, 14), 0.0003, 0.004, sr);
      D.mix(x, body, 0.9); D.mix(x, mid, 0.75); D.mix(x, crack, 0.55); D.mix(x, tail, 0.55); D.mix(x, snap, 0.35);
      D.clip(x, g.drive);
    });
    buf.shot_far = render(0.7, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 21), 'lp', 520, sr, 0.7), 0.004, 0.2, sr), 0.9); D.mix(x, D.perc(D.sine(n, D.sweepF(95, 42, 0.1), sr), 0.004, 0.13, sr), 0.8); D.clip(x, 1.4); }, 0.8);
    const click = (f, tau, seed, len = 0.09) => render(len, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, seed), 'bp', f, sr, 2.2), 0.0003, tau, sr), 0.9); D.mix(x, D.perc(D.sine(n, f * 0.42, sr), 0.0004, tau * 0.8, sr), 0.5); });
    buf.dry = click(2600, 0.010, 31, 0.07);
    buf.mag_out = click(1500, 0.02, 32, 0.12);
    buf.mag_in = click(1100, 0.022, 33, 0.12);
    buf.bolt = render(0.26, (x) => { const n = x.length, a = D.perc(D.biquad(N(n, 34), 'bp', 2300, sr, 1.6), 0.001, 0.03, sr), b = D.perc(D.biquad(N(n, 35), 'bp', 1300, sr, 1.8), 0.001, 0.04, sr); D.mix(x, a, 0.7); D.mix(x, b, 0.9, SEC(0.11, sr)); }, 0.8);
    buf.slide = render(0.2, (x) => { const n = x.length, a = D.perc(D.biquad(N(n, 36), 'bp', 2800, sr, 1.4), 0.001, 0.025, sr), b = D.perc(D.biquad(N(n, 37), 'bp', 1700, sr, 1.6), 0.001, 0.03, sr); D.mix(x, a, 0.8); D.mix(x, b, 0.9, SEC(0.075, sr)); }, 0.8);
    buf.pin = click(3400, 0.012, 38, 0.08);
    for (let k = 0; k < 4; k++) buf['step' + k] = render(0.2, (x) => { const n = x.length, f = 760 + k * 130; D.mix(x, D.perc(D.biquad(N(n, 40 + k), 'bp', f, sr, 1.3), 0.001, 0.028, sr), 0.8); D.mix(x, D.perc(D.sine(n, 125 + k * 7, sr), 0.001, 0.035, sr), 0.5); D.mix(x, D.perc(D.biquad(N(n, 50 + k), 'bp', 3100 + k * 200, sr, 6), 0.0006, 0.014, sr), 0.35); }, 0.7);
    buf.land = render(0.3, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, D.sweepF(95, 48, 0.08), sr), 0.002, 0.09, sr), 0.9); D.mix(x, D.perc(D.biquad(N(n, 61), 'lp', 520, sr, 0.7), 0.002, 0.08, sr), 0.7); }, 0.8);
    buf.cloth = render(0.22, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(D.biquad(N(n, 62), 'hp', 1300, sr, 0.7), 'lp', 6200, sr, 0.7), 0.01, 0.05, sr), 1); }, 0.4);
    buf.swish = render(0.3, (x) => { const n = x.length; D.mix(x, D.perc(D.biquadSweep(N(n, 63), 'bp', 650, 2700, 0.16, sr, 1.2), 0.03, 0.07, sr), 1); }, 0.6);
    buf.knife_hit = render(0.25, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 64), 'lp', 520, sr, 0.7), 0.001, 0.05, sr), 0.9); D.mix(x, D.perc(D.sine(n, D.sweepF(190, 80, 0.06), sr), 0.001, 0.05, sr), 0.7); }, 0.85);
    buf.hitmarker = render(0.08, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, 2350, sr), 0.0005, 0.014, sr), 0.8); D.mix(x, D.perc(D.biquad(N(n, 65), 'bp', 4200, sr, 2), 0.0003, 0.006, sr), 0.6); }, 0.6);
    buf.headshot = render(0.5, (x) => { const n = x.length; for (const [f, g] of [[2093, 1], [3170, 0.55], [4400, 0.3], [1180, 0.25]]) D.mix(x, D.perc(D.sine(n, f, sr), 0.0006, 0.13, sr), g); D.mix(x, D.perc(D.biquad(N(n, 66), 'hp', 6000, sr, 0.7), 0.0003, 0.006, sr), 0.5); }, 0.75);
    buf.hurt = render(0.35, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, D.sweepF(84, 52, 0.12), sr), 0.002, 0.12, sr), 0.9); D.mix(x, D.perc(D.biquad(N(n, 67), 'lp', 320, sr, 0.7), 0.002, 0.1, sr), 0.8); }, 0.8);
    buf.heartbeat = render(0.7, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, 62, sr), 0.004, 0.08, sr), 0.9); D.mix(x, D.perc(D.sine(n, 56, sr), 0.004, 0.1, sr), 0.75, SEC(0.26, sr)); }, 0.85);
    buf.ricochet = render(0.4, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, D.sweepF(3400, 1700, 0.2), sr), 0.001, 0.09, sr), 0.7); D.mix(x, D.perc(D.biquad(N(n, 68), 'bp', 3600, sr, 5), 0.0004, 0.02, sr), 0.6); }, 0.6);
    buf.impact_wood = render(0.16, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 69), 'bp', 430, sr, 1.1), 0.0006, 0.03, sr), 0.9); D.mix(x, D.perc(D.biquad(N(n, 70), 'lp', 1100, sr, 0.7), 0.0004, 0.014, sr), 0.6); }, 0.7);
    buf.impact_steel = render(0.3, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 71), 'bp', 2100, sr, 1.2), 0.0004, 0.016, sr), 0.8); D.mix(x, D.perc(D.sine(n, D.sweepF(2900, 2500, 0.12), sr), 0.0005, 0.05, sr), 0.4); }, 0.6);
    buf.whiz = render(0.18, (x) => { const n = x.length; D.mix(x, D.perc(D.biquadSweep(N(n, 72), 'bp', 5600, 1500, 0.11, sr, 2.5), 0.012, 0.045, sr), 1); }, 0.65);
    buf.bounce = render(0.2, (x) => { const n = x.length; D.mix(x, D.perc(D.sine(n, 880, sr), 0.0005, 0.035, sr), 0.7); D.mix(x, D.perc(D.sine(n, 1490, sr), 0.0005, 0.025, sr), 0.5); D.mix(x, D.perc(D.biquad(N(n, 73), 'bp', 2400, sr, 1.4), 0.0004, 0.012, sr), 0.7); }, 0.7);
    buf.explosion = render(2.6, (x) => {
      const n = x.length;
      D.mix(x, D.perc(D.sine(n, D.sweepF(72, 27, 0.5), sr), 0.003, 0.55, sr), 1.0);
      D.mix(x, D.perc(D.biquadSweep(N(n, 74), 'lp', 3600, 140, 0.6, sr, 0.7), 0.004, 0.55, sr), 0.9);
      D.mix(x, D.perc(D.biquad(N(n, 75), 'hp', 1400, sr, 0.7), 0.0008, 0.03, sr), 0.55);
      const debris = D.perc(D.biquad(N(n, 76), 'bp', 1900, sr, 3), 0.2, 0.5, sr);
      for (let i = 0; i < n; i++) if (debris[i] > 0.55) debris[i] = 1.2; else debris[i] *= 0.04;
      D.mix(x, debris, 0.5);
      D.clip(x, 2.6);
    }, 0.95);
    // 界面与播报
    buf.ui_click = click(1900, 0.014, 81, 0.08);
    buf.ui_back = click(1200, 0.02, 82, 0.1);
    const note = (x, sr, f, t0, dur, tau, g = 1, harm = 0.35) => { const n0 = SEC(t0, sr), n1 = SEC(dur, sr), s = D.perc(D.sine(n1, f, sr), 0.004, tau, sr); if (harm) D.mix(s, D.perc(D.sine(n1, f * 2, sr), 0.004, tau * 0.6, sr), harm); D.mix(x, s, g, n0); };
    buf.start = render(1.5, (x) => { note(x, sr, 146.8, 0, 1.4, 0.5, 0.7); note(x, sr, 220, 0.18, 1.2, 0.45, 0.7); note(x, sr, 293.7, 0.36, 1.0, 0.4, 0.6); const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 91), 'lp', 900, sr, 0.7), 0.01, 0.5, sr), 0.4); }, 0.7);
    buf.win = render(2.2, (x) => { [[293.7, 0], [369.9, 0.12], [440, 0.24], [587.3, 0.4]].forEach(([f, t]) => note(x, sr, f, t, 1.6 - t, 0.55, 0.6, 0.4)); }, 0.7);
    buf.lose = render(2.4, (x) => { [[293.7, 0], [277.2, 0.3], [220, 0.6], [174.6, 0.95]].forEach(([f, t]) => note(x, sr, f, t, 1.3 - t * 0.5, 0.5, 0.6, 0.25)); }, 0.7);
    buf.spawn = render(0.5, (x) => { note(x, sr, 880, 0, 0.45, 0.12, 0.5, 0); note(x, sr, 1320, 0.08, 0.35, 0.1, 0.35, 0); }, 0.5);
    const pent = [293.7, 349.2, 392, 440, 523.3, 587.3];
    for (let k = 0; k < 6; k++) buf['kill' + k] = render(0.6 + k * 0.25, (x) => { const n = x.length; D.mix(x, D.perc(D.biquad(N(n, 100 + k), 'lp', 1400, sr, 0.7), 0.001, 0.05, sr), 0.6); D.mix(x, D.perc(D.sine(n, D.sweepF(190, 70, 0.1), sr), 0.001, 0.1, sr), 0.7); for (let j = 0; j <= k; j++) note(x, sr, pent[Math.min(j, 5)], j * 0.065, 0.5, 0.16, 0.42 - j * 0.03, 0.3); }, 0.75);
    buf.headshot_call = render(0.5, (x) => { note(x, sr, 1174.7, 0, 0.45, 0.1, 0.45, 0.5); note(x, sr, 1568, 0.07, 0.35, 0.12, 0.4, 0.5); }, 0.6);
  }

  function buildGraph() {
    master = ctx.createGain(); comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp).connect(ctx.destination);
    sfx = ctx.createGain(); ui = ctx.createGain(); mus = ctx.createGain(); amb = ctx.createGain();
    sfx.connect(master); ui.connect(master); mus.connect(master); amb.connect(master);
    // 混响：船舱里的钢板混响
    verbIn = ctx.createGain();
    const conv = ctx.createConvolver(), [l, r] = D.impulse(1.25, ctx.sampleRate, 0.42, 7, 0.012), irBuf = ctx.createBuffer(2, l.length, ctx.sampleRate);
    irBuf.getChannelData(0).set(l); irBuf.getChannelData(1).set(r);
    conv.buffer = irBuf;
    const verbOut = ctx.createGain(); verbOut.gain.value = 0.5;
    verbIn.connect(conv).connect(verbOut).connect(sfx);
    applyVolumes();
  }

  /** 环境：海浪、风、轮机低鸣。都是循环噪声 + 滤波器 + 慢速起伏 */
  function buildAmbience() {
    const sr = ctx.sampleRate, n = SEC(7, sr), mk = (seed, type, f, q, gain, lfoHz, lfoDepth, lfoTarget = 'gain') => {
      const b = ctx.createBuffer(2, n, sr);
      for (let ch = 0; ch < 2; ch++) b.getChannelData(ch).set(D.biquad(D.noise(n, seed + ch * 13), type, f, sr, q));
      const src = ctx.createBufferSource(); src.buffer = b; src.loop = true;
      const flt = ctx.createBiquadFilter(); flt.type = type === 'lp' ? 'lowpass' : 'bandpass'; flt.frequency.value = f; flt.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(flt).connect(g).connect(amb);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = lfoHz; lg.gain.value = lfoDepth;
      lfo.connect(lg).connect(lfoTarget === 'gain' ? g.gain : flt.frequency);
      src.start(); lfo.start();
      g.filter = flt;
      return g;
    };
    A.ambSea = mk(201, 'lp', 420, 0.6, 0.34, 0.07, 0.17);
    mk(202, 'bp', 1500, 0.7, 0.07, 0.11, 0.045);
    A.ambWind = mk(203, 'bp', 520, 0.5, 0.13, 0.05, 0.07, 'freq');
    const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain(); lfo2.frequency.value = 0.033; lg2.gain.value = 220; lfo2.connect(lg2); lg2.connect(A.ambWind.filter.frequency);
    for (const [f, g] of [[46, 0.05], [92, 0.02], [138, 0.008]]) { const o = ctx.createOscillator(); o.frequency.value = f; const gg = ctx.createGain(); gg.gain.value = g; o.connect(gg).connect(amb); o.start(); }
    A.ambEngine = mk(204, 'lp', 120, 0.7, 0.05, 0.9, 0.012);
  }

  // ———— 音乐：84 BPM，十六分音符，前瞻调度 ————
  const music = { on: false, step: 0, next: 0, timer: 0, nodes: [] };
  const NOTE = (name) => 440 * Math.pow(2, (name - 69) / 12);
  const kick = (t, g = 0.9) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.16); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.34); o.connect(gn).connect(mus); o.start(t); o.stop(t + 0.36); };
  const hat = (t, g = 0.1) => { const s = ctx.createBufferSource(); s.buffer = buf.hat; const gn = ctx.createGain(); gn.gain.value = g; s.connect(gn).connect(mus); s.start(t); };
  const tom = (t, f, g = 0.5) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.52, t + 0.14); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.001, t + 0.26); o.connect(gn).connect(mus); o.start(t); o.stop(t + 0.28); };
  const PATTERN = { kick: [0, 6, 8, 11], tom: [[13, 170], [14, 140], [15, 110]], hat: [2, 4, 6, 10, 12, 14] };
  function schedule() {
    const stepSec = 60 / 84 / 4;
    while (music.next < ctx.currentTime + 0.25) {
      const s = music.step % 16, t = music.next;
      if (PATTERN.kick.includes(s)) kick(t, s === 0 ? 1 : 0.7);
      if (s === 0 || s === 8) { const o = ctx.createOscillator(), gn = ctx.createGain(); o.frequency.value = s === 0 ? 36.7 : 41.2; gn.gain.setValueAtTime(0.5, t); gn.gain.exponentialRampToValueAtTime(0.001, t + stepSec * 7); o.connect(gn).connect(mus); o.start(t); o.stop(t + stepSec * 8); }
      if (PATTERN.hat.includes(s)) hat(t, s % 4 === 0 ? 0.13 : 0.07);
      for (const [ts, f] of PATTERN.tom) if (ts === s) tom(t, f);
      music.next += stepSec; music.step++;
    }
  }
  function startMusic(on) {
    if (on === music.on) return;
    music.on = on;
    if (on) {
      music.next = ctx.currentTime + 0.1; music.step = 0;
      // 低音铺底：两个失谐的锯齿波过.lowpass
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 1.2;
      const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.085, ctx.currentTime + 2.5);
      lp.connect(g).connect(mus);
      for (const f of [36.7, 55.0, 73.4]) for (const d of [-0.35, 0.35]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f + d; o.connect(lp); o.start(); music.nodes.push(o); }
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.045; lg.gain.value = 180; lfo.connect(lg).connect(lp.frequency); lfo.start(); music.nodes.push(lfo);
      music.nodes.push(g);
      buf.hat = buf.hat || render(0.06, (x) => D.perc(D.biquad(N(x.length, 301), 'hp', 8200, ctx.sampleRate, 0.7), 0.0005, 0.012, ctx.sampleRate), 0.5);
    } else {
      for (const n of music.nodes) { try { if (n.gain) n.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2); else n.stop(ctx.currentTime + 1.3); } catch (e) { /* 已停 */ } }
      music.nodes = [];
    }
  }

  function applyVolumes() {
    if (!ctx) return;
    master.gain.value = A.vol.master; sfx.gain.value = A.vol.sfx; ui.gain.value = A.vol.sfx * 0.8;
    mus.gain.value = A.vol.music * (A.mode === 'menu' ? 1 : 0.45);
    amb.gain.value = A.mode === 'off' ? 0 : 0.9;
  }

  function voice(bus) { if (A.voices > 40) return null; A.voices++; return bus; }
  function local(name, o = {}) {
    if (!ctx || !buf[name]) return;
    const s = ctx.createBufferSource(); s.buffer = buf[name]; s.playbackRate.value = o.rate ?? 1;
    const bus = voice(o.bus || sfx);
    if (!bus) return;
    const g = ctx.createGain(); g.gain.value = o.gain ?? 1;
    s.connect(g).connect(bus);
    if (o.send) { const sg = ctx.createGain(); sg.gain.value = o.send; g.connect(sg).connect(verbIn); }
    s.onended = () => { A.voices--; };
    s.start(ctx.currentTime + (o.at || 0));
  }
  /** 世界里的声音：pos 在船的坐标系里 */
  function world(name, pos, o = {}) {
    if (!ctx || !buf[name]) return;
    const L = ctx.listener, dx = pos[0] - A.lx, dy = pos[1] - A.ly, dz = pos[2] - A.lz, dist = Math.hypot(dx, dy, dz);
    if (dist > (o.max ?? 110)) return;
    const s = ctx.createBufferSource(); s.buffer = buf[name]; s.playbackRate.value = (o.rate ?? 1) * (1 + (Math.random() - 0.5) * (o.vary ?? 0.06));
    const g = ctx.createGain(); g.gain.value = o.gain ?? 1;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(16000, Math.max(700, 16000 - dist * 95));
    const p = ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = o.ref ?? 3.5; p.maxDistance = 200; p.rolloffFactor = o.roll ?? 1.15;
    if (p.positionX) { p.positionX.value = pos[0]; p.positionY.value = pos[1]; p.positionZ.value = pos[2]; } else p.setPosition(pos[0], pos[1], pos[2]);
    const bus = voice(sfx);
    if (!bus) return;
    s.connect(lp).connect(g).connect(p).connect(bus);
    if (o.send !== 0) { const sg = ctx.createGain(); sg.gain.value = (o.send ?? 0.35) * Math.max(0.2, 1 - dist / 40); p.connect(sg).connect(verbIn); }
    s.onended = () => { A.voices--; };
    s.start(ctx.currentTime + (o.at || 0) + dist * (o.sonic ?? 0.0) / 1000);
  }

  Object.assign(A, {
    /** 第一次用户点击后调用：建上下文、渲染音色、起环境声 */
    start() {
      if (ctx) { ctx.resume(); return; }
      try { ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); } catch (e) { return; }
      A.ctx = ctx;
      buildGraph(); buildBuffers(); buildAmbience();
      A.ready = true; A.mode = 'menu'; applyVolumes(); startMusic(true);
    },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    setVolumes(v) { Object.assign(A.vol, v); applyVolumes(); },
    setMode(mode) { A.mode = mode; applyVolumes(); startMusic(mode === 'menu'); },
    /** 每帧：听众的位置和朝向（船的坐标系），以及音乐调度 */
    listener(eye, fwd, dt) {
      if (!ctx) return;
      A.lx = eye[0]; A.ly = eye[1]; A.lz = eye[2];
      const L = ctx.listener, t = ctx.currentTime;
      if (L.positionX) {
        L.positionX.setTargetAtTime(eye[0], t, 0.02); L.positionY.setTargetAtTime(eye[1], t, 0.02); L.positionZ.setTargetAtTime(eye[2], t, 0.02);
        L.forwardX.setTargetAtTime(fwd[0], t, 0.02); L.forwardY.setTargetAtTime(fwd[1], t, 0.02); L.forwardZ.setTargetAtTime(fwd[2], t, 0.02);
        L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
      } else { L.setPosition(eye[0], eye[1], eye[2]); L.setOrientation(fwd[0], fwd[1], fwd[2], 0, 1, 0); }
      if (music.on) schedule();
      A.creak = (A.creak ?? 6) - dt;
      if (A.creak <= 0) {                      // 船体偶尔的金属呻吟
        A.creak = 7 + Math.random() * 14;
        world(Math.random() < 0.5 ? 'ricochet' : 'impact_steel', [eye[0] + (Math.random() - 0.5) * 50, -2 + Math.random() * 5, eye[2] + (Math.random() - 0.5) * 20], { gain: 0.16, rate: 0.22 + Math.random() * 0.2, send: 0.6, max: 80, roll: 0.5, vary: 0.3 });
      }
    },
    local, world,
    /** 开枪。pos 为 null = 玩家自己 */
    shot(id, pos, scale = 1) {
      const g = GUNS[id] || GUNS.ak47;
      if (!pos) { local('shot_' + id, { gain: g.gain * scale, send: id === 'usp' ? 0.3 : 0.45, vary: 0 }); return; }
      world('shot_' + id, pos, { gain: g.gain * scale, send: 0.5, max: 150, roll: 1.0, sonic: 0.6 });
    },
  });
  return A;
}
