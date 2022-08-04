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
    this.mesh.renderOrder = 100;
    // this.mesh.scale.setScalar(0.75);
    // this.mesh.position.set(-0.25, 0.35, 0);
  }

  onPointermove(e, mouse) {
    // const [hit] = this.raycaster.intersectObject(this.mesh);
    this.raycaster.set(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(mouse.x, mouse.y, -1).normalize()
    );
    const [hit] = this.raycaster.intersectObject(this.mesh);
    if (hit) {
      console.log(hit.uv);
      this.flowmap.onPointermove(e, hit.uv);
    }
  }

  resize() {
    const widthRatio = 1 / window.innerWidth;
    const heightRatio = 2 / window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    let orientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    let device =
      window.innerWidth > 749
        ? "desktop"
        : window.innerWidth > 481
        ? "ipad"
        : "mobile";

    let s;
    if (device === "desktop") {
      s = 749 * widthRatio;
      //   this.mesh.position.x = -100 * widthRatio;
      this.mesh.position.x = s - 400 * widthRatio * 2 - s * 0.3;
      this.mesh.position.y =
        1 - s * aspect + heightRatio * 0 - heightRatio * 100;
    } else if (device === "ipad") {
      s = 481 * widthRatio;
      this.mesh.position.x = -0.1;
      this.mesh.position.y = 0.35;
      //   this.mesh.position.y = 1 - s * aspect - 0 * heightRatio;
      //   this.mesh.position.y = 0.4;
    } else {
      s = 1.2;
      this.mesh.position.y = 0.35;
      this.mesh.position.x = 0;
    }
    this.mesh.scale.set(s, s * aspect, 1);
  }

  update() {
    this.flowmap.update(this.renderer, this.camera);
  }
}
