import * as THREE from "three";
import vertexLine from "./shaders/projectDetailOverlay/line/vertex.glsl";
import fragmentLine from "./shaders/projectDetailOverlay/line/fragment.glsl";
import vertexClose from "./shaders/projectDetailOverlay/close/vertex.glsl";
import fragmentClose from "./shaders/projectDetailOverlay/close/fragment.glsl";
import vertexText from "./shaders/projectDetailOverlay/text/vertex.glsl";
import fragmentText from "./shaders/projectDetailOverlay/text/fragment.glsl";
import vertexIcon from "./shaders/projectDetailOverlay/icon/vertex.glsl";
import fragmentIcon from "./shaders/projectDetailOverlay/icon/fragment.glsl";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import linkIconSrc from "./data/images/icons/linkIcon.png";

export default class ProjectDetailOverlay {
  group = new THREE.Group();
  scale = 1.6;
  material: any;
  geometry: any;
  lineMesh: any;
  close: any;
  textMaterial: any;
  prevButton: any;
  nextButton: any;
  visitGroup: any;
  visitText: any;
  iconMaterial: any;
  visitIcon: any;
  constructor() {
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
        uLineThickness: { value: 3 / this.scale },
        uLengthBottom: { value: 250 / this.scale },
        uLengthCorner: { value: 150 / this.scale },
        uCenterGap: { value: 100 / this.scale },
        uLengthTop: { value: 200 / this.scale },
        uScale: { value: this.scale },
      },
      transparent: true,
      depthWrite: false,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.lineMesh = new THREE.Mesh(this.geometry, this.material);

    this.lineMesh.renderOrder = 101;

    // this.si

    this.lineMesh.scale.set(this.scale, this.scale, 1);

    this.group.add(this.lineMesh);

    this.setCloseButton();

    this.setNavButtons();

    this.setVisitButton();
  }

  setCloseButton() {
    let size = 100;

    let geometry = new THREE.PlaneGeometry(1, 1);
    let material = new THREE.ShaderMaterial({
      vertexShader: vertexClose,
      fragmentShader: fragmentClose,
      transparent: true,
      // depthWrite: false,
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

    this.close.name = "close";

    this.close.renderOrder = 102;

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

    this.prevButton.name = "prev";
    this.group.add(this.prevButton);

    let nextGeometry = new TextGeometry();
    nextGeometry.setText({
      font,
      text: "Next",
      align: "right",
    });

    this.nextButton = new THREE.Mesh(nextGeometry, this.textMaterial);

    this.nextButton.name = "next";
    this.group.add(this.nextButton);
  }

  setVisitButton() {
    this.visitGroup = new THREE.Group();
    this.group.add(this.visitGroup);

    let visitGeometry = new TextGeometry();
    visitGeometry.setText({
      font,
      text: "Visit",
      align: "right",
    });

    visitGeometry.computeBoundingBox();
    let textWidth =
      visitGeometry.boundingBox.max.x - visitGeometry.boundingBox.min.x;

    this.visitText = new THREE.Mesh(visitGeometry, this.textMaterial);
    this.visitText.name = "visit";
    this.visitGroup.add(this.visitText);

    this.iconMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexIcon,
      fragmentShader: fragmentIcon,
      uniforms: {
        uIcon: { value: new THREE.TextureLoader().load(linkIconSrc) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    let iconGeometry = new THREE.PlaneGeometry(1, 1);

    this.visitIcon = new THREE.Mesh(iconGeometry, this.iconMaterial);
    this.visitIcon.position.z = 0.5;
    this.visitIcon.scale.z = 10;

    this.visitIcon.name = "visit";
    this.visitGroup.add(this.visitIcon);
  }

  onResize() {
    //closeButton
    let sizeClose = (0.98 - 0.5 * this.scale) * window.innerHeight;
    sizeClose = Math.min(sizeClose, 100);
    let scaleXClose = (sizeClose * 2) / window.innerWidth;
    let scaleY = (sizeClose * 2) / window.innerHeight;
    this.close.scale.set(scaleXClose, scaleY, 1);
    let closePosY =
      this.scale * 0.5 -
      this.material.uniforms.uLineThickness.value / window.innerHeight;
    this.close.position.y = closePosY;

    // lines
    this.material.uniforms.uResolution.value.set(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    this.material.uniforms.uLengthBottom.value =
      Math.min(250, window.innerWidth / 5) / this.scale;
    this.material.uniforms.uLengthTop.value =
      Math.min(200, window.innerWidth / 10) / this.scale;
    this.material.uniforms.uCenterGap.value = sizeClose * 0.5;
    this.material.uniforms.uLengthCorner.value =
      this.material.uniforms.uLengthBottom.value * 0.3;

    // nav buttons;
    let navScale = Math.min(100, window.innerWidth / 10);
    let navScaleX = navScale / window.innerWidth;
    let navScaleY = navScale / window.innerHeight;
    const navButtonOffset = this.material.uniforms.uLengthBottom.value * 0.1;
    this.prevButton.scale.set(navScaleX, navScaleY, 1);
    const navPosX =
      -this.scale * 0.5 + (navButtonOffset * 2) / window.innerWidth;
    const navPosY =
      -this.scale * 0.5 + navScaleY * 0.5 + 10 / window.innerHeight;
    this.prevButton.position.set(
      navPosX,
      -this.scale * 0.5 + navScaleY * 0.5,
      0
    );
    this.nextButton.scale.set(navScaleX, navScaleY, 1);
    this.nextButton.position.set(-navPosX, navPosY, 0);

    // visitGroup
    const visitScaleX = navScaleX * 1.2;
    const visitScaleY = navScaleY * 1.2;

    this.visitGroup.scale.set(visitScaleX, visitScaleY, 1);

    let visitPosY =
      -this.scale * 0.5 +
      this.material.uniforms.uLineThickness.value / window.innerHeight +
      visitScaleY * 0.5;
    this.visitGroup.position.set(visitScaleX * 0.75, visitPosY, 0);
  }
}
