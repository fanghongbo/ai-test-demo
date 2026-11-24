// 解析双骨 IK（纯函数）
import { sub, dot, cross, normalize, len } from './vec.js';

/**
 * 求中间关节位置。
 * @param {number[]} A 根关节（髋/肩）
 * @param {number[]} C 末端目标（踝/腕）
 * @param {number} l1 近段长
 * @param {number} l2 远段长
 * @param {number[]} pole 弯曲方向参考（任意非零向量，关节会朝该方向弯曲）
 * @param {number[]} out 输出关节位置
 * @returns {{joint:number[], reached:boolean, target:number[]}} 实际末端（够不到时被夹到臂展末端）
 */
export function solveTwoBone(A, C, l1, l2, pole, out = [0, 0, 0]) {
  const ac = sub(C, A);
  let d = len(ac);
  const maxD = (l1 + l2) * 0.9995;
  const minD = Math.abs(l1 - l2) + 1e-4;
  const reached = d <= maxD && d >= minD;
  if (d < 1e-6) { out[0] = A[0]; out[1] = A[1]; out[2] = A[2] + 1e-6; return { joint: out, reached: false, target: C.slice(), end: C.slice() }; }
  const dc = Math.min(Math.max(d, minD), maxD);
  const u = normalize(ac);
  const a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc);   // 关节在 AC 方向上的投影
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));    // 垂直偏移
  // 去掉 pole 沿 u 的分量，得到垂直于 AC 的弯曲方向
  const pd = Math.min(Math.max(dot(pole, u), -1), 1);
  const bend = normalize([pole[0] - u[0] * pd, pole[1] - u[1] * pd, pole[2] - u[2] * pd]);
  out[0] = A[0] + u[0] * a + bend[0] * h;
  out[1] = A[1] + u[1] * a + bend[1] * h;
  out[2] = A[2] + u[2] * a + bend[2] * h;
  const end = reached ? C.slice() : [A[0] + u[0] * dc, A[1] + u[1] * dc, A[2] + u[2] * dc];
  return { joint: out, reached, target: C.slice(), end };
}

/** 两向量夹角的余弦（用于校验关节弯曲方向） */
export function bendCos(A, B, C) { return dot(normalize(sub(A, B)), normalize(sub(C, B))); }
export { cross };
