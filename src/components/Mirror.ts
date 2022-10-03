import * as THREE from "three";

export default class Mirror {
  textureWidth: number;
  textureHeight: number;
  clipBias: number;
  mirrorPlane = new THREE.Plane();
  normal = new THREE.Vector3();
  mirrorWorldPosition = new THREE.Vector3();
  cameraWorldPosition = new THREE.Vector3();
  rotationMatrix = new THREE.Matrix4();
  lookAtPosition = new THREE.Vector3(0, 0, -1);
  clipPlane = new THREE.Vector4();
  view = new THREE.Vector3();
  target = new THREE.Vector3();
  q = new THREE.Vector4();
  textureMatrix = new THREE.Matrix4();
  mirrorCamera = new THREE.PerspectiveCamera();
  renderTarget: THREE.WebGLRenderTarget;
  constructor(
    options: {
      textureWidth: number;
      textureHeight: number;
      clipBias: number;
    } = {
      textureWidth: 512,
      textureHeight: 512,
      clipBias: 0,
    }
  ) {
    this.textureWidth = options.textureWidth;
    this.textureHeight = options.textureHeight;
    this.clipBias = options.clipBias;
    this.renderTarget = new THREE.WebGLRenderTarget(
      this.textureWidth,
      this.textureHeight
    );
  }

  updateTextureMatrix(object, camera) {
    this.mirrorWorldPosition.setFromMatrixPosition(object.matrixWorld);
    this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

    this.rotationMatrix.extractRotation(object.matrixWorld);

    this.normal.set(0, 0, 1);
    this.normal.applyMatrix4(this.rotationMatrix);

    this.view.subVectors(this.mirrorWorldPosition, this.cameraWorldPosition);

    if (this.view.dot(this.normal) > 0) return;

    this.view.reflect(this.normal).negate();
    this.view.add(this.mirrorWorldPosition);

    this.rotationMatrix.extractRotation(camera.matrixWorld);

    this.lookAtPosition.set(0, 0, -1);
    this.lookAtPosition.applyMatrix4(this.rotationMatrix);
    this.lookAtPosition.add(this.cameraWorldPosition);

    this.target.subVectors(this.mirrorWorldPosition, this.lookAtPosition);
    this.target.reflect(this.normal).negate();
    this.target.add(this.mirrorWorldPosition);

    this.mirrorCamera.position.copy(this.view);
    this.mirrorCamera.up.set(0, 1, 0);
    this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
    this.mirrorCamera.up.reflect(this.normal);
    this.mirrorCamera.lookAt(this.target);

    this.mirrorCamera.far = camera.far;

    this.mirrorCamera.updateMatrixWorld();
    this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

    // Update the texture matrix
    this.textureMatrix.set(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0
    );
    this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
    this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

    this.mirrorPlane.setFromNormalAndCoplanarPoint(
      this.normal,
      this.mirrorWorldPosition
    );
    this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

    this.clipPlane.set(
      this.mirrorPlane.normal.x,
      this.mirrorPlane.normal.y,
      this.mirrorPlane.normal.z,
      this.mirrorPlane.constant
    );

    const projectionMatrix = this.mirrorCamera.projectionMatrix;

    this.q.x =
      (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) /
      projectionMatrix.elements[0];
    this.q.y =
      (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) /
      projectionMatrix.elements[5];
    this.q.z = -1.0;
    this.q.w =
      (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

    this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

    // Replacing the third row of the projection matrix
    projectionMatrix.elements[2] = this.clipPlane.x;
    projectionMatrix.elements[6] = this.clipPlane.y;
    projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
    projectionMatrix.elements[14] = this.clipPlane.w;

    // eye.setFromMatrixPosition( camera.matrixWorld );
  }

  drawTexture(renderer, object, scene) {
    const currentRenderTarget = renderer.getRenderTarget();
    object.visible = false;
    renderer.setRenderTarget(this.renderTarget);
    renderer.state.buffers.depth.setMask(true);
    if (renderer.autoClear === false) renderer.clear();
    renderer.render(scene, this.mirrorCamera);
    object.visible = true;
    renderer.setRenderTarget(currentRenderTarget);
  }

  update(object, renderer, camera, scene) {
    this.updateTextureMatrix(object, camera);
    this.drawTexture(renderer, object, scene);
  }
}
