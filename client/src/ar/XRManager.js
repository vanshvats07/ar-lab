import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class XRManager {
  constructor({ container, onSessionStart, onSessionEnd, onPlaced }) {
    this.container = container;
    this.onSessionStart = onSessionStart;
    this.onSessionEnd = onSessionEnd;
    this.onPlaced = onPlaced;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.01,
      100
    );
    this.camera.position.set(0, 1.2, 1.8);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;

    container.appendChild(this.renderer.domElement);

    // Controls for fallback 3D mode
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 0.4;
    this.controls.maxDistance = 6.0;
    this.controls.target.set(0, 0.4, 0);

    // Lighting setup
    this.setupLighting();

    // Lab Workbench Group
    this.workbenchGroup = new THREE.Group();
    this.scene.add(this.workbenchGroup);

    // Default 3D Lab Room Environment
    this.roomEnvironment = this.createRoomEnvironment();
    this.scene.add(this.roomEnvironment);

    // WebXR Hit Testing
    this.xrSession = null;
    this.xrRefSpace = null;
    this.xrHitTestSource = null;
    this.hitTestSourceRequested = false;
    this.isPlaced = false;

    // Reticle for AR surface detection
    this.reticle = this.createReticle();
    this.scene.add(this.reticle);

    // Stereo / Cardboard Mode
    this.isStereoMode = false;

    // Window resize handler
    this.handleResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Animation loop
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.dirLight.position.set(2, 4, 3);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 10;
    this.dirLight.shadow.camera.left = -2;
    this.dirLight.shadow.camera.right = 2;
    this.dirLight.shadow.camera.top = 2;
    this.dirLight.shadow.camera.bottom = -2;
    this.scene.add(this.dirLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    blueRimLight.position.set(-3, 2, -2);
    this.scene.add(blueRimLight);
  }

  createRoomEnvironment() {
    const group = new THREE.Group();

    // Lab Table top
    const tableGeo = new THREE.BoxGeometry(2.0, 0.05, 1.2);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, 0, 0);
    tableMesh.receiveShadow = true;
    group.add(tableMesh);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
    const positions = [
      [-0.9, -0.4, -0.5],
      [0.9, -0.4, -0.5],
      [-0.9, -0.4, 0.5],
      [0.9, -0.4, 0.5]
    ];
    positions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      group.add(leg);
    });

    // Floor Grid
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.78;
    group.add(grid);

    return group;
  }

  createReticle() {
    const reticle = new THREE.Group();

    // Outer Ring
    const ringGeo = new THREE.RingGeometry(0.12, 0.15, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    reticle.add(ring);

    // Inner Dot
    const dotGeo = new THREE.CircleGeometry(0.03, 16);
    dotGeo.rotateX(-Math.PI / 2);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    reticle.add(dot);

    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    return reticle;
  }

  async checkXRSupport() {
    if ('xr' in navigator) {
      try {
        return await navigator.xr.isSessionSupported('immersive-ar');
      } catch (err) {
        console.warn('WebXR check error:', err);
        return false;
      }
    }
    return false;
  }

  async startAR(domOverlayElement = null) {
    const isSupported = await this.checkXRSupport();
    if (!isSupported) {
      throw new Error('WebXR immersive-ar is not supported on this device or browser.');
    }

    const sessionInit = {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'light-estimation']
    };

    if (domOverlayElement) {
      sessionInit.domOverlay = { root: domOverlayElement };
    }

    const session = await navigator.xr.requestSession('immersive-ar', sessionInit);
    this.xrSession = session;
    this.renderer.xr.setReferenceSpaceType('local');
    await this.renderer.xr.setSession(session);

    // In AR mode, hide the virtual 3D room floor/legs so the real room shows
    this.roomEnvironment.visible = false;
    this.isPlaced = false;
    this.workbenchGroup.visible = false;

    session.addEventListener('select', this.onSelect.bind(this));
    session.addEventListener('end', this.onEndAR.bind(this));

    if (this.onSessionStart) this.onSessionStart();
    return session;
  }

  onSelect() {
    if (this.reticle.visible && !this.isPlaced) {
      this.workbenchGroup.position.setFromMatrixPosition(this.reticle.matrix);
      // Place table slightly above surface
      this.workbenchGroup.position.y += 0.05;
      this.workbenchGroup.visible = true;
      this.isPlaced = true;
      this.reticle.visible = false;

      if (this.onPlaced) {
        this.onPlaced(this.workbenchGroup.position);
      }
    }
  }

  onEndAR() {
    this.xrSession = null;
    this.hitTestSourceRequested = false;
    this.xrHitTestSource = null;
    this.reticle.visible = false;
    this.roomEnvironment.visible = true;
    this.workbenchGroup.visible = true;
    this.workbenchGroup.position.set(0, 0, 0);

    if (this.onSessionEnd) this.onSessionEnd();
  }

  stopAR() {
    if (this.xrSession) {
      this.xrSession.end();
    }
  }

  toggleStereoMode() {
    this.isStereoMode = !this.isStereoMode;
    return this.isStereoMode;
  }

  onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render(timestamp, frame) {
    if (frame && this.xrSession) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();

      if (!this.hitTestSourceRequested) {
        this.xrSession.requestReferenceSpace('viewer').then((viewerSpace) => {
          this.xrSession.requestHitTestSource({ space: viewerSpace }).then((source) => {
            this.xrHitTestSource = source;
          });
        });
        this.hitTestSourceRequested = true;
      }

      if (this.xrHitTestSource && !this.isPlaced) {
        const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          this.reticle.visible = true;
          this.reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          this.reticle.visible = false;
        }
      }
    } else {
      // 3D desktop fallback mode
      this.controls.update();
    }

    if (this.isStereoMode && !this.renderer.xr.isPresenting) {
      // Cardboard split screen mode
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      const halfWidth = width / 2;

      this.renderer.setScissorTest(true);

      // Left Eye
      this.renderer.setScissor(0, 0, halfWidth, height);
      this.renderer.setViewport(0, 0, halfWidth, height);
      this.camera.aspect = halfWidth / height;
      this.camera.position.x -= 0.03;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      this.camera.position.x += 0.03;

      // Right Eye
      this.renderer.setScissor(halfWidth, 0, halfWidth, height);
      this.renderer.setViewport(halfWidth, 0, halfWidth, height);
      this.camera.position.x += 0.03;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
      this.camera.position.x -= 0.03;

      this.renderer.setScissorTest(false);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.renderer.setAnimationLoop(null);
    if (this.xrSession) {
      this.xrSession.end();
    }
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
