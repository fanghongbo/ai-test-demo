// 渲染舞台：renderer / scene / camera / 太阳与阴影 / 天空环境 / 雾 / 海面 / 后期链 / 画质档 / 时刻应用。
// 色彩：场景画进 HDR 缓冲（线性），OutputPass 做 AgX 色调映射，最后一道 FinishShader 在显示色域里调色。
import * as THREE from 'three';
import { createSkyEnv, computeSkyLook, MOON_COLOR } from './skyenv.js';
import { createPostFX } from './postfx.js';
import { createSky } from '../world/sky.js';
import { createSea } from '../world/sea.js';
import { sampleHour, lampFactor, MOON } from '../core/palette.js';
import { sunVector } from '../core/skymodel.js';

const SHADOW_EXT = 120;                                  // 阴影盒半宽（米）：跟着玩家的车走，周围一个街区的阴影都是实的
const MAPS = [1024, 2048, 4096], DPR = [1, 1.5, 2];

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{noise: THREE.Texture, waterN?: THREE.Texture}} T 贴图集合（noise 给天空和海面用）
 */
export function createStage(canvas, T, o = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 0.78;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;                 // 每帧开头置一次 needsUpdate
  renderer.info.autoReset = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 62, 16 / 9, 0.3, 12000);
  camera.rotation.order = 'YXZ';
  const hide = [];                                       // 画倒影 / 法线深度时要藏起来的对象：海面自己、特效

  const env = createSkyEnv(renderer);
  const sky = createSky();
  sky.bind(env.texture, T.noise);
  scene.add(sky.dome);
  const sea = createSea({ y: o.seaY ?? -5, waterN: T.waterN });
  sea.bind(env.texture, T.noise, renderer);
  scene.add(sea.mesh);
  hide.push(sea.mesh);

  // 主光：太阳，夜里换成月亮（谁更亮用谁投影）
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00016;
  key.shadow.normalBias = 0.05;
  const sc = key.shadow.camera;
  sc.left = sc.bottom = -SHADOW_EXT; sc.right = sc.top = SHADOW_EXT; sc.near = 10; sc.far = 600;
  sc.updateProjectionMatrix();
  scene.add(key); scene.add(key.target);

  scene.fog = new THREE.FogExp2(0x9fc4de, 0.0006);

  const postfx = createPostFX(renderer, scene, camera, hide);
  const real = {}, look = {}, moonDir = sunVector(MOON.az, MOON.el);
  const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _f = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _tmp = new THREE.Vector3();
  let qLevel = 2, dprCap = 2, mapSize = 4096;

  const stage = {
    renderer, scene, camera, key, hide, sky, sea, postfx, real, look, moonDir, env,
    hour: o.hour ?? 13.6, lampLevel: 0, night: 0, buildMs: env.buildMs, keyDir: null,
    get quality() { return qLevel; },

    /** 应用时刻：太阳方向与颜色、环境贴图、天空、海、雾、曝光、人造光强度 */
    applyTime(hour = stage.hour) {
      stage.hour = hour;
      sampleHour(hour, real);
      computeSkyLook(env.lut, real, real.sunAz, moonDir, look);
      look.fogDensity = real.fog;
      const r = env.update(look.sunDir, real.turbidity, look.night);
      if (r.changed) scene.environment = r.envMap;
      sky.setLook(look, moonDir, MOON_COLOR);
      sea.setLook(look, moonDir);
      const m = look.isMoon, col = m ? MOON_COLOR.map((c) => c * look.moonE) : look.sunT.map((c) => c * look.sunE);
      key.color.setRGB(col[0], col[1], col[2]);
      stage.keyDir = m ? moonDir : look.sunDir;
      scene.fog.color.setRGB(look.fog[0], look.fog[1], look.fog[2]);
      scene.fog.density = real.fog;
      renderer.toneMappingExposure = real.exposure;
      stage.lampLevel = lampFactor(real.sunEl);
      stage.night = look.night;
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
      const fx = Math.round(_f.dot(_x) / texel) * texel, fy = Math.round(_f.dot(_y) / texel) * texel, fz = _f.dot(_z);
      _tmp.set(0, 0, 0).addScaledVector(_x, fx).addScaledVector(_y, fy).addScaledVector(_z, fz);
      key.target.position.copy(_tmp);
      key.position.copy(_tmp).addScaledVector(_z, 260);
      key.target.updateMatrixWorld();
      key.updateMatrixWorld();
    },

    setSize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
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

    render(dt, time) {
      sea.update(time);
      camera.getWorldPosition(_f);
      sky.update(time, _f);
      renderer.shadowMap.needsUpdate = true;
      sea.renderReflection(scene, camera, hide);
      renderer.info.reset();
      postfx.render(dt);
    },
  };
  stage.applyTime();
  return stage;
}
