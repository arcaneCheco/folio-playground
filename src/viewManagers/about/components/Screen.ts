import { Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import vertexShader from "@shaders/aboutScreen/vertex.glsl";
import fragmentShader from "@shaders/aboutScreen/fragment.glsl";
import TextTexture from "./TextTexture";
import { _AboutScreen } from "@src/@types/types";
import { World } from "@src/app";

export class Screen implements _AboutScreen {
  world = new World();
  geometry = new PlaneGeometry(1, 1);
  textTexture = new TextTexture({
    lineHeight: 1.6,
    padding: { x: 0.2, y: 0.2 },
    font: this.world.resources.fonts.anironRegular,
    text: `
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        Lorem Ipsum has been the industry*s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\n\`\n
        It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n\`\n
        Here is another paragraph. This probably won't be immediately visible but that is fine.\n\`\n
        Also, look this, Heyyy, hoo.
        `,
  });
  aspect = 2;
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTextMap: this.textTexture.texture,
      uMouse: { value: new Vector2() },
      uAspect: { value: this.aspect },
      uDistortion: { value: 0.5 },
      uInfluence: { value: 0.25 },
      uTest: { value: 0.48 },
      uProgress: { value: 0 },
    },
    transparent: true,
    depthTest: false,
  });
  mesh = new Mesh(this.geometry, this.material);
  constructor() {
    this.mesh.name = "screen";
  }

  onPointermove(uv) {
    this.material.uniforms.uMouse.value = uv;
  }

  onWheel(deltaY, renderer, camera) {
    this.textTexture.onWheel(deltaY, renderer, camera);
  }

  onTextureChange(texture) {
    this.material.uniforms.uTextMap = texture;
  }

  onResize(sizes) {
    this.mesh.scale.set(sizes.scaleX, sizes.scaleY, 1);
    this.mesh.position.y = sizes.posY;
    this.material.uniforms.uAspect.value = sizes.aspect;
  }
}
