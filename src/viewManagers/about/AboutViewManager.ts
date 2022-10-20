import { Vector3 } from "three";
import { World } from "@src/app";
import { Greeting, Overlay, Screen } from "./components";
import { View, _AboutViewManager } from "@types";
import { FolderApi } from "tweakpane";

export class AboutViewManager implements _AboutViewManager {
  world = new World();
  scene = this.world.scene;
  renderer = this.world.renderer;
  camera = this.world.camera;
  screen = new Screen();
  greeting = new Greeting();
  overlay = new Overlay();
  raycaster = this.world.raycaster;
  rayOrigin = new Vector3(0, 0, 1);
  rayTarget = new Vector3();
  debug: FolderApi;
  hover: boolean;
  target: string;
  down: boolean;
  constructor() {
    this.screen.textTexture.createTexture(this.renderer, this.camera);

    this.world.water.hiddenObjects[View.Projects]?.push(this.overlay.group);
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "about view" });
    this.screenDebug();
  }

  screenDebug() {
    const screen = this.debug.addFolder({ title: "screen" });
    screen.addInput(this.screen.material.uniforms.uDistortion, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "distortion",
    });
    screen.addInput(this.screen.material.uniforms.uInfluence, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "influence",
    });
    screen.addInput(this.screen.material.uniforms.uTest, "value", {
      min: -1,
      max: 0.5,
      step: 0.001,
      label: "test",
    });
    screen.addInput(this.screen.material.uniforms.uProgress, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "progress",
    });

    screen
      .addInput(this.screen.mesh.scale, "x", {
        label: "scale",
        min: 0,
        max: 2,
        step: 0.001,
      })
      .on("change", () => {
        this.screen.mesh.scale.y =
          this.screen.mesh.scale.x / this.screen.aspect;
      });
    screen
      .addInput(this.screen, "aspect", {
        min: 1,
        max: 3,
        step: 0.001,
      })
      .on("change", () => {
        this.screen.mesh.scale.y =
          this.screen.mesh.scale.x / this.screen.aspect;
        this.screen.material.uniforms.uAspect.value = this.screen.aspect;
        this.screen.textTexture.createTexture(this.renderer, this.camera);
      });
  }

  onPointerdown() {
    if (!this.hover) return;
    this.down = true;
  }

  onPointermove(mouse) {
    if (this.down) return;

    const [hitScreen] = this.raycaster.intersectObject(this.screen.mesh);

    if (hitScreen) {
      this.screen.onPointermove(hitScreen.uv);
    }

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.raycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.raycaster.intersectObjects(this.overlay.group.children);

    if (hit) {
      const { name } = hit.object;
      this.target = name;
      this.hover = true;
      document.body.style.cursor = "pointer";
    } else {
      this.hover = false;
      document.body.style.cursor = "";
    }
  }

  onPointerup() {
    if (!this.down) return;

    this.down = false;
    document.body.style.cursor = "";
    let url: string;
    switch (this.target) {
      case "twitter":
        url = "https://twitter.com/checo272";
        window.open(url, "_blank")?.focus();
        break;
      case "github":
        url = "https://github.com/arcaneCheco";
        window.open(url, "_blank")?.focus();
        break;
      case "linkedin":
        url = "https://www.linkedin.com/in/sergio-azizi/";
        window.open(url, "_blank")?.focus();
        break;
      case "email":
        parent.location = "mailto:abc@abc.com";
        break;
      case "cv":
        url = "https://pdfhost.io/v/6LGrrqvCt_CV";
        window.open(url, "_blank")?.focus();
        break;
      case "aboutNav":
        this.world.changeView(View.Projects);
        break;
      default:
        break;
    }
  }

  onWheel({ deltaY }: WheelEvent) {
    this.screen.onWheel(deltaY, this.renderer, this.camera);
  }

  getSizes() {
    const aspect = window.innerWidth / window.innerHeight;
    // screen
    const screen: any = {};
    screen.aspect = aspect;
    screen.scaleY = Math.min(500 / window.innerHeight, 0.8);
    screen.scaleY = 500 / window.innerHeight;
    screen.scaleX = aspect * screen.scaleY;

    screen.scaleX = 1.2;
    screen.scaleY = screen.scaleX * (9 / 16);

    screen.posY = screen.scaleY / 1.9;
    screen.posY = 0;
    screen.posY = 0.12;

    const greeting: any = {};

    greeting.scaleX = 0.06;
    greeting.scaleY = greeting.scaleX;
    greeting.posX = -screen.scaleX * 0.52;
    greeting.posY = screen.posY + screen.scaleY / 2 + greeting.scaleX * 1.2;
    greeting.mesh1posX = -screen.scaleX / 2 - greeting.scaleX / 2;

    return { screen, greeting };

    // greeting;
  }

  onResize() {
    const { screen, greeting } = this.getSizes();
    this.screen.onResize(screen);
    this.greeting.onResize(greeting);
    this.overlay.onResize();
  }

  update() {
    // this.screen.textTexture.createTexture(this.renderer, this.camera);
  }
}
