// 赛道自检（Node）：闭环、曲率、路宽、各区段之间的净距，并导出叠加图用的 JSON。
//   node tools/qa/track_check.mjs [--json out.json]
import { createTrack, nearest, pointAt, SCALE } from '../../src/core/trackdef.js';

const args = process.argv.slice(2);
const jsonIdx = args.indexOf('--json');
const T = createTrack();
const out = [];
const log = (...a) => out.push(a.join(' '));

const f = (v, n = 1) => (+v).toFixed(n);
log(`samples ${T.N}  ds ${f(T.ds, 3)} m  lap ${f(T.L, 1)} m  scale ${SCALE} m/px`);
log(`half-width  min ${f(Math.min(...T.hw), 2)}  max ${f(Math.max(...T.hw), 2)} m`);
let kmax = 0, kAt = 0;
for (let i = 0; i < T.N; i++) if (Math.abs(T.kap[i]) > kmax) { kmax = Math.abs(T.kap[i]); kAt = i; }
log(`tightest radius ${f(1 / kmax, 2)} m at s=${f(kAt * T.ds, 0)} (${T.zoneNames[T.zone[kAt]]})`);

// 闭环
const dClose = Math.hypot(T.x[T.N - 1] - T.x[0], T.z[T.N - 1] - T.z[0]);
log(`closure: last→first ${f(dClose, 3)} m (should ≈ ds ${f(T.ds, 3)})`);

// 弯道清单：|κ| > 1/80 连成一段
const corners = [];
let i = 0;
{
  const inC = (j) => Math.abs(T.kap[j]) > 1 / 80;
  let start = -1;
  for (let j = 0; j < T.N; j++) {
    if (inC(j) && start < 0) start = j;
    if ((!inC(j) || j === T.N - 1) && start >= 0) {
      const end = inC(j) ? j : j - 1;
      let kmin = 0, turn = 0;
      for (let q = start; q <= end; q++) { kmin = Math.max(kmin, Math.abs(T.kap[q])); turn += T.kap[q] * T.ds; }
      corners.push({ s0: start * T.ds, s1: end * T.ds, r: 1 / kmin, turn: turn * 180 / Math.PI, zone: T.zoneNames[T.zone[start]], hw: T.hw[(start + end) >> 1] });
      start = -1;
    }
  }
}
log(`corners: ${corners.length}`);
for (const c of corners) log(`  s ${f(c.s0, 0).padStart(5)}–${f(c.s1, 0).padStart(5)}  r≥${f(c.r, 1).padStart(5)} m  turn ${f(c.turn, 0).padStart(4)}°  hw ${f(c.hw, 1)}  ${c.zone}`);

// 净距：沿程相距 > sep 的任意两个采样，中心距 − 两者半宽
let gapMin = Infinity, gi = 0, gj = 0;
const sepM = 30, sepN = Math.ceil(sepM / T.ds);
for (let a = 0; a < T.N; a++) for (let b = a + sepN; b < T.N; b++) {
  if (a === 0 && b > T.N - sepN) continue;              // 环形首尾相邻
  const circ = Math.min(b - a, T.N - (b - a)) * T.ds;
  if (circ < sepM) continue;
  const dd = Math.hypot(T.x[a] - T.x[b], T.z[a] - T.z[b]);
  const g = dd - T.hw[a] - T.hw[b];
  if (g < gapMin) { gapMin = g; gi = a; gj = b; }
}
log(`min gap between non-adjacent sections: ${f(gapMin, 2)} m  at s=${f(gi * T.ds, 0)} (${T.zoneNames[T.zone[gi]]}) ↔ s=${f(gj * T.ds, 0)} (${T.zoneNames[T.zone[gj]]})`);

// nearest() 自检：路面上任取一点都能查回到正确位置
let worst = 0, bad = 0;
for (let q = 0; q < T.N; q += 7) {
  for (const lat of [-0.8, 0, 0.8]) {
    const [X, Z] = pointAt(T, q, lat * T.hw[q]);
    const r = nearest(T, X, Z, q);
    const dsErr = Math.min(Math.abs(r.s - q * T.ds), T.L - Math.abs(r.s - q * T.ds));
    if (dsErr > 3 || Math.abs(r.e - lat * T.hw[q]) > 0.6) bad++;
    worst = Math.max(worst, dsErr);
  }
}
log(`nearest(): worst along-track error ${f(worst, 2)} m, bad ${bad}`);
// 全局搜索（不给 hint）
let badG = 0;
for (let q = 0; q < T.N; q += 13) { const r = nearest(T, T.x[q], T.z[q], -1); const e = Math.min(Math.abs(r.s - q * T.ds), T.L - Math.abs(r.s - q * T.ds)); if (e > 3) badG++; }
log(`nearest() global: bad ${badG}`);
log(`start line at s=${f(T.startS, 1)} m, idx ${T.startIdx}, heading ${(T.th[T.startIdx] * 180 / Math.PI).toFixed(1)}°`);
for (const z of T.zoneNames) { const arr = T.zones[z]; log(`  zone ${z.padEnd(10)} ${String(arr.length).padStart(4)} samples  ${(arr.length * T.ds).toFixed(0).padStart(5)} m  hw ${f(Math.min(...arr.map((j) => T.hw[j])), 1)}–${f(Math.max(...arr.map((j) => T.hw[j])), 1)}`); }

console.log(out.join('\n'));
const ok = dClose < T.ds * 1.01 && gapMin > 2.0 && bad === 0 && badG === 0;
console.log(ok ? 'TRACK OK' : 'TRACK PROBLEM');

if (jsonIdx >= 0) {
  const fs = await import('node:fs');
  const pts = [];
  for (let j = 0; j <= T.N; j++) { const q = j % T.N; pts.push([+T.mapOf(T.x[q], T.z[q])[0].toFixed(3), +T.mapOf(T.x[q], T.z[q])[1].toFixed(3), + (T.hw[q] / SCALE).toFixed(3), T.zoneNames[T.zone[q]], +T.kap[q].toFixed(5)]); }
  fs.writeFileSync(args[jsonIdx + 1], JSON.stringify({ scale: SCALE, lap: T.L, startS: T.startS, ds: T.ds, pts, corners }));
  console.log('wrote', args[jsonIdx + 1]);
}
process.exit(ok ? 0 : 1);
