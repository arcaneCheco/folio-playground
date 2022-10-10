import { Mesh, ShaderMaterial, Vector2, WebGLRenderer } from "three";
import vertexShader from "@shaders/flowmap/vertex.glsl";
import fragmentShader from "@shaders/flowmap/fragment.glsl";
import { _Flowmap } from "@types";
import { RenderBuffer } from "./RenderBuffer";

interface FlowmapProps {
  falloff?: number;
  alpha?: number;
  dissipation?: number;
}

export class Flowmap extends RenderBuffer implements _Flowmap {
  velocity: Vector2 & { needsUpdate?: boolean } = new Vector2();
  mouse = new Vector2();
  lastMouse = new Vector2();
  lastTime: number | null = null;
  uniforms = {
    uBuffer: this.texture,
    uAspect: { value: 1 },
    uMouse: { value: this.mouse },
    uVelocity: { value: this.velocity },
    uFalloff: { value: 0 },
    uAlpha: { value: 0 },
    uDissipation: { value: 0 },
  };
  material: ShaderMaterial;
  mesh: Mesh;
  constructor(props?: FlowmapProps) {
    super();

    this.uniforms.uFalloff.value = props?.falloff || 0.15;
    this.uniforms.uAlpha.value = props?.alpha || 1;
    this.uniforms.uDissipation.value = props?.dissipation || 0.98;

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      depthWrite: false,
      depthTest: false,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onPointermove(
    { clientX, clientY }: { clientX: number; clientY: number },
    uv: Vector2
  ) {
    this.mouse.set(uv.x, uv.y);

    // Calculate velocity
    if (!this.lastTime) {
      this.lastTime = performance.now();
      this.lastMouse.copy({ x: clientX, y: clientY } as Vector2);
    }

    const deltaX = clientX - this.lastMouse.x;
    const deltaY = clientY - this.lastMouse.y;

    this.lastMouse.copy({ x: clientX, y: clientY } as Vector2);

    const time = performance.now();

    // Avoid dividing by 0
    const delta = Math.max(14, time - this.lastTime);
    this.lastTime = time;

    this.velocity.x = deltaX / delta;
    this.velocity.y = deltaY / delta;

    // Flag update to prevent hanging velocity values when not moving
    this.velocity.needsUpdate = true;
  }

  updateInputs() {
    // Reset velocity when mouse not moving
    if (!this.velocity.needsUpdate) {
      this.mouse.set(-1, -1);
      this.velocity.set(0, 0);
      this.lastTime = null;
    }
    this.velocity.needsUpdate = false;

    // Update flowmap inputs
    this.uniforms.uMouse.value.copy(this.mouse);

    // Ease velocity input, slower when fading out
    this.uniforms.uVelocity.value.lerp(
      this.velocity,
      this.velocity.length() ? 0.5 : 0.1
    );
  }

  update(renderer: WebGLRenderer) {
    this.updateInputs();
    super.update(renderer);
  }
}
