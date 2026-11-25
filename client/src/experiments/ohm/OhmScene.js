import * as THREE from 'three';

export class OhmScene {
  constructor(parentGroup, onTerminalClick) {
    this.parentGroup = parentGroup;
    this.onTerminalClick = onTerminalClick;
    this.group = new THREE.Group();
    this.parentGroup.add(this.group);

    // Dictionary of interactive terminals for wiring
    this.terminals = {}; // id -> { mesh, worldPos }
    this.highlightables = {}; // id -> mesh

    // Wires group
    this.wiresGroup = new THREE.Group();
    this.group.add(this.wiresGroup);

    // Dynamic needles and indicators
    this.ammeterNeedle = null;
    this.voltmeterNeedle = null;
    this.switchLever = null;
    this.smokeParticles = null;

    this.createApparatus();
    this.createParticleSystem();
  }

  createApparatus() {
    // 1. DC Power Supply
    this.createPowerSupply({ x: -0.55, y: 0.1, z: -0.2 });

    // 2. One-Way Knife Switch
    this.createSwitch({ x: -0.15, y: 0.05, z: -0.25 });

    // 3. Ceramic Wirewound Resistor
    this.createResistor({ x: 0.35, y: 0.05, z: -0.2 });

    // 4. Analog Ammeter
    this.createMeter('ammeter', { x: -0.3, y: 0.08, z: 0.25 }, 'A (0-3A)', 0x0284c7);

    // 5. Analog Voltmeter
    this.createMeter('voltmeter', { x: 0.3, y: 0.08, z: 0.25 }, 'V (0-15V)', 0x7c3aed);
  }

  createTerminal(id, position, color = 0xef4444) {
    const geo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 16);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.8
    });
    const terminal = new THREE.Mesh(geo, mat);
    terminal.position.copy(position);
    terminal.castShadow = true;
    terminal.userData = { isTerminal: true, terminalId: id };
    this.group.add(terminal);

    this.terminals[id] = {
      mesh: terminal,
      id,
      position: position.clone()
    };
    return terminal;
  }

  createPowerSupply(pos) {
    const boxGeo = new THREE.BoxGeometry(0.32, 0.18, 0.22);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(pos.x, pos.y, pos.z);
    box.castShadow = true;
    this.group.add(box);
    this.highlightables['battery'] = box;

    // Front display panel
    const panelGeo = new THREE.PlaneGeometry(0.28, 0.14);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(pos.x, pos.y + 0.01, pos.z + 0.111);
    this.group.add(panel);

    // Knob
    const knobGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16);
    knobGeo.rotateX(Math.PI / 2);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(pos.x - 0.06, pos.y - 0.02, pos.z + 0.12);
    this.group.add(knob);

    // Terminals: Red (+) and Black (-)
    this.createTerminal('battery_pos', new THREE.Vector3(pos.x + 0.04, pos.y - 0.02, pos.z + 0.12), 0xef4444);
    this.createTerminal('battery_neg', new THREE.Vector3(pos.x + 0.09, pos.y - 0.02, pos.z + 0.12), 0x0f172a);
  }

  createSwitch(pos) {
    const baseGeo = new THREE.BoxGeometry(0.18, 0.03, 0.12);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(pos.x, pos.y, pos.z);
    base.castShadow = true;
    this.group.add(base);
    this.highlightables['switch'] = base;

    // Copper contacts
    this.createTerminal('switch_in', new THREE.Vector3(pos.x - 0.06, pos.y + 0.02, pos.z), 0xd97706);
    this.createTerminal('switch_out', new THREE.Vector3(pos.x + 0.06, pos.y + 0.02, pos.z), 0xd97706);

    // Switch knife lever
    const leverGroup = new THREE.Group();
    leverGroup.position.set(pos.x - 0.06, pos.y + 0.03, pos.z);

    const bladeGeo = new THREE.BoxGeometry(0.12, 0.008, 0.015);
    bladeGeo.translate(0.06, 0, 0);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    leverGroup.add(blade);

    // Insulated handle knob
    const handleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 12);
    handleGeo.rotateX(Math.PI / 2);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.12, 0.01, 0);
    leverGroup.add(handle);

    this.group.add(leverGroup);
    this.switchLever = leverGroup;
    this.switchLever.rotation.z = Math.PI / 5; // initially open
  }

  createResistor(pos) {
    const baseGeo = new THREE.BoxGeometry(0.24, 0.04, 0.1);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(pos.x, pos.y, pos.z);
    base.castShadow = true;
    this.group.add(base);
    this.highlightables['resistor'] = base;

    // Resistor ceramic cylinder
    const cylGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.14, 24);
    cylGeo.rotateZ(Math.PI / 2);
    this.resistorMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.5,
      metalness: 0.1
    });
    this.resistorBody = new THREE.Mesh(cylGeo, this.resistorMat);
    this.resistorBody.position.set(pos.x, pos.y + 0.04, pos.z);
    this.resistorBody.castShadow = true;
    this.group.add(this.resistorBody);

    // Color code bands
    const bandMat1 = new THREE.MeshBasicMaterial({ color: 0x991b1b }); // Brown
    const bandMat2 = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black
    const bandMat3 = new THREE.MeshBasicMaterial({ color: 0xb45309 }); // Brown
    const bandGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.012, 24);
    bandGeo.rotateZ(Math.PI / 2);

    const b1 = new THREE.Mesh(bandGeo, bandMat1);
    b1.position.set(pos.x - 0.03, pos.y + 0.04, pos.z);
    const b2 = new THREE.Mesh(bandGeo, bandMat2);
    b2.position.set(pos.x, pos.y + 0.04, pos.z);
    const b3 = new THREE.Mesh(bandGeo, bandMat3);
    b3.position.set(pos.x + 0.03, pos.y + 0.04, pos.z);
    this.group.add(b1, b2, b3);

    // Resistor terminals
    this.createTerminal('resistor_in', new THREE.Vector3(pos.x - 0.08, pos.y + 0.03, pos.z), 0xd97706);
    this.createTerminal('resistor_out', new THREE.Vector3(pos.x + 0.08, pos.y + 0.03, pos.z), 0xd97706);
  }

  createMeter(type, pos, labelText, frameColor) {
    // Meter housing
    const boxGeo = new THREE.BoxGeometry(0.24, 0.16, 0.2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const housing = new THREE.Mesh(boxGeo, boxMat);
    housing.position.set(pos.x, pos.y, pos.z);
    housing.castShadow = true;
    this.group.add(housing);
    this.highlightables[type] = housing;

    // Bevel frame
    const frameGeo = new THREE.BoxGeometry(0.22, 0.12, 0.01);
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.2, metalness: 0.5 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(pos.x, pos.y + 0.02, pos.z + 0.101);
    this.group.add(frame);

    // Dial face
    const faceGeo = new THREE.PlaneGeometry(0.19, 0.09);
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(pos.x, pos.y + 0.02, pos.z + 0.107);
    this.group.add(face);

    // Needle pivot
    const pivot = new THREE.Group();
    pivot.position.set(pos.x, pos.y - 0.01, pos.z + 0.11);

    const needleGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.065, 8);
    needleGeo.translate(0, 0.032, 0);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    pivot.add(needle);
    this.group.add(pivot);

    if (type === 'ammeter') {
      this.ammeterNeedle = pivot;
      this.createTerminal('ammeter_pos', new THREE.Vector3(pos.x - 0.05, pos.y - 0.05, pos.z + 0.1), 0xef4444);
      this.createTerminal('ammeter_neg', new THREE.Vector3(pos.x + 0.05, pos.y - 0.05, pos.z + 0.1), 0x0f172a);
    } else {
      this.voltmeterNeedle = pivot;
      this.createTerminal('voltmeter_pos', new THREE.Vector3(pos.x - 0.05, pos.y - 0.05, pos.z + 0.1), 0xef4444);
      this.createTerminal('voltmeter_neg', new THREE.Vector3(pos.x + 0.05, pos.y - 0.05, pos.z + 0.1), 0x0f172a);
    }
  }

  createParticleSystem() {
    // Smoke / spark particles for overheating or short circuits
    const count = 30;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0.35 + (Math.random() - 0.5) * 0.05;
      positions[i * 3 + 1] = 0.08 + Math.random() * 0.15;
      positions[i * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.05;
      velocities.push({
        vx: (Math.random() - 0.5) * 0.005,
        vy: 0.005 + Math.random() * 0.01,
        vz: (Math.random() - 0.5) * 0.005
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.02,
      transparent: true,
      opacity: 0.7
    });

    this.smokePoints = new THREE.Points(geo, mat);
    this.smokePoints.visible = false;
    this.smokeVelocities = velocities;
    this.group.add(this.smokePoints);
  }

  updateWires(connections) {
    this.wiresGroup.clear();

    connections.forEach(([fromId, toId]) => {
      const termA = this.terminals[fromId];
      const termB = this.terminals[toId];
      if (!termA || !termB) return;

      const pA = termA.position.clone();
      const pB = termB.position.clone();

      // Quadratic curve sagging naturally under gravity
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const dist = pA.distanceTo(pB);
      mid.y = Math.min(pA.y, pB.y) + Math.max(0.04, dist * 0.25); // upward arch

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.004, 8, false);

      // Color code wire based on terminal polarity
      const isPos = fromId.includes('pos') || toId.includes('pos');
      const isNeg = fromId.includes('neg') || toId.includes('neg');
      const wireColor = isPos ? 0xef4444 : isNeg ? 0x0f172a : 0x3b82f6;

      const wireMat = new THREE.MeshStandardMaterial({
        color: wireColor,
        roughness: 0.4,
        metalness: 0.3
      });
      const wireMesh = new THREE.Mesh(tubeGeo, wireMat);
      wireMesh.castShadow = true;
      this.wiresGroup.add(wireMesh);
    });
  }

  update(state) {
    // 1. Switch lever position
    if (this.switchLever) {
      const targetAngle = state.isSwitchClosed ? 0 : Math.PI / 5;
      this.switchLever.rotation.z += (targetAngle - this.switchLever.rotation.z) * 0.2;
    }

    // 2. Ammeter needle deflection (Scale 0 - 3A => angle from +40 deg to -40 deg)
    if (this.ammeterNeedle) {
      const maxCurrent = 3.0;
      const ratio = Math.max(0, Math.min(1.0, state.current / maxCurrent));
      const targetRot = (40 - ratio * 80) * (Math.PI / 180);
      this.ammeterNeedle.rotation.z += (targetRot - this.ammeterNeedle.rotation.z) * 0.15;
    }

    // 3. Voltmeter needle deflection (Scale 0 - 15V => angle from +40 deg to -40 deg)
    if (this.voltmeterNeedle) {
      const maxVoltage = 15.0;
      const ratio = Math.max(0, Math.min(1.0, state.measuredVoltage / maxVoltage));
      const targetRot = (40 - ratio * 80) * (Math.PI / 180);
      this.voltmeterNeedle.rotation.z += (targetRot - this.voltmeterNeedle.rotation.z) * 0.15;
    }

    // 4. Resistor Overheating & glow
    if (this.resistorMat) {
      if (state.isOverheated || state.mistakes.shortCircuit) {
        this.resistorMat.color.setHex(0xff2200);
        this.resistorMat.emissive.setHex(0xff4400);
        this.resistorMat.emissiveIntensity = 0.8;
        if (this.smokePoints) this.smokePoints.visible = true;
      } else {
        this.resistorMat.color.setHex(0xfde047);
        this.resistorMat.emissive.setHex(0x000000);
        this.resistorMat.emissiveIntensity = 0.0;
        if (this.smokePoints) this.smokePoints.visible = false;
      }
    }

    // Update smoke animation
    if (this.smokePoints && this.smokePoints.visible) {
      const posAttr = this.smokePoints.geometry.attributes.position;
      const positions = posAttr.array;
      for (let i = 0; i < this.smokeVelocities.length; i++) {
        positions[i * 3 + 1] += this.smokeVelocities[i].vy;
        if (positions[i * 3 + 1] > 0.3) {
          positions[i * 3 + 1] = 0.08;
          positions[i * 3] = 0.35 + (Math.random() - 0.5) * 0.05;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 5. Update Wires
    this.updateWires(state.connections);
  }

  setHighlight(name, isHighlighted, color = 0x38bdf8) {
    const mesh = this.highlightables[name];
    if (!mesh) return;

    if (isHighlighted) {
      if (!mesh._origMat) mesh._origMat = mesh.material;
      mesh.material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.7,
        roughness: 0.2
      });
    } else if (mesh._origMat) {
      mesh.material = mesh._origMat;
      mesh._origMat = null;
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
