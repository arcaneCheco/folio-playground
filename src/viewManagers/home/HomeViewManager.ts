import { World } from "@src//app";
import { Contact, Title, Nav } from "./components";
import { _HomeViewManager, View } from "@types";
import { FolderApi } from "tweakpane";
import { Vector2, Vector3 } from "three";

export class HomeViewManager implements _HomeViewManager {
  world = new World();
  scene = this.world.scene;
  curlBubble = this.world.curlBubble;
  raycaster = this.world.raycaster;
  title = new Title();
  contact = new Contact();
  nav = new Nav();
  rayOrigin = new Vector3(0, 0, 1);
  rayTarget = new Vector3();
  resizeSettings = {
    offsetTop: 0.2,
    posX: -0.3,
    scale: 0.75,
    contactRatio: 0.8,
    navSize: 0.5,
  };
  debug: FolderApi;

  constructor() {
    this.world.water.hiddenObjects[View.Home]?.push(
      this.title.mesh,
      this.contact.group,
      this.nav.group
    );
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

  onPointermove(e: PointerEvent, mouse: Vector2) {
    this.rayTarget.set(mouse.x, mouse.y, -1);
    this.raycaster.set(this.rayOrigin, this.rayTarget.normalize());

    const [hit] = this.raycaster.intersectObjects([
      this.title.mesh,
      ...this.nav.group.children,
      this.contact.touchPlane,
    ]);
    if (hit) {
      const { name } = hit.object;

      if (name === "homeTitle") {
        this.title.onPointermove(e, hit.uv);

        if (this.nav.hover || this.contact.hover) {
          this.nav.hover = false;
          this.contact.hover = false;
          document.body.style.cursor = "";
        }
      } else if (name === "homeNav") {
        if (!this.nav.hover) {
          this.nav.hover = true;
          document.body.style.cursor = "pointer";
        }
      } else if (name === "email") {
        if (!this.contact.hover) {
          document.body.style.cursor = "pointer";
          this.contact.hover = true;
        }
      }
    } else {
      if (this.nav.hover || this.contact.hover) {
        this.nav.hover = false;
        this.contact.hover = false;
        document.body.style.cursor = "";
      }
    }

    this.nav.onPointermove();
    this.curlBubble.onPointermove(mouse);
  }

  onPointerdown() {
    this.nav.hover && (this.nav.down = true);
    this.contact.hover && (this.contact.down = true);
    this.nav.onPointerdown();
    this.curlBubble.onPointerdown();
  }

  onPointerup() {
    if (this.nav.hover && this.nav.down) {
      this.nav.down = false;
      this.nav.hover = false;
      document.body.style.cursor = "";
      this.world.changeView(View.Projects);
    }

    if (this.contact.hover && this.contact.down) {
      parent.location = "mailto:abc@abc.com";
    }

    this.nav.onPointerup();
    this.curlBubble.onPointerup();
  }

  getSizes() {
    const widthRatio = 2 / window.innerWidth;
    const heightRatio = 2 / window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    let title: any = {};
    let contact: any = {};
    let nav: any = {};

    // title
    title.scaleY = this.resizeSettings.scale;
    title.scaleX = title.scaleY / aspect;

    title.posX = this.resizeSettings.posX * title.scaleX;
    title.posY = 1 - title.scaleY * 0.65 - this.resizeSettings.offsetTop;

    //contact
    contact.ctaScaleX = title.scaleX * 1.4 * this.resizeSettings.contactRatio;

    contact.ctaScaleY = contact.ctaScaleX * aspect;
    contact.emailScaleX = contact.ctaScaleX * 0.8;

    contact.emailScaleY = contact.emailScaleX * aspect;
    contact.emailOffset = contact.ctaScaleX - contact.emailScaleX;

    contact.iconScaleX = contact.emailOffset;
    contact.iconScaleY = contact.iconScaleX * aspect;

    contact.posX =
      title.posX -
      title.scaleX * 0.7 +
      title.scaleX * 1.4 * (1 - this.resizeSettings.contactRatio);

    contact.posY = title.posY - title.scaleY * 0.9;

    nav.scaleX = this.resizeSettings.navSize;
    nav.scaleY = this.resizeSettings.navSize / aspect;

    nav.posX = -title.scaleX * Math.min(aspect * 0.9, 1.3) + title.posX;
    nav.posY = -0.5;

    return { title, contact, nav };
  }

  resize() {
    const { title, contact, nav } = this.getSizes();

    this.title.resize(title);
    this.contact.resize(contact);
    this.nav.resize(nav);
    this.curlBubble.resize();
  }

  onWheel() {
    this.curlBubble.onWheel();
  }

  update() {
    this.title.update();
    this.contact.update(this.world.time);
    this.curlBubble.update();
  }

  show() {
    this.scene.add(this.title.group);
    this.scene.add(this.contact.group);
    this.scene.add(this.nav.group);
    this.scene.add(this.curlBubble.mesh);
  }

  hide() {
    this.scene.remove(this.title.group);
    this.scene.remove(this.contact.group);
    this.scene.remove(this.nav.group);
    this.scene.remove(this.curlBubble.mesh);
  }
}
