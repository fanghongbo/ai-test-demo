// 战斗界面：雷达、比分与计时、击杀播报、准星与命中标记、受击方向、弹药与血量、连杀横幅、阵亡倒计时、战绩板。
// 全部是 DOM + 一张雷达画布；数字每帧从对局状态里读，事件（击杀、命中、受击）从 game.onEvent 进来。
import { currentSpread } from '../game/weapons.js';
import { WEAPONS, RULES } from '../core/config.js';
import { wrapAngle } from '../core/mathx.js';

const NAME = { ak47: 'AK-47', m4a1: 'M4A1', awm: 'AWM', deagle: '沙漠之鹰', usp: 'USP', knife: '军刀', he: '高爆手雷' };
const SHORT = { ak47: 'AK-47', m4a1: 'M4A1', awm: 'AWM', deagle: '沙鹰', usp: 'USP', knife: '军刀', he: '手雷' };
const ICON = {
  rifle: '<path d="M1 7h5l1-3h3l1 3h19l7-2h10v3l-9 1-5 3h-4l-2 3h-4l1-3H15l-3 3H8l2-4H1z"/>',
  sniper: '<path d="M0 8h9V6h5l1-2h12v2h20v2H28v1H17l-1 3h-4l1-3H9l-2 3H3l2-3H0z"/><path d="M15 2h12v1.5H15z"/>',
  pistol: '<path d="M4 3h30v4H17l-2 6H7l3-6H4z"/>',
  melee: '<path d="M2 9 27 2l18 1-12 4 2 2-9 1-4 2z"/>',
  grenade: '<circle cx="10" cy="9" r="5"/><path d="M8 2h6v2H8zM14 3h4v1h-4z"/>',
  head: '<circle cx="8" cy="7" r="5.6"/><circle cx="6" cy="6" r="1.5" fill="#0b1016"/><circle cx="10.4" cy="6" r="1.5" fill="#0b1016"/><path d="M5.5 10.5h5v1.6h-5z" fill="#0b1016"/>',
};
const icon = (id) => `<svg class="wic" viewBox="0 0 48 16" aria-hidden="true">${ICON[WEAPONS[id].kind] || ICON.rifle}</svg>`;
const headIcon = () => `<svg class="wic wic--head" viewBox="0 0 16 16" aria-hidden="true">${ICON.head}</svg>`;
const MULTI = ['双杀', '三杀', '四杀', '五杀', '六杀', '七杀', '八杀', '九杀'];
const K = 5;                                                  // 雷达：像素 / 米（画布是 2 倍尺寸）

export function createHud(game, input, audio) {
  const $ = (id) => document.getElementById(id);
  const el = { hud: $('hud'), radar: $('radar'), gr: $('scoreGR'), bl: $('scoreBL'), bar: $('barGR'), clock: $('clock'), feed: $('feed'), cross: $('cross'), hit: $('hitmark'),
    dmg: $('dmgdir'), banners: $('banners'), hp: $('hpNum'), hpBar: $('hpBar'), ac: $('acNum'), acBar: $('acBar'), wname: $('wname'), ammo: $('ammo'), reserve: $('reserve'),
    slots: $('slots'), hint: $('hint'), scope: $('scope'), hurt: $('hurt'), flash: $('flash'), dead: $('dead'), deadText: $('deadText'), deadCount: $('deadCount'), board: $('board'), boardBody: $('boardBody') };
  const r = el.radar.getContext('2d');
  const OFF = document.createElement('canvas'); OFF.width = 400; OFF.height = 200;
  const OX = 200, OZ = 100;
  let hitT = 0, hitKill = false, hintT = 0, firstT = -1, heartT = 0, shown = false, boardT = 0, protectT = 0, hurtPulse = 0;
  const dmgList = [], feedList = [], bannerList = [];                          // 播报条、横幅的寿命按对局时间走（暂停就停），不靠 setTimeout
  const slotEls = [1, 2, 3, 4].map((k) => { const li = document.createElement('li'); el.slots.append(li); return li; });

  /** 静态地图：货舱地面 + 挡人的墙和箱子，画在一张离屏画布上（北朝上） */
  function buildMap(world) {
    const c = OFF.getContext('2d');
    c.clearRect(0, 0, OFF.width, OFF.height);
    c.fillStyle = 'rgba(104,120,132,0.34)';
    c.fillRect(OX - 31.5 * K, OZ - 10.6 * K, 63 * K, 21.2 * K);
    c.fillStyle = 'rgba(206,214,220,0.66)';
    for (const s of world.solids) {
      if (s.tag === 'ceiling' || s.y1 - s.y0 < 0.9 || s.y0 > 1.2) continue;
      c.beginPath();
      for (const [lx, lz] of [[-s.hx, -s.hz], [s.hx, -s.hz], [s.hx, s.hz], [-s.hx, s.hz]]) c.lineTo(OX + (s.x + s.c * lx - s.s * lz) * K, OZ + (s.z + s.s * lx + s.c * lz) * K);
      c.closePath(); c.fill();
    }
  }
  function drawRadar(p) {
    const n = el.radar.width, C = n / 2, cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    r.setTransform(1, 0, 0, 1, 0, 0);
    r.clearRect(0, 0, n, n);
    r.save();
    r.beginPath(); r.arc(C, C, C - 3, 0, Math.PI * 2); r.clip();
    r.fillStyle = 'rgba(5,9,13,0.6)'; r.fillRect(0, 0, n, n);
    r.translate(C, C); r.transform(-sy, -cy, cy, -sy, 0, 0); r.translate(-(OX + p.body.x * K), -(OZ + p.body.z * K));
    r.drawImage(OFF, 0, 0);
    r.restore();
    for (const a of game.actors) {                            // 队友常显；敌人被看见或开枪时才显影
      if (a === p || !a.alive) continue;
      const enemy = a.team !== p.team;
      if (enemy && a.spotted < game.state.now) continue;
      const dx = a.body.x - p.body.x, dz = a.body.z - p.body.z, u = (-dx * sy + dz * cy) * K, v = (-dx * cy - dz * sy) * K;
      r.fillStyle = 'rgba(0,0,0,0.55)'; r.beginPath(); r.arc(C + u + 1, C + v + 2, 8, 0, Math.PI * 2); r.fill();
      r.fillStyle = enemy ? '#ff5a36' : '#58a6ff'; r.beginPath(); r.arc(C + u, C + v, 7, 0, Math.PI * 2); r.fill();
      r.strokeStyle = 'rgba(255,255,255,0.85)'; r.lineWidth = 2; r.stroke();
      if (!enemy) {                                            // 队友的朝向
        const ay = a.yaw - p.yaw;
        r.strokeStyle = '#cfe4ff'; r.lineWidth = 3; r.beginPath(); r.moveTo(C + u, C + v); r.lineTo(C + u - Math.sin(ay) * 15, C + v - Math.cos(ay) * 15); r.stroke();
      }
    }
    r.fillStyle = '#ffffff'; r.strokeStyle = 'rgba(0,0,0,0.7)'; r.lineWidth = 2;
    r.beginPath(); r.moveTo(C, C - 13); r.lineTo(C + 9, C + 9); r.lineTo(C, C + 4); r.lineTo(C - 9, C + 9); r.closePath(); r.fill(); r.stroke();
    const nx = -cy * 150, nz = sy * 150;                       // 正北（-Z）
    r.font = '700 22px Arial, sans-serif'; r.textAlign = 'center'; r.textBaseline = 'middle';
    r.lineWidth = 4; r.strokeStyle = 'rgba(0,0,0,0.8)'; r.strokeText('N', C + nx * 0.84, C + nz * 0.84);
    r.fillStyle = '#e8b23a'; r.fillText('N', C + nx * 0.84, C + nz * 0.84);
  }

  function banner(text, cls = '') {
    const d = document.createElement('div');
    d.className = 'bn ' + cls; d.textContent = text;
    el.banners.append(d);
    bannerList.push({ d, t: 1.55 });
    while (el.banners.children.length > 3) { el.banners.firstElementChild.remove(); bannerList.shift(); }
  }
  function feedItem(ev) {
    const li = document.createElement('li'), k = ev.killer, v = ev.victim;
    const name = (a, cls) => `<b class="${cls}">${a.name}</b>`;
    li.innerHTML = k ? `${name(k, k.team === 0 ? 't-gr' : 't-bl')}${icon(ev.weapon)}${ev.head ? headIcon() : ''}${name(v, v.team === 0 ? 't-gr' : 't-bl')}`
      : `<b class="${v.team === 0 ? 't-gr' : 't-bl'}">${v.name}</b>${icon('knife')}<span class="feed__txt">坠落</span>`;
    el.feed.prepend(li);
    feedList.push({ li, t: 6.5 });
    while (el.feed.children.length > 5) { el.feed.lastElementChild.remove(); feedList.shift(); }
  }

  function event(ev) {
    const p = game.player;
    if (ev.type === 'hit') {
      hitT = 0.2; hitKill = ev.killed;
      if (!ev.melee) audio.local(ev.part === 'head' ? 'headshot' : 'hitmarker', { gain: ev.part === 'head' ? 0.7 : 0.55 });
    } else if (ev.type === 'kill') {
      feedItem(ev);
      if (ev.killer === p) {
        const n = Math.min(ev.multi, MULTI.length);
        audio.local('kill' + Math.min(ev.multi - 1, 5), { gain: 0.75 });
        if (n >= 2) banner(MULTI[Math.min(n, MULTI.length + 1) - 2] + '！', 'bn--multi');       // 第 2 个是“双杀”
        else if (ev.first) banner('首杀', 'bn--gold');
        if (ev.head) banner('爆头', 'bn--head');
      } else if (ev.victim === p) banner('你被击倒了', 'bn--dead');
      else if (ev.friendly) banner('队友击倒了队友', 'bn--dead');
    } else if (ev.type === 'damage') {
      dmgList.push({ rel: ev.rel, t: 1.2 });
      el.flash.style.opacity = String(Math.min(0.55, ev.amount / 70));
      hurtPulse = 1;
    } else if (ev.type === 'spawn' && ev.actor === p) {
      protectT = RULES.protect; el.dead.hidden = true;
      if (firstT < 0) firstT = game.state.now;
    } else if (ev.type === 'start') { firstT = -1; el.feed.innerHTML = ''; el.banners.innerHTML = ''; feedList.length = 0; bannerList.length = 0; }
  }

  function updateBoard() {
    const rows = (team) => game.actors.filter((a) => a.team === team).sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)
      .map((a) => `<tr class="${a === game.player ? 'is-me' : ''}"><td>${a.name}</td><td>${a.kills}</td><td>${a.deaths}</td><td>${a.headKills}</td></tr>`).join('');
    el.boardBody.innerHTML = `<tr><th colspan="4" class="th-gr">保卫者 ${game.state.scores[0]}</th></tr>${rows(0)}<tr><th colspan="4" class="th-bl">潜伏者 ${game.state.scores[1]}</th></tr>${rows(1)}`;
  }

  const api = {
    buildMap,
    show(v) { shown = v; el.hud.hidden = !v; },
    event,
    update(dt) {
      const p = game.player, s = game.state;
      if (!shown || !p) return;
      const w = p.w, alive = p.alive;
      el.gr.textContent = s.scores[0]; el.bl.textContent = s.scores[1];
      el.bar.style.width = `${Math.min(100, (s.scores[0] / s.target) * 100)}%`;
      const t = Math.ceil(s.left), low = t < 30;
      el.clock.textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
      el.clock.classList.toggle('is-low', low);
      el.hp.textContent = Math.max(0, Math.ceil(p.hp)); el.ac.textContent = Math.max(0, Math.ceil(p.armor));
      el.hpBar.style.width = `${Math.max(0, p.hp)}%`; el.acBar.style.width = `${Math.max(0, p.armor)}%`;
      el.hpBar.classList.toggle('is-low', p.hp <= 30);
      el.wname.textContent = NAME[w.id];
      const kind = w.def.kind;
      el.ammo.textContent = kind === 'melee' ? '—' : kind === 'grenade' ? w.count : w.ammo;
      el.reserve.textContent = w.def.mag ? `/ ${w.reserve}` : '';
      el.ammo.classList.toggle('is-low', w.def.mag > 0 && w.ammo <= Math.ceil(w.def.mag * 0.2));
      for (const k of [1, 2, 3, 4]) {
        const sw = p.slots[k], li = slotEls[k - 1], empty = sw.def.kind === 'grenade' ? sw.count <= 0 : sw.def.mag ? sw.ammo + sw.reserve <= 0 : false;
        li.className = (k === p.slot ? 'is-on ' : '') + (empty ? 'is-empty' : '');
        li.innerHTML = `<i>${k}</i>${SHORT[sw.id]}${sw.def.kind === 'grenade' ? ` ×${sw.count}` : ''}`;
      }
      // 准星：间隙跟着散布走；瞄准、开镜、持刀时不画
      const spread = alive ? currentSpread(p) : 0, hideCross = !alive || w.ads > 0.55 || kind === 'melee' || kind === 'grenade';
      el.cross.hidden = hideCross;
      if (!hideCross) {
        const gap = 5 + spread * 9;
        el.cross.style.setProperty('--gap', `${gap.toFixed(1)}px`);
      }
      const scoped = alive && kind === 'sniper' && w.ads > 0.9;
      el.scope.hidden = !scoped;
      if (scoped) el.scope.dataset.zoom = p.zoom === 2 ? '2' : '1';
      // 命中标记
      if (hitT > 0) { hitT -= dt; el.hit.className = 'hitmark is-on' + (hitKill ? ' is-kill' : ''); } else el.hit.className = 'hitmark';
      for (let i = bannerList.length - 1; i >= 0; i--) {
        const b = bannerList[i]; b.t -= dt;
        if (b.t <= 0.45) b.d.classList.add('is-out');
        if (b.t <= 0) { b.d.remove(); bannerList.splice(i, 1); }
      }
      for (let i = feedList.length - 1; i >= 0; i--) { const f = feedList[i]; f.t -= dt; if (f.t <= 0) { f.li.remove(); feedList.splice(i, 1); } }
      // 受击方向
      for (let i = dmgList.length - 1; i >= 0; i--) {
        const d = dmgList[i]; d.t -= dt;
        if (d.t <= 0) { dmgList.splice(i, 1); continue; }
      }
      el.dmg.innerHTML = dmgList.map((d) => `<i style="--rot:${(d.rel * 57.2958).toFixed(1)}deg;opacity:${Math.min(1, d.t).toFixed(2)}"></i>`).join('');
      // 低血量：红晕 + 心跳
      hurtPulse *= Math.exp(-dt * 3);
      const lowHp = alive && p.hp <= 30;
      el.hurt.style.opacity = String(alive ? Math.max(hurtPulse * 0.9, lowHp ? 0.45 + 0.15 * Math.sin(game.state.now * 6) : p.hp < 70 ? (70 - p.hp) / 70 * 0.35 : 0) : 0.8);
      if (lowHp) { heartT -= dt; if (heartT <= 0) { heartT = 0.95; audio.local('heartbeat', { gain: 0.6 }); } }
      el.flash.style.opacity = String(Number(el.flash.style.opacity || 0) * Math.exp(-dt * 6));
      // 阵亡
      if (!alive) {
        el.dead.hidden = false;
        const k = p.deathInfo;
        el.deadText.textContent = k ? `${k.name} 用 ${NAME[k.weapon] || '武器'}${k.head ? '爆头' : ''}击倒了你` : '你坠落了';
        el.deadCount.textContent = Math.max(0, Math.ceil(p.respawnAt - s.now));
      } else if (protectT > 0) { protectT -= dt; }
      // 提示
      hintT -= dt;
      let hint = '';
      if (alive) {
        if (w.def.mag && w.ammo === 0 && w.reserve > 0 && w.reload <= 0) hint = '按 R 换弹';
        else if (w.def.mag && w.ammo <= Math.ceil(w.def.mag * 0.2) && w.ammo > 0 && w.reload <= 0) hint = '弹药不多了';
        else if (w.def.mag && w.ammo === 0 && w.reserve === 0) hint = '子弹打光了，按 1 / 2 / 3 换武器';
        else if (s.now - firstT < 9 && firstT >= 0) hint = 'WASD 移动 · 左键开火 · 右键瞄准 · R 换弹 · 1 2 3 4 换武器 · G 手雷 · Tab 战绩';
      }
      el.hint.textContent = hint;
      el.hint.classList.toggle('is-urgent', hint === '按 R 换弹' || hint.startsWith('子弹'));
      // 雷达
      if (alive || s.now % 1 < dt * 2) drawRadar(p);
      // 战绩板
      const tab = input.keys.has('Tab');
      if (tab !== !el.board.hidden) el.board.hidden = !tab;
      if (tab) { boardT -= dt; if (boardT <= 0) { boardT = 0.4; updateBoard(); } }
    },
  };
  api.buildMap(game.W.world);
  return api;
}
