import * as THREE from 'three';

export class PendulumScene {
  constructor(parentGroup) {
    this.parentGroup = parentGroup;
    this.group = new THREE.Group();
    this.parentGroup.add(this.group);

    // Component meshes for AI Tutor visual highlighting
    this.highlightables = {};

    this.createApparatus();
  }

  createApparatus() {
    // 1. Lab Stand Base (Heavy Cast Iron)
    const baseGeo = new THREE.BoxGeometry(0.35, 0.04, 0.25);
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
      metalness: 0.7
    });
    this.standBase = new THREE.Mesh(baseGeo, ironMat);
    this.standBase.position.set(-0.25, 0.02, 0);
    this.standBase.castShadow = true;
    this.standBase.receiveShadow = true;
    this.group.add(this.standBase);
    this.highlightables['stand'] = this.standBase;

    // 2. Vertical Rod
    const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.4, 16);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.2,
      metalness: 0.9
    });
    const verticalRod = new THREE.Mesh(rodGeo, chromeMat);
    verticalRod.position.set(-0.25, 0.72, 0);
    verticalRod.castShadow = true;
    this.group.add(verticalRod);

    // 3. Horizontal Clamp & Arm
    const armGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 16);
    armGeo.rotateZ(Math.PI / 2);
    const arm = new THREE.Mesh(armGeo, chromeMat);
    arm.position.set(-0.1, 1.35, 0);
    arm.castShadow = true;
    this.group.add(arm);

    // Clamp block
    const clampGeo = new THREE.BoxGeometry(0.05, 0.06, 0.05);
    const clampMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5 });
    this.clamp = new THREE.Mesh(clampGeo, clampMat);
    this.clamp.position.set(0, 1.35, 0);
    this.group.add(this.clamp);
    this.highlightables['clamp'] = this.clamp;

    // 4. Protractor Scale (Semicircular angle indicator)
    this.protractor = this.createProtractor();
    this.protractor.position.set(0, 1.35, -0.01);
    this.group.add(this.protractor);
    this.highlightables['protractor'] = this.protractor;

    // 5. Pivot Joint & String Container
    this.pivotGroup = new THREE.Group();
    this.pivotGroup.position.set(0, 1.35, 0);
    this.group.add(this.pivotGroup);

    // String Mesh
    const stringGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 1, 8);
    stringGeo.translate(0, -0.5, 0);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    this.stringMesh = new THREE.Mesh(stringGeo, stringMat);
    this.stringMesh.castShadow = true;
    this.pivotGroup.add(this.stringMesh);
    this.highlightables['string'] = this.stringMesh;

    // Spherical Bob
    const bobGeo = new THREE.SphereGeometry(0.035, 32, 32);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.85,
      roughness: 0.15
    });
    this.bobMesh = new THREE.Mesh(bobGeo, brassMat);
    this.bobMesh.castShadow = true;
    this.pivotGroup.add(this.bobMesh);
    this.highlightables['bob'] = this.bobMesh;

    // Center equilibrium reference line (faint dashed)
    const eqGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(0, 0.1, 0)
    ]);
    const eqMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.03,
      gapSize: 0.02,
      opacity: 0.5,
      transparent: true
    });
    this.eqLine = new THREE.Line(eqGeo, eqMat);
    this.eqLine.computeLineDistances();
    this.group.add(this.eqLine);
  }

  createProtractor() {
    const group = new THREE.Group();

    // Semi-circle background
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.16, Math.PI, 0, true);
    const shapeGeo = new THREE.ShapeGeometry(shape);
    const shapeMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const plate = new THREE.Mesh(shapeGeo, shapeMat);
    plate.rotation.z = Math.PI;
    group.add(plate);

    // 15-degree safe limit sector (green zone)
    const safeShape = new THREE.Shape();
    const safeRad = (15 * Math.PI) / 180;
    safeShape.moveTo(0, 0);
    safeShape.arc(0, 0, 0.16, -Math.PI / 2 - safeRad, -Math.PI / 2 + safeRad, false);
    safeShape.lineTo(0, 0);
    const safeGeo = new THREE.ShapeGeometry(safeShape);
    const safeMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const safeMesh = new THREE.Mesh(safeGeo, safeMat);
    group.add(safeMesh);

    // Ticks & degree marks
    const ticksGeo = new THREE.BufferGeometry();
    const points = [];
    for (let deg = -60; deg <= 60; deg += 5) {
      const rad = (-deg - 90) * (Math.PI / 180);
      const rInner = deg % 15 === 0 ? 0.13 : 0.145;
      const rOuter = 0.16;
      points.push(new THREE.Vector3(Math.cos(rad) * rInner, Math.sin(rad) * rInner, 0.001));
      points.push(new THREE.Vector3(Math.cos(rad) * rOuter, Math.sin(rad) * rOuter, 0.001));
    }
    ticksGeo.setFromPoints(points);
    const ticksMat = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const ticks = new THREE.LineSegments(ticksGeo, ticksMat);
    group.add(ticks);

    return group;
  }

  update(theta, length, mass) {
    // Update string orientation
    this.pivotGroup.rotation.z = theta;

    // Update string length scale
    this.stringMesh.scale.set(1, length, 1);

    // Position bob at bottom of string
    this.bobMesh.position.set(0, -length, 0);

    // Bob radius scales slightly with mass: r ∝ mass^(1/3)
    const baseRadius = 0.035;
    const scaleFactor = Math.cbrt(mass / 0.05);
    this.bobMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  setHighlight(name, isHighlighted, color = 0x38bdf8) {
    const mesh = this.highlightables[name];
    if (!mesh) return;

    if (isHighlighted) {
      if (!mesh._originalMat) {
        mesh._originalMat = mesh.material;
      }
      mesh.material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.5
      });
    } else if (mesh._originalMat) {
      mesh.material = mesh._originalMat;
      mesh._originalMat = null;
    }
  }

  clearHighlights() {
    Object.keys(this.highlightables).forEach((k) => this.setHighlight(k, false));
  }

  dispose() {
    this.group.clear();
    if (this.parentGroup) {
      this.parentGroup.remove(this.group);
    }
  }
}
