// 入口：建一个 App，把检查用的口子挂到 window.__game 上，然后启动。
import { App } from './game/app.js';

const app = new App(document.getElementById('view'));
window.__game = app.api();
window.addEventListener('error', (e) => {
  if (!app.ready && e.message) app.ui.fail(`页面出错：${e.message}\n刷新一下再试。`);
});
app.boot().catch((err) => {
  console.error(err);
  app.ui.fail(`启动的时候出了问题：${err && err.message ? err.message : err}\n换一个新一点的 Edge 或 Chrome 再试。`);
});
