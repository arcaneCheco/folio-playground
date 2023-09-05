import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import vertexShader from "@shaders/aboutIcons/vertex.glsl";
import fragmentShader from "@shaders/aboutIcons/fragment.glsl";
import { World } from "@src/app";
import { _AboutSocialIcons } from "@types";

// @ts-ignore 
export class SocialIcons implements _AboutSocialIcons {
  world = new World();
  group = new Group();
  iconMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    uniforms: {
      uMap: { value: null },
    },
  });
  geometry = new PlaneGeometry(1, 1);
  // twitter: Mesh<PlaneGeometry, ShaderMaterial>;
  github: Mesh<PlaneGeometry, ShaderMaterial>;
  linkedin: Mesh<PlaneGeometry, ShaderMaterial>;
  constructor() {
    // this.group.position.z = 0.1;

    const { twitterIcon, githubIcon, linkedinIcon } =
      this.world.resources.assets;

    // this.twitter = new Mesh(this.geometry, this.iconMaterial.clone());
    // this.twitter.material.uniforms.uMap.value = twitterIcon;
    // this.twitter.name = "twitter";
    // this.group.add(this.twitter);

    this.github = new Mesh(this.geometry, this.iconMaterial.clone());
    this.github.material.uniforms.uMap.value = githubIcon;
    this.github.name = "github";
    this.group.add(this.github);

    this.linkedin = new Mesh(this.geometry, this.iconMaterial.clone());
    this.linkedin.material.uniforms.uMap.value = linkedinIcon;
    this.linkedin.name = "linkedin";
    this.group.add(this.linkedin);
  }

  onResize() {
    let aspect = window.innerWidth / window.innerHeight;
    let scale = 80 / window.innerWidth;
    this.group.scale.set(scale, scale * aspect, 1);
    this.group.position.y =
      -1 + (scale / 2) * aspect + 140 / window.innerHeight;

    // this.twitter.position.x = -2;
    this.github.position.x = -1;
    this.linkedin.position.x = 1;
  }
}
