import * as THREE from "three";
import { World } from "./app";
import GSAP from "gsap";

export default class ProjectsViewManager {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.projectScreen = this.world.projectScreen;
    this.projectTitles = this.world.projectTitles;
    this.activeProjectState = this.world.activeProjectState;
    this.projectFilters = this.world.projectFilters;
    this.projectsNav = this.world.projectsNav;
    this.activeFilter = undefined;

    this.raycaster = this.world.raycaster;
    this.rayOrigin = new THREE.Vector3(0, 0, 1);
    this.rayTarget = new THREE.Vector3();
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectsViewManager",
      expanded: true,
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

  setAtiveFilter(key) {
    if (this.activeFilter === key) return;
    this.activeFilter = key;
    this.projectFilters.group.children.map((mesh) =>
      mesh.name === key
        ? (mesh.material.uniforms.uActive.value = true)
        : (mesh.material.uniforms.uActive.value = false)
    );
  }

  filterAll() {
    this.setAtiveFilter("all");

    this.projectTitles.meshes.map((mesh) => {
      this.projectTitles.group.add(mesh);
    });
    this.projectTitles.setPositionsWithinGroup();
  }

  filterSites() {
    this.setAtiveFilter("sites");

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
    this.setAtiveFilter("sketches");

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
    this.setAtiveFilter("publications");

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
        case "all":
          this.filterAll();
          break;
        case "sites":
          this.filterSites();
          break;
        case "sketches":
          this.filterSketches();
          break;
        case "publications":
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
    const screen = {};
    const titles = {};
    const filters = {};

    // nav
    projectsNav.lineScaleY = this.projectsNav.lineThickness * widthRatio;
    projectsNav.lineScaleX = 0.8;

    let navScale = window.innerWidth > 750 ? 50 : 35;
    projectsNav.navScaleY = navScale / window.innerWidth;
    projectsNav.navScaleX = navScale / window.innerHeight;
    projectsNav.navPosY =
      projectsNav.navScaleY / 2 +
      projectsNav.lineScaleY / 2 +
      this.projectsNav.textLineSpacing * widthRatio;

    let offsetLeft = 40;
    projectsNav.posX =
      -1 + offsetLeft * widthRatio + projectsNav.lineScaleY / 2;

    let verticalOffset = 10;
    projectsNav.posHome =
      -projectsNav.lineScaleX / projectsNav.navScaleX +
      (verticalOffset * (2 / window.innerHeight)) / projectsNav.navScaleX;
    projectsNav.posAbout = -projectsNav.posHome;

    // screen
    screen.scaleX = 1 + aspect * 0.2;
    screen.scaleY = 1 * screen.scaleX * (9 / 16);
    const distanceFromCenter = 0.65;
    let offset = 210 + aspect * 8; // 30
    offset *= Math.PI / 180;
    screen.posX = Math.sin(offset) * distanceFromCenter;
    screen.posZ = -Math.cos(offset) * distanceFromCenter;
    screen.rotY = -offset;
    screen.aspect = aspect;

    //titles
    titles.scale = 0.1 + aspect * 0.05;
    titles.posX = -1.4 - aspect * 0.2;

    // filters
    let scale = window.innerWidth > 750 ? 300 : 210;
    scale /= this.projectFilters.gWidth;
    filters.scaleX = scale / window.innerWidth;
    filters.scaleY = scale / window.innerHeight;
    filters.posX = 1 - 0.1 * aspect;
    filters.posY = filters.scaleY * (2 + this.projectFilters.gap);

    return {
      projectsNav,
      screen,
      titles,
      filters,
    };
  }

  resize() {
    const { projectsNav, screen, titles, filters } = this.getSizes();

    if (!this.world.view.projectDetail) {
      this.projectScreen.resizeProjectsView(screen);
    }
    this.projectTitles.onResize(titles);
    this.projectFilters.onResize(filters);
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

    this.world.sky.material.uniforms.uSkyColor.value = new THREE.Color(
      "#c5fffa"
    );
    this.world.sky.material.uniforms.uSkyBrightness.value = 1;
    this.world.sky.material.uniforms.uCloudColor.value = new THREE.Color(
      "#ffb57a"
    );
    this.projectScreen.material.uniforms.uIsCurved.value = true;

    this.world.camera.position.set(0, 0.15, -1);

    this.world.sky.mesh.rotation.y = Math.PI;
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
