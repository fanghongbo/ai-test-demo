// 基础数学：随机数、二维噪声、样条、平滑和回绕
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, noise2, fbm2, spline, smoothstep, wrap, clamp, damp, TAU } from '../src/core/mathx.js';

test('同一个种子的随机数列完全一样，都落在 0..1', () => {
  const a = mulberry32(1234), b = mulberry32(1234), c = mulberry32(1235);
  let same = true, differ = false, sum = 0;
  const N = 20000, r = mulberry32(99);
  for (let i = 0; i < 2000; i++) {
    const x = a(), y = b(), z = c();
    if (x !== y) same = false;
    if (x !== z) differ = true;
    assert.ok(x >= 0 && x < 1, `随机数超出 0..1：${x}`);
  }
  for (let i = 0; i < N; i++) sum += r();
  assert.ok(same, '同一种子应该给出同一列随机数');
  assert.ok(differ, '不同种子应该给出不同的随机数列');
  assert.ok(Math.abs(sum / N - 0.5) < 0.01, `平均值 ${sum / N}`);
});

test('二维噪声有界、可重复、连续', () => {
  for (const [f, at] of [[noise2, (x, y, seed) => noise2(x, y, seed)], [fbm2, (x, y, seed) => fbm2(x, y, 3, seed)]]) {
    for (let i = 0; i < 800; i++) {
      const x = (i % 29) * 3.1 - 40, y = ((i * 7) % 31) * 2.3 - 30, v = at(x, y, 11);
      assert.ok(v >= -1 && v <= 1, `${f.name} 超出 -1..1：${v}`);
      assert.equal(v, at(x, y, 11), '噪声应该可以重复');
    }
    let lo = 1e9, hi = -1e9;
    for (let i = 0; i < 4000; i++) { const v = at(i * 0.137 % 50 - 25, i * 0.311 % 50 - 25, 5); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    assert.ok(hi - lo > 0.5, `${f.name} 有起伏：${lo.toFixed(2)}..${hi.toFixed(2)}`);
    assert.notEqual(at(1.5, 2.5, 5), at(1.5, 2.5, 6), '种子不同，噪声也不同');
  }
  let maxJump = 0;
  for (let i = 0; i < 500; i++) { const x = i * 0.71, y = i * 0.13; maxJump = Math.max(maxJump, Math.abs(fbm2(x, y, 3, 9) - fbm2(x + 0.01, y, 3, 9))); }
  assert.ok(maxJump < 0.3, `fbm2 在 1 厘米内最多跳 ${maxJump.toFixed(4)}：不连续`);
});

test('平滑台阶夹在 0..1，两端是 0 和 1，中间是 0.5', () => {
  assert.equal(smoothstep(2, 6, -5), 0);
  assert.equal(smoothstep(2, 6, 9), 1);
  assert.ok(Math.abs(smoothstep(2, 6, 4) - 0.5) < 1e-12);
  let prev = -1;
  for (let i = 0; i <= 100; i++) { const v = smoothstep(0, 1, i / 100); assert.ok(v >= prev - 1e-12 && v >= 0 && v <= 1); prev = v; }
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-5, 0, 3), 0);
});

test('回绕和指数趋近', () => {
  assert.equal(wrap(-1, 10), 9);
  assert.equal(wrap(17, 10), 7);
  assert.ok(Math.abs(TAU - 2 * Math.PI) < 1e-15);
  let v = 0;
  for (let i = 0; i < 60; i++) v = damp(v, 1, 4, 1 / 60);
  assert.ok(v > 0.95 && v < 1, `阻尼 ${v}`);
  assert.ok(Math.abs(damp(0, 1, 4, 1 / 30) - (1 - Math.exp(-4 / 30))) < 1e-12);
});

test('样条穿过每一个结点，结点之间不跑太远', () => {
  const xs = [0, 1, 2.5, 4, 7], ys = [0, 2, -1, 3, 1];
  for (let i = 0; i < xs.length; i++) assert.ok(Math.abs(spline(xs, ys, xs[i]) - ys[i]) < 1e-9, `结点 ${i} 没穿过`);
  for (let x = xs[0]; x <= xs[xs.length - 1]; x += 0.05) { const y = spline(xs, ys, x); assert.ok(Number.isFinite(y) && y > Math.min(...ys) - 2 && y < Math.max(...ys) + 2, `x=${x} → ${y}`); }
  assert.equal(spline(xs, ys, -3), 0);
  assert.equal(spline(xs, ys, 9), 1);
});
