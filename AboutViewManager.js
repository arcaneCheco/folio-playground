import { World } from "./app";
import * as THREE from "three";

export default class AboutViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.aboutScreen = this.world.aboutScreen;

    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
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
        window.open(url, "_blank").focus();
        break;
      case "github":
        url = "https://github.com/arcaneCheco";
        window.open(url, "_blank").focus();
        break;
      case "linkedin":
        url = "https://www.linkedin.com/in/sergio-azizi/";
        window.open(url, "_blank").focus();
        break;
      case "email":
        parent.location = "mailto:abc@abc.com";
        break;
      case "cv":
        url = "CV.pdf";
        window.open(url, "_blank").focus();
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

  onResize() {}

  update() {
    // this.aboutScreen.textTexture.createTexture(this.renderer, this.camera);
  }

  show() {
    this.world.camera.position.z = 0.35;
    this.scene.add(this.aboutScreen.mesh);
    this.scene.add(this.aboutGreeting.group);
    this.scene.add(this.aboutOverlay.group);
  }

  hide() {
    this.world.camera.position.z = 1;
    this.scene.remove(this.aboutScreen.mesh);
    this.scene.remove(this.aboutGreeting.group);
    this.scene.remove(this.aboutOverlay.group);
  }
}
