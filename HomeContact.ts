import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/homeContact/vertex.glsl";
import fragmentShader from "./shaders/homeContact/fragment.glsl";
import vertexTouchPlane from "./shaders/homeContact/touchPlane/vertex.glsl";
import fragmentTouchPlane from "./shaders/homeContact/touchPlane/fragment.glsl";
import vertexIcon from "./shaders/ghostIcon/vertex.glsl";
import fragmentIcon from "./shaders/ghostIcon/fragment.glsl";
import ghostSrc from "./data/images/ghostIcon.png";

export default class HomeContact {
  group = new THREE.Group();
  material: any;
  email: any;
  touchPlane: any;
  icon: any;
  cta: any;
  constructor() {
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
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    geometry.applyMatrix4(
      new THREE.Matrix4().makeScale(1 / width, 1 / width, 1)
    );
    this.email = new THREE.Mesh(geometry, this.material);
    // this.email.name = "email";
    this.email.renderOrder = 150;
    this.group.add(this.email);

    // set touchPlane
    const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
    const g = new THREE.PlaneGeometry(1, height);
    const m = new THREE.ShaderMaterial({
      vertexShader: vertexTouchPlane,
      fragmentShader: fragmentTouchPlane,
    });
    this.touchPlane = new THREE.Mesh(g, m);
    this.touchPlane.visible = false;
    this.touchPlane.position.x = 0.5;
    this.email.add(this.touchPlane);
    this.touchPlane.name = "email";
    this.touchPlane.renderOrder = 250;
  }

  setCTAText() {
    const geometry = new TextGeometry();
    geometry.setText({
      font,
      text: "`\nAvailable for freelance work", // choose a character not part of the font for the first line
      align: "left",
      lineHeight: 1.8,
    });
    geometry.computeBoundingBox();
    const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
    geometry.applyMatrix4(
      new THREE.Matrix4().makeScale(1 / width, 1 / width, 1)
    );
    this.cta = new THREE.Mesh(geometry, this.material);
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
    this.group.add(this.icon);
  }

  resize(sizes) {
    this.group.position.x = sizes.posX;
    this.group.position.y = sizes.posY;

    this.email.position.x = sizes.emailOffset;

    this.email.scale.x = sizes.emailScaleX;
    this.email.scale.y = sizes.emailScaleY;

    this.cta.scale.x = sizes.ctaScaleX;
    this.cta.scale.y = sizes.ctaScaleY;

    this.icon.scale.x = sizes.iconScaleX;
    this.icon.scale.y = sizes.iconScaleY;
  }

  update(time) {
    this.icon.material.uniforms.uTime.value = time;
  }
}
