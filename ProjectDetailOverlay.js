import * as THREE from "three";
import vertexLine from "./shaders/projectDetailOverlay/line/vertex.glsl";
import fragmentLine from "./shaders/projectDetailOverlay/line/fragment.glsl";
import vertexClose from "./shaders/projectDetailOverlay/close/vertex.glsl";
import fragmentClose from "./shaders/projectDetailOverlay/close/fragment.glsl";
import vertexText from "./shaders/projectDetailOverlay/text/vertex.glsl";
import fragmentText from "./shaders/projectDetailOverlay/text/fragment.glsl";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";

export default class ProjectDetailOverlay {
  constructor() {
    this.group = new THREE.Group();
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexLine,
      fragmentShader: fragmentLine,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth / 2,
            window.innerHeight / 2
          ),
        },
        uLineThickness: { value: 5 },
        uLengthBottom: { value: 400 },
        uLengthCorner: { value: 150 },
        uCenterGap: { value: 100 },
        uLengthTop: { value: 200 },
      },
      transparent: true,
      depthWrite: false,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.mesh1 = new THREE.Mesh(this.geometry, this.material);

    this.mesh1.renderOrder = 101;

    this.group.add(this.mesh1);

    this.setCloseButton();

    this.setNavButtons();
  }

  setCloseButton() {
    let size = 100;

    let geometry = new THREE.PlaneGeometry(1, 1);
    let material = new THREE.ShaderMaterial({
      vertexShader: vertexClose,
      fragmentShader: fragmentClose,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uSize: { value: 2 * size },
        uBorderThickness: { value: 5 },
        uBorderStrength: { value: 0.7 },
        uCrossThickness: { value: 5 },
        uCrossSize: { value: 50 },
        uBackgroundStrength: { value: 0.4 },
      },
    });
    this.close = new THREE.Mesh(geometry, material);

    this.close.renderOrder = 102;

    let scaleX = (size * 2) / window.innerWidth;
    let scaleY = (size * 2) / window.innerHeight;
    this.close.scale.set(scaleX, scaleY, 1);

    this.close.position.y =
      0.5 - this.material.uniforms.uLineThickness.value / window.innerHeight;

    this.group.add(this.close);
  }

  setNavButtons() {
    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexText,
      fragmentShader: fragmentText,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
    });

    let prevGeometry = new TextGeometry();
    prevGeometry.setText({
      font,
      text: "Prev.",
      align: "left",
    });

    this.prevButton = new THREE.Mesh(prevGeometry, this.textMaterial);

    let scaleX = 100 / window.innerWidth;
    this.prevButton.scale.set(scaleX, scaleX, 1);
    this.prevButton.position.set(-0.5 + 0.02, -0.5 + scaleX, 0);

    this.group.add(this.prevButton);

    ////
    let nextGeometry = new TextGeometry();
    nextGeometry.setText({
      font,
      text: "Next",
      align: "right",
    });

    this.nextButton = new THREE.Mesh(nextGeometry, this.textMaterial);

    this.nextButton.scale.set(scaleX, scaleX, 1);
    this.nextButton.position.set(0.5 - 0.02, -0.5 + scaleX, 0);

    this.group.add(this.nextButton);
  }
}
