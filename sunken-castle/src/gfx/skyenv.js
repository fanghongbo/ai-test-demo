// 天空环境：把大气模型烘焙成一张 HDR 等距柱状图（同时用作穹顶贴图、海面反射源），
// 再由它生成 PMREM 环境贴图（IBL）。JS 侧用同一套模型算出直射光颜色、雾色、天光辐照度。
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { buildTransmittanceLUT, skyRadiance, nightGlow, transmittance, luma, sunVector } from '../core/skymodel.js';
import { SKY_PHYS_GLSL } from './skyphys_glsl.js';
import { SUN_E, MIE_G, MULTI_SCATTER, nightFactor } from '../core/palette.js';
import { NIGHT_SKY } from '../core/skymodel.js';
import { DEG } from '../core/mathx.js';

export const MOON_E = 0.115;                       // 电影式月光：远比真实亮（真实约是日光的百万分之二），否则夜景什么都看不见
export const MOON_COLOR = [0.62, 0.72, 1.0];
const SKY_BAKE_W = 256, SKY_BAKE_H = 128;

const NIGHT_GLSL = `vec3 nightGlow( vec3 d ) { float t = pow( 1.0 - max( d.y, 0.0 ), 3.0 ); return mix( vec3( ${NIGHT_SKY.zenith.join( ', ' )} ), vec3( ${NIGHT_SKY.horizon.join( ', ' )} ), t ); }`;
export const EQUIRECT_GLSL = /* glsl */`
vec2 equirectUv2( vec3 d ) { return vec2( atan( d.z, d.x ) / 6.2831853 + 0.5, asin( clamp( d.y, - 1.0, 1.0 ) ) / 3.1415927 + 0.5 ); }
`;

const BAKE_FRAG = /* glsl */`
varying vec2 vUv;
uniform vec3 uSun;
uniform float uTurbidity, uNight;
${SKY_PHYS_GLSL}
${NIGHT_GLSL}
void main() {
  float az = ( vUv.x - 0.5 ) * 6.2831853, el = ( vUv.y - 0.5 ) * 3.1415927;
  vec3 d = vec3( cos( el ) * cos( az ), sin( el ), cos( el ) * sin( az ) );
  vec3 sunT;
  vec3 col = skyScatter( d, uSun, uTurbidity, 1.0, SKY_MIE_G, SKY_SUN_E, SKY_MS, sunT );
  col += nightGlow( d ) * uNight;
  gl_FragColor = vec4( col, 1.0 );
}
`;

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * 写实镜头参数（纯计算，可 Node 测试）。
 * @param {Float32Array} lut 透射率表
 * @param {object} real sampleReal 的结果（sunEl / turbidity）
 * @param {number} sunAz 太阳方位（度，沿用调色盘）
 * @param {number[]} moonDir 月光方向
 */
export function computeSkyLook(lut, real, sunAz, moonDir, out = {}) {
  const sun = sunVector(sunAz, real.sunEl), A = { turbidity: real.turbidity, mieG: MIE_G, sunE: SUN_E };
  const night = nightFactor(real.sunEl), tmp = [0, 0, 0];
  const sunT = transmittance(lut, 0, sun[1], real.turbidity, 1);
  out.sunDir = sun; out.sunT = sunT; out.sunE = SUN_E * smooth(-0.012, 0.02, sun[1]); out.night = night;
  out.moonDir = moonDir.slice(); out.moonE = MOON_E * night;
  out.cloud = real.cloud ?? 0.4;                                                // 云量（关键帧里给的；不传就没有云）
  // 雾色：背向太阳的 6 个方位（仰角 5°）取平均；朝阳方向另取一个（仰角 8°），着色器里按视线方位混合
  const fog = [0, 0, 0], fogSun = [0, 0, 0], Lz = [0, 0, 0], Lm = [0, 0, 0];
  const add = (acc, az, el, w) => {
    const d = sunVector(az, el), r = skyRadiance(lut, d, sun, A).rgb;
    nightGlow(d, tmp);
    for (let k = 0; k < 3; k++) acc[k] += w * (r[k] + tmp[k] * night);
  };
  for (const off of [67.5, 112.5, 157.5, 202.5, 247.5, 292.5]) add(fog, sunAz + off, 5, 1 / 6);
  add(fogSun, sunAz, 8, 1);
  add(Lz, sunAz + 180, 90, 1); add(Lm, sunAz + 60, 30, 1);
  // 水平面上的天光辐照度 = π × 半球加权平均辐射
  const irr = [0, 0, 0];
  for (let k = 0; k < 3; k++) irr[k] = Math.PI * (0.18 * Lz[k] + 0.52 * Lm[k] + 0.30 * fog[k]);
  out.fog = fog; out.fogSun = fogSun; out.irr = irr;
  out.isMoon = luma(sunT) * out.sunE < MOON_E * night * 0.8;       // 谁更亮就用谁投影
  return out;
}

/** 烘焙器：等距柱状 HDR 贴图 + PMREM。太阳挪动不足阈值时不重复生成 PMREM（它比烘焙本身贵） */
export function createSkyEnv(renderer) {
  const t0 = performance.now();
  const lut = buildTransmittanceLUT();
  const lutTex = new THREE.DataTexture(lut, 128, 48, THREE.RGBAFormat, THREE.FloatType);
  lutTex.minFilter = lutTex.magFilter = THREE.NearestFilter; lutTex.needsUpdate = true;
  const rt = new THREE.WebGLRenderTarget(SKY_BAKE_W, SKY_BAKE_H, {
    type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
  });
  rt.texture.wrapS = THREE.RepeatWrapping; rt.texture.wrapT = THREE.ClampToEdgeWrapping;
  const mat = new THREE.ShaderMaterial({
    uniforms: { tSkyLut: { value: lutTex }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uTurbidity: { value: 2.5 }, uNight: { value: 0 } },
    vertexShader: /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy, 0.0, 1.0 ); }`,
    fragmentShader: BAKE_FRAG, depthTest: false, depthWrite: false,
  });
  const quad = new FullScreenQuad(mat);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTex = null, last = null;

  /** @returns {{envMap: THREE.Texture, changed: boolean}} */
  function update(sunDir, turbidity, night, force = false) {
    const same = last && !force && last.night === night && Math.abs(last.turbidity - turbidity) < 0.02
      && last.sun.x * sunDir[0] + last.sun.y * sunDir[1] + last.sun.z * sunDir[2] > 0.99999;
    mat.uniforms.uSun.value.set(sunDir[0], sunDir[1], sunDir[2]);
    if (same && envTex) return { envMap: envTex, changed: false };
    mat.uniforms.uTurbidity.value = turbidity; mat.uniforms.uNight.value = night;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(rt); quad.render(renderer); renderer.setRenderTarget(prev);
    const old = envTex;
    envTex = pmrem.fromEquirectangular(rt.texture).texture;
    if (old) old.dispose();
    last = { sun: new THREE.Vector3(sunDir[0], sunDir[1], sunDir[2]), turbidity, night };
    return { envMap: envTex, changed: true };
  }
  return { lut, texture: rt.texture, update, get envMap() { return envTex; }, buildMs: Math.round(performance.now() - t0) };
}
