// 悬在水里的东西：海洋雪（碎屑、浮游生物的絮）和气泡。
// 海洋雪亮不亮，看它在不在这束光里：每个粒子查一次阴影贴图——被城堡、桥、巨藻挡住的那段水里，雪是暗的；光束里的雪发亮。
// 雪的粒子相对镜头装在一个盒子里，盒子的位置是取过模的，所以镜头移动时粒子在世界里的位置不变，出了盒子才从另一头回来。
// 气泡是算出来的：几处海底的冒泡口不停地放，游泳的人隔几秒吐一口；升到水面就没了。
import * as THREE from 'three';
import { WL_FRAG_PARS, WL_VERT_PARS } from '../gfx/waterlight.js';
import { mulberry32 } from '../core/mathx.js';

/** 查阴影贴图：这个点在不在光里 */
const SUN_AT = /* glsl */`
uniform sampler2D tShadow;
uniform mat4 uShadowMat;
uniform vec4 uShadow;
float sunAt( vec3 wp ) {
  vec4 sp = uShadowMat * vec4( wp, 1.0 );
  if ( sp.x < 0.0 || sp.x > 1.0 || sp.y < 0.0 || sp.y > 1.0 || sp.z > 1.0 ) return 1.0;
  vec2 texel = vec2( uShadow.y / uShadow.x );
  float s = step( sp.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sp.xy ) ) ) + step( sp.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sp.xy + texel * vec2( 0.71, -0.71 ) ) ) )
          + step( sp.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sp.xy + texel * vec2( -0.71, -0.71 ) ) ) ) + step( sp.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sp.xy + texel * vec2( 0.0, 1.0 ) ) ) );
  return s * 0.25;
}
`;

const SNOW_VERT = /* glsl */`
${WL_VERT_PARS}
#include <packing>
${SUN_AT}
uniform vec3 uCenter, uDrift, uWSunDir, uWKdSun;
uniform float uTime, uSize, uProj, uRange, uWSurfY;
attribute vec4 aSeed;                                               // x 相位，y 下沉速度，z 大小（米），w 横向漂的速度
varying float vAlpha, vLit;
varying vec3 vTint;
void main() {
  vec3 half_ = vec3( uRange, uRange * 0.55, uRange );
  vec3 vel = vec3( uDrift.x * ( 0.4 + aSeed.w ), - aSeed.y, uDrift.z * ( 0.4 + aSeed.w ) );
  vec3 rel = mod( position + vel * uTime + sin( uTime * 0.5 + aSeed.x * 6.28 ) * 0.6 + half_ - uCenter, half_ * 2.0 ) - half_;
  vec3 wp = uCenter + rel;
  vWPos = wp;
  vec4 mv = viewMatrix * vec4( wp, 1.0 );
  float dist = - mv.z;
  gl_PointSize = clamp( uSize * aSeed.z * uProj / max( dist, 0.2 ), 0.75, 9.0 );
  vAlpha = smoothstep( 0.6, 3.0, dist ) * ( 0.5 + 0.5 * aSeed.x );
  float depth = max( 0.0, uWSurfY - wp.y );
  float path = depth / max( uWSunDir.y, 0.2 );
  vLit = sunAt( wp ) * exp( - ( uWKdSun.x + uWKdSun.y + uWKdSun.z ) * 0.333 * path );                      // 这束光走到这个深度还剩多少（取三个通道的平均）
  vTint = vec3( 0.75 + 0.25 * sin( aSeed.x * 40.0 ) );
  gl_Position = projectionMatrix * mv;
}
`;

const SNOW_FRAG = /* glsl */`
${WL_FRAG_PARS}
uniform float uSun, uAmb;
varying float vAlpha, vLit;
varying vec3 vTint;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = dot( q, q );
  if ( d > 1.0 ) discard;
  float a = ( 1.0 - d ) * vAlpha;
  vec3 col = ( uWSun * vLit * uSun + vec3( uAmb ) * ( 0.06 + 0.10 * vLit ) ) * vTint * a;
  wFog( col, 0.0 );
  gl_FragColor = vec4( col, 1.0 );
}
`;

const BUBBLE_FRAG = /* glsl */`
${WL_FRAG_PARS}
uniform float uSun;
varying float vLit, vAlpha;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float d = length( q );
  if ( d > 1.0 ) discard;
  float rim = smoothstep( 0.70, 0.96, d ) * ( 1.0 - smoothstep( 0.96, 1.0, d ) );                       // 薄薄的一圈边
  float glint = exp( - dot( q - vec2( -0.36, 0.42 ), q - vec2( -0.36, 0.42 ) ) * 16.0 );             // 左上角的一点反光
  float body = 0.05;
  vec3 col = ( uWSun * ( 0.25 + 0.9 * vLit ) * ( rim * 0.9 + glint * 1.3 + body ) + vec3( 0.012, 0.020, 0.028 ) ) * vAlpha;
  wFog( col, 0.0 );
  gl_FragColor = vec4( col, 1.0 );
}
`;

const BUBBLE_VERT = /* glsl */`
${WL_VERT_PARS}
#include <packing>
${SUN_AT}
uniform float uProj, uWSurfY;
uniform vec3 uWSunDir, uWKdSun;
attribute float aSize;
attribute vec3 aSeed;
varying float vLit, vAlpha;
void main() {
  vWPos = position;
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  float dist = - mv.z;
  gl_PointSize = clamp( aSize * uProj / max( dist, 0.2 ), 1.0, 26.0 );
  vAlpha = smoothstep( 0.3, 1.2, dist ) * aSeed.x * smoothstep( 0.0, 1.5, uWSurfY - position.y );
  float depth = max( 0.0, uWSurfY - position.y );
  vLit = sunAt( position ) * exp( - ( uWKdSun.x + uWKdSun.y + uWKdSun.z ) * 0.333 * depth / max( uWSunDir.y, 0.2 ) );
  gl_Position = projectionMatrix * mv;
}
`;

function pointsMaterial(vertexShader, fragmentShader, U) {
  return new THREE.ShaderMaterial({ uniforms: U, vertexShader, fragmentShader, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true });
}

/**
 * 海洋雪。
 * @param {object} W createWaterLight()：共享的 uniform（雾、太阳）
 * @param {{ count?: number, range?: number }} o  range：盒子的半宽（米）
 */
export function createSnow(W, shafts, o = {}) {
  const count = o.count ?? 9000, range = o.range ?? 46, r = mulberry32(77);
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(count * 3), seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    pos.set([(r() * 2 - 1) * range, (r() * 2 - 1) * range * 0.55, (r() * 2 - 1) * range], i * 3);
    seed.set([r(), 0.03 + r() * 0.12, 0.012 + Math.pow(r(), 3) * 0.07, r()], i * 4);                  // 多数很小，少数是大片的絮
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
  const U = { ...W.U, tShadow: shafts.U.tShadow, uShadowMat: shafts.U.uShadowMat, uShadow: shafts.U.uShadow,
    uCenter: { value: new THREE.Vector3() }, uDrift: { value: new THREE.Vector3(0.05, 0, 0.03) }, uTime: { value: 0 }, uSize: { value: 0.9 }, uProj: { value: 800 }, uRange: { value: range },
    uSun: { value: 0.075 }, uAmb: { value: 1 } };
  const points = new THREE.Points(geo, pointsMaterial(SNOW_VERT, SNOW_FRAG, U));
  points.frustumCulled = false; points.renderOrder = 8; points.name = 'snow';
  return {
    points, U,
    setSize(w, h, fov) { U.uProj.value = h / (2 * Math.tan((fov * Math.PI) / 360)); },
    update(t, camPos) { U.uTime.value = t; U.uCenter.value.copy(camPos); },
    setNight(night) { U.uSun.value = 0.075 * (1 - night * 0.7); },
    dispose() { geo.dispose(); points.material.dispose(); },
  };
}

/**
 * 气泡。vents：冒泡口 [{ p:[x,y,z], rate: 每秒几个, size: 米 }]
 */
export function createBubbles(W, shafts, vents, o = {}) {
  const max = o.max ?? 700, r = mulberry32(91), geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3), size = new Float32Array(max), seed = new Float32Array(max * 3), st = new Float32Array(max * 5);
  for (let i = 0; i < max; i++) { pos[i * 3 + 1] = 1e5; st[i * 5] = 0; }                                  // 没活的粒子扔到天边
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3).setUsage(THREE.DynamicDrawUsage));
  const U = { ...W.U, tShadow: shafts.U.tShadow, uShadowMat: shafts.U.uShadowMat, uShadow: shafts.U.uShadow, uProj: { value: 800 }, uSun: { value: 1 } };
  const points = new THREE.Points(geo, pointsMaterial(BUBBLE_VERT, BUBBLE_FRAG, U));
  points.frustumCulled = false; points.renderOrder = 9; points.name = 'bubbles';
  let cursor = 0, acc = vents.map(() => 0);
  const spawn = (x, y, z, s, speed) => {
    const i = cursor; cursor = (cursor + 1) % max;
    pos.set([x, y, z], i * 3); size[i] = s; seed.set([0.6 + r() * 0.4, r() * 6.28, speed], i * 3);
    st.set([1, speed, r() * 6.28, (r() - 0.5) * 0.5, (r() - 0.5) * 0.5], i * 5);                       // 活着、上升速度、相位、横向漂移
  };
  const api = {
    points, U,
    /** 吐一口气：从 p 往上冒 n 个 */
    exhale(p, n = 14, forward = null) { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = r() * 0.35; spawn(p[0] + (forward ? forward[0] * 0.6 : 0) + Math.cos(a) * d * 0.4, p[1] + 0.15, p[2] + (forward ? forward[2] * 0.6 : 0) + Math.sin(a) * d * 0.4, 0.02 + r() * 0.05, 0.5 + r() * 0.5); } },
    update(dt, t) {
      vents.forEach((v, k) => { acc[k] += v.rate * dt; while (acc[k] >= 1) { acc[k] -= 1; const a = r() * 6.28, d = r() * (v.spread ?? 0.5); spawn(v.p[0] + Math.cos(a) * d, v.p[1] + r() * 0.3, v.p[2] + Math.sin(a) * d, (v.size ?? 0.04) * (0.5 + r()), 0.35 + r() * 0.45); } });
      for (let i = 0; i < max; i++) {
        if (st[i * 5] === 0) continue;
        const sp = st[i * 5 + 1], ph = st[i * 5 + 2];
        const y0 = pos[i * 3 + 1];
        let y = y0 + sp * dt * (1.16 - y0 * 0.004);                                 // 越往上升越快（压力变小，气泡涨大一点）
        pos[i * 3] += (Math.sin(t * 5 + ph) * 0.28 + st[i * 5 + 3]) * dt;
        pos[i * 3 + 2] += (Math.cos(t * 4.3 + ph) * 0.28 + st[i * 5 + 4]) * dt;
        if (y > -0.25) { st[i * 5] = 0; y = 1e5; } else size[i] += dt * 0.006 * sp;                   // 到水面就破了
        pos[i * 3 + 1] = y;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aSize.needsUpdate = true; geo.attributes.aSeed.needsUpdate = true;
    },
    setSize(w, h, fov) { U.uProj.value = h / (2 * Math.tan((fov * Math.PI) / 360)); },
    dispose() { geo.dispose(); points.material.dispose(); },
  };
  return api;
}
