import * as THREE from "three";
import vertexShader from "./shaders/post/vertex.glsl";
import fragmentShader from "./shaders/post/transition.glsl";
import { World } from "./app";

export default class Post {
  constructor() {
    this.world = new World();
    this.worldScene = this.world.scene;
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        generateMipmaps: false,
        stencilBuffer: false,
        // depthBuffer: false,
        type: THREE.HalfFloatType,
      }
    );

    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.scene = new THREE.Scene();

    this.createTransitionPass();
  }

  createTransitionPass() {
    this.transitionUniforms = {
      uScreen: { value: null },
      uProgress: { value: 0 },
      uSize: { value: 0.04 },
      uZoom: { value: 50 },
      uColorSeparation: { value: 0.3 },
    };

    let material = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: this.transitionUniforms,
      vertexShader,
      fragmentShader,
    });

    let mesh = new THREE.Mesh(this.geometry, material);
    this.scene.add(mesh);
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "post" });
    this.debug.addInput(this.transitionUniforms.uProgress, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "progress",
    });
    this.debug.addInput(this.transitionUniforms.uSize, "value", {
      min: 0,
      max: 0.2,
      step: 0.001,
      label: "size",
    });
    this.debug.addInput(this.transitionUniforms.uZoom, "value", {
      min: 0,
      max: 100,
      step: 0.001,
      label: "zoom",
    });
    this.debug.addInput(this.transitionUniforms.uColorSeparation, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "color shift",
    });
  }

  render() {
    let currentRT = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.worldScene, this.camera);

    this.transitionUniforms.uScreen.value = this.renderTarget.texture;
    this.renderer.setRenderTarget(currentRT);
    this.renderer.render(this.scene, this.camera);
  }
}

// const post = this.pane.addFolder({ title: "post" });
//     post.addInput(this.postStuff.mesh.material.uniforms.uProgress, "value", {
//       min: 0,
//       max: 1,
//       step: 0.001,
//     });
