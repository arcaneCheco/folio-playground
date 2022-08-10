import * as THREE from "three";

export default class AboutSocialIcons {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.z = 0.1;
    let aspect = window.innerWidth / window.innerHeight;
    let scale = 0.1;
    this.group.scale.set(scale, scale * aspect, 1);
    this.group.position.y = -0.5;
    this.iconMaterial = new THREE.ShaderMaterial({
      vertexShader: `void main() {gl_Position = modelMatrix * vec4(position, 1.);}`,
      fragmentShader: `void main() {gl_FragColor = vec4(0., 1., 1., 1.);}`,
      depthWrite: false,
      depthTest: false,
      transparent: true,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.twitter = new THREE.Mesh(this.geometry, this.iconMaterial);
    this.twitter.position.x = -3;
    this.twitter.name = "twitter";
    this.group.add(this.twitter);

    this.github = new THREE.Mesh(this.geometry, this.iconMaterial);
    this.github.position.x = -1;
    this.github.name = "github";
    this.group.add(this.github);

    this.linkedin = new THREE.Mesh(this.geometry, this.iconMaterial);
    this.linkedin.name = "linkedin";
    this.linkedin.position.x = 1;
    this.group.add(this.linkedin);

    this.email = new THREE.Mesh(this.geometry, this.iconMaterial);
    this.email.name = "email";
    this.email.position.x = 3;
    this.group.add(this.email);
  }
}
