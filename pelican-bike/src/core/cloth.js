// Verlet 布料（窄条带，用于围巾）。纯函数 + Float64Array，零依赖。
import { TAU, noise1 } from './mathx.js';

/**
 * @param {{cols?:number, rows?:number}} o  cols = 横向节点数（条带宽度方向），rows = 纵向节点数（长度方向）
 */
export function makeCloth(o = {}) {
  const cols = o.cols ?? 3, rows = o.rows ?? 16;
  const n = cols * rows;
  const c = {
    cols, rows, n,
    x: new Float64Array(n * 3),      // 当前位置
    p: new Float64Array(n * 3),      // 上一步位置
    inv: new Float64Array(n).fill(1),// 逆质量，0 = 钉住
    rest: new Float64Array(n * 4),   // 约束静止长度：[下, 右, 右下, 左下]
    rest2: new Float64Array(n),      // 抗弯：r → r+2 的静止长度（0 = 无）
    bendK: 0.35,                     // 抗弯刚度 0..1
    acc: 0,                          // 固定步长累加器
    seg: 0, across: 0,
  };
  return c;
}

export const nodeIndex = (c, row, col) => row * c.cols + col;

/** 按矩形摆放并写入静止长度。origin(局部原点) dir(长度方向单位向量) side(宽度方向单位向量) */
export function initCloth(c, origin, dir, side, len, width) {
  c.seg = len / (c.rows - 1); c.across = width / (c.cols - 1);
  for (let r = 0; r < c.rows; r++) {
    for (let k = 0; k < c.cols; k++) {
      const i = nodeIndex(c, r, k), f = (k - (c.cols - 1) / 2) * c.across, g = r * c.seg;
      c.x[i * 3] = c.p[i * 3] = origin[0] + dir[0] * g + side[0] * f;
      c.x[i * 3 + 1] = c.p[i * 3 + 1] = origin[1] + dir[1] * g + side[1] * f;
      c.x[i * 3 + 2] = c.p[i * 3 + 2] = origin[2] + dir[2] * g + side[2] * f;
      const down = r < c.rows - 1 ? c.seg : -1, right = k < c.cols - 1 ? c.across : -1;
      const diag = Math.hypot(c.seg, c.across);
      c.rest[i * 4] = down; c.rest[i * 4 + 1] = right;
      c.rest[i * 4 + 2] = r < c.rows - 1 && k < c.cols - 1 ? diag : -1;
      c.rest[i * 4 + 3] = r < c.rows - 1 && k > 0 ? diag : -1;
      c.rest2[i] = r < c.rows - 2 ? c.seg * 2 : 0;
    }
  }
  c.acc = 0;
  return c;
}

const H = 1 / 120;
const _w = [0, 0, 0];

/**
 * 推进布料（内部按 1/120 s 固定步长子步）。
 * @param {object} c
 * @param {number} dt
 * @param {object} o
 * @param {(x:number,y:number,z:number,t:number,out:number[])=>void} [o.wind]  返回风加速度 (m/s²)
 * @param {number} [o.gravity=9.81]
 * @param {number} [o.damp=0.012]    速度阻尼（每子步比例）
 * @param {number} [o.iter=3]        约束迭代次数
 * @param {(row:number,col:number)=>number[]|null} [o.pin]  返回钉住节点的新位置（首行）
 * @param {number[]} [o.spheres]     扁平数组 [cx,cy,cz,r, ...]，球体排斥，防止穿过身体
 */
export function stepCloth(c, dt, o = {}) {
  c.acc += Math.min(dt, 0.1);
  const gravity = o.gravity ?? 9.81, damp = o.damp ?? 0.012, iter = o.iter ?? 4;
  const wind = o.wind, pin = o.pin, spheres = o.spheres;
  let t = o.t ?? 0;
  let steps = 0;
  while (c.acc >= H && steps < 5) {
    c.acc -= H; steps++;
    // 钉住点
    if (pin) for (let k = 0; k < c.cols; k++) {
      const q = pin(0, k);
      if (!q) continue;
      const i = nodeIndex(c, 0, k);
      c.x[i * 3] = c.p[i * 3] = q[0]; c.x[i * 3 + 1] = c.p[i * 3 + 1] = q[1]; c.x[i * 3 + 2] = c.p[i * 3 + 2] = q[2];
      c.inv[i] = 0;
    }
    // 积分
    const h2 = H * H, k1 = 1 - damp;
    for (let i = 0; i < c.n; i++) {
      if (c.inv[i] === 0) continue;
      const ix = i * 3;
      let ax = 0, ay = -gravity, az = 0;
      if (wind) { wind(c.x[ix], c.x[ix + 1], c.x[ix + 2], t, _w); ax += _w[0]; ay += _w[1]; az += _w[2]; }
      const nx = c.x[ix] + (c.x[ix] - c.p[ix]) * k1 + ax * h2;
      const ny = c.x[ix + 1] + (c.x[ix + 1] - c.p[ix + 1]) * k1 + ay * h2;
      const nz = c.x[ix + 2] + (c.x[ix + 2] - c.p[ix + 2]) * k1 + az * h2;
      c.p[ix] = c.x[ix]; c.p[ix + 1] = c.x[ix + 1]; c.p[ix + 2] = c.x[ix + 2];
      c.x[ix] = nx; c.x[ix + 1] = ny; c.x[ix + 2] = nz;
    }
    // 约束
    for (let it = 0; it < iter; it++) {
      // 抗弯（软约束）：让条带保持缓和的弧线，而不是像绳子一样对折
      if (c.bendK > 0) for (let i = 0; i < c.n; i++) {
        const L = c.rest2[i];
        if (L <= 0) continue;
        const j = i + 2 * c.cols;      // 隔一行的节点
        const wa = c.inv[i], wb = c.inv[j];
        if (wa + wb === 0) continue;
        const dx = c.x[j * 3] - c.x[i * 3], dy = c.x[j * 3 + 1] - c.x[i * 3 + 1], dz = c.x[j * 3 + 2] - c.x[i * 3 + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-9;
        const corr = (d - L) / d / (wa + wb) * c.bendK;
        c.x[i * 3] += dx * corr * wa; c.x[i * 3 + 1] += dy * corr * wa; c.x[i * 3 + 2] += dz * corr * wa;
        c.x[j * 3] -= dx * corr * wb; c.x[j * 3 + 1] -= dy * corr * wb; c.x[j * 3 + 2] -= dz * corr * wb;
      }
      // 结构约束（距离保持）。PBD 的固有特性：受力越大，靠近钉点的链节残余拉伸越大；
      // 对 0.6m 的围巾这在视觉上可忽略（见 tests 的阈值说明）。
      for (let i = 0; i < c.n; i++) {
        const ri = i * 4;
        const l0 = c.rest[ri], l1 = c.rest[ri + 1], l2 = c.rest[ri + 2], l3 = c.rest[ri + 3];
        for (let q = 0; q < 4; q++) {
          const L = q === 0 ? l0 : q === 1 ? l1 : q === 2 ? l2 : l3;
          if (L < 0) continue;
          const j = q === 0 ? i + c.cols : q === 1 ? i + 1 : q === 2 ? i + c.cols + 1 : i + c.cols - 1;
          const wa = c.inv[i], wb = c.inv[j];
          if (wa + wb === 0) continue;
          const dx = c.x[j * 3] - c.x[i * 3], dy = c.x[j * 3 + 1] - c.x[i * 3 + 1], dz = c.x[j * 3 + 2] - c.x[i * 3 + 2];
          const d = Math.hypot(dx, dy, dz) || 1e-9;
          const corr = (d - L) / d / (wa + wb);
          const cx = dx * corr, cy = dy * corr, cz = dz * corr;
          c.x[i * 3] += cx * wa; c.x[i * 3 + 1] += cy * wa; c.x[i * 3 + 2] += cz * wa;
          c.x[j * 3] -= cx * wb; c.x[j * 3 + 1] -= cy * wb; c.x[j * 3 + 2] -= cz * wb;
        }
      }
      if (spheres && spheres.length) for (let i = 0; i < c.n; i++) {
        if (c.inv[i] === 0) continue;
        for (let s = 0; s < spheres.length; s += 4) {
          const dx = c.x[i * 3] - spheres[s], dy = c.x[i * 3 + 1] - spheres[s + 1], dz = c.x[i * 3 + 2] - spheres[s + 2];
          const r = spheres[s + 3], d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < r * r && d2 > 1e-12) { const k = (r - Math.sqrt(d2)) / Math.sqrt(d2); c.x[i * 3] += dx * k; c.x[i * 3 + 1] += dy * k; c.x[i * 3 + 2] += dz * k; }
        }
      }
    }
    t += H;
  }
  if (steps === 5) c.acc = 0; // 防螺旋卡死
  return c;
}

/** 相对风场：车速 v（m/s，沿 -Z 流来）+ 行波湍流。写入 out。 */
export function rideWind(v, t, x, y, z, out, gust = 1) {
  const n1 = noise1(t * 2.1 + x * 1.3 + y * 2.0, 11), n2 = noise1(t * 3.3 + z * 1.7, 23), n3 = noise1(t * 1.7 + y * 3.1, 37);
  const amp = (0.25 + v * 0.16) * gust;
  out[0] = n1 * amp * 0.7;
  out[1] = n2 * amp * 0.9 + 1.6 + v * 0.9;         // 升力（随车速增大），让围巾越过背部向后上方飘
  out[2] = -Math.min(v, 14) * 2.4 * (1 + 0.15 * n3) * gust;
  return out;
}
export { TAU };
