// 造船用的小零件：瓦楞板、集装箱、木箱、铁箱、栏杆。都返回带顶点色的几何，交给 batch 合并或做实例。
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { colored, uvBox, shade } from '../gfx/batch.js';
import { L } from '../core/config.js';

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const _m = new THREE.Matrix4(), _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);

/** 把一个几何染上颜色、摆好位置，收进 list */
function put(list, g, color, t) {
  const geo = colored(g, color);
  if (t) geo.applyMatrix4(_m.compose(_p.set(t.x ?? 0, t.y ?? 0, t.z ?? 0), _q.setFromEuler(_e.set(t.rx ?? 0, t.ry ?? 0, t.rz ?? 0)), _s.set(t.sx ?? t.s ?? 1, t.sy ?? t.s ?? 1, t.sz ?? t.s ?? 1)));
  list.push(geo);
  return geo;
}
export function mergeParts(list) { const g = mergeGeometries(list, false); for (const p of list) p.dispose(); return g; }

const PROF = [[0, 1], [0.38, 1], [0.46, 0], [0.84, 0], [0.92, 1]];      // 一个周期的梯形波：[周期内位置, 外凸 0..1]

/**
 * 瓦楞板：宽 w（沿 X，居中）、高 h（沿 Y，从 0 起），波脊朝 +Z 外凸 depth。
 * o.base 顶点色乘数、valley 波谷压暗、grime 底部脏污（0 = 最脏）、texel UV 尺度、uvRect 贴花用的 UV 矩形（给贴花几何用）。
 */
export function corrugated(w, h, period, depth, o = {}) {
  const n = Math.max(1, Math.round(w / period)), p = w / n, x0 = -w / 2, prof = o.prof ?? PROF;
  const pts = [];
  for (let i = 0; i < n; i++) for (const [f, k] of prof) pts.push([x0 + (i + f) * p, k]);
  pts.push([w / 2, prof[prof.length - 1][1]]);
  const pos = [], nrm = [], uv = [], col = [], texel = o.texel ?? 2, base = o.base ?? [1, 1, 1], valley = o.valley ?? 0.8, r = o.uvRect, lift = o.lift ?? 0;
  const U = (x) => (r ? r[0] + ((x + w / 2) / w) * (r[2] - r[0]) : x / texel), V = (y) => (r ? r[1] + (y / h) * (r[3] - r[1]) : y / texel);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ak] = pts[i], [bx, bk] = pts[i + 1], az = ak * depth, bz = bk * depth;
    const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1, nx = -dz / len, nz = dx / len;
    const k = valley + (1 - valley) * 0.5 * (ak + bk);
    for (const [x, y, z] of [[ax, 0, az], [bx, 0, bz], [bx, h, bz], [ax, 0, az], [bx, h, bz], [ax, h, az]]) {
      const g = o.grime === undefined ? 1 : o.grime + (1 - o.grime) * sstep(0, 0.55, y);
      pos.push(x, y, z + lift); nrm.push(nx, 0, nz); uv.push(U(x), V(y));
      col.push(base[0] * k * g, base[1] * k * g, base[2] * k * g);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

/** 20 尺 / 10 尺集装箱：角件、立柱、上下侧梁、瓦楞侧板与端板、带锁杆的箱门、箱顶箱底。长轴沿 X，箱底在 y = 0。漆色由实例色给。 */
export function containerGeometry(len) {
  const H = L.contH, W = L.contW, hl = len / 2, hw = W / 2, g = [];
  const P = 0xffffff, F = 0x8c8c8c, C = 0x62605c, R = 0x5a5a5c;
  const ch = H - 0.62;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {                                    // 角件
    put(g, uvBox(0.178, 0.178, 0.178, 1), C, { x: sx * (hl - 0.089), y: 0.089, z: sz * (hw - 0.089) });
    put(g, uvBox(0.178, 0.178, 0.178, 1), C, { x: sx * (hl - 0.089), y: H - 0.089, z: sz * (hw - 0.089) });
    put(g, uvBox(0.16, H - 0.36, 0.14, 2), F, { x: sx * (hl - 0.08), y: H / 2, z: sz * (hw - 0.07) });   // 角柱
    put(g, uvBox(len - 0.36, 0.12, 0.14, 2), F, { y: H - 0.24, z: sz * (hw - 0.07) });                  // 上侧梁
    put(g, uvBox(len - 0.36, 0.16, 0.14, 2), F, { y: 0.26, z: sz * (hw - 0.07) });                      // 下侧梁
    put(g, uvBox(0.62, 0.10, 0.2, 1), 0x1a1a1a, { x: sx * hl * 0.5, y: 0.12, z: sz * (hw - 0.1) });     // 叉槽
    put(g, uvBox(0.14, 0.12, W - 0.36, 2), F, { x: sx * (hl - 0.07), y: H - 0.24 });                    // 上下端梁
    put(g, uvBox(0.14, 0.16, W - 0.36, 2), F, { x: sx * (hl - 0.07), y: 0.26 });
  }
  for (const sz of [-1, 1]) {                                                              // 两侧的瓦楞板
    const c = corrugated(len - 0.36, ch, 0.278, 0.036, { grime: 0.62 });
    put(g, c, P, { y: 0.34, z: sz * (hw - 0.036), ry: sz > 0 ? 0 : Math.PI });
  }
  put(g, corrugated(W - 0.28, ch, 0.278, 0.03, { grime: 0.62 }), P, { x: -(hl - 0.03), y: 0.34, ry: -Math.PI / 2 });   // 无门端
  const leaf = (W - 0.38) / 2;
  for (const sz of [-1, 1]) {                                                              // 箱门：门板 + 锁杆 + 把手 + 铰链
    put(g, uvBox(0.035, ch, leaf - 0.01, 2), P, { x: hl - 0.02, y: 0.34 + ch / 2, z: sz * (leaf / 2 + 0.01) });
    for (const k of [0.26, 0.78]) {
      put(g, new THREE.CylinderGeometry(0.016, 0.016, ch - 0.06, 8), R, { x: hl + 0.03, y: 0.34 + ch / 2, z: sz * k });
      put(g, uvBox(0.03, 0.085, 0.2, 1), R, { x: hl + 0.05, y: 1.12, z: sz * (k - 0.09 * sz) });
    }
    for (const y of [0.6, 1.33, 2.06]) put(g, uvBox(0.05, 0.12, 0.09, 1), R, { x: hl + 0.01, y, z: sz * (hw - 0.22) });
  }
  put(g, uvBox(0.12, 0.14, W - 0.36, 2), F, { x: hl - 0.06, y: H - 0.35 });                // 门楣、门槛
  put(g, uvBox(0.12, 0.10, W - 0.36, 2), F, { x: hl - 0.06, y: 0.39 });
  put(g, uvBox(len - 0.36, 0.035, W - 0.36, 2), 0xd2d2d2, { y: H - 0.018 });              // 箱顶
  for (const z of [-0.62, 0, 0.62]) put(g, uvBox(len - 0.5, 0.018, 0.06, 2), 0xb4b4b4, { y: H + 0.004, z });
  put(g, uvBox(len - 0.36, 0.03, W - 0.36, 2), 0x4a4a4a, { y: 0.015 });                   // 箱底
  const out = mergeParts(g);
  return shade(out, (x, y, z, o) => { const k = 0.72 + 0.28 * sstep(0, 0.3, y); o[0] *= k; o[1] *= k; o[2] *= k * 0.97; });
}

/** 木箱（胶合板 + 包角横档）或铁皮弹药箱。中心在 (0, h/2, 0)。 */
export function crateGeometry(w, d, h, kind = 'wood') {
  const g = [];
  if (kind === 'wood') {
    put(g, uvBox(w - 0.02, h - 0.02, d - 0.02, 1.2), 0x4a3a26, { y: h / 2 });            // 板缝里露出来的暗底
    const plank = 0.46, gap = 0.007, tone = (i) => new THREE.Color().setHSL(0.098, 0.30, 0.66 + ((i * 37) % 7) * 0.011);
    const rows = (span, make) => { const n = Math.max(1, Math.round(span / plank)), pw = (span - 0.03 - gap * (n - 1)) / n; for (let i = 0; i < n; i++) make(i, -span / 2 + 0.015 + pw / 2 + i * (pw + gap), pw); };
    rows(w, (i, x, pw) => { for (const sz of [-1, 1]) put(g, uvBox(pw, h - 0.03, 0.03, 1.2), tone(i + (sz > 0 ? 2 : 0)), { x, y: h / 2, z: sz * (d / 2 - 0.015) }); });   // 前后两面竖板
    rows(d, (i, z, pw) => { for (const sx of [-1, 1]) put(g, uvBox(0.03, h - 0.03, pw, 1.2), tone(i + (sx > 0 ? 5 : 3)), { x: sx * (w / 2 - 0.015), y: h / 2, z }); });   // 左右两面
    rows(d, (i, z, pw) => put(g, uvBox(w - 0.03, 0.03, pw, 1.2), tone(i + 1), { y: h - 0.015, z }));                                                             // 盖板
    const bt = Math.min(0.08, Math.min(w, d) * 0.1), bh = Math.min(0.065, h * 0.09), dark = 0xb99c6c;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(g, uvBox(bt, h, bt, 1.2), dark, { x: sx * (w / 2 - bt / 2), y: h / 2, z: sz * (d / 2 - bt / 2) });
    for (const y of [bh / 2, h - bh / 2]) put(g, uvBox(w + 0.012, bh, d + 0.012, 1.2), dark, { y });
    put(g, uvBox(w * 0.94, 0.014, 0.014, 1.2), 0x8a744e, { y: h + 0.003 });
    put(g, uvBox(0.014, 0.014, d * 0.94, 1.2), 0x8a744e, { y: h + 0.003 });
  } else {
    put(g, uvBox(w, h - 0.1, d, 2), 0x5d6639, { y: h / 2 - 0.02 });
    put(g, uvBox(w + 0.035, 0.07, d + 0.035, 2), 0x4d5530, { y: h - 0.035 });
    put(g, uvBox(w + 0.035, 0.05, d + 0.035, 2), 0x4d5530, { y: 0.025 });
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) put(g, uvBox(0.1, 0.15, 0.05, 1), 0xa2a39c, { x: sx * w * 0.27, y: h - 0.12, z: sz * (d / 2 + 0.015) });
  }
  return mergeParts(g);
}

/** 沿折线（底端坐标）立栏杆：立柱 + 若干道横杆。返回杆件列表供调用方交给 batch。 */
export function railing(B, mat, pts, height, color, o = {}) {
  const r = o.r ?? 0.024, spacing = o.spacing ?? 1.8, seg = o.seg ?? 6;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(1, Math.round(len / spacing));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      B.cyl(mat, r, r, height, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + height / 2, a[2] + (b[2] - a[2]) * t, color, { seg });
    }
    for (const hh of o.rails ?? [1, 0.56]) B.rod(mat, [a[0], a[1] + height * hh, a[2]], [b[0], b[1] + height * hh, b[2]], r * 0.92, color, seg);
  }
}

/** 一段带法兰的管路（折线） */
export function pipe(B, mat, pts, r, color, flange = 0) {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    B.rod(mat, a, b, r, color, 10);
    if (flange && i > 0) B.cyl(mat, r * 1.55, r * 1.55, 0.05, a[0], a[1], a[2], color, { rot: [0, 0, Math.abs(b[0] - a[0]) > Math.abs(b[2] - a[2]) ? Math.PI / 2 : 0, 0], seg: 12 });
  }
}
