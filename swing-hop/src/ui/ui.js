// 界面：标题、玩的时候的分数和提示、结算，还有设置 / 怎么玩 / 暂停共用的那张纸片。
// 这里只管显示和把按钮点下去的事告诉 app，规则一概不知道。

const $ = (id) => document.getElementById(id);
const KEYS = (touch) => (touch
  ? [['按住屏幕，松开', '蓄力、起跳。按得越久跳得越远']]
  : [['按住 <kbd>空格</kbd> 或鼠标左键，松开', '蓄力、起跳。按得越久跳得越远'], ['<kbd>↑</kbd> / <kbd>W</kbd>', '和空格一样'], ['<kbd>Esc</kbd>', '暂停'], ['<kbd>M</kbd>', '静音']]);

export class UI {
  constructor(app) {
    this.app = app;
    this.touch = matchMedia('(pointer: coarse)').matches;
    this.el = {
      load: $('load'), loadText: $('loadText'), loadBar: $('loadBar'), error: $('error'),
      title: $('title'), titleBest: $('titleBest'), hud: $('hud'), scoreV: $('scoreV'), bestV: $('bestV'), combo: $('combo'), comboV: $('comboV'),
      wolf: $('wolf'), wolfV: $('wolfV'), btnSound: $('btnSound'), charge: $('charge'), chargeBar: $('chargeBar'), hint: $('hint'),
      pops: $('pops'), panel: $('panel'), panelTitle: $('panelTitle'), panelBody: $('panelBody'),
      over: $('over'), overReason: $('overReason'), overScore: $('overScore'), overRecord: $('overRecord'), overStats: $('overStats'), toast: $('toast'),
    };
    this.seen = new Set();
    this.from = 'title';
    this.screens = { title: this.el.title, over: this.el.over };
    document.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); app.action(b.dataset.act); }));
    $('btnPause').addEventListener('click', (e) => { e.stopPropagation(); app.action('pause'); this.unfocus(); });
    $('btnSound').addEventListener('click', (e) => { e.stopPropagation(); app.action('mute'); this.unfocus(); });
    if (this.touch) for (const s of document.querySelectorAll('#title .menu small, #panel .foot small')) s.hidden = true;   // 手机上没有键盘：按钮上不写按键
    this.scoreTimer = 0;
    this.live = [];                 // 还在飘的字
  }

  // ---------- 加载 ----------
  loading(text, k) {
    if (text) this.el.loadText.textContent = text;
    if (k != null) this.el.loadBar.style.width = `${Math.round(k * 100)}%`;
  }
  loaded() {
    this.el.load.classList.add('gone');
    setTimeout(() => { this.el.load.hidden = true; }, 600);
  }
  fail(text) {
    this.el.error.hidden = false;
    this.el.error.textContent = text;
    this.el.load.hidden = true;
  }

  // ---------- 哪一屏在最上面 ----------
  show(name) {
    this.unfocus();
    for (const [k, el] of Object.entries(this.screens)) el.hidden = k !== name;
    this.el.hud.hidden = name !== 'play';
    this.el.pops.innerHTML = '';
    this.live = [];
    if (name !== 'play') this.hidePanel();
    if (name !== 'play') { this.el.charge.classList.remove('on'); this.el.hint.hidden = true; }
    if (name === 'title') this.refreshBest();
  }

  refreshBest() {
    const best = this.app.game.best;
    this.el.titleBest.hidden = !best;
    this.el.titleBest.innerHTML = `最佳 <b>${best}</b>`;
  }

  // ---------- 玩的时候 ----------
  score(score, best, gain) {
    this.el.scoreV.textContent = score;
    const note = best > score ? `最佳 ${best}` : best ? '新纪录！' : '';
    this.el.bestV.textContent = note;
    this.el.bestV.hidden = !note;
    if (gain) {                                                  // 数字跳一下
      this.el.scoreV.classList.remove('pop');
      void this.el.scoreV.offsetWidth;
      this.el.scoreV.classList.add('pop');
    }
  }

  combo(n) {
    this.el.combo.hidden = n < 2;
    this.el.comboV.textContent = n;
  }

  wolf(meters) {
    this.el.wolf.hidden = meters == null;
    if (meters != null) {
      this.el.wolfV.textContent = Math.max(0, Math.round(meters));
      this.el.wolf.classList.toggle('near', meters < 8);
    }
  }

  charge(c) {
    this.el.charge.classList.toggle('on', c != null);
    if (c != null) this.el.chargeBar.style.width = `${Math.round(c * 100)}%`;
  }

  hint(text) {
    const el = this.el.hint;
    if (!text) { el.hidden = true; return; }
    if (el.textContent !== text) { el.textContent = text; el.hidden = true; void el.offsetWidth; }
    el.hidden = false;
  }

  sound(on) { this.el.btnSound.classList.toggle('off', !on); }

  // 从世界里的一个点飘出来的字（x、y 是世界坐标）。镜头一直在动，所以位置不在这里定，由主循环每帧调 followPops 重算
  pop(text, kind, x, y) {
    const el = document.createElement('span');
    el.className = `pop ${kind}`;
    el.textContent = text;
    this.el.pops.appendChild(el);
    this.live.push({ el, x, y });
    setTimeout(() => el.remove(), 1100);
  }

  followPops(project) {
    this.live = this.live.filter((p) => p.el.isConnected);
    for (const p of this.live) {
      const [px, py] = project(p.x, p.y);
      p.el.style.left = `${px}px`;
      p.el.style.top = `${py}px`;
    }
  }

  toast(text, danger = false, secs = 1.7) {
    const el = this.el.toast;
    el.textContent = text;
    el.className = danger ? 'danger' : '';
    el.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { el.hidden = true; }, secs * 1000);
  }

  // 每种提示只出现一次（记在浏览器里）
  once(key, show) {
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    try {
      const all = new Set(JSON.parse(localStorage.getItem('swing-hop.seen.v1') || '[]'));
      all.add(key);
      localStorage.setItem('swing-hop.seen.v1', JSON.stringify([...all]));
    } catch { /* 存不了就只在这一次里记着 */ }
    show();
    return true;
  }
  loadSeen() {
    try { this.seen = new Set(JSON.parse(localStorage.getItem('swing-hop.seen.v1') || '[]')); } catch { this.seen = new Set(); }
  }

  // ---------- 结算 ----------
  over(info) {
    const touch = this.touch;
    this.el.overReason.textContent = info.text;
    this.el.overScore.textContent = info.score;
    this.el.overRecord.hidden = !info.record || !info.score;
    this.el.overStats.innerHTML = `
      <div><b>${info.perfects}</b><span>落在正中</span></div>
      <div><b>${info.maxCombo}</b><span>最高连击</span></div>
      <div><b>${info.maxNode}</b><span>荡过几个秋千</span></div>`;
    this.el.over.querySelector('[data-act="retry"] small').textContent = touch ? '点这里' : '空格 / 回车';
    this.show('over');
  }

  // ---------- 纸片：设置 / 怎么玩 / 暂停 ----------
  openPanel(name, from) {
    this.from = from || 'title';
    const body = this.el.panelBody, s = this.app.settings, touch = this.touch;
    body.innerHTML = '';
    const row = (label, note, control) => {
      const el = document.createElement('div');
      el.className = 'row';
      el.innerHTML = `<span>${label}${note ? `<small>${note}</small>` : ''}</span>`;
      el.appendChild(control);
      body.appendChild(el);
      return el;
    };
    const seg = (options, value, onPick) => {
      const el = document.createElement('div');
      el.className = 'seg';
      for (const [v, text] of options) {
        const b = document.createElement('button');
        b.textContent = text;
        b.dataset.act = '';
        b.className = v === value ? 'on' : '';
        b.addEventListener('click', (e) => { e.stopPropagation(); onPick(v); [...el.children].forEach((c) => c.classList.toggle('on', c === b)); });
        el.appendChild(b);
      }
      return el;
    };
    const toggle = (value, onFlip) => {
      const b = document.createElement('button');
      b.className = `toggle${value ? ' on' : ''}`;
      b.setAttribute('aria-pressed', String(value));
      b.dataset.act = '';
      b.addEventListener('click', (e) => { e.stopPropagation(); const v = !b.classList.contains('on'); b.classList.toggle('on', v); onFlip(v); });
      return b;
    };
    if (name === 'pause') {
      this.el.panelTitle.textContent = '暂停';
      const menu = document.createElement('nav');
      menu.className = 'menu';
      menu.innerHTML = `<button class="big" data-act="resume">继续<small>${touch ? '' : 'Esc'}</small></button>
        <div class="minor"><button data-act="restart">重新开始</button><button data-act="settings">设置</button><button data-act="title">回到标题</button></div>`;
      body.appendChild(menu);
      menu.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); this.app.action(b.dataset.act); }));
    } else if (name === 'settings') {
      this.el.panelTitle.textContent = '设置';
      row('画质', '自动会看这台机器的帧率', seg([['auto', '自动'], ['0', '流畅'], ['1', '均衡'], ['2', '极致']], s.quality, (v) => this.app.setSetting('quality', v)));
      const vol = document.createElement('input');
      vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.05'; vol.value = s.volume;
      vol.addEventListener('input', () => this.app.setSetting('volume', Number(vol.value)));
      vol.addEventListener('click', (e) => e.stopPropagation());
      row('声音和音量', '', vol);
      row('镜头晃动', '落地和狼追近时的抖动', toggle(s.shake, (v) => this.app.setSetting('shake', v)));
      row('落点辅助', '按住的时候画出这一跳的弧线', toggle(s.assist, (v) => this.app.setSetting('assist', v)));
    } else if (name === 'help') {
      this.el.panelTitle.textContent = '怎么玩';
      body.innerHTML = `
        <p class="lead">荡过云海上的一个个秋千，越远越好。落在座板正中算“完美”，连续完美加成翻倍，一步跳过两个秋千另有奖励。</p>
        <p class="lead">空秋千会被风吹得晃，要算好提前量；后面的风暴狼一路追来，被追上就结束了。</p>
        <table class="keys">${KEYS(touch).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
        <ul class="kinds">
          <li><i></i>普通秋千：落在正中加分</li>
          <li><i></i>金色秋千：额外加 5 分</li>
          <li><i></i>宽板凳：好踩</li>
          <li><i></i>裂缝的旧秋千：撑不久，落上去赶紧跳</li>
        </ul>`;
    }
    this.el.panel.hidden = false;
  }

  hidePanel() {
    this.el.panel.hidden = true;
    this.unfocus();                                                     // 不然空格会再去点一次刚才点过的按钮
  }

  // 让刚才点过的按钮失去焦点：留着焦点的话，之后按空格会先触发一次这个按钮
  unfocus() {
    const el = document.activeElement;
    if (el && el !== document.body && el.blur) el.blur();
  }
  get panelOpen() { return !this.el.panel.hidden; }

  // 暂停那一层把画面压暗；设置从暂停里进来的时候也压暗
  dim(on) { this.el.panel.classList.toggle('dim', on); }
}

