import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import {
  ProjectCategory,
  TextAlign,
  _ProjectsFilters,
  _TextGeometry,
} from "@types";
import { World } from "@src/app";
import vertexShader from "@shaders/projectFilters/text/vertex.glsl";
import fragmentShader from "@shaders/projectFilters/text/fragment.glsl";
import vertexUnderline from "@shaders/projectFilters/underline/vertex.glsl";
import fragmentUnderline from "@shaders/projectFilters/underline/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";

class FilterGroup extends Group {
  children: Array<Mesh<_TextGeometry, ShaderMaterial>>;
}

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
  activeFilter?: ProjectCategory;
  outerGroup = new Group();
  group: FilterGroup = new FilterGroup();
  size = 150;
  underlineThickness = 0.1;
  gap = 1.2;
  gWidth = 0;
  underlineMaterial = new ShaderMaterial({
    vertexShader: vertexUnderline,
    fragmentShader: fragmentUnderline,
  });
  constructor() {
    this.outerGroup.add(this.group);

    Object.values(ProjectCategory).map((category, i) => {
      let geometry = new TextGeometry();
      geometry.setText({
        fontData: this.font.data,
        text: category,
        align: TextAlign.Right,
      });

      geometry.computeBoundingBox();
      const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
      if (width > this.gWidth) {
        this.gWidth = width;
      }

      let mesh = new Mesh(geometry, this.material.clone());
      mesh.name = category;

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

  updateActiveFilter(filter: ProjectCategory) {
    if (this.activeFilter === filter) return;
    this.activeFilter = filter;
    this.group.children.map((mesh) =>
      mesh.name === filter
        ? (mesh.material.uniforms.uActive.value = true)
        : (mesh.material.uniforms.uActive.value = false)
    );
  }

  onResize(sizes) {
    this.outerGroup.position.x = sizes.posX;
    this.outerGroup.scale.set(sizes.scaleX, sizes.scaleY, 1);

    this.outerGroup.position.y = sizes.posY;
  }
}
