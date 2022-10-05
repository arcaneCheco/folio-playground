import * as THREE from "three";
import TextGeometry from "../../../components/TextGeometry";
import vertexShader from "@shaders/aboutGreeting/vertex.glsl";
import fragmentShader from "@shaders/aboutGreeting/fragment.glsl";

export class Greeting {
  group = new THREE.Group();
  textMaterial: any;
  g1Width: any;
  mesh1: any;
  mesh2: any;
  font;
  geometry1;
  geometry2;
  constructor() {
    this.group.renderOrder = 10000;
    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: null },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.geometry1 = new TextGeometry();

    this.geometry1.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    this.geometry1.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-0.5, 0, 0)
    );

    this.mesh1 = new THREE.Mesh(this.geometry1, this.textMaterial);

    this.group.add(this.mesh1);

    this.geometry2 = new TextGeometry();

    this.geometry2.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, -0.5, 0)
    );

    this.mesh2 = new THREE.Mesh(this.geometry2, this.textMaterial);

    this.group.add(this.mesh2);
  }

  onPreloaded(font) {
    this.font = font;
    this.textMaterial.uniforms.tMap.value = this.font.map;

    this.geometry1.setText({
      font: this.font.data,
      text: "Thanks",
      align: "right",
    });

    this.geometry1.computeBoundingBox();
    this.g1Width =
      this.geometry1.boundingBox!.max.x - this.geometry1.boundingBox!.min.x;

    this.geometry2.setText({
      font: this.font.data,
      text: "for stopping by!",
    });
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
