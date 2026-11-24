// 骑行仿真：速度（权威状态）→ 踏频 / 曲柄角 / 车轮角 / 链条位移。纯逻辑，可 Node 测试。
import { TAU, clamp, damp } from './mathx.js';
import { BIKE, gearRatio } from './bike.js';

export const G = 9.81;
export const MAX_SPEED = 12.5;          // 45 km/h
export const MODE = Object.freeze({ STOP: 'stop', PEDAL: 'pedal', COAST: 'coast', BRAKE: 'brake' });

export function createRide(opts = {}) {
  return {
    v: opts.v ?? 0,                     // 速度 m/s
    target: opts.target ?? opts.v ?? 0, // 目标速度
    mode: (opts.v ?? 0) > 0.05 ? MODE.PEDAL : MODE.STOP,
    crank: opts.crank ?? Math.PI * 0.5, // 曲柄角
    crankVel: 0,                        // rad/s
    wheel: 0,                           // 车轮累计转角 rad
    crankTravel: 0,                     // 踩踏累计里程（驱动曲柄）
    distance: 0,
    gear: opts.gear ?? 1,
    slope: 0,                           // 路面坡度（tan），正值上坡
    air: false, airY: 0, airVy: 0, airTime: 0, landImpact: 0, jumpCooldown: 0,
    accel: 0,                           // 最近一步的纵向加速度（用于身体惯性表现）
    time: 0,
    pedalPower: 0,                      // 0..1 踩踏用力程度（音画联动）
    stats: { topSpeed: 0, jumps: 0, coastTime: 0, time: 0 },
  };
}

/**
 * 推进一步。
 * @param {ReturnType<createRide>} s
 * @param {number} dt 秒（建议 ≤ 1/30，内部不做细分）
 * @param {{target?:number, jump?:boolean, gear?:number, slope?:number}} input
 * @returns {Array<{type:string, [k:string]:number}>} 本步产生的事件
 */
export function stepRide(s, dt, input = {}) {
  const events = [];
  dt = Math.min(Math.max(dt, 0), 0.1);
  if (input.gear !== undefined && input.gear !== s.gear) { s.gear = clamp(input.gear | 0, 0, 2); events.push({ type: 'shift', gear: s.gear }); }
  if (input.target !== undefined) s.target = clamp(input.target, 0, MAX_SPEED);
  if (input.slope !== undefined) s.slope = clamp(input.slope, -0.14, 0.14);
  s.jumpCooldown = Math.max(0, s.jumpCooldown - dt);

  // —— 跳跃（独立于水平速度的竖直运动）——
  if (input.jump && !s.air && s.jumpCooldown <= 0) {
    s.air = true; s.airVy = 4.4; s.airTime = 0; s.jumpCooldown = 0.25; s.stats.jumps++;
    events.push({ type: 'jump', v: s.v });
  }
  if (s.air) {
    s.airTime += dt;
    s.airVy -= G * dt;
    s.airY += s.airVy * dt;
    if (s.airY <= 0) {
      events.push({ type: 'land', impact: -s.airVy, v: s.v });
      s.landImpact = -s.airVy; s.airY = 0; s.airVy = 0; s.air = false;
    }
  } else s.landImpact = 0;

  // —— 纵向：目标速度 + 惯性 + 坡度 ——
  const prevV = s.v;
  let a = 0;
  const diff = s.target - s.v;
  // 踩踏加速度：与速度差成正比并随车速衰减 → 起步有力、接近目标时平滑收敛（无挡位跳变）
  const pedalAccel = (need) => 0.62 * need * (1 - 0.6 * s.v / MAX_SPEED) * (s.air ? 0 : 1);
  let mode;
  if (s.target <= 0.03 && s.v <= 0.03) mode = MODE.STOP;
  else if (diff > 0.06) mode = MODE.PEDAL;          // 需要加速：踩踏
  else if (diff < -1.3 || (s.target <= 0.03 && s.v > 0.03)) mode = MODE.BRAKE; // 明显高于目标 / 目标为 0：刹车
  else if (diff < -0.06) mode = MODE.COAST;         // 略高于目标：滑行自然减速
  else mode = MODE.PEDAL;                           // 定速巡航：平路保持踩踏，让腿部持续可读
  if (mode === MODE.COAST && s.v <= s.target + 0.03) mode = MODE.PEDAL; // 滑行已到目标速度 → 恢复踩踏
  if (mode === MODE.PEDAL && diff <= 0.06) {
    const over = s.v - s.target;                    // 巡航中由坡度造成的偏离
    if (over > 0.25) mode = MODE.COAST;             // 下坡超速 → 停脚滑行
    else {
      a += diff > 0 ? pedalAccel(diff) : diff * 1.1; // 巡航：略低轻踩，略高轻带一点阻力
      if (over < -0.25) a += pedalAccel(-over);     // 上坡掉速 → 更用力踩
    }
  }
  if (mode === MODE.PEDAL && diff > 0.06) a += pedalAccel(diff);
  if (mode === MODE.COAST) a -= 0.55;               // 风阻 + 滚阻
  if (mode === MODE.BRAKE) a -= 4.2;
  a += -G * s.slope * (mode === MODE.BRAKE ? 0.35 : 0.9);
  if (mode === MODE.BRAKE && a < -5.5) a = -5.5;
  s.mode = mode;
  s.v = Math.min(Math.max(s.v + a * dt, 0), MAX_SPEED);
  if (s.v <= 0.02 && s.target <= 0.03) { s.v = 0; s.mode = MODE.STOP; }
  s.accel = dt > 0 ? (s.v - prevV) / dt : 0;

  // —— 传动学：速度是权威，曲柄/车轮/链条由它导出 ——
  if (s.mode === MODE.PEDAL && s.v > 0.02 && !s.air) {
    s.crankVel = s.v / (BIKE.wheelR * gearRatio(s.gear));
    const dc = s.crankVel * dt;
    s.crank = (s.crank + dc) % TAU;
    s.crankTravel += s.v * dt;
    s.pedalPower = clamp(0.35 + Math.max(a, 0) * 0.5 + s.slope * 3 + diff * 0.2, 0.15, 1);
  } else {
    s.crankVel = 0;
    // 滑行/停车：踏板回到水平（3 点 / 9 点），像真实骑手那样把脚放平
    const flat = Math.round((s.crank - Math.PI / 2) / Math.PI) * Math.PI + Math.PI / 2;
    const next = s.crank + (((flat - s.crank + Math.PI) % TAU + TAU) % TAU - Math.PI) * (1 - Math.exp(-7 * dt));
    s.crank = (next + TAU) % TAU;
    s.pedalPower = 0;
  }
  s.wheel += s.v * dt / BIKE.wheelR;
  s.distance += s.v * dt;
  s.time += dt; s.stats.time += dt;
  if (s.v > s.stats.topSpeed) s.stats.topSpeed = s.v;
  if (s.mode === MODE.COAST) s.stats.coastTime += dt;
  return events;
}

export const modeLabel = { stop: '停车', pedal: '踩踏', coast: '滑行', brake: '刹车' };

/** 平滑的目标速度辅助（按键用） */
export function nudgeTarget(s, deltaKmh) { s.target = clamp(s.target + deltaKmh / 3.6, 0, MAX_SPEED); return s.target; }
export { damp };
