import { ProjectCategory, View, _ProjectDetailViewManager } from "@types";
import { Vector2, Vector3 } from "three";
import { World } from "@src/app";
import { Overlay } from "./Overlay";
import { FolderApi } from "tweakpane";

export class ProjectDetailViewManager implements _ProjectDetailViewManager {
  world = new World();
  scene = this.world.scene;
  projectState = this.world.projectState;
  projectScreen = this.world.projectScreen;
  raycaster = this.world.raycaster;
  rayOrigin = new Vector3(0, 0, 1);
  rayTarget = new Vector3();
  overlay = new Overlay();
  debug: FolderApi;
  down: boolean;
  target: string;
  lastCommand?: string;
  hover: boolean;
  constructor() {
    this.world.water.hiddenObjects[View.Projects]?.push(this.overlay.group);
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectDetailViewManager",
      expanded: false,
    });
    this.overlayDebug();
  }

  overlayDebug() {
    const overlay = this.debug.addFolder({ title: "overlay" });

    overlay.addInput(this.overlay.material.uniforms.uLineThickness, "value", {
      min: 1,
      max: 50,
      step: 1,
      label: "line thickness",
    });

    overlay.addInput(this.overlay.material.uniforms.uLengthBottom, "value", {
      min: 1,
      max: 1000,
      step: 1,
      label: "length bottom",
    });

    overlay.addInput(this.overlay.material.uniforms.uLengthCorner, "value", {
      min: 1,
      max: 500,
      step: 1,
      label: "length corner",
    });

    overlay.addInput(this.overlay.material.uniforms.uCenterGap, "value", {
      min: 0,
      max: 400,
      step: 1,
      label: "center gap",
    });

    overlay.addInput(this.overlay.material.uniforms.uLengthTop, "value", {
      min: 1,
      max: 400,
      step: 1,
      label: "length top",
    });

    const close = overlay.addFolder({ title: "closeButton" });
    close.addInput(
      this.overlay.close.material.uniforms.uBorderThickness,
      "value",
      {
        min: 0,
        max: 30,
        step: 1,
        label: "border thickness",
      }
    );

    close.addInput(
      this.overlay.close.material.uniforms.uBorderStrength,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "border strength",
      }
    );

    close.addInput(
      this.overlay.close.material.uniforms.uCrossThickness,
      "value",
      {
        min: 0,
        max: 30,
        step: 1,
        label: "cross thickness",
      }
    );

    close.addInput(this.overlay.close.material.uniforms.uCrossSize, "value", {
      min: 0,
      max: 100,
      step: 1,
      label: "cross size",
    });

    close.addInput(
      this.overlay.close.material.uniforms.uBackgroundStrength,
      "value",
      {
        min: 0,
        max: 1,
        step: 0.001,
        label: "background strength",
      }
    );
  }

  onPointermove(mouse: Vector2) {
    if (this.down) return;
    this.projectScreen.onPointermove();

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.raycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.raycaster.intersectObjects([
      this.overlay.close,
      this.overlay.prevButton,
      this.overlay.nextButton,
      ...this.overlay.visitGroup.children,
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

  onActiveChange(command: "next" | "prev") {
    let target = 0;
    const activeIndices = this.projectState.activeIndices;
    if (command === "next") {
      const maxIndex = Math.max(...activeIndices);
      target = this.projectState.active + 1;
      target = Math.min(target, maxIndex);
      if (this.projectScreen.timeline.parent && this.lastCommand === "next") {
        this.projectState.active = target;
        target++;
      }
      target = Math.min(target, maxIndex);
      this.lastCommand = "next";
    } else if (command === "prev") {
      const minIndex = Math.min(...activeIndices);
      target = this.projectState.active - 1;
      target = Math.max(target, minIndex);
      if (this.projectScreen.timeline.parent && this.lastCommand === "prev") {
        this.projectState.active = target;
        target--;
      }
      target = Math.max(target, minIndex);
      this.lastCommand = "prev";
    }
    this.projectScreen.onActiveChange({
      newIndex: target,
      color: this.world.colorGradient.getAt((target + 1) / 5),
    });
    this.world.changeView(View.ProjectDetail);
  }

  onPointerup() {
    if (!this.down) return;

    this.down = false;
    this.projectScreen.onPointerup();

    switch (this.target) {
      case "close":
        this.world.changeView(View.Projects);
        break;
      case "prev":
        this.onActiveChange("prev");
        break;
      case "next":
        this.onActiveChange("next");
        break;
      case "visit":
        const url = this.world.projectScreen.data[this.projectState.active].demo;
        if (url) {
          window.open(url, "_blank")?.focus();
        }
        break;
      default:
        break;
    }
  }

  getSizes() {
    const aspect = window.innerWidth / window.innerHeight;
    const screen: any = {};

    screen.aspect = aspect;

    const dist = 0.65;
    const fov2 = (this.world.camera.fov * 0.5 * Math.PI) / 180;
    screen.scaleY = 2 * dist * Math.tan(fov2);
    screen.scaleX = screen.scaleY * aspect;

    // this.projectScreen.mesh.scale.set(screen.scaleX, screen.scaleY, 1);

    let offset = 210 + aspect * 8; // 30
    offset *= Math.PI / 180;
    screen.posX = Math.sin(offset) * dist;
    screen.posZ = -Math.cos(offset) * dist;
    // this.projectScreen.mesh.position.set(screen.posX, 0, screen.posZ);
    screen.rotY = -offset;
    // this.projectScreen.mesh.rotation.y = screen.rotY;

    this.world.camera.position.set(0, screen.scaleY / 2, 0);
    const rotation = (30 + aspect * 8) * (Math.PI / 180);
    this.world.camera.rotation.set(-Math.PI, rotation, Math.PI);

    return {
      screen,
    };
  }

  onResize() {
    if (this.world.view === View.ProjectDetail) {
      const { screen } = this.getSizes();
      this.projectScreen.resizeProjectDetailView(screen);
    }
    //resize overlay
    this.overlay.onResize();
  }

  onWheel() { }

  update() {
    this.projectScreen.update();
  }
}
