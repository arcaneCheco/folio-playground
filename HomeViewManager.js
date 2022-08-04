import { World } from "./app";

export default class HomeViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.curlBubble = this.world.curlBubble;
    this.homeTitle = this.world.homeTitle;
    this.homeContact = this.world.homeContact;
  }

  onPointermove(e, mouse) {
    this.homeTitle.onPointermove(e, mouse);
  }

  onPointerdown() {}

  onPointerup() {}

  resize() {
    this.homeTitle.resize();
    this.homeContact.resize();
  }

  onWheel() {}

  update() {
    this.homeTitle.update();
    this.homeContact.update(this.world.time);
  }

  show() {
    this.scene.add(this.homeTitle.mesh);
    this.scene.add(this.homeContact.group);
    this.curlBubble && this.curlBubble.mesh.position.set(0, 0.3, 0);
  }

  hide() {
    this.scene.remove(this.homeTitle.mesh);
    this.scene.remove(this.homeContact.group);
  }
}
