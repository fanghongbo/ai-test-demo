// 整个游戏的颜色都在这里：天、云、岛、树、秋千、兔子、风暴狼、界面。画面和界面共用这一套，风格才统一。
export const PAL = {
  skyTop: '#3B93E6', skyMid: '#7CC2F3', skyHorizon: '#E4EEFB', haze: '#C9DEF3',
  cloudLit: '#FFFFFF', cloudMid: '#EDF2FB', cloudShade: '#C6D4EE', cloudDeep: '#97ACDB',

  grass: ['#7CC656', '#96DB6B', '#63B44E'], grassDark: '#4A9646', grassEdge: '#36793D',
  dirt: '#BB8659', dirtDark: '#8D5F3B',
  rock: ['#8D88B0', '#6F6A96', '#A29DC4'], rockDark: '#4E4A78',
  trunk: '#9B6A45', trunkDark: '#6D452A',
  leaf: ['#6FC75C', '#8BDA6C', '#58B056'], leafLight: '#BCEF92', leafDark: '#3E8B49',
  blossom: ['#F7BBD1', '#FBD6E3', '#F09DC0'],

  rope: '#EBD5A4', wood: '#D59C5C', woodDark: '#A9713A',
  gold: '#FFD052', goldDark: '#DFA22F', old: '#A08A6E',
  accent: { coral: '#FF7F6E', sun: '#FFC94D', sky: '#5FCCF5', lilac: '#B59BFF', mint: '#5EE0B0' },

  fur: '#FFF8EC', furShade: '#F2DDC4', blush: '#FFB5A7', scarf: '#FF6B5C', eye: '#2A2433', scarfDark: '#E2544A',
  wolf: '#4A4378', wolfLight: '#7A78B4', wolfDark: '#2A2550', wolfEye: '#FFDA3A', storm: '#2A2650', mouth: '#C93B5C', teeth: '#FFFDF4',
};

// 界面用的颜色（和场景同一套取色）
export const UI = {
  paper: '#FFF9EC', ink: '#2E3440', inkSoft: '#6C7686', coral: '#FF6B5C', coralDark: '#E2544A', sun: '#FFC94D',
  danger: '#E5533D', safe: '#58C08A', sky: '#5FCCF5', night: '#2A2650',
};
