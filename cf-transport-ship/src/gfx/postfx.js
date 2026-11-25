// 电影画质后期：HDR 多重采样渲染 → 环境光遮蔽 → 泛光 → 景深 → 色调映射（AgX）→ 显示色域的调色 / 锐化 / 暗角 / 胶片颗粒。
// 景深自己实现：three 自带的 BokehPass 用的示例着色器读的不是真实深度。
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const VERT = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;

/** 景深：先把场景深度画下来，再按“模糊圆”收集。每个采样点用自己的模糊圆判断能否盖住中心像素，
 *  所以前景虚化会自然地“溢”到清晰的背景上，而不会反过来。 */
class DOFPass extends Pass {
  constructor(scene, camera, hide, o = {}) {
    super();
    this.scene = scene; this.camera = camera; this.hide = hide;
    this._rt = new THREE.WebGLRenderTarget(4, 4, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true });
    this._rt.texture.name = 'dof.depth';
    this._depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    this.uniforms = {
      tColor: { value: null }, tDepth: { value: this._rt.texture }, uFocus: { value: o.focus ?? 6 }, uAperture: { value: o.aperture ?? 2.0 },
      uMaxblur: { value: o.maxblur ?? 0.011 }, uNear: { value: camera.near }, uFar: { value: camera.far }, uAspect: { value: camera.aspect },
    };
    this._mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, defines: { TAPS: 36 },
      vertexShader: VERT,
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

/** 环境光遮蔽：画法线 / 深度时把特效、光束、植物卡片藏起来（它们不该在被遮蔽的实体里） */
class SafeGTAO extends GTAOPass {
  constructor(scene, camera, w, h, hide) { super(scene, camera, w, h); this._hide = []; this.hide = hide; }
  _overrideVisibility() { super._overrideVisibility(); hideFor(this.hide, this._hide); }
  _restoreVisibility() { super._restoreVisibility(); showAgain(this._hide); this._hide.length = 0; }
}
function hideFor(list, out = []) { for (const o of list) if (o && o.visible) { o.visible = false; out.push(o); } return out; }
function showAgain(list) { for (const o of list) o.visible = true; }

/** 显示色域里的最后一道：分离色调（暗部偏青、亮部偏暖）、饱和度、对比、锐化、暗角、胶片颗粒、轻微色差、抖动 */
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
    uSat: { value: 1.22 }, uContrast: { value: 1.07 }, uSharp: { value: 0.22 }, uVignette: { value: 0.2 }, uGrain: { value: 0.02 }, uCA: { value: 0.0026 },
    uShadowTint: { value: new THREE.Vector3(-0.012, 0.0, 0.03) }, uHighTint: { value: new THREE.Vector3(0.024, 0.006, -0.024) }, uTint: { value: 1 },
    uTime: { value: 0 },
    uAspect: { value: 1.777 }, uSun: { value: new THREE.Vector3(0, 0, 0) }, uFlare: { value: 1 },
  },
  vertexShader: VERT,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uTexel;
    uniform float uSat, uContrast, uSharp, uVignette, uGrain, uCA, uTint, uTime, uAspect, uFlare;
    uniform vec3 uSun;
    uniform vec3 uShadowTint, uHighTint;
    varying vec2 vUv;
    float hash( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 3.11 ) ) ) * 43758.5453 ); }
    float lum( vec3 c ) { return dot( c, vec3( 0.2126, 0.7152, 0.0722 ) ); }
    void main() {
      vec2 c = vUv - 0.5;
      vec2 ca = c * dot( c, c ) * uCA;                                       // 色差：越靠画面边缘越明显
      vec3 col = vec3( texture2D( tDiffuse, vUv + ca ).r, texture2D( tDiffuse, vUv ).g, texture2D( tDiffuse, vUv - ca ).b );
      vec3 nb = texture2D( tDiffuse, vUv + vec2( uTexel.x, 0.0 ) ).rgb + texture2D( tDiffuse, vUv - vec2( uTexel.x, 0.0 ) ).rgb
              + texture2D( tDiffuse, vUv + vec2( 0.0, uTexel.y ) ).rgb + texture2D( tDiffuse, vUv - vec2( 0.0, uTexel.y ) ).rgb;
      col += ( col - nb * 0.25 ) * uSharp;                                   // 轻锐化：色调映射之后的画面偏软
      float l = lum( col );
      col += ( uShadowTint * ( 1.0 - l ) * ( 1.0 - l ) + uHighTint * l * l ) * uTint;
      col = mix( vec3( lum( col ) ), col, uSat );
      col = ( col - 0.5 ) * uContrast + 0.5;
      // 镜头光晕：太阳在屏幕内且没被挡住时，加光晕、几个沿光路分布的鬼影和一道横向的变形镜片亮线（uSun.z = 可见度）
      if ( uSun.z > 0.001 ) {
        vec2 ac = vec2( uAspect, 1.0 );
        vec2 sc = c * ac * 2.0, sp = uSun.xy * ac;
        float edge = smoothstep( 1.35, 0.8, length( uSun.xy ) ) * uSun.z * uFlare;
        float ds = length( sc - sp );
        vec3 warm = vec3( 1.0, 0.86, 0.66 ), cool = vec3( 0.55, 0.75, 1.0 );
        vec3 fl = warm * ( 0.007 / ( ds * ds + 0.015 ) + 0.0016 / ( ds + 0.02 ) ) * 0.5;
        fl += vec3( 0.9, 0.95, 1.0 ) * exp( - abs( sc.y - sp.y ) * 110.0 ) * exp( - abs( sc.x - sp.x ) * 2.4 ) * 0.07;
        fl += warm * exp( - abs( sc.x - sp.x ) * 90.0 ) * exp( - abs( sc.y - sp.y ) * 3.0 ) * 0.05;
        vec3 g1 = texture2D( tDiffuse, 0.5 - sp / ( ac * 2.0 ) * 0.45 ).rgb, g2 = texture2D( tDiffuse, 0.5 - sp / ( ac * 2.0 ) * 1.1 ).rgb, g3 = texture2D( tDiffuse, 0.5 - sp / ( ac * 2.0 ) * 1.7 ).rgb;
        fl += g1 * cool * 0.035 + g2 * vec3( 0.8, 0.9, 0.7 ) * 0.025 + g3 * warm * 0.03;
        col += fl * edge;
      }
      vec2 vc = c * vec2( 1.0, 0.86 );
      col *= 1.0 - uVignette * smoothstep( 0.1, 0.62, dot( vc, vc ) );
      float g = hash( vUv * vec2( 1917.0, 1077.0 ) + fract( uTime * 7.31 ) * 173.0 ) - 0.5;   // 颗粒：中间调最多，亮部最少
      col += g * uGrain * ( 1.0 - l * 0.75 );
      col += ( hash( vUv * 913.7 + 0.31 ) - 0.5 ) / 255.0;                   // 抖动：消除 8 位渐变色带
      gl_FragColor = vec4( clamp( col, 0.0, 1.0 ), 1.0 );
    }`,
};

/**
 * @param {THREE.WebGLRenderer} renderer
 * @param {Array<{visible:boolean}>} hide 画深度 / 法线时要藏起来的对象（特效、光束…）
 */
export function createPostFX(renderer, scene, camera, hide, vm = null) {
  const db = renderer.getDrawingBufferSize(new THREE.Vector2());
  const floatOK = renderer.extensions.has('EXT_color_buffer_float');
  const rt = new THREE.WebGLRenderTarget(db.x, db.y, { type: floatOK ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, stencilBuffer: false, samples: floatOK ? 4 : 0 });
  rt.texture.name = 'hdr';
  const composer = new EffectComposer(renderer, rt);
  const renderPass = new RenderPass(scene, camera);
  const gtao = new SafeGTAO(scene, camera, db.x, db.y, hide);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.blendIntensity = 0.85;
  gtao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.4, thickness: 1.0, scale: 1.1, samples: 12, distanceFallOff: 1.0, screenSpaceRadius: false });
  const bloom = new UnrealBloomPass(new THREE.Vector2(db.x, db.y), 0.22, 0.45, 2.0);   // 只让真正的高光（太阳、灯、枪口焰）发光
  const dof = new DOFPass(scene, camera, hide, { focus: 6, aperture: 2.0, maxblur: 0.011 });
  dof.enabled = false;                                                    // 景深默认关着（只有 dofWanted 时才开）；第一人称里它只会把枪和近处糊掉
  const output = new OutputPass();
  const finish = new ShaderPass(FinishShader);
  composer.addPass(renderPass); composer.addPass(gtao);
  // 第一人称枪模：在环境光遮蔽之后叠上去（遮蔽不该压到枪上），画之前只清深度——枪永远在最前面，不会被贴着的墙切掉
  let vmPass = null;
  if (vm) { vmPass = new RenderPass(vm.scene, vm.camera); vmPass.clear = false; vmPass.clearDepth = true; composer.addPass(vmPass); }
  composer.addPass(bloom); composer.addPass(dof); composer.addPass(output); composer.addPass(finish);
  finish.uniforms.uTexel.value.set(1 / db.x, 1 / db.y);

  const api = {
    composer, gtao, bloom, dof, finish, vmPass, floatOK, dofWanted: false,
    render(dt) { finish.uniforms.uTime.value = (finish.uniforms.uTime.value + dt) % 1000; composer.render(); },
    setSize(w, h) {
      composer.setSize(w, h);
      finish.uniforms.uTexel.value.set(1 / w, 1 / h);
      finish.uniforms.uAspect.value = w / h;
      bloom.setSize(w * 0.5, h * 0.5);
    },
    setSamples(n) {
      for (const t of [rt, composer.renderTarget1, composer.renderTarget2]) { t.samples = n; t.dispose(); }
    },
    /** 0 = 省电：无遮蔽、无景深、无多重采样；1 = 均衡；2 = 全开 */
    setQuality(l) {
      gtao.enabled = l >= 1; dof.enabled = l >= 2 && api.dofWanted;
      api.setSamples(floatOK ? [0, 2, 4][l] : 0);
    },
  };
  api.setSize(db.x, db.y);
  return api;
}
