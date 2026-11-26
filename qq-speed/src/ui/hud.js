// 比赛 HUD：名次和圈数、计时、小地图、速度表（外圈是集气条）、氮气瓶、倒计时、技巧弹出、车顶名字牌、名次表。
// 全部是 DOM + 两张小 canvas。数字变了才改文字，小地图和速度表每帧重画。
import * as THREE from 'three';
import { ZONE_CN } from '../core/trackdef.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const fmt = (t) => {
  if (!(t >= 0) || !Number.isFinite(t)) return '--:--.--';
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`;
};
export const fmtGap = (t) => (t < 60 ? '+' + t.toFixed(2) + ' s' : '+' + fmt(t));
const ORD = ['st', 'nd', 'rd'];
/** 道具的图标（内联 SVG） */
const ICON = {
  missile: '<svg viewBox="0 0 64 64"><path d="M8 36 30 22 34 30z" fill="#ff5a2a"/><path d="M8 28 30 42 34 34z" fill="#ff5a2a"/><path d="M22 26 46 26 60 32 46 38 22 38z" fill="#f4f6f8"/><path d="M46 26 60 32 46 38z" fill="#ff3b30"/><path d="M6 32 22 29 22 35z" fill="#ffd21e"/><circle cx="38" cy="32" r="3" fill="#3fd4ff"/></svg>',
  bomb: '<svg viewBox="0 0 64 64"><circle cx="30" cy="38" r="20" fill="#3fb0ff"/><circle cx="30" cy="38" r="20" fill="none" stroke="#dff6ff" stroke-width="3"/><circle cx="23" cy="31" r="6" fill="#eaffff"/><path d="M40 22 48 12" stroke="#ffd21e" stroke-width="5" stroke-linecap="round"/><path d="M50 8 52 4 54 10 58 8 55 13" fill="none" stroke="#ff8a1e" stroke-width="3" stroke-linecap="round"/></svg>',
  banana: '<svg viewBox="0 0 64 64"><path d="M10 20 Q 14 50 44 52 Q 56 52 58 42 Q 40 44 28 30 Q 20 22 20 14z" fill="#ffd21e" stroke="#b98a00" stroke-width="2"/><path d="M16 18 Q 18 40 42 46" fill="none" stroke="#fff3a0" stroke-width="3"/><rect x="7" y="12" width="8" height="9" rx="2" fill="#7a5a1e"/></svg>',
  magnet: '<svg viewBox="0 0 64 64"><path d="M14 10 14 34 A 18 18 0 0 0 50 34 L 50 10 38 10 38 34 A 6 6 0 0 1 26 34 L 26 10z" fill="#ff3b30"/><path d="M14 10 26 10 26 20 14 20z" fill="#eef6ff"/><path d="M38 10 50 10 50 20 38 20z" fill="#eef6ff"/><path d="M6 42 60 42 56 50 10 50z" fill="#3fd4ff" opacity=".7"/></svg>',
  angel: '<svg viewBox="0 0 64 64"><ellipse cx="32" cy="12" rx="14" ry="5" fill="none" stroke="#ffe9a0" stroke-width="4"/><path d="M30 30 Q 8 22 6 46 Q 18 40 28 44z" fill="#ffffff"/><path d="M34 30 Q 56 22 58 46 Q 46 40 36 44z" fill="#ffffff"/><circle cx="32" cy="32" r="6" fill="#fff"/></svg>',
  nitro: '<svg viewBox="0 0 64 64"><rect x="22" y="14" width="20" height="42" rx="8" fill="#1f6fe0"/><rect x="24" y="24" width="16" height="30" rx="6" fill="#8fe9ff"/><rect x="26" y="6" width="12" height="10" rx="2" fill="#dff4ff"/><path d="M32 28 26 42 31 42 29 54 38 38 33 38 36 28z" fill="#1262ff"/></svg>',
};
const NUM = 'Bahnschrift, "Segoe UI", "Arial Narrow", sans-serif';

export function createHud(T) {
  const hud = $('hud'), tags = $('tags');
  const el = { rank: $('rankNum'), suf: $('rankSuf'), rankOf: $('rankOf'), lapNow: $('lapNow'), lapTotal: $('lapTotal'), lapTime: $('lapTime'), raceTime: $('raceTime'), best: $('bestTime'),
    zone: $('zoneName'), items: $('items'), slots: [...document.querySelectorAll('#items .slot')], count: $('countdown'), msg: $('centerMsg'), pops: $('popups'), stand: $('standings'), hints: $('hints') };
  const cache = {};
  const set = (k, node, v) => { if (cache[k] !== v) { cache[k] = v; node.textContent = v; } };
  const dpr = () => Math.min(2, window.devicePixelRatio || 1);

  // ——— 小地图：赛道底图只画一次（画布尺寸变了才重画） ———
  const map = $('minimap'), mctx = map.getContext('2d'), base = document.createElement('canvas');
  let ms = 1, mx = 0, mz = 0, MW = 0, MH = 0;
  const buildMap = () => {
    const w = map.clientWidth || 212, h = map.clientHeight || 194, d = dpr();
    if (MW === Math.round(w * d) && MH === Math.round(h * d)) return;
    MW = map.width = base.width = Math.round(w * d); MH = map.height = base.height = Math.round(h * d);
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < T.N; i++) { x0 = Math.min(x0, T.x[i]); x1 = Math.max(x1, T.x[i]); z0 = Math.min(z0, T.z[i]); z1 = Math.max(z1, T.z[i]); }
    const pad = 22 * d;
    ms = Math.min((MW - pad * 2) / (x1 - x0), (MH - pad * 2) / (z1 - z0));
    mx = (MW - (x1 - x0) * ms) / 2 - x0 * ms; mz = (MH - (z1 - z0) * ms) / 2 - z0 * ms;
    const c = base.getContext('2d'), path = (w2, color) => {
      c.lineWidth = w2; c.strokeStyle = color; c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath();
      for (let i = 0; i <= T.N; i += 2) { const j = i % T.N; if (i) c.lineTo(T.x[j] * ms + mx, T.z[j] * ms + mz); else c.moveTo(T.x[j] * ms + mx, T.z[j] * ms + mz); }
      c.closePath(); c.stroke();
    };
    path(13 * d, 'rgba(3, 10, 22, .95)'); path(9 * d, 'rgba(190, 214, 238, .9)');
    const sx = T.x[0] * ms + mx, sz = T.z[0] * ms + mz, rx = -Math.sin(T.th[0]) * 9 * d, rz = Math.cos(T.th[0]) * 9 * d;      // 起点线
    c.strokeStyle = '#ffd21e'; c.lineWidth = 3 * d; c.beginPath(); c.moveTo(sx - rx, sz - rz); c.lineTo(sx + rx, sz + rz); c.stroke();
  };
  const toMap = (x, z) => [x * ms + mx, z * ms + mz];

  // ——— 速度表：画布内部固定按 240 个单位画，按设备像素比放大 ———
  const gauge = $('gauge'), g = gauge.getContext('2d'), GW = 240, RING = 104, ARC = 80, A0 = Math.PI * 0.75, SW = Math.PI * 1.5;
  const ring = (r, a0, a1, w, color) => { g.lineWidth = w; g.strokeStyle = color; g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke(); };
  const bottles = [...document.querySelectorAll('.bottle')].map((b) => ({ el: b, fill: b.querySelector('i'), full: null, active: null }));

  // ——— 车顶名字牌 ———
  const tagEls = new Map(), v3 = new THREE.Vector3();
  const tagOf = (car) => {
    let t = tagEls.get(car);
    if (!t) {
      t = document.createElement('div'); t.className = 'tag'; t.style.borderLeftColor = '#' + car.def.color.toString(16).padStart(6, '0');
      const b = document.createElement('b'), s = document.createElement('span'); s.textContent = car.name; t.append(b, s);
      tags.appendChild(t); tagEls.set(car, t);
    }
    return t;
  };
  let msgT = 0;

  const H = {
    show(v) {
      hud.hidden = !v;
      if (!v) { tags.innerHTML = ''; tagEls.clear(); el.stand.hidden = true; H.cine(false); }
    },
    reset() {
      for (const k of Object.keys(cache)) delete cache[k];
      el.pops.innerHTML = ''; el.msg.classList.remove('show', 'warn'); el.hints.classList.remove('fade'); msgT = 0;
    },
    /** 技巧弹出。cls：''（青）| orange | gold | green */
    popup(text, cls = '', sub = '') {
      const p = document.createElement('div');
      p.className = 'pop ' + cls; p.textContent = text;
      if (sub) { const s = document.createElement('small'); s.textContent = sub; p.appendChild(s); }
      el.pops.appendChild(p);
      while (el.pops.children.length > 4) el.pops.firstChild.remove();
      setTimeout(() => p.remove(), 1550);
    },
    /** 屏幕中上的一条大字，停 dur 秒。cls：''（金）| warn（红） */
    center(text, cls = '', dur = 1.8) { el.msg.textContent = text; el.msg.className = cls; el.msg.classList.add('show'); msgT = dur; },
    countdown(text) {
      el.count.textContent = text; el.count.className = text === 'GO!' ? 'go' : '';
      void el.count.offsetWidth; el.count.classList.add('show');
      setTimeout(() => el.count.classList.remove('show'), 950);
    },
    hintFade() { el.hints.classList.add('fade'); },
    standings(on) { el.stand.hidden = !on; if (!on) delete cache.rows; },
    hurt(level) { $('hurt').style.opacity = clamp(level, 0, 1).toFixed(2); },
    cine(on) { document.body.classList.toggle('cine', on); },
    fade(on) { $('fade').classList.toggle('on', on); },

    /** 每帧。W、Ht：画面的宽高（像素） */
    update(race, camera, W, Ht, dt) {
      const P = race.player, S = P.S;
      set('rank', el.rank, String(P.rank));
      set('suf', el.suf, ORD[P.rank - 1] || 'th');
      set('rankOf', el.rankOf, '/' + race.cars.length);
      set('lapNow', el.lapNow, String(race.state === 'race' || race.state === 'finish' ? clamp(P.lap, 1, race.laps) : 1));
      set('lapTotal', el.lapTotal, String(race.laps));
      const racing = race.state === 'race' || race.state === 'finish';
      set('lapTime', el.lapTime, fmt(racing ? race.raceT - P.lapT0 : 0));
      set('raceTime', el.raceTime, fmt(racing ? race.raceT : 0));
      set('best', el.best, fmt(P.laps.length ? Math.min(...P.laps) : NaN));
      set('zone', el.zone, ZONE_CN[T.zoneNames[T.zone[S.i]]] || '');
      if (race.wrongWay()) {                                                          // 逆行：一直挂着，直到掉头
        if (!cache.w) { cache.w = 1; el.msg.textContent = '逆行！按 R 回到赛道'; el.msg.className = 'warn show'; }
      } else if (cache.w) { cache.w = 0; el.msg.classList.remove('show', 'warn'); msgT = 0; }
      else if (msgT > 0) { msgT -= dt; if (msgT <= 0) el.msg.classList.remove('show', 'warn'); }

      // ——— 速度表 ———
      const kmh = Math.hypot(S.vx, S.vz) * 3.6, d = dpr(), side = gauge.clientWidth || 260;
      if (gauge.width !== Math.round(side * d)) gauge.width = gauge.height = Math.round(side * d);
      const k = gauge.width / GW;
      g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, GW, GW); g.translate(GW / 2, GW / 2);
      g.beginPath(); g.arc(0, 0, RING + 8, 0, Math.PI * 2); g.fillStyle = 'rgba(6, 16, 32, .62)'; g.fill();
      ring(RING, 0, Math.PI * 2, 13, 'rgba(255, 255, 255, .08)');                                    // 集气环
      if (S.gas > 0.003) { g.shadowBlur = 16; g.shadowColor = '#3fd4ff'; ring(RING, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(S.gas, 0, 1), 13, S.gas >= 1 ? '#ffd21e' : '#35ccff'); g.shadowBlur = 0; }
      ring(ARC, A0, A0 + SW, 15, 'rgba(255, 255, 255, .1)');                                          // 速度弧
      for (let q = 0; q <= 8; q++) { const a = A0 + (SW * q) / 8; ring(ARC + 17, a - 0.012, a + 0.012, 2, 'rgba(255, 255, 255, .35)'); }
      const sp = clamp(kmh / 320, 0, 1), boost = S.nitroT > 0 ? 1 : S.miniT > 0 ? 0.45 : 0;
      if (sp > 0.004) {
        const grad = g.createLinearGradient(-ARC, 0, ARC, 0);
        if (boost > 0) { grad.addColorStop(0, '#bfefff'); grad.addColorStop(1, '#2f8dff'); }
        else { grad.addColorStop(0, '#ffd21e'); grad.addColorStop(0.6, '#ff8a1e'); grad.addColorStop(1, '#ff3b30'); }
        g.shadowBlur = 14 + 14 * boost; g.shadowColor = boost > 0 ? '#4fc3ff' : '#ff8a1e';
        ring(ARC, A0, A0 + SW * sp, 15, grad); g.shadowBlur = 0;
      }
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `italic 900 62px ${NUM}`;
      g.shadowBlur = 18; g.shadowColor = boost > 0 ? 'rgba(80, 200, 255, .95)' : 'rgba(63, 212, 255, .6)';
      g.fillText(String(Math.round(kmh)), 0, -8); g.shadowBlur = 0;
      g.font = `700 15px ${NUM}`; g.fillStyle = '#9fd8f5'; g.fillText('km/h', 0, 34);
      g.font = '700 13px "Microsoft YaHei", sans-serif'; g.fillStyle = '#bfe6ff';
      g.fillText(S.drifting ? '漂移' : boost > 0.5 ? '氮气' : boost > 0 ? '小喷' : '', 0, 56);

      // ——— 道具赛：手里拿着的两件道具 ———
      const on = !!race.items?.on;
      if (cache.ion !== on) { cache.ion = on; el.items.hidden = !on; }
      if (on) race.player.items.forEach((key, i) => {
        const html = key ? ICON[key] || '' : '', s = el.slots[i];
        if (cache['it' + i] !== html) { cache['it' + i] = html; s.innerHTML = html; s.classList.toggle('empty', !key); }
        s.classList.toggle('on', !!key && i === race.player.slot);
      });

      // ——— 氮气瓶：已有的瓶是满的，正在喷的那瓶随着剩余时间排空 ———
      bottles.forEach((b, i) => {
        const full = i < S.nitro, using = i === S.nitro && S.nitroT > 0, h = full ? 100 : using ? clamp(S.nitroT / S.def.nitroTime, 0, 1) * 100 : 0;
        if (b.full !== full) { b.full = full; b.el.classList.toggle('full', full); }
        if (b.active !== using) { b.active = using; b.el.classList.toggle('active', using); }
        b.fill.style.height = h.toFixed(1) + '%';
      });

      // ——— 小地图 ———
      buildMap();
      mctx.clearRect(0, 0, MW, MH); mctx.drawImage(base, 0, 0);
      for (const c of race.cars) {
        if (c.isPlayer) continue;
        const [x, y] = toMap(c.S.x, c.S.z);
        mctx.beginPath(); mctx.arc(x, y, 4.2 * d, 0, Math.PI * 2); mctx.fillStyle = '#' + c.def.color.toString(16).padStart(6, '0'); mctx.fill();
        mctx.lineWidth = 1.5 * d; mctx.strokeStyle = '#04121f'; mctx.stroke();
      }
      const [px, py] = toMap(S.x, S.z), a = S.psi;                                                     // 地图上北朝上：x 向右、z 向下，正好和世界一致
      mctx.beginPath(); mctx.arc(px, py, 6.5 * d, 0, Math.PI * 2); mctx.fillStyle = '#ffd21e'; mctx.fill(); mctx.lineWidth = 2.5 * d; mctx.strokeStyle = '#fff'; mctx.stroke();
      mctx.beginPath(); mctx.moveTo(px + Math.cos(a) * 14 * d, py + Math.sin(a) * 14 * d);
      mctx.lineTo(px + Math.cos(a + 2.5) * 7 * d, py + Math.sin(a + 2.5) * 7 * d); mctx.lineTo(px + Math.cos(a - 2.5) * 7 * d, py + Math.sin(a - 2.5) * 7 * d);
      mctx.closePath(); mctx.fillStyle = '#fff'; mctx.fill();

      // ——— 名字牌 ———
      for (const c of race.cars) {
        if (c.isPlayer) continue;
        const dist = Math.hypot(c.S.x - S.x, c.S.z - S.z);
        v3.set(c.S.x, 2.0, c.S.z).project(camera);
        const t = tagOf(c);
        if (v3.z < 1 && Math.abs(v3.x) < 1.12 && Math.abs(v3.y) < 1.08 && dist < 170) {
          t.style.display = '';
          t.style.transform = `translate(${((v3.x + 1) / 2 * W).toFixed(1)}px, ${((1 - v3.y) / 2 * Ht).toFixed(1)}px) translate(-50%, -100%) scale(${clamp(1.25 - dist / 220, 0.6, 1.1).toFixed(2)})`;
          set('tag' + c.name, t.firstChild, String(c.rank));
        } else t.style.display = 'none';
      }

      // ——— 名次表（按住 Tab） ———
      if (!el.stand.hidden) {
        const rows = [...race.cars].sort((x, y) => x.rank - y.rank).map((c) => {
          let gap = '—';
          if (c !== P) gap = c.finished && P.finished ? fmtGap(Math.abs(c.finishT - P.finishT)) : (c.prog > P.prog ? '领先 ' : '落后 ') + Math.abs(c.prog - P.prog).toFixed(0) + ' m';
          return `<tr class="${c.isPlayer ? 'me' : ''}"><td>${c.rank}</td><td>${c.name}</td><td>${c.def.name}</td><td>${gap}</td><td>${fmt(c.laps.length ? Math.min(...c.laps) : NaN)}</td></tr>`;
        }).join('');
        const html = `<h3>实时名次</h3><table><tr><th>名次</th><th>车手</th><th>赛车</th><th>差距</th><th>最快圈</th></tr>${rows}</table>`;
        if (cache.rows !== html) { cache.rows = html; el.stand.innerHTML = html; }
      }
    },
  };
  return H;
}
