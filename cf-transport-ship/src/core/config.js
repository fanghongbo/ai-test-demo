// 运输船：地图布局、武器数值、对局规则。全部是纯数据（可被 Node 测试直接读取），世界构建、碰撞、寻路都从这里取。
// 坐标：X 沿船身（船头在 +X），Y 向上（主甲板面 = 0），Z 横跨船身（雷达图的上方 = -Z）。单位：米。
// 布局按游戏内雷达俯视图换算（约 0.19 m / 像素）：两端出生舱、两条侧通道、中间集装箱场。
export const DEG = Math.PI / 180;

export const L = Object.freeze({
  deckX: 25.5,          // 主甲板两端舱壁的 |X|
  deckZ: 7.7,           // 主甲板半宽（两侧舷侧舱室的内墙面）
  tunZ0: 7.9, tunZ1: 10.1,   // 侧通道净空的 |Z| 范围（宽 2.2 m）
  houseZ: 10.6,         // 舷侧舱室外皮（也是出生舱的半宽）
  cabinX: 31.5,         // 出生舱外端 |X|
  houseH: 7.2,          // 舷侧舱室（含主甲板两侧的高墙）高度
  tunH: 2.9,            // 通道净高
  cabinH: 3.3,          // 出生舱净高
  doorZ: 3.6,           // 出生舱通向主甲板的门洞半宽
  contH: 2.59,          // 集装箱高
  contW: 2.44,          // 集装箱宽
  seaY: -9.6,           // 海面高度
});

/** 集装箱：中心 (x, z)，长轴方向 yaw（弧度，从 +X 转向 +Z），len 6.06 = 20 尺、3.0 = 10 尺，stack = 叠放层数 */
export const CONTAINERS = Object.freeze([
  { x: -19.85, z: -1.60, len: 6.06, yaw: Math.PI / 2, color: 'green', stack: 2 },     // 左列：贴左的 20 尺
  { x: -13.15, z: 4.60, len: 6.06, yaw: 0, color: 'blue', stack: 1 },                 // 左“靴形”的脚
  { x: -11.70, z: 0.37, len: 6.06, yaw: Math.PI / 2, color: 'green', stack: 1 },      // 左“靴形”的腿（可经木箱爬上顶）
  { x: -5.80, z: 1.05, len: 3.0, yaw: 0, color: 'grey', stack: 1 },                   // 中路偏左的 10 尺箱
  { x: -0.95, z: -3.90, len: 6.06, yaw: 39.5 * DEG, color: 'olive', stack: 1 },       // 中央斜箱（北）
  { x: 0.57, z: 3.60, len: 6.06, yaw: 39.5 * DEG, color: 'green', stack: 1 },         // 中央斜箱（南）
  { x: 11.33, z: 0.45, len: 6.06, yaw: 0, color: 'blue', stack: 1 },                  // 右“L 形”的脚
  { x: 10.25, z: -3.30, len: 6.06, yaw: Math.PI / 2, color: 'grey', stack: 1 },       // 右“L 形”的腿
  { x: 19.85, z: 1.90, len: 6.06, yaw: Math.PI / 2, color: 'green', stack: 2 },       // 右列
  { x: 24.05, z: -1.7, len: 6.06, yaw: Math.PI / 2, color: 'olive', stack: 2 },       // 贴右墙，给船头舱的门洞让出 2.3 m
]);

/** 木箱 / 铁箱：轴对齐。w 沿 X、d 沿 Z、h 高，y0 = 箱底高度（叠放时用）。0.95 m 的箱子可以直接跳上。 */
export const CRATES = Object.freeze([
  // 左墙边：两只木箱加一只摞在上面
  { x: -24.55, z: -6.2, w: 1.5, d: 1.6, h: 1.3, y0: 0, kind: 'wood' },          // 贴左墙，让开大门洞
  { x: -24.55, z: -4.6, w: 1.5, d: 1.6, h: 1.3, y0: 0, kind: 'wood' },
  { x: -24.55, z: -5.4, w: 1.4, d: 1.4, h: 0.8, y0: 1.3, kind: 'wood' },
  // 北墙边：两层木箱
  { x: -14.05, z: -6.60, w: 1.9, d: 1.9, h: 0.95, y0: 0, kind: 'wood' },
  { x: -14.05, z: -6.60, w: 1.9, d: 1.9, h: 0.95, y0: 0.95, kind: 'wood' },
  // 左“靴形”腿旁边的两级铁箱：0 → 0.95 → 1.8 → 集装箱顶 2.59
  { x: -13.70, z: 2.45, w: 1.0, d: 1.3, h: 0.95, y0: 0, kind: 'metal' },
  { x: -13.70, z: 1.15, w: 1.0, d: 1.3, h: 1.8, y0: 0, kind: 'metal' },
  // 南墙边小木箱
  { x: -6.07, z: 6.70, w: 1.2, d: 1.3, h: 1.1, y0: 0, kind: 'wood' },
  // 右“L 形”腿东北角：两层木箱，前面一级台阶箱
  { x: 12.35, z: -5.10, w: 1.6, d: 2.2, h: 1.0, y0: 0, kind: 'wood' },
  { x: 12.35, z: -5.10, w: 1.6, d: 2.2, h: 1.0, y0: 1.0, kind: 'wood' },
  { x: 12.35, z: -3.55, w: 1.4, d: 1.1, h: 0.95, y0: 0, kind: 'wood' },
  // 右列集装箱北端的小铁箱
  { x: 19.85, z: -1.55, w: 1.9, d: 0.75, h: 1.0, y0: 0, kind: 'metal' },
  { x: 23.4, z: -5.2, w: 1.6, d: 1.9, h: 1.3, y0: 0, kind: 'wood' },                 // 右墙边：和左墙的木箱对称
  { x: 23.4, z: -3.6, w: 1.6, d: 1.5, h: 1.3, y0: 0, kind: 'wood' },
  // 东南角：矮木箱平台 + 两层木箱
  { x: 9.90, z: 6.55, w: 2.6, d: 2.0, h: 1.0, y0: 0, kind: 'wood' },
  { x: 10.70, z: 6.65, w: 1.5, d: 1.4, h: 1.0, y0: 1.0, kind: 'wood' },
  // 出生舱里的铁柜（贴外侧端墙，不挡出生点）
  { x: -30.95, z: -4.2, w: 0.7, d: 1.1, h: 1.9, y0: 0, kind: 'metal' },
  { x: -30.95, z: 4.2, w: 0.7, d: 1.1, h: 1.9, y0: 0, kind: 'metal' },
  { x: 30.95, z: -4.2, w: 0.7, d: 1.1, h: 1.9, y0: 0, kind: 'metal' },
  { x: 30.95, z: 4.2, w: 0.7, d: 1.1, h: 1.9, y0: 0, kind: 'metal' },
]);

/** 出生点。0 = 保卫者（船尾舱，-X 端），1 = 潜伏者（船头舱，+X 端）。yaw = 出生时的朝向（弧度，从 +X 转向 +Z）。 */
export const SPAWNS = Object.freeze({
  0: [[-29.2, -7.6], [-29.8, -3.4], [-29.8, 1.0], [-27.6, 8.4], [-30.6, 9.2], [-27.4, -9.2]].map(([x, z]) => [x, z, Math.atan2(-z, -25.5 - x)]),          // 都面向大门洞
  1: [[29.2, 7.6], [29.8, 3.4], [29.8, -1.0], [27.6, -8.4], [30.6, -9.2], [27.4, 9.2]].map(([x, z]) => [x, z, Math.atan2(-z, 25.5 - x)]),
});

/** 通道里的门框（雷达图上的分隔线所在位置），X 坐标 */
export const FRAMES = Object.freeze({ north: [-13.7, -7.6], south: [8.7, 13.5] });

export const CONTAINER_COLORS = Object.freeze({
  green: 0x2f5237, blue: 0x27405f, grey: 0x8d9496, olive: 0x565a35, red: 0x7c3326, white: 0xb9bcb6,
});

/**
 * 武器。dmg = 打中胸部的伤害；rpm = 每分钟射速；mag / reserve = 弹匣 / 备弹；
 * spread（度）：hip 腰射散布、ads 瞄准散布、move 移动加成、air 空中加成；recoil：up 垂直后坐（度/发）、side 水平摆动、kick 镜头冲击、recover 恢复速度（度/秒）。
 */
export const WEAPONS = Object.freeze({
  ak47:   { id: 'ak47', name: 'AK-47', slot: 1, kind: 'rifle', dmg: 36, rpm: 600, mag: 30, reserve: 90, reload: 2.45, draw: 0.55, spread: { hip: 1.25, ads: 0.22, move: 1.3, air: 5.5 }, recoil: { up: 1.15, side: 0.62, kick: 0.42, recover: 9 }, range: 70, speed: 5.5, auto: true },
  m4a1:   { id: 'm4a1', name: 'M4A1', slot: 1, kind: 'rifle', dmg: 31, rpm: 690, mag: 30, reserve: 90, reload: 2.30, draw: 0.55, spread: { hip: 1.05, ads: 0.18, move: 1.1, air: 5.0 }, recoil: { up: 0.82, side: 0.38, kick: 0.32, recover: 10 }, range: 70, speed: 5.5, auto: true },
  awm:    { id: 'awm', name: 'AWM', slot: 1, kind: 'sniper', dmg: 118, rpm: 44, mag: 10, reserve: 30, reload: 3.10, draw: 0.95, spread: { hip: 6.0, ads: 0.02, move: 3.0, air: 9.0 }, recoil: { up: 4.2, side: 0.5, kick: 1.3, recover: 7 }, range: 200, speed: 4.9, auto: false, bolt: 1.25, zoom: [4, 8] },
  deagle: { id: 'deagle', name: '沙漠之鹰', slot: 2, kind: 'pistol', dmg: 54, rpm: 300, mag: 7, reserve: 35, reload: 2.05, draw: 0.35, spread: { hip: 1.5, ads: 0.35, move: 1.2, air: 5.0 }, recoil: { up: 2.6, side: 0.7, kick: 0.9, recover: 9 }, range: 45, speed: 5.9, auto: false },
  usp:    { id: 'usp', name: 'USP', slot: 2, kind: 'pistol', dmg: 30, rpm: 420, mag: 12, reserve: 48, reload: 1.90, draw: 0.35, spread: { hip: 1.1, ads: 0.3, move: 0.9, air: 4.5 }, recoil: { up: 1.3, side: 0.4, kick: 0.45, recover: 10 }, range: 40, speed: 5.9, auto: false },
  knife:  { id: 'knife', name: '军刀', slot: 3, kind: 'melee', dmg: 68, heavy: 150, rpm: 110, range: 1.9, speed: 6.4, draw: 0.3 },
  he:     { id: 'he', name: '高爆手雷', slot: 4, kind: 'grenade', dmg: 98, radius: 7.5, count: 1, speed: 5.9, draw: 0.4 },
});

/** 部位倍率 */
export const HIT = Object.freeze({ head: 4.0, chest: 1.0, stomach: 1.25, legs: 0.75 });

/** 机器人难度：反应时间（秒）、瞄准误差（度）、连发纪律（每段最多几发）、伤害倍率、视野（度） */
export const DIFFICULTY = Object.freeze({
  easy:   { id: 'easy', name: '新手', react: 0.75, err: 4.2, burst: 3, dmg: 0.55, fov: 110, turn: 220, hear: 16 },
  normal: { id: 'normal', name: '普通', react: 0.42, err: 2.6, burst: 5, dmg: 0.8, fov: 130, turn: 320, hear: 24 },
  hard:   { id: 'hard', name: '精英', react: 0.24, err: 1.4, burst: 8, dmg: 1.0, fov: 150, turn: 480, hear: 34 },
});

export const RULES = Object.freeze({ respawn: 3.0, protect: 2.0, hp: 100, armor: 100, time: 600, targets: [30, 50, 80], sizes: [2, 3, 4, 5, 6] });

/** 玩家移动（米、秒） */
export const MOVE = Object.freeze({ radius: 0.34, stand: 1.78, crouch: 1.24, eye: 1.64, eyeCrouch: 1.12, accel: 46, airAccel: 7, friction: 9, jump: 6.3, gravity: 20, step: 0.45, walk: 2.7, crouchSpeed: 2.4, ads: 0.62 });
