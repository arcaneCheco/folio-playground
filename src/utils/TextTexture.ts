import {
  HalfFloatType,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import TextGeometry from "./TextGeometry";
import vertexShader from "@shaders/basicText/vertex.glsl";
import fragmentShader from "@shaders/basicText/fragment.glsl";
import { World } from "@src/app";
import { TextAlign } from "@types";

export default class TextTexture {
  font;
  geometry;
  geometryAspect;
  scale;
  material;
  mesh;
  texture;
  renderTarget;
  scene;
  constructor({ lineHeight = 1.4, padding = 0.25 }) {
    this.font = new World().resources.fonts.audiowideRegular;
    this.geometry = new TextGeometry();
    this.geometry.setText({
      fontData: this.font.data,
      text: "Creative\nWeb\nDeveloper",
      align: TextAlign.Left,
      lineHeight,
      letterSpacing: -0.05,
    });

    this.geometry.computeBoundingBox();

    let width =
      this.geometry.boundingBox!.max.x - this.geometry.boundingBox!.min.x;
    let height =
      this.geometry.boundingBox!.max.y - this.geometry.boundingBox!.min.y;

    this.geometryAspect = width / height;

    this.scale = 2 / width;

    this.geometry.text.updateSize(this.scale);

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: this.font.map },
      },
      transparent: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.scale.y = this.geometryAspect;

    this.mesh.scale.multiplyScalar(1 - padding);

    // this.mesh.scale.set

    this.mesh.position.x = -1 + padding;
    this.mesh.position.y = 1 - padding - this.scale * 0.5 * this.geometryAspect;

    this.renderTarget = new WebGLRenderTarget(512, 512, {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: LinearFilter,
      type: HalfFloatType,
      format: RGBAFormat,
      generateMipmaps: false,
    });

    this.texture = { value: this.renderTarget.texture };

    this.scene = new Scene();
    this.scene.add(this.mesh);
  }

  createTexture(renderer: WebGLRenderer, camera: PerspectiveCamera) {
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, camera);
    this.texture.value = this.renderTarget.texture;
    renderer.setRenderTarget(currentRenderTarget);
    renderer.clear();
  }
}
