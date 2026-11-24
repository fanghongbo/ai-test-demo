// 大气散射的 GLSL 版本，与 core/skymodel.js 的 skyRadiance 逐式对应（有单元测试比对常数与取样公式）。
// 透射率来自 JS 暴力积分出的查找表 tSkyLut（不透明度以光程形式存储，与浑浊度无关）。
// 这里不定义 PI：着色器里统一用 SKY_PI，避免与 three 的 <common> 冲突。
import { SUN_E, MIE_G, MULTI_SCATTER } from '../core/palette_real.js';
const F = (x) => (typeof x === 'number' ? x.toFixed(3) : x);
export const SKY_PHYS_GLSL = /* glsl */`
const float SKY_R0 = 6360e3;
const float SKY_R1 = 6420e3;
const float SKY_HR = 8000.0;
const float SKY_HM = 1200.0;
const vec3 SKY_BR = vec3( 5.5e-6, 13.0e-6, 22.4e-6 );
const float SKY_BM = 21e-6;
const vec3 SKY_BO3 = vec3( 0.65e-6, 1.881e-6, 0.085e-6 );
const float SKY_PI = 3.14159265358979;
const float SKY_SUN_E = ${ F( SUN_E ) };
const float SKY_MIE_G = ${ F( MIE_G ) };
const float SKY_MS = ${ F( MULTI_SCATTER ) };
uniform sampler2D tSkyLut;
const float SKY_LUT_W = 128.0;
const float SKY_LUT_H = 48.0;
const float SKY_LUT_TOP = 80000.0;
const int SKY_SAMPLES = 24;

// 透射率表取样（手动双线性）：rgb = (瑞利光程, 米氏光程, 臭氧光程)
vec3 skyLut( float h, float c ) {
  float s = clamp( c, - 1.0, 1.0 );
  vec2 t = vec2( ( sqrt( abs( s ) ) * sign( s ) + 1.0 ) * 0.5 * SKY_LUT_W, sqrt( clamp( h / SKY_LUT_TOP, 0.0, 1.0 ) ) * SKY_LUT_H ) - 0.5;
  vec2 i0 = clamp( floor( t ), vec2( 0.0 ), vec2( SKY_LUT_W - 1.0, SKY_LUT_H - 1.0 ) );
  vec2 i1 = min( i0 + 1.0, vec2( SKY_LUT_W - 1.0, SKY_LUT_H - 1.0 ) );
  vec2 f = clamp( t - i0, vec2( 0.0 ), vec2( 1.0 ) );
  ivec2 a = ivec2( i0 ), b = ivec2( i1 );
  vec3 v00 = texelFetch( tSkyLut, a, 0 ).rgb, v10 = texelFetch( tSkyLut, ivec2( b.x, a.y ), 0 ).rgb;
  vec3 v01 = texelFetch( tSkyLut, ivec2( a.x, b.y ), 0 ).rgb, v11 = texelFetch( tSkyLut, b, 0 ).rgb;
  return mix( mix( v00, v10, f.x ), mix( v01, v11, f.x ), f.y );
}
vec3 skyExtinct( vec3 extR, float extM, vec3 od ) { return exp( - ( extR * od.x + extM * od.y + SKY_BO3 * od.z ) ); }

// 沿视线的内散射（线性辐射）。视线落到地平线以下时按贴地处理。sunT = 从海平面看向太阳的透射率（直射光颜色）。
vec3 skyScatter( vec3 dir, vec3 sun, float turbidity, float rayleigh, float mieG, float sunE, float multiScatter, out vec3 sunT ) {
  dir = normalize( vec3( dir.x, max( dir.y, 0.0 ), dir.z ) );
  vec3 extR = SKY_BR * rayleigh, extM = vec3( SKY_BM * turbidity );
  float b = SKY_R0 * dir.y;
  float tMax = - b + sqrt( b * b - ( SKY_R0 * SKY_R0 - SKY_R1 * SKY_R1 ) );
  vec3 sumR = vec3( 0.0 ), sumM = vec3( 0.0 );
  for ( int i = 0; i < SKY_SAMPLES; i ++ ) {
    float f0 = pow( float( i ) / float( SKY_SAMPLES ), 3.0 ), f1 = pow( float( i + 1 ) / float( SKY_SAMPLES ), 3.0 );
    float t = tMax * 0.5 * ( f0 + f1 ), dt = tMax * ( f1 - f0 );          // 段中点 + 段长（步长三次方分布：近处密）
    vec3 p = vec3( 0.0, SKY_R0, 0.0 ) + dir * t;
    float r = length( p ), h = max( r - SKY_R0, 0.0 );
    vec3 up = p / r;
    vec3 T = skyExtinct( extR, extM.x, skyLut( h, dot( up, dir ) ) ) * skyExtinct( extR, extM.x, skyLut( h, dot( up, sun ) ) );
    sumR += T * exp( - h / SKY_HR ) * dt;
    sumM += T * exp( - h / SKY_HM ) * dt;
  }
  float mu = dot( dir, sun ), g2 = mieG * mieG;
  float phR = 3.0 / ( 16.0 * SKY_PI ) * ( 1.0 + mu * mu );
  float phM = 3.0 / ( 8.0 * SKY_PI ) * ( ( 1.0 - g2 ) * ( 1.0 + mu * mu ) ) / ( ( 2.0 + g2 ) * pow( 1.0 + g2 - 2.0 * mieG * mu, 1.5 ) );
  vec3 od0 = skyLut( 0.0, sun.y );
  sunT = skyExtinct( extR, extM.x, od0 );
  float w = 0.72 + 0.28 * ( 1.0 - dir.y ) * ( 1.0 - dir.y );             // 多次散射：平坦底光，地平线略多
  float s0 = smoothstep( - 0.05, 0.05, sun.y );                           // 来源是本地已被散射的阳光：太阳落下后随直射光一起熄灭
  float lost = 1.0 - exp( - dot( SKY_BR, vec3( 0.333333 ) ) * rayleigh * od0.x );    // 被瑞利散射掉的阳光
  return sunE * ( sumR * extR * phR + sumM * extM * phM + multiScatter * s0 * w * lost * ( SKY_BR * rayleigh / 1.3333e-5 ) );
}
`;
