// 大气模型（给水面上的天空、日光颜色用）和时刻关键帧
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTransmittanceLUT, lutSample, transmittance, skyRadiance, nightGlow, sunVector, luma, LUT, ATM } from '../src/core/skymodel.js';
import { KEYS, sampleHour, nightFactor, SUN_E, MIE_G } from '../src/core/palette.js';

const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''}：${a} 和 ${b} 相差超过 ${eps}`);
const lut = buildTransmittanceLUT();

test('透射率查找表：天顶方向的光程就是各自的标高，地平线方向更长', () => {
  assert.equal(lut.length, LUT.W * LUT.H * 4);
  for (const v of lut) assert.ok(Number.isFinite(v) && v >= 0);
  const z = lutSample(lut, 0, 1);
  near(z[0], ATM.HR, ATM.HR * 0.03, '天顶的瑞利光程 ≈ 瑞利标高');
  near(z[1], ATM.HM, ATM.HM * 0.03, '天顶的米氏光程 ≈ 米氏标高');
  near(z[2], 15000, 450, '天顶的臭氧光程 ≈ 臭氧层的面积');
  const h = lutSample(lut, 0, 0);
  for (let k = 0; k < 3; k++) assert.ok(h[k] > z[k] * 8, `地平线方向的光程应该长得多：${h[k]} vs ${z[k]}`);
  const top = lutSample(lut, LUT.TOP, 1);
  for (let k = 0; k < 3; k++) assert.ok(top[k] < z[k] * 0.02, '大气层顶往上看几乎没有光程');
});

test('透射率：天顶的日光红 > 绿 > 蓝；太阳贴着地平线时更红；地面以下在地球的阴影里', () => {
  const up = transmittance(lut, 0, 1, 1.4, 1), low = transmittance(lut, 0, 0.02, 1.4, 1);
  assert.ok(up[0] > up[1] && up[1] > up[2] && up[0] <= 1 && up[2] > 0.6, `天顶的日光：红光透得最多 ${up}`);       // 直射光被瑞利散射掉的是蓝光
  assert.ok(low[0] / low[2] > up[0] / up[2] * 5, '落日更红');
  assert.ok(low[2] < up[2] && low[0] < 0.5, '落日整体变暗');
  const down = lutSample(lut, 0, -0.2);
  assert.deepEqual(down, [LUT.SHADOW, LUT.SHADOW, LUT.SHADOW]);
  const dirty = transmittance(lut, 0, 1, 6, 1);
  assert.ok(dirty[2] < up[2], '越浑越暗');
});

test('天空的内散射：有限、非负、朝着太阳更亮，没有太阳就没有光', () => {
  const sun = sunVector(300, 40), a = { turbidity: 1.6, mieG: MIE_G, sunE: SUN_E };
  const toward = sun, away = [-sun[0], sun[1], -sun[2]];                                        // 同一个高度、相反的方位
  for (const d of [toward, away, [0, 1, 0], [0.3, 0.02, 0.9], [0.5, 0.5, 0.5]]) {
    const s = skyRadiance(lut, d, sun, a);
    for (const v of [...s.rgb, ...s.sunT]) assert.ok(Number.isFinite(v) && v >= 0, `天空辐射 ${s.rgb}`);
    const dark = skyRadiance(lut, d, sun, { ...a, sunE: 0, multiScatter: 0 });
    assert.deepEqual(dark.rgb.map((v) => Math.round(v * 1e9)), [0, 0, 0], '太阳关了，天就黑了');
  }
  assert.ok(luma(skyRadiance(lut, toward, sun, a).rgb) > luma(skyRadiance(lut, away, sun, a).rgb) * 3, '朝着太阳更亮');
  const zenith = skyRadiance(lut, [0, 1, 0], sun, a).rgb, horizon = skyRadiance(lut, [0, 0.02, 1], sun, a).rgb;
  assert.ok(zenith[2] > zenith[0] * 1.5, `天顶是蓝的：${zenith}`);
  assert.ok(luma(horizon) > luma(zenith), '地平线比天顶亮');
});

test('夜空的底光：地平线比天顶亮；方位角和高度角换算成方向', () => {
  const z = nightGlow([0, 1, 0]), h = nightGlow([1, 0, 0]);
  for (let k = 0; k < 3; k++) assert.ok(h[k] > z[k] && z[k] > 0 && h[k] < 0.05);
  const dir = (az, el) => sunVector(az, el).map((v) => Math.round(v * 1e12) / 1e12 + 0);
  assert.deepEqual(dir(0, 0), [0, 0, 1]);
  assert.deepEqual(dir(90, 0), [1, 0, 0]);
  assert.deepEqual(dir(180, 0), [0, 0, -1]);
  assert.deepEqual(dir(300, 90), [0, 1, 0]);
  for (const [az, el] of [[37, 12], [222, 71], [359, 0.5]]) near(Math.hypot(...sunVector(az, el)), 1, 1e-12, '单位向量');
});

test('时刻关键帧：从 0 点到 24 点排好，插值连续，取出来就是表上的值', () => {
  assert.equal(KEYS[0].h, 0);
  assert.equal(KEYS[KEYS.length - 1].h, 24);
  for (let i = 1; i < KEYS.length; i++) assert.ok(KEYS[i].h > KEYS[i - 1].h, '时刻要递增');
  for (const k of KEYS) { assert.ok(k.p.exposure > 0 && k.p.turbidity > 0 && k.p.fog >= 0); }
  const a = sampleHour(15.5);
  assert.equal(a.sunEl, 55);
  assert.equal(a.sunAz, 300);
  near(a.sunAz, 270 + 30, 1e-9, '午后的太阳在西偏南 30°：王座厅西墙的厚窗洞要靠这个角度才透得进光');
  assert.equal(sampleHour(13.6).sunAz, 342);
  for (const h of [0, 24, 39.5, 48]) assert.equal(sampleHour(h).hour % 24, h % 24, '时刻回绕');
  for (const k of KEYS.slice(1)) for (const f of ['sunEl', 'sunAz', 'turbidity', 'exposure', 'fog']) {                      // 每个结点两侧只差一点点：曲线没有断开
    const p = sampleHour(k.h - 1e-6), q = sampleHour(k.h + 1e-6);
    near(p[f], q[f], Math.abs(q[f]) * 0.002 + 1e-6, `${k.h} ${f}`);
  }
  assert.ok(sampleHour(12.4).sunEl > 60 && sampleHour(22).sunEl < -20, '正午和半夜');
});

test('夜晚系数：太阳在 2° 以上是 0，落到 -6° 以下是 1，中间平滑', () => {
  assert.equal(nightFactor(10), 0);
  assert.equal(nightFactor(-10), 1);
  for (const el of [-6, -5, -2, 0, 1, 2]) assert.ok(nightFactor(el) >= 0 && nightFactor(el) <= 1, `${el}° → ${nightFactor(el)}`);
  assert.ok(Math.abs(nightFactor(-2) - 0.5) < 1e-12, '正中间是一半');
  assert.ok(nightFactor(-3) > nightFactor(-1) && nightFactor(-1) > nightFactor(1), '越落越黑');
});
