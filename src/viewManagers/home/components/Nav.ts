import vertexUnderline from "@shaders/homeNav/underline/vertex.glsl";
import fragmentUnderline from "@shaders/homeNav/underline/fragment.glsl";
import vertexShader from "@shaders/homeNav/text/vertex.glsl";
import fragmentShader from "@shaders/homeNav/text/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";
import { TextAlign, _HomeNav } from "@types";
import { World } from "@src/app";
import { Group, Matrix4, Mesh, PlaneGeometry, ShaderMaterial } from "three";

export class Nav implements _HomeNav {
  world = new World();
  group = new Group();
  font = this.world.resources.fonts.audiowideRegular;
  textMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  underlineMaterial = new ShaderMaterial({
    vertexShader: vertexUnderline,
    fragmentShader: fragmentUnderline,
    depthTest: false,
    depthWrite: false,
  });
  geometry = new TextGeometry();
  mesh = new Mesh(this.geometry, this.textMaterial);
  hover = false;
  down = false;
  constructor() {
    this.geometry.setText({
      fontData: this.font.data,
      text: "View Projects",
      align: TextAlign.Center,
    });
    this.mesh.name = "homeNav";
    this.group.rotateZ(Math.PI / 2);
    this.group.add(this.mesh);
    this.group.renderOrder = 501;
    this.geometry.computeBoundingBox();

    const width =
      this.geometry.boundingBox!.max.x - this.geometry.boundingBox!.min.x;
    this.geometry.applyMatrix4(
      new Matrix4().makeScale(1 / width, 1 / width, 1)
    );

    const underline = new Mesh(
      new PlaneGeometry(1, 0.1 / width),
      this.underlineMaterial
    );
    underline.name = "homeNav";
    underline.position.y = -1 / width;
    this.group.add(underline);
  }

  onPointermove() {}

  onPointerup() {}

  onPointerdown() {}

  resize(sizes) {
    this.group.scale.x = sizes.scaleX;
    this.group.scale.y = sizes.scaleY;

    this.group.position.x = sizes.posX;
    this.group.position.y = sizes.posY;
  }
}
