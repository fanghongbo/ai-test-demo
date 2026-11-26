// 漂移特性测试：直道上以固定车速起漂并保持，看横摆角速度、漂移角、实际转弯半径怎么变化。
//   node tools/qa/drift_probe.mjs [车速 km/h=72] [车=1]
import { createTrack } from '../../src/core/trackdef.js';
import { CARS } from '../../src/core/cardef.js';
import { createCarState, stepCar } from '../../src/core/carphys.js';
const T = createTrack(), DT = 1 / 120, v0 = (+process.argv[2] || 72) / 3.6, car = CARS[+process.argv[3] || 1];
for (const ax of [1, 0, -1]) {
  const S = createCarState(car, T.x[40], T.z[40], T.th[40], T), ev = [];
  S.vx = Math.cos(S.psi) * v0; S.vz = Math.sin(S.psi) * v0;
  let px = S.x, pz = S.z, headV = S.psi, path = 0, lastVx = S.vx, lastVz = S.vz;
  const row = [];
  for (let n = 0; n < 150; n++) {
    ev.length = 0;
    stepCar(S, { up: true, drift: true, ax: n === 0 ? 1 : ax }, T, DT, ev);
    const vx = S.vx, vz = S.vz, sp = Math.hypot(vx, vz), ang = Math.atan2(vx * lastVz - vz * lastVx, vx * lastVx + vz * lastVz);
    path += sp * DT; lastVx = vx; lastVz = vz;
    if (n % 15 === 14) row.push(`t${((n + 1) * DT).toFixed(2)} v${(sp * 3.6).toFixed(0)} w${S.w.toFixed(2)} β${(Math.atan2(S.vL, S.vF) * 57.3).toFixed(0)}° rv=${sp > 1 ? (sp / Math.abs(ang / DT + 1e-9)).toFixed(1) : '-'}m`);
    if (ev.some((e) => e.type === 'hit' || e.type === 'scrape' || e.type === 'bump')) { row.push('WALL@' + ((n + 1) * DT).toFixed(2)); break; }
  }
  console.log(`${car.name} ${(+process.argv[2] || 72)}km/h 转向 ${ax > 0 ? '同向满舵' : ax < 0 ? '反向满舵' : '回中'}: ${row.join('  ')}`);
}
