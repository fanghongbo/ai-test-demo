// 渲染舞台：renderer / scene / camera / 太阳与阴影 / 时刻应用
import * as THREE from 'three';
import { DEG } from '../core/mathx.js';

export function createStage(canvas, U, o = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;      // 赛璐璐模式下着色器直接输出显示色域的颜色（写实风格切到 SRGB，见 pbr.js）
  renderer.toneMapping = THREE.NoToneMapping;                  // 色阶是造型的核心，任何 tone mapping 都会把硬边揉软
  renderer.info.autoReset = false;                             // 写实风格一帧要画好几次场景（倒影、法线、深度）：统计按帧累加，见 render()
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;                        // 改为每帧开头置一次 needsUpdate（见 main.js 的 tick）
  renderer.setClearColor(0x9fd3ea, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 36, 16 / 9, 0.08, 5000);

  // 太阳：赛璐璐模式下只为阴影贴图服务（着色在自定义 shader 里完成）；写实模式下同时是主光（gfx/pbr.js）。
  // 正交阴影盒紧贴主体 → 接触阴影清晰
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(o.shadowSize ?? 2048, o.shadowSize ?? 2048);
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.025;
  const sc = sun.shadow.camera;
  sc.left = sc.bottom = -(o.shadowExtent ?? 15); sc.right = sc.top = o.shadowExtent ?? 15;
  sc.near = 1; sc.far = 260;
  sc.updateProjectionMatrix();
  scene.add(sun); scene.add(sun.target);

  let dpr = 1;
  function resize(w, h, ratio) {
    dpr = Math.min(ratio, o.maxDpr ?? 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    syncCameraUniforms();
  }
  function syncCameraUniforms() {
    const size = new THREE.Vector2(); renderer.getDrawingBufferSize(size);
    U.uViewport.value.copy(size);
    U.uPixelRatio.value = renderer.getPixelRatio();
    const f = Math.tan((camera.fov * DEG) / 2);
    U.uCamScale.value = camera.isPerspectiveCamera ? 2 * f : 2 / camera.zoom;
  }
  /** 阴影盒半宽（米）：写实风格盖到近处的棕榈和路灯，赛璐璐只贴着主体 */
  function setShadowExtent(m) {
    if (sc.right === m) return;
    sc.left = sc.bottom = -m; sc.right = sc.top = m;
    sc.updateProjectionMatrix();
  }

  const sunDir = new THREE.Vector3(0, 1, 0);
  /** 把调色盘应用到全场景共享 uniforms；focus = 阴影盒跟随的世界点 */
  function applyPalette(p, focus) {
    const az = p.sunAz * DEG, el = p.sunEl * DEG;
    const elC = Math.cos(el);
    sunDir.set(Math.sin(az) * elC, Math.sin(el), Math.cos(az) * elC).normalize();
    U.uSunDir.value.copy(sunDir);
    U.uLitTint.value.setRGB(...p.litTint);
    U.uShadeTint.value.setRGB(...p.shadeTint);
    U.uCoreTint.value.setRGB(...p.coreTint);
    U.uRimColor.value.setRGB(...p.rimColor);
    U.uRimStrength.value = p.rimStrength;
    U.uHiColor.value.setRGB(Math.min(1, p.litTint[0] + 0.25), Math.min(1, p.litTint[1] + 0.22), Math.min(1, p.litTint[2] + 0.16));
    U.uRimDir.value.set(-sunDir.x, 0.28, -sunDir.z).normalize();
    U.uTerminator.value = p.terminator;
    U.uInk.value.setRGB(...p.ink);
    U.uFogColor.value.setRGB(...p.skyHorizon);
    U.uFogNear.value = 110 / p.fogDensity;
    U.uFogFar.value = 900 / p.fogDensity;
    U.uLampLevel.value = p.lamps;
    renderer.setClearColor(new THREE.Color(...p.skyHorizon), 1);
    // 太阳低于地平线时不再投影（蓝调时刻没有硬阴影），改由月光提供极浅的阴影
    if (focus) {
      sun.position.copy(focus).addScaledVector(sunDir, 90);
      sun.target.position.copy(focus);
      sun.target.updateMatrixWorld();
      sun.color.set(0xffffff); sun.intensity = 1;
      sun.castShadow = api.shadowEnabled && p.sunEl > 3;
    }
  }

  const stats = { calls: 0, triangles: 0, frame: 0 };
  /** draw：自定义的整帧绘制（写实风格走后期链）；不传则直接渲染场景 */
  function render(draw) {
    renderer.info.reset();
    if (draw) draw(); else renderer.render(scene, camera);
    stats.calls = renderer.info.render.calls; stats.triangles = renderer.info.render.triangles; stats.frame++;
  }

  const api = { renderer, scene, camera, sun, resize, syncCameraUniforms, applyPalette, render, stats, shadowEnabled: true, setShadowExtent, get pixelRatio() { return dpr; } };
  return api;
}
