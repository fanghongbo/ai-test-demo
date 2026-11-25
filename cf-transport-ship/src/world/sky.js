// 天空：烘焙的物理天空（gfx/skyenv.js）+ 太阳盘 + 月亮 + 星星 + 程序云层。永远贴在最远处，跟着镜头走。
import * as THREE from 'three';
import { EQUIRECT_GLSL } from '../gfx/skyenv.js';
import { SUN_E } from '../core/palette.js';

const VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 mv = modelViewMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w * 0.999999;
}
`;

const FRAG = /* glsl */`
uniform vec3 uSunDir, uMoonDir, uSunColL, uSkyIrr, uMoonLight;
uniform float uNight, uCloud, uTime;
uniform sampler2D uSkyTex, uNoiseTex;
varying vec3 vDir;
${ EQUIRECT_GLSL }
float hash3( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float fbm4( vec2 p ) { vec4 n = texture2D( uNoiseTex, p ); return n.r * 0.46 + n.g * 0.27 + n.b * 0.17 + n.a * 0.10; }   // 一次取样 = 四个八度
void main() {
  vec3 d = normalize( vDir );
  vec3 col = texture2D( uSkyTex, equirectUv2( d ) ).rgb;
  float sd = dot( d, uSunDir ), md = dot( d, uMoonDir );
  vec3 sunCol = uSunColL * smoothstep( - 0.010, 0.004, uSunDir.y );
  // 太阳盘（半径 0.265°）：亮度封顶，晕圈交给泛光。贴近地平线时被海平线切掉
  col = mix( col, sunCol * 60.0, smoothstep( 0.9999863, 0.9999905, sd ) * step( - 0.0025, d.y ) );
  col += sunCol * ( pow( max( sd, 0.0 ), 900.0 ) * 1.4 + pow( max( sd, 0.0 ), 48.0 ) * 0.09 + pow( max( sd, 0.0 ), 6.0 ) * 0.015 );
  if ( uNight > 0.001 ) {
    float mare = texture2D( uNoiseTex, d.xy * 9.0 + d.z * 3.0 ).g;                // 月海斑块
    col = mix( col, vec3( 0.96, 0.95, 0.9 ) * ( 1.0 - 0.22 * smoothstep( 0.45, 0.7, mare ) ) * 2.2, smoothstep( 0.9999863, 0.9999905, md ) * uNight );
    col += ( vec3( 0.5, 0.62, 1.0 ) * pow( max( md, 0.0 ), 160.0 ) * 0.10 + vec3( 0.3, 0.4, 0.7 ) * pow( max( md, 0.0 ), 12.0 ) * 0.02 ) * uNight;
    if ( d.y > - 0.02 ) {                                                           // 星星：方向空间格点，每格至多一颗
      vec3 cell = floor( d * 420.0 );
      float h = hash3( cell );
      float star = smoothstep( 0.30, 0.06, length( fract( d * 420.0 ) - 0.5 ) ) * step( 0.992, h );
      float tw = 0.65 + 0.35 * sin( uTime * ( 1.2 + h * 7.0 ) + h * 90.0 );
      col += vec3( 0.85, 0.9, 1.0 ) * star * tw * uNight * smoothstep( - 0.02, 0.2, d.y ) * ( 0.15 + 0.85 * pow( hash3( cell + 7.0 ), 6.0 ) ) * 0.5;
    }
  }
  if ( d.y > 0.003 ) {                                                             // 云层：单位球方向投到一张平面上
    vec2 cp = d.xz / d.y;
    vec2 p = cp * 0.3 + vec2( uTime * 0.004, uTime * 0.0017 );
    float base = fbm4( p ) * 0.62 + fbm4( p * 0.41 + 0.37 ) * 0.24 + fbm4( p * 2.3 + 0.71 ) * 0.14;
    float cov = 0.80 - 0.56 * uCloud;
    float dens = smoothstep( cov, cov + 0.24, base );
    if ( dens > 0.002 ) {
      vec2 sp = normalize( uSunDir.xz + vec2( 1e-4, 0.0 ) );
      float tw = fbm4( p + sp * 0.05 ), tw2 = fbm4( p + sp * 0.13 );
      float light = exp( - 2.6 * tw ) * 0.6 + exp( - 1.2 * tw2 ) * 0.4;           // 朝阳一侧薄，透光
      vec3 key = uSunColL * ${ SUN_E.toFixed( 1 ) } * smoothstep( - 0.02, 0.03, uSunDir.y ) + uMoonLight;
      vec3 lit = uSkyIrr * 2.3 + key * ( 0.34 * light + 0.5 * light * light * pow( max( sd, 0.0 ) * 0.5 + 0.5, 6.0 ) );   // 向阳处亮白，背光处是偏灰蓝的云底
      float edge = 1.0 - smoothstep( 0.0, 0.5, dens );
      vec3 cc = mix( uSkyIrr * 0.95 + key * 0.03, lit, 0.3 + 0.7 * light ) + lit * edge * 0.35;
      cc = mix( cc, col, 1.0 - exp( - length( cp ) * 0.065 ) );                    // 远处融进雾霭
      col = mix( col, cc, dens * smoothstep( 0.002, 0.03, d.y ) * 0.96 );
    }
  }
  gl_FragColor = vec4( col, 1.0 );
}
`;

const R = 8000;
export function createSky() {
  const uniforms = {
    uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunColL: { value: new THREE.Color(1, 1, 1) }, uSkyIrr: { value: new THREE.Color() }, uMoonLight: { value: new THREE.Color() },
    uNight: { value: 0 }, uCloud: { value: 0.4 }, uTime: { value: 0 },
    uSkyTex: { value: null }, uNoiseTex: { value: null },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, side: THREE.BackSide, depthWrite: false, depthTest: true, fog: false });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 24), mat);
  dome.name = 'sky'; dome.renderOrder = -1000; dome.frustumCulled = false;
  dome.matrixAutoUpdate = false;
  return {
    dome, uniforms,
    /** 接上烘焙图与噪声贴图 */
    bind(skyTex, noiseTex) { uniforms.uSkyTex.value = skyTex; uniforms.uNoiseTex.value = noiseTex; },
    /** 每当时刻变化：直射光颜色、天光平均亮度、月光 */
    setLook(look, moonDir, moonColor) {
      uniforms.uSunDir.value.set(look.sunDir[0], look.sunDir[1], look.sunDir[2]);
      uniforms.uMoonDir.value.set(moonDir[0], moonDir[1], moonDir[2]);
      uniforms.uSunColL.value.setRGB(look.sunT[0], look.sunT[1], look.sunT[2]);
      uniforms.uSkyIrr.value.setRGB(look.irr[0] / Math.PI, look.irr[1] / Math.PI, look.irr[2] / Math.PI);
      uniforms.uMoonLight.value.setRGB(moonColor[0], moonColor[1], moonColor[2]).multiplyScalar(look.moonE);
      uniforms.uNight.value = look.night; uniforms.uCloud.value = look.cloud;
    },
    update(time, camPos) { uniforms.uTime.value = time; dome.position.set(camPos.x, 0, camPos.z); dome.updateMatrix(); },
  };
}
