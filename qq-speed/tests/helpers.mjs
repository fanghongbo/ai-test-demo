// Shared fixtures for the Node test suite: the track, the racing line, and small helpers for driving a car step by step.
import { createTrack, pointAt } from '../src/core/trackdef.js';
import { buildRacingLine } from '../src/game/raceline.js';
import { createCarState, stepCar } from '../src/core/carphys.js';

export const T = createTrack();
export const RL = buildRacingLine(T);
export const DT = 1 / 120;

/** A fake "track" for the technique tests: a dead-straight strip 400 m wide, so nothing is ever near a wall.
 *  It only has the fields the physics reads: samples along +X, heading 0, half width 200. */
export const LOT = (() => {
  const N = 4000, ds = 1.5, x = new Float64Array(N), z = new Float64Array(N), th = new Float64Array(N), hw = new Float64Array(N).fill(200);
  for (let i = 0; i < N; i++) x[i] = i * ds;
  return { N, ds, L: N * ds, x, z, th, hw };
})();

/** A key state: everything released unless given */
export const key = (o = {}) => ({ up: false, down: false, left: false, right: false, drift: false, nitro: false, ...o });

/** [first sample, number of samples] of the longest stretch that is nearly straight */
export function longestStraight(kMax = 1 / 350) {
  let best = [0, 0], cur = null;
  for (let i = 0; i <= T.N; i++) {
    const j = i % T.N;
    if (Math.abs(T.kap[j]) < kMax) { if (!cur) cur = [j, 0]; cur[1]++; } else if (cur) { if (cur[1] > best[1]) best = cur; cur = null; }
  }
  return best;
}

/** A car at sample i, offset lat metres from the centre line, already moving along the track at `speed` m/s */
export function carAt(def, i, speed = 0, lat = 0) {
  const p = pointAt(T, i, lat), S = createCarState(def, p[0], p[1], T.th[i], T);
  S.vx = Math.cos(S.psi) * speed; S.vz = Math.sin(S.psi) * speed;
  return S;
}

/** A car on the open lot, at the start line of the strip, heading +X at `speed` m/s */
export function carOnLot(def, speed = 0) {
  const S = createCarState(def, 0, 0, 0, LOT);
  S.vx = speed;
  return S;
}

/** Advance S by `secs` seconds. inp: a key state, or (step) => key state. Whatever happens is collected in ev. */
export function drive(S, secs, inp, ev = [], track = T) {
  for (let k = 0, n = Math.round(secs / DT); k < n; k++) stepCar(S, typeof inp === 'function' ? inp(k) : inp, track, DT, ev);
  return ev;
}

export const kmh = (S) => Math.hypot(S.vx, S.vz) * 3.6;
export const finite = (S) => ['x', 'z', 'psi', 'vx', 'vz', 'w', 'vF', 'vL', 'slip', 'e', 's'].every((k) => Number.isFinite(S[k]));
