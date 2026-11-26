// 入口：生成贴图 → 搭渲染舞台 → 造城市和赛道 → 建比赛 → 主循环。
// 流程：大厅（车库里的环绕镜头）→ 开场电影镜头 → 倒计时 → 比赛 → 冲线慢镜 → 结算 → 回到大厅。
// 调试参数：?autostart=1 跳过大厅  ?skipintro=1  ?ai=1 让电脑代开玩家的车  ?hour=22  ?quality=0..2
//          ?cam=x,y,z,朝向,仰角,视野 或 ?orbit=目标x,y,z,距离,方位角,高度角,视野（自由镜头看场景，不出界面）
import * as THREE from 'three';
import { createStage } from './gfx/stage.js';
import { createMaterials, setLampLevel, tickMaterials } from './world/materials.js';
import { createTrack } from './core/trackdef.js';
import { noiseTexture, waterNormalTexture } from './gfx/datatex.js';
import { trackInfo, buildTrack } from './world/track.js';
import { buildLand } from './world/land.js';
import { buildCity } from './world/city.js';
import { buildLandmarks } from './world/landmarks.js';
import { buildProps } from './world/props.js';
import { WATER_Y } from './world/landdef.js';
import { DEG } from './core/mathx.js';
import { TIMES } from './core/palette.js';
import { CARS, RIVALS } from './core/cardef.js';
import { createCarModel, poseCar } from './actors/car.js';
import { buildRacingLine } from './game/raceline.js';
import { createRace, ORDINAL } from './game/race.js';
import { createAiDriver, aiThink } from './game/ai.js';
import { createInput } from './game/input.js';
import { createCameraRig } from './game/camera.js';
import { createFx } from './fx/fx.js';
import { createItemFx } from './actors/itemfx.js';
import { ITEMS } from './game/items.js';
import { createAudio, rpmOf } from './audio/audio.js';
import { createHud, fmt } from './ui/hud.js';
import { createUi, LEVELS, loadSettings, saveSettings } from './ui/ui.js';

const q = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const num = (k, d) => { const v = parseFloat(q.get(k)); return Number.isFinite(v) ? v : d; };
const nums = (k) => (q.has(k) ? q.get(k).split(',').map(Number) : null);
const has = (k) => q.get(k) === '1';
const mark = (m) => console.debug(`[nova] ${m} ${Math.round(performance.now())}ms`);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const FIXED = 1 / 120, INTRO_LEN = 3.6, FINISH_LEN = 3.2;
const RACING = ['intro', 'countdown', 'race', 'finish'];

function showError(msg) { const n = $('error'); n.textContent = msg; n.hidden = false; }

async function boot() {
  const canvas = $('view'), bar = $('loadBar'), text = $('loadText');
  const settings = loadSettings();
  const hour = num('hour', TIMES.find((t) => t.id === settings.time)?.hour ?? 15.5);
  const progress = (a, b, label) => (p) => { bar.style.width = `${a + (b - a) * p}%`; text.textContent = label; };
  mark('boot');
  text.textContent = '正在铺设赛道…';
  const track = createTrack(), RL = buildRacingLine(track);
  const T = { noise: noiseTexture(256), waterN: waterNormalTexture(256) };
  const stage = createStage(canvas, T, { hour, seaY: WATER_Y });
  mark('stage');
  const M = await createMaterials((p) => { bar.style.width = `${4 + p * 50}%`; text.textContent = `正在生成贴图 ${Math.round(p * 100)}%`; });
  M.waterfall.uniforms.tNoise.value = M.jet.uniforms.tNoise.value = T.noise;
  mark('textures');
  const info = trackInfo(track);
  const land = buildLand(track, M, info, progress(56, 68, '正在填海造城…'));
  stage.scene.add(land.group);
  const tw = buildTrack(track, M, info);
  stage.scene.add(tw.group);
  mark('track');
  const city = buildCity(track, M, progress(68, 78, '正在建造城市…'));
  stage.scene.add(city.group);
  const lm = buildLandmarks(track, M, progress(78, 85, '正在建造地标…'));
  stage.scene.add(lm.group);
  const props = buildProps(track, M, city.lots, progress(85, 92, '正在布置街道…'));
  stage.scene.add(props.group);
  mark('world');

  // ———— 游戏、界面、声音 ————
  const hud = createHud(track), input = createInput(window), audio = createAudio(), rig = createCameraRig(stage.camera, track);
  const fx = createFx(M.foam.map, true);
  stage.scene.add(fx.group);
  stage.hide.push(...fx.group.children);
  const itemFx = createItemFx(M.foam.map, stage.hide);
  stage.scene.add(itemFx.group);
  const HINTS = [['↑', '加速'], ['Shift', '漂移'], ['Ctrl', '氮气'], ['Alt', '切换道具'], ['R', '复位'], ['C', '镜头'], ['Tab', '名次'], ['Esc', '暂停']];
  const refreshHints = () => { $('hints').innerHTML = HINTS.filter(([, v]) => v !== '切换道具' || ui.S.mode === 'item').map(([k, v]) => `<span><b>${k}</b>${v === '氮气' && ui.S.mode === 'item' ? '道具' : v}</span>`).join(''); };
  const free = nums('cam') || nums('orbit') ? { cam: nums('cam'), orbit: nums('orbit') } : null;

  let urlHour = q.has('hour') ? { hour: num('hour', 15.5) } : null;
  let state = 'menu', paused = false, introT = 0, finishT = 0, timeScale = 1, acc = 0, time = 0, cdShown = 4, hintT = 0;
  let race = null, sig = '', hurt = 0, hitPulse = 0, comboN = 0, comboT = -9, bumpCd = 0, musicStarted = false, light = 1;
  const focus = new THREE.Vector3();
  stage.focus = focus;

  const ui = createUi({
    onStart: () => startRace(),
    onAgain: () => startRace(),
    onLobby: () => toLobby(),
    onResume: () => setPaused(false),
    onRestart: () => startRace(),
    onCar: () => syncRace(true),
    onSettings: (S, key) => {
      if (key === 'time') { urlHour = null; applyTime(S); }
      else if (key === 'quality') stage.setQuality(S.quality);
      else if (key === 'sound') applySound(S);
      else if (key === 'laps' || key === 'mode') { if (key === 'mode') syncRace(false); ui.refreshRecord(); }
    },
    sfx: (name) => audio.play(name),
  });
  if (q.has('quality')) ui.S.quality = clamp(num('quality', 2) | 0, 0, 2);

  function applyTime(S = ui.S) {
    const t = urlHour ?? (TIMES.find((x) => x.id === S.time) || TIMES[2]);                // debug: ?hour= wins until the time setting is changed
    stage.applyTime(t.hour);
    setLampLevel(M, stage.lampLevel, stage.renderer.toneMappingExposure);
    light = 0.3 + 0.7 * (1 - stage.night);                                                  // 胎烟跟着环境亮暗
    for (const c of race ? race.cars : []) { if (c.lamps) for (const l of c.lamps) l.intensity = 45 * stage.night; c.cm.glow = M.glowGain; }   // headlamps: enough to light the road 30 m ahead, not a white puddle in front of the nose
    itemFx.gain(M.glowGain);
  }
  function applySound(S = ui.S) {
    audio.setMuted(!S.sound);
    $('muteBtn').textContent = S.sound ? '声音：开' : '声音：关';
  }
  function firstGesture() {
    audio.resume();
    if (!musicStarted) { musicStarted = true; audio.startMusic(); audio.setMusicVol(state === 'menu' ? 0.2 : 0.13); }
    applySound();
  }

  /** 按大厅里的设置建一场新的比赛（设置没变就只把车摆回发车格） */
  function syncRace(force = false) {
    const S = ui.S, n = S.rivals, base = LEVELS[S.level].skill, playerDef = ui.car(), pIdx = CARS.indexOf(playerDef);
    const rivals = [];
    for (let k = 0; k < n; k++) rivals.push({ def: CARS[1 + ((k + pIdx) % 4)], skill: base + (k - (n - 1) / 2) * 0.018, name: RIVALS[k % RIVALS.length] });
    const s2 = `${playerDef.id}|${rivals.map((r) => r.def.id + r.name + r.skill.toFixed(2)).join(',')}|${S.laps}|${S.mode}`;
    if (!force && race && sig === s2) { race.restart(); resetCars(); return; }
    if (race) {
      itemFx.detach();
      for (const c of race.cars) {
        stage.scene.remove(c.cm.group);
        c.cm.group.traverse((o) => { if (o.isMesh || o.isSprite) { o.geometry?.dispose?.(); const ms = Array.isArray(o.material) ? o.material : [o.material]; for (const m of ms) { m?.map?.dispose?.(); m?.dispose?.(); } } });
      }
    }
    race = createRace(track, RL, { laps: S.laps, mode: S.mode, player: playerDef, rivals });
    sig = s2; autoPin = null;
    for (const c of race.cars) {
      const cm = createCarModel(c.def, M, T.noise);
      stage.scene.add(cm.group); c.cm = cm; c.smokeAcc = 0; c.glowAcc = 0; cm.glow = M.glowGain;
      if (c.isPlayer) {                                                                    // 夜里的车头灯：真正会照亮路面的两盏
        c.lamps = [1, -1].map((z) => {
          const sp = new THREE.SpotLight(0xfff1d0, 0, 130, 0.5, 0.65, 1.0);
          sp.position.set(2.0, 0.72, 0.62 * z); sp.target.position.set(46, -1.2, 5 * z);
          cm.group.add(sp, sp.target);
          return sp;
        });
      }
    }
    resetCars();
    applyTime();
    refreshHints();
    warmShaders();
  }
  function resetCars() { for (const c of race.cars) poseCar(c.cm, c.S, 0, time, 0, false); }

  /** Compile every shader the race may use (boost flames, item boxes, missiles, shield, beam) before play starts,
   *  by drawing the whole scene once off-screen with all of it visible. Otherwise the first use stalls the frame. */
  function warmShaders() {
    const r = stage.renderer, flames = [];
    for (const c of race.cars) for (const list of Object.values(c.cm.flames)) for (const m of list) { m.visible = true; flames.push(m); }
    itemFx.warm(true, race);
    const rt = new THREE.WebGLRenderTarget(64, 64), prev = r.getRenderTarget();
    r.compile(stage.scene, stage.camera);
    r.setRenderTarget(rt); r.render(stage.scene, stage.camera); r.setRenderTarget(prev);
    rt.dispose();
    for (const m of flames) m.visible = false;
    itemFx.warm(false, race);
  }

  // ———— 流程 ————
  function startRace() {
    firstGesture();
    syncRace(false);
    ui.show('menu', false); ui.show('results', false); ui.show('pause', false); paused = false;
    hud.show(true); hud.reset(); hud.fade(true);
    requestAnimationFrame(() => hud.fade(false));
    state = 'intro'; introT = 0; timeScale = 1; acc = 0; hintT = 0; comboN = 0;           // 先离开“大厅”状态：下面改画质可能触发 resize，大厅的 resize 会把画面偏移加回来
    stage.camera.clearViewOffset();
    stage.postfx.dofWanted = false; stage.setQuality(ui.S.quality);
    rig.mode = 0; rig.snap = true; rig.az = 0.6;
    hud.cine(true); document.body.classList.add('intro');                              // 电影镜头：遮幅 + 只留标题
    audio.setMusicVol(0.13);
    if (has('skipintro')) beginCountdown();
  }
  function beginCountdown() {
    hud.cine(false); document.body.classList.remove('intro');
    race.start(); state = 'countdown'; cdShown = 4;
  }
  function toLobby() {
    state = 'menu'; paused = false; timeScale = 1;
    race.restart(); resetCars();
    hud.show(false); hud.cine(false); document.body.classList.remove('intro'); ui.show('results', false); ui.show('pause', false); ui.show('menu', true);
    ui.refreshRecord();
    stage.postfx.dofWanted = true; stage.setQuality(ui.S.quality);
    rig.snap = true; rig.az = 0.6;
    viewOffset(true);
    audio.setMusicVol(0.2);
  }
  function setPaused(v) {
    if (!RACING.includes(state) || paused === v) return;
    paused = v; ui.show('pause', v);
  }
  /** 大厅里把画面往左下挪一点：车停在画面中上偏右，下面留给车库面板 */
  function viewOffset(on) {
    const w = window.innerWidth, h = window.innerHeight;
    if (on && !free) stage.camera.setViewOffset(w, h, -w * 0.17, h * 0.05, w, h); else stage.camera.clearViewOffset();
  }

  // ———— 开车以外的按键 ————
  input.onKey((action) => {
    if (action) firstGesture();
    if (!action) return;
    if (ui.key(action)) return;
    if (action === 'pause') { if (RACING.includes(state)) setPaused(!paused); else if (state === 'menu') ui.help.show('menu'); }
    else if (action === 'mute') { ui.S.sound = !ui.S.sound; saveSettings(ui.S); ui.refreshSetup(); applySound(); ui.toast(ui.S.sound ? '声音：开' : '声音：关'); }
    else if (action === 'bgmPrev' || action === 'bgmNext') ui.toast('背景音乐：' + audio.nextMusic(action === 'bgmNext' ? 1 : -1));
    else if (action === 'camera') { if (state === 'race' || state === 'countdown') ui.toast('镜头：' + rig.next()); }
    else if (action === 'back') { if ((state === 'race' || state === 'countdown') && !paused) setPaused(true); }
    else if (state === 'intro' && (action === 'enter' || action === 'space' || action === 'up')) introT = INTRO_LEN;
  });
  window.addEventListener('pointerdown', firstGesture, { once: true });
  window.addEventListener('blur', () => { if ((state === 'race' || state === 'countdown') && !paused) setPaused(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && (state === 'race' || state === 'countdown') && !paused) setPaused(true); });

  const resize = () => { stage.setSize(window.innerWidth, window.innerHeight); viewOffset(state === 'menu'); };
  stage.onResize = resize;
  resize();

  // ———— 比赛中每帧的更新 ————
  const states = () => race.cars.map((c) => c.S);
  /** 调试用：电脑代开玩家的车。?ai=1 直接给转向量；?ai=keys 把转向量变成方向键（和玩家一样只有开 / 关），用来检验纯键盘能不能把车开好 */
  let autoPin = null, autoWait = 0, autoPrev = false, autoEdge = false;
  const autoThink = () => {
    const P = race.player;
    if (!P.ai) P.ai = createAiDriver(LEVELS[ui.S.level].skill + 0.01);
    const o = aiThink(P.ai, P.S, track, RL, FIXED, states());
    if (!race.items.on) return o;
    autoWait -= FIXED;                                                                 // 道具赛：手里有道具，到了直道上就按一下 Ctrl
    const use = !!P.items[P.slot] && autoWait <= 0 && Math.abs(RL.k[P.S.i]) < 1 / 80;
    if (use) autoWait = 1.4 + Math.random();
    autoEdge = use && !autoPrev; autoPrev = use;
    return { ...o, nitro: false };
  };
  const autopilot = () => autoPin || (autoPin = { pressed: (a) => a === 'nitro' && autoEdge, drive: autoThink });
  const keyPilot = () => {
    const o = autoThink();
    input.setVirtual({ up: o.up, down: o.down, left: o.ax < -0.12, right: o.ax > 0.12, drift: o.drift, nitro: race.items.on ? autoEdge : o.nitro });
  };
  const near = (c) => Math.hypot(c.S.x - race.player.S.x, c.S.z - race.player.S.z) < 70;
  const comboSub = () => { comboN = time - comboT < 2.6 ? comboN + 1 : 1; comboT = time; return comboN >= 2 ? `连喷 ×${comboN}` : ''; };
  function sparks(e, n) {
    const tx = -e.nz, tz = e.nx;                                                           // 沿墙的方向
    for (let k = 0; k < n; k++) {
      const a = Math.random() * 2 - 1, s = 3 + Math.random() * 9;
      fx.glow.emit(e.x, 0.35 + Math.random() * 0.5, e.z, tx * a * s + e.nx * (1 + Math.random() * 3), 1 + Math.random() * 5, tz * a * s + e.nz * (1 + Math.random() * 3), 0.25 + Math.random() * 0.4, 0.05 + Math.random() * 0.06, 1);
    }
  }
  /** 道具炸开的一团：火光（water=true 是水花）加烟 */
  function blast(x, z, water, n = 40) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * 6.283, e = Math.random() * 1.4 + 0.2, sp = 4 + Math.random() * (water ? 13 : 11);
      fx.glow.emit(x, 0.5, z, Math.cos(a) * Math.cos(e) * sp, water ? 5 + Math.random() * 11 : 2 + Math.random() * 8, Math.sin(a) * Math.cos(e) * sp, 0.5 + Math.random() * 0.6, (water ? 0.2 : 0.12) + Math.random() * 0.16, water ? 2 : Math.random() < 0.7 ? 1 : 2);
    }
    for (let k = 0; k < n * 0.55; k++) {
      const a = Math.random() * 6.283, sp = 1 + Math.random() * 5;
      fx.smoke.emit(x + (Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 0.8, z + (Math.random() - 0.5) * 1.2, Math.cos(a) * sp, 1.5 + Math.random() * 3.5, Math.sin(a) * sp, 1.1 + Math.random() * 0.9, 0.9 + Math.random() * 0.9, 0);
    }
  }
  /** 玩家被打转：红光、镜头一震 */
  const ouch = (level, text) => { hurt = Math.max(hurt, level); hitPulse = Math.max(hitPulse, level); if (text) hud.popup(text, 'bad'); };
  const far = (x, z) => Math.hypot(x - race.player.S.x, z - race.player.S.z) < 90;       // 道具的声音：玩家旁边才响，按远近调音量
  function handleEvents(evs) {
    const P = race.player;
    for (const e of evs) {
      const mine = e.car === P, yours = e.by === P;
      switch (e.type) {
        case 'go': hud.countdown('GO!'); audio.play('go'); hintT = 0.001; break;
        case 'perfectStart': if (mine) { audio.play('perfect'); hud.popup('完美起步！', 'gold'); } break;
        case 'mini': if (mine) { audio.play('mini'); hud.popup('小喷', '', comboSub()); } break;
        case 'double': if (mine) { audio.play('double'); hud.popup('双喷！', 'orange', comboSub()); } break;
        case 'cutDouble': if (mine) { audio.play('double'); hud.popup('断位双喷！', 'orange', comboSub()); } break;
        case 'wcw': if (mine) { audio.play('double'); hud.popup('WCW！', 'gold', comboSub()); } break;
        case 'nitro': if (mine) audio.play('nitro'); break;
        case 'gasFull': if (mine) { audio.play('gas'); hud.popup('集气满', 'green', '+1 氮气'); } break;
        case 'drift': if (mine) audio.play('drift'); break;
        case 'swing': if (mine) { audio.play('drift'); hud.popup('甩尾漂移', 'orange'); } break;
        case 'hit': if (mine || near(e.car)) { const p = clamp(e.power / 14, 0.25, 1); audio.play('hit', p * (mine ? 1 : 0.5)); sparks(e, 26); if (mine) { hurt = 0.9; hitPulse = 1; } } break;
        case 'bump': if (mine || near(e.car)) { if (time - bumpCd > 0.09) { bumpCd = time; audio.play('bump'); } sparks(e, 6); if (mine) hitPulse = Math.max(hitPulse, 0.35); } break;
        case 'bumpCar': if (near(e.car)) { if (time - bumpCd > 0.09) { bumpCd = time; audio.play('bump'); } if (mine) hitPulse = Math.max(hitPulse, 0.25); } break;
        case 'lap': if (mine) { audio.play('lap', e.lap === race.laps); hud.center(e.best ? `最快圈 ${fmt(e.time)}` : e.lap === race.laps ? '最后一圈！' : `第 ${e.lap} 圈完成`, '', 1.7); } break;
        case 'playerFinish': audio.play('finish'); hud.center(`${ORDINAL[e.rank - 1] || ''}冲线！`, 'gold', 2.6); break;
        case 'rescue': if (mine) audio.play('rescue'); break;
        // ——— 道具赛 ———
        case 'itemGet': if (mine) { audio.play('itemGet'); hud.popup(ITEMS[e.item].name, 'small green', ITEMS[e.item].tip); } break;
        case 'itemUse': if (mine || near(e.car)) audio.play(e.item === 'missile' ? 'missile' : e.item === 'bomb' || e.item === 'banana' ? 'toss' : 'click'); break;
        case 'spinOut': if (mine) audio.play('spin'); break;
        case 'missileHit': blast(e.x, e.z, false); itemFx.shock(e.x, e.z, 0xffa040, 7); audio.play('boom', mine ? 1 : far(e.x, e.z) ? 0.7 : 0.25); if (mine) ouch(1, '被导弹击中！'); else if (yours) hud.popup('导弹命中！', 'orange'); break;
        case 'missileMiss': blast(e.x, e.z, false, 14); itemFx.shock(e.x, e.z, 0xffa040, 4); if (far(e.x, e.z)) audio.play('boom', 0.4); break;
        case 'splash': blast(e.x, e.z, true); itemFx.shock(e.x, e.z, 0x7fdcff, 9.5); audio.play('splash', far(e.x, e.z) ? 1 : 0.3); break;
        case 'bombHit': if (mine) ouch(0.8, '被水炸弹淋到！'); else if (yours) hud.popup('水炸弹命中！', 'orange'); break;
        case 'bananaHit': if (mine || far(e.x, e.z)) audio.play('banana', mine ? 1 : 0.5); if (mine) ouch(0.5, '踩到香蕉皮！'); else if (yours) hud.popup('香蕉皮得手', 'orange'); break;
        case 'blocked': itemFx.shock(e.car.S.x, e.car.S.z, 0xffe9a0, 6.5); if (mine) { audio.play('block'); hud.popup('天使护体！', 'gold'); } break;
        case 'shieldOn': if (mine) audio.play('shield'); break;
        case 'magnetOn': if (mine) audio.play('magnet'); break;
        case 'itemNitro': if (mine) audio.play('nitro'); break;
        default: break;
      }
    }
  }

  /** 胎痕、胎烟、火花、氮气光点 */
  function carFx(c, dt) {
    const S = c.S, v = Math.hypot(S.vx, S.vz), cs = Math.cos(S.psi), sn = Math.sin(S.psi), rx = -sn, rz = cs, close = c.isPlayer || near(c);
    const slide = S.drifting && Math.abs(S.slip) > 0.2 && v > 5, lock = S.inpDown && v > 17 && !S.drifting;
    for (const w of [1, -1]) {
      const x = S.x - cs * 1.36 + rx * 0.82 * w, z = S.z - sn * 1.36 + rz * 0.82 * w;
      fx.skid(c.name + w, x, z, slide || lock || S.scrape > 0, 0.34);
      if (close && (slide || lock)) {
        c.smokeAcc += dt * (slide ? 110 * Math.min(1, Math.abs(S.slip) / 0.45) : 30);
        while (c.smokeAcc >= 1) {
          c.smokeAcc -= 1;
          fx.smoke.emit(x + (Math.random() - 0.5) * 0.35, 0.18, z + (Math.random() - 0.5) * 0.35,
            S.vx * 0.26 + (Math.random() - 0.5) * 1.8, 0.8 + Math.random() * 1.8, S.vz * 0.26 + (Math.random() - 0.5) * 1.8, 0.55 + Math.random() * 0.5, 0.24 + Math.random() * 0.22, 0);
        }
      }
    }
    if (S.scrape > 0 && close && Math.random() < dt * 70) {                                   // 蹭墙：贴着墙的那一侧冒火花
      const sg = S.e > 0 ? 1 : -1, x = S.x + rx * sg * 1.05, z = S.z + rz * sg * 1.05;
      fx.glow.emit(x, 0.35 + Math.random() * 0.4, z, -rx * sg * (1 + Math.random() * 3) + S.vx * 0.25, 0.6 + Math.random() * 2.6, -rz * sg * (1 + Math.random() * 3) + S.vz * 0.25, 0.2 + Math.random() * 0.3, 0.045 + Math.random() * 0.05, 1);
    }
    const nitro = S.nitroT > 0, mini = S.miniT > 0;
    if (close && (nitro || mini)) {
      c.glowAcc += dt * (nitro ? 95 : 40);
      while (c.glowAcc >= 1) {
        c.glowAcc -= 1;
        for (const w of [0.34, -0.34]) {
          fx.glow.emit(S.x - cs * 2.3 + rx * w, 0.33, S.z - sn * 2.3 + rz * w,
            S.vx * 0.55 - cs * (5 + Math.random() * 5) + rx * (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.2, S.vz * 0.55 - sn * (5 + Math.random() * 5) + rz * (Math.random() - 0.5) * 1.5,
            0.22 + Math.random() * 0.25, nitro ? 0.16 + Math.random() * 0.12 : 0.06 + Math.random() * 0.05, nitro ? 2 : 1);
        }
      }
    }
  }

  /** 玩家的引擎、轮胎、风、氮气 */
  function driveAudio() {
    const S = race.player.S, kmh = Math.hypot(S.vx, S.vz) * 3.6, up = !!S.inpUp, boost = S.nitroT > 0 ? 1 : S.miniT > 0 ? 0.45 : 0;
    const revving = race.state === 'countdown' || race.state === 'grid';
    audio.engine((revving ? 0.1 + (up ? 0.55 + 0.1 * Math.sin(time * 30) : 0) : rpmOf(kmh)) + boost * 0.12, up ? 1 : 0.15, true);
    const slide = clamp(Math.abs(S.slip) / 0.5, 0, 1) * clamp(kmh / 40, 0, 1);
    audio.screech(S.drifting ? 0.35 + slide * 0.65 : slide * 0.5, clamp(Math.abs(S.slip) / 0.8, 0, 1));
    audio.windVol(clamp(kmh / 300, 0, 1) ** 2);
    audio.boost(boost);
    audio.scrape(S.scrape);
  }
  function quietAudio() { audio.engine(0, 0, false); audio.screech(0); audio.windVol(0); audio.boost(0); audio.scrape(0); }

  function raceTick(dt, dtReal, raw) {
    const auto = q.get('ai') === '1' ? autopilot() : null;
    if (auto === null && q.get('ai') === 'keys') keyPilot();
    acc += dt;
    let first = true;                                                                  // “刚按下”只在这一帧的第一小步里算一次，不然一帧走几小步会把道具切过去又切回来
    for (let n = 0; acc >= FIXED && n < 14; n++) { handleEvents(race.step(FIXED, auto || { drive: () => input.drive(), pressed: (a) => first && input.pressed(a) })); acc -= FIXED; first = false; }
    if (state === 'countdown') {
      const c = Math.ceil(race.goT);
      if (c < cdShown && c >= 1 && c <= 3) { cdShown = c; hud.countdown(String(c)); audio.play('count'); }
      if (race.state === 'race') state = 'race';
    }
    if (race.state === 'finish' && state === 'race') { state = 'finish'; finishT = 0; timeScale = 0.42; hud.cine(true); rig.snap = true; }
    const S = race.player.S;
    for (const c of race.cars) {                                                                     // an opponent right behind us sits between camera and car: fade it
      const dc = Math.hypot(c.S.x - rig.pos.x, c.S.z - rig.pos.z);
      poseCar(c.cm, c.S, dt, time, c.acc, c.S.inpDown && Math.hypot(c.S.vx, c.S.vz) > 1, c.isPlayer ? 1 : clamp((dc - 2.0) / 8, 0.12, 1));
      carFx(c, dt);
    }
    driveAudio();
    if (state === 'finish') {
      finishT += dtReal;
      rig.orbit(raw, S.x, S.z, { dist: 12.5, h: 3.6, speed: 0.55, fov: 46 });
      if (finishT >= FINISH_LEN) {
        state = 'results'; timeScale = 1; hud.show(false); hud.cine(false); ui.results(race);
        stage.postfx.dofWanted = true; stage.setQuality(ui.S.quality); audio.setMusicVol(0.2);
      }
    } else {
      if (!freeCam) rig.chase(raw, S, { boost: S.nitroT > 0 ? 1 : 0, mini: S.miniT > 0 ? 1 : 0, hit: hitPulse, brake: !!S.inpDown });
      hud.update(race, stage.camera, window.innerWidth, window.innerHeight, raw);
      hud.standings(input.held('standings'));
      if (hintT > 0 && (hintT += dtReal) > 14) { hintT = 0; hud.hintFade(); }
    }
    hurt = Math.max(0, hurt - dtReal * 2.2); hitPulse = Math.max(0, hitPulse - dtReal * 3.5);
    stage.postfx.look({ rush: S.nitroT > 0 ? 0.42 : S.miniT > 0 ? 0.2 : 0, bars: state === 'finish' ? 1 : 0, hurt });
    focus.set(S.x + Math.cos(S.psi) * 12, 0, S.z + Math.sin(S.psi) * 12);                  // 阴影盒跟着车
  }

  function tick(dtReal, raw) {
    const dt = dtReal * timeScale;
    time += dt;
    tickMaterials(M, time);
    props.update(time);
    fx.update(time, [light, light, light * 1.04]);
    if (free) return;
    if (state === 'menu') {
      for (const c of race.cars) {                                                     // a neighbour on the grid that the camera swings up to steps back
        const dc = Math.hypot(c.S.x - rig.pos.x, c.S.z - rig.pos.z);
        poseCar(c.cm, c.S, 0, time, 0, false, c.isPlayer ? 1 : clamp((dc - 4.0) / 7, 0, 1));
      }
      // 车库镜头从左前 3/4 视角慢慢扫到正侧面、再到右后，再扫回来（约 40 秒一个来回）。
      // 不整圈转：正后方（方位 90°）有一根大桥墩会挡在镜头前，所以摆动范围是 −120°..50°
      if (!freeCam) rig.orbit(raw, race.player.S.x, race.player.S.z, { dist: 9.4, h: 2.3, az: (-35 + 85 * Math.sin(time * 0.157 - 0.86)) * DEG, fov: 36 });   // phase: the page opens on a front three-quarter view
      stage.postfx.look({ rush: 0, bars: 0, hurt: 0 });
      focus.set(race.player.S.x + Math.cos(race.player.S.psi) * 14, 0, race.player.S.z + Math.sin(race.player.S.psi) * 14);
    } else if (state === 'intro') {
      introT += dtReal;
      if (introT > 0.35 && introT - dtReal <= 0.35) hud.center('十一城', '', 2.1);
      rig.intro(raw, introT / INTRO_LEN, race.player.S);
      stage.postfx.look({ rush: 0, bars: 1, hurt: 0 });
      focus.set(rig.look.x, 0, rig.look.z);
      if (introT >= INTRO_LEN) beginCountdown();
    } else if (state === 'results') {
      acc += dt; for (let n = 0; acc >= FIXED && n < 14; n++) { race.step(FIXED, null); acc -= FIXED; }
      for (const c of race.cars) poseCar(c.cm, c.S, dt, time, c.acc, false);
      rig.orbit(raw, race.player.S.x, race.player.S.z, { dist: 13, h: 3.4, speed: 0.22, fov: 42 });
      stage.postfx.look({ rush: 0, bars: 0, hurt: 0 });
      focus.set(race.player.S.x, 0, race.player.S.z);
      quietAudio();
    } else if (RACING.includes(state)) raceTick(dt, dtReal, raw);
    itemFx.update(race.items, race, stage.camera, time, dt, fx);
    stage.follow(focus);
  }

  // ———— 自由镜头（看场景用） ————
  let orbitState = null, freeCam = false, spinRate = 0;                      // freeCam：比赛照常走，但镜头由 setCam / orbit 控制（给道具拍特写用）
  function setCam(x, y, z, yaw = 0, pitch = 0, fov = 55) {
    orbitState = null;
    stage.camera.position.set(x, y, z); stage.camera.rotation.set(pitch * DEG, -yaw * DEG, 0);
    stage.camera.fov = fov; stage.camera.updateProjectionMatrix();
  }
  function applyOrbit() {
    const o = orbitState, a = o.az * DEG, e = o.el * DEG;
    stage.camera.position.set(o.c[0] + Math.sin(a) * Math.cos(e) * o.d, o.c[1] + Math.sin(e) * o.d, o.c[2] - Math.cos(a) * Math.cos(e) * o.d);
    stage.camera.lookAt(o.c[0], o.c[1], o.c[2]);
    stage.camera.fov = o.fov; stage.camera.updateProjectionMatrix();
  }
  if (free?.cam) setCam(...free.cam);
  else if (free?.orbit) { orbitState = { c: free.orbit.slice(0, 3), d: free.orbit[3], az: free.orbit[4], el: free.orbit[5], fov: free.orbit[6] ?? 50 }; spinRate = q.has('spin') ? num('spin', 4) : 0; applyOrbit(); }

  let last = performance.now(), frames = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const raw = Math.min(0.25, Math.max(0, (now - last) / 1000)), dtReal = Math.min(0.05, raw); last = now;   // 物理每帧最多走 50 毫秒；镜头、界面按真实时长平滑
    if (!paused && q.get('freeze') !== '1') {
      tick(free ? 0 : dtReal, raw);
      if ((free || freeCam) && orbitState && spinRate) { orbitState.az += dtReal * spinRate; applyOrbit(); }
    }
    fx.endFrame();
    stage.render(paused ? 0 : dtReal, time);
    input.endFrame();
    frames++;
    if (frames === 2) window.__sceneReady = true;
  }

  // ———— 启动 ————
  syncRace(true);
  stage.setQuality(ui.S.quality);
  mark('race');
  bar.style.width = '100%'; text.textContent = '完成';
  $('load').classList.add('is-done');
  stage.postfx.dofWanted = !free; stage.setQuality(ui.S.quality);
  viewOffset(true);
  rig.snap = true;
  ui.show('menu', !free);
  requestAnimationFrame(frame);
  if (has('autostart')) setTimeout(() => startRace(), 350);

  // ———— 调试 / 验收接口 ————
  window.__game = {
    stage, track, RL, M, info, land, tw, city, lm, props, fx, itemFx, hud, input, ui, audio, rig, THREE,
    get race() { return race; }, get state() { return state; }, get paused() { return paused; },
    start: () => startRace(), again: () => startRace(), lobby: () => toLobby(), skipIntro: () => { introT = INTRO_LEN; },
    pause: (v) => setPaused(v), hour: (h) => { stage.applyTime(h); setLampLevel(M, stage.lampLevel); }, quality: (l) => stage.setQuality(l),
    setCam, orbit: (c, d, az, el, fov) => { orbitState = { c, d, az, el, fov }; applyOrbit(); },
    /** 调试：把一件道具塞到玩家手上；timeScale 是慢放倍率 */
    item: (key) => { const P = race.player; P.items[P.slot] = key; return P.items; },
    fire: (key) => { const ev = []; race.player.items[race.player.slot] = key; race.items.use(race.player, race, ev); handleEvents(ev); return ev.map((e) => e.type); }, slow: (v) => { timeScale = v; },
    cam: (v) => { freeCam = !!v; if (!v) { rig.snap = true; spinRate = 0; } }, spin: (v) => { spinRate = v; },
    /** 量 n 帧的单帧耗时（毫秒）：每帧渲染后读回一个像素，逼 GPU 同步。取两轮里较小的一轮。 */
    measure: (n = 20) => {
      const gl = stage.renderer.getContext(), px = new Uint8Array(4), run = () => { const t0 = performance.now(); for (let i = 0; i < n; i++) { stage.render(1 / 60, time); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return +((performance.now() - t0) / n).toFixed(2); };
      run(); return Math.min(run(), run());
    },
    stats: () => ({ calls: stage.renderer.info.render.calls, tris: stage.renderer.info.render.triangles, q: stage.quality, dpr: stage.renderer.getPixelRatio() }),
  };
}
boot().catch((e) => { console.error(e); showError(`页面启动失败：${e.message}`); });
