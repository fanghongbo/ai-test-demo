// 寻路：在可行走的甲板上铺一张方格网，去掉被碰撞体占住的格子，A* 找路，再用“带半径的走廊”把折线拉直。纯逻辑，可在 Node 里测试。
export const CELL = 1.0;
const X0 = -31, X1 = 31, Z0 = -10, Z1 = 10;            // 网格覆盖范围（格子中心落在这些整数坐标上）

export function createNav(world, o = {}) {
  const cell = o.cell ?? CELL, nx = Math.round((X1 - X0) / cell) + 1, nz = Math.round((Z1 - Z0) / cell) + 1;
  const walk = new Uint8Array(nx * nz), h = o.height ?? 1.7, r = o.radius ?? 0.36;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = X0 + i * cell, z = Z0 + j * cell;
    // 半径多留半个格子：相邻两格都空时，两格中心之间那段路也留得下人物（斜穿另要求两个直邻格都空）
    walk[j * nx + i] = world.overlap(x, 0.3, z, r + (o.margin ?? 0.2), h - 0.3) || world.groundTop(x, z, 0.05, 0.3) < 0 ? 0 : 1;
  }
  const idx = (i, j) => j * nx + i;
  const cellOf = (x, z) => [Math.round((x - X0) / cell), Math.round((z - Z0) / cell)];
  /** 离 (x, z) 最近的可行走格 */
  function nearest(x, z) {
    let [i, j] = cellOf(x, z);
    i = Math.max(0, Math.min(nx - 1, i)); j = Math.max(0, Math.min(nz - 1, j));
    if (walk[idx(i, j)]) return [i, j];
    for (let d = 1; d < 14; d++) for (let dj = -d; dj <= d; dj++) for (let di = -d; di <= d; di++) {
      if (Math.max(Math.abs(di), Math.abs(dj)) !== d) continue;
      const a = i + di, b = j + dj;
      if (a >= 0 && a < nx && b >= 0 && b < nz && walk[idx(a, b)]) return [a, b];
    }
    return null;
  }
  const pos = (i, j) => [X0 + i * cell, Z0 + j * cell];
  const gScore = new Float32Array(nx * nz), from = new Int32Array(nx * nz), seen = new Uint32Array(nx * nz), stamp = new Uint32Array(1);
  const heap = [];                                         // 小顶堆：[f, index]
  const push = (f, v) => { heap.push([f, v]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (; ;) { const l = 2 * k + 1, rr = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (rr < heap.length && heap[rr][0] < heap[m][0]) m = rr; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };

  /** A*：返回世界坐标的折线 [[x, z], ...]（含起点格与终点格），走不通返回 null */
  function findPath(sx, sz, tx, tz) {
    const s = nearest(sx, sz), t = nearest(tx, tz);
    if (!s || !t) return null;
    const si = idx(s[0], s[1]), ti = idx(t[0], t[1]);
    if (si === ti) return [pos(t[0], t[1])];
    const st = ++stamp[0];
    heap.length = 0;
    gScore[si] = 0; seen[si] = st; from[si] = -1;
    push(0, si);
    let found = false;
    while (heap.length) {
      const [, cur] = pop();
      if (cur === ti) { found = true; break; }
      const ci = cur % nx, cj = (cur - ci) / nx;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const a = ci + di, b = cj + dj;
        if (a < 0 || a >= nx || b < 0 || b >= nz) continue;
        const v = idx(a, b);
        if (!walk[v]) continue;
        if (di && dj && (!walk[idx(ci + di, cj)] || !walk[idx(ci, cj + dj)])) continue;      // 斜穿要两个直邻格都空
        const g = gScore[cur] + (di && dj ? 1.41421356 : 1);
        if (seen[v] === st && g >= gScore[v]) continue;
        seen[v] = st; gScore[v] = g; from[v] = cur;
        push(g + Math.hypot(a - t[0], b - t[1]), v);
      }
    }
    if (!found) return null;
    const cells = [];
    for (let v = ti; v >= 0; v = from[v]) cells.push(v);
    cells.reverse();
    const pts = cells.map((v) => pos(v % nx, Math.floor(v / nx)));
    // 拉直：能直走的段合并（用比网格半径稍大的走廊，别贴着箱子角走）
    const rr = r + 0.12, out = [[sx, sz]];
    let a = [sx, sz], k = 0;
    while (k < pts.length - 1) {
      let far = k;
      for (let m = pts.length - 1; m > k; m--) if (world.corridorFree(a[0], a[1], pts[m][0], pts[m][1], rr, h)) { far = m; break; }
      if (far === k) far = k + 1;                          // 起点离格子有点偏时至少前进一格，保证循环会结束
      out.push(pts[far]); a = pts[far]; k = far;
    }
    if (world.corridorFree(a[0], a[1], tx, tz, rr, h)) out.push([tx, tz]);
    return out;
  }
  return { nx, nz, walk, cell, findPath, nearest, pos, X0, Z0 };
}
