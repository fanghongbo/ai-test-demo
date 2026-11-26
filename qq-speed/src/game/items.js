// 道具赛：赛道上的道具箱，手上的道具（最多两件，Alt 切换），以及放出去的东西——
// 导弹（锁定前一辆车）、水炸弹（往前扔、炸一片）、香蕉皮（丢在身后）、磁铁（吸向前车）、天使（无敌几秒）、氮气（立刻加速）。
// 这里只做逻辑；模型、粒子、声音、界面都由外面按 items 里的列表和事件（推进 ev）去做。不依赖 three。
import { pointAt } from '../core/trackdef.js';

export const ITEMS = Object.freeze({
  missile: { name: '导弹', tip: '锁定前一辆车' }, bomb: { name: '水炸弹', tip: '往前扔，炸一片' }, banana: { name: '香蕉皮', tip: '丢在身后' },
  magnet: { name: '磁铁', tip: '吸向前车' }, angel: { name: '天使', tip: '无敌 6 秒' }, nitro: { name: '氮气', tip: '立刻加速' },
});
/** 按名次抽道具：领跑的容易拿到防守型的，落后的容易拿到进攻型的 */
const TABLE = {
  lead: [['banana', 0.30], ['missile', 0.18], ['angel', 0.32], ['bomb', 0.20]],
  mid: [['missile', 0.30], ['bomb', 0.20], ['banana', 0.10], ['magnet', 0.20], ['angel', 0.10], ['nitro', 0.10]],
  back: [['missile', 0.34], ['magnet', 0.30], ['nitro', 0.22], ['bomb', 0.14]],
};
export const SPIN = { missile: 1.7, bomb: 1.6, banana: 1.3 };            // 各种攻击把车打转多久（秒）
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/**
 * @param {object} T createTrack()
 * @param {object} RL buildRacingLine()
 */
export function createItems(T, RL) {
  const L = T.L, ds = T.ds, r = mulberry(777);
  const it = { on: false, boxes: [], bananas: [], missiles: [], bombs: [], nextId: 1 };
  // ——— 道具箱：隔一段路在直道上横着排一排 ———
  let lastRow = -1e9, firstRow = -1e9;
  for (let i = 0; i < T.N; i++) {
    const s = i * ds;
    const gap = firstRow < 0 ? s - lastRow : Math.min(s - lastRow, L - s + firstRow);              // 过了起点线要和第一排隔开
    if (Math.abs(RL.k[i]) > 1 / 170 || gap < 190 || s < 55) continue;
    if (firstRow < 0) firstRow = s;
    lastRow = s;
    const hw = T.hw[i], n = Math.max(3, Math.min(5, Math.floor((2 * hw - 1.6) / 3.2))), span = hw - 1.9;
    for (let j = 0; j < n; j++) {
      const lat = -span + (2 * span * (j + 0.5)) / n, p = pointAt(T, i, lat);
      it.boxes.push({ x: p[0], z: p[1], lat, i, t: 0 });
    }
  }

  /** 给每辆车挂上放道具的格子 */
  it.reset = (race) => {
    for (const c of race.cars) { c.items = [null, null]; c.slot = 0; c.itemCd = 0; c.itemWait = 2 + r() * 3; c.S.spinT = c.S.shieldT = c.S.magnetT = 0; }
    for (const b of it.boxes) b.t = 0;
    it.bananas.length = it.missiles.length = it.bombs.length = 0;
  };
  it.enable = (on, race) => { it.on = on; for (const c of race.cars) c.S.itemMode = on; if (on) it.reset(race); };

  const roll = (c, n) => {
    const f = n > 1 ? (c.rank - 1) / (n - 1) : 0, table = f < 0.34 ? TABLE.lead : f < 0.68 ? TABLE.mid : TABLE.back;
    for (let tries = 0; tries < 8; tries++) {
      let x = r(), pick = table[table.length - 1][0];
      for (const [key, p] of table) { if (x < p) { pick = key; break; } x -= p; }
      if (!c.items.includes(pick)) return pick;                                     // 两件道具不重复
    }
    return 'banana';
  };
  /** 把一辆车打转。有天使护着就没事 */
  const spin = (c, dur, kind, by, ev) => {
    if (c.S.shieldT > 0) { ev.push({ type: 'blocked', car: c, by }); return false; }
    const S = c.S;
    S.spinT = dur; S.spinRate = (Math.PI * 4) / dur; S.drifting = false; S.miniT = S.nitroT = S.magnetT = 0; S.miniWin = 0;
    ev.push({ type: 'spinOut', car: c, by, kind });
    return true;
  };
  it.spin = spin;
  /** 排在 c 前面的最近的一辆车（没有就返回 null） */
  const aheadOf = (c, race) => {
    let best = null, bd = Infinity;
    for (const o of race.cars) { if (o === c) continue; const d = o.prog - c.prog; if (d > 0.5 && d < bd) { bd = d; best = o; } }
    return best;
  };
  it.aheadOf = aheadOf;

  /** 用掉当前选中的道具 */
  it.use = (c, race, ev) => {
    const key = c.items[c.slot], S = c.S;
    if (!key || S.spinT > 0) return false;
    c.items[c.slot] = null;
    ev.push({ type: 'itemUse', car: c, item: key });
    if (key === 'missile') it.missiles.push({ id: it.nextId++, owner: c, target: aheadOf(c, race), s: c.prog + 7, s0: c.prog, lat: S.e, speed: Math.max(72, Math.hypot(S.vx, S.vz) + 26), t: 0 });
    else if (key === 'bomb') { const sp = Math.hypot(S.vx, S.vz), f = Math.max(26, sp * 0.55 + 20); it.bombs.push({ id: it.nextId++, owner: c, x: S.x + Math.cos(S.psi) * 3, z: S.z + Math.sin(S.psi) * 3, vx: Math.cos(S.psi) * f, vz: Math.sin(S.psi) * f, t: 1.05, y: 0.7, vy: 6.5 }); }
    else if (key === 'banana') it.bananas.push({ id: it.nextId++, owner: c, x: S.x - Math.cos(S.psi) * 2.9, z: S.z - Math.sin(S.psi) * 2.9, t: 40, age: 0, ry: r() * 6.28 });
    else if (key === 'magnet') { S.magnetT = 5.5; ev.push({ type: 'magnetOn', car: c }); }
    else if (key === 'angel') { S.shieldT = 6; ev.push({ type: 'shieldOn', car: c }); }
    else if (key === 'nitro') { S.nitroT = Math.max(S.nitroT, S.def.nitroTime * 0.8); ev.push({ type: 'itemNitro', car: c }); }
    return true;
  };
  /** Alt：在两个格子之间切换 */
  it.swap = (c) => { c.slot = 1 - c.slot; return c.slot; };

  /** 电脑车手什么时候放道具 */
  it.aiThink = (c, race, dt, ev) => {
    const key = c.items[c.slot], S = c.S;
    c.itemCd = Math.max(0, c.itemCd - dt);
    if (!key || c.itemCd > 0 || S.spinT > 0) return;
    if (key === 'missile' || key === 'bomb') {
      const t = aheadOf(c, race);
      if (!t) return;
      const gap = t.prog - c.prog;
      if (key === 'missile' ? gap < 260 : (gap > 14 && gap < 70)) it.use(c, race, ev);
      else if ((c.itemWait -= dt) < -9) it.use(c, race, ev);                       // 一直等不到机会就随便放掉
    } else if (key === 'banana') { if ((c.itemWait -= dt) < 0) it.use(c, race, ev); }
    else it.use(c, race, ev);
    if (!c.items[c.slot]) { c.itemCd = 1.2 + r() * 1.6; c.itemWait = 2 + r() * 4; c.slot = c.items[1 - c.slot] ? 1 - c.slot : c.slot; }
  };

  const idxOf = (prog) => ((Math.floor((((prog % L) + L) % L) / ds) % T.N) + T.N) % T.N;

  /** 每步 */
  it.update = (dt, race, ev) => {
    if (!it.on) return;
    // 道具箱：重生、拾取
    for (const b of it.boxes) {
      if (b.t > 0) { b.t -= dt; continue; }
      for (const c of race.cars) {
        if (c.finished || (c.items[0] && c.items[1]) || c.S.spinT > 0) continue;        // 两只手都拿着东西就捡不了
        const S = c.S, dx = S.x - b.x, dz = S.z - b.z;
        if (dx * dx + dz * dz < 1.7 * 1.7) {
          const free = c.items[c.slot] ? 1 - c.slot : c.slot, key = roll(c, race.cars.length);
          c.items[free] = key; c.slot = free; b.t = 4;
          ev.push({ type: 'itemGet', car: c, item: key });
          break;
        }
      }
    }
    // 香蕉皮
    for (let k = it.bananas.length - 1; k >= 0; k--) {
      const b = it.bananas[k];
      b.t -= dt; b.age += dt;
      if (b.t <= 0) { it.bananas.splice(k, 1); continue; }
      for (const c of race.cars) {
        if (c === b.owner && b.age < 1.4) continue;
        const S = c.S, dx = S.x - b.x, dz = S.z - b.z;
        if (dx * dx + dz * dz < 1.55 * 1.55) {
          if (spin(c, SPIN.banana, 'banana', b.owner, ev)) ev.push({ type: 'bananaHit', car: c, by: b.owner, x: b.x, z: b.z });
          it.bananas.splice(k, 1);
          break;
        }
      }
    }
    // 导弹：沿赛道飞，追到目标就炸
    for (let k = it.missiles.length - 1; k >= 0; k--) {
      const m = it.missiles[k];
      m.t += dt; m.s += m.speed * dt;
      if (m.target) { m.lat += (m.target.S.e - m.lat) * Math.min(1, dt * 2.2); }
      const i = idxOf(m.s), p = pointAt(T, i, clamp(m.lat, -(T.hw[i] + 0.5), T.hw[i] + 0.5));
      m.x = p[0]; m.z = p[1]; m.th = T.th[i];
      const gap = m.target ? m.target.prog - m.s : Infinity;
      if (gap <= 1) {
        const T2 = m.target;
        if (T2.S.shieldT > 0) ev.push({ type: 'blocked', car: T2, by: m.owner });
        else if (spin(T2, SPIN.missile, 'missile', m.owner, ev)) ev.push({ type: 'missileHit', car: T2, by: m.owner, x: T2.S.x, z: T2.S.z });
        else ev.push({ type: 'missileMiss', x: m.x, z: m.z });
        it.missiles.splice(k, 1);
      } else if (m.s - m.s0 > 320 || m.t > 7) { ev.push({ type: 'missileMiss', x: m.x, z: m.z }); it.missiles.splice(k, 1); }
    }
    // 水炸弹：抛物线飞出去，落地炸一片
    for (let k = it.bombs.length - 1; k >= 0; k--) {
      const b = it.bombs[k];
      b.t -= dt; b.x += b.vx * dt; b.z += b.vz * dt; b.vy -= 12 * dt; b.y = Math.max(0.5, b.y + b.vy * dt);
      if (b.t > 0) continue;
      it.bombs.splice(k, 1);
      ev.push({ type: 'splash', x: b.x, z: b.z, by: b.owner });
      for (const c of race.cars) {
        const S = c.S, dx = S.x - b.x, dz = S.z - b.z;
        if (dx * dx + dz * dz > 8.5 * 8.5) continue;
        if (spin(c, SPIN.bomb, 'bomb', b.owner, ev)) ev.push({ type: 'bombHit', car: c, by: b.owner });
      }
    }
  };
  return it;
}

function mulberry(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
