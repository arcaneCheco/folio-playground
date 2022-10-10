import TextGeometry from "@utils/TextGeometry";
import vertexShader from "@shaders/basicText/vertex.glsl";
import fragmentShader from "@shaders/basicText/fragment.glsl";
import { clamp } from "three/src/math/MathUtils";
import { World } from "@src/app";
import { Font, Padding, TextAlign, _AboutTextTexture } from "@types";
import {
  HalfFloatType,
  IUniform,
  LinearFilter,
  Mesh,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderTarget,
} from "three";

interface Props {
  lineHeight?: number;
  padding: Padding;
  font: Font;
  text: string;
}

export default class TextTexture implements _AboutTextTexture {
  font: Font;
  geometry = new TextGeometry();
  lineHeight: number;
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: null },
    },
    transparent: true,
  });
  mesh = new Mesh(this.geometry, this.material);
  renderTarget = new WebGLRenderTarget(512, 512, {
    depthBuffer: false,
    stencilBuffer: false,
    minFilter: LinearFilter,
    type: HalfFloatType,
    format: RGBAFormat,
    generateMipmaps: false,
  });
  texture: IUniform<Texture> = { value: this.renderTarget.texture };
  scene = new Scene();
  initialOffset: number;
  maxScroll: number;
  constructor(props: Props) {
    this.font = props.font;
    this.material.uniforms.tMap.value = this.font.map;
    this.lineHeight = props.lineHeight || 1.6;

    this.scene.add(this.mesh);

    this.geometry.setText({
      fontData: this.font.data,
      text: props.text,
      align: TextAlign.Left,
      lineHeight: props.lineHeight || 1.6,
      lineWidth: 2 - props.padding.x * 2,
    });

    let fontSize = 0.11;
    this.geometry.text.updateSize(fontSize, this.lineHeight);
    this.geometry.computeBoundingBox();
    let height =
      this.geometry.boundingBox!.max.y - this.geometry.boundingBox!.min.y;

    this.mesh.position.x = -1 + props.padding.x;
    this.initialOffset = 1 - fontSize * 0.5 - props.padding.y;
    this.maxScroll = this.initialOffset + height + props.padding.y * 2 - 2;
    this.mesh.position.y = this.initialOffset;
  }

  onWheel(deltaY, renderer, camera) {
    const newPos = clamp(
      this.mesh.position.y + deltaY * 0.001,
      this.initialOffset,
      this.maxScroll
    );
    this.mesh.position.y = newPos;
    this.createTexture(renderer, camera);
  }

  createTexture(renderer, camera) {
    const currentRenderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.scene, camera);
    this.texture.value = this.renderTarget.texture;
    renderer.setRenderTarget(currentRenderTarget);
    renderer.clear();
  }
}
