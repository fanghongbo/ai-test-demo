// 机器人的脑子（纯逻辑，不依赖 three，可在 Node 里测试）：感知（视线 / 视场 / 听觉）、决策（游走 / 追击 / 交战 / 撤退）、瞄准误差、开火节奏。
// 每帧进来一次，返回这一帧想做的事；真正的转向、移动、开火由游戏层执行。
import { DEG, DIFFICULTY } from '../core/config.js';
import { mulberry32, wrapAngle, clamp } from '../core/mathx.js';

/** 各类武器理想的对峙距离：[太近, 太远] */
const IDEAL = { rifle: [7, 24], sniper: [24, 60], pistol: [4, 12], melee: [0, 1.8] };

export function createBrain(seed, diffId = 'normal') {
  const r = mulberry32(seed);
  return {
    diff: DIFFICULTY[diffId] || DIFFICULTY.normal, rand: r, phase: r() * 6.28, mode: 'roam', target: null, reactAt: 0, aimT: -9,
    seenX: 0, seenZ: 0, seenT: -9, path: null, pathI: 0, goal: null, thinkT: r() * 0.2, replanT: 0, lastPlan: -9,
    burst: 0, pause: 0, lastShot: 0, strafe: r() < 0.5 ? -1 : 1, strafeT: r(), crouchOn: false, coverT: 0,
    susX: 0, susZ: 0, susT: -9, lastNoise: 0, errY: 0, errP: 0, lx: 0, lz: 0, stuckT: 0,
  };
}

function plan(b, c, x, z) {
  b.path = c.nav.findPath(c.self.body.x, c.self.body.z, x, z);
  b.pathI = 0;
  b.goal = b.path ? [x, z] : null;
  b.replanT = 5 + b.rand() * 3;
  return !!b.path;
}
function pickRoamGoal(b, c) {
  const r = b.rand, now = c.now;
  let x, z;
  if (now - b.susT < 7) { x = b.susX + (r() - 0.5) * 2; z = b.susZ + (r() - 0.5) * 2; }
  else {
    let k = r() * c.spots.reduce((n, p) => n + p[2], 0);
    for (const p of c.spots) { k -= p[2]; if (k <= 0) { x = p[0] + (r() - 0.5) * 3; z = p[1] + (r() - 0.5) * 2.4; break; } }
  }
  if (!plan(b, c, x ?? 0, z ?? 0)) { b.susT = -9; return plan(b, c, (r() - 0.5) * 40, (r() - 0.5) * 12); }
  return true;
}
/** 找一个离敌人看不见、又走得到的位置（掩体） */
function findCover(b, c, o) {
  const s = c.self, nav = c.nav, ci = Math.round((s.body.x - nav.X0) / nav.cell), cj = Math.round((s.body.z - nav.Z0) / nav.cell);
  let best = null, bd = 1e9;
  for (let j = Math.max(0, cj - 11); j <= Math.min(nav.nz - 1, cj + 11); j++) for (let i = Math.max(0, ci - 11); i <= Math.min(nav.nx - 1, ci + 11); i++) {
    if (!nav.walk[j * nav.nx + i]) continue;
    const x = nav.X0 + i * nav.cell, z = nav.Z0 + j * nav.cell, d = Math.hypot(x - s.body.x, z - s.body.z);
    if (d < 2.5 || d > 12 || d >= bd) continue;
    if (c.world.los(x, 1.3, z, o.body.x, o.body.y + o.eyeH * 0.86, o.body.z)) continue;
    if (!c.world.corridorFree(s.body.x, s.body.z, x, z, 0.5)) continue;
    best = [x, z]; bd = d;
  }
  return best && plan(b, c, best[0], best[1]) ? best : null;
}

/**
 * @param b createBrain 的脑子
 * @param c { now, dt, self, actors, world, nav, spots, noises }
 * @returns { fire, ads, reload, crouch, mx, mz, yaw, pitch, sees }   mx / mz：世界坐标里的移动方向；yaw / pitch：想看的方向
 */
export function botThink(b, c) {
  const s = c.self, body = s.body, d = b.diff, r = b.rand, now = c.now, dt = c.dt;
  const out = { fire: false, ads: false, reload: false, crouch: false, mx: 0, mz: 0, yaw: s.yaw, pitch: s.pitch, sees: false };
  if (!s.alive) return out;

  // ———————— 感知：视场里、没有被东西挡住的最近敌人 ————————
  let best = null, bestD = 1e9;
  const eyeS = body.y + s.eyeH;
  for (const o of c.actors) {
    if (o === s || !o.alive || o.team === s.team) continue;
    const dx = o.body.x - body.x, dz = o.body.z - body.z, dist = Math.hypot(dx, dz);
    if (dist > 72 || dist >= bestD) continue;
    if (Math.abs(wrapAngle(Math.atan2(dz, dx) - s.yaw)) > d.fov * DEG * 0.5 && dist > 3.2) continue;
    if (!c.world.los(body.x, eyeS, body.z, o.body.x, o.body.y + o.eyeH * 0.86, o.body.z)) continue;
    best = o; bestD = dist;
  }
  for (const n of c.noises) {                                        // 听觉：枪声、脚步
    if (n.t <= b.lastNoise || n.team === s.team || n.owner === s) continue;
    b.lastNoise = n.t;
    if (n.t > now - 0.5 && Math.hypot(n.x - body.x, n.z - body.z) < d.hear * n.loud && b.mode !== 'engage' && b.mode !== 'retreat') { b.susX = n.x; b.susZ = n.z; b.susT = now; b.path = null; b.goal = null; }
  }
  if (best) {
    if (b.target !== best || now - b.seenT > 3) {                     // 刚发现（或者跟丢了很久又看到）：从这一刻起算反应时间，先甩一个大偏差再收敛
      b.reactAt = now + d.react * (0.7 + r() * 0.7); b.aimT = now;
      b.errY = (r() * 2 - 1) * d.err * 2.2 * DEG; b.errP = (r() * 2 - 1) * d.err * 1.2 * DEG;
      b.burst = 0; b.pause = 0;
    }
    b.target = best; b.seenT = now; out.sees = true;
    if (b.mode !== 'retreat') b.mode = 'engage';
  } else if (b.target && now - b.seenT < 6 && b.target.alive) {
    if (b.mode === 'engage') { b.mode = 'chase'; b.path = null; b.seenX = b.target.body.x; b.seenZ = b.target.body.z; }
  } else { b.target = null; if (b.mode !== 'retreat') b.mode = 'roam'; }

  // ———————— 降频的决策 ————————
  const w = s.w, kind = w.def.kind;
  b.thinkT -= dt; b.strafeT -= dt; b.replanT -= dt;
  if (b.strafeT <= 0) { b.strafe = r() < 0.5 ? -1 : 1; b.strafeT = 0.45 + r() * 0.9; }
  if (b.thinkT <= 0) {
    b.thinkT = 0.12 + r() * 0.1;
    if (out.sees) {
      const o = b.target;
      const settle = clamp(1 - (now - b.aimT) / 1.5, 0.3, 1), moving = Math.hypot(body.vx, body.vz) > 1.6 ? 1.45 : 1, tgtMoving = Math.hypot(o.body.vx, o.body.vz) > 1.6 ? 1.3 : 1;
      const amp = d.err * settle * moving * tgtMoving * (s.crouch ? 0.7 : 1) * (w.ads > 0.5 ? 0.72 : 1) * (b.mode === 'retreat' ? 1.6 : 1) * (kind === 'sniper' ? 0.8 : 1);
      b.errY = (r() * 2 - 1) * amp * DEG;
      b.errP = (r() * 2 - 1) * amp * 0.55 * DEG;
      b.crouchOn = kind === 'sniper' ? true : r() < 0.2 ? !b.crouchOn : b.crouchOn;
      if (s.hp < 34 && now - s.lastHit < 1.3 && b.mode === 'engage' && (w.ammo < w.def.mag * 0.5 || r() < 0.3)) {   // 撤到掩体后面
        if (findCover(b, c, o)) { b.mode = 'retreat'; b.coverT = now + 1.8 + r() * 1.5; }
      }
      if (Math.hypot(body.x - b.lx, body.z - b.lz) < 0.03 && (out.mx || out.mz)) b.stuckT += b.thinkT; else b.stuckT = 0;
      b.lx = body.x; b.lz = body.z;
      if (b.stuckT > 0.7) { b.strafe = -b.strafe; b.stuckT = 0; }
    }
  }

  // ———————— 看得见敌人：瞄准、走位、开火 ————————
  if (out.sees) {
    const o = b.target, dx = o.body.x - body.x, dz = o.body.z - body.z, dist = Math.max(bestD, 0.01), ux = dx / dist, uz = dz / dist;
    out.yaw = Math.atan2(dz, dx) + b.errY;
    out.pitch = Math.atan2(o.body.y + o.eyeH * 0.8 - (body.y + s.eyeH), dist) + b.errP;
    out.ads = dist > 9 && kind !== 'melee';
    out.crouch = !!b.crouchOn && kind !== 'melee';
    if (b.mode === 'engage') {                                       // 保持距离 + 左右横移
      const [near, far] = IDEAL[kind] || IDEAL.rifle, fwd = dist > far ? 1 : dist < near ? -1 : 0, sk = kind === 'sniper' ? 0.35 : 0.85;
      out.mx = ux * fwd - uz * b.strafe * sk; out.mz = uz * fwd + ux * b.strafe * sk;
      if (w.reload > 0) { out.mx *= 0.35; out.mz *= 0.35; }
    }
    if (b.pause > 0) b.pause -= dt;
    const yawOk = Math.abs(wrapAngle(out.yaw - s.yaw)) < 0.04 + 0.9 / dist, pitchOk = Math.abs(out.pitch - s.pitch) < 0.06;
    if (kind === 'melee') out.fire = dist < 1.7 && yawOk;
    else if (b.pause <= 0 && yawOk && pitchOk && now >= b.reactAt && w.ammo > 0 && w.reload <= 0 && w.bolt <= 0 && w.draw <= 0.05) {
      out.fire = true;
      if (w.shot !== b.lastShot) {                                   // 数着自己打出去的子弹，一段一段地打
        b.lastShot = w.shot; b.burst++;
        const maxB = kind === 'sniper' ? 1 : kind === 'pistol' ? 3 : d.burst;
        if (b.burst >= maxB) { b.burst = 0; b.pause = (kind === 'sniper' ? 0.55 : kind === 'pistol' ? 0.22 : 0.16) + r() * (kind === 'sniper' ? 0.7 : 0.42); }
      }
    }
    if (w.ammo <= 0 && w.reload <= 0 && w.reserve > 0) out.reload = true;
    else if (w.ammo <= 0 && w.reserve <= 0 && kind !== 'melee') out.swap = true;
  }

  // ———————— 不是在对峙：沿路走（追击 / 游走 / 撤退） ————————
  if (b.mode !== 'engage') {
    if (b.mode === 'chase' && !b.path && now - b.lastPlan > 0.6) { b.lastPlan = now; if (!plan(b, c, b.seenX, b.seenZ)) b.mode = 'roam'; }
    if (b.mode === 'roam' && !b.path && !b.goal) pickRoamGoal(b, c);
    if (b.mode === 'retreat' && (!b.path || now > b.coverT + 3 || (w.ammo > 0 && w.reload <= 0 && now > b.coverT))) b.mode = out.sees ? 'engage' : 'roam';
    if (b.path && b.pathI < b.path.length) {
      while (b.pathI < b.path.length - 1 && Math.hypot(b.path[b.pathI][0] - body.x, b.path[b.pathI][1] - body.z) < 0.75) b.pathI++;
      const p = b.path[b.pathI], ddx = p[0] - body.x, ddz = p[1] - body.z, l = Math.hypot(ddx, ddz) || 1;
      out.mx = ddx / l * (out.sees ? 0.9 : 1); out.mz = ddz / l * (out.sees ? 0.9 : 1);
      if (!out.sees) {
        const q = b.path[Math.min(b.pathI + 1, b.path.length - 1)];
        out.yaw = Math.atan2(q[1] - body.z, q[0] - body.x) + Math.sin(now * 1.3 + b.phase) * 0.32;
        out.pitch = -0.02 + Math.sin(now * 0.7 + b.phase) * 0.03;
      }
      if (l < 0.6 && b.pathI >= b.path.length - 1) { b.path = null; b.goal = null; }
    } else if (!out.sees) {
      out.yaw = s.yaw + dt * 0.9 * Math.sin(now * 0.5 + b.phase);    // 到了地方：四下扫视
      out.pitch = -0.02;
      if (b.mode === 'chase') { b.mode = 'roam'; b.target = null; }
      if (b.mode === 'roam' && now - b.susT < 7 && Math.hypot(b.susX - body.x, b.susZ - body.z) < 2.5) b.susT = -9;
    }
    if (w.ammo <= 0 && w.reload <= 0 && w.reserve > 0) out.reload = true;
  }
  return out;
}
