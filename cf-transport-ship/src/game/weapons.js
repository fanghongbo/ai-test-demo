// 武器逻辑（玩家和机器人共用）：弹匣 / 备弹、射速、换弹、拉栓、散布、开火节奏。
// 一发子弹出去之后的事（伤害、特效、声音）不在这里：tickWeapon 只在开火的那一刻调用 ev.fire。
import { WEAPONS, DEG } from '../core/config.js';
import { clamp } from '../core/mathx.js';

const ADS_RATE = { rifle: 5.5, sniper: 3.4, pistol: 6.5 };

export function newWeapon(id) {
  const def = WEAPONS[id];
  return { id, def, ammo: def.mag || 0, reserve: def.reserve || 0, count: def.count || 0, cd: 0, reload: 0, reloadTotal: 1, reloadEmpty: false, draw: 0, bolt: 0, ads: 0, bloom: 0, shot: 0, held: false };
}

/** 一套装备：主武器 + 手枪（保卫者 USP，潜伏者沙鹰）+ 军刀 + 一颗高爆手雷 */
export function makeLoadout(primary, team) {
  const s = { 1: newWeapon(primary), 2: newWeapon(team === 0 ? 'usp' : 'deagle'), 3: newWeapon('knife'), 4: newWeapon('he') };
  return s;
}
export function resetWeapons(a) {
  for (const k of [1, 2, 3, 4]) {
    const w = a.slots[k], d = w.def;
    w.ammo = d.mag || 0; w.reserve = d.reserve || 0; w.count = d.count || 0;
    w.cd = w.reload = w.bolt = w.ads = w.bloom = w.draw = 0;
  }
}
export function switchSlot(a, slot) {
  const w = a.slots[slot];
  if (!w || slot === a.slot || !a.alive) return false;
  if (w.def.kind === 'grenade' && w.count <= 0) return false;
  a.w.reload = 0;
  a.slot = slot; a.w = w;
  w.draw = w.def.draw ?? 0.3; w.bolt = 0; w.held = true;
  return true;
}
/** 下一个还有弹药的武器槽（手雷扔完、子弹打光时用） */
export function nextSlot(a) {
  for (const k of [1, 2, 3]) if (k !== a.slot && (a.slots[k].def.kind === 'melee' || a.slots[k].ammo > 0 || a.slots[k].reserve > 0 || a.slots[k].count > 0)) return k;
  return 3;
}

/** 当前的散布（度）：腰射基础 + 移动 + 空中，瞄准和下蹲收紧，再加连发的扩散 */
export function currentSpread(a) {
  const w = a.w, def = w.def;
  if (!def.spread) return 0;
  const move = Math.min(1.4, Math.hypot(a.body.vx, a.body.vz) / 5.5), k = w.ads;
  return (def.spread.hip + def.spread.move * move + (a.body.onGround ? 0 : def.spread.air)) * (1 - k * 0.84) * (a.crouch ? 0.75 : 1) + w.bloom * (1 - k * 0.6);
}

/**
 * 推进一把武器。
 * @param want { fire, alt, ads, reload }
 * @param ev { fire(a, w, spreadDeg, heavy), event(a, type) }   type：dry / reloadStart / reloadEnd / boltEnd / switch
 */
export function tickWeapon(a, dt, want, ev) {
  const w = a.w, def = w.def;
  if (w.cd > 0) w.cd -= dt;
  if (w.draw > 0) w.draw = Math.max(0, w.draw - dt);
  w.bloom *= Math.exp(-dt * 3);                                               // 连发扩散：每发加一点，按指数回落
  const canAds = !!ADS_RATE[def.kind];
  const adsGoal = canAds && want.ads && w.reload <= 0 && a.alive ? 1 : 0;
  const adsK = Math.min(1, dt * (ADS_RATE[def.kind] || 6));
  w.ads = clamp(w.ads + (adsGoal - w.ads) * adsK, 0, 1);
  if (Math.abs(w.ads - adsGoal) < 0.003) w.ads = adsGoal;                      // 指数逼近收尾时直接到位
  if (!a.alive) return;

  if (w.reload > 0) {                                             // ———— 换弹中 ————
    w.reload -= dt;
    if (w.reload <= 0) {
      w.reload = 0;
      const take = Math.min(def.mag - w.ammo, w.reserve);
      w.ammo += take; w.reserve -= take;
      ev.event(a, 'reloadEnd');
    }
    return;
  }
  if (def.mag && want.reload && w.ammo < def.mag && w.reserve > 0 && w.draw <= 0.1) {
    w.reload = w.reloadTotal = def.reload; w.reloadEmpty = w.ammo === 0;
    ev.event(a, 'reloadStart');
    return;
  }
  if (w.bolt > 0) {                                               // ———— 开一枪之后拉栓（AWM）————
    w.bolt -= dt;
    if (w.bolt <= 0) { w.bolt = 0; ev.event(a, 'boltEnd'); }
    return;
  }
  if (def.kind === 'melee') {                                     // ———— 军刀 ————
    const pressed = want.fire && !w.held, heavy = !!want.alt && !w.heldAlt;
    w.held = !!want.fire; w.heldAlt = !!want.alt;
    if ((pressed || heavy) && w.cd <= 0 && w.draw <= 0.1) { w.cd = 60 / def.rpm; w.shot++; ev.fire(a, w, 0, heavy); }
    return;
  }
  if (def.kind === 'grenade') {                                   // ———— 手雷 ————
    const pressed = want.fire && !w.held;
    w.held = !!want.fire;
    if (pressed && w.cd <= 0 && w.count > 0 && w.draw <= 0.25) { w.count--; w.cd = 1.0; w.shot++; ev.fire(a, w, 0, false); }
    else if (pressed && w.count <= 0 && w.cd <= 0) ev.event(a, 'dry');
    return;
  }
  const pressed = want.fire && (def.auto || !w.held);             // ———— 枪 ————
  w.held = !!want.fire;
  if (!pressed || w.cd > 0 || w.draw > 0.12) return;
  if (w.ammo <= 0) { w.cd = 0.28; ev.event(a, 'dry'); return; }
  w.ammo--; w.shot++;
  w.cd = 60 / def.rpm;
  if (def.bolt) w.bolt = def.bolt;
  ev.fire(a, w, currentSpread(a), false);
  w.bloom = Math.min(3, w.bloom + (def.kind === 'sniper' ? 0.3 : def.kind === 'pistol' ? 0.12 : 0.16));
}

/** 瞄准方向加上散布：在圆锥里取一个偏转（三次均匀随机叠加，中间密两边疏）。r = () => 0..1 */
export function aimDir(yaw, pitch, spreadDeg, r, out) {
  const s = spreadDeg * DEG;
  const a = r() * Math.PI * 2, m = Math.abs((r() + r() + r()) / 1.5 - 1) * s;
  const y = yaw + Math.cos(a) * m / Math.max(0.2, Math.cos(pitch)), p = clamp(pitch + Math.sin(a) * m, -1.55, 1.55);
  const cp = Math.cos(p);
  out[0] = cp * Math.cos(y); out[1] = Math.sin(p); out[2] = cp * Math.sin(y);
  return out;
}
