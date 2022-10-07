import {
  Vector2,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import {
  Parallax,
  Sky,
  CurlBubble,
  Post,
  ProjectDetailOverlay,
  ProjectsFilters,
  ProjectScreen,
  ProjectsNav,
  ProjectTitles,
  Resources,
  RotateAlert,
  TransitionManager,
  Water,
  Preloader,
} from "./components";
import {
  AboutViewManager,
  HomeViewManager,
  ProjectsViewManager,
  ProjectDetailViewManager,
} from "./viewManagers";

// add preloader => preloader maessage: This website has been designed for desktop

// const debounce = (func, timeout = 50) => {
//   let timer;
//   return (...args) => {
//     if (timer) clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, timeout);
//   };
// };

export enum View {
  Home = "Home",
  About = "About",
  Projects = "Projects",
  ProjectDetail = "ProjectDetail",
}

export class World {
  static instance: World;
  usePost = false;
  activeProjectState: any;
  activeProjectState2: any;
  view: View;
  time = 0;
  mouse = new Vector2();
  container: HTMLDivElement;
  width: number;
  height: number;
  scene = new Scene();
  camera = new PerspectiveCamera(65, 1, 0.001, 10);
  initialHeight = 0.14;
  renderer = new WebGLRenderer({
    alpha: true,
    powerPreference: "high-performance",
    antialias: true,
  });
  controls: OrbitControls;
  raycaster = new Raycaster();
  ndcRaycaster = new Raycaster();
  resources: Resources;
  water: Water;
  post: Post;
  sky: Sky;
  curlBubble: CurlBubble;
  projectTitles: ProjectTitles;
  projectScreen: ProjectScreen;
  projectFilters: ProjectsFilters;
  projectsNav: ProjectsNav;
  projectDetailOverlay: ProjectDetailOverlay;
  rotateAlert: RotateAlert;
  transitionManager: TransitionManager;
  projectsViewManager: ProjectsViewManager;
  projectDetailViewManager: ProjectDetailViewManager;
  aboutViewManager: AboutViewManager;
  homeViewManager: HomeViewManager;
  parallax: Parallax;
  preloader: Preloader;
  pathViewMap: Record<string, View>;
  dataCount: any;
  debug: any;
  pane: any;
  paneContainer: any;
  constructor({ container }: { container?: HTMLDivElement } = {}) {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.container = container!;

    this.init();

    this.activeProjectState = {
      active: 0,
      progress: 0,
      target: 0,
      isTransitioning: false,
      min: 0,
      max: 5,
    };
    this.activeProjectState2 = {
      active: 0,
      progress: { value: 0 },
      target: 0,
      isTransitioning: { value: false },
      min: 0,
      max: 5,
    };

    this.setWorld();
  }

  init() {
    this.camera.position.set(0, this.initialHeight, 1);
    this.renderer.setPixelRatio(1);
    // this.renderer.autoClear = false;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
  }

  async setWorld() {
    this.setBeforeComponenets();
    this.resources = new Resources();
    this.addListeners();
    this.resize();
    this.render();
    await this.resources.load();

    this.onAfterSetComponenets();

    this.setComponents();

    this.setViewManagers();

    this.onDataLoaded();

    this.setDebug();

    this.resize();
  }

  addListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
    window.addEventListener("pointerup", this.onPointerup.bind(this));
    window.addEventListener("pointerdown", this.onPointerdown.bind(this));
    // window.addEventListener("pointerup", debounce(this.onPointerup.bind(this)));
    // window.addEventListener(
    //   "pointerdown",
    //   debounce(this.onPointerdown.bind(this))
    // );
    window.addEventListener("wheel", this.onWheel.bind(this));
  }

  setBeforeComponenets() {
    this.preloader = new Preloader();
    this.parallax = new Parallax({});
    this.sky = new Sky();
    this.post = new Post();
    this.curlBubble = new CurlBubble();
    this.water = new Water();
    this.projectScreen = new ProjectScreen();
  }

  onAfterSetComponenets() {
    this.sky.onPreloaded();
    this.projectScreen.onPreloaded();
  }

  setComponents() {
    this.projectTitles = new ProjectTitles();
    this.projectFilters = new ProjectsFilters();
    this.projectsNav = new ProjectsNav();
    this.projectDetailOverlay = new ProjectDetailOverlay();
    this.rotateAlert = new RotateAlert();
  }

  setViewManagers() {
    this.projectsViewManager = new ProjectsViewManager();
    this.projectDetailViewManager = new ProjectDetailViewManager();
    this.aboutViewManager = new AboutViewManager();
    this.homeViewManager = new HomeViewManager();
    this.transitionManager = new TransitionManager();
  }

  onDataLoaded() {
    this.projectsViewManager.onDataLoaded();

    this.aboutViewManager.onPreloaded();
    this.homeViewManager.onPreloaded();

    const location = window.location.pathname;

    this.pathViewMap = {
      "/": View.Home,
      "/projects": View.Projects,
      "/about": View.About,
    };

    this.dataCount = this.resources.projects.length;

    for (let i = 0; i < this.dataCount; i++) {
      const key = this.resources.projects[i].path;
      this.pathViewMap[key] = View.ProjectDetail;
    }

    const view = this.pathViewMap[location];

    if (view === View.ProjectDetail) {
      for (let i = 0; i < this.dataCount; i++) {
        const dataPath = this.resources.projects[i].path;
        if (location === dataPath) {
          this.activeProjectState.active = i;
          break;
        }
      }
    }

    this.changeView(view);
  }

  changeView(view: View) {
    if (view === View.Home) {
      this.transitionManager.projectsToHome();
      window.history.pushState({}, "", "/");
    }
    if (view === View.Projects) {
      if ((this.view = View.Home)) this.transitionManager.homeToProjects();
      else if (this.view === View.ProjectDetail)
        this.transitionManager.projectDetailToProjects();
      else if (this.view === View.About) {
        this.transitionManager.aboutToProjects();
      } else {
        this.projectsViewManager.show();
      }
      window.history.pushState({}, "", "/projects");
    }
    if (view === View.ProjectDetail) {
      if (this.view === View.Projects)
        this.transitionManager.projectsToProjectDetail();
      else this.projectDetailViewManager.show();
      const path = this.resources.projects[this.activeProjectState.active].path;
      window.history.pushState({}, "", path);
    }
    if (view === View.About) {
      if (this.view === View.Projects) this.transitionManager.projectsToAbout();
      else this.transitionManager.projectsToAbout();
      // this.view.projects && this.projectsViewManager.hide();
      // this.view.home && this.homeViewManager.hide();
      // this.view.projectDetail && this.projectDetailViewManager.hide();
      // this.aboutViewManager.show();
      window.history.pushState({}, "", "/about");
    }

    this.view = view;
  }

  worldDebug() {
    this.debug = this.pane.addFolder({ title: "world", expanded: false });

    this.debug
      .addBlade({
        view: "list",
        options: [
          { text: "home", value: "home" },
          { text: "projects", value: "projects" },
          { text: "projectDetail", value: "projectDetail" },
          { text: "about", value: "about" },
        ],
        value: "view",
      })
      .on("change", ({ value }: any) => this.changeView(value));

    this.debugCamera();

    this.debug.addButton({ title: "toggle autoclear" }).on("click", () => {
      this.renderer.autoClear = !this.renderer.autoClear;
    });
  }

  debugCamera() {
    const camera = this.debug.addFolder({ title: "camera", expanded: false });
    camera.addButton({ title: "print camera state" }).on("click", () => {
      console.log(
        this.camera.position.x.toFixed(4),
        ", ",
        this.camera.position.y.toFixed(4),
        ", ",
        this.camera.position.z.toFixed(4)
      );
      console.log(
        this.camera.rotation.x.toFixed(4),
        ", ",
        this.camera.rotation.y.toFixed(4),
        ", ",
        this.camera.rotation.z.toFixed(4)
      );
    });
    camera.addButton({ title: "toggle parallax" }).on("click", () => {
      this.parallax.enabled = !this.parallax.enabled;
    });
    camera.addInput(this, "initialHeight", {
      min: 0,
      max: 0.5,
      step: 0.001,
    });
  }

  setDebug() {
    this.paneContainer = new Pane();
    this.pane = this.paneContainer.addFolder({ title: "", expanded: false });
    this.worldDebug();
    this.sky && this.sky.setDebug();
    this.curlBubble && this.curlBubble.setDebug();
    this.water && this.water.setDebug();
    this.projectScreen.setDebug();
    this.projectTitles.setDebug();
    this.projectsViewManager.setDebug();
    this.projectDetailViewManager.setDebug();
    this.aboutViewManager.setDebug();
    this.homeViewManager.setDebug();
    this.post.setDebug();
    this.transitionManager.setDebug();
  }

  mouseNDC(e: PointerEvent) {
    this.mouse.x = (2 * e.clientX) / this.width - 1;
    this.mouse.y = (-2 * e.clientY) / this.height + 1;
  }

  onPointermove(e: PointerEvent) {
    // world updates
    this.mouseNDC(e);
    this.parallax.updateTarget();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.sky.onPointermove();
    this.water.onPointermove();

    if (this.view === View.Projects)
      this.projectsViewManager.onPointermove(this.mouse);
    if (this.view === View.ProjectDetail)
      this.projectDetailViewManager.onPointermove(this.mouse);
    if (this.view === View.About)
      this.aboutViewManager.onPointermove(this.mouse);
    if (this.view === View.Home)
      this.homeViewManager.onPointermove(e, this.mouse);
  }

  onPointerdown() {
    this.sky.onPointerdown();
    this.water.onPointerdown();

    if (this.view === View.Projects) this.projectsViewManager.onPointerdown();
    if (this.view === View.ProjectDetail)
      this.projectDetailViewManager.onPointerdown();
    if (this.view === View.About) this.aboutViewManager.onPointerdown();
    if (this.view === View.Home) this.homeViewManager.onPointerdown();
  }

  onPointerup() {
    this.sky.onPointerup();
    this.water.onPointerup();

    if (this.view === View.Projects) this.projectsViewManager.onPointerup();
    if (this.view === View.ProjectDetail)
      this.projectDetailViewManager.onPointerup();
    if (this.view === View.About) this.aboutViewManager.onPointerup();
    if (this.view === View.Home) this.homeViewManager.onPointerup();
  }

  onWheel(ev: WheelEvent) {
    this.sky.onWheel();
    this.water.onWheel();

    if (this.view === View.Projects) this.projectsViewManager.onWheel(ev);
    if (this.view === View.ProjectDetail)
      this.projectDetailViewManager.onWheel();
    if (this.view === View.About) this.aboutViewManager.onWheel(ev);
    if (this.view === View.Home) this.homeViewManager.onWheel();
  }

  resize() {
    let device =
      window.innerWidth > 749
        ? "desktop"
        : window.innerWidth > 481
        ? "ipad"
        : "mobile";

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.sky.resize();
    this.water.resize();

    this.rotateAlert && this.rotateAlert.onResize(this.width / this.height);

    if (this.projectsViewManager) {
      this.projectsViewManager.resize();
      this.projectDetailViewManager.resize();
      this.aboutViewManager.onResize();
      this.homeViewManager.resize();
    }
  }

  updateWorld() {
    this.parallax.update();
  }

  update() {
    this.updateWorld();
    this.sky.update();
    this.water.update();

    if (this.view === View.Projects) this.projectsViewManager.update();
    if (this.view === View.ProjectDetail)
      this.projectDetailViewManager.update();
    if (this.view === View.About) this.aboutViewManager.update();
    if (this.view === View.Home) this.homeViewManager.update();
  }

  render() {
    this.time += 0.01633;
    this.update();
    if (this.usePost) {
      this.post.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World({ container: document.querySelector<HTMLDivElement>("#canvas")! });
