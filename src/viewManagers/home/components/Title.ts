import { World } from "@src/app";
import { Flowmap } from "@utils/Flowmap";
import TextTexture from "@utils/TextTexture";
import vertexShader from "@shaders/homeTitle/vertex.glsl";
import fragmentShader from "@shaders/homeTitle/fragment.glsl";
import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { _HomeTitle } from "@types";

export class Title implements _HomeTitle {
  world = new World();
  scene = this.world.scene;
  group = new Group();
  raycaster = this.world.raycaster;
  renderer = this.world.renderer;
  camera = this.world.camera;
  flowmap = new Flowmap();
  textTexture = new TextTexture({
    lineHeight: 1.5,
    font: this.world.resources.fonts.audiowideRegular,
    text: "Creative\nWeb\nDeveloper",
  });
  aspect: number;
  geometry = new PlaneGeometry(2, 2);
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uFlowmap: this.flowmap.texture,
      uTextImage: this.textTexture.texture,
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  mesh = new Mesh(this.geometry, this.material);

  constructor() {
    this.textTexture.createTexture(this.renderer, this.camera);
    this.aspect = this.textTexture.geometryAspect;

    this.mesh.name = "homeTitle";
    this.mesh.renderOrder = 100;
    this.mesh.position.z = -0.01;
    this.group.add(this.mesh);
  }

  onPointermove(e, uv) {
    this.flowmap.onPointermove(e, uv);
  }

  resize(sizes) {
    this.mesh.position.x = sizes.posX;
    this.mesh.position.y = sizes.posY;
    this.mesh.scale.x = sizes.scaleX;
    this.mesh.scale.y = sizes.scaleY;
  }

  update() {
    this.flowmap.update(this.renderer);
  }
}
