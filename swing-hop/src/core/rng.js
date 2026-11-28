// 带种子的随机数（mulberry32）：同一局用同一个种子，浮岛和秋千的排布就每次都一样。
export function rng(seed) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.chance = (p) => r() < p;
  return r;
}

// 把任意一个数搅成一个 32 位的种子（时间戳这类都行）
export function hashSeed(...vals) {
  let h = 2166136261 >>> 0;
  for (const v of vals) {
    const s = String(v);
    for (let k = 0; k < s.length; k++) {
      h ^= s.charCodeAt(k);
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  return h >>> 0;
}
