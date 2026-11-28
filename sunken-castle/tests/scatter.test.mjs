// 散布：礁石、珊瑚、海草的位置都从这儿来，所以位置是确定的
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scatter, randLog, tiltQuat } from '../src/core/scatter.js';
import { mulberry32 } from '../src/core/mathx.js';
import { THREE } from './helpers.mjs';

const area = { x0: -100, x1: 100, z0: -100, z1: 100, cell: 5 };

test('散布：同一种子撒出同一批点，每格最多一个，都在范围里', () => {
  const run = () => scatter({ ...area, seed: 9 });
  const a = run(), b = run(), c = scatter({ ...area, seed: 10 });
  assert.equal(a.length, 1600);
  assert.deepEqual(a.slice(0, 50), b.slice(0, 50));
  assert.notDeepEqual(a.slice(0, 50), c.slice(0, 50));
  const cells = new Set(a.map((p) => `${Math.floor((p.x - area.x0) / area.cell)},${Math.floor((p.z - area.z0) / area.cell)}`));
  assert.equal(cells.size, a.length, '一格一个点');
  for (const p of a) assert.ok(p.x > area.x0 && p.x < area.x1 && p.z > area.z0 && p.z < area.z1);
});

test('散布：抽稀的比例大致对，筛掉的点不出现，每格里的位置是抖动的', () => {
  const kept = scatter({ ...area, seed: 3, keep: 0.4, jitter: 0.8 });
  assert.ok(kept.length > 560 && kept.length < 720, `抽稀 40%：${kept.length}`);
  const east = scatter({ ...area, seed: 3, accept: (x) => x > 0 });
  assert.equal(east.length, 800);
  assert.ok(east.every((p) => p.x > 0));
  const none = scatter({ ...area, seed: 3, accept: () => false, each: () => 1 });
  assert.equal(none.length, 0);
  const custom = scatter({ ...area, seed: 5, cell: 10, each: (x, z, r) => ({ x, z, s: randLog(r, 1, 4) }), jitter: 0 });
  assert.equal(custom.length, 400);
  const j = scatter({ ...area, seed: 5, cell: 10, jitter: 1 });
  let offCentre = 0;
  j.forEach((p, i) => { if (Math.abs(p.x - custom[i].x) > 1e-9) offCentre++; assert.ok(Math.abs(p.x - custom[i].x) <= 5 && Math.abs(p.z - custom[i].z) <= 5, '抖动不出格子'); });
  assert.ok(offCentre > 350, '抖动应该把点从格子中心挪开');
  for (const p of custom) assert.ok(p.s >= 1 && p.s < 4);
  const r = mulberry32(1); let small = 0;
  for (let i = 0; i < 1000; i++) if (randLog(r, 1, 100) < 10) small++;
  assert.ok(small > 450 && small < 550, '对数均匀：一半在低的那个数量级里');
});

test('散布用的四元数是单位四元数，竖轴最多歪 tilt', () => {
  const r = mulberry32(4), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 300; i++) {
    const q = tiltQuat(r, 0.35, new THREE.Quaternion());
    assert.ok(Math.abs(q.length() - 1) < 1e-9);
    assert.ok(Math.acos(Math.min(1, up.clone().applyQuaternion(q).y)) <= 0.35 + 1e-6);
  }
});

