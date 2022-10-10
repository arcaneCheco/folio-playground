import * as THREE from "three";
import { World } from "@src/app";
import { clamp } from "three/src/math/MathUtils";
import { Scroll, _ProjectTitles, _TextGeometry, _TitleMesh } from "@types";
import { TitleMesh } from "./TitleMesh";
import { FolderApi } from "tweakpane";

/**
 * not sure if to show titles-reflection yet
 */

export class Titles implements _ProjectTitles {
  world = new World();
  scene = this.world.scene;
  scroll: Scroll = {
    current: 0,
    target: 0,
    active: false,
    limitTop: 0,
    limitBottom: 0,
  };
  gap = 0.5;
  baseWidth = 5; // wolrd units
  group = new THREE.Group();
  outerGroup = new THREE.Group();
  initialScrollOffset = 1.5;
  data = this.world.resources.projects;
  font = this.world.resources.fonts.audiowideRegular;
  meshes: Array<_TitleMesh> = this.data.map(
    ({ title, category }, index) =>
      new TitleMesh({
        title,
        category,
        index,
        font: this.font,
        baseWidth: this.baseWidth,
      })
  );
  debug: FolderApi;
  constructor() {
    // const n = this.titles.data.length;
    // this.titles.meshes.map((mesh, i) => {
    //   mesh.material.uniforms.uColor.value = this.colorGradient.getAt(i / n);
    // });

    this.outerGroup.add(this.group);
    this.group.renderOrder = 1000;
    // this.scroll.limitTop = -this.initialScrollOffset;

    this.outerGroup.rotation.y = Math.PI;
    // this.outerGroup.rotation.y = (Math.PI * 13) / 12;
    this.outerGroup.position.z = 0.3;
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "project titles",
      expanded: false,
    });
    const stroke = { value: 0.1 };
    this.debug
      .addInput(stroke, "value", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "stroke",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uStroke.value = stroke.value)
        )
      );
    const progress = { value: 0 };
    this.debug
      .addInput(progress, "value", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "progress",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uProgress.value = progress.value)
        )
      );
    const padding = { value: 0.1 };
    this.debug
      .addInput(padding, "value", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "padding",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uPadding.value = padding.value)
        )
      );

    this.debug
      .addInput(this, "gap", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", () => {
        this.setPositionsWithinGroup();
      });
    this.debug.addInput(this.outerGroup.position, "y", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "outerGroup - posY",
    });
    this.debug.addInput(this.group.position, "x", {
      min: -4,
      max: 0,
      step: 0.001,
      label: "group - posX",
    });
  }

  setPositionsWithinGroup() {
    let currentOffset = 0;
    let limitOffset = 0;
    this.group.children.map((mesh: any, i) => {
      if (i === 0) {
        mesh.position.y = this.initialScrollOffset;
        mesh.userData.scrollPosition = mesh.position.y;
        currentOffset += mesh.geometry.userData.height / 2 + this.gap;
      } else {
        mesh.position.y =
          -(currentOffset + mesh.geometry.userData.height / 2) +
          this.initialScrollOffset;
        mesh.userData.scrollPosition = mesh.position.y;
        limitOffset = -mesh.position.y; // only need position of last item in list
        currentOffset += mesh.geometry.userData.height + this.gap;
      }
    });

    // this.scroll.limitBottom = limitOffset - this.initialScrollOffset;
    this.scroll.limitBottom = limitOffset;
    this.group.position.y = 0;
  }

  onWheel(deltaY) {
    let newPosition = this.group.position.y + deltaY * 0.01;
    newPosition = clamp(
      newPosition,
      this.scroll.limitTop,
      this.scroll.limitBottom
    );

    const diff = Math.abs(newPosition - this.group.position.y);
    // this.outerGroup.rotation.x = -3 * Math.sqrt(diff) * 0.44613;
    // this.outerGroup.rotation.z = 3 * Math.sqrt(diff) * 0.217449;
    // if (Math.abs(diff) < 0.012) {
    //   this.scroll.active = false;
    //   GSAP.to(this.outerGroup.rotation, {
    //     x: 0,
    //     y: 0.5235987755982988,
    //     z: 0,
    //     duration: 1,
    //   });
    //   return;
    // }
    // if (!this.scroll.active) {
    //   GSAP.to(this.outerGroup.rotation, {
    //     x: -0.4461313914223183,
    //     y: 0.4801810588538978,
    //     z: 0.21744900405528222,
    //     duration: 1,
    //   });
    // }
    this.group.position.y = newPosition;
  }

  onResize(sizes) {
    this.outerGroup.scale.set(sizes.scale, sizes.scale, 1);
    this.group.position.x = sizes.posX;
  }

  update() {
    this.group.children.map(
      (mesh: any) => (mesh.material.uniforms.uTime.value = this.world.time)
    );
  }
}
