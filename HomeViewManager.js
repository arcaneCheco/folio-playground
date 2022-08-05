import { World } from "./app";

export default class HomeViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.curlBubble = this.world.curlBubble;
    this.homeTitle = this.world.homeTitle;
    this.homeContact = this.world.homeContact;

    this.resizeSettings = {
      offsetTop: 50,
      posX: -0.1,
      maxScale: 749,
      scale: 0.4,
    };
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "homeViewManager" });
    this.debug
      .addInput(this.resizeSettings, "offsetTop", {
        min: 0,
        max: 500,
        step: 1,
      })
      .on("change", () => this.resize());
    this.debug
      .addInput(this.resizeSettings, "posX", {
        min: -1,
        max: 0,
        step: 0.001,
      })
      .on("change", () => this.resize());
    this.debug
      .addInput(this.resizeSettings, "maxScale", {
        min: 100,
        max: 1200,
        step: 1,
      })
      .on("change", () => this.resize());
    this.debug
      .addInput(this.resizeSettings, "scale", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", () => this.resize());
  }

  onPointermove(e, mouse) {
    this.homeTitle.onPointermove(e, mouse);
    this.curlBubble.onPointermove();
  }

  onPointerdown() {
    this.curlBubble.onPointerdown();
  }

  onPointerup() {
    this.curlBubble.onPointerup();
  }

  getSizes(device) {
    const widthRatio = 2 / window.innerWidth;
    const heightRatio = 2 / window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    let homeTitle = {};
    let homeContact = {};

    // homeTitle
    homeTitle.scaleX = Math.min(
      this.resizeSettings.maxScale * 0.5 * widthRatio,
      this.resizeSettings.scale
    );
    homeTitle.scaleY = homeTitle.scaleX * aspect;
    homeTitle.posX = this.resizeSettings.posX;
    homeTitle.posY =
      1 - homeTitle.scaleY * 0.65 - this.resizeSettings.offsetTop * heightRatio;
    //homeContact
    homeContact.posX = this.resizeSettings.posX - homeTitle.scaleX * 0.7;
    homeContact.posY = homeTitle.posY - homeTitle.scaleY * 0.9;
    homeContact.ctaScaleX = homeTitle.scaleX * 1.4;
    homeContact.ctaScaleY = homeContact.ctaScaleX * aspect;
    homeContact.emailScaleX = homeContact.ctaScaleX * 0.8;
    homeContact.emailScaleY = homeContact.emailScaleX * aspect;
    homeContact.emailOffset = homeContact.ctaScaleX - homeContact.emailScaleX;
    homeContact.iconScaleX = homeContact.emailOffset;
    homeContact.iconScaleY = homeContact.iconScaleX * aspect;

    return { homeTitle, homeContact };
  }

  resize() {
    let orientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";

    let device =
      window.innerWidth > 749
        ? "desktop"
        : window.innerWidth > 481
        ? "ipad"
        : "mobile";

    const { homeTitle, homeContact } = this.getSizes(device);

    this.homeTitle.resize(homeTitle);
    this.homeContact.resize(homeContact);
    this.curlBubble.resize();
  }

  onWheel() {
    this.curlBubble.onWheel();
  }

  update() {
    this.homeTitle.update();
    this.homeContact.update(this.world.time);
    this.curlBubble.update();
  }

  show() {
    this.scene.add(this.homeTitle.group);
    this.scene.add(this.homeContact.group);
    this.curlBubble && this.scene.add(this.curlBubble.mesh);
    // this.curlBubble && this.curlBubble.mesh.position.set(0, 0.3, 0);
  }

  hide() {
    this.scene.remove(this.homeTitle.group);
    this.scene.remove(this.homeContact.group);
    this.curlBubble && this.scene.remove(this.curlBubble.mesh);
  }
}
