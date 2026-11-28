// 电影巡游的分镜和路线，以及两套镜头（巡游、自由潜泳）的行为
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SHOTS } from '../src/game/tour.js';
import { sampleShot, createTour, createSwim } from '../src/game/camera.js';
import { createColliders } from '../src/game/collide.js';
import { buildCastle } from '../src/world/castle.js';
import { buildWreck } from '../src/world/wreck.js';
import { buildRuins } from '../src/world/ruins.js';
import { scatterRocks } from '../src/world/rocks.js';
import { height } from '../src/core/seabed.js';
import { fakeArchMaterials } from './helpers.mjs';

const AM = fakeArchMaterials();
const WORLD_COL = createColliders([...buildCastle(AM).colliders, ...scatterRocks(5).colliders, ...buildWreck(AM).colliders, ...buildRuins(AM).colliders], { radius: 0.6 });
const finite3 = (v) => [v.x, v.y, v.z].every(Number.isFinite);

test('分镜表：十六个镜头，名字唯一，每个都有时长、焦距、路线、地点和字幕', () => {
  assert.ok(SHOTS.length >= 16, `只有 ${SHOTS.length} 个镜头`);
  assert.equal(new Set(SHOTS.map((s) => s.id)).size, SHOTS.length);
  for (const s of SHOTS) {
    assert.ok(s.dur >= 6 && s.dur <= 16, `${s.id} 的时长 ${s.dur}`);
    assert.ok(s.fov >= 34 && s.fov <= 70, `${s.id} 的焦距 ${s.fov}`);
    assert.ok(Array.isArray(s.pos) && s.pos.length >= 2 && s.pos.length <= 4, `${s.id} 的路线`);
    assert.ok(Array.isArray(s.look) && s.look.length >= 1 && s.look.length <= 4, `${s.id} 的注视点`);
    for (const p of [...s.pos, ...s.look]) assert.ok(p.length === 3 && p.every(Number.isFinite), `${s.id}：${p}`);
    assert.ok(typeof s.place === 'string' && s.place.length >= 2 && typeof s.text === 'string' && s.text.length >= 8, `${s.id} 缺地点或字幕`);
  }
  assert.deepEqual(SHOTS.map((s) => s.id), ['bridge', 'gate', 'guardian', 'passage', 'court', 'hall', 'throne', 'dome', 'wall', 'garden', 'kelp', 'wreck', 'village', 'temple', 'colossus', 'return']);
  const total = SHOTS.reduce((a, s) => a + s.dur, 0);
  assert.ok(total > 150 && total < 200, `巡游一共 ${total} 秒`);
});

test('每条路线全程留有空隙：离海床一米以上，离墙、石头、船身半米以上，不出水面', () => {
  const pos = new THREE.Vector3(), look = new THREE.Vector3();
  for (const s of SHOTS) {
    const bad = [];
    for (let i = 0; i <= 80; i++) {
      sampleShot(s, i / 80, pos, look);
      const gap = pos.y - height(pos.x, pos.z);
      if (!(gap >= 1.2) || !(pos.y <= -1.4) || !WORLD_COL.clear(pos.x, pos.y, pos.z, 0.8)) bad.push(`t=${(i / 80).toFixed(2)} [${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}] 离地 ${gap.toFixed(1)}`);
    }
    assert.deepEqual(bad, [], `${s.id} 的路线撞到了东西`);
  }
});

test('镜头走得稳：起点和终点就是表上的点，一步一步是连续的，看着的地方不乱跳', () => {
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), p2 = new THREE.Vector3(), l2 = new THREE.Vector3();
  for (const s of SHOTS) {
    sampleShot(s, 0, pos, look);
    assert.ok(pos.distanceTo(new THREE.Vector3(...s.pos[0])) < 1e-6, `${s.id} 的起点`);
    sampleShot(s, 1, pos, look);
    assert.ok(pos.distanceTo(new THREE.Vector3(...s.pos[s.pos.length - 1])) < 1e-6, `${s.id} 的终点`);
    const length = pos.clone().sub(new THREE.Vector3(...s.pos[0])).length();
    assert.ok(length / s.dur < 6, `${s.id} 走得太快：${length} 米 / ${s.dur} 秒`);
    let maxStep = 0, maxLook = 0;
    for (let i = 0; i < 80; i++) {
      sampleShot(s, i / 80, pos, look);
      sampleShot(s, (i + 1) / 80, p2, l2);
      maxStep = Math.max(maxStep, pos.distanceTo(p2));
      maxLook = Math.max(maxLook, look.distanceTo(l2));
    }
    assert.ok(maxStep < 0.9, `${s.id} 一步跳了 ${maxStep.toFixed(2)} 米`);
    assert.ok(maxLook < 0.8, `${s.id} 注视点一步跳了 ${maxLook.toFixed(2)} 米`);
    sampleShot(s, 0.37, pos, look);
    assert.ok(finite3(pos) && finite3(look));
  }
});

test('巡游镜头：跟着分镜走，镜头之间黑场切换，走完最后一个回到第一个', () => {
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.3, 100), tour = createTour(camera, SHOTS, { handheld: 0 });
  assert.equal(tour.update(0.016, 0), 'cut');
  const first = new THREE.Vector3(...SHOTS[0].pos[0]);
  assert.ok(camera.position.distanceTo(first) < 0.2, `镜头应该从第一个镜头的起点出发：${camera.position.toArray()}`);
  assert.ok(tour.state.fade < 0.05, '刚切过来是黑的');
  const q = camera.quaternion.clone();
  assert.equal(tour.update(2, 2), null);
  assert.ok(tour.state.fade > 0.99, '中间不黑');
  assert.equal(tour.shot.id, 'bridge');
  assert.ok(camera.position.distanceTo(first) > 0.1, '镜头应该在往前走');
  assert.ok(camera.quaternion.angleTo(q) < 0.05, '看着的方向不该突然变');
  tour.update(SHOTS[0].dur, 20);
  assert.equal(tour.shot.id, 'gate');
  assert.equal(tour.update(0.016, 21), null, '切镜头只在换过去的那一帧报一次');
  const pose = tour.pose();
  assert.ok(finite3(pose.pos) && [pose.quat.x, pose.quat.y, pose.quat.z, pose.quat.w].every(Number.isFinite) && pose.fov > 30 && pose.fov < 70);
  tour.jump(-1);
  assert.equal(tour.shot.id, 'return');
  tour.update(SHOTS[SHOTS.length - 1].dur + 0.1, 200);
  assert.equal(tour.shot.id, 'bridge', '走完最后一个回到第一个');
  let total = 0;
  for (const s of SHOTS) total += s.dur;
  tour.jump(0);
  const seen = [];
  for (let i = 0; i < 4200; i++) { tour.update(total / 4000, i * 0.05); if (seen[seen.length - 1] !== tour.shot.id) seen.push(tour.shot.id); }   // 4200 步比一整圈多 5%
  assert.deepEqual(seen, [...SHOTS.map((s) => s.id), 'bridge'], '按顺序走完一圈再从头来');
});

test('自由潜泳：按键才动，松开就停，疾游更快；会穿过门洞，不出水面，不进沙子', () => {
  const saved = { addEventListener: globalThis.addEventListener, removeEventListener: globalThis.removeEventListener, document: globalThis.document };
  const keys = new Map();
  globalThis.addEventListener = (type, fn) => { if (!keys.has(type)) keys.set(type, []); keys.get(type).push(fn); };
  globalThis.removeEventListener = () => {};
  globalThis.document = { addEventListener() {}, removeEventListener() {}, pointerLockElement: null, exitPointerLock() {} };
  try {
    const camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.3, 100);
    const swim = createSwim(camera, { addEventListener() {}, requestPointerLock() {} }, WORLD_COL, { speed: 3.2, boostSpeed: 9.2, radius: 0.6, fov: 62, sway: 0 });
    const key = (code, down = true) => { for (const f of keys.get(down ? 'keydown' : 'keyup') ?? []) f({ code, repeat: false }); };
    const step = (n, t0) => { for (let i = 0; i < n; i++) swim.update(1 / 60, t0 + i / 60); };
    swim.enter({ pos: new THREE.Vector3(0, -33, -14), quat: new THREE.Quaternion(), fov: 62 });
    step(30, 0);
    assert.ok(camera.position.distanceTo(new THREE.Vector3(0, -33, -14)) < 1e-9, '不按键不动');
    key('KeyW');
    step(120, 1);
    const z1 = camera.position.z;
    assert.ok(z1 < -14 - 3 && Math.abs(camera.position.x) < 1e-6 && Math.abs(camera.position.y + 33) < 1e-6, `往前游了 ${(z1 + 14).toFixed(1)} 米`);
    assert.ok(WORLD_COL.clear(camera.position.x, camera.position.y, camera.position.z, 0.3), '门洞里没有被卡住');
    assert.ok(swim.state.speed > 3 && swim.state.speed < 3.3, `速度 ${swim.state.speed}`);
    key('KeyW', false);
    step(90, 3);
    assert.ok(swim.state.speed > 0.1 && swim.state.speed < 0.6, `松开以后靠惯性往前滑一段：${swim.state.speed}`);
    step(180, 4.5);
    assert.ok(swim.state.speed < 0.03, `最后停下来：${swim.state.speed}`);
    key('ShiftLeft'); key('KeyW');
    step(90, 5);
    assert.ok(swim.state.speed > 6 && swim.state.boost01 > 0.8 && camera.fov > 64, `疾游：${swim.state.speed}`);
    assert.ok(camera.position.z < -25 && camera.position.z > -37, `这时候正在门洞里：${camera.position.z}`);
    step(240, 7.5);
    assert.ok(camera.position.z < -47 && camera.position.z > -49.3 && swim.state.speed < 0.3, `穿过门洞，被前庭喷泉上的石像挡住：${camera.position.z}`);
    key('KeyW', false); key('ShiftLeft', false);
    step(120, 10);
    swim.enter({ pos: new THREE.Vector3(40, -4, 60), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(1.2, 0, 0, 'YXZ')), fov: 62 });
    swim.setStick(0, 1);
    step(180, 12);
    assert.ok(camera.position.y <= -0.9 + 1e-9 && camera.position.y > -1.6, `不能浮出水面：${camera.position.y}`);
    swim.enter({ pos: new THREE.Vector3(40, -46, 60), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.2, 0, 0, 'YXZ')), fov: 62 });
    step(180, 15);
    assert.ok(camera.position.y >= height(camera.position.x, camera.position.z) + 0.3, `不能钻进海床：${camera.position.y}`);
    swim.setStick(0, 0);
    swim.lookDelta(100, 0);
    assert.ok(Math.abs(swim.state.yaw + 0.5) < 1e-9, '拖动 100 像素转半弧度');
    swim.leave();
    assert.equal(swim.state.active, false);
  } finally {
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete globalThis[k]; else globalThis[k] = v; }
  }
});
