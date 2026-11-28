// 跳跃的物理常数（单位都是米和秒）。重力比真实的大，起跳和落地更干脆；蓄力越久跳得越远。
export const G = 22;
export const LAUNCH = (46 * Math.PI) / 180;   // 起跳的方向
export const V_MIN = 6.5;                     // 轻轻一点
export const V_MAX = 15.6;                    // 蓄满
export const T_CHARGE = 1.1;                  // 蓄满要按多久
export const FOOT = 0.14;                     // 脚掌探出座板边缘这么多以内还算踩到
export const PERFECT = 0.14;                  // 离座板中心这么近算“完美”

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth01 = (k) => {
  const x = clamp(k, 0, 1);
  return x * x * (3 - 2 * x);
};

export function speed(c) {
  return V_MIN + (V_MAX - V_MIN) * clamp(c, 0, 1);
}

// 蓄力 c（0 … 1）起跳时的水平、竖直速度
export function launch(c) {
  const v = speed(c);
  return { vx: v * Math.cos(LAUNCH), vy: v * Math.sin(LAUNCH) };
}

// 落点比起跳点低 dy（向上为正）时，在空中待多久
export function airTime(c, dy = 0) {
  const { vy } = launch(c);
  return (vy + Math.sqrt(vy * vy + 2 * G * dy)) / G;
}

// 同样高度下的水平距离
export function rangeOf(c, dy = 0) {
  return launch(c).vx * airTime(c, dy);
}
