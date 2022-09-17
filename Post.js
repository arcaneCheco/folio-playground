import * as THREE from "three";
import vertexShader from "./shaders/post/vertex.glsl";
import fragmentShader from "./shaders/post/transition.glsl";
// import fragmentShader from "./shaders/post/transitionZoom.glsl";
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
        // type: THREE.FloatType,
      }
    );

    this.geometry = new THREE.PlaneGeometry(2, 2);

    this.activeScene = null;

    this.createTransitionPass();
    this.toAboutTransition();
  }

  createTransitionPass() {
    this.homeAboutScene = new THREE.Scene();
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
    this.homeAboutScene.add(mesh);
  }

  toAboutTransition() {
    this.aboutScene = new THREE.Scene();
    this.toAboutTransitionUniforms = {
      uScreen: { value: null },
      uProgress: { value: 0 },
    };
    let material = new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: this.toAboutTransitionUniforms,
      vertexShader: `
      varying vec2 vUv;

      void main() {
          gl_Position = vec4(position, 1.);
          vUv = uv;
      }`,
      fragmentShader: `
      uniform sampler2D uScreen;
      uniform float uProgress;

      varying vec2 vUv;

      void main() {
        vec3 base = texture2D(uScreen, vUv).rgb;
        vec3 final = mix(base, vec3(0.), uProgress);
        gl_FragColor = vec4(final, 1.);
      }
      `,
    });

    let mesh = new THREE.Mesh(this.geometry, material);
    this.aboutScene.add(mesh);
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

    const aboutPost = this.debug.addFolder({ title: "about" });
    aboutPost
      .addInput(this.toAboutTransitionUniforms.uProgress, "value", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "progress",
      })
      .on("change", () => {
        this.activeScene = this.aboutScene;
        this.world.usePost = true;
      });
  }

  render() {
    let currentRT = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.worldScene, this.camera);

    this.transitionUniforms.uScreen.value = this.renderTarget.texture;
    this.toAboutTransitionUniforms.uScreen.value = this.renderTarget.texture;
    this.renderer.setRenderTarget(currentRT);
    this.renderer.render(this.activeScene, this.camera);
  }
}
