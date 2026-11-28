// 声音：全部用 WebAudio 现场合成，页面不带任何音频文件。
// 底子是三层水声：很低沉的轰鸣、一阵一阵的涌、细碎的高频。上面是跟着泳速走的“划水声”、隔一阵响一声的鲸、
// 沉船附近的木头和铁的呻吟、气泡的“啵啵”，还有一层很轻的和声铺底（四个和弦慢慢地换）。夜里更安静、更沉。
// 噪声和混响的脉冲响应在 core/dsp.js 里算（带种子，每次都一样）；其余的都是振荡器、滤波器、包络节点
import { impulse as reverbImpulse, pinkNoise, brownNoise } from '../core/dsp.js';

export function createAudio() {
  const A = { ctx: null, on: true, volume: 0.8, started: false, night: 0, nextWhale: 0, nextCreak: 0, chord: 0, nextChord: 0, nearWreck: 0, vent: 0 };
  let master, verb, verbSend, swimGain, swimFilter, padGain, padFilter, rumbleGain, surgeGain, meter = null;

  /** 混响的脉冲响应（立体声，长度 seconds 秒，尾巴的时间常数 decay 秒） */
  function impulse(ctx, seconds, decay) {
    const ir = reverbImpulse(seconds, ctx.sampleRate, decay), buf = ctx.createBuffer(2, ir[0].length, ctx.sampleRate);
    ir.forEach((x, c) => buf.copyToChannel(x, c));
    return buf;
  }
  /** 循环 4 秒的噪声：kind 决定颜色（brown 布朗 / pink 粉红） */
  function noise(ctx, kind) {
    const sr = ctx.sampleRate, len = sr * 4, buf = ctx.createBuffer(2, len, sr), make = kind === 'brown' ? brownNoise : pinkNoise;
    for (let c = 0; c < 2; c++) buf.copyToChannel(make(len, 11 + c + (kind === 'brown' ? 10 : 0), sr * 0.5), c);
    return buf;
  }
  const loopNoise = (ctx, kind, filterType, freq, q, gain, dest) => {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noise(ctx, kind); src.loop = true;
    f.type = filterType; f.frequency.value = freq; f.Q.value = q; g.gain.value = gain;
    src.connect(f).connect(g).connect(dest); src.start();
    return { src, f, g };
  };
  /** 一声“啵”：短促的上滑音 */
  const blip = (t0, f0, gain, dur = 0.05, pan = 0, toVerb = 0.3) => {
    const ctx = A.ctx, o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner();
    o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.3); g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur * 1.6);
    p.pan.value = pan;
    o.connect(g).connect(p).connect(master); const s = ctx.createGain(); s.gain.value = toVerb; p.connect(s).connect(verbSend);
    o.start(t0); o.stop(t0 + dur * 1.8);
  };

  const api = {
    state: A,
    /** 第一次点击或按键之后才能出声（浏览器的规定） */
    start() {
      if (A.started) return true;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        A.ctx = ctx; A.started = true;
        master = ctx.createGain(); master.gain.value = 0;
        const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
        master.connect(comp).connect(ctx.destination);
        verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 3.2, 0.5); verbSend = ctx.createGain(); verbSend.gain.value = 1;
        const wet = ctx.createGain(); wet.gain.value = 0.42; verbSend.connect(verb).connect(wet).connect(master);
        // 水声的底子
        const rumble = loopNoise(ctx, 'brown', 'lowpass', 130, 0.7, 0.55, master); rumbleGain = rumble.g;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.06; lg.gain.value = 45; lfo.connect(lg).connect(rumble.f.frequency); lfo.start();
        const surge = loopNoise(ctx, 'pink', 'bandpass', 520, 0.8, 0.05, master); surgeGain = surge.g;
        const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain(); lfo2.frequency.value = 0.11; lg2.gain.value = 0.035; lfo2.connect(lg2).connect(surge.g); lfo2.start();
        loopNoise(ctx, 'pink', 'highpass', 5200, 0.5, 0.006, master);
        // 划水声：跟着泳速
        const swim = loopNoise(ctx, 'pink', 'bandpass', 760, 0.7, 0, master); swimGain = swim.g; swimFilter = swim.f;
        const s2 = ctx.createGain(); s2.gain.value = 0.5; swim.g.connect(s2).connect(verbSend);
        // 和声铺底
        padGain = ctx.createGain(); padGain.gain.value = 0; padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 900;
        padGain.connect(padFilter).connect(master); const pv = ctx.createGain(); pv.gain.value = 0.7; padFilter.connect(pv).connect(verbSend);
        A.nextChord = ctx.currentTime + 1.5; A.nextWhale = ctx.currentTime + 14; A.nextCreak = ctx.currentTime + 20;
        master.gain.setTargetAtTime(A.on ? A.volume : 0, ctx.currentTime, 0.8);
        return true;
      } catch (e) { console.warn('[audio] 起不来：', e); return false; }
    },
    /** 浏览器有时会把声音先挂起（不是在点击里建的上下文）：下一次点击时接上 */
    resume() { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); },
    setOn(on) { A.on = on; if (master) master.gain.setTargetAtTime(on ? A.volume : 0, A.ctx.currentTime, 0.2); },
    setVolume(v) { A.volume = v; if (master) master.gain.setTargetAtTime(A.on ? v : 0, A.ctx.currentTime, 0.1); },
    click() { if (!A.ctx || !A.on) return; blip(A.ctx.currentTime, 1250, 0.05, 0.035, 0, 0.5); },
    /** 吐一口气：十几颗气泡接连炸开 */
    exhale() {
      if (!A.ctx || !A.on) return;
      const t = A.ctx.currentTime, pan = (Math.random() - 0.5) * 0.8;
      for (let i = 0, dt = 0; i < 13; i++) { blip(t + dt, 520 + Math.random() * 900, 0.10 * (1 - i / 16), 0.05, pan + (Math.random() - 0.5) * 0.25, 0.4); dt += 0.035 + Math.random() * 0.12; }
    },
    /** 附近有冒泡口（0..1）：偶尔一声 */
    ventBubble(k) { if (A.ctx && A.on && Math.random() < k) blip(A.ctx.currentTime, 380 + Math.random() * 500, 0.05, 0.06, (Math.random() - 0.5) * 1.4, 0.5); },
    /** 鲸的一声长鸣：频率慢慢爬上去再落下来，带一点颤音和泛音 */
    whale() {
      const ctx = A.ctx; if (!ctx || !A.on) return;
      const t = ctx.currentTime + 0.05, f0 = 150 + Math.random() * 90, up = f0 * (2.1 + Math.random() * 0.6), len = 2.2 + Math.random() * 1.6, pan = ctx.createStereoPanner(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      pan.pan.setValueAtTime((Math.random() - 0.5) * 1.6, t); pan.pan.linearRampToValueAtTime((Math.random() - 0.5) * 1.6, t + len + 2);
      lp.type = 'lowpass'; lp.frequency.value = 1100;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.30, t + 0.6); g.gain.setValueAtTime(0.30, t + len); g.gain.exponentialRampToValueAtTime(1e-4, t + len + 1.8);
      g.connect(pan).connect(lp).connect(master); const s = ctx.createGain(); s.gain.value = 1.4; lp.connect(s).connect(verbSend);
      for (const [mult, amp] of [[1, 1], [2.01, 0.22], [0.5, 0.18]]) {
        const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; og.gain.value = amp;
        o.frequency.setValueAtTime(f0 * mult, t); o.frequency.exponentialRampToValueAtTime(up * mult, t + len * 0.55); o.frequency.exponentialRampToValueAtTime(f0 * 1.08 * mult, t + len);
        const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 4.5 + Math.random() * 2; vg.gain.value = up * 0.012 * mult; vib.connect(vg).connect(o.frequency); vib.start(t); vib.stop(t + len + 2);
        o.connect(og).connect(g); o.start(t); o.stop(t + len + 2);
      }
    },
    /** 船的呻吟：木头和铁的低的、带摩擦的哼声（三个锯齿波挤在一个带通里，音高一路往下沉），加几声敲击 */
    creak(strength) {
      const ctx = A.ctx; if (!ctx || !A.on) return;
      const t = ctx.currentTime + 0.05, lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(), pan = ctx.createStereoPanner(), g = ctx.createGain(), f0 = 58 + Math.random() * 24;
      lp.type = 'lowpass'; lp.frequency.value = 900;
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(210 + Math.random() * 60, t); bp.Q.value = 1.6;
      pan.pan.value = (Math.random() - 0.5) * 1.2;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.8 * strength, t + 0.5); g.gain.exponentialRampToValueAtTime(1e-4, t + 2.2);
      for (const [mult, det, amp] of [[1, -6, 1], [1.498, 7, 0.5], [0.5, 0, 0.35]]) {
        const o = ctx.createOscillator(), og = ctx.createGain();
        o.type = 'sawtooth'; o.detune.value = det; og.gain.value = amp;
        o.frequency.setValueAtTime(f0 * mult, t); o.frequency.linearRampToValueAtTime(f0 * 0.66 * mult, t + 1.8);
        o.connect(og).connect(lp); o.start(t); o.stop(t + 2.4);
      }
      lp.connect(bp).connect(g).connect(pan).connect(master); const s = ctx.createGain(); s.gain.value = 0.8; pan.connect(s).connect(verbSend);
      for (let i = 0, dt = 0.3 + Math.random() * 0.5; i < 3; i++, dt += 0.2 + Math.random() * 0.45) blip(t + dt, 110 + Math.random() * 160, 0.07 * strength, 0.09, (Math.random() - 0.5) * 1.2, 0.9);
    },
    /** 和声铺底：四个和弦轮着来 */
    chord(n) {
      const ctx = A.ctx, notes = [[146.8, 174.6, 220, 329.6], [116.5, 146.8, 174.6, 220], [98, 233.1, 293.7, 440], [110, 164.8, 220, 293.7]][n % 4], t = ctx.currentTime, hold = 15;
      for (const f of notes) for (const [type, det, amp] of [['triangle', -4, 0.5], ['sine', 5, 0.5]]) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; o.detune.value = det;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp * 0.22, t + 4.5); g.gain.setValueAtTime(amp * 0.22, t + hold - 4); g.gain.linearRampToValueAtTime(0, t + hold);
        o.connect(g).connect(padGain); o.start(t); o.stop(t + hold + 0.1);
      }
    },
    /**
     * 每帧。s：{ speed 泳速（米/秒）, boosting 疾游, mode 'title'|'tour'|'free', nearWreck 离沉船多近 0..1, vent 离冒泡口多近 0..1 }
     */
    update(dt, s) {
      if (!A.ctx || A.ctx.state !== 'running') return;
      const now = A.ctx.currentTime;
      A.night = s.night ?? A.night;
      const moving = s.mode === 'free' ? Math.min(1, s.speed / 3.2) : 0;
      swimGain.gain.setTargetAtTime(moving * 0.26 * (1 + (s.boosting ? 1.6 : 0)), now, 0.25);
      swimFilter.frequency.setTargetAtTime(620 + moving * 500 + (s.boosting ? 700 : 0), now, 0.3);
      padGain.gain.setTargetAtTime(s.mode === 'title' ? 0.5 : s.mode === 'tour' ? 0.34 : 0.2, now, 1.5);          // 铺底的总量（各个和弦本身的包络另算）
      padFilter.frequency.setTargetAtTime(A.night > 0.5 ? 520 : 900, now, 2);
      rumbleGain.gain.setTargetAtTime(0.55 * (1 + 0.35 * A.night), now, 2);
      surgeGain.gain.setTargetAtTime(s.mode === 'free' ? 0.03 : 0.05, now, 1);
      if (now > A.nextChord) { api.chord(A.chord++); A.nextChord = now + 15; }
      if (now > A.nextWhale && s.mode !== 'title') { api.whale(); A.nextWhale = now + 38 + Math.random() * 70 - A.night * 20; }
      if (now > A.nextCreak && s.nearWreck > 0.05) { api.creak(s.nearWreck); A.nextCreak = now + 14 + Math.random() * 26; }
    },
    /** 量一下接下来 ms 毫秒里总输出的电平（给自动化检查用）：峰值和有效值。还没出声的时候是 null */
    meter(ms = 1500) {
      if (!A.ctx) return Promise.resolve(null);
      meter ??= A.ctx.createAnalyser();
      meter.fftSize = 2048;
      master.connect(meter);
      const buf = new Float32Array(meter.fftSize);
      return new Promise((res) => {
        let peak = 0, sum = 0, n = 0;
        const t0 = performance.now();
        const tick = () => {
          meter.getFloatTimeDomainData(buf);
          for (let i = 0; i < buf.length; i += 4) { peak = Math.max(peak, Math.abs(buf[i])); sum += buf[i] * buf[i]; n++; }
          if (performance.now() - t0 < ms) requestAnimationFrame(tick); else res({ peak: +peak.toFixed(4), rms: +Math.sqrt(sum / n).toFixed(4) });
        };
        tick();
      });
    },
    dispose() { A.ctx?.close(); A.ctx = null; A.started = false; meter = null; },
  };
  return api;
}
