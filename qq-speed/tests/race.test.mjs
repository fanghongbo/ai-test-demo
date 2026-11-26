// Whole races simulated step by step in Node: countdown, perfect start, laps, ranks, finish, restart, and the item mode.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CARS, RIVALS } from '../src/core/cardef.js';
import { createRace } from '../src/game/race.js';
import { ITEMS, SPIN } from '../src/game/items.js';
import { aiThink, createAiDriver } from '../src/game/ai.js';
import { DT, RL, T, key } from './helpers.mjs';

const rivals = (n, skill = 0.94) => Array.from({ length: n }, (_, j) => ({ def: CARS[2 + (j % 3)], skill: skill + j * 0.02, name: RIVALS[j] }));
const types = (ev) => ev.map((e) => e.type);

/** Runs a race to the end (or for `limit` seconds) with the AI at the wheel of the player's car, through the same keys a human has */
function runRace(cfg, { limit = 240, onStep } = {}) {
  const race = createRace(T, RL, cfg), pilot = createAiDriver(0.98), seen = {}, press = new Set();
  let armed = false;
  const pin = {
    pressed: (a) => { const yes = press.has(a); press.delete(a); return yes; },
    drive: () => aiThink(pilot, race.player.S, T, RL, DT, race.cars.map((c) => c.S)),
  };
  race.start();
  let t = 0;
  while (t < limit && !(race.state === 'finish' && race.cars.every((c) => c.finished))) {
    if (race.state === 'countdown' && race.goT < 0.3 && !armed) { armed = true; press.add('up'); }          // floor it just before GO
    if (onStep) onStep(race, press);
    for (const e of race.step(DT, pin)) seen[e.type] = (seen[e.type] || 0) + 1;
    t += DT;
  }
  return { race, seen, t };
}

test('countdown: nothing moves until GO; pressing up just before GO is a perfect start', () => {
  const race = createRace(T, RL, { laps: 1, player: CARS[1], rivals: rivals(5) }), ev = [];
  const x0 = race.cars.map((c) => [c.S.x, c.S.z]);
  assert.equal(race.state, 'grid');
  const holdEverything = { pressed: () => false, drive: () => key({ up: true, left: true, drift: true, nitro: true }) };
  race.step(DT, holdEverything);
  assert.equal(race.state, 'grid');
  race.start();
  let pressed = false;
  for (let n = 0; n < 120 * 2; n++) { race.step(DT, holdEverything); assert.equal(race.state, 'countdown'); }
  race.cars.forEach((c, i) => assert.ok(Math.hypot(c.S.x - x0[i][0], c.S.z - x0[i][1]) < 1e-9, `${c.name} moved during the countdown`));
  assert.ok(race.cars.every((c) => c.lap === 0));
  while (race.state === 'countdown') for (const e of race.step(DT, { pressed: (a) => a === 'up' && race.goT < 0.3 && !pressed && (pressed = true, true), drive: () => key() })) ev.push(e.type);
  assert.ok(ev.includes('perfectStart'), ev.join(','));
  assert.equal(race.state, 'race');
  assert.ok(ev.includes('go'), ev.join(','));
  assert.equal(race.player.stats.perfect, 1);
  assert.ok(race.player.S.miniT > 0, 'the perfect start did not boost the car');
});

test('speed mode: six cars, two laps, everyone finishes with sane lap times and unique ranks', () => {
  const laps = 2, { race, seen, t } = runRace({ laps, player: CARS[1], rivals: rivals(5) });
  assert.equal(race.mode, 'speed');
  assert.equal(race.items.on, false);
  assert.ok(race.cars.every((c) => c.finished), `not everyone finished within ${t.toFixed(0)} s`);
  assert.equal(race.player.stats.perfect, 1, 'the test driver missed the perfect start');
  for (const c of race.cars) {
    assert.equal(c.laps.length, laps, `${c.name}: ${c.laps.length} laps`);
    for (const x of c.laps) assert.ok(x > 50 && x < 110, `${c.name}: lap time ${x.toFixed(1)} s`);
    assert.ok(c.finishT > 100 && c.finishT < 220, `${c.name}: finished at ${c.finishT}`);
    if (c.isPlayer) assert.ok(c.stats.top > 120 && c.stats.top <= c.def.vmax + c.def.nitroPlus + c.def.miniPlus + 1, `top speed ${c.stats.top.toFixed(0)}`);
    assert.ok(Number.isFinite(c.S.x + c.S.z + c.S.psi + c.S.vx + c.S.vz), `${c.name}: broken state`);
  }
  assert.deepEqual([...race.cars].map((c) => c.rank).sort(), [1, 2, 3, 4, 5, 6]);
  assert.equal(new Set(race.order).size, 6);
  assert.equal(seen.lap, 12, `${seen.lap} lap events`);
  assert.ok(seen.drift > 40 && seen.mini > 10, `too few techniques: ${JSON.stringify(seen)}`);
  assert.equal(seen.itemGet, undefined, 'items appeared in a speed race');
  assert.equal(race.wrongWay(), false);
});

test('all five cars can be driven to the end by the AI', () => {
  for (const def of CARS) {
    const { race, seen } = runRace({ laps: 1, player: def, rivals: rivals(2, 0.93) }, { limit: 150 });
    assert.ok(race.player.finished, `${def.name}: did not finish a lap`);
    assert.ok(race.player.laps[0] > 55 && race.player.laps[0] < 100, `${def.name}: lap ${race.player.laps[0].toFixed(1)} s`);
    assert.ok(seen.mini >= 3, `${def.name}: only ${seen.mini} mini boosts`);
  }
});

test('restart puts everyone back on the grid with clean stats', () => {
  const { race } = runRace({ laps: 1, player: CARS[1], rivals: rivals(2) }, { limit: 20 });
  assert.ok(race.raceT > 15 && race.cars.some((c) => c.stats.drifts > 0), 'the cars never raced');
  race.restart();
  assert.equal(race.state, 'grid');
  assert.equal(race.raceT, 0);
  for (const c of race.cars) {
    assert.equal(c.laps.length, 0); assert.equal(c.finished, false);
    assert.ok(Math.abs(c.prog - (c.S.s - T.L)) < 1e-9);
    assert.ok(Math.hypot(c.S.vx, c.S.vz) === 0 && c.S.w === 0, `${c.name} is still moving`);
    assert.ok(Object.values(c.stats).every((v) => v === 0), `${c.name}: stats survived the restart`);
    assert.equal(c.rank, c.grid + 1);
  }
});

test('练习 (no rivals): one car on the grid, first of one', () => {
  const { race } = runRace({ laps: 1, player: CARS[0], rivals: [] }, { limit: 25 });
  assert.equal(race.cars.length, 1);
  assert.equal(race.player.rank, 1);
  assert.ok(race.raceT > 20 && !race.wrongWay());
});

test('item mode: boxes are picked up, items are used, cars get hit, and nobody gets mini boosts', () => {
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const { race, seen } = runRace({ laps: 1, mode: 'item', player: CARS[1], rivals: rivals(5, 0.96) }, {
    onStep: (r, press) => { const P = r.player; if (P.items[P.slot] && rnd() < 0.03) press.add('nitro'); },      // the test driver uses whatever it holds, now and then
  });
  assert.equal(race.mode, 'item');
  assert.equal(race.items.on, true);
  assert.ok(race.cars.every((c) => c.S.itemMode));
  assert.ok(race.player.finished, 'the player did not finish');
  assert.ok(seen.itemGet >= 10 && seen.itemUse >= 8, `items: ${JSON.stringify(seen)}`);
  for (const k of ['itemGet', 'itemUse', 'spinOut']) assert.ok(seen[k] > 0, `nothing of type ${k} happened`);
  assert.equal(race.player.stats.mini, 0);
  for (const c of race.cars) assert.equal(c.stats.mini + c.stats.dbl + c.stats.wcw, 0, `${c.name} boosted in item mode`);
  const hits = race.cars.reduce((n, c) => n + c.stats.itemHits, 0), spun = race.cars.reduce((n, c) => n + c.stats.spun, 0), used = race.cars.reduce((n, c) => n + c.stats.items, 0);
  assert.ok(spun >= 1 && hits >= 1, `itemHits ${hits}, spun ${spun}`);
  assert.equal(used, seen.itemUse, 'stats.items should count every item used');
  assert.equal(hits, (seen.missileHit || 0) + (seen.bombHit || 0) + (seen.bananaHit || 0), 'stats.itemHits should count every landing');
});

const ahead = (race) => race.cars.find((c) => !c.isPlayer);                                             // the rival right in front of the player
const place = (c, i) => { c.S.x = T.x[i]; c.S.z = T.z[i]; c.S.psi = T.th[i]; c.S.i = i; c.S.e = 0; c.S.vx = c.S.vz = 0; c.prog = i * T.ds; };
function itemRace() {
  const race = createRace(T, RL, { laps: 1, mode: 'item', player: CARS[1], rivals: rivals(4, 0.96) });
  place(race.player, 300);
  race.cars.filter((c) => !c.isPlayer).forEach((c, k) => place(c, 330 + 7 * k));                           // the player, then the others strung out ahead
  return { race, it: race.items, P: race.player };
}

test('each item does what it says', () => {
  const { race, it, P } = itemRace(), Q = ahead(race);
  assert.deepEqual(Object.keys(ITEMS).sort(), ['angel', 'banana', 'bomb', 'magnet', 'missile', 'nitro']);
  const use = (name) => { P.items[P.slot] = name; const ev = []; it.use(P, race, ev); return types(ev); };
  assert.deepEqual(use('banana'), ['itemUse']); assert.equal(it.bananas.length, 1); assert.equal(it.bananas[0].owner, P);
  assert.deepEqual(use('bomb'), ['itemUse']); assert.equal(it.bombs.length, 1);
  assert.deepEqual(use('missile'), ['itemUse']); assert.equal(it.missiles.length, 1); assert.equal(it.missiles[0].target, Q);
  assert.deepEqual(use('magnet'), ['itemUse', 'magnetOn']); assert.ok(P.S.magnetT > 5);
  assert.deepEqual(use('angel'), ['itemUse', 'shieldOn']); assert.ok(P.S.shieldT > 5.9);
  assert.deepEqual(use('nitro'), ['itemUse', 'itemNitro']); assert.ok(P.S.nitroT > 0);
  assert.equal(it.use(P, race, []), false, 'using an empty hand should do nothing');
  P.items[0] = 'banana'; P.items[1] = 'angel';
  assert.equal(it.swap(P), 1); assert.equal(it.swap(P), 0);
});

test('a missile flies along the road to the car ahead and spins it; an angel blocks it', () => {
  for (const shield of [false, true]) {
    const { race, it, P } = itemRace(), Q = ahead(race), ev = [];
    if (shield) Q.S.shieldT = 6;
    P.items[P.slot] = 'missile'; it.use(P, race, ev);
    for (let n = 0; n < 120 * 6 && it.missiles.length; n++) it.update(DT, race, ev);
    assert.equal(it.missiles.length, 0, 'the missile never arrived');
    const kinds = types(ev);
    if (shield) { assert.ok(kinds.includes('blocked') && !kinds.includes('spinOut'), kinds.join(',')); assert.equal(Q.S.spinT, 0); }
    else { assert.ok(kinds.includes('missileHit') && kinds.includes('spinOut'), kinds.join(',')); assert.ok(Math.abs(Q.S.spinT - SPIN.missile) < 0.05, `spinT ${Q.S.spinT}`); }
  }
});

test('a missile with nobody ahead runs out of road and misses', () => {
  const { race, it, P } = itemRace(), ev = [];
  for (const c of race.cars) if (c !== P) { place(c, 1000); c.prog = -1e6; }                                     // everyone else is behind
  P.items[P.slot] = 'missile'; it.use(P, race, ev);
  for (let n = 0; n < 120 * 9 && it.missiles.length; n++) it.update(DT, race, ev);
  assert.equal(it.missiles.length, 0);
  assert.ok(types(ev).includes('missileMiss'), types(ev).join(','));
});

test('a banana peel spins the next car that drives over it, but not the one that dropped it straight away', () => {
  const { race, it, P } = itemRace(), Q = race.cars[1], ev = [];
  P.items[P.slot] = 'banana'; it.use(P, race, []);
  const b = it.bananas[0];
  assert.ok(Math.hypot(b.x - P.S.x, b.z - P.S.z) > 2, 'the peel should land behind the car');
  place(P, 300); Object.assign(P.S, { x: b.x, z: b.z });                                                     // the owner backs over it at once: nothing
  it.update(DT, race, ev);
  assert.equal(ev.length, 0, types(ev).join(','));
  assert.equal(it.bananas.length, 1);
  b.age = 2; Object.assign(Q.S, { x: b.x, z: b.z });                                                          // another car, a moment later
  for (let n = 0; n < 60 && Q.S.spinT <= 0; n++) it.update(DT, race, ev);
  const kinds = types(ev);
  assert.ok(kinds.includes('spinOut') && kinds.includes('bananaHit'), kinds.join(','));
  assert.equal(ev.find((e) => e.type === 'bananaHit').by, P, 'the peel should remember who dropped it');
  assert.ok(Math.abs(Q.S.spinT - SPIN.banana) < 0.05);
  assert.equal(it.bananas.length, 0, 'the peel should be used up');
});

test('a water bomb flies forward, splashes down and spins everyone nearby', () => {
  const { race, it, P } = itemRace(), ev = [];
  P.items[P.slot] = 'bomb'; it.use(P, race, ev);
  const b = it.bombs[0], lx = b.x + b.vx * b.t, lz = b.z + b.vz * b.t;                                         // where it comes down
  const [A, B, C] = race.cars.slice(1, 4);
  Object.assign(A.S, { x: lx + 3, z: lz + 2 }); Object.assign(B.S, { x: lx - 5, z: lz }); Object.assign(C.S, { x: lx + 20, z: lz });
  for (let n = 0; n < 120 * 3 && it.bombs.length; n++) it.update(DT, race, ev);
  const kinds = types(ev);
  assert.ok(kinds.includes('splash'), kinds.join(','));
  assert.equal(kinds.filter((k) => k === 'bombHit').length, 2, kinds.join(','));
  assert.ok(Math.abs(A.S.spinT - SPIN.bomb) < 0.05 && Math.abs(B.S.spinT - SPIN.bomb) < 0.05);
  assert.equal(C.S.spinT, 0, 'a car 20 m away was hit');
});

test('item boxes lie on the road, in rows far enough apart to matter', () => {
  const { it } = itemRace();
  assert.ok(it.boxes.length >= 20, `${it.boxes.length} boxes`);
  for (const b of it.boxes) {
    const n = b.i;
    assert.ok(Math.abs(b.lat) <= T.hw[n] - 1.5, `box at ${b.lat.toFixed(1)} m (half width ${T.hw[n].toFixed(1)})`);
    assert.ok(Math.abs(Math.hypot(b.x - T.x[n], b.z - T.z[n]) - Math.abs(b.lat)) < 0.05);
  }
  const rows = [...new Set(it.boxes.map((b) => b.i))].sort((a, b) => a - b), ds = T.ds;
  for (let k = 1; k < rows.length; k++) assert.ok((rows[k] - rows[k - 1]) * ds >= 180, `rows ${rows[k - 1]} and ${rows[k]} are too close`);
});
