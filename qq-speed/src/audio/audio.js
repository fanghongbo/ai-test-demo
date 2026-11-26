// 声音：全部用 WebAudio 现场合成，页面不带任何音频文件。
//   引擎：三层振荡器（锯齿 + 方波 + 失谐锯齿）→ 软削波 → 低通，频率和音量跟转速、油门走
//   轮胎尖叫：带通噪声；风噪：低通噪声；氮气：扫频噪声
//   音效：倒计时、小喷、氮气、撞墙、集气满、圈数、冲线、界面点击……
//   背景音乐：三首用步进音序器循环的曲子（PgUp / PgDn 切换），提前 0.15 秒把音符排进音频时钟
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = [
  {
    name: '疾风 · 十一城', bpm: 143, style: 'euro',
    chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], roots: [45, 41, 48, 43],
    arp: [0, 1, 2, 1, 3, 2, 1, 0, 1, 2, 3, 2, 4, 3, 2, 1],
  },
  {
    name: '夜航', bpm: 118, style: 'synth',
    chords: [[62, 65, 69], [58, 62, 65], [60, 65, 69], [60, 64, 67]], roots: [38, 34, 41, 36],
    arp: [0, 1, 2, 3, 2, 1, 0, 2, 1, 3, 2, 1, 0, 1, 3, 2],
  },
  {
    name: '晴空极速', bpm: 130, style: 'sunny',
    chords: [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]], roots: [36, 43, 45, 41],
    lead: [64, null, 67, null, 69, null, 67, null, 64, null, 62, null, 60, null, 62, null, 64, null, 67, null, 69, null, 72, null, 71, 69, 67, null, 65, null, 64, null],
  },
];

export function createAudio() {
  const A = { ready: false, muted: false, bgm: 0, musicOn: true, bgmName: '' };
  let ctx, master, sfxBus, musicBus, noiseBuf, eng, scr, wind, boostN, scrapeN;
  let seq = null, musicGain = 0.2;

  /** 2 秒的白噪声，循环用 */
  function makeNoise() {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  const loopNoise = () => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(); return s; };

  A.init = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = A.muted ? 0 : 0.85; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicGain; musicBus.connect(master);
    noiseBuf = makeNoise();
    // 引擎
    const shaper = ctx.createWaveShaper(), curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; curve[i] = Math.tanh(x * 2.6); }       // 软削波：更像发动机的粗糙感
    shaper.curve = curve;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 1.6;
    const g = ctx.createGain(); g.gain.value = 0;
    shaper.connect(lp); lp.connect(g); g.connect(sfxBus);
    const mk = (type, detune, vol) => { const o = ctx.createOscillator(); o.type = type; o.detune.value = detune; const og = ctx.createGain(); og.gain.value = vol; o.connect(og); og.connect(shaper); o.start(); return o; };
    eng = { a: mk('sawtooth', 0, 0.5), b: mk('square', 0, 0.22), c: mk('sawtooth', 14, 0.3), d: mk('sawtooth', -14, 0.3), lp, g };
    // 轮胎尖叫
    const sb = ctx.createBiquadFilter(); sb.type = 'bandpass'; sb.frequency.value = 900; sb.Q.value = 6;
    const sg = ctx.createGain(); sg.gain.value = 0;
    loopNoise().connect(sb); sb.connect(sg); sg.connect(sfxBus);
    scr = { bp: sb, g: sg };
    // 风噪
    const wl = ctx.createBiquadFilter(); wl.type = 'lowpass'; wl.frequency.value = 520;
    const wg = ctx.createGain(); wg.gain.value = 0;
    loopNoise().connect(wl); wl.connect(wg); wg.connect(sfxBus);
    wind = { g: wg };
    // 氮气
    const bl = ctx.createBiquadFilter(); bl.type = 'bandpass'; bl.frequency.value = 1600; bl.Q.value = 1.2;
    const bg = ctx.createGain(); bg.gain.value = 0;
    loopNoise().connect(bl); bl.connect(bg); bg.connect(sfxBus);
    boostN = { bp: bl, g: bg };
    // 蹭墙
    const cl = ctx.createBiquadFilter(); cl.type = 'bandpass'; cl.frequency.value = 2600; cl.Q.value = 2;
    const cg = ctx.createGain(); cg.gain.value = 0;
    loopNoise().connect(cl); cl.connect(cg); cg.connect(sfxBus);
    scrapeN = { g: cg };
    A.ready = true;
  };
  /** 必须在用户点过页面之后调用（浏览器的自动播放限制） */
  A.resume = () => { A.init(); if (ctx.state === 'suspended') ctx.resume(); };
  A.setMuted = (m) => { A.muted = m; if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.03); };
  A.setMusicVol = (v) => { musicGain = v; if (ctx) musicBus.gain.setTargetAtTime(v, ctx.currentTime, 0.2); };

  // ————————————————— 持续的声音 —————————————————
  const st = (p, v, t = 0.04) => p.setTargetAtTime(v, ctx.currentTime, t);
  /** rpm 0..1（变速箱换挡会掉回去），load 油门 0..1，on 引擎是否在响 */
  A.engine = (rpm, load, on = true) => {
    if (!A.ready) return;
    const f = 36 + rpm * 132;
    eng.a.frequency.setTargetAtTime(f, ctx.currentTime, 0.025); eng.b.frequency.setTargetAtTime(f * 0.5, ctx.currentTime, 0.025);
    eng.c.frequency.setTargetAtTime(f * 2.005, ctx.currentTime, 0.025); eng.d.frequency.setTargetAtTime(f * 1.99, ctx.currentTime, 0.025);
    st(eng.g.gain, on ? 0.05 + load * 0.1 + rpm * 0.06 : 0, 0.05);
    st(eng.lp.frequency, 520 + rpm * 2200 + load * 900, 0.05);
  };
  /** 轮胎：level 0..1，pitch 0..1（滑得越狠越低沉） */
  A.screech = (level, pitch = 0.5) => { if (!A.ready) return; st(scr.g.gain, level * 0.3, 0.05); st(scr.bp.frequency, 1500 - pitch * 700, 0.06); };
  A.windVol = (v) => { if (A.ready) st(wind.g.gain, v * 0.1, 0.1); };
  A.boost = (level) => { if (!A.ready) return; st(boostN.g.gain, level * 0.2, 0.04); st(boostN.bp.frequency, 900 + level * 1400, 0.05); };
  A.scrape = (level) => { if (A.ready) st(scrapeN.g.gain, level * 0.22, 0.02); };

  // ————————————————— 一次性音效 —————————————————
  function tone(freq, dur, { type = 'sine', vol = 0.3, slide = 1, at = 0, bus } = {}) {
    const t0 = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0); if (slide !== 1) o.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.012, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function hiss(dur, { type = 'bandpass', f0 = 1000, f1 = f0, q = 1, vol = 0.3, at = 0, bus } = {}) {
    const t0 = ctx.currentTime + at, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.02, dur * 0.25)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t0); s.stop(t0 + dur + 0.02);
  }
  const SFX = {
    click: () => tone(1320, 0.06, { type: 'triangle', vol: 0.18 }),
    count: () => tone(880, 0.16, { type: 'square', vol: 0.16 }),
    go: () => { tone(1318, 0.6, { type: 'square', vol: 0.2 }); hiss(0.5, { f0: 500, f1: 4000, vol: 0.12 }); },
    drift: () => hiss(0.16, { f0: 1500, f1: 900, q: 4, vol: 0.2 }),
    mini: () => { hiss(0.3, { f0: 700, f1: 3800, q: 1.5, vol: 0.4 }); tone(520, 0.22, { type: 'sawtooth', vol: 0.14, slide: 2.2 }); },
    nitro: () => { hiss(1.1, { f0: 400, f1: 5200, q: 1, vol: 0.5 }); tone(80, 0.7, { type: 'sawtooth', vol: 0.16, slide: 2.6 }); tone(240, 0.5, { type: 'triangle', vol: 0.12, slide: 3.2 }); },
    double: () => { SFX.mini(); SFX.nitro(); tone(1046, 0.35, { type: 'triangle', vol: 0.2, slide: 1.5, at: 0.05 }); tone(1568, 0.4, { type: 'triangle', vol: 0.16, slide: 1.25, at: 0.14 }); },
    gas: () => { tone(988, 0.14, { type: 'triangle', vol: 0.2 }); tone(1319, 0.3, { type: 'triangle', vol: 0.2, at: 0.1 }); },
    hit: (p = 1) => { tone(110, 0.28, { type: 'sine', vol: 0.5 * p, slide: 0.32 }); hiss(0.22, { type: 'lowpass', f0: 2400, f1: 300, vol: 0.35 * p }); },
    bump: () => { tone(150, 0.12, { type: 'sine', vol: 0.22, slide: 0.5 }); hiss(0.09, { type: 'lowpass', f0: 1800, f1: 500, vol: 0.14 }); },
    perfect: () => [659, 784, 988, 1319].forEach((f, k) => tone(f, 0.3, { type: 'triangle', vol: 0.22, at: k * 0.07 })),
    lap: (last) => (last ? [784, 988, 1175, 1568] : [784, 988]).forEach((f, k) => tone(f, 0.22, { type: 'triangle', vol: 0.2, at: k * 0.11 })),
    finish: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, k) => { tone(f, 0.42, { type: 'square', vol: 0.1, at: k * 0.13 }); tone(f * 2, 0.3, { type: 'triangle', vol: 0.1, at: k * 0.13 }); }),
    rescue: () => hiss(0.5, { f0: 2600, f1: 200, q: 2, vol: 0.25 }),
    wrong: () => tone(440, 0.3, { type: 'square', vol: 0.1, slide: 0.8 }),
    itemGet: () => { tone(880, 0.1, { type: 'triangle', vol: 0.2 }); tone(1318, 0.18, { type: 'triangle', vol: 0.2, at: 0.08 }); },
    missile: () => { hiss(1.4, { f0: 2600, f1: 500, q: 3, vol: 0.3 }); tone(1500, 1.2, { type: 'sine', vol: 0.07, slide: 0.5 }); },
    boom: (v = 1) => { tone(120, 0.5, { type: 'sine', vol: 0.6 * v, slide: 0.25 }); hiss(0.7, { type: 'lowpass', f0: 3000, f1: 200, vol: 0.55 * v }); },
    spin: () => { tone(900, 0.7, { type: 'sawtooth', vol: 0.1, slide: 0.2 }); hiss(0.6, { f0: 1800, f1: 400, q: 3, vol: 0.16 }); },
    shield: () => [1046, 1318, 1568, 2093].forEach((f, k) => tone(f, 0.4, { type: 'sine', vol: 0.16, at: k * 0.06 })),
    magnet: () => { tone(220, 0.5, { type: 'sawtooth', vol: 0.12, slide: 4 }); hiss(0.5, { f0: 600, f1: 4000, q: 6, vol: 0.12 }); },
    banana: () => { tone(260, 0.16, { type: 'triangle', vol: 0.3, slide: 0.45 }); hiss(0.14, { type: 'lowpass', f0: 1200, f1: 300, vol: 0.22 }); },
    block: () => tone(1760, 0.22, { type: 'triangle', vol: 0.22, slide: 1.25 }),
    toss: () => hiss(0.32, { f0: 700, f1: 2400, q: 1.5, vol: 0.16 }),
    splash: (v = 1) => { hiss(0.9, { type: 'lowpass', f0: 6000, f1: 350, vol: 0.5 * v }); tone(320, 0.22, { type: 'sine', vol: 0.28 * v, slide: 0.5 }); },
  };
  A.play = (name, arg) => { if (A.ready) SFX[name]?.(arg); };

  // ————————————————— 背景音乐：步进音序器 —————————————————
  const TOTAL = 64;                                                                // 4 小节 × 16 个十六分音符
  function drum(kind, t, vol = 1) {
    if (kind === 'kick') { tone(150, 0.2, { type: 'sine', vol: 0.7 * vol, slide: 0.22, at: t - ctx.currentTime, bus: musicBus }); }
    else if (kind === 'snare') { hiss(0.16, { type: 'highpass', f0: 1400, vol: 0.22 * vol, at: t - ctx.currentTime, bus: musicBus }); tone(190, 0.1, { type: 'triangle', vol: 0.2 * vol, slide: 0.6, at: t - ctx.currentTime, bus: musicBus }); }
    else if (kind === 'hat') hiss(0.05, { type: 'highpass', f0: 7000, vol: 0.08 * vol, at: t - ctx.currentTime, bus: musicBus });
    else if (kind === 'ohat') hiss(0.22, { type: 'highpass', f0: 6500, vol: 0.09 * vol, at: t - ctx.currentTime, bus: musicBus });
  }
  /** 一个合成器音：dur 秒，带低通和包络 */
  function synth(n, dur, { type = 'sawtooth', vol = 0.1, cutoff = 2600, at = 0, detune = 0, decay = dur } = {}) {
    const t0 = ctx.currentTime + at, o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = type; o.frequency.value = NOTE(n); o.detune.value = detune;
    f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t0); f.frequency.exponentialRampToValueAtTime(Math.max(120, cutoff * 0.35), t0 + decay); f.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.setValueAtTime(vol, t0 + Math.max(0.012, dur - decay * 0.6)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(f); f.connect(g); g.connect(musicBus); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function playStep(song, step, t) {
    const at = t - ctx.currentTime, bar = (step >> 4) % 4, s = step & 15, chord = song.chords[bar], root = song.roots[bar];
    if (song.style === 'euro') {
      if (s % 4 === 0) drum('kick', t, 1);
      if (s === 4 || s === 12) drum('snare', t, 1);
      if (s % 2 === 0) drum('ohat', t, s % 4 === 2 ? 1 : 0.5); else drum('hat', t, 0.7);
      if (s % 2 === 0) synth(root + (s % 8 === 4 ? 12 : 0), 0.16, { type: 'square', vol: 0.16, cutoff: 900 });                     // 八分音符的贝斯，隔一个跳八度
      const n = song.arp[s]; synth(chord[n % 3] + 12 + 12 * ((n / 3) | 0), 0.14, { vol: 0.07, cutoff: 5200 });                       // 十六分音符的琶音
      if (s % 4 === 2) for (const q of chord) for (const d of [-7, 7]) synth(q, 0.13, { vol: 0.022, cutoff: 2400, detune: d });      // 反拍上的短和弦
      if (step % 32 === 30) { drum('snare', t, 0.6); drum('snare', t + 0.09, 0.7); }                    // 过门：两下军鼓
    } else if (song.style === 'synth') {
      if (s === 0 || s === 8 || (bar % 2 === 1 && s === 11)) drum('kick', t, 1);
      if (s === 4 || s === 12) drum('snare', t, 0.9);
      if (s % 2 === 0) drum('hat', t, s % 4 === 2 ? 1 : 0.55);
      if (s % 2 === 0) synth(root + (s % 8 === 6 ? 12 : 0), 0.3, { type: 'sawtooth', vol: 0.13, cutoff: 520 });
      const n = song.arp[s]; synth(chord[n % 3] + 12, 0.2, { vol: 0.05, cutoff: 3600 });
      if (s === 0) for (const q of chord) for (const d of [-9, 0, 9]) synth(q, 60 / song.bpm * 4, { vol: 0.02, cutoff: 1500, detune: d, decay: 3.4 });   // 长音的和弦垫
    } else {
      if (s === 0 || s === 8) drum('kick', t, 1);
      if (s === 4 || s === 12) drum('snare', t, 0.7);
      drum('hat', t, s % 2 === 0 ? 0.8 : 0.4);
      if (s % 2 === 0) synth(root + 12 + (s % 8 === 6 ? 12 : 0), 0.2, { type: 'triangle', vol: 0.2, cutoff: 1400 });
      const n = song.lead[(step >> 1) % 32];                                                        // 八分音符的旋律
      if (n !== null && s % 2 === 0) synth(n + 12, 0.3, { type: 'triangle', vol: 0.13, cutoff: 4200 });
      if (s === 0) for (const q of chord) synth(q, 60 / song.bpm * 4, { vol: 0.014, cutoff: 1300, decay: 3.2 });
    }
  }
  function startSong(k) {
    A.bgm = ((k % SONGS.length) + SONGS.length) % SONGS.length;
    if (seq) clearInterval(seq);
    if (!ctx) return;
    const song = SONGS[A.bgm], stepDur = 60 / song.bpm / 4;
    A.bgmName = song.name;
    let step = 0, next = ctx.currentTime + 0.08;
    const tick = () => {
      while (next < ctx.currentTime + 0.16) {
        if (A.musicOn) playStep(song, step, next);
        step = (step + 1) % TOTAL; next += stepDur;
      }
    };
    seq = setInterval(tick, 40); tick();
  }
  A.startMusic = () => startSong(A.bgm);
  A.nextMusic = (dir = 1) => { startSong(A.bgm + dir); return A.bgmName; };
  A.stopMusic = () => { if (seq) clearInterval(seq); seq = null; };
  A.setMusicOn = (on) => { A.musicOn = on; };
  A.dispose = () => { A.stopMusic(); if (ctx) ctx.close(); };
  return A;
}

/** 转速表：按挡位把车速折成 0..1 的转速，每次换挡转速掉回去 */
const GEARS = [0, 42, 78, 118, 162, 214, 330];
export function rpmOf(kmh) {
  kmh = Math.abs(kmh);
  for (let g = 0; g + 1 < GEARS.length; g++) {
    if (kmh < GEARS[g + 1]) return 0.2 + 0.8 * Math.min(1, (kmh - GEARS[g]) / (GEARS[g + 1] - GEARS[g]));
  }
  return 1;
}
