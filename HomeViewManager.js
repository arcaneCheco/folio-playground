import { World } from "./app";

export default class HomeViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.curlBubble = this.world.curlBubble;
    this.homeTitle = this.world.homeTitle;
  }

  onPointermove(e) {
    this.homeTitle.onPointermove(e);
  }

  onPointerdown() {}

  onPointerup() {}

  resize() {}

  onWheel() {}

  update() {
    this.homeTitle.update();
  }

  show() {
    this.scene.add(this.homeTitle.mesh);
    this.curlBubble && this.curlBubble.mesh.position.set(0, 0.3, 0);
  }

  hide() {
    this.scene.remove(this.homeTitle.mesh);
  }
}
