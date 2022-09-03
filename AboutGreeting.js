import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/aboutGreeting/vertex.glsl";
import fragmentShader from "./shaders/aboutGreeting/fragment.glsl";

export default class AboutGreeting {
  constructor() {
    this.group = new THREE.Group();
    this.group.renderOrder = 10000;
    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const geometry1 = new TextGeometry();
    geometry1.setText({
      font,
      text: "Thanks",
      align: "right",
    });

    geometry1.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    geometry1.applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5, 0, 0));

    geometry1.computeBoundingBox();
    this.g1Width = geometry1.boundingBox.max.x - geometry1.boundingBox.min.x;

    this.mesh1 = new THREE.Mesh(geometry1, this.textMaterial);

    this.group.add(this.mesh1);

    const geometry2 = new TextGeometry();
    geometry2.setText({
      font,
      text: "for stopping by!",
    });

    geometry2.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.5, 0));

    this.mesh2 = new THREE.Mesh(geometry2, this.textMaterial);

    this.group.add(this.mesh2);
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
