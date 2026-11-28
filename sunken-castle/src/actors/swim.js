// 游动形变：挂在鱼、海龟、蝠鲼、鲨鱼、鲸的材质上。几何里每个顶点带 aExtra.x = “离头多远”（0 头 .. 1+ 尾梢），身体按这个权重波动。
// 实例化的时候，相位取自这一条鱼在世界里的位置（每条鱼各摆各的）；单个的动物用材质自己的 uPhase。
import * as THREE from 'three';

const SWIM_PARS = /* glsl */`
attribute vec3 aExtra;
uniform float uSwimTime, uSwimFreq, uSwimAmp, uSwimPhase;
#ifdef USE_INSTANCING
  #define SWIM_PHASE ( uSwimPhase + fract( sin( dot( vec2( instanceMatrix[3].x, instanceMatrix[3].z ), vec2( 0.317, 0.723 ) ) ) * 43.7 ) * 6.2831853 )
#else
  #define SWIM_PHASE uSwimPhase
#endif
`;

/**
 * @param {THREE.Material} mat 已经 waterify 过的材质
 * @param {string} body 写在 begin_vertex 之后的 GLSL：可以改 transformed（用到 aExtra、SWIM_PHASE、uSwimTime、uSwimFreq、uSwimAmp）
 * @param {{ amp?: number, freq?: number, phase?: number }} o  amp：幅度（米） freq：频率（次/秒） phase：单个动物自己的相位
 */
export function swimify(mat, body, o = {}) {
  const U = { uSwimTime: { value: 0 }, uSwimFreq: { value: o.freq ?? 6 }, uSwimAmp: { value: o.amp ?? 0.05 }, uSwimPhase: { value: o.phase ?? 0 } };
  const base = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader) => {
    base(shader);
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + SWIM_PARS)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n{\n${body}\n}`);
    if (!shader.vertexShader.includes('uSwimTime')) throw new Error('游动形变没接上：three 的着色器片段变了');
  };
  const key = mat.customProgramCacheKey?.bind(mat), tag = [...body].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7).toString(36);   // 形变的代码不同，着色程序就不能共用
  mat.customProgramCacheKey = () => `${key ? key() : ''}|swim|${tag}`;
  mat.userData.swim = U;
  return mat;
}

/** 鱼和鲨鱼：身体左右摆，胸鳍扇 */
export const FISH_BODY = /* glsl */`
float w = aExtra.x;
transformed.z += sin( uSwimTime * uSwimFreq - w * 1.7 ) * uSwimAmp * w * w;             // 越靠尾摆得越大
transformed.y += sin( uSwimTime * uSwimFreq * 0.5 + 1.0 ) * 0.05 * aExtra.y;            // 胸鳍
`;

/**
 * 一条闭合的巡游路线：绕着一个中心的椭圆，高度慢慢起伏。纯计算。
 * @param {{ c:[number,number,number], rx:number, rz:number, y:number, dy:number, w:number, phase?:number, tilt?:number }} o  w：角速度（弧度/秒）
 */
export function makePath(o) {
  const p = new THREE.Vector3(), t = new THREE.Vector3(), q = new THREE.Quaternion(), m = new THREE.Matrix4(), z = new THREE.Vector3(), x = new THREE.Vector3(), y = new THREE.Vector3();
  const at = (time, out, back = 0) => { const a = time * o.w + (o.phase ?? 0); return out.set(o.c[0] + Math.cos(a) * o.rx, o.y + Math.sin(a * 2 + 0.7) * o.dy, o.c[1] + Math.sin(a) * o.rz); };
  return {
    o,
    /** 把 matrix 写成“沿着这条路线、朝前”的位姿（模型的 +x 是头） */
    pose(time, out, lean = 0) {
      at(time, p); at(time + 0.5, t); t.sub(p).normalize();
      x.copy(t); y.set(0, 1, 0); z.crossVectors(x, y).normalize(); y.crossVectors(z, x);
      if (lean) y.addScaledVector(z, lean).normalize();
      out.makeBasis(x, y, z).setPosition(p);
      return p;
    },
    /** 位置和朝向分别给出来（实例化用） */
    at,
    heading(time, out) { at(time, p); at(time + 0.5, t); return out.subVectors(t, p).normalize(); },
  };
}
