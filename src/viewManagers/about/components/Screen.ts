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
        I'm a full-stack developer currently employed at London-based media/tech company IMG Arena, where I'm building products that aim to bolster fan engagement for live sporting events through instant data feeds, 3D data visualisation and interactivity.
        I love writing shaders and create 3D and interactive websites.\n\~\n
        If you are looking for freelance developers or want to collaborate on a projects feel free to reach out!
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
      uDistortion: { value: 0.35 },
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
    // this.material.uniforms.uAspect.value = sizes.aspect;
  }
}
