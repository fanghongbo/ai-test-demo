// The track itself and the racing line: shape, scale, and the queries the physics relies on.
import test from 'node:test';
import assert from 'node:assert/strict';
import { WALL, ZONE_CN, nearest, pointAt } from '../src/core/trackdef.js';
import { distToLand } from '../src/world/landdef.js';
import { T, RL } from './helpers.mjs';

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

test('the lap is a closed loop of evenly spaced samples', () => {
  assert.ok(T.N > 800, `only ${T.N} samples`);
  assert.ok(T.L > 1600 && T.L < 1900, `lap length ${T.L.toFixed(1)} m`);
  let maxGap = 0;
  for (let i = 0; i < T.N; i++) maxGap = Math.max(maxGap, Math.hypot(T.x[(i + 1) % T.N] - T.x[i], T.z[(i + 1) % T.N] - T.z[i]));
  assert.ok(maxGap < T.ds * 1.6, `sample gap up to ${maxGap.toFixed(2)} m (ds ${T.ds.toFixed(2)})`);
});

test('the road never kinks: the amount of turning changes gradually from one sample to the next', () => {
  let maxJump = 0, at = 0, maxTurn = 0;
  for (let i = 0; i < T.N; i++) {
    const d0 = wrap(T.th[i] - T.th[(i + T.N - 1) % T.N]), d1 = wrap(T.th[(i + 1) % T.N] - T.th[i]);
    maxTurn = Math.max(maxTurn, Math.abs(d1));
    if (Math.abs(wrap(d1 - d0)) > maxJump) { maxJump = Math.abs(wrap(d1 - d0)); at = i; }
  }
  assert.ok(maxJump < 0.16, `the turn rate jumps by ${maxJump.toFixed(3)} rad at sample ${at}`);        // 0.15 is the S-bend where a tight left turns straight into a tight right
  assert.ok(maxTurn < 0.2, `sharpest turn ${maxTurn.toFixed(3)} rad per sample (radius ${(T.ds / maxTurn).toFixed(1)} m)`);
});

test('nearest() finds the stretch of road a point was taken from', () => {
  for (let i = 0; i < T.N; i += 7) for (const lat of [0, T.hw[i] * 0.7, -T.hw[i] * 0.7]) {
    const p = pointAt(T, i, lat), n = nearest(T, p[0], p[1], -1);
    const ds = Math.abs(n.s - i * T.ds), wrapAround = Math.min(ds, T.L - ds);
    assert.ok(wrapAround < 2 * T.ds + 0.01, `sample ${i}: nearest() answered sample ${n.i} (${wrapAround.toFixed(1)} m away)`);
    assert.ok(Math.abs(Math.abs(n.e) - Math.abs(lat)) < 0.3, `sample ${i}: lateral offset ${n.e.toFixed(2)} for lat ${lat.toFixed(2)}`);
  }
});

test('the drivable width is sane all the way round and the wall is where the physics expects it', () => {
  assert.equal(WALL, 2.2);
  let min = Infinity, max = 0;
  for (let i = 0; i < T.N; i++) { min = Math.min(min, T.hw[i]); max = Math.max(max, T.hw[i]); assert.ok(T.hw[i] > 5 && T.hw[i] < 9.5); }
  assert.ok(min > 5.5 && max < 9, `half width ${min.toFixed(1)}..${max.toFixed(1)} m`);
});

test('every sample knows its zone, and every zone has a Chinese name', () => {
  const seen = new Set();
  for (let i = 0; i < T.N; i++) { const z = T.zoneNames[T.zone[i]]; assert.ok(z, `sample ${i} has no zone`); seen.add(z); }
  for (const z of seen) assert.ok(ZONE_CN[z], `zone ${z} has no display name`);
  assert.ok(seen.size >= 15, `only ${seen.size} zones`);
});

test('the sea bridge is over water and the rest of the lap is over land', () => {
  let over = 0;
  for (let i = 0; i < T.N; i++) if (distToLand(T.x[i], T.z[i]) > 1.5) over++;
  assert.ok(over > 20, 'the sea bridge is missing');
  assert.ok(over < T.N * 0.35, 'more than a third of the lap is over water');
  assert.ok(distToLand(T.x[0], T.z[0]) > 1.5, 'the race should start on the bridge');
});

test('the racing line stays on the road and its speed profile is finite and positive', () => {
  for (let i = 0; i < T.N; i++) {
    assert.ok(Math.abs(RL.lat[i]) <= T.hw[i] + 0.5, `sample ${i}: line is ${RL.lat[i].toFixed(1)} m off centre (half width ${T.hw[i].toFixed(1)})`);
    assert.ok(RL.v[i] > 5 && RL.v[i] <= 56, `sample ${i}: ${RL.v[i].toFixed(1)} m/s`);
    assert.ok(Number.isFinite(RL.k[i]) && Number.isFinite(RL.x[i]) && Number.isFinite(RL.z[i]));
  }
});
