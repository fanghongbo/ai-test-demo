// 渲染舞台：renderer / scene / camera / 太阳（带阴影） / 水下光照 / 海面 / 倒影 / 后期链 / 画质档 / 时刻应用。
// 色彩：场景画进 HDR 缓冲（线性），OutputPass 做 AgX 色调映射，最后一道 FinishShader 在显示色域里调色。
import * as THREE from 'three';
import { createSkyEnv, computeSkyLook, MOON_COLOR, MOON_E } from './skyenv.js';
import { createWaterLight } from './waterlight.js';
import { createSurface } from './surface.js';
import { createUnderReflection } from './reflection.js';
import { createPostFX } from './postfx.js';
import { waterNormalTexture } from './datatex.js';
import { sampleHour, SUN_E } from '../core/palette.js';
import { sunVector } from '../core/skymodel.js';
import { sunUnderwater, extinction, MOON, WATER_TINT } from '../core/wateroptics.js';
import { TILE } from '../core/waves.js';

const SHADOW_EXT = 100;                                  // 阴影盒半宽（米）：跟着镜头走，光束和影子都从这里来。150 米的时候 4096 的贴图一格 7 厘米，近处影子的边缘一格一格的；100 米是 4.9 厘米。再大的话一张 4096 的贴图摊到每格 7 厘米，石像上的小影子全成了斑块
const MAPS = [1024, 2048, 4096], REFL = [0, 256, 512], CAUSTIC = [256, 512, 1024], DPR = [1, 1.5, 2];
const sstep = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const FOCUS_DEPTH = 15;                                  // 焦散贴图按这个深度算（米）：过了首次聚焦，亮纹连成回环，最像真的
const GAIN = { sun: 3.6, disc: 13, amb: 0.22, water: 0.32 };         // 换算系数：把天空模型的辐照度换到这个场景的亮度尺度上。天光故意压得比日光低很多：真实深水里两者差不多亮，画面会是一片平的灰蓝
const DEPTH_GAIN = 1.25;                                 // 镜头随深度自动提亮：人的眼睛会适应，水越深光越少

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ time?: object, clarity?: number, onParts?: Function }} o  time：TIMES 里的一项；clarity：水质的衰减倍率
 */
export function createStage(canvas, o = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;                 // 每帧开头置一次 needsUpdate
  renderer.info.autoReset = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 62, 16 / 9, 0.3, 9000);
  const hide = [];                                       // 画倒影 / 法线深度时要藏起来的对象

  const skyEnv = createSkyEnv(renderer);
  const W = createWaterLight(renderer, { causticSize: CAUSTIC[2] });
  scene.add(W.dome);
  const surface = createSurface(W, skyEnv.texture, waterNormalTexture(256));
  scene.add(surface.mesh);
  const reflection = createUnderReflection(renderer, 0);
  const rippleTex = surface.U.tRipple.value;

  // 唯一的投影光：折射进水里的太阳（夜里是月亮）
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.castShadow = true;
  key.shadow.mapSize.set(MAPS[2], MAPS[2]);
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.06;
  const sc = key.shadow.camera;
  sc.left = sc.bottom = -SHADOW_EXT; sc.right = sc.top = SHADOW_EXT; sc.near = 40; sc.far = 560;
  sc.updateProjectionMatrix();
  scene.add(key); scene.add(key.target);

  W.setFocus(FOCUS_DEPTH);
  const postfx = createPostFX(renderer, scene, camera, hide, key, W);
  for (const h of [W.dome, surface.mesh]) hide.push(h);

  const real = {}, look = {}, ext = extinction(1), moonDir = sunVector(MOON.az, MOON.el);
  const _z = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _f = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0), _t = new THREE.Vector3();
  let qLevel = 2, dprCap = 2, mapSize = MAPS[2], viewSize = null;
  const sunDirW = new THREE.Vector3(0, 1, 0);

  const stage = {
    renderer, scene, camera, key, hide, W, surface, reflection, postfx, skyEnv, rippleTex, sunDirW, real, look, ext, moonDir, skyEnvBuildMs: skyEnv.buildMs,
    time: null, clarity: 1, sea: 1,
    get quality() { return qLevel; },

    /** 应用时刻和水质：太阳折射进水里的方向和颜色、各个衰减系数、水色、环境贴图、曝光、水面上的天空 */
    applyTime(time, clarity = stage.clarity, force = false) {
      stage.time = time; stage.clarity = clarity;
      sampleHour(time.hour, real);
      computeSkyLook(skyEnv.lut, real, real.sunAz, moonDir, look);
      const r = skyEnv.update(look.sunDir, real.turbidity, look.night, force);
      extinction(clarity, ext);
      const moon = look.isMoon, su = sunUnderwater(moon ? MOON.el : real.sunEl, moon ? MOON.az : real.sunAz);
      sunDirW.set(su.dir[0], su.dir[1], su.dir[2]);
      const day = (look.sunE / SUN_E) * (look.sunT[1] + look.sunT[2]) * 0.5;             // 日光强度 0..1（空气里）
      const level = Math.max(day, look.night * 0.014);                                     // 加上一点月光，夜里水色不至于全黑
      const U = W.U;
      // 直射光：水面上是太阳的颜色 × 透射率 × “光线竖直了”的聚拢；镜头看到的亮度还差一个随深度的衰减（在材质里逐像素算）
      const tint = moon ? MOON_COLOR : look.sunT;
      const power = moon ? MOON_E * look.night * 0.9 : (look.sunE / SUN_E) * su.transmit;
      U.uWSun.value.set(tint[0] * power, tint[1] * power, tint[2] * power).multiplyScalar(GAIN.sun);
      U.uWSunDir.value.copy(sunDirW);
      for (const [k, name] of [['view', 'uWSigma'], ['sun', 'uWKdSun'], ['amb', 'uWKdAmb']]) U[name].value.set(ext[k][0], ext[k][1], ext[k][2]);
      // 水色：清澈的水是深蓝的，越浑越绿、越亮；日落后跟着暗下去。
      // GAIN.water 把水里的散射光压到比照在物体上的天光还暗：物理上两者该一样亮，但那样远处全糊成一团亮蓝；水“黑”一点，城才立得出来
      const k = clarity;
      U.uWAmb.value.set(
        (WATER_TINT[0] + 0.010 * (k - 1)) * Math.pow(k, 0.35) * level * GAIN.water,
        (WATER_TINT[1] + 0.020 * (k - 1)) * Math.pow(k, 0.5) * level * GAIN.water,
        (WATER_TINT[2] - 0.020 * (k - 1)) * Math.pow(k, 0.15) * level * GAIN.water);
      U.uWCausticMix.value = Math.min(1, power * 2.5 + 0.05) * (1 - look.night * 0.55);
      key.color.setRGB(U.uWSun.value.x, U.uWSun.value.y, U.uWSun.value.z);
      key.intensity = 1;
      stage.keyDir = sunDirW;
      // 水面：窗里的天空、折射进来的太阳盘
      const S = surface.U;
      S.uSunAir.value.set(look.sunDir[0], look.sunDir[1], look.sunDir[2]);
      const dt = moon ? 0 : (look.sunE / SUN_E) * su.transmit;
      S.uSunDisc.value.set(look.sunT[0] * dt, look.sunT[1] * dt, look.sunT[2] * dt).multiplyScalar(GAIN.disc * Math.pow(0.2 + day, 0.6));
      S.uSunVis.value = moon ? 0 : 1;
      // 环境贴图：天光的辐射亮度（光从上面来）+ 折射进来的太阳那一团
      const irr = look.isMoon ? [0.25, 0.30, 0.42].map((v) => v * MOON_E * look.night * 3) : look.irr;
      const amb = new THREE.Vector3(irr[0], irr[1], irr[2]).multiplyScalar((GAIN.amb * GAIN.sun * su.transmit) / Math.PI / Math.pow(clarity, 0.25));
      const glow = new THREE.Vector3(U.uWSun.value.x, U.uWSun.value.y, U.uWSun.value.z).multiplyScalar(0.10);
      if (r.changed || force) { W.setEnv(amb, sunDirW, glow); scene.environment = W.envMap; }
      stage.exposure0 = time.p.exposure;
      renderer.toneMappingExposure = time.p.exposure;
      postfx.shafts.U.uScatter.value.set(0.026, 0.026, 0.026).multiplyScalar(Math.pow(clarity, 0.3));
      // 光束的颜色：纯水对红光的吸收比“白平衡过的”直射光狠得多。按真实的吸收给悬在水里的光上色，远处才是深蓝的水而不是白雾
      postfx.shafts.U.uKdBeam.value.set(0.095, 0.040, 0.024).multiplyScalar(0.35 + 0.65 * clarity);
      return r.changed;
    },

    /** 阴影盒跟着焦点走。对齐到阴影贴图的格子上，镜头移动时阴影边缘不抖。 */
    follow(focus) {
      if (!stage.keyDir) return;
      _z.copy(stage.keyDir).normalize();
      _x.crossVectors(_up, _z).normalize();
      _y.crossVectors(_z, _x);
      const texel = (2 * SHADOW_EXT) / mapSize;
      _f.copy(focus);
      const fx = Math.round(_f.dot(_x) / texel) * texel, fy = Math.round(_f.dot(_y) / texel) * texel, fz = _f.dot(_z);
      _t.set(0, 0, 0).addScaledVector(_x, fx).addScaledVector(_y, fy).addScaledVector(_z, fz);
      key.target.position.copy(_t);
      key.position.copy(_t).addScaledVector(_z, 300);
      key.target.updateMatrixWorld();
      key.updateMatrixWorld();
    },

    setSize(w, h) {
      viewSize = [w, h];
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      postfx.setSize(w * dpr, h * dpr);
      if (stage.onResize) stage.onResize(w * dpr, h * dpr, camera.fov);
    },

    /** 0 = 流畅：无遮蔽、无多重采样、无倒影；1 = 均衡；2 = 极致 */
    setQuality(l) {
      qLevel = Math.max(0, Math.min(2, l | 0));
      mapSize = MAPS[qLevel]; dprCap = DPR[qLevel];
      if (key.shadow.mapSize.x !== mapSize) {
        key.shadow.mapSize.set(mapSize, mapSize);
        if (key.shadow.map) { key.shadow.map.dispose(); key.shadow.map = null; }
      }
      postfx.setQuality(qLevel);
      reflection.enabled = REFL[qLevel] > 0; reflection.setSize(REFL[qLevel] || 256);
      W.setSize(CAUSTIC[qLevel]);
      surface.U.uHasRefl.value = REFL[qLevel] > 0 ? 1 : 0;
      if (stage.onQuality) stage.onQuality(qLevel);
      if (viewSize) stage.setSize(viewSize[0], viewSize[1]);         // 像素比的上限换了：按新的重设一遍（后期链的缓冲、悬浮物的投影系数都跟着对）
    },

    /**
     * 预热：把场景里所有材质的着色器程序都准备好，再不裁剪地整体画一帧。
     * 不做的话，每样东西第一次进视野都要现编译着色器、现传几何和贴图——画面会卡住两三秒（巡游第一次切到某个镜头时最明显）。
     * 分三步，中间都让出主线程，加载画面上的进度条照常走
     */
    async prewarm() {
      const t0 = performance.now(), rt = renderer.getRenderTarget(), probe = new THREE.WebGLRenderTarget(8, 8, { type: THREE.HalfFloatType });
      renderer.setRenderTarget(probe);                                            // 主画面和倒影都是画进缓冲里的：绑着一个空缓冲去编译，生成的才是运行时真正用的那一版。
      renderer.compile(scene, camera);                                            // 绑着屏幕去编译的话，每个材质都会多出一版带色调映射的、永远用不到的程序
      const t1 = performance.now();
      await renderer.compileAsync(scene, camera);                                 // 等它们都编完（并行的扩展）
      const t2 = performance.now();
      // 驱动到一个着色器第一次被用到的时候才真正编译它。一个材质一个材质地各画一次，中间让出主线程：
      // 不这样的话，第一帧里几十个程序排着队编译，页面要冻住好几秒
      const drawables = [];
      scene.traverse((o) => { if ((o.isMesh || o.isPoints || o.isLine) && o.material) drawables.push(o); });
      const seen = new Set(), reps = [];
      for (const o of drawables) { const ms = Array.isArray(o.material) ? o.material : [o.material]; if (ms.some((m) => !seen.has(m))) { ms.forEach((m) => seen.add(m)); reps.push(o); } }
      const wasVisible = drawables.map((o) => o.visible), shadowAuto = renderer.shadowMap.autoUpdate;
      renderer.shadowMap.autoUpdate = false;
      for (const o of drawables) o.visible = false;
      for (const o of reps) {
        o.visible = true;
        const cull = o.frustumCulled;
        o.frustumCulled = false;
        renderer.render(scene, camera);
        o.frustumCulled = cull;
        o.visible = false;
        renderer.getContext().finish();
        await new Promise((r) => setTimeout(r, 0));
      }
      drawables.forEach((o, i) => { o.visible = wasVisible[i]; });
      renderer.shadowMap.autoUpdate = shadowAuto;
      renderer.setRenderTarget(rt);
      probe.dispose();
      const culled = [];
      scene.traverse((o) => { if (o.frustumCulled) { o.frustumCulled = false; culled.push(o); } });
      stage.render(1 / 60, 0, true);                                            // 最后不裁剪地整体画一帧：几何和贴图都传上显卡，阴影通道用的深度材质也是到这时候才第一次用得上
      for (const o of culled) o.frustumCulled = true;
      const t3 = performance.now();
      stage.prewarmMs = t3 - t0;
      stage.prewarmParts = [t1 - t0, t2 - t1, t3 - t2].map(Math.round);        // 发出编译 / 等编完 / 逐个材质画一遍再整体画一帧，各用了多少毫秒
      return stage.prewarmMs;
    },

    render(dt, time, paused) {
      if (!paused) W.update(time);
      const d = Math.max(0, -camera.position.y);                                       // 深度提亮：12 米处约 1.3 倍，45 米以下约 2.25 倍
      renderer.toneMappingExposure = (stage.exposure0 ?? 1.8) * (1 + DEPTH_GAIN * sstep(0, 46, d));
      surface.follow(camera);
      camera.getWorldPosition(_f);
      _f.addScaledVector(_t.set(0, 0, -1).applyQuaternion(camera.quaternion), 25);        // 阴影盒盖住镜头前方
      _f.y = Math.min(_f.y, -14);
      stage.follow(_f);
      if (reflection.enabled && reflection.update(scene, camera, hide)) { surface.U.tRefl.value = reflection.texture; surface.U.uReflMat.value.copy(reflection.textureMatrix); }
      renderer.shadowMap.needsUpdate = true;
      renderer.info.reset();
      postfx.render(dt);
    },
  };
  return stage;
}
export { FOCUS_DEPTH, TILE };
