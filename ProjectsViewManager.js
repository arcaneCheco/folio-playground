import * as THREE from "three";
import { World } from "./app";
import vertexShader from "./shaders/markers/vertex.glsl";
import fragmentShader from "./shaders/markers/fragment.glsl";

export default class ProjectsViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.projectScreen = this.world.projectScreen;
    this.projectTitles = this.world.projectTitles;
    this.curlBubble = this.world.curlBubble;
    this.activeProjectState = this.world.activeProjectState;

    // this.setOverlay();
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectsViewManager",
      expanded: false,
    });
    this.debug
      .addInput(this.activeProjectState, "active", { min: 0, max: 5, step: 1 })
      .on("change", () => {
        this.onActiveChange();
      });

    const filter = this.debug.addFolder({ title: "filters", expanded: false });
    filter
      .addButton({ title: "filter all" })
      .on("click", () => this.filterAll());
    filter
      .addButton({ title: "filter sites" })
      .on("click", () => this.filterSites());
    filter
      .addButton({ title: "filter sketches" })
      .on("click", () => this.filterSketches());
    filter
      .addButton({ title: "filter publications" })
      .on("click", () => this.filterPublications());
  }

  filterAll() {
    this.projectTitles.meshes.map((mesh) => {
      this.projectTitles.group.add(mesh);
    });
    this.projectTitles.setPositionsWithinGroup();
  }

  filterSites() {
    this.projectTitles.meshes.map((mesh) => {
      if (mesh.userData.category === "site") {
        this.projectTitles.group.add(mesh);
      } else {
        this.projectTitles.group.remove(mesh);
      }
    });
    this.projectTitles.setPositionsWithinGroup();
  }

  filterSketches() {
    this.projectTitles.meshes.map((mesh) => {
      if (mesh.userData.category === "sketch") {
        this.projectTitles.group.add(mesh);
      } else {
        this.projectTitles.group.remove(mesh);
      }
    });
    this.projectTitles.setPositionsWithinGroup();
  }

  filterPublications() {
    this.projectTitles.meshes.map((mesh) => {
      if (mesh.userData.category === "publication") {
        this.projectTitles.group.add(mesh);
      } else {
        this.projectTitles.group.remove(mesh);
      }
    });
    this.projectTitles.setPositionsWithinGroup();
  }

  setOverlay() {
    this.setMarkers();
    this.setFilters();
  }

  setMarkers() {
    const n = 6;
    const markerGeometry = new THREE.PlaneGeometry(2, 2);
    const markerMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    const markersMesh = new THREE.InstancedMesh(
      markerGeometry,
      markerMaterial,
      n
    );
    markersMesh.renderOrder = 10;
    this.scene.add(markersMesh);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < n; i++) {
      dummy.position.x = n - 1 - 2 * i;
      // console.log(dummy.position.y);
      dummy.updateMatrix();
      markersMesh.setMatrixAt(i, dummy.matrix);
      markersMesh.setColorAt(i, new THREE.Color("#ffffff"));
    }
    markersMesh.scale.set(50 / window.innerWidth, 50 / window.innerHeight, 1);
    markersMesh.position.set(0.5, -0.5, 0);
    // this.markersMesh.setColorAt(this.activeIndex, this.settings.markerActive);
  }

  setFilters() {
    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.ShaderMaterial({
      vertexShader: `
      void main() {
        gl_Position = modelMatrix * vec4(position, 1.);
      }`,
    });
    const all = new THREE.Mesh(g, m);
    const sites = all.clone();
    sites.position.y = -2.5 * 1;
    const sketches = all.clone();
    sketches.position.y = -2.5 * 2;
    const publications = all.clone();
    publications.position.y = -2.5 * 3;
    const filtersGroup = new THREE.Group();
    filtersGroup.scale.set(100 / window.innerWidth, 30 / window.innerHeight, 1);
    filtersGroup.add(all, sites, sketches, publications);
    filtersGroup.position.set(-0.7, 0, 0);
    this.scene.add(filtersGroup);
  }

  onActiveChange() {
    this.projectTitles.onActiveChange(this.activeProjectState.active);
    this.projectScreen.onActiveChange(this.activeProjectState.active);
  }

  onPointerdown() {
    this.projectScreen.onPointerdown();
  }

  onPointermove() {
    this.projectScreen.onPointermove();
  }

  onPointerup() {
    this.projectScreen.onPointerup();
  }

  resize() {
    this.projectScreen.resize();
  }

  onWheel({ deltaY }) {
    this.projectTitles.onWheel(deltaY);
  }

  show() {
    this.scene.add(this.projectTitles.outerGroup);
    this.scene.add(this.projectScreen.mesh);
    this.curlBubble.projectsState();
    this.projectScreen.mesh.rotation.set(0, -Math.PI / 5, 0);
    this.projectScreen.mesh.position.set(0.18, 0.22, 0.47);
  }

  hide() {
    this.scene.remove(this.projectTitles.outerGroup);
    this.scene.remove(this.projectScreen.mesh);
  }

  update() {
    this.projectTitles.update();
    this.projectScreen.update();
  }
}
