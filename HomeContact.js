import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/homeContact/vertex.glsl";
import fragmentShader from "./shaders/homeContact/fragment.glsl";
import vertexIcon from "./shaders/ghostIcon/vertex.glsl";
import fragmentIcon from "./shaders/ghostIcon/fragment.glsl";
import ghostSrc from "./data/images/ghostIcon.png";

export default class HomeContact {
  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(-0.65, -0.45, 0);
    // this.group.scale.setScalar(0.7);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
    });

    this.setEmailText();
    this.setCTAText();
    this.setGhostIcon();
  }

  setEmailText() {
    const geometry = new TextGeometry();
    geometry.setText({
      font,
      text: "sergio@azizi.dev",
      align: "left",
    });
    this.email = new THREE.Mesh(geometry, this.material);
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    this.email.userData.width = width;
    this.email.userData.height = height;
    this.email.userData.intendedWidth = 500;
    this.group.add(this.email);
  }

  setCTAText() {
    const geometry = new TextGeometry();
    geometry.setText({
      font,
      text: "`\nAvailable for freelance work", // choose a character not part of the font for the first line
      align: "left",
      lineHeight: 1.8,
    });
    this.cta = new THREE.Mesh(geometry, this.material);
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    this.cta.userData.width = width;
    this.cta.userData.height = height;
    this.cta.userData.intendedWidth = 600;
    this.group.add(this.cta);
  }

  setGhostIcon() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const texture = new THREE.TextureLoader().load(ghostSrc);
    const mat = new THREE.ShaderMaterial({
      vertexShader: vertexIcon,
      fragmentShader: fragmentIcon,
      uniforms: {
        uMap: { value: texture },
        uTime: { value: 0 },
      },
      transparent: true,
    });
    this.icon = new THREE.Mesh(geometry, mat);
    this.icon.userData.scale = 50;
    this.group.add(this.icon);
  }

  resize() {
    const widthRatio = 2 / window.innerWidth;
    const heightRatio = 2 / window.innerHeight;
    const aspect = window.innerWidth / window.innerHeight;

    let orientation =
      window.innerWidth > window.innerHeight ? "landscape" : "portrait";
    let device =
      window.innerWidth > 749
        ? "desktop"
        : window.innerWidth > 481
        ? "ipad"
        : "mobile";

    let scaleEmail, scaleCTA, scaleIcon;
    if (device === "desktop") {
      scaleEmail = (300 * widthRatio) / this.email.userData.width;
      scaleCTA = (400 * widthRatio) / this.cta.userData.width;
      this.group.position.x = -400 * widthRatio;
      this.group.position.y = 1 - 800 * heightRatio;
      this.email.position.x = 70 * widthRatio;

      scaleIcon = 100 * widthRatio;
      //   this.group.position.y = 1;
      //   this.group.position.x = 0;
    }

    // scaleEmail =
    //   (this.email.userData.intendedWidth * widthRatio) /
    //   this.email.userData.width;
    // // const scaleEmail = 0.3 / this.email.userData.width;
    // this.email.position.x = 100 * widthRatio;

    // scaleCTA =
    // (this.cta.userData.intendedWidth * widthRatio) / this.cta.userData.width;
    // const scaleCTA = 0.4 / this.cta.userData.width;
    this.email.scale.set(scaleEmail, scaleEmail * aspect, 1);
    this.cta.scale.set(scaleCTA, scaleCTA * aspect, 1);
    this.icon.scale.set(scaleIcon, scaleIcon * aspect, 1);

    // const iconScale = this.icon.userData.scale * widthRatio;

    // this.icon.scale.set(iconScale, iconScale * aspect, 1);
  }

  update(time) {
    this.icon.material.uniforms.uTime.value = time;
  }
}
