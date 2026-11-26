// 电脑车手：照着赛车线开（game/raceline.js）。纯跟踪 + 曲率前馈决定转向；按线上的速度曲线收油、刹车；
// 弯太急就按 Shift 漂移，出弯松 Shift 再点一下 ↑ 吃小喷；小喷后面接氮气就是双喷，直道上也可以单放氮气。
// 全部走和玩家一样的物理（core/carphys.js），不依赖 three。
import { pointAt, WALL } from '../core/trackdef.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/** 电脑车手的几个手感参数（tools/qa/race_sim.mjs 可以用 --tune 扫参数） */
export const AI_TUNE = {
  lead: 0.30,          // 提前多少秒判“要不要起漂移”，也是速度要提前降到位的距离
  driftA: 0.9,         // 需要的横向加速度达到抓地上限的多少倍就起漂移
  brakeAt: 2.0,        // 比目标速度快多少（m/s）就踩刹车
  coastAt: 0.15,       // 比目标速度快多少就松油门
};

/** skill：1 = 标准水平。大于 1 的车手弯速更高，小于 1 的更容易开慢 */
export function createAiDriver(skill, name = '') {
  return { skill, name, release: 0, nitroCd: 1.5, stuck: 0, onUp: true };
}

/**
 * @param {object} A createAiDriver()
 * @param {object} S 车的状态（core/carphys.js）
 * @param {object} T createTrack()
 * @param {object} RL buildRacingLine()
 * @param {object[]} others 场上其它的车（避让用）
 * @returns {{up, down, ax, drift, nitro, reset}} 该怎么开：ax 是转向量 −1..1
 */
export function aiThink(A, S, T, RL, dt, others = []) {
  const N = T.N, i = Math.max(0, S.i), v = Math.max(0, S.vF), ds = T.ds;
  const out = { up: true, down: false, left: false, right: false, ax: 0, drift: false, nitro: false, reset: false };
  const vTot = Math.hypot(S.vx, S.vz), kHere = RL.k[i];
  const kLead = RL.k[(i + Math.round((vTot * AI_TUNE.lead) / ds)) % N];     // lead 秒之后走到的地方的曲率
  A.nitroCd = Math.max(0, A.nitroCd - dt);
  A.release = Math.max(0, A.release - dt);

  // ——— 目标点：赛车线上往前看一段；前面紧挨着有车就往空着的一边让一点 ———
  const it = (i + Math.round((6 + 0.42 * v) / ds)) % N;
  let lat = RL.lat[it], care = false;
  const c = Math.cos(S.psi), sn = Math.sin(S.psi);
  for (const o of others) {
    if (o === S) continue;
    const dx = o.x - S.x, dz = o.z - S.z, dist = Math.hypot(dx, dz);
    if (dist > 13 || dist < 0.1) continue;
    const ahead = dx * c + dz * sn, side = -dx * sn + dz * c;
    if (ahead < 0.5 || ahead > dist * 0.9 || Math.abs(side) > 2.8) continue;
    lat += side > 0 ? -3.4 : 3.4; care = true;
  }
  lat = clamp(lat, -(T.hw[it] + WALL - 3.4), T.hw[it] + WALL - 3.4);
  const tp = pointAt(T, it, lat);
  const dir = S.drifting && vTot > 5 ? Math.atan2(S.vz, S.vx) : S.psi;                           // 漂移时车头指着弯里，要看速度方向
  const err = wrap(Math.atan2(tp[1] - S.z, tp[0] - S.x) - dir);
  const tauD = S.drifting ? S.def.tauDrift * 0.72 : 0;                                                   // 漂移时速度方向滞后车头约 tauD 秒：按那么远之后的曲率给前馈，正好补掉
  const wFF = vTot * RL.k[(i + Math.round((vTot * tauD) / ds)) % N];
  out.ax = clamp(err * (S.drifting ? 2.8 : 2.3) - (S.w - wFF) * (S.drifting ? 0.16 : 0.26), -1, 1);
  out.right = out.ax > 0.05; out.left = out.ax < -0.05;

  // ——— 速度：和速度曲线比。快了先松油门，快得多就踩刹车（物理里油门优先于刹车，两个不能同时按）。带回差，免得油门在阈值上抖 ———
  let vT = RL.v[i];
  const lead = Math.round((AI_TUNE.lead * vTot) / ds) + 4;                                 // 漂移要提前 0.45 秒起，而且漂移里不好刹车：起漂之前就得把速度降到位
  for (let q = 1; q <= lead; q += 2) vT = Math.min(vT, RL.v[(i + q) % N]);
  const over = v - vT * A.skill;
  A.onUp = over < AI_TUNE.coastAt ? true : over > AI_TUNE.coastAt + 1.4 ? false : A.onUp;
  out.up = A.onUp && A.release <= 0;
  out.down = over > (S.drifting ? 7 : AI_TUNE.brakeAt);                                       // 漂移里一般不踩刹车，除非快得太多了

  // ——— 漂移：走进急弯就按 Shift；弯快走完了就松开 ———
  if (S.drifting) {
    const kRem = RL.k[(i + 11) % N];
    const done = v < 9 || (S.driftT > 0.32 && (Math.abs(kRem) < 1 / 75 || (Math.abs(err) < 0.05 && Math.abs(kRem) < 1 / 40)))
      || (Math.sign(kRem) === -S.driftDir && Math.abs(kRem) > 1 / 160) || (S.driftT > 0.45 && err * S.driftDir < -0.13);   // 目标已经跑到另一边 = 转过头了，赶紧收
    out.drift = !done;
    if (done) A.release = 0.11;                                       // 松开 Shift 以后先松一下 ↑，下一步再按 = 小喷
  } else {
    // 抓地能提供的横向加速度不够用了（v²·曲率 超过上限）就得起漂移；提前 0.45 秒判，因为速度方向跟不上车头
    const aNeed = vTot * vTot * kLead;
    // 右弯紧接左弯这种“反向弯”，眼前的弯和前面的弯方向相反：前面的更急就照前面的起漂移
    if (Math.abs(aNeed) > S.def.aLat * AI_TUNE.driftA && v > 15 && S.driftCd <= 0 && (Math.sign(kLead) === Math.sign(kHere || kLead) || Math.abs(kLead) > Math.abs(kHere) * 1.2)) {
      out.drift = true;
      out.ax = Math.sign(kLead); out.right = kLead > 0; out.left = kLead < 0;
    }
  }

  // ——— 氮气：小喷后面接一瓶是双喷；直道上也可以单放 ———
  const kFar = Math.max(Math.abs(RL.k[(i + 14) % N]), Math.abs(RL.k[(i + 34) % N]), Math.abs(RL.k[(i + 54) % N]));
  const straight = RL.v[(i + 40) % N] > (S.def.vmax / 3.6) * 0.8;
  if (S.miniT > 0.12 && S.nitro > 0 && kFar < 1 / 55) out.nitro = true;
  else if (!S.drifting && S.nitro > 0 && S.miniT <= 0 && S.nitroT <= 0 && A.nitroCd <= 0 && !care && kFar < 1 / 90 && straight) {
    out.nitro = true; A.nitroCd = 1.2;
  }

  // ——— 卡住了（撞墙后顶着墙不走）就叫救援 ———
  A.stuck = v < 1.5 ? A.stuck + dt : 0;
  if (A.stuck > 2.5) { out.reset = true; A.stuck = 0; }
  return out;
}
