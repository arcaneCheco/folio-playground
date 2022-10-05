import * as THREE from "three";
import vertexShader from "@shaders/aboutScreen/vertex.glsl";
import fragmentShader from "@shaders/aboutScreen/fragment.glsl";
import TextTexture from "./TextTexture";

export class Screen {
  geometry = new THREE.PlaneGeometry(1, 1);
  aspect = 2;
  textTexture = new TextTexture({});
  material: any;
  mesh: any;
  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTextMap: this.textTexture.texture,
        uMouse: { value: new THREE.Vector2() },
        uAspect: { value: this.aspect },
        uDistortion: { value: 0.5 },
        uInfluence: { value: 0.25 },
        uTest: { value: 0.48 },
        uProgress: { value: 0 },
      },
      transparent: true,
      depthTest: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

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
