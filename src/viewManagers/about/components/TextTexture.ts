import * as THREE from "three";
import TextGeometry from "@utils/TextGeometry";
import vertexShader from "@shaders/basicText/vertex.glsl";
import fragmentShader from "@shaders/basicText/fragment.glsl";
import { clamp } from "three/src/math/MathUtils";
import { World } from "@src/app";

export default class TextTexture {
  geometry;
  material;
  mesh;
  initialOffset;
  maxScroll;
  renderTarget;
  texture;
  scene;
  font;
  constructor({ lineHeight = 1.6, padding = { x: 0.2, y: 0.2 } }) {
    this.font = new World().resources.fonts.audiowideRegular;
    this.geometry = new TextGeometry();
    this.geometry.setText({
      font: this.font.data,
      text: `
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry*s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\n\`\n
        It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\`\n      
        Here is another paragraph. This probably won't be immediately visible but that is fine.\n\`\n
        Also, look this, Heyyy, hoo.
        `,
      align: "left",
      lineHeight,
      lineWidth: 2 - padding.x * 2,
    });

    let fontSize = 0.11;

    this.geometry.text.updateSize(fontSize);

    this.geometry.computeBoundingBox();
    let height =
      this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: this.font.map },
      },
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.x = -1 + padding.x;
    this.initialOffset = 1 - fontSize * 0.5 - padding.y;
    this.maxScroll = this.initialOffset + height + padding.y * 2 - 2;
    this.mesh.position.y = this.initialOffset;

    this.renderTarget = new THREE.WebGLRenderTarget(512, 512, {
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
    });

    this.texture = { value: this.renderTarget.texture };

    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
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
    // renderer.render(this.scene, camera);
  }
}
