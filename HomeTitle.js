import { World } from "./app";
import * as THREE from "three";
import Flowmap from "./Flowmap";
import TextTexture from "./TextTexture";
import vertexShader from "./shaders/homeTitle/vertex.glsl";
import fragmentShader from "./shaders/homeTitle/fragment.glsl";
// import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
export default class HomeTitle {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.group = new THREE.Group();
    this.raycaster = this.world.raycaster;
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.flowmap = new Flowmap();
    this.textTexture = new TextTexture({ lineHeight: 1.5 });
    window.setTimeout(() => {
      this.textTexture.createTexture(this.renderer, this.camera);
    }, 500);
    this.aspect = this.textTexture.geometryAspect;
    // at this point can destroy textTexture;

    // this.geometry = new THREE.PlaneGeometry(this.textTexture.geometryAspect, 1);
    this.geometry = new THREE.PlaneGeometry(2, 2);
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
    this.mesh.name = "homeTitle";
    this.mesh.renderOrder = 100;
    this.mesh.position.z = -0.01;
    this.group.add(this.mesh);
  }

  onPointermove(e, uv) {
    this.flowmap.onPointermove(e, uv);
  }

  resize(sizes) {
    this.mesh.position.x = sizes.posX;
    this.mesh.position.y = sizes.posY;
    this.mesh.scale.x = sizes.scaleX;
    this.mesh.scale.y = sizes.scaleY;
  }

  update() {
    this.flowmap.update(this.renderer, this.camera);
  }
}
