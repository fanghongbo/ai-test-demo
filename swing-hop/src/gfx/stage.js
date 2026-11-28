// 渲染的舞台：渲染器、镜头、灯、后期。
// 后期只有两步：HDR 多重采样的场景缓冲 → 最后一道（暗角、危险时的紫边、白闪、很轻的颗粒）→ 色调映射。
// 没有泛光：这种画风靠的是干净的色块，要发光的地方（狼的眼睛、星星）自己带一片叠加的柔光。
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PAL } from '../core/palette.js';

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null }, uTime: { value: 0 }, uAspect: { value: 1.78 },
    uVignette: { value: 0.2 }, uDanger: { value: 0 }, uFlash: { value: 0 }, uGrain: { value: 0.012 }, uSat: { value: 1.06 },
  },
  vertexShader: /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
  fragmentShader: /* glsl */`
uniform sampler2D tDiffuse;
uniform float uTime, uAspect, uVignette, uDanger, uFlash, uGrain, uSat;
varying vec2 vUv;
float hash21( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
void main() {
	vec2 q = ( vUv - 0.5 ) * vec2( uAspect, 1.0 );
	float r = length( q );
	vec3 col = texture2D( tDiffuse, vUv ).rgb;
	col *= 1.0 - smoothstep( 0.25, 1.05, r ) * uVignette;                               // 暗角
	float pulse = 0.5 + 0.5 * sin( uTime * 6.9 );                                        // 狼追近：四角发紫、发暗，跟着心跳一收一放
	col = mix( col, col * vec3( 0.40, 0.32, 0.66 ), smoothstep( 0.12, 0.95, r ) * uDanger * ( 0.5 + 0.3 * pulse ) );
	float lum = dot( col, vec3( 0.2126, 0.7152, 0.0722 ) );
	col = mix( vec3( lum ), col, uSat );                                                // 饱和度提一点
	col += uFlash;
	col += ( hash21( vUv * 917.0 + fract( uTime ) * 43.0 ) - 0.5 ) * uGrain;           // 很轻的颗粒，也压一压天空渐变的色带
	gl_FragColor = vec4( max( col, vec3( 0.0 ) ), 1.0 );
}`,
};

// 画质三档：像素比、多重采样几倍、阴影贴图多大
const LEVELS = [
  { ratio: 1.0, samples: 2, shadow: 1024 },
  { ratio: 1.5, samples: 4, shadow: 2048 },
  { ratio: 2.0, samples: 4, shadow: 2048 },
];

export class Stage {
  constructor(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 0.6;
    r.info.autoReset = false;                                     // 一帧里所有绘制（阴影、后期都算上）合在一起统计
    this.renderer = r;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(new THREE.Color(PAL.haze), 46, 230);
    this.camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.3, 900);

    this.sunDir = new THREE.Vector3(0.5, 0.72, 0.48).normalize();        // 从镜头的右前上方照过来
    this.sun = new THREE.DirectionalLight(new THREE.Color('#FFF2D8'), 3.4);
    this.sun.castShadow = true;
    const sc = this.sun.shadow.camera;
    sc.left = -13; sc.right = 13; sc.top = 9.5; sc.bottom = -9.5; sc.near = 1; sc.far = 70;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sunTarget);
    this.sun.target = this.sunTarget;
    this.scene.add(this.sun);
    this.hemi = new THREE.HemisphereLight(new THREE.Color('#D6EEFF'), new THREE.Color('#FFE4C4'), 1.25);
    this.scene.add(this.hemi);

    this.level = 2;
    this.builtLevel = -1;
    this.size = new THREE.Vector2(1280, 720);
    this.composer = null;
    this.grade = null;
  }

  // 影子跟着镜头对准的那块地方走
  focus(x, y, z) {
    this.sunTarget.position.set(x, y, z);
    this.sun.position.copy(this.sunTarget.position).addScaledVector(this.sunDir, 34);
    this.sunTarget.updateMatrixWorld();
  }

  setQuality(level) {
    this.level = Math.max(0, Math.min(2, level | 0));
    this.applyQuality();
  }

  applyQuality() {
    if (this.composer && this.builtLevel === this.level) return;
    const L = LEVELS[this.level], r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, L.ratio));
    const size = this.sun.shadow.mapSize;
    if (size.x !== L.shadow) {
      size.set(L.shadow, L.shadow);
      if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
    }
    if (this.composer) this.composer.dispose();
    const w = Math.max(2, Math.floor(this.size.x * r.getPixelRatio())), h = Math.max(2, Math.floor(this.size.y * r.getPixelRatio()));
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: L.samples });
    const composer = new EffectComposer(r, rt);
    composer.addPass(new RenderPass(this.scene, this.camera));
    this.grade = new ShaderPass(GradeShader);
    composer.addPass(this.grade);
    composer.addPass(new OutputPass());
    composer.setPixelRatio(r.getPixelRatio());
    composer.setSize(this.size.x, this.size.y);
    this.composer = composer;
    this.builtLevel = this.level;
  }

  resize(w, h) {
    this.size.set(w, h);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.composer) {
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.composer.setSize(w, h);
      this.grade.uniforms.uAspect.value = w / h;
    }
  }

  render(dt, t) {
    this.renderer.info.reset();
    this.grade.uniforms.uTime.value = t;
    this.composer.render(dt);
  }
}
