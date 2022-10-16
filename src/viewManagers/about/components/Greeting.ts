import { Group, Matrix4, Mesh, ShaderMaterial } from "three";
import { World } from "@src/app";
import TextGeometry from "@utils/TextGeometry";
import vertexShader from "@shaders/aboutGreeting/vertex.glsl";
import fragmentShader from "@shaders/aboutGreeting/fragment.glsl";
import { TextAlign, _AboutGreeting } from "@types";

export class Greeting implements _AboutGreeting {
  world = new World();
  font = this.world.resources.fonts.anironRegular;
  group = new Group();
  textMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  geometry1 = new TextGeometry();
  geometry2 = new TextGeometry();
  mesh1 = new Mesh(this.geometry1, this.textMaterial);
  mesh2 = new Mesh(this.geometry2, this.textMaterial);
  constructor() {
    this.group.renderOrder = 10000;
    this.group.add(this.mesh1);
    this.group.add(this.mesh2);

    this.geometry1.setText({
      fontData: this.font.data,
      text: "Thanks",
      align: TextAlign.Right,
    });
    this.geometry1.applyMatrix4(new Matrix4().makeRotationZ(Math.PI / 2));
    this.geometry1.applyMatrix4(new Matrix4().makeTranslation(-0.5, 0, 0));

    this.geometry2.setText({
      fontData: this.font.data,
      text: "for stopping by!",
    });
    this.geometry2.applyMatrix4(new Matrix4().makeTranslation(0.4, -0.5, 0));
  }

  onResize(sizes) {
    this.group.scale.set(sizes.scaleX, sizes.scaleY, 1);
    this.group.position.y = sizes.posY;
    this.group.position.x = sizes.posX;
    // this.group.position.x = sizes.mesh1posX;
    // this.mesh1.rotation.z = Math.PI / 2;

    this.mesh1.scale.set(1.5, 1.5, 1);

    // this.mesh2.position.y = this.g1Width * sizes.scaleY;

    // let scale = 0.03;
    // this.mesh1.position.y = 0.17;
    // this.mesh1.position.x = -0.2 - scale * 0.5 - 0.003;
    // this.mesh1.scale.setScalar(scale);

    // let scale2 = 0.02;
    // this.mesh2.position.x = -0.2 + 0.003;
    // this.mesh2.position.y = 0.288;
    // this.mesh2.scale.setScalar(scale2);
  }
}
