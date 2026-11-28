// 界面：标题画面、设置 / 暂停 / 说明面板、潜水的仪表（深度、地名、罗盘）、巡游的字幕和进度、触屏的摇杆和按键。
// 这里只管显示，再把操作转告给 app（回调）；不碰场景。标签都写在 index.html 里。
import { TIMES, CLARITY } from '../core/wateroptics.js';

const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2, PX = 2.2;                                      // 罗盘上一度的宽度
const QUALITY = [['auto', '自动'], ['2', '高'], ['1', '中'], ['0', '低']];
const ONOFF = [[true, '开'], [false, '关']];
const isCoarse = () => matchMedia('(pointer: coarse)').matches;

const HELP = `
  <dl class="keys">
    <h3>自由潜泳</h3>
    <dt><kbd>W</kbd> <kbd>S</kbd></dt><dd>往前游、往后退（方向键也行）</dd>
    <dt><kbd>A</kbd> <kbd>D</kbd></dt><dd>往左、往右平移</dd>
    <dt>鼠标</dt><dd>转视角。点一下画面把鼠标“抓”进来，按 <kbd>Esc</kbd> 放开</dd>
    <dt><kbd>空格</kbd> <kbd>C</kbd></dt><dd>上升、下降</dd>
    <dt><kbd>Shift</kbd></dt><dd>疾游（视野会略宽）</dd>
    <dt><kbd>R</kbd></dt><dd>回到石桥中段的起点</dd>
    <h3>巡游</h3>
    <dt><kbd>T</kbd></dt><dd>在巡游和潜泳之间切换，镜头留在原地</dd>
    <dt><kbd>空格</kbd></dt><dd>暂停 / 继续</dd>
    <dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>上一个、下一个镜头</dd>
    <h3>通用</h3>
    <dt><kbd>Esc</kbd></dt><dd>菜单 / 继续</dd>
    <dt><kbd>H</kbd></dt><dd>隐藏界面（再按一次回来）</dd>
    <dt><kbd>M</kbd></dt><dd>静音</dd>
    <dt><kbd>1</kbd> … <kbd>5</kbd></dt><dd>换时刻：清晨、正午、午后、黄昏、夜晚</dd>
    <h3>触屏</h3>
    <dt>左下</dt><dd>摇杆：游</dd>
    <dt>右边</dt><dd>拖着看；▲ ▼ 升降，“疾游”加速</dd>
  </dl>`;

/**
 * @param {(name: string, value?: any) => void} act 点了什么：tour / free / settings / help / back / resume / title / look(dx, dy)
 * @param {(key: string, value: any) => void} set 改了一项设置
 */
export function createUI(act, set) {
  const el = {
    title: $('title'), hud: $('hud'), caption: $('caption'), capBox: $('capBox'), capIdx: $('capIdx'), capPlace: $('capPlace'), capText: $('capText'),
    progress: $('progress'), progressBar: $('progressBar'), panel: $('panel'), panelTitle: $('panelTitle'), panelLead: $('panelLead'), panelBody: $('panelBody'), panelFoot: $('panelFoot'),
    depthV: $('depthV'), depthTick: $('depthTick'), placeName: $('placeName'), strip: $('compassStrip'), meta: $('meta'), hint: $('hint'), speed: $('speedV'), touch: $('touch'), toast: $('toast'),
  };
  const S = { mode: 'title', panel: null, panelFrom: 'title', hidden: false, captions: true, settings: {}, lastPlace: '', toastT: 0, lastDepth: -1, lastDeg: -1, coarse: isCoarse() };

  // ── 罗盘：三圈刻度并排，中间那一圈的度数对准正上方 ──
  let stripHtml = '';
  for (let c = 0; c < 3; c++) for (let d = 0; d < 360; d += 15) {
    const x = (c * 360 + d) * PX, major = d % 90 === 0;
    stripHtml += `<b class="${major ? 'major' : ''}" style="left:${x}px"></b>`;
    if (major) stripHtml += `<span class="${d === 0 ? 'n' : ''}" style="left:${x}px">${'北东南西'[d / 90]}</span>`;
  }
  el.strip.innerHTML = stripHtml; el.strip.style.width = `${3 * 360 * PX}px`;

  // ── 点按钮 ──
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
  document.addEventListener('keydown', (e) => {                                     // 面板开着的时候，回车等于点第一个按钮
    if (e.key === 'Enter' && S.panel === 'pause') { e.preventDefault(); act('resume'); }
  });

  // ── 面板 ──
  const seg = (key, options, cur) => `<div class="seg" data-key="${key}">${options.map(([v, name]) => `<button data-v="${v}" aria-pressed="${String(v) === String(cur)}">${name}</button>`).join('')}</div>`;
  const row = (label, control) => `<div class="row"><label>${label}</label><div>${control}</div></div>`;
  const slider = (key, min, max, step, cur) => `<input type="range" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${cur}" aria-label="${key}">`;
  const renderSettings = (s) => [
    row('时刻', seg('hour', TIMES.map((t) => [t.id, t.name]), s.hour)),
    row('水质', seg('clarity', CLARITY.map((c) => [c.id, c.name]), s.clarity)),
    row('画质', seg('quality', QUALITY, s.quality)),
    row('视角灵敏度', slider('sens', 0.4, 2, 0.1, s.sens)),
    row('镜头晃动', seg('sway', ONOFF, s.sway)),
    row('巡游字幕', seg('captions', ONOFF, s.captions)),
    row('声音', seg('sound', ONOFF, s.sound) + `<div style="height:10px"></div>` + slider('volume', 0, 1, 0.05, s.volume)),
  ].join('');
  const renderPause = (s) => `<div class="list">
      <button data-act="resume">${s.mode === 'tour' ? '继续巡游' : '继续潜泳'}</button>
      <button data-act="tour">从头巡游</button>
      <button data-act="settings">设置</button>
      <button data-act="help">操作说明</button>
      <button data-act="title">回到标题</button></div>`;
  el.panelBody.addEventListener('click', (e) => {
    const b = e.target.closest('.seg button');
    if (!b) return;
    const box = b.parentElement, v = b.dataset.v;
    for (const o of box.children) o.setAttribute('aria-pressed', String(o === b));
    set(box.dataset.key, v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v);
  });
  el.panelBody.addEventListener('input', (e) => { const i = e.target.closest('input[type="range"]'); if (i) set(i.dataset.key, +i.value); });

  // ── 触屏 ──
  const stick = $('stick'), knob = $('stickKnob');
  let stickId = null;
  const stickPos = (e) => { const r = stick.getBoundingClientRect(), dx = (e.clientX - r.left - r.width / 2) / (r.width / 2), dy = (e.clientY - r.top - r.height / 2) / (r.height / 2), l = Math.hypot(dx, dy), k = l > 1 ? 1 / l : 1; return [dx * k, dy * k]; };
  stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; try { stick.setPointerCapture(e.pointerId); } catch { /* 指针已经抬起来了 */ } const [x, y] = stickPos(e); knob.style.transform = `translate(${x * 38}px, ${y * 38}px)`; act('stick', x, -y); });
  stick.addEventListener('pointermove', (e) => { if (e.pointerId !== stickId) return; const [x, y] = stickPos(e); knob.style.transform = `translate(${x * 38}px, ${y * 38}px)`; act('stick', x, -y); });
  const stickEnd = (e) => { if (e.pointerId !== stickId) return; stickId = null; knob.style.transform = ''; act('stick', 0, 0); };
  stick.addEventListener('pointerup', stickEnd); stick.addEventListener('pointercancel', stickEnd);
  const held = new Map();
  el.touch.querySelectorAll('.pad button').forEach((b) => {
    const on = (e) => { e.preventDefault(); held.set(e.pointerId, b.dataset.key); b.classList.add('on'); act('pad', b.dataset.key, true); };
    const off = (e) => { if (held.get(e.pointerId) !== b.dataset.key) return; held.delete(e.pointerId); b.classList.remove('on'); act('pad', b.dataset.key, false); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  });
  const view = $('view');
  let lookId = null, lx = 0, ly = 0;
  view.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; lookId = e.pointerId; lx = e.clientX; ly = e.clientY; });
  view.addEventListener('pointermove', (e) => { if (e.pointerId !== lookId) return; act('look', e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY; });
  view.addEventListener('pointerup', (e) => { if (e.pointerId === lookId) lookId = null; });
  view.addEventListener('pointercancel', (e) => { if (e.pointerId === lookId) lookId = null; });

  let capShown = '';
  return {
    state: S,
    get panel() { return S.panel; },
    get mode() { return S.mode; },
    showTitle(show) { el.title.hidden = !show; },
    setMode(mode) {
      S.mode = mode;
      const free = mode === 'free', tour = mode === 'tour';
      el.hud.hidden = !(free || (tour && S.coarse));
      el.caption.hidden = !tour;
      el.touch.hidden = !(free && S.coarse);
      el.hint.innerHTML = free
        ? (S.coarse ? '' : '<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 游 · 鼠标看 · <kbd>空格</kbd> 升 <kbd>C</kbd> 降 · <kbd>Shift</kbd> 疾游<br><span class="sep">·</span><kbd>T</kbd> 巡游 <span class="sep">·</span><kbd>H</kbd> 隐藏界面 <span class="sep">·</span><kbd>Esc</kbd> 菜单')
        : tour ? (S.coarse ? '' : '巡游 <span class="sep">·</span><kbd>空格</kbd> 暂停 <span class="sep">·</span><kbd>←</kbd><kbd>→</kbd> 镜头 <span class="sep">·</span><kbd>T</kbd> 自由潜泳') : '';
      el.hint.hidden = !el.hint.innerHTML;
    },
    /** 打开面板：settings / pause / help。settings 是当前的设置，用来画各个选项 */
    openPanel(kind, settings, from) {
      S.panel = kind; S.panelFrom = from; S.settings = settings;
      el.panelTitle.textContent = { settings: '设置', pause: '暂停', help: '操作说明' }[kind];
      el.panelLead.textContent = { settings: '时刻、水质、画质都可以随时换，换完镜头留在原地。', pause: '画面停住了，水里的一切也停住了。', help: '键盘和触屏都可以。' }[kind];
      el.panelBody.innerHTML = kind === 'settings' ? renderSettings(settings) : kind === 'pause' ? renderPause({ mode: from }) : HELP;
      el.panelFoot.textContent = kind === 'help' ? '本项目由 GLM-5.4 开发' : '';
      el.panel.hidden = false;
    },
    closePanel() { S.panel = null; el.panel.hidden = true; },
    setHidden(h) { S.hidden = h; document.body.classList.toggle('ui-hidden', h); },
    toggleCaptions(on) { S.captions = on; },
    /** 巡游：换了镜头 */
    caption(shot, index, count) {
      if (capShown && !el.caption.hidden) el.capBox.classList.add('out');
      capShown = shot.id;
      clearTimeout(S.capT);
      S.capT = setTimeout(() => {
        el.capIdx.textContent = `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
        el.capPlace.textContent = shot.place; el.capText.textContent = shot.text; el.capText.hidden = !S.captions;
        let ticks = ''; for (let i = 0; i < count; i++) ticks += `<b style="left:${(i / count) * 100}%"></b>`;
        el.progress.innerHTML = `<i id="progressBar"></i>${ticks}`; el.progressBar = $('progressBar');
        el.capBox.classList.remove('out');
      }, 260);
    },
    hideCaption() { el.capBox.classList.add('out'); capShown = ''; },
    toast(text, seconds = 2.4) { el.toast.textContent = text; el.toast.hidden = false; clearTimeout(S.toastT); S.toastT = setTimeout(() => { el.toast.hidden = true; }, seconds * 1000); },
    /** 每帧：深度、地名、罗盘、速度、巡游进度 */
    update(s, dt) {
      if (S.mode === 'free') {
        const d = Math.max(0, -s.y);
        if (Math.abs(d - S.lastDepth) >= 0.5) { S.lastDepth = d; el.depthV.textContent = Math.round(d); el.depthTick.style.bottom = `${Math.max(0, Math.min(1, 1 - d / 60)) * 100}%`; }
        const deg = Math.round((((-s.yaw * 180) / Math.PI) % 360 + 360) % 360);
        if (deg !== S.lastDeg) { S.lastDeg = deg; el.strip.style.transform = `translateX(${-(360 * PX + ((deg + 0.5) / 360) * 360 * PX)}px)`; }
        if (s.place !== S.lastPlace) { S.lastPlace = s.place; el.placeName.textContent = s.place; }
        el.speed.classList.toggle('on', s.boosting); if (s.boosting) el.speed.textContent = `${s.speed.toFixed(1)} 米/秒`;
        el.meta.innerHTML = `<b>${s.hour}</b> · ${s.clarity}`;
      } else if (S.mode === 'tour' && s.shot && el.progressBar) {
        el.progressBar.style.width = `${(s.shotT * 100).toFixed(1)}%`;
        el.meta.innerHTML = `<b>${s.hour}</b> · ${s.clarity}`;
      }
    },
    meta(text) { el.meta.innerHTML = text; },
  };
}
