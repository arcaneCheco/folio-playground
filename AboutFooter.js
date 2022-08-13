import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/aboutFooter/text/vertex.glsl";
import fragmentShader from "./shaders/aboutFooter/text/fragment.glsl";
import pinSrc from "./data/images/icons/pin.png";
import cvSrc from "./data/images/icons/cv.png";

export default class AboutFooter {
  constructor() {
    this.group = new THREE.Group();
    this.group.renderOrder = 6001;
    this.group.scale.set(0.04, 0.04, 1);
    this.group.position.y = -0.75;

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

    this.loader = new THREE.TextureLoader();

    this.iconGeometry = new THREE.PlaneGeometry(1, 1);
    this.iconMaterial = new THREE.ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;

      void main() {
        gl_Position = modelMatrix * vec4(position, 1.);
        vUv = uv;
      }`,
      fragmentShader: `
      uniform sampler2D uMap;
      varying vec2 vUv;

      void main() {
        vec4 icon = texture2D(uMap, vUv);
        gl_FragColor = icon;
      }`,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uMap: { value: null },
      },
    });

    this.locationGroup = new THREE.Group();
    this.group.add(this.locationGroup);

    let locationGeometry = new TextGeometry();
    locationGeometry.setText({
      font,
      text: "London, UK",
      align: "center",
    });

    this.location = new THREE.Mesh(locationGeometry, this.textMaterial);
    this.locationGroup.add(this.location);
    this.locationGroup.position.x = 8;

    this.locationIcon = new THREE.Mesh(
      this.iconGeometry,
      this.iconMaterial.clone()
    );
    this.locationIcon.material.uniforms.uMap.value = this.loader.load(pinSrc);
    this.locationIcon.position.x = -7;
    this.locationIcon.scale.multiplyScalar(2);
    this.locationGroup.add(this.locationIcon);

    this.cvGroup = new THREE.Group();
    this.group.add(this.cvGroup);

    let cvGeometry = new TextGeometry();
    cvGeometry.setText({
      font,
      text: "curriculum vitae",
      align: "center",
    });

    this.cv = new THREE.Mesh(cvGeometry, this.textMaterial);
    this.cv.name = "cv";
    this.cvGroup.add(this.cv);
    this.cvGroup.position.x = -8;

    this.cvIcon = new THREE.Mesh(this.iconGeometry, this.iconMaterial.clone());
    this.cvIcon.material.uniforms.uMap.value = this.loader.load(cvSrc);
    this.cvIcon.name = "cv";
    this.cvIcon.position.x = -7;
    this.cvIcon.scale.multiplyScalar(2);
    this.cvGroup.add(this.cvIcon);
  }
}
