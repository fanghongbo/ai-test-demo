// 单元测试共用的东西：不碰浏览器的“假材质”、检查几何里有没有坏数
import * as THREE from 'three';

export const MAT_NAMES = ['stone', 'paving', 'marble', 'bronze', 'patina', 'gold', 'tile', 'wood', 'woodD', 'clay', 'dark', 'iron', 'cloth', 'glass', 'rose', 'glow'];
export const TILE = { stone: 6, paving: 4.8, marble: 4, bronze: 3, patina: 3, gold: 3, tile: 2, wood: 2 };

/** 建筑用的“假材质”：每个名字一个独立的对象（合批器按对象的身份分组），贴图的尺寸和正式页面一样 */
export function fakeArchMaterials() {
  const M = Object.fromEntries(MAT_NAMES.map((n) => [n, { name: 'M.' + n }]));
  return { M, tile: { ...TILE } };
}

/** 几何里所有数都是有限的；法线是单位向量。返回顶点数 */
export function assertCleanGeometry(g, what) {
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name];
    for (let i = 0; i < a.array.length; i++) if (!Number.isFinite(a.array[i])) throw new Error(`${what}：${name} 的第 ${i} 个数不是有限的（${a.array[i]}）`);
  }
  if (g.index) for (let i = 0; i < g.index.array.length; i++) if (!(g.index.array[i] >= 0 && g.index.array[i] < g.attributes.position.count)) throw new Error(`${what}：索引越界`);
  const n = g.attributes.normal;
  if (n) for (let i = 0; i < n.count; i++) {
    const l = Math.hypot(n.getX(i), n.getY(i), n.getZ(i));
    if (Math.abs(l - 1) > 1e-3) throw new Error(`${what}：第 ${i} 个法线的长度是 ${l}`);
  }
  return g.attributes.position.count;
}

/** 一个网格（或一组网格）的每个实例矩阵、每个位置都是有限的 */
export function assertCleanMeshes(root, what) {
  let tris = 0;
  root.traverse((o) => {
    if (!(o.isMesh || o.isPoints)) return;
    assertCleanGeometry(o.geometry, `${what}/${o.name}`);
    const p = o.geometry.attributes.position;
    tris += (o.geometry.index ? o.geometry.index.count : p.count) / 3 * (o.isInstancedMesh ? o.count : 1);
    if (o.isInstancedMesh) {
      const m = o.instanceMatrix.array;
      for (let i = 0; i < m.length; i++) if (!Number.isFinite(m[i])) throw new Error(`${what}/${o.name}：实例矩阵里有坏数`);
      for (let i = 0; i < o.count; i++) if (Math.abs(m[i * 16 + 15] - 1) > 1e-5 || Math.hypot(m[i * 16], m[i * 16 + 1], m[i * 16 + 2]) > 40) throw new Error(`${what}/${o.name}：第 ${i} 个实例的缩放不对`);
    }
    if (o.isPoints) { const a = o.geometry.attributes.position.array; for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) throw new Error(`${what}/${o.name}：粒子位置有坏数`); }
  });
  return tris;
}

/** 矩阵里的数都是有限的 */
export function assertFiniteMatrix(m, what) {
  for (const v of m.elements) if (!Number.isFinite(v)) throw new Error(`${what}：矩阵里有坏数`);
}

export { THREE };
