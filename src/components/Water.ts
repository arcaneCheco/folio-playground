import { World } from "../app";
import * as THREE from "three";
import Mirror from "@utils/Mirror";
import WaterHeightMap from "./WaterHeightMap";
import vertexShader from "@shaders/water/vertex.glsl";
import fragmentShader from "@shaders/water/fragment.glsl";
import { View } from "@types";

export class Water extends Mirror {
  world = new World();
  renderer = this.world.renderer;
  camera = this.world.camera;
  scene = this.world.scene;
  raycaster = this.world.raycaster;
  bounds = 512; // large system units for normal calculation
  scale = 2;
  heightMap = new WaterHeightMap(this.bounds);
  geometry = new THREE.PlaneGeometry(
    this.bounds,
    this.bounds,
    this.heightMap.size - 1,
    this.heightMap.size - 1
  );
  uniforms = {
    uHeightMap: this.heightMap.texture,
    uBaseColor: { value: new THREE.Color("#f9f9f9") },
    uFresnelColor: { value: new THREE.Color("#b754ff") },
    uFresnelPower: { value: 3 },
    uTextureMatrix: { value: this.textureMatrix },
    uMirrorMap: { value: this.renderTarget.texture },
  };
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: this.uniforms,
    defines: {
      RESOLUTION: this.heightMap.size.toFixed(1),
      BOUNDS: this.bounds.toFixed(1),
      SCALE: (this.scale / this.bounds).toFixed(10),
    },
  });
  mesh = new THREE.Mesh(this.geometry, this.material);
  intersectionPlane: THREE.Mesh;
  debug: any;
  constructor() {
    super();
    this.mesh.renderOrder = -1;
    this.mesh.scale.set(this.scale / this.bounds, this.scale / this.bounds, 1);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.matrixAutoUpdate = false;
    this.mesh.updateMatrix();
    this.scene.add(this.mesh);
    this.setIntersectionPlane();
  }

  setIntersectionPlane() {
    this.intersectionPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.scale, this.scale, 1, 1),
      new THREE.ShaderMaterial({ visible: false })
    );
    this.intersectionPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.intersectionPlane);
    this.intersectionPlane.matrixAutoUpdate = false;
    this.intersectionPlane.updateMatrix();
  }

  resize() {}

  onPointerdown() {}

  onPointermove() {
    const [intersect] = this.raycaster.intersectObject(this.intersectionPlane);
    if (intersect) {
      this.heightMap.onPointermove(intersect.uv);
    }
  }

  onPointerup() {}

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "water", expanded: false });

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

  onWheel() {}

  update() {
    if (this.world.view == View.Home) {
      this.world.homeViewManager.title.mesh.visible = false;
      this.world.homeViewManager.contact.group.visible = false;
      this.world.homeViewManager.nav.group.visible = false;
    } else if (this.world.view === View.ProjectDetail) {
      this.world.projectDetailViewManager.overlay.group.visible = false;
    } else if (this.world.view === View.About) {
      this.world.aboutViewManager.overlay.group.visible = false;
    } else if (this.world.view === View.Projects) {
      this.world.projectsViewManager.filters.outerGroup.visible = false;
      this.world.projectsViewManager.nav.group.visible = false;
    }
    super.update(this.mesh, this.renderer, this.camera, this.scene);
    if (this.world.view === View.Home) {
      this.world.homeViewManager.title.mesh.visible = true;
      this.world.homeViewManager.contact.group.visible = true;
      this.world.homeViewManager.nav.group.visible = true;
    } else if (this.world.view === View.ProjectDetail) {
      this.world.projectDetailViewManager.overlay.group.visible = true;
    } else if (this.world.view === View.About) {
      this.world.aboutViewManager.overlay.group.visible = true;
    } else if (this.world.view === View.Projects) {
      this.world.projectsViewManager.filters.outerGroup.visible = true;
      this.world.projectsViewManager.nav.group.visible = true;
    }
    this.heightMap.update(this.renderer);
  }
}
