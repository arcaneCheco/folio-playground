import { _Mirror } from "@types";
import {
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Plane,
  Scene,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

interface MirrorProps {
  textureWidth?: number;
  textureHeight?: number;
  clipBias?: number;
}

export default class Mirror implements _Mirror {
  textureWidth: number;
  textureHeight: number;
  clipBias: number;
  mirrorPlane = new Plane();
  normal = new Vector3();
  mirrorWorldPosition = new Vector3();
  cameraWorldPosition = new Vector3();
  rotationMatrix = new Matrix4();
  lookAtPosition = new Vector3(0, 0, -1);
  clipPlane = new Vector4();
  view = new Vector3();
  target = new Vector3();
  q = new Vector4();
  textureMatrix = new Matrix4();
  mirrorCamera = new PerspectiveCamera();
  renderTarget: WebGLRenderTarget;
  constructor(options?: MirrorProps) {
    this.textureWidth = options?.textureWidth || 512;
    this.textureHeight = options?.textureHeight || 512;
    this.clipBias = options?.clipBias || 0;
    this.renderTarget = new WebGLRenderTarget(
      this.textureWidth,
      this.textureHeight
    );
  }

  updateTextureMatrix(object: Object3D, camera: PerspectiveCamera) {
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

  drawTexture(renderer: WebGLRenderer, object: Object3D, scene: Scene) {
    const currentRenderTarget = renderer.getRenderTarget();
    object.visible = false;
    renderer.setRenderTarget(this.renderTarget);
    renderer.state.buffers.depth.setMask(true);
    if (renderer.autoClear === false) renderer.clear();
    renderer.render(scene, this.mirrorCamera);
    object.visible = true;
    renderer.setRenderTarget(currentRenderTarget);
  }

  update(
    object: Object3D,
    renderer: WebGLRenderer,
    camera: PerspectiveCamera,
    scene: Scene
  ) {
    this.updateTextureMatrix(object, camera);
    this.drawTexture(renderer, object, scene);
  }
}
