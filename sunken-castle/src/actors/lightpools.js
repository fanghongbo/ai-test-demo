// 彩窗落在地上的光斑。
// 日光穿过彩色玻璃，在地上投出和窗子一样形状的一块颜色：每一扇窗的轮廓沿着日光的方向投到地面上，铺上同一张彩窗贴图。
// 它“乘”在已经画好的地面上：地面上被太阳照到的那一块（去阴影贴图里查）被染成玻璃的颜色，照不到的地方不动——
// 所以缺了玻璃的地方还是白光，铅条和窗花的影子也还在，光斑的亮度和旁边被太阳照到的地面自动一致。
import * as THREE from 'three';

const VERT = /* glsl */`
attribute vec3 color;
varying vec2 vUv; varying vec3 vCol; varying vec3 vW;
void main() { vUv = uv; vCol = color; vW = position; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`;

const FRAG = /* glsl */`
uniform sampler2D map, tShadow;
uniform mat4 uShadowMat;
uniform vec2 uShadowSize;
uniform float uLift, uBias, uDim;
varying vec2 vUv; varying vec3 vCol; varying vec3 vW;
#include <packing>
float cmp( vec2 uv, float z ) { return step( z, unpackRGBAToDepth( texture2D( tShadow, uv ) ) ); }
// 和主画面一模一样的柔边采样（three 的 PCF_SOFT），偏置也取灯光自己的：光斑的边才和被照亮的地面严丝合缝，不留白边
float sunlit( vec4 sc ) {
  sc.xyz /= sc.w;
  sc.z += uBias;
  if ( sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || sc.z > 1.0 ) return 0.0;
  vec2 texelSize = 1.0 / uShadowSize;
  float dx = texelSize.x, dy = texelSize.y;
  vec2 uv = sc.xy, f = fract( uv * uShadowSize + 0.5 );
  uv -= f * texelSize;
  float s = cmp( uv, sc.z ) + cmp( uv + vec2( dx, 0.0 ), sc.z ) + cmp( uv + vec2( 0.0, dy ), sc.z ) + cmp( uv + texelSize, sc.z )
    + mix( cmp( uv + vec2( -dx, 0.0 ), sc.z ), cmp( uv + vec2( 2.0 * dx, 0.0 ), sc.z ), f.x )
    + mix( cmp( uv + vec2( -dx, dy ), sc.z ), cmp( uv + vec2( 2.0 * dx, dy ), sc.z ), f.x )
    + mix( cmp( uv + vec2( 0.0, -dy ), sc.z ), cmp( uv + vec2( 0.0, 2.0 * dy ), sc.z ), f.y )
    + mix( cmp( uv + vec2( dx, -dy ), sc.z ), cmp( uv + vec2( dx, 2.0 * dy ), sc.z ), f.y )
    + mix( mix( cmp( uv + vec2( -dx, -dy ), sc.z ), cmp( uv + vec2( 2.0 * dx, -dy ), sc.z ), f.x ), mix( cmp( uv + vec2( -dx, 2.0 * dy ), sc.z ), cmp( uv + vec2( 2.0 * dx, 2.0 * dy ), sc.z ), f.x ), f.y );
  return s * ( 1.0 / 9.0 );
}
void main() {
  float lit = sunlit( uShadowMat * vec4( vW.x, vW.y + uLift, vW.z, 1.0 ) );
  vec4 t = texture2D( map, vUv );
  float a = t.a * vCol.r * lit;
  vec3 tint = min( vec3( 1.05 ), 1.3 * pow( t.rgb, vec3( 0.55 ) ) );        // 玻璃的颜色：开 0.55 次方把深色提上来一点，铅条和深色的图形仍然是暗的
  gl_FragColor = vec4( tint * ( a * uDim ), a );                              // 预乘：混合出来是 dst * mix( 1, 玻璃的颜色 * uDim, a )
}`;

const sstep = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };

/**
 * @param {Array} records 每扇彩窗一条（arch.js 的 wall() 登记）：c 玻璃中心（世界）、u 沿墙的单位向量、n 指向屋里的单位向量、
 *   pts 轮廓（以中心为原点，沿 u / 向上，米）、w h 外接尺寸、region 图集里的位置、yFloor 地面的高度、run 光最多走多远（米）
 * @param {THREE.DirectionalLight} key 投影的那盏平行光
 * @param {THREE.Texture} atlas 彩窗的图集
 */
export function createLightPools(records, key, atlas) {
  let n = 0;
  for (const r of records) n += r.pts.length + 1;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
  let v = 0;
  for (const r of records) {
    const R = r.region, base = v, du = R.u1 - R.u0, dv = R.v1 - R.v0;
    uv.set([R.u0 + du * 0.5, R.v0 + dv * 0.5], v * 2); v++;                                    // 扇形的中心
    for (const [px, py] of r.pts) { uv.set([R.u0 + (px / r.w + 0.5) * du, R.v0 + (py / r.h + 0.5) * dv], v * 2); v++; }
    for (let i = 0; i < r.pts.length; i++) idx.push(base, base + 1 + i, base + 1 + ((i + 1) % r.pts.length));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  // 阴影矩阵直接引用灯光自己的那一个：它在主画面之前（画阴影贴图的时候）就更新好了。拷一份的话就是上一帧的——
  // 镜头有手持的晃动，阴影盒跟着镜头走、按纹素对齐，每帧都会挪几个纹素，旧矩阵查新贴图会错开几十厘米
  const U = { map: { value: atlas }, tShadow: { value: null }, uShadowMat: { value: key.shadow.matrix }, uShadowSize: { value: new THREE.Vector2(1, 1) }, uLift: { value: key.shadow.normalBias }, uBias: { value: key.shadow.bias }, uDim: { value: 0.82 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -3,
    blending: THREE.CustomBlending, blendSrc: THREE.DstColorFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'lightPools'; mesh.frustumCulled = false; mesh.renderOrder = 1;

  return {
    mesh,
    /** 每帧：换了画质档阴影贴图会重建，贴图和它的边长要重新给 */
    sync() { mesh.visible = !!key.shadow.map; if (mesh.visible) { U.tShadow.value = key.shadow.map.texture; U.uShadowSize.value.set(key.shadow.map.width, key.shadow.map.height); } },
    /** 换了时刻：sun 是指向光源的单位向量（折射进水里的） */
    update(sun) {
      let v = 0;
      for (const r of records) {
        const k = -(sun.x * r.n[0] + sun.z * r.n[2]);                                          // 太阳在窗子的外面才有光进来
        let a = sun.y > 0.12 ? sstep(0.06, 0.35, k) : 0;
        const run = (Math.max(r.c[1] + r.h * 0.5 - r.yFloor, 0) / Math.max(sun.y, 0.12)) * Math.max(k, 0);
        if (run > r.run * 0.7) a *= 1 - sstep(r.run * 0.7, r.run, run);                        // 走不到地面（被对面的墙接住）的光不画
        for (let i = 0; i <= r.pts.length; i++, v++) {
          const [px, py] = i ? r.pts[i - 1] : [0, 0], e = i ? 1.04 : 1;                        // 轮廓放宽一点，盖住阴影边缘的毛刺
          const X = r.c[0] + r.u[0] * px * e, Y = r.c[1] + py * e, Z = r.c[2] + r.u[2] * px * e, t = Math.max(Y - r.yFloor - 0.03, 0) / Math.max(sun.y, 0.12);
          pos[v * 3] = X - sun.x * t; pos[v * 3 + 1] = r.yFloor + 0.03; pos[v * 3 + 2] = Z - sun.z * t;
          col[v * 3] = col[v * 3 + 1] = col[v * 3 + 2] = a;
        }
      }
      geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
    },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}
