import * as THREE from "three";
import twitterSrc from "./data/images/icons/twitter.png";
import githubSrc from "./data/images/icons/github.png";
import linkedinSrc from "./data/images/icons/linkedin.png";
import emailSrc from "./data/images/icons/email.png";

export default class AboutSocialIcons {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.z = 0.1;
    let aspect = window.innerWidth / window.innerHeight;
    let scale = 0.1;
    this.group.scale.set(scale, scale * aspect, 1);
    this.group.position.y = -0.5;
    this.iconMaterial = new THREE.ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;

      void main() {
        gl_Position = modelMatrix * vec4(position, 1.);
        vUv = uv;
      }`,
      fragmentShader: `
      uniform sampler2D uMap;
      varying vec2 vUv;

      void main() {
        vec4 icon = texture2D(uMap, vUv);
        gl_FragColor = icon;
      }`,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uMap: { value: null },
      },
    });

    this.loader = new THREE.TextureLoader();

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.twitter = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.twitter.material.uniforms.uMap.value = this.loader.load(twitterSrc);
    this.twitter.position.x = -3;
    this.twitter.name = "twitter";
    this.group.add(this.twitter);

    this.github = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.github.material.uniforms.uMap.value = this.loader.load(githubSrc);
    this.github.position.x = -1;
    this.github.name = "github";
    this.group.add(this.github);

    this.linkedin = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.linkedin.material.uniforms.uMap.value = this.loader.load(linkedinSrc);
    this.linkedin.name = "linkedin";
    this.linkedin.position.x = 1;
    this.group.add(this.linkedin);

    this.email = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.email.material.uniforms.uMap.value = this.loader.load(emailSrc);
    this.email.name = "email";
    this.email.position.x = 3;
    this.group.add(this.email);
  }
}
