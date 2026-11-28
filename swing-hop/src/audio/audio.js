// 声音：全部用 WebAudio 现场合成，没有音频文件。
//   底子是风声和一层很轻的和声，隔一会儿有鸟叫；
//   蓄力时越按越高的气声，起跳的弹跳声，落地的木头声，落在正中是往上升的钟声；
//   风暴狼来了有狼嚎，它越近吼声和心跳越响；掉进云海、秋千断、结束、破纪录各有各的声音。
export class Audio {
  constructor() {
    this.ctx = null;
    this.on = true;
    this.volume = 0.8;
    this.paused = false;
    this.nextBird = 4;
    this.nextChord = 14;
    this.chord = 0;
    this.heart = 0;
    this.chargeNode = null;
    this.peak = 0;
    window.addEventListener('pointerdown', () => this.start(), { once: true, passive: true });
    window.addEventListener('keydown', () => this.start(), { once: true });
  }

  // 第一次点页面或按键的时候才能出声（浏览器的规矩）
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = this.ctx = new C();
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.master.connect(comp).connect(this.analyser).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.connect(this.master);
    this.bed = ctx.createGain();
    this.bed.gain.value = 1;
    this.bed.connect(this.master);
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let k = 0; k < len; k++) {                                  // 偏粉红的噪声：风的声音
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + 0.029 * w; b1 = 0.985 * b1 + 0.032 * w; b2 = 0.95 * b2 + 0.048 * w;
      d[k] = (b0 + b1 + b2 + w * 0.05) * 0.25;
    }
    this.noiseBuf = buf;
    this.applyGain(1.2);

    // 风：噪声过带通，风门慢慢地开合
    const wind = ctx.createBufferSource(), wf = ctx.createBiquadFilter(), wg = ctx.createGain();
    wind.buffer = buf; wind.loop = true;
    wf.type = 'bandpass'; wf.frequency.value = 520; wf.Q.value = 0.55;
    wg.gain.value = 0.15;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.07; lg.gain.value = 150;
    lfo.connect(lg).connect(wf.frequency);
    const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain();
    lfo2.frequency.value = 0.11; lg2.gain.value = 0.05;
    lfo2.connect(lg2).connect(wg.gain);
    wind.connect(wf).connect(wg).connect(this.bed);
    wind.start(); lfo.start(); lfo2.start();

    // 和声铺底：三个三角波，很轻
    this.pad = ctx.createGain();
    this.pad.gain.value = 0.016;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1100;
    this.pad.connect(lp).connect(this.bed);
    this.padOsc = [0, 1, 2].map(() => { const o = ctx.createOscillator(); o.type = 'triangle'; o.connect(this.pad); o.start(); return o; });
    this.setChord(0);

    // 狼的吼声：两个锯齿波过低通。先过一道“闸门”，音量跟着它离兔子的远近走（每帧在 update 里设）；
    // 再乘上 8.5 赫兹的一颤一颤。颤音必须乘在闸门后面：直接加在闸门的音量上，闸门关着它也会漏出很响的嗡嗡声
    this.growl = ctx.createGain();
    this.growl.gain.value = 0;
    const trem = ctx.createGain();
    trem.gain.value = 0.65;
    const gf = ctx.createBiquadFilter();
    gf.type = 'lowpass'; gf.frequency.value = 260;
    this.growl.connect(trem).connect(gf).connect(this.sfx);
    for (const f of [57, 86.5]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(this.growl); o.start(); }
    const gl = ctx.createOscillator(), glg = ctx.createGain();
    gl.frequency.value = 8.5; glg.gain.value = 0.35;
    gl.connect(glg).connect(trem.gain);
    gl.start();
  }

  applyGain(secs = 0.1) {
    if (!this.ctx) return;
    const v = this.on && !this.paused ? this.volume : 0;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, secs / 3);
  }
  setOn(on) { this.on = on; this.applyGain(0.25); }
  setVolume(v) { this.volume = v; this.applyGain(0.1); }
  setPaused(on) { this.paused = on; this.applyGain(0.2); }
  setEnabled(on, vol) { this.on = on; if (vol != null) this.volume = vol; this.applyGain(0.05); }

  at(delay = 0) { return this.ctx.currentTime + delay; }

  // 一个音：f0 滑到 f1，抬高、衰减
  tone({ type = 'sine', f0, f1 = f0, dur = 0.2, gain = 0.2, att = 0.005, delay = 0, dest = null, curve = 'exp' }) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = this.at(delay), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(20, f0), t);
    if (curve === 'exp') o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); else o.frequency.linearRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest || this.sfx);
    o.start(t); o.stop(t + dur + 0.03);
  }

  // 一段噪声：过滤波器，f0 滑到 f1
  noise({ type = 'bandpass', f0, f1 = f0, Q = 1, dur = 0.2, gain = 0.2, att = 0.004, delay = 0 }) {
    if (!this.ctx) return;
    const ctx = this.ctx, t = this.at(delay), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = this.noiseBuf;
    s.loop = true;
    s.loopStart = Math.random();
    f.type = type; f.Q.value = Q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.sfx);
    s.start(t, Math.random()); s.stop(t + dur + 0.03);
  }

  // 钟声：基音加上一个不成倍的高音，像小铃铛
  bell(f, gain = 0.16, delay = 0, dur = 0.7) {
    this.tone({ f0: f, dur, gain, delay, att: 0.003 });
    this.tone({ f0: f * 2.76, dur: dur * 0.45, gain: gain * 0.35, delay, att: 0.002 });
    this.tone({ f0: f * 5.4, dur: dur * 0.2, gain: gain * 0.12, delay, att: 0.001 });
  }

  setChord(k) {
    if (!this.padOsc) return;
    const roots = [220, 196, 174.6, 196], r = roots[k % roots.length], t = this.at();
    [r / 2, r * 1.5, r * 2].forEach((f, i) => this.padOsc[i].frequency.setTargetAtTime(f, t, 1.5));
  }

  chirp() {
    const n = 2 + Math.floor(Math.random() * 3), f = 2500 + Math.random() * 1100;
    for (let k = 0; k < n; k++) this.tone({ f0: f * (1 + Math.random() * 0.15), f1: f * (0.75 + Math.random() * 0.3), dur: 0.07 + Math.random() * 0.04, gain: 0.035, delay: k * (0.085 + Math.random() * 0.05), att: 0.008 });
  }

  // ---------- 一件事一个声音 ----------
  chargeStart() {
    if (!this.ctx || this.chargeNode) return;
    const ctx = this.ctx, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain();
    s.buffer = this.noiseBuf; s.loop = true;
    f.type = 'bandpass'; f.frequency.value = 320; f.Q.value = 2.2;
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.11, this.at(), 0.08);
    f.frequency.setTargetAtTime(1900, this.at(), 0.4);
    o.type = 'sine'; o.frequency.value = 150; o.frequency.setTargetAtTime(330, this.at(), 0.4);
    og.gain.value = 0.05;
    s.connect(f).connect(g).connect(this.sfx);
    o.connect(og).connect(this.sfx);
    s.start(); o.start();
    this.chargeNode = { s, o, g, og };
  }
  chargeEnd() {
    if (!this.chargeNode) return;
    const { s, o, g, og } = this.chargeNode, t = this.at();
    g.gain.setTargetAtTime(0, t, 0.04); og.gain.setTargetAtTime(0, t, 0.04);
    s.stop(t + 0.3); o.stop(t + 0.3);
    this.chargeNode = null;
  }

  jump(c) {
    this.chargeEnd();
    this.tone({ type: 'triangle', f0: 240 + c * 80, f1: 620 + c * 260, dur: 0.15, gain: 0.34, att: 0.004 });
    this.noise({ f0: 900, f1: 2600, Q: 1.4, dur: 0.2, gain: 0.16 + c * 0.1, att: 0.01 });
  }

  land(e) {
    const k = e.c ?? 0.5;
    this.tone({ f0: 150, f1: 58, dur: 0.16, gain: 0.2 + k * 0.12, att: 0.003 });
    this.noise({ type: 'bandpass', f0: 760, f1: 420, Q: 2.5, dur: 0.07, gain: 0.1 + k * 0.08 });
    this.noise({ type: 'lowpass', f0: 500, dur: 0.09, gain: 0.07, att: 0.002 });          // 木板“咚”
    if (e.kind === 'gold') [1319, 1661, 1976].forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.16, gain: 0.09, delay: 0.1 + i * 0.07 }));
  }

  perfect(e) {
    const steps = [0, 2, 4, 7, 9, 12, 14, 16], semi = steps[Math.min(steps.length - 1, (e.combo || 1) - 1)];
    this.land(e);
    this.bell(784 * Math.pow(2, semi / 12), 0.2, 0.03, 0.75);
    if ((e.combo || 1) > 1) this.bell(784 * Math.pow(2, (semi + 7) / 12), 0.08, 0.09, 0.4);
  }

  slip() { this.tone({ type: 'sawtooth', f0: 330, f1: 130, dur: 0.42, gain: 0.26, att: 0.02 }); }
  fall() {
    this.chargeEnd();
    this.tone({ f0: 1500, f1: 290, dur: 0.85, gain: 0.16, att: 0.03 });
    this.noise({ f0: 2400, f1: 500, Q: 1.2, dur: 0.8, gain: 0.08, att: 0.05 });
  }
  cloud() { this.noise({ type: 'lowpass', f0: 2400, f1: 520, dur: 0.5, gain: 0.8, att: 0.02 }); }

  howl() {
    const t = 0;
    this.tone({ f0: 330, f1: 640, dur: 0.75, gain: 0.15, att: 0.25, delay: t });
    this.tone({ f0: 640, f1: 470, dur: 1.0, gain: 0.13, att: 0.1, delay: t + 0.75 });
    this.tone({ f0: 165, f1: 320, dur: 0.75, gain: 0.05, att: 0.25, delay: t });
    this.noise({ f0: 800, f1: 1500, Q: 4, dur: 1.6, gain: 0.03, att: 0.4, delay: t });
  }

  creak() {
    for (let k = 0; k < 7; k++) this.noise({ type: 'bandpass', f0: 1300 + Math.random() * 900, Q: 9, dur: 0.05 + Math.random() * 0.05, gain: 0.45, delay: Math.random() * 0.35, att: 0.004 });
    this.tone({ f0: 1900, f1: 1500, dur: 0.3, gain: 0.12, att: 0.05 });
  }
  snap() {
    this.noise({ type: 'highpass', f0: 1800, dur: 0.06, gain: 0.3, att: 0.001 });
    this.noise({ type: 'bandpass', f0: 500, Q: 2, dur: 0.12, gain: 0.18, delay: 0.03 });
    this.tone({ f0: 110, f1: 45, dur: 0.3, gain: 0.22, delay: 0.04 });
  }
  caught() {
    this.noise({ type: 'highpass', f0: 900, f1: 3000, dur: 0.12, gain: 0.32, att: 0.001 });
    this.tone({ f0: 90, f1: 38, dur: 0.7, gain: 0.4, att: 0.004 });
    this.tone({ type: 'sawtooth', f0: 420, f1: 110, dur: 0.5, gain: 0.1, att: 0.01 });
  }
  over() { [392, 311, 262].forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.5, gain: 0.1, delay: i * 0.22, att: 0.02 })); }
  record() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.bell(f, 0.14, i * 0.09, 0.6)); }
  click() { this.tone({ f0: 660, f1: 520, dur: 0.06, gain: 0.05, att: 0.002 }); }

  play(name, arg) {
    if (!this.ctx || !this.on) return;
    const fn = this[name];
    if (typeof fn === 'function') fn.call(this, arg);
  }

  // ---------- 每一帧：鸟叫、换和弦、吼声和心跳跟着狼的远近走 ----------
  update(dt, s) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.nextBird -= dt; this.nextChord -= dt;
    if (this.nextBird < 0) { this.chirp(); this.nextBird = 4 + Math.random() * 9; }
    if (this.nextChord < 0) { this.chord = (this.chord + 1) % 4; this.setChord(this.chord); this.nextChord = 14 + Math.random() * 6; }
    const near = s.wolfDist == null ? 0 : Math.max(0, Math.min(1, (20 - s.wolfDist) / 17));
    this.growl.gain.setTargetAtTime(s.mode === 'play' ? near * near * 0.16 : 0, this.at(), 0.25);
    if (near > 0.45 && s.mode === 'play') {                       // 追近了：心跳
      this.heart -= dt;
      if (this.heart < 0) {
        const k = (near - 0.45) / 0.55;
        this.heart = 0.95 - k * 0.4;
        this.tone({ f0: 64, f1: 44, dur: 0.11, gain: 0.16 + k * 0.2, att: 0.004 });
        this.tone({ f0: 58, f1: 40, dur: 0.1, gain: 0.1 + k * 0.14, att: 0.004, delay: 0.16 });
      }
    }
    if (this.chargeNode && s.charge != null) {                    // 蓄力越满音越高
      const c = s.charge;
      this.chargeNode.o.frequency.setTargetAtTime(150 + c * 300, this.at(), 0.05);
      this.chargeNode.g.gain.setTargetAtTime(0.09 + c * 0.08, this.at(), 0.08);
    }
  }

  // 量接下来 ms 毫秒的输出电平（给自动化检查用）：峰值和均方根
  async meter(ms) {
    if (!this.ctx) return null;
    const buf = new Float32Array(this.analyser.fftSize);
    let peak = 0, sum = 0, n = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      await new Promise((r) => requestAnimationFrame(r));
      this.analyser.getFloatTimeDomainData(buf);
      for (let k = 0; k < buf.length; k++) { const v = Math.abs(buf[k]); if (v > peak) peak = v; sum += buf[k] * buf[k]; n++; }
    }
    return { peak: +peak.toFixed(4), rms: +Math.sqrt(sum / Math.max(1, n)).toFixed(4) };
  }

  get info() { return this.ctx ? { state: this.ctx.state, rate: this.ctx.sampleRate, time: +this.ctx.currentTime.toFixed(2), on: this.on, volume: this.volume } : null; }
}
