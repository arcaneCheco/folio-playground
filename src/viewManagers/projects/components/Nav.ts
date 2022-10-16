import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import vertexSideline from "@shaders/projectsNav/sideline/vertex.glsl";
import fragmentSideline from "@shaders/projectsNav/sideline/fragment.glsl";
import vertexShader from "@shaders/projectsNav/text/vertex.glsl";
import fragmentShader from "@shaders/projectsNav/text/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";
import { World } from "@src/app";
import { TextAlign, View, _ProjectsNav, _World } from "@types";

export class Nav implements _ProjectsNav {
  world: _World = new World();
  font = this.world.resources.fonts.audiowideRegular;
  group: Group = new Group();
  lineThickness = 3;
  textLineSpacing = 5;
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
  });
  navGroup = new Group();
  homeNav: Mesh;
  aboutNav: Mesh;
  sideline: Mesh;
  constructor() {
    this.group.rotateZ(-Math.PI / 2);

    this.setNavButtons();

    this.setLine();
  }

  setNavButtons() {
    this.group.add(this.navGroup);
    let homeGeometry = new TextGeometry();
    homeGeometry.setText({
      fontData: this.font.data,
      text: "Home",
      align: TextAlign.Left,
    });

    this.homeNav = new Mesh(homeGeometry, this.material);
    this.homeNav.name = View.Home;
    this.navGroup.add(this.homeNav);

    let aboutGeometry = new TextGeometry();
    aboutGeometry.setText({
      fontData: this.font.data,
      text: "About",
      align: TextAlign.Right,
    });

    this.aboutNav = new Mesh(aboutGeometry, this.material);
    this.aboutNav.name = View.About;
    this.navGroup.add(this.aboutNav);
  }

  setLine() {
    let lineGeometry = new PlaneGeometry(2, 1);
    let lineMaterial = new ShaderMaterial({
      vertexShader: vertexSideline,
      fragmentShader: fragmentSideline,
    });
    this.sideline = new Mesh(lineGeometry, lineMaterial);
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
