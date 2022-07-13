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

    this.bounds = 512; // large system units for normal calculation
    this.scale = this.bounds;
    this.scale = 5.12;
    this.scale = 2;

    this.heightMap = new WaterHeightMap(this.bounds);

    this.setGeometry();
    this.setMaterial();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(this.scale / this.bounds, 1, this.scale / this.bounds);
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    this.setIntersectionPlane();
    this.mesh.renderOrder = -1;
    this.scene.add(this.mesh);
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(
      this.bounds,
      this.bounds,
      this.heightMap.size - 1,
      this.heightMap.size - 1
    );
    this.geometryTransform = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    this.geometry.applyMatrix4(this.geometryTransform);
  }

  setMaterial() {
    this.uniforms = {
      uHeightMap: this.heightMap.texture,
      uBaseColor: { value: new THREE.Color("#f9f9f9") },
      uFresnelColor: { value: new THREE.Color("#141414") },
      uFresnelPower: { value: 3 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      defines: {
        RESOLUTION: this.heightMap.size.toFixed(1),
        BOUNDS: this.bounds.toFixed(1),
        SCALE: (this.scale / this.bounds).toFixed(10),
      },
    });
  }

  setIntersectionPlane() {
    this.intersectionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.scale, this.scale, 1, 1).applyMatrix4(
        this.geometryTransform
      ),
      new THREE.ShaderMaterial({ visible: false })
    );
    this.scene.add(this.intersectionPlane);
    this.intersectionPlane.matrixAutoUpdate = false;
    this.intersectionPlane.updateMatrix();
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "water" });

    this.debug.addButton({ title: "toggle wireframe" }).on("click", () => {
      this.material.wireframe = !this.material.wireframe;
    });

    this.debugHeightMap();
    this.debugMaterial();
  }

  debugHeightMap() {
    const heightMap = this.debug.addFolder({
      title: "heightMap",
      expanded: false,
    });
    heightMap.addInput(this.heightMap.uniforms.uViscosity, "value", {
      min: 0,
      max: 0.999,
      step: 0.001,
      label: "viscosity",
    });
    heightMap.addInput(this.heightMap.uniforms.uAmplitude, "value", {
      min: 0,
      max: 0.999,
      step: 0.001,
      label: "amplitude",
    });
    heightMap.addInput(this.heightMap.uniforms.uMouseSize, "value", {
      min: 0,
      max: 50,
      step: 0.001,
      label: "mouseSize",
    });
  }

  debugMaterial() {
    const material = this.debug.addFolder({
      title: "material",
      expanded: true,
    });
    material
      .addInput(this.uniforms.uBaseColor, "value", {
        view: "color",
        label: "base color",
      })
      .on("change", () =>
        this.uniforms.uBaseColor.value.multiplyScalar(1 / 255)
      );
    material
      .addInput(this.uniforms.uFresnelColor, "value", {
        view: "color",
        label: "fresnel color",
      })
      .on("change", () =>
        this.uniforms.uFresnelColor.value.multiplyScalar(1 / 255)
      );
    material.addInput(this.uniforms.uFresnelPower, "value", {
      min: 0,
      max: 5,
      step: 0.0001,
      label: "fresnel power",
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
    this.heightMap.update(this.renderer, this.camera);
  }
}
