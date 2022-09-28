import { World } from "../app";
import * as THREE from "three";

export default class AboutViewManager {
  world = new World();
  scene = this.world.scene;
  aboutScreen = this.world.aboutScreen;
  renderer = this.world.renderer;
  camera = this.world.camera;
  aboutGreeting: any;
  aboutOverlay: any;
  raycaster: any;
  rayOrigin: any;
  rayTarget: any;
  debug: any;
  hover: any;
  target: any;
  down: any;
  constructor() {
    window.setTimeout(() => {
      this.aboutScreen.textTexture.createTexture(this.renderer, this.camera);
    }, 500);

    this.aboutGreeting = this.world.aboutGreeting;
    this.aboutOverlay = this.world.aboutOverlay;
    this.raycaster = this.world.raycaster;
    this.rayOrigin = new THREE.Vector3(0, 0, 1);
    this.rayTarget = new THREE.Vector3();
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "about view" });
    this.screenDebug();
  }

  screenDebug() {
    const screen = this.debug.addFolder({ title: "screen" });
    screen.addInput(this.aboutScreen.material.uniforms.uDistortion, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "distortion",
    });
    screen.addInput(this.aboutScreen.material.uniforms.uInfluence, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "influence",
    });
    screen.addInput(this.aboutScreen.material.uniforms.uTest, "value", {
      min: -1,
      max: 0.5,
      step: 0.001,
      label: "test",
    });
    screen.addInput(this.aboutScreen.material.uniforms.uProgress, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "progress",
    });

    screen
      .addInput(this.aboutScreen.mesh.scale, "x", {
        label: "scale",
        min: 0,
        max: 2,
        step: 0.001,
      })
      .on("change", () => {
        this.aboutScreen.mesh.scale.y =
          this.aboutScreen.mesh.scale.x / this.aboutScreen.aspect;
      });
    screen
      .addInput(this.aboutScreen, "aspect", {
        min: 1,
        max: 3,
        step: 0.001,
      })
      .on("change", () => {
        this.aboutScreen.mesh.scale.y =
          this.aboutScreen.mesh.scale.x / this.aboutScreen.aspect;
        this.aboutScreen.material.uniforms.uAspect.value =
          this.aboutScreen.aspect;
        this.aboutScreen.textTexture.createTexture(this.renderer, this.camera);
      });
  }

  onPointerdown() {
    if (!this.hover) return;
    this.down = true;
  }

  onPointermove(mouse) {
    if (this.down) return;

    const [hitScreen] = this.raycaster.intersectObject(this.aboutScreen.mesh);

    if (hitScreen) {
      this.aboutScreen.onPointermove(hitScreen.uv);
    }

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.raycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.raycaster.intersectObjects(
      this.aboutOverlay.group.children
    );

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
    let url;
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
        url = "CV.pdf";
        window.open(url, "_blank")?.focus();
        break;
      case "aboutNav":
        this.world.changeView("projects");
        break;
      default:
        break;
    }
  }

  onWheel({ deltaY }) {
    this.aboutScreen.onWheel(deltaY, this.renderer, this.camera);
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
    greeting.posX = -screen.scaleX * 0.51;
    greeting.posY = screen.posY + screen.scaleY / 2 + greeting.scaleX * 1.2;
    greeting.mesh1posX = -screen.scaleX / 2 - greeting.scaleX / 2;

    return { screen, greeting };

    // greeting;
  }

  onResize() {
    const { screen, greeting } = this.getSizes();
    this.aboutScreen.onResize(screen);
    this.aboutGreeting.onResize(greeting);
    this.aboutOverlay.onResize();
  }

  update() {
    // this.aboutScreen.textTexture.createTexture(this.renderer, this.camera);
  }

  show() {
    // this.world.camera.position.z = 0.35;
    this.scene.add(this.aboutScreen.mesh);
    this.scene.add(this.aboutGreeting.group);
    this.scene.add(this.aboutOverlay.group);
  }

  hide() {
    // this.world.camera.position.z = 1;
    this.scene.remove(this.aboutScreen.mesh);
    this.scene.remove(this.aboutGreeting.group);
    this.scene.remove(this.aboutOverlay.group);
  }
}
