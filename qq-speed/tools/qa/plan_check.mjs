// 地标平面自检（Node）：每个地标的占地到路面边缘的净距、是否落在陆地 / 水面上、彼此是否重叠，并导出画图用的 JSON。
//   node tools/qa/plan_check.mjs [--json out.json]
import { createTrack, nearest, SCALE } from '../../src/core/trackdef.js';
import { PLAN, FOOTPRINTS, NEED, EXCLUDE } from '../../src/world/plan.js';
import { ISLANDS, LAND_RECTS, distToLand } from '../../src/world/landdef.js';

const args = process.argv.slice(2);
const T = createTrack();
const toPx = (X, Z) => [X / SCALE + 84.5, Z / SCALE + 73.5];
const inPoly = (poly, X, Z) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > Z) !== (b[1] > Z) && X < ((b[0] - a[0]) * (Z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
};
const inside = (f, X, Z) => f.kind === 'rect' ? X >= f.x0 && X <= f.x1 && Z >= f.z0 && Z <= f.z1 : f.kind === 'poly' ? inPoly(f.pts, X, Z) : Math.hypot(X - f.c[0], Z - f.c[1]) <= f.r;
const extent = (f) => {
  if (f.kind === 'rect') return [[f.x0, f.x1], [f.z0, f.z1]];
  if (f.kind === 'poly') return [0, 1].map((k) => [Math.min(...f.pts.map((p) => p[k])), Math.max(...f.pts.map((p) => p[k]))]);
  return [[f.c[0] - f.r, f.c[0] + f.r], [f.c[1] - f.r, f.c[1] + f.r]];
};
const grid = (f) => {
  const [[x0, x1], [z0, z1]] = extent(f), out = [];
  for (let X = x0; X <= x1 + 1e-6; X += 1.5) for (let Z = z0; Z <= z1 + 1e-6; Z += 1.5) if (inside(f, X, Z) || f.kind === 'rect') out.push([X, Z]);
  if (f.kind === 'circle') for (let a = 0; a < 360; a += 4) out.push([f.c[0] + Math.cos(a * Math.PI / 180) * f.r, f.c[1] + Math.sin(a * Math.PI / 180) * f.r]);
  return out;
};

let problems = 0;
const rows = [];
for (const f of FOOTPRINTS) {
  let clear = Infinity, at = null, water = 0, offMap = 0;
  const pts = grid(f);
  for (const [X, Z] of pts) {
    const n = nearest(T, X, Z, -1);
    if (n.d - T.hw[n.i] < clear) { clear = n.d - T.hw[n.i]; at = [...toPx(X, Z).map((v) => +v.toFixed(1)), n.i]; }
    if (distToLand(X, Z) > 0.5) water++;
    const [px, py] = toPx(X, Z);
    if (px < 4 || px > 165 || py < 4 || py > 145) offMap++;
  }
  const need = NEED[f.name] ?? 'road';
  let verdict = 'ok';
  if (clear < f.minClear) verdict = 'ROAD!';
  else if (need === 'land' && water > 0) verdict = 'WATER!';
  else if (need === 'water' && water < pts.length * 0.9) verdict = 'LAND!';
  if (verdict !== 'ok') problems++;
  rows.push({ name: f.name, need, clear: +clear.toFixed(1), at, waterPct: +(100 * water / pts.length).toFixed(0), offMap, verdict });
  console.log(`${f.name.padEnd(8)} ${f.kind.padEnd(6)} 到路缘 ${String(+clear.toFixed(1)).padStart(6)} m（要求 ${f.minClear}）  水面 ${String(rows[rows.length - 1].waterPct).padStart(3)}%  最近路面 px ${JSON.stringify(at)}  ${verdict}`);
}
for (let a = 0; a < FOOTPRINTS.length; a++) for (let b = a + 1; b < FOOTPRINTS.length; b++) {
  const A = FOOTPRINTS[a], B = FOOTPRINTS[b];
  const [[bx0, bx1], [bz0, bz1]] = extent(B);
  let hit = false;
  for (let X = bx0; X <= bx1 && !hit; X += 1.5) for (let Z = bz0; Z <= bz1 && !hit; Z += 1.5) if (inside(A, X, Z) && inside(B, X, Z)) hit = true;
  if (hit) { console.log(`OVERLAP ${A.name} ↔ ${B.name}`); problems++; }
}
// 不建房区必须把地标占地整个盖住（否则普通楼会盖到地标上）
for (const f of FOOTPRINTS) for (const [X, Z] of grid(f)) {
  const px = X / SCALE + 84.5, py = Z / SCALE + 73.5;
  if (!EXCLUDE.some(([x0, y0, x1, y1]) => px >= x0 && px <= x1 && py >= y0 && py <= y1)) { console.log(`NOT EXCLUDED ${f.name} at px ${px.toFixed(1)},${py.toFixed(1)}`); problems++; break; }
}
console.log(problems ? `PLAN PROBLEM (${problems})` : 'PLAN OK');

const ji = args.indexOf('--json');
if (ji >= 0) {
  const fs = await import('node:fs');
  const pts = [];
  for (let j = 0; j <= T.N; j++) { const q = j % T.N; pts.push([...toPx(T.x[q], T.z[q]).map((v) => +v.toFixed(3)), +(T.hw[q] / SCALE).toFixed(3), T.zoneNames[T.zone[q]]]); }
  const fps = FOOTPRINTS.map((f) => f.kind === 'rect' ? { name: f.name, kind: 'rect', box: [...toPx(f.x0, f.z0), ...toPx(f.x1, f.z1)] }
    : f.kind === 'poly' ? { name: f.name, kind: 'poly', pts: f.pts.map((p) => toPx(p[0], p[1])) } : { name: f.name, kind: 'circle', c: toPx(f.c[0], f.c[1]), r: f.r / SCALE });
  fs.writeFileSync(args[ji + 1], JSON.stringify({ pts, start: toPx(T.x[0], T.z[0]), islands: ISLANDS, rects: LAND_RECTS, excl: EXCLUDE, fps, rows,
    marks: [['arch', PLAN.archX], ['pylon', PLAN.pylonX[0]], ['pylon', PLAN.pylonX[1]], ['tower bridge', PLAN.towerBridge[0]], ['ring tower', PLAN.ring.c[0], PLAN.ring.c[1]]]
      .map(([name, X, Z = PLAN.towerBridge[1]]) => [name, ...toPx(X, Z)]) }));
  console.log('wrote', args[ji + 1]);
}
process.exit(problems ? 1 : 0);
