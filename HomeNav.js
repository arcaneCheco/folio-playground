import * as THREE from "three";
import vertexUnderline from "./shaders/homeNav/underline/vertex.glsl";
import fragmentUnderline from "./shaders/homeNav/underline/fragment.glsl";
import vertexShader from "./shaders/homeNav/text/vertex.glsl";
import fragmentShader from "./shaders/homeNav/text/fragment.glsl";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";

export default class HomeNav {
  constructor() {
    this.group = new THREE.Group();

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.geometry = new TextGeometry();
    this.geometry.setText({
      font,
      text: "View Projects",
      align: "center",
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "homeNav";
    this.group.rotateZ(Math.PI / 2);
    this.group.add(this.mesh);
    this.group.renderOrder = 501;

    this.geometry.computeBoundingBox();
    const width =
      this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x;
    this.geometry.applyMatrix4(
      new THREE.Matrix4().makeScale(1 / width, 1 / width, 1)
    );
    const underline = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 0.1 / width),
      new THREE.ShaderMaterial({
        vertexShader: vertexUnderline,
        fragmentShader: fragmentUnderline,
        depthTest: false,
        depthWrite: false,
      })
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
