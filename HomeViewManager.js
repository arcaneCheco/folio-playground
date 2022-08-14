import { World } from "./app";
import * as THREE from "three";

export default class HomeViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.curlBubble = this.world.curlBubble;
    this.homeTitle = this.world.homeTitle;
    this.homeContact = this.world.homeContact;
    this.homeNav = this.world.homeNav;
    this.raycaster = this.world.raycaster;
    this.rayOrigin = new THREE.Vector3(0, 0, 1);
    this.rayTarget = new THREE.Vector3();

    this.resizeSettings = {
      offsetTop: 0.2,
      posX: -0.3,
      scale: 0.75,
      contactRatio: 0.8,
      navSize: 0.5,
    };
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "homeViewManager",
      expanded: false,
    });
    this.debug
      .addInput(this.resizeSettings, "offsetTop", {
        min: 0,
        max: 1,
        step: 0.001,
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
      .addInput(this.resizeSettings, "scale", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", () => this.resize());
    this.debug
      .addInput(this.resizeSettings, "contactRatio", {
        min: 0,
        max: 1.3,
        step: 0.001,
      })
      .on("change", () => this.resize());
    this.debug
      .addInput(this.resizeSettings, "navSize", {
        min: 0,
        max: 1.3,
        step: 0.001,
      })
      .on("change", () => this.resize());
  }

  onPointermove(e, mouse) {
    this.rayTarget.set(mouse.x, mouse.y, -1);
    this.raycaster.set(this.rayOrigin, this.rayTarget.normalize());

    const [hit] = this.raycaster.intersectObjects([
      this.homeTitle.mesh,
      ...this.homeNav.group.children,
      this.homeContact.touchPlane,
    ]);
    if (hit) {
      const { name } = hit.object;

      if (name === "homeTitle") {
        this.homeTitle.onPointermove(e, hit.uv);

        if (this.homeNav.hover || this.homeContact.hover) {
          this.homeNav.hover = false;
          this.homeContact.hover = false;
          document.body.style.cursor = "";
        }
      } else if (name === "homeNav") {
        if (!this.homeNav.hover) {
          this.homeNav.hover = true;
          document.body.style.cursor = "pointer";
        }
      } else if (name === "email") {
        if (!this.homeContact.hover) {
          document.body.style.cursor = "pointer";
          this.homeContact.hover = true;
        }
      }
    } else {
      if (this.homeNav.hover || this.homeContact.hover) {
        this.homeNav.hover = false;
        this.homeContact.hover = false;
        document.body.style.cursor = "";
      }
    }

    this.homeNav.onPointermove();
    this.curlBubble.onPointermove(mouse);
  }

  onPointerdown() {
    this.homeNav.hover && (this.homeNav.down = true);
    this.homeContact.hover && (this.homeContact.down = true);
    this.homeNav.onPointerdown();
    this.curlBubble.onPointerdown();
  }

  onPointerup() {
    if (this.homeNav.hover && this.homeNav.down) {
      this.homeNav.down = false;
      this.homeNav.hover = false;
      document.body.style.cursor = "";
      this.world.changeView("projects");
    }

    if (this.homeContact.hover && this.homeContact.down) {
      parent.location = "mailto:abc@abc.com";
    }

    this.homeNav.onPointerup();
    this.curlBubble.onPointerup();
  }

  getSizes(device) {
    const widthRatio = 2 / window.innerWidth;
    const heightRatio = 2 / window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    let homeTitle = {};
    let homeContact = {};
    let homeNav = {};

    // homeTitle
    homeTitle.scaleY = this.resizeSettings.scale;
    homeTitle.scaleX = homeTitle.scaleY / aspect;

    homeTitle.posX = this.resizeSettings.posX * homeTitle.scaleX;
    homeTitle.posY =
      1 - homeTitle.scaleY * 0.65 - this.resizeSettings.offsetTop;

    //homeContact
    homeContact.ctaScaleX =
      homeTitle.scaleX * 1.4 * this.resizeSettings.contactRatio;

    homeContact.ctaScaleY = homeContact.ctaScaleX * aspect;
    homeContact.emailScaleX = homeContact.ctaScaleX * 0.8;

    homeContact.emailScaleY = homeContact.emailScaleX * aspect;
    homeContact.emailOffset = homeContact.ctaScaleX - homeContact.emailScaleX;

    homeContact.iconScaleX = homeContact.emailOffset;
    homeContact.iconScaleY = homeContact.iconScaleX * aspect;

    homeContact.posX =
      homeTitle.posX -
      homeTitle.scaleX * 0.7 +
      homeTitle.scaleX * 1.4 * (1 - this.resizeSettings.contactRatio);

    homeContact.posY = homeTitle.posY - homeTitle.scaleY * 0.9;

    homeNav.scaleX = this.resizeSettings.navSize;
    homeNav.scaleY = this.resizeSettings.navSize / aspect;

    homeNav.posX =
      -homeTitle.scaleX * Math.min(aspect * 0.9, 1.3) + homeTitle.posX;
    homeNav.posY = -0.5;

    return { homeTitle, homeContact, homeNav };
  }

  resize() {
    const { homeTitle, homeContact, homeNav } = this.getSizes();

    this.homeTitle.resize(homeTitle);
    this.homeContact.resize(homeContact);
    this.homeNav.resize(homeNav);
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
    this.scene.add(this.homeNav.group);
    this.curlBubble && this.scene.add(this.curlBubble.mesh);
    // this.curlBubble && this.curlBubble.mesh.position.set(0, 0.3, 0);
  }

  hide() {
    this.scene.remove(this.homeTitle.group);
    this.scene.remove(this.homeContact.group);
    this.scene.remove(this.homeNav.group);
    this.curlBubble && this.scene.remove(this.curlBubble.mesh);
  }
}
