import { IUniform, Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { World } from "@src/app";
import vertexShader from "../shaders/projectScreen/vertex.glsl";
import fragmentShader from "../shaders/projectScreen/fragment.glsl";
import { FolderApi } from "tweakpane";
import { _ProjectScreen } from "@types";

/*****
 * figure out how to update active project when transition is already in progress
 * in projectsView
 *    set aspect to aspect of screen
 *    setHeight 0.1 units above water
 *    set width to be about half the screen width;
 */

export class ProjectScreen implements _ProjectScreen {
  world = new World();
  scene = this.world.scene;
  projectState = this.world.projectState;
  data = this.world.resources.projects;
  geometry = new PlaneGeometry(1, 1, 50, 1);
  uniforms: Record<string, IUniform> = {
    uTime: { value: 0 },
    uProgress: this.world.projectState.progress,
    uTransition: this.world.projectState.isTransitioning,
    uTransitionStart: { value: 0 },
    uTransitionDuration: { value: 0.5 },
    uImage1: {
      value: this.data[this.projectState.active].texture,
    },
    uImage2: {
      value: null,
    },
    uBorderColor: { value: new Vector3() },
    uAbstract: {
      value: this.world.resources.assets.abstract,
    },
    uColor: { value: new Vector3() },
    uVignetteIntensity: { value: 40 },
    uVignetteInfluence: { value: 0.5 },
    uAspect: { value: 1 },
    uIsCurved: { value: false },
    uOpacity: { value: 1 },
  };
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: this.uniforms,
    transparent: true,
  });
  mesh = new Mesh(this.geometry, this.material);
  debug: FolderApi;

  positionDebug() {
    const position = this.debug.addFolder({
      title: "position",
      expanded: false,
    });
    position.addInput(this.mesh.position, "x", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    position.addInput(this.mesh.position, "y", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    position.addInput(this.mesh.position, "z", {
      min: -2,
      max: 2,
      step: 0.001,
    });
  }

  rotationDebug() {
    const rotation = this.debug.addFolder({
      title: "rotation",
      expanded: false,
    });
    rotation.addInput(this.mesh.rotation, "x", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    rotation.addInput(this.mesh.rotation, "y", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    rotation.addInput(this.mesh.rotation, "z", {
      min: -2,
      max: 2,
      step: 0.001,
    });
  }

  scaleDebug() {
    const scale = this.debug.addFolder({ title: "scale", expanded: false });

    const scaleDebugs = { value: 1 };
    scale
      .addInput(scaleDebugs, "value", {
        min: 0,
        max: 2,
        step: 0.001,
        label: "uniform scaling",
      })
      .on("change", () => this.mesh.scale.setScalar(scaleDebugs.value));
    scale.addInput(this.mesh.scale, "x", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    scale.addInput(this.mesh.scale, "y", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    scale.addInput(this.mesh.scale, "z", {
      min: -2,
      max: 2,
      step: 0.001,
    });
  }

  transitionDebug() {
    const transition = this.debug.addFolder({
      title: "transition",
      expanded: false,
    });
    transition.addInput(this.uniforms.uProgress, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "progress",
    });
  }

  fragmentDebug() {
    const fragment = this.debug.addFolder({
      title: "fragment",
      expanded: false,
    });
    fragment.addInput(this.uniforms.uVignetteIntensity, "value", {
      min: 0,
      max: 50,
      step: 0.01,
      label: "vignette intensity",
    });
    fragment.addInput(this.uniforms.uVignetteInfluence, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "vignette influence",
    });
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectScreen",
      expanded: false,
    });
    this.positionDebug();
    this.rotationDebug();
    this.scaleDebug();
    this.transitionDebug();
    this.fragmentDebug();
  }

  onActiveChange(activeProject: number) {
    this.uniforms.uTransition.value = true;
    this.uniforms.uImage2.value = this.data[activeProject].texture;
    this.uniforms.uTransitionStart.value = this.world.time;
    window.setTimeout(() => {
      this.uniforms.uImage1.value = this.data[activeProject].texture;
      this.uniforms.uTransition.value = false;
    }, this.uniforms.uTransitionDuration.value * 1000);
  }

  onPointerdown() {}

  onPointermove() {}

  onPointerup() {}

  resizeProjectDetailView(sizes) {
    this.mesh.scale.x = sizes.scaleX;
    this.mesh.scale.y = sizes.scaleY;
    this.mesh.position.x = sizes.posX;
    this.mesh.position.z = sizes.posZ;
  }

  resizeProjectsView(sizes) {
    this.mesh.scale.set(sizes.scaleX, sizes.scaleY, 1);
    this.mesh.position.x = sizes.posX;
    this.mesh.position.z = sizes.posZ;
    this.mesh.rotation.y = sizes.rotY;
    this.uniforms.uAspect.value = sizes.aspect;
  }

  update() {
    this.uniforms.uTime.value = this.world.time;
  }
}
