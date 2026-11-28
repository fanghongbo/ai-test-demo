// 路上的一个点：一座岛、一棵树、一个秋千。岛和树是合在一起的一个静态网格，秋千是会动的几个零件。
// 建一座岛要十几毫秒，一次做完会卡一帧，所以分成六步，每帧只做一步。
import * as THREE from 'three';
import { GeoBuilder } from '../gfx/geobuilder.js';
import { toon } from '../gfx/toon.js';
import { addIsletTop, addIsletRock, addIsletDecor } from './islet.js';
import { addTrunk, addCanopy, addBranch } from './tree.js';
import { SwingView } from './swing.js';

const PHASES = [addIsletTop, addIsletRock, addIsletDecor, addTrunk, addCanopy, addBranch];
let MAT = null;

// 岛和树共用的那种材质（远处的岛也用它，才有一样的画风和雾）
export function nodeMaterial() {
  if (!MAT) MAT = toon({ vertexColors: true, sway: true, grain: 0.1, grainScale: 0.4, rim: 0.1, side: THREE.DoubleSide });
  return MAT;
}

export class NodeView {
  constructor(node) {
    nodeMaterial();
    this.node = node;
    this.phase = 0;
    this.b = new GeoBuilder();
    this.swing = new SwingView(node);
    this.group = new THREE.Group();
    this.group.add(this.swing.group);
    this.mesh = null;
  }

  get done() { return this.phase >= PHASES.length; }

  // 建一步。全部建完的那一步把网格挂上去
  step() {
    if (this.done) return;
    PHASES[this.phase](this.b, this.node);
    this.phase++;
    if (this.done) {
      this.mesh = new THREE.Mesh(this.b.build(), MAT);
      this.mesh.castShadow = this.mesh.receiveShadow = true;
      this.group.add(this.mesh);
      this.b = null;
    }
  }

  dispose() {
    this.group.removeFromParent();
    if (this.mesh) this.mesh.geometry.dispose();
  }
}
