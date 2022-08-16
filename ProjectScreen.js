import * as THREE from "three";
import { World } from "./app";
import vertexShader from "./shaders/projectScreen/vertex.glsl";
import fragmentShader from "./shaders/projectScreen/fragment.glsl";
import img from "./data/images/t1.jpeg";

/*****
 * figure out how to update active project when transition is already in progress
 * in projectsView
 *    set aspect to aspect of screen
 *    setHeight 0.1 units above water
 *    set width to be about half the screen width;
 */

export default class ProjectScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;

    let abstractTex = this.world.textureLoader.load("images/abstract2.jpeg");

    this.geometry = new THREE.PlaneGeometry(1, 1, 50, 1);
    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uTransition: { value: false },
      uTransitionStart: { value: 0 },
      uTransitionDuration: { value: 0.5 },
      uImage1: {
        value: null,
      },
      uImage2: {
        value: null,
      },
      uBorderColor: { value: new THREE.Vector3() },
      uAbstract: {
        value: abstractTex,
      },
      uColor: { value: new THREE.Vector3() },
      uVignetteIntensity: { value: 40 },
      uVignetteInfluence: { value: 0.5 },
      uAspect: { value: 1 },
      uIsCurved: { value: false },
      uOpacity: { value: 1 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      // depthTest: false,
      // depthWrite: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

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
    this.scaleDebug = 1;
    scale
      .addInput(this, "scaleDebug", {
        min: 0,
        max: 2,
        step: 0.001,
        label: "uniform scaling",
      })
      .on("change", () => this.mesh.scale.setScalar(this.scaleDebug));
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

  onActiveChange(activeProject) {
    console.log({
      one: this.uniforms.uImage1.value,
      two: this.uniforms.uImage2.value,
    });
    console.log("ONACTIVECHANGE");
    this.uniforms.uColor.value = this.data[activeProject].color;
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

  resize(sizes) {
    if (this.world.view.projectDetail) this.resizeProjectDetailView(sizes);
    else this.resizeProjectsView(sizes);
  }

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
