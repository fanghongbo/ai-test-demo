// 第一人称枪模：挂在镜头下，程序化动画（腰射 ↔ 瞄准、呼吸、走动晃动、鼠标摆动、后坐、换弹、拔枪、挥刀、投掷）。
import * as THREE from 'three';
import { createGun } from '../actors/guns.js';
import { WEAPONS } from '../core/config.js';
import { clamp } from '../core/mathx.js';

const lerp = (a, b, t) => a + (b - a) * t;
const IDS = ['ak47', 'm4a1', 'awm', 'deagle', 'usp', 'knife', 'he'];
const _w = new THREE.Vector3();

export function createViewmodel(stage, team) {
  const root = new THREE.Group();
  root.name = 'vm';
  stage.vm.root.add(root);
  const guns = {};
  for (const id of IDS) { const g = createGun(id, { team }); g.group.visible = false; root.add(g.group); guns[id] = g; }
  let cur = guns.ak47;
  const st = { t: 0, phase: 0, swayX: 0, swayY: 0, kickZ: 0, kickP: 0, kickR: 0, meleeT: 0, meleeDur: 0.34, meleeHeavy: false, meleeSide: 1, throwT: 0, reloadK: -1, boltK: -1, visible: true };

  const api = {
    root, guns, st,
    get id() { return cur.id; },
    /** 换队：袖子的布料不一样，整套重建 */
    setTeam(t) {
      if (api.team === t) return;
      api.team = t;
      for (const id of IDS) { root.remove(guns[id].group); guns[id].group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
      for (const id of IDS) { const g = createGun(id, { team: t }); g.group.visible = false; root.add(g.group); guns[id] = g; }
      cur = guns[cur.id];
      cur.group.visible = st.visible;
    },
    set(id) { if (cur) cur.group.visible = false; cur = guns[id]; cur.group.visible = st.visible; if (cur.mag) { cur.mag.visible = true; cur.mag.position.set(0, 0, 0); } if (cur.bolt) { cur.bolt.position.set(0, 0, 0); cur.bolt.rotation.set(0, 0, 0); } if (cur.leftArm) { cur.leftArm.position.set(0, 0, 0); cur.leftArm.rotation.set(0, 0, 0); } },
    setVisible(v) { st.visible = v; cur.group.visible = v; },
    /** 开火瞬间：枪往后顿、枪口上跳、随机侧滚 */
    fire() { const k = WEAPONS[cur.id].recoil?.kick ?? 0.2; st.kickZ = Math.min(0.1, st.kickZ + k * 0.085); st.kickP = Math.min(0.22, st.kickP + k * 0.17); st.kickR += (Math.random() - 0.5) * k * 0.07; },
    melee(heavy) { st.meleeT = st.meleeDur = heavy ? 0.62 : 0.36; st.meleeHeavy = heavy; st.meleeSide = -st.meleeSide; },
    throwGrenade() { st.throwT = 0.6; },
    /** 枪口在船的坐标系里的位置（给枪口焰、曳光、抛壳用） */
    /** 枪口在船的坐标系里的位置（给曳光、抛壳、照亮环境用） */
    muzzle(out) { stage.camera.updateWorldMatrix(true, false); stage.camera.localToWorld(cur.muzzle.getWorldPosition(out)); return stage.shipRoot.worldToLocal(out); },
    /** 枪口在镜头坐标系里的位置（玩家自己的枪口焰跟枪画在同一个场景里，视野一致才对得上） */
    muzzleLocal(out) { return cur.muzzle.getWorldPosition(out); },
    /**
     * @param p { ads, speed, onGround, phase, dYaw, dPitch, reload (0..1 或 -1), reloadEmpty, draw (0..1), bolt (0..1 或 -1), dt }
     */
    update(dt, p) {
      st.t += dt;
      const g = cur, info = g.info, ads = clamp(p.ads || 0, 0, 1), e = ads * ads * (3 - 2 * ads);
      const P = [0, 0, 0], R = [0, 0, 0];
      api.resetParts();                                               // 活动件先归位，下面按需再摆
      // 位置：腰射 ↔ 瞄准
      P[0] = lerp(info.hip[0], info.ads[0], e); P[1] = lerp(info.hip[1], info.ads[1], e); P[2] = lerp(info.hip[2], info.ads[2], e);
      const r0 = info.rot0 ?? [0, 0, 0], h = 1 - e;
      R[0] += (0.03 + r0[0]) * h; R[1] += (0.065 + r0[1]) * h; R[2] += r0[2] * h;
      // 待机呼吸
      const breathe = 1 - e * 0.75;
      P[0] += 0.0022 * Math.sin(st.t * 1.1) * breathe; P[1] += 0.0028 * Math.sin(st.t * 1.73) * breathe; R[2] += 0.005 * Math.sin(st.t * 0.9) * breathe;
      // 走动晃动：跟着步频画 8 字
      const sp = Math.min(1, (p.speed || 0) / 5.5) * (p.onGround ? 1 : 0.25) * (1 - e * 0.82);
      P[0] += 0.009 * Math.sin(p.phase) * sp; P[1] += 0.012 * Math.abs(Math.cos(p.phase)) * sp - 0.006 * sp; R[2] += 0.028 * Math.sin(p.phase) * sp; R[0] += 0.014 * Math.cos(p.phase * 2) * sp;
      // 鼠标摆动：枪落后于视角一点
      const k = 1 - Math.exp(-dt * 9);
      st.swayX += (clamp(-p.dYaw || 0, -0.06, 0.06) - st.swayX) * k;
      st.swayY += (clamp(p.dPitch || 0, -0.06, 0.06) - st.swayY) * k;
      const sk = 1 - e * 0.78;
      P[0] += st.swayX * 0.16 * sk; P[1] += st.swayY * 0.12 * sk; R[1] += st.swayX * 0.9 * sk; R[0] += st.swayY * 0.8 * sk; R[2] += st.swayX * 0.6 * sk;
      // 后坐
      P[2] += st.kickZ; R[0] += st.kickP; R[2] += st.kickR;
      const rec = Math.exp(-dt * 13);
      st.kickZ *= rec; st.kickP *= Math.exp(-dt * 16); st.kickR *= Math.exp(-dt * 11);
      // 换弹：枪向左一翻，弹匣跟着左手抽出来再插回去；空仓换弹最后拉一下枪机
      const rk = p.reload ?? -1;
      if (rk >= 0) {
        const tilt = rk < 0.1 ? rk / 0.1 : rk > 0.88 ? (1 - rk) / 0.12 : 1;
        P[1] -= 0.04 * tilt; P[0] -= 0.012 * tilt; P[2] += 0.03 * tilt; R[0] += 0.22 * tilt; R[2] -= 0.5 * tilt; R[1] += 0.16 * tilt;
        let magY = 0, show = true;
        if (rk < 0.16) magY = 0;
        else if (rk < 0.3) magY = -(rk - 0.16) / 0.14;
        else if (rk < 0.46) { magY = -1; show = rk < 0.34; }
        else if (rk < 0.66) magY = -1 + (rk - 0.46) / 0.2;
        if (g.mag) { g.mag.visible = show && g.id !== 'he'; g.mag.position.set(0, magY * (g.id === 'awm' ? 0.09 : 0.2), 0); }
        if (g.leftArm) { g.leftArm.position.set(-0.02 * Math.min(1, -magY), magY * 0.1, 0.03 * Math.min(1, -magY)); g.leftArm.rotation.set(-0.35 * Math.min(1, -magY), 0.25 * Math.min(1, -magY), 0); }
        if (p.reloadEmpty && g.bolt && rk > 0.7 && rk < 0.86) api.boltPose(g, Math.sin(((rk - 0.7) / 0.16) * Math.PI));
      }
      // 开火后的拉栓（AWM）
      const bk = p.bolt ?? -1;
      if (bk >= 0 && g.bolt) api.boltPose(g, Math.sin(bk * Math.PI));
      // 拔枪：从画面下方提上来
      const dr = clamp(p.draw || 0, 0, 1);
      P[1] -= 0.26 * dr; P[2] += 0.05 * dr; R[0] -= 0.9 * dr; R[1] += 0.35 * dr;
      // 挥刀
      if (st.meleeT > 0) {
        st.meleeT = Math.max(0, st.meleeT - dt);
        const k2 = 1 - st.meleeT / st.meleeDur, s = Math.sin(Math.min(1, k2 * 1.25) * Math.PI), sd = st.meleeSide, heavy = st.meleeHeavy ? 1.5 : 1;
        if (k2 < 0.25) { P[2] += 0.06 * (k2 / 0.25); R[1] -= 0.5 * sd * (k2 / 0.25) * heavy; }
        else { P[2] -= 0.2 * s * heavy; P[0] -= 0.13 * s * sd * heavy; P[1] += st.meleeHeavy ? 0.1 * s : 0.02 * s; R[1] += 1.3 * s * sd * heavy; R[0] += st.meleeHeavy ? -0.7 * s : 0.45 * s; R[2] += 0.5 * s * sd; }
      }
      // 投掷手雷
      if (st.throwT > 0) {
        st.throwT = Math.max(0, st.throwT - dt);
        const k3 = 1 - st.throwT / 0.6;
        if (k3 < 0.45) { const w = k3 / 0.45; P[1] += 0.1 * w; P[2] += 0.06 * w; R[0] -= 0.45 * w; }
        else { const w = (k3 - 0.45) / 0.55; P[1] += 0.1 - 0.22 * w; P[2] += 0.06 - 0.3 * w; R[0] += -0.45 + 0.9 * w; }
      }
      g.group.position.set(P[0], P[1], P[2]);
      g.group.rotation.set(R[0], R[1], R[2]);
    },
    /** 枪机 / 套筒 / 拉机柄被拉到后面（k = 0..1..0 的包络） */
    boltPose(g, k) {
      const b = g.bolt;
      if (!b) return;
      if (g.id === 'awm') { b.rotation.set(0, 0, -1.1 * k); b.position.set(0, 0, 0.045 * k); }
      else if (g.id === 'ak47') b.position.set(0, 0, 0.055 * k);
      else if (g.id === 'm4a1') b.position.set(0, 0, 0.075 * k);
      else b.position.set(0, 0, 0.032 * k);
    },
    /** 活动件（枪机、弹匣、左手）归位 */
    resetParts() {
      if (cur.bolt) { cur.bolt.position.set(0, 0, 0); cur.bolt.rotation.set(0, 0, 0); }
      if (cur.mag) { cur.mag.position.set(0, 0, 0); cur.mag.visible = true; }
      if (cur.leftArm) { cur.leftArm.position.set(0, 0, 0); cur.leftArm.rotation.set(0, 0, 0); }
    },
  };
  api.team = team;
  api.set('ak47');
  return api;
}
