// 对局：人物（玩家 + 机器人）、团队竞技规则、开火的后果、手雷、雷达情报。渲染、输入、声音都从外面接进来。
import * as THREE from 'three';
import { WEAPONS, RULES, MOVE, SPAWNS, DEG } from '../core/config.js';
import { createNav } from '../core/nav.js';
import { castShot, damageFor } from '../core/hitscan.js';
import { makeLoadout, resetWeapons, switchSlot, nextSlot, tickWeapon, aimDir, currentSpread } from './weapons.js';
import { createBrain, botThink } from './ai.js';
import { createEffects } from './effects.js';
import { createSoldier } from '../actors/soldier.js';
import { wrapAngle, clamp, mulberry32 } from '../core/mathx.js';
import { colored } from '../gfx/batch.js';
import { createViewmodel } from './viewmodel.js';

const PI = Math.PI;
const NAMES = [['苍鹭', '信天翁', '鲣鸟', '军舰鸟', '海东青', '燕鸥', '鲲鹏', '白鹭'], ['黑潮', '暗礁', '虎鲨', '旗鱼', '梭鱼', '海蛇', '水母', '飓风']];   // 机器人的代号（一队最多 6 人，不会重名）：保卫者用海鸟，潜伏者用海里的东西
/** 机器人游走的热点：[x, z, 权重] */
const SPOTS = [[0, 0, 2.2], [-13, -3.5, 1.2], [-13, 7, 1], [10.25, -7, 1], [12, 4, 1.2], [0, -9, 1], [0, 9, 1], [-20, 4.5, 1], [20, -4.5, 1], [-23.2, -3.5, 0.8], [23.2, 3.5, 0.8], [-4.5, 5.2, 1], [5.5, -5.5, 1], [-20, -6.2, 0.8], [20, 6.2, 0.8]];
const fwd = (yaw, o) => { o[0] = Math.cos(yaw); o[2] = Math.sin(yaw); return o; };

/**
 * @param ctx { stage, W, input, audio }   stage：渲染舞台；W：buildWorld 的结果（材质、碰撞体）
 */
export function createGame(ctx) {
  const { stage, W, input, audio } = ctx, world = W.world, M = W.M, shipRoot = stage.shipRoot, camera = stage.camera;
  const fx = createEffects(shipRoot, stage.vm);
  stage.hide.push(fx.root);
  const nav = createNav(world);
  const actors = [], noises = [], nades = [];
  const state = { phase: 'lobby', now: 0, left: RULES.time, scores: [0, 0], target: 50, winner: -1, firstBlood: false, feed: [] };
  const G = { stage, W, fx, nav, actors, state, nades, player: null, vm: null, onEvent: null, settings: null, spots: SPOTS };
  let player = null, vm = null, seed = 1, mrand = Math.random, eye = [0, 0, 0], spotT = 0, noiseI = 0;   // mrand：这一局的随机数（出生点、弹道散布），给定种子就能复现
  const cam = { punchP: 0, punchY: 0, punchR: 0, land: 0, deadT: 0, fov: 75, shakeX: 0, shakeY: 0, pattern: 0, lastYaw: 0, lastPitch: 0 };
  const dirV = [0, 0, 0], tmpV = [0, 0, 0];

  function emit(type, data = {}) { if (G.onEvent) G.onEvent({ type, t: state.now, ...data }); }
  const noise = (x, z, team, loud, owner) => { noises.push({ x, z, team, loud, owner, t: state.now }); if (noises.length > 40) noises.shift(); };
  const canHit = (shooter) => (o) => o.team !== shooter.team && state.now >= o.protect;

  // ———————————————————————— 人物 ————————————————————————
  function makeActor(id, team, isBot, name, primary) {
    const a = {
      id, team, isBot, name, alive: false, hp: 0, armor: 0, kills: 0, deaths: 0, streak: 0, headKills: 0,
      body: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: MOVE.radius, h: MOVE.stand, step: MOVE.step, onGround: false },
      yaw: 0, pitch: 0, crouch: false, eyeH: MOVE.eye, slots: makeLoadout(primary, team), slot: 1, prevSlot: 1, want: { fire: false, alt: false, ads: false, reload: false },
      respawnAt: 0, protect: 0, lastFire: -9, lastHit: -9, lastAttacker: null, lastShotAt: -9, spotted: 0, stepDist: 0, phase: 0, walk: false,
      model: null, brain: null, deadT: 0, crouchK: 0, flinch: 0, autoSwitchAt: -1, primary,
    };
    a.w = a.slots[1];
    return a;
  }
  function spawn(a) {
    const pts = SPAWNS[a.team], r = mrand;
    let best = 0, bestD = -1;
    for (let k = 0; k < pts.length; k++) {                                           // 挑一个离活着的敌人最远的出生点
      let d = 1e9;
      for (const o of actors) if (o.alive && o.team !== a.team) d = Math.min(d, Math.hypot(o.body.x - pts[k][0], o.body.z - pts[k][1]));
      if (d + r() * 6 > bestD) { bestD = d + r() * 6; best = k; }
    }
    const [x, z, yaw] = pts[best], b = a.body;
    Object.assign(b, { x: x + (r() - 0.5) * 0.5, y: 0, z: z + (r() - 0.5) * 0.5, vx: 0, vy: 0, vz: 0, h: MOVE.stand, onGround: true, fell: false });
    a.yaw = yaw + (r() - 0.5) * 0.3; a.pitch = 0;
    a.alive = true; a.hp = RULES.hp; a.armor = RULES.armor; a.protect = state.now + RULES.protect; a.crouch = false; a.crouchK = 0; a.eyeH = MOVE.eye;
    a.slot = 1; a.prevSlot = 1; resetWeapons(a); a.w = a.slots[1]; a.w.draw = 0.35; a.want = { fire: false, alt: false, ads: false, reload: false };
    a.deadT = 0; a.flinch = 0; a.autoSwitchAt = -1; a.streak = 0;
    if (a.model) { a.model.pose.dead = 0; a.model.pose.fall = 1; a.model.group.visible = true; a.model.group.position.set(b.x, 0, b.z); a.model.mesh.position.set(0, 0, 0); a.model.mesh.rotation.set(0, 0, 0); }
    if (a === player) { cam.punchP = cam.punchY = cam.punchR = cam.land = 0; cam.pattern = 0; cam.deadT = 0; if (vm) vm.set(a.w.id); }
    emit('spawn', { actor: a });
  }

  function damage(v, amount, attacker, weaponId, part, dir) {
    if (!v.alive || state.now < v.protect || amount <= 0) return 0;
    let dmg = amount;
    if (part !== 'head' && v.armor > 0) { const absorb = Math.min(v.armor * 0.5, dmg * 0.28); v.armor = Math.max(0, v.armor - dmg * 0.45); dmg -= absorb; }
    else if (part === 'head') v.armor = Math.max(0, v.armor - 6);
    v.hp -= dmg;
    v.lastHit = state.now;
    if (attacker && attacker !== v) v.lastAttacker = attacker;
    if (v === player) {
      const from = attacker && attacker !== v ? Math.atan2(attacker.body.z - v.body.z, attacker.body.x - v.body.x) : v.yaw + PI;
      emit('damage', { amount: dmg, rel: wrapAngle(from - v.yaw), attacker });
      audio.local('hurt', { gain: clamp(dmg / 45, 0.3, 1) });
      fx.kick(clamp(dmg / 90, 0.04, 0.35));
    } else {
      v.flinch = 1;
      if (attacker && attacker.team !== v.team) { v.brain.susX = attacker.body.x; v.brain.susZ = attacker.body.z; v.brain.susT = state.now; }
    }
    if (v.hp <= 0) kill(v, attacker, weaponId, part);
    return dmg;
  }

  function kill(v, attacker, weaponId, part) {
    v.alive = false; v.hp = 0; v.deaths++; v.respawnAt = state.now + RULES.respawn; v.deadT = 0; v.streak = 0;
    v.crouch = false; v.body.h = MOVE.stand;
    if (v.w.reload > 0) v.w.reload = 0;
    const k = attacker && attacker !== v ? attacker : null, friendly = k && k.team === v.team, head = part === 'head';
    const dx = k ? k.body.x - v.body.x : Math.cos(v.yaw), dz = k ? k.body.z - v.body.z : Math.sin(v.yaw);
    v.deathDir = Math.atan2(dz, dx);                                                  // 朝着凶手倒下去之前先记下方向
    v.deathBack = k ? Math.cos(wrapAngle(v.deathDir - v.yaw)) > 0 : true;             // 凶手在面前：仰面倒下
    v.deathInfo = k ? { name: k.name, weapon: weaponId, head } : null;
    let multi = 0, first = false;
    if (k && !friendly) {                                            // 连杀照 CF 的规矩：一条命内不死就接着数，不看两次击杀隔了多久
      k.kills++; k.streak++; multi = k.streak;
      if (head) k.headKills++;
      state.scores[k.team]++;
      if (!state.firstBlood) { state.firstBlood = true; first = true; }
    }
    state.feed.push({ k, v, w: weaponId, head, t: state.now });
    if (state.feed.length > 6) state.feed.shift();
    emit('kill', { killer: k, victim: v, weapon: weaponId, head, multi, first, friendly });
    if (state.phase === 'playing' && (state.scores[0] >= state.target || state.scores[1] >= state.target)) endMatch(state.scores[0] >= state.target ? 0 : 1);
  }

  function endMatch(winner) {
    if (state.phase !== 'playing') return;
    state.phase = 'ended'; state.winner = winner;
    stage.vm.root.visible = false;                                           // 结算画面背后镜头已经离开玩家的眼睛，枪模不该再悬在画面里
    for (const a of actors) { a.want.fire = false; }
    input.unlock();
    emit('end', { winner });
  }

  // ———————————————————————— 移动 ————————————————————————
  /** ax：向右的输入，ay：向前的输入（都是 -1..1）。返回这一帧实际前进的速度。 */
  function moveActor(a, ax, ay, dt) {
    const b = a.body, w = a.w, cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    let wx = cy * ay - sy * ax, wz = sy * ay + cy * ax;
    const l = Math.hypot(wx, wz);
    if (l > 1) { wx /= l; wz /= l; }
    const speed = w.def.speed * (a.crouch ? 0.46 : 1) * (w.ads > 0.5 ? MOVE.ads : 1) * (a.walk ? 0.5 : 1) * (w.reload > 0 ? 0.92 : 1);
    const k = Math.min(1, dt * (b.onGround ? 11 : 1.7));
    b.vx += (wx * speed - b.vx) * k; b.vz += (wz * speed - b.vz) * k;
    b.vy -= MOVE.gravity * dt;
    let left = dt;
    while (left > 1e-6) { const h = Math.min(left, 1 / 60); world.move(b, h); left -= h; }
    const sp = Math.hypot(b.vx, b.vz);
    if (b.onGround && sp > 0.8) {
      a.stepDist += sp * dt; a.phase += sp * dt * 4.05;
      if (a.stepDist >= (a.crouch ? 1.15 : 0.8)) { a.stepDist = 0; footstep(a); }
    } else a.phase += dt * 1.4;
    if (b.fell) { b.fell = false; if (state.phase === 'playing') { kill(a, null, 'fall', 'chest'); } }
    return sp;
  }
  function footstep(a) {
    const quiet = a.walk || a.crouch, b = a.body, name = 'step' + ((Math.random() * 4) | 0);
    if (a === player) audio.local(name, { gain: quiet ? 0.22 : 0.62 });
    else audio.world(name, [b.x, b.y + 0.05, b.z], { gain: quiet ? 0.22 : 0.9, max: 24, ref: 2.2 });
    noise(b.x, b.z, a.team, quiet ? 0.3 : 1, a);
  }

  // ———————————————————————— 开火 ————————————————————————
  function whiz(o, d, dist) {
    if (!player || !player.alive) return;
    const e = [player.body.x, player.body.y + player.eyeH, player.body.z];
    const t = (e[0] - o[0]) * d[0] + (e[1] - o[1]) * d[1] + (e[2] - o[2]) * d[2];
    if (t < 0.5 || t > dist) return;
    const px = e[0] - (o[0] + d[0] * t), py = e[1] - (o[1] + d[1] * t), pz = e[2] - (o[2] + d[2] * t), m = Math.hypot(px, py, pz);
    if (m < 1.5) audio.local('whiz', { gain: 0.8 * (1 - m / 1.5) + 0.15, rate: 0.9 + Math.random() * 0.25, vary: 0 });
  }

  function fire(a, w, spread, heavy) {
    const def = w.def, b = a.body, mine = a === player;
    a.lastFire = state.now; a.lastShotAt = state.now;
    if (a.protect > state.now) a.protect = 0;                                        // 一开枪就失去出生保护
    const o = [b.x, b.y + a.eyeH, b.z], d = aimDir(a.yaw, a.pitch, spread, mrand, dirV);
    if (def.kind === 'melee') {
      const hit = castShot(world, actors, o, d, def.range, a, canHit(a));
      if (mine) { vm.melee(heavy); audio.local('swish', { gain: heavy ? 0.9 : 0.6, rate: heavy ? 0.8 : 1.1 }); }
      else audio.world('swish', o, { gain: 0.6, max: 14 });
      if (hit) {
        if (hit.actor) {
          damage(hit.actor, def.dmg * (heavy ? 2.2 : 1) * (hit.part === 'head' ? 1.5 : 1), a, w.id, hit.part, d);
          fx.blood(hit.x, hit.y, hit.z, d[0], d[1], d[2], heavy);
          audio.world('knife_hit', [hit.x, hit.y, hit.z], { gain: 0.9, max: 22 });
          if (mine) emit('hit', { part: hit.part, killed: !hit.actor.alive, melee: true });
        } else { fx.impact(hit.x, hit.y, hit.z, hit.nx, hit.ny, hit.nz, hit.mat, false); audio.world('impact_steel', [hit.x, hit.y, hit.z], { gain: 0.9, max: 22 }); }
      }
      return;
    }
    if (def.kind === 'grenade') {
      const m = new THREE.Mesh(colored(new THREE.SphereGeometry(0.034, 12, 10).scale(1, 1.25, 1), 0x59633e), M.paint);
      m.castShadow = true; shipRoot.add(m);
      nades.push({ x: o[0] + d[0] * 0.4, y: o[1] - 0.05, z: o[2] + d[2] * 0.4, vx: d[0] * 15 + b.vx * 0.6, vy: d[1] * 15 + 2.6, vz: d[2] * 15 + b.vz * 0.6, t: 2.6, owner: a, mesh: m, spin: Math.random() * 6 });
      if (mine) { vm.throwGrenade(); audio.local('pin', { gain: 0.6 }); } else audio.world('pin', o, { gain: 0.5, max: 10 });
      if (w.count <= 0) a.autoSwitchAt = state.now + 0.75;
      return;
    }
    const hit = castShot(world, actors, o, d, 220, a, canHit(a));
    const dist = hit ? hit.t : 220, end = hit ? [hit.x, hit.y, hit.z] : [o[0] + d[0] * 220, o[1] + d[1] * 220, o[2] + d[2] * 220];
    let mz;
    if (mine) mz = vm.muzzle(tmpW).toArray();
    else mz = [o[0] + d[0] * 0.6 - Math.sin(a.yaw) * 0.14, o[1] - 0.12, o[2] + d[2] * 0.6 + Math.cos(a.yaw) * 0.14];
    const d2p = mine ? 0 : Math.hypot(mz[0] - eye[0], mz[1] - eye[1], mz[2] - eye[2]);
    const mzs = def.kind === 'sniper' ? 2.3 : def.kind === 'pistol' ? 0.85 : 1.3;
    if (mine) fx.muzzleVM(vm.muzzleLocal(tmpW).toArray(), d, mzs);
    fx.muzzle(mz[0], mz[1], mz[2], d[0], d[1], d[2], mzs, mine);
    if (d2p < 60) fx.tracer(mz, end);
    if (d2p < 26 && def.kind !== 'sniper') fx.casing(mz[0] - d[0] * 0.25, mz[1] - 0.03, mz[2] - d[2] * 0.25, [-Math.sin(a.yaw), 0, Math.cos(a.yaw)], [d[0], 0, d[2]]);
    audio.shot(w.id, mine ? null : mz, 1);
    noise(b.x, b.z, a.team, 1.7, a);
    if (mine) {
      vm.fire();
      const r = def.recoil, k = 1 - w.ads * 0.3, p = cam.pattern++;
      cam.punchP += r.up * DEG * k * (0.85 + Math.random() * 0.3) * 0.6;
      cam.punchY += r.side * DEG * k * Math.sin(p * 0.62) * (p < 5 ? 0.5 : 1) * 0.6;
      cam.punchR += (Math.random() - 0.5) * r.side * DEG * 0.5;
      a.pitch = clamp(a.pitch + r.up * DEG * k * 0.4, -1.55, 1.55);                  // 一部分后坐留在准星上，要自己压
      if (def.kind === 'sniper') fx.kick(0.32);
    }
    if (hit) {
      if (hit.actor) {
        let dmg = damageFor(def, dist, hit.part, hit.actor.armor);
        if (a.isBot && hit.actor === player) dmg *= a.brain.diff.dmg;
        damage(hit.actor, dmg, a, w.id, hit.part, d);
        fx.blood(hit.x, hit.y, hit.z, d[0], d[1], d[2], hit.part === 'head');
        if (mine) emit('hit', { part: hit.part, killed: !hit.actor.alive, dist });
      } else {
        fx.impact(hit.x, hit.y, hit.z, hit.nx, hit.ny, hit.nz, hit.mat, true);
        const mat = hit.mat === 'wood' ? 'impact_wood' : Math.random() < 0.3 ? 'ricochet' : 'impact_steel';
        audio.world(mat, [hit.x, hit.y, hit.z], { gain: 0.85, max: 34, ref: 2.5 });
      }
    }
    if (!mine && !(hit && hit.actor === player)) whiz(o, d, dist);
  }

  const weaponApi = {
    fire,
    event(a, type) {
      const mine = a === player, o = [a.body.x, a.body.y + 1.2, a.body.z], T = a.w.reloadTotal;
      if (type === 'dry') { if (mine) { audio.local('dry', { gain: 0.7 }); if (a.w.ammo <= 0 && a.w.reserve <= 0) a.autoSwitchAt = state.now + 0.35; } return; }
      if (type === 'reloadStart') {
        for (const [name, k] of [['mag_out', 0.2], ['mag_in', 0.55], ['bolt', 0.8]]) {
          if (name === 'bolt' && !a.w.reloadEmpty) continue;
          if (mine) audio.local(name, { gain: 0.8, at: T * k });
          else audio.world(name, o, { gain: 0.5, max: 12, ref: 1.6, at: T * k });
        }
      }
    },
  };

  function doSwitch(a, slot) {
    const from = a.slot;
    if (!switchSlot(a, slot)) return false;
    a.prevSlot = from;
    if (a === player) { a.zoom = 0; vm.set(a.w.id); audio.local('slide', { gain: 0.35, rate: 1.25 }); emit('switch', { weapon: a.w.id }); }
    return true;
  }
  function cycleSlot(a, dir) {
    for (let k = 1; k <= 4; k++) {
      const s = 1 + ((a.slot - 1 + dir * k + 8) % 4), w = a.slots[s];
      if (w.def.kind !== 'grenade' || w.count > 0) { if (doSwitch(a, s)) return; }
    }
  }

  // ———————————————————————— 玩家 ————————————————————————
  function playerUpdate(dt) {
    const a = player, b = a.body, I = input;
    const scoped = a.w.def.kind === 'sniper' && a.w.ads > 0.6, zoomK = scoped ? camera.fov / cam.fov : 1;
    const k = I.look(zoomK), sy = I.invertY ? -1 : 1;
    a.yaw += I.mouse.dx * k; a.pitch = clamp(a.pitch - I.mouse.dy * k * sy, -1.55, 1.55);
    const wantCrouch = I.keys.has('ControlLeft') || I.keys.has('KeyC') || I.keys.has('ControlRight');
    if (wantCrouch) a.crouch = true;
    else if (a.crouch && !world.overlap(b.x, b.y + 0.02, b.z, b.r, MOVE.stand - 0.02)) a.crouch = false;
    b.h = a.crouch ? MOVE.crouch : MOVE.stand;
    a.eyeH += ((a.crouch ? MOVE.eyeCrouch : MOVE.eye) - a.eyeH) * Math.min(1, dt * 14);
    a.walk = I.keys.has('ShiftLeft') || I.keys.has('ShiftRight');
    const [af, ar] = I.axis();
    moveActor(a, ar, af, dt);
    if (I.hit.has('Space') && b.onGround) { b.vy = MOVE.jump; b.onGround = false; audio.local('cloth', { gain: 0.5 }); }
    if (b.onGround && !a.wasGround && a.fallV < -4.5) { audio.local('land', { gain: clamp(-a.fallV / 10, 0.3, 1) }); cam.land = clamp(-a.fallV / 14, 0, 0.6); }
    a.wasGround = b.onGround; a.fallV = b.vy;
    for (const [code, slot] of [['Digit1', 1], ['Digit2', 2], ['Digit3', 3], ['Digit4', 4], ['KeyG', 4]]) if (I.hit.has(code)) doSwitch(a, slot);
    if (I.hit.has('KeyQ')) doSwitch(a, a.prevSlot);
    if (I.mouse.wheel) cycleSlot(a, I.mouse.wheel > 0 ? 1 : -1);
    a.want.fire = I.mouse.down[0]; a.want.alt = I.mouse.hit[2] && a.w.def.kind === 'melee'; a.want.reload = I.hit.has('KeyR');
    if (a.w.def.kind === 'sniper') {                                                  // 狙击：右键依次切换 两级放大 → 收镜
      if (I.mouse.hit[2]) a.zoom = a.w.ads > 0.5 ? (a.zoom === 1 ? 2 : 0) : 1;
      a.want.ads = a.zoom > 0;
    } else a.want.ads = I.mouse.down[2];
    if (a.autoSwitchAt > 0 && state.now >= a.autoSwitchAt) { a.autoSwitchAt = -1; doSwitch(a, a.slots[a.slot].count === 0 ? nextSlot(a) : a.slot); }
  }

  // ———————————————————————— 机器人 ————————————————————————
  function botUpdate(a, dt) {
    if (a.frozen) { a.want.fire = a.want.ads = a.want.reload = false; a.want.alt = false; return; }   // 测试用的木桩
    const out = botThink(a.brain, { now: state.now, dt, self: a, actors, world, nav, spots: SPOTS, noises });
    const turn = a.brain.diff.turn * DEG, dy = wrapAngle(out.yaw - a.yaw);
    a.yaw += clamp(dy, -turn * dt, turn * dt);
    a.pitch = clamp(a.pitch + clamp(out.pitch - a.pitch, -turn * dt * 0.8, turn * dt * 0.8), -1.4, 1.4);
    a.crouch = out.crouch;
    a.body.h = a.crouch ? MOVE.crouch : MOVE.stand;
    a.eyeH += ((a.crouch ? MOVE.eyeCrouch : MOVE.eye) - a.eyeH) * Math.min(1, dt * 10);
    a.crouchK += ((a.crouch ? 1 : 0) - a.crouchK) * Math.min(1, dt * 9);
    a.flinch *= Math.exp(-dt * 7);
    const cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    moveActor(a, out.mx * -sy + out.mz * cy, out.mx * cy + out.mz * sy, dt);
    a.want.fire = out.fire; a.want.ads = out.ads; a.want.reload = out.reload; a.want.alt = false;
    if (out.swap) doSwitch(a, nextSlot(a));
    if (a.autoSwitchAt > 0 && state.now >= a.autoSwitchAt) { a.autoSwitchAt = -1; doSwitch(a, nextSlot(a)); }
  }
  function modelUpdate(a, dt) {
    const m = a.model; if (!m) return;
    const p = m.pose, b = a.body;
    m.group.position.set(b.x, b.y, b.z);
    if (a.alive) { m.group.rotation.y = -a.yaw; p.t = state.now; p.crouch = a.crouchK; p.phase = a.phase; p.speed = Math.hypot(b.vx, b.vz); p.pitch = a.pitch; p.recoil = Math.exp(-(state.now - a.lastFire) * 13); p.flinch = a.flinch; p.dead = 0; p.fall = 1; }
    else {
      a.deadT += dt;
      p.dead = Math.min(1, a.deadT / 0.75); p.fall = a.deathBack ? 1 : -1; p.speed = 0; p.recoil = 0;
      m.group.position.y = a.deadT > 4 ? -(a.deadT - 4) * 0.6 : 0;
      if (a.deadT > 6.5) m.group.visible = false;
    }
    m.apply(p);
  }

  // ———————————————————————— 手雷 ————————————————————————
  function nadesUpdate(dt) {
    for (let i = nades.length - 1; i >= 0; i--) {
      const n = nades[i];
      n.t -= dt; n.vy -= 14 * dt;
      const sp = Math.hypot(n.vx, n.vy, n.vz), step = Math.max(sp * dt, 1e-4), h = nadesStep(n, step);
      n.spin += dt * 9;
      n.mesh.position.set(n.x, n.y, n.z); n.mesh.rotation.set(n.spin, n.spin * 0.7, 0);
      if (n.t <= 0) { explode(n); shipRoot.remove(n.mesh); n.mesh.geometry.dispose(); nades.splice(i, 1); }
    }
  }
  /** 手雷沿速度方向走 step 米，撞到东西就反弹。返回 true 表示弹过了 */
  function nadesStep(n, step) {
    const l = Math.hypot(n.vx, n.vy, n.vz) || 1, d = [n.vx / l, n.vy / l, n.vz / l];
    const hit = world.raycast(n.x, n.y, n.z, d[0], d[1], d[2], step + 0.03, null);
    if (hit && hit.t <= step + 0.03) {
      n.x = hit.x + hit.nx * 0.04; n.y = hit.y + hit.ny * 0.04; n.z = hit.z + hit.nz * 0.04;
      const vn = n.vx * hit.nx + n.vy * hit.ny + n.vz * hit.nz;
      n.vx -= vn * hit.nx * 1.42; n.vy -= vn * hit.ny * 1.42; n.vz -= vn * hit.nz * 1.42;    // 法向反弹 0.42、切向保留 1
      n.vx *= 0.72; n.vy *= 0.72; n.vz *= 0.72;
      if (Math.abs(vn) > 1.2) audio.world('bounce', [n.x, n.y, n.z], { gain: clamp(Math.abs(vn) / 9, 0.3, 1), max: 26, ref: 2.2 });
      return true;
    }
    n.x += d[0] * step; n.y += d[1] * step; n.z += d[2] * step;
    return false;
  }
  function explode(n) {
    const def = WEAPONS.he, o = n.owner;
    fx.explosion(n.x, n.y, n.z);
    audio.world('explosion', [n.x, n.y, n.z], { gain: 1.3, max: 320, ref: 9, roll: 0.55, send: 0.8, vary: 0.1 });
    noise(n.x, n.z, -1, 3, o);
    for (const a of actors) {
      if (!a.alive || state.now < a.protect) continue;
      const d = Math.hypot(a.body.x - n.x, a.body.y + 0.9 - n.y, a.body.z - n.z);
      if (d > def.radius) continue;
      const los = world.los(n.x, n.y + 0.1, n.z, a.body.x, a.body.y + 1.0, a.body.z);
      let dmg = def.dmg * Math.pow(1 - d / def.radius, 1.1) * (los ? 1 : 0.3);
      if (a === o) dmg *= 0.6; else if (o && o.isBot && a === player) dmg *= o.brain.diff.dmg;
      const l = Math.max(d, 0.01), dir = [(a.body.x - n.x) / l, 0.3, (a.body.z - n.z) / l];
      damage(a, dmg, o, 'he', 'chest', dir);
      if (a === player) fx.kick(clamp(1.25 - d / 8, 0, 1.25), clamp(1 - d / 11, 0, 0.85));
    }
  }

  // ———————————————————————— 雷达情报 ————————————————————————
  function updateSpotting(dt) {
    spotT -= dt;
    if (spotT > 0) return;
    spotT = 0.15;
    const team = player ? player.team : 0, mates = actors.filter((a) => a.alive && a.team === team);
    for (const a of actors) {
      if (a.team === team || !a.alive) { a.spotted = 0; continue; }
      let seen = state.now - a.lastShotAt < 1.3 && (a.lastShotAt >= 0);
      for (const m of mates) {
        if (seen) break;
        const dx = a.body.x - m.body.x, dz = a.body.z - m.body.z, d2 = dx * dx + dz * dz;
        if (d2 > 55 * 55) continue;
        if (Math.abs(wrapAngle(Math.atan2(dz, dx) - m.yaw)) < 1.35 || d2 < 36) seen = world.los(m.body.x, m.body.y + m.eyeH, m.body.z, a.body.x, a.body.y + a.eyeH * 0.9, a.body.z);
      }
      a.spotted = seen ? state.now + 0.9 : a.spotted;
    }
  }

  // ———————————————————————— 主更新 ————————————————————————
  function update(dt) {
    if (state.phase !== 'playing') { fx.update(dt, camera.fov, stage.renderer.getDrawingBufferSize(tmpSize).y, stage.vm.camera.fov); return; }
    state.now += dt;
    state.left = Math.max(0, state.left - dt);
    if (state.left <= 0) endMatch(state.scores[0] === state.scores[1] ? (player ? 1 - player.team : 0) : state.scores[0] > state.scores[1] ? 0 : 1);
    for (let i = noises.length - 1; i >= 0; i--) if (noises[i].t < state.now - 0.6) noises.splice(i, 1);
    for (const a of actors) {
      if (a.alive) {
        if (a.isBot) botUpdate(a, dt); else playerUpdate(dt);
        if (a.alive) tickWeapon(a, dt, a.want, weaponApi);
      } else if (state.phase === 'playing' && state.now >= a.respawnAt) spawn(a);
      if (a.isBot) modelUpdate(a, dt);
    }
    nadesUpdate(dt);
    updateSpotting(dt);
    // 镜头
    const b = player.body, rec = Math.exp(-dt * 8.5);
    cam.punchP *= rec; cam.punchY *= rec; cam.punchR *= Math.exp(-dt * 10); cam.land *= Math.exp(-dt * 7);
    const sh = fx.shake(), sp = Math.hypot(b.vx, b.vz), bobK = Math.min(1, sp / 5.5) * (b.onGround ? 1 : 0);
    if (player.alive) {
      cam.deadT = 0;
      eye[0] = b.x; eye[1] = b.y + a0(player) + 0.024 * Math.abs(Math.sin(player.phase)) * bobK - 0.05 * cam.land; eye[2] = b.z;
    } else {
      cam.deadT += dt;
      const k = Math.min(1, cam.deadT / 0.9);
      eye[0] = b.x; eye[1] = b.y + a0(player) * (1 - k) + 0.3 * k; eye[2] = b.z;
      if (player.lastAttacker) { const t = player.lastAttacker, dy = wrapAngle(Math.atan2(t.body.z - b.z, t.body.x - b.x) - player.yaw); player.yaw += dy * Math.min(1, dt * 2.2) * (cam.deadT < 3 ? 1 : 0); }
    }
    camera.position.set(eye[0], eye[1], eye[2]);
    camera.rotation.set(player.pitch + cam.punchP + cam.shakeY * sh, -(player.yaw + PI / 2) + cam.shakeX * sh, cam.punchR * 0.6 + cam.land * 0.5 + (cam.deadT > 0.2 ? 0.5 * Math.min(1, (cam.deadT - 0.2) / 0.8) : 0));
    const wantFov = player.alive ? fovFor(player) : cam.fov + 8;
    if (Math.abs(camera.fov - wantFov) > 0.01) { camera.fov += (wantFov - camera.fov) * Math.min(1, dt * 12); camera.updateProjectionMatrix(); }
    // 第一人称枪模
    if (vm) {
      const w = player.w, scoped = w.def.kind === 'sniper' && w.ads > 0.9;
      vm.setVisible(player.alive && !scoped);
      vm.update(dt, { ads: w.ads, speed: sp, onGround: b.onGround, phase: player.phase, dYaw: player.yaw - cam.lastYaw, dPitch: player.pitch - cam.lastPitch,
        reload: w.reload > 0 ? 1 - w.reload / w.reloadTotal : -1, reloadEmpty: w.reloadEmpty, draw: w.draw > 0 ? w.draw / w.def.draw : 0, bolt: w.bolt > 0 ? 1 - w.bolt / w.def.bolt : -1 });
    }
    cam.lastYaw = player.yaw; cam.lastPitch = player.pitch;
    cam.shakeX = (Math.random() - 0.5) * 0.05; cam.shakeY = (Math.random() - 0.5) * 0.05;
    stage.renderer.getDrawingBufferSize(tmpSize);
    stage.vmSync(dt);
    stage.vm.root.visible = player.alive;
    fx.update(dt, camera.fov, tmpSize.y, stage.vm.camera.fov);
    const d3 = fwd(player.yaw, tmpV), cp = Math.cos(player.pitch);
    audio.listener(eye, [d3[0] * cp, Math.sin(player.pitch), d3[2] * cp], dt);
  }
  function a0(a) { return a.eyeH; }
  /** 镜头视野：步枪 / 手枪瞄准时略微推近；AWM 开镜后跳到放大倍率对应的窄视野 */
  function fovFor(a) {
    const w = a.w, base = cam.fov;
    if (w.def.kind === 'sniper') {
      if (w.ads > 0.9) return a.zoom === 2 ? 7.5 : 17;
      if (w.ads > 0.4) return base + (46 - base) * (w.ads - 0.4) / 0.5;
      return base;
    }
    const target = w.def.kind === 'pistol' ? 64 : 58, e = w.ads * w.ads * (3 - 2 * w.ads);
    return base + (target - base) * e;
  }
  const tmpSize = new THREE.Vector2(), tmpW = new THREE.Vector3();

  // ———————————————————————— 开局 / 收尾 ————————————————————————
  function clearActors() {
    for (const a of actors) if (a.model) { shipRoot.remove(a.model.group); a.model.mesh.geometry.dispose(); a.model.mesh.skeleton.dispose(); }   // 骨骼贴图也在显卡上，要一起放掉
    actors.length = 0; noises.length = 0;
    for (const n of nades) { shipRoot.remove(n.mesh); n.mesh.geometry.dispose(); }
    nades.length = 0;
    fx.clear();
  }
  function start(settings) {
    clearActors();
    Object.assign(state, { phase: 'playing', now: 0, left: RULES.time, scores: [0, 0], target: settings.target || 50, winner: -1, firstBlood: false });
    state.feed.length = 0;
    G.settings = settings;
    seed = settings.seed || ((Math.random() * 1e9) | 0);
    mrand = mulberry32((seed ^ 0x9e3779b9) >>> 0);
    const r = mulberry32(seed), size = Math.max(2, Math.min(6, settings.size || 4)), diff = settings.diff || 'normal';
    const team = settings.team ?? 0;
    player = makeActor(0, team, false, '我', settings.primary || 'ak47');
    player.zoom = 0;
    actors.push(player); G.player = player;
    if (!vm) { vm = createViewmodel(stage, team); G.vm = vm; } else vm.setTeam(team);
    const used = [0, 0];
    for (let team = 0; team < 2; team++) for (let k = actors.filter((a) => a.team === team).length; k < size; k++) {
      const id = actors.length, n = NAMES[team][used[team]++ % NAMES[team].length];
      const primary = r() < 0.18 ? 'awm' : team === 0 ? 'm4a1' : 'ak47';
      const a = makeActor(id, team, true, n, primary);
      a.model = createSoldier(M, team, primary);
      a.brain = createBrain(seed + id * 977, diff);
      shipRoot.add(a.model.group);
      actors.push(a);
    }
    for (const a of actors) spawn(a);
    cam.deadT = 0; cam.punchP = cam.punchY = cam.punchR = 0; cam.lastYaw = player.yaw; cam.lastPitch = player.pitch;
    stage.vm.root.visible = true;
    camera.fov = cam.fov = settings.fov || 75; camera.updateProjectionMatrix();
    audio.setMode('game');
    audio.local('start', { gain: 0.8 });
    emit('start');
  }

  /** 开打之前（加载界面还开着）先把士兵、枪模、特效的着色器编译好，免得第一个人出现、第一枪开火时卡一下 */
  async function warmup(compile) {
    if (!vm) { vm = createViewmodel(stage, 0); G.vm = vm; }
    const temps = [[0, 'm4a1'], [1, 'ak47'], [0, 'awm']].map(([t, w]) => { const m = createSoldier(M, t, w); shipRoot.add(m.group); return m; });
    try { await compile(); } finally { for (const m of temps) { shipRoot.remove(m.group); m.mesh.geometry.dispose(); m.mesh.skeleton.dispose(); } }
    stage.vm.root.visible = false;                                         // 开打之前枪模不出现（大厅里镜头不在玩家眼睛上）
  }
  Object.assign(G, {
    warmup,
    start,
    stop() { state.phase = 'lobby'; input.unlock(); stage.vm.root.visible = false; },
    update,
    get eye() { return eye; },
    get camera2() { return cam; },
    /** 测试用：直接把某个机器人摆到某处并让它看到 / 做某事 */
    switchTo: (a, slot) => doSwitch(a, slot),
    setPose(a, x, z, yaw, pitch = 0) { Object.assign(a.body, { x, y: 0, z, vx: 0, vy: 0, vz: 0 }); a.yaw = yaw; a.pitch = pitch; },
    noise,
    hurt: (a, amount, attacker, part = 'chest') => damage(a, amount, attacker, attacker ? attacker.w.id : 'ak47', part, [0, 0, 1]),
    spawn,
    setFov: (f) => { cam.fov = f; },
    /** 玩家当前的散布（度），给准星用 */
    spread: () => (player && player.alive ? currentSpread(player) : 0),
  });
  return G;
}
