// 碰撞：潜泳的人不能穿墙、不能钻进沙里、不能浮出水面。纯计算，不开浏览器
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createColliders } from '../src/game/collide.js';
import { buildCastle } from '../src/world/castle.js';
import { buildWreck } from '../src/world/wreck.js';
import { buildRuins } from '../src/world/ruins.js';
import { scatterRocks } from '../src/world/rocks.js';
import { height, WORLD, CASTLE } from '../src/core/seabed.js';
import { fakeArchMaterials } from './helpers.mjs';

const CZ = -75;                                                          // 王城的中心（世界坐标）

test('碰撞：圆、墙、方盒各自挡人，并从最近的一面把人挤出去', () => {
  const col = createColliders([{ x: 0, z: 0, r: 2, y1: -10 }, { ax: 10, az: -5, bx: 10, bz: 5, s0: 0, s1: 10, r: 0.5, y1: -10 }, { box: [20, 24, -2, 2], y0: -20, y1: -10 }]);
  assert.equal(col.clear(0, -30, 0), false);
  assert.equal(col.clear(3, -30, 0), true);
  assert.equal(col.clear(0, -5, 0), true, '圆只到 y1 这么高，上面能游过去');
  assert.equal(col.clear(10, -30, 0), false);
  assert.equal(col.clear(12, -30, 0), true);
  assert.equal(col.clear(10, -30, 7), true, '墙只有 s0..s1 这一段');
  assert.equal(col.clear(10, -30, -7), true);
  assert.equal(col.clear(22, -15, 0), false);
  assert.equal(col.clear(22, -5, 0), true);
  const p = [1.0, -30, 0];
  assert.equal(col.resolve(p, 0.6), true);
  assert.ok(Math.abs(Math.hypot(p[0], p[2]) - 2.6) < 1e-9 && p[0] > 0, `挤到圆外面：${p}`);
  const q = [10, -30, 0];
  col.resolve(q, 0.6);
  assert.ok(Math.abs(Math.abs(q[0] - 10) - 1.1) < 1e-9 && q[2] === 0, `挤到墙的一侧：${q}`);
  const b = [22, -15, 0.5];
  col.resolve(b, 0.6);
  assert.ok(b[2] === 2.6 || b[2] === -2.6 || b[0] === 24.6 || b[0] === 19.4, `挤到盒子外面：${b}`);
  assert.equal(col.resolve([100, -30, 100], 0.6), false);
});

test('碰撞：不能钻进海床，不能浮出水面，深渊里游不出太远，正好在圆心上也要被推开', () => {
  const col = createColliders([]);
  const p = [30, -80, 60];
  assert.equal(col.resolve(p, 0.6), true);
  assert.ok(p[1] > height(30, 60) && p[1] <= height(30, 60) + 0.6 * 0.85 + 1e-9, `托到沙面上：${p[1]}`);
  const s = [30, -0.2, 60];
  col.resolve(s, 0.6);
  assert.ok(s[1] < -0.5 && s[1] > -1.5, '头顶留在水面以下');
  assert.equal(col.resolve([0, -30, 0], 0.6), false, '水中间不碰东西');
  const A = WORLD.abyss, far = [A.x + WORLD.extent * 1.5, -30, A.z];
  col.resolve(far, 0.6);
  assert.ok(Math.hypot(far[0] - A.x, far[2] - A.z) <= WORLD.extent * 0.9 + 1e-9, '世界的边上有一道看不见的墙');
  const bare = createColliders([{ x: 5, z: -3, r: 2, y1: -1 }]), c0 = [5, -30, -3];
  assert.equal(bare.resolve(c0, 0.6), true);
  assert.ok(Math.abs(Math.hypot(c0[0] - 5, c0[2] + 3) - 2.6) < 1e-9, `正好在圆心上也要被推到外面：${c0}`);
});

test('整座城的碰撞体：门洞、桥面、前庭、王座厅是通的；城墙、石栏、石像挡人', () => {
  const AM = fakeArchMaterials();
  const col = createColliders([...buildCastle(AM).colliders, ...scatterRocks(5).colliders, ...buildWreck(AM).colliders, ...buildRuins(AM).colliders], { radius: 0.6 });
  assert.ok(col.list.length > 1500, `碰撞体 ${col.list.length}`);
  for (const c of col.list) for (const v of [c.x, c.z, c.r, c.ax, c.az, c.bx, c.bz, c.s0, c.s1, c.y1, c.y0, ...(c.box ?? [])]) if (v !== undefined) assert.ok(Number.isFinite(v), '碰撞体里有坏数');
  for (let z = -34; z <= -14; z += 2) assert.ok(col.clear(0, -33, z, 0.5), `门洞里 (${z}) 应该能过`);             // 铁闸吊在上半截，人从下面过
  assert.equal(col.clear(0, -30.5, -28, 0.5), false, '铁闸的下半截挡人');
  assert.equal(col.clear(14, -31, -31.3, 0.5), false, '南面的城墙');
  assert.ok(col.clear(14, -31, -40, 0.5), '城墙里面是前庭');
  assert.equal(col.clear(-6.9, -31, CZ + 54.8, 0.5), false, '守望者石像挡人');
  assert.ok(col.clear(1.2, -30.6, 13, 0.5), '潜泳的起点是空的');
  for (let z = CASTLE.bridge.z0 + 6; z < CASTLE.bridge.z1 - 16; z += 4) assert.ok(col.clear(0, -32, z, 0.5), `桥面上 (${z})`);   // 最后一跨塌了，不算
  assert.equal(col.clear(4.05, -35.0, 20, 0.3), false, '石栏挡人');
  assert.ok(col.clear(4.05, -32, 20, 0.5), '石栏只有一米多高，上面游得过去');
  assert.ok(col.clear(0, -35.0, 20, 0.3), '两道石栏之间是桥面');
  assert.equal(col.clear(0, -36.5, 10, 0.3), false, '桥面的石板挡人');
  assert.ok(col.clear(0, -31, 10, 0.5), '桥面上方是通的');
  assert.ok(col.clear(-2, (height(-2, 7.9) - 37.2) / 2, 7.9, 0.3), '桥洞里能穿过去');
  assert.ok(col.clear(2.5, -31.5, CZ + 25, 0.5), '前庭中间、喷泉里侧是空的');
  assert.equal(col.clear(0, -34.7, CZ + 25 - 4.3, 0.3), false, '喷泉的沿挡人');
  assert.ok(col.clear(0, -31.5, CZ + 25 - 4.3, 0.5), '喷泉的沿只有一米多高，上面游得过去');
  assert.ok(col.clear(0, -33, CZ - 80, 0.5), '王座厅里的中轴是通的');
  const seat = [-6.9, -33, CZ + 54.8];
  col.resolve(seat, 0.6);
  assert.ok(Math.hypot(seat[0] + 6.9, seat[2] - (CZ + 54.8)) >= 1.5, `正好在守望者的轴线上也要被推开：${seat}`);
});
