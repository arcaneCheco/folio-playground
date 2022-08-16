import GSAP from "gsap";
import { World } from "./app";

export default class TransitionManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.postTransition = this.world.post.transitionUniforms.uProgress;
    this.cameraPosition = this.world.camera.position;
    this.cameraRotation = this.world.camera.rotation;
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
    t.to(this.cameraPosition, { x: 0, y: 0.15, z: -1 }, 0);

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

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "transition manager" });

    this.debug
      .addButton({ title: "home => projects" })
      .on("click", () => this.homeToProjects());
  }
}
