import { PerspectiveCamera, Vector2, Vector3 } from "three";
import { World } from "@src/app";

interface Props {
  lerp?: number;
  magX?: number;
  magY?: number;
  enabled?: boolean;
  direction?: number;
  target?: Vector2;
}

export class Parallax {
  lerp: number;
  magX: number;
  magY: number;
  enabled: boolean;
  direction: number;
  target: Vector2;
  world: World;
  camera: PerspectiveCamera;
  initialHeight: number;
  mouse: Vector2;
  constructor({
    lerp = 0.01,
    magX = 0.18,
    magY = 0.3,
    enabled = true,
    direction = 1,
    target = new Vector2(),
  }: Props) {
    this.world = new World();
    this.camera = this.world.camera;
    this.initialHeight = this.world.initialHeight;
    this.mouse = this.world.mouse;
    this.lerp = lerp;
    this.magX = magX;
    this.magY = magY;
    this.enabled = enabled;
    this.direction = direction;
    this.target = target;
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
