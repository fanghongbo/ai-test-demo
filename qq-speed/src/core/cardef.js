// 赛车数据：性能参数和外观参数。数值取 QQ飞车里这几辆车的风格（A 级车比 B 级快、喷得更猛）。
// vmax / nitroPlus / miniPlus 单位 km/h；accel 单位 m/s²；yaw 最大横摆角速度 rad/s；aLat 抓地行驶时的最大横向加速度 m/s²。

export const CARS = Object.freeze([
  {
    id: 'novice', name: '新手赛车', cls: 'D', shape: 'box', color: 0xe4e8ec, accent: 0x2a6fd6, trim: 0x8f98a3,
    desc: '车管所发的练习车。什么都平平，但什么都不难开。', tags: ['好上手', '均衡'],
    vmax: 174, accel: 8.4, yaw: 2.35, aLat: 26, tauDrift: 0.70, nitroPlus: 60, nitroTime: 2.3, miniPlus: 26, miniTime: 0.46, gas: 0.92,
  },
  {
    id: 'leidian', name: '雷电', cls: 'B', shape: 'round', color: 0xf6c51a, accent: 0x17191d, trim: 0xf3f4f5,
    desc: '经典 B 级车。车头圆润、转向听话，漂移集气很快，是练双喷的好车。', tags: ['集气快', '转向灵'],
    vmax: 196, accel: 9.8, yaw: 2.55, aLat: 28, tauDrift: 0.76, nitroPlus: 70, nitroTime: 2.6, miniPlus: 32, miniTime: 0.50, gas: 1.12,
  },
  {
    id: 'leinuo', name: '雷诺', cls: 'A', shape: 'muscle', color: 0xe9ecef, accent: 0xd8322a, trim: 0x2b2f36,
    desc: '宽大的美式肌肉跑车。直线加速最凶，车身重、漂移稳，一上直道就不想松油门。', tags: ['直线强', '车身稳'],
    vmax: 204, accel: 10.6, yaw: 2.45, aLat: 28, tauDrift: 0.80, nitroPlus: 76, nitroTime: 2.9, miniPlus: 34, miniTime: 0.52, gas: 1.0,
  },
  {
    id: 'zhengjian', name: '针尖', cls: 'A', shape: 'wedge', color: 0x1f6fe5, accent: 0xf4f6f8, trim: 0x0f3d8f,
    desc: '楔形车头像一根针。转向最利落、漂移角最大，弯道多的图上没人追得上。', tags: ['弯道王', '甩尾远'],
    vmax: 208, accel: 10.2, yaw: 2.7, aLat: 29, tauDrift: 0.72, nitroPlus: 78, nitroTime: 2.8, miniPlus: 36, miniTime: 0.54, gas: 1.16,
  },
  {
    id: 'liuhuo', name: '流火', cls: 'A', shape: 'wing', color: 0xe23a1e, accent: 0xffb01e, trim: 0x1c1d21,
    desc: '大尾翼、长车尾。氮气动力最猛、持续时间最长，WCW 接得好能一路喷到下个弯。', tags: ['氮气猛', '尾翼'],
    vmax: 206, accel: 10.9, yaw: 2.5, aLat: 28.5, tauDrift: 0.78, nitroPlus: 75, nitroTime: 3.1, miniPlus: 33, miniTime: 0.52, gas: 1.0,
  },
]);

// 漂移时横向还有多少抓地（越大漂移越稳、越不容易甩过头）；雷达图数据也预先算好
for (const [k, c] of CARS.entries()) {
  c.no = k;                                                                            // 车身两侧的号码
  c.driftGrip = 0.94 + (c.tauDrift - 0.70) * 0.4;
  c.radar = carRadar(c);
}

export const carById = (id) => CARS.find((c) => c.id === id) || CARS[1];

/** 雷达图用：五项能力 0..1 */
export function carRadar(c) {
  return [
    (c.vmax - 170) / 40,                                                           // 速度
    (c.accel - 8) / 3,                                                             // 加速
    (c.yaw - 2.3) / 0.42,                                                          // 转向
    (c.tauDrift - 0.68) / 0.14,                                                    // 漂移
    (c.gas - 0.9) / 0.28,                                                          // 集气
  ];
}

/** AI 车手的名字 */
export const RIVALS = Object.freeze(['风之子', '小橘子', 'night', '阿光', '零式', '茄子', 'Kvinci', '枫叶']);
