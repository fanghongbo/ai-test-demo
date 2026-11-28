// 带种子的单纯形噪声（三维；二维、一维是它的特例）。搭岛的形状、树冠的鼓包、云的纹理都从这里取。
function make(seed) {
  const p = new Uint8Array(256);
  for (let k = 0; k < 256; k++) p[k] = k;
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let k = 255; k > 0; k--) {
    const j = Math.floor(next() * (k + 1));
    [p[k], p[j]] = [p[j], p[k]];
  }
  const perm = new Uint8Array(512), permMod12 = new Uint8Array(512);
  for (let k = 0; k < 512; k++) {
    perm[k] = p[k & 255];
    permMod12[k] = perm[k] % 12;
  }
  const grad = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
  const F3 = 1 / 3, G3 = 1 / 6;

  // 返回 -1 … 1
  const noise3 = (x, y, z) => {
    const s = (x + y + z) * F3;
    const k = Math.floor(x + s), l = Math.floor(y + s), m = Math.floor(z + s);
    const t = (k + l + m) * G3;
    const x0 = x - (k - t), y0 = y - (l - t), z0 = z - (m - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = k & 255, jj = l & 255, mm = m & 255;
    let n = 0, t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) { const g = permMod12[ii + perm[jj + perm[mm]]] * 3; t0 *= t0; n += t0 * t0 * (grad[g] * x0 + grad[g + 1] * y0 + grad[g + 2] * z0); }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) { const g = permMod12[ii + i1 + perm[jj + j1 + perm[mm + k1]]] * 3; t1 *= t1; n += t1 * t1 * (grad[g] * x1 + grad[g + 1] * y1 + grad[g + 2] * z1); }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) { const g = permMod12[ii + i2 + perm[jj + j2 + perm[mm + k2]]] * 3; t2 *= t2; n += t2 * t2 * (grad[g] * x2 + grad[g + 1] * y2 + grad[g + 2] * z2); }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) { const g = permMod12[ii + 1 + perm[jj + 1 + perm[mm + 1]]] * 3; t3 *= t3; n += t3 * t3 * (grad[g] * x3 + grad[g + 1] * y3 + grad[g + 2] * z3); }
    return 32 * n;
  };

  const fbm3 = (x, y, z, oct = 3, gain = 0.5, lac = 2.0) => {
    let sum = 0, amp = 1, norm = 0;
    for (let o = 0; o < oct; o++) {
      sum += amp * noise3(x, y, z);
      norm += amp;
      amp *= gain;
      x *= lac; y *= lac; z *= lac;
    }
    return sum / norm;
  };

  const noise2 = (x, y) => noise3(x, y, 0.371);
  const fbm2 = (x, y, oct = 3) => fbm3(x, y, 0.371, oct);

  return { noise3, noise2, noise1: (x) => noise3(x, 0.71, 0.371), fbm3, fbm2 };
}

export const noise = make(1337);
export const makeNoise = make;
