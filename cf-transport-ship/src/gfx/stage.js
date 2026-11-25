// 渲染舞台：renderer / scene / camera / 主光与阴影 / 天空环境 / 雾 / 后期链 / 画质档 / 时刻应用。
// 色彩：场景画进 HDR 缓冲（线性），OutputPass 做 AgX 色调映射，最后一道 FinishShader 在显示色域里调色。
import * as THREE from 'three';
import { createSkyEnv, computeSkyLook, MOON_COLOR } from './skyenv.js';
import { createPostFX } from './postfx.js';
import { createSky } from '../world/sky.js';
import { createSea } from '../world/sea.js';
import { sampleHour, lampFactor, MOON } from '../core/palette.js';
import { sunVector } from '../core/skymodel.js';
import { L } from '../core/config.js';
import { luma } from '../core/skymodel.js';

const SHADOW_EXT = 46;                                   // 阴影盒半宽（米）：盒子中心吸附到船艏 / 船中 / 船尾三个站位之一，整条船都在阴影里
const STATIONS = [-45, 0, 45];
const MAPS = [1024, 2048, 4096], DPR = [1, 1.5, 2], VM_FOV = 54;        // 枪模镜头的竖直视野：比世界窄，枪不会被广角拉变形

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} T gfx/textures.js 的贴图集合
 */
export function createStage(canvas, T, o = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 0.78;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;                 // 每帧开头置一次 needsUpdate（倒影那一遍顺便把它画了）
  renderer.info.autoReset = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 75, 16 / 9, 0.05, 12000);
  const shipRoot = new THREE.Group();                    // 船上的一切都挂在这里：整条船一起轻轻摇摆
  shipRoot.name = 'ship';
  scene.add(shipRoot);
  const hide = [];                                       // 画倒影 / 法线深度时要藏起来的对象：海面自己、特效、第一人称枪模

  const env = createSkyEnv(renderer);
  const sky = createSky();
  sky.bind(env.texture, T.noise);
  scene.add(sky.dome);
  const sea = createSea({ y: L.seaY, waterN: T.waterN });
  sea.bind(env.texture, T.noise, renderer);
  scene.add(sea.mesh);
  hide.push(sea.mesh);

  // 第一人称枪模：单独一个场景、单独一遍画。灯光自成一套——太阳（被船挡住时熄掉）、天空环境贴图、两盏跟着镜头走的补光，
  // 再加夜里的舱灯和枪口焰的 point 光。所有位置都在镜头坐标系里（这个场景的镜头永远在原点）。
  const vm = {
    scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(VM_FOV, 16 / 9, 0.02, 8), root: new THREE.Group(),
    key: new THREE.DirectionalLight(0xffffff, 1), fill: new THREE.DirectionalLight(0xffffff, 0.3), rim: new THREE.DirectionalLight(0xffffff, 0.5),
    lamp: new THREE.PointLight(0xffd2a0, 0, 5, 2), flash: new THREE.PointLight(0xffb070, 0, 3, 2), hemi: new THREE.HemisphereLight(0xffffff, 0x8a7458, 0.3), sunVis: 1, sunLit: 1, day: 1,
  };
  vm.root.matrixAutoUpdate = false;
  vm.root.add(vm.key, vm.key.target, vm.fill, vm.fill.target, vm.rim, vm.rim.target, vm.lamp, vm.flash, vm.hemi);
  vm.flash.position.set(0.12, -0.05, -0.45);
  vm.fill.position.set(-0.6, 0.7, 0.5); vm.rim.position.set(0.4, 0.6, -1.0); vm.lamp.position.set(0.1, 0.25, -0.3);
  vm.scene.add(vm.root);

  // 主光：太阳，夜里换成月亮（谁更亮用谁投影）
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00018;
  key.shadow.normalBias = 0.035;
  const sc = key.shadow.camera;
  sc.left = sc.bottom = -SHADOW_EXT; sc.right = sc.top = SHADOW_EXT; sc.near = 10; sc.far = 320;
  sc.updateProjectionMatrix();
  scene.add(key); scene.add(key.target);

  scene.fog = new THREE.FogExp2(0x8fb3c9, 0.0008);

  const postfx = createPostFX(renderer, scene, camera, hide, vm);
  const real = {}, look = {}, moonDir = sunVector(MOON.az, MOON.el);
  const dayReal = {}, dayLook = {};
  sampleHour(15.5, dayReal); computeSkyLook(env.lut, dayReal, dayReal.sunAz, moonDir, dayLook);
  const dayIrr = Math.max(1e-4, luma(dayLook.irr));                 // 正午前后水平面上的天光辐照度，拿来给补光定标
  const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _f = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _tmp = new THREE.Vector3(), _q = new THREE.Quaternion();
  let qLevel = 2, dprCap = 2, mapSize = 4096;

  const stage = {
    renderer, scene, camera, shipRoot, hide, sky, sea, key, postfx, real, look, moonDir, vm,
    hour: o.hour ?? 15.5, lampLevel: 0, night: 0, roll: true, buildMs: env.buildMs,
    get quality() { return qLevel; },

    /** 应用时刻：太阳方向与颜色、环境贴图、天空、海、雾、曝光、人造光强度 */
    applyTime(hour = stage.hour) {
      stage.hour = hour;
      sampleHour(hour, real);
      computeSkyLook(env.lut, real, real.sunAz, moonDir, look);
      look.fogDensity = real.fog;
      const r = env.update(look.sunDir, real.turbidity, look.night);
      if (r.changed) { scene.environment = r.envMap; vm.scene.environment = r.envMap; }
      sky.setLook(look, moonDir, MOON_COLOR);
      sea.setLook(look, moonDir);
      const m = look.isMoon, col = m ? MOON_COLOR.map((c) => c * look.moonE) : look.sunT.map((c) => c * look.sunE);
      key.color.setRGB(col[0], col[1], col[2]);
      vm.key.color.setRGB(col[0], col[1], col[2]);
      stage.keyDir = m ? moonDir : look.sunDir;
      scene.fog.color.setRGB(look.fog[0], look.fog[1], look.fog[2]);
      scene.fog.density = real.fog;
      renderer.toneMappingExposure = real.exposure;
      stage.lampLevel = lampFactor(real.sunEl);
      stage.night = look.night;
      const f = look.fog, fm = Math.max(f[0], f[1], f[2], 1e-4);
      vm.fill.color.setRGB(0.66 + 0.34 * f[0] / fm, 0.66 + 0.34 * f[1] / fm, 0.66 + 0.34 * f[2] / fm);   // 偏白一点的天光色：纯天色会把枪和手套染蓝
      vm.day = Math.min(1, luma(look.irr) / dayIrr);
      return look;
    },

    /** 阴影盒跟着 focus 走。对齐到阴影贴图的格子上，镜头移动时阴影边缘不抖。 */
    follow(focus) {
      if (!stage.keyDir) return;
      _z.fromArray(stage.keyDir).normalize();
      _x.crossVectors(_up, _z).normalize();
      _y.crossVectors(_z, _x);
      const texel = (2 * SHADOW_EXT) / mapSize;
      _f.copy(focus);
      _f.x = STATIONS.reduce((best, c) => (Math.abs(c - focus.x) < Math.abs(best - focus.x) ? c : best), STATIONS[0]);
      const fx = Math.round(_f.dot(_x) / texel) * texel, fy = Math.round(_f.dot(_y) / texel) * texel, fz = _f.dot(_z);
      _tmp.set(0, 0, 0).addScaledVector(_x, fx).addScaledVector(_y, fy).addScaledVector(_z, fz);
      key.target.position.copy(_tmp);
      key.position.copy(_tmp).addScaledVector(_z, 150);
      key.target.updateMatrixWorld();
      key.updateMatrixWorld();
    },

    /** 枪模场景的镜头永远在原点看 -Z（枪模的坐标就是镜头坐标），所以每帧只要按此刻的太阳方向、是否晒得到，摆好枪模的灯。vm.sunVis 由外部写（0 = 镜头在阴影里）。 */
    vmSync(dt = 1 / 60) {
      camera.updateWorldMatrix(true, false);
      camera.getWorldQuaternion(_q);
      if (stage.keyDir) vm.key.position.copy(_tmp.fromArray(stage.keyDir).applyQuaternion(_q.invert())).multiplyScalar(10);
      vm.sunLit += (vm.sunVis - vm.sunLit) * Math.min(1, dt * 9);
      const k = 0.3 + 0.7 * vm.day;
      vm.key.intensity = vm.sunLit;
      vm.fill.intensity = 0.55 * vm.day + 0.10 * (1 - vm.day); vm.hemi.intensity = 0.5 * vm.day * (0.4 + 0.6 * vm.sunLit);   // 下半是晒着的甲板反弹上来的暖光                       // 补光：天光的颜色，白天给足，夜里留一点
      vm.rim.intensity = (1.5 * vm.day + 0.12 * (1 - vm.day)) * (0.35 + 0.65 * vm.sunLit);
      vm.rim.color.setRGB(1.0, 0.95 + 0.05 * (1 - vm.day), 0.86 + 0.14 * (1 - vm.day));
      vm.lamp.intensity = stage.lampLevel * (vm.sunLit < 0.5 ? 1 : 0.1) * 0.09;     // 露天月夜里枪应该也是暗蓝的，只有灯下才是暖的
    },

    /** 太阳在屏幕上的位置（归一化设备坐标）与“有没有被东西挡住”（由调用方做遮挡检测后写 vis） */
    sunScreen(out) {
      if (!stage.keyDir || look.isMoon) return out.set(0, 0, 0);
      _tmp.fromArray(stage.keyDir).multiplyScalar(1000).add(camera.getWorldPosition(_f));
      _tmp.project(camera);
      const z = _tmp.z < 1 ? 1 : 0;
      return out.set(_tmp.x, _tmp.y, z);
    },

    setSize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      vm.camera.aspect = w / h; vm.camera.updateProjectionMatrix();
      postfx.setSize(w * dpr, h * dpr);
    },

    /** 0 = 省电：无遮蔽、无多重采样、无海水倒影；1 = 均衡；2 = 全开 */
    setQuality(l) {
      qLevel = Math.max(0, Math.min(2, l | 0));
      mapSize = MAPS[qLevel]; dprCap = DPR[qLevel];
      if (key.shadow.mapSize.x !== mapSize) {
        key.shadow.mapSize.set(mapSize, mapSize);
        if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
      }
      postfx.setQuality(qLevel);
      sea.setQuality(qLevel);
      stage.onResize ? stage.onResize() : 0;
    },

    /** 整条船的轻微摇摆：横摇、纵摇、起伏。玩家和机器人都在船上，所以只有海平线和天空会相对晃动。 */
    setRoll(on) { stage.roll = !!on; },
    updateShip(time) {
      if (!stage.roll) { shipRoot.rotation.set(0, 0, 0); shipRoot.position.y = 0; return; }
      shipRoot.rotation.set(0.0011 * Math.sin(time * 0.27 + 1.0), 0, 0.0038 * Math.sin(time * 0.45));
      shipRoot.position.y = 0.045 * Math.sin(time * 0.31) + 0.02 * Math.sin(time * 0.73 + 2.0);
    },

    render(dt, time) {
      sea.update(time);
      camera.getWorldPosition(_f);
      sky.update(time, _f);
      renderer.shadowMap.needsUpdate = true;
      sea.renderReflection(scene, camera, hide);
      renderer.info.reset();
      if (vm.root.visible) stage.vmSync(dt);
      postfx.render(dt);
    },
  };
  stage.applyTime();
  return stage;
}
