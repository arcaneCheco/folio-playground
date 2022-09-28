import {
  IUniform,
  Scene,
  WebGLRenderTarget,
  PlaneGeometry,
  PerspectiveCamera,
  LinearFilter,
  FloatType,
  RGBAFormat,
} from "three";
import { WebGLRenderTargetOptions } from "three";

export default class RenderBuffer {
  size: number;
  texture: IUniform = { value: null };
  scene = new Scene();
  geometry = new PlaneGeometry(2, 2);
  camera = new PerspectiveCamera();
  rtOptions: WebGLRenderTargetOptions;
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;
  constructor({
    size = 128,
    rtOptions = {},
  }: {
    size?: number;
    rtOptions?: WebGLRenderTargetOptions;
  }) {
    this.size = size;
    this.rtOptions = {
      minFilter: LinearFilter,
      type: FloatType,
      magFilter: LinearFilter,
      format: RGBAFormat,
      generateMipmaps: false,
      stencilBuffer: false,
      depthBuffer: false,
      //depthwrite?
      ...rtOptions,
    };

    this.read = new WebGLRenderTarget(this.size, this.size, this.rtOptions);
    this.write = new WebGLRenderTarget(this.size, this.size, this.rtOptions);
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
