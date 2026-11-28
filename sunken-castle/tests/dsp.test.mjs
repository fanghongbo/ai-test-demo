// 声音里纯计算的部分：循环起来无缝的粉红 / 布朗噪声、混响的脉冲响应。不出声
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noise, pinkNoise, brownNoise, impulse } from '../src/core/dsp.js';

const SR = 48000;
const rms = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
const finite = (x) => { for (let i = 0; i < x.length; i++) if (!Number.isFinite(x[i])) return false; return true; };
/** 一圈正好 N 个采样的信号在频率 f 上的振幅（f 落在整格上）：取附近 16 格的平均，压一压白噪声的起伏 */
const amp = (x, f) => {
  const N = x.length, k0 = Math.round((f * N) / SR);
  let s = 0;
  for (let k = k0 - 8; k < k0 + 8; k++) {
    let re = 0, im = 0;
    for (let i = 0; i < N; i += 4) { const a = (2 * Math.PI * k * i) / N; re += x[i] * Math.cos(a); im -= x[i] * Math.sin(a); }
    s += Math.hypot(re, im) / (N / 4);
  }
  return s / 16;
};
/** 振幅每个倍频程掉几个分贝 */
const tilt = (x) => (-20 * Math.log10(amp(x, 3200) / amp(x, 50))) / Math.log2(3200 / 50);

test('噪声：同一种子是同一串，长度对，都在 −1..1 之间，平均值接近 0', () => {
  const a = noise(20000, 3), b = noise(20000, 3), c = noise(20000, 4);
  assert.equal(a.length, 20000);
  assert.deepEqual([...a.slice(0, 1000)], [...b.slice(0, 1000)]);
  assert.notDeepEqual([...a.slice(0, 100)], [...c.slice(0, 100)]);
  let m = 0, lo = 0, hi = 0;
  for (const v of a) { assert.ok(v >= -1 && v <= 1); m += v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  assert.ok(Math.abs(m / a.length) < 0.02, `平均值 ${m / a.length}`);
  assert.ok(lo < -0.99 && hi > 0.99);
  assert.ok(rms(a) > 0.56 && rms(a) < 0.59, `均匀分布的白噪声，有效值 0.577：${rms(a).toFixed(3)}`);
  assert.equal(noise(0, 1).length, 0);
});

test('粉红噪声和布朗噪声：粉红每个倍频程低 3 分贝，布朗低 6 分贝；电平正常，没有坏数', (t) => {
  const n = SR * 4, pink = pinkNoise(n, 12), brown = brownNoise(n, 12), white = noise(n, 12);
  assert.equal(pink.length, n);
  assert.equal(brown.length, n);
  for (const [name, x] of [['粉红', pink], ['布朗', brown]]) {
    assert.ok(finite(x) && Math.abs(rms(x)) > 0.05 && Math.abs(rms(x)) < 0.5, `${name}的有效值 ${rms(x)}`);
    let peak = 0;
    for (const v of x) peak = Math.max(peak, Math.abs(v));
    assert.ok(peak > 0.5 && peak < 2, `${name}的峰值 ${peak}`);
  }
  const tp = tilt(pink), tb = tilt(brown), tw = tilt(white);
  t.diagnostic(`每个倍频程：粉红 ${tp.toFixed(1)} 分贝，布朗 ${tb.toFixed(1)} 分贝，白噪声 ${tw.toFixed(1)} 分贝`);
  assert.ok(tp > 1.9 && tp < 3.6, `粉红噪声应该每个倍频程低 3 分贝：${tp.toFixed(2)}`);
  assert.ok(tb > 4.6 && tb < 6.4 && tb > tp + 2, `布朗噪声应该每个倍频程低 6 分贝上下（拐点在 38 赫兹，50 赫兹那里还差一点）：${tb.toFixed(2)}`);
  assert.ok(Math.abs(tw) < 0.6, `白噪声是平的：${tw.toFixed(2)}`);
  assert.ok(rms(brown) < rms(pink), `布朗更低沉：${rms(brown).toFixed(3)} 对 ${rms(pink).toFixed(3)}`);
  assert.deepEqual([...pinkNoise(500, 5, 100)], [...pinkNoise(500, 5, 100)]);
  assert.equal(pinkNoise(n, 3).length, n, '不做交叉淡化的时候长度不变');
});

test('循环的噪声：首尾接得上，接缝处的那一步和别处的一步差不多大', () => {
  const n = SR * 4, F = SR / 2;
  for (const [name, make] of [['粉红', pinkNoise], ['布朗', brownNoise]]) {
    const loop = make(n, 21, F), raw = make(n + F, 21);
    let step = 0, worst = 0;
    for (let i = 1; i < n; i++) { const d = Math.abs(loop[i] - loop[i - 1]); if (i > F) step += d * d; }
    step = Math.sqrt(step / (n - F));
    for (let i = 1; i <= F; i++) worst = Math.max(worst, Math.abs(loop[i] - loop[i - 1]));
    const seam = Math.abs(loop[0] - loop[n - 1]);
    assert.ok(seam < step * 6 && worst < step * 8, `${name}：接缝那一步 ${seam.toFixed(4)}，平时一步的有效值 ${step.toFixed(4)}，淡入段里最大的一步 ${worst.toFixed(4)}`);
    assert.ok(Math.abs(loop[0] - raw[n]) < 1e-9, `${name}：循环的第一个采样接着原来末尾往下走`);
    assert.deepEqual([...loop.subarray(F, n - F)], [...raw.subarray(F, n - F)], `${name}：中间一大段原样不动`);
  }
});

test('混响的脉冲响应：两个声道、预延迟之前是静音、头 40 毫秒里有七个早期反射、尾巴一路变轻、变闷；同一种子可重复', () => {
  const ir = impulse(0.5, SR, 0.08, 7, 0.014), a = impulse(0.5, SR, 0.08, 7, 0.014), b = impulse(0.5, SR, 0.08, 8, 0.014);
  assert.equal(ir.length, 2);
  assert.equal(ir[0].length, SR / 2);
  assert.deepEqual([...ir[0]], [...a[0]]);
  assert.notDeepEqual([...ir[0].slice(0, 2000)], [...b[0].slice(0, 2000)]);
  assert.notDeepEqual([...ir[0].slice(0, 2000)], [...ir[1].slice(0, 2000)], '两个声道不一样');
  const p = Math.round(0.014 * SR);
  for (const ch of ir) {
    assert.ok(finite(ch) && Math.abs(rms(ch)) > 0.01);
    assert.ok([...ch.slice(0, p)].every((v) => v === 0), '预延迟之前是静音');
    assert.ok(rms(ch, p + Math.round(0.2 * SR), p + Math.round(0.3 * SR)) < rms(ch, p + Math.round(0.05 * SR), p + Math.round(0.1 * SR)) * 0.35, '0.2 秒之后的尾巴比 0.05 秒的时候轻得多');
    assert.ok(Math.abs(ch[ch.length - 1]) < 1e-3, '最后没有了');
  }
  // 尾巴缩到 2 毫秒：15 毫秒以后还留着声音的只能是早期反射
  for (const ch of impulse(0.1, SR, 0.002, 7, 0.014)) {
    const spikes = [];
    for (let i = p; i < ch.length; i++) if (i - p > Math.round(0.015 * SR) && Math.abs(ch[i]) > 0.05) spikes.push([((i - p) / SR) * 1000, Math.abs(ch[i])]);
    assert.ok(spikes.length >= 2 && spikes.length <= 7, `15 毫秒以后的早期反射 ${spikes.length} 个`);
    assert.ok(spikes.every(([ms, v]) => ms < 35 && v > 0.19 && v < 0.51), `早期反射的时间和强度 ${JSON.stringify(spikes.map(([ms, v]) => [ms.toFixed(1), v.toFixed(2)]))}`);
  }
  // 越到后面越闷：高频在整段声音里占的份额，开头比 1 秒钟之后大得多
  const hall = impulse(2, SR, 0.5)[0], P = Math.round(0.014 * SR), bright = (a, b) => { let hf = 0, all = 0; for (let i = a + 1; i < b; i++) { hf += (hall[i] - hall[i - 1]) ** 2; all += hall[i] ** 2; } return hf / all; };
  const early = bright(P + Math.round(0.04 * SR), P + Math.round(0.12 * SR)), late = bright(P + Math.round(1.0 * SR), P + Math.round(1.3 * SR));
  assert.ok(early > 0.05 && late < early * 0.25, `高频占比：开头 ${early.toFixed(4)}，一秒之后 ${late.toFixed(4)}`);
  const short = impulse(1.2, SR, 0.08);
  assert.ok(rms(hall, SR, Math.round(1.1 * SR)) > rms(short[0], SR, Math.round(1.1 * SR)) * 5, '时间常数大，尾巴长');
  assert.ok([...impulse(0.2, SR, 0.5, 7, 0.1)[0].slice(0, Math.round(0.1 * SR) - 1)].every((v) => v === 0), '预延迟可以改');
});
