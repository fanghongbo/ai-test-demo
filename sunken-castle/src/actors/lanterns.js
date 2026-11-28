// 灯笼：王城里的每一盏灯，一颗发光的珠子（在城堡的几何里）+ 这里画的光晕（朝着镜头的一片软光斑）+ 一小池轮换的点光源。
// 光晕：加色混合，只按距离衰减、不再加一遍水色；被东西挡住就看不见（深度测试）。
// 点光源：灯很多，但只有离镜头最近的 10 盏真的照亮东西——远处的灯只剩光晕。夜里光晕更亮，白天淡。
// 这 10 盏光源永远都在场景里（不用的强度是 0）：灯光的数量一变，所有受光的材质都要为新的数量重新编译着色器，画面会卡住几秒。
import * as THREE from 'three';
import { WL_FRAG_PARS, WL_VERT_PARS } from '../gfx/waterlight.js';

const VERT = /* glsl */`
${WL_VERT_PARS}
attribute float aSize;
attribute vec3 aColor;
varying vec2 vUv;
varying vec3 vColor;
void main() {
  vec4 root = vec4( 0.0, 0.0, 0.0, 1.0 );
  #ifdef USE_INSTANCING
    root = instanceMatrix * root;
  #endif
  vec4 wp4 = modelMatrix * root;
  vWPos = wp4.xyz;
  vec4 mv = viewMatrix * wp4;
  mv.xy += position.xy * aSize;
  gl_Position = projectionMatrix * mv;
  vUv = uv;
  vColor = aColor;
}
`;

const FRAG = /* glsl */`
${WL_FRAG_PARS}
uniform float uGlow;
varying vec2 vUv;
varying vec3 vColor;
void main() {
  float d = length( vUv - 0.5 ) * 2.0;
  float core = exp( - d * d * 26.0 ) * 1.6;                         // 亮芯
  float halo = pow( max( 1.0 - d, 0.0 ), 2.6 ) * 0.55;               // 往外散开的光
  vec3 col = vColor * ( core + halo ) * uGlow;
  wFog( col, 0.0 );
  gl_FragColor = vec4( col, 1.0 );
}
`;

/**
 * @param {Array<{p:[number,number,number], c:[number,number,number], power:number, r:number}>} lanterns
 * @param {number} maxLights 点光源池的大小
 */
export function createLanterns(lanterns, maxLights = 10) {
  const n = lanterns.length, geo = new THREE.PlaneGeometry(1, 1), size = new Float32Array(n), col = new Float32Array(n * 3);
  lanterns.forEach((l, i) => { size[i] = l.r * 1.5; const m = Math.max(l.c[0], l.c[1], l.c[2]); col.set([l.c[0] / m * l.power, l.c[1] / m * l.power, l.c[2] / m * l.power], i * 3); });
  geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 1));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(col, 3));
  const U = { uGlow: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...U }, defines: { USE_INSTANCING: '' }, vertexShader: VERT, fragmentShader: FRAG,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, transparent: true,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  for (let i = 0; i < n; i++) mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(lanterns[i].p[0], lanterns[i].p[1], lanterns[i].p[2]));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false; mesh.renderOrder = 6; mesh.name = 'lanternGlow';
  const patch = (shared) => { Object.assign(mat.uniforms, shared); };                // 水下光照的共享 uniform（雾）由外部交进来

  const lights = [];
  for (let i = 0; i < maxLights; i++) { const L = new THREE.PointLight(0xffffff, 0, 30, 2); L.castShadow = false; lights.push(L); }
  const dist = lanterns.map(() => 0), order = lanterns.map((_, i) => i), c = new THREE.Color();
  let night = 0;

  return {
    mesh, lights, U, patch,
    /** night：0 白天 .. 1 夜里（夜里光晕更亮） */
    setNight(v) { night = v; U.uGlow.value = 0.10 + 1.25 * v; },               // 白天太阳底下灯只是一个小亮点，夜里才是一大团光
    /** 每帧：把最近的几盏灯交给点光源池，亮度带着一点呼吸 */
    update(t, camPos, k) {
      for (let i = 0; i < n; i++) dist[i] = (lanterns[i].p[0] - camPos.x) ** 2 + (lanterns[i].p[1] - camPos.y) ** 2 + (lanterns[i].p[2] - camPos.z) ** 2;
      order.sort((a, b) => dist[a] - dist[b]);
      for (let i = 0; i < lights.length; i++) {
        const L = lights[i], l = lanterns[order[i]];
        if (!l || dist[order[i]] > 70 * 70) { L.intensity = 0; continue; }             // 不灭灯，只把亮度调到 0
        const m = Math.max(l.c[0], l.c[1], l.c[2]);
        L.position.set(l.p[0], l.p[1], l.p[2]);
        L.color.setRGB(l.c[0] / m, l.c[1] / m, l.c[2] / m);
        L.intensity = l.power * k * (0.10 + 0.90 * night) * (0.88 + 0.12 * Math.sin(t * 1.7 + order[i] * 2.1));
        L.distance = l.r * 14;
      }
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}
