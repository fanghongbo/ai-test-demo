// 键盘输入：QQ飞车的官方键位，方向另加 WASD 作为备用。
//   ↑↓←→ / WASD  前进、刹车倒车、转向        Shift  漂移          Ctrl  氮气（道具赛里是使用道具）
//   Alt  切换道具（道具赛）                  R      回到赛道      Backspace  返回上一级
//   PgUp / PgDn  上一首 / 下一首背景音乐      另加：C 切镜头、Tab 名次表、Esc 暂停、M 静音、Enter 确认
export const KEY_HELP = Object.freeze([
  ['↑ / W', '加速'], ['↓ / S', '刹车 / 倒车'], ['← → / A D', '转向'], ['Shift', '漂移（按住）'],
  ['Ctrl', '氮气 / 使用道具'], ['Alt', '切换道具'], ['R', '回到赛道'], ['Backspace', '返回'],
  ['PgUp / PgDn', '切换背景音乐'], ['C', '切换镜头'], ['Tab', '名次表'], ['Esc', '暂停'], ['M', '静音'],
]);

const BIND = {
  up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'], left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
  drift: ['ShiftLeft', 'ShiftRight'], nitro: ['ControlLeft', 'ControlRight'], item: ['AltLeft', 'AltRight'],
  reset: ['KeyR'], back: ['Backspace'], bgmPrev: ['PageUp'], bgmNext: ['PageDown'], camera: ['KeyC'],
  standings: ['Tab'], pause: ['Escape', 'KeyP'], mute: ['KeyM'], enter: ['Enter', 'NumpadEnter'], space: ['Space'],
};
const ACTION_OF = {};
for (const [action, codes] of Object.entries(BIND)) for (const c of codes) ACTION_OF[c] = action;
const PREVENT = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Backspace', 'PageUp', 'PageDown', 'AltLeft', 'AltRight']);

export function createInput(target = window) {
  const keys = new Set(), pressed = new Set(), listeners = [], virt = {};                  // keys：真按着的键；virt：程序“代按”的键（自检时让电脑用真键盘的方式开）
  let enabled = true, last = 0;                                     // last：最近一次按键的时刻
  const isHeld = (a) => enabled && (keys.has(a) || !!virt[a]);
  const onDown = (e) => {
    const a = ACTION_OF[e.code];
    if (PREVENT.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    last = performance.now();
    if (a) { keys.add(a); pressed.add(a); }
    for (const fn of listeners) fn(a, e.code, e);
  };
  const onUp = (e) => { const a = ACTION_OF[e.code]; if (a) keys.delete(a); };
  const onBlur = () => keys.clear();
  target.addEventListener('keydown', onDown);
  target.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);
  const DRIVE = ['up', 'down', 'left', 'right', 'drift', 'nitro'];
  return {
    /** 某个功能此刻是否按着 */
    held: isHeld,
    /** 某个功能这一帧是否刚按下（一帧只问一次） */
    pressed: (a) => enabled && pressed.has(a),
    /** 程序代按：{ up, down, left, right, drift, nitro }。和真按键取“或”，刚按下的那一帧算一次“按下” */
    setVirtual(v) {
      for (const a of DRIVE) { const on = !!v[a]; if (on && !virt[a]) pressed.add(a); virt[a] = on; }
    },
    clearVirtual() { for (const a of DRIVE) virt[a] = false; },
    anyPressed: () => pressed.size > 0,
    /** 订阅所有按键（菜单用）：fn(action, code, event) */
    onKey(fn) { listeners.push(fn); return () => { const k = listeners.indexOf(fn); if (k >= 0) listeners.splice(k, 1); }; },
    /** 每帧末调用：清掉“刚按下”的标记 */
    endFrame() { pressed.clear(); },
    setEnabled(v) { enabled = v; if (!v) keys.clear(); },
    get lastTouch() { return last; },
    /** 开车要用的那几个键 */
    drive() { return { up: isHeld('up'), down: isHeld('down'), left: isHeld('left'), right: isHeld('right'), drift: isHeld('drift'), nitro: isHeld('nitro') }; },
    dispose() { target.removeEventListener('keydown', onDown); target.removeEventListener('keyup', onUp); window.removeEventListener('blur', onBlur); },
  };
}
