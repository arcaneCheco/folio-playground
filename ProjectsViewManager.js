import * as THREE from "three";
import { World } from "./app";

export default class ProjectsViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.projectScreen = this.world.projectScreen;
    this.projectTitles = this.world.projectTitles;
    this.activeProjectState = this.world.activeProjectState;
    this.projectFilters = this.world.projectFilters;
    this.projectsNav = this.world.projectsNav;

    this.raycaster = this.world.raycaster;
    this.rayOrigin = new THREE.Vector3(0, 0, 1);
    this.rayTarget = new THREE.Vector3();
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

  onActiveChange() {
    this.projectTitles.onActiveChange(this.activeProjectState.active);
    this.projectScreen.onActiveChange(this.activeProjectState.active);
  }

  onPointerdown() {
    this.projectScreen.onPointerdown();
    if (this.hover || this.hoverTitles) {
      this.down = true;
    }
  }

  onPointermove(mouse) {
    if (this.down) return;

    const [hitTitles] = this.raycaster.intersectObjects(
      this.projectTitles.group.children
    );

    if (hitTitles) {
      document.body.style.cursor = "pointer";
      this.hoverTitles = true;
      this.titleIndex = hitTitles.object.userData.index;
      if (this.titleIndex !== this.activeProjectState.active) {
        this.activeProjectState.active = this.titleIndex;
        this.onActiveChange();
      }
    } else {
      this.hoverTitles = false;
    }

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.raycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.raycaster.intersectObjects([
      ...this.projectFilters.group.children,
      this.projectsNav.homeNav,
      this.projectsNav.aboutNav,
    ]);

    if (hit) {
      this.target = hit.object.name;
      this.hover = true;
      document.body.style.cursor = "pointer";
    } else {
      this.hover = false;
    }

    if (!hit && !hitTitles) {
      document.body.style.cursor = "";
    }

    this.projectScreen.onPointermove();
  }

  onPointerup() {
    document.body.style.cursor = "";

    this.projectScreen.onPointerup();

    if (this.hoverTitles && this.down) {
      this.down = false;
      this.world.changeView("projectDetail");
    }

    if (this.hover && this.down) {
      this.down = false;
      switch (this.target) {
        case "All":
          this.filterAll();
          break;
        case "Sites":
          this.filterSites();
          break;
        case "Sketches":
          this.filterSketches();
          break;
        case "Publications":
          this.filterPublications();
          break;
        case "home":
          this.world.changeView("home");
          break;
        case "about":
          this.world.changeView("about");
          break;
        default:
          break;
      }
    }
  }

  getSizes() {
    const widthRatio = 2 / window.innerWidth;
    const aspect = window.innerWidth / window.innerHeight;

    const projectsNav = {};

    projectsNav.scaleY = 30 * widthRatio;
    projectsNav.scaleY = Math.min(0.3, projectsNav.scaleY);
    projectsNav.scaleX = projectsNav.scaleY * aspect;

    return {
      projectsNav,
    };
  }

  resize() {
    const { projectsNav } = this.getSizes();

    this.projectScreen.resize();
    this.projectTitles.onResize();
    this.projectFilters.onResize();
    this.projectsNav.onResize(projectsNav);
  }

  onWheel({ deltaY }) {
    this.projectTitles.onWheel(deltaY);
  }

  show() {
    this.scene.add(this.projectTitles.outerGroup);
    this.scene.add(this.projectScreen.mesh);
    this.scene.add(this.projectFilters.outerGroup);
    this.scene.add(this.projectsNav.group);
    this.projectScreen.mesh.rotation.set(0, -Math.PI / 5, 0);
    this.projectScreen.mesh.position.set(0.18, 0.22, 0.1);
  }

  hide() {
    this.scene.remove(this.projectTitles.outerGroup);
    this.scene.remove(this.projectScreen.mesh);
    this.scene.remove(this.projectFilters.outerGroup);
    this.scene.remove(this.projectsNav.group);
  }

  update() {
    this.projectTitles.update();
    this.projectScreen.update();
  }
}
