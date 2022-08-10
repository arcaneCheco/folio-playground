import { World } from "./app";

export default class AboutViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.aboutScreen = this.world.aboutScreen;
    this.aboutGreeting = this.world.aboutGreeting;
    this.aboutSocialIcons = this.world.aboutSocialIcons;
    this.aboutFooter = this.world.aboutFooter;
  }

  setDebug() {}

  onPointerdown() {}

  onPointermove() {}

  onPointerup() {}

  onWheel() {}

  onResize() {}

  update() {}

  show() {
    this.world.camera.position.z = 0.35;
    this.scene.add(this.aboutScreen.mesh);
    this.scene.add(this.aboutGreeting.group);
    this.scene.add(this.aboutSocialIcons.group);
    this.scene.add(this.aboutFooter.group);
  }

  hide() {
    this.world.camera.position.z = 0.85;
    this.scene.remove(this.aboutScreen.mesh);
    this.scene.remove(this.aboutGreeting.group);
    this.scene.remove(this.aboutSocialIcons.group);
    this.scene.remove(this.aboutFooter.group);
  }
}
