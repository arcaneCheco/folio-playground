import { World } from "./app";

export default class HomeViewManager {
  constructor() {
    this.world = new World();
    this.curlBubble = this.world.curlBubble;
  }

  onPointermove() {}

  onPointerdown() {}

  onPointerup() {}

  resize() {}

  onWheel() {}

  update() {}

  show() {
    this.curlBubble && this.curlBubble.mesh.position.set(0, 0.3, 0);
  }

  hide() {}
}
