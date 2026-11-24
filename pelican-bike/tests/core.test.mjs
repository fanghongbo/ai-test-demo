// 核心逻辑单元测试：node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as MX from '../src/core/mathx.js';
import { BIKE, RING_R, COG_R, pitchRadius, pedalPos, gearRatio, cadenceRpm, speedForCadence, chainLoop, chainPoint } from '../src/core/bike.js';
import { solveTwoBone, bendCos } from '../src/core/ik.js';
import { createRide, stepRide, MODE, MAX_SPEED } from '../src/core/ride.js';
import { makeCloth, initCloth, stepCloth, nodeIndex } from '../src/core/cloth.js';
import { samplePalette, TOD_KEYS, formatClock, presetForHour } from '../src/core/palette.js';
import { makeTrack, terrainHeight, ROAD } from '../src/core/track.js';
import { dist, dot } from '../src/core/vec.js';

const near = (a, b, eps = 1e-9, msg = '') => assert.ok(Math.abs(a - b) <= eps, `${msg} expected ${b} ±${eps}, got ${a}`);

test('mathx: spline 夹持、无过冲、插值通过节点', () => {
  const xs = [0, 0.3, 0.6, 1], ys = [0, 0.5, 0.9, 0];
  assert.equal(MX.spline(xs, ys, -1), 0);
  assert.equal(MX.spline(xs, ys, 2), 0);
  for (let i = 0; i < xs.length; i++) near(MX.spline(xs, ys, xs[i]), ys[i], 1e-12);
  for (let x = 0; x <= 1; x += 0.01) { const v = MX.spline(xs, ys, x); assert.ok(v >= -1e-12 && v <= 1 + 1e-12, `spline overshoot at ${x}: ${v}`); }
});

test('mathx: 噪声范围、damp 收敛、wrapAngle', () => {
  for (let x = 0; x < 50; x += 0.37) assert.ok(Math.abs(MX.noise1(x, 3)) <= 1.0001 && Math.abs(MX.noise2(x, x * 0.3, 4)) <= 1.0001);
  let v = 0; for (let i = 0; i < 200; i++) v = MX.damp(v, 10, 8, 1 / 60);
  near(v, 10, 1e-6);
  near(MX.wrapAngle(Math.PI * 4), 0, 1e-12); near(Math.abs(MX.wrapAngle(Math.PI * 3)), Math.PI, 1e-12); near(MX.wrapAngle(-Math.PI * 2.5), -Math.PI / 2, 1e-12);
  const r1 = MX.mulberry32(7), r2 = MX.mulberry32(7);
  for (let i = 0; i < 20; i++) assert.equal(r1(), r2());
});

test('bike: 踏板位置、传动比、踏频↔速度互逆', () => {
  const top = pedalPos(1, 0), front = pedalPos(1, Math.PI / 2), bot = pedalPos(-1, Math.PI);
  near(top[1] - BIKE.bb[1], BIKE.crank, 1e-12); near(top[2], BIKE.bb[2], 1e-12);
  near(front[2] - BIKE.bb[2], BIKE.crank, 1e-12);
  near(bot[1] - BIKE.bb[1], -BIKE.crank, 1e-12);
  assert.equal(top[0], BIKE.pedalX); assert.equal(bot[0], -BIKE.pedalX);
  near(pitchRadius(44), 0.08904, 2e-4); near(pitchRadius(18), 0.03657, 2e-4);
  near(gearRatio(1), 44 / 18, 1e-12); near(gearRatio(0), 44 / 18 * 0.75, 1e-12);
  for (const g of [0, 1, 2]) for (const v of [0, 1, 5, 12.5]) near(speedForCadence(cadenceRpm(v, g), g), v, 1e-9);
  near(cadenceRpm(5, 1), 56.7, 0.5); // 18 km/h ≈ 57 rpm，属正常踏频区间
});

test('bike: 链条回路闭合、相切、上链段向前、包角和为 360°', () => {
  const L = chainLoop();
  near(L.wrap1 + L.wrap2, MX.TAU, 1e-12);
  const top = L.segs[0];
  assert.ok(top.b[0] > top.a[0], '上链段从后向前');
  near(Math.hypot(top.a[0] - BIKE.rearZ, top.a[1] - BIKE.wheelR), COG_R, 1e-12);
  near(Math.hypot(top.b[0] - BIKE.bb[2], top.b[1] - BIKE.bb[1]), RING_R, 1e-12);
  // 线段与圆相切：半径 ⊥ 线段
  const dx = top.b[0] - top.a[0], dy = top.b[1] - top.a[1], len = Math.hypot(dx, dy);
  near((top.b[0] - BIKE.bb[2]) * dx + (top.b[1] - BIKE.bb[1]) * dy, 0, 1e-12);
  // 段间连续 + 首尾闭合
  for (let i = 0; i < L.segs.length; i++) {
    const a = chainPoint(L, L.segs.slice(0, i).reduce((n, s) => n + s.len, 0) - 1e-7);
    const b = chainPoint(L, L.segs.slice(0, i).reduce((n, s) => n + s.len, 0) + 1e-7);
    assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-5, `链条在第 ${i} 段边界不连续`);
  }
  const z0 = chainPoint(L, 0), z1 = chainPoint(L, L.length);
  assert.ok(Math.hypot(z0[0] - z1[0], z0[1] - z1[1]) < 1e-9);
  // 上链段上前 10 cm 的位移方向 = +z（踩踏时链条向前走）
  const p0 = chainPoint(L, 0.2), p1 = chainPoint(L, 0.3);
  assert.ok(p1[0] > p0[0] && p1[0] - p0[0] > 0.099);
});

test('ik: 腿部整圈可触达，膝盖始终朝前偏外；手臂肘部朝后外', () => {
  let flexBottom = 0, flexMax = 0;
  for (const side of [1, -1]) {
    for (let i = 0; i < 360; i += 3) {
      const a = (i * Math.PI) / 180;
      const hip = [side * BIKE.hip[0], BIKE.hip[1], BIKE.hip[2]];
      const foot = pedalPos(side, a);
      const ankle = [foot[0], foot[1] + BIKE.ankleUp, foot[2] - BIKE.ankleBack];   // 踝点在踏板上方（脚掌厚度）
      if (side === 1 && i === 180) flexBottom = 180 - Math.acos(bendCos(hip, solveTwoBone(hip, ankle, BIKE.thigh, BIKE.shin, [0, 0, 1]).joint, ankle)) * 180 / Math.PI;
      const r = solveTwoBone(hip, ankle, BIKE.thigh, BIKE.shin, [side * 0.18, 0, 1]);
      flexMax = Math.max(flexMax, 180 - Math.acos(Math.max(-1, Math.min(1, bendCos(hip, r.joint, ankle)))) * 180 / Math.PI);
      assert.ok(r.reached, `腿够不到踏盘角 ${i}°`);
      const k = r.joint;
      assert.ok(k[2] > hip[2] + 0.02, `膝盖应朝前 (${i}°)`);
      assert.ok(side * k[0] >= side * hip[0] - 0.005, `膝盖不应向内 (${i}°)`);
      near(dist(hip, k), BIKE.thigh, 1e-9); near(dist(k, ankle), BIKE.shin, 1e-9);
    }
    // 车座高度是否合身：下止点腿部接近伸直（屈膝 22°~48°），上止点不过分蜷起
    assert.ok(flexBottom > 22 && flexBottom < 48, `下止点屈膝角 ${flexBottom.toFixed(1)}°`);
    assert.ok(flexMax < 124, `最大屈膝角 ${flexMax.toFixed(1)}°`);
    const sh = [side * BIKE.shoulder[0], BIKE.shoulder[1], BIKE.shoulder[2]];
    const grip = [side * BIKE.grip[0], BIKE.grip[1], BIKE.grip[2]];
    const arm = solveTwoBone(sh, grip, BIKE.upperArm, BIKE.foreArm, [side * 0.6, -0.2, -1]);
    assert.ok(arm.reached, '翅膀够不到车把');
    assert.ok(arm.joint[2] < sh[2] - 0.02, '肘部朝后');
    assert.ok(side * arm.joint[0] > side * sh[0] - 0.005, '肘部朝外');
  }
  // 够不到时夹到臂展末端且方向不变
  const far = solveTwoBone([0, 0, 0], [0, 0, 5], 1, 1, [1, 0, 0]);
  assert.equal(far.reached, false); near(far.end[2], 1.999, 1e-9);
  near(bendCos([0, 0, 0], [0, 1, 0], [1, 1, 0]), 0, 1e-12); near(bendCos([1, 1, 0], [0, 1, 0], [-1, 1, 0]), -1, 1e-12);
});

test('ride: 加速到目标并巡航，踏频由速度导出', () => {
  const s = createRide();
  let ev = [];
  for (let i = 0; i < 60 * 12; i++) ev = stepRide(s, 1 / 60, { target: 18 / 3.6 });
  near(s.v, 5, 0.02); assert.equal(s.mode, MODE.PEDAL);
  near(s.crankVel, 5 / (BIKE.wheelR * gearRatio(1)), 0.03);
  assert.ok(s.distance > 44 && s.distance < 58, `起步惯性造成的里程损失应有限 distance=${s.distance}`);
  assert.ok(s.crank >= 0 && s.crank < MX.TAU);
  assert.equal(ev.length, 0);
});

test('ride: 刹车→滑行→停；踏板回水平；跳起后必然落地', () => {
  const s = createRide({ v: 6, target: 6 });
  for (let i = 0; i < 30; i++) stepRide(s, 1 / 60, { target: 0 });
  assert.equal(s.mode, MODE.BRAKE);
  for (let i = 0; i < 60 * 6; i++) stepRide(s, 1 / 60, { target: 0 });
  assert.equal(s.v, 0); assert.equal(s.mode, MODE.STOP);
  const k = Math.round((s.crank - Math.PI / 2) / Math.PI);
  near(s.crank, k * Math.PI + Math.PI / 2, 0.01, '踏板应回到水平');
  const c0 = s.crank;
  const s2 = createRide({ v: 5, target: 5 });
  let jumps = 0, lands = 0, maxY = 0;
  for (let i = 0; i < 60 * 3; i++) {
    const e = stepRide(s2, 1 / 60, { target: 5, jump: i % 90 === 10 });
    maxY = Math.max(maxY, s2.airY);
    for (const x of e) { if (x.type === 'jump') jumps++; if (x.type === 'land') { lands++; assert.ok(x.impact > 3 && x.impact < 6); } }
  }
  assert.equal(jumps, 2); assert.equal(lands, 2); assert.equal(s2.air, false);
  assert.ok(maxY > 0.9 && maxY < 1.1, `跳跃最高点 ${maxY}`);
  assert.ok(s2.crankTravel > 0);
  void c0;
});

test('ride: 换挡改变踏频但速度不变；坡度改变速度；dt 抖动不产生 NaN', () => {
  const s = createRide({ v: 5, target: 5 });
  for (let i = 0; i < 120; i++) stepRide(s, 1 / 60, {});
  const w1 = s.crankVel;
  const e = stepRide(s, 1 / 60, { gear: 2 });
  assert.equal(e[0].type, 'shift');
  for (let i = 0; i < 60; i++) stepRide(s, 1 / 60, {});
  near(s.v, 5, 0.01);
  near(s.crankVel / w1, 1 / HUB_RATIO(2), 1e-6); // 高挡 → 踏频下降
  for (let i = 0; i < 60 * 20; i++) stepRide(s, 1 / 60, { slope: 0.08 });
  assert.ok(s.v < 4.6 && s.v > 3.2, `8% 上坡巡航应明显掉速但仍前行，v=${s.v}`);
  for (let i = 0; i < 60 * 25; i++) stepRide(s, 1 / 60, { slope: -0.06 });
  assert.ok(s.mode === MODE.COAST || s.v <= s.target + 0.05, `下坡超速应进入滑行 mode=${s.mode}`);
  const rng = MX.mulberry32(1);
  for (let i = 0; i < 5000; i++) stepRide(s, 0.001 + rng() * 0.05, { target: rng() * MAX_SPEED, jump: rng() < 0.01, slope: rng() * 0.2 - 0.1, gear: (rng() * 3) | 0 });
  for (const k of ['v', 'crank', 'wheel', 'distance', 'airY', 'airVy', 'accel']) assert.ok(Number.isFinite(s[k]), `${k} NaN`);
  assert.ok(s.v >= 0 && s.v <= MAX_SPEED);
});
const HUB_RATIO = (g) => [0.75, 1, 1.33][g];

test('cloth: 无风下垂、强风后飘、钉住点不动、约束长度守恒、长时间不发散', () => {
  const c = makeCloth({ cols: 3, rows: 12 });
  initCloth(c, [0, 1.5, 0], [0, -1, 0], [1, 0, 0], 0.5, 0.08);
  const pin = (r, k) => [k * 0.04 - 0.04, 1.5, 0];
  for (let i = 0; i < 60 * 4; i++) stepCloth(c, 1 / 60, { pin });
  checkCloth(c);
  let minY = Infinity; for (let i = 0; i < c.n; i++) minY = Math.min(minY, c.x[i * 3 + 1]);
  assert.ok(Math.abs(minY - (1.5 - 0.5)) < 0.03, `静止围巾应竖直下垂 minY=${minY}`);
  initCloth(c, [0, 1.5, 0], [0, -1, 0], [1, 0, 0], 0.5, 0.08);
  const w = [0, 0, 0];
  for (let i = 0; i < 60 * 6; i++) {
    stepCloth(c, 1 / 60, { pin: (r, k) => [k * 0.04 - 0.04, 1.5, 0], wind: (x, y, z, t, out) => { out[0] = MX.noise1(t * 3, 1) * 2; out[1] = 1; out[2] = -22; return out; }, iter: 8 });
    checkCloth(c);
    for (let k = 0; k < c.cols; k++) { const i = nodeIndex(c, 0, k); near(c.x[i * 3 + 1], 1.5, 1e-12); near(c.x[i * 3 + 2], 0, 1e-12); }
  }
  const tip = nodeIndex(c, c.rows - 1, 1);
  assert.ok(c.x[tip * 3 + 2] < -0.40, `强风下围巾应向后飘 z=${c.x[tip * 3 + 2]}`);
  assert.ok(c.x[tip * 3 + 1] > 1.0 && c.x[tip * 3 + 1] < 1.6);
  void w;
});
function checkCloth(c) {
  for (let r = 0; r < c.rows; r++) for (let k = 0; k < c.cols; k++) {
    const i = nodeIndex(c, r, k), ri = i * 4;
    const links = [[r + 1, k, c.rest[ri]], [r, k + 1, c.rest[ri + 1]], [r + 1, k + 1, c.rest[ri + 2]], [r + 1, k - 1, c.rest[ri + 3]]];
    for (const [rr, kk, L0] of links) {
      if (L0 < 0) continue;
      const j = nodeIndex(c, rr, kk);
      const d = dist([c.x[i * 3], c.x[i * 3 + 1], c.x[i * 3 + 2]], [c.x[j * 3], c.x[j * 3 + 1], c.x[j * 3 + 2]]);
      assert.ok(Number.isFinite(d) && d < L0 * 1.15, `约束拉伸过大 r${r}c${k}: ${d} vs ${L0}`);
    }
  }
}

test('palette: 关键帧连续、24h 循环闭合、取值范围', () => {
  const keys = ['sunAz', 'sunEl', 'litTint', 'shadeTint', 'skyTop', 'seaDeep', 'ink', 'lamps'];
  for (let i = 1; i < TOD_KEYS.length - 1; i++) {
    const h = TOD_KEYS[i].h;
    const a = samplePalette(h - 1e-6), b = samplePalette(h + 1e-6), c = samplePalette(h);
    for (const k of keys) { const A = a[k], B = b[k], C = c[k]; const va = Array.isArray(C) ? Math.max(...A.map((v, j) => Math.abs(v - B[j]))) : Math.abs(A - B); assert.ok(va < 2e-4, `${k} 在 h=${h} 不连续`); }
  }
  const n0 = samplePalette(1e-6), n24 = samplePalette(24 - 1e-6);
  near(n0.sunEl, n24.sunEl, 1e-6); near(n0.shadeTint[0], n24.shadeTint[0], 1e-6);
  const p = samplePalette(-3); near(p.hour, 21, 1e-9); // 负数小时自动取模
  for (let h = 0; h < 24; h += 0.05) {
    const q = samplePalette(h);
    for (const [k, v] of Object.entries(q)) if (Array.isArray(v)) for (const x of v) assert.ok(x >= 0 && x <= 1.1, `${k} 越界 @${h}`);
  }
  assert.equal(formatClock(6.1), '06:06'); assert.equal(formatClock(22), '22:00');
  assert.equal(presetForHour(13).id, 'day'); assert.equal(presetForHour(2).id, 'night');
  // 太阳高度：白天为正，夜晚为负或为月光
  assert.ok(samplePalette(13).sunEl > 60 && samplePalette(18.2).sunEl < 10);
});

test('track: 闭合、弧长参数一致、投影往返、海在右侧、地形连续', () => {
  const T = makeTrack();
  const a = T.frameAt(0, {}), b = T.frameAt(T.length, {});
  assert.ok(dist(a.pos, b.pos) < 1e-6, '路线应闭合');
  assert.ok(T.length > 650 && T.length < 950, `周长 ${T.length}`);
  // 弧长参数：相邻帧间距 = Δs
  for (let i = 0; i < 40; i++) {
    const s = (i / 40) * T.length, ds = 2.0;
    const f0 = T.frameAt(s, {}), f1 = T.frameAt(s + ds, {});
    near(dist([f0.pos[0], 0, f0.pos[2]], [f1.pos[1] * 0 + f1.pos[0], 0, f1.pos[2]]), ds, 0.01);
    near(Math.hypot(...f1.fwd), 1, 1e-9);
    near(dot(f0.fwd, f0.right), 0, 1e-9); near(dot(f0.fwd, f0.up), 0, 1e-9);
    // right = fwd × up
    const r = crossY(f0.fwd, f0.up);
    assert.ok(dist(r, f0.right) < 1e-6);
  }
  // 投影往返：沿路线取点并横移 u，应投回同一 (s,u)
  let maxErr = 0;
  for (let i = 0; i < 200; i++) {
    const s = (i / 200) * T.length + 0.7, u = (i % 7) * 3 - 9;
    const f = T.frameAt(s, {});
    const x = f.pos[0] + f.right[0] * u, z = f.pos[2] + f.right[2] * u;
    const n = T.nearest(x, z, {});
    let ds = Math.abs(n.s - s); ds = Math.min(ds, T.length - ds);
    maxErr = Math.max(maxErr, ds);
    assert.ok(ds < 0.08, `往返 s 误差 ${ds} @s=${s} u=${u}`);
    assert.ok(Math.abs(n.u - u) < 0.08, `往返 u 误差 ${n.u} vs ${u}`);
  }
  // 海在右侧：路线远离岛心的方向 = right
  const cx = (T.bounds.minX + T.bounds.maxX) / 2, cz = (T.bounds.minZ + T.bounds.maxZ) / 2;
  for (let i = 0; i < 72; i++) {
    const f = T.frameAt((i / 72) * T.length, {});
    const ox = f.pos[0] - cx, oz = f.pos[2] - cz;
    assert.ok(ox * f.right[0] + oz * f.right[2] > 0, `海侧不在右侧 @${i}`);
  }
  // 地形：路缘处允许 13cm 台阶，其余连续；路面周期闭合
  near(T.roadY(0), T.roadY(T.length), 1e-9);
  let maxSlope = 0;
  for (let s = 0; s < T.length; s += 0.5) maxSlope = Math.max(maxSlope, Math.abs(T.slope(s)));
  assert.ok(maxSlope < 0.07, `最大纵坡 ${maxSlope}`);
  for (let i = 0; i < 60; i++) {
    const f = T.frameAt((i / 60) * T.length + 3, {});
    let prev = null;
    for (let u = -40; u <= 40; u += 0.5) {
      const x = f.pos[0] + f.right[0] * u, z = f.pos[2] + f.right[2] * u;
      const y = terrainHeight(T, x, z);
      assert.ok(Number.isFinite(y));
      if (prev !== null) assert.ok(Math.abs(y - prev) < 0.45, `地形在 u=${u} 跳变 ${y - prev}`);
      prev = y;
    }
    // 路面高于海面，沙滩最终入水，岛心高于路面
    const shore = { u: 0 };
    const yRoad = terrainHeight(T, f.pos[0], f.pos[2], Object.assign(shore, { u: 0, y: f.y }));
    assert.ok(yRoad > 1.5, '路面应高于海面');
    assert.ok(terrainHeight(T, f.pos[0] + f.right[0] * 40, f.pos[2] + f.right[2] * 40) < -1, '海侧远处应没入水下');
  }
  assert.ok(ROAD.half > 2);
  assert.ok(maxErr < 0.08);
});
function crossY(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }

test('路肩：人行道外侧的地形不高于步道面（否则跨过步道边缘的三角形会从步道下面钻出来）', () => {
  const T = makeTrack(), n = {};
  const edge = ROAD.half + ROAD.curbW + ROAD.walkIn;
  for (let i = 0; i < 160; i++) {
    const s = (i / 160) * T.length + 0.3, f = T.frameAt(s, {});
    for (const d of [0.05, 0.6, 1.5, 2.3]) {                      // 步道外 0~2.3 m：不得高于“步道面 + 1.2% 缓坡”
      const u = -(edge + d), x = f.pos[0] + f.right[0] * u, z = f.pos[2] + f.right[2] * u;
      const y = terrainHeight(T, x, z, n), ry = n.y;             // n.y 就是 terrainHeight 用的路面高程
      assert.ok(y <= ry + ROAD.curbH - 0.045 * (1 - Math.min(1, d / 1.2)) + 0.012 * d + 1e-4, `路肩高于步道面 s=${s.toFixed(1)} d=${d}: ${y - ry - ROAD.curbH}`);
    }
    const x0 = f.pos[0] + f.right[0] * -(edge + 0.05), z0 = f.pos[2] + f.right[2] * -(edge + 0.05);
    assert.ok(terrainHeight(T, x0, z0, n) < f.pos[1] + ROAD.curbH - 0.035, '紧贴步道外沿应低一道小沿');
  }
});
