// 自行车几何与运动学（纯函数）。坐标系：+Z 前进，+Y 上，+X 为骑手左侧（右手系），传动在右侧（-X）。
import { TAU, clamp } from './mathx.js';

export const SIDE = Object.freeze({ L: 1, R: -1 });

export const BIKE = Object.freeze({
  wheelR: 0.345,      // 轮胎外半径 (m)
  tireR: 0.052,       // 胎截面半径
  rimR: 0.252,        // 轮圈外半径
  hubR: 0.034,
  spokes: 32,
  rearZ: -0.56,       // 后轴
  frontZ: 0.56,       // 前轴
  bb: [0, 0.29, -0.09],        // 中轴 (bottom bracket)
  crank: 0.17,        // 曲柄长
  pedalX: 0.165,      // 踏板中心横向偏移（单侧）
  pedalTop: 0.035,    // 踏板面到曲柄轴的高度
  ringTeeth: 44,
  cogTeeth: 18,
  chainPitch: 0.0127, // 1/2"
  ringX: -0.054,      // 牙盘横向位置（右侧）
  cogX: -0.05,
  saddle: [0, 0.868, -0.265],
  hip: [0.165, 0.925, -0.235],  // 髋关节（单侧 x）
  thigh: 0.39,
  shin: 0.39,
  ankleUp: 0.072,     // 踝关节在踏板轴上方的高度（脚掌厚度）
  ankleBack: 0.012,
  shoulder: [0.17, 1.37, 0.02],
  upperArm: 0.31,
  foreArm: 0.29,
  grip: [0.30, 1.05, 0.265],
  headTubeTop: [0, 1.0, 0.40],
  headTubeBot: [0, 0.78, 0.47],
  forkCrown: [0, 0.775, 0.475],
  stemTop: [0, 1.065, 0.385],
});

/** 链条节圆半径：节距 / (2·sin(π/齿数)) */
export const pitchRadius = (teeth, pitch = BIKE.chainPitch) => pitch / (2 * Math.sin(Math.PI / teeth));
export const RING_R = pitchRadius(BIKE.ringTeeth);
export const COG_R = pitchRadius(BIKE.cogTeeth);

/** 三速花鼓：曲柄转一圈 → 车轮转的圈数 */
export const HUB = Object.freeze([0.75, 1.0, 1.33]);
export const gearRatio = (gear = 1) => (BIKE.ringTeeth / BIKE.cogTeeth) * HUB[clamp(gear | 0, 0, 2)];

/** 曲柄角 θ：0 = 上止点，π/2 = 前方（右侧视角顺时针）。返回踏板轴心。 */
export function pedalPos(side, crank, out = [0, 0, 0]) {
  out[0] = side * BIKE.pedalX;
  out[1] = BIKE.bb[1] + BIKE.crank * Math.cos(crank);
  out[2] = BIKE.bb[2] + BIKE.crank * Math.sin(crank);
  return out;
}
export const cadenceRpm = (speed, gear = 1) => (speed / BIKE.wheelR / gearRatio(gear)) * (60 / TAU);
export const speedForCadence = (rpm, gear = 1) => (rpm * TAU / 60) * BIKE.wheelR * gearRatio(gear);
/** 行进 distance 米时曲柄转过的角度（rad，仅踩踏时累积） */
export const crankAngleForDistance = (distance, gear = 1) => distance / BIKE.wheelR / gearRatio(gear);

/**
 * 链条闭合回路（牙盘平面 z-y）。沿路径前进 = 踩踏时链条运动方向（上链段向前）。
 * 返回分段：线段与顺时针圆弧，以及总长。
 */
export function chainLoop() {
  const [az, ay] = [BIKE.bb[2], BIKE.bb[1]];
  const [bz, by] = [BIKE.rearZ, BIKE.wheelR];
  const r1 = RING_R, r2 = COG_R;
  const ez = bz - az, ey = by - ay, d = Math.hypot(ez, ey);
  const phi = Math.atan2(ey, ez);              // 中轴 → 后轴 方向角
  const theta = Math.acos(clamp((r1 - r2) / d, -1, 1));
  const aTop = phi - theta, aBot = phi + theta; // 公切线半径方向角
  const P = (cz, cy, r, a) => [cz + r * Math.cos(a), cy + r * Math.sin(a)];
  // 顺时针 = 角度递减。牙盘：aTop → aBot；飞轮：aBot → aTop
  let wrap1 = aTop - aBot; if (wrap1 <= 0) wrap1 += TAU;
  let wrap2 = aBot - aTop; if (wrap2 <= 0) wrap2 += TAU;
  const segs = [
    { type: 'line', a: P(bz, by, r2, aTop), b: P(az, ay, r1, aTop) },            // 上链段（后→前，紧边）
    { type: 'arc', c: [az, ay], r: r1, a0: aTop, sweep: -wrap1 },                // 绕牙盘前方
    { type: 'line', a: P(az, ay, r1, aBot), b: P(bz, by, r2, aBot) },            // 下链段（前→后，松边）
    { type: 'arc', c: [bz, by], r: r2, a0: aBot, sweep: -wrap2 },                // 绕飞轮后方
  ];
  for (const s of segs) s.len = s.type === 'line' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : Math.abs(s.sweep) * s.r;
  return { segs, length: segs.reduce((n, s) => n + s.len, 0), wrap1, wrap2, aTop, aBot, r1, r2 };
}

/** 链条上弧长位置 s 处的点（z,y） */
export function chainPoint(loop, s, out = [0, 0]) {
  s = ((s % loop.length) + loop.length) % loop.length;
  for (const seg of loop.segs) {
    if (s <= seg.len + 1e-9) {
      const t = seg.len > 0 ? s / seg.len : 0;
      if (seg.type === 'line') { out[0] = seg.a[0] + (seg.b[0] - seg.a[0]) * t; out[1] = seg.a[1] + (seg.b[1] - seg.a[1]) * t; }
      else { const a = seg.a0 + seg.sweep * t; out[0] = seg.c[0] + seg.r * Math.cos(a); out[1] = seg.c[1] + seg.r * Math.sin(a); }
      return out;
    }
    s -= seg.len;
  }
  const last = loop.segs[loop.segs.length - 1];
  out[0] = last.b ? last.b[0] : last.c[0]; out[1] = last.b ? last.b[1] : last.c[1];
  return out;
}
