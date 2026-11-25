// 材质分类（纯数据）：由“赛璐璐固有色 + 参数”推断物理材质。这样道具工厂的调用处一行都不用改。
// rough 粗糙度，metal 金属度，clearcoat 清漆层，sheen 绒毛（羽毛 / 织物），emissive 夜灯的 HDR 自发光强度，tint 固有色乘子（线性），
// flag 给合批着色器用的标记：1 = 树冠（轮廓侵蚀 + 噪声法线），2 = 叶片（背光透光），3 = 羽毛（绒毛）。
export const FLAG_CANOPY = 1, FLAG_LEAF = 2, FLAG_FEATHER = 3, FLAG_WHITE = 4;   // 4 = 近白色的漆面 / 塑料：压暗

export const PBR_CLASS = Object.freeze({
  matte:   { rough: 0.86, metal: 0 },
  satin:   { rough: 0.46, metal: 0, clearcoat: 0.25 },
  glossy:  { rough: 0.22, metal: 0, clearcoat: 0.8 },
  paint:   { rough: 0.42, metal: 0, clearcoat: 0.35 },
  carpaint:{ rough: 0.26, metal: 0.25, clearcoat: 1 },
  metal:   { rough: 0.46, metal: 0.92 },
  chrome:  { rough: 0.13, metal: 1 },
  brass:   { rough: 0.26, metal: 1 },
  glass:   { rough: 0.08, metal: 0, clearcoat: 1, emissive: 6 },
  lens:    { rough: 0.08, metal: 0, clearcoat: 1, emissive: 16 },
  bulb:    { rough: 0.3, metal: 0, emissive: 45 },
  wood:    { rough: 0.72, metal: 0 },
  bark:    { rough: 0.92, metal: 0 },
  leaf:    { rough: 0.5, metal: 0, flag: FLAG_LEAF },
  canopy:  { rough: 0.78, metal: 0, flag: FLAG_CANOPY },
  fabric:  { rough: 0.95, metal: 0, sheen: 0.6 },
  feather: { rough: 0.74, metal: 0, sheen: 0.35, flag: FLAG_FEATHER, normal: 'feather', tint: [0.76, 0.74, 0.7] },
  far:     { rough: 0.95, metal: 0, tint: [0.16, 0.18, 0.2] },          // 远岛：只剩大气透视给它上色
  beak:    { rough: 0.3, metal: 0, clearcoat: 0.7 },
  pouch:   { rough: 0.46, metal: 0, tint: [1, 0.8, 0.5] },            // 喉囊：橙黄（赛璐璐的浅桃色在写实里发灰）
  eye:     { rough: 0.16, metal: 0, clearcoat: 1 },
  skin:    { rough: 0.5, metal: 0 },
  wet:     { rough: 0.1, metal: 0, clearcoat: 1 },
  rubber:  { rough: 0.9, metal: 0, tint: [0.82, 0.8, 0.76] },
  leather: { rough: 0.5, metal: 0 },
  stone:   { rough: 0.84, metal: 0 },
  sand:    { rough: 0.95, metal: 0 },
});

const COLORS = {
  chrome: [0xe2e6ea, 0xc9ced6], brass: [0xe9b94a], metal: [0x3d4a55, 0x3b3d4a], carpaint: [0x74cfb8],
  wood: [0xb98455, 0xc99a66, 0x8c5f3a, 0xc08a55, 0xe6cf9e, 0xc99a5e, 0xa9773f], bark: [0xc2966b, 0xa97c52],
  leaf: [0x5cbb78, 0x46a565], canopy: [0x6fbf6d, 0x58a85c, 0x74c46e],
  glass: [0xfff0c0, 0xfff1c4, 0xfff6d8], lens: [0xfff4c4], bulb: [0xfffbe8],
  fabric: [0x5cc3ae], feather: [0xf7f2e6, 0x8c93a3, 0x3b3a4f], beak: [0xf28c2c, 0xd9502e],
  pouch: [0xf9cf86],
  eye: [0xfffdf5, 0x272130, 0x1d1a24], skin: [0xf6c56b, 0xf08a3c], wet: [0x9fc9ea, 0x5589c0],
  rubber: [0xefe3c6, 0x4d4956], leather: [0xb9703c], stone: [0xd8d2c4, 0xe9e2d2], sand: [0xefd9a7],
  matte: [0x7a5536, 0x7a2630, 0xffffff, 0xd9c08e],
  far: [0x6f93a0],
};
const BY_COLOR = new Map();
for (const [name, list] of Object.entries(COLORS)) for (const h of list) BY_COLOR.set(h, name);

/**
 * @param {number|THREE.Color} color 赛璐璐固有色
 * @param {object} [o] toonMaterial / ToonBatch.add 的参数（pbr 显式指定 > 颜色表 > 按高光强度推断）
 * @returns {object} 分类（name + 参数），o.pbr === 'hide' 时返回 null
 */
export function classFor(color, o = {}) {
  if (o.pbr === 'hide') return null;
  const hex = typeof color === 'number' ? color : color && color.isColor ? color.getHex() : 0xffffff;
  const spec = o.spec ?? 0;
  const name = (typeof o.pbr === 'string' && o.pbr) || BY_COLOR.get(hex) || (spec >= 0.6 ? 'glossy' : spec >= 0.2 ? 'satin' : 'matte');
  const cls = PBR_CLASS[name];
  if (!cls) throw new Error('未知的材质分类 ' + name);
  // 没进颜色表的近白色（奶油白、纸白）：漆面与塑料的反照率压到 0.74 倍，日光下才不会一片死白
  const unnamed = !o.pbr && !BY_COLOR.has(hex);
  const lum = linear(hex >> 16 & 255) * 0.2126 + linear(hex >> 8 & 255) * 0.7152 + linear(hex & 255) * 0.0722;
  const white = unnamed && lum > 0.5;
  return { name, rough: o.rough ?? cls.rough, metal: o.metal ?? cls.metal, clearcoat: cls.clearcoat ?? 0, sheen: cls.sheen ?? 0,
    emissive: o.emissiveBoost ?? cls.emissive ?? 0, flag: white ? FLAG_WHITE : cls.flag ?? 0, normal: cls.normal ?? null,
    tint: white ? WHITE_TINT : cls.tint ?? [1, 1, 1] };
}
const WHITE_TINT = [0.74, 0.74, 0.73];
function linear(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
