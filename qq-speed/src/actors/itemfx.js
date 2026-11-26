// 道具赛的画面：转动的道具箱、地上的香蕉皮、飞出去的导弹和水炸弹、天使的护罩和翅膀、磁铁的光束、炸开时的冲击波。全部程序化。
// 这里只负责“长什么样、摆在哪”：道具的逻辑在 game/items.js，每帧把它手里的列表画出来就行。
import * as THREE from 'three';
import { ROAD_Y } from '../world/track.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex, stencil } from '../gfx/texgen.js';

const _o = new THREE.Object3D(), _e = new THREE.Object3D(), _m = new THREE.Matrix4(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
const MAX_BANANA = 24, MAX_SHOT = 8, MAX_SHOCK = 10;

/** 道具箱六个面上的贴图：蓝色的渐变方块，中间一个问号 */
function boxTexture() {
  return canvasTex(256, 256, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w * 0.3, h);
    g.addColorStop(0, '#9ff0ff'); g.addColorStop(0.45, '#2f8fff'); g.addColorStop(1, '#7a4dff');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalAlpha = 0.22; x.fillStyle = '#fff';                                              // 斜着掠过的一道高光
    x.beginPath(); x.moveTo(0, h * 0.10); x.lineTo(w, h * 0.40); x.lineTo(w, h * 0.56); x.lineTo(0, h * 0.26); x.closePath(); x.fill();
    x.globalAlpha = 1;
    x.strokeStyle = 'rgba(255,255,255,.92)'; x.lineWidth = 10; x.strokeRect(6, 6, w - 12, h - 12);
    x.shadowColor = 'rgba(255,255,255,.95)'; x.shadowBlur = 18;
    stencil(x, '?', w / 2, h / 2 + 8, { size: 176, color: '#ffffff', weight: 900 });
    x.shadowBlur = 0;
    x.lineWidth = 5; x.strokeStyle = 'rgba(20,70,170,.75)';                                   // 问号的描边，亮底上也看得清
    x.strokeText('?', w / 2, h / 2 + 8);
  }, { clamp: true });
}

/** 天使的翅膀：从根部向右展开的一排羽毛，后缘是一瓣一瓣的 */
function wingTexture() {
  return canvasTex(256, 160, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const root = [6, 92], tip = [250, 26], bez = (t) => { const u = 1 - t; return [u * u * tip[0] + 2 * u * t * 150 + t * t * root[0], u * u * tip[1] + 2 * u * t * 168 + t * t * root[1]]; };
    const grad = x.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255,246,214,.25)'); grad.addColorStop(0.35, 'rgba(255,248,224,.95)'); grad.addColorStop(1, 'rgba(255,255,255,1)');
    x.fillStyle = grad;
    x.beginPath(); x.moveTo(root[0], root[1]);
    x.quadraticCurveTo(70, 4, tip[0], tip[1]);                                                // 前缘
    const n = 9;
    for (let k = 0; k < n; k++) {                                                             // 后缘：九瓣羽毛
      const a = bez(k / n), b = bez((k + 1) / n), m = bez((k + 0.5) / n), bump = 9 + 13 * (k / n);
      x.quadraticCurveTo(m[0] + 6, m[1] + bump, b[0], b[1]);
    }
    x.closePath(); x.fill();
    x.strokeStyle = 'rgba(255,236,170,.55)'; x.lineCap = 'round';                              // 羽毛之间的缝
    for (let k = 1; k < n; k++) {
      const a = bez(k / n), m = bez((k + 0.5) / n);
      x.lineWidth = 1.6 + k * 0.25;
      x.beginPath(); x.moveTo(root[0] + 16 + k * 5, root[1] - 30 - k * 3.2); x.quadraticCurveTo(m[0] - 10, m[1] - 26, a[0] - 2, a[1] - 3); x.stroke();
    }
  }, { clamp: true });
}

/** 护罩：边缘亮、中间透明的能量泡，表面有慢慢上移的光带 */
function bubbleMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uGain: { value: 1 }, uColor: { value: new THREE.Color(1.0, 0.9, 0.62) } },
    vertexShader: /* glsl */`varying vec3 vN, vV, vP;
      void main(){ vec4 mv = modelViewMatrix * vec4( position, 1.0 ); vN = normalize( normalMatrix * normal ); vV = normalize( -mv.xyz ); vP = position; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform float uTime, uGain; uniform vec3 uColor; varying vec3 vN, vV, vP;
      void main(){
        float fres = pow( 1.0 - abs( dot( normalize( vN ), normalize( vV ) ) ), 3.0 );
        float band = smoothstep( 0.80, 1.0, sin( vP.y * 7.0 - uTime * 2.6 ) ) * 0.14;
        float lat = max( abs( sin( vP.x * 12.0 + vP.y * 6.0 ) ), max( abs( sin( vP.y * 12.0 + vP.z * 6.0 ) ), abs( sin( vP.z * 12.0 + vP.x * 6.0 ) ) ) );
        float grid = smoothstep( 0.965, 1.0, lat ) * 0.16;                                      // three slanted families of lines: a lattice with no poles
        float a = ( fres * 0.70 + band + grid ) * uGain;                                  // uGain: turned down at night, where the exposure is much higher
        gl_FragColor = vec4( uColor * ( 1.0 + fres * 2.2 + band + grid ), a );
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

/** 磁铁光束：一圈圈往前赶的亮纹。uLen 是这段光束的长度，亮纹的疏密不随长短变 */
function beamMaterial(color, base) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uLen: { value: 1 }, uGain: { value: 1 }, uColor: { value: new THREE.Color(color) }, uBase: { value: base } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
    fragmentShader: /* glsl */`uniform float uTime, uLen, uBase, uGain; uniform vec3 uColor; varying vec2 vUv;
      void main(){ float s = 0.5 + 0.5 * sin( vUv.y * uLen * 2.4 - uTime * 26.0 ); float a = uBase * ( 0.55 + 0.9 * s * s ) * uGain; gl_FragColor = vec4( uColor * ( 1.0 + s ), a ); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}

/**
 * @param {THREE.Texture} softTex 边缘柔化的圆点（光晕用）
 * @param {Array} hide 画倒影、法线深度时要藏起来的对象的列表（stage.hide），这里的东西都登记进去
 */
export function createItemFx(softTex, hide = []) {
  const group = new THREE.Group();
  group.name = 'itemFx';
  const mine = [];                                                   // 挂在车上的护罩、光束：换一批车模型时要收回来
  const glow = (color, k = 1) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.35, metalness: 0.1 });
  const halo = (color, size, opacity = 0.9) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    s.scale.set(size, size, 1); s.renderOrder = 9; return s;
  };
  const uni = { bubble: null, beams: [] };
  // Everything here glows on its own. Night pushes the exposure up eightfold, so all of it is scaled by a gain
  // (see setLampLevel): each material's emissive intensity, opacity, or shader alpha is its day value times that gain.
  const reg = new Map();
  const watch = (m) => {
    if (m && !reg.has(m)) reg.set(m, { e: m.emissiveIntensity ?? 0, o: m.opacity ?? 1, c: m.isMeshBasicMaterial && !m.transparent ? m.color.clone() : null, uni: m.uniforms?.uGain || null });
    return m;
  };

  // ——— 道具箱：带问号的蓝色方块，一圈亮边，底下一团光 ———
  const boxTex = boxTexture();
  const boxGeo = new RoundedBoxGeometry(1.3, 1.3, 1.3, 3, 0.2);
  // 亮边：十二条细长的小方块拼成的框（线框几何不能放进 InstancedMesh：它会被当成三角形画，端点之间连成一片片白面）
  const edgeBar = new THREE.BoxGeometry(1.36, 0.05, 0.05), EDGE_LOCAL = [];
  for (const a of [0, 1, 2]) for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    const p = [0, 0, 0], o = [0, 1, 2].filter((q) => q !== a);
    p[o[0]] = s1 * 0.655; p[o[1]] = s2 * 0.655;
    EDGE_LOCAL.push({ p, r: a === 0 ? [0, 0, 0] : a === 1 ? [0, 0, Math.PI / 2] : [0, Math.PI / 2, 0] });
  }
  const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, emissive: 0xffffff, emissiveMap: boxTex, emissiveIntensity: 0.95, roughness: 0.22, metalness: 0.15 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xeafcff });
  const discMat = new THREE.MeshBasicMaterial({ map: softTex, color: 0x5fd0ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const discGeo = new THREE.PlaneGeometry(4.2, 4.2).rotateX(-Math.PI / 2);
  let boxMesh = null, edgeMesh = null, discMesh = null;
  const makeBoxes = (n) => {
    boxMesh = new THREE.InstancedMesh(boxGeo, boxMat, n); boxMesh.frustumCulled = false; boxMesh.castShadow = true;
    edgeMesh = new THREE.InstancedMesh(edgeBar, edgeMat, n * 12); edgeMesh.frustumCulled = false;
    discMesh = new THREE.InstancedMesh(discGeo, discMat, n); discMesh.frustumCulled = false; discMesh.renderOrder = 3;
    boxMesh.name = 'itemBoxes'; edgeMesh.name = 'itemBoxEdges'; discMesh.name = 'itemBoxGlow';
    group.add(boxMesh, edgeMesh, discMesh); hide.push(boxMesh, edgeMesh, discMesh);
  };

  // ——— 香蕉皮：一段弯管，两头是深色的柄 ———
  const BR = 0.5, BPHI = Math.PI * 1.15, BCX = (BR * Math.sin(BPHI)) / BPHI, BCZ = (BR * (1 - Math.cos(BPHI))) / BPHI;      // 弧的重心，把它挪到原点
  const arc = new THREE.TorusGeometry(BR, 0.15, 8, 18, BPHI).rotateX(Math.PI / 2).translate(-BCX, 0.15, -BCZ);
  const tipGeo = new THREE.SphereGeometry(0.15, 8, 6);
  const bananaMesh = new THREE.InstancedMesh(arc, glow(0xffd21e, 0.3), MAX_BANANA);
  const tipMesh = new THREE.InstancedMesh(tipGeo, glow(0x6a4a12, 0), MAX_BANANA * 2);
  for (const m of [bananaMesh, tipMesh]) { watch(m.material); m.frustumCulled = false; m.castShadow = true; group.add(m); hide.push(m); }
  for (const m of [boxMat, edgeMat, discMat]) watch(m);
  bananaMesh.name = 'bananas'; tipMesh.name = 'bananaTips';

  // ——— 导弹、水炸弹：各一个对象池 ———
  const mkPool = (build) => {
    const pool = [];
    for (let k = 0; k < MAX_SHOT; k++) { const g = new THREE.Group(); build(g); g.traverse((x) => watch(x.material)); g.visible = false; group.add(g); pool.push(g); hide.push(g); }
    return pool;
  };
  const missiles = mkPool((g) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 1.5, 12).rotateZ(Math.PI / 2), glow(0xf4f6f8, 0.35));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.3, 12).rotateZ(Math.PI / 2).translate(0.35, 0, 0), glow(0xff3b30, 0.8));
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.55, 12).rotateZ(-Math.PI / 2).translate(1.02, 0, 0), glow(0xff3b30, 0.8));
    const fins = [0, 1, 2, 3].map((k) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.05), glow(0xff5a2a, 0.5)); f.position.x = -0.55; f.rotation.x = (k * Math.PI) / 2 + Math.PI / 4; return f; });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.9, 10).rotateZ(Math.PI / 2).translate(-1.62, 0, 0), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    const light = halo(0xffa040, 2.6, 0.75); light.position.x = -0.9;
    for (const m of [body, band, nose, ...fins]) m.castShadow = true;
    g.add(body, band, nose, ...fins, flame, light); g.scale.setScalar(1.5); g.userData = { flame, light };
  });
  const bombs = mkPool((g) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0x3fb0ff, emissive: new THREE.Color(0x1f6fe0), emissiveIntensity: 0.9, transparent: true, opacity: 0.82, roughness: 0.05, metalness: 0.1 }));
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), glow(0xdff6ff, 1.6)), light = halo(0x7fdcff, 3.2, 0.7);
    ball.castShadow = true; g.add(ball, core, light); g.userData = { core, light };
  });

  // ——— 冲击波：贴着地面向外扩的一圈亮环 ———
  const shockGeo = new THREE.RingGeometry(0.8, 1.0, 64).rotateX(-Math.PI / 2);
  const shocks = [];
  for (let k = 0; k < MAX_SHOCK; k++) {
    const m = new THREE.Mesh(shockGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.visible = false; m.renderOrder = 6; group.add(m); hide.push(m); shocks.push({ m, t: 9, size: 6 });
  }
  let shockHead = 0;

  // ——— 每辆车一套：护罩（能量泡、两道光环绕着一对翅膀）、磁铁光束 ———
  const perCar = new Map();
  const bubbleMat = watch(bubbleMaterial()); uni.bubble = bubbleMat;
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xfff0b8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const wingMat = new THREE.MeshBasicMaterial({ map: wingTexture(), color: 0xfff4d0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (const m of [ringMat, wingMat]) watch(m);
  const wingGeo = new THREE.PlaneGeometry(3.0, 2.0).rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(-0.65, 0, -2.45);      // 翼根在车侧，翼尖朝左（−Z），羽毛朝后（−X）
  const kitOf = (car) => {
    let k = perCar.get(car);
    if (!k) {
      const shield = new THREE.Group();
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 22), bubbleMat); bubble.scale.set(2.7, 1.25, 1.55); bubble.position.y = 0.55; bubble.renderOrder = 8;
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.05, 6, 80).rotateX(Math.PI / 2), ringMat);      // 贴着地绕车一圈
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 6, 64).rotateX(Math.PI / 2), ringMat);     // 车顶上方的光环
      ringA.position.y = 0.1; ringB.position.y = 1.95; ringA.renderOrder = ringB.renderOrder = 9;
      const wingL = new THREE.Mesh(wingGeo, wingMat), wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.scale.z = -1;
      for (const w of [wingL, wingR]) { w.position.y = 0.75; w.renderOrder = 9; }
      shield.add(bubble, ringA, ringB, wingL, wingR); shield.visible = false;
      car.cm.group.add(shield); hide.push(shield); mine.push(shield);
      const beam = new THREE.Group();
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.13, 1, 10, 1, true).translate(0, 0.5, 0), watch(beamMaterial(0x7fe0ff, 0.34)));
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 1, 8).translate(0, 0.5, 0), watch(beamMaterial(0xeaffff, 0.95)));
      for (const c of [outer, core]) { c.frustumCulled = false; c.renderOrder = 9; }
      beam.add(outer, core); beam.visible = false; beam.frustumCulled = false;
      group.add(beam); hide.push(beam); mine.push(beam);
      uni.beams.push(outer.material, core.material);
      k = { shield, bubble, ringA, ringB, wingL, wingR, beam, outer, core }; perCar.set(car, k);
    }
    return k;
  };

  const fx = {
    group, hide, f: 1,
    /** Shader warm-up (called from main): show every effect once so the renderer compiles it, then hide it again */
    warm(on, race) {
      if (on && race && race.items.boxes.length && !boxMesh) makeBoxes(race.items.boxes.length);
      for (const g of [...missiles, ...bombs]) g.visible = on;
      for (const s of shocks) s.m.visible = on;
      if (race) for (const car of race.cars) { const k = kitOf(car); k.shield.visible = on; k.beam.visible = on; }
    },
    /** Night gain (M.glowGain): 1 by day, about 0.15 at night */
    gain(g) {
      fx.f = 0.3 + 0.7 * g;
      for (const [m, b] of reg) {
        if (b.uni) b.uni.value = fx.f;
        else { if (b.e) m.emissiveIntensity = b.e * fx.f; m.opacity = b.o * fx.f; if (b.c) m.color.copy(b.c).multiplyScalar(fx.f); }
      }
    },
    /** 地面上扩开的一圈冲击波 */
    shock(x, z, color, size = 6, y = ROAD_Y + 0.06) {
      const s = shocks[shockHead]; shockHead = (shockHead + 1) % MAX_SHOCK;
      s.t = 0; s.size = size; s.m.visible = true; s.m.position.set(x, y, z); s.m.material.color.set(color); s.m.scale.setScalar(0.3);
    },
    /** 每帧。parts：createFx()，导弹的烟尾和水炸弹的水花用它的粒子池。
     *  注意这个参数不能叫 fx：那会把外层的 fx（fx.f 是夜间亮度系数）遮蔽掉，透明度算出来就是 NaN，一帧全黑 */
    update(items, race, camera, time, dt, parts) {
      // 道具箱
      const nb = items.on ? items.boxes.length : 0;
      if (nb && !boxMesh) makeBoxes(nb);
      if (boxMesh) {
        for (let k = 0; k < nb; k++) {
          const b = items.boxes[k], on = b.t <= 0, s = on ? 1 : Math.max(0.001, 1 - b.t / 0.25), bob = Math.sin(time * 2.2 + k * 1.7) * 0.12;
          _o.position.set(b.x, ROAD_Y + 1.2 + bob, b.z);
          _o.quaternion.setFromAxisAngle(UP, time * 1.3 + k).multiply(_q.setFromAxisAngle(Z, 0.5));
          _o.scale.setScalar(s); _o.updateMatrix(); boxMesh.setMatrixAt(k, _o.matrix);
          for (let e = 0; e < 12; e++) {                                                   // 亮边跟着方块转
            const L = EDGE_LOCAL[e];
            _e.position.set(L.p[0], L.p[1], L.p[2]); _e.rotation.set(L.r[0], L.r[1], L.r[2]); _e.updateMatrix();
            edgeMesh.setMatrixAt(k * 12 + e, _m.multiplyMatrices(_o.matrix, _e.matrix));
          }
          _o.position.y = ROAD_Y + 0.05; _o.quaternion.identity(); _o.scale.setScalar(on ? 1 + 0.12 * Math.sin(time * 3.1 + k * 2.3) : 0.001); _o.updateMatrix(); discMesh.setMatrixAt(k, _o.matrix);
        }
        for (const m of [boxMesh, edgeMesh, discMesh]) m.instanceMatrix.needsUpdate = true;
      }
      // 香蕉皮
      if (items.on) {
        items.bananas.forEach((b, k) => {
          const pop = b.t < 3 ? 0.65 + 0.35 * Math.abs(Math.sin(time * 9)) : 1;
          _o.position.set(b.x, ROAD_Y, b.z); _o.quaternion.setFromAxisAngle(UP, b.ry); _o.scale.setScalar(pop); _o.updateMatrix(); bananaMesh.setMatrixAt(k, _o.matrix);
          for (let e = 0; e < 2; e++) {                                             // 弯管的两头
            const a = e ? Math.PI * 1.15 : 0;
            _a.set(Math.cos(a) * BR - BCX, 0.15, Math.sin(a) * BR - BCZ).applyQuaternion(_o.quaternion).multiplyScalar(pop);
            _o.position.set(b.x + _a.x, ROAD_Y, b.z + _a.z); _o.updateMatrix(); tipMesh.setMatrixAt(k * 2 + e, _o.matrix);
          }
        });
        bananaMesh.count = items.bananas.length; tipMesh.count = items.bananas.length * 2;
        bananaMesh.instanceMatrix.needsUpdate = tipMesh.instanceMatrix.needsUpdate = true;
      } else { bananaMesh.count = 0; tipMesh.count = 0; }
      // 导弹、水炸弹
      const place = (pool, list, fn) => {
        list.forEach((m, k) => { const g = pool[k]; if (!g) return; g.visible = true; fn(g, m); });
        for (let k = list.length; k < pool.length; k++) pool[k].visible = false;
      };
      const step = Math.min(dt, 0.05);
      place(missiles, items.missiles, (g, m) => {
        g.position.set(m.x, ROAD_Y + 0.9, m.z); g.rotation.set(0, -m.th, Math.sin(time * 40 + m.id) * 0.05);
        g.userData.flame.scale.set(0.8 + 0.4 * Math.abs(Math.sin(time * 47)), 1, 1);
        g.userData.light.material.opacity = (0.55 + 0.3 * Math.abs(Math.sin(time * 53))) * fx.f;
        if (parts && step > 0) {                                                       // 烟尾
          g.userData.acc = (g.userData.acc || 0) + step * 150;
          while (g.userData.acc >= 1) {
            g.userData.acc -= 1;
            parts.smoke.emit(m.x - Math.cos(m.th) * 2.1 + (Math.random() - 0.5) * 0.3, ROAD_Y + 0.9 + (Math.random() - 0.5) * 0.3, m.z - Math.sin(m.th) * 2.1 + (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 1.6, 0.5 + Math.random() * 1.0, (Math.random() - 0.5) * 1.6, 1.0 + Math.random() * 0.6, 0.7 + Math.random() * 0.4, 0);
          }
        }
      });
      place(bombs, items.bombs, (g, b) => {
        g.position.set(b.x, ROAD_Y + b.y, b.z); g.rotation.set(time * 6, time * 4, 0); g.scale.setScalar(1 + Math.max(0, 0.5 - b.t) * 1.8);
        g.userData.core.scale.setScalar(1 + 0.15 * Math.sin(time * 22));
        g.userData.light.material.opacity = (0.55 + 0.25 * Math.sin(time * 17)) * fx.f;
        if (parts && step > 0) {                                                      // 一路洒下来的水珠
          g.userData.acc = (g.userData.acc || 0) + step * 60;
          while (g.userData.acc >= 1) { g.userData.acc -= 1; parts.glow.emit(b.x + (Math.random() - 0.5) * 0.5, ROAD_Y + b.y, b.z + (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 2, -1 - Math.random() * 2, (Math.random() - 0.5) * 2, 0.6 + Math.random() * 0.4, 0.10 + Math.random() * 0.08, 2); }
        }
      });
      // 冲击波
      for (const s of shocks) {
        if (!s.m.visible) continue;
        s.t += step;
        if (s.t >= 0.55) { s.m.visible = false; continue; }
        const e = 1 - (1 - s.t / 0.55) ** 2;
        s.m.scale.setScalar(0.3 + e * s.size); s.m.material.opacity = 0.95 * (1 - s.t / 0.55) ** 1.3 * fx.f;
      }
      // 护罩、磁铁光束
      if (!race) return;
      uni.bubble.uniforms.uTime.value = time;
      for (const bm of uni.beams) bm.uniforms.uTime.value = time;
      for (const car of race.cars) {
        const S = car.S, k = kitOf(car), sh = S.shieldT > 0, mg = S.magnetT > 0;
        k.shield.visible = sh && !(S.shieldT < 1.4 && Math.sin(time * 34) < 0);        // 快消失时一闪一闪
        if (sh) {
          k.ringA.scale.setScalar(1 + 0.06 * Math.sin(time * 3.1));
          k.ringB.rotation.set(0.12 * Math.cos(time * 1.7), 0, 0.12 * Math.sin(time * 2.2));            // 头顶的光环轻轻晃
          k.ringB.position.y = 1.95 + 0.08 * Math.sin(time * 2.4);
          const flap = 0.86 + Math.sin(time * 5.5) * 0.1;                                // 翅膀向上张成 V 形，轻轻扇（追尾镜头里才看得见）
          k.wingL.rotation.x = flap; k.wingR.rotation.x = -flap;
        }
        k.beam.visible = mg;
        if (mg) {
          const t = items.aheadOf(car, race), cs = Math.cos(S.psi), sn = Math.sin(S.psi);
          _a.set(S.x + cs * 2.2, ROAD_Y + 0.75, S.z + sn * 2.2);
          _b.set(t ? t.S.x : S.x + cs * 80, t ? ROAD_Y + 0.75 : ROAD_Y + 0.75, t ? t.S.z : S.z + sn * 80);
          const len = _a.distanceTo(_b);
          k.beam.position.copy(_a); k.beam.quaternion.setFromUnitVectors(UP, _b.sub(_a).normalize()); k.beam.scale.set(1, len, 1);
          k.outer.material.uniforms.uLen.value = k.core.material.uniforms.uLen.value = len;
        }
      }
    },
    /** 再来一局：把挂在车上的护罩、光束收回来 */
    detach() {
      for (const k of perCar.values()) { k.shield.parent?.remove(k.shield); k.beam.visible = false; uni.beams.length = 0; }
      perCar.clear();
      for (const o of mine) { const i = hide.indexOf(o); if (i >= 0) hide.splice(i, 1); }
      mine.length = 0;
    },
  };
  return fx;
}
