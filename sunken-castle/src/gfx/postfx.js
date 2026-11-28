// 电影画质后期：HDR 多重采样渲染 → 环境光遮蔽 → 体积光束 → 泛光 → 景深 → 色调映射（AgX）→ 显示色域里的最后一道：
// 色差、锐化、分离色调、饱和度、对比、暗角、胶片颗粒、电影黑边。
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaftPass } from './shafts.js';

const VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;

/** 景深：自己实现。每个采样点按自己的模糊圆判断能不能盖住中心像素，所以前景的虚化会自然地“溢”到清晰的背景上，反过来不会。 */
class DOFPass extends Pass {
  constructor(scene, camera, hide, o = {}) {
    super();
    this.scene = scene; this.camera = camera; this.hide = hide;
    this._rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
    this._rt.texture.name = 'dof.depth';
    this._depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    this.uniforms = {
      tColor: { value: null }, tDepth: { value: this._rt.texture }, uFocus: { value: o.focus ?? 9 }, uAperture: { value: o.aperture ?? 2.0 },
      uMaxblur: { value: o.maxblur ?? 0.011 }, uNear: { value: camera.near }, uFar: { value: camera.far }, uAspect: { value: camera.aspect },
    };
    this._mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, defines: { TAPS: 36 }, vertexShader: VERT,
      fragmentShader: /* glsl */`
        uniform sampler2D tColor, tDepth;
        uniform float uFocus, uAperture, uMaxblur, uNear, uFar, uAspect;
        varying vec2 vUv;
        #include <common>
        #include <packing>
        float cocAt( vec2 uv ) {                                             // > 0 远于焦点，< 0 近于焦点；单位 = 最大模糊半径
          float vz = - perspectiveDepthToViewZ( texture2D( tDepth, uv ).x, uNear, uFar );
          return clamp( uAperture * ( 1.0 / uFocus - 1.0 / max( vz, 0.05 ) ), - 1.0, 1.0 );
        }
        void main() {
          float coc = cocAt( vUv );
          vec4 acc = texture2D( tColor, vUv );
          float wsum = 1.0;
          float rot = fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) ) * 6.2831853;   // 每像素旋转，隐藏采样花纹
          vec2 scale = uMaxblur * vec2( 1.0 / uAspect, 1.0 );
          for ( int i = 0; i < TAPS; i ++ ) {
            float t = sqrt( ( float( i ) + 0.5 ) / float( TAPS ) ), a = float( i ) * 2.39996 + rot;
            vec2 uvT = vUv + vec2( cos( a ), sin( a ) ) * t * scale;
            float ci = cocAt( uvT );
            float w = smoothstep( t - 0.08, t + 0.08, abs( ci ) );
            w *= ( ci < 0.0 || coc >= 0.0 ) ? 1.0 : 0.0;                   // 中心是前景时只收集前景
            acc += texture2D( tColor, uvT ) * w;
            wsum += w;
          }
          gl_FragColor = vec4( acc.rgb / wsum, 1.0 );
        }`,
    });
    this._quad = new FullScreenQuad(this._mat);
    this.needsSwap = true;
  }
  setSize(w, h) { this._rt.setSize(w, h); this.uniforms.uAspect.value = w / h; }
  render(renderer, writeBuffer, readBuffer) {
    const hidden = hideFor(this.hide);
    const rt = renderer.getRenderTarget(), autoClear = renderer.autoClear, color = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha();
    renderer.setRenderTarget(this._rt); renderer.setClearColor(0xffffff, 1); renderer.clear();
    this.scene.overrideMaterial = this._depth;
    renderer.render(this.scene, this.camera);
    this.scene.overrideMaterial = null;
    renderer.setClearColor(color, alpha); renderer.setRenderTarget(rt); renderer.autoClear = autoClear;
    showAgain(hidden);
    this.uniforms.tColor.value = readBuffer.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
    this._quad.render(renderer);
  }
  dispose() { this._rt.dispose(); this._depth.dispose(); this._mat.dispose(); this._quad.dispose(); }
}

/** 环境光遮蔽：画法线 / 深度时把特效、粒子藏起来（它们不该出现在被遮蔽的实体里） */
class SafeGTAO extends GTAOPass {
  constructor(scene, camera, w, h, hide) { super(scene, camera, w, h, hide); this._hide = []; this.hide = hide; }
  _overrideVisibility() { super._overrideVisibility(); hideFor(this.hide, this._hide); }
  _restoreVisibility() { super._restoreVisibility(); showAgain(this._hide); this._hide.length = 0; }
}
function hideFor(list, out = []) { for (const o of list) if (o && o.visible) { o.visible = false; out.push(o); } return out; }
function showAgain(list) { for (const o of list) o.visible = true; }

/** 显示色域里的最后一道 */
export const FinishShader = {
  uniforms: {
    tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
    uSat: { value: 1.12 }, uContrast: { value: 1.05 }, uSharp: { value: 0.24 }, uVignette: { value: 0.26 }, uGrain: { value: 0.016 }, uCA: { value: 0.0032 },
    uShadowTint: { value: new THREE.Vector3(-0.012, 0.0, 0.030) }, uHighTint: { value: new THREE.Vector3(0.022, 0.006, -0.020) }, uTint: { value: 1 },
    uTime: { value: 0 }, uAspect: { value: 1.777 }, uBars: { value: 0 }, uFade: { value: 1 },
  },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uTexel;
    uniform float uSat, uContrast, uSharp, uVignette, uGrain, uCA, uTint, uTime, uAspect, uBars, uFade;
    uniform vec3 uShadowTint, uHighTint;
    varying vec2 vUv;
    float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 3.11 ) ) ) * 43758.5453 ); }
    float lum( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
    vec3 fetch( vec2 uv ) {                                              // 色差：越靠画面边缘越明显（像隔着潜水镜的边缘看）
      vec2 cc = uv - 0.5;
      vec2 ca = cc * dot( cc, cc ) * uCA;
      return vec3( texture2D( tDiffuse, uv + ca ).r, texture2D( tDiffuse, uv ).g, texture2D( tDiffuse, uv - ca ).b );
    }
    void main() {
      vec2 c = vUv - 0.5;
      vec3 col = fetch( vUv );
      vec3 nb = texture2D( tDiffuse, vUv + vec2( uTexel.x, 0.0 ) ).rgb + texture2D( tDiffuse, vUv - vec2( uTexel.x, 0.0 ) ).rgb
              + texture2D( tDiffuse, vUv + vec2( 0.0, uTexel.y ) ).rgb + texture2D( tDiffuse, vUv - vec2( 0.0, uTexel.y ) ).rgb;
      col += ( col - nb * 0.25 ) * uSharp;                                   // 轻锐化：色调映射之后的画面偏软
      float l = lum( col );
      col += ( uShadowTint * ( 1.0 - l ) * ( 1.0 - l ) + uHighTint * l * l ) * uTint;
      col = mix( vec3( lum( col ) ), col, uSat );
      col = ( col - 0.5 ) * uContrast + 0.5;
      vec2 vc = c * vec2( 1.0, 0.86 );
      col *= 1.0 - uVignette * smoothstep( 0.1, 0.62, dot( vc, vc ) );
      float g = hash( vUv * vec2( 1917.0, 1077.0 ) + fract( uTime * 7.31 ) * 173.0 ) - 0.5;   // 颗粒：中间调最多，亮部最少
      col += g * uGrain * ( 1.0 - l * 0.75 );
      col *= uFade;                                                      // 黑场淡入淡出
      if ( uBars > 0.001 ) {                                             // 电影黑边（约 2 : 1），边缘带一点柔化
        float bh = uBars * 0.5 * max( 0.0, 1.0 - 0.5 / uAspect );
        col *= smoothstep( bh + 0.004, bh - 0.002, abs( c.y ) );
      }
      col += ( hash( vUv * 913.7 + 0.31 ) - 0.5 ) / 255.0;                   // 抖动：消除 8 位渐变色带
      gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
    }`,
};

/** 泛光高光通道里取像素的那一句（three/addons/shaders/LuminosityHighPassShader.js）。对不上就在启动时报错 */
const HIGH_PASS_TEXEL = 'vec4 texel = texture2D( tDiffuse, vUv );';
/** 进泛光之前的清洗：指数位全 1（NaN / Inf）的像素当成 0，其余封顶。
 *  按位看指数位是确定的做法：比较式的判断（texel != texel、isnan()）在 Edge 的着色器编译器里会被当成“永远不成立”优化掉 */
const HIGH_PASS_GUARD = `
			uvec4 bits = floatBitsToUint( texel );
			uvec4 expo = ( bits >> uvec4( 23u ) ) & uvec4( 0xffu );
			if ( any( equal( expo, uvec4( 0xffu ) ) ) ) texel = vec4( 0.0 );
			texel = clamp( texel, vec4( 0.0 ), vec4( 60000.0 ) );`;

/**
 * 眼睛适应（自动曝光）：每帧把画面压成 16 × 16 格，取几何平均亮度（偏重画面中央），曝光朝“平均亮度 = 目标值”慢慢靠拢。
 * 水里亮度跨度极大：往上看是亮得发白的水面，往下看是黑深渊。没有它，抬头时亮处会被色调映射扭成黄绿色，低头时一片漆黑。
 * 全在显卡上算，不读回：三步——量亮度（16 × 16）→ 算新曝光（1 × 1，和上一帧的曝光做指数平滑）→ 画面乘上曝光。
 */
class EyeAdaptPass extends Pass {
  constructor() {
    super();
    this.needsSwap = true;
    const opt = { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false, stencilBuffer: false };
    this.lumRT = new THREE.WebGLRenderTarget(16, 16, opt);
    this.expRT = [new THREE.WebGLRenderTarget(1, 1, opt), new THREE.WebGLRenderTarget(1, 1, opt)];
    this.idx = 0;
    this.U = { uFixed: { value: 1 }, uDt: { value: 0 }, uKey: { value: 0.20 }, uRange: { value: new THREE.Vector2(0.3, 5.0) }, uOn: { value: 1 } };
    this.lumMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } }, vertexShader: VERT, depthTest: false, depthWrite: false,
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse; varying vec2 vUv;
        float lumOf( vec2 uv ) { vec3 c = texture2D( tDiffuse, uv ).rgb; c = min( max( c, vec3( 0.0 ) ), vec3( 60.0 ) ); return max( dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ), 1e-3 ); }
        void main() {
          vec2 d = vec2( 1.0 / 320.0, 1.0 / 180.0 ) * 0.5;
          float l = lumOf( vUv ) + lumOf( vUv + d ) + lumOf( vUv - d ) + lumOf( vUv + d.yx ) + lumOf( vUv - d.yx );
          float w = 0.30 + 0.70 * exp( - dot( vUv - 0.5, vUv - 0.5 ) * 7.0 );                        // 偏重画面中央
          gl_FragColor = vec4( w * log2( l / 5.0 ), w, 0.0, 1.0 );
        }`,
    });
    this.expMat = new THREE.ShaderMaterial({
      uniforms: { tLum: { value: this.lumRT.texture }, tPrev: { value: this.expRT[0].texture }, ...this.U }, vertexShader: VERT, depthTest: false, depthWrite: false,
      fragmentShader: /* glsl */`
        uniform sampler2D tLum, tPrev; uniform float uFixed, uDt, uKey, uOn; uniform vec2 uRange;
        varying vec2 vUv;
        void main() {
          vec2 acc = vec2( 0.0 );
          for ( int j = 0; j < 16; j ++ ) for ( int i = 0; i < 16; i ++ ) acc += texelFetch( tLum, ivec2( i, j ), 0 ).xy;
          float mean = exp2( acc.x / max( acc.y, 1e-4 ) );
          float target = clamp( uKey / max( mean * uFixed, 1e-4 ), uRange.x, uRange.y );
          float prev = texelFetch( tPrev, ivec2( 0 ), 0 ).r;
          float tau = target > prev ? 1.5 : 0.45;                                                    // 进暗处适应得慢，进亮处收得快
          float e = prev + ( target - prev ) * ( 1.0 - exp( - max( uDt, 0.0 ) / tau ) );
          gl_FragColor = vec4( mix( 1.0, e, uOn ), 0.0, 0.0, 1.0 );
        }`,
    });
    this.gainMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, tExp: { value: this.expRT[0].texture } }, vertexShader: VERT, depthTest: false, depthWrite: false,
      fragmentShader: 'uniform sampler2D tDiffuse, tExp; varying vec2 vUv; void main() { gl_FragColor = texture2D( tDiffuse, vUv ) * texelFetch( tExp, ivec2( 0 ), 0 ).r; }',
    });
    this.quad = new FullScreenQuad(this.lumMat);
    this.gain = 1;
  }
  render(renderer, writeBuffer, readBuffer) {
    const autoClear = renderer.autoClear; renderer.autoClear = false;
    this.lumMat.uniforms.tDiffuse.value = readBuffer.texture; this.quad.material = this.lumMat;
    renderer.setRenderTarget(this.lumRT); this.quad.render(renderer);
    this.expMat.uniforms.tPrev.value = this.expRT[this.idx].texture; this.quad.material = this.expMat;
    this.idx = 1 - this.idx;
    renderer.setRenderTarget(this.expRT[this.idx]); this.quad.render(renderer);
    this.gainMat.uniforms.tDiffuse.value = readBuffer.texture; this.gainMat.uniforms.tExp.value = this.expRT[this.idx].texture; this.quad.material = this.gainMat;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); this.quad.render(renderer);
    renderer.autoClear = autoClear;
  }
  setFixed(v, dt) { this.U.uFixed.value = v; this.U.uDt.value = dt; }
  reset(renderer) { const c = renderer.getClearColor(new THREE.Color()), a = renderer.getClearAlpha(); renderer.setRenderTarget(this.expRT[0]); renderer.setClearColor(0xffffff, 1); renderer.clear(); renderer.setRenderTarget(null); renderer.setClearColor(c, a); }
  dispose() { this.lumRT.dispose(); this.expRT[0].dispose(); this.expRT[1].dispose(); this.lumMat.dispose(); this.expMat.dispose(); this.gainMat.dispose(); this.quad.dispose(); }
}

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {Array<{visible:boolean}>} hide 画深度 / 法线时要藏起来的对象（粒子、光晕、水面…）
 * @param {THREE.DirectionalLight} light
 * @param {object} W createWaterLight()
 */
export function createPostFX(renderer, scene, camera, hide, light, W) {
  const db = renderer.getDrawingBufferSize(new THREE.Vector2());
  const floatOK = renderer.extensions.has('EXT_color_buffer_float');
  const depthTexture = new THREE.DepthTexture(db.x, db.y);
  const rt = new THREE.WebGLRenderTarget(db.x, db.y, { type: floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: false, depthTexture, samples: floatOK ? 4 : 0 });
  rt.texture.name = 'hdr';
  const composer = new EffectComposer(renderer, rt);
  const renderPass = new RenderPass(scene, camera);
  const gtao = new SafeGTAO(scene, camera, db.x, db.y, hide);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.blendIntensity = 0.80;
  gtao.updateGtaoMaterial({ radius: 1.1, distanceExponent: 1.2, thickness: 1.4, scale: 1.2, samples: 12, distanceFallOff: 1.0, screenSpaceRadius: false });
  const shafts = new ShaftPass(camera, W, light, { scale: 0.5, steps: 32, blur: 2 });
  const eye = new EyeAdaptPass();
  eye.reset(renderer);
  const bloom = new UnrealBloomPass(new THREE.Vector2(db.x, db.y), 0.42, 0.55, 1.25);   // 阈值放在 1 以上：只有太阳窗口、灯笼、荧光这些真正发光的东西才开花
  if (!bloom.materialHighPassFilter.fragmentShader.includes(HIGH_PASS_TEXEL)) throw new Error('泛光的高光着色器和预期不一样，NaN 防线没接上');
  bloom.materialHighPassFilter.fragmentShader = bloom.materialHighPassFilter.fragmentShader.replace(HIGH_PASS_TEXEL, HIGH_PASS_TEXEL + HIGH_PASS_GUARD);
  const dof = new DOFPass(scene, camera, hide, { focus: 9, aperture: 2.0, maxblur: 0.012 });
  dof.enabled = false;
  const output = new OutputPass();
  const finish = new ShaderPass(FinishShader);
  composer.addPass(renderPass); composer.addPass(gtao);
  composer.addPass(shafts); composer.addPass(eye); composer.addPass(bloom); composer.addPass(dof); composer.addPass(output); composer.addPass(finish);
  finish.uniforms.uTexel.value.set(1 / db.x, 1 / db.y);

  const api = {
    composer, gtao, bloom, dof, finish, shafts, eye, floatOK, depthTexture, dofWanted: false,
    render(dt) {
      finish.uniforms.uTime.value = (finish.uniforms.uTime.value + dt) % 1000;
      shafts.tDepth = composer.readBuffer.depthTexture;                    // 场景画完之后颜色和深度都在这个缓冲里
      eye.setFixed(renderer.toneMappingExposure, dt);                       // 固定曝光（时刻 × 深度提亮）交给眼睛适应去放大或收小
      composer.render();
    },
    setSize(w, h) {
      composer.setSize(w, h);
      finish.uniforms.uTexel.value.set(1 / w, 1 / h);
      finish.uniforms.uAspect.value = w / h;
      bloom.setSize(w * 0.5, h * 0.5);
      shafts.setSize(w, h);
    },
    setSamples(n) {
      for (const t of [rt, composer.renderTarget1, composer.renderTarget2]) { t.samples = n; t.dispose(); }
    },
    /** 0 = 流畅：无遮蔽、无多重采样、光束很粗；1 = 均衡；2 = 极致 */
    setQuality(l) {
      gtao.enabled = l >= 1; dof.enabled = l >= 1 && api.dofWanted;
      api.setSamples(floatOK ? [0, 2, 4][l] : 0);
      shafts.setQuality(l);
    },
    /** 电影黑边 0..1、黑场 0..1 */
    look(o = {}) {
      const u = finish.uniforms;
      if (o.bars !== undefined) u.uBars.value = o.bars;
      if (o.fade !== undefined) u.uFade.value = o.fade;
    },
  };
  api.setSize(db.x, db.y);
  return api;
}
