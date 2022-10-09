import { Vector2, Vector3 } from "three";
import { World } from "@src/app";
import { _Parallax } from "@types";

interface ParallaxProps {
  lerp?: number;
  magX?: number;
  magY?: number;
  enabled?: boolean;
  direction?: 1 | -1;
  target?: Vector2;
}

export class Parallax implements _Parallax {
  world = new World();
  camera = this.world.camera;
  initialHeight = this.world.initialHeight;
  mouse = this.world.mouse;
  lerp: number;
  magX: number;
  magY: number;
  enabled: boolean;
  direction: 1 | -1;
  target: Vector2;
  constructor(props?: ParallaxProps) {
    this.lerp = props?.lerp || 0.01;
    this.magX = props?.magX || 0.18;
    this.magY = props?.magY || 0.3;
    this.enabled = props?.enabled || true;
    this.direction = props?.direction || 1;
    this.target = props?.target || new Vector2();
  }

  updateTarget() {
    if (!this.enabled) return;
    this.target.y = this.mouse.y * this.magY;
    this.target.x = this.mouse.x * this.magX * this.direction;
  }

  update() {
    if (this.enabled) {
      this.camera.position.x +=
        (this.target.x - this.camera.position.x) * this.lerp;
      this.camera.position.y +=
        (this.target.y + this.initialHeight - this.camera.position.y) *
        this.lerp;
      this.camera.position.y = Math.max(this.camera.position.y, 0.05);

      this.camera.lookAt(new Vector3(0, 0, 0));
    }
  }
}
