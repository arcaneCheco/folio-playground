import * as THREE from "three";

export default class RenderBuffer {
  constructor({ size, rtOptions }) {
    this.size = size || 128;

    this.texture = { value: null };

    this.scene = new THREE.Scene();

    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.camera = new THREE.PerspectiveCamera();

    this.rtOptions = {
      minFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
      stencilBuffer: false,
      depthBuffer: false,
      //depthwrite?
      ...rtOptions,
    };

    this.read = new THREE.WebGLRenderTarget(
      this.size,
      this.size,
      this.rtOptions
    );
    this.write = new THREE.WebGLRenderTarget(
      this.size,
      this.size,
      this.rtOptions
    );
    this.swap();
  }

  swap() {
    let temp = this.read;
    this.read = this.write;
    this.write = temp;
    this.texture.value = this.read.texture;
  }

  update(renderer, camera) {
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.write);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(currentRenderTarget);
    renderer.clear();
    this.swap();
  }
}
