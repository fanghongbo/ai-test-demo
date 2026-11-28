import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rng, hashSeed } from '../src/core/rng.js';
import { noise } from '../src/core/noise.js';
import { makeCourse, gapFor, ampFor, kindFor, CLOUD_Y } from '../src/core/course.js';
import { G, launch, airTime, rangeOf, T_CHARGE } from '../src/core/physics.js';
import { Game } from '../src/core/game.js';
import { planJump, autoplay } from '../src/core/bot.js';
import { frameOf } from '../src/core/framing.js';

const DT = 1 / 120;

test('随机数是带种子的：同一个种子给同一串数', () => {
  const a = rng(42), b = rng(42), c = rng(43);
  const sa = [a(), a(), a()], sb = [b(), b(), b()], sc = [c(), c(), c()];
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  assert.ok(sa.every((v) => v >= 0 && v < 1));
  assert.equal(hashSeed('x', 1), hashSeed('x', 1));
  assert.notEqual(hashSeed('x', 1), hashSeed('x', 2));
});

test('噪声：范围在 -1 到 1 之间，相邻的点挨得近', () => {
  let lo = 1, hi = -1;
  for (let k = 0; k < 2000; k++) {
    const v = noise.noise3(k * 0.37, k * 0.11, k * 0.71);
    lo = Math.min(lo, v); hi = Math.max(hi, v);
    assert.ok(Number.isFinite(v));
  }
  assert.ok(lo > -1 && hi < 1 && hi - lo > 1.2, `动态范围太小：${lo} … ${hi}`);
  assert.ok(Math.abs(noise.noise3(1.5, 2.5, 3.5) - noise.noise3(1.51, 2.5, 3.5)) < 0.05);
});

test('关卡：同一副种子同一条路；间隔越往后越宽，都在跳得到的范围里', () => {
  const a = makeCourse(7), b = makeCourse(7);
  a.ensure(80); b.ensure(80);
  assert.equal(a.length, b.length);
  assert.deepEqual(a.nodes[30], b.nodes[30]);
  assert.notDeepEqual(a.nodes[30], makeCourse(8).node(30));
  let minGap = 1e9, maxGap = 0;
  a.ensure(a.length + 2);
  const finite = (o, path = '') => Object.entries(o).forEach(([k, v]) => {          // 所有数字都得是有限的数
    if (typeof v === 'number') assert.ok(Number.isFinite(v), `${path}${k} = ${v}`);
    else if (v && typeof v === 'object' && !Array.isArray(v)) finite(v, `${path}${k}.`);
  });
  for (const n of a.nodes) finite(n, `第 ${n.i} 个：`);
  for (let i = 1; i < a.length - 2; i++) {
    const gap = a.nodes[i].swing.tipX - a.nodes[i - 1].swing.tipX;                      // 两个座板之间的距离
    assert.ok(gap > 4.3 && gap < 8.1, `第 ${i} 个间隔 ${gap}`);
    minGap = Math.min(minGap, gap); maxGap = Math.max(maxGap, gap);
    // 岛面的高度一步一步小幅度地变（最多 0.8 米，里面带着往 0 回的分量），整体不会漂远
    assert.ok(Math.abs(a.nodes[i].y - a.nodes[i - 1].y) <= 0.8 + 1e-9, `第 ${i} 个岛的高度跳了 ${a.nodes[i].y - a.nodes[i - 1].y}`);
    assert.ok(Math.abs(a.nodes[i].y) <= 2.0 + 1e-9, `第 ${i} 个岛的高度 ${a.nodes[i].y}`);
    // 岛的右沿停在下一个秋千的前面：下一个秋千不吊在这座岛的上面
    assert.ok(a.nodes[i].islet.cx + a.nodes[i].islet.rx < a.nodes[i + 1].swing.tipX - 0.6, `第 ${i} 座岛伸到了下一个秋千底下`);
    assert.ok(a.nodes[i].islet.rx > 1.2, `第 ${i} 座岛太窄：${a.nodes[i].islet.rx}`);
    assert.ok(Math.abs(a.nodes[i].gap - (a.nodes[i + 1].swing.tipX - a.nodes[i].swing.tipX)) < 1e-9, 'gap 就是到下一个座板的距离');
  }
  assert.ok(maxGap > minGap + 1, '间隔应该有变化');
  // 秋千吊在岛的外面：座板在枝尖下面，岛的前沿在秋千平面后面
  for (const n of a.nodes) {
    assert.equal(n.swing.tipZ, 0);
    assert.ok(n.islet.cz + n.islet.rz <= -0.6 + 1e-9);
    assert.ok(n.swing.tipX < n.x, '枝尖在树干的后面那一侧');
  }
  // 前五个不晃、都是普通秋千；之后晃的和花样的都有
  assert.ok(a.nodes.slice(0, 5).every((n) => n.swing.amp === 0 && n.swing.kind === 'plain'));
  const later = a.nodes.slice(5);
  assert.ok(later.some((n) => n.swing.amp > 0) && later.some((n) => n.swing.amp === 0));
  const kinds = new Set(later.map((n) => n.swing.kind));
  for (const k of ['plain', 'gold', 'wide', 'cracked']) assert.ok(kinds.has(k), `缺少 ${k}`);
  assert.ok(!a.nodes.some((n, i) => i > 0 && n.swing.kind === 'gold' && a.nodes[i - 1].swing.kind === 'gold'), '金色的秋千不挨着');
});

test('间隔、摆幅、花样这三条曲线是往上走的', () => {
  const r = rng(99);
  let early = 0, late = 0;
  for (let k = 0; k < 200; k++) { early += gapFor(6, r); late += gapFor(30, r); }
  assert.ok(late / 200 > early / 200 + 0.8);
  assert.equal(ampFor(4, r), 0);
  assert.equal(kindFor(3, r, 'plain'), 'plain');
  const amps = Array.from({ length: 200 }, () => ampFor(30, r)).filter((v) => v > 0);
  assert.ok(amps.length > 100 && Math.max(...amps) <= 0.4 + 1e-9 && Math.min(...amps) >= 0.20 - 1e-9);
  for (let n = 1; n < 40; n++) assert.ok(Number.isFinite(gapFor(n, rng(n))), `gapFor(${n})`);
});

test('跳跃：蓄力越久跳得越远，落地的时间和高度对得上', () => {
  let last = 0;
  for (let c = 0; c <= 1.0001; c += 0.05) {
    const R = rangeOf(c);
    assert.ok(R > last, `蓄力 ${c} 的距离 ${R} 没有变大`);
    last = R;
  }
  assert.ok(rangeOf(0) < 2.2 && rangeOf(1) > 10, '最轻一跳不到 2.2 米，蓄满超过 10 米');
  const { vx, vy } = launch(0.6), T = airTime(0.6, 0);
  assert.ok(Math.abs(vy * T - 0.5 * G * T * T) < 1e-9, '同高落地');
  assert.ok(airTime(0.6, -0.5) < airTime(0.6, 0) && airTime(0.6, 0) < airTime(0.6, 0.5), '往高处跳落地更早，往低处更晚');
  assert.ok(Math.abs(vx * airTime(0.6, 0) - rangeOf(0.6)) < 1e-9);
});

test('一局：机器人能真的荡下去，分数跟着涨', () => {
  for (const seed of [1, 2, 3, 55, 909]) {
    const g = new Game({ seed });
    g.start();
    const res = autoplay(g, { jumps: 24 });
    assert.equal(res.jumps, 24, `种子 ${seed} 只跳了 ${res.jumps} 次，状态 ${g.bun.state} ${JSON.stringify(g.over)}`);
    assert.equal(g.mode, 'play');
    assert.ok(g.bun.node >= 24, `种子 ${seed} 到了第 ${g.bun.node} 个`);
    assert.ok(g.score >= g.bun.node, `种子 ${seed} 分数 ${g.score}`);
    assert.ok(Math.abs(g.bun.y - g.seatTop(g.bun.node)) < 1e-6, '站在座板上');
  }
});

test('落在正中算完美，连击的加成一路翻倍到 32 为止', () => {
  const g = new Game({ seed: 5 });
  g.start();
  const lands = [];
  for (let k = 0; k < 10; k++) {
    autoplay(g, { jumps: 1 });
    lands.push(g.drain().find((e) => e.type === 'land'));
  }
  assert.ok(lands.every((e) => e && e.perfect), '机器人的每一跳都在正中');
  assert.deepEqual(lands.slice(0, 5).map((e) => e.pts), [3, 5, 9, 17, 33]);
  assert.equal(lands[0].combo, 1);
  assert.equal(g.combo, 10);
  assert.equal(g.stats.maxCombo, 10);
});

test('踩空了：太轻、太重都是掉进云海', () => {
  for (const [hold, why] of [[0.02, '太轻'], [T_CHARGE * 2, '太重']]) {
    const g = new Game({ seed: 11 });
    g.start();
    g.press();
    for (let t = 0; t < hold; t += DT) g.step(DT);
    g.release();
    let steps = 0;
    while (g.mode === 'play' && steps++ < 120 * 10) g.step(DT);
    assert.equal(g.mode, 'over', why);
    assert.equal(g.over.reason, 'fall', why);
    assert.equal(g.bun.state, 'fall', why);
    assert.ok(g.bun.y < CLOUD_Y, why);
    assert.ok(g.drain().some((e) => e.type === 'over' && e.reason === 'fall'));
  }
});

test('踩在座板边上站不稳，滑下去；离中心不远不近算普通落地', () => {
  const g = new Game({ seed: 12 });
  g.start();
  const res = autoplay(g, { jumps: 1, aim: 0.46 });
  assert.equal(res.jumps, 1);
  assert.equal(g.bun.state, 'slip');
  assert.equal(g.score, 0);
  let steps = 0;
  while (g.mode === 'play' && steps++ < 120 * 5) g.step(DT);
  assert.equal(g.over.reason, 'slip');

  const h = new Game({ seed: 12 });
  h.start();
  autoplay(h, { jumps: 1, aim: 0.26 });
  assert.equal(h.bun.state, 'ride');
  assert.equal(h.score, 1);
  assert.equal(h.combo, 0);
});

test('越级：一步跳过两个秋千，多给分', () => {
  const g = new Game({ seed: 3 });
  g.start();
  autoplay(g, { jumps: 1, target: 2 });
  assert.equal(g.bun.node, 2);
  assert.equal(g.score, 1 + 2 + 2, '越级 3 分，加上完美的 2 分');
  const e = g.drain().find((ev) => ev.type === 'land');
  assert.ok(e.skip === 1 && e.perfect && e.label === '越级·完美');
});

test('风暴狼：站着不动会被追上，提示游戏结束', () => {
  const g = new Game({ seed: 21 });
  g.start();
  autoplay(g, { jumps: 3 });
  assert.ok(g.wolf.active, '过了两个秋千狼就该来了');
  let steps = 0;
  const t0 = g.t;
  while (g.mode === 'play' && steps++ < 120 * 60) g.step(DT);
  assert.equal(g.mode, 'over');
  assert.equal(g.over.reason, 'caught');
  assert.equal(g.over.text, '被风暴狼追上了');
  const secs = g.t - t0;
  assert.ok(secs > 12 && secs < 28, `追上用了 ${secs.toFixed(1)} 秒`);
  assert.ok(g.drain().some((e) => e.type === 'caught'));
  // 结束以后再按、再松都没有反应
  assert.equal(g.press(), false);
  assert.equal(g.release(), false);
});

test('裂了缝的秋千：站久了会断', () => {
  let g = null, idx = -1;
  for (let seed = 1; seed < 60 && idx < 0; seed++) {
    const c = makeCourse(seed);
    c.ensure(40);
    const k = c.nodes.findIndex((n, i) => i >= 14 && n.swing.kind === 'cracked' && c.nodes[i - 1].swing.kind !== 'cracked');
    if (k > 0) { g = new Game({ seed }); idx = k; }
  }
  assert.ok(g, '找到了一局有裂缝秋千的');
  g.start();
  autoplay(g, { jumps: idx });
  assert.equal(g.bun.node, idx);
  assert.equal(g.bun.state, 'ride');
  assert.equal(g.crackT, 0);
  assert.ok(g.drain().some((e) => e.type === 'crackWarn'));
  let steps = 0;
  while (g.mode === 'play' && steps++ < 120 * 5) g.step(DT);
  assert.equal(g.over.reason, 'cracked');
  assert.equal(g.over.text, '秋千断了');
  assert.ok(g.broken.includes(idx));
  // 没断之前跳走就没事
  const h = new Game({ seed: g.seed });
  h.start();
  autoplay(h, { jumps: idx });
  autoplay(h, { jumps: 1 });
  assert.equal(h.mode, 'play');
  assert.equal(h.crackT, -1);
});

test('金色的和宽板凳的秋千', () => {
  let g = null, gold = -1;
  for (let seed = 1; seed < 60 && gold < 0; seed++) {
    const c = makeCourse(seed);
    c.ensure(40);
    const k = c.nodes.findIndex((n, i) => i >= 5 && n.swing.kind === 'gold');
    if (k > 0) { g = new Game({ seed }); gold = k; }
  }
  g.start();
  autoplay(g, { jumps: gold });
  const e = g.drain().filter((ev) => ev.type === 'land').pop();
  assert.equal(e.kind, 'gold');
  assert.equal(e.pts, 1 + Math.min(32, 2 * 2 ** (e.combo - 1)) + 5, '普通 1 分 + 完美的连击加成 + 金币 5 分');
  assert.equal(e.label, '完美·金币');
  const wide = makeCourse(g.seed).ensure(60).find((n) => n.swing.kind === 'wide');
  assert.equal(wide.swing.halfW, 0.95);
});

test('镜头：兔子和下一个秋千都在框里，狼追近了把狼也框进来', () => {
  const g = new Game({ seed: 31 });
  const f0 = frameOf(g);
  assert.ok(f0.w >= 10.5 && f0.w <= 15.5);
  g.start();
  autoplay(g, { jumps: 6 });
  const f = frameOf(g), b = g.bun;
  const left = f.x - f.w / 2, right = f.x + f.w / 2;
  assert.ok(b.x - left > 2.5 && b.x - left < 5, `兔子离左边 ${b.x - left}`);
  assert.ok(g.course.node(b.node + 1).swing.tipX + 0.8 < right, '下一个秋千在框里');
  // 把狼挪到跟前
  g.wolf.active = true; g.wolf.x = b.x - 7;
  const f2 = frameOf(g);
  assert.ok(f2.x - f2.w / 2 <= g.wolf.x - 2.8 + 1e-6 && f2.w <= 19.5 + 1e-6);
  g.wolf.x = b.x - 40;                               // 落后很多：镜头不为它变宽，狼先只在提示条上显示距离
  const f3 = frameOf(g);
  assert.ok(f3.w >= 10.5 && f3.w <= 15.5 + 1e-6);
  g.wolf.x = b.x - 12.5;                             // 追到中间：宽度介于两者之间，是连续变的
  const f4 = frameOf(g);
  assert.ok(f4.w > f3.w && f4.w < 19.5);
  assert.ok(Math.abs((f4.x + f4.w / 2) - (f3.x + f3.w / 2)) < 1e-9, '右边不动：下一个秋千一直在框里');
});

test('状态和事件：读出来的都是有限数，事件只发一次', () => {
  const g = new Game({ seed: 77 });
  const s0 = g.state();
  assert.equal(s0.mode, 'title'); assert.equal(s0.charge, null); assert.equal(s0.wolf, null);
  g.start();
  g.press();
  for (let t = 0; t < 0.5; t += DT) g.step(DT);
  const s1 = g.state();
  assert.ok(s1.charge > 0.4 && s1.charge < 0.5);
  g.release();
  for (let t = 0; t < 0.2; t += DT) g.step(DT);
  const s2 = g.state();
  for (const k of ['t', 'score', 'x', 'y']) assert.ok(Number.isFinite(s2[k]), k);
  assert.equal(s2.state, 'air');
  const ev = g.drain();
  assert.ok(ev.some((e) => e.type === 'press') && ev.some((e) => e.type === 'jump'));
  assert.equal(g.drain().length, 0);
  const arc = g.arc(0.5);
  assert.ok(arc.length > 10 && arc[0][1] > arc[arc.length - 1][1]);
  // 标题画面上按了没用；没按就松开也没用
  const h = new Game({ seed: 1 });
  assert.equal(h.press(), false);
  assert.equal(h.release(), false);
  // 再来一局：从头开始，换一副路
  g.retry(999);
  assert.equal(g.mode, 'play');
  assert.equal(g.score, 0); assert.equal(g.bun.node, 0); assert.equal(g.seed, 999);
});

test('planJump：给出的方案落在目标上，按的时间不早于现在', () => {
  const g = new Game({ seed: 404 });
  g.start();
  autoplay(g, { jumps: 14 });
  const p = planJump(g);
  assert.ok(p && p.pressIn >= 0 && p.hold > 0 && p.hold <= T_CHARGE && p.err < 0.012);
  assert.equal(planJump(g, { target: 1 }).err, p.err);
});
