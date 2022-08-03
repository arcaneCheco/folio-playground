import * as THREE from "three";
import RenderBuffer from "./RenderBuffer";
import vertexShader from "./shaders/flowmap/vertex.glsl";
import fragmentShader from "./shaders/flowmap/fragment.glsl";

export default class Flowmap extends RenderBuffer {
  constructor(falloff = 0.15, alpha = 1, dissipation = 0.98) {
    super({});

    this.velocity = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
    this.lastMouse = new THREE.Vector2();
    this.lastTime = null;

    this.setMaterial(falloff, alpha, dissipation);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setMaterial(falloff, alpha, dissipation) {
    this.uniforms = {
      uBuffer: this.texture,
      //
      uFalloff: { value: falloff },
      uAlpha: { value: alpha },
      uDissipation: { value: dissipation },
      //
      uAspect: { value: 1 },
      uMouse: { value: this.mouse },
      uVelocity: { value: this.velocity },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      depthWrite: false,
      depthTest: false,
      //   blending: THREE.NoBlending,
    });
  }

  onPointermove({ clientX, clientY }, uv) {
    this.mouse.set(uv.x, uv.y);

    // Calculate velocity
    if (!this.lastTime) {
      this.lastTime = performance.now();
      this.lastMouse.copy({ x: clientX, y: clientY });
    }

    const deltaX = clientX - this.lastMouse.x;
    const deltaY = clientY - this.lastMouse.y;

    this.lastMouse.copy({ x: clientX, y: clientY });

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

  update(renderer, camera) {
    this.updateInputs();
    super.update(renderer, camera);
  }
}
