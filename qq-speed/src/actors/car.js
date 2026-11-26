// 赛车模型：全部程序化。车身是沿车长方向放样出来的封闭壳体（每个车型有自己的宽度和腰带线），
// 上面再扣一个车身色的座舱壳、贴几块玻璃；轮拱处车底上翻，露出车轮；车头灯、尾灯、排气口、尾翼、后视镜按车型配。
// 车身坐标：+X 车头，+Y 上，+Z 右（和物理里的朝向一致：rotation.y = −psi）。
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTex, stencil, rng } from '../gfx/texgen.js';

const L = 4.5, HALF = L / 2, WHEEL_R = 0.37, WHEEL_W = 0.32, AXLE_F = 1.38, AXLE_R = -1.36, ARCH = 0.62;
const TAU = Math.PI * 2;
const FONT = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", Arial, sans-serif';

/** 每个车型的轮廓（米）。hw 半宽、belt 腰带线高度，都是离车头的比例 t 的折线（t=0 车头，t=1 车尾）；roof 座舱顶高；cabin 座舱占的 t 范围 */
const SHAPES = {
  novice: { hw: [0.78, 0.98, 0.98, 0.92], belt: [0.76, 0.86, 0.90, 0.88], roof: 1.32, cabin: [0.26, 0.88], wing: 0, wide: 0 },
  round: { hw: [0.52, 0.98, 0.90, 0.80], belt: [0.54, 0.72, 0.86, 0.82], roof: 1.22, cabin: [0.34, 0.80], wing: 0, wide: 0.03 },
  muscle: { hw: [0.66, 1.04, 0.94, 1.0, 0.84], belt: [0.64, 0.78, 0.92, 0.94, 0.88], roof: 1.26, cabin: [0.32, 0.76], wing: 0.55, wide: 0.06 },
  wedge: { hw: [0.36, 1.0, 0.88, 0.72], belt: [0.42, 0.62, 0.82, 0.76], roof: 1.16, cabin: [0.38, 0.78], wing: 0.75, wide: 0 },
  wing: { hw: [0.58, 0.98, 0.88, 0.76], belt: [0.50, 0.70, 0.88, 0.84], roof: 1.22, cabin: [0.34, 0.78], wing: 1.0, wide: 0.02 },
};

const css = (hex, k = 1) => `rgb(${Math.min(255, (hex >> 16 & 255) * k) | 0},${Math.min(255, (hex >> 8 & 255) * k) | 0},${Math.min(255, (hex & 255) * k) | 0})`;
/** 折线插值（平滑过弯） */
const pl = (arr, t) => { const n = arr.length - 1, x = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return arr[i] + (arr[i + 1] - arr[i]) * s; };
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const flat = (g) => (g.index ? g.toNonIndexed() : g);
const _p = [0, 0, 0, 0, 0, 0];

// ————————————————— 几何小工具 —————————————————

/** 一个截面的一圈点 [z, y]：超椭圆（方中带圆），车底压平 */
function ring(hw, yb, yt, n) {
  const yc = (yb + yt) / 2, ry = (yt - yb) / 2, out = [];
  for (let k = 0; k <= n; k++) {
    const a = -Math.PI / 2 + (k / n) * TAU, c = Math.cos(a), s = Math.sin(a);        // 从车底中点开始绕一圈：右、顶、左
    const zz = Math.sign(c) * Math.pow(Math.abs(c), 0.62), yy = Math.sign(s) * Math.pow(Math.abs(s), 0.42);
    out.push([hw * zz, yc + ry * yy * (yy < 0 ? 0.55 : 1)]);
  }
  return out;
}

/** 网格面：ptsFn(i, k, out) 往 out[0..2] 里写格点位置。i 沿车长，k 绕截面。uvs(ti, ki) 给贴图坐标 */
function grid(ST, n, ptsFn, uvs) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= ST; i++) for (let k = 0; k <= n; k++) {
    _p[0] = _p[1] = _p[2] = 0; ptsFn(i, k, _p); pos.push(_p[0], _p[1], _p[2]);
    if (uvs) { const t = uvs(i / ST, k / n); uv.push(t[0], t[1]); }
  }
  for (let i = 0; i < ST; i++) for (let k = 0; k < n; k++) {
    const a = i * (n + 1) + k, b = a + 1, c = a + n + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);                                                     // 绕序：法线朝外
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (uvs) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ————————————————— 车身 —————————————————

/** 车身壳体。贴图坐标：u 沿车长，v 绕一圈（0 车底、0.25 右侧、0.5 车顶、0.75 左侧） */
function bodyGeometry(sh) {
  const ST = 36, n = 28;
  const arch = (x) => {                                                             // 轮拱：车底在车轮处上翻
    let h = 0;
    for (const ax of [AXLE_F, AXLE_R]) { const d = (x - ax) / ARCH; if (Math.abs(d) < 1) h = Math.max(h, 0.5 * Math.sqrt(1 - d * d) * (0.9 + 0.1 * d * d)); }
    return h;
  };
  return grid(ST, n, (i, k, p) => {
    const t = i / ST, x = HALF - L * t, belt = pl(sh.belt, t), hw = pl(sh.hw, t) + sh.wide * Math.sin(t * Math.PI);
    const r = ring(hw, Math.min(0.2 + arch(x) * 0.82, belt - 0.1), belt, n)[k];
    p[0] = x; p[1] = r[1]; p[2] = r[0];
  }, (ti, ki) => [1 - ti, ki]);
}

/** 两端封口（取对应截面的轮廓，扇形封上） */
function capGeometry(sh, t, front) {
  const r = ring(pl(sh.hw, t) + sh.wide * Math.sin(t * Math.PI), 0.2, pl(sh.belt, t), 28), x = HALF - L * t, pos = [x, (0.2 + pl(sh.belt, t)) / 2, 0], idx = [];
  r.forEach((q) => pos.push(x, q[1], q[0]));
  for (let k = 1; k <= 28; k++) front ? idx.push(0, k + 1, k) : idx.push(0, k, k + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((pos.length / 3) * 2), 2));   // 取图左下角：纯底色
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** 座舱表面上的一点和它的外法线：从腰带线扣上去的半个超椭圆，前后收成尖。a 是截面上的角度（0 右侧腰带线，π/2 车顶，π 左侧） */
function cabinPoint(sh, t, a, out) {
  const [t0, t1] = sh.cabin, u = (t - t0) / (t1 - t0), belt = pl(sh.belt, t) - 0.015;
  const rise = Math.sin(Math.PI * Math.pow(clamp01(u), 0.9)) ** 0.7 * (sh.roof - belt), cw = Math.max(0.05, pl(sh.hw, t) - 0.12) * (0.98 - 0.3 * Math.abs(u - 0.5));
  const z = Math.cos(a), y = Math.pow(Math.max(0, Math.sin(a)), 0.62), nl = Math.hypot(z / cw, y / Math.max(rise, 0.05));
  out[0] = HALF - L * t; out[1] = belt + rise * y; out[2] = cw * z;
  out[3] = 0; out[4] = (y / Math.max(rise, 0.05)) / nl; out[5] = (z / cw) / nl;
  return out;
}

/** 座舱壳（车身色）。贴图坐标只取车顶那一条：车顶中条正好落在座舱顶上 */
function cabinGeometry(sh) {
  const [t0, t1] = sh.cabin;
  return grid(24, 16, (i, k, out) => cabinPoint(sh, t0 + ((t1 - t0) * i) / 24, (k / 16) * Math.PI, out), (ti, ki) => [1 - (t0 + (t1 - t0) * ti), 0.5 + 0.09 * Math.cos(ki * Math.PI)]);
}

/** 贴在座舱外面的一块玻璃：t 从 tA 到 tB，a 从 aA 到 aB */
function windowGeometry(sh, tA, tB, aA, aB) {
  const q = [0, 0, 0, 0, 0, 0];
  return grid(8, 6, (i, k, out) => {
    cabinPoint(sh, tA + ((tB - tA) * i) / 8, aA + ((aB - aA) * k) / 6, q);
    out[0] = q[0] + q[3] * 0.014; out[1] = q[1] + q[4] * 0.014; out[2] = q[2] + q[5] * 0.014;
  });
}

// ————————————————— 涂装 —————————————————

/** 车身贴图：底色 + 侧面色带 + 车顶中条 + 两侧的门牌圈。u 沿车长（图左边是车尾、右边是车头），v 绕一圈 */
function liveryTex(def) {
  return canvasTex(1024, 256, (x, w, h) => {
    const accent = css(def.accent), r = rng(def.id.length * 977 + def.cls.charCodeAt(0));
    x.fillStyle = css(def.color); x.fillRect(0, 0, w, h);
    for (const [y0, y1, sgn] of [[0.13, 0.235, 1], [0.765, 0.87, -1]]) {              // 两侧的色带：车头那头收成尖
      const a = y0 * h, b = y1 * h;
      x.fillStyle = accent;
      x.beginPath();
      x.moveTo(w * 0.985, (a + b) / 2);
      x.lineTo(w * 0.86, sgn > 0 ? a : b); x.lineTo(w * 0.12, sgn > 0 ? a : b); x.lineTo(w * 0.12, sgn > 0 ? b : a); x.lineTo(w * 0.86, sgn > 0 ? b : a);
      x.closePath(); x.fill();
      x.fillStyle = css(def.trim, 0.9 + r() * 0.2); x.fillRect(w * 0.12, sgn > 0 ? b : a - 7, w * 0.74, 7);
    }
    x.fillStyle = accent; x.fillRect(0, h * 0.455, w, h * 0.09);                      // 车顶中条
    x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(0, h * 0.448, w, 3); x.fillRect(0, h * 0.545 - 3, w, 3);
    // 门牌圈。左侧那一条带贴到车上是转了 180° 的（贴图上下翻转，左边车头又朝外），所以在图上要倒着画，字才是正的
    for (const [vc, rot] of [[0.25, -1], [0.75, 1]]) {
      const cy = vc * h, put = (txt, u, o) => { x.save(); x.translate(u * w, cy + 1); x.scale(rot, rot); stencil(x, txt, 0, 0, { ...o, font: FONT }); x.restore(); };
      x.fillStyle = '#f6f6f2'; x.beginPath(); x.ellipse(w * 0.47, cy, 74, 30, 0, 0, TAU); x.fill();
      x.strokeStyle = accent; x.lineWidth = 4; x.stroke();
      put(String(def.no ?? 7), 0.47, { size: 42, color: '#15161a', weight: 900 });
      put('NOVA', 0.225, { size: 30, color: accent, weight: 900, spacing: 5 });
      put('SPEED', 0.70, { size: 20, color: accent, weight: 800, spacing: 3 });       // 停在前轮拱前面一点，别被车轮挡住
    }
    x.fillStyle = 'rgba(0,0,0,0.35)';                                                  // 机盖上的两道通风口
    x.fillRect(w * 0.90, h * 0.385, w * 0.03, h * 0.075); x.fillRect(w * 0.945, h * 0.385, w * 0.03, h * 0.075);
  }, { clamp: true });
}

// ————————————————— 零件 —————————————————

/** 车轮：{ tire, rim, rimBack } 轮胎 + 轮毂（外圈 + 五根辐条 + 轴心）+ 辐条后面的暗底，轴沿 Z */
function wheelGeos() {
  const tire = new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, WHEEL_W, 26, 1).rotateX(Math.PI / 2), parts = [], backs = [];
  parts.push(new THREE.CylinderGeometry(0.235, 0.235, WHEEL_W, 20, 1, true).rotateX(Math.PI / 2));
  parts.push(new THREE.CylinderGeometry(0.075, 0.075, WHEEL_W + 0.02, 10).rotateX(Math.PI / 2));
  for (const q of [1, -1]) {
    parts.push(new THREE.TorusGeometry(0.235, 0.03, 6, 20).translate(0, 0, q * (WHEEL_W / 2)));
    for (let k = 0; k < 5; k++) {                                                     // 两面各五根辐条
      const a = (k / 5) * TAU + (q > 0 ? 0 : 0.3);
      parts.push(new THREE.BoxGeometry(0.36, 0.06, 0.035).translate(0.13, 0, q * (WHEEL_W / 2 - 0.015)).rotateZ(a));
    }
    const d = new THREE.CircleGeometry(0.232, 20);                                    // 暗底：辐条后面不是透的
    if (q < 0) d.rotateY(Math.PI);
    backs.push(d.translate(0, 0, q * (WHEEL_W / 2 - 0.045)));
  }
  return { tire, rim: mergeGeometries(parts.map(flat)), rimBack: mergeGeometries(backs.map(flat)) };
}

const FLAME_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FLAME_FRAG = `uniform float uT, uPower; uniform vec3 uCore, uEdge; uniform sampler2D tNoise; varying vec2 vUv;
  void main(){
    float a = texture2D( tNoise, vec2( vUv.x * 2.0, vUv.y * 1.4 - uT * 5.0 ) ).r;
    float len = 1.0 - smoothstep( 0.15, 1.0, vUv.y + ( a - 0.5 ) * 0.5 );        // 喷口（v=0）最亮，往后变淡
    vec3 col = mix( uEdge, uCore, pow( len, 2.0 ) ) * ( 1.6 + 2.6 * uPower );
    gl_FragColor = vec4( col, len * uPower * ( 0.65 + 0.5 * a ) );
  }`;

// ————————————————— 整车 —————————————————

/**
 * 建一辆车
 * @returns {{group, body, wheels, flames, tail, head, def}} wheels：[{pivot, x, z, front, spin}]，x/z 是车坐标里的位置
 */
export function createCarModel(def, M, noiseTex) {
  const sh = SHAPES[def.shape] || SHAPES.round, group = new THREE.Group();
  group.name = 'car.' + def.id;
  // 车身材质一开始就按“透明、不透明度 1”来建：给镜头跟前的对手车调淡时不用重新编译着色器
  const paint = new THREE.MeshPhysicalMaterial({ map: liveryTex(def), clearcoat: 1, clearcoatRoughness: 0.08, roughness: 0.42, metalness: 0.12, envMapIntensity: 1.25, transparent: true });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0a1018, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.7, transparent: true });
  const trim = new THREE.MeshStandardMaterial({ color: def.trim, roughness: 0.4, metalness: 0.45, transparent: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.9, metalness: 0, transparent: true });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.92, metalness: 0, transparent: true });
  const rimMat = new THREE.MeshStandardMaterial({ color: def.rim ?? 0xd9dde3, roughness: 0.24, metalness: 1, transparent: true });
  const head = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xfff3d8), emissiveIntensity: 1.0, roughness: 0.15, metalness: 0.2, transparent: true });
  const tail = new THREE.MeshStandardMaterial({ color: 0x3a0505, emissive: new THREE.Color(0xff1c10), emissiveIntensity: 0.7, roughness: 0.25, transparent: true });

  // 车身 + 座舱壳 + 玻璃
  const body = new THREE.Mesh(mergeGeometries([bodyGeometry(sh), capGeometry(sh, 0, true), capGeometry(sh, 1, false)].map(flat)), paint);
  body.name = 'body'; body.castShadow = true; body.receiveShadow = true;
  group.add(body);
  const cab = new THREE.Mesh(cabinGeometry(sh), paint);
  cab.castShadow = true; cab.name = 'cabin';
  group.add(cab);
  const [c0, c1] = sh.cabin, cd = c1 - c0;
  const win = new THREE.Mesh(mergeGeometries([                                                  // 挡风玻璃、后窗、左右侧窗
    windowGeometry(sh, c0 + 0.03 * cd, c0 + 0.34 * cd, 0.66, Math.PI - 0.66),
    windowGeometry(sh, c1 - 0.30 * cd, c1 - 0.05 * cd, 0.78, Math.PI - 0.78),
    windowGeometry(sh, c0 + 0.28 * cd, c1 - 0.26 * cd, 0.07, 0.5),
    windowGeometry(sh, c0 + 0.28 * cd, c1 - 0.26 * cd, Math.PI - 0.5, Math.PI - 0.07),
  ].map(flat)), glass);
  win.name = 'windows'; group.add(win);
  const tub = new THREE.Mesh(new THREE.BoxGeometry(L - 0.6, 0.32, 2 * (sh.hw[1] - 0.2)), dark);    // 车壳里面的黑内腔：从轮拱看进去不是透的
  tub.position.y = 0.38; group.add(tub);

  // 车灯、排气口、风刀、尾翼、后视镜、前唇
  const noseX = HALF - 0.06, tailX = -HALF + 0.06, hwN = pl(sh.hw, 0.03), hwT = pl(sh.hw, 0.98), lights = [], trims = [], tails = [];
  for (const q of [-1, 1]) {
    lights.push(new THREE.SphereGeometry(0.15, 12, 8).scale(0.45, 0.8, 1.9).translate(noseX - 0.04, pl(sh.belt, 0.03) - 0.13, q * hwN * 0.6));
    tails.push(new THREE.BoxGeometry(0.07, 0.11, 0.46).translate(tailX + 0.02, pl(sh.belt, 0.98) - 0.17, q * hwT * 0.52));
    trims.push(new THREE.CylinderGeometry(0.085, 0.1, 0.3, 10).rotateZ(Math.PI / 2).translate(tailX + 0.05, 0.33, q * 0.34));
    trims.push(new THREE.BoxGeometry(0.1, 0.1, 0.26).translate(0.5, pl(sh.belt, 0.36) + 0.12, q * (pl(sh.hw, 0.36) + 0.1)));
    trims.push(new THREE.BoxGeometry(0.5, 0.05, 0.08).translate(HALF - 1.0, pl(sh.belt, 0.22) + 0.03, q * 0.36));
  }
  trims.push(new THREE.BoxGeometry(0.5, 0.06, 2 * hwN * 0.98).translate(HALF - 0.3, 0.19, 0));
  if (sh.wing > 0) {
    const wy = pl(sh.belt, 0.9) + 0.16 + 0.2 * sh.wing, wz = hwT * (0.62 + 0.3 * sh.wing);
    for (const q of [-1, 1]) trims.push(new THREE.BoxGeometry(0.26, 0.26 + 0.2 * sh.wing, 0.06).translate(tailX + 0.32, pl(sh.belt, 0.9) + (0.13 + 0.1 * sh.wing), q * wz * 0.8));
    trims.push(new THREE.BoxGeometry(0.5, 0.05, 2 * wz).translate(tailX + 0.3, wy, 0));
    for (const q of [-1, 1]) trims.push(new THREE.BoxGeometry(0.12, 0.2, 0.05).translate(tailX + 0.3, wy - 0.1, q * wz));
  }
  const trimMesh = new THREE.Mesh(mergeGeometries(trims.map(flat)), trim);
  trimMesh.castShadow = true; group.add(trimMesh);
  const headMesh = new THREE.Mesh(mergeGeometries(lights.map(flat)), head);
  const tailMesh = new THREE.Mesh(mergeGeometries(tails.map(flat)), tail);
  group.add(headMesh, tailMesh);

  // 车轮
  const WG = wheelGeos(), wheels = [];
  for (const [x, front] of [[AXLE_F, true], [AXLE_R, false]]) for (const q of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, WHEEL_R, q * (pl(sh.hw, x > 0 ? 0.2 : 0.8) + sh.wide * 0.5 - 0.14));
    const tire = new THREE.Mesh(WG.tire, tireMat), rim = new THREE.Mesh(WG.rim, rimMat), back = new THREE.Mesh(WG.rimBack, dark);
    tire.castShadow = true; pivot.add(tire, rim, back); group.add(pivot);
    wheels.push({ pivot, x, z: pivot.position.z, front, spin: 0 });
  }

  // 喷口火焰：氮气是蓝的，小喷是橙的（各两根，左右排气口）
  const mkFlame = (core, edge) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uT: { value: 0 }, uPower: { value: 0 }, uCore: { value: new THREE.Color(...core) }, uEdge: { value: new THREE.Color(...edge) }, tNoise: { value: noiseTex } },
      vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG,
    });
    const g = new THREE.ConeGeometry(0.17, 1.5, 12, 5, true).rotateZ(Math.PI / 2).translate(-1.5 / 2, 0, 0);     // 尖朝后，喷口在原点
    const m = new THREE.Mesh(g, mat);
    m.position.set(tailX - 0.1, 0.33, 0.34); m.visible = false; m.frustumCulled = false; m.renderOrder = 6;
    group.add(m);
    const m2 = m.clone(); m2.position.z = -0.34; group.add(m2);
    return [m, m2];
  };
  const flames = { nitro: mkFlame([0.55, 0.85, 1.0], [0.15, 0.35, 1.0]), mini: mkFlame([1.0, 0.9, 0.6], [1.0, 0.35, 0.05]) };

  return { group, body, wheels, flames, tail, head, def, fadeMats: [paint, glass, trim, dark, tireMat, rimMat, head, tail], fade: 1 };
}

/**
 * 按物理状态摆好一辆车：位置、朝向、车身的侧倾和俯仰、车轮转向和滚动、尾灯亮度、喷口火焰
 * @param {number} dt 这一帧的时长（车轮滚动用）
 * @param {number} acc 纵向加速度（平滑过的）：加速抬头、刹车点头
 * @param {number} fade 整车的不透明度（1 = 实心）。紧跟在玩家车尾、正好挡在镜头和玩家车之间的对手车会调淡
 */
export function poseCar(cm, S, dt, time, acc = 0, braking = false, fade = 1) {
  const g = cm.group;
  g.position.set(S.x, 0.06, S.z);
  g.rotation.set(0, -S.psi, 0);
  g.rotateZ(Math.max(-0.035, Math.min(0.04, acc * 0.0034)));                                 // 俯仰
  g.rotateX(Math.max(-0.075, Math.min(0.075, -S.w * Math.max(0, S.vF) * 0.0024)));           // 侧倾：转弯时车身往外倾
  for (const w of cm.wheels) {
    w.spin += (S.vF / WHEEL_R) * dt;
    w.pivot.rotation.set(0, w.front ? -S.steer * 0.42 : 0, -w.spin);
  }
  const gl = cm.glow ?? 1, brake = (braking ? 5.0 : 1.0) * gl;                 // night: lights stay bright but do not blow out
  cm.head.emissiveIntensity = gl;
  cm.tail.emissiveIntensity += (brake - cm.tail.emissiveIntensity) * Math.min(1, dt * 16);
  for (const [list, power] of [[cm.flames.nitro, S.nitroT > 0 ? 1 : 0], [cm.flames.mini, S.miniT > 0 ? 1 : 0]]) {
    for (const m of list) {
      m.visible = power > 0 && fade > 0.5;
      if (m.visible) { m.material.uniforms.uPower.value = power; m.material.uniforms.uT.value = time; m.scale.set(0.85 + 0.3 * Math.abs(Math.sin(time * 41 + m.position.z)), 1, 1); }
    }
  }
  if (cm.fade !== fade) { cm.fade = fade; for (const m of cm.fadeMats) m.opacity = fade; }  // 整车的透明度（镜头跟前的对手车让位时用）
}
