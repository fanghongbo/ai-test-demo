// 大气模型：透射率表的物理 sanity、天空辐射的定性行为、积分精度，以及 JS 与 GLSL 的一致性
import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATM, LUT, SKY_SAMPLES, NIGHT_SKY, buildTransmittanceLUT, lutSample, lutAlt, lutCos, transmittance, skyRadiance, nightGlow, sunVector, luma } from '../src/core/skymodel.js';

const lut = buildTransmittanceLUT();
const UP = [0, 1, 0];
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg}: ${a} vs ${b}`);
const A = { turbidity: 2.5, mieG: 0.8, sunE: 7 };
const rad = (dir, sun, a = A, o) => skyRadiance(lut, dir, sun, a, o).rgb;

test('透射率表：垂直气柱等于标高，掠射约为其 35 倍（Chapman 函数）', () => {
  const v = lutSample(lut, 0, 1);
  near(v[0] / ATM.HR, 1, 0.03, '瑞利垂直气柱');
  near(v[1] / ATM.HM, 1, 0.06, '米氏垂直气柱');
  const g = lutSample(lut, 0, 0.0008);                                 // 0.046°
  assert.ok(g[0] / ATM.HR > 30 && g[0] / ATM.HR < 45, `掠射气柱 ${g[0] / ATM.HR}`);
  assert.ok(g[1] / ATM.HM > g[0] / ATM.HR, '标高越小，掠射相对气柱越长（Chapman）');
  // 单调：越高越透
  assert.ok(lutSample(lut, 5000, 0.3)[0] < lutSample(lut, 0, 0.3)[0]);
  assert.ok(lutSample(lut, 0, 0.9)[0] < lutSample(lut, 0, 0.1)[0]);
});

test('地球阴影：地面上太阳一落到地平线下就是阴影；高空样本在太阳落下后仍被照亮', () => {
  assert.equal(lutSample(lut, 0, -0.02)[0], LUT.SHADOW);
  assert.notEqual(lutSample(lut, 0, 0.02)[0], LUT.SHADOW);
  // 阴影边界 ≈ -sqrt(2h/R)：10 km → -0.056
  assert.notEqual(lutSample(lut, 10000, -0.03)[0], LUT.SHADOW, '10 km 高处，太阳低于当地地平 1.7° 时仍被照亮');
  assert.equal(lutSample(lut, 10000, -0.08)[0], LUT.SHADOW);
  // 阴影随太阳下落从地面向上推进：曙暮光的物理来源
  let lit = 0;
  for (const h of [0, 2000, 6000, 15000, 30000]) if (lutSample(lut, h, -0.04)[0] !== LUT.SHADOW) lit++;
  assert.ok(lit >= 2, `太阳在地平线下 2.3° 时应有高空样本仍亮着，实际 ${lit}`);
});

test('直射光：正午接近白色，日落时偏红且变暗，始终 ≤ 1', () => {
  const noon = transmittance(lut, 0, 0.9, 2.5, 1), sunset = transmittance(lut, 0, 0.06, 4, 1);
  assert.ok(noon.every((v) => v > 0 && v <= 1));
  assert.ok(noon[0] / noon[2] > 0.9 && noon[0] / noon[2] < 1.2, `正午应接近白色 ${noon}`);
  assert.ok(sunset[0] / sunset[2] > 2.5, `日落时红/蓝比应很大 ${sunset}`);
  assert.ok(luma(sunset) < luma(noon) * 0.35, '日落时直射光明显变暗');
  assert.ok(sunset[0] > sunset[1] && sunset[1] > sunset[2], '红 > 绿 > 蓝');
  assert.ok(luma(transmittance(lut, 0, 0.3, 8, 1)) < luma(transmittance(lut, 0, 0.3, 1, 1)), '更浑浊的大气透过的直射光更少');
});

test('天空辐射：地平线亮于天顶、天顶偏蓝、朝阳方向更亮，全部为有限非负数', () => {
  const sun = sunVector(190, 50);
  const zen = rad(UP, sun), mid = rad([0, 0.5, 1], sun), hor = rad([0, 0.03, 1], sun), toward = rad([0, 0.2, -1], sun);
  for (const c of [zen, mid, hor, toward]) for (const v of c) assert.ok(Number.isFinite(v) && v >= 0 && v < 50, `辐射越界 ${c}`);
  // 天顶离太阳只有 40°，前向米氏散射会把它提亮；远离太阳的方向才是干净的“越低越亮”
  assert.ok(luma(hor) > luma(mid) && luma(mid) > luma(zen) * 0.9, `亮度应从天顶向地平线递增 ${luma(zen)} ${luma(mid)} ${luma(hor)}`);
  assert.ok(luma(hor) < luma(zen) * 5, `地平线/天顶不应超过实测范围的数倍 ${luma(hor)} vs ${luma(zen)}`);
  assert.ok(zen[2] > zen[0] * 2.2, `天顶应偏蓝 ${zen}`);
  assert.ok(luma(toward) > luma(mid) * 1.3, '朝着太阳方向的散射更强（米氏前向散射）');
  assert.ok(hor[0] / hor[2] > zen[0] / zen[2], '地平线比天顶更偏暖');
});

test('天空辐射不超过单次散射的物理上界（沿视线完全饱和时的源函数）', () => {
  const sun = sunVector(190, 30), mu = -0.85;                           // 背对太阳的地平线
  const phR = 3 / (16 * Math.PI) * (1 + mu * mu), g = 0.8;
  const phM = 3 / (8 * Math.PI) * ((1 - g * g) * (1 + mu * mu)) / ((2 + g * g) * Math.pow(1 + g * g - 2 * g * mu, 1.5));
  const sunT = transmittance(lut, 6000, sun[1], 2.5, 1);
  const hor = rad([0, 0.01, 1], sun, { ...A, multiScatter: 0 });       // 只检验单次散射部分（多次散射是经验补光）
  for (let k = 0; k < 3; k++) {
    const bound = 7 * (phR * sunT[k] + phM * ATM.BETA_M * 2.5 * ATM.HM * 2.5 * Math.sqrt(sunT[k]));
    assert.ok(hor[k] < bound, `通道 ${k}: ${hor[k]} 应小于上界 ${bound}`);
  }
});

test('积分精度：24 个采样点与 480 个采样点相差 < 2%', () => {
  const sun = sunVector(140, 23);
  for (const dir of [UP, [0, 0.02, -1], [0.5, 0.2, 0.84], [1, 0.004, 0], [-0.6, 0.7, -0.4]]) {
    const a = luma(rad(dir, sun)), b = luma(rad(dir, sun, A, { samples: 480 }));
    assert.ok(a > 1e-6 && Math.abs(a / b - 1) < 0.02, `方向 ${dir}: ${a} vs ${b}`);
  }
});

test('日落与曙暮光：朝向太阳的地平线呈橙红；太阳落下后天空单调变暗到接近零', () => {
  const sun = sunVector(262, 6);
  const toward = rad(sunVector(262, 4), sun, { ...A, turbidity: 5 }), zen = rad(UP, sun, { ...A, turbidity: 5 });
  assert.ok(toward[0] > toward[2] * 2, `日落方向应偏橙红 ${toward}`);
  assert.ok(zen[2] > zen[0], '日落时天顶仍偏蓝');
  let prev = Infinity, sun2 = sunVector(262, 1);
  for (const el of [1, -1, -3, -5, -7, -10]) {
    sun2 = sunVector(262, el);
    const l = luma(rad([0, 0.3, -1], sun2, A)) + luma(rad(UP, sun2, A));
    assert.ok(l < prev, `太阳高度 ${el}° 时应比上一档更暗（${l} vs ${prev}）`);
    prev = l;
  }
  assert.ok(prev < 1e-3, `太阳落下 10° 后大气散射应几乎为零，实际 ${prev}`);
});

test('夜空底光：有限、偏蓝、地平线比天顶亮，且比白天天顶暗一个数量级以上', () => {
  const z = nightGlow(UP), h = nightGlow([0, 0, 1]);
  assert.deepEqual(z, NIGHT_SKY.zenith);
  assert.ok(h[2] > h[0] && luma(h) > luma(z), '地平线比天顶亮且偏蓝');
  assert.ok(luma(h) < luma(rad(UP, sunVector(190, 50))) * 0.1, '夜空比白天天顶暗一个数量级以上（为可见性保留的电影式底光）');
});

test('JS 与 GLSL 一致：常数、查找表坐标映射、取样公式', () => {
  const glsl = fs.readFileSync(new URL('../src/gfx/skyphys_glsl.js', import.meta.url), 'utf8');
  for (const [name, val] of [['SKY_R0', ATM.R0], ['SKY_R1', ATM.R1], ['SKY_HR', ATM.HR], ['SKY_HM', ATM.HM], ['SKY_BM', ATM.BETA_M], ['SKY_LUT_W', LUT.W], ['SKY_LUT_H', LUT.H], ['SKY_LUT_TOP', LUT.TOP]]) {
    const m = glsl.match(new RegExp(`const (?:float|int) ${name} = (-?[0-9.e+-]+);`));
    assert.ok(m, `${name} 应在 GLSL 里定义`);
    near(parseFloat(m[1]), val, Math.abs(val) * 1e-6, `${name}`);
  }
  assert.match(glsl, /vec3 SKY_BR = vec3\( 5\.5e-6, 13\.0e-6, 22\.4e-6 \)/);
  assert.deepEqual(ATM.BETA_R, [5.5e-6, 13.0e-6, 22.4e-6]);
  assert.match(glsl, new RegExp(`const int SKY_SAMPLES = ${SKY_SAMPLES};`));
  // 照 GLSL 的 skyLut 在“纹素网格”上独立重写一遍取样，与 JS 的 lutSample 比对
  const glslLut = (h, c) => {
    const s = Math.max(-1, Math.min(1, c));
    const tx = (Math.sqrt(Math.abs(s)) * Math.sign(s) + 1) * 0.5 * LUT.W - 0.5, ty = Math.sqrt(Math.max(0, Math.min(1, h / LUT.TOP))) * LUT.H - 0.5;
    const i0 = Math.max(0, Math.min(LUT.W - 1, Math.floor(tx))), j0 = Math.max(0, Math.min(LUT.H - 1, Math.floor(ty)));
    const i1 = Math.min(i0 + 1, LUT.W - 1), j1 = Math.min(j0 + 1, LUT.H - 1), fx = Math.max(0, Math.min(1, tx - i0)), fy = Math.max(0, Math.min(1, ty - j0));
    const texel = (i, j) => [lut[(j * LUT.W + i) * 4], lut[(j * LUT.W + i) * 4 + 1], lut[(j * LUT.W + i) * 4 + 2]];
    const out = [0, 0, 0];
    for (let k = 0; k < 3; k++) out[k] = (texel(i0, j0)[k] * (1 - fx) + texel(i1, j0)[k] * fx) * (1 - fy) + (texel(i0, j1)[k] * (1 - fx) + texel(i1, j1)[k] * fx) * fy;
    return out;
  };
  for (const [h, c] of [[0, 1], [0, 0.03], [12, -0.01], [2300, 0.5], [30000, -0.09], [77, 0.995], [0, -1], [80000, 0]]) {
    const a = lutSample(lut, h, c);
    for (let k = 0; k < 3; k++) near(a[k], glslLut(h, c)[k], Math.abs(a[k]) * 1e-6 + 1e-6, `取样 (${h}, ${c}) 通道 ${k}`);
  }
  // 坐标映射与纹素中心一致：每个纹素的中心精确还原出它自己的 (高度, 余弦)
  for (const [i, j] of [[0, 0], [LUT.W - 1, LUT.H - 1], [70, 20]]) {
    const v = lutSample(lut, lutAlt((j + 0.5) / LUT.H), lutCos((i + 0.5) / LUT.W));
    near(v[0], lut[(j * LUT.W + i) * 4], Math.abs(v[0]) * 1e-6 + 1e-6, '纹素中心还原');
  }
});
