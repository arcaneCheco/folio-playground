import { World } from "./app";
import * as THREE from "three";
import Flowmap from "./Flowmap";
import TextTexture from "./TextTexture";
import vertexShader from "./shaders/homeTitle/vertex.glsl";
import fragmentShader from "./shaders/homeTitle/fragment.glsl";

export default class HomeTitle {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.flowmap = new Flowmap();
    this.textTexture = new TextTexture({});
    window.setTimeout(() => {
      this.textTexture.createTexture(this.renderer, this.camera);
    }, 500);
    this.aspect = this.textTexture.geometryAspect;
    // at this point can destroy textTexture;

    this.geometry = new THREE.PlaneGeometry(this.textTexture.geometryAspect, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFlowmap: this.flowmap.texture,
        uTextImage: this.textTexture.texture,
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      // blending: THREE.NoBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0.5);
    this.scene.add(this.mesh);
  }

  onPointermove(e) {
    const [hit] = this.raycaster.intersectObject(this.mesh);
    if (hit) {
      this.flowmap.onPointermove(e, hit.uv);
    }
  }

  update() {
    // this.textTexture.createTexture(this.renderer, this.camera);
    this.flowmap.update(this.renderer, this.camera);
  }
}
