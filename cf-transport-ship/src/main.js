// 入口：生成贴图 → 搭渲染舞台 → 造船 → 建对局 / 输入 / 声音 / 界面 → 主循环。
import * as THREE from 'three';
import { createStage } from './gfx/stage.js';
import { createTextures } from './gfx/textures.js';
import { buildWorld } from './world/world.js';
import { setLampLevel } from './world/materials.js';
import { createGame } from './game/game.js';
import { createInput } from './game/input.js';
import { createAudio } from './game/audio.js';
import { createHud } from './ui/hud.js';
import { createMenu, loadSettings } from './ui/menu.js';

const q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const num = (k, d) => { const v = parseFloat(q.get(k)); return Number.isFinite(v) ? v : d; };
const flag = (k) => q.get(k) === '1';
const freeze = flag('freeze');
const mark = (m) => console.debug(`[ship] ${m} ${Math.round(performance.now())}ms`);   // 启动各阶段的耗时（自动化诊断用）                                // 冻结实时循环：只渲染，仿真由 window.__game.step 推进（自动化验收用）

function showError(msg) { const n = $('error'); n.textContent = msg; n.hidden = false; }

async function boot() {
  const canvas = $('view'), bar = $('loadBar'), text = $('loadText');
  const settings = loadSettings();
  for (const k of ['hour', 'team', 'size', 'target', 'fov', 'sens']) if (q.has(k)) settings[k] = num(k, settings[k]);      // URL 参数可以覆盖设置（截图 / 测试用）
  for (const k of ['diff', 'primary', 'quality']) if (q.has(k)) settings[k] = q.get(k);
  if (q.has('weapon')) settings.primary = q.get('weapon');
  const seedParam = q.has('seed') ? num('seed', 1) : 0;                    // ?seed=N：这一局的随机数固定（复现问题 / 自动化用），不存进设置
  mark('boot');
  const T = await createTextures((i, n) => { bar.style.width = `${(i / n) * 55}%`; });
  mark('textures');
  text.textContent = '正在计算天空…';
  await new Promise((r) => setTimeout(r, 0));
  const stage = createStage(canvas, T, { hour: settings.hour });
  mark('stage');
  bar.style.width = '62%';
  text.textContent = '正在造船…';
  const W = await buildWorld(stage, T, (step) => { bar.style.width = step === 'deck' ? '72%' : '86%'; });
  mark('world');
  bar.style.width = '90%';

  const { shipRoot, scene, camera } = stage;
  camera.rotation.order = 'YXZ';
  shipRoot.remove(camera); scene.add(camera);                 // 大厅里镜头不在船上

  const applyHour = () => {                                    // 时刻 → 光照、天空、海、雾、曝光、人造灯
    stage.applyTime(settings.hour);
    setLampLevel(W.M, stage.lampLevel, stage.night);
    for (const l of W.deck.lamps.night) l.visible = stage.lampLevel > 0.02;
  };
  applyHour();

  const input = createInput(canvas), audio = createAudio();
  const game = createGame({ stage, W, input, audio });
  const hud = createHud(game, input, audio);
  let mode = 'menu';                                           // menu / playing / paused / ended / free
  const isPlay = () => mode === 'playing';

  const menu = createMenu({
    settings, audio,
    onChange(key) {
      if (key === 'hour') applyHour();
      if (key === 'vol' || key === 'music') audio.setVolumes(key === 'vol' ? { master: settings.vol } : { music: settings.music });
      if (key === 'fov' && game.player) game.setFov(settings.fov);
      if (key === 'quality') { if (settings.quality === 'auto') stage.setQuality(2); else stage.setQuality(Number(settings.quality)); }
      if (key === 'roll') stage.setRoll(settings.roll);
    },
    onStart: () => startMatch(), onResume: () => resume(), onLobby: () => toLobby(),
  });
  game.onEvent = (ev) => {
    hud.event(ev);
    if (ev.type === 'end') {
      mode = 'ended'; input.enabled = false;
      menu.result({ winner: ev.winner, scores: game.state.scores, actors: game.actors, player: game.player });
      menu.show('result');
      audio.local(ev.winner === game.player.team ? 'win' : 'lose', { gain: 0.9, send: 0.5 });
    }
  };
  if (settings.quality !== 'auto') stage.setQuality(Number(settings.quality));
  text.textContent = '正在编译着色器…';
  await new Promise((r) => setTimeout(r, 0));
  try {                                                     // 预编译只是为了让开场不卡；万一哪个驱动不支持，跳过它页面照样能开
    await game.warmup(async () => { await stage.renderer.compileAsync(stage.scene, camera); await stage.renderer.compileAsync(stage.vm.scene, stage.vm.camera); });
  } catch (e) { console.warn('着色器预编译没做成，跳过：', e && e.message); }
  mark('shaders');

  // ———— 模式切换 ————
  const playCamera = (on) => { if (on) { scene.remove(camera); shipRoot.add(camera); } else { shipRoot.remove(camera); scene.add(camera); } };
  function startMatch() {
    mark('start:begin');
    audio.start();
    mark('start:audio');
    audio.setVolumes({ master: settings.vol, music: settings.music });
    applyHour(); stage.setRoll(settings.roll);
    input.sens = settings.sens; input.invertY = settings.invertY;
    game.start({ team: settings.team, size: settings.size, diff: settings.diff, primary: settings.primary, target: settings.target, fov: settings.fov, seed: seedParam || undefined });
    mark('start:game');
    playCamera(true); hud.show(true); menu.show(null);
    mode = 'playing'; input.enabled = true; input.lock();
    mark('start:done');
  }
  function pause() { if (!isPlay()) return; mode = 'paused'; input.enabled = false; menu.pauseScore(`保卫者 ${game.state.scores[0]} : ${game.state.scores[1]} 潜伏者`); menu.show('pause'); }
  function resume() { mode = 'playing'; input.enabled = true; menu.show(null); input.lock(); }
  function toLobby() {
    game.stop(); mode = 'menu'; input.enabled = false; hud.show(false); menu.show('menu'); audio.setMode('menu');
    playCamera(false); camera.fov = 36; camera.updateProjectionMatrix();
  }
  let hadLock = false;
  input.onLock = (locked) => { if (locked) hadLock = true; else { const was = hadLock; hadLock = false; if (was && isPlay()) pause(); } };
  input.onKey = (code) => { if (code === 'Escape' && !document.pointerLockElement) { if (isPlay()) pause(); else if (mode === 'paused') resume(); } };
  canvas.addEventListener('mousedown', () => { if (isPlay() && !input.locked) input.lock(); });
  if (flag('nolock')) input.lock = () => {};                   // 自动化验收：冻结仿真时不锁定鼠标，用拖动视角的退路

  const resize = () => stage.setSize(window.innerWidth, window.innerHeight);
  stage.onResize = resize;
  resize();
  camera.fov = 36; camera.updateProjectionMatrix();

  // ———— 镜头光晕：太阳在画面里、又没被船挡住时才亮 ————
  const sunV = new THREE.Vector3(), tmp = new THREE.Vector3();
  let flare = 0;
  function updateFlare(dt) {
    stage.sunScreen(sunV);
    let vis = 0;
    if (stage.keyDir) {                                             // 镜头此刻晒不晒得到太阳 / 月亮：枪模的灯和光晕都用它
      camera.getWorldPosition(tmp); shipRoot.worldToLocal(tmp);
      const d = stage.keyDir;
      vis = W.world.raycast(tmp.x, tmp.y, tmp.z, d[0], d[1], d[2], 400, null) ? 0 : 1;
    }
    stage.vm.sunVis = vis;
    if (sunV.z <= 0.5 || !stage.keyDir) vis = 0;
    flare += (vis - flare) * Math.min(1, dt * 10);
    stage.postfx.finish.uniforms.uSun.value.set(sunV.x, sunV.y, flare);
  }
  // ———— 自动画质：先量出“这台显示器一帧最快多久”（最近 600 帧里最快的 60 帧的中位数；大厅里画面轻，量到的就是刷新间隔），
  //    打起来以后最近 240 帧里比它慢三成半以上的占三成以上，就降一档（最多降两次）。
  //    用“比基准慢”而不是“帧间隔大”来判断：30 Hz 的显示器、被限速的无头浏览器帧间隔都大，但并不卡。————
  let ivs = [], baseIv = 0;
  function autoQuality(dt, active) {
    ivs.push(dt * 1000);
    if (ivs.length > 600) ivs = ivs.slice(-600);
    if (ivs.length < 60 || ivs.length % 60) return;
    const sorted = [...ivs].sort((a, b) => a - b), est = sorted[Math.min(29, sorted.length - 1)];
    if (!baseIv || est < baseIv) baseIv = est;           // 基准只会越量越快：大厅里量到的刷新间隔不会被拖慢的帧带偏
    if (!active || settings.quality !== 'auto' || freeze || stage.quality === 0 || ivs.length < 240) return;
    const slow = ivs.slice(-240).filter((v) => v > Math.max(12, baseIv * 1.35)).length;
    if (slow > 72) { stage.setQuality(stage.quality - 1); ivs = []; }
  }

  let time = 0;
  const LOBBY = { pos: [96, 6.5, -30], at: [20, 9, -4] };
  function orbitCam() {                                          // 大厅：贴着水面从左舷船头看过去——近处是船头和吊机，货舱在后面；镜头慢慢地晃
    const sway = Math.sin(time * 0.07), [px, py, pz] = LOBBY.pos, [ax, ay, az] = LOBBY.at;
    camera.position.set(px + sway * 3, py + Math.sin(time * 0.11) * 0.6, pz + sway * 4);
    camera.lookAt(ax + sway * 2, ay, az);
  }
  function renderOnce(dt) {
    if (mode === 'menu' || mode === 'ended') orbitCam();
    stage.updateShip(time);
    camera.getWorldPosition(tmp);
    stage.follow(tmp);
    W.ship.anim.radar.rotation.y = time * 2.1;
    updateFlare(dt);
    stage.render(dt, time);
  }
  function tick(dt) {
    time += dt;
    if (isPlay()) game.update(dt);
    if (frames < 3) mark('tick' + frames + ':update');
    renderOnce(dt);
    if (frames < 3) mark('tick' + frames + ':render');
    autoQuality(dt, isPlay());
    if (isPlay()) hud.update(dt);
    input.endFrame();
  }
  let last = performance.now(), frames = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    if (!freeze) tick(dt);
    else if (frames < 3) { tick(1 / 60); }
    frames++;
    if (frames === 2) window.__sceneReady = true;
  }

  // ———— 调试 / 验收接口 ————
  const P = () => game.player;
  window.__game = {
    stage, game, W, input, audio, settings, menu, hud,
    mode: () => mode,
    start: (o = {}) => { Object.assign(settings, o); startMatch(); },
    pause, resume, lobby: toLobby,
    /** 推进仿真 n 步再渲染一帧（配合 ?freeze=1） */
    step: (dt = 1 / 60, n = 1) => { for (let i = 0; i < n; i++) { game.update(dt); input.endFrame(); if (isPlay()) hud.update(dt); } renderOnce(dt); },   // 界面上的淡入淡出也按帧走
    /** 自由镜头：脱离对局看场景 */
    free: (x, y, z, yaw = 0, pitch = 0, fov = 50) => { game.stop(); mode = 'free'; playCamera(false); hud.show(false); menu.show(null); input.enabled = false; camera.fov = fov; camera.updateProjectionMatrix(); camera.position.set(x, y, z); camera.rotation.set(pitch * Math.PI / 180, -(yaw * Math.PI / 180 + Math.PI / 2), 0); },
    /** 把镜头放进玩家眼睛（玩家还活着时） */
    playCam: (yaw, pitch) => { const p = P(); if (yaw !== undefined) p.yaw = yaw * Math.PI / 180; if (pitch !== undefined) p.pitch = pitch * Math.PI / 180; },
    look: (dx, dy) => { input.mouse.dx += dx; input.mouse.dy += dy; },
    THREE,
    render: () => renderOnce(1 / 60),
    /** 量 n 帧的单帧耗时（毫秒）：每帧渲染后读回一个像素，逼 GPU 同步。取两轮里较小的一轮。 */
    measure: (n = 20) => {
      const gl = stage.renderer.getContext(), px = new Uint8Array(4), run = () => { const t0 = performance.now(); for (let i = 0; i < n; i++) { renderOnce(1 / 60); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return +((performance.now() - t0) / n).toFixed(2); };
      run(); return Math.min(run(), run());
    },
    /** 调试：枪模场景的镜头挪到侧后方去看枪（dx 向右、dy 向上、dz 向后，单位米） */
    vmSide: (dx = 0.5, dy = 0.14, dz = 0.36) => { const c = stage.vm.camera; c.userData.fov0 = c.fov; c.position.set(dx, dy, dz); c.lookAt(0, -0.1, -0.3); c.fov = 30; c.updateProjectionMatrix(); },
    vmBack: () => { const c = stage.vm.camera; c.position.set(0, 0, 0); c.quaternion.identity(); c.fov = c.userData.fov0 ?? c.fov; c.updateProjectionMatrix(); },
    key: (code, down = true) => { if (down) { input.keys.add(code); input.hit.add(code); } else input.keys.delete(code); },
    mouse: (btn, down = true) => { input.mouse.down[btn] = down; if (down) input.mouse.hit[btn] = true; },
    hour: (h) => { settings.hour = h; applyHour(); },
    frames: () => frames,
    auto: () => ({ base: +baseIv.toFixed(1), slow: ivs.slice(-240).filter((v) => v > Math.max(12, baseIv * 1.35)).length, n: ivs.length }),
    lobbyCam: (pos, at) => { LOBBY.pos = pos; if (at) LOBBY.at = at; },
    time: () => time,
    state: () => { const p = P(); return p ? { mode, phase: game.state.phase, scores: game.state.scores.slice(), left: game.state.left, now: +game.state.now.toFixed(2), slot: p.slot, weapon: p.w.id, ammo: p.w.ammo, reserve: p.w.reserve, ads: +p.w.ads.toFixed(2), reload: +p.w.reload.toFixed(2), alive: p.alive, hp: +p.hp.toFixed(1), armor: +p.armor.toFixed(1), kills: p.kills, deaths: p.deaths, x: +p.body.x.toFixed(3), y: +p.body.y.toFixed(3), z: +p.body.z.toFixed(3), vx: +p.body.vx.toFixed(2), vy: +p.body.vy.toFixed(2), vz: +p.body.vz.toFixed(2), onGround: p.body.onGround, crouch: p.crouch, yaw: +p.yaw.toFixed(4), pitch: +p.pitch.toFixed(4), fov: +camera.fov.toFixed(2), spread: +game.spread().toFixed(3) } : { mode, phase: game.state.phase }; },
    stats: () => ({ calls: stage.renderer.info.render.calls, tris: stage.renderer.info.render.triangles, q: stage.quality, dpr: stage.renderer.getPixelRatio(), buildMs: W.buildMs, texMs: 0 }),
  };
  if (q.get('hud') === '0') hud.show = () => {};                  // 只看画面（截图用）
  // 第一帧最贵（后期链、海水倒影、阴影各是一套着色器变体）：趁加载界面还在，先画两帧，大厅一出来就是流畅的
  tick(1 / 60); tick(1 / 60);
  mark('warm frames');
  bar.style.width = '100%';
  text.textContent = '完成';
  $('load').classList.add('is-done');
  if (flag('auto')) startMatch();                               // 跳过大厅直接开打（自动化验收用）
  requestAnimationFrame(frame);
}

boot().catch((e) => { console.error(e); showError(`页面启动失败：${e.message}`); });
