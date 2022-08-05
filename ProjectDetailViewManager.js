import * as THREE from "three";
import { World } from "./app";

export default class ProjectDetailViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.activeProjectState = this.world.activeProjectState;
    this.projectScreen = this.world.projectScreen;
  }

  show() {
    // console.log(this.data);
    // this.projectScreen.uniforms.uImage1.value =
    //   this.projectScreen.data[this.activeProjectState.active].texture;
    // this.projectScreen.uniforms.uImage2.value =
    //   this.projectScreen.data[this.activeProjectState.active + 1].texture;
    this.scene.add(this.projectScreen.mesh);
    this.projectScreen.mesh.rotation.y = 0;
    this.projectScreen.mesh.position.x = 0;
  }

  hide() {
    this.scene.remove(this.projectScreen.mesh);
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
    this.debug.addButton({ title: "visit" }).on("click", () => {
      const url = this.world.data[this.activeProjectState.active].link;
      console.log(url);
      window.open(url, "_blank").focus();
    });
  }

  onPointermove() {
    this.projectScreen.onPointermove();
  }

  onPointerdown() {
    this.projectScreen.onPointerdown();
  }

  onPointerup() {
    this.projectScreen.onPointerup();
  }

  resize() {
    this.projectScreen.resize();
  }

  onWheel() {}

  update() {
    this.projectScreen.update();
  }
}
