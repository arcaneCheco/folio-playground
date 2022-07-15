import * as THREE from "three";
import vertexShader from "./shaders/mirror/vertex.glsl";
import fragmentShader from "./shaders/mirror/fragment.glsl";

export default class MirrorMap extends THREE.Mesh {
  constructor(geometry, textureWidth, textureHeight, clipBias, rtOptions) {
    super(geometry);
    this.scope = this;
    this.textureWidth = textureWidth || 128;
    this.textureHeight = textureHeight || 128;
    this.clipBias = clipBias || 0;
    this.mirrorCamera = new THREE.PerspectiveCamera();
    this.mirrorWorldPosition = new THREE.Vector3();
    this.cameraWorldPosition = new THREE.Vector3();
    this.rotationMatrix = new THREE.Matrix4();
    this.normal = new THREE.Vector3(0, 0, 1); // careful with this
    this.view = new THREE.Vector3();
    this.lookAtPosition = new THREE.Vector3(0, 0, -1);
    this.target = new THREE.Vector3();
    this.textureMatrix = new THREE.Matrix4();
    this.mirrorPlane = new THREE.Plane();
    this.clipPlane = new THREE.Vector4();
    this.q = new THREE.Quaternion();

    this.renderTarget = new THREE.WebGLRenderTarget(
      this.textureWidth,
      this.textureHeight,
      {
        samples: 4,
      }
    );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uMirrorImage: { value: this.renderTarget.texture },
        uMirrorMatrix: { value: this.textureMatrix },
        color: { value: new THREE.Color(0x7f7f7f) },
      },
      vertexShader,
      fragmentShader,
    });
  }

  updateTextureMatrix(camera) {
    this.scope.updateMatrixWorld(); // maybe can remove this later
    camera.updateMatrixWorld(); // maybe can remove this later
    this.mirrorWorldPosition.setFromMatrixPosition(this.scope.matrixWorld);
    this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
    this.rotationMatrix.extractRotation(this.scope.matrixWorld);
    this.normal.set(0, 0, 1);
    this.normal.applyMatrix4(this.rotationMatrix); // maybe can skip these since water won't be transformed, or actually there is scale
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

    // from here use three.js version, above it's exaclty the same
    this.mirrorCamera.position.copy(this.view);
    this.mirrorCamera.up.set(0, 1, 0);
    this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
    this.mirrorCamera.up.reflect(this.normal);
    this.mirrorCamera.lookAt(this.target);
    this.mirrorCamera.far = camera.far; // Used in WebGLBackground, also probably don't need this unless I'm changing tthe far value
    this.mirrorCamera.updateMatrixWorld();
    this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);
    // prettier-ignore
    this.textureMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
    );
    this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
    this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);
    this.textureMatrix.multiply(this.scope.matrixWorld);

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

    // not sure what the point of the below is, the context in which these are computed gets lost after every frame
    projectionMatrix.elements[2] = this.clipPlane.x;
    projectionMatrix.elements[6] = this.clipPlane.y;
    projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
    projectionMatrix.elements[14] = this.clipPlane.w;
    ////
  }

  update(renderer, scene, camera) {
    this.updateTextureMatrix(camera);
    this.renderTarget.texture.encoding = renderer.outputEncoding;
    this.scope.visible = false;
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.state.buffers.depth.setMask(true); // not sure about this
    renderer.clear();
    renderer.render(scene, this.mirrorCamera);
    renderer.setRenderTarget(currentRenderTarget);
    this.scope.visible = true;
  }
}
