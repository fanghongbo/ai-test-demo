// Time of day: the key frames, the factors that switch on lamps and night, and the sun's path.
import test from 'node:test';
import assert from 'node:assert/strict';
import { KEYS, TIMES, lampFactor, nightFactor, sampleHour } from '../src/core/palette.js';
import { sunVector } from '../src/core/skymodel.js';

test('sampleHour() hits every key frame exactly', () => {
  for (const k of KEYS) {
    const p = sampleHour(k.h);
    for (const f of ['sunEl', 'sunAz', 'turbidity', 'cloud', 'fog', 'exposure']) assert.ok(Math.abs(p[f] - k.p[f]) < 1e-6, `${f} at ${k.h}h: ${p[f]} vs ${k.p[f]}`);
  }
  const wrap = sampleHour(30), at6 = sampleHour(6);
  assert.ok(Math.abs(wrap.sunEl - at6.sunEl) < 1e-6, 'hours should wrap around midnight');
});

test('sampleHour() is continuous across key frames', () => {
  for (const k of KEYS.slice(0, -1)) {
    for (const f of ['sunEl', 'sunAz', 'exposure']) {
      const a = sampleHour(k.h - 1e-4)[f], b = sampleHour(k.h + 1e-4)[f];
      assert.ok(Math.abs(a - b) < 2e-3 * Math.max(1, Math.abs(b)), `${f} jumps at ${k.h}h: ${a} -> ${b}`);
    }
  }
});

test('night and lamps switch around sunset', () => {
  assert.equal(nightFactor(10), 0); assert.equal(nightFactor(-10), 1);
  assert.ok(nightFactor(-4) > 0.4 && nightFactor(-4) < 0.6, `nightFactor(-4) = ${nightFactor(-4)}`);
  assert.equal(lampFactor(6), 0); assert.equal(lampFactor(-6), 1);
  assert.ok(lampFactor(0) > 0.4 && lampFactor(0) < 0.6, `lampFactor(0) = ${lampFactor(0)}`);
  assert.ok(lampFactor(2) > nightFactor(2), 'lamps come on before it is fully night');
  assert.ok(sampleHour(22).exposure > sampleHour(15.5).exposure * 4, 'night should be exposed much higher than the afternoon');
  assert.ok(sampleHour(13.6).sunEl > sampleHour(9.5).sunEl && sampleHour(9.5).sunEl > sampleHour(18.25).sunEl, 'the sun should climb to noon and sink after');
});

test("the lobby's times of day are distinct and ordered from morning to night", () => {
  assert.deepEqual(TIMES.map((t) => t.id), ['morning', 'day', 'afternoon', 'dusk', 'night']);
  for (let k = 1; k < TIMES.length; k++) assert.ok(TIMES[k].hour > TIMES[k - 1].hour);
  for (const t of TIMES) assert.ok(t.name && Number.isFinite(t.hour));
});

test('sunVector(): azimuth 0 points to +Z, 90 to +X, and the vector is a unit length', () => {
  const a = sunVector(0, 30), b = sunVector(90, 30), c = sunVector(180, 0);
  assert.ok(a[2] > 0.85 && Math.abs(a[0]) < 1e-6 && Math.abs(a[1] - 0.5) < 1e-6, `${a}`);
  assert.ok(b[0] > 0.85 && Math.abs(b[2]) < 1e-6, `${b}`);
  assert.ok(c[2] < -0.999 && Math.abs(c[1]) < 1e-6, `${c}`);
  for (const az of [0, 37, 200, 335]) for (const el of [-34, 0, 40, 74]) assert.ok(Math.abs(Math.hypot(...sunVector(az, el)) - 1) < 1e-9);
});
