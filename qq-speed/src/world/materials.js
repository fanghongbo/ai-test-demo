// 世界的贴图与材质。全部在启动时程序化烘焙（逐像素）或在 Canvas 上画出来，页面不带任何图片文件。
// 材质本身不带颜色：颜色来自顶点色（gfx/batch.js、world/sweep.js），一套“漆面”能画出白的栏杆、蓝的饰带、红的路沿。
import * as THREE from 'three';
import { bake, canvasTex, Noise, Fbm, rng, stencil, clamp01 } from '../gfx/texgen.js';

const FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif';
const srgb = (r, g, b) => [r / 255, g / 255, b / 255];

function pbr(b, o = {}) {
  return new THREE.MeshStandardMaterial({ map: b.map, normalMap: b.normalMap, aoMap: b.ormMap, roughnessMap: b.ormMap, metalnessMap: b.ormMap, roughness: 1, metalness: 1, aoMapIntensity: 1, vertexColors: true, ...o });
}
const flat = (o = {}) => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0, vertexColors: true, ...o });

/** 烘焙一套贴图（异步分片，让加载条能走） */
export async function createMaterials(onStep = () => {}) {
  const M = { glowGain: 1 }, steps = [];                                       // glowGain: how much always-lit things (car lights, items, flames) are turned down at night
  const step = (name, fn) => steps.push([name, fn]);

  // ————————————————— 沥青 —————————————————
  step('asphalt', () => {
    const big = new Fbm(4, 4, 11), mid = new Noise(24, 24, 15), fine = new Noise(128, 128, 12), agg = new Noise(96, 96, 13), patch = new Fbm(3, 3, 14);
    const b = bake(512, 512, (u, v, s) => {
      const a = big.at(u, v), m = mid.at(u, v), g = fine.at(u, v), ag = agg.at(u, v), p = patch.at(u, v);
      let gr = 64 + (a - 0.5) * 40 + (m - 0.5) * 26 + (g - 0.5) * 26 + (ag - 0.5) * 14;      // 大块色斑 → 中等颗粒 → 细砂
      if (p > 0.57) gr -= (p - 0.57) * 46;                                                  // 修补过的深色块
      if (ag > 0.945) gr += (ag - 0.945) * 900;                                             // 露出来的浅色骨料
      s.rgb = [gr / 255 * 0.975, gr / 255, gr / 255 * 1.035];
      s.h = 0.5 + (g - 0.5) * 0.55 + (ag - 0.5) * 0.5 + (m - 0.5) * 0.12;
      s.r = 0.84 + (g - 0.5) * 0.20 - (a - 0.5) * 0.08;
      s.m = 0; s.a = 1;
    }, { normal: 1.4 });
    const maxAn = 16;
    for (const t of [b.map, b.normalMap, b.ormMap]) { t.anisotropy = maxAn; t.needsUpdate = true; }
    M.asphaltTex = b;
  });

  // ————————————————— 铺地砖（人行道、广场） —————————————————
  step('paver', () => {
    const n = new Fbm(5, 3, 21), tiles = new Noise(8, 8, 22), r = rng(9);
    const b = bake(512, 512, (u, v, s) => {
      const tx = u * 8, ty = v * 8, fx = tx - Math.floor(tx), fy = ty - Math.floor(ty);
      const grout = Math.min(fx, 1 - fx, fy, 1 - fy) < 0.035;
      const tone = tiles.at(u, v), nn = n.at(u, v);
      const g = grout ? 150 : 196 + (tone - 0.5) * 26 + (nn - 0.5) * 24;
      s.rgb = [g / 255 * 1.0, g / 255 * 0.995, g / 255 * 0.975];
      s.h = grout ? 0.30 : 0.5 + (nn - 0.5) * 0.10;
      s.r = grout ? 0.95 : 0.72 + (nn - 0.5) * 0.12;
      s.m = 0; s.a = grout ? 0.75 : 1;
    }, { normal: 2.2 });
    M.paver = pbr(b, { normalScale: new THREE.Vector2(0.7, 0.7) });
  });

  // ————————————————— 清水混凝土（墙、桥塔、护栏基座） —————————————————
  step('concrete', () => {
    const n = new Fbm(6, 4, 31), stain = new Fbm(2, 2, 32, 0.6, 3), r = rng(3);
    const b = bake(512, 512, (u, v, s) => {
      const nn = n.at(u, v), st = stain.at(u, v);
      let g = 186 + (nn - 0.5) * 26 - Math.max(0, st - 0.55) * 50;
      const seam = Math.min(Math.abs(((v * 2) % 1) - 0.5), 0.5) > 0.492 || Math.min(Math.abs(((u * 2) % 1) - 0.5), 0.5) > 0.492;   // 模板拼缝
      if (seam) g -= 34;
      s.rgb = [g / 255, g / 255 * 0.995, g / 255 * 0.98];
      s.h = 0.5 + (nn - 0.5) * 0.35 - (seam ? 0.25 : 0);
      s.r = 0.80 + (nn - 0.5) * 0.16;
      s.m = 0; s.a = 1;
    }, { normal: 1.4 });
    M.concrete = pbr(b, { normalScale: new THREE.Vector2(0.6, 0.6) });
  });

  // ————————————————— 白漆（栏杆、拱门、桥塔、灯杆） —————————————————
  step('paint', () => {
    const n = new Noise(48, 48, 41), big = new Fbm(3, 2, 42);
    const b = bake(256, 256, (u, v, s) => {
      const nn = n.at(u, v), bb = big.at(u, v);
      s.rgb = [0.905 + (bb - 0.5) * 0.03, 0.915 + (bb - 0.5) * 0.03, 0.93 + (bb - 0.5) * 0.03];
      s.h = 0.5 + (nn - 0.5) * 0.10;
      s.r = 0.36 + (nn - 0.5) * 0.10; s.m = 0; s.a = 1;
    }, { normal: 0.8 });
    M.paint = pbr(b);
    M.gloss = pbr(b, { roughness: 0.62 });                                 // 更亮的高光：车身级别的漆面（桥缆、饰条）
  });

  // ————————————————— 拉丝金属（护栏板、桁架、灯罩） —————————————————
  step('steel', () => {
    const n = new Noise(96, 6, 51), big = new Fbm(4, 2, 52);
    const b = bake(256, 256, (u, v, s) => {
      const nn = n.at(u, v), bb = big.at(u, v);
      s.rgb = [0.60 + (bb - 0.5) * 0.05, 0.62 + (bb - 0.5) * 0.05, 0.645 + (bb - 0.5) * 0.05];
      s.h = 0.5 + (nn - 0.5) * 0.12;
      s.r = 0.30 + (nn - 0.5) * 0.14; s.m = 0.92; s.a = 1;
    }, { normal: 0.7 });
    M.steel = pbr(b);
    M.chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12, metalness: 1, vertexColors: true });
  });

  // ————————————————— 石材（塔桥的哥特式塔楼） —————————————————
  step('stone', () => {
    const n = new Fbm(8, 3, 61), r = rng(62);
    const rows = 8, offs = Array.from({ length: rows }, () => r());
    const b = bake(512, 512, (u, v, s) => {
      const ry = v * rows, row = Math.floor(ry), fy = ry - row;
      const cols = 4, cx = u * cols + offs[row], col = Math.floor(cx), fx = cx - col;
      const mortar = fy < 0.05 || fx < 0.03;
      const nn = n.at(u, v), tone = 0.94 + ((col * 7 + row * 13) % 5) * 0.02;
      const g = mortar ? 168 : (208 + (nn - 0.5) * 30) * tone;
      s.rgb = [g / 255 * 1.0, g / 255 * 0.985, g / 255 * 0.95];
      s.h = mortar ? 0.25 : 0.5 + (nn - 0.5) * 0.5;
      s.r = 0.78 + (nn - 0.5) * 0.12; s.m = 0; s.a = mortar ? 0.8 : 1;
    }, { normal: 1.8 });
    M.stone = pbr(b);
  });

  // ————————————————— 玻璃幕墙（高楼） —————————————————
  step('glass', () => {
    const n = new Noise(32, 32, 71), r = rng(72);
    const floors = 6, bays = 8, lit = Array.from({ length: floors * bays }, () => r()), pane = Array.from({ length: floors * bays }, () => r());
    const b = bake(512, 512, (u, v, s) => {
      const fy = v * floors, fl = Math.floor(fy), ff = fy - fl;
      const bx = u * bays, by = Math.floor(bx), bf = bx - by, nn = n.at(u, v), id = fl * bays + by;
      const spandrel = ff < 0.30, mullion = bf < 0.022 || ff < 0.010 || ff > 0.990;
      if (mullion) { s.rgb = [0.84, 0.86, 0.88]; s.r = 0.40; s.m = 0.35; }
      else if (spandrel) { const g = 0.80 + (nn - 0.5) * 0.04; s.rgb = [g, g * 1.004, g * 1.012]; s.r = 0.42; s.m = 0.05; }
      else { const g = (0.70 + (pane[id] - 0.5) * 0.16) * (1.10 - 0.22 * ff);        // 每块玻璃略有差别，上亮下暗像映着天
             s.rgb = [g * 0.84, g * 0.93, g * 1.03]; s.r = 0.07; s.m = 0.0; }
      s.h = mullion ? 0.64 : spandrel ? 0.55 : 0.50; s.a = 1;
    }, { normal: 2.0 });
    const em = bake(512, 512, (u, v, s) => {
      const fy = v * floors, fl = Math.floor(fy), ff = fy - fl, bx = u * bays, by = Math.floor(bx), bf = bx - by;
      const on = ff >= 0.30 && bf >= 0.022 && lit[fl * bays + by] > 0.62;
      s.rgb = on ? [1.0, 0.86, 0.62] : [0, 0, 0]; s.r = 0.5; s.m = 0; s.a = 1;
    });
    M.glassTex = b;
    M.glassTower = new THREE.MeshPhysicalMaterial({ map: b.map, normalMap: b.normalMap, roughnessMap: b.ormMap, metalnessMap: b.ormMap, roughness: 1, metalness: 1,
      emissiveMap: em.map, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0, envMapIntensity: 1.5, vertexColors: true });
    // 清玻璃（穹顶、雨棚、车窗以外的大面积玻璃）：带一点蓝绿的透射感，用不透明的反射玻璃来做（便宜、稳定）
    M.clearGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, metalness: 0.0, envMapIntensity: 1.8, vertexColors: true });
    // 幕墙玻璃（楼群的裙楼、商场的西翼）：颜色由顶点色给，本身是带色的镜面，映着天
    M.glass = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.8, envMapIntensity: 1.25, vertexColors: true });
    M.canopy = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.16, metalness: 0.0, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2, vertexColors: true });
  });

  // ————————————————— 菱面幕墙（商场的低多边形外立面） —————————————————
  step('facet', () => {
    const r = rng(81), tone = new Noise(8, 8, 82);
    const b = bake(512, 512, (u, v, s) => {
      const n = 4, du = (u * n) % 1 - 0.5, dv = (v * n) % 1 - 0.5;
      const d = Math.abs(du) + Math.abs(dv);                                 // 菱形金字塔：面是平的，棱是尖的
      const h = Math.max(0, 1 - d * 1.6);
      const which = ((Math.floor(u * n) * 3 + Math.floor(v * n) * 5) % 7) < 2, t = tone.at(u, v);      // 约四分之一的菱面是玻璃，沿斜线散开
      if (which) { s.rgb = [0.52 + (t - 0.5) * 0.05, 0.70 + (t - 0.5) * 0.06, 0.88 + (t - 0.5) * 0.06]; s.r = 0.10; s.m = 0.0; }
      else { s.rgb = [0.90, 0.91, 0.93]; s.r = 0.40; s.m = 0.0; }
      s.h = h; s.a = 1;
    }, { normal: 2.4 });
    M.facet = new THREE.MeshPhysicalMaterial({ map: b.map, normalMap: b.normalMap, roughnessMap: b.ormMap, metalnessMap: b.ormMap, roughness: 1, metalness: 1, envMapIntensity: 1.4, vertexColors: true });
  });

  // ————————————————— 草地 / 绿篱 / 树皮 / 棕榈叶 —————————————————
  step('green', () => {
    const blotch = [new Noise(4, 4, 91), new Noise(9, 9, 92), new Noise(18, 18, 93)], blade = new Noise(40, 13, 94), fine = [new Noise(48, 48, 95), new Noise(96, 96, 96)];
    const b = bake(256, 256, (u, v, s) => {
      const bl = (blotch[0].at(u, v) + 0.6 * blotch[1].at(u, v) + 0.3 * blotch[2].at(u, v)) / 1.9;
      const bd = blade.at(u, v), fn = (fine[0].at(u, v) + fine[1].at(u, v)) * 0.5;
      const t = clamp01((bl - 0.5) * 1.8 + 0.5 + (bd - 0.5) * 0.35);
      s.rgb = [0.20 + 0.20 * t, 0.42 + 0.30 * t, 0.10 + 0.12 * t];
      s.h = 0.5 + (bd - 0.5) * 0.5 + (fn - 0.5) * 0.5;
      s.r = 0.92; s.m = 0; s.a = 1;
    }, { normal: 1.6 });
    M.grass = pbr(b, { normalScale: new THREE.Vector2(0.8, 0.8) });
    const leaf = new Noise(48, 48, 97), leaf2 = new Noise(20, 20, 98), rl = rng(99);
    const h = bake(256, 256, (u, v, s) => {
      const a = leaf.at(u, v), c = leaf2.at(u, v);
      s.rgb = [0.085 + a * 0.13, 0.21 + a * 0.22, 0.055 + c * 0.08];
      s.h = a; s.r = 0.78; s.m = 0; s.a = 0.7 + a * 0.3;
    }, { normal: 2.6 });
    M.hedge = pbr(h);
    M.trunk = flat({ roughness: 0.9 });
    M.frond = new THREE.MeshStandardMaterial({ map: palmFrond(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.72, metalness: 0, vertexColors: true });
    M.leaf = new THREE.MeshStandardMaterial({ map: canopyTex(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.8, metalness: 0, vertexColors: true });
  });

  // ————————————————— 深色橡胶 / 塑料 / 碳纤、发光体、各种标识 —————————————————
  step('misc', () => {
    const n = new Noise(64, 64, 101);
    M.rubber = pbr(bake(128, 128, (u, v, s) => { const nn = n.at(u, v); s.rgb = [0.035, 0.035, 0.038]; s.h = 0.5 + (nn - 0.5) * 0.2; s.r = 0.86; s.m = 0; s.a = 1; }, { normal: 1 }), { vertexColors: true });
    M.dark = flat({ roughness: 0.5, metalness: 0.3 });
    M.window = flat({ roughness: 0.2, metalness: 0, envMapIntensity: 0.25 });      // 窗玻璃：深色、几乎不反环境，免得被天空照成一片浅蓝
    M.hill = flat({ roughness: 1, metalness: 0 });
    M.gold = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.24, metalness: 1, vertexColors: true });
    M.lamp = new THREE.MeshStandardMaterial({ color: 0xfff4dc, emissive: new THREE.Color(0xffe2b0), emissiveIntensity: 0.1, roughness: 0.3, metalness: 0 });
    M.led = new THREE.MeshStandardMaterial({ color: 0x9fdcff, emissive: new THREE.Color(0x49c2ff), emissiveIntensity: 0.4, roughness: 0.3, metalness: 0 });
    M.waterfall = flowMaterial(0);
    M.jet = flowMaterial(1);                                             // 喷泉水柱：向上流、顶端消散
    M.foam = new THREE.MeshBasicMaterial({ map: softDisc(), transparent: true, depthWrite: false, color: 0xffffff, opacity: 0.85 });
    M.sign = signMaterial();
    M.chevron = [chevronMaterial(1), chevronMaterial(-1)];
    M.checker = new THREE.MeshStandardMaterial({ map: checkerTex(), roughness: 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, transparent: true });
    M.gridSlot = new THREE.MeshStandardMaterial({ map: gridSlotTex(), roughness: 0.6, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, transparent: true });
  });

  // ————————————————— 地标用的材质：商城字、大屏、六边网格、穹顶玻璃、灯带 —————————————————
  step('landmarks', () => {
    const mt = canvasTex(2048, 256, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      stencil(x, 'NOVA SPEED MALL', w / 2, h / 2 + 8, { size: 170, color: '#ffffff', weight: 900, spacing: 14 });
    }, { clamp: true });
    M.mallSign = new THREE.MeshStandardMaterial({ map: mt, transparent: true, alphaTest: 0.5, roughness: 0.4, metalness: 0.1, emissive: new THREE.Color(0xbfe6ff), emissiveMap: mt, emissiveIntensity: 0.05, side: THREE.DoubleSide });
    M.screen = screenMaterial();
    M.hex = new THREE.MeshStandardMaterial({ map: hexGridTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.42, metalness: 0.25 });
    M.hexDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: M.hex.map, alphaTest: 0.5 });   // 阳光只被网格杆挡住：广场上是六边形的斑驳光点
    M.domeGlass = new THREE.MeshPhysicalMaterial({ color: 0xbfe0f2, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.5, envMapIntensity: 1.8, side: THREE.DoubleSide, flatShading: true });
    M.pool = new THREE.MeshPhysicalMaterial({ color: 0x1d6a86, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.9, envMapIntensity: 1.6 });
    M.sail = new THREE.MeshStandardMaterial({ color: 0xf7f7f3, roughness: 0.8, side: THREE.DoubleSide });
    M.flagUni = { value: 0 };
    M.flag = new THREE.MeshStandardMaterial({ map: flagTex(), roughness: 0.75, side: THREE.DoubleSide });
    M.flag.onBeforeCompile = (sh) => {                   // 旗面飘动：离旗杆越远摆幅越大
      sh.uniforms.uTime = M.flagUni;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += ( sin( transformed.x * 3.2 - uTime * 7.0 ) * 0.22 + sin( transformed.x * 6.5 - uTime * 11.0 + 1.3 ) * 0.07 ) * uv.x * uv.x;\ntransformed.y += sin( transformed.x * 2.1 - uTime * 5.0 ) * 0.06 * uv.x;');
    };
    M.flag.customProgramCacheKey = () => 'nova-flag';
    const bt = bannerTex();
    M.banner = new THREE.MeshStandardMaterial({ map: bt, emissiveMap: bt, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0, roughness: 0.5 });
    M.ringLed = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uLevel: { value: 0 }, uGain: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      // uv.x 是这段灯带在六边形上的序号，uv.y 沿灯带 0→1：两者合成沿周向的坐标，光点就能绕着环追下去
      fragmentShader: `uniform float uTime, uLevel, uGain; varying vec2 vUv;
        void main(){
          float v = ( vUv.x + vUv.y ) / 6.0;
          float a = fract( v * 3.0 - uTime * 0.11 ), b = fract( - v * 2.0 - uTime * 0.07 + 0.4 );
          float chase = smoothstep( 0.0, 0.05, a ) * ( 1.0 - smoothstep( 0.10, 0.42, a ) ) + smoothstep( 0.0, 0.05, b ) * ( 1.0 - smoothstep( 0.10, 0.30, b ) );
          vec3 base = mix( vec3( 0.05, 0.36, 0.95 ), vec3( 0.20, 0.90, 1.0 ), 0.5 + 0.5 * sin( v * 6.2831 ) );
          gl_FragColor = vec4( ( base * ( 0.7 + 0.6 * uLevel ) + vec3( 0.6, 0.95, 1.0 ) * chase * ( 1.4 + 5.0 * uLevel ) ) * uGain, 1.0 );
        }`,
    });
  });

  // 墙体 / 护栏是沿赛道扫掠出来的：左侧的墙面法线朝外，用双面材质让朝着路的那一面也能被画出来（three 会自动翻转背面的法线）
  for (const m of [M.concrete, M.stone, M.steel, M.paint, M.gloss, M.hedge]) if (m) m.side = THREE.DoubleSide;
  let k = 0;
  for (const [name, fn] of steps) { fn(); k++; onStep(k / steps.length, name); await new Promise((r) => setTimeout(r, 0)); }
  M.TEXEL = { asphalt: 3.6, paver: 2.4, concrete: 4, paint: 3, steel: 1.5, stone: 6, glass: [12, 21.6], facet: 8, grass: 5, hedge: 2 };
  return M;
}

// ————————————————— Canvas 贴图 —————————————————

function palmFrond() {
  const t = canvasTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const r = rng(7);
    x.strokeStyle = '#4f8a2e'; x.lineCap = 'round';
    for (let i = 0; i < 46; i++) {                                            // 一排小叶：从中轴向两侧斜出
      const y = 10 + (i / 46) * 236, len = 78 + r() * 40 - Math.abs(i / 46 - 0.45) * 40;
      for (const s of [-1, 1]) {
        const g = 70 + r() * 60;
        x.strokeStyle = `rgb(${34 + g * 0.35 | 0},${92 + g * 0.6 | 0},${28 + g * 0.2 | 0})`;
        x.lineWidth = 5 + r() * 3;
        x.beginPath(); x.moveTo(128, y); x.lineTo(128 + s * len, y + 20 + r() * 16); x.stroke();
      }
    }
    x.strokeStyle = '#7a9a3a'; x.lineWidth = 7; x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.stroke();
  }, { clamp: true });
  return t;
}
function canopyTex() {
  return canvasTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const r = rng(17);
    for (let i = 0; i < 520; i++) {
      const cx = 20 + r() * 216, cy = 20 + r() * 216, d = Math.hypot(cx - 128, cy - 128);
      if (d > 104 + r() * 14) continue;
      const g = 90 + r() * 90;
      x.fillStyle = `rgb(${30 + g * 0.30 | 0},${g | 0},${30 + g * 0.18 | 0})`;
      x.beginPath(); x.ellipse(cx, cy, 9 + r() * 9, 5 + r() * 6, r() * 3.14, 0, 6.3); x.fill();
    }
  }, { clamp: true });
}
export function softDisc() {
  return canvasTex(128, 128, (x, w, h) => {
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, { clamp: true });
}
function checkerTex() {
  return canvasTex(512, 32, (x) => { for (let i = 0; i < 32; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#f4f4f0' : '#141416'; x.fillRect(i * 16, j * 16, 16, 16); } }, { clamp: true });
}
function gridSlotTex() {
  return canvasTex(256, 128, (x) => {
    x.clearRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(244,244,238,0.92)'; x.lineWidth = 7; x.lineCap = 'square';
    x.beginPath(); x.moveTo(250, 6); x.lineTo(120, 6); x.lineTo(60, 122); x.moveTo(250, 122); x.lineTo(70, 122); x.stroke();
  }, { clamp: true });
}
/** 发卡弯外的导向牌：蓝底、白箭头（chevron 串），指向弯的方向 */
function chevronMaterial(dir) {
  const t = canvasTex(1024, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2f8fe8'); g.addColorStop(1, '#1455a8');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#ff5a1e'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      const cx = 128 + i * 192;
      x.beginPath();
      if (dir > 0) { x.moveTo(cx - 60, 40); x.lineTo(cx + 50, 128); x.lineTo(cx - 60, 216); x.lineTo(cx - 22, 216); x.lineTo(cx + 88, 128); x.lineTo(cx - 22, 40); }
      else { x.moveTo(cx + 60, 40); x.lineTo(cx - 50, 128); x.lineTo(cx + 60, 216); x.lineTo(cx + 22, 216); x.lineTo(cx - 88, 128); x.lineTo(cx + 22, 40); }
      x.closePath(); x.fill();
    }
    x.fillStyle = 'rgba(255,255,255,0.10)';
    for (let i = 0; i < 14; i++) x.fillRect(0, 10 + i * 18, w, 4);
  }, { clamp: true });
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.42, metalness: 0.05, emissive: new THREE.Color(0xffffff), emissiveMap: t, emissiveIntensity: 0.04 });
}
/** 广告牌 / 路牌：一张图集，上面画了几块牌子（见 SIGN_UV） */
export const SIGN_UV = {
  eleven: [0, 0.5, 1, 1], nova: [0, 0, 1, 0.5],
};
function signMaterial() {
  const t = canvasTex(1024, 1024, (x, w, h) => {
    // 上半：十一城
    let g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#123c78'); g.addColorStop(1, '#0a1f44');
    x.fillStyle = g; x.fillRect(0, 0, w, 512);
    x.strokeStyle = '#49c2ff'; x.lineWidth = 14; x.strokeRect(24, 24, w - 48, 464);
    stencil(x, '十一城', 512, 190, { size: 190, color: '#ffffff', weight: 900, spacing: 10 });
    stencil(x, 'ELEVENTH  CITY', 512, 362, { size: 62, color: '#49c2ff', weight: 700, spacing: 14 });
    // 下半：NOVA
    g = x.createLinearGradient(0, 512, 0, 1024);
    g.addColorStop(0, '#ff8a1e'); g.addColorStop(1, '#e2451a');
    x.fillStyle = g; x.fillRect(0, 512, w, 512);
    x.strokeStyle = '#ffffff'; x.lineWidth = 14; x.strokeRect(24, 536, w - 48, 464);
    stencil(x, 'NOVA', 512, 720, { size: 230, color: '#ffffff', weight: 900, spacing: 10 });
    stencil(x, 'SPEED  ·  CITY', 512, 910, { size: 70, color: '#fff0c0', weight: 700, spacing: 12 });
  }, { clamp: true });
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.05, emissive: new THREE.Color(0xffffff), emissiveMap: t, emissiveIntensity: 0.05 });
}

/** 夜里灯和窗的发光强度随“人造光系数”变化。
 *  夜里的曝光是白天的八九倍，所以全亮时的强度按“看起来的亮度”（曝光之后的值）来定，再除以当前曝光 */
export function setLampLevel(M, level, exposure = 1) {
  const per = (shown) => shown / Math.max(0.2, exposure), mix = (day, night) => day + level * (per(night) - day);
  M.lamp.emissiveIntensity = mix(0.1, 2.3);
  M.led.emissiveIntensity = mix(0.4, 1.9);
  M.glassTower.emissiveIntensity = level * per(1.1);
  M.sign.emissiveIntensity = mix(0.05, 0.95);
  for (const c of M.chevron) c.emissiveIntensity = mix(0.04, 0.95);
  M.mallSign.emissiveIntensity = mix(0.05, 1.25);
  M.screen.color.setScalar(mix(0.8, 1.0));
  M.ringLed.uniforms.uLevel.value = level;
  M.ringLed.uniforms.uGain.value = 1 + level * (per(1) - 1);
  M.glowGain = Math.min(1, per(0.9));                      // 一直是亮的东西（车灯、道具、火焰）在夜里按这个系数压一下
  for (const fn of M.onGlowGain || []) fn(M.glowGain);
  M.banner.emissiveIntensity = level * per(1.0);
}

/** 每帧：流动的水、追光的灯带、轮播的大屏 */
export function tickMaterials(M, time) {
  for (const m of [M.waterfall, M.jet, M.ringLed]) {
    if (m.uniforms.tTime) m.uniforms.tTime.value = time; else m.uniforms.uTime.value = time;
  }
  M.screen.map.offset.x = (Math.floor(time / 5) % 3) / 3;
}

/** 旗子：橙底、白色斜带、NOVA */
function flagTex() {
  return canvasTex(256, 160, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ff9a1e'); g.addColorStop(1, '#e23c1a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(0, 118); x.lineTo(w, 46); x.lineTo(w, 78); x.lineTo(0, 150); x.closePath(); x.fill();
    stencil(x, 'NOVA', w * 0.52, 52, { size: 62, color: '#ffffff', weight: 900, spacing: 4 });
    stencil(x, 'SPEED', w * 0.58, 132, { size: 30, color: '#123c78', weight: 800, spacing: 6 });
  }, { clamp: true });
}

/** 起点门架上的横幅：上下两条方格，中间是十一城 */
function bannerTex() {
  return canvasTex(1024, 144, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#164a96'); g.addColorStop(1, '#0a2560');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) for (const [j, y0] of [[0, 0], [1, h - 18]]) { x.fillStyle = (i + j) % 2 ? '#f4f4f0' : '#141416'; x.fillRect(i * 16, y0, 16, 18); }
    stencil(x, '十一城  ·  START  /  FINISH', w / 2, h / 2, { size: 64, color: '#ffffff', weight: 900, spacing: 8 });
  }, { clamp: true });
}

// ————————————————— 地标的小件 —————————————————

/** 水流：mode 0 = 瀑布（向下、底部消散），1 = 喷泉（向上、顶端消散） */
function flowMaterial(mode) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { tTime: { value: 0 }, tNoise: { value: null }, tTint: { value: new THREE.Color(0.80, 0.94, 1.0) }, tMode: { value: mode } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float tTime, tMode; uniform sampler2D tNoise; uniform vec3 tTint; varying vec2 vUv;
      void main(){
        float fy = mix( vUv.y, 1.0 - vUv.y, tMode );
        vec2 p = vec2( vUv.x * 5.0, fy * 2.2 - tTime * 1.25 );
        float a = texture2D( tNoise, p ).r, b = texture2D( tNoise, p * 2.3 + vec2( 0.37, tTime * 0.9 ) ).g;
        float streak = smoothstep( 0.18, 0.72, a * 0.65 + b * 0.35 + 0.18 );
        float edge = mix( smoothstep( 0.0, 0.06, vUv.x ) * smoothstep( 1.0, 0.94, vUv.x ), 1.0, tMode );
        float foot = smoothstep( 0.0, mix( 0.10, 0.45, tMode ), fy );
        vec3 col = tTint * ( 0.55 + 0.75 * streak );
        gl_FragColor = vec4( col, streak * mix( 0.80, 0.55, tMode ) * edge * foot );
      }`,
  });
}

/** 六边网格（可平铺）：一张图 = 两列 × 四行的周期。尖顶六边形的外接半径 = 图宽 / (2√3) */
function hexGridTex() {
  const w = 156, h = 270, a = w / (2 * Math.sqrt(3));
  return canvasTex(w, h, (x) => {
    x.clearRect(0, 0, w, h);
    x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.lineJoin = 'round';
    for (let i = -1; i <= 2; i++) for (let j = -1; j <= 4; j++) {
      const cx = i * Math.sqrt(3) * a + (j % 2 ? (Math.sqrt(3) * a) / 2 : 0), cy = j * 1.5 * a;
      x.beginPath();
      for (let k = 0; k < 6; k++) { const q = Math.PI / 6 + (k * Math.PI) / 3; if (k) x.lineTo(cx + a * Math.cos(q), cy + a * Math.sin(q)); else x.moveTo(cx + a * Math.cos(q), cy + a * Math.sin(q)); }
      x.closePath(); x.stroke();
    }
  }, { repeat: true });
}

/** 大屏：一张画布上横着画三帧，靠贴图偏移轮播。自发光（LED 屏），不受光照 */
function screenMaterial() {
  const t = canvasTex(3072, 512, (x, w, h) => {
    const f = w / 3;
    // 第一帧：NOVA SPEED GP
    let g = x.createLinearGradient(0, 0, f, h); g.addColorStop(0, '#0a2a66'); g.addColorStop(1, '#06143a');
    x.fillStyle = g; x.fillRect(0, 0, f, h);
    x.fillStyle = 'rgba(255,138,30,0.85)';
    for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(f - 40 - k * 70, 0); x.lineTo(f - 10 - k * 70, 0); x.lineTo(f - 150 - k * 70, h); x.lineTo(f - 180 - k * 70, h); x.closePath(); x.fill(); }
    drawCar(x, 150, 330, 0.9, '#f4f6f8', '#ff8a1e');
    stencil(x, 'NOVA SPEED GP', f / 2, 96, { size: 92, color: '#ffffff', weight: 900, spacing: 6 });
    stencil(x, '十一城 · 总决赛', f / 2, 452, { size: 54, color: '#ffd27a', weight: 700, spacing: 8 });
    // 第二帧：雷电
    g = x.createLinearGradient(f, 0, 2 * f, h); g.addColorStop(0, '#ff7a1a'); g.addColorStop(1, '#b81f12');
    x.fillStyle = g; x.fillRect(f, 0, f, h);
    x.fillStyle = 'rgba(255,255,255,0.10)'; for (let k = 0; k < 9; k++) x.fillRect(f, 30 + k * 54, f, 16);
    drawCar(x, f + 110, 330, 1.0, '#14161c', '#49c2ff');
    stencil(x, '雷  电', f + f * 0.34, 150, { size: 190, color: '#ffffff', weight: 900, spacing: 10 });
    stencil(x, 'THUNDER  B', f + f * 0.66, 452, { size: 56, color: '#ffe9b0', weight: 700, spacing: 10 });
    // 第三帧：十一城
    g = x.createLinearGradient(2 * f, 0, 3 * f, h); g.addColorStop(0, '#0a6a8a'); g.addColorStop(1, '#04304a');
    x.fillStyle = g; x.fillRect(2 * f, 0, f, h);
    x.strokeStyle = 'rgba(120,230,255,0.30)'; x.lineWidth = 5;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) {
      const cx = 2 * f + i * 118 + (j % 2 ? 59 : 0), cy = j * 118 + 20, a = 56;
      x.beginPath();
      for (let k = 0; k < 6; k++) { const q = Math.PI / 6 + (k * Math.PI) / 3; if (k) x.lineTo(cx + a * Math.cos(q), cy + a * Math.sin(q)); else x.moveTo(cx + a * Math.cos(q), cy + a * Math.sin(q)); }
      x.closePath(); x.stroke();
    }
    stencil(x, '十一城', 2.5 * f, 200, { size: 230, color: '#ffffff', weight: 900, spacing: 16 });
    stencil(x, 'ELEVENTH  CITY', 2.5 * f, 410, { size: 70, color: '#7fe0ff', weight: 700, spacing: 14 });
  });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(1 / 3, 1);
  return new THREE.MeshBasicMaterial({ map: t });
}

/** 侧视跑车剪影（画在 830 × 150 的框里，地面在 y=62）：车身、座舱、两个轮子 */
function drawCar(x, ox, oy, s, body, accent) {
  x.save(); x.translate(ox, oy); x.scale(s, s);
  x.fillStyle = '#0c0e12';
  for (const wx of [150, 640]) { x.beginPath(); x.arc(wx, 30, 56, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = '#c9ced6';
  for (const wx of [150, 640]) { x.beginPath(); x.arc(wx, 30, 28, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = body;
  x.beginPath();
  x.moveTo(0, 20); x.bezierCurveTo(40, -28, 190, -44, 330, -50); x.bezierCurveTo(440, -118, 600, -114, 690, -48);
  x.bezierCurveTo(770, -36, 820, -14, 830, 20); x.lineTo(830, 40); x.lineTo(0, 40); x.closePath(); x.fill();
  x.fillStyle = accent;
  x.beginPath(); x.moveTo(340, -56); x.bezierCurveTo(440, -110, 580, -108, 660, -54); x.lineTo(600, -54); x.bezierCurveTo(520, -84, 430, -82, 372, -52); x.closePath(); x.fill();
  x.fillRect(0, 8, 830, 8);
  x.restore();
}
