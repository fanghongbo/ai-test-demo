// 体积光束（“上帝光”）：沿视线在水里步进，每个采样点查一次阴影贴图——被城堡、桥、巨藻挡住的那一段水不受光，
// 所以光束的形状来自场景里的洞口和缝隙；再按深度、按焦散、按视距衰减，累加起来就是这一像素前方的水散射进来的阳光。
// 在低分辨率上步进，模糊一遍，再叠加到画面上。阴影视 GLSL 里自己采样（不借 three 的灯光管线），独立于后期链的其他通道。
import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { TILE } from '../core/waves.js';

const VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;

const MARCH = /* glsl */`
varying vec2 vUv;
uniform sampler2D tDepth, tShadow, tCaustic;
uniform mat4 uInvProj, uCamWorld, uShadowMat;
uniform vec3 uCamPos, uWSunDir, uWSun, uWKdSun, uKdBeam, uWSigma, uScatter;
uniform vec4 uShadow;                     // x 阴影图边长， y 采样半径（纹素）， z 偏置， w 强度
uniform float uFrame, uSurfY, uMaxDist, uPhaseG, uCausticScale;
#include <packing>
float shadowAt( vec3 sc ) {
  vec2 texel = vec2( uShadow.y / uShadow.x );
  float s = step( sc.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sc.xy + texel * vec2( -0.94, -0.34 ) ) ) )
          + step( sc.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sc.xy + texel * vec2( 0.49, -0.87 ) ) ) )
          + step( sc.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sc.xy + texel * vec2( 0.81, 0.59 ) ) ) )
          + step( sc.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sc.xy + texel * vec2( -0.37, 0.93 ) ) ) )
          + step( sc.z + uShadow.z, unpackRGBAToDepth( texture2D( tShadow, sc.xy ) ) );
  return 1.0 - ( 1.0 - s * 0.2 ) * uShadow.w;
}
void main() {
  float d = texture2D( tDepth, vUv ).x;
  vec4 view = uInvProj * vec4( vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0 );
  view.xyz /= view.w;
  float tHit = min( length( view.xyz ), uMaxDist );
  vec3 ray = normalize( ( uCamWorld * vec4( view.xyz, 0.0 ) ).xyz );
  if ( ray.y > 1e-5 ) tHit = min( tHit, ( uSurfY - uCamPos.y ) / ray.y );                 // 水面以上没有水
  float dt = tHit / float( STEPS );
  float jitter = fract( 52.9829189 * fract( dot( floor( gl_FragCoord.xy ) + uFrame * vec2( 47.0, 71.0 ), vec2( 0.06711056, 0.00583715 ) ) ) );
  float g = uPhaseG, cosT = dot( ray, uWSunDir );
  float phase = ( 1.0 - g * g ) / ( 12.566371 * pow( 1.0 + g * g - 2.0 * g * cosT, 1.5 ) );   // Henyey–Greenstein：水的前向散射很强
  float mean = textureLod( tCaustic, vec2( 0.13, 0.71 ), 12.0 ).r;
  vec3 acc = vec3( 0.0 );
  for ( int i = 0; i < STEPS; i ++ ) {
    float t = ( float( i ) + jitter ) * dt;
    vec3 P = uCamPos + ray * t;
    float path = ( uSurfY - P.y ) / max( uWSunDir.y, 0.2 );
    vec4 sp = uShadowMat * vec4( P, 1.0 );
    float sh = ( sp.x > 0.0 && sp.x < 1.0 && sp.y > 0.0 && sp.y < 1.0 && sp.z < 1.0 && sp.z > 0.0 ) ? shadowAt( sp.xyz ) : 1.0;
    float ca = textureLod( tCaustic, ( P.xz + uWSunDir.xz * path ) * uCausticScale, 4.5 ).r / max( mean, 0.25 );
    acc += exp( - uKdBeam * path ) * sh * mix( 1.0, min( ca, 2.2 ), 0.45 ) * exp( - uWSigma * t );
  }
  gl_FragColor = vec4( uWSun * ( acc * ( uScatter * phase * dt ) ), 1.0 );
}
`;

const BLUR = /* glsl */`
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 uDir;
void main() {
  vec3 c = texture2D( tDiffuse, vUv ).rgb * 0.227027;
  c += ( texture2D( tDiffuse, vUv + uDir * 1.384615 ).rgb + texture2D( tDiffuse, vUv - uDir * 1.384615 ).rgb ) * 0.316216;
  c += ( texture2D( tDiffuse, vUv + uDir * 3.230769 ).rgb + texture2D( tDiffuse, vUv - uDir * 3.230769 ).rgb ) * 0.070270;
  gl_FragColor = vec4( c, 1.0 );
}
`;

const COPY = { uniforms: { tDiffuse: { value: null } }, vertexShader: VERT, fragmentShader: 'varying vec2 vUv; uniform sampler2D tDiffuse; void main() { gl_FragColor = texture2D( tDiffuse, vUv ); }' };

export class ShaftPass extends Pass {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {object} W createWaterLight()（共享 uniform 和焦散贴图）
   * @param {THREE.DirectionalLight} light 投影的平行光（取它的阴影贴图）
   */
  constructor(camera, W, light, o = {}) {
    super();
    this.needsSwap = false;
    this.U = {
      ...W.U, tDepth: { value: null }, tShadow: { value: null }, tCaustic: W.U.uWCaustic,
      uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() }, uShadowMat: { value: new THREE.Matrix4() },
      uCamPos: { value: new THREE.Vector3() }, uScatter: { value: new THREE.Vector3(0.03, 0.03, 0.03) },
      uKdBeam: { value: new THREE.Vector3(0.09, 0.04, 0.025) },            // 光束的颜色按更真实的吸收算：红光在深处先没
      uShadow: { value: new THREE.Vector4(4096, 1.6, 0.0008, 1) }, uFrame: { value: 0 }, uMaxDist: { value: 260 }, uPhaseG: { value: 0.72 },
      uCausticScale: { value: 1 / TILE },
    };
    this.light = light; this.camera = camera;
    this.scale = o.scale ?? 0.5; this.steps = o.steps ?? 28; this.blur = o.blur ?? 1;
    const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
    this.rtA = new THREE.WebGLRenderTarget(2, 2, rtOpt); this.rtB = new THREE.WebGLRenderTarget(2, 2, rtOpt);
    this.march = new FullScreenQuad(new THREE.ShaderMaterial({ uniforms: this.U, vertexShader: VERT, fragmentShader: MARCH.replaceAll("STEPS", String(this.steps)), depthTest: false, depthWrite: false }));
    this.blurMat = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: VERT, fragmentShader: BLUR, depthTest: false, depthWrite: false });
    this.blurQuad = new FullScreenQuad(this.blurMat);
    this.addMat = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: this.rtA.texture } }, vertexShader: VERT, fragmentShader: COPY.fragmentShader, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true });
    this.addQuad = new FullScreenQuad(this.addMat);
    this.w = 2; this.h = 2;
  }
  setSize(w, h) {
    this.w = w; this.h = h;
    this.rtA.setSize(Math.max(2, Math.round(w * this.scale)), Math.max(2, Math.round(h * this.scale)));
    this.rtB.setSize(this.rtA.width, this.rtA.height);
  }
  setQuality(l) {
    this.scale = [0.25, 0.4, 0.5][l]; this.steps = [14, 22, 32][l]; this.blur = [1, 1, 2][l];
    this.march.material.fragmentShader = MARCH.replaceAll("STEPS", String(this.steps)); this.march.material.needsUpdate = true;
    this.setSize(this.w, this.h);
  }
  render(renderer, writeBuffer, readBuffer) {
    const map = this.light.shadow.map;
    if (!map || !this.tDepth) return;
    const U = this.U, cam = this.camera;
    U.tDepth.value = this.tDepth; U.tShadow.value = map.texture; U.uShadow.value.x = map.width;
    U.uInvProj.value.copy(cam.projectionMatrixInverse); U.uCamWorld.value.copy(cam.matrixWorld);
    U.uCamPos.value.setFromMatrixPosition(cam.matrixWorld); U.uShadowMat.value.copy(this.light.shadow.matrix);
    U.uFrame.value = (U.uFrame.value + 0.618) % 1;
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;                                   // 全屏三角形盖满整个目标，不用清；最后一步是往画好的场景上“加”，更不能清
    renderer.setRenderTarget(this.rtA); this.march.render(renderer);
    renderer.setRenderTarget(this.rtB); this.blurMat.uniforms.tDiffuse.value = this.rtA.texture; this.blurMat.uniforms.uDir.value.set(this.blur / this.rtA.width, 0); this.blurQuad.render(renderer);
    renderer.setRenderTarget(this.rtA); this.blurMat.uniforms.tDiffuse.value = this.rtB.texture; this.blurMat.uniforms.uDir.value.set(0, this.blur / this.rtA.height); this.blurQuad.render(renderer);
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer); this.addQuad.render(renderer);      // 叠加：不交换缓冲
    renderer.autoClear = autoClear;
  }
  dispose() { this.rtA.dispose(); this.rtB.dispose(); this.march.dispose(); this.blurMat.dispose(); this.blurQuad.dispose(); this.addMat.dispose(); this.addQuad.dispose(); }
}
