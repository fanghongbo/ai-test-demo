// 从水下看海面：斯涅尔窗 + 全反射镜面。
// 往上看，水面正上方是一个约 97° 的圆锥（斯涅尔窗），窗外整个天空被压在里面；圆锥之外是全反射——水面成了一面镜子，
// 映出下面的深水和靠近水面的东西。法线来自波谱（和焦散同一组波），窗里的天空取自烘焙好的物理天空，再按菲涅耳定律分配。
import * as THREE from 'three';
import { WAVE_GLSL } from '../core/waves.js';
import { WL_FRAG_PARS } from './waterlight.js';
import { EQUIRECT_GLSL } from './skyenv.js';

const N = 1.333;

const VERT = /* glsl */`
${WAVE_GLSL}
uniform float uSurfY;
varying vec3 vWPos;
void main() {
  vec3 wp = position;
  float h = 0.0;
  for ( int i = 0; i < WAVE_N; i ++ ) { vec4 w = WAVE_KA[ i ]; if ( WAVE_WL[ i ].y > 2.6 ) h += w.z * cos( dot( w.xy, wp.xz ) - WAVE_WL[ i ].x * uWTime + w.w ); }   // 只有长波顶点才分得清
  wp.y = uSurfY + h * uWSea;
  vWPos = ( modelMatrix * vec4( wp, 1.0 ) ).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( wp, 1.0 );
}
`;

const FRAG = /* glsl */`
${WL_FRAG_PARS}
${WAVE_GLSL}
uniform sampler2D tSky, tRefl, tRipple;
uniform mat4 uReflMat;
uniform float uHasRefl, uSunVis;
uniform vec3 uSunAir, uSunDisc;
${EQUIRECT_GLSL}
void main() {
  vec3 V = vWPos - cameraPosition;
  float t = length( V );
  V /= t;
  vec2 s;
  waveSlope( vWPos.xz, s );
  vec3 n1 = texture2D( tRipple, vWPos.xz * 0.061 + vec2( uWTime * 0.011, uWTime * 0.007 ) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( tRipple, vWPos.xz * 0.019 - vec2( uWTime * 0.005, uWTime * 0.009 ) ).xyz * 2.0 - 1.0;
  s += ( n1.xy * 0.085 + n2.xy * 0.14 ) * uWSea / ( 1.0 + t * 0.05 );                    // 细碎的涟漪，远处糊掉
  vec3 n = normalize( vec3( - s.x, 1.0, - s.y ) );
  float cosI = clamp( dot( - V, n ), 0.0, 1.0 );                                        // 入射角：视线和水面的法线
  float sinT = cosI * ${N.toFixed(3)};
  float cosT = sqrt( max( 0.0, 1.0 - sinT * sinT ) );                                    // 全反射时是 0
  float R = 0.02 + 0.98 * pow( 1.0 - cosT, 5.0 );
  vec3 T = refract( V, - n, ${N.toFixed(3)} );                                           // 折射到空气里的方向
  vec3 sky = texture2D( tSky, equirectUv2( T ) ).rgb;
  sky += uSunDisc * smoothstep( 0.99993, 0.999975, dot( T, uSunAir ) ) * uSunVis;        // 折射进来的太阳：被波面揉碎的一团亮斑
  vec3 trans = sky * ( 1.0 - R ) * ${ (N * N).toFixed(3) };                              // 光进水里辐射亮度乘 n²（窗口变小了，单位立体角的能量变大）
  vec3 r = reflect( V, n );
  vec3 refl = wWaterColor( r );
  vec4 rp = uReflMat * vec4( vWPos, 1.0 );
  vec2 ruv = rp.xy / rp.w;
  if ( uHasRefl > 0.5 && rp.w > 0.0 && all( greaterThan( ruv, vec2( 0.03 ) ) ) && all( lessThan( ruv, vec2( 0.97 ) ) ) ) {
    // 倒影那张图是按“水面 → 物体”和“镜头 → 水面”加起来的整条路算的雾；这里把最后一程的雾退掉，最后统一再算一次。
    // 透过率很小（水面离得远）时不能真的去除它：那样会把噪声放大几十倍，所以带一个软权重，远到看不见倒影时就当 0。
    // 取倒影时按波面的坡度挪一下，再糊一下：平静的水面从下面看是一面镜子，有浪的话倒影是被揉碎、晃动的
    vec2 ruv2 = ruv + s * 0.55;
    vec2 tx = vec2( 1.0 / 512.0 );
    vec3 rc = texture2D( tRefl, ruv2 ).rgb * 0.4 + ( texture2D( tRefl, ruv2 + tx * vec2( 1.3, 0.7 ) ).rgb + texture2D( tRefl, ruv2 - tx * vec2( 0.8, 1.4 ) ).rgb + texture2D( tRefl, ruv2 + tx * vec2( -0.9, 1.1 ) ).rgb ) * 0.2;
    vec3 trv = exp( - uWSigma * t );
    float w = smoothstep( 0.015, 0.09, min( trv.x, min( trv.y, trv.z ) ) );
    refl = ( rc - wIns( V, t ) ) / max( trv, vec3( 0.015 ) ) * w;
  }
  vec3 col = trans + refl * R;
  wFog( col, 1.0 );
  gl_FragColor = vec4( col, 1.0 );
}
`;

/** 中间密、四周疏的网格（跟着镜头走，覆盖到 4 公里外） */
function grid(n = 200) {
  const pos = new Float32Array((n + 1) * (n + 1) * 3), idx = [];
  const map = (u) => Math.sign(u) * (60 * Math.abs(u) + 4000 * Math.pow(Math.abs(u), 3.35));
  for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
    const k = (j * (n + 1) + i) * 3;
    pos[k] = map((i / n) * 2 - 1); pos[k + 1] = 0; pos[k + 2] = map((j / n) * 2 - 1);
  }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  return g;
}

/**
 * @param {object} W createWaterLight() 的返回值（取共享 uniform 和波）
 * @param {THREE.Texture} skyTex 烘焙好的天空（等距柱状 HDR）
 * @param {THREE.Texture} rippleTex 细涟漪的法线贴图
 */
export function createSurface(W, skyTex, rippleTex) {
  const U = {
    ...W.U, ...W.wave, uSurfY: { value: 0 }, tSky: { value: skyTex }, tRefl: { value: null }, tRipple: { value: rippleTex },
    uReflMat: { value: new THREE.Matrix4() }, uHasRefl: { value: 0 }, uSunVis: { value: 1 },
    uSunAir: { value: new THREE.Vector3(0, 1, 0) }, uSunDisc: { value: new THREE.Vector3(200, 190, 170) },
  };
  const mesh = new THREE.Mesh(grid(), new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide }));
  mesh.name = 'surface'; mesh.frustumCulled = false; mesh.renderOrder = 2;
  return {
    mesh, U,
    /** 每帧：贴着镜头的 xz 挪过去（波是世界坐标的，不会跟着滑） */
    follow(camera) { mesh.position.set(camera.position.x, 0, camera.position.z); mesh.updateMatrixWorld(); },
  };
}
