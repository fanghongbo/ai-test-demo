// 散布：在一片方格里撒点，再筛。海床上的礁石、珊瑚、海草、巨藻都从这里出位置，所以位置是确定的（同一个种子每次一样），也能在 Node 里测试。
// 只有 tiltQuat 用到 three。
import { mulberry32 } from './mathx.js';

/**
 * 在 [x0, x1] × [z0, z1] 里，每个 cell × cell 的格子抖出一个点：先按 keep 抽稀，再用 accept(x, z) 筛，留下的交给 each(x, z, r)。
 * each 返回什么就收集什么（返回 undefined 的丢掉）。
 */
export function scatter(o) {
  const r = mulberry32(o.seed ?? 1), j = o.jitter ?? 0.9, keep = o.keep ?? 1, out = [];
  const nx = Math.max(1, Math.ceil((o.x1 - o.x0) / o.cell)), nz = Math.max(1, Math.ceil((o.z1 - o.z0) / o.cell));
  for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
    const x = o.x0 + (ix + 0.5 + (r() - 0.5) * j) * o.cell, z = o.z0 + (iz + 0.5 + (r() - 0.5) * j) * o.cell;
    if (r() > keep) continue;
    if (o.accept && !o.accept(x, z)) continue;
    const v = o.each ? o.each(x, z, r) : { x, z };
    if (v !== undefined && v !== null && v !== false) out.push(v);
  }
  return out;
}

/** 对数均匀：小的多、大的少（石头、生物的大小都这么分布） */
export const randLog = (r, a, b) => a * Math.pow(b / a, r());

import * as THREE from 'three';
const _y = new THREE.Vector3(0, 1, 0), _x = new THREE.Vector3(), _q = new THREE.Quaternion();

/** 给实例用的四元数：先绕竖轴随便转，再朝一个随便的方向歪一点（最多 tilt 弧度） */
export function tiltQuat(r, tilt, out) {
  const yaw = r() * Math.PI * 2, ax = r() * Math.PI * 2, t = tilt * Math.sqrt(r());
  out.setFromAxisAngle(_y, yaw);
  _q.setFromAxisAngle(_x.set(Math.cos(ax), 0, Math.sin(ax)), t);
  out.premultiply(_q);
  return out;
}
