// 世界检视台入口（仅用于 QA）：npm 不打包进正式页面。
// 用法见 tools/qa/world_shots.py
import * as THREE from 'three';
import { createToonEnv } from '../gfx/toon.js';
import { createStage } from '../gfx/stage.js';
import { createWorld } from './world.js';
import { createRider } from '../actors/rider.js';
import { placeOnTrack } from '../rig/trackride.js';
import { samplePalette } from '../core/palette.js';
import { makeTrack } from '../core/track.js';
import { createRide, stepRide } from '../core/ride.js';

const q = new URLSearchParams(location.search);
const canvas = document.getElementById('view');
const U = createToonEnv();
const stage = createStage(canvas, U);
const track = makeTrack();
const t0 = performance.now();
const world = createWorld(U, { track, quality: Number(q.get('quality') ?? 2) });
const buildMs = performance.now() - t0;
stage.scene.add(world.group);
const rider = createRider(U); stage.scene.add(rider.hero);
const pal = samplePalette(parseFloat(q.get('hour') ?? '14.5'), {});
if (q.has('style')) U.uStyle.value = Number(q.get('style'));
const ride = createRide({ v: Number(q.get('v') ?? 5), target: Number(q.get('v') ?? 5) });
let s = Number(q.get('s') ?? 40), simTime = 0;
const f = {};
function step(dt) {
  simTime += dt; ride.time = simTime;
  stepRide(ride, dt, {});
  s = (s + ride.v * dt) % track.length;
  const curv = track.curvatureAt(s);
  placeOnTrack(rider.hero, track, s, { airY: ride.airY, speed: ride.v, curvature: curv }, f);
  rider.update(ride, dt, { curvature: curv, lampLevel: pal.lamps });
}
function applyPal() { stage.applyPalette(pal, rider.hero.position); world.applyPalette(pal); }
applyPal();
for (let i = 0; i < 120; i++) step(1 / 60);
applyPal();
const frame = () => { world.update(1 / 60, { time: simTime, heroPos: rider.hero.position, camera: stage.camera, lampLevel: pal.lamps }); stage.render(); };
const LOCAL = {
  behind: [0, 14, 6.6, 0.9], side: [-92, 6, 6.2, 0.9], sideSea: [92, 6, 6.2, 0.9], front34: [38, 12, 6.0, 0.9], ahead: [178, 16, 7.5, 1.0],
  low: [24, 3, 4.6, 1.0], far34: [-50, 20, 15, 0.8], high: [-60, 42, 22, 0],
  frontClose: [-62, 9, 2.3, 1.02], frontCloseL: [58, 10, 2.3, 1.02], rearClose: [-120, 16, 2.8, 1.1],
};
function setView(name) {
  const cam = stage.camera;
  if (name === 'overview') { cam.fov = 36; cam.position.set(250, 210, 330); cam.lookAt(0, 10, 0); }
  else if (name === 'islandTop') { cam.fov = 40; cam.position.set(30, 420, 60); cam.lookAt(0, 0, 20); }
  else if (name === 'horizon') { const b = track.bounds; cam.fov = 34; cam.position.set(0, 14, b.minZ - 60); cam.lookAt(0, 30, b.maxZ); }
  else if (name === 'lighthouse') { const t = world.landmarks.lighthouse; cam.fov = 34; cam.position.set(t.x + 46, t.y + 6, t.z + 54); cam.lookAt(t.x, t.y - 10, t.z); }
  else if (name === 'pier') { const p = world.landmarks.pier; cam.fov = 34; cam.position.set(p.x + 26, p.y + 9, p.z + 26); cam.lookAt(p.x, p.y + 1, p.z); }
  else {
    const [az, el, d, ty] = LOCAL[name] || LOCAL.behind;
    const a = az * Math.PI / 180, e = el * Math.PI / 180;
    cam.fov = name === 'far34' || name === 'high' ? 40 : 36;
    const h = rider.hero;
    const off = new THREE.Vector3(Math.sin(a) * Math.cos(e) * d, Math.sin(e) * d, -Math.cos(a) * Math.cos(e) * d).applyQuaternion(h.quaternion);
    cam.position.copy(h.position).add(off);
    const tgt = h.position.clone().add(new THREE.Vector3(0, ty, 0));
    cam.lookAt(tgt);
  }
  cam.updateProjectionMatrix(); stage.syncCameraUniforms();
}
function resize() { stage.resize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, devicePixelRatio); }
resize(); window.addEventListener('resize', resize);
setView(q.get('view') || 'behind');
frame();
window.__sceneReady = true;
window.__viewer = { views: ['overview', 'islandTop', 'horizon', 'lighthouse', 'pier', ...Object.keys(LOCAL)], setView: (n) => { setView(n); frame(); } };
window.__ride = {
  buildMs, settle: (n = 1) => { for (let i = 0; i < n; i++) step(1 / 60); frame(); }, step,
  stats: () => ({ ...stage.stats, buildMs: Math.round(buildMs), world: world.stats(), calls: stage.stats.calls }),
  setView: (n) => { setView(n); frame(); },
  go: (sv) => { s = sv; for (let i = 0; i < 30; i++) step(1 / 60); setView(q.get('view') || 'behind'); frame(); },
  hour: (h) => { samplePalette(h, pal); applyPal(); frame(); },
  style: (v) => { U.uStyle.value = v; frame(); },
  fish: () => { const a = world.landmarks.pier; const p = a.clone().add(new THREE.Vector3(8, 0, 6)); p.y = 0; const r = world.fishJump(p); for (let i = 0; i < 25; i++) { step(1 / 60); } frame(); return !!r; },
  dbg: () => { const P = rider.pelican, r = (v) => v.toArray().map((x) => +x.toFixed(3)); return { v: ride.v, collar: r(P.collar.position), head: r(P.headNode.position), tails: P.tails.map((tl) => [0, 3, 7, 11, 14].map((row) => { const i = row * 3 + 1; return [+tl.cloth.x[i * 3].toFixed(3), +tl.cloth.x[i * 3 + 1].toFixed(3), +tl.cloth.x[i * 3 + 2].toFixed(3)]; })) }; },
  fps: (n = 120) => { const t = performance.now(); for (let i = 0; i < n; i++) { step(1 / 60); frame(); } return Math.round(n / ((performance.now() - t) / 1000)); },
};
