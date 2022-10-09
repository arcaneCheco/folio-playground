import {
  Scene,
  WebGLRenderTarget,
  PlaneGeometry,
  PerspectiveCamera,
  LinearFilter,
  FloatType,
  RGBAFormat,
  WebGLRenderer,
  IUniform,
  WebGLRenderTargetOptions,
  Texture,
} from "three";
import { _RenderBuffer } from "@types";

export interface RenderBufferProps {
  size?: number;
  rtOptions?: WebGLRenderTargetOptions;
}

export class RenderBuffer implements _RenderBuffer {
  size: number;
  rtOptions: WebGLRenderTargetOptions;

  texture: IUniform<Texture | null> = { value: null };
  scene = new Scene();
  geometry = new PlaneGeometry(2, 2);
  camera = new PerspectiveCamera();
  read: WebGLRenderTarget;
  write: WebGLRenderTarget;

  constructor(props?: RenderBufferProps) {
    this.size = props?.size || 128;
    this.rtOptions = {
      minFilter: LinearFilter,
      type: FloatType,
      magFilter: LinearFilter,
      format: RGBAFormat,
      generateMipmaps: false,
      stencilBuffer: false,
      depthBuffer: false,
      ...props?.rtOptions,
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

  update(renderer: WebGLRenderer) {
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.write);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(currentRenderTarget);
    renderer.clear();
    this.swap();
  }
}
