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
    this.activeProject = 0;
    this.textureLoader = this.world.textureLoader;

    this.setData();

    this.projectScreen.uniforms.uImage1.value =
      this.projectsData[this.activeProject].texture;
    this.projectScreen.uniforms.uImage2.value =
      this.projectsData[this.activeProject + 1].texture;

    this.projectTitles.setMeshes2();
    this.projectTitles.setGroupPosition();
    this.filterAll();

    this.onActiveChange(this.activeProject);

    // this.setOverlay();
  }

  setData() {
    this.projectsData = [
      {
        title: "Elastic Mesh",
        image: new THREE.Color("#ff0000"),
        category: "site",
        imageUrl: "images/t1.jpeg",
      },
      {
        title: "Mandelbrot Explorer",
        image: new THREE.Color("#00ff00"),
        category: "sketch",
        imageUrl: "images/t2.jpeg",
      },
      {
        title: "A.P.O.D. Snippets",
        image: new THREE.Color("#0000ff"),
        category: "sketch",
        imageUrl: "images/t3.jpeg",
      },
      {
        title: "Infinite Tunnel",
        image: new THREE.Color("#ff00ff"),
        category: "publication",
        imageUrl: "images/t4.jpeg",
      },
      {
        title: "Elastic Mesh 4",
        image: new THREE.Color("#ffff00"),
        category: "publication",
        imageUrl: "images/t5.jpeg",
      },
      {
        title: "Elastic Mesh 5",
        image: new THREE.Color("#00ffff"),
        category: "publication",
        imageUrl: "images/t6.jpeg",
      },
    ];

    this.projectsData = this.projectsData.map((entry) => {
      return {
        ...entry,
        color: entry.image,
        texture: this.textureLoader.load(entry.imageUrl),
      };
    });

    this.projectScreen.data = this.projectsData.map((entry) => ({
      color: entry.image,
      texture: entry.texture,
    }));

    this.projectTitles.titles = this.projectsData.map((entry) => ({
      title: entry.title,
      category: entry.category,
      color: entry.image,
    }));
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({ title: "projectsViewManager" });
    this.debug
      .addInput(this, "activeProject", { min: 0, max: 5, step: 1 })
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
    this.projectScreen.onActiveChange(this.activeProject);
    this.projectTitles.onActiveChange(this.activeProject);
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
