import * as THREE from "three";

export default class AboutScreen {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.scale.set(0.4, 0.2, 1);
    this.mesh.position.y = 0.17;
  }
}
