// 云海：岛下面一大片起伏的云面。一块跟着镜头走的大平面，着色器里用噪声堆出高度，按法线算出三段的明暗，
// 远处化进雾色。近处的体积感靠 clouds.js 里摆在云面上的大云团。
import * as THREE from 'three';
import { PAL } from '../core/palette.js';
import { CLOUD_Y } from '../core/course.js';
import { SHARED } from './toon.js';
import { NOISE_GLSL } from './glsl.js';

export function makeCloudSea(sunDir) {
  const geo = new THREE.PlaneGeometry(900, 900, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      uTime: SHARED.uTime,
      uSunDir: { value: sunDir.clone() },
      cLit: { value: new THREE.Color(PAL.cloudLit) }, cMid: { value: new THREE.Color(PAL.cloudMid) },
      cShade: { value: new THREE.Color(PAL.cloudShade) }, cHaze: { value: new THREE.Color(PAL.haze) },
    },
    vertexShader: /* glsl */`
varying vec3 vW;
void main() { vW = ( modelMatrix * vec4( position, 1.0 ) ).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: /* glsl */`
${NOISE_GLSL}
uniform float uTime;
uniform vec3 uSunDir, cLit, cMid, cShade, cHaze;
varying vec3 vW;

// 云面的高度：大团平缓的起伏，上面叠一层圆鼓鼓的小包（花椰菜的样子），随风慢慢漂
float field( vec2 p ) {
	vec2 q = p * 0.044 + vec2( uTime * 0.008, uTime * 0.002 );
	float base = fbm( q + 0.35 * vec2( fbm( q * 0.5 + 2.0 ), fbm( q * 0.5 + 7.0 ) ) );
	float bumps = abs( fbm( p * 0.21 + base * 0.8 ) );
	return base + bumps * 0.13;
}
void main() {
	vec2 p = vW.xz;
	float e = 0.12;
	float h = field( p ), hx = field( p + vec2( e, 0.0 ) ), hz = field( p + vec2( 0.0, e ) );
	vec3 n = normalize( vec3( ( h - hx ) / e * 2.4, 1.0, ( h - hz ) / e * 2.4 ) );
	float d = dot( n, uSunDir );
	float mid = smoothstep( 0.04, 0.30, d ), lit = smoothstep( 0.30, 0.62, d );
	vec3 col = mix( cShade, cMid, mid );
	col = mix( col, cLit, lit );
	float dist = length( vW - cameraPosition );
	col = mix( col, cHaze, 1.0 - exp( - dist * 0.0115 ) );
	gl_FragColor = vec4( col, 1.0 );
}
`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -5;
  mesh.position.y = CLOUD_Y;
  return mesh;
}
