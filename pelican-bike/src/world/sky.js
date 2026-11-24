// 天空：赛璐璐 = 渐变穹顶（太阳 / 月亮 / 星星 / 黄昏暖带）+ 几何卡通云 + 远岛剪影，颜色全部来自时刻调色盘；
// 写实 = 烘焙的物理天空（gfx/skyenv.js）+ 程序云层 + 太阳盘 + 星月，由 style kit 在应用时刻时写入。
import * as THREE from 'three';
import { toonMaterial } from '../gfx/toon.js';
import { mulberry32 } from '../core/mathx.js';
import { EQUIRECT_GLSL } from '../gfx/skyenv.js';
import { SUN_E } from '../core/palette_real.js';

const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w * 0.999999;   // 永远贴在最远处：没被别的东西遮住的地方才看得到
}
`;

const SKY_FRAG = /* glsl */`
uniform vec3 uTop, uHor, uSunDir, uSunCol, uGlow, uMoonDir;
uniform float uSunDisc, uMoon, uStars, uDusk, uTime, uStyle;
uniform vec3 uPaper;
// —— 写实 ——
uniform float uMode, uNight, uCloud;
uniform sampler2D uSkyTex, uNoiseTex;
uniform vec3 uSunColL, uSkyIrr, uMoonLight;
varying vec3 vDir;
${ EQUIRECT_GLSL }
float hash3( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float fbm4( vec2 p ) { vec4 n = texture2D( uNoiseTex, p ); return n.r * 0.46 + n.g * 0.27 + n.b * 0.17 + n.a * 0.10; }   // 一次取样 = 四个八度
// 写实天空：底色查烘焙图（大气散射 + 夜空底光），再叠上太阳盘、月亮、星星、云层。
vec3 realSky( vec3 d ) {
  vec3 col = texture2D( uSkyTex, equirectUv2( d ) ).rgb;
  float sd = dot( d, uSunDir ), md = dot( d, uMoonDir );
  vec3 sunCol = uSunColL * smoothstep( - 0.010, 0.004, uSunDir.y ) * uSunDisc;
  // 太阳盘（半径 0.265°）：亮度封顶，晕圈交给泛光。贴近地平线时被海平线切掉
  col = mix( col, sunCol * 60.0, smoothstep( 0.9999863, 0.9999905, sd ) * step( - 0.0025, d.y ) );
  col += sunCol * ( pow( max( sd, 0.0 ), 900.0 ) * 1.4 + pow( max( sd, 0.0 ), 48.0 ) * 0.09 + pow( max( sd, 0.0 ), 6.0 ) * 0.015 );
  float moonVis = uMoon * uNight;
  if ( moonVis > 0.001 ) {
    float mare = texture2D( uNoiseTex, d.xy * 9.0 + d.z * 3.0 ).g;                // 月海斑块
    col = mix( col, vec3( 0.96, 0.95, 0.9 ) * ( 1.0 - 0.22 * smoothstep( 0.45, 0.7, mare ) ) * 2.2, smoothstep( 0.9999863, 0.9999905, md ) * moonVis );
    col += ( vec3( 0.5, 0.62, 1.0 ) * pow( max( md, 0.0 ), 160.0 ) * 0.10 + vec3( 0.3, 0.4, 0.7 ) * pow( max( md, 0.0 ), 12.0 ) * 0.02 ) * moonVis;
  }
  if ( uStars > 0.001 && d.y > - 0.02 ) {                                           // 星星：方向空间格点，每格至多一颗
    vec3 cell = floor( d * 420.0 );
    float h = hash3( cell );
    float star = smoothstep( 0.30, 0.06, length( fract( d * 420.0 ) - 0.5 ) ) * step( 0.992, h );
    float tw = 0.65 + 0.35 * sin( uTime * ( 1.2 + h * 7.0 ) + h * 90.0 );
    col += vec3( 0.85, 0.9, 1.0 ) * star * tw * uStars * smoothstep( - 0.02, 0.2, d.y ) * ( 0.15 + 0.85 * pow( hash3( cell + 7.0 ), 6.0 ) ) * 0.5;
  }
  if ( d.y > 0.003 ) {                                                             // 云层：单位球方向投到一张平面上
    vec2 cp = d.xz / d.y;
    vec2 p = cp * 0.3 + vec2( uTime * 0.004, uTime * 0.0017 );
    float base = fbm4( p ) * 0.62 + fbm4( p * 0.41 + 0.37 ) * 0.24 + fbm4( p * 2.3 + 0.71 ) * 0.14;
    float cov = 0.74 - 0.62 * uCloud;
    float dens = smoothstep( cov, cov + 0.24, base );
    if ( dens > 0.002 ) {
      vec2 sp = normalize( uSunDir.xz + vec2( 1e-4, 0.0 ) );
      float tw = fbm4( p + sp * 0.05 ), tw2 = fbm4( p + sp * 0.13 );
      float light = exp( - 2.6 * tw ) * 0.6 + exp( - 1.2 * tw2 ) * 0.4;           // 朝阳一侧薄，透光
      vec3 key = uSunColL * ${ SUN_E.toFixed( 1 ) } * smoothstep( - 0.02, 0.03, uSunDir.y ) + uMoonLight;
      vec3 lit = uSkyIrr * 1.15 + key * ( 0.12 * light + 0.3 * light * light * pow( max( sd, 0.0 ) * 0.5 + 0.5, 6.0 ) );
      float edge = 1.0 - smoothstep( 0.0, 0.5, dens );
      vec3 cc = mix( uSkyIrr * 0.46 + key * 0.012, lit, 0.25 + 0.75 * light ) + lit * edge * 0.3;
      cc = mix( cc, col, 1.0 - exp( - length( cp ) * 0.065 ) );                    // 远处融进雾霭
      col = mix( col, cc, dens * smoothstep( 0.002, 0.03, d.y ) * 0.96 );
    }
  }
  return col;
}
float hash2( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
void main() {
  vec3 d = normalize( vDir );
  if ( uMode > 0.5 ) { gl_FragColor = vec4( realSky( d ), 1.0 ); return; }
  float y = d.y;
  float t = pow( clamp( y, 0.0, 1.0 ), 0.55 );
  vec3 col = mix( uHor, uTop, t );
  col = mix( uHor * 0.97, col, smoothstep( -0.06, 0.02, y ) );                 // 地平线以下压暗一点，海面雾色与之衔接
  // 黄昏 / 清晨暖带：只出现在太阳方位附近
  vec2 sxz = normalize( uSunDir.xz + vec2( 1e-5 ) );
  float az = dot( normalize( d.xz + vec2( 1e-5 ) ), sxz ) * 0.5 + 0.5;
  float band = exp( - abs( y ) * 7.5 ) * pow( az, 2.6 ) * uDusk;
  col = mix( col, uGlow, band * 0.72 );
  // 太阳
  float sd = dot( d, uSunDir );
  col += uGlow * pow( max( sd, 0.0 ), 48.0 ) * 0.32 * uSunDisc;
  col = mix( col, uSunCol, smoothstep( 0.99974, 0.99988, sd ) * uSunDisc );
  // 月亮（带一点月面斑块）
  float md = dot( d, uMoonDir );
  float crater = smoothstep( 0.99980, 0.99990, dot( d, normalize( uMoonDir + vec3( 0.007, -0.003, 0.002 ) ) ) )
               + smoothstep( 0.99986, 0.99993, dot( d, normalize( uMoonDir + vec3( -0.004, 0.005, -0.001 ) ) ) );
  col = mix( col, vec3( 0.97, 0.95, 0.86 ) * ( 1.0 - 0.16 * clamp( crater, 0.0, 1.0 ) ), smoothstep( 0.99966, 0.99980, md ) * uMoon );
  col += vec3( 0.55, 0.62, 0.95 ) * pow( max( md, 0.0 ), 36.0 ) * 0.22 * uMoon;
  // 星星：方向空间里的格点，每格至多一颗，缓慢闪烁
  if ( uStars > 0.001 && y > -0.02 ) {
    vec3 cell = floor( d * 240.0 );
    float h = hash3( cell );
    float r = length( fract( d * 240.0 ) - 0.5 );
    float star = smoothstep( 0.16, 0.05, r ) * step( 0.9955, h );
    float tw = 0.6 + 0.4 * sin( uTime * ( 1.2 + h * 7.0 ) + h * 90.0 );
    col += vec3( 0.92, 0.94, 1.0 ) * star * tw * uStars * smoothstep( -0.02, 0.22, y ) * ( 0.5 + 0.5 * hash3( cell + 7.0 ) );
  }
  // 画风：排线 = 淡彩（颜色向纸色靠拢）；线稿 = 天空留白，太阳只剩一个墨圈
  if ( uStyle > 1.5 ) {
    float ring = smoothstep( 0.99970, 0.99975, sd ) - smoothstep( 0.99990, 0.99994, sd );
    col = mix( uPaper, vec3( 0.16, 0.15, 0.26 ), ring * uSunDisc );
  } else if ( uStyle > 0.5 ) col = mix( col, uPaper, 0.42 );
  col += ( hash2( gl_FragCoord.xy ) - 0.5 ) / 255.0;                           // 抖动：消除 8 位渐变色带
  gl_FragColor = vec4( col, 1.0 );
}
`;

export function createSky(U) {
  const uniforms = {
    uTop: { value: new THREE.Color(0.2, 0.55, 0.92) }, uHor: { value: new THREE.Color(0.78, 0.9, 0.97) },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color(1, 1, 1) }, uGlow: { value: new THREE.Color(1, 1, 1) },
    uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunDisc: { value: 1 }, uMoon: { value: 0 }, uStars: { value: 0 }, uDusk: { value: 0 }, uTime: { value: 0 },
    uStyle: U.uStyle, uPaper: U.uPaper,
    // 写实
    uMode: U.uMode, uNight: { value: 0 }, uCloud: { value: 0.4 }, uSkyTex: { value: null }, uNoiseTex: { value: null },
    uSunColL: { value: new THREE.Color(1, 1, 1) }, uSkyIrr: { value: new THREE.Color() }, uMoonLight: { value: new THREE.Color() },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), mat);
  dome.scale.setScalar(250);                                        // 够大：平面反射的镜像相机也在里面
  dome.name = 'sky'; dome.renderOrder = -1000; dome.frustumCulled = false;

  /** @param {object} p 调色盘  @param {THREE.Vector3} sunDir 指向太阳 */
  function applyPalette(p, sunDir) {
    uniforms.uTop.value.setRGB(...p.skyTop);
    uniforms.uHor.value.setRGB(...p.skyHorizon);
    uniforms.uSunDir.value.copy(sunDir);
    const sc = uniforms.uSunCol.value.setRGB(...p.sunColor);
    sc.r = Math.min(1, Math.max(0.75, sc.r * 1.3)); sc.g = Math.min(1, Math.max(0.75, sc.g * 1.3)); sc.b = Math.min(1, Math.max(0.75, sc.b * 1.3));
    uniforms.uGlow.value.setRGB(...p.sunGlow);
    uniforms.uSunDisc.value = p.sunDisc;
    uniforms.uMoon.value = p.moon;
    uniforms.uStars.value = p.stars;
    const dusk = Math.max(0, 1 - Math.abs(p.sunEl - 4) / 16) * (p.hour > 10 && p.hour < 20 ? 0.85 : 1.0);
    uniforms.uDusk.value = Math.min(1, dusk);
    // 月亮挂在太阳的大致对面
    uniforms.uMoonDir.value.set(-sunDir.x * 0.6, 0.62, -sunDir.z * 0.6).normalize();
  }
  const api = {
    dome, uniforms, applyPalette,
    /** 接上写实渲染层：烘焙图与噪声贴图 */
    enableReal(K) { uniforms.uSkyTex.value = K.sky.texture; uniforms.uNoiseTex.value = K.tex.noise; },
    /** 写实：直射光颜色、天光平均亮度、月光（每当时刻变化） */
    applyReal(look, moonColor) {
      uniforms.uSunColL.value.setRGB(...look.sunT);
      uniforms.uSkyIrr.value.setRGB(look.irr[0] / Math.PI, look.irr[1] / Math.PI, look.irr[2] / Math.PI);
      uniforms.uMoonLight.value.setRGB(...moonColor).multiplyScalar(look.moonE);
      uniforms.uNight.value = look.night; uniforms.uCloud.value = look.cloud;
    },
    update(time, camera) { uniforms.uTime.value = time; dome.position.copy(camera.position); },
  };
  return api;
}

/** 合并一组同构几何体 */
function mergeAll(geos) {
  let total = 0, tidx = 0;
  for (const g of geos) { total += g.attributes.position.count; tidx += g.index.count; }
  const pos = new Float32Array(total * 3), nrm = new Float32Array(total * 3), idx = new Uint32Array(tidx);
  let vo = 0, io = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, vo * 3); nrm.set(g.attributes.normal.array, vo * 3);
    for (let k = 0; k < g.index.count; k++) idx[io + k] = g.index.array[k] + vo;
    vo += g.attributes.position.count; io += g.index.count; g.dispose();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeBoundingSphere();
  return g;
}
const lump = (r, sx, sy, sz, x, y, z) => { const g = new THREE.SphereGeometry(r, 14, 9); g.scale(sx, sy, sz); g.translate(x, y, z); return g; };

/** 几何卡通云：若干压扁的椭球拼成一朵，缓慢漂移，受雾影响自然融入天际 */
export function createClouds(U, count = 10, seed = 3) {
  const rng = mulberry32(seed);
  const group = new THREE.Group(); group.name = 'clouds';
  const mats = [toonMaterial(U, 0xffffff, { rim: 0 }), toonMaterial(U, 0xffffff, { rim: 0 }), toonMaterial(U, 0xffffff, { rim: 0 })];
  const clouds = [];
  for (let i = 0; i < count; i++) {
    const n = 5 + Math.floor(rng() * 4), w = 14 + rng() * 20, parts = [];
    for (let k = 0; k < n; k++) {
      const t = n > 1 ? (k / (n - 1) - 0.5) * 2 : 0;
      const r = (0.5 + 0.5 * Math.cos(t * 1.4)) * w * (0.30 + rng() * 0.12);
      parts.push(lump(r, 1.25, 0.72 + rng() * 0.2, 1.0, t * w * 0.62, r * 0.18 + rng() * 2.0, (rng() - 0.5) * w * 0.32));
    }
    const m = new THREE.Mesh(mergeAll(parts), mats[i % 3]);
    m.castShadow = false; m.receiveShadow = false;
    const ang = rng() * Math.PI * 2, dist = 180 + rng() * 520;
    m.position.set(Math.cos(ang) * dist, 120 + rng() * 150, Math.sin(ang) * dist * 0.8);
    m.rotation.y = rng() * Math.PI * 2;
    const s = 0.8 + rng() * 1.1; m.scale.set(s, s, s);
    group.add(m);
    clouds.push({ node: m, speed: 0.8 + rng() * 1.2 });
  }
  return {
    group,
    applyPalette(p) { mats[0].uniforms.uColor.value.setRGB(...p.cloud).convertSRGBToLinear(); mats[1].uniforms.uColor.value.setRGB(...p.cloud).convertSRGBToLinear().multiplyScalar(0.93); mats[2].uniforms.uColor.value.setRGB(...p.cloudShade).convertSRGBToLinear(); },
    update(dt) { for (const c of clouds) { c.node.position.x += c.speed * dt; if (c.node.position.x > 900) c.node.position.x = -900; } },
  };
}

/** 远岛剪影：压扁的大椭球，半沉在海里，靠雾色退成淡淡的一层 */
export function createFarIslands(U) {
  // 每座岛 = 若干个 [dx, dz, rx, ry, rz] 的山体，整组平移并旋转
  const ISLANDS = [
    { x: -520, z: -260, rot: 0.5, hills: [[0, 0, 130, 46, 70], [60, 30, 70, 30, 48], [-80, -20, 48, 26, 40]] },
    { x: 430, z: 390, rot: -0.4, hills: [[0, 0, 170, 64, 80], [110, -30, 90, 36, 60]] },
    { x: 60, z: 600, rot: 0.1, hills: [[0, 0, 120, 30, 70]] },
  ];
  const geos = [];
  for (const isl of ISLANDS) {
    for (const [dx, dz, rx, ry, rz] of isl.hills) {
      const g = lump(1, rx, ry, rz, dx, -ry * 0.45, dz);     // 45% 沉在水下
      g.rotateY(isl.rot); g.translate(isl.x, 0, isl.z);
      geos.push(g);
    }
  }
  const mat = toonMaterial(U, 0x6f93a0, { rim: 0, pbr: 'far' });
  const mesh = new THREE.Mesh(mergeAll(geos), mat); mesh.name = 'farIslands'; mesh.castShadow = false; mesh.receiveShadow = false;
  const c = new THREE.Color();
  return { mesh, applyPalette(p) { mat.uniforms.uColor.value.setRGB(...p.seaShallow).convertSRGBToLinear().lerp(c.setRGB(...p.ink).convertSRGBToLinear(), 0.4); } };
}
