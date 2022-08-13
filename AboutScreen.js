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
        uMouse: { value: new THREE.Vector2() },
        uAspect: { value: 2 },
        uDistortion: { value: 0.5 },
        uInfluence: { value: 0.25 },
        uTest: { value: 0.48 },
        uProgress: { value: 1 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.name = "screen";

    this.mesh.scale.set(0.4, 0.2, 1);
    this.mesh.position.y = 0.17;
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
}
