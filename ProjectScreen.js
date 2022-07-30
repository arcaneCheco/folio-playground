import * as THREE from "three";
import { World } from "./app";
import vertexShader from "./shaders/projectScreen/vertex.glsl";
import fragmentShader from "./shaders/projectScreen/fragment.glsl";

/*****
 * figure out how to update active project when transition is already in progress
 */

export default class ProjectScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;

    this.geometry = new THREE.PlaneGeometry(2, 1);
    this.uniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uTransition: { value: false },
      uTransitionStart: { value: 0 },
      uTransitionDuration: { value: 0.5 },
      uImage1: { value: null },
      uImage2: { value: null },
      uBorderColor: { value: new THREE.Vector3() },
      uAbstract: {
        value: this.world.textureLoader.load("images/abstract2.jpeg"),
      },
      uColor: { value: new THREE.Vector3() },
      uVignetteIntensity: { value: 40 },
      uVignetteInfluence: { value: 0.5 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.setInitialPosition(); // later this should be called on view change with a transition
  }

  setInitialPosition() {
    this.mesh.scale.setScalar(0.4);
    this.mesh.rotation.set(0, -Math.PI / 5, 0);
    this.mesh.position.set(0.18, 0.22, 0.47);
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
    console.log(this.data[activeProject].texture);
    this.uniforms.uColor.value = this.data[activeProject].color;
    this.uniforms.uTransition.value = true;
    this.uniforms.uImage2.value = this.data[activeProject].texture;
    this.uniforms.uTransitionStart.value = this.world.time;
    const deactivate = window.setTimeout(() => {
      this.uniforms.uImage1.value = this.data[activeProject].texture;
      this.uniforms.uTransition.value = false;
    }, this.uniforms.uTransitionDuration.value * 1000);
  }

  onPointerdown() {}

  onPointermove() {}

  onPointerup() {}

  resize() {}

  update() {
    this.uniforms.uTime.value = this.world.time;
  }
}