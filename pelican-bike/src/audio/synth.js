// WebAudio 节点图构建：一次性音效、音乐声部、连续环境层、空间感。不含业务状态。
import { driveCurve } from './dsp.js';

export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const gain = (ctx, v) => { const g = ctx.createGain(); g.gain.value = v; return g; };

// —————————————————— 基础积木 ——————————————————

/** 攻-衰包络。指数斜坡在 WebAudio 里不接受 0，所以从/到 0.0001，最后落回 0 */
function adGain(ctx, t, peak, a, d) {
  const g = ctx.createGain(), p = g.gain;
  const a2 = Math.max(0.0005, a), d2 = Math.max(0.01, d);
  p.setValueAtTime(0.0001, t);
  p.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a2);
  p.exponentialRampToValueAtTime(0.0001, t + a2 + d2);
  p.setValueAtTime(0, t + a2 + d2 + 0.01);
  return g;
}
function osc(ctx, type, f, t, stop, dest, detune = 0) {
  const o = ctx.createOscillator();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (detune) o.detune.setValueAtTime(detune, t);
  o.connect(dest); o.start(t); o.stop(Math.max(t, stop));
  return o;
}
/** 循环噪声片段：随机偏移起步，每次听感都略有不同 */
function noise(ctx, buffer, t, stop, dest) {
  const s = ctx.createBufferSource();
  s.buffer = buffer; s.loop = true;
  s.connect(dest);
  s.start(t, Math.random() * Math.max(0.01, buffer.duration - 0.05));
  s.stop(Math.max(t, stop));
  return s;
}
function flt(ctx, type, f, q = 1) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
/** 输出分配：干声 + 送空间感 */
function mix(ctx, dest, send, level) {
  const out = gain(ctx, 1); out.connect(dest);
  if (send) { const s = gain(ctx, level); out.connect(s); s.connect(send); }
  return out;
}
function pan(ctx, p) {
  if (!ctx.createStereoPanner) return gain(ctx, 1);
  const n = ctx.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); return n;
}

/** 空间感：带反馈的低通延迟（海边的空旷感） */
export function createSpace(ctx, dest) {
  const input = gain(ctx, 1);
  const delay = ctx.createDelay(1); delay.delayTime.value = 0.27;
  const lp = flt(ctx, 'lowpass', 2400, 0.5), fb = gain(ctx, 0.3);
  input.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay);
  const wet = gain(ctx, 0.45); lp.connect(wet); wet.connect(dest);
  return { input };
}

// —————————————————— 一次性音效 ——————————————————

export const SFX = {
  /** 车铃：非谐分音 1 : 2.74 : 5.43，快速衰减，110ms 后再敲一下 */
  bell(ctx, out, send, nb, t) {
    const P = [1, 0.5, 0.75, 2.74, 0.3, 0.42, 5.43, 0.16, 0.25];
    for (let k = 0; k < 2; k++) {
      const ts = t + k * 0.11, amp = k ? 0.8 : 1, m = mix(ctx, out, send, 0.35);
      for (let i = 0; i < 9; i += 3) {
        const g = adGain(ctx, ts, P[i + 1] * amp, 0.002, P[i + 2]);
        g.connect(m);
        osc(ctx, 'sine', 2150 * P[i] * (1 + (Math.random() - 0.5) * 0.004), ts, ts + P[i + 2] + 0.05, g);
      }
      const bp = flt(ctx, 'bandpass', 5200, 2), g = adGain(ctx, ts, 0.12 * amp, 0.001, 0.012);   // 敲击瞬态
      bp.connect(g); g.connect(out); noise(ctx, nb.white, ts, ts + 0.03, bp);
    }
  },
  /** 鹈鹕叫：两个音节，锯齿波+噪声过软削波，音高与带通中心一起下落，38Hz 抖动做出沙哑感 */
  squawk(ctx, out, send, nb, t) {
    const shaper = ctx.createWaveShaper(); shaper.curve = driveCurve(6); shaper.oversample = '2x';
    const bp = flt(ctx, 'bandpass', 1700, 2.6);
    const env = gain(ctx, 0); env.gain.setValueAtTime(0, t);
    const body = mix(ctx, out, send, 0.25); body.gain.value = 0.5;
    shaper.connect(bp); bp.connect(env); env.connect(body);
    const jit = ctx.createOscillator(); jit.frequency.value = 38;
    const jitG = gain(ctx, 26); jit.connect(jitG); jit.start(t); jit.stop(t + 0.5);
    for (let s = 0; s < 2; s++) {
      const ts = t + s * 0.21, dur = s ? 0.24 : 0.17, f1 = s ? 330 : 430, f2 = s ? 190 : 250;
      env.gain.linearRampToValueAtTime(1, ts + 0.025);
      env.gain.setValueAtTime(1, ts + dur * 0.6);
      env.gain.linearRampToValueAtTime(0, ts + dur);
      bp.frequency.setValueAtTime(1700, ts);
      bp.frequency.exponentialRampToValueAtTime(750, ts + dur);
      const o = osc(ctx, 'sawtooth', f1, ts, ts + dur + 0.02, shaper);
      o.frequency.exponentialRampToValueAtTime(f2, ts + dur);
      jitG.connect(o.frequency);
      const ng = gain(ctx, 0.45); ng.connect(shaper);
      noise(ctx, nb.white, ts, ts + dur + 0.02, ng);
    }
  },
  /** 起跳：小小的上升气声（带通 600 → 1.9k） */
  jump(ctx, out, send, nb, t) {
    const bp = flt(ctx, 'bandpass', 600, 1.4), g = adGain(ctx, t, 0.2, 0.07, 0.22);
    bp.frequency.setValueAtTime(600, t); bp.frequency.exponentialRampToValueAtTime(1900, t + 0.28);
    bp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.32, bp);
  },
  /** 落地：低频闷响 + 噪声 + 几下金属咔哒，全部随冲击力缩放 */
  land(ctx, out, send, nb, t, impact) {
    const k = Math.max(0, Math.min(1.3, impact ?? 1));
    if (k <= 0.001) return;
    const tg = adGain(ctx, t, 0.7 * k, 0.004, 0.18); tg.connect(out);
    const o = osc(ctx, 'sine', 105, t, t + 0.22, tg);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.16);
    const lp = flt(ctx, 'lowpass', 900, 0.7), ng = adGain(ctx, t, 0.35 * k, 0.002, 0.09);
    lp.connect(ng); ng.connect(out); noise(ctx, nb.brown, t, t + 0.12, lp);
    const ticks = 2 + Math.round(3 * Math.min(1, k));
    for (let i = 0; i < ticks; i++) {
      const ts = t + 0.01 + i * rnd(0.022, 0.05), bp = flt(ctx, 'bandpass', rnd(2800, 5400), 6), g = adGain(ctx, ts, 0.12 * k, 0.001, 0.03);
      bp.connect(g); g.connect(out); noise(ctx, nb.white, ts, ts + 0.05, bp);
    }
  },
  /** 入水：噪声过不断闭合的低通 + 几颗水珠 */
  splash(ctx, out, send, nb, t, strength) {
    const k = Math.max(0, Math.min(1.5, strength ?? 1));
    if (k <= 0.001) return;
    const lp = flt(ctx, 'lowpass', 6500, 0.7), g = adGain(ctx, t, 0.55 * k, 0.004, 0.4);
    lp.frequency.setValueAtTime(6500, t); lp.frequency.exponentialRampToValueAtTime(450, t + 0.38);
    lp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.45, lp);
    const lp2 = flt(ctx, 'lowpass', 500, 0.7), g2 = adGain(ctx, t, 0.3 * k, 0.003, 0.2);
    lp2.connect(g2); g2.connect(out); noise(ctx, nb.brown, t, t + 0.25, lp2);
    for (let i = 0; i < 3; i++) {
      const ts = t + 0.12 + i * rnd(0.09, 0.19), f = rnd(900, 1500);
      const dg = adGain(ctx, ts, 0.07 * k, 0.003, 0.07), m = mix(ctx, out, send, 0.5);
      dg.connect(m);
      const d = osc(ctx, 'sine', f, ts, ts + 0.09, dg);
      d.frequency.exponentialRampToValueAtTime(f * 1.5, ts + 0.06);
    }
  },
  /** 吞鱼：短促下滑的正弦“咕咚”，第二声更低 */
  gulp(ctx, out, send, nb, t) {
    for (let i = 0; i < 2; i++) {
      const ts = t + i * 0.13, f1 = i ? 300 : 430, f2 = i ? 110 : 140, g = adGain(ctx, ts, i ? 0.3 : 0.5, 0.006, 0.16);
      const lp = flt(ctx, 'lowpass', 1200, 0.7); lp.connect(g); g.connect(out);
      const o = osc(ctx, 'sine', f1, ts, ts + 0.2, lp);
      o.frequency.exponentialRampToValueAtTime(f2, ts + (i ? 0.1 : 0.13));
    }
    const bp = flt(ctx, 'bandpass', 1800, 3), g = adGain(ctx, t, 0.1, 0.001, 0.015);
    bp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.03, bp);
  },
  /** UI 点击：极短的带通噪声 + 一点 sine */
  click(ctx, out, send, nb, t) {
    const bp = flt(ctx, 'bandpass', 3400, 5), g = adGain(ctx, t, 0.25, 0.001, 0.018);
    bp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.04, bp);
    const g2 = adGain(ctx, t, 0.08, 0.001, 0.012); g2.connect(out);
    osc(ctx, 'sine', 1900, t, t + 0.03, g2);
  },
  /** 开关：两步小音阶（低 → 高） */
  toggle(ctx, out, send, nb, t) {
    SFX.click(ctx, out, send, nb, t);
    [[1320, 0], [1760, 0.045]].forEach(([f, dt]) => {
      const g = adGain(ctx, t + dt, 0.11, 0.003, dt ? 0.06 : 0.04); g.connect(out);
      osc(ctx, 'sine', f, t + dt, t + dt + 0.09, g);
    });
  },
  /** 花鼓换挡：闷响的机械“咔哒” */
  shift(ctx, out, send, nb, t) {
    const bp = flt(ctx, 'bandpass', 1300, 2.2), g = adGain(ctx, t, 0.3, 0.002, 0.035);
    bp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.06, bp);
    const g2 = adGain(ctx, t, 0.25, 0.003, 0.07); g2.connect(out);
    const o = osc(ctx, 'sine', 170, t, t + 0.1, g2);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.06);
  },
  /** 远处海鸥：2–3 声下滑的长音，重空间感 */
  gull(ctx, out, send, nb, t, p) {
    const pn = pan(ctx, p); pn.connect(out);
    const sd = gain(ctx, 0.8); pn.connect(sd); sd.connect(send);
    const lvl = gain(ctx, 0.085); lvl.connect(pn);
    const notes = 2 + (Math.random() < 0.45 ? 1 : 0), f0 = 1300 + Math.random() * 300;
    for (let i = 0; i < notes; i++) {
      const ts = t + i * 0.27, f = f0 * Math.pow(0.94, i);
      const g = gain(ctx, 0);
      g.gain.setValueAtTime(0, ts); g.gain.linearRampToValueAtTime(1, ts + 0.035);
      g.gain.setValueAtTime(1, ts + 0.12); g.gain.linearRampToValueAtTime(0, ts + 0.25);
      g.connect(lvl);
      const bp = flt(ctx, 'bandpass', 1900, 1.4); bp.connect(g);
      const o = osc(ctx, 'triangle', f, ts, ts + 0.27, bp);
      o.frequency.setValueAtTime(f, ts); o.frequency.linearRampToValueAtTime(f * 1.14, ts + 0.07);
      o.frequency.exponentialRampToValueAtTime(f * 0.7, ts + 0.24);
      const h = gain(ctx, 0.3); h.connect(g);
      osc(ctx, 'sine', f * 2.01, ts, ts + 0.27, h);
    }
  },
  /** 夜里的浮标钟：低沉的非谐钟声 */
  buoy(ctx, out, send, nb, t) {
    const m = mix(ctx, out, send, 0.6), lp = flt(ctx, 'lowpass', 1300, 0.5); lp.connect(m);
    const P = [1, 0.5, 1.3, 1.59, 0.25, 0.85, 2.14, 0.12, 0.5, 2.71, 0.06, 0.3];
    for (let i = 0; i < 12; i += 3) {
      const g = adGain(ctx, t, P[i + 1] * 0.22, 0.004, P[i + 2]); g.connect(lp);
      osc(ctx, 'sine', 196 * P[i], t, t + P[i + 2] + 0.05, g);
    }
    const bp = flt(ctx, 'bandpass', 900, 3), g = adGain(ctx, t, 0.06, 0.001, 0.03);
    bp.connect(g); g.connect(m); noise(ctx, nb.white, t, t + 0.05, bp);
  },
};

// —————————————————— 音乐声部 ——————————————————

/** 拨弦主奏：预渲染的 Karplus–Strong 缓冲，细微随机失谐 + 交替声像 */
export function lead(ctx, out, send, voice, t, dur, vel, p) {
  const s = ctx.createBufferSource(); s.buffer = voice.buffer;
  s.playbackRate.value = voice.rate * (1 + (Math.random() - 0.5) * 0.004);
  const g = gain(ctx, 0.5 * vel), pn = pan(ctx, p);
  const len = Math.min(voice.buffer.duration, Math.max(0.3, dur + 1.1));
  s.connect(g); g.connect(pn); pn.connect(out);
  const sd = gain(ctx, 0.35); pn.connect(sd); sd.connect(send);
  g.gain.setValueAtTime(0.5 * vel, t + Math.max(0.01, len - 0.08)); g.gain.linearRampToValueAtTime(0, t + len);   // 释放，避免硬停爆音
  s.start(t); s.stop(t + len);
}
/** 贝斯：三角波 + 正弦副低音，低通收着 */
export function bass(ctx, out, t, dur, midi, vel) {
  const f = mtof(midi), peak = 0.2 * vel, g = gain(ctx, 0);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.015);
  g.gain.setValueAtTime(peak, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.1);
  const lp = flt(ctx, 'lowpass', 420, 0.7); lp.connect(g); g.connect(out);
  osc(ctx, 'triangle', f, t, t + dur + 0.12, lp);
  const sub = gain(ctx, 0.6); sub.connect(lp);
  osc(ctx, 'sine', f, t, t + dur + 0.12, sub);
}
/** 铺底：两个失谐三角波，慢起慢落 */
export function pad(ctx, out, send, t, dur, midi, vel) {
  const f = mtof(midi), peak = 0.035 * vel, g = gain(ctx, 0);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.4);
  g.gain.setValueAtTime(peak, t + dur - 0.1); g.gain.linearRampToValueAtTime(0, t + dur + 0.5);
  const lp = flt(ctx, 'lowpass', 900, 0.4); lp.connect(g); g.connect(out);
  const sd = gain(ctx, 0.5); g.connect(sd); sd.connect(send);
  osc(ctx, 'triangle', f, t, t + dur + 0.55, lp, 6);
  osc(ctx, 'triangle', f, t, t + dur + 0.55, lp, -6);
}
/** 沙锤：高通噪声短颗粒 */
export function shaker(ctx, out, nb, t, vel) {
  const hp = flt(ctx, 'highpass', 6500, 0.7), g = adGain(ctx, t, 0.05 * vel, 0.002, 0.045);
  hp.connect(g); g.connect(out); noise(ctx, nb.white, t, t + 0.08, hp);
}

// —————————————————— 连续环境层 ——————————————————

/**
 * 常驻层：路面隆隆、风、海浪、棘轮、链条、呼吸。全部从静音电平起步，由 audio.js 的 update 平滑推动。
 * @returns 句柄里的 AudioParam 供 update 写入
 */
export function createBeds(ctx, ride, amb, nb) {
  const B = {};
  const loopNoise = (buffer, dest) => { const s = ctx.createBufferSource(); s.buffer = buffer; s.loop = true; s.connect(dest); s.start(); return s; };
  const lfo = (rate, depth, param) => { const o = ctx.createOscillator(); o.frequency.value = rate; const g = gain(ctx, depth); o.connect(g); g.connect(param); o.start(); };

  B.rumbleFlt = flt(ctx, 'lowpass', 120, 0.6); B.rumbleGain = gain(ctx, 0);
  loopNoise(nb.brown, B.rumbleFlt); B.rumbleFlt.connect(B.rumbleGain); B.rumbleGain.connect(ride);

  B.windFlt = flt(ctx, 'bandpass', 700, 0.7); B.windGain = gain(ctx, 0);
  loopNoise(nb.white, B.windFlt); B.windFlt.connect(B.windGain); B.windGain.connect(ride);

  const seaFlt = flt(ctx, 'lowpass', 520, 0.3); B.seaGain = gain(ctx, 0);
  loopNoise(nb.pink, seaFlt); seaFlt.connect(B.seaGain); B.seaGain.connect(amb);
  lfo(0.085, 0.03, B.seaGain.gain); lfo(0.061, 0.02, B.seaGain.gain); lfo(0.043, 160, seaFlt.frequency);

  // 棘轮：方波经高通 → 每个沿都是一次短促的高频“嗒”，频率低时是离散的哒哒声，高时连成蜂鸣
  B.tickOsc = ctx.createOscillator(); B.tickOsc.type = 'square'; B.tickOsc.frequency.value = 20;
  const hp = flt(ctx, 'highpass', 3800, 0.7), bp = flt(ctx, 'bandpass', 5200, 2.5); B.tickGain = gain(ctx, 0);
  B.tickOsc.connect(hp); hp.connect(bp); bp.connect(B.tickGain); B.tickGain.connect(ride); B.tickOsc.start();

  const chainFlt = flt(ctx, 'bandpass', 2400, 1.4); B.chainGain = gain(ctx, 0);
  loopNoise(nb.white, chainFlt); chainFlt.connect(B.chainGain); B.chainGain.connect(ride);

  const breathFlt = flt(ctx, 'bandpass', 560, 0.9), breathMod = gain(ctx, 1); B.breathGain = gain(ctx, 0);
  loopNoise(nb.white, breathFlt); breathFlt.connect(breathMod); breathMod.connect(B.breathGain); B.breathGain.connect(ride);
  B.breathLfo = ctx.createOscillator(); B.breathLfo.frequency.value = 0.8;
  const bl = gain(ctx, 0.8); B.breathLfo.connect(bl); bl.connect(breathMod.gain); B.breathLfo.start();

  return B;
}
