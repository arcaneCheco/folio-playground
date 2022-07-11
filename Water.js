import { World } from "./app";
import * as THREE from "three";
import vertexShader from "./shaders/water/vertex.glsl";
import fragmentShader from "./shaders/water/fragment.glsl";
import WaterHeightMap from "./WaterHeightMap";

export default class Water {
  constructor() {
    this.world = new World();
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;

    this.heightMap = new WaterHeightMap();

    this.nSegments = 150;
    this.geometry = new THREE.PlaneGeometry(
      2,
      2,
      this.nSegments,
      this.nSegments
    );
    this.geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.setMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.setIntersectionPlane();
    this.mesh.renderOrder = -1;
    this.scene.add(this.mesh);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        // waves
        uHeightMap: this.heightMap.texture,
        uAmplitude: { value: 0.3 },
        uOffset: { value: 0 },
      },
    });
  }

  setIntersectionPlane() {
    this.intersectionPlane = new THREE.Mesh(
      this.geometry,
      new THREE.ShaderMaterial()
    );
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "water" });

    this.debug
      .addInput(this, "nSegments", {
        min: 5,
        max: 1000,
        step: 1,
      })
      .on("change", () => {
        this.geometry.dispose();
        this.geometry = new THREE.PlaneGeometry(
          2,
          2,
          this.nSegments,
          this.nSegments
        );
        this.geometry.applyMatrix4(
          new THREE.Matrix4().makeRotationX(-Math.PI / 2)
        );
        this.mesh.geometry = this.geometry;
      });
    this.debug.addButton({ title: "toggle wireframe" }).on("click", () => {
      this.material.wireframe = !this.material.wireframe;
    });
  }

  onPointermove() {
    const [intersect] = this.raycaster.intersectObject(this.intersectionPlane);
    if (intersect) {
      this.heightMap.onPointermove(intersect.uv);
    }
  }

  onPointerdown() {}

  onPointerup() {}

  resize() {}

  update() {
    this.heightMap.update(this.renderer, this.camera, this.world.time);
  }
}
