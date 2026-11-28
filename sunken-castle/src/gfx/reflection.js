// 水面的倒影（全反射镜面）：镜像相机。镜头在水下，把场景用一架位于水面之上的镜像相机再画一遍，
// 投影到水面上——靠近水面的塔尖、巨藻冠层、鱼群，都会映在水面的全反射区里。近裁剪面用斜截（oblique）压到水面上，水面以上不画。
import * as THREE from 'three';

export function createUnderReflection(renderer, waterY = 0) {
  const rt = new THREE.WebGLRenderTarget(512, 512, { type: THREE.HalfFloatType, depthBuffer: true });
  rt.texture.name = 'surface.reflection';
  const virtualCamera = new THREE.PerspectiveCamera();
  const normal = new THREE.Vector3(0, 1, 0);                 // 指向水下（朝镜头这一侧）
  const textureMatrix = new THREE.Matrix4();
  const camPos = new THREE.Vector3(), rot = new THREE.Matrix4(), lookAt = new THREE.Vector3(), target = new THREE.Vector3(), view = new THREE.Vector3();
  const plane = new THREE.Plane(normal.clone(), -waterY), clip = new THREE.Plane(), q = new THREE.Vector4(), origin = new THREE.Vector3(0, waterY, 0);

  const api = {
    texture: rt.texture, textureMatrix, virtualCamera, enabled: true,
    setSize(s) { rt.setSize(s, s); },
    /** @param {THREE.PerspectiveCamera} camera  @param {Array} hide 倒影里不画的对象（水色穹顶、粒子…） */
    update(scene, camera, hide = []) {
      camPos.setFromMatrixPosition(camera.matrixWorld);
      view.subVectors(origin, camPos);
      if (view.dot(normal) < 0) return false;                           // 镜头在水面上：不画
      rot.extractRotation(camera.matrixWorld);
      lookAt.set(0, 0, -1).applyMatrix4(rot).add(camPos);
      view.reflect(normal).negate().add(camPos);                        // 镜像相机的位置 = 镜头位置关于水面的对称点
      target.subVectors(origin, lookAt).reflect(normal).negate().add(origin);
      virtualCamera.position.copy(view);
      virtualCamera.up.set(0, 1, 0).applyMatrix4(rot).reflect(normal);
      virtualCamera.lookAt(target);
      virtualCamera.far = camera.far;
      virtualCamera.updateMatrixWorld();
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
      textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
      textureMatrix.multiply(virtualCamera.projectionMatrix).multiply(virtualCamera.matrixWorldInverse);
      // 把近裁剪面换成水面（Lengyel 的斜截视锥）：只保留水面以下
      clip.copy(plane).applyMatrix4(virtualCamera.matrixWorldInverse);
      const cp = new THREE.Vector4(clip.normal.x, clip.normal.y, clip.normal.z, clip.constant), pm = virtualCamera.projectionMatrix;
      q.x = (Math.sign(cp.x) + pm.elements[8]) / pm.elements[0];
      q.y = (Math.sign(cp.y) + pm.elements[9]) / pm.elements[5];
      q.z = -1;
      q.w = (1 + pm.elements[10]) / pm.elements[14];
      cp.multiplyScalar(2 / cp.dot(q));
      pm.elements[2] = cp.x; pm.elements[6] = cp.y; pm.elements[10] = cp.z + 1 - 0.003; pm.elements[14] = cp.w;

      const hidden = [];
      for (const o of hide) if (o && o.visible) { o.visible = false; hidden.push(o); }
      const prevRT = renderer.getRenderTarget(), xr = renderer.xr.enabled, shadowAuto = renderer.shadowMap.autoUpdate;
      renderer.xr.enabled = false; renderer.shadowMap.autoUpdate = false;   // 阴影贴图这一帧已经画过
      renderer.setRenderTarget(rt);
      renderer.state.buffers.depth.setMask(true);
      renderer.clear();
      renderer.render(scene, virtualCamera);
      renderer.setRenderTarget(prevRT);
      renderer.xr.enabled = xr; renderer.shadowMap.autoUpdate = shadowAuto;
      for (const o of hidden) o.visible = true;
      return true;
    },
    dispose() { rt.dispose(); },
  };
  return api;
}
