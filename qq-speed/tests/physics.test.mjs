// The car physics: acceleration, braking, every drift technique of QQ飞车, walls, and robustness against garbage input.
// Techniques are tried on an open lot (no walls) so they only depend on the physics, not on where the track bends.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CAR_A, CAR_R, createCarState, locateCar, resetCar, stepCar } from '../src/core/carphys.js';
import { CARS } from '../src/core/cardef.js';
import { nearest, pointAt, WALL } from '../src/core/trackdef.js';
import { DT, LOT, T, carAt, carOnLot, drive, finite, key, kmh, longestStraight } from './helpers.mjs';

const LEIDIAN = CARS[1], [S0, SL] = longestStraight();
const HARD = (def) => (def.vmax + def.nitroPlus + def.miniPlus) / 3.6 * 1.04;
const types = (ev) => ev.map((e) => e.type);
const onLot = (S, secs, inp, ev = []) => drive(S, secs, inp, ev, LOT);

test('full throttle accelerates, coasting slows down, the brake stops and reverses the car', () => {
  const S = carOnLot(LEIDIAN);
  onLot(S, 3, key({ up: true }));
  assert.ok(kmh(S) > 95 && kmh(S) < 135, `after 3 s: ${kmh(S).toFixed(0)} km/h`);
  const v = kmh(S);
  onLot(S, 1.5, key());
  assert.ok(kmh(S) < v - 12, `coasting did not slow the car (${v.toFixed(0)} -> ${kmh(S).toFixed(0)})`);
  onLot(S, 6, key({ down: true }));
  assert.ok(S.vF <= 0 && S.vF > -9.5, `reversing at ${S.vF.toFixed(2)} m/s`);
});

test('every car: plain top speed is reached but not exceeded', () => {
  for (const def of CARS) {
    const S = carOnLot(def, def.vmax / 3.6 + 4);
    onLot(S, 2, key({ up: true }));
    assert.ok(kmh(S) <= def.vmax + 0.5 && kmh(S) > def.vmax - 1, `${def.name}: settled at ${kmh(S).toFixed(1)} km/h (rated ${def.vmax})`);
  }
});

test('the car can never exceed top speed + nitro + mini boost', () => {
  for (const def of CARS) {
    const S = carOnLot(def, (def.vmax + 30) / 3.6);
    S.nitro = 2; S.nitroT = 9; S.miniT = 9;                                   // everything firing at once, well beyond its legal duration
    let peak = 0;
    for (let k = 0; k < 240; k++) { stepCar(S, key({ up: true, nitro: true }), LOT, DT, []); peak = Math.max(peak, Math.hypot(S.vx, S.vz)); }
    assert.ok(peak <= HARD(def) + 0.01, `${def.name}: ${((peak - HARD(def)) * 3.6).toFixed(1)} km/h over the cap`);
  }
});

test('drift: hold Shift + direction, release, press up again = 小喷', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  onLot(S, 0.9, key({ up: true, right: true, drift: true }), ev);
  assert.ok(S.drifting, 'the car is not drifting');
  assert.ok(Math.abs(S.slip) > 0.12, `drift angle is only ${S.slip.toFixed(2)}`);
  assert.ok(S.gas > 0.1, 'drifting did not collect gas');
  assert.ok(types(ev).includes('drift'));
  onLot(S, DT * 2, key(), ev);                                                // release everything
  assert.ok(types(ev).includes('driftEnd'));
  onLot(S, DT * 3, key({ up: true }), ev);                                    // press up again at once
  assert.ok(types(ev).includes('mini'), `no mini boost; events ${types(ev).join(',')}`);
  assert.ok(S.miniT > 0);
});

test('a drift that is too short gives no mini boost', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  onLot(S, 0.08, key({ up: true, right: true, drift: true }), ev);
  onLot(S, DT * 2, key(), ev);
  onLot(S, DT * 3, key({ up: true }), ev);
  assert.ok(!types(ev).includes('mini'), 'a tap of Shift gave a mini boost');
});

test('小喷 followed by nitro = 双喷; a short drift then nitro = 断位双喷', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  S.nitro = 1;
  onLot(S, 0.9, key({ up: true, right: true, drift: true }), ev);
  onLot(S, DT * 2, key(), ev);
  onLot(S, DT * 3, key({ up: true }), ev);
  assert.ok(types(ev).includes('mini'));
  onLot(S, DT * 2, key({ up: true, nitro: true }), ev);
  assert.equal(S.nitro, 0, 'the bottle was not used');
  assert.ok(types(ev).includes('double'), `events ${types(ev).join(',')}`);

  const T2 = carOnLot(LEIDIAN, 25), ev2 = [];
  T2.nitro = 1;
  onLot(T2, 0.5, key({ up: true, right: true, drift: true }), ev2);             // a deliberately short drift
  onLot(T2, DT * 2, key(), ev2);
  onLot(T2, DT * 3, key({ up: true }), ev2);
  onLot(T2, DT * 2, key({ up: true, nitro: true }), ev2);
  assert.ok(types(ev2).includes('mini') && types(ev2).includes('cutDouble'), `events ${types(ev2).join(',')}`);
});

test('断位双喷 stays possible at racing speed: a drift of 0.5 s still earns its mini boost', () => {
  for (const def of CARS) for (const v of [20, 30, 45]) {
    const S = carOnLot(def, v), ev = [];
    onLot(S, 0.5, key({ up: true, right: true, drift: true }), ev);
    onLot(S, DT * 2, key(), ev);
    onLot(S, DT * 3, key({ up: true }), ev);
    const end = ev.find((e) => e.type === 'driftEnd');
    assert.ok(end && end.ok && end.cut, `${def.name} at ${v} m/s: charge after 0.5 s is ${S.charge.toFixed(3)}`);
  }
});

test('nitro first, then a drift ending in a mini boost = WCW', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  S.nitro = 1;
  onLot(S, 0.25, key({ up: true, nitro: true }), ev);
  assert.ok(types(ev).includes('nitro'));
  onLot(S, 0.8, key({ up: true, right: true, drift: true }), ev);
  onLot(S, DT * 2, key(), ev);
  onLot(S, DT * 3, key({ up: true }), ev);
  assert.ok(types(ev).includes('wcw'), `events ${types(ev).join(',')}`);
  assert.ok(S.nitroT > 0.2);
});

test('Shift held before the direction = 甩尾; the opposite direction during a drift = 侧身', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  onLot(S, 0.15, key({ up: true, drift: true }), ev);
  assert.ok(!S.drifting, 'a drift started without a direction');
  onLot(S, 0.3, key({ up: true, right: true, drift: true }), ev);
  assert.ok(types(ev).includes('swing'), `events ${types(ev).join(',')}`);
  onLot(S, 0.5, key({ up: true, left: true, drift: true }), ev);
  assert.ok(S.sideT > 0.25, `side time ${S.sideT.toFixed(2)}`);
  const end = onLot(S, DT * 2, key(), ev).find((e) => e.type === 'driftEnd');
  assert.ok(end && end.side, 'the drift was not counted as a 侧身');
});

test('a long drift fills the gas gauge into a bottle, two at most', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  let first = -1;
  for (let k = 0; k < 120 * 14; k++) {
    stepCar(S, key({ up: true, right: true, drift: true }), LOT, DT, ev);
    if (S.nitro === 1 && first < 0) first = k * DT;
  }
  assert.ok(first > 0 && first < 6, `first bottle after ${first.toFixed(1)} s`);
  assert.equal(S.nitro, 2, 'should carry exactly two bottles in the end');
  assert.equal(S.gas, 1, 'the gauge stays full when both bottles are taken');
  assert.ok(types(ev).filter((t) => t === 'gasFull').length === 2);
});

test('a nitro bottle raises the speed above the plain top speed', () => {
  const S = carOnLot(LEIDIAN, LEIDIAN.vmax / 3.6), ev = [];
  S.nitro = 1;
  onLot(S, 1.2, key({ up: true, nitro: true }), ev);
  assert.ok(kmh(S) > LEIDIAN.vmax + 8, `${kmh(S).toFixed(0)} km/h with nitro`);
  assert.ok(types(ev).includes('nitro'));
});

test('a drift turns far tighter than grip driving', () => {
  const grip = carOnLot(LEIDIAN, 25), drift = carOnLot(LEIDIAN, 25);
  onLot(grip, 1.0, key({ up: true, right: true }));
  onLot(drift, 1.0, key({ up: true, right: true, drift: true }));
  assert.ok(Math.abs(drift.psi) > Math.abs(grip.psi) * 1.8, `after 1 s: grip ${Math.abs(grip.psi).toFixed(2)} rad, drift ${Math.abs(drift.psi).toFixed(2)} rad`);
});

test('walls: the car never leaves the road, however hard it is pushed', () => {
  const S = carAt(LEIDIAN, S0, 42), ev = [];
  let worst = 0;
  for (let k = 0; k < 120 * 8; k++) {
    stepCar(S, key({ up: true, right: true, drift: k % 50 < 25, left: k % 50 >= 25 }), T, DT, ev);
    const c = Math.cos(S.psi), sn = Math.sin(S.psi);
    for (const a of [CAR_A, -CAR_A]) {
      const n = nearest(T, S.x + c * a, S.z + sn * a, S.i);
      worst = Math.max(worst, Math.abs(n.e) - (T.hw[n.i] + WALL - CAR_R));
    }
    assert.ok(finite(S), `state went non-finite at step ${k}`);
  }
  assert.ok(worst < 0.12, `a collision circle went ${worst.toFixed(2)} m into the wall`);
  assert.ok(ev.some((e) => e.type === 'hit'), 'eight seconds of wall-grinding and not one impact');
});

test('R puts the car back on the road, facing the right way, standing still', () => {
  const S = carAt(LEIDIAN, S0, 40), ev = [];
  drive(S, 6, key({ up: true, right: true, drift: true }), ev);
  assert.ok(ev.some((e) => e.type === 'hit'), 'the car never reached a wall');
  resetCar(S, T);
  locateCar(S, T);
  assert.equal(S.psi, T.th[S.i]);
  assert.ok(Math.abs(S.e) <= T.hw[S.i] + WALL - 2.4 + 1e-6, `offset ${S.e.toFixed(2)} m`);
  assert.ok(Math.hypot(S.vx, S.vz) === 0 && S.w === 0, 'still moving after the reset');
  assert.ok(!S.drifting && S.miniT === 0 && S.nitroT === 0 && S.spinT === 0);
});

test('mashing random keys for half a minute never breaks the numbers or the speed limit', () => {
  let seed = 12345;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (const def of CARS) {
    const i0 = (S0 + 300) % T.N, p = pointAt(T, i0, 0), S = createCarState(def, p[0], p[1], T.th[i0], T), ev = [];
    let cur = key({ up: true });
    for (let k = 0; k < 120 * 30; k++) {
      if (k % 37 === 0) cur = key({ up: rnd() < 0.7, down: rnd() < 0.2, left: rnd() < 0.4, right: rnd() < 0.4, drift: rnd() < 0.5, nitro: rnd() < 0.3 });
      stepCar(S, cur, T, DT, ev);
      assert.ok(finite(S), `${def.name}: non-finite state at step ${k}`);
      assert.ok(Math.hypot(S.vx, S.vz) <= HARD(def) + 0.01, `${def.name}: over the cap at step ${k}`);
      assert.ok(Math.abs(S.w) <= 4.6, `${def.name}: yaw rate ${S.w.toFixed(2)}`);
      assert.ok(S.nitro >= 0 && S.nitro <= 2);
    }
  }
});

test('item mode: drifting gives no mini boost and no gas, and a spin ignores the keys', () => {
  const S = carOnLot(LEIDIAN, 25), ev = [];
  S.itemMode = true; S.nitro = 1;
  onLot(S, 0.9, key({ up: true, right: true, drift: true }), ev);
  onLot(S, DT * 2, key(), ev);
  onLot(S, DT * 3, key({ up: true, nitro: true }), ev);
  assert.ok(!types(ev).includes('mini') && !types(ev).includes('nitro'), `events ${types(ev).join(',')}`);
  assert.equal(S.nitro, 1);
  assert.equal(S.gas, 0);
  const v0 = Math.hypot(S.vx, S.vz);
  S.spinT = 1; S.spinRate = Math.PI * 4;
  onLot(S, 0.5, key({ up: true, drift: true, right: true, nitro: true }), ev);
  assert.ok(Math.hypot(S.vx, S.vz) < v0, 'a spinning car sped up');
  assert.ok(S.spinT > 0 && S.spinT < 0.6);
});
