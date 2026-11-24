// 入口：舞台 → 世界 → 骑手 → 相机 / 输入 / 音频 / 界面，全部在这里接到一起。
// 画风有四档，默认写实：写实 = 物理光照 + 电影后期（gfx/pbr.js、gfx/postfx.js），其余三档是赛璐璐 / 排线 / 线稿。
// 权威状态只有一个：骑行速度（core/ride.js）。踏频、车轮、链条、镜头、音乐节拍都由它导出。
import * as THREE from 'three';
import { createToonEnv, beamMaterial } from './gfx/toon.js';
import { createStage } from './gfx/stage.js';
import { createStyleKit } from './gfx/pbr.js';
import { createPostFX } from './gfx/postfx.js';
import { createWorld } from './world/world.js';
import { createRider } from './actors/rider.js';
import { placeOnTrack } from './rig/trackride.js';
import { createCameraRig, CAM_MODES } from './rig/camera.js';
import { createInput } from './rig/input.js';
import { createAudio } from './audio/audio.js';
import { createUI, STYLE_LABELS } from './ui/ui.js';
import { samplePalette, formatClock, presetForHour, TOD_PRESETS } from './core/palette.js';
import { createRide, stepRide, MAX_SPEED } from './core/ride.js';
import { makeTrack } from './core/track.js';
import { BIKE } from './core/bike.js';
import { clamp, clamp01, damp, TAU } from './core/mathx.js';

const q = new URLSearchParams(location.search);
const num = (k, d) => { const v = parseFloat(q.get(k)); return Number.isFinite(v) ? v : d; };
const $ = (id) => document.getElementById(id);
const RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
const TOD_ICON = { dawn: 'sun-horizon', day: 'sun', sunset: 'sun-horizon', night: 'moon-stars' };

function boot() {
  const canvas = $('view');
  const errlog = [];
  const showError = (msg) => { const n = $('error'); n.textContent = msg; n.hidden = false; };
  window.addEventListener('error', (e) => { errlog.push(String(e.message)); console.error('[pelican]', e.message); });
  if (!document.createElement('canvas').getContext('webgl2')) {
    showError('这个浏览器没有可用的 WebGL2，画面无法显示。请换用新版 Edge、Chrome、Firefox 或 Safari 再打开。');
    return;
  }

  // ———————————————————— 状态 ————————————————————
  const S = {
    phase: q.get('intro') === '0' ? 'ride' : 'intro',
    paused: q.get('paused') === '1', userPaused: false, photo: q.get('ui') === '0', hidden: false,
    hour: num('hour', 15.4), hourTarget: null, autoTime: q.get('daycycle') === '1',
    style: clamp(Math.round(num('style', 0)), 0, 3), focus: 6,
    s: num('s', 64), time: 0, targetKmh: num('target', 15), muted: false, music: true,
    reduced: RM.matches, quality: 'auto', qLevel: 2, dprCap: 2, frameCost: 0, fpsDone: false,
    jump: false, ringBell: false, squawkT: -1, lookCamUntil: 0, glanceIn: 5, fish: null, lastFish: -9, inspector: q.get('inspect') === '1',
    wasNight: false, freeze: q.get('freeze') === '1', hudT: 0, fadeT: -1, seen: {}, debugCam: null,
  };

  // ———————————————————— 系统 ————————————————————
  const U = createToonEnv();
  const stage = createStage(canvas, U, { shadowSize: 2048, shadowExtent: 17 });
  const track = makeTrack();
  const tBuild = performance.now();
  const world = createWorld(U, { track, quality: 2 });
  const buildMs = performance.now() - tBuild;
  stage.scene.add(world.group);
  const rider = createRider(U);
  stage.scene.add(rider.hero);
  const bike = rider.bike;
  const rig = createCameraRig(stage.camera, { reducedMotion: () => S.reduced, onFov: () => stage.syncCameraUniforms() });
  const audio = createAudio();

  const pal = samplePalette(S.hour, {});
  const frame = {};
  const ride = createRide({ v: 0, target: 0 });
  const rideInput = { target: 0, gear: 1, slope: 0, jump: false };
  const s0 = ((S.s % track.length) + track.length) % track.length;
  const look = { yaw: 0, pitch: 0, roll: 0, w: 0, yawT: 0, pitchT: 0 };
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), q1 = new THREE.Quaternion(), headW = new THREE.Vector3(), headQ = new THREE.Quaternion();
  const STOP = { v: 0, crankVel: 0, mode: 'stop', pedalPower: 0, air: false, gear: 1 };
  const audioEnv = { hour: S.hour, cadence: 0, wind: 0 };

  // 车灯光锥（挂在整车上，坐标与整车一致；夜里点亮）
  const beamMat = beamMaterial(U, 0xfff0c4, { opacity: 0, power: 0.7 });
  const beamGeo = new THREE.CylinderGeometry(0.06, 1.7, 10, 16, 1, true);          // 顶(灯口)小、底(远处)大
  { const uv = beamGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i)); }   // 统一成“离灯越远 uv.y 越大”
  const beam = new THREE.Mesh(beamGeo.rotateX(-Math.PI / 2).translate(0, 0.842 - 0.5, 0.62 + 5), beamMat);
  beam.name = 'headBeam'; beam.castShadow = false; beam.frustumCulled = false; rider.hero.add(beam);

  // ———————————————————— 写实渲染层 ————————————————————
  // 画风套件：每个赛璐璐材质的 PBR 对应物、太阳 / 月光 / 路灯、大气透视雾、天空烘焙。后期链与它共用一张“画深度时要藏起来”的清单。
  const kit = createStyleKit(stage, U, { world });
  world.enableReal(kit);
  kit.postHide.push(beam, world.lighthouse.beam);
  const postfx = createPostFX(stage.renderer, stage.scene, stage.camera, kit.postHide);
  const headLight = { on: false, pos: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, 1), level: 0 };

  // 骨架检视层：细圆柱骨段 + 关节球 + 踏频圈（整车坐标）。关掉深度测试，始终画在最上面。
  const skel = new THREE.Group(); skel.name = 'inspector'; skel.visible = S.inspector; rider.hero.add(skel);
  const boneGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1), jointGeo = new THREE.SphereGeometry(1, 12, 8);
  const mkPart = (geo, color) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, fog: false })); m.renderOrder = 999; m.frustumCulled = false; skel.add(m); return m; };
  const LEG = 0xd9482f, ARM = 0x1d6fb8, INK = 0x1d1a3a, Y_AXIS = new THREE.Vector3(0, 1, 0), segDir = new THREE.Vector3();
  const setBone = (m, a, b, r) => { segDir.subVectors(b, a); const len = segDir.length() || 1e-6; m.position.copy(a).addScaledVector(segDir, 0.5); m.quaternion.setFromUnitVectors(Y_AXIS, segDir.multiplyScalar(1 / len)); m.scale.set(r, len, r); };
  const setJoint = (m, p, r) => { m.position.copy(p); m.scale.setScalar(r); };
  const B = { leg: [[mkPart(boneGeo, LEG), mkPart(boneGeo, LEG)], [mkPart(boneGeo, LEG), mkPart(boneGeo, LEG)]], arm: [[mkPart(boneGeo, ARM), mkPart(boneGeo, ARM)], [mkPart(boneGeo, ARM), mkPart(boneGeo, ARM)]], spine: mkPart(boneGeo, INK) };
  const J = { hip: [mkPart(jointGeo, LEG), mkPart(jointGeo, LEG)], knee: [mkPart(jointGeo, LEG), mkPart(jointGeo, LEG)], ankle: [mkPart(jointGeo, LEG), mkPart(jointGeo, LEG)],
    sh: [mkPart(jointGeo, ARM), mkPart(jointGeo, ARM)], el: [mkPart(jointGeo, ARM), mkPart(jointGeo, ARM)], wrist: [mkPart(jointGeo, ARM), mkPart(jointGeo, ARM)], head: mkPart(jointGeo, INK) };
  const pedalMark = [mkPart(jointGeo, INK), mkPart(jointGeo, INK)];
  for (const side of [1, -1]) {                                      // 踏频轨迹：曲柄绕中轴画出的圆
    const ring = mkPart(new THREE.TorusGeometry(BIKE.crank, 0.0075, 6, 64), INK);
    ring.rotation.y = Math.PI / 2; ring.position.set(side * BIKE.pedalX, BIKE.bb[1], BIKE.bb[2]);
  }

  // ———————————————————— 设置（持久化） ————————————————————
  const settings = { outline: 1.6, quality: 'auto', volume: 80, music: true, dayCycle: false, reduced: S.reduced, dof: true, bloom: true, bars: true, sculpt: { beak: 1, pouch: 1, neck: 1, body: 1 } };
  const ui = createUI({
    start, setTarget: (kmh) => { S.targetKmh = kmh; },
    setOutline: (px) => { settings.outline = px; U.uOutlinePx.value = px; save(); },
    setQuality: (v) => { applyQuality(v); save(); },
    setVolume: (v) => { settings.volume = v; audio.setVolume(v / 100); save(); },
    setMusic: (on) => { S.music = on; audio.setMusicEnabled(on); save(); },
    setDayCycle: (on) => { S.autoTime = on; save(); },
    setReduced: (on) => { S.reduced = on; ui.setReduced(on); save(); },
    setDof: (on) => { settings.dof = on; postfx.dofWanted = on; postfx.setQuality(S.qLevel); save(); },
    setBloom: (on) => { settings.bloom = on; applyQualityLevel(S.qLevel); save(); },
    setBars: (on) => { settings.bars = on; reflectFilm(); save(); },
    sculpt: (k, v) => { settings.sculpt[k] = v; sculptDirty = true; save(); },
    sculptReset: () => { settings.sculpt = { beak: 1, pouch: 1, neck: 1, body: 1 }; rebuildPelican(settings.sculpt); save(); },
    reset: () => doReset(),
    cam: () => switchCam(1), time: () => nextTime(), style: () => nextStyle(),
    music: () => toggleMusic(), mute: () => toggleMute(), pause: () => togglePause(), photo: () => togglePhoto(),
    hold: (a, on) => input.setHeld(a, on), act: (a) => onAction(a),
    modal: (open) => { S.paused = open || S.userPaused; },
  });
  const saved = ui.loadSettings();
  Object.assign(settings, saved);
  S.music = settings.music; S.autoTime = settings.dayCycle || S.autoTime; S.reduced = settings.reduced || RM.matches;
  let sculptDirty = false, sculptT = 0;
  if (['beak', 'pouch', 'neck', 'body'].some((k) => settings.sculpt[k] !== 1)) rider.setSculpt(settings.sculpt);   // 启动时还原已保存的造型
  function save() { settings.reduced = S.reduced; settings.dayCycle = S.autoTime; settings.music = S.music; ui.saveSettings(settings); }
  /** 电影黑边（2:1）与“电影画质”设置项只在写实画风下出现 */
  function reflectFilm() { document.body.classList.toggle('has-bars', !!settings.bars && S.style === 0); }
  ui.reflectSettings(settings, { targetKmh: S.targetKmh });
  ui.setReduced(S.reduced); ui.setPhoto(S.photo);
  U.uStyle.value = Math.max(0, S.style - 1);

  function applyQuality(v) {
    if (v === 'auto' || v === undefined) { S.quality = 'auto'; S.fpsDone = false; setQLevel(2); calibrate(); return; }
    S.quality = String(v); setQLevel(Number(v));
  }
  // 自动画质：量“每帧真实耗时”而不是帧率（刷新率低的屏幕不该被误判成性能不足）。
  // 每帧渲染后读回 1 个像素：readPixels 会真正等 GPU 画完（Chrome 里的 gl.finish 并不保证）。
  const gl = stage.renderer.getContext(), px1 = new Uint8Array(4);
  // 预热几帧再计时：换档后多重采样缓冲区要重建、着色器要重新链接，这些一次性开销不能算进“每帧耗时”
  function measureFrames(n = 10, warm = 4) {
    for (let i = 0; i < warm; i++) { tick(1 / 60); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); }
    const t0 = performance.now();
    for (let i = 0; i < n; i++) { tick(1 / 60); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px1); }
    return (performance.now() - t0) / n;
  }
  /** 在指定档位量 20 帧，量完恢复原状 */
  function measureAt(l) {
    const keep = [S.qLevel, S.dprCap];
    S.qLevel = l; S.dprCap = [1, 1.4, 2][l]; resize(); applyQualityLevel(l); applyPaletteNow();
    const cost = Math.min(measureFrames(12), measureFrames(12));           // 取两轮里较小的：剔掉调度抖动
    [S.qLevel, S.dprCap] = keep; resize(); applyQualityLevel(keep[0]); applyPaletteNow();
    return cost;
  }
  function calibrate() {
    if (S.quality !== 'auto' || S.freeze || S.hidden) return S.frameCost;
    let cost = measureAt(2), level = 2;
    if (cost > 19) { cost = measureAt(1); level = 1; }
    if (cost > 26) { cost = measureAt(0); level = 0; }                     // 上一档仍超预算才继续降
    if (level !== S.qLevel) setQLevel(level); else applyPaletteNow();
    S.frameCost = cost; S.fpsDone = true;
    return cost;
  }
  /** 档位落到各个系统：道具与海面的阴影 / 倒影、后期链（遮蔽、景深、多重采样）、描边淡出、阴影盒范围 */
  function applyQualityLevel(l) {
    world.setQuality(l);
    postfx.bloom.enabled = settings.bloom; postfx.setQuality(l);
    U.uFadeFar.value = [70, 90, 95][l]; stage.shadowEnabled = l > 0;
    stage.setShadowExtent(kit.real ? 26 : 17);           // 写实：阴影盖到近处的棕榈和路灯
  }
  function setQLevel(l) {
    if (l === S.qLevel) return;
    S.qLevel = l; S.dprCap = [1, 1.4, 2][l];
    resize(); applyQualityLevel(l);
    applyPaletteNow();                                     // 阴影灯的实际开关在调色盘应用时设置
  }
  const bufferSize = new THREE.Vector2();
  function resize() {
    stage.resize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, Math.min(devicePixelRatio || 1, S.dprCap));
    if (postfx) { stage.renderer.getDrawingBufferSize(bufferSize); postfx.setSize(bufferSize.x, bufferSize.y); }
  }

  // ———————————————————— 时刻 / 画风 ————————————————————
  function applyPaletteNow() {
    stage.applyPalette(pal, rider.hero.position); world.applyPalette(pal); U.uOutlinePx.value = settings.outline;
    if (kit.real) kit.applyLook(pal, rider.hero.position);    // 写实：物理太阳 / 月光、雾、曝光、天空烘焙
  }
  /** 换画风：材质换装 + 渲染器设置；界面随之切换成深色玻璃 */
  function applyStyle() {
    const real = S.style === 0, wasPov = S.povOn;
    kit.set(real);
    S.povOn = false; povHidden = []; if (wasPov) setPov(true);           // 第一人称隐藏的部件重新应用一遍
    document.body.classList.toggle('is-real', real); reflectFilm();
    applyQualityLevel(S.qLevel);
    if (real) kit.applyLook(pal, rider.hero.position); else applyPaletteNow();
  }
  function setHour(h) { S.hour = ((h % 24) + 24) % 24; samplePalette(S.hour, pal); applyPaletteNow(); }

  // ———————————————————— 动作 ————————————————————
  function once(key, fn) { if (!S.seen[key]) { S.seen[key] = true; fn(); } }
  function toastCam() { const m = rig.mode; ui.toast(`镜头：${m.label}，${m.hint}`, 'camera'); }
  function switchCam(dir) { rig.cycle(dir); audio.sfx.click(); toastCam(); }
  function nextTime() {
    const idx = TOD_PRESETS.findIndex((p) => p.id === presetForHour(S.hour).id), next = TOD_PRESETS[(idx + 1) % TOD_PRESETS.length];
    S.hourTarget = next.h; S.autoTime = false;
    ui.toast(`时刻：${next.label}`, TOD_ICON[next.id]); audio.sfx.toggle();
  }
  function toggleDayCycle() { S.autoTime = !S.autoTime; ui.toast(S.autoTime ? '昼夜流转：开，约 8 分钟一天' : '昼夜流转：关', 'sun-horizon'); save(); }
  function nextStyle() { S.style = (S.style + 1) % 4; applyStyle(); ui.toast(`画风：${STYLE_LABELS[S.style]}`, 'sparkle'); audio.sfx.toggle(); }
  function toggleMusic() { S.music = !S.music; audio.setMusicEnabled(S.music); ui.toast(S.music ? '音乐：开，节拍跟着踏频走' : '音乐：关', 'music-notes'); save(); }
  function toggleMute() { S.muted = !S.muted; audio.setMuted(S.muted); ui.toast(S.muted ? '已静音，按 M 恢复' : '声音：开', S.muted ? 'speaker-slash' : 'speaker-high'); }
  function togglePause() {
    if (S.phase !== 'ride') return;
    S.paused = !S.paused; S.userPaused = S.paused;
    if (S.paused) ui.toast('已暂停，按 P 继续', 'pause');
  }
  function togglePhoto() { S.photo = !S.photo; ui.setPhoto(S.photo); if (!S.photo) ui.toast('界面已显示', 'eye-slash'); }
  function ringBell() { S.ringBell = true; audio.sfx.bell(); const n = world.gullFlock.nearCount(rider.hero.position); world.gullFlock.scatter(rider.hero.position); once('bell', () => ui.toast(n > 0 ? '车铃响了两声，附近的海鸥飞开了' : '车铃响了两声', 'bell')); }
  function squawk(atCam) { S.squawkT = 0; if (atCam) S.lookCamUntil = S.time + 2.4; audio.sfx.squawk(); }
  function fishJump(point) {
    const pt = point || world.randomSeaPoint(S.s, v1).clone();
    S.fish = world.fishJump(pt);
    if (S.fish) once('fish', () => ui.toast('有鱼跃出水面', 'fish'));
    return S.fish;
  }
  function doReset() { S.s = s0; ride.v = 0; ride.target = 0; ride.crank = Math.PI / 2; S.paused = false; S.userPaused = false; rig.reset(); ui.toast('回到出发点', 'arrow-clockwise'); audio.sfx.click(); }
  function pick(nx, ny) {
    const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(nx, ny), stage.camera);
    const hit = rc.intersectObject(rider.pelican.root, true).find((h) => !h.object.userData.isOutline && !/^scarf/.test(h.object.name));
    if (hit) { squawk(true); return; }
    if (S.time - S.lastFish > 0.5) { S.lastFish = S.time; const sea = world.hitSea(rc); if (sea) fishJump(sea.point); }
  }
  function onAction(a) {
    if (S.phase === 'intro') { if (a === 'enter' || a === 'jump') start(false); return; }
    if (a === 'help') { ui.openHelp(!ui.helpOpen); return; }
    if (a === 'escape') { if (ui.helpOpen) ui.openHelp(false); else if (ui.settingsOpen) ui.openSettings(false); else if (S.photo) togglePhoto(); return; }
    if (ui.helpOpen) return;                                                 // 帮助开着时，其余按键不触发
    if (a === 'jump') { if (!S.paused) S.jump = true; }
    else if (a === 'bell') ringBell();
    else if (a === 'gear') { if (!S.paused) rideInput.gear = (ride.gear + 1) % 3; audio.sfx.shift(); }
    else if (a === 'cam') switchCam(1);
    else if (a.startsWith('cam')) { if (rig.setMode(Number(a.slice(3)))) { audio.sfx.click(); toastCam(); } }
    else if (a === 'time') nextTime();
    else if (a === 'cycle') toggleDayCycle();
    else if (a === 'style') nextStyle();
    else if (a === 'music') toggleMusic();
    else if (a === 'mute') toggleMute();
    else if (a === 'pause') togglePause();
    else if (a === 'photo') togglePhoto();
    else if (a === 'inspect') { S.inspector = !S.inspector; skel.visible = S.inspector; audio.sfx.toggle(); if (S.inspector) ui.toast('检视：红 = 腿、蓝 = 翅膀与围巾，圆圈是踏频轨迹', 'info'); }
    else if (a === 'reset') doReset();
    else if (a === 'squawk') squawk(true);
    else if (a === 'fish') fishJump();
  }
  const input = createInput(canvas, { onOrbit: (dx, dy) => rig.orbit(dx, dy), onZoom: (f) => rig.zoom(f), onPick: pick, onAction });

  function start(muted) {
    if (S.phase !== 'intro') return;
    audio.unlock();                                   // 必须在用户手势的调用栈里同步执行
    audio.setMuted(muted); S.muted = muted;
    audio.setVolume(settings.volume / 100); audio.setMusicEnabled(S.music);
    S.phase = 'ride';
    ui.setIntro(true, true); setTimeout(() => ui.setIntro(false, false), 650);
    if (rig.index === 3) rig.setMode(0); else rig.reset();
    $('stage').focus({ preventScroll: true });
    audio.sfx.click();
    once('ride', () => ui.toast('出发。海在右手边，↑ ↓ 调速，空格跳一下', 'bicycle'));
    setTimeout(() => { if (S.quality === 'auto' && !S.fpsDone) calibrate(); }, 900);   // 等开场淡出后再标定画质，避免抢帧
  }

  // ———————————————————— 视线 ————————————————————
  function updateLook(dt) {
    let yaw = 0.09 * Math.sin(S.time * 0.37), pitch = -0.03, w = 0;                 // 平时：慢慢左右张望
    const head = rider.pelican.headNode;
    if (S.fish && S.fish.alive) {
      v1.copy(S.fish.position); rider.hero.worldToLocal(v1).sub(head.position);
      if (v1.length() < 45) { yaw = clamp(Math.atan2(v1.x, v1.z), -1.15, 1.15); pitch = clamp(-Math.atan2(v1.y, Math.hypot(v1.x, v1.z)), -0.5, 0.35); w = 1; }
      else S.fish = null;
    } else S.fish = null;
    // 被点击后，或者镜头凑近到跟前时，看一眼镜头
    S.glanceIn -= dt; if (S.glanceIn < -1.6) S.glanceIn = 6 + Math.random() * 5;
    v2.copy(stage.camera.position); rider.hero.worldToLocal(v2).sub(head.position);
    const camDist = v2.length(), camFront = v2.z > 0.15 * camDist;
    if (S.time < S.lookCamUntil || (S.glanceIn < 0 && camDist < 6.5 && camFront)) {
      yaw = clamp(Math.atan2(v2.x, v2.z), -1.2, 1.2); pitch = clamp(-Math.atan2(v2.y, Math.hypot(v2.x, v2.z)), -0.5, 0.5); w = 1;
    }
    look.w = damp(look.w, w, 8, dt); look.yawT = damp(look.yawT, yaw, 10, dt); look.pitchT = damp(look.pitchT, pitch, 10, dt);
    look.yaw = look.yawT * look.w; look.pitch = look.pitchT * look.w; look.roll = look.yaw * 0.12;
  }

  // ———————————————————— 仿真一步 ————————————————————
  function simulate(dt) {
    S.time += dt;                                                              // 全局时钟：只在未暂停、页面可见时推进
    // 时刻：平滑过渡到预设，或随时间流逝
    if (S.hourTarget !== null) {
      let d = ((S.hourTarget - S.hour + 36) % 24) - 12;
      setHour(S.hour + d * Math.min(1, dt * 2.2));
      if (Math.abs(d) < 0.01) { setHour(S.hourTarget); S.hourTarget = null; }
    } else if (S.autoTime) setHour(S.hour + dt * (24 / 480));
    const night = pal.lamps > 0.5;
    if (night !== S.wasNight && S.phase === 'ride') ui.toast(night ? '天黑了，车灯和路灯亮起' : '天亮了，车灯熄灭', night ? 'moon-stars' : 'sun');
    S.wasNight = night;
    // 按住方向键持续调速
    if (S.phase === 'ride') {
      if (input.held('up')) S.targetKmh = Math.min(MAX_SPEED * 3.6, S.targetKmh + 9 * dt);
      if (input.held('down')) S.targetKmh = Math.max(0, S.targetKmh - 9 * dt);
    }
    rideInput.target = S.phase === 'ride' ? S.targetKmh / 3.6 : 0;
    rideInput.slope = track.slope(S.s); rideInput.jump = S.jump;
    ride.time = S.time;
    const events = stepRide(ride, dt, rideInput);
    S.jump = false;
    for (const e of events) {
      if (e.type === 'jump') { audio.sfx.jump(); once('jump', () => ui.toast('跳起来了，落地时喉囊会晃一下', 'arrows-vertical')); }
      if (e.type === 'land') { const k = clamp01(e.impact / 4.4); audio.sfx.land(k); world.dust(rider.hero.position, k); rig.shakeBy(0.55 * k); }
      if (e.type === 'shift') once('shift', () => ui.toast(`换到 ${ride.gear + 1} 挡。挡位越高，同样的速度踏频越低`, 'bicycle'));
    }
    S.s = (S.s + ride.v * dt) % track.length;
    const curv = track.curvatureAt(S.s);
    placeOnTrack(rider.hero, track, S.s, { airY: ride.airY, speed: ride.v, curvature: curv, jumpPitch: ride.air ? clamp(-ride.airVy * 0.045, -0.2, 0.16) : 0 }, frame);
    rider.hero.updateMatrixWorld(true);
    updateLook(dt);
    let mouth = 0;
    if (S.squawkT >= 0) { mouth = Math.pow(Math.sin(Math.PI * clamp01(S.squawkT / 0.75)), 0.6); S.squawkT += dt; if (S.squawkT > 0.75) S.squawkT = -1; }
    rider.update(ride, dt, { curvature: curv, lampLevel: pal.lamps, ringBell: S.ringBell, look, mouth });
    S.ringBell = false;
    world.update(dt, { time: S.time, heroPos: rider.hero.position, camera: stage.camera, lampLevel: pal.lamps });
    // 造型工坊：拖动时节流重建
    if (sculptDirty) { sculptT += dt; if (sculptT > 0.12) { sculptT = 0; sculptDirty = false; rebuildPelican(settings.sculpt); } }
    // 成就式提示
    if (ride.v * 3.6 > 40) once('fast', () => ui.toast('时速超过 40 公里，围巾快飞起来了', 'bird'));
    if (ride.stats.coastTime > 5) once('coast', () => ui.toast('停止踩踏，滑行中。飞轮在哒哒地响', 'arrows-vertical'));
    if (ride.distance > track.length) once('lap', () => ui.toast(`绕岛一圈，累计 ${(ride.distance / 1000).toFixed(2)} 公里`, 'map-pin'));
  }

  function updateCamera(dt) {
    if (S.debugCam) {
      const [az, el, d, ty] = S.debugCam, a = (az * Math.PI) / 180, e = (el * Math.PI) / 180, h = rider.hero;
      const off = new THREE.Vector3(Math.sin(a) * Math.cos(e) * d, Math.sin(e) * d, -Math.cos(a) * Math.cos(e) * d).applyQuaternion(h.quaternion);
      stage.camera.position.copy(h.position).add(off); stage.camera.lookAt(h.position.clone().add(new THREE.Vector3(0, ty, 0)));
      stage.camera.fov = d > 14 ? 40 : 36; stage.camera.updateProjectionMatrix(); stage.syncCameraUniforms();
      return;
    }
    rider.pelican.headNode.getWorldPosition(headW); rider.pelican.headNode.getWorldQuaternion(headQ);
    rig.update(dt, { hero: rider.hero.position, yaw: frame.yaw ?? 0, speed: ride.v, s: S.s, headPos: headW, headQuat: headQ, placeAt: (s, u) => world.spot(s, u, {}),
      offset: S.phase === 'intro' && stage.camera.aspect > 1.25 ? 1.25 : 0 });   // 开场：把鹈鹕让到卡片右侧
  }

  // 鹈鹕视角：镜头就在头里，把会挡住视线的头部部件藏起来（喙保留，低头能看见自己的喙尖）
  let povHidden = [];
  /** 重建鹈鹕后必须重新应用隐藏：新对象的部件默认都是可见的 */
  function rebuildPelican(params) { rider.setSculpt(params); kit.adopt(rider.hero); S.povOn = false; povHidden = []; }
  function setPov(on) {
    if (on === S.povOn) return;
    S.povOn = on;
    if (on) {
      const hide = new Set(['skull', 'eyeL', 'eyeR', 'helmet', 'helmetTrim', 'crest']);
      rider.pelican.headNode.traverse((o) => { if (hide.has(o.name)) { povHidden.push([o, o.visible]); o.visible = false; } });
      const neckOutline = rider.pelican.neckMesh.children.find((c) => c.userData.isOutline);
      if (neckOutline) { povHidden.push([neckOutline, neckOutline.visible]); neckOutline.visible = false; }
    } else { for (const [o, v] of povHidden) o.visible = kit.real && o.userData.isOutline ? false : v; povHidden = []; }   // 写实风格没有描边
  }
  function updateLights() {
    // 0 号光源槽：车灯
    bike.lampAnchor.getWorldPosition(v1); rider.hero.getWorldQuaternion(q1);           // 朝向用整车的：车灯锚点跟着转向总成，带着头管的倾角
    const on = bike.lamp > 0.02;
    U.uLightsPos.value[0].copy(v1); U.uLightsDir.value[0].set(0, -0.07, 1).applyQuaternion(q1).normalize();
    U.uLightsColor.value[0].setRGB(1, 0.93, 0.72); U.uLightsParam.value[0].set(0.95, 0.86, 0.9 * bike.lamp, on ? 26 : 0);
    headLight.on = on; headLight.pos.copy(v1); headLight.dir.copy(U.uLightsDir.value[0]); headLight.level = bike.lamp;      // 写实：同一盏灯的聚光灯
    beamMat.uniforms.uOpacity.value = bike.lamp * 0.34; beam.visible = on;
  }

  function updateInspector() {
    if (!S.inspector) return;
    const d = rider.pelican.debug, A = rider.anchors;
    for (const [i, k] of [[0, 'L'], [1, 'R']]) {
      setBone(B.leg[i][0], d['hip' + k], d['knee' + k], 0.012); setBone(B.leg[i][1], d['knee' + k], d['ankle' + k], 0.012);
      setJoint(J.hip[i], d['hip' + k], 0.036); setJoint(J.knee[i], d['knee' + k], 0.028); setJoint(J.ankle[i], d['ankle' + k], 0.026);
      const wrist = i === 0 ? A.gripL : A.gripR;
      setBone(B.arm[i][0], d['sh' + k], d['el' + k], 0.010); setBone(B.arm[i][1], d['el' + k], wrist, 0.010);
      setJoint(J.sh[i], d['sh' + k], 0.036); setJoint(J.el[i], d['el' + k], 0.026); setJoint(J.wrist[i], wrist, 0.024);
      setJoint(pedalMark[i], i === 0 ? A.pedalL : A.pedalR, 0.022);
    }
    setBone(B.spine, d.neckPts[0], rider.pelican.headNode.position, 0.009); setJoint(J.head, rider.pelican.headNode.position, 0.036);
  }

  function updateHud(dt) {
    S.hudT += dt;
    if (S.hudT < 1 / 15) return;
    ui.update({
      speedKmh: ride.v * 3.6, cadence: Math.abs(ride.crankVel) * 60 / TAU, gear: ride.gear, mode: ride.mode, distanceKm: ride.distance / 1000,
      clock: formatClock(S.hour), todLabel: presetForHour(S.hour).label, todIcon: TOD_ICON[presetForHour(S.hour).id],
      camLabel: rig.mode.label, camHint: rig.mode.hint, styleLabel: STYLE_LABELS[S.style], muted: S.muted, music: S.music, paused: S.paused,
    }, S.hudT);
    S.hudT = 0;
  }

  // ———————————————————— 主循环 ————————————————————
  rig.hooks.onCut = () => { S.fadeT = 0; };
  let frames = 0;
  function tick(dt) {
    const live = !S.paused && !S.hidden;
    stage.renderer.shadowMap.needsUpdate = true;             // 阴影贴图每帧只画一次（写实画风一帧要渲染好几次场景）
    if (live) simulate(dt);
    if (live || rig.mode.id !== 'director') updateCamera(dt);          // 暂停时导演机位不再切换，其余镜头仍可拖动
    setPov(!S.debugCam && rig.mode.id === 'pov');
    updateLights(); updateInspector();
    world.sky.update(S.time, stage.camera);
    audioEnv.hour = S.hour; audioEnv.cadence = Math.abs(ride.crankVel) * 60 / TAU; audioEnv.wind = clamp01(ride.v / 12);
    audio.update(live ? ride : STOP, dt, audioEnv);
    updateHud(dt);
    if (S.fadeT >= 0) { S.fadeT += dt; ui.fade(S.fadeT > 0.38 ? 0 : S.fadeT < 0.08 ? S.fadeT / 0.08 : 1 - (S.fadeT - 0.08) / 0.3); if (S.fadeT > 0.38) S.fadeT = -1; }
    if (kit.real) {
      // 景深对焦：主体沿视轴的距离（第一人称看向远处，固定 9 m；调试机位始终对准主体）
      v1.copy(rider.hero.position); v1.y += 1.15; v1.applyMatrix4(stage.camera.matrixWorldInverse);
      S.focus = damp(S.focus, S.debugCam ? Math.max(1.2, -v1.z) : rig.mode.id === 'pov' ? 9 : Math.max(1.2, -v1.z), 7, dt || 1 / 60);
      postfx.dof.uniforms.uFocus.value = S.focus;
      kit.update({ lampLevel: pal.lamps, head: headLight, world, quality: S.qLevel });
      world.renderReflection(stage.scene, stage.camera);
      stage.render(() => postfx.render(dt));
    } else stage.render();
    frames++;
  }
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    if (!S.freeze) tick(dt);
  }
  document.addEventListener('visibilitychange', () => { S.hidden = document.hidden; last = performance.now(); });
  window.addEventListener('resize', resize);
  RM.addEventListener?.('change', (e) => { if (e.matches) { S.reduced = true; ui.setReduced(true); } });

  // ———————————————————— 初始化 ————————————————————
  if (q.get('quality') !== null) applyQuality(clamp(Math.round(num('quality', 2)), 0, 2));
  resize();
  U.uOutlinePx.value = settings.outline;
  reflectFilm();
  applyStyle();                                         // 换装 + 写实光照（默认画风：写实）
  ride.gear = 1;
  if (num('v', 0) > 0) { ride.v = num('v', 0); S.targetKmh = num('target', ride.v * 3.6); ui.setTargetSlider(S.targetKmh); }
  S.s = s0;
  if (S.phase === 'intro' && !S.reduced) rig.setMode(3);
  if (q.get('cam')) rig.setMode(Math.max(0, CAM_MODES.findIndex((m) => m.id === q.get('cam'))));
  ui.setIntro(S.phase === 'intro');
  setHour(S.hour);
  for (let i = 0; i < 90; i++) simulate(1 / 60);                                   // 先跑 1.5 秒，让弹簧和围巾稳定下来
  S.time = 0; ride.time = 0;
  tick(0);
  window.__sceneReady = true;
  if (!S.freeze) requestAnimationFrame(loop);

  // ———————————————————— 调试 / QA 接口 ————————————————————
  const VIEWS = { behind: [0, 14, 6.6, 0.9], sideSea: [92, 6, 6.2, 0.9], sideLand: [-92, 6, 6.2, 0.9], front34: [38, 12, 6, 0.9], ahead: [178, 16, 7.5, 1], low: [24, 3, 4.6, 1], high: [-60, 42, 22, 0], far34: [-50, 20, 15, 0.8], close34: [60, 8, 2.6, 1.5] };
  const api = {
    settle: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); },
    step: (dt = 1 / 60, n = 1) => { for (let i = 0; i < n; i++) tick(dt); },
    stats: () => ({ ...stage.stats, buildMs: Math.round(buildMs), world: world.stats(), qLevel: S.qLevel, frameCostMs: S.frameCost ? +S.frameCost.toFixed(2) : null, dpr: stage.pixelRatio, errlog, audio: audio.getState() }),
    calibrate: () => +calibrate().toFixed(2), measureAt: (l) => +measureAt(l).toFixed(2),
    state: () => ({ phase: S.phase, paused: S.paused, v: ride.v, kmh: ride.v * 3.6, cadence: Math.abs(ride.crankVel) * 60 / TAU, gear: ride.gear, mode: ride.mode, crank: ride.crank, s: S.s, hour: S.hour, cam: rig.mode.id, style: S.style, air: ride.air, distance: ride.distance, time: S.time }),
    setView: (name) => { S.debugCam = VIEWS[name] || null; if (!S.debugCam && CAM_MODES.some((m) => m.id === name)) { rig.setMode(name); } tick(0); },
    cam: (id) => { S.debugCam = null; rig.setMode(id); tick(0); },
    pose: (o = {}) => { if (o.v !== undefined) { ride.v = o.v; S.targetKmh = o.v * 3.6; } if (o.s !== undefined) S.s = o.s; if (o.crank !== undefined) ride.crank = o.crank; api.settle(2); },
    hour: (h) => { S.hourTarget = null; setHour(h); tick(0); },
    style: (i) => { S.style = clamp(Math.round(i), 0, 3); applyStyle(); tick(0); },
    start: (muted = false) => start(muted),
    pause: (v = true) => { S.paused = v; S.userPaused = v; tick(0); },
    bell: () => ringBell(), jump: () => { S.jump = true; }, squawk: () => squawk(false), squawkLook: () => squawk(true), fish: () => fishJump(),
    gear: (g) => { rideInput.gear = g; }, target: (kmh) => { S.targetKmh = kmh; ui.setTargetSlider(kmh); },
    sculpt: (o) => { Object.assign(settings.sculpt, o); rebuildPelican(settings.sculpt); tick(0); },
    inspect: (v = true) => { S.inspector = v; skel.visible = v; tick(0); },
    fps: (n = 120) => { const t = performance.now(); for (let i = 0; i < n; i++) tick(1 / 60); return Math.round(n / ((performance.now() - t) / 1000)); },
    hero: () => rider.hero, rider, world, U, stage, kit, postfx, settings, frames: () => frames,
  };
  window.__ride = api;
  window.__viewer = { views: [...Object.keys(VIEWS), ...CAM_MODES.map((m) => m.id)], setView: (n) => api.setView(n) };
}

try { boot(); } catch (e) {
  console.error(e);
  const n = document.getElementById('error');
  if (n) { n.textContent = `页面启动失败：${e.message}。请用新版 Edge 或 Chrome 打开；如果是从本地文件打开，确认 app.js 与 index.html 在同一个文件夹里。`; n.hidden = false; }
}
