// 镜头该看哪儿、看多宽（只算数字，不含三维）。原则：兔子和下一个秋千都在画面里，兔子偏左一些；狼追近了把狼也框进来。
import { CLOUD_Y } from './course.js';
import { smooth01 } from './physics.js';

const MIN_W = 10.5, MAX_W = 15.5, WOLF_MAX_W = 19.5;

export function frameOf(game) {
  const b = game.bun, c = game.course;
  if (game.mode === 'title') return { x: b.x + 1.9, y: b.y + 1.75, w: 12 };
  let left, right, y;
  if (b.state === 'air') {
    const nx = c.node(b.from + 1).swing.tipX;
    left = Math.min(b.launchX, nx) - 3.6;
    right = Math.max(b.launchX, nx) + 3.6;
    y = Math.max(b.y, b.launchY) + 1.9;
  } else {
    left = c.node(b.node).swing.tipX - 3.4;
    right = c.node(b.node + 1).swing.tipX + 3.6;
    y = Math.max(b.y, CLOUD_Y + 2.2) + 1.75;           // 往下掉的时候镜头跟到云面为止
  }
  if (right - left < MIN_W) {
    const add = (MIN_W - (right - left)) / 2;
    left -= add; right += add;
  } else if (right - left > MAX_W) {
    const cut = (right - left - MAX_W) / 2;
    left += cut; right -= cut;
  }
  // 狼追到 16 米以内，画面一点点变宽、往左让，把它也框进来（最宽 19.5 米）；再远就先只在提示条上显示距离
  if (game.wolf.active && b.state !== 'fall' && b.state !== 'caught') {
    const k = smooth01((16 - (b.x - game.wolf.x)) / 7);
    if (k > 0) left = right - (right - left + (WOLF_MAX_W - (right - left)) * k);
  }
  return { x: (left + right) / 2, y, w: right - left };
}
