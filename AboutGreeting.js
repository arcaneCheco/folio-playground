import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/aboutGreeting/vertex.glsl";
import fragmentShader from "./shaders/aboutGreeting/fragment.glsl";

export default class AboutGreeting {
  constructor() {
    this.group = new THREE.Group();
    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
    });

    const geometry1 = new TextGeometry();
    geometry1.setText({
      font,
      text: "Thanks",
    });

    const mesh1 = new THREE.Mesh(geometry1, this.textMaterial);

    let scale = 0.03;
    mesh1.rotation.z = Math.PI / 2;
    // mesh1.position.z = 0.5;
    mesh1.position.y = 0.17;
    mesh1.position.x = -0.2 - scale * 0.5 - 0.003;
    mesh1.scale.setScalar(scale);

    this.group.add(mesh1);

    const geometry2 = new TextGeometry();
    geometry2.setText({
      font,
      text: "for stopping by!",
    });

    const mesh2 = new THREE.Mesh(geometry2, this.textMaterial);
    let scale2 = 0.02;
    // mesh2.position.z = 0.5;
    mesh2.position.x = -0.2 + 0.003;
    mesh2.position.y = 0.288;
    mesh2.scale.setScalar(scale2);

    this.group.add(mesh2);
  }
}
