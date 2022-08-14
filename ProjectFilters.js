import * as THREE from "three";
import vertexShader from "./shaders/projectFilters/text/vertex.glsl";
import fragmentShader from "./shaders/projectFilters/text/fragment.glsl";
import vertexUnderline from "./shaders/projectFilters/underline/vertex.glsl";
import fragmentUnderline from "./shaders/projectFilters/underline/fragment.glsl";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import TextGeometry from "./TextGeometry";

export default class ProjectsFilters {
  constructor() {
    this.outerGroup = new THREE.Group();
    this.group = new THREE.Group();
    this.outerGroup.add(this.group);

    this.size = 150;

    this.underlineThickness = 0.1;

    this.gap = 1.2;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
        uActive: { value: false },
      },
      transparent: true,
    });

    this.filters = ["All", "Sites", "Sketches", "Publications"];

    this.filters.map((text, i) => {
      let geometry = new TextGeometry();
      geometry.setText({
        font,
        text,
        align: "right",
      });

      if (text === "Publications") {
        geometry.computeBoundingBox();
        const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        this.gWidth = width;
      }

      let mesh = new THREE.Mesh(geometry, this.material.clone());
      mesh.name = text.toLowerCase();

      mesh.position.y = -i * (1 + this.gap);

      this.group.add(mesh);
    });

    this.underlineButtons();
  }

  underlineButtons() {
    this.underlineMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexUnderline,
      fragmentShader: fragmentUnderline,
    });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(this.gWidth * 1.05, this.underlineThickness),
      this.underlineMaterial
    );

    this.group.children.map((child) => {
      let line = m.clone();
      line.position.x = this.gWidth * 0.5 - this.gWidth;
      line.position.y = -0.5 - this.underlineThickness / 2;
      child.add(line);
    });
  }

  onResize(sizes) {
    this.outerGroup.position.x = sizes.posX;
    this.outerGroup.scale.set(sizes.scaleX, sizes.scaleY, 1);

    this.outerGroup.position.y = sizes.posY;
  }
}
