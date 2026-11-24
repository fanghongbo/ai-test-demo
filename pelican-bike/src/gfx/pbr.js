// 写实（物理）渲染层：每个赛璐璐材质都有一个 PBR 对应物，合批网格用一份带逐顶点材质参数的着色器；
// 全场景的大气透视雾通过替换 three 的雾代码段实现；画风切换套件负责材质换装、灯光、雾、曝光与环境光。
import * as THREE from 'three';
import { classFor } from './pbrclass.js';
import { createSkyEnv, computeSkyLook, MOON_E, MOON_COLOR } from './skyenv.js';
import { noiseTexture, featherNormalTexture } from './datatex.js';
import { sampleReal } from '../core/palette_real.js';
import { DEG } from '../core/mathx.js';

// ———————————————————————— 大气透视雾（全局替换 three 的雾代码段；赛璐璐材质不用这些代码段） ————————————————————————
export function installFogChunks() {
  const C = THREE.ShaderChunk;
  C.fog_pars_vertex = /* glsl */`
#ifdef USE_FOG
  varying float vFogDepth;
  varying vec3 vFogWorld;
#endif`;
  C.fog_vertex = /* glsl */`
#ifdef USE_FOG
  vFogDepth = - mvPosition.z;
  vec4 fogWP = vec4( transformed, 1.0 );
  #ifdef USE_BATCHING
    fogWP = batchingMatrix * fogWP;
  #endif
  #ifdef USE_INSTANCING
    fogWP = instanceMatrix * fogWP;
  #endif
  vFogWorld = ( modelMatrix * fogWP ).xyz;
#endif`;
  C.fog_pars_fragment = /* glsl */`
#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogWorld;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
  #ifdef USE_FOG_SUN
    uniform vec3 uFogSunDir, uFogSunColor;
    uniform float uFogMist;
  #endif
#endif`;
  C.fog_fragment = /* glsl */`
#ifdef USE_FOG
  float fogD = fogDensity;
  #ifdef USE_FOG_SUN
    fogD *= 1.0 + uFogMist * exp( - max( vFogWorld.y, 0.0 ) / 7.0 );     // 贴地雾：清晨海面上的一层薄雾
  #endif
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogD * fogD * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  vec3 fogCol = fogColor;
  #ifdef USE_FOG_SUN
    vec3 fogV = vFogWorld - cameraPosition;
    fogV.y = 0.0;
    float fogA = pow( max( dot( normalize( fogV ), uFogSunDir ), 0.0 ), 5.0 );   // 朝阳方向的雾更亮更暖
    fogCol = mix( fogColor, uFogSunColor, fogA );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogCol, fogFactor );
#endif`;
}

// ———————————————————————— 合批材质的着色器补丁 ————————————————————————
// 物理光照代码段：清漆层与绒毛改成“逐顶点开关”。#include 在 onBeforeCompile 之后才展开，所以要改代码段本身；
// USE_PBR_BATCH 只在合批材质上定义，其余材质行为不变。
function installPhysicalChunks() {
  const C = THREE.ShaderChunk;
  if (C.lights_physical_fragment.includes('USE_PBR_BATCH')) return;
  const branch = (name, expr) => `#ifdef USE_PBR_BATCH\n\tmaterial.${name} = ${expr};\n#else\n\tmaterial.${name} = ${name};\n#endif`;
  C.lights_physical_fragment = must(must(C.lights_physical_fragment, 'material.clearcoat = clearcoat;', branch('clearcoat', 'clearcoat * vPBR.w')),
    'material.sheenColor = sheenColor;', branch('sheenColor', 'sheenColor * vSheen'));
}

const SWAY = /* glsl */`
  if ( aSway.x > 0.0 ) {
    float swPh = uTime * 1.25 + aSway.y + position.x * 0.07 + position.z * 0.05;
    float swG = sin( swPh ) * 0.6 + sin( swPh * 2.17 + 1.3 ) * 0.4;
    transformed += uWindDir * ( swG * 0.55 + 0.35 ) * aSway.x * uWindStrength * 0.5;
    transformed.y -= abs( swG ) * aSway.x * uWindStrength * 0.12;
  }
`;
const BATCH_VERT_HEAD = /* glsl */`
  uniform float uTime;
  uniform vec3 uWindDir;
  uniform float uWindStrength;
  attribute vec4 aPBR;
  attribute vec4 aMat;
  attribute vec2 aSway;
  varying vec4 vPBR;
  varying float vLamp;
  varying vec3 vWPosP;
`;
const BATCH_FRAG_HEAD = /* glsl */`
  uniform vec3 uSunRadiance, uSunDirW, uLampColorL;
  uniform float uLampEmissive, uDetailFade;
  uniform sampler2D tNoise;
  varying vec4 vPBR;
  varying float vLamp;
  varying vec3 vWPosP;
`;
const BATCH_FRAG_DETAIL = /* glsl */`
  float detP = exp( - length( vViewPosition ) * uDetailFade );          // 细节随距离淡出，远处不闪
  if ( vPBR.z > 0.5 && vPBR.z < 1.5 ) {                                   // 树冠：轮廓处按噪声侵蚀出叶缘
    float ndvP = abs( dot( normal, normalize( vViewPosition ) ) );
    float er = texture2D( tNoise, vWPosP.xz * 0.9 + vWPosP.y * 0.31 ).g;
    if ( er < 0.455 - 0.14 * ( 1.0 - detP ) && ndvP < 0.72 ) discard;
  }
  if ( vPBR.z > 0.5 && vPBR.z < 2.5 ) {                                   // 树冠 / 叶片：世界空间噪声凹凸，打散光滑球面
    float bh = texture2D( tNoise, vWPosP.xz * 3.1 + vWPosP.y * 2.3 ).b + texture2D( tNoise, vWPosP.zy * 7.3 + vWPosP.x * 5.1 ).a * 0.5;
    vec3 dpdx = dFdx( - vViewPosition ), dpdy = dFdy( - vViewPosition );
    vec3 r1 = cross( dpdy, normal ), r2 = cross( normal, dpdx );
    float det = dot( dpdx, r1 );
    normal = normalize( abs( det ) * normal - sign( det ) * ( dFdx( bh ) * r1 + dFdy( bh ) * r2 ) * 2.6 * ( 0.35 + 0.65 * detP ) );
  }
`;
const BATCH_FRAG_TINT = /* glsl */`
  if ( vPBR.z > 0.5 ) {                                                   // 叶 / 树冠 / 羽毛：两个尺度的噪声把纯色打散
    float cn = texture2D( tNoise, vWPosP.xz * 0.35 + vWPosP.y * 0.21 ).r;
    float cn2 = texture2D( tNoise, vWPosP.xz * 2.6 + vWPosP.y * 1.9 ).g;
    diffuseColor.rgb *= mix( 0.66, 1.3, cn ) * mix( 0.78, 1.24, cn2 );
  }
  if ( vPBR.z > 0.5 && vPBR.z < 2.5 ) diffuseColor.rgb *= vec3( 0.5, 0.58, 0.45 );   // 叶 / 树冠：赛璐璐的鲜绿压成自然的叶绿
  else if ( vPBR.z > 2.5 && vPBR.z < 3.5 ) diffuseColor.rgb *= vec3( 0.76, 0.74, 0.70 );   // 羽毛：奶油白
  else if ( vPBR.z > 3.5 ) diffuseColor.rgb *= 0.74;                             // 白漆 / 白塑料
`;
const BATCH_FRAG_BACKLIGHT = /* glsl */`
  if ( vPBR.z > 1.5 && vPBR.z < 2.5 ) {                                   // 叶片背光透光
    vec3 sunV = normalize( ( viewMatrix * vec4( uSunDirW, 0.0 ) ).xyz );
    float back = pow( max( dot( - normal, sunV ), 0.0 ), 1.2 );
    reflectedLight.directDiffuse += diffuseColor.rgb * uSunRadiance * RECIPROCAL_PI * back * 0.5;
  }
`;
const must = (src, needle, repl) => { if (!src.includes(needle)) throw new Error('着色器补丁找不到锚点: ' + needle); return src.replace(needle, repl); };

function patchBatch(shader, uni) {
  Object.assign(shader.uniforms, uni);
  shader.vertexShader = must(must(shader.vertexShader, '#include <common>', '#include <common>\n' + BATCH_VERT_HEAD),
    '#include <begin_vertex>', '#include <begin_vertex>\n' + SWAY + '\n  vPBR = aPBR; vLamp = aMat.z;\n  vWPosP = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
  shader.fragmentShader = must(shader.fragmentShader, '#include <common>', '#include <common>\n' + BATCH_FRAG_HEAD);
  // 清漆层 / 绒毛的逐顶点开关在 lights_physical_fragment 代码段里（见 installPhysicalChunks）
  // 每段代码插在对应 #include 之后；vSheen 要在 lights_physical_fragment 之前声明
  for (const [anchor, code] of [
    ['#include <color_fragment>', BATCH_FRAG_TINT],
    ['#include <roughnessmap_fragment>', '  roughnessFactor = clamp( vPBR.x, 0.05, 1.0 );'],
    ['#include <metalnessmap_fragment>', '  metalnessFactor = vPBR.y;'],
    ['#include <normal_fragment_maps>', BATCH_FRAG_DETAIL],
    ['#include <emissivemap_fragment>', '  totalEmissiveRadiance += vColor * uLampColorL * ( uLampEmissive * vLamp );'],
    ['#include <lights_physical_fragment>', '  float vSheen = ( vPBR.z > 2.5 && vPBR.z < 3.5 ) ? 1.0 : 0.0;\n  #include <lights_physical_fragment>'],
    ['#include <lights_fragment_end>', BATCH_FRAG_BACKLIGHT],
  ]) shader.fragmentShader = must(shader.fragmentShader, anchor, code.startsWith('  float') ? code : anchor + '\n' + code);
}
function patchStandard(shader, uni) {
  Object.assign(shader.uniforms, uni);
}
function patchSwayDepth(shader, uni) {
  shader.uniforms.uTime = uni.uTime; shader.uniforms.uWindDir = uni.uWindDir; shader.uniforms.uWindStrength = uni.uWindStrength;
  shader.vertexShader = must(must(shader.vertexShader, '#include <common>', '#include <common>\n  uniform float uTime; uniform vec3 uWindDir; uniform float uWindStrength; attribute vec2 aSway;'),
    '#include <begin_vertex>', '#include <begin_vertex>\n' + SWAY);
}

// ———————————————————————— 画风切换套件 ————————————————————————
const WHITE = new THREE.Color(1, 1, 1), _dir = new THREE.Vector3(), _tint = new THREE.Color();

/**
 * @param {object} stage createStage 的返回值
 * @param {object} U 共享 uniforms
 * @param {object} [o] { world, maxAnisotropy }
 */
export function createStyleKit(stage, U, o = {}) {
  const { renderer, scene } = stage;
  const tex = { noise: noiseTexture(), featherN: featherNormalTexture() };
  const sky = createSkyEnv(renderer);
  const uni = {
    uTime: U.uTime, uWindDir: U.uWindDir, uWindStrength: U.uWindStrength,
    uLampColorL: { value: new THREE.Color(1, 0.64, 0.32) }, uLampEmissive: { value: 0 },
    uSunRadiance: { value: new THREE.Color(0, 0, 0) }, uSunDirW: { value: new THREE.Vector3(0, 1, 0) },
    uDetailFade: { value: 0.045 },
    uFogSunDir: { value: new THREE.Vector3(0, 0, -1) }, uFogSunColor: { value: new THREE.Color() }, uFogMist: { value: 0 },
  };
  installFogChunks();
  installPhysicalChunks();
  const fog = new THREE.FogExp2(0x000000, 0.0007);
  const onLook = [], onStyle = [];
  const live = new Set();                       // 需要同步颜色 / 自发光的 PBR 材质
  const batchCache = new Map();

  // 夜灯：车灯（聚光）、最近两盏路灯、灯塔灯室、栈桥灯
  const LAMP = new THREE.Color(1, 0.66, 0.36);
  const head = new THREE.SpotLight(0xffe3b8, 0, 36, 0.42, 0.6, 2);
  const lamps = [0, 1].map(() => new THREE.PointLight(LAMP, 0, 24, 2));
  const lantern = new THREE.PointLight(LAMP, 0, 80, 2);
  const pier = (o.world?.pier.lamps ?? []).map((p) => { const l = new THREE.PointLight(LAMP, 0, 18, 2); l.position.copy(p); return l; });
  const lights = [head, ...lamps, lantern, ...pier];
  for (const l of lights) { l.visible = false; l.castShadow = false; scene.add(l); }
  scene.add(head.target);

  function batchSibling(mesh, toonMat) {
    const map = toonMat.uniforms.uMap.value ?? null, card = !!mesh.userData.alphaCard;
    const key = (map ? map.uuid : 'plain') + (card ? '+card' : '');
    let p = batchCache.get(key);
    if (!p) {
      p = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, map, alphaTest: card ? 0.42 : 0, side: card ? THREE.DoubleSide : THREE.FrontSide, roughness: 0.8, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(1, 1, 1) });
      p.defines = { USE_FOG_SUN: '', USE_PBR_BATCH: '' };
      p.onBeforeCompile = (shader) => patchBatch(shader, uni);
      p.customProgramCacheKey = () => 'pelican-batch' + (card ? '-card' : '');
      p.userData.batch = true;
      p.name = 'pbr-batch';
      batchCache.set(key, p);
      const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: card ? map : null, alphaTest: card ? 0.42 : 0 });   // 卡片的阴影也要裁形
      depth.onBeforeCompile = (shader) => patchSwayDepth(shader, uni);
      depth.customProgramCacheKey = () => 'pelican-sway-depth';
      p.userData.depth = depth;
    }
    mesh.customDepthMaterial = p.userData.depth;
    return p;
  }
  function siblingFor(m, mesh) {
    if (m.userData.pbrSibling !== undefined) return m.userData.pbrSibling;
    let s = null;
    if (m.userData.pbrOverride) s = m.userData.pbrOverride;
    else {
      const src = m.userData.src ?? {}, cls = classFor(src.color, src);
      if (cls) {
        const u = m.uniforms;
        s = new THREE.MeshPhysicalMaterial({
          color: 0xffffff, vertexColors: m.vertexColors, map: u.uMap.value ?? null, side: m.side, transparent: m.transparent, opacity: 1, depthWrite: m.depthWrite,
          roughness: cls.rough, metalness: cls.metal, clearcoat: cls.clearcoat, clearcoatRoughness: 0.07,
          sheen: cls.sheen, sheenRoughness: 0.55, sheenColor: new THREE.Color(1, 1, 1),
          normalMap: cls.normal === 'feather' ? tex.featherN : null, normalScale: new THREE.Vector2(0.9, 0.9),
          normalMapType: THREE.TangentSpaceNormalMap,
          emissive: new THREE.Color(0xffffff), emissiveIntensity: 0, fog: true,
        });
        if (cls.normal === 'feather') s.normalMap.repeat.set(3, 2);
        s.defines = { USE_FOG_SUN: '' };
        s.onBeforeCompile = (shader) => patchStandard(shader, uni);
        s.customProgramCacheKey = () => 'pelican-std';
        s.name = 'pbr-std:' + cls.name;
        s.userData.toonSrc = m; s.userData.cls = cls;
        live.add(s);
        s.addEventListener('dispose', () => live.delete(s));        // 造型工坊重建鹈鹕时替身会被释放，别一直攥着
      }
    }
    m.userData.pbrSibling = s;
    return s;
  }

  const realPal = {}, lookOut = {};
  const api = {
    real: false, look: null, renderer, postHide: [], K: { tex, uni, sky, fog, live }, onLook, onStyle, lights: { head, lamps, lantern, pier },
    /** 换装：遍历场景，赛璐璐材质 ↔ PBR 对应物；描边、只在某一种画风下出现的对象各归各位。
     *  网格第一次遇到时把它的赛璐璐材质记在 userData.toonMat 上 —— 写实画风下网格上挂的是 PBR 材质，
     *  再按“当前材质是不是赛璐璐”去找就会整批漏掉，切不回来。 */
    adopt(root) {
      root.traverse((obj) => {
        if (obj.userData.isOutline) { obj.visible = !api.real; return; }
        if (obj.userData.realOnly) obj.visible = api.real;             // 只在某一种画风下出现的对象：可见性定了，材质照换
        else if (obj.userData.toonOnly) obj.visible = !api.real;
        const m = obj.userData.toonMat || (obj.isMesh && obj.material?.userData?.isToon ? obj.material : null);
        if (!m) return;
        obj.userData.toonMat = m;
        const s = obj.geometry.getAttribute('aMat') ? batchSibling(obj, m) : siblingFor(m, obj);
        obj.material = api.real && s ? s : m;
        if (api.real && !s) { obj.userData.hiddenByReal = true; obj.visible = false; }
        else if (obj.userData.hiddenByReal) { obj.userData.hiddenByReal = false; obj.visible = true; }
      });
      api.syncColors();
    },
    set(real) {
      api.real = !!real;
      U.uMode.value = api.real ? 1 : 0;
      api.adopt(scene);
      renderer.toneMapping = api.real ? THREE.AgXToneMapping : THREE.NoToneMapping;
      renderer.outputColorSpace = api.real ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
      scene.fog = api.real ? fog : null;
      scene.environment = api.real ? sky.envMap : null;
      for (const l of lights) l.visible = api.real;
      for (const f of onStyle) f(api.real);
    },
    /** 把赛璐璐 uniform 里的当前值（固有色、自发光）抄到 PBR 材质上 */
    syncColors() {
      for (const s of live) {
        const u = s.userData.toonSrc.uniforms;
        s.color.copy(u.uColor.value).multiply(_tint.setRGB(...s.userData.cls.tint));
        s.emissive.copy(u.uEmissive.value);
        s.emissiveIntensity = u.uEmissiveLevel.value * s.userData.cls.emissive;
        s.opacity = u.uOpacity.value;
        if (s.sheen > 0) s.sheenColor.copy(s.color).lerp(WHITE, 0.6);
      }
    },
    /** 按时刻应用写实光照：天空烘焙 + IBL、太阳 / 月光、雾、曝光。focus = 阴影盒中心 */
    applyLook(pal, focus) {
      const rp = sampleReal(pal.hour, realPal), moon = o.world ? o.world.sky.uniforms.uMoonDir.value : _dir.set(0, 1, 0);
      const look = computeSkyLook(sky.lut, rp, pal.sunAz, [moon.x, moon.y, moon.z], lookOut);
      look.exposure = rp.exposure; look.cloud = rp.cloud; look.mist = rp.mist; look.turbidity = rp.turbidity;
      api.look = look;
      if (!api.real) return look;
      const baked = sky.update(look.sunDir, rp.turbidity, look.night);
      if (baked.changed || !scene.environment) scene.environment = baked.envMap;
      const useMoon = look.isMoon, dir = useMoon ? look.moonDir : look.sunDir, sun = stage.sun;
      sun.color.setRGB(...(useMoon ? MOON_COLOR : look.sunT));
      sun.intensity = useMoon ? look.moonE : look.sunE;
      sun.position.set(focus.x + dir[0] * 90, focus.y + dir[1] * 90, focus.z + dir[2] * 90);
      sun.target.position.copy(focus); sun.target.updateMatrixWorld();
      sun.castShadow = stage.shadowEnabled && sun.intensity > 0.02;
      uni.uSunRadiance.value.setRGB(...look.sunT).multiplyScalar(look.sunE);
      uni.uSunDirW.value.set(look.sunDir[0], look.sunDir[1], look.sunDir[2]);
      fog.color.setRGB(...look.fog); fog.density = rp.fog;
      uni.uFogSunColor.value.setRGB(...look.fogSun);
      uni.uFogSunDir.value.set(Math.sin(pal.sunAz * DEG), 0, Math.cos(pal.sunAz * DEG));
      uni.uFogMist.value = rp.mist;
      renderer.toneMappingExposure = rp.exposure;
      U.uBeamK.value = 1.6 / rp.exposure;
      for (const f of onLook) f(look);
      return look;
    },
    /** 每帧：局部灯光跟随主体。ctx = { lampLevel, head: { on, pos, dir, level }, world } */
    update(ctx) {
      if (!api.real) return;
      const lamp = ctx.lampLevel ?? 0, low = (ctx.quality ?? 2) === 0;
      uni.uLampEmissive.value = lamp * 6;
      const h = ctx.head;
      head.intensity = h && h.on ? 30 * h.level : 0;
      if (h) { head.position.copy(h.pos); head.target.position.copy(h.pos).addScaledVector(h.dir, 6); head.target.updateMatrixWorld(); }
      const lo = ctx.world?.lightsOut;
      for (let i = 0; i < 2; i++) { const sl = lo?.[1 + i]; if (!sl) break; lamps[i].position.copy(sl.pos); lamps[i].intensity = sl.range > 0 ? 9 * lamp : 0; }
      if (lo) lantern.position.copy(lo[0].pos);
      lantern.intensity = low ? 0 : lamp * 150;
      for (const l of pier) l.intensity = low ? 0 : lamp * 5;
      api.syncColors();
    },
  };
  return api;
}
