// 输入：鼠标按下、手指按在画面上、空格按下 = 开始蓄力；松开 = 起跳。
// 每个事件都记下它发生的时刻，推进游戏的时候按这个时刻落进去。
export class Input {
  constructor() {
    this.events = [];
    this.held = false;
    this.enabled = true;
    this.onKey = null;                 // 其它按键交给界面处理：'start' | 'pause' | 'retry' | 'mute' | 'back'
    this.canHold = null;               // 现在按住算不算蓄力（false 时空格 / 鼠标当成“确定”）
    this.keys = new Set(['Space', 'ArrowUp', 'KeyW']);
    window.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (e.target.closest && e.target.closest('button, a, input, select, [data-ui]')) return;
      this.push('press', e.timeStamp);
    }, { passive: true });
    window.addEventListener('pointerup', (e) => { if (e.button === 0 || e.pointerType !== 'mouse') this.push('release', e.timeStamp); }, { passive: true });
    window.addEventListener('pointercancel', (e) => this.push('release', e.timeStamp), { passive: true });
    window.addEventListener('blur', () => this.push('release', performance.now()));
    window.addEventListener('contextmenu', (e) => { if (e.target.tagName === 'CANVAS') e.preventDefault(); });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) { if (this.keys.has(e.code)) e.preventDefault(); return; }
      if (this.keys.has(e.code)) {
        if (this.canHold && !this.canHold()) { if (this.onKey) this.onKey('start', e); return; }   // 不在蓄力的时候，空格就是“确定”
        e.preventDefault();
        this.push('press', e.timeStamp);
        return;
      }
      const map = { Enter: 'start', NumpadEnter: 'start', Escape: 'pause', KeyM: 'mute', KeyR: 'retry' };
      if (map[e.code] && this.onKey) { e.preventDefault(); this.onKey(map[e.code], e); }
    });
    window.addEventListener('keyup', (e) => { if (this.keys.has(e.code)) this.push('release', e.timeStamp); });
  }

  push(type, at) {
    if (type === 'press') {
      if (this.held || !this.enabled) return;
      this.held = true;
    } else {
      if (!this.held) return;
      this.held = false;
    }
    this.events.push({ type, at });
  }

  // 把这一帧里的事件取走，时刻换算成“这一帧开始之后过了几秒”（frameStart：这一帧开始时的 performance.now()）
  take(frameStart) {
    const out = this.events.map((e) => ({ type: e.type, at: Math.max(0, (e.at - frameStart) / 1000) }));
    this.events = [];
    return out;
  }

  flush() { this.events = []; this.held = false; }
}
