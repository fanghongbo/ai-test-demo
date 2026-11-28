// 海床高度场和世界布局：台地、潟湖、深渊、各处古迹的位置
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORLD, CASTLE,  SITES, VENTS, siteClear, inHall, insideCastle, height, normalAt, placeAt, regionAt } from '../src/core/seabed.js';

const dist = (x, z, c) => Math.hypot(x - c.x, z - c.z);
const M = WORLD.mount, A = WORLD.abyss;

test('高度场：处处是有限的负数，可以重复，细节层只加不改', () => {
  for (let i = 0; i < 4000; i++) {
    const x = ((i * 7919) % 2400) - 1200, z = ((i * 104729) % 2400) - 1200, h = height(x, z), h0 = height(x, z, 0);
    assert.ok(Number.isFinite(h) && h < 0.5 && h > A.floor - 60, `(${x}, ${z}) → ${h}`);
    assert.equal(h, height(x, z), '高度场应该可以重复');
    assert.ok(Number.isFinite(h0) && Math.abs(h - h0) < 4.5, `大形状 ${h0} 和细节 ${h} 差太多`);
  }
});

test('王城的台地：城里的地面是平的，比城外的海底高十几米，南面的石桥下面是潟湖', () => {
  for (const [lx, lz] of [[0, 30], [-20, 20], [30, 0], [20, -30], [-30, -25], [0, 0]]) {
    const h = height(CASTLE.x + lx, CASTLE.z + lz);
    assert.ok(h > M.top - 0.6 && h < M.top + CASTLE.floor + 1.3, `城里 (${lx}, ${lz}) 的高度 ${h}`);
  }
  for (const [x, z] of [[-160, -120], [150, -140], [-200, 60], [170, 150]]) assert.ok(height(x, z) < M.top - 5 && height(x, z) > WORLD.floor - 8, `城外 (${x}, ${z}) 是低下去的海底平原：${height(x, z)}`);
  const L = WORLD.lagoon, mid = [(CASTLE.bridge.z0 + CASTLE.bridge.z1) / 2];
  for (let z = 14; z <= 70; z += 7) assert.ok(height(0, z) < CASTLE.bridge.y - 4, `石桥下面 (${z}) 应该是水：${height(0, z)}`);   // 靠城门的那一跨搭在上台地的缓坡上
  assert.ok(height(0, CASTLE.bridge.z0 + 2) > CASTLE.bridge.y - 1.5, '石桥的桥头搭在台地的缓坡上');
  assert.ok(height(L.x, L.z) < L.y + 1 && height(L.x, L.z) > L.y - 3, '潟湖又平又深');
  assert.ok(CASTLE.bridge.span > 8 && CASTLE.bridge.z1 - CASTLE.bridge.z0 > 60, '石桥有好几个桥孔');
});

test('王座厅里不堆沙：厅里的海床在铺地下面；城墙上和庭院里照样有沙', () => {
  const H = CASTLE.hall;
  assert.ok(inHall(CASTLE.x, CASTLE.z + H.z0 + 5) && inHall(CASTLE.x + 3, CASTLE.z + H.z0) && !inHall(CASTLE.x, CASTLE.z + 30) && !inHall(CASTLE.x + 60, CASTLE.z) && !inHall(CASTLE.x, CASTLE.z - 70));
  for (let lx = -H.hx + 1; lx <= H.hx - 1; lx += 3) for (let lz = H.z0 - 6; lz <= H.z1 - 1; lz += 3) {
    const h = height(CASTLE.x + lx, CASTLE.z + lz);
    assert.ok(h <= M.top + CASTLE.floor - 0.05 + 1e-9, `厅里 (${lx}, ${lz}) 的海床冒出了铺地：${h}`);
  }
  let drift = 0;
  for (let i = 0; i < 400; i++) { const lx = (i * 37 % 100) - 50, lz = 10 + (i * 53 % 36); if (insideCastle(CASTLE.x + lx, CASTLE.z + lz) && height(CASTLE.x + lx, CASTLE.z + lz) > M.top + CASTLE.floor) drift++; }
  assert.ok(drift > 20, '庭院的铺地上应该盖着沙');
});

test('深渊：圆弧之外地面掉到三百多米深，崖壁在几十米里完成', () => {
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + 0.2, inside = height(A.x + Math.cos(a) * (A.r - A.rim - 30), A.z + Math.sin(a) * (A.r - A.rim - 30)), rim = height(A.x + Math.cos(a) * (A.r + A.wall + 50), A.z + Math.sin(a) * (A.r + A.wall + 50));
    assert.ok(rim < A.floor + 60 && rim > A.floor - 40, `崖外 ${rim}`);
    assert.ok(inside > rim + 150, `崖内 ${inside} 应该比崖外高得多`);
  }
  assert.equal(regionAt(M.x, M.z), 'castle');
  assert.equal(regionAt(A.x + A.r + 10, A.z), 'wall');
  assert.equal(regionAt(A.x + A.r + A.wall + 10, A.z), 'abyss');
});

test('留空地：石桥的轴线上和四处古迹里面不撒东西', () => {
  for (let z = CASTLE.bridge.z0; z < CASTLE.bridge.z1; z += 9) assert.equal(siteClear(0, z), false, `桥上 (${z})`);
  assert.equal(siteClear(8.5, 40), false);
  for (const s of Object.values(SITES)) { assert.equal(siteClear(s.x, s.z), false); assert.equal(siteClear(s.x + s.r - 2, s.z), false); assert.equal(siteClear(s.x, s.z, 5), false); }
  assert.equal(siteClear(SITES.wreck.x, SITES.wreck.z + SITES.wreck.r + 3), true);                       // 留空地外面 3 米就能放东西
  assert.equal(siteClear(SITES.wreck.x, SITES.wreck.z + SITES.wreck.r + 1, 5), false, '留了余量的话更宽');
  assert.ok(siteClear(100, 100) && siteClear(-200, -150));
});

test('几处古迹各占一块地（巨像挨着神庙是故意的），都在岛的这一侧、地面上有落点', () => {
  const all = Object.values(SITES), pair = (a, b) => (a === SITES.temple && b === SITES.statue) || (a === SITES.statue && b === SITES.temple);
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (!pair(all[i], all[j])) assert.ok(dist(all[i].x, all[i].z, all[j]) > all[j].r + 4, `${i} 的中心不能落在 ${j} 里`);   // 沉船和村落是挨着的，留空地可以搭一点边
  assert.ok(dist(SITES.wreck.x, SITES.wreck.z, SITES.village) < SITES.village.r + SITES.wreck.r, '村子就在沉船的旁边');
  assert.ok(dist(SITES.statue.x, SITES.statue.z, SITES.temple) < SITES.temple.r, '巨像站在神庙的旁边');
  for (const s of all) {
    assert.ok(dist(s.x, s.z, A) < A.r + 2, '古迹都在岛上');
    assert.ok(dist(s.x, s.z, M) > 70, '不在王城的台地上');
    const h = height(s.x, s.z);
    assert.ok(Number.isFinite(h) && h > -62 && h < -30, `${h}`);
  }
  for (const s of [SITES.wreck, SITES.village]) for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; assert.ok(Math.abs(height(s.x + Math.cos(a) * s.r * 0.7, s.z + Math.sin(a) * s.r * 0.7) - height(s.x, s.z)) < 6, '平原上的古迹地势平坦'); }
  assert.ok(height(SITES.statue.x, SITES.statue.z) > -60 && height(SITES.temple.x, SITES.temple.z) > -60, '神庙和巨像都站在崖沿的台地上');
  assert.ok(dist(SITES.statue.x, SITES.statue.z, A) > dist(SITES.temple.x, SITES.temple.z, A), '巨像比神庙更靠外');
  assert.ok(dist(SITES.statue.x, SITES.statue.z, A) > A.r - 12, '巨像就站在崖沿上');
  assert.ok(dist(SITES.wreck.x, SITES.wreck.z, A) < A.r - SITES.wreck.r - 60 && dist(SITES.village.x, SITES.village.z, A) < A.r - SITES.village.r - 60, '沉船和村落都在平原的里面');
});

test('冒泡口都在岛里，其中有一个在王城的庭院里', () => {
  assert.ok(VENTS.length >= 5);
  for (const [x, z] of VENTS) { assert.ok(height(x, z) > -60 && Math.hypot(x - A.x, z - A.z) < A.r - 40, `(${x}, ${z})`); }
  assert.ok(VENTS.some(([x, z]) => insideCastle(x, z) && !inHall(x, z)));
  assert.equal(new Set(VENTS.map((v) => v.join(','))).size, VENTS.length);
});

test('法线朝上、单位长；陡的地方法线更歪', () => {
  for (let i = 0; i < 200; i++) {
    const x = ((i * 331) % 700) - 350, z = ((i * 197) % 700) - 350, n = normalAt(x, z);
    nearEq(Math.hypot(...n), 1, 1e-9);
    assert.ok(n[1] > 0.05, `法线 ${n}`);
  }
  assert.ok(normalAt(A.x + A.r + 20, A.z)[1] < normalAt(0, 100)[1], '崖壁比潟湖平地陡');
});

test('地名：每个区都有名字，厅、桥、城门和古迹认得出', () => {
  const names = ['王座厅', '石桥', '王城 · 南门', '断崖 · 神庙', '深渊巨像', '圆屋村落', '沉船', '石拱', '王城 · 城内', '王城 · 城墙', '王城 · 台地', '珊瑚花园', '巨藻林', '潟湖', '北面的平原', '海底平原', '深渊断崖', '深渊'];
  const got = new Set();
  for (let x = -500; x <= 500; x += 7) for (let z = -500; z <= 500; z += 7) got.add(placeAt(x, height(x, z) + 2, z));
  for (let x = -60; x <= 60; x += 5) for (let z = -110; z <= 100; z += 5) got.add(placeAt(x, -30, z));
  for (const n of names) assert.ok(got.has(n), `没有地方叫“${n}”`);
  assert.equal(placeAt(CASTLE.x, -32, CASTLE.z - 20), '王座厅');
  assert.equal(placeAt(0, -33, 20), '石桥');
  assert.equal(placeAt(0, -33, -33), '王城 · 南门');
  assert.equal(placeAt(SITES.wreck.x, -50, SITES.wreck.z), '沉船');
  assert.equal(placeAt(A.x + A.r + A.wall + 60, -60, A.z), '深渊');
  assert.equal(placeAt(20, -60, 300), '海底平原');
  const regions = new Set();
  for (let x = -700; x <= 700; x += 13) for (let z = -700; z <= 700; z += 13) regions.add(regionAt(x, z));
  for (const r of ['castle', 'slope', 'causeway', 'garden', 'kelp', 'lagoon', 'wreck', 'north', 'plain', 'wall', 'abyss']) assert.ok(regions.has(r), `没有“${r}”这个区`);
});

function nearEq(a, b) { assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`); }
