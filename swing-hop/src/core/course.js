// 一局的路：云海上一排浮空小岛，每个岛上一棵树，树枝伸到岛沿外面挂着一个秋千。
// 按需要一个一个往后生成（带种子），玩到哪儿生成到哪儿；越往后间隔越宽、秋千晃得越厉害、花样越多。
import { rng } from './rng.js';
import { clamp } from './physics.js';

export const PLAY_Z = 0;        // 兔子起跳、落下的那个纵深平面
export const CLOUD_Y = -2.4;    // 云海的表面
export const G_REAL = 9.8;      // 秋千自己的摆动按真实的重力算，周期才像真的

const TUTORIAL_GAP = [4.6, 5.0, 5.2, 5.2];
export const ACCENTS = ['coral', 'sun', 'sky', 'lilac', 'mint'];

// 第 n 个秋千离前一个多远：先是固定的几段练手，之后慢慢变宽，中间夹着近的
export function gapFor(n, r) {
  const base = 4.3 + Math.min(n, 36) * 0.06;
  const spread = r() * (0.8 + 0.9 * Math.min(1, n / 12));
  return Math.min(8.0, base + spread);
}

// 空秋千被风吹得摆多开（弧度）。前五个不晃，先练准头；之后逐渐加到 23° 左右，也有四分之一是不晃的
export function ampFor(n, r) {
  const max = 0.4 * clamp((n - 5) / 26, 0, 1);
  if (max <= 0 || r() < 0.25) return 0;
  return max * r.range(0.55, 1);
}

// 秋千的样子：普通的、金色的（落上去加分）、宽板凳（好踩）、裂了缝的旧秋千（落上去撑不久）
export function kindFor(n, r, prev) {
  if (n < 5) return 'plain';
  const roll = r();
  if (prev !== 'gold' && roll < 0.10) return 'gold';
  if (roll < 0.20) return 'wide';
  if (n >= 14 && roll < 0.30) return 'cracked';
  return 'plain';
}

function makeNode(i, prev, r) {
  const first = !prev;
  // gap 是这个秋千到下一个秋千的距离（座板中心之间），提前一步就定下来：next 的座板 = 自己的座板 + 自己的 gap
  const gap = first ? TUTORIAL_GAP[0] : i < TUTORIAL_GAP.length ? TUTORIAL_GAP[i] : gapFor(i + 1, r);
  const tipX = first ? 0 : prev.swing.tipX + prev.gap;
  const dyMax = i < 6 ? 0 : 0.55 * clamp((i - 6) / 8, 0, 1);
  // 岛面高度一步一步随机变，但整体往 0 回：不然走远了会一路漂到云海底下
  const y = first ? 0 : clamp(prev.y + r.range(-dyMax, dyMax) - prev.y * 0.1, -2.0, 2.0);

  const bl = first ? 2.7 : r.range(2.2, 2.8);   // 树枝从树干伸出去多长：树干在枝尖的后面（右面）这么多
  const x = tipX + bl;
  // 岛不能太宽：右沿（枝尖 + 0.9 + 2 rx）要停在下一个秋千前面至少 0.7 米，不然下一个秋千就吊在这座岛的上面了
  const rx = Math.min(r.range(1.9, 2.7), (gap - 1.6) / 2);
  const rz = rx * r.range(0.74, 0.88);
  const cz = PLAY_Z - 0.6 - rz;                 // 岛的前沿停在秋千平面后面 0.6 米：踩空了一定是掉进空里
  const cx = tipX + 0.9 + rx;                   // 让枝尖探出岛沿 0.9 米，秋千吊在岛的边上
  const trunkH = first ? 3.25 : r.range(3.0, 3.4);
  const lift = r.range(-0.08, 0.14);
  const L = first ? 1.95 : r.range(1.7, 2.1);
  const kind = kindFor(i, r, prev ? prev.swing.kind : 'plain');

  return {
    i, x, y, gap,
    islet: {
      cx, cz, rx, rz, depth: first ? 6 : r.range(3.2, 5.6), seed: r.int(1, 1e9),
      accent: r.pick(ACCENTS), blossom: !first && r() < 0.16,
    },
    tree: { h: trunkH, lean: r.range(-0.05, 0.05), seed: r.int(1, 1e9) },
    swing: {
      tipX, tipY: y + trunkH + lift, tipZ: PLAY_Z, L,
      halfW: kind === 'wide' ? 0.95 : 0.5, kind,
      amp: ampFor(i, r), omega: Math.sqrt(G_REAL / L), phase: r.range(0, Math.PI * 2),
    },
  };
}

export function makeCourse(seed) {
  const r = rng((seed ^ 0x9E3779B9) >>> 0);
  const nodes = [];
  const course = {
    seed,
    nodes,
    get length() { return nodes.length; },
    ensure(n) {
      while (nodes.length <= n) nodes.push(makeNode(nodes.length, nodes[nodes.length - 1], r));
      return nodes;
    },
    node(i) {
      return course.ensure(Math.max(0, i))[Math.max(0, i)];
    },
    // 从 from 往后找第一个会晃的秋千；没有就返回 -1
    firstSway(from) {
      for (let k = Math.max(0, from); k < Math.max(from + 12, 8); k++) if (course.node(k).swing.amp > 0) return k;
      return -1;
    },
  };
  course.ensure(12);
  return course;
}
