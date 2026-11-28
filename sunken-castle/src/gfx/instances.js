// 实例化网格：同一份几何 + 一串变换（位置、朝向、缩放、颜色）。礁石、珊瑚、海草、巨藻、鱼群都用它。
// 可以按地块分块：一块一个网格，视野外的整块不用画（阴影、遮蔽、倒影这几个通道也都跟着省）。
import * as THREE from 'three';

const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _c = new THREE.Color();

function make(geo, mat, items, o, name) {
  const mesh = new THREE.InstancedMesh(geo, mat, items.length);
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    _p.set(it.x, it.y, it.z);
    if (it.q) _q.copy(it.q); else _q.setFromEuler(_e.set(it.rx ?? 0, it.ry ?? it.yaw ?? 0, it.rz ?? 0));
    const s = it.s ?? 1;
    _s.set(it.sx ?? s, it.sy ?? s, it.sz ?? s);
    mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
    if (it.color) _c.setRGB(it.color[0], it.color[1], it.color[2]); else _c.setScalar(it.tint ?? 1);
    mesh.setColorAt(i, _c);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.castShadow = o.castShadow ?? true; mesh.receiveShadow = o.receiveShadow ?? true;
  if (name) mesh.name = name;
  return mesh;
}

/**
 * @param {THREE.BufferGeometry} geo
 * @param {THREE.Material} mat
 * @param {Array<{x,y,z, yaw?, rx?, ry?, rz?, s?, sx?, sy?, sz?, q?, tint?, color?}>} items  tint：灰度倍率；color：[r,g,b]（线性）
 * @param {{ chunk?: number, castShadow?: boolean, name?: string }} o  chunk：按多大的地块分块
 * @returns {THREE.InstancedMesh[]} 每块一个网格（没有实例就是空数组）
 */
export function instanced(geo, mat, items, o = {}) {
  if (!items || !items.length) return [];
  if (mat.vertexColors && !geo.attributes.color) geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));   // 材质要顶点色而几何没有：补一份白
  if (!o.chunk) return [make(geo, mat, items, o, o.name)];
  const size = o.chunk, buckets = new Map();
  for (const it of items) { const k = `${Math.floor(it.x / size)},${Math.floor(it.z / size)}`; if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(it); }
  return [...buckets.entries()].map(([k, list]) => make(geo, mat, list, o, o.name ? `${o.name}[${k}]` : undefined));
}

/** 把一串网格挂到一个组上 */
export function groupOf(list, name) {
  const g = new THREE.Group();
  g.name = name;
  for (const m of list) if (m) g.add(m);
  return g;
}
