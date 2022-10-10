import {
  HalfFloatType,
  IUniform,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import TextGeometry from "./TextGeometry";
import vertexShader from "@shaders/basicText/vertex.glsl";
import fragmentShader from "@shaders/basicText/fragment.glsl";
import { Font, TextAlign, _TextGeometry, _TextTexture, Padding } from "@types";

interface TextTextureProps {
  lineHeight?: number;
  padding?: Padding;
  font: Font;
  text: string;
}

export default class TextTexture implements _TextTexture {
  font: Font;
  geometry = new TextGeometry();
  geometryAspect: number;
  scale: number;
  material: ShaderMaterial;
  mesh: Mesh;
  renderTarget: WebGLRenderTarget;
  texture: IUniform<Texture>;
  scene: Scene;
  lineHeight: number;
  padding: Padding;
  constructor(props: TextTextureProps) {
    this.font = props.font;
    this.lineHeight = props.lineHeight || 1.4;
    this.padding = props.padding || { x: 0.25, y: 0.25 };

    this.geometry.setText({
      fontData: this.font.data,
      text: props.text,
      align: TextAlign.Left,
      lineHeight: this.lineHeight,
      letterSpacing: -0.05,
    });

    this.geometry.computeBoundingBox();

    let width =
      this.geometry.boundingBox!.max.x - this.geometry.boundingBox!.min.x;
    let height =
      this.geometry.boundingBox!.max.y - this.geometry.boundingBox!.min.y;

    this.geometryAspect = width / height;

    this.scale = 2 / width;

    this.geometry.text.updateSize(this.scale, this.lineHeight);

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

    this.mesh.scale.multiplyScalar(1 - this.padding.x);

    this.mesh.position.x = -1 + this.padding.x;
    this.mesh.position.y =
      1 - this.padding.y - this.scale * 0.5 * this.geometryAspect;

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
