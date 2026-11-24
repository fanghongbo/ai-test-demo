// 输入：键盘（按住调速、单发动作键）、指针（拖动环绕 / 滚轮缩放 / 点击拾取 / 双指捏合）
const HOLD = new Set(['up', 'down']);
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  Space: 'jump', KeyB: 'bell', KeyG: 'gear', KeyC: 'cam', KeyT: 'time', KeyY: 'cycle', KeyV: 'style', KeyN: 'music', KeyM: 'mute', KeyP: 'pause',
  KeyH: 'photo', KeyX: 'inspect', KeyR: 'reset', KeyK: 'squawk', Slash: 'help', Escape: 'escape', Enter: 'enter', KeyF: 'fish',
  Digit1: 'cam0', Digit2: 'cam1', Digit3: 'cam2', Digit4: 'cam3', Digit5: 'cam4', Digit6: 'cam5',
};

export function createInput(canvas, h) {
  const held = new Set();
  const ptrs = new Map();
  let down = null, dragging = false, pinch = 0, lastTap = 0;
  const isTyping = (e) => { const t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); };

  function onKeyDown(e) {
    const action = KEYMAP[e.code];
    if (!action) return;
    if (isTyping(e)) {
      // 滑块获得焦点时，方向键交给滑块；其余按键照常处理
      if (e.target.tagName === 'INPUT' && HOLD.has(action)) return;
      if (e.target.tagName === 'INPUT' && (action === 'jump' || action === 'time' || action === 'cycle')) return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // 焦点在按钮 / 链接 / 折叠标题等控件上时，空格与回车留给控件自己激活（否则键盘无法“按”按钮）
    const t = e.target;
    if ((action === 'jump' || action === 'enter') && t && t.closest && t.closest('button, a[href], summary, [role="button"], [role="switch"], [role="checkbox"]')) return;
    if (action === 'help' && !e.shiftKey) return;                 // “?” = Shift + /
    e.preventDefault();
    if (HOLD.has(action)) { held.add(action); return; }
    if (e.repeat) return;
    h.onAction && h.onAction(action, e);
  }
  const onKeyUp = (e) => { const a = KEYMAP[e.code]; if (a) held.delete(a); };
  const onBlur = () => held.clear();

  function ndc(ev) { const r = canvas.getBoundingClientRect(); return [((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1]; }
  function onDown(ev) {
    if (document.activeElement && document.activeElement !== canvas && document.activeElement.blur) document.activeElement.blur();
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    canvas.setPointerCapture?.(ev.pointerId);
    if (ptrs.size === 1) { down = { x: ev.clientX, y: ev.clientY, t: performance.now(), id: ev.pointerId }; dragging = false; }
    else { down = null; dragging = true; const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
  }
  function onMove(ev) {
    const p = ptrs.get(ev.pointerId);
    if (!p) return;
    const dx = ev.clientX - p.x, dy = ev.clientY - p.y;
    p.x = ev.clientX; p.y = ev.clientY;
    if (ptrs.size === 1) {
      if (down && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 5) dragging = true;
      if (dragging) h.onOrbit && h.onOrbit(dx, dy);
    } else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0) h.onZoom && h.onZoom(Math.pow(1.01, d - pinch));
      pinch = d;
    }
  }
  function onUp(ev) {
    ptrs.delete(ev.pointerId);
    if (down && down.id === ev.pointerId && !dragging && performance.now() - down.t < 450) {
      const now = performance.now();
      if (now - lastTap > 180) { lastTap = now; h.onPick && h.onPick(...ndc(ev)); }
    }
    if (ptrs.size === 0) { down = null; dragging = false; pinch = 0; }
  }
  function onWheel(e) { e.preventDefault(); h.onZoom && h.onZoom(Math.pow(1.0016, e.deltaY)); }
  const onContext = (e) => e.preventDefault();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContext);

  return {
    held: (a) => held.has(a),
    /** 由界面按钮（例如触屏的加减速）模拟按住 */
    setHeld: (a, on) => { if (on) held.add(a); else held.delete(a); },
    dispose() {
      window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('wheel', onWheel); canvas.removeEventListener('contextmenu', onContext);
    },
  };
}
