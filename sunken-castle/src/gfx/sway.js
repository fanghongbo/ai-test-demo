// 摆动：挂在海葵、海扇、海鞭、海草、巨藻的材质上。顶点里按“这一点离根部多远”把它推开——离根越远摆得越大；
// 方向和相位取自这一棵在世界里的位置，所以相邻的不会整齐划一地摇。慢的大涌 + 快的细颤。
// 每个顶点带三个自定义数（aExtra）：x = 摆动的权重（0 根部 .. 1 梢部），y = 这一根自己的相位（0..1）。
import * as THREE from 'three';

const VERT_PARS = /* glsl */`
uniform float uSwayTime, uSwayAmp, uSwayFreq;
`;
const VERT_BODY = /* glsl */`
{
  #ifdef USE_INSTANCING
    vec3 sroot = vec3( instanceMatrix[3].x, instanceMatrix[3].y, instanceMatrix[3].z );
  #else
    vec3 sroot = vec3( modelMatrix[3].x, modelMatrix[3].y, modelMatrix[3].z );
  #endif
  float sph = sroot.x * 0.37 + sroot.z * 0.53 + sroot.y * 0.11 + aExtra.y * 6.2831853;
  float sw = aExtra.x * aExtra.x * uSwayAmp;
  float surge = 0.55 + 0.45 * sin( uSwayTime * uSwayFreq + sroot.x * 0.021 + sroot.z * 0.013 );          // 大涌：一片一起晃，但慢
  float flutter = sin( uSwayTime * uSwayFreq * 3.7 + sph ) * 0.45 + sin( uSwayTime * uSwayFreq * 6.1 + sph * 1.7 ) * 0.2;
  vec2 sdir = vec2( cos( sroot.x * 0.11 + sroot.z * 0.07 ), sin( sroot.x * 0.13 - sroot.z * 0.09 ) );
  transformed.xz += sdir * ( sw * ( 0.55 * surge + 0.45 * flutter ) ) + vec2( sin( sph * 2.3 + uSwayTime * uSwayFreq * 2.1 ), cos( sph * 1.7 + uSwayTime * uSwayFreq * 1.9 ) ) * sw * 0.35;
  transformed.y -= sw * 0.25 * abs( flutter );                                                            // 摆出去的时候梢部略微下垂，长度才不变
}
`;

export function createSway() {
  const list = [];
  return {
    /**
     * @param {THREE.Material} mat 已经 waterify 过的材质（几何里要有 aExtra）
     * @param {number} amp 梢部最多摆多远（几何自己的单位）
     * @param {number} freq 基准频率
     */
    patch(mat, amp, freq = 0.9) {
      const U = { uSwayTime: { value: 0 }, uSwayAmp: { value: amp }, uSwayFreq: { value: freq } };
      U.uSwayAmp.userData = { base: amp };
      const base = mat.onBeforeCompile;
      mat.onBeforeCompile = (shader) => {
        base(shader);
        Object.assign(shader.uniforms, U);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute vec3 aExtra;\n' + VERT_PARS)
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);
        if (!shader.vertexShader.includes('uSwayAmp')) throw new Error('摆动没接上：three 的着色器片段变了');
      };
      const key = mat.customProgramCacheKey?.bind(mat);
      mat.customProgramCacheKey = () => `${key ? key() : ''}|sway`;
      list.push(U);
      return mat;
    },
    update(t) { for (const u of list) u.uSwayTime.value = t; },
    /** 风浪大小：所有摆动的幅度一起变（1 = 平常） */
    setAmpScale(k) { for (const u of list) u.uSwayAmp.value = u.uSwayAmp.userData.base * k; },
  };
}
