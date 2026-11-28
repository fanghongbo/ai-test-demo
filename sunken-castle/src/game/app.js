// 应用：把舞台、世界、角色、镜头、界面、声音接起来，管几种状态（标题 / 巡游 / 潜泳 / 暂停）和主循环。
// 也给自动化检查留一个 window.__game：换时刻、换水质、跳镜头、量帧耗、读状态。地址栏的参数（?hour=night&mode=free…）同样是为了这个。
import * as THREE from 'three';
import { createStage } from '../gfx/stage.js';
import { buildWorld } from '../world/build.js';
import { createLanterns } from '../actors/lanterns.js';
import { createSnow, createBubbles } from '../actors/particles.js';
import { createFish } from '../actors/fish.js';
import { createFauna } from '../actors/fauna.js';
import { createLightPools } from '../actors/lightpools.js';
import { createTour, createSwim } from './camera.js';
import { createColliders } from './collide.js';
import { SHOTS } from './tour.js';
import { createUI } from '../ui/ui.js';
import { createAudio } from '../audio/audio.js';
import { TIMES, DEFAULT_TIME, DEFAULT_CLARITY, CLARITY } from '../core/wateroptics.js';
import { placeAt, SITES } from '../core/seabed.js';

const DEFAULTS = { hour: DEFAULT_TIME, clarity: DEFAULT_CLARITY, quality: 'auto', sens: 1, sway: true, captions: true, sound: true, volume: 0.8 };
const KEY = 'sunken-castle.settings.v1';
const LIGHT_K = 46;                                         // 灯笼的点光源的强度换算（three 的点光源单位是坎德拉）
const START = { pos: [1.2, -30.6, 13], yaw: 0.06, pitch: 0.05, fov: 62 };                  // 潜泳的起点：石桥中段，离南门四十来米，面朝王城
const coarse = () => matchMedia('(pointer: coarse)').matches;
const $ = (id) => document.getElementById(id);

function loadSettings() { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; } }
function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* 存不了就算了 */ } }

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ progress?: (label: string, done: number) => void }} hooks
 */
export async function createApp(canvas, hooks = {}) {
  const Q = new URLSearchParams(location.search), settings = loadSettings(), audio = createAudio();
  const timeOf = (id) => TIMES.find((t) => t.id === id) ?? TIMES[2], clarityOf = (id) => CLARITY.find((c) => c.id === id) ?? CLARITY[1];
  for (const k of ['hour', 'clarity']) if (Q.has(k) && (k === 'hour' ? TIMES : CLARITY).some((o) => o.id === Q.get(k))) settings[k] = Q.get(k);
  if (Q.has('q') && /^(auto|[012])$/.test(Q.get('q'))) settings.quality = Q.get('q');

  // ───── 搭台：舞台、世界、灯笼、悬浮物、鱼、大动物 ─────
  const stage = createStage(canvas, { time: timeOf(settings.hour) });
  let done = 0;
  const boot = [[`舞台`, Math.round(performance.now())]];                                            // 启动各阶段用了多久（毫秒，从页面开始执行脚本算起）
  const world = await buildWorld(stage, async (label, fn) => {
    hooks.progress?.(label, (done += 18) / 100);
    await new Promise((r) => setTimeout(r));                                                          // 让出一帧，加载条上的字才画得出来
    const t0 = performance.now(), r = await fn();
    boot.push([label, Math.round(performance.now() - t0)]);
    return r;
  });
  stage.scene.add(world.group);
  const lanterns = createLanterns(world.lanterns, 10);
  lanterns.patch(stage.W.U);
  stage.scene.add(lanterns.mesh, ...lanterns.lights);
  const snow = createSnow(stage.W, stage.postfx.shafts, { count: Q.has('snow') ? +Q.get('snow') : 9000 });
  const bubbles = createBubbles(stage.W, stage.postfx.shafts, world.vents);
  const fish = createFish(stage.W), fauna = createFauna(stage.W);
  stage.scene.add(snow.points, bubbles.points, fish.group, fauna.group);
  stage.hide.push(snow.points, bubbles.points, lanterns.mesh);
  stage.onResize = (w, h, fov) => { snow.setSize(w, h, fov); bubbles.setSize(w, h, fov); };
  const colliders = createColliders(world.colliders, { radius: 0.6 });
  const pools = createLightPools(world.pools, stage.key, world.TXA.glassAtlas);
  stage.scene.add(pools.mesh);
  stage.hide.push(pools.mesh);                                                                  // 不进法线/深度的预通道：它的三角形投影后绕向是反的，算出来的法线朝下，环境光遮蔽会把下面的地面压黑

  // ───── 状态 ─────
  const A = { mode: 'title', paused: false, simT: +Q.get('t') || 40, night: 0, exhale: 3, level: 2, qualityFixed: null, freeze: false, hidden: false, frames: 0, panelAt: 0, fps: 0, calls: 0, tris: 0, lowered: false, calm: 0, applied: '' };
  const cam = stage.camera, _p = new THREE.Vector3(), _f = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
  const win = [];
  const ui = createUI(onAct, onSetting);
  const swim = createSwim(cam, canvas, colliders, { speed: 3.2, boostSpeed: 9.2, radius: 0.6, fov: 62, sens: settings.sens, sway: settings.sway ? 1 : 0, onUnlock: () => { if (A.mode === 'free' && ui.panel === null) openPanel('pause'); } });
  const tour = createTour(cam, SHOTS, { handheld: settings.sway ? 1 : 0 });

  /** 换时刻或水质：太阳、衰减、水色、曝光、彩窗、灯笼的亮度都跟着变。只有真的换了才重做天空 */
  function applyTime() {
    const key = `${settings.hour}|${settings.clarity}`;
    if (key === A.applied) return false;
    A.applied = key;
    stage.applyTime(timeOf(settings.hour), clarityOf(settings.clarity).k, false);
    A.night = stage.look.night ?? 0;
    world.AM.setGlass(stage.W.U.uWSun.value, 0.11);                                           // 彩窗透出来的光的颜色 = 走到窗子深度的日光
    pools.update(stage.sunDirW);                                                             // 彩窗的光斑跟着太阳挪
    lanterns.setNight(A.night); snow.setNight(A.night); fauna.setNight(A.night); fish.setNight(A.night);
    return true;
  }
  function applySettings() {
    saveSettings(settings);
    applyTime();
    if (settings.quality === 'auto') { if (A.qualityFixed !== null) { A.level = 2; A.lowered = false; stage.setQuality(2); } A.qualityFixed = null; }   // 自动是 null：不能拿 0 当“没固定”，0 是流畅档
    else { const l = +settings.quality; if (A.qualityFixed !== l) { A.level = l; stage.setQuality(l); } A.qualityFixed = l; }
    swim.state.sens = settings.sens; swim.state.sway = settings.sway ? 1 : 0; tour.state.handheld = settings.sway ? 1 : 0;
    audio.setOn(settings.sound); audio.setVolume(settings.volume);
    ui.toggleCaptions(settings.captions);
  }

  // ───── 模式 ─────
  const hold = () => ({ pos: cam.position.clone(), quat: cam.quaternion.clone(), fov: cam.fov });
  const startPose = () => ({ pos: new THREE.Vector3(...START.pos), quat: _q.setFromEuler(_e.set(START.pitch, START.yaw, 0, 'YXZ')).clone(), fov: START.fov });
  function toTitle() { A.mode = 'title'; A.paused = false; swim.leave(); ui.closePanel(); ui.setMode('title'); ui.showTitle(true); ui.hideCaption(); }
  function toTour(index) {
    const fresh = A.mode === 'title' || index !== undefined;
    A.mode = 'tour'; A.paused = false; swim.leave(); ui.closePanel(); ui.showTitle(false); ui.setMode('tour');
    if (fresh) tour.jump(index ?? 0);
  }
  function toFree(pose) {
    A.mode = 'free'; A.paused = false; ui.closePanel(); ui.showTitle(false); ui.setMode('free'); ui.hideCaption();
    swim.enter(pose ?? startPose()); A.exhale = 2.5;
    if (!Q.has('nolock') && !coarse()) swim.lock();
  }
  function openPanel(kind) {
    A.held = hold();
    A.mode === 'free' ? swim.leave() : 0;
    A.paused = true; A.panelAt = performance.now();
    ui.openPanel(kind, settings, A.mode === 'title' ? 'title' : A.mode);
  }
  function closePanel() {
    ui.closePanel();
    if (A.mode === 'title') return;
    A.paused = false;
    if (A.mode === 'free') { swim.enter(A.held); if (!Q.has('nolock') && !coarse()) swim.lock(); }
  }
  function setHour(i) { if (TIMES[i]) { settings.hour = TIMES[i].id; applySettings(); ui.toast(TIMES[i].name, 1.3); } }

  function onAct(name, ...args) {
    audio.start(); audio.resume(); audio.click();
    switch (name) {
      case 'tour': return toTour(ui.panel === 'pause' ? undefined : 0);
      case 'free': return toFree();
      case 'settings': case 'help': return openPanel(name);
      case 'resume': return closePanel();
      case 'back': if (ui.state.panelFrom === 'title') { ui.closePanel(); A.paused = false; return; } return closePanel();
      case 'title': return toTitle();
      case 'look': return swim.lookDelta(args[0], args[1]);
      case 'stick': return swim.setStick(args[0], args[1]);
      case 'pad': { const on = args[1]; if (args[0] === 'up') swim.setVert(on ? 1 : 0); else if (args[0] === 'down') swim.setVert(on ? -1 : 0); else swim.setBoost(on); return; }
    }
  }
  function onSetting(key, value) { settings[key] = key === 'sens' || key === 'volume' ? +value : key === 'quality' ? String(value) : value; audio.start(); applySettings(); }   // 画质一律存成字符串，和地址栏参数、默认值一个样
  addEventListener('resize', () => stage.setSize(innerWidth, innerHeight));               // 拖窗口、手机转屏：画布、后期链、悬浮物的投影都跟着变

  // ───── 键盘 ─────
  addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    audio.start(); audio.resume();
    const panel = ui.panel !== null;
    if (e.code === 'Escape') {                                                                  // 指针锁定的时候，浏览器放开鼠标会连带触发暂停，那一瞬间再来的 Esc 不算“返回”
      if (panel) { if (performance.now() - A.panelAt > 350) onAct('back'); return; }
      if (A.mode !== 'title') { e.preventDefault(); openPanel('pause'); }
      return;
    }
    if (e.repeat) return;
    if (e.code === 'KeyH') { A.hidden = !A.hidden; ui.setHidden(A.hidden); return; }
    if (e.code === 'KeyM') { settings.sound = !settings.sound; applySettings(); ui.toast(settings.sound ? '声音：开' : '声音：关', 1.4); return; }
    if ((e.code === 'Enter' || e.code === 'KeyT') && A.mode === 'title' && !panel) { audio.click(); return toTour(0); }   // 标题上 T 和回车都是开始巡游
    if (e.code === 'KeyF' && A.mode === 'title' && !panel) return toFree();
    if (e.code.startsWith('Digit')) return setHour(+e.code.slice(5) - 1);
    if (A.mode === 'title' || panel) return;
    if (e.code === 'KeyT') return A.mode === 'tour' ? toFree(tour.pose()) : toTour();
    if (A.mode === 'tour') {
      if (e.code === 'Space') { e.preventDefault(); A.paused = !A.paused; ui.toast(A.paused ? '暂停' : '继续', 1.1); }
      else if (e.code === 'ArrowRight') { A.paused = false; tour.jump(tour.state.index + 1); }
      else if (e.code === 'ArrowLeft') { A.paused = false; tour.jump(tour.state.index - 1); }
    } else if (A.mode === 'free' && e.code === 'KeyR') { swim.enter(startPose()); bubbles.exhale(START.pos, 10); ui.toast('回到石桥', 1.5); }
  });
  addEventListener('pointerdown', () => { audio.start(); audio.resume(); }, { capture: true });
  canvas.addEventListener('click', () => { if (A.mode === 'free' && ui.panel === null && !coarse()) swim.lock(); });

  // ───── 每帧 ─────
  const ventPts = world.vents.map((v) => v.p), wreckP = [SITES.wreck.x, -50, SITES.wreck.z];
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    if (last) A.fps += (1 / Math.max(now - last, 1) * 1000 - A.fps) * 0.05;
    last = now;
    if (!A.paused && !A.freeze) A.simT += dt;
    const t = A.simT;
    world.sway.update(t); fish.update(t); fauna.update(t);
    if (A.mode === 'title') {                                                                   // 标题画面：绕着王城慢慢地转
      const a = t * 0.045;                                                                // 在石桥南段的上空，从东侧到西侧慢慢地来回，看着南门
      cam.position.set(15 * Math.sin(a), -27.6 + 0.5 * Math.sin(t * 0.07), 16 - 5 * Math.cos(a * 0.7));
      cam.up.set(0, 1, 0); cam.lookAt(0, -27, -34);
      cam.fov += (54 - cam.fov) * Math.min(1, dt * 3); cam.updateProjectionMatrix();
    } else if (A.mode === 'tour') { if (!A.paused && tour.update(dt, t) === 'cut') ui.caption(tour.shot, tour.state.index, SHOTS.length); }
    else if (!A.paused) {
      swim.update(dt, t);
      if ((A.exhale -= dt) <= 0) {                                                              // 隔几秒吐一口气
        A.exhale = 5 + Math.random() * 3.5;
        cam.getWorldPosition(_p); _f.set(0, 0, -1).applyQuaternion(cam.quaternion);
        bubbles.exhale(_p.toArray(), 12 + ((Math.random() * 6) | 0), _f.toArray()); audio.exhale();
      }
    }
    cam.getWorldPosition(_p);
    snow.update(t, _p); bubbles.update(A.paused ? 0 : dt, t); lanterns.update(t, _p, LIGHT_K);
    stage.postfx.look({ bars: A.mode === 'tour' ? 1 : 0, fade: A.mode === 'tour' ? tour.state.fade : 1 });   // 巡游有电影黑边，镜头之间黑场
    pools.sync();
    stage.render(dt, t, A.paused);
    A.calls = stage.renderer.info.render.calls; A.tris = stage.renderer.info.render.triangles;
    let vent = 0;
    for (const v of ventPts) vent = Math.max(vent, 1 - Math.hypot(_p.x - v[0], _p.y - v[1], _p.z - v[2]) / 16);
    audio.update(dt, { speed: swim.state.speed, boosting: swim.state.boost01 > 0.5, mode: A.mode, night: A.night, nearWreck: Math.max(0, 1 - Math.hypot(_p.x - wreckP[0], _p.z - wreckP[2]) / 60) });
    if (vent > 0.02) audio.ventBubble(Math.max(0, vent) * dt * 5);
    ui.update({ y: _p.y, yaw: swim.state.yaw, place: placeAt(_p.x, _p.y, _p.z), hour: timeOf(settings.hour).name, clarity: clarityOf(settings.clarity).name, speed: swim.state.speed, boosting: swim.state.boost01 > 0.35 && swim.state.speed > 4, shot: tour.shot, shotT: tour.state.t / tour.shot.dur }, dt);
    // 自动画质：每 45 帧看一次。帧间隔跟这台机器的最快帧间隔（刷新率）比，而不是跟 16 毫秒比——远程桌面、省电模式会把帧率封在 32 赫兹，那不是显卡忙不过来
    // 刚换模式的那几秒在编译着色器、上传贴图，帧很慢，不算数；比的是中位数，偶发的长帧不代表什么
    if (A.qualityFixed === null && A.mode !== 'title' && !A.paused && dt > 0 && (A.warm = (A.warm ?? 5) - dt) <= 0) {
      win.push(dt);
      if (win.length >= 45) {
        win.sort((a, b) => a - b);
        const mid = win[win.length >> 1], best = win[2];
        win.length = 0;
        if (mid > best * 1.5 && mid > 0.019 && A.level > 0) { if (++A.bad >= 2) { A.level--; stage.setQuality(A.level); A.lowered = true; A.calm = 0; A.bad = 0; } }
        else { A.bad = 0; if (mid < best * 1.2 && A.level < 2 && !A.lowered && ++A.calm >= 4) { A.level++; stage.setQuality(A.level); A.calm = 0; } }
      }
    }
    if (++A.frames === 3) window.__sceneReady = true;
  }

  // ───── 起动 ─────
  applyTime(); stage.setQuality(2); stage.setSize(innerWidth, innerHeight); applySettings();
  hooks.progress?.('正在调亮每一盏灯…', 0.9);
  await stage.prewarm();                                                                        // 着色器全部编译完再揭开：不然第一次看到的东西都会让画面卡一下
  boot.push(['预热 · 发出编译', stage.prewarmParts[0]], ['预热 · 等着色器编完', stage.prewarmParts[1]], ['预热 · 逐个材质先画一遍', stage.prewarmParts[2]]);
  ui.showTitle(true); ui.setMode('title');
  if (Q.get('ui') === '0') { A.hidden = true; ui.setHidden(true); }
  requestAnimationFrame(frame);
  if (Q.get('mode') === 'tour') toTour(Q.has('shot') ? +Q.get('shot') : 0);
  else if (Q.get('mode') === 'free') toFree();

  return {
    get ready() { return A.frames >= 3; }, stage, world, fish, fauna, tour, swim, ui, audio, colliders, settings, SHOTS, TIMES, CLARITY, THREE,
    setMode: (m) => (m === 'tour' ? toTour(0) : m === 'free' ? toFree() : toTitle()),
    setTime: (id) => { settings.hour = id; applySettings(); return timeOf(id).name; },
    setClarity: (id) => { settings.clarity = id; applySettings(); return clarityOf(id).name; },
    setQuality: (q) => { settings.quality = String(q); applySettings(); },
    jumpShot: (i) => toTour(i),
    pause: (v = true) => { A.paused = !!v; },
    setFreeze: (v) => { A.freeze = !!v; },
    state: () => ({ mode: A.mode, panel: ui.panel, paused: A.paused, hour: settings.hour, clarity: settings.clarity, quality: settings.quality, level: A.level, night: +A.night.toFixed(3), fps: +A.fps.toFixed(1), pos: cam.position.toArray().map((v) => +v.toFixed(2)), shot: A.mode === 'tour' ? tour.shot.id : null, shotT: +(tour.state.t / tour.shot.dur).toFixed(3), hidden: A.hidden, locked: swim.state.locked }),
    stats: () => ({ calls: A.calls, tris: A.tris, level: A.level, dpr: stage.renderer.getPixelRatio(), fish: fish.count, colliders: colliders.list.length }),
    /** 启动各阶段用了多久：[阶段, 毫秒] */
    bootStages: () => boot.map((x) => x.slice()),
    /** 同步连画 n 帧取平均：只量渲染本身，不受刷新率封顶的影响 */
    measure: (n = 20) => { const gl = stage.renderer.getContext(), px = new Uint8Array(4), run = () => { const t0 = performance.now(); for (let i = 0; i < n; i++) { stage.render(1 / 60, A.simT, true); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return +((performance.now() - t0) / n).toFixed(2); }; run(); return Math.min(run(), run()); },
  };
}
