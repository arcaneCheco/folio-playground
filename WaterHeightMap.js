import * as THREE from "three";
import RenderBuffer from "./RenderBuffer";
import vertexShader from "./shaders/waterHeightMap/vertex.glsl";
import fragmentShader from "./shaders/waterHeightMap/fragment.glsl";

export default class WaterHeightMap extends RenderBuffer {
  constructor() {
    super({});
    this.setMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setMaterial() {
    this.uniforms = {
      uBuffer: this.texture,
      uResolution: {
        // value: new THREE.Vector2(this.size, this.size),
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uMouse: { value: new THREE.Vector2() },
      uTime: { value: 0 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    });
    this.material.extensions.derivatives = true; // not sure what this does
  }

  onPointermove(uv) {
    this.uniforms.uMouse.value.x = uv.x;
    this.uniforms.uMouse.value.y = uv.y;
  }

  update(renderer, camera, time) {
    this.uniforms.uTime.value = time;
    super.update(renderer, camera);
  }
}
