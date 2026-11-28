// 整个页面的总管：把规则（core/game.js）、画面（world / actors / gfx）、输入、声音、界面接在一起。
// 每一帧：取输入 → 按固定步长推进规则 → 把事件分给画面、声音、界面 → 搬到画面上 → 渲染。
import * as THREE from 'three';
import { Game } from '../core/game.js';
import { frameOf } from '../core/framing.js';
import { planJump } from '../core/bot.js';
import { CLOUD_Y } from '../core/course.js';
import { T_CHARGE, clamp } from '../core/physics.js';
import { PAL } from '../core/palette.js';
import { Stage } from '../gfx/stage.js';
import { initToon, toon, SHARED } from '../gfx/toon.js';
import { puffTexture } from '../gfx/textures.js';
import { makeSky } from '../gfx/sky.js';
import { makeCloudSea } from '../gfx/cloudsea.js';
import { Clouds } from '../gfx/clouds.js';
import { FarLands, Birds } from '../world/far.js';
import { nodeMaterial } from '../world/node.js';
import { WorldView } from './view.js';
import { CameraRig, advance } from './camera.js';
import { Input } from './input.js';
import { UI } from '../ui/ui.js';
import { Audio } from '../audio/audio.js';
import { FX } from '../actors/fx.js';
import { Wolf } from '../actors/wolf.js';

const SET_KEY = 'swing-hop.settings.v1', BEST_KEY = 'swing-hop.best.v1';
const DEFAULTS = { quality: 'auto', sound: true, volume: 0.8, shake: true, assist: false };
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 存不了就每次重来 */ } };

export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.q = new URLSearchParams(location.search);
    this.settings = { ...DEFAULTS, ...load(SET_KEY, {}) };
    this.game = new Game({ seed: (Math.random() * 4294967296) >>> 0 });
    this.game.best = load(BEST_KEY, 0) | 0;
    this.ui = new UI(this);
    this.ui.loadSeen();
    this.input = new Input();
    this.input.onKey = (k) => this.onKey(k);
    this.input.canHold = () => this.game.mode === 'play' && !this.paused && !this.ui.panelOpen && !this.overAtPending();
    this.time = 0;
    this.last = null;
    this.paused = false;
    this.slow = 0;
    this.flash = 0;
    this.autoLevel = 2;
    this.botOn = false;
    this.botPlan = null;
    this.overAt = -1;
    this.overFrame = null;
    this.solvedSway = false;
    this.fps = { win: [], warm: 5, bad: 0, calm: 0, lowered: false };
  }

  // ---------- 起来 ----------
  async boot() {
    const S = this.stage = new Stage(this.canvas);
    const ui = this.ui;
    const q = this.q;
    if (q.has('q')) this.settings.quality = q.get('q');
    if (q.has('ui') && q.get('ui') === '0') document.body.classList.add('no-ui');
    this.seed = q.has('seed') ? Number(q.get('seed')) >>> 0 : this.game.seed;
    this.game.reset(this.seed);

    ui.loading('正在铺云海…', 0.1);
    await nextFrame();
    initToon();
    this.sky = makeSky();
    this.sky.name = 'sky';
    this.sea = makeCloudSea(S.sunDir);
    this.sea.name = 'sea';
    this.clouds = new Clouds(puffTexture());
    this.clouds.group.name = 'clouds';
    S.scene.add(this.sky, this.sea, this.clouds.group);
    this.far = new FarLands(S.scene, nodeMaterial());
    this.birds = new Birds(S.scene, toon({ color: '#4A5878', side: THREE.DoubleSide, grain: 0, rim: 0 }));
    this.petalT = 0.5;
    this.world = new WorldView(S.scene);
    this.fx = new FX(S.scene);
    this.wolfView = new Wolf(S.scene);
    this.rig = new CameraRig(S.camera);
    this.audio = new Audio();
    this.audio.setEnabled(this.settings.sound, this.settings.volume);
    ui.sound(this.settings.sound);
    this.assist = this.makeAssist();
    this.assist.name = 'assist';
    S.scene.add(this.assist);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.applyQuality();
    this.rig.snap(frameOf(this.game));

    ui.loading('正在种树…', 0.3);
    await nextFrame();
    for (let k = 0; k < 80; k++) {                               // 头十来座岛一次建好，后面边玩边建
      const left = this.world.ensure(this.game, 0, 0, 11, 2);
      ui.loading(null, 0.3 + 0.4 * (1 - left / 72));
      if (!left) break;
      await nextFrame();
    }
    ui.loading('正在给秋千上漆…', 0.8);
    await nextFrame();
    this.wolfView.sync(this.game, 1 / 60, this.time, this.fx);
    this.syncCamera(0);
    try { await S.renderer.compileAsync(S.scene, S.camera); } catch { /* 不支持并行编译也没关系，第一次画的时候会编 */ }
    this.stage.render(0, 0);
    ui.loading(null, 1);
    await nextFrame();
    ui.loaded();
    ui.show('title');
    window.__sceneReady = true;                                   // 检查脚本等到这一行才开始
    this.wire();
    this.ready = true;
    if (q.get('mode') === 'play') {
      this.startGame();
      if (q.has('node')) this.warp(Number(q.get('node')) | 0, { wolf: q.has('wolf') ? Number(q.get('wolf')) : null });
    }
    if (q.get('bot') === '1') this.botOn = true;
    requestAnimationFrame(this.frame);
  }

  wire() {
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.game.mode === 'play' && !this.paused) this.action('pause'); });
  }

  resize() {
    this.stage.resize(window.innerWidth, window.innerHeight);
  }

  makeAssist() {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), toon({ color: '#FFFFFF', rim: 0, grain: 0 }), 40);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.visible = false;
    return m;
  }

  // ---------- 画质 ----------
  applyQuality() {
    const s = this.settings.quality;
    this.fixed = s === 'auto' ? null : Number(s);
    if (this.fixed != null) this.autoLevel = this.fixed;
    else if (this.fps.lowered) { this.autoLevel = 2; this.fps.lowered = false; this.fps.warm = 3; }     // 从固定档换回自动：回到最高档重新看
    this.stage.setQuality(this.autoLevel);
  }

  // 自动画质：每 45 帧看一次。帧间隔跟这台机器的最快帧间隔（刷新率）比，不跟 16 毫秒比——
  // 远程桌面、省电模式会把刷新率封在 32 赫兹，那不是显卡忙不过来。刚开始的几秒在编译、传几何，不算数；比的是中位数，偶发的长帧不代表什么
  autoQuality(real) {
    const f = this.fps;
    if (this.fixed != null || !this.ready || this.paused || this.game.mode !== 'play' || real <= 0) return;
    if ((f.warm -= real) > 0) return;
    f.win.push(real);
    if (f.win.length < 45) return;
    const w = f.win.sort((x, y) => x - y), mid = w[w.length >> 1], best = w[2];
    f.win.length = 0;
    if (mid > best * 1.5 && mid > 0.019 && this.autoLevel > 0) {
      if (++f.bad >= 2) { this.autoLevel--; f.lowered = true; this.stage.setQuality(this.autoLevel); f.bad = 0; f.calm = 0; }
    } else {
      f.bad = 0;
      if (mid < best * 1.2 && this.autoLevel < 2 && !f.lowered && ++f.calm >= 4) { this.autoLevel++; this.stage.setQuality(this.autoLevel); f.calm = 0; }
    }
  }

  // ---------- 一局的开始、结束 ----------
  startGame() {
    this.ui.show('play');
    this.game.start();
    this.input.flush();
    this.paused = false;
    this.afterReset(false);
  }

  retry(seed) {
    this.game.retry(seed ?? (Math.random() * 4294967296) >>> 0);
    this.ui.show('play');
    this.input.flush();
    this.paused = false;
    this.afterReset(true);
  }

  toTitle() {
    this.game.reset((Math.random() * 4294967296) >>> 0);
    this.ui.show('title');
    this.input.flush();
    this.paused = false;
    this.afterReset(true);
  }

  afterReset(rebuild) {
    if (rebuild) this.world.clear();
    this.overAt = -1;
    this.overFrame = null;
    this.slow = 0;
    this.flash = 0;
    this.botPlan = null;
    this.solvedSway = false;
    this.ui.score(0, this.game.best, false);
    this.ui.combo(0);
    this.ui.wolf(null);
    this.ui.charge(null);
    this.fx.clear();
  }

  // 给截图和检查用：把兔子直接放到第 n 个秋千上
  warp(n, { wolf = null } = {}) {
    const g = this.game;
    g.course.ensure(n + 12);
    g.attach(n, 0, 'ride');
    g.crackT = g.course.node(n).swing.kind === 'cracked' ? 0 : -1;                  // 站到裂缝的旧秋千上，照样开始计时
    g.stats.maxNode = n;
    if (wolf != null) { g.wolf.active = true; g.wolf.x = g.bun.x - wolf; }
    g.events.length = 0;
    this.world.clear();
    for (let k = 0; k < 40 && this.world.ensure(g, n, Math.max(0, n - 2), n + 9, 4); k++) { /* 同步建完 */ }
    this.rig.snap(frameOf(g));
    this.syncCamera(0);
  }

  // ---------- 界面上的按钮和按键 ----------
  action(name) {
    const g = this.game, ui = this.ui;
    switch (name) {
      case 'start': if (g.mode === 'title') { this.audio?.start(); this.startGame(); } break;
      case 'retry': if (g.mode === 'over') { this.audio?.start(); this.retry(); } break;
      case 'title': this.toTitle(); break;
      case 'pause': if (g.mode === 'play') this.setPaused(!this.paused); break;
      case 'resume': this.setPaused(false); break;
      case 'restart': if (g.mode === 'play' || g.mode === 'over') this.retry(); break;
      case 'mute': this.setSetting('sound', !this.settings.sound); break;
      case 'settings': case 'help': {
        const from = ui.panelOpen ? ui.from : (this.paused ? 'pause' : g.mode === 'over' ? 'over' : 'title');
        ui.openPanel(name, from);
        ui.dim(this.paused || g.mode === 'play');
        break;
      }
      case 'back':
        if (ui.from === 'pause') ui.openPanel('pause', 'pause');
        else { ui.hidePanel(); ui.dim(false); }
        break;
      default: break;
    }
  }

  onKey(k) {
    const g = this.game, ui = this.ui;
    if (k === 'mute') { this.action('mute'); return; }
    if (ui.panelOpen) {
      if (k !== 'pause' && k !== 'start') return;
      if (ui.from === 'pause' && ui.el.panelTitle.textContent !== '暂停') { this.action('back'); return; }   // 从暂停进了设置：Esc 回到暂停
      if (k === 'start' && ui.el.panelTitle.textContent === '暂停') { this.setPaused(false); return; }
      if (k === 'pause') {
        if (ui.el.panelTitle.textContent === '暂停') this.setPaused(false);
        else if (ui.from === 'pause') this.action('back');
        else { ui.hidePanel(); ui.dim(false); }
      }
      return;
    }
    if (k === 'pause') { if (g.mode === 'play') this.setPaused(!this.paused); return; }
    if (k === 'start' || k === 'retry') {
      if (g.mode === 'title') this.action('start');
      else if (g.mode === 'over' && this.overAt < 0) this.action('retry');
    }
  }

  overAtPending() { return this.overAt >= 0 && this.game.mode === 'over'; }

  setPaused(on) {
    if (this.game.mode !== 'play') on = false;
    this.paused = on;
    this.input.flush();
    this.ui.charge(null);
    if (on) { this.ui.openPanel('pause', 'pause'); this.ui.dim(true); }
    else { this.ui.hidePanel(); this.ui.dim(false); }
    this.audio?.setPaused(on);
  }

  setSetting(key, value) {
    this.settings[key] = value;
    save(SET_KEY, this.settings);
    if (key === 'quality') this.applyQuality();
    if (key === 'sound') { this.audio?.setEnabled(value, this.settings.volume); this.ui.sound(value); }
    if (key === 'volume') this.audio?.setEnabled(this.settings.sound, value);
  }

  saveBest() {
    if (this.game.score > this.game.best) this.game.best = this.game.score;
    save(BEST_KEY, this.game.best);
  }

  // ---------- 每一帧 ----------
  frame = (now) => {
    try {
      this.tick(now);
    } catch (err) {
      console.error(err);
      this.ui.fail(`出了一身冷汗——页面出错了：\n${err && err.stack ? err.stack : err}\n刷新一下再试。`);
      return;                                                     // 出错就停下，别一帧一帧地刷错误
    }
    requestAnimationFrame(this.frame);
  };

  tick(now) {
    const real = Math.min(0.05, Math.max(0, (now - (this.last ?? now)) / 1000));
    const frameStart = this.last ?? now;
    this.last = now;
    this.time += real;
    SHARED.uTime.value = this.time;
    this.autoQuality(real);
    const g = this.game, b = g.bun;

    const wolfDist = g.wolf.active && g.mode === 'play' ? b.x - g.wolf.x : null;
    if (!this.paused && !this.frozen) {
      if (this.botOn) this.bot(now);
      const events = this.input.take(frameStart);
      advance(g, real, events);
      this.handleEvents();
      this.audio?.update(real, { mode: g.mode, wolfDist, charge: g.charge < 0 ? null : clamp(g.charge / T_CHARGE, 0, 1) });
      this.slow = Math.max(0, this.slow - real * 1.1);
      this.flash = Math.max(0, this.flash - real * 3.5);
      const vdt = real * (1 - 0.78 * this.slow);
      this.world.step(g, vdt, this.time, 2);
      this.blowPetals(real);
      this.fx.step(vdt, this.time);
      this.wolfView.sync(g, vdt, this.time, this.fx);
    }

    // 危险程度：狼越近越紧张
    const danger = wolfDist == null ? 0 : clamp((13 - wolfDist) / 10, 0, 1);
    this.syncCamera(real, danger, wolfDist);
    this.stage.grade.uniforms.uDanger.value += (danger - this.stage.grade.uniforms.uDanger.value) * Math.min(1, real * 4);
    this.stage.grade.uniforms.uFlash.value = this.flash * 1.6;
    this.stage.grade.uniforms.uVignette.value = this.settings.shake ? 0.2 : 0.14;

    if (g.mode === 'play') {
      const c = g.charge < 0 ? null : clamp(g.charge / T_CHARGE, 0, 1);
      this.ui.charge(c);
      this.assist.visible = !!this.settings.assist && c != null;
      if (this.assist.visible) this.drawAssist(c);
      this.ui.hint(this.hintText());
    }
    this.stage.camera.updateMatrixWorld();                    // 飘着的加分和提示要贴着世界里的那个点，镜头动了就跟着挪
    this.ui.followPops((x, y) => this.project(x, y));
    this.stage.render(real, this.time);
  }

  syncCamera(real, danger = 0, dist = null) {
    const g = this.game, cam = this.stage.camera;
    let f = null;
    if (this.debugFrame) f = this.debugFrame;                      // 调试和截图用：强制看某个地方
    else if (!this.paused) {
      if (g.mode === 'over') {
        if (g.over.reason === 'caught') {
          if (!this.overFrame) this.overFrame = { x: g.bun.x + 0.3, y: g.bun.y + 0.9, w: Math.max(7.5, this.rig.w * 0.84) };
          f = this.overFrame;
        }
      } else f = frameOf(g);
    }
    this.rig.update(f, real, this.time, this.settings.shake ? danger : 0);
    this.sky.position.copy(cam.position);
    this.sea.position.set(cam.position.x, CLOUD_Y, cam.position.z - 120);
    this.stage.focus(this.rig.x, this.rig.y, 0);
    this.clouds.update(cam, this.time, real);
    this.far.update(cam.position.x, this.time);
    this.birds.update(cam.position.x, real, this.time);
    if (dist != null && g.mode === 'play') this.ui.wolf(dist);
    else if (!g.wolf.active || g.mode !== 'play') this.ui.wolf(null);
  }

  bump(amount) { if (this.settings.shake) this.rig.bump(amount); }

  // 隔一会儿从画面右边飘进来一片花瓣或叶子。旁边有樱花树就飘粉的
  blowPetals(real) {
    const g = this.game;
    if (g.mode !== 'play' && g.mode !== 'title') return;
    this.petalT -= real;
    if (this.petalT > 0) return;
    this.petalT = 0.35 + Math.random() * 0.8;
    const course = g.course, cur = g.bun.node;
    let pink = false;
    for (let k = 0; k <= 3; k++) if (course.node(cur + k).islet.blossom) pink = Math.random() < 0.8;
    this.fx.petal(this.rig.x + this.rig.w * 0.55, this.rig.y + (Math.random() - 0.35) * 6, pink);
  }

  drawAssist(c) {
    const pts = this.game.arc(c, 30), m = new THREE.Matrix4();
    this.assist.count = pts.length;
    pts.forEach(([x, y], k) => { m.makeScale(k % 2 ? 0.7 : 1, k % 2 ? 0.7 : 1, k % 2 ? 0.7 : 1); m.setPosition(x, y, 0); this.assist.setMatrixAt(k, m); });
    this.assist.instanceMatrix.needsUpdate = true;
  }

  // 世界里的一个点落在屏幕的哪儿（像素）
  project(x, y, z = 0) {
    const v = new THREE.Vector3(x, y, z).project(this.stage.camera);
    return [(v.x + 1) / 2 * window.innerWidth, (1 - v.y) / 2 * window.innerHeight];
  }

  // 机器人替玩家按住、松开（自动化检查和截图用）。时刻按真实时间给，不受帧的长短影响
  bot(now) {
    const g = this.game;
    if (this.botPlan) {
      if (!this.botPlan.pressed && now >= this.botPlan.pressAt) { this.input.push('press', this.botPlan.pressAt); this.botPlan.pressed = true; }
      if (this.botPlan.pressed && now >= this.botPlan.releaseAt) { this.input.push('release', this.botPlan.releaseAt); this.botPlan = null; }
      return;
    }
    if (g.bun.state === 'ride' && g.charge < 0) {
      const p = planJump(g);
      if (!p) return;
      const releaseAt = now + (p.pressIn + p.hold) * 1000;
      this.botPlan = { pressAt: releaseAt - p.hold * 1000, releaseAt, pressed: false };
    }
  }

  hintText() {
    const g = this.game, touch = this.ui.touch;
    if (g.stats.jumps === 0) return touch ? '按住屏幕蓄力，松开起跳' : '按住空格或鼠标蓄力，松开起跳';
    const next = g.course.node(g.bun.node + 1).swing;
    if (next.amp > 0 && !this.solvedSway) return '这个秋千在风里晃，看准了再松手';
    return '';
  }

  // ---------- 规则那边发出来的事件：分给画面、声音、界面 ----------
  handleEvents() {
    const g = this.game, ui = this.ui, fx = this.fx, au = this.audio;
    for (const e of g.drain()) {
      switch (e.type) {
        case 'press': au?.play('chargeStart'); break;
        case 'jump':
          fx.puff(e.x, e.y, 7, 'dust');
          au?.play('jump', e.c);
          ui.charge(null);
          break;
        case 'land': {
          this.world.tug(e.i);
          this.bump(0.03 + e.c * 0.07);
          fx.puff(e.x, e.y, 9, 'dust');
          ui.pop(`+${e.pts}`, 'gain', e.x, e.y + 1.2);
          if (e.label) setTimeout(() => ui.pop(e.label, e.kind === 'gold' ? 'gold' : 'perfect', e.x, e.y + 1.62), 110);   // “完美 / 越级 / 金币”那一行晚一点、高一点
          if (e.perfect) fx.sparkle(e.x, e.y + 0.1, 16);
          au?.play(e.perfect ? 'perfect' : 'land', e);
          ui.score(g.score, g.best, true);
          ui.combo(g.combo);
          if (g.course.node(e.i).swing.amp > 0) this.solvedSway = true;
          if (e.kind === 'gold') { fx.sparkle(e.x, e.y + 0.2, 22, true); ui.toast('金色秋千 +5'); }
          else if (e.kind === 'wide') ui.once('wide', () => ui.toast('宽板凳，好踩'));
          break;
        }
        case 'slip':
          ui.pop('哎呀', 'warn', e.x, e.y + 1.25);
          au?.play('slip');
          break;
        case 'fall': au?.play('fall'); break;
        case 'cloud': fx.puff(e.x, e.y + 0.2, 16, 'cloud'); au?.play('cloud'); break;
        case 'wolf': au?.play('howl'); ui.toast('风暴狼来了！别停', true, 2.2); break;
        case 'caught':
          this.slow = 1; this.flash = 1; this.bump(0.36);
          this.wolfView.pounce();
          fx.puff(e.x, e.y + 0.5, 18, 'storm');
          au?.play('caught');
          break;
        case 'crackWarn':
          ui.pop('快跳！', 'warn', e.x, e.y + 2.1);                          // 摞在“完美 / +分”的上面，别和它们叠在一起
          au?.play('creak');
          break;
        case 'break': au?.play('snap'); break;
        case 'over':
          this.saveBest();
          ui.score(g.score, g.best, false);
          this.overAt = this.time + (e.reason === 'caught' ? 1.25 : 0.85);
          ui.hint('');
          break;
        default: break;
      }
    }
    if (this.overAt >= 0 && this.time >= this.overAt && this.game.mode === 'over') {
      this.overAt = -1;
      ui.over(g.over);
      au?.play(g.over.record ? 'record' : 'over');
    }
  }

  // 把场景直接画进一张 HDR 缓冲再读回来：数有多少像素不是有限数（着色器里出了 NaN 多半是这样露出来的），顺带看最大亮度
  nanScan(w = 640, h = 360) {
    const r = this.stage.renderer, rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
    r.setRenderTarget(rt);
    r.render(this.stage.scene, this.stage.camera);
    const buf = new Uint16Array(w * h * 4);
    r.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    r.setRenderTarget(null);
    rt.dispose();
    let bad = 0, max = 0;
    for (let k = 0; k < buf.length; k += 4) {
      for (let c = 0; c < 3; c++) {
        const v = buf[k + c], e = (v >> 10) & 0x1f;
        if (e === 0x1f) bad++;
        else { const val = e ? Math.pow(2, e - 15) * (1 + (v & 0x3ff) / 1024) : ((v & 0x3ff) / 1024) * Math.pow(2, -14); if (val > max) max = val; }
      }
    }
    return { bad, max: +max.toFixed(2) };
  }

  // ---------- 给自动化检查用的口子 ----------
  api() {
    const app = this;
    return {
      get ready() { return !!app.ready; },
      state: () => ({ ...app.game.state(), paused: app.paused, level: app.stage.level, slow: +app.slow.toFixed(2), flash: +app.flash.toFixed(2), seen: app.overAt < 0 && app.game.mode === 'over' }),
      stats: () => {
        const r = app.stage.renderer.info;
        return { calls: r.render.calls, triangles: r.render.triangles, programs: r.programs ? r.programs.length : 0, geometries: r.memory.geometries, textures: r.memory.textures, level: app.stage.level, ratio: app.stage.renderer.getPixelRatio(), nodes: app.world.nodes.size };
      },
      press: () => app.input.push('press', performance.now()),
      release: () => app.input.push('release', performance.now()),
      hint: () => { const p = planJump(app.game); return p ? { pressIn: +p.pressIn.toFixed(4), hold: +p.hold.toFixed(4), err: +p.err.toFixed(4) } : null; },
      start: () => app.action('start'),
      retry: (seed) => app.retry(seed),
      title: () => app.toTitle(),
      pause: (on) => app.setPaused(!!on),
      bot: (on) => { app.botOn = !!on; app.botPlan = null; },
      warp: (n, o) => app.warp(n, o || {}),
      wolf: (dist) => { app.game.wolf.active = true; app.game.wolf.x = app.game.bun.x - dist; },
      quality: (q) => { app.settings.quality = String(q); app.applyQuality(); },
      setting: (k, v) => app.setSetting(k, v),
      settings: () => ({ ...app.settings, autoLevel: app.autoLevel }),
      fps: () => { const f = app.fps.win.slice().sort((x, y) => x - y); return { n: f.length, median: f.length ? +(f[f.length >> 1] * 1000).toFixed(1) : null, best: f.length ? +(f[2] * 1000).toFixed(1) : null, warm: +app.fps.warm.toFixed(1) }; },
      pressFor: (hold) => {                                        // 按住 hold 秒再松开（检查“按多久跳多远”）
        app.input.push('press', performance.now());
        app.input.push('release', performance.now() + hold * 1000);
      },
      audio: () => app.audio,
      input: () => ({ held: app.input.held, queued: app.input.events.length }),
      nanScan: (w, h) => app.nanScan(w, h),
      THREE,
      course: () => app.game.course,                                     // 调试和检查用：直接读这一局的路
      freeze: (on) => { app.frozen = !!on; },                               // 调试：规则停住，画面照常
      cam: (f) => { app.debugFrame = f; },                                  // 调试：镜头强制看 { x, y, w }
      clouds: () => (...idx) => (idx.length ? app.clouds.layers[idx[0]].bb.mesh : app.clouds.near.mesh),   // 调试：取某一层云
      stage: () => app.stage,
      vp: () => { const r = app.stage.renderer, cam = app.stage.camera, v = cam.viewport.clone(), sc = cam.viewport.clone(), sz = cam.position.clone(); r.getViewport(v); r.getScissor(sc); r.getSize(sz); return { vp: v.toArray(), sc: sc.toArray(), scissorTest: r.getScissorTest(), size: [sz.x, sz.y], pr: r.getPixelRatio(), canvas: [r.domElement.width, r.domElement.height] }; },
      scene: () => app.stage.scene,                                 // 给场景审计用
      rig: () => ({ x: app.rig.x, y: app.rig.y, w: app.rig.w }),
      measure: (n) => new Promise((resolve) => {                   // 同步画 n 帧，返回平均每帧的毫秒数
        const r = app.stage.renderer;
        r.getContext().finish();
        const t0 = performance.now();
        for (let k = 0; k < n; k++) app.stage.render(0, app.time);
        r.getContext().finish();
        resolve(+((performance.now() - t0) / n).toFixed(2));
      }),
      project: (x, y) => app.project(x, y),
      pal: PAL, CLOUD_Y, T_CHARGE,
    };
  }
}
