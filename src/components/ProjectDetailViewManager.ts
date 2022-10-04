import * as THREE from "three";
import { World } from "../app";

export default class ProjectDetailViewManager {
  world = new World();
  scene = this.world.scene;
  activeProjectState = this.world.activeProjectState;
  projectScreen = this.world.projectScreen;
  projectDetailOverlay = this.world.projectDetailOverlay;
  raycaster = this.world.raycaster;
  rayOrigin = new THREE.Vector3(0, 0, 1);
  rayTarget = new THREE.Vector3();
  debug: any;
  down: any;
  target: any;
  hover: any;
  constructor() {}

  show() {
    this.scene.add(this.projectScreen.mesh);
    this.scene.add(this.projectDetailOverlay.group);
    this.projectScreen.material.uniforms.uIsCurved.value = false;
    this.world.parallax.enabled = false;
    this.world.sky.mesh.rotation.y = Math.PI;
  }

  hide() {
    this.scene.remove(this.projectScreen.mesh);
    this.scene.remove(this.projectDetailOverlay.group);
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectDetailViewManager",
      expanded: false,
    });
    this.debug.addButton({ title: "next" }).on("click", () => {
      this.activeProjectState.active = Math.min(
        this.activeProjectState.active + 1,
        this.activeProjectState.max
      );
      this.world.changeView("projectDetail");
      this.projectScreen.onActiveChange(this.activeProjectState.active);
    });
    this.debug.addButton({ title: "previous" }).on("click", () => {
      this.activeProjectState.active = Math.max(
        this.activeProjectState.min,
        this.activeProjectState.active - 1
      );
      this.world.changeView("projectDetail");
      this.projectScreen.onActiveChange(this.activeProjectState.active);
    });
    this.debug
      .addButton({ title: "close" })
      .on("click", () => this.world.changeView("projects"));
    // this.debug.addButton({ title: "visit" }).on("click", () => {
    //   const url = this.world.data[this.activeProjectState.active].link;
    //   console.log(url);
    //   window.open(url, "_blank").focus();
    // });

    this.overlayDebug();
  }

  overlayDebug() {
    const overlay = this.debug.addFolder({ title: "overlay" });

    overlay.addInput(
      this.projectDetailOverlay.material.uniforms.uLineThickness,
      "value",
      {
        min: 1,
        max: 50,
        step: 1,
        label: "line thickness",
      }
    );

    overlay.addInput(
      this.projectDetailOverlay.material.uniforms.uLengthBottom,
      "value",
      {
        min: 1,
        max: 1000,
        step: 1,
        label: "length bottom",
      }
    );

    overlay.addInput(
      this.projectDetailOverlay.material.uniforms.uLengthCorner,
      "value",
      {
        min: 1,
        max: 500,
        step: 1,
        label: "length corner",
      }
    );

    overlay.addInput(
      this.projectDetailOverlay.material.uniforms.uCenterGap,
      "value",
      {
        min: 0,
        max: 400,
        step: 1,
        label: "center gap",
      }
    );

    overlay.addInput(
      this.projectDetailOverlay.material.uniforms.uLengthTop,
      "value",
      {
        min: 1,
        max: 400,
        step: 1,
        label: "length top",
      }
    );

    const close = overlay.addFolder({ title: "closeButton" });
    close.addInput(
      this.projectDetailOverlay.close.material.uniforms.uBorderThickness,
      "value",
      {
        min: 0,
        max: 30,
        step: 1,
        label: "border thickness",
      }
    );

    close.addInput(
      this.projectDetailOverlay.close.material.uniforms.uBorderStrength,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "border strength",
      }
    );

    close.addInput(
      this.projectDetailOverlay.close.material.uniforms.uCrossThickness,
      "value",
      {
        min: 0,
        max: 30,
        step: 1,
        label: "cross thickness",
      }
    );

    close.addInput(
      this.projectDetailOverlay.close.material.uniforms.uCrossSize,
      "value",
      {
        min: 0,
        max: 100,
        step: 1,
        label: "cross size",
      }
    );

    close.addInput(
      this.projectDetailOverlay.close.material.uniforms.uBackgroundStrength,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "background strength",
      }
    );
  }

  onPointermove(mouse) {
    if (this.down) return;
    this.projectScreen.onPointermove();

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.raycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.raycaster.intersectObjects([
      this.projectDetailOverlay.close,
      this.projectDetailOverlay.prevButton,
      this.projectDetailOverlay.nextButton,
      ...this.projectDetailOverlay.visitGroup.children,
    ]);

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

  onPointerdown() {
    this.projectScreen.onPointerdown();

    if (this.hover) {
      this.down = true;
    }
  }

  onPointerup() {
    if (!this.down) return;

    this.down = false;
    this.projectScreen.onPointerup();

    switch (this.target) {
      case "close":
        this.world.changeView("projects");
        break;
      case "prev":
        this.activeProjectState.active = Math.max(
          this.activeProjectState.min,
          this.activeProjectState.active - 1
        );
        this.world.changeView("projectDetail");
        this.projectScreen.onActiveChange(this.activeProjectState.active);
        break;
      case "next":
        this.activeProjectState.active = Math.min(
          this.activeProjectState.active + 1,
          this.activeProjectState.max
        );
        // have some kind of special case here. It's unneccesary to to show and hide again
        this.world.changeView("projectDetail");
        this.projectScreen.onActiveChange(this.activeProjectState.active);
        break;
      case "visit":
        // const url = this.world.data[this.activeProjectState.active].link;
        // console.log(url);
        // window.open(url, "_blank").focus();
        break;
      default:
        break;
    }
  }

  getSizes() {
    const aspect = window.innerWidth / window.innerHeight;
    const screen = {};

    const dist = 0.65;
    const fov2 = (this.world.camera.fov * 0.5 * Math.PI) / 180;
    const scaleY = 2 * dist * Math.tan(fov2); // scaleX = 2*dist*Math.tan(fov/2)
    const scaleX = scaleY * aspect;
    this.projectScreen.mesh.scale.set(scaleX, scaleY, 1);

    let offset = 210 + aspect * 8; // 30
    offset *= Math.PI / 180;
    const posX = Math.sin(offset) * dist;
    const posZ = -Math.cos(offset) * dist;
    this.projectScreen.mesh.position.set(posX, 0, posZ);
    const rotY = -offset;
    this.projectScreen.mesh.rotation.y = rotY;

    this.world.camera.position.set(0, scaleY / 2, 0);
    const rotation = (30 + aspect * 8) * (Math.PI / 180);
    this.world.camera.rotation.set(-Math.PI, rotation, Math.PI);

    return {
      screen,
    };
  }

  resize() {
    if (this.world.view.projectDetail) {
      console.log("NOPW");
      const { screen } = this.getSizes();
      // this.projectScreen.resizeProjectDetailView(screen);
    }
    //resize overlay
    this.projectDetailOverlay.onResize();
  }

  onWheel() {}

  update() {
    this.projectScreen.update();
  }
}