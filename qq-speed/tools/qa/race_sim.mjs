// 整场比赛的“干跑”（Node）：没有画面，只有物理 + 电脑车手。看每辆车能不能跑完整圈、圈速多少、哪里撞墙。
//   node tools/qa/race_sim.mjs [车数=6] [圈数=2] [技能=0.98] [--zones] [--hits]
// --zones 打印第一辆车一整圈里每个区段的平均 / 最低车速；--hits 逐条列出撞墙、蹭墙时的状态
import { createTrack, pointAt } from '../../src/core/trackdef.js';
import { CARS } from '../../src/core/cardef.js';
import { createCarState, stepCar, collideCars, resetCar } from '../../src/core/carphys.js';
import { createAiDriver, aiThink, AI_TUNE } from '../../src/game/ai.js';
import { buildRacingLine } from '../../src/game/raceline.js';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const showZones = process.argv.includes('--zones'), hitsLog = process.argv.includes('--hits');
const tuneArg = process.argv.find((a) => a.startsWith('--tune='));
const tune = tuneArg ? tuneArg.slice(7).split(',').map(Number) : [];
const T = createTrack(), RL = buildRacingLine(T, { aLatDrift: tune[4] || undefined, aBr: tune[5] || undefined }), DT = 1 / 120;
if (tune.length) [AI_TUNE.lead, AI_TUNE.driftA, AI_TUNE.brakeAt, AI_TUNE.coastAt] = tune;   // --tune=lead,driftA,brakeAt,coastAt,aLatDrift,aBr
const NC = +args[0] || 6, LAPS = +args[1] || 2, SK = args[2] ? +args[2] : 0;
const cars = [], ais = [], st = [], zones = {}, hits = [];
let lastHit = -9;
for (let k = 0; k < NC; k++) {
  const i = (T.N - Math.round((11 + 7 * (k >> 1)) / T.ds) + T.N) % T.N, p = pointAt(T, i, k % 2 ? 3.1 : -3.1);
  cars.push(createCarState(CARS[1 + (k % 4)], p[0], p[1], T.th[i], T));
  ais.push(createAiDriver(SK || 0.96 + 0.025 * k));
  st.push({ lap: -1, half: false, lastS: i * T.ds, t0: 0, laps: [], hits: 0, wallBumps: 0, carBumps: 0, scrapes: 0, resets: 0, vTop: 0, mini: 0, dbl: 0, nitro: 0, full: 0, drifts: 0, hitAt: {}, lastBump: -9 });
}
let t = 0;
const ev = [];
while (t < 300) {
  for (let k = 0; k < NC; k++) {
    const S = cars[k], o = st[k], inp = aiThink(ais[k], S, T, RL, DT, cars);
    if (inp.reset) { resetCar(S, T); o.resets++; }
    ev.length = 0;
    const s = stepCar(S, inp, T, DT, ev), kmh = Math.hypot(S.vx, S.vz) * 3.6, name = T.zoneNames[T.zone[S.i]];
    const ds = s - o.lastS;
    if (s > T.L * 0.5) o.half = true;
    if (ds < -T.L / 2 && o.half) { o.lap++; o.half = false; o.laps.push(+(t - o.t0).toFixed(2)); o.t0 = t; }   // 先过半程检查点再压线才算一圈
    else if (ds > T.L / 2) o.half = true;
    o.lastS = s;
    if (kmh > o.vTop) o.vTop = kmh;
    if (k === 0 && o.lap === 0) { (zones[name] ??= { n: 0, sum: 0, min: 999 }); const z = zones[name]; z.n++; z.sum += kmh; z.min = Math.min(z.min, kmh); }
    for (const e of ev) {
      if (e.type === 'hit' || e.type === 'bump') {
        if (e.type === 'hit') { o.hits++; o.hitAt[name] = (o.hitAt[name] || 0) + 1; } else if (t - o.lastBump > 0.4) { o.wallBumps++; }   // 蹭墙按“次”计：连续蹭着只算一次
        o.lastBump = t;
        if (hitsLog && (NC === 1 || k === 0) && hits.length < 60 && t - lastHit > 0.6) {
          lastHit = t;
          hits.push(`t ${t.toFixed(1)} s ${s.toFixed(0).padStart(4)} ${name.padEnd(9)} ${e.type.padEnd(4)} ${e.power.toFixed(1).padStart(4)} m/s  v ${kmh.toFixed(0).padStart(3)} (目标 ${(RL.v[S.i] * ais[k].skill * 3.6).toFixed(0)})  e ${S.e.toFixed(1).padStart(5)}  漂移 ${S.drifting ? S.driftT.toFixed(2) + 's' : ' - '}  角 ${(S.slip * 57.3).toFixed(0).padStart(3)}°  ax ${inp.ax.toFixed(2)}`);
        }
      } else if (e.type === 'scrape') o.scrapes++;
      else if (e.type === 'drift' || e.type === 'swing') o.drifts++;
      else if (e.type === 'mini') o.mini++;
      else if (e.type === 'double' || e.type === 'cutDouble' || e.type === 'wcw') o.dbl++;
      else if (e.type === 'nitro') o.nitro++;
      else if (e.type === 'gasFull') o.full++;
    }
  }
  for (let a = 0; a < NC; a++) for (let b = a + 1; b < NC; b++) { ev.length = 0; if (collideCars(cars[a], cars[b], ev) && ev.length) { st[a].carBumps++; st[b].carBumps++; } }
  t += DT;
  if (st.every((o) => o.lap >= LAPS - 1)) break;
}
const f = (v, n = 1) => v.toFixed(n);
console.log(`cars ${NC}  laps ${LAPS}  race time ${f(t, 2)} s  (lap ${f(T.L, 0)} m; racing line: tight corners ${RL.tight.length}, min radius ${f(1 / Math.max(...Array.from(RL.k, Math.abs)))} m, profile ${f(Math.min(...RL.v))}-${f(Math.max(...RL.v))} m/s)`);
st.forEach((o, k) => console.log(`${String(k).padStart(2)} ${cars[k].def.name.padEnd(4, '　')} lap ${+f(o.lap, 0) + 1}  laps ${o.laps.map((x) => f(x, 2)).join(' / ').padEnd(15)} top ${f(o.vTop, 0).padStart(3)} km/h  drifts ${o.drifts}  mini ${o.mini}  double ${o.dbl}  nitro ${o.nitro}  gas ${o.full}  hits ${o.hits}  wallBumps ${o.wallBumps}  carBumps ${o.carBumps}  scrape ${o.scrapes}  resets ${o.resets}${Object.keys(o.hitAt).length ? '  hit@' + JSON.stringify(o.hitAt) : ''}`));
if (hitsLog) for (const h of hits) console.log('  ' + h);
if (showZones) for (const [name, z] of Object.entries(zones)) console.log(`  ${name.padEnd(10)} avg ${(z.sum / z.n).toFixed(0).padStart(3)} km/h  min ${z.min.toFixed(0).padStart(3)}  (${(z.n * DT).toFixed(1)} s)`);
process.exit(st.every((o) => o.lap >= LAPS - 1) ? 0 : 1);
