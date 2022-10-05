import * as THREE from "three";
import vertexSideline from "@shaders/projectsNav/sideline/vertex.glsl";
import fragmentSideline from "@shaders/projectsNav/sideline/fragment.glsl";
import vertexShader from "@shaders/projectsNav/text/vertex.glsl";
import fragmentShader from "@shaders/projectsNav/text/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";
import { World } from "@src/app";

export default class ProjectsNav {
  group = new THREE.Group();
  lineThickness = 3;
  textLineSpacing = 5;
  material: any;
  navGroup: any;
  homeNav: any;
  aboutNav: any;
  sideline: any;
  world;
  font;
  constructor() {
    this.world = new World();
    this.font = this.world.resources.fonts.audiowideRegular;
    this.group.rotateZ(-Math.PI / 2);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: this.font.map },
      },
      transparent: true,
    });

    this.setNavButtons();

    this.setLine();
  }

  setNavButtons() {
    this.navGroup = new THREE.Group();
    // this.navGroup.position.y = 0.5 + this.lineThickness + this.textLineSpacing;
    this.group.add(this.navGroup);
    let homeGeometry = new TextGeometry();
    homeGeometry.setText({
      font: this.font.data,
      text: "Home",
      align: "left",
    });

    this.homeNav = new THREE.Mesh(homeGeometry, this.material);
    this.homeNav.name = "home";
    this.navGroup.add(this.homeNav);

    let aboutGeometry = new TextGeometry();
    aboutGeometry.setText({
      font: this.font.data,
      text: "About",
      align: "right",
    });

    this.aboutNav = new THREE.Mesh(aboutGeometry, this.material);
    this.aboutNav.name = "about";
    this.navGroup.add(this.aboutNav);
  }

  setLine() {
    let lineGeometry = new THREE.PlaneGeometry(2, 1);
    let lineMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexSideline,
      fragmentShader: fragmentSideline,
    });
    this.sideline = new THREE.Mesh(lineGeometry, lineMaterial);
    this.group.add(this.sideline);
  }

  onResize(sizes) {
    this.group.position.x = sizes.posX;
    this.sideline.scale.y = sizes.lineScaleY;
    this.sideline.scale.x = sizes.lineScaleX;
    this.navGroup.position.y = sizes.navPosY;
    this.navGroup.scale.y = sizes.navScaleY;
    this.navGroup.scale.x = sizes.navScaleX;
    this.homeNav.position.x = sizes.posHome;
    this.aboutNav.position.x = sizes.posAbout;
  }
}
