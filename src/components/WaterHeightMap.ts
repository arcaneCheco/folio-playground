import * as THREE from "three";
import RenderBuffer from "@utils/RenderBuffer";
import vertexShader from "@shaders/waterHeightMap/vertex.glsl";
import fragmentShader from "@shaders/waterHeightMap/fragment.glsl";

/****set needsUpdate using frames for performance reasons */
/***lerp mouse position */

/******HALFFLOATTYPE for webgl1 */
export default class WaterHeightMap extends RenderBuffer {
  bounds;
  mesh;
  uniforms;
  material;
  constructor(bounds) {
    super({});
    this.bounds = bounds;
    this.setMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setMaterial() {
    this.uniforms = {
      uBuffer: this.texture,
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uAddWave: { value: false },
      uViscosity: { value: 0.985 },
      uAmplitude: { value: 0.48 },
      uMouseSize: { value: 20 },
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

  update(renderer) {
    super.update(renderer);
    this.uniforms.uAddWave.value = false;
  }
}
