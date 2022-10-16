import {
  Vector2,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
} from "three";
import { FolderApi, Pane } from "tweakpane";
import {
  Parallax,
  Sky,
  CurlBubble,
  Post,
  ProjectScreen,
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
import {
  ProjectState,
  TransitionEffect,
  View,
  _AboutViewManager,
  _CurlBubble,
  _HomeViewManager,
  _Post,
  _ProjectDetailViewManager,
  _ProjectScreen,
  _ProjectsViewManager,
  _Resources,
  _Sky,
  _ViewManager,
  _Water,
  _World,
} from "@types";

export class World implements _World {
  static instance: World;
  usePost = false;
  projectState: ProjectState;
  view: View;
  time = 0;
  mouse: Vector2;
  container: HTMLDivElement;
  width: number;
  height: number;
  scene: Scene;
  camera: PerspectiveCamera;
  initialHeight: number;
  renderer: WebGLRenderer;
  raycaster: Raycaster;
  ndcRaycaster: Raycaster;
  resources: _Resources;
  water: _Water;
  post: _Post;
  sky: _Sky;
  curlBubble: _CurlBubble;
  projectScreen: _ProjectScreen;
  rotateAlert: RotateAlert;
  transitionManager: TransitionManager;
  projectsViewManager: _ProjectsViewManager;
  projectDetailViewManager: _ProjectDetailViewManager;
  aboutViewManager: _AboutViewManager;
  homeViewManager: _HomeViewManager;
  parallax: Parallax;
  preloader: Preloader;
  dataCount: number;
  debug: FolderApi;
  pane: FolderApi;
  paneContainer: Pane;
  viewManagers: {
    [key in View]?: _ViewManager;
  } = {};
  constructor({ container }: { container?: HTMLDivElement } = {}) {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.container = container!;

    this.camera = new PerspectiveCamera(65, 1, 0.001, 10);

    this.renderer = new WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
      antialias: true,
    });

    this.initialHeight = 0.14;

    this.projectState = {
      active: 0,
      progress: { value: 0 },
      target: -1,
      isTransitioning: { value: false },
      min: 0,
      max: 5,
    };

    this.mouse = new Vector2();

    this.scene = new Scene();

    this.raycaster = new Raycaster();

    this.ndcRaycaster = new Raycaster();

    this.camera.position.set(0, this.initialHeight, 1);
    this.renderer.setPixelRatio(1);
    this.container.appendChild(this.renderer.domElement);

    this.init();
  }

  async init() {
    this.preloader = new Preloader();
    this.parallax = new Parallax();
    this.sky = new Sky();
    this.post = new Post();
    this.curlBubble = new CurlBubble();
    this.water = new Water();
    this.rotateAlert = new RotateAlert();

    this.resources = new Resources();
    this.addListeners();
    this.onResize();
    this.render();
    await this.resources.load();

    // await new Promise((res) => {
    //   window.addEventListener("click", () => {
    //     res(null);
    //   });
    // });

    this.sky.onPreloaded();

    this.projectScreen = new ProjectScreen();
    this.homeViewManager = new HomeViewManager();
    this.projectsViewManager = new ProjectsViewManager();
    this.projectDetailViewManager = new ProjectDetailViewManager();
    this.aboutViewManager = new AboutViewManager();

    this.viewManagers = {
      Home: this.homeViewManager,
      ProjectDetail: this.projectDetailViewManager,
      About: this.aboutViewManager,
      Projects: this.projectsViewManager,
    };

    this.transitionManager = new TransitionManager();

    this.changeView(window.VIEW);

    this.setDebug();

    this.onResize();
  }

  addListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
    window.addEventListener("pointerup", this.onPointerup.bind(this));
    window.addEventListener("pointerdown", this.onPointerdown.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
  }

  changeView(view: View) {
    if (view === View.Home) {
      this.transitionManager.projectsToHome();
      window.history.pushState({}, "", "/");
    }
    if (view === View.Projects) {
      if (this.view === View.Home) {
        this.transitionManager.homeToProjects();
      } else if (this.view === View.ProjectDetail)
        this.transitionManager.projectDetailToProjects();
      else if (this.view === View.About) {
        this.transitionManager.aboutToProjects();
      } else {
        this.transitionManager.homeToProjects();
      }
      window.history.pushState({}, "", "/projects");
    }
    if (view === View.ProjectDetail) {
      if (this.view === View.Projects)
        this.transitionManager.projectsToProjectDetail();
      else this.projectDetailViewManager.show();
      const path = this.resources.projects[this.projectState.active].path;
      window.history.pushState({}, "", path);
    }
    if (view === View.About) {
      if (this.view === View.Projects) this.transitionManager.projectsToAbout();
      else this.transitionManager.projectsToAbout();
      window.history.pushState({}, "", "/about");
    }
    if (view === View.Error) {
      alert("heyy :-)");
    }

    this.view = view;
  }

  worldDebug() {
    this.debug = this.pane.addFolder({ title: "world", expanded: false });

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

    this.viewManagers[this.view]?.onPointermove(this.mouse, e);
  }

  onPointerdown() {
    this.sky.onPointerdown();
    this.water.onPointerdown();
    this.viewManagers[this.view]?.onPointerdown();
  }

  onPointerup() {
    this.sky.onPointerup();
    this.water.onPointerup();
    this.viewManagers[this.view]?.onPointerup();
  }

  onWheel(ev: WheelEvent) {
    this.sky.onWheel();
    this.water.onWheel();

    this.viewManagers[this.view]?.onWheel(ev);
  }

  onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.sky.onResize();
    this.water.onResize();

    this.rotateAlert && this.rotateAlert.onResize(this.width / this.height);

    Object.values(this.viewManagers).map((viewManager) =>
      viewManager.onResize()
    );
  }

  update() {
    this.parallax.update();
    this.sky.update();
    this.water.update();
    this.viewManagers[this.view]?.update();
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
