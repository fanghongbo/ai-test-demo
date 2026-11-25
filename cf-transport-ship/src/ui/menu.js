// 大厅（阵营 / 人数 / 难度 / 主武器 / 击杀目标 / 时刻 + 操作与设置）、暂停菜单、结算画面。设置存在浏览器的 localStorage 里。
const KEY = 'ship.settings.v1';
export const DEFAULTS = Object.freeze({ team: 0, size: 4, diff: 'normal', primary: 'ak47', target: 50, hour: 15.5, sens: 1, fov: 75, invertY: false, roll: true, quality: 'auto', vol: 0.8, music: 0.55 });
const NUM = { team: Number, size: Number, target: Number, hour: Number, sens: Number, fov: Number, vol: Number, music: Number };

export function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { return { ...DEFAULTS }; }
}
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* 隐私模式等存不进去：这次仍然生效 */ } }
const fmt = (k, v) => (k === 'sens' ? Number(v).toFixed(2) : k === 'vol' || k === 'music' ? `${Math.round(v * 100)}%` : String(v));

/**
 * @param o { settings, audio, onChange(key, settings), onStart, onResume, onLobby }
 */
export function createMenu(o) {
  const $ = (id) => document.getElementById(id);
  const S = o.settings;
  const parse = (key, v) => (NUM[key] ? NUM[key](v) : v);
  function sync() {
    for (const seg of document.querySelectorAll('.seg[data-key]')) for (const b of seg.querySelectorAll('button')) b.classList.toggle('is-on', String(S[seg.dataset.key]) === b.dataset.v);
    for (const i of document.querySelectorAll('input[type=range][data-key]')) {
      i.value = S[i.dataset.key];
      const out = i.parentElement.querySelector('output');
      if (out) out.textContent = fmt(i.dataset.key, S[i.dataset.key]);
    }
    for (const c of document.querySelectorAll('input[type=checkbox][data-key]')) c.checked = !!S[c.dataset.key];
  }
  function set(key, v) {
    S[key] = v;
    sync(); save(S);
    o.audio?.local('ui_click', { gain: 0.45 });
    if (o.onChange) o.onChange(key, S);
  }
  for (const seg of document.querySelectorAll('.seg[data-key]')) seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) set(seg.dataset.key, parse(seg.dataset.key, b.dataset.v)); });
  for (const i of document.querySelectorAll('input[type=range][data-key]')) i.addEventListener('input', () => set(i.dataset.key, parse(i.dataset.key, i.value)));
  for (const c of document.querySelectorAll('input[type=checkbox][data-key]')) c.addEventListener('change', () => set(c.dataset.key, c.checked));
  $('btnStart').addEventListener('click', () => { o.audio?.start(); o.onStart(); });
  $('btnResume').addEventListener('click', () => o.onResume());
  $('btnLobby').addEventListener('click', () => o.onLobby());
  $('btnLobby2').addEventListener('click', () => o.onLobby());
  $('btnRestart').addEventListener('click', () => o.onStart());
  sync();

  const table = (actors, me) => {
    const row = (a) => `<tr class="${a === me ? 'is-me' : ''}"><td>${a.name}</td><td>${a.kills}</td><td>${a.deaths}</td><td>${a.headKills}</td></tr>`;
    const rows = (team) => actors.filter((a) => a.team === team).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths).map(row).join('');
    return `<tr><th colspan="4" class="th-gr">保卫者</th></tr>${rows(0)}<tr><th colspan="4" class="th-bl">潜伏者</th></tr>${rows(1)}`;
  };
  return {
    settings: S,
    sync,
    /** name：menu / pause / result / null */
    show(name) { for (const id of ['menu', 'pause', 'result']) $(id).hidden = id !== name; },
    pauseScore(text) { $('pauseScore').textContent = text; },
    result({ winner, scores, actors, player }) {
      const won = winner === player.team;
      $('resultTitle').textContent = scores[0] === scores[1] ? '平局' : won ? '胜利' : '战败';
      $('resultTitle').className = 'panel__title ' + (scores[0] === scores[1] ? '' : won ? 'is-win' : 'is-lose');
      $('resultScore').innerHTML = `<b class="t-gr">${scores[0]}</b><span>:</span><b class="t-bl">${scores[1]}</b>`;
      $('resultTable').innerHTML = table(actors, player);
      const mvp = [...actors].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)[0];
      $('resultMvp').textContent = mvp ? `全场最佳：${mvp.name}（${mvp.kills} 击杀 / ${mvp.deaths} 阵亡）` : '';
    },
  };
}
