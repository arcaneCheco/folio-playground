import * as THREE from "three";
import vertexSideline from "./shaders/projectsNav/sideline/vertex.glsl";
import fragmentSideline from "./shaders/projectsNav/sideline/fragment.glsl";
import vertexShader from "./shaders/projectsNav/text/vertex.glsl";
import fragmentShader from "./shaders/projectsNav/text/fragment.glsl";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";

export default class ProjectsNav {
  constructor() {
    this.group = new THREE.Group();
    this.group.rotateZ(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
    });

    this.lineThickness = 0.1;

    let homeGeometry = new TextGeometry();
    homeGeometry.setText({
      font,
      text: "Home",
      align: "center",
    });

    this.homeNav = new THREE.Mesh(homeGeometry, this.material);
    this.homeNav.name = "home";
    this.group.add(this.homeNav);

    let aboutGeometry = new TextGeometry();
    aboutGeometry.setText({
      font,
      text: "About",
      align: "center",
    });

    this.aboutNav = new THREE.Mesh(aboutGeometry, this.material);
    this.aboutNav.name = "about";
    this.group.add(this.aboutNav);

    let lineGeometry = new THREE.PlaneGeometry(1, this.lineThickness);
    let lineMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexSideline,
      fragmentShader: fragmentSideline,
    });
    this.sideline = new THREE.Mesh(lineGeometry, lineMaterial);
    this.sideline.position.y = -0.5 - this.lineThickness / 2;
    this.group.add(this.sideline);
  }

  onResize(sizes) {
    this.homeNav.position.x = -0.75 / sizes.scaleX;
    this.aboutNav.position.x = 0.75 / sizes.scaleX;
    this.group.position.x = -0.95;
    this.group.scale.x = sizes.scaleX;
    this.group.scale.y = sizes.scaleY;

    this.sideline.scale.x = 1.7 / sizes.scaleX;
  }
}
