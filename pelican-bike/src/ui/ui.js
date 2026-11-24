// 界面：顶栏、骑行数据卡（大数字 + 仪表弧 + 资料块 + 迷你折线）、提示条、开场、帮助、设置。
// 只在数值变化时写 DOM；所有图标按钮都有可访问名称；设置存 localStorage。
import { icon } from './icons.js';

export const STYLE_LABELS = Object.freeze(['写实', '赛璐璐', '排线', '线稿']);     // 与 S.style 的序号一一对应
export const STATUS_META = Object.freeze({
  pedal: { label: '踩踏', icon: 'bicycle' }, coast: { label: '滑行', icon: 'arrows-vertical' }, brake: { label: '刹车', icon: 'arrow-bend-double-up-left' }, stop: { label: '停车', icon: 'pause' },
});
const STORE_KEY = 'pelican-ride.settings.v1';
const MAX_SPEED = 45, SPARK_N = 12;
const $ = (id) => document.getElementById(id);
const pct = (x) => `${Math.round(x * 100)}%`;

export function createUI(actions) {
  const el = {};
  for (const id of ['view', 'fade', 'clock', 'todLabel', 'speed', 'meter', 'meterFill', 'cadence', 'gear', 'distance', 'status', 'statusLabel', 'spark', 'sparkTip', 'toasts', 'intro', 'help', 'settings', 'error',
    'btnCam', 'btnTime', 'btnStyle', 'btnMusic', 'btnMute', 'btnPause', 'btnPhoto', 'btnHelp', 'btnHelpClose', 'btnSettings', 'btnSettingsClose', 'btnStart', 'btnStartMute', 'btnReset', 'btnSculptReset',
    'setSpeed', 'outSpeed', 'setOutline', 'outOutline', 'setQuality', 'setVolume', 'outVolume', 'setMusic', 'setDayCycle', 'setReduced', 'setDof', 'setBloom', 'setBars', 'setBeak', 'outBeak', 'setPouch', 'outPouch', 'setNeck', 'outNeck', 'setBody', 'outBody', 'hints']) el[id] = $(id);
  // 图标注入
  for (const n of document.querySelectorAll('[data-icon]')) n.innerHTML = icon(n.dataset.icon, Number(n.dataset.size) || 20);
  const setIcon = (btn, name) => { btn.querySelector('span[data-icon]').innerHTML = icon(name); };

  const cache = new Map();
  const text = (node, key, value) => { if (cache.get(key) !== value) { cache.set(key, value); node.textContent = value; } };
  const attr = (node, key, name, value) => { const k = key + ':' + name; if (cache.get(k) !== value) { cache.set(k, value); node.setAttribute(name, value); } };

  // ————— 设置持久化 —————
  const defaults = { outline: 1.6, quality: 'auto', volume: 80, music: true, dayCycle: false, reduced: false, dof: true, bloom: true, bars: true, sculpt: { beak: 1, pouch: 1, neck: 1, body: 1 } };
  const load = () => { try { const raw = localStorage.getItem(STORE_KEY); return raw ? { ...defaults, ...JSON.parse(raw), sculpt: { ...defaults.sculpt, ...(JSON.parse(raw).sculpt || {}) } } : { ...defaults }; } catch (e) { return { ...defaults }; } };
  const save = (s) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) { /* 隐私模式下不可写：忽略 */ } };

  // ————— 按钮与输入 —————
  const click = (node, fn) => node.addEventListener('click', (e) => { e.currentTarget.blur(); fn(e); });
  click(el.btnStart, () => actions.start(false));
  click(el.btnStartMute, () => actions.start(true));
  click(el.btnCam, () => actions.cam());
  click(el.btnTime, () => actions.time());
  click(el.btnStyle, () => actions.style());
  click(el.btnMusic, () => actions.music());
  click(el.btnMute, () => actions.mute());
  click(el.btnPause, () => actions.pause());
  click(el.btnPhoto, () => actions.photo());
  click(el.btnHelp, () => openHelp(true));
  click(el.btnHelpClose, () => openHelp(false));
  click(el.btnSettings, () => openSettings(el.settings.hidden));
  click(el.btnSettingsClose, () => openSettings(false));
  click(el.btnReset, () => actions.reset());
  click(el.btnSculptReset, () => { for (const [k, node, out] of sculptInputs) { node.value = String(defaults.sculpt[k]); out.textContent = pct(defaults.sculpt[k]); } actions.sculptReset(); });
  for (const b of document.querySelectorAll('.touch__btn')) {
    const act = b.dataset.act, hold = b.dataset.hold;
    if (act) b.addEventListener('click', () => actions.act(act));
    if (hold) {
      const on = (e) => { e.preventDefault(); actions.hold(hold, true); }, off = () => actions.hold(hold, false);
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('pointerleave', off);
    }
  }
  const onRange = (node, fn) => node.addEventListener('input', () => fn(Number(node.value)));
  onRange(el.setSpeed, (v) => { el.outSpeed.textContent = `${v} km/h`; actions.setTarget(v); });
  onRange(el.setOutline, (v) => { el.outOutline.textContent = `${v.toFixed(1)} px`; actions.setOutline(v); });
  onRange(el.setVolume, (v) => { el.outVolume.textContent = `${v}%`; actions.setVolume(v); });
  el.setQuality.addEventListener('change', () => actions.setQuality(el.setQuality.value));
  el.setMusic.addEventListener('change', () => actions.setMusic(el.setMusic.checked));
  el.setDayCycle.addEventListener('change', () => actions.setDayCycle(el.setDayCycle.checked));
  el.setReduced.addEventListener('change', () => actions.setReduced(el.setReduced.checked));
  el.setDof.addEventListener('change', () => actions.setDof(el.setDof.checked));
  el.setBloom.addEventListener('change', () => actions.setBloom(el.setBloom.checked));
  el.setBars.addEventListener('change', () => actions.setBars(el.setBars.checked));
  const sculptInputs = [['beak', el.setBeak, el.outBeak], ['pouch', el.setPouch, el.outPouch], ['neck', el.setNeck, el.outNeck], ['body', el.setBody, el.outBody]];
  for (const [k, node, out] of sculptInputs) onRange(node, (v) => { out.textContent = pct(v); actions.sculpt(k, v); });

  /** 把一份设置写回控件（启动时与外部改动后调用） */
  function reflectSettings(s, extra = {}) {
    el.setSpeed.value = String(Math.round(extra.targetKmh ?? 15)); el.outSpeed.textContent = `${el.setSpeed.value} km/h`;
    el.setOutline.value = String(s.outline); el.outOutline.textContent = `${Number(s.outline).toFixed(1)} px`;
    el.setQuality.value = String(s.quality);
    el.setVolume.value = String(s.volume); el.outVolume.textContent = `${s.volume}%`;
    el.setMusic.checked = !!s.music; el.setDayCycle.checked = !!s.dayCycle; el.setReduced.checked = !!s.reduced;
    el.setDof.checked = s.dof !== false; el.setBloom.checked = s.bloom !== false; el.setBars.checked = s.bars !== false;
    for (const [k, node, out] of sculptInputs) { node.value = String(s.sculpt[k]); out.textContent = pct(s.sculpt[k]); }
  }

  // ————— 模态焦点陷阱：Tab / Shift+Tab 只在 aria-modal 容器内循环 —————
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const active = document.activeElement;
    const box = active && active.closest ? active.closest('[aria-modal="true"]') : null;
    if (!box) return;
    const items = [...box.querySelectorAll(FOCUSABLE)].filter((n) => n.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  });

  // ————— 面板开合 —————
  let lastFocus = null;
  function openHelp(open) {
    if (open === !el.help.hidden) return;
    el.help.hidden = !open;
    document.body.classList.toggle('has-modal', open);
    if (open) { lastFocus = document.activeElement; openSettings(false); el.btnHelpClose.focus(); }
    else (lastFocus && lastFocus.focus ? lastFocus : el.view).focus({ preventScroll: true });
    actions.modal && actions.modal(open);
  }
  function openSettings(open) {
    if (open === !el.settings.hidden) return;
    el.settings.hidden = !open;
    attr(el.btnSettings, 'settings', 'aria-expanded', String(open));
    if (open) { lastFocus = document.activeElement; el.btnSettingsClose.focus(); }
    else (lastFocus && lastFocus.focus ? lastFocus : el.view).focus({ preventScroll: true });
    actions.modal && actions.modal(open);
  }
  el.help.addEventListener('pointerdown', (e) => { if (e.target === el.help) openHelp(false); });
  el.settings.hidden = true; el.help.hidden = true;

  function setIntro(open, leaving) {
    document.body.classList.toggle('is-intro', open);
    document.body.classList.toggle('intro-leaving', !!leaving);
    if (open) el.btnStart.focus({ preventScroll: true });
  }
  function setPhoto(on) { document.body.classList.toggle('hide-ui', on); }
  function setReduced(on) { document.body.classList.toggle('reduce-motion', on); }
  function fade(v) { el.fade.style.opacity = String(Math.max(0, Math.min(1, v))); }
  function error(msg) { if (!msg) { el.error.hidden = true; return; } el.error.textContent = msg; el.error.hidden = false; }

  // ————— 提示条 —————
  function toast(textValue, iconName) {
    while (el.toasts.children.length >= 3) el.toasts.firstElementChild.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    if (iconName) { const s = document.createElement('span'); s.innerHTML = icon(iconName, 18); s.setAttribute('aria-hidden', 'true'); t.append(s); }
    t.append(document.createTextNode(textValue));
    el.toasts.append(t);
    setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 320); }, 4800);
  }

  // ————— 迷你折线：近 30 秒速度（12 点，固定 0–45 量程） —————
  const X0 = 6, X1 = 214, Y0 = 38, Y1 = 6;
  const sx = (i) => X0 + ((X1 - X0) * i) / (SPARK_N - 1), sy = (v) => Y0 - ((Y0 - Y1) * Math.max(0, Math.min(MAX_SPEED, v))) / MAX_SPEED;
  let samples = new Array(SPARK_N).fill(0), hover = -1;
  function drawSpark() {
    const pts = samples.map((v, i) => [sx(i), sy(v)]);
    let d = ''; pts.forEach(([x, y], i) => { d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); });
    const area = d + `L${X1} ${Y0}L${X0} ${Y0}Z`;
    const [lx, ly] = pts[SPARK_N - 1], [px] = pts[SPARK_N - 2];
    const h = hover >= 0 ? `<line class="spark__cross" x1="${sx(hover)}" y1="${Y1 - 3}" x2="${sx(hover)}" y2="${Y0 + 2}"/><circle class="spark__hover" cx="${sx(hover)}" cy="${sy(samples[hover])}" r="5"/>` : '';
    el.spark.innerHTML =
      `<line class="spark__grid" x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}"/><line class="spark__grid" x1="${X0}" y1="${Y1}" x2="${X1}" y2="${Y1}"/>` +
      `<text class="spark__tick" x="${X1}" y="${Y1 - 3}" text-anchor="end">45</text>` +
      `<path class="spark__area" d="${area}"/><path class="spark__line" d="${d}"/>` +
      `<path class="spark__last" d="M${px.toFixed(1)} ${pts[SPARK_N - 2][1].toFixed(1)}L${lx.toFixed(1)} ${ly.toFixed(1)}"/>` +
      `<circle class="spark__ring" cx="${lx}" cy="${ly}" r="6"/><circle class="spark__dot" cx="${lx}" cy="${ly}" r="4"/>` + h;
    const mx = Math.max(...samples);
    attr(el.spark, 'spark', 'aria-label', `近 30 秒速度折线。最新 ${samples[SPARK_N - 1].toFixed(1)} 公里每小时，最高 ${mx.toFixed(1)} 公里每小时，量程 0 到 45。`);
  }
  const sparkIdx = (clientX) => { const r = el.spark.getBoundingClientRect(); const u = ((clientX - r.left) / r.width * 220 - X0) / (X1 - X0); return u < -0.04 || u > 1.04 ? -1 : Math.max(0, Math.min(SPARK_N - 1, Math.round(u * (SPARK_N - 1)))); };
  function showTip(i) {
    hover = i;
    if (i < 0) { el.sparkTip.hidden = true; drawSpark(); return; }
    const ago = (SPARK_N - 1 - i) * 2.5;
    el.sparkTip.textContent = ago ? `${ago.toFixed(1)} 秒前 · ${samples[i].toFixed(1)} km/h` : `现在 · ${samples[i].toFixed(1)} km/h`;
    el.sparkTip.hidden = false; el.sparkTip.style.left = `${(sx(i) / 220) * 100}%`;
    drawSpark();
  }
  el.spark.tabIndex = 0;
  el.spark.addEventListener('pointermove', (e) => showTip(sparkIdx(e.clientX)));
  el.spark.addEventListener('pointerleave', () => showTip(-1));
  el.spark.addEventListener('focus', () => showTip(hover < 0 ? SPARK_N - 1 : hover));
  el.spark.addEventListener('blur', () => showTip(-1));
  el.spark.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); e.stopPropagation();
    showTip(Math.max(0, Math.min(SPARK_N - 1, (hover < 0 ? SPARK_N - 1 : hover) + (e.key === 'ArrowLeft' ? -1 : 1))));
  });
  const css = document.createElement('style');
  css.textContent = `.spark__grid{stroke:var(--paper-3);stroke-width:1}.spark__tick{font:500 12px/16px var(--font-ui);fill:var(--ink-2)}.spark__area{fill:var(--coral);opacity:.1}.spark__line{fill:none;stroke:var(--ink-3);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.spark__last{fill:none;stroke:var(--coral);stroke-width:2;stroke-linecap:round}.spark__dot{fill:var(--coral)}.spark__ring{fill:var(--paper)}.spark__hover{fill:var(--coral);stroke:var(--paper);stroke-width:2}.spark__cross{stroke:var(--ink-3);stroke-width:1}`;
  document.head.append(css);

  // ————— 每帧（节流后）刷新读数 —————
  let sparkClock = 0;
  function update(h, dt) {
    text(el.speed, 'speed', h.speedKmh.toFixed(1));
    const frac = Math.max(0, Math.min(1, h.speedKmh / MAX_SPEED));
    attr(el.meterFill, 'meter', 'stroke-dashoffset', (209.4 * (1 - frac)).toFixed(1));
    attr(el.meterFill, 'meterDash', 'stroke-dasharray', frac < 0.004 ? '0.01 209.4' : '209.4');     // 0 时不留圆头
    attr(el.meter, 'meterA', 'aria-valuenow', String(Math.round(h.speedKmh)));
    text(el.cadence, 'cad', String(Math.round(h.cadence)));
    text(el.gear, 'gear', String(h.gear + 1));
    text(el.distance, 'dist', h.distanceKm.toFixed(2));
    const sm = STATUS_META[h.mode] || STATUS_META.stop;
    text(el.statusLabel, 'mode', sm.label); attr(el.status, 'mode', 'data-status', h.mode);
    text(el.clock, 'clock', h.clock);
    text(el.todLabel, 'tod', h.todLabel);
    if (cache.get('todIcon') !== h.todIcon) { cache.set('todIcon', h.todIcon); document.querySelector('.chip--clock .chip__icon').innerHTML = icon(h.todIcon, 18); }
    attr(el.btnCam, 'cam', 'aria-label', `切换镜头，当前：${h.camLabel}`); attr(el.btnCam, 'camT', 'title', `${h.camLabel}：${h.camHint} (C)`);
    attr(el.btnTime, 'time', 'aria-label', `切换时刻，当前：${h.todLabel}`);
    attr(el.btnStyle, 'style', 'aria-label', `切换画风，当前：${h.styleLabel}`);
    const mKey = 'm' + h.muted; if (cache.get('mute') !== mKey) { cache.set('mute', mKey); attr(el.btnMute, 'mute', 'aria-pressed', String(h.muted)); attr(el.btnMute, 'muteL', 'aria-label', h.muted ? '取消静音' : '静音'); setIcon(el.btnMute, h.muted ? 'speaker-slash' : 'speaker-high'); el.btnMute.classList.toggle('is-off', h.muted); }
    const muKey = 'mu' + h.music; if (cache.get('music') !== muKey) { cache.set('music', muKey); attr(el.btnMusic, 'music', 'aria-pressed', String(h.music)); attr(el.btnMusic, 'musicL', 'aria-label', h.music ? '音乐：开' : '音乐：关'); el.btnMusic.classList.toggle('is-off', !h.music); }
    const pKey = 'p' + h.paused; if (cache.get('paused') !== pKey) { cache.set('paused', pKey); attr(el.btnPause, 'paused', 'aria-pressed', String(h.paused)); attr(el.btnPause, 'pausedL', 'aria-label', h.paused ? '继续' : '暂停'); setIcon(el.btnPause, h.paused ? 'play' : 'pause'); }
    sparkClock += dt;
    if (sparkClock >= 2.5) { sparkClock = 0; samples.push(h.speedKmh); samples.shift(); drawSpark(); }
    else if (cache.get('sLast') !== h.speedKmh.toFixed(1)) { cache.set('sLast', h.speedKmh.toFixed(1)); samples[SPARK_N - 1] = h.speedKmh; if (hover < 0) drawSpark(); }
  }

  return {
    update, toast, setIntro, setPhoto, setReduced, fade, error, openHelp, openSettings, reflectSettings,
    loadSettings: load, saveSettings: save, defaults,
    get settingsOpen() { return !el.settings.hidden; },
    get helpOpen() { return !el.help.hidden; },
    setTargetSlider: (kmh) => { el.setSpeed.value = String(Math.round(kmh)); el.outSpeed.textContent = `${Math.round(kmh)} km/h`; },
    el,
  };
}
