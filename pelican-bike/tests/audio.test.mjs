// 音频引擎测试：纯逻辑（dsp / schedule）+ 用会校验 WebAudio 规则的 mock 上下文跑完整建图流程。
// 运行：node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ksBuffer, ksRate, ksDecay, noiseBuffer, driveCurve } from '../src/audio/dsp.js';
import { SCALE, PROGRESSION, EV, STEPS_PER_BAR, chordAt, isChordTone, tempoTarget, createTempo, createSequencer, createScheduler } from '../src/audio/schedule.js';
import { createAudio } from '../src/audio/audio.js';
import { mulberry32 } from '../src/core/mathx.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const near = (a, b, eps, msg = '') => assert.ok(Math.abs(a - b) <= eps, `${msg} expected ${b} ±${eps}, got ${a}`);

// —————————————————— 会校验 WebAudio 规则的 mock ——————————————————

class Param {
  constructor(v, owner) { this._owner = owner; this.value = v; this.last = v; }
  _v(x) { if (typeof x !== 'number' || !Number.isFinite(x)) throw new Error(`AudioParam: non-finite value ${x}`); }
  _t(x) { this._v(x); if (x < 0) throw new RangeError('AudioParam: negative time'); }
  setValueAtTime(v, t) { this._t(t); this._v(v); this.last = v; }
  linearRampToValueAtTime(v, t) { this._t(t); this._v(v); this.last = v; }
  exponentialRampToValueAtTime(v, t) {
    this._t(t); this._v(v);
    if (!(v > 0)) throw new RangeError('exponentialRampToValueAtTime: target must be positive');
    if (!(this.last > 0)) throw new RangeError('exponentialRampToValueAtTime: previous value must be positive');
    this.last = v;
  }
  setTargetAtTime(v, t, tc) { this._t(t); this._v(v); this._v(tc); if (!(tc > 0)) throw new RangeError('setTargetAtTime: timeConstant must be positive'); this.last = v; }
  cancelScheduledValues() {} cancelAndHoldAtTime() {}
}
class MNode {
  constructor(ctx) { this.ctx = ctx; this.outs = []; }
  connect(dest) {
    if (!dest || typeof dest !== 'object') throw new TypeError('connect(): destination must be an AudioNode or AudioParam');
    if (dest instanceof Param && !dest._owner) throw new TypeError('connect(): not an AudioParam');   // 多路连同一个 AudioParam 是合法的（求和）
    this.outs.push(dest);
    return dest;
  }
  disconnect() {}
}
class MSource extends MNode {
  constructor(ctx) { super(ctx); this.started = false; }
  start(when = 0, offset) {
    if (this.started) throw new Error('InvalidStateError: start() called twice');
    if (!(when >= 0)) throw new RangeError('start(): negative time');
    if (offset !== undefined && this.buffer && !(offset < this.buffer.duration)) throw new RangeError('start(): offset outside buffer');
    this.started = true; this.startAt = when; this.ctx.sources++;
  }
  stop(when = 0) {
    if (!this.started) throw new Error('InvalidStateError: stop() before start()');
    if (!(when >= 0)) throw new RangeError('stop(): negative time');
    if (when < this.startAt - 1e-9) this.ctx.earlyStops++;
  }
}
class MOsc extends MSource { constructor(ctx) { super(ctx); this.type = 'sine'; this.frequency = new Param(440, this); this.detune = new Param(0, this); } }
class MBuf extends MSource { constructor(ctx) { super(ctx); this.buffer = null; this.loop = false; this.playbackRate = new Param(1, this); } }
class MGain extends MNode { constructor(ctx) { super(ctx); this.gain = new Param(1, this); } }
class MFilter extends MNode { constructor(ctx) { super(ctx); this.type = 'lowpass'; this.frequency = new Param(350, this); this.Q = new Param(1, this); this.gain = new Param(0, this); } }
class MComp extends MNode { constructor(ctx) { super(ctx); for (const k of ['threshold', 'knee', 'ratio', 'attack', 'release']) this[k] = new Param(0, this); } }
class MDelay extends MNode { constructor(ctx) { super(ctx); this.delayTime = new Param(0, this); } }
class MPanner extends MNode { constructor(ctx) { super(ctx); this.pan = new Param(0, this); } }
class MShaper extends MNode {
  constructor(ctx) { super(ctx); this.oversample = 'none'; this._c = null; }
  set curve(c) {
    if (!(c instanceof Float32Array) || c.length < 2) throw new Error('WaveShaper.curve: need a Float32Array of length >= 2');
    for (const x of c) if (!Number.isFinite(x)) throw new Error('WaveShaper.curve: non-finite sample');
    this._c = c;
  }
  get curve() { return this._c; }
}
class MockCtx {
  constructor() { this.sampleRate = 48000; this.state = 'running'; this.destination = new MNode(this); this.t0 = performance.now(); this.created = 0; this.sources = 0; this.earlyStops = 0; this.resumeCalls = 0; this.buffers = []; }
  get currentTime() { return (performance.now() - this.t0) / 1000; }
  _mk(C) { this.created++; return new C(this); }
  createGain() { return this._mk(MGain); } createOscillator() { return this._mk(MOsc); } createBufferSource() { return this._mk(MBuf); }
  createBiquadFilter() { return this._mk(MFilter); } createDynamicsCompressor() { return this._mk(MComp); } createDelay() { return this._mk(MDelay); }
  createWaveShaper() { return this._mk(MShaper); } createStereoPanner() { return this._mk(MPanner); }
  createBuffer(ch, len, sr) {
    if (!(ch > 0) || !(len > 0) || !(sr > 0)) throw new RangeError('createBuffer(): bad arguments');
    const data = new Float32Array(len);
    const b = { numberOfChannels: ch, length: len, sampleRate: sr, duration: len / sr,
      copyToChannel(arr, i) { if (!(i >= 0 && i < ch)) throw new RangeError('copyToChannel(): channel'); if (arr.length > len) throw new RangeError('copyToChannel(): too long'); data.set(arr.subarray(0, len)); },
      getChannelData: () => data };
    this.buffers.push(b);
    return b;
  }
  resume() { this.resumeCalls++; this.state = 'running'; return Promise.resolve(); }
  close() { this.state = 'closed'; return Promise.resolve(); }
}

// —————————————————— dsp ——————————————————

test('audio/dsp: Karplus–Strong 缓冲 —— 长度、无 NaN、能量衰减、T60、音高修正、确定性', () => {
  const sr = 44100, t60 = 1.0, b = ksBuffer(220, sr, 1.5, { t60, seed: 4 });
  assert.equal(b.length, Math.round(1.5 * sr));
  let peak = 0, e1 = 0, e2 = 0;
  for (let i = 0; i < b.length; i++) {
    const v = b[i];
    assert.ok(Number.isFinite(v), `NaN/Inf @${i}`);
    peak = Math.max(peak, Math.abs(v));
    const t = i / sr;
    if (t < 0.1) e1 += v * v; else if (t > 0.6 && t < 0.7) e2 += v * v;
  }
  assert.ok(peak > 0.85 && peak <= 1, `峰值归一 ${peak}`);
  assert.ok(e2 < e1 * 1e-3, `0.65s 处能量应已衰减 ≥30dB：${e2 / e1}`);     // T60=1s → 0.65s 约 −39dB
  // T60：包络（每周期最大值）首次跌破峰值 −60dB 的时刻
  const per = Math.round(sr / 220), env = [];
  for (let w = 0; (w + 1) * per <= b.length; w++) { let m = 0; for (let i = w * per; i < (w + 1) * per; i++) m = Math.max(m, Math.abs(b[i])); env.push(m); }
  let p0 = 0; for (let w = 0; w < 4; w++) p0 = Math.max(p0, env[w]);
  let t60m = NaN;
  for (let w = 0; w < env.length; w++) if (env[w] < p0 * 0.001) { t60m = (w * per) / sr; break; }
  assert.ok(t60m > 0.75 * t60 && t60m < 1.25 * t60, `实测 T60 ${t60m}`);
  assert.ok(ksDecay(220, sr, 1) < ksDecay(220, sr, 2) && ksDecay(220, sr, 2) < 1);   // T60 越短，反馈系数越小
  // 音高修正：rate × (sr / 整数周期) === 目标频率
  near(ksRate(220, sr) * (sr / Math.round(sr / 220)), 220, 1e-9);
  near(ksRate(1046.5, 48000) * (48000 / Math.round(48000 / 1046.5)), 1046.5, 1e-9);
  // 确定性
  assert.deepEqual(Array.from(ksBuffer(330, sr, 0.2, { seed: 7 })), Array.from(ksBuffer(330, sr, 0.2, { seed: 7 })));
  assert.notDeepEqual(Array.from(ksBuffer(330, sr, 0.2, { seed: 7 })), Array.from(ksBuffer(330, sr, 0.2, { seed: 8 })));
  // 高音也要健全（周期很短）
  const hi = ksBuffer(880, 48000, 0.5, { t60: 1.2 });
  assert.equal(hi.length, 24000); assert.ok(hi.every(Number.isFinite));
});

test('audio/dsp: 循环噪声 —— 确定性、范围、无缝循环、颜色差异、软削波曲线', () => {
  const sr = 48000, colors = ['white', 'pink', 'brown'], lowRatio = {};
  for (const color of colors) {
    const b = noiseBuffer(2, sr, { color, seed: 9 });
    assert.ok(b.length >= Math.floor((2 - 0.03) * sr) && b.length <= 2 * sr, `${color} 长度 ${b.length}`);
    let sum = 0, n = 0, lp = 0, eLow = 0, eAll = 0;
    for (let i = 0; i < b.length; i++) {
      const v = b[i];
      assert.ok(Number.isFinite(v) && Math.abs(v) <= 1, `${color} 越界 @${i}`);
      if (i) { sum += Math.abs(v - b[i - 1]); n++; }
      lp += 0.02 * (v - lp);
      eLow += lp * lp; eAll += v * v;
    }
    lowRatio[color] = eLow / eAll;
    assert.ok(Math.abs(b[b.length - 1] - b[0]) < 8 * (sum / n), `${color} 循环点不连续`);   // 接缝只是普通的相邻差
    assert.deepEqual(b, noiseBuffer(2, sr, { color, seed: 9 }));
  }
  assert.ok(lowRatio.brown > lowRatio.pink && lowRatio.pink > lowRatio.white, `低频占比 brown > pink > white：${JSON.stringify(lowRatio)}`);
  const c = driveCurve(6);
  assert.equal(c.length, 1024); near(c[0], -1, 1e-6); near(c[1023], 1, 1e-6);
  for (let i = 1; i < c.length; i++) assert.ok(c[i] >= c[i - 1] && Number.isFinite(c[i]));
});

// —————————————————— schedule ——————————————————

test('audio/schedule: 速度目标与平滑 —— 收敛、限幅、大步长不越界', () => {
  assert.equal(tempoTarget(0, 90), 70);            // 停车 → 70
  assert.equal(tempoTarget(NaN, 90), 70);
  assert.equal(tempoTarget(5, 0), 84);             // 骑行但没踩 → 84
  assert.equal(tempoTarget(5, 60), 138);           // 84 + 60×0.9
  assert.equal(tempoTarget(5, 400), 150);          // 上限
  assert.equal(tempoTarget(5, -3), 84);            // 负踏频按 0 处理
  const t = createTempo();
  assert.equal(t.bpm, 84);
  t.set(tempoTarget(5, 60)); for (let i = 0; i < 900; i++) t.update(1 / 60);
  near(t.bpm, 138, 0.5, '骑到 60rpm');
  t.set(tempoTarget(0, 0)); for (let i = 0; i < 900; i++) t.update(1 / 60);
  near(t.bpm, 70, 0.5, '停车');
  const rng = mulberry32(3);
  for (let i = 0; i < 5000; i++) { t.set(tempoTarget(rng() * 14, rng() * 120)); t.update(rng() * 0.2); assert.ok(Number.isFinite(t.bpm) && t.bpm >= 70 && t.bpm <= 150, `bpm 越界 ${t.bpm}`); }
});

test('audio/schedule: 和弦进行 Am–F–C–G 循环，和弦音正确', () => {
  const names = []; for (let bar = 0; bar < 8; bar++) names.push(chordAt(bar).name);
  assert.deepEqual(names, ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G']);
  assert.equal(chordAt(-1).name, 'G'); assert.equal(chordAt(4).name, 'Am');
  const pcs = PROGRESSION.map((c) => c.tones.map((m) => m % 12).sort((a, b) => a - b).join(','));
  assert.deepEqual(pcs, ['0,4,9', '0,5,9', '0,4,7', '2,7,11']);   // Am, F, C, G
  const Am = chordAt(0);
  assert.ok(isChordTone(Am, 69) && isChordTone(Am, 60) && isChordTone(Am, 64) && !isChordTone(Am, 62));
});

function collect(seq, steps, sparse, stepDur = 0.25) {
  const buf = new Float64Array(5 * 24), ev = [];
  for (let s = 0; s < steps; s++) {
    const n = seq.fill(s, s * stepDur, stepDur, sparse, buf);
    for (let i = 0; i < n; i++) { const o = i * 5; ev.push({ step: s, type: buf[o], time: buf[o + 1], dur: buf[o + 2], midi: buf[o + 3], vel: buf[o + 4] }); }
  }
  return ev;
}

test('audio/schedule: 音序器 —— 确定性、音域、强拍和弦音、不重叠、休止密度、声部位置', () => {
  const a = collect(createSequencer(42), 3200, false), b = collect(createSequencer(42), 3200, false), c = collect(createSequencer(43), 3200, false);
  assert.deepEqual(a, b, '同种子必须完全一致');
  assert.notDeepEqual(a.map((e) => e.midi), c.map((e) => e.midi), '不同种子应不同');
  const sparseEv = collect(createSequencer(42), 3200, true);
  const check = (ev, sparse) => {
    const lead = ev.filter((e) => e.type === EV.LEAD), stepsWithLead = new Set(lead.map((e) => e.step));
    for (let i = 0; i < lead.length; i++) {
      assert.ok(SCALE.includes(lead[i].midi), `音 ${lead[i].midi} 不在五声音阶`);
      assert.ok(lead[i].vel > 0 && lead[i].vel <= 1);
      if (i) assert.ok(lead[i].time - lead[i - 1].time >= 0.25 * 0.999, '旋律音符重叠');
      if (lead[i].step % STEPS_PER_BAR === 0) assert.ok(isChordTone(chordAt(lead[i].step / STEPS_PER_BAR), lead[i].midi), '强拍不是和弦音');
    }
    const rest = 1 - stepsWithLead.size / 3200;
    assert.ok(rest > 0.2 && rest < 0.7, `休止密度 ${rest}`);
    for (const e of ev) {
      const inBar = e.step % STEPS_PER_BAR, chord = chordAt((e.step / STEPS_PER_BAR) | 0);
      if (e.type === EV.LEAD) continue;
      if (e.type === EV.BASS) {
        assert.ok(inBar === 0 || inBar === 4 || (inBar === 6 && !sparse), `贝斯出现在第 ${inBar} 步`);
        assert.ok(e.midi === chord.root || e.midi === chord.root + 7 || e.midi === chord.root + 12);
      } else if (e.type === EV.PAD) assert.ok(inBar === 0 && chord.tones.includes(e.midi), '铺底只在小节首且是和弦音');
      else assert.equal(e.type, EV.SHAKER);
    }
    for (let s = 0; s < 3200; s++) assert.equal(ev.filter((e) => e.step === s && e.type === EV.SHAKER).length, 1, `第 ${s} 步沙锤数`);
    assert.equal(ev.filter((e) => e.step === 0 && e.type === EV.PAD).length, 3);
    return rest;
  };
  const restA = check(a, false), restB = check(sparseEv, true);
  assert.ok(restB > restA, `停车时应更稀疏：${restB} vs ${restA}`);
});

test('audio/schedule: 前瞻调度器 —— 不迟到、不丢步、间隔恒定；时钟跳变不补发；变 BPM', () => {
  const sch = createScheduler({ lookahead: 0.12, startDelay: 0.05 });
  sch.bpm = 120;                                   // 八分音符 0.25s
  const times = [];
  for (let i = 0; i < 1200; i++) {                 // 30 秒，每 25ms 一次
    const now = i * 0.025;
    const n = sch.tick(now, (step, time, d) => {
      assert.ok(time >= now - 1e-9 && time < now + 0.12 + 1e-9, `迟到或越界：now=${now} time=${time}`);
      assert.ok(Math.abs(d - 0.25) < 1e-12); times.push(time);
    });
    assert.ok(n <= 1, `一次 tick 发出 ${n} 步`);
  }
  assert.ok(times.length > 110 && times.length < 130, `30 秒应有约 120 步，实际 ${times.length}`);
  near(times[0], 0.05, 1e-9);
  for (let i = 1; i < times.length; i++) near(times[i] - times[i - 1], 0.25, 1e-9, '网格间隔');     // 没有丢步
  // 时钟跳变（后台标签页被节流 2 秒）：只发未来的步，数量不超过前瞻窗口
  let emitted = 0;
  const n1 = sch.tick(32.0, (step, time) => { assert.ok(time >= 32.0, '跳变后补发了过去的步'); emitted++; });
  assert.ok(n1 <= 1 && emitted === n1);
  // 变 BPM：每一步的时长跟随当时的速度
  sch.reset(0); sch.bpm = 150;
  const gaps = []; let last = NaN;
  for (let i = 0; i < 400; i++) {
    sch.bpm = i % 2 ? 150 : 100;
    sch.tick(i * 0.01, (step, time, d) => { if (Number.isFinite(last)) gaps.push(time - last); near(30 / sch.bpm, d, 1e-12); last = time; });
  }
  for (const g of gaps) assert.ok(Math.abs(g - 0.2) < 1e-9 || Math.abs(g - 0.3) < 1e-9, `间隔 ${g}`);
  // 同一种子 + 同样的 tick 时刻 → 两次运行完全一致
  const run = () => { const s = createScheduler(), q = createSequencer(5), buf = new Float64Array(120), out = []; s.bpm = 128; for (let i = 0; i < 300; i++) s.tick(i * 0.025, (st, t, d) => { const n = q.fill(st, t, d, false, buf); for (let k = 0; k < n; k++) out.push(buf[k * 5], buf[k * 5 + 1], buf[k * 5 + 2], buf[k * 5 + 3], buf[k * 5 + 4]); }); return out; };
  assert.deepEqual(run(), run());
});

// —————————————————— 门面 ——————————————————

test('audio: 没有 WebAudio 时一切静默、不抛异常', () => {
  const g = globalThis;
  const o1 = g.AudioContext, o2 = g.webkitAudioContext;
  g.AudioContext = undefined; g.webkitAudioContext = undefined;
  const a = createAudio();
  try {
    assert.equal(a.ready, false); assert.equal(a.muted, false);
    assert.equal(a.unlock(), false);
    a.setMuted(true); a.setVolume(0.3); a.setMusicEnabled(true); a.setMusicEnabled(false);
    for (const k of ['bell', 'squawk', 'jump', 'gulp', 'click', 'toggle', 'shift']) assert.equal(a.sfx[k](), false, k);
    assert.equal(a.sfx.land(1), false); assert.equal(a.sfx.splash(1), false);
    a.update(); a.update(null, NaN, null);
    for (let i = 0; i < 300; i++) a.update({ v: 5, crankVel: 6, mode: 'pedal', pedalPower: 0.7, air: false, gear: 1 }, 1 / 60, { hour: 13, cadence: 57 });
    const s = a.getState();
    assert.equal(s.ctx, 'none'); assert.equal(s.muted, true); near(s.volume, 0.3, 1e-9); assert.equal(s.music, false);
    assert.ok(s.bpm > 84 && s.bpm <= 150, `速度表仍在跟随踏频：${s.bpm}`);
    a.dispose(); a.dispose();
  } finally { g.AudioContext = o1; g.webkitAudioContext = o2; }
});

test('audio: 有 WebAudio（校验型 mock）时完整建图 —— 解锁、全部音效、连续层、音乐、静音、销毁', async () => {
  const g = globalThis, orig = g.AudioContext;
  const ctx = new MockCtx();
  g.AudioContext = function () { return ctx; };      // new AC(...) → 同一个 mock 实例
  const a = createAudio();
  try {
    a.setMusicEnabled(true);                        // 解锁前设置：只记录，不报错
    assert.equal(a.ready, false);
    assert.equal(a.unlock(), true);
    assert.equal(a.ready, true);
    a.unlock();                                      // 幂等：不重复建图
    assert.equal(ctx.resumeCalls, 0); assert.equal(ctx.earlyStops, 0);
    let s = a.getState();
    assert.equal(s.ctx, 'running'); assert.equal(s.music, true); assert.equal(s.muted, false); near(s.volume, 0.8, 1e-9);
    assert.equal(ctx.buffers.length, 3 + SCALE.length * 2, '3 个噪声 + 每个音高 2 个拨弦缓冲');
    // 全部音效
    const created0 = ctx.created;
    for (const k of ['bell', 'squawk', 'jump', 'gulp', 'click', 'toggle', 'shift']) assert.equal(a.sfx[k](), true, k);
    assert.equal(a.sfx.land(0.9), true); assert.equal(a.sfx.land(5), true); assert.equal(a.sfx.land(-1), true); assert.equal(a.sfx.splash(0.6), true);
    assert.ok(ctx.created > created0 + 20 && ctx.earlyStops === 0);
    // 音乐：25ms 调度器用真实时间跑起来
    const src0 = ctx.sources, cr0 = ctx.created;
    // 解锁时已排入第 0 步（沙锤 + 贝斯 + 3×铺底）；84 BPM 下八分音符 0.357s，之后每步至少一个沙锤
    assert.ok(ctx.created >= 22, `第 0 步的声部节点（实际 ${ctx.created}）`);
    await sleep(1000);
    assert.ok(ctx.sources >= src0 + 2, `之后应有更多步被排入（+${ctx.sources - src0}）`);
    // 连续层 + 环境事件（夜 → 浮标钟）
    const state = { v: 5, crankVel: 6, mode: 'pedal', pedalPower: 0.7, air: false, gear: 1 };
    for (let i = 0; i < 60 * 12; i++) { a.update(state, 1 / 60, { hour: 22.5, cadence: 57 }); if (i === 300) { state.mode = 'coast'; state.pedalPower = 0; } }
    assert.ok(a.getState().bpm > 120, `BPM 应跟到踏频 57 → 约 135：${a.getState().bpm}`);
    assert.ok(ctx.created > cr0, '夜里应有浮标钟等环境音');
    assert.equal(ctx.earlyStops, 0);
    // 静音：不建新节点；音效直接返回 false
    const crMute = ctx.created;
    a.setMuted(true);
    assert.equal(a.muted, true); assert.equal(a.sfx.bell(), false);
    for (let i = 0; i < 60 * 3; i++) a.update(state, 1 / 60, { hour: 22.5 });
    await sleep(120);
    assert.equal(ctx.created, crMute, '静音时 update / 调度器不应创建节点');
    a.setMuted(false);
    a.setVolume(2); near(a.getState().volume, 1, 1e-9); a.setVolume(NaN); near(a.getState().volume, 0, 1e-9); a.setVolume(0.8);
    // 关音乐 → 节点数停止增长；再开 → 恢复
    a.setMusicEnabled(false); assert.equal(a.getState().music, false);
    await sleep(150);
    const crOff = ctx.created; await sleep(200);
    assert.equal(ctx.created, crOff, '关掉音乐后不应再有节点');
    a.setMusicEnabled(true); await sleep(220);
    assert.ok(ctx.created > crOff, '重新开启后恢复排入');
    a.dispose();
    assert.equal(a.getState().ctx, 'none'); assert.equal(a.ready, false); assert.equal(ctx.state, 'closed');
    const crEnd = ctx.created; await sleep(160);
    assert.equal(ctx.created, crEnd, 'dispose 后定时器必须停止');
    assert.equal(a.sfx.bell(), false); a.unlock();                     // 销毁后可安全调用
    assert.equal(a.getState().ctx, 'none');
  } finally { g.AudioContext = orig; a.dispose(); }
});

test('audio: 上下文挂起时 unlock 触发 resume，就绪状态随之变为 true', async () => {
  const g = globalThis, orig = g.AudioContext;
  const ctx = new MockCtx(); ctx.state = 'suspended';
  ctx.resume = function () { this.resumeCalls++; return new Promise((r) => setTimeout(() => { this.state = 'running'; r(); }, 15)); };
  g.AudioContext = function () { return ctx; };
  const a = createAudio();
  try {
    assert.equal(a.unlock(), false, '尚未 running'); assert.equal(a.getState().ctx, 'suspended');
    assert.equal(a.sfx.bell(), false, '挂起时不发音效');
    await sleep(50);
    assert.equal(a.ready, true); assert.equal(a.getState().ctx, 'running'); assert.equal(ctx.resumeCalls, 1);
    assert.equal(a.sfx.bell(), true);
  } finally { g.AudioContext = orig; a.dispose(); }
});
