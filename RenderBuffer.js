import * as THREE from "three";

export default class RenderBuffer {
  constructor({ size, rtOptions }) {
    this.size = size || 128;

    this.texture = { value: null };

    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.rtOptions = {
      minFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
      depthBuffer: false,
      stencilBuffer: false,
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

  resize(width, height) {
    this.read.setSize(width, height);
    this.write.setSize(width, height);
  }

  update(renderer, camera) {
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.write);
    renderer.render(this.scene, camera);
    renderer.setRenderTarget(currentRenderTarget);
    renderer.clear();
    this.swap();
  }
}
