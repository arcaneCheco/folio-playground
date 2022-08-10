import * as THREE from "three";
import vertexShader from "./shaders/aboutScreen/vertex.glsl";
import fragmentShader from "./shaders/aboutScreen/fragment.glsl";
import AboutTextTexture from "./AboutTextTexture";

export default class AboutScreen {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.textTexture = new AboutTextTexture({});

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTextMap: this.textTexture.texture,
      },
      // transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.scale.set(0.4, 0.2, 1);
    this.mesh.position.y = 0.17;
  }

  onWheel(deltaY, renderer, camera) {
    this.textTexture.onWheel(deltaY, renderer, camera);
  }

  onTextureChange(texture) {
    this.material.uniforms.uTextMap = texture;
  }
}
