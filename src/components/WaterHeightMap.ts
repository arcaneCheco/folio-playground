import { Mesh, ShaderMaterial, Vector2, WebGLRenderer } from "three";
import { RenderBuffer } from "@utils/RenderBuffer";
import vertexShader from "@shaders/waterHeightMap/vertex.glsl";
import fragmentShader from "@shaders/waterHeightMap/fragment.glsl";

/****set needsUpdate using frames for performance reasons */
/***lerp mouse position */

/******HALFFLOATTYPE for webgl1 */
export default class WaterHeightMap extends RenderBuffer {
  bounds: number;
  uniforms = {
    uBuffer: this.texture,
    uMouse: { value: new Vector2(-1, -1) },
    uAddWave: { value: false },
    uViscosity: { value: 0.985 },
    uAmplitude: { value: 0.48 },
    uMouseSize: { value: 20 },
  };
  material: ShaderMaterial;
  mesh: Mesh;
  constructor(bounds: number) {
    super();

    this.bounds = bounds;

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        BOUNDS: this.bounds.toFixed(1),
        RESOLUTION: this.size.toFixed(1),
        PI: Math.PI.toFixed(8),
      },
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onPointermove(uv: Vector2) {
    this.uniforms.uAddWave.value = true;
    this.uniforms.uMouse.value.x = uv.x;
    this.uniforms.uMouse.value.y = uv.y;
  }

  update(renderer: WebGLRenderer) {
    super.update(renderer);
    this.uniforms.uAddWave.value = false;
  }
}
