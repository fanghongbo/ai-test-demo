// 水下光学：阳光折射进水里、随深度和视距的衰减、水色。还有水面波谱。纯计算，不开浏览器
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { N_WATER, TIMES, DEFAULT_TIME, CLARITY, DEFAULT_CLARITY, BASE_EXTINCT, WATER_TINT, MOON, fresnelTransmit, sunUnderwater, extinction, transmittance, ambientInscatter } from '../src/core/wateroptics.js';
import { WAVE_LIST, G, TILE, seaState, waveHeight, waveSlope, WAVE_GLSL } from '../src/core/waves.js';

const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg ?? ''}：${a} 和 ${b} 相差超过 ${eps}`);
const len = (v) => Math.hypot(...v);
const COS_WINDOW = Math.sqrt(1 - 1 / (N_WATER * N_WATER));                    // 贴着地平线的阳光折射进水里，离竖直 48.6°；这也是从水下往上看时“窗口”的边界

test('水面：每一列波都满足深水波的色散关系 ω² = g·k', () => {
  assert.equal(WAVE_LIST.length, 17);
  for (const w of WAVE_LIST) near(w.w * w.w, G * Math.hypot(w.kx, w.kz), 1e-9, '色散关系');
  near(WAVE_LIST[0].len, TILE, 1e-9, '波长 = 周期 / 波数格点');
});

test('水面：以 24 米为周期，海况 0 是镜面，海况是振幅的倍率', () => {
  let worst = 0;
  for (let i = 0; i < 200; i++) {
    const x = (i * 37.7) % 300 - 150, z = (i * 53.1) % 300 - 150, t = i * 0.37;
    worst = Math.max(worst, Math.abs(waveHeight(x, z, t) - waveHeight(x + TILE, z + TILE, t)), Math.abs(waveHeight(x, z, t) - waveHeight(x - TILE, z, t)));
    near(waveHeight(x, z, t, 0), 0, 1e-12, '镜面');
    near(waveHeight(x, z, t, 0.5) * 2, waveHeight(x, z, t, 1), 1e-9, '海况是倍率');
  }
  assert.ok(worst < 1e-9, `水面不周期：差 ${worst}`);
});

test('水面：坡度是高度的导数；有义波高和坡度在合理的范围里', () => {
  for (let i = 0; i < 60; i++) {
    const x = i * 11.3 - 300, z = (i * 29) % 90 - 45, t = i * 1.7, e = 0.02, s = waveSlope(x, z, t);
    near(s[0], (waveHeight(x + e, z, t) - waveHeight(x - e, z, t)) / (2 * e), 0.004, '∂h/∂x');
    near(s[1], (waveHeight(x, z + e, t) - waveHeight(x, z - e, t)) / (2 * e), 0.004, '∂h/∂z');
  }
  const st = seaState();
  assert.ok(st.hs > 0.3 && st.hs < 1.2, `有义波高 ${st.hs}`);
  assert.ok(st.slopeRms > 0.02 && st.slopeRms < 0.15, `坡度均方根 ${st.slopeRms}`);
  assert.equal((WAVE_GLSL.match(/vec4\( /g) ?? []).length, WAVE_LIST.length * 2, '着色器里的波常量应该和这一列波一样多');
});

test('阳光折射进水里：更靠近天顶，最多离竖直 48.6°，方位不变', () => {
  near(Math.asin(1 / N_WATER) * 180 / Math.PI, 48.6, 0.05, '全反射的临界角');
  near(sunUnderwater(0.01, 200).dir[1], COS_WINDOW, 1e-6, '贴着地平线的光折射到窗口的边上');
  near(sunUnderwater(89.99, 200).dir[1], 1, 1e-6, '天顶的光垂直下来');
  for (const el of [0.5, 5, 17, 30, 55, 70, 89.9]) for (const az of [0, 40, 130, 227, 300]) {
    const s = sunUnderwater(el, az);
    near(len(s.dir), 1, 1e-12, '单位向量');
    assert.ok(s.dir[1] >= COS_WINDOW - 1e-9 && s.dir[1] <= 1, `水下光线的仰角：y = ${s.dir[1]}`);
    const air = [Math.sin(az * Math.PI / 180) * Math.cos(el * Math.PI / 180), 0, Math.cos(az * Math.PI / 180) * Math.cos(el * Math.PI / 180)];
    const cross = air[0] * s.dir[2] - air[2] * s.dir[0];
    near(cross, 0, 1e-9, '折射不改变方位');
    assert.ok(s.dir[0] * air[0] + s.dir[2] * air[2] > 0, '方向应该和空气里的一致');
    assert.ok(s.transmit > 0.02 && s.transmit <= 1.0001, `水面透射率 ${s.transmit}`);
    if (el >= 55) assert.ok(s.transmit > 0.96, `太阳高的时候水面几乎全透：${s.transmit}`);
    if (el <= 5) assert.ok(s.transmit < 0.5, '贴着水面的光大部分被反射回去');
    assert.ok(s.spread >= s.transmit - 1e-9, '光线竖直了，水平面上的照度只会更高');
  }
  near(fresnelTransmit(1), 0.98, 0.002, '正入射');
  assert.ok(!sunUnderwater(-20, 300).aboveHorizon && sunUnderwater(10, 300).aboveHorizon);
  assert.ok(MOON.el > 0 && MOON.el < 90);
});

test('衰减系数：清澈就是基准值，越浑越大；红光在视线里掉得最快', () => {
  const ids = CLARITY.map((c) => c.id);
  assert.equal(new Set(ids).size, CLARITY.length, '水质的名字不能重复');
  assert.ok(ids.includes(DEFAULT_CLARITY));
  const ks = CLARITY.map((c) => c.k);
  assert.deepEqual(ks, [...ks].sort((a, b) => a - b), '水质从清到浑排');
  for (const c of CLARITY) {
    const e = extinction(c.k);
    for (const kind of ['view', 'sun', 'amb']) for (let i = 0; i < 3; i++) near(e[kind][i], BASE_EXTINCT[kind][i] * c.k, 1e-12, `${c.id} ${kind}[${i}]`);
    assert.ok(e.view[0] > e.view[1] && e.view[1] > e.view[2], '先丢红、再丢绿');
    assert.ok(e.amb[0] > e.sun[0] && e.amb[2] > e.sun[2], '散射光走的路更长，掉得更快');
  }
  assert.ok(BASE_EXTINCT.view[2] < 0.03 && BASE_EXTINCT.view[0] > 0.08, '清澈的外海：几十米外还看得见，红光基本没了');
});

test('透过率：越远越暗，t = 0 时全透，红光最先没', () => {
  const e = extinction(1);
  for (const t of [0, 1, 5, 20, 60, 150]) {
    const T = transmittance(e.view, t);
    if (t === 0) assert.deepEqual(T, [1, 1, 1]);
    assert.ok(T[0] <= T[1] + 1e-12 && T[1] <= T[2] + 1e-12, `t = ${t}：${T}`);
    const prev = transmittance(e.view, t - 0.5);
    if (t > 0) assert.ok(T[2] < prev[2], '更远应该更暗');
  }
  const far = transmittance(e.view, 60);
  assert.ok(far[2] > 0.25 && far[2] < 0.4 && far[0] < 0.01, `60 米外：蓝光还剩三成、红光没了：${far}`);
});

test('水体散射的闭式解 = 沿视线逐步积分的结果；远处的水色只取决于光源', () => {
  const r = (a, b) => a + (b - a) * ((Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1 + 1) % 1;
  for (let k = 0; k < 40; k++) {
    const sigma = BASE_EXTINCT.view.map((v, i) => v * r(i, k) * 2 + 0.02), kd = BASE_EXTINCT.amb.map((v, i) => v * r(k, i) * 0.15);
    const A0 = WATER_TINT.map((v, i) => v * (0.5 + r(i * 3, k))), depth = 3 + r(k, 2) * 45, v = [r(k, 3) * 2 - 1, r(k, 4) * 1.6 - 0.8, r(k, 5) * 2 - 1];
    const n = Math.hypot(...v); v[0] /= n; v[1] /= n; v[2] /= n;
    const t = v[1] > 1e-6 ? Math.min(30 + r(k, 6) * 80, depth / v[1]) : 30 + r(k, 6) * 80;
    const closed = ambientInscatter(sigma, kd, A0, depth, v, t), steps = 4000, dt = t / steps, num = [0, 0, 0];
    for (let i = 0; i < steps; i++) {                                                   // 梯形法：光源沿途按深度衰减，散射进来的光再衰减一段
      const s = (i + 0.5) * dt, w = s * v[1];
      for (let c = 0; c < 3; c++) num[c] += sigma[c] * A0[c] * Math.exp(-kd[c] * (depth - w)) * Math.exp(-sigma[c] * s) * dt;
    }
    for (let c = 0; c < 3; c++) { assert.ok(Number.isFinite(closed[c]) && closed[c] >= -1e-12); near(closed[c], num[c], num[c] * 0.01 + 1e-9, `第 ${k} 组第 ${c} 个通道`); }
    for (let c = 0; c < 3; c++) near(ambientInscatter(sigma, kd, A0, depth, [v[2], 0, v[0]], 4000)[c], A0[c] * Math.exp(-kd[c] * depth), A0[c] * 0.001, '水平望去，远处的水色 = 衰减到镜头这个深度的水体颜色');
  }
});

test('往上看：散射只积到水面为止', () => {
  const sigma = BASE_EXTINCT.view, kd = BASE_EXTINCT.amb, A0 = WATER_TINT, depth = 30, v = [0, 0.6, 0.8];
  const toSurface = ambientInscatter(sigma, kd, A0, depth, v, depth / v[1]);
  assert.deepEqual(ambientInscatter(sigma, kd, A0, depth, v, 500), toSurface, '过了水面没有水');
  const half = ambientInscatter(sigma, kd, A0, depth, v, depth / v[1] / 2);
  for (let c = 0; c < 3; c++) assert.ok(half[c] < toSurface[c] && half[c] > 0, '越接近水面越亮');
  near(ambientInscatter(sigma, kd, A0, depth, v, 0)[2], 0, 1e-9, '还没走就没有散射');
  assert.deepEqual(WATER_TINT, [...WATER_TINT].sort((a, b) => a - b), '清澈的水是蓝的');
});

test('五个时刻和四种水质：名字唯一、曝光为正、黄昏要提亮、夜晚的太阳在地平线以下', () => {
  assert.equal(TIMES.length, 5);
  assert.equal(new Set(TIMES.map((t) => t.id)).size, 5);
  assert.equal(new Set(TIMES.map((t) => t.name)).size, 5);
  assert.ok(TIMES.some((t) => t.id === DEFAULT_TIME));
  for (const t of TIMES) { assert.ok(t.p.exposure > 0 && t.p.sunEl >= -90 && t.p.sunEl <= 90 && t.gain > 0 && t.gain <= 1 && t.hour >= 0 && t.hour < 24); }
  const by = (id) => TIMES.find((t) => t.id === id);
  assert.ok(by('night').p.sunEl < -6, '夜晚');
  assert.ok(by('dusk').p.sunEl > 0 && by('dusk').p.sunEl < 12 && by('dusk').gain < 0.8, '黄昏：太阳刚落，靠灯笼');
  assert.ok(by('dusk').p.exposure > by('noon').p.exposure * 1.5, '黄昏的曝光比正午高');
  assert.ok(by('noon').p.sunEl > 60, '正午的太阳很高');
  assert.equal(new Set(CLARITY.map((c) => c.name)).size, CLARITY.length);
});
