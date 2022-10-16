import GSAP from "gsap";
import { World } from "@src/app";
import { TransitionEffect } from "@types";

export class TransitionManager {
  world = new World();
  scene = this.world.scene;
  post = this.world.post;
  projectScreen = this.world.projectScreen;
  cameraPosition = this.world.camera.position;
  cameraRotation = this.world.camera.rotation;
  initialHeight = this.world.initialHeight;
  homeObjects = [
    this.world.homeViewManager.title.group,
    this.world.homeViewManager.contact.group,
    this.world.homeViewManager.nav.group,
    this.world.curlBubble.mesh,
  ];
  titlesObject = this.world.projectsViewManager.titles.outerGroup;
  filtersObject = this.world.projectsViewManager.filters.outerGroup;
  projectsNavObject = this.world.projectsViewManager.nav.group;
  projectDetailOverlayObject =
    this.world.projectDetailViewManager.overlay.group;
  debug: any;
  constructor() {}

  homeToProjects() {
    this.post.activeEffect = TransitionEffect.HomeProjects;
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
        this.post.transitionEffects[
          TransitionEffect.HomeProjects
        ].uniforms.uProgress.value = 0;
        this.world.usePost = false;
      },
    });

    t.to(
      this.post.transitionEffects[TransitionEffect.HomeProjects].uniforms
        .uProgress,
      { value: 1 },
      0
    );
    t.to(this.cameraPosition, { x: 0, y: this.initialHeight, z: -1 }, 0);

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
    this.post.activeEffect = TransitionEffect.HomeProjects;
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
        this.post.transitionEffects[
          TransitionEffect.HomeProjects
        ].uniforms.uProgress.value = 0;
        this.world.usePost = false;
      },
    });

    t.to(
      this.post.transitionEffects[TransitionEffect.HomeProjects].uniforms
        .uProgress,
      { value: 1 },
      0
    );
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
      onStart: (): any => (this.world.parallax.enabled = true),
    });

    //camera
    t.to(this.cameraPosition, { x: 0, y: this.initialHeight, z: -1 }, 0);

    // screen
    const scaleX = 1 + aspect * 0.2;
    const scaleY = 1 * scaleX * (9 / 16);

    t.to(this.projectScreen.mesh.scale, { x: scaleX, y: scaleY }, 0);

    this.scene.add(
      this.titlesObject,
      this.filtersObject,
      this.projectsNavObject
    );
    this.scene.remove(this.projectDetailOverlayObject);
  }

  projectsToProjectDetail() {
    this.post.activeEffect = TransitionEffect.ProjectsProjectDetail;
    const t2 = GSAP.timeline({
      defaults: {
        duration: 1.2,
        delay: 0,
        ease: "power1.out",
      },
      onStart: () => {
        this.world.usePost = true;
      },
      onComplete: () => {
        this.post.transitionEffects[
          TransitionEffect.ProjectsProjectDetail
        ].uniforms.uProgress.value = 0;
        this.world.usePost = false;
      },
    });

    t2.to(
      this.post.transitionEffects[TransitionEffect.ProjectsProjectDetail]
        .uniforms.uProgress,
      { value: 1 },
      0
    );

    this.world.parallax.enabled = false;
    const aspect = window.innerWidth / window.innerHeight;
    this.projectScreen.uniforms.uIsCurved.value = false;

    const t = GSAP.timeline({
      defaults: {
        duration: 0.8,
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
      0.1
    );

    // camera
    const rotation = (30 + aspect * 8) * (Math.PI / 180);
    t.to(this.cameraPosition, { x: 0, y: scaleY / 2, z: 0 }, 0);
    t.to(
      this.cameraRotation,
      {
        x: -Math.PI,
        y: rotation,
        z: Math.PI * Math.sign(this.cameraRotation.z),
      },
      0.1
    );

    this.scene.remove(
      this.titlesObject,
      this.filtersObject,
      this.projectsNavObject
    );

    this.scene.add(this.projectDetailOverlayObject);
  }

  projectsToAbout() {
    this.post.activeEffect = TransitionEffect.ProjectsAbout;

    const t = GSAP.timeline();

    t.to(
      this.post.transitionEffects[TransitionEffect.ProjectsAbout].uniforms
        .uProgress,
      {
        value: 1,
        duration: 0.5,
        onStart: () => {
          this.world.usePost = true;
        },
        onComplete: () => {
          this.scene.remove(
            this.projectScreen.mesh,
            this.titlesObject,
            this.filtersObject,
            this.projectsNavObject
          );
        },
      }
    );

    t.to(
      this.post.transitionEffects[TransitionEffect.ProjectsAbout].uniforms
        .uProgress,
      {
        value: 0,
        duration: 0.5,
        onStart: () => {
          this.scene.add(
            this.world.aboutViewManager.screen.mesh,
            this.world.aboutViewManager.greeting.group,
            this.world.aboutViewManager.overlay.group
          );
          this.cameraPosition.set(0, this.initialHeight, 1);
          this.world.sky.mesh.rotation.y = 0;
        },
        onComplete: () => {
          this.world.usePost = false;
        },
      }
    );

    t.to(
      this.world.aboutViewManager.screen.material.uniforms.uProgress,
      {
        delay: 0.5,
        duration: 0.5,
        value: 1,
      },
      "0"
    );
  }

  aboutToProjects() {
    this.post.activeEffect = TransitionEffect.ProjectsAbout;

    const t = GSAP.timeline();

    t.to(
      this.world.aboutViewManager.screen.material.uniforms.uProgress,
      {
        duration: 0.5,
        value: 0,
      },
      "0"
    );
    t.to(
      this.post.transitionEffects[TransitionEffect.ProjectsAbout].uniforms
        .uProgress,
      {
        value: 1,
        duration: 0.5,
        onStart: () => {
          this.world.usePost = true;
        },
        onComplete: () => {
          this.scene.remove(
            this.world.aboutViewManager.screen.mesh,
            this.world.aboutViewManager.greeting.group,
            this.world.aboutViewManager.overlay.group
          );
        },
      },
      "0"
    );
    t.to(
      this.post.transitionEffects[TransitionEffect.ProjectsAbout].uniforms
        .uProgress,
      {
        value: 0,
        duration: 0.5,
        onStart: () => {
          this.scene.add(
            this.projectScreen.mesh,
            this.titlesObject,
            this.filtersObject,
            this.projectsNavObject
          );
          this.cameraPosition.z = -1;
          this.world.sky.mesh.rotation.y = Math.PI;
        },
        onComplete: () => {
          this.world.usePost = false;
        },
      }
    );
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
