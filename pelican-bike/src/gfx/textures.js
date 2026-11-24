// 程序化贴图（Canvas 绘制，运行时生成，无外部文件）。显示色域直出。
import * as THREE from 'three';

/** @param {(g:CanvasRenderingContext2D,w:number,h:number)=>void} draw */
export function canvasTexture(w, h, draw, o = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = o.data ? THREE.NoColorSpace : THREE.SRGBColorSpace;        // 颜色贴图按 sRGB 解码；法线 / 粗糙度等数据贴图传 data: true
  t.wrapS = t.wrapT = o.wrap === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  if (o.repeat) t.repeat.set(o.repeat[0], o.repeat[1]);
  t.anisotropy = o.aniso ?? 4;
  t.generateMipmaps = o.mip ?? true;
  t.minFilter = o.mip === false ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  return t;
}

const fill = (g, c) => { g.fillStyle = c; g.fill(); };

/** 头盔：珊瑚红底 + 奶油色中条 + 透气槽（u 环向、v 从顶到底） */
export function helmetTexture(base = '#ee5f4d', stripe = '#fff3dc', vent = '#7d2f2a') {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = stripe; g.fillRect(0, 0, w * 0.085, h); g.fillRect(w - w * 0.085, 0, w * 0.085, h);
    // 两侧细条
    g.fillStyle = stripe; g.globalAlpha = 0.9; g.fillRect(w * 0.2, 0, w * 0.022, h); g.fillRect(w * 0.78, 0, w * 0.022, h); g.globalAlpha = 1;
    // 透气槽：前后各三道，随球面纬度变宽再收窄
    g.fillStyle = vent;
    for (const cx of [0.3, 0.37, 0.63, 0.7]) for (const [y0, y1] of [[0.1, 0.36], [0.1, 0.36]]) {
      g.beginPath(); g.ellipse(w * cx, h * (y0 + y1) / 2, w * 0.016, h * (y1 - y0) / 2, 0, 0, Math.PI * 2); fill(g, vent);
    }
    g.beginPath(); g.ellipse(w * 0.5, h * 0.13, w * 0.014, h * 0.1, 0, 0, Math.PI * 2); g.fillStyle = vent; g.fill();
  }, { wrap: false, aniso: 8 });
}

/** 柳条编织：一上一下的扁条，间隙压暗；每个筐面各贴一份 */
export function wickerTexture(a = '#d9b27a', c = '#ecc78f') {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#6f4720'; g.fillRect(0, 0, w, h);                  // 缝隙底色
    const n = 7, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const over = (i + j) % 2 === 0, x = i * s, y = j * s;
      const grad = over ? c : a;
      g.fillStyle = grad;
      g.beginPath();
      if (over) g.roundRect(x - s * 0.1, y + s * 0.12, s * 1.2, s * 0.76, s * 0.3);
      else g.roundRect(x + s * 0.12, y - s * 0.1, s * 0.76, s * 1.2, s * 0.3);
      g.fill();
      // 扁条中间的高光与下缘的暗边，做出圆鼓的立体感
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.beginPath();
      if (over) g.roundRect(x + s * 0.04, y + s * 0.2, s * 0.92, s * 0.2, s * 0.1); else g.roundRect(x + s * 0.2, y + s * 0.04, s * 0.2, s * 0.92, s * 0.1);
      g.fill();
      g.fillStyle = 'rgba(90,50,15,0.28)';
      g.beginPath();
      if (over) g.roundRect(x + s * 0.04, y + s * 0.66, s * 0.92, s * 0.16, s * 0.08); else g.roundRect(x + s * 0.66, y + s * 0.04, s * 0.16, s * 0.92, s * 0.08);
      g.fill();
    }
  }, { repeat: [1, 1], aniso: 8 });
}

/** 围巾：薄荷底 + 两端奶油条纹（v 沿长度） */
export function scarfTexture(base = '#5cc3ae', stripe = '#fff3dc') {
  return canvasTexture(64, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = stripe;
    for (const y of [0.80, 0.88, 0.955]) g.fillRect(0, h * (y - 0.018), w, h * 0.036);
    g.globalAlpha = 0.10; g.fillStyle = '#000';
    for (let y = 0; y < h; y += 6) g.fillRect(0, y, w, 2);
    g.globalAlpha = 1;
  });
}

/** 沥青路面：横向 uv.x = 路宽，uv.y = 沿路（重复） */
export function roadTexture(o = {}) {
  const asphalt = o.asphalt ?? '#5f6677', line = o.line ?? '#fff6dc';
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = asphalt; g.fillRect(0, 0, w, h);
    // 颗粒
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 2600; i++) { const v = rnd(); g.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.10)'; g.fillRect(rnd() * w, rnd() * h, 1.6, 1.6); }
    // 两侧边线 + 中央虚线
    g.fillStyle = line;
    g.fillRect(w * 0.045, 0, w * 0.022, h); g.fillRect(w * 0.933, 0, w * 0.022, h);
    g.fillRect(w * 0.494, 0, w * 0.012, h * 0.5);
  }, { repeat: [1, 1], aniso: 8 });
}

/** 铺装步道砖 */
export function pavingTexture(a = '#e8dfcb', b = '#d6cab1') {
  return canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = b; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const off = (j % 2) * s * 0.5;
      g.fillStyle = (i + j) % 3 === 0 ? '#dfd4bd' : a;
      g.beginPath(); g.roundRect(((i * s + off) % w) + 1.5, j * s + 1.5, s - 3, s - 3, 3); g.fill();
      if (i * s + off + s > w) { g.beginPath(); g.roundRect(i * s + off - w + 1.5, j * s + 1.5, s - 3, s - 3, 3); g.fill(); }
    }
  }, { repeat: [1, 1], aniso: 8 });
}

/** 木板条 */
export function woodTexture(a = '#c08a55', b = '#9c6a3c') {
  return canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = i % 2 ? '#b98350' : '#c7915b'; g.fillRect(0, (i * h) / 5, w, h / 5 - 3);
      g.fillStyle = b; g.fillRect(0, (i * h) / 5 + h / 5 - 3, w, 3);
    }
    g.globalAlpha = 0.16; g.fillStyle = '#5a3517';
    for (let i = 0; i < 22; i++) { const y = (i * 37) % h; g.fillRect((i * 53) % w, y, 18 + (i * 7) % 30, 1.2); }
    g.globalAlpha = 1;
  }, { repeat: [1, 1] });
}

/** 圆点/条纹小贴图（旗子、遮阳伞） */
export function stripeTexture(a = '#ee5f4d', b = '#fff3dc', n = 6, vertical = true) {
  return canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = b; g.fillRect(0, 0, w, h); g.fillStyle = a;
    for (let i = 0; i < n; i += 2) { if (vertical) g.fillRect((i * w) / n, 0, w / n, h); else g.fillRect(0, (i * h) / n, w, h / n); }
  }, { wrap: false });
}

/** 噪点：用于沙滩/草地的大尺度色斑（顶点色之外的细纹理） */
export function grainTexture(alpha = 0.08, size = 128) {
  return canvasTexture(size, size, (g, w, h) => {
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    let seed = 11;
    const rnd = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 1800; i++) { g.fillStyle = rnd() > 0.5 ? `rgba(255,255,255,${alpha * 2})` : `rgba(0,0,0,${alpha * 2})`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3); }
  }, { repeat: [40, 40] });
}
