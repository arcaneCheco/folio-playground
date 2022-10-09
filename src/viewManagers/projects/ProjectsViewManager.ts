import * as THREE from "three";
import { World } from "../../app";
import GSAP from "gsap";
import { Nav, Titles, Filters } from "./components";
import { GradientLinear } from "@utils/gradientLinear";
import { warm, natural } from "@utils/palettes";
import { View } from "@types";

export class ProjectsViewManager {
  world = new World();
  scene = this.world.scene;
  projectScreen = this.world.projectScreen;
  activeProjectState = this.world.projectState;
  activeFilter = undefined;
  sky = this.world.sky;
  water = this.world.water;
  timeline = GSAP.timeline();
  raycaster = this.world.raycaster;
  ndcRaycaster = this.world.ndcRaycaster;
  rayOrigin = new THREE.Vector3(0, 0, 1);
  rayTarget = new THREE.Vector3();
  colorGradient = new GradientLinear(natural);
  debug: any;
  titlesTimeline: any;
  hover: any;
  hoverTitles: any;
  down: any;
  target: any;
  titleIndex: any;
  titles: Titles;
  nav: Nav;
  filters: Filters;
  constructor() {
    console.log({ colors: this.colorGradient });
    this.titles = new Titles();
    this.nav = new Nav();
    this.filters = new Filters();
  }

  onDataLoaded() {
    this.projectScreen.data = this.world.resources.projects;
    this.projectScreen.uniforms.uImage1 = {
      value:
        this.world.resources.projects[this.world.projectState.active].texture,
    };
    this.titles.data = this.world.resources.projects;
    this.titles.setMeshes2();
    this.filterAll();
    const n = this.titles.data.length;
    this.titles.meshes.map((mesh, i) => {
      mesh.material.uniforms.uColor.value = this.colorGradient.getAt(i / n);
    });
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "projectsViewManager",
      expanded: false,
    });
    this.debug
      .addInput(this.activeProjectState, "active", { min: 0, max: 5, step: 1 })
      .on("change", () => {
        this.onActiveChange(this.activeProjectState.active);
      });
  }

  setAtiveFilter(key) {
    if (this.activeFilter === key) return;
    this.activeFilter = key;
    this.filters.group.children.map(
      // (mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>) =>
      (mesh: any) =>
        mesh.name === key
          ? (mesh.material.uniforms.uActive.value = true)
          : (mesh.material.uniforms.uActive.value = false)
    );
  }

  filterAll() {
    this.setAtiveFilter("all");

    this.titles.meshes.map((mesh) => {
      this.titles.group.add(mesh);
    });
    this.titles.setPositionsWithinGroup();
  }

  filterSites() {
    this.setAtiveFilter("sites");

    this.titles.meshes.map((mesh) => {
      if (mesh.userData.category === "site") {
        this.titles.group.add(mesh);
      } else {
        this.titles.group.remove(mesh);
      }
    });
    this.titles.setPositionsWithinGroup();
  }

  filterSketches() {
    this.setAtiveFilter("sketches");

    this.titles.meshes.map((mesh) => {
      if (mesh.userData.category === "sketch") {
        this.titles.group.add(mesh);
      } else {
        this.titles.group.remove(mesh);
      }
    });
    this.titles.setPositionsWithinGroup();
  }

  filterPublications() {
    this.setAtiveFilter("publications");

    this.titles.meshes.map((mesh) => {
      if (mesh.userData.category === "publication") {
        this.titles.group.add(mesh);
      } else {
        this.titles.group.remove(mesh);
      }
    });
    this.titles.setPositionsWithinGroup();
  }

  onActiveChange(newIndex) {
    if (newIndex === 0) {
      // this.world.testSrc.play();
    }
    this.world.projectState.target = newIndex;
    const n = this.titles.data.length;
    this.projectScreen.uniforms.uColor.value = this.colorGradient.getAt(
      newIndex / n
    );
    this.sky.material.uniforms.uSkyColor.value = this.colorGradient.getAt(
      newIndex / n
    );
    this.water.uniforms.uFresnelColor.value = this.colorGradient.getAt(
      newIndex / n
    );
    this.projectScreen.uniforms.uImage2.value =
      this.world.resources.projects[newIndex].texture;
    this.world.projectState.isTransitioning.value = true;
    if (this.timeline.parent) {
      this.timeline.clear();
      this.world.projectState.progress.value = 0.5;
    }
    this.timeline.to(this.world.projectState.progress, {
      value: 1,
      duration: 1.5,
      onComplete: () => {
        // screen
        this.world.projectState.active = newIndex;
        this.projectScreen.uniforms.uImage1.value =
          this.world.resources.projects[newIndex].texture;
        this.world.projectState.progress.value = 0;
        this.world.projectState.isTransitioning.value = false;
      },
    });

    // titles
    this.titlesTimeline && this.titlesTimeline.clear();
    this.titlesTimeline = GSAP.timeline();
    this.titles.meshes.map((mesh, index) => {
      let target = 0;
      if (index === newIndex) {
        target = 1;
      }
      this.titlesTimeline.to(
        mesh.material.uniforms.uProgress,
        {
          value: target,
          duration: 0.75,
          ease: "none",
        },
        "0"
      );
    });
  }

  onPointerdown() {
    this.projectScreen.onPointerdown();
    if (this.hover || this.hoverTitles) {
      this.down = true;
    }
  }

  onPointermove(mouse) {
    if (this.down) return;

    this.rayTarget.set(mouse.x, mouse.y, -1).normalize();
    this.ndcRaycaster.set(this.rayOrigin, this.rayTarget);

    const [hit] = this.ndcRaycaster.intersectObjects([
      ...this.filters.group.children,
      this.nav.homeNav,
      this.nav.aboutNav,
    ]);

    if (hit) {
      this.target = hit.object.name;
      this.hover = true;
      document.body.style.cursor = "pointer";
    } else {
      this.hover = false;
    }

    this.projectScreen.onPointermove();
  }

  onPointerup() {
    document.body.style.cursor = "";

    this.projectScreen.onPointerup();

    if (this.hoverTitles && this.down) {
      this.down = false;
      this.world.changeView(View.ProjectDetail);
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
          this.world.changeView(View.Home);
          break;
        case "about":
          this.world.changeView(View.About);
          break;
        default:
          break;
      }
    }
  }

  getSizes() {
    const widthRatio = 2 / window.innerWidth;
    const aspect = window.innerWidth / window.innerHeight;

    const projectsNav: any = {};
    const screen: any = {};
    const titles: any = {};
    const filters: any = {};

    // nav
    projectsNav.lineScaleY = this.nav.lineThickness * widthRatio;
    projectsNav.lineScaleX = 0.8;

    let navScale = window.innerWidth > 750 ? 50 : 35;
    projectsNav.navScaleY = navScale / window.innerWidth;
    projectsNav.navScaleX = navScale / window.innerHeight;
    projectsNav.navPosY =
      projectsNav.navScaleY / 2 +
      projectsNav.lineScaleY / 2 +
      this.nav.textLineSpacing * widthRatio;

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
    scale /= this.filters.gWidth;
    filters.scaleX = scale / window.innerWidth;
    filters.scaleY = scale / window.innerHeight;
    filters.posX = 1 - 0.1 * aspect;
    filters.posY = filters.scaleY * (2 + this.filters.gap);

    return {
      projectsNav,
      screen,
      titles,
      filters,
    };
  }

  resize() {
    const { projectsNav, screen, titles, filters } = this.getSizes();

    if (this.world.view !== View.ProjectDetail) {
      this.projectScreen.resizeProjectsView(screen);
    }
    this.titles.onResize(titles);
    this.filters.onResize(filters);
    this.nav.onResize(projectsNav);
  }

  onWheel({ deltaY }) {
    this.titles.onWheel(deltaY);
  }

  show() {
    this.scene.add(this.titles.outerGroup);
    this.scene.add(this.projectScreen.mesh);
    this.scene.add(this.filters.outerGroup);
    this.scene.add(this.nav.group);

    // this.world.sky.material.uniforms.uSkyColor.value = new THREE.Color(
    //   "#c5fffa"
    // );
    // this.world.sky.material.uniforms.uSkyBrightness.value = 1;
    // this.world.sky.material.uniforms.uCloudColor.value = new THREE.Color(
    //   "#ffb57a"
    // );

    this.projectScreen.material.uniforms.uIsCurved.value = true;

    this.world.camera.position.set(0, 0.15, -1);

    this.world.sky.mesh.rotation.y = Math.PI;
  }

  hide() {
    this.scene.remove(this.titles.outerGroup);
    this.scene.remove(this.projectScreen.mesh);
    this.scene.remove(this.filters.outerGroup);
    this.scene.remove(this.nav.group);
  }

  update() {
    const [hitTitles] = this.raycaster.intersectObjects(
      this.titles.group.children
    );

    if (hitTitles) {
      this.titleIndex = hitTitles.object.userData.index;
      document.body.style.cursor = "pointer";
      if (this.titleIndex !== this.world.projectState.target) {
        this.hoverTitles = true;
        this.onActiveChange(this.titleIndex);
      }
    } else {
      this.hoverTitles = false;
      if (!this.hover) document.body.style.cursor = "";
    }

    this.titles.update();
    this.projectScreen.update();
  }
}
