import {
  LinearFilter,
  PlaneGeometry,
  RGBAFormat,
  WebGLRenderTarget,
} from "three";
import fragmentShader from "@shaders/post/transition.glsl";
import projectsAboutShader from "@shaders/post/projectsAboutTransition.glsl";
import fragmentShaderZoom from "@shaders/post/transitionZoom.glsl";
import { World } from "@src/app";
import { _Post, TransitionEffect, _TransitionScene } from "@types";
import { FolderApi } from "tweakpane";
import { TransitionScene } from ".";

export class Post implements _Post {
  world = new World();
  scene = this.world.scene;
  renderer = this.world.renderer;
  camera = this.world.camera;
  renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
    generateMipmaps: false,
    stencilBuffer: false,
  });
  geometry = new PlaneGeometry(2, 2);
  transitionEffects: Record<TransitionEffect, _TransitionScene> = {
    HomeProjects: new TransitionScene({
      geometry: this.geometry,
      shader: fragmentShader,
      options: {
        uSize: 0.04,
        uZoom: 50,
        uColorSeparation: 0.3,
      },
    }),
    ProjectsAbout: new TransitionScene({
      geometry: this.geometry,
      shader: projectsAboutShader,
    }),
    ProjectsProjectDetail: new TransitionScene({
      geometry: this.geometry,
      shader: fragmentShaderZoom,
    }),
  };
  activeEffect: TransitionEffect;
  debug: FolderApi;

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "post" });
  }

  render() {
    let currentRT = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    this.transitionEffects[this.activeEffect].updateScreen(
      this.renderTarget.texture
    );

    this.renderer.setRenderTarget(currentRT);
    this.renderer.render(
      this.transitionEffects[this.activeEffect],
      this.camera
    );
  }
}
