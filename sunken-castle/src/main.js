// 入口：建应用（加载条跟着走），出错了就显示出来。
import { createApp } from './game/app.js';

const $ = (id) => document.getElementById(id);

async function boot() {
  const bar = $('loadBar'), text = $('loadText');
  const app = await createApp($('view'), { progress: (label, k) => { text.textContent = label; bar.style.width = `${Math.round(k * 100)}%`; } });
  window.__game = app;
  while (!app.ready) await new Promise((r) => setTimeout(r, 60));                // 等头几帧画出来再揭开
  await new Promise((r) => setTimeout(r, 500));
  bar.style.width = '100%'; text.textContent = '完成';
  $('load').classList.add('is-done');
}

boot().catch((e) => {
  console.error(e);
  const n = $('error');
  n.hidden = false;
  n.textContent = `页面启动失败：${e.message}

需要支持 WebGL 2 的浏览器（Edge、Chrome、Firefox、Safari 的新版本），并且打开硬件加速。`;
});
