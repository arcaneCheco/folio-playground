import * as THREE from "three";
import vertexUnderline from "./shaders/aboutNav/underline/vertex.glsl";
import fragmentUnderline from "./shaders/aboutNav/underline/fragment.glsl";
import vertexShader from "./shaders/aboutNav/text/vertex.glsl";
import fragmentShader from "./shaders/aboutNav/text/fragment.glsl";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";

export default class AboutNav {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-0.85, 0.5, 0);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
    });

    this.geometry = new TextGeometry();
    this.geometry.setText({
      font,
      text: "View Projects",
      align: "center",
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "aboutNav";
    this.group.rotateZ(Math.PI / 2);
    this.group.add(this.mesh);

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
        // transparent: true,
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
