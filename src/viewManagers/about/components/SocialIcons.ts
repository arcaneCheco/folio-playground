import * as THREE from "three";

export class SocialIcons {
  group = new THREE.Group();
  iconMaterial: any;
  geometry: any;
  twitter: any;
  github: any;
  linkedin: any;
  constructor() {
    this.group.position.z = 0.1;
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

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.twitter = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.twitter.name = "twitter";
    this.group.add(this.twitter);

    this.github = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.github.name = "github";
    this.group.add(this.github);

    this.linkedin = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    this.linkedin.name = "linkedin";
    this.group.add(this.linkedin);

    // this.email = new THREE.Mesh(this.geometry, this.iconMaterial.clone());
    // this.email.material.uniforms.uMap.value = this.loader.load(emailSrc);
    // this.email.name = "email";
    // this.group.add(this.email);
  }

  onPreloaded({ twitterIcon, githubIcon, linkedinIcon }) {
    this.twitter.material.uniforms.uMap.value = twitterIcon;
    this.github.material.uniforms.uMap.value = githubIcon;
    this.github.material.uniforms.uMap.value = githubIcon;
    this.linkedin.material.uniforms.uMap.value = linkedinIcon;
  }

  onResize() {
    let aspect = window.innerWidth / window.innerHeight;
    let scale = 80 / window.innerWidth;
    this.group.scale.set(scale, scale * aspect, 1);
    this.group.position.y =
      -1 + (scale / 2) * aspect + 140 / window.innerHeight;

    this.twitter.position.x = -2;
    this.github.position.x = -0;
    this.linkedin.position.x = 2;
  }
}
