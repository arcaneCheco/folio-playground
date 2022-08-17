import GSAP from "gsap";
import { World } from "./app";
import * as THREE from "three";

export default class TransitionManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.postTransition = this.world.post.transitionUniforms.uProgress;
    this.cameraPosition = this.world.camera.position;
    this.cameraRotation = this.world.camera.rotation;
    this.initialHeight = this.world.initialHeight;
    this.projectScreen = this.world.projectScreen;
    this.homeObjects = [
      this.world.homeTitle.group,
      this.world.homeContact.group,
      this.world.homeNav.group,
      this.world.curlBubble.mesh,
    ];
    this.titlesObject = this.world.projectTitles.outerGroup;
    this.filtersObject = this.world.projectFilters.outerGroup;
    this.projectsNavObject = this.world.projectsNav.group;
    this.projectDetailOverlayObject = this.world.projectDetailOverlay.group;
  }

  homeToProjects() {
    const t = GSAP.timeline({
      defaults: {
        duration: 1.2,
        delay: 0,
        ease: "power1.out",
      },
      onStart: () => {
        this.world.usePost = true;
        // avoid lag by adding screen at beginning;
        this.projectScreen.uniforms.uOpacity.value = 0;
        this.projectScreen.uniforms.uIsCurved.value = true;
        this.scene.add(this.projectScreen.mesh);
      },
      onComplete: () => {
        this.postTransition.value = 0;
        this.world.usePost = false;
      },
    });

    t.to(this.postTransition, { value: 1 }, 0);
    t.to(this.cameraPosition, { x: 0, y: this.initialHeight, z: -1 }, 0);

    // t.fromTo(
    //   this.world.projectTitles.group,
    //   { y: -5 },
    //   { y: 0, delay: 2, duration: 4 }
    // );

    GSAP.delayedCall(t.duration() / 4, () => {
      this.world.sky.mesh.rotation.y = Math.PI;
      this.scene.remove(...this.homeObjects);

      this.projectScreen.uniforms.uOpacity.value = 1;
      this.scene.add(
        this.titlesObject,
        this.filtersObject,
        this.projectsNavObject
      );
    });
  }

  projectsToHome() {
    const t = GSAP.timeline({
      defaults: {
        duration: 1.2,
        delay: 0,
        ease: "power1.out",
      },
      onStart: () => {
        this.world.usePost = true;
      },
      onComplete: () => {
        this.postTransition.value = 0;
        this.world.usePost = false;
      },
    });

    t.to(this.postTransition, { value: 1 }, 0);
    t.to(this.cameraPosition, { x: 0, y: this.initialHeight, z: 1 }, 0);

    GSAP.delayedCall(t.duration() / 4, () => {
      this.world.sky.mesh.rotation.y = 0;
      this.scene.remove(
        this.titlesObject,
        this.filtersObject,
        this.projectsNavObject,
        this.projectScreen.mesh
      );
      this.scene.add(...this.homeObjects);
    });
  }

  projectDetailToProjects() {
    this.projectScreen.uniforms.uIsCurved.value = true;
    const aspect = window.innerWidth / window.innerHeight;

    const t = GSAP.timeline({
      defaults: {
        duration: 1,
        delay: 0,
        ease: "power1.out",
      },
      onStart: () => (this.world.parallax.enabled = true),
    });

    //camera
    t.to(
      this.cameraPosition,
      {
        x: 0,
        y: this.initialHeight,
        z: -1,
      },
      0
    );
    // GSAP.to(this.cameraRotation, {
    //   x: -Math.PI,
    //   y: 0,
    //   z: Math.PI,
    //   duration: 1,
    //   onComplete: () => (this.world.parallax.enabled = true),
    // });

    // screen
    const scaleX = 1 + aspect * 0.2;
    const scaleY = 1 * scaleX * (9 / 16);
    t.to(
      this.projectScreen.mesh.scale,
      {
        x: scaleX,
        y: scaleY,
      },
      0
    );

    this.scene.add(
      this.titlesObject,
      this.filtersObject,
      this.projectsNavObject
    );
    this.scene.remove(this.projectDetailOverlayObject);
  }

  projectsToProjectDetail() {
    this.world.parallax.enabled = false;
    const aspect = window.innerWidth / window.innerHeight;
    this.projectScreen.uniforms.uIsCurved.value = false;

    const t = GSAP.timeline({
      defaults: {
        duration: 1,
        delay: 0,
        ease: "power1.in",
      },
    });

    // screen
    const dist = 0.65;
    const fov2 = (this.world.camera.fov * 0.5 * Math.PI) / 180;
    const scaleY = 2 * dist * Math.tan(fov2); // scaleX = 2*dist*Math.tan(fov/2)
    const scaleX = scaleY * aspect;
    t.to(
      this.projectScreen.mesh.scale,
      {
        x: scaleX,
        y: scaleY,
      },
      0.2
    );

    // camera
    const rotation = (30 + aspect * 8) * (Math.PI / 180);
    t.to(this.cameraPosition, { x: 0, y: scaleY / 2, z: 0 }, 0);
    t.to(
      this.cameraRotation,
      {
        x: -Math.PI,
        y: rotation,
        z: -Math.PI,
      },
      0.2
    );

    this.scene.remove(
      this.titlesObject,
      this.filtersObject,
      this.projectsNavObject
    );

    this.scene.add(this.projectDetailOverlayObject);
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "transition manager" });

    this.debug
      .addButton({ title: "home => projects" })
      .on("click", () => this.homeToProjects());
    this.debug
      .addButton({ title: "projects => projectDetail" })
      .on("click", () => this.projectsToProjectDetail());
    this.debug
      .addButton({ title: "projectDetail => projects" })
      .on("click", () => this.projectDetailToProjects());
  }
}