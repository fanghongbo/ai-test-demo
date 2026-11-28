// 静态合批：把许多带变换、带顶点色的几何按材质合成少量网格（一条船几十个部件 → 每种材质一次绘制）。
// 颜色一律走顶点色：材质本身不带颜色，同一套“漆面”材质可以画黄的栏杆、灰绿的舱壁、各色集装箱。
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const _c = new THREE.Color(), _fm = new THREE.Matrix4(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
const KEEP = ['position', 'normal', 'uv', 'color'];
const CHECK = typeof location === 'undefined' || /[?&]check/.test(location.search);      // 启动时逐个检查几何里有没有 NaN（?check 打开；Node 测试里总是打开）

/** BoxGeometry 的六个面按世界尺寸缩放 UV：texel = 一张贴图覆盖几米 */
export function uvBox(w, h, d, texel = 1, ox = 0, oy = 0) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k;
    uv.setXY(i, uv.getX(i) * dims[f][0] / texel + ox, uv.getY(i) * dims[f][1] / texel + oy);
  }
  return g;
}
export function scaleUV(g, su, sv, ou = 0, ov = 0) {
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su + ou, uv.getY(i) * sv + ov);
  return g;
}
/** 平面（法线朝 +Z 的 XY 平面），UV 可指定矩形（贴花图集用） */
export function plane(w, h, uv = [0, 0, 1, 1], x = 0, y = 0) {
  const g = new THREE.PlaneGeometry(w, h);
  const a = g.attributes.uv;
  for (let i = 0; i < a.count; i++) {
    const u = a.getX(i), v = a.getY(i);
    a.setXY(i, uv[0] + (uv[2] - uv[0]) * u + x, uv[1] + (uv[3] - uv[1]) * v + y);
  }
  return g;
}

function matrixOf(t) {
  if (t && t.isMatrix4) return t;
  const o = t || {};
  _e.set(o.rx || 0, o.ry || 0, o.rz || 0);
  _q.setFromEuler(_e);
  _p.set(o.x || 0, o.y || 0, o.z || 0);
  _s.set(o.sx ?? o.s ?? 1, o.sy ?? o.s ?? 1, o.sz ?? o.s ?? 1);
  return _m.compose(_p, _q, _s);
}

/**
 * color 有三种写法：[r, g, b]（线性，可以大于 1）；十六进制的颜色（大于 16 的整数）；
 * 一个不大于 16 的数——灰度倍率（1 = 原色，0.7 = 原色的七成）。THREE.Color.set() 会把任何数字都当成十六进制，0.74 会变成黑色，所以这里自己分开
 */
function setColor(c, color) {
  if (Array.isArray(color)) c.setRGB(color[0], color[1], color[2]);
  else if (typeof color === 'number' && !(Number.isInteger(color) && color > 16)) c.setScalar(color);
  else c.set(color);
  return c;
}

/** 统一成“非索引 + position / normal / uv / color”，再乘上顶点色。传入的几何不会被改动。 */
function colored(g, color = 0xffffff) {
  const geo = g.index ? g.toNonIndexed() : g.clone();
  for (const name of Object.keys(geo.attributes)) if (!KEEP.includes(name)) geo.deleteAttribute(name);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  const n = geo.attributes.position.count, has = geo.attributes.color, col = new Float32Array(n * 3);
  setColor(_c, color);
  if (has && has.itemSize >= 3) for (let i = 0; i < n; i++) { col[i * 3] = has.getX(i) * _c.r; col[i * 3 + 1] = has.getY(i) * _c.g; col[i * 3 + 2] = has.getZ(i) * _c.b; }
  else for (let i = 0; i < n; i++) { col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

export function createBatcher() {
  const groups = new Map();
  const api = {
    /** 整批的局部坐标系（Matrix4 或 null）：给进来的每个变换先左乘它。沉船、村落这种整体带朝向的东西用 */
    frame: null,
    /** 放一个几何。t：Matrix4 或 { x, y, z, rx, ry, rz, s|sx|sy|sz } */
    add(mat, g, t, color) {
      if (!mat) throw new Error(`合批：材质未定义（${g.type}，${(t && t.x) ?? 0}, ${(t && t.y) ?? 0}, ${(t && t.z) ?? 0}）`);   // 不拦的话 three 会拿纯白的不受光材质来画
      const geo = colored(g, color).applyMatrix4(api.frame ? _fm.multiplyMatrices(api.frame, matrixOf(t)) : matrixOf(t));
      if (CHECK) for (const [name, arr] of [['position', geo.attributes.position.array], ['normal', geo.attributes.normal.array], ['uv', geo.attributes.uv.array], ['color', geo.attributes.color.array]]) { for (let i = 0; i < arr.length; i++) if (!Number.isFinite(arr[i]) || (name === 'normal' && i % 3 === 0 && Math.hypot(arr[i], arr[i + 1], arr[i + 2]) < 1e-6)) throw new Error(`合批：几何的 ${name} 里有无效的数（${g.type}，${JSON.stringify(t.isMatrix4 ? t.elements.map((v) => +v.toFixed(1)) : t)}，第 ${i} 个）`); }
      if (!groups.has(mat)) groups.set(mat, []);
      groups.get(mat).push(geo);
      return api;
    },
    /** 轴对齐盒子，中心在 (x, y, z)。o：rot [rx, ry, rz]、uv（一张贴图几米）、uvOff */
    box(mat, w, h, d, x, y, z, color, o = {}) {
      return api.add(mat, uvBox(w, h, d, o.uv ?? 2, o.uvOff?.[0] ?? 0, o.uvOff?.[1] ?? 0), { x, y, z, rx: o.rot?.[0] ?? 0, ry: o.rot?.[1] ?? 0, rz: o.rot?.[2] ?? 0 }, color);
    },
    /** 圆柱 / 圆台，中心在 (x, y, z)，轴沿 Y（rot 之后） */
    cyl(mat, rt, rb, h, x, y, z, color, o = {}) {
      return api.add(mat, new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 14, 1, !!o.open), { x, y, z, rx: o.rot?.[0] ?? 0, ry: o.rot?.[1] ?? 0, rz: o.rot?.[2] ?? 0 }, color);
    },
    /** 两点之间的管子 */
    rod(mat, a, b, r, color, radial = 8) {
      const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = new THREE.Vector3().subVectors(Bv, A), len = d.length();
      const g = new THREE.CylinderGeometry(r, r, len, radial, 1, false);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      return api.add(mat, g, new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)), color);
    },
    /** 实例化：同一种复杂几何放很多次（集装箱）。items：[{ t, color }] */
    instances(mat, g, items, o = {}) {
      if (!items.length) return null;
      const geo = colored(g);
      const mesh = new THREE.InstancedMesh(geo, mat, items.length);
      items.forEach((it, i) => { mesh.setMatrixAt(i, matrixOf(it.t)); mesh.setColorAt(i, setColor(_c, it.color ?? 0xffffff)); });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = o.castShadow ?? true; mesh.receiveShadow = o.receiveShadow ?? true;
      if (o.name) mesh.name = o.name;
      return mesh;
    },
    /** 合并成网格并挂到 parent 上。返回网格数组。 */
    build(parent, o = {}) {
      const out = [];
      for (const [mat, list] of groups) {
        if (!list.length) continue;
        const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
        mesh.castShadow = o.castShadow ?? true; mesh.receiveShadow = o.receiveShadow ?? true;
        if (o.name) mesh.name = o.name + '.' + out.length;
        mesh.matrixAutoUpdate = false;
        parent.add(mesh); out.push(mesh);
        for (const g of list) g.dispose();
      }
      groups.clear();
      return out;
    },
    count() { let n = 0; for (const l of groups.values()) n += l.length; return n; },
  };
  return api;
}
