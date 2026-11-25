// 总装：材质 → 碰撞体集合 → 货舱甲板 → 船体与舱外。每一步之间让出一次事件循环，加载条才刷得动。
import { StaticWorld } from '../core/collision.js';
import { createMaterials } from './materials.js';
import { containerGeometry } from './parts.js';
import { buildDeck } from './deck.js';
import { buildShip } from './ship.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

/**
 * @param {object} stage gfx/stage.js 的舞台（这里只用它的 shipRoot）
 * @param {object} T 贴图集合
 * @param {(step: string) => void} [onStep]
 */
export async function buildWorld(stage, T, onStep = () => {}) {
  const t0 = performance.now();
  const M = createMaterials(T);
  const world = new StaticWorld();
  const g20 = containerGeometry(6.06), g10 = containerGeometry(3.0);
  await tick(); onStep('deck');
  const deck = buildDeck(stage.shipRoot, M, world, { g20, g10 });
  await tick(); onStep('ship');
  const ship = buildShip(stage.shipRoot, M, { g20 });
  return { M, world, deck, ship, geos: { g20, g10 }, buildMs: Math.round(performance.now() - t0) };
}
