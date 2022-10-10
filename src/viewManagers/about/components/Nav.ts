import { Group, Matrix4, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import vertexUnderline from "@shaders/aboutNav/underline/vertex.glsl";
import fragmentUnderline from "@shaders/aboutNav/underline/fragment.glsl";
import vertexShader from "@shaders/aboutNav/text/vertex.glsl";
import fragmentShader from "@shaders/aboutNav/text/fragment.glsl";
import TextGeometry from "@utils/TextGeometry";
import { TextAlign, _AboutNav } from "@types";
import { World } from "@src/app";

export class Nav implements _AboutNav {
  group = new Group();
  font = new World().resources.fonts.audiowideRegular;
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
  });
  geometry = new TextGeometry();
  mesh = new Mesh(this.geometry, this.material);
  constructor() {
    this.mesh.name = "aboutNav";
    this.group.position.set(-0.85, 0.5, 0);
    this.group.rotateZ(Math.PI / 2);
    this.group.add(this.mesh);

    this.geometry.setText({
      fontData: this.font.data,
      text: "View Projects",
      align: TextAlign.Center,
    });

    this.geometry.computeBoundingBox();
    const width =
      this.geometry.boundingBox!.max.x - this.geometry.boundingBox!.min.x;
    this.geometry.applyMatrix4(
      new Matrix4().makeScale(1 / width, 1 / width, 1)
    );
    const underline = new Mesh(
      new PlaneGeometry(1, 0.1 / width),
      new ShaderMaterial({
        vertexShader: vertexUnderline,
        fragmentShader: fragmentUnderline,
      })
    );
    underline.name = "aboutNav";
    underline.position.y = -0.75 / width;
    this.group.add(underline);
  }

  onPointermove() {}

  onPointerup() {}

  onPointerdown() {}

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const scaleX = 0.6;
    const scaleY = scaleX / aspect;
    this.group.scale.set(scaleX, scaleY, 1);
  }
}
