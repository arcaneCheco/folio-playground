import { World } from "@src/app";
import { Color, Vector2, Vector3 } from "three";
import GSAP from "gsap";
import { Nav, Titles, Filters } from "./components";
import {
  ProjectCategory,
  View,
  _ProjectsFilters,
  _ProjectsNav,
  _ProjectsViewManager,
  _ProjectTitles,
  _TextGeometry,
} from "@types";
import { FolderApi } from "tweakpane";

export class ProjectsViewManager implements _ProjectsViewManager {
  world = new World();
  scene = this.world.scene;
  projectScreen = this.world.projectScreen;
  projectState = this.world.projectState;
  sky = this.world.sky;
  water = this.world.water;
  raycaster = this.world.raycaster;
  ndcRaycaster = this.world.ndcRaycaster;
  rayOrigin = new Vector3(0, 0, 1);
  rayTarget = new Vector3();
  colorGradient = this.world.colorGradient;
  screenTimeline = GSAP.timeline();
  debug: FolderApi;
  titlesTimeline = GSAP.timeline();
  hover: boolean;
  hoverTitles: boolean;
  down: boolean;
  target: string;
  titleIndex: number = -1;
  titles: _ProjectTitles = new Titles();
  nProjects = this.titles.data.length;
  nav: _ProjectsNav = new Nav();
  filters: _ProjectsFilters = new Filters();
  constructor() {
    this.filterProjects(ProjectCategory.All);

    this.world.water.hiddenObjects[View.Projects]?.push(
      this.filters.outerGroup,
      this.nav.group
    );
  }

  setDebug() {}

  filterProjects(category: ProjectCategory) {
    this.projectState.filter = category;
    this.projectState.activeIndices = this.titles.data
      .filter(
        (entry) =>
          category === ProjectCategory.All || entry.category === category
      )
      .map((entry) => entry.index);
    this.filters.updateActiveFilter(category);
    this.titles.filterTitles(category);
  }

  setColors(color: Color) {
    this.sky.material.uniforms.uSkyColor.value = color;
    this.water.uniforms.uFresnelColor.value = color;
  }

  onActiveChange(newIndex: number) {
    const color = this.colorGradient.getAt((newIndex + 1) / this.nProjects);
    this.setColors(color);

    this.projectScreen.onActiveChange({ newIndex, color });

    // titles
    if (this.projectScreen.timeline.parent) {
      this.titlesTimeline.clear();
    }
    this.titles.meshes.map((mesh) => {
      let target = 0;
      if (mesh.userData.index === newIndex) {
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

  onPointermove(mouse: Vector2) {
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
      if (this.target in ProjectCategory) {
        this.filterProjects(this.target as ProjectCategory);
      } else {
        this.world.changeView(this.target as View);
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

  onResize() {
    const { projectsNav, screen, titles, filters } = this.getSizes();

    if (this.world.view !== View.ProjectDetail) {
      this.projectScreen.resizeProjectsView(screen);
    }
    this.titles.onResize(titles);
    this.filters.onResize(filters);
    this.nav.onResize(projectsNav);
  }

  onWheel({ deltaY }: WheelEvent) {
    this.titles.onWheel(deltaY);
  }

  update() {
    const [hitTitles] = this.raycaster.intersectObjects(
      this.titles.group.children
    );

    if (hitTitles) {
      this.titleIndex = hitTitles.object.userData.index;
      document.body.style.cursor = "pointer";
      this.hoverTitles = true;
      if (this.titleIndex !== this.projectState.target) {
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
