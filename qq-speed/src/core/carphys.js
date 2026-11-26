// 街机式赛车物理（QQ飞车的开法）。不依赖 three，可以在 Node 里跑整场比赛来测试。
// 车是平面上的一个刚体：位置、朝向 psi、速度、横摆角速度。速度在车身坐标里拆成纵向 vF 和横向 vL：
//   抓地行驶时 vF 方向就是车头方向，横向的 vL 很快被轮胎“咬住”消掉（时间常数很短）；
//   漂移时横向很滑（时间长），车头转得比速度方向快，尾巴就甩出去了——车头方向和速度方向的夹角就是漂移角。
// 所有喷射技巧都由“按键沿 + 漂移状态”推出来：小喷、双喷、WCW、断位双喷、甩尾、侧身、点漂、集气、氮气。
import { nearest, pointAt, WALL } from './trackdef.js';

const KMH = 1 / 3.6;
const TAU_YAW = 0.06;                      // 横摆角速度跟上目标的时间常数
export const CAR_R = 0.98;                 // 碰撞圆半径
export const CAR_A = 1.30;                 // 前、后两个碰撞圆离车心的距离
const INERTIA = 1.9;                       // 转动惯量（质量取 1）
const NONE = Object.freeze({ up: false, down: false, left: false, right: false, drift: false, nitro: false });
const MINI_CHARGE = 0.13;                  // 一次漂移至少攒够这么多“漂移角 × 时间”才给小喷（点漂太短就没有）。直线上的漂移每秒攒 0.3–0.6，所以大约 0.35 秒起给：短于 0.6 秒的短漂移才接得上断位双喷
const MINI_WINDOW = 0.6;                   // 松开 Shift 后这么多秒内再按 ↑ 才算小喷
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/** 一辆车的全部状态 */
export function createCarState(def, x, z, psi, T) {
  const S = {
    def, x, z, psi, vx: 0, vz: 0, w: 0, steer: 0, steerIn: 0, vF: 0, vL: 0, slip: 0,
    i: -1, e: 0, s: 0, fwd: 1,                                     // 最近的采样号、横向偏移、里程、是否顺行
    drifting: false, driftDir: 0, driftT: 0, charge: 0, sideT: 0, swing: false, driftCut: false, shiftT: 0, driftCd: 0, unwindT: 0,
    gas: 0, nitro: 0, nitroT: 0, miniT: 0, miniWin: 0,
    itemMode: false, spinT: 0, spinRate: 0, shieldT: 0, magnetT: 0,                    // 道具赛：被道具打转、天使护体、磁铁吸附
    hit: 0, scrape: 0, pin: { up: 0, drift: 0, nitro: 0 },
  };
  if (T) locateCar(S, T);                                              // 记下自己在赛道的哪个位置（里程、离路中的偏移）
  return S;
}

/** 查一次车在赛道上的位置 */
export function locateCar(S, T) {
  const n = nearest(T, S.x, S.z, S.i);
  S.i = n.i; S.e = n.e; S.s = n.s;
  return n;
}

/**
 * 推进一步。inp：{ up, down, left, right, drift, nitro }（电平）。发生的事情（起喷、撞墙……）推进 ev。
 * @returns {number} 本步之后车沿路面的里程
 */
export function stepCar(S, inp, T, dt, ev = []) {
  const D = S.def, P = S.pin;
  S.shieldT = Math.max(0, S.shieldT - dt); S.magnetT = Math.max(0, S.magnetT - dt);
  if (S.spinT > 0) inp = NONE;                                                         // 被打转：这段时间不收任何操作
  if (S.i < 0) { const n0 = nearest(T, S.x, S.z, -1); S.i = n0.i; S.e = n0.e; S.s = n0.s; }        // 刚放上赛道：先找到自己在哪
  S.driftCd = Math.max(0, S.driftCd - dt);
  S.unwindT = Math.max(0, S.unwindT - dt);
  const upEdge = !!inp.up && !P.up, nitroEdge = !!inp.nitro && !P.nitro, driftRel = !inp.drift && P.drift;
  S.inpUp = !!inp.up; S.inpDown = !!inp.down;                                     // 给画面、声音用：尾灯、引擎
  P.up = inp.up ? 1 : 0; P.drift = inp.drift ? 1 : 0; P.nitro = inp.nitro ? 1 : 0;
  S.shiftT = inp.drift ? S.shiftT + dt : 0;
  S.hit = Math.max(0, S.hit - dt * 2.5);
  S.scrape = Math.max(0, S.scrape - dt * 6);

  const c = Math.cos(S.psi), sn = Math.sin(S.psi);
  let vF = S.vx * c + S.vz * sn, vL = -S.vx * sn + S.vz * c;              // 车身坐标：前为正、右为正
  const sgn = vF >= 0 ? 1 : -1;
  const st = inp.ax !== undefined ? clamp(inp.ax, -1, 1) : (inp.right ? 1 : 0) - (inp.left ? 1 : 0);      // 玩家按方向键；电脑车手可以直接给 −1..1
  S.steerIn = st;
  S.steer += (st - S.steer) * (1 - Math.exp(-dt / (st ? 0.085 : 0.06)));

  // ——— 漂移：方向 + Shift。Shift 比方向键先按下 = 甩尾；漂移中按反方向 = 侧身 ———
  if (!S.drifting && inp.drift && st !== 0 && vF > 6 && S.driftCd <= 0 && S.spinT <= 0) {
    S.drifting = true; S.driftDir = Math.sign(st); S.driftT = 0; S.charge = 0; S.sideT = 0;
    S.swing = S.shiftT > 0.09;
    S.psi += st * (S.swing ? 0.36 : 0.23);                       // 车头猛地一甩：车头和速度方向之间立刻出现漂移角（只转车头，不凭空加速）
    S.w += st * (S.swing ? 0.7 : 0.4);
    ev.push({ type: S.swing ? 'swing' : 'drift', dir: st });
  }
  const side = S.drifting && st * S.driftDir < -0.5;                  // 反方向踩过半 = 侧身漂移
  if (S.drifting && (driftRel || vF < 4)) {
    S.drifting = false;
    S.unwindT = driftRel ? 0.42 : 0;                              // 松开 Shift：车身顺着行进方向摆正
    S.driftCd = 0.26;                                         // 刚收漂移不能马上再起：连点 Shift 刷不出来速度
    S.driftCut = S.driftT < 0.6;
    const ok = driftRel && vF >= 4 && S.charge >= MINI_CHARGE && !S.itemMode;              // 道具赛里漂移只管过弯，没有小喷
    if (ok) S.miniWin = MINI_WINDOW;
    ev.push({ type: 'driftEnd', ok, cut: S.driftCut, long: S.driftT > 1.7, side: S.sideT > 0.25 });
  }

  // ——— 横摆：抓地时受横向加速度上限约束（速度越快越转不动）；漂移时车头转得又快又多 ———
  const spd = Math.abs(vF), vTot = Math.hypot(vF, vL);
  let wT, tau;
  if (S.drifting) {
    const wMax = Math.min(D.yaw * 1.15, (D.aLat * 1.5 * D.driftGrip) / Math.max(6, vTot));          // 横向加速度有上限：甩得越快越转不动
    const hold = st * S.driftDir;                                                                        // 同方向按住 = 收紧，松开 = 正常，反方向 = 侧身（甩得宽、转得缓）
    wT = S.driftDir * wMax * (1 + 0.26 * Math.max(0, hold) - 0.64 * Math.max(0, -hold));
    tau = D.tauDrift * 0.62 * (side ? 1.35 : 1);                        // 稳态漂移角 ≈ 横摆角速度 × tau：低速甩得开，高速漂起来车身更顺
    if (side) { vL -= S.driftDir * spd * 0.55 * dt; S.sideT += dt; }
    S.driftT += dt;
    S.charge += Math.atan2(Math.abs(vL), Math.max(5, spd)) * dt * (S.swing ? 1.2 : 1);
  } else if (S.spinT > 0) {
    S.spinT -= dt; wT = S.spinRate; tau = 0.1;                                         // 打转：车头连转两圈
  } else {
    wT = S.steer * Math.min(D.yaw, D.aLat / Math.max(3, spd)) * sgn * Math.min(1, spd / 4);
    tau = 0.11;
  }
  S.w += (wT - S.w) * (1 - Math.exp(-dt / TAU_YAW));
  S.psi += S.w * dt;

  // 车头转过去了，速度还按原方向走：在新车身坐标里重新分解，速度方向和车头之间就有了一个漂移角 beta。
  // 轮胎的抓地让速度方向朝车头转过去（beta 按时间常数 tau 衰减），速度大小基本不变，只是摆着走会磨掉一点。
  const c2 = Math.cos(S.psi), sn2 = Math.sin(S.psi);
  const wx = c * vF - sn * vL, wz = sn * vF + c * vL;                // 世界坐标里的速度不变
  const sp2 = Math.hypot(vF, vL), beta = Math.atan2(-wx * sn2 + wz * c2, wx * c2 + wz * sn2);   // 在新车身坐标里的漂移角：车头转过去了，速度还没跟上
  const dBeta = beta * (1 - Math.exp(-dt / tau));                     // 这一步要消掉的漂移角
  // 平时是轮胎把速度方向拉向车头（share = 1：打方向车就转）；刚收漂移的那一下反过来，车身摆回行进方向（share 小），只顺带再多转一点
  const share = S.unwindT > 0 ? 0.3 : 1, rot = -dBeta * share, cr = Math.cos(rot), sr = Math.sin(rot), keep = 1 - 0.04 * Math.abs(dBeta);
  const wx2 = (wx * cr - wz * sr) * keep, wz2 = (wx * sr + wz * cr) * keep;
  S.psi += dBeta * (1 - share);
  const c3 = Math.cos(S.psi), sn3 = Math.sin(S.psi);
  vF = wx2 * c3 + wz2 * sn3;
  vL = -wx2 * sn3 + wz2 * c3;

  // ——— 纵向：油门、刹车、倒车、滑行；氮气和小喷抬高极速并给一段强加速 ———
  const skill = S.skill ?? 1;
  let cap = D.vmax * KMH * skill, acc = 0;
  if (S.nitroT > 0) { S.nitroT -= dt; cap += D.nitroPlus * KMH; acc = 19 * skill; }
  if (S.miniT > 0) { S.miniT -= dt; cap += D.miniPlus * KMH * (S.nitroT > 0 ? 0.7 : 1); acc = Math.max(acc, 15 * skill); }
  if (S.magnetT > 0) { cap += 13; acc = Math.max(acc, 16); }                           // 磁铁：被前面的车吸着跑
  if (S.drifting) vF -= (1.4 + Math.abs(vL) * (side ? 0.2 : 0.11)) * dt * (inp.up ? 1 : 2.2);
  if (acc > 0) vF += acc * (1 - Math.pow(clamp(vF / cap, 0, 1), 3)) * dt;
  else if (S.spinT > 0) vF -= vF * Math.min(1, 3.2 * dt);
  else if (inp.up) vF += D.accel * skill * (vF < cap ? 1 - Math.pow(Math.max(0, vF) / cap, 2.4) : -0.6) * dt;
  else if (inp.down) { if (vF > 0.6) vF -= 26 * dt; else vF = Math.max(vF - 7.5 * dt, -9); }
  else vF -= Math.sign(vF) * Math.min(Math.abs(vF) / dt, 4.0 + 0.004 * vF * vF) * dt;           // 松油门：发动机刹车 + 风阻，很快就把速度掉下来

  // ——— 集气：漂移角越大、甩得越久，气越多。攒满一格换一瓶氮气（最多两瓶） ———
  if (S.drifting && !S.itemMode) {
    S.gas += (Math.abs(vL) / 52) * dt * D.gas * (side ? 1.25 : 1);
    if (S.gas >= 1) {
      if (S.nitro < 2) { S.nitro++; S.gas -= 1; ev.push({ type: 'gasFull' }); } else S.gas = 1;
    }
  }

  // ——— 小喷 / 双喷 / WCW ———
  if (S.miniWin > 0) {
    S.miniWin -= dt;
    if (upEdge) {                                                   // 松开 Shift 后重新按 ↑
      S.miniWin = 0; S.miniT = D.miniTime;
      if (S.nitroT > 0) { S.nitroT += 0.45; ev.push({ type: 'wcw' }); }              // 氮气还在喷：W-C-W
      else ev.push({ type: 'mini', cut: S.driftCut });
    }
  }
  if (nitroEdge && S.nitro > 0 && S.nitroT <= 0.2 && !S.itemMode) {                     // 道具赛里氮气只能从道具来
    S.nitro--; S.nitroT = D.nitroTime;
    if (S.miniT > 0) { S.nitroT += 0.5; S.miniT += 0.1; ev.push({ type: S.driftCut ? 'cutDouble' : 'double' }); }   // 小喷还在喷：双喷 / 断位双喷
    else ev.push({ type: 'nitro' });
  }

  const spTot = Math.hypot(vF, vL), hard = (D.vmax + D.nitroPlus + D.miniPlus) * KMH * skill * 1.04;
  if (spTot > hard) { vF *= hard / spTot; vL *= hard / spTot; }      // 任何情况下都超不过“极速 + 氮气 + 小喷”
  S.vF = vF; S.vL = vL;
  S.vx = c3 * vF - sn3 * vL;
  S.vz = sn3 * vF + c3 * vL;
  S.x += S.vx * dt;
  S.z += S.vz * dt;
  S.slip = Math.atan2(-vL, Math.abs(vF) + 2) * sgn;

  walls(S, T, ev, dt);
  const n = nearest(T, S.x, S.z, S.i);
  S.i = n.i; S.e = n.e; S.s = n.s;
  if (!Number.isFinite(S.x + S.z + S.psi + S.vx + S.vz)) resetCar(S, T);                 // 数值万一坏了：直接把车放回赛道上
  return n.s;
}

/** 墙：前、后两个碰撞圆各自查一次离墙的距离。撞上就沿墙的法线弹回并损失速度；蹭墙只掉一点速度 */
function walls(S, T, ev, dt) {
  const c = Math.cos(S.psi), sn = Math.sin(S.psi);
  for (const a of [CAR_A, -CAR_A]) {
    const px = S.x + c * a, pz = S.z + sn * a;
    const n = nearest(T, px, pz, S.i);
    const lim = T.hw[n.i] + WALL - CAR_R;
    const over = Math.abs(n.e) - lim;
    if (over <= 0) continue;
    const sg = n.e > 0 ? 1 : -1, th = T.th[n.i];
    const nx = sg * Math.sin(th), nz = -sg * Math.cos(th);          // 墙的内法线（指向路面）
    S.x += nx * over; S.z += nz * over;
    const rx = c * a, rz = sn * a;
    const into = -((S.vx - S.w * rz) * nx + (S.vz + S.w * rx) * nz); // 探测点朝墙里的速度
    if (into > 0.25) {
      const J = ((1 + (into > 5 ? 0.28 : 0)) * into) / (1 + (a * a) / INERTIA);
      S.vx += J * nx; S.vz += J * nz;
      S.w = clamp(S.w * 0.6 + ((rx * nz - rz * nx) * J) / INERTIA, -4.5, 4.5);      // 撞完不许疯转
      const loss = into > 4 ? 1 - 0.34 * Math.min(1, into / 16) : 1 - 0.05 * Math.min(1, into / 4);
      S.vx *= loss; S.vz *= loss;
      S.hit = Math.max(S.hit, Math.min(1, into / 14));
      ev.push({ type: into > 4 ? 'hit' : 'bump', power: into, x: px, z: pz, nx, nz });
    } else {
      S.vx *= 1 - 0.5 * dt; S.vz *= 1 - 0.5 * dt;                    // 蹭着墙滑
      S.scrape = 1;
      ev.push({ type: 'scrape', x: px, z: pz, nx, nz });
    }
  }
}

/** 两辆车相撞：当作两个圆，推开、按恢复系数交换法向速度 */
export function collideCars(a, b, ev = []) {
  const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), R = 2.0;
  if (d >= R || d < 1e-4) return false;
  const nx = dx / d, nz = dz / d, pen = R - d;
  a.x -= nx * pen * 0.5; a.z -= nz * pen * 0.5;
  b.x += nx * pen * 0.5; b.z += nz * pen * 0.5;
  const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
  if (rel >= 0) return true;
  const j = -rel * 0.72;
  a.vx -= j * nx; a.vz -= j * nz;
  b.vx += j * nx; b.vz += j * nz;
  a.w += (a.drifting ? 0.25 : 0.08) * -Math.sign(nz * Math.cos(a.psi) - nx * Math.sin(a.psi));
  b.w += (b.drifting ? 0.25 : 0.08) * Math.sign(nz * Math.cos(b.psi) - nx * Math.sin(b.psi));
  if (-rel > 3.5) ev.push({ type: 'bumpCar', power: -rel, a, b, x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 });
  return true;
}

/** 回到赛道上：停在最近的采样点、车头顺着赛道、速度清零 */
export function resetCar(S, T) {
  const i = S.i >= 0 ? S.i : 0, lim = Math.max(1, T.hw[i] + WALL - 2.4);
  const p = pointAt(T, i, clamp(S.e, -lim, lim));
  S.x = p[0]; S.z = p[1]; S.psi = T.th[i];
  S.vx = S.vz = S.w = S.vF = S.vL = 0; S.steer = 0;
  S.drifting = false; S.miniWin = 0; S.nitroT = 0; S.miniT = 0; S.spinT = 0; S.magnetT = 0;
}
