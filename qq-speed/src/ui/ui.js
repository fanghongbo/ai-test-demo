// 大厅（比赛设置、车库）、结算、暂停、操作说明、提示条。设置和最佳圈速存在 localStorage 里。
import { CARS } from '../core/cardef.js';
import { TIMES } from '../core/palette.js';
import { KEY_HELP } from '../game/input.js';
import { fmt } from './hud.js';
import { ORDINAL } from '../game/race.js';

const $ = (id) => document.getElementById(id);
const STORE = 'nova.settings', BEST = 'nova.best';
export const DEFAULTS = { car: 'leinuo', mode: 'speed', laps: 2, rivals: 5, level: 'pro', time: 'afternoon', quality: 2, sound: true };
export const LEVELS = Object.freeze({ rookie: { name: '新手', skill: 0.92 }, pro: { name: '车手', skill: 0.98 }, ace: { name: '车神', skill: 1.04 } });
const OPTIONS = [
  { key: 'mode', label: '模式', items: [['speed', '竞速赛'], ['item', '道具赛']] },
  { key: 'laps', label: '圈数', items: [[1, '1 圈'], [2, '2 圈'], [3, '3 圈']] },
  { key: 'rivals', label: '对手', items: [[0, '练习'], [2, '2 人'], [4, '4 人'], [5, '5 人']] },
  { key: 'level', label: '难度', items: Object.entries(LEVELS).map(([k, v]) => [k, v.name]) },
  { key: 'time', label: '时刻', items: TIMES.map((t) => [t.id, t.name]) },
  { key: 'quality', label: '画质', items: [[0, '流畅'], [1, '均衡'], [2, '极致']] },
  { key: 'sound', label: '声音', items: [[true, '开'], [false, '关']] },
];
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 隐私模式下存不了，无所谓 */ } };
const ALLOWED = Object.fromEntries(OPTIONS.map((o) => [o.key, o.items.map(([v]) => v)]));
/** 读回设置。存的值不在选项里（旧版本留下的、手工改坏的，比如圈数是 0）就退回默认值，不然比赛一开就结束 */
export function loadSettings() {
  const s = { ...DEFAULTS, ...load(STORE, {}) }, out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) {
    if (k === 'car') { if (CARS.some((c) => c.id === s.car)) out.car = s.car; }
    else if (ALLOWED[k].includes(s[k])) out[k] = s[k];
  }
  return out;
}
export const saveSettings = (s) => save(STORE, s);
export const bestKey = (car, laps, mode) => (mode === 'item' ? `${car}/${laps}/item` : `${car}/${laps}`);
export const loadBest = (car, laps, mode) => load(BEST, {})[bestKey(car, laps, mode)];
export function saveBest(car, laps, lap, mode) {
  const all = load(BEST, {}), k = bestKey(car, laps, mode);
  if (!(all[k] <= lap)) { all[k] = lap; save(BEST, all); return true; }
  return false;
}

function drawRadar(canvas, def) {
  const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2 + 6, R = Math.min(w, h) / 2 - 26, names = ['速度', '加速', '转向', '漂移', '集气'];
  c.clearRect(0, 0, w, h);
  const pt = (k, r) => { const a = -Math.PI / 2 + (k / 5) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  for (const ring of [0.34, 0.67, 1]) {
    c.beginPath(); for (let k = 0; k <= 5; k++) { const [x, y] = pt(k % 5, R * ring); if (k) c.lineTo(x, y); else c.moveTo(x, y); }
    c.strokeStyle = 'rgba(63, 212, 255, .28)'; c.lineWidth = 1; c.stroke();
  }
  for (let k = 0; k < 5; k++) { const [x, y] = pt(k, R); c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke(); }
  c.beginPath();
  def.radar.forEach((v, k) => { const [x, y] = pt(k, R * Math.max(0.08, Math.min(1, v))); if (k) c.lineTo(x, y); else c.moveTo(x, y); });
  c.closePath(); c.fillStyle = 'rgba(63, 190, 255, .32)'; c.fill(); c.strokeStyle = '#8fe6ff'; c.lineWidth = 2; c.stroke();
  def.radar.forEach((v, k) => { const [x, y] = pt(k, R * Math.max(0.08, Math.min(1, v))); c.beginPath(); c.arc(x, y, 3.4, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); });
  c.font = '700 13px "Microsoft YaHei", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#bfe6ff';
  names.forEach((n, k) => { const [x, y] = pt(k, R + 17); c.fillText(n, x, y - (k === 0 ? 4 : 0)); });
}

/**
 * 界面控制器。handlers：{ onStart, onAgain, onLobby, onResume, onRestart, onSettings, onCar, sfx, muted }
 */
export function createUi(handlers) {
  const S = loadSettings();
  let carIdx = Math.max(0, CARS.findIndex((c) => c.id === S.car)), helpFrom = null, toastT = 0;
  const els = { menu: $('menu'), results: $('results'), pause: $('pause'), help: $('help'), toast: $('toast') };

  // ———— 比赛设置 ————
  const setup = $('setup');
  setup.innerHTML = '<h3>比赛设置</h3>';
  const segs = {};
  for (const opt of OPTIONS) {
    const row = document.createElement('div'); row.className = 'opt';
    const lab = document.createElement('label'); lab.textContent = opt.label;
    const seg = document.createElement('div'); seg.className = 'seg';
    opt.items.forEach(([v, name]) => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.v = String(v);
      const sp = document.createElement('span'); sp.textContent = name; b.appendChild(sp);
      b.addEventListener('click', () => { S[opt.key] = v; saveSettings(S); refreshSetup(); handlers.sfx?.('click'); handlers.onSettings?.(S, opt.key); });
      seg.appendChild(b);
    });
    row.append(lab, seg); setup.appendChild(row); segs[opt.key] = seg;
  }
  const refreshSetup = () => {
    for (const [key, seg] of Object.entries(segs)) for (const b of seg.children) b.classList.toggle('on', b.dataset.v === String(S[key]));
  };

  // ———— 车库 ————
  const refreshCar = (notify = true) => {
    const def = CARS[carIdx];
    $('carCls').textContent = def.cls; $('carCls').className = 'cls ' + def.cls;
    $('carName').textContent = def.name; $('carDesc').textContent = def.desc;
    $('carTags').innerHTML = ''; def.tags.forEach((t) => { const s = document.createElement('span'); s.textContent = t; $('carTags').appendChild(s); });
    $('carSpecs').innerHTML = [
      ['极速', def.vmax, 'km/h'], ['加速', (27.8 / def.accel).toFixed(1), 's'], ['氮气极速', def.vmax + def.nitroPlus, 'km/h'], ['氮气时长', def.nitroTime.toFixed(1), 's'],
    ].map(([k, v, u]) => `<div><dt>${k}</dt><dd>${v}<small>${u}</small></dd></div>`).join('');
    drawRadar($('radar'), def);
    const b = loadBest(def.id, S.laps, S.mode);
    $('bestRecord').textContent = b ? `最佳单圈 ${fmt(b)}` : '这辆车还没有跑过';
    S.car = def.id; saveSettings(S);
    if (notify) handlers.onCar?.(def);                                                    // 第一次刷新时比赛还没建起来，不通知
  };
  const turnCar = (d) => { carIdx = (carIdx + d + CARS.length) % CARS.length; refreshCar(); handlers.sfx?.('click'); };
  $('carPrev').addEventListener('click', () => turnCar(-1));
  $('carNext').addEventListener('click', () => turnCar(1));
  $('startBtn').addEventListener('click', () => handlers.onStart?.());
  $('againBtn').addEventListener('click', () => handlers.onAgain?.());
  $('lobbyBtn').addEventListener('click', () => handlers.onLobby?.());
  $('resumeBtn').addEventListener('click', () => handlers.onResume?.());
  $('restartBtn').addEventListener('click', () => handlers.onRestart?.());
  $('pauseLobbyBtn').addEventListener('click', () => handlers.onLobby?.());
  $('muteBtn').addEventListener('click', () => { S.sound = !S.sound; saveSettings(S); refreshSetup(); handlers.onSettings?.(S, 'sound'); });
  for (const id of ['helpBtn', 'pauseHelpBtn']) $(id).addEventListener('click', () => api.help.show($(id) === $('pauseHelpBtn') ? 'pause' : 'menu'));
  $('helpClose').addEventListener('click', () => api.help.close());
  $('keyTable').innerHTML = KEY_HELP.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  const api = {
    S,
    car: () => CARS[carIdx],
    refreshSetup,
    refreshRecord: () => { const b = loadBest(CARS[carIdx].id, S.laps, S.mode); $('bestRecord').textContent = b ? `最佳单圈 ${fmt(b)}` : '这辆车还没有跑过'; },
    show(id, on) { els[id].hidden = !on; },
    /** 提示条（切歌、切画质……） */
    toast(text) {
      els.toast.textContent = text; els.toast.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(() => els.toast.classList.remove('show'), 2200);
    },
    help: {
      get open() { return !els.help.hidden; },
      show(from) { helpFrom = from; els.help.hidden = false; handlers.sfx?.('click'); },
      close() { els.help.hidden = true; if (helpFrom === 'menu') { els.menu.hidden = false; } else if (helpFrom === 'pause') { els.pause.hidden = false; } helpFrom = null; },
    },
    /** 结算 */
    results(race) {
      const P = race.player, place = $('resPlace');
      place.textContent = ORDINAL[P.rank - 1] || `第 ${P.rank} 名`;
      place.className = P.rank === 1 ? '' : P.rank === 2 ? 'silver' : P.rank === 3 ? 'bronze' : 'plain';
      $('resBoard').innerHTML = [...race.cars].sort((a, b) => a.rank - b.rank).map((c) =>
        `<tr class="${c.isPlayer ? 'me' : ''}"><td>${c.rank}</td><td>${c.name}</td><td>${c.def.name}</td><td>${c.finished ? fmt(c.finishT) : '未完成'}</td><td>${fmt(c.laps.length ? Math.min(...c.laps) : NaN)}</td></tr>`).join('');
      const s = P.stats, best = P.laps.length ? Math.min(...P.laps) : NaN;
      const tiles = race.mode === 'item'
        ? [['最高时速', Math.round(s.top) + ' km/h'], ['最快单圈', fmt(best)], ['使用道具', s.items + ' 次'], ['道具命中', s.itemHits + ' 次'], ['被打中', s.spun + ' 次'], ['天使挡下', s.blocks + ' 次']]
        : [['最高时速', Math.round(s.top) + ' km/h'], ['最快单圈', fmt(best)], ['漂移', s.drifts + ' 次'], ['小喷', s.mini + ' 次'], ['双喷', s.dbl + ' 次'], ['WCW', s.wcw + ' 次']];
      $('resStats').innerHTML = tiles.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
      if (P.finished && P.laps.length && saveBest(P.def.id, race.laps, best, race.mode)) api.toast('新纪录！最佳单圈 ' + fmt(best));
      els.results.hidden = false;
    },
    /** 键盘：在大厅、结算、暂停、说明里按的方向键和确认键。处理了返回 true */
    key(action) {
      if (!els.help.hidden) { if (action === 'pause' || action === 'enter' || action === 'back') { api.help.close(); return true; } return false; }
      if (!els.results.hidden) { if (action === 'enter') { handlers.onAgain?.(); return true; } if (action === 'pause' || action === 'back') { handlers.onLobby?.(); return true; } return false; }
      if (!els.pause.hidden) { if (action === 'pause' || action === 'enter') { handlers.onResume?.(); return true; } if (action === 'back') { handlers.onLobby?.(); return true; } return false; }
      if (!els.menu.hidden) {
        if (action === 'left') { turnCar(-1); return true; }
        if (action === 'right') { turnCar(1); return true; }
        if (action === 'enter') { handlers.onStart?.(); return true; }
      }
      return false;
    },
    get inMenu() { return !els.menu.hidden; },
    get inResults() { return !els.results.hidden; },
    get inPause() { return !els.pause.hidden; },
  };
  refreshSetup(); refreshCar(false);
  return api;
}
