// 不开浏览器：在 Node 里把货舱甲板建出来（只用它的碰撞体），检查寻路和机器人逻辑会不会卡死、走不通。
// 用法：node tools/qa/node_sim.mjs        退出码：0 全部通过
import * as THREE from 'three';
import { buildDeck } from '../../src/world/deck.js';
import { createNav } from '../../src/core/nav.js';
import { createBrain, botThink } from '../../src/game/ai.js';
import { StaticWorld } from '../../src/core/collision.js';
import { SPAWNS, MOVE, CONTAINERS, CRATES, WEAPONS } from '../../src/core/config.js';
import { makeLoadout, tickWeapon, switchSlot, nextSlot } from '../../src/game/weapons.js';
import { castShot } from '../../src/core/hitscan.js';

const SPOTS = [[0, 0], [-13, -3.5], [-13, 7], [10.25, -7], [12, 4], [0, -9], [0, 9], [-20, 4.5], [20, -4.5], [-23.2, -3.5], [23.2, 3.5], [-4.5, 5.2], [5.5, -5.5], [-20, -6.2], [20, 6.2]];
let fail = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? `  — ${detail}` : '')); if (!ok) fail++; };

const world = new StaticWorld();
buildDeck(new THREE.Group(), {}, world, {});
const nav = createNav(world);
const free = nav.walk.reduce((n, v) => n + v, 0);
check('可行走的格子数量合理', free > 600 && free < 900, `${free} / ${nav.walk.length}`);

// 1. 出生点不卡在东西里
let bad = 0;
for (const t of [0, 1]) for (const [x, z] of SPAWNS[t]) if (world.overlap(x, 0.3, z, MOVE.radius, MOVE.stand - 0.3)) { bad++; console.log('   出生点被占:', t, x, z); }
check('12 个出生点都是空的', bad === 0);

// 2. 热点都走得过去，且任意两个热点之间都有路
const spotBad = SPOTS.filter(([x, z]) => world.overlap(x, 0.3, z, MOVE.radius, MOVE.stand - 0.3));
check('游走热点都可行走', spotBad.length === 0, JSON.stringify(spotBad));
let paths = 0, maxMs = 0, nulls = 0;
for (const [ax, az] of SPOTS) for (const [bx, bz] of SPOTS) {
  const t0 = performance.now(), p = nav.findPath(ax, az, bx, bz), ms = performance.now() - t0;
  maxMs = Math.max(maxMs, ms);
  if (!p) { nulls++; console.log('   走不通:', ax, az, '→', bx, bz); } else paths++;
}
check('热点之间全部走得通', nulls === 0, `${paths} 条路，最慢 ${maxMs.toFixed(1)} ms`);
check('一次寻路不超过 20 ms', maxMs < 20, `${maxMs.toFixed(1)} ms`);

// 3. 沿着路走一遍：每一段都真的不撞东西
let segBad = 0, segs = 0;
for (const [ax, az] of SPOTS) for (const [bx, bz] of SPOTS) {
  const p = nav.findPath(ax, az, bx, bz);
  for (let i = 0; i < p.length - 1; i++) { segs++; if (!world.corridorFree(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], MOVE.radius, MOVE.stand - 0.05)) segBad++; }
}
check('路径的每一段都留得下人物的半径', segBad === 0, `${segs} 段，${segBad} 段太贴`);

// 4. 三条道都通：中路、两条侧通道各自的出入口
const lane = (a, b) => !!nav.findPath(a[0], a[1], b[0], b[1]);
check('出生舱 → 主甲板门洞走得通', lane([-28, 0], [-23, 0]) && lane([28, 0], [23, 0]));
check('北通道从右舱一直通到左端', lane([27, -9], [-24, -9]));
check('南通道从左舱一直通到右端', lane([-27, 9], [24, 9]));

// 4b. 真的走一遍：从出生点沿直线走出大门洞（两边各一次），路上不能被东西挡住
const walker = (x, z, vx, vz, frames) => { const b = { x, y: 0, z, vx, vy: 0, vz, r: MOVE.radius, h: MOVE.stand, step: MOVE.step, onGround: true }; for (let f = 0; f < frames; f++) { b.vy -= 20 / 60; world.move(b, 1 / 60); } return b; };
const w0 = walker(-29.5, 0, 5.5, 0, 150), w1 = walker(29.5, 2.6, -5.5, 0, 110);
check('出生舱大门洞是通的（走直线就能上甲板）', w0.x > -25 && w1.x < 25 && w0.y === 0 && w1.y === 0, `保卫者一侧停在 x=${w0.x.toFixed(2)}，潜伏者一侧停在 x=${w1.x.toFixed(2)}`);
const w2 = walker(-27, 9, 5, 0, 660), w3 = walker(27, -9, -5, 0, 660);
check('两条侧通道能从头走到尾', w2.x > 22 && w3.x < -22, `南通道停在 x=${w2.x.toFixed(2)}，北通道停在 x=${w3.x.toFixed(2)}`);

// 5. 机器人脑子：跑 20 秒不抛异常、不卡死；会开枪、会换弹、会移动
const mk = (id, team) => ({ id, team, isBot: true, name: 'b' + id, alive: true, hp: 100, armor: 100, eyeH: MOVE.eye, crouch: false, yaw: team ? Math.PI : 0, pitch: 0, lastHit: -9, lastFire: -9, slots: makeLoadout(team ? 'ak47' : 'm4a1', team), slot: 1, want: {}, body: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: MOVE.radius, h: MOVE.stand, step: MOVE.step, onGround: true } });
const actors = [];
for (const t of [0, 1]) SPAWNS[t].forEach(([x, z, yaw], i) => { const a = mk(actors.length, t); Object.assign(a.body, { x, z }); a.yaw = yaw; a.w = a.slots[1]; a.brain = createBrain(100 + actors.length, 'hard'); actors.push(a); });
const noises = [];
let shots = 0, reloads = 0, travelled = 0;
const dt = 1 / 60;
const t0 = performance.now();
for (let f = 0; f < 60 * 30; f++) {
  const now = f * dt;
  for (const a of actors) {
    if (!a.alive) continue;
    const out = botThink(a.brain, { now, dt, self: a, actors, world, nav, spots: SPOTS.map(([x, z]) => [x, z, 1]), noises });
    const turn = 500 * Math.PI / 180;
    a.yaw += Math.max(-turn * dt, Math.min(turn * dt, out.yaw - a.yaw));
    a.pitch = out.pitch;
    a.crouch = out.crouch; a.body.h = a.crouch ? MOVE.crouch : MOVE.stand;
    const cx = Math.cos(a.yaw), sx = Math.sin(a.yaw), wx = cx * (out.mx * cx + out.mz * sx) - sx * (out.mx * -sx + out.mz * cx), wz = sx * (out.mx * cx + out.mz * sx) + cx * (out.mx * -sx + out.mz * cx);
    a.body.vx = wx * 5; a.body.vz = wz * 5; a.body.vy -= 20 * dt;
    world.move(a.body, dt);
    travelled += Math.hypot(a.body.vx, a.body.vz) * dt;
    if (!Number.isFinite(a.body.x + a.body.y + a.body.z + a.yaw + a.pitch)) { check('机器人状态始终是有限数', false, `第 ${f} 帧`); process.exit(1); }
    a.want = { fire: out.fire, ads: out.ads, reload: out.reload, alt: false };
    const before = a.w.shot;
    tickWeapon(a, dt, a.want, { fire: () => { shots++; noises.push({ x: a.body.x, z: a.body.z, team: a.team, loud: 1.7, owner: a, t: now }); }, event: (x, type) => { if (type === 'reloadStart') reloads++; if (type === 'dry') switchSlot(x, nextSlot(x)); } });
    if (out.swap) switchSlot(a, nextSlot(a));
  }
  for (let i = noises.length - 1; i >= 0; i--) if (noises[i].t < now - 0.6) noises.splice(i, 1);
}
const simMs = performance.now() - t0;
check('12 个机器人跑 30 秒不卡死', simMs < 8000, `${simMs.toFixed(0)} ms`);
check('机器人会开枪', shots > 30, `${shots} 发`);
check('机器人会换弹', reloads > 0, `${reloads} 次`);
check('机器人会走动', travelled > 200, `${travelled.toFixed(0)} m`);

// 6. 命中判定：从一只机器人的眼睛朝另一只开枪，能打到人；朝墙开枪打在墙上
const a0 = actors[0], a1 = actors.find((x) => x.team !== a0.team);
Object.assign(a0.body, { x: -29, y: 0, z: -6 }); Object.assign(a1.body, { x: -27, y: 0, z: -6 }); a1.crouch = false; a1.body.h = MOVE.stand;
const eye = [a0.body.x, a0.body.y + a0.eyeH, a0.body.z];
const flat = castShot(world, actors, eye, [1, 0, 0], 100, a0, (o) => o.team !== a0.team);
check('与眼睛同高平射打到的是头', flat && flat.actor === a1 && flat.part === 'head', flat ? `${flat.part} t=${flat.t.toFixed(2)}` : 'null');
const dyC = (1.2 - eye[1]) / 2, lC = Math.hypot(1, dyC);
const h1 = castShot(world, actors, eye, [1 / lC, dyC / lC, 0], 100, a0, (o) => o.team !== a0.team);
check('压低枪口打到躯干', h1 && h1.actor === a1 && h1.part === 'chest', h1 ? `${h1.part} t=${h1.t.toFixed(2)}` : 'null');
const top = a1.body.y + a1.body.h - 0.12, dy = (top - eye[1]) / 2, l = Math.hypot(1, dy);
const h2 = castShot(world, actors, eye, [1 / l, dy / l, 0], 100, a0, (o) => o.team !== a0.team);
check('抬高枪口打到头', h2 && h2.actor === a1 && h2.part === 'head', h2 ? `${h2.part} t=${h2.t.toFixed(2)}` : 'null');
const h3 = castShot(world, actors, eye, [0, 0, 1], 100, a0, null);
check('朝侧面开枪打在舱里的矮墙上', h3 && !h3.actor && h3.mat === 'steel' && h3.t > 11 && h3.t < 12, h3 ? `mat=${h3.mat} t=${h3.t.toFixed(2)}` : 'null');

// 7. 武器数值：AK 一梭子 30 发、射速 600、换弹 2.45 秒
const p = { ...mk(99, 1), isBot: false }; p.w = p.slots[1]; p.body.onGround = true;
let n = 0;
for (let f = 0; f < 60 * 4; f++) tickWeapon(p, 1 / 60, { fire: true, ads: false, reload: false }, { fire: () => n++, event: () => {} });
check('按住扳机 4 秒：AK 打空一个弹匣', n === 30 && p.w.ammo === 0, `${n} 发，剩 ${p.w.ammo}`);
let rl = 0;
for (let f = 0; f < 60 * 3; f++) tickWeapon(p, 1 / 60, { fire: false, ads: false, reload: f === 2 }, { fire: () => {}, event: (x, type) => { if (type === 'reloadEnd') rl = f / 60; } });
check('换弹 2.45 秒后弹匣回满', p.w.ammo === 30 && p.w.reserve === 60 && Math.abs(rl - 2.45 - 2 / 60) < 0.03, `t=${rl.toFixed(2)} ammo=${p.w.ammo} reserve=${p.w.reserve}`);

console.log(fail ? `\n${fail} 项失败` : '\n全部通过');
process.exit(fail ? 1 : 0);
