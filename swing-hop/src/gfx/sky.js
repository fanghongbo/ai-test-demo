// 天空：一个跟着镜头走的大球，上面是渐变的天色、右边远处天边的一团暖光、被风拉得很长的卷云。
import * as THREE from 'three';
import { PAL } from '../core/palette.js';
import { SHARED } from './toon.js';
import { NOISE_GLSL } from './glsl.js';

export function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(PAL.skyTop) }, uMid: { value: new THREE.Color(PAL.skyMid) },
      uHorizon: { value: new THREE.Color(PAL.skyHorizon) }, uHaze: { value: new THREE.Color(PAL.haze) },
      uGlowDir: { value: new THREE.Vector3(0.55, 0.17, -0.82).normalize() }, uGlowColor: { value: new THREE.Color('#FFD39A') },
      uTime: SHARED.uTime,
    },
    vertexShader: /* glsl */`
varying vec3 vDir;
void main() { vDir = normalize( position ); gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: /* glsl */`
${NOISE_GLSL}
uniform vec3 uTop, uMid, uHorizon, uHaze, uGlowColor, uGlowDir;
uniform float uTime;
varying vec3 vDir;
void main() {
	vec3 d = normalize( vDir );
	float h = d.y;
	vec3 col = mix( uHorizon, uMid, smoothstep( - 0.025, 0.075, h ) );                       // 镜头略往下看，天边那一抹暖色只留窄窄一条
	col = mix( col, uTop, smoothstep( 0.07, 0.55, h ) );
	col = mix( uHaze, col, smoothstep( - 0.30, - 0.01, h ) );                         // 地平线以下是雾色
	float g = max( dot( d, uGlowDir ), 0.0 );                                           // 右边天边的暖光
	col += uGlowColor * ( pow( g, 5.0 ) * 0.10 + pow( g, 24.0 ) * 0.22 ) * smoothstep( - 0.05, 0.12, h );
	if ( h > 0.02 ) {                                                                   // 高高的卷云
		vec2 p = d.xz / ( h + 0.12 );
		float streak = fbm( vec2( p.x * 0.55 + uTime * 0.006, p.y * 5.5 ) + fbm( p * 1.3 ) * 0.5 );
		float cir = smoothstep( 0.18, 0.62, streak ) * smoothstep( 0.02, 0.14, h ) * ( 1.0 - smoothstep( 0.55, 0.95, h ) );
		col = mix( col, vec3( 1.0, 0.98, 0.95 ), cir * 0.42 );
	}
	gl_FragColor = vec4( col, 1.0 );
}`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(620, 48, 24), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}
