import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { TextAlign, _ProjectsFilters } from "@types";
import { World } from "@src/app";
import vertexShader from "@shaders/projectFilters/text/vertex.glsl";
import fragmentShader from "@shaders/projectFilters/text/fragment.glsl";
import vertexUnderline from "@shaders/projectFilters/underline/vertex.glsl";
import fragmentUnderline from "@shaders/projectFilters/underline/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";

export class Filters implements _ProjectsFilters {
  world = new World();
  font = this.world.resources.fonts.audiowideRegular;
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
      uActive: { value: false },
    },
    transparent: true,
  });
  filters = ["All", "Sites", "Sketches", "Publications"];
  outerGroup = new Group();
  group = new Group();
  size = 150;
  underlineThickness = 0.1;
  gap = 1.2;
  gWidth: number;
  underlineMaterial = new ShaderMaterial({
    vertexShader: vertexUnderline,
    fragmentShader: fragmentUnderline,
  });
  constructor() {
    this.outerGroup.add(this.group);

    this.filters.map((text, i) => {
      let geometry = new TextGeometry();
      geometry.setText({
        fontData: this.font.data,
        text,
        align: TextAlign.Right,
      });

      if (text === "Publications") {
        geometry.computeBoundingBox();
        const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
        this.gWidth = width;
      }

      let mesh = new Mesh(geometry, this.material.clone());
      mesh.name = text.toLowerCase();

      mesh.position.y = -i * (1 + this.gap);

      this.group.add(mesh);
    });

    this.underlineButtons();
  }

  underlineButtons() {
    const m = new Mesh(
      new PlaneGeometry(this.gWidth * 1.05, this.underlineThickness),
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
