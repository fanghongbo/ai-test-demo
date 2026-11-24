// 不开浏览器，直接在 Node 里构建整个世界与骑手，检查几何体里有没有 NaN / 非法数值。
// 用法：node tools/qa/world_node_check.mjs      退出码 1 表示发现问题。
// Canvas 贴图在这里用桩替代（只验证几何，不验证像素）。
import { createToonEnv } from '../../src/gfx/toon.js';
import { createWorld } from '../../src/world/world.js';
import { createRider } from '../../src/actors/rider.js';
import { makeTrack } from '../../src/core/track.js';

const noop = () => {};
const ctx2d = new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 10 }) : noop), set: () => true });
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d, style: {} }) };

const U = createToonEnv();
const t0 = performance.now();
const world = createWorld(U, { track: makeTrack() });
const rider = createRider(U);
const ms = performance.now() - t0;

let meshes = 0, bad = 0, tris = 0;
const samples = [];
for (const root of [world.group, rider.hero]) {
  root.traverse((o) => {
    if (!(o.isMesh || o.isLine)) return;
    meshes++;
    const g = o.geometry;
    if (g.index) tris += g.index.count / 3;
    for (const [name, attr] of Object.entries(g.attributes)) {
      const a = attr.array;
      let nan = 0;
      for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) nan++;
      if (nan) { bad++; if (samples.length < 8) samples.push(`${o.name || o.type}.${name}: ${nan} 个非法数值`); }
    }
  });
}
console.log(`世界 + 骑手：${meshes} 个网格，${Math.round(tris).toLocaleString()} 个三角形，构建 ${ms.toFixed(0)} ms；几何属性非法数值：${bad ? bad + ' 处' : '无'}`);
for (const s of samples) console.log('  ', s);
process.exit(bad ? 1 : 0);
