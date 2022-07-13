import * as THREE from "three";
import RenderBuffer from "./RenderBuffer";
import vertexShader from "./shaders/waterHeightMap/vertex.glsl";
import fragmentShader from "./shaders/waterHeightMap/fragment.glsl";

/****set needsUpdate using frames for performance reasons */
/***lerp mouse position */

/******HALFFLOATTYPE for webgl1 */
export default class WaterHeightMap extends RenderBuffer {
  constructor(bounds) {
    super({});
    this.bounds = bounds;
    this.setMaterial(bounds);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setMaterial() {
    this.uniforms = {
      uBuffer: this.texture,
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uAddWave: { value: false },
      uViscosity: { value: 0.98 },
      uAmplitude: { value: 0.28 },
      uMouseSize: { value: 20 }, // this doesn't scale uniformly and needs to be adjusted if mesh scale changes
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        BOUNDS: this.bounds.toFixed(1),
        RESOLUTION: this.size.toFixed(1),
        PI: Math.PI.toFixed(8),
      },
    });
  }

  onPointermove(uv) {
    this.uniforms.uAddWave.value = true;
    this.uniforms.uMouse.value.x = uv.x;
    this.uniforms.uMouse.value.y = uv.y;
  }

  update(renderer, camera) {
    super.update(renderer, camera);
    this.uniforms.uAddWave.value = false;
  }
}
