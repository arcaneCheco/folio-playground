import { World } from "@src/app";
import { Group, Matrix4, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import TextGeometry from "@utils/TextGeometry";
import vertexShader from "@shaders/homeContact/vertex.glsl";
import fragmentShader from "@shaders/homeContact/fragment.glsl";
import vertexTouchPlane from "@shaders/homeContact/touchPlane/vertex.glsl";
import fragmentTouchPlane from "@shaders/homeContact/touchPlane/fragment.glsl";
import vertexIcon from "@shaders/ghostIcon/vertex.glsl";
import fragmentIcon from "@shaders/ghostIcon/fragment.glsl";
import { _HomeContact, _World } from "@types";

export class Contact implements _HomeContact {
  world = new World();
  group = new Group();
  font = this.world.resources.fonts.audiowideRegular;
  textMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
  });
  iconMaterial = new ShaderMaterial({
    vertexShader: vertexIcon,
    fragmentShader: fragmentIcon,
    uniforms: {
      uMap: { value: this.world.resources.assets.ghostIcon },
      uTime: { value: 0 },
    },
    transparent: true,
  });
  email: Mesh;
  touchPlane: Mesh;
  icon: Mesh;
  cta: Mesh;
  hover = false;
  down = false;
  constructor() {
    this.setEmailText();
    this.setCTAText();
    this.setGhostIcon();
  }

  setEmailText() {
    const geometry = new TextGeometry();
    geometry.setText({
      fontData: this.font.data,
      text: "sergio@azizi.dev",
    });
    geometry.computeBoundingBox();
    const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    geometry.applyMatrix4(new Matrix4().makeScale(1 / width, 1 / width, 1));
    this.email = new Mesh(geometry, this.textMaterial);
    this.email.renderOrder = 150;
    this.group.add(this.email);

    // set touchPlane
    const height = geometry.boundingBox!.max.y - geometry.boundingBox!.min.y;
    const g = new PlaneGeometry(1, height);
    const m = new ShaderMaterial({
      vertexShader: vertexTouchPlane,
      fragmentShader: fragmentTouchPlane,
    });
    this.touchPlane = new Mesh(g, m);
    this.touchPlane.visible = false;
    this.touchPlane.position.x = 0.5;
    this.email.add(this.touchPlane);
    this.touchPlane.name = "email";
    this.touchPlane.renderOrder = 250;
  }

  setCTAText() {
    const geometry = new TextGeometry();
    geometry.setText({
      fontData: this.font.data,
      text: "`\nAvailable for freelance work", // choose a character not part of the font for the first line
      lineHeight: 1.8,
    });
    geometry.computeBoundingBox();
    const width = geometry.boundingBox!.max.x - geometry.boundingBox!.min.x;
    geometry.applyMatrix4(new Matrix4().makeScale(1 / width, 1 / width, 1));
    this.cta = new Mesh(geometry, this.textMaterial);
    this.group.add(this.cta);
  }

  setGhostIcon() {
    const geometry = new PlaneGeometry(1, 1);
    this.icon = new Mesh(geometry, this.iconMaterial);
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
    this.iconMaterial.uniforms.uTime.value = time;
  }
}
