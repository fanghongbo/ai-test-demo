// 键盘、鼠标、指针锁定。指针锁定拿不到时（无头浏览器、嵌进去的框架）退回“按住画面拖动视角”，两条路走的是同一份位移数据。
const PREVENT = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ControlLeft']);

export function createInput(canvas) {
  const I = {
    keys: new Set(), hit: new Set(),                       // hit：这一帧刚按下的键
    mouse: { dx: 0, dy: 0, down: [false, false, false], hit: [false, false, false], wheel: 0 },
    locked: false, fallback: false, enabled: false, sens: 1, invertY: false,
    onLock: null, onKey: null, dbg: { dx: 0, dy: 0, n: 0 },                         // 累计的视角位移与事件数（诊断用）
  };
  let dragging = false, lx = 0, ly = 0;
  const move = (dx, dy) => { I.mouse.dx += dx; I.mouse.dy += dy; I.dbg.dx += dx; I.dbg.dy += dy; I.dbg.n++; };

  window.addEventListener('keydown', (e) => {
    if (PREVENT.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    I.keys.add(e.code);
    I.hit.add(e.code);
    if (I.onKey) I.onKey(e.code, e);
  });
  window.addEventListener('keyup', (e) => { I.keys.delete(e.code); });
  window.addEventListener('blur', () => { I.keys.clear(); I.mouse.down.fill(false); dragging = false; });
  canvas.addEventListener('mousedown', (e) => {
    I.mouse.down[e.button] = true;
    I.mouse.hit[e.button] = true;
    if (!I.locked) { dragging = true; lx = e.clientX; ly = e.clientY; }
    e.preventDefault();
  });
  window.addEventListener('mouseup', (e) => { I.mouse.down[e.button] = false; if (e.button === 0) dragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!I.enabled) return;
    if (I.locked) move(e.movementX || 0, e.movementY || 0);
    else if (dragging) { move(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY; }
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('wheel', (e) => { if (I.enabled) I.mouse.wheel += Math.sign(e.deltaY); }, { passive: true });
  document.addEventListener('pointerlockchange', () => {
    I.locked = document.pointerLockElement === canvas;
    if (I.onLock) I.onLock(I.locked);
  });
  document.addEventListener('pointerlockerror', () => { I.fallback = true; if (I.onLock) I.onLock(false); });

  Object.assign(I, {
    lock() {
      if (document.pointerLockElement === canvas) return;
      try {
        const p = canvas.requestPointerLock && canvas.requestPointerLock({ unadjustedMovement: true });
        if (p && p.catch) p.catch(() => { try { canvas.requestPointerLock(); } catch (e) { I.fallback = true; } });
      } catch (e) {
        try { canvas.requestPointerLock(); } catch (e2) { I.fallback = true; }
      }
    },
    unlock() { if (document.pointerLockElement) document.exitPointerLock(); },
    /** 灵敏度 1 时每像素 0.11° */
    look: (px) => 0.00192 * I.sens * px,
    /** 前后 / 左右的输入轴（-1..1）：W = 向前，D = 向右 */
    axis() {
      const f = (I.keys.has('KeyW') || I.keys.has('ArrowUp') ? 1 : 0) - (I.keys.has('KeyS') || I.keys.has('ArrowDown') ? 1 : 0);
      const r = (I.keys.has('KeyD') || I.keys.has('ArrowRight') ? 1 : 0) - (I.keys.has('KeyA') || I.keys.has('ArrowLeft') ? 1 : 0);
      const l = Math.hypot(f, r);
      return l > 1 ? [f / l, r / l] : [f, r];
    },
    endFrame() { I.mouse.dx = I.mouse.dy = I.mouse.wheel = 0; I.hit.clear(); I.mouse.hit.fill(false); },
  });
  return I;
}
