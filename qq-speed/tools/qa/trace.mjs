// 单车追踪：打印某一段里程里车每 0.1 秒的状态（调试 AI 和物理用）
//   node tools/qa/trace.mjs [起点里程=300] [终点里程=460] [技能=0.98]
import { createTrack, pointAt } from '../../src/core/trackdef.js';
import { CARS } from '../../src/core/cardef.js';
import { createCarState, stepCar } from '../../src/core/carphys.js';
import { createAiDriver, aiThink } from '../../src/game/ai.js';
import { buildRacingLine } from '../../src/game/raceline.js';
const T = createTrack(), DT = 1 / 120;
const s0 = +process.argv[2] || 300, s1 = +process.argv[3] || 460, sk = +process.argv[4] || 0.98;
const i0 = Math.round(s0 / T.ds), p = pointAt(T, i0, 0);
const S = createCarState(CARS[1], p[0], p[1], T.th[i0]), A = createAiDriver(sk), RL = buildRacingLine(T);
let t = 0, next = 0, s = s0, ev = [];
S.i = i0;
while (t < 60) {
  const inp = aiThink(A, S, T, RL, DT, [S]);
  ev.length = 0;
  const prev = s;
  s = stepCar(S, inp, T, DT, ev);
  if (s < s0 - 200 || s > s1) break;
  if (t >= next) {
    const keys = [inp.up ? '↑' : ' ', inp.down ? '↓' : ' ', inp.left ? '←' : ' ', inp.right ? '→' : ' ', inp.drift ? 'S' : ' '].join('');
    console.log(`t ${t.toFixed(2)} s ${s.toFixed(0).padStart(4)} ${T.zoneNames[T.zone[S.i]].padEnd(8)} v ${(Math.hypot(S.vx, S.vz) * 3.6).toFixed(0).padStart(3)} km/h  e ${S.e.toFixed(1).padStart(5)}  w ${S.w.toFixed(2).padStart(5)}  slip ${(S.slip * 57.3).toFixed(0).padStart(3)}°  ${S.drifting ? 'DRIFT' : '     '}  ${keys}  ${ev.map((e) => e.type).join(',')}  dir ${S.driftDir} ax ${(inp.ax ?? 0).toFixed(2)}`);
    next += 0.1;
  }
  t += DT;
}
