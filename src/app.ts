import * as THREE from "three";
import {
  Vector2,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Raycaster,
  TextureLoader,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import Sky from "./components/Sky";
import CurlBubble from "./components/CurlBubble";
import Water from "./components/water";
import ProjectScreen from "./components/ProjectScreen";
import ProjectsViewManager from "./components/ProjectsViewManager";
import ProjectTitles from "./components/ProjectTitles";
import HomeViewManager from "./components/HomeViewManager";
import ProjectDetailViewManager from "./components/ProjectDetailViewManager";
import HomeTitle from "./components/HomeTitle";
import HomeContact from "./components/HomeContact";
import HomeNav from "./components/HomeNav";
import ProjectsFilters from "./components/ProjectFilters";
import ProjectsNav from "./components/ProjectsNav";
import ProjectDetailOverlay from "./components/ProjectDetailOverlay";
import AboutViewManager from "./components/AboutViewManager";
import AboutScreen from "./components/AboutScreen";
import AboutGreeting from "./components/AboutGreeting";
import AboutSocialIcons from "./components/AboutSocialIcons";
import AboutFooter from "./components/AboutFooter";
import AboutNav from "./components/AboutNav";
import AboutOverlay from "./components/AboutOverlay";
import RotateAlert from "./components/RotateAlert";
import Post from "./components/Post";
import TransitionManager from "./components/TransitionManager";
import Resources from "./components/Resources";

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

export class World {
  static instance: World;
  usePost = false;
  activeProjectState: any;
  activeProjectState2: any;
  components: any;
  view: any;
  time = 0;
  mouse = new Vector2();
  container: any;
  width: number;
  height: number;
  scene = new Scene();
  camera: PerspectiveCamera;
  initialHeight = 0.14;
  renderer = new WebGLRenderer({
    alpha: true,
    powerPreference: "high-performance",
    antialias: true,
  });
  controls: OrbitControls;
  raycaster = new Raycaster();
  ndcRaycaster = new Raycaster();
  textureLoader = new TextureLoader();
  testSrc: any;
  testTex: any;
  resources: any;
  water: any;
  post: any;
  sky: Sky;
  curlBubble: any;
  projectTitles: any;
  homeTitle: any;
  projectScreen: any;
  homeContact: any;
  homeNav: any;
  projectFilters: any;
  projectsNav: any;
  projectDetailOverlay: any;
  aboutScreen: any;
  aboutGreeting: any;
  aboutSocialIcons: any;
  aboutFooter: any;
  aboutNav: any;
  aboutOverlay: any;
  rotateAlert: any;
  transitionManager: any;
  projectsViewManager: any;
  projectDetailViewManager: any;
  aboutViewManager: any;
  homeViewManager: any;
  pathViewMap: any;
  dataCount: any;
  debug: any;
  pane: any;
  parallax: any;
  paneContainer: any;
  constructor({ container }: { container?: any } = {}) {
    if (World.instance) {
      return World.instance;
    }
    console.log({ HELLEFEFJEOFMEFEFEFEFEFEFEGWGWRG: "YEAHHHHFEFE W" });
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

    this.components = {
      sky: true,
      curlBubble: true,
      water: true,
      projectScreen: true,
      homeTitle: true,
    }; // for debug purposes

    this.view = {
      home: false,
      projects: false,
      projectDetail: false,
      about: false,
    };

    this.setWorld();
  }

  init() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.width / this.height,
      0.001,
      10
    );
    this.camera.position.set(0, this.initialHeight, 1);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.autoClear = false;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    this.setParallax();
  }

  async setWorld() {
    this.setBeforeComponenets();
    this.resources = new Resources();
    await this.resources.load();
    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 1500);
    });
    this.onAfterSetComponenets();

    this.setComponents();

    this.setViewManagers();

    this.onDataLoaded();

    this.water && (this.water.mesh.renderOrder = -1);
    // this.sky.mesh.renderOrder = 0;

    // this.setDebug();

    this.addListeners();

    this.resize();
    this.render();
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
    this.post = new Post();
    this.sky = new Sky();
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
    this.homeTitle = new HomeTitle();
    this.homeContact = new HomeContact();
    this.homeNav = new HomeNav();
    this.projectFilters = new ProjectsFilters();
    this.aboutScreen = new AboutScreen();
    this.projectsNav = new ProjectsNav();
    this.projectDetailOverlay = new ProjectDetailOverlay();
    this.aboutGreeting = new AboutGreeting();
    this.aboutSocialIcons = new AboutSocialIcons();
    this.aboutFooter = new AboutFooter();
    this.aboutNav = new AboutNav();
    this.aboutOverlay = new AboutOverlay();
    this.rotateAlert = new RotateAlert();
    this.transitionManager = new TransitionManager();
  }

  setViewManagers() {
    this.projectsViewManager = new ProjectsViewManager();
    this.projectDetailViewManager = new ProjectDetailViewManager();
    this.aboutViewManager = new AboutViewManager();
    this.homeViewManager = new HomeViewManager();
  }

  onDataLoaded() {
    this.projectsViewManager.onDataLoaded();

    const location = window.location.pathname;

    this.pathViewMap = {
      "/": "home",
      "/projects": "projects",
      "/about": "about",
    };

    this.dataCount = this.resources.projects.length;

    for (let i = 0; i < this.dataCount; i++) {
      const key = this.resources.projects[i].path;
      this.pathViewMap[key] = "projectDetail";
    }

    const view = this.pathViewMap[location];

    if (view === "projectDetail") {
      for (let i = 0; i < this.dataCount; i++) {
        const dataPath = this.resources.projects[i].path;
        if (location === dataPath) {
          this.activeProjectState.active = i;
          break;
        }
      }
    }

    this.changeView(view);

    console.log({ view });
  }

  changeView(view: any) {
    if (view === "home") {
      this.transitionManager.projectsToHome();
      window.history.pushState({}, "", "/");
    }
    if (view === "projects") {
      if (this.view.home) this.transitionManager.homeToProjects();
      else if (this.view.projectDetail)
        this.transitionManager.projectDetailToProjects();
      else if (this.view.about) {
        this.transitionManager.aboutToProjects();
      } else {
        this.projectsViewManager.show();
      }
      window.history.pushState({}, "", "/projects");
    }
    if (view === "projectDetail") {
      if (this.view.projects) this.transitionManager.projectsToProjectDetail();
      else this.projectDetailViewManager.show();
      const path = this.resources.projects[this.activeProjectState.active].path;
      window.history.pushState({}, "", path);
    }
    if (view === "about") {
      if (this.view.projects) this.transitionManager.projectsToAbout();
      else this.transitionManager.projectsToAbout();
      // this.view.projects && this.projectsViewManager.hide();
      // this.view.home && this.homeViewManager.hide();
      // this.view.projectDetail && this.projectDetailViewManager.hide();
      // this.aboutViewManager.show();
      window.history.pushState({}, "", "/about");
    }

    Object.keys(this.view).map((key) => (this.view[key] = false));
    this.view[view] = true;
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
    this.debugComponents();

    this.debug.addButton({ title: "toggle autoclear" }).on("click", () => {
      this.renderer.autoClear = !this.renderer.autoClear;
    });
  }

  debugComponents() {
    const components = this.debug.addFolder({
      title: " toggle components",
      expanded: false,
    });
    const toggleComponent = (component: any) => {
      if (this.components[component]) {
        this.components[component] = false;
        // @ts-ignore: Unreachable code error
        this.scene.remove(this[component].mesh);
      } else {
        this.components[component] = true;
        // @ts-ignore: Unreachable code error
        this.scene.add(this[component].mesh);
      }
    };
    components.addButton({ title: "sky" }).on("click", () => {
      toggleComponent("sky");
    });
    components.addButton({ title: "curlBubble" }).on("click", () => {
      toggleComponent("curlBubble");
    });
    components.addButton({ title: "water" }).on("click", () => {
      toggleComponent("water");
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

  updateParallaxTarget() {
    if (!this.parallax.enabled) return;
    this.parallax.target.y = this.mouse.y * this.parallax.magY;
    this.parallax.target.x =
      this.mouse.x * this.parallax.magX * this.parallax.direction;
  }

  setParallax() {
    this.parallax = {
      lerp: 0.01,
      magX: 0.18,
      magY: 0.3,
      enabled: true,
      direction: 1,
      target: new THREE.Vector2(),
    };
  }

  updateParallax() {
    if (this.parallax.enabled) {
      this.camera.position.x +=
        (this.parallax.target.x - this.camera.position.x) * this.parallax.lerp;
      this.camera.position.y +=
        (this.parallax.target.y + this.initialHeight - this.camera.position.y) *
        this.parallax.lerp;
      this.camera.position.y = Math.max(this.camera.position.y, 0.05);

      this.camera.lookAt(new Vector3(0, 0, 0));
    }
  }

  onPointermove(e: PointerEvent) {
    // world updates
    this.mouseNDC(e);
    this.updateParallaxTarget();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.components.sky && this.sky.onPointermove();
    this.components.water && this.water.onPointermove();

    if (this.view.projects) this.projectsViewManager.onPointermove(this.mouse);
    if (this.view.projectDetail)
      this.projectDetailViewManager.onPointermove(this.mouse);
    if (this.view.about) this.aboutViewManager.onPointermove(this.mouse);
    if (this.view.home) this.homeViewManager.onPointermove(e, this.mouse);
  }

  onPointerdown() {
    this.components.sky && this.sky.onPointerdown();
    this.components.water && this.water.onPointerdown();

    if (this.view.projects) this.projectsViewManager.onPointerdown();
    if (this.view.projectDetail) this.projectDetailViewManager.onPointerdown();
    if (this.view.about) this.aboutViewManager.onPointerdown();
    if (this.view.home) this.homeViewManager.onPointerdown();
  }

  onPointerup() {
    this.components.sky && this.sky.onPointerup();
    this.components.water && this.water.onPointerup();

    if (this.view.projects) this.projectsViewManager.onPointerup();
    if (this.view.projectDetail) this.projectDetailViewManager.onPointerup();
    if (this.view.about) this.aboutViewManager.onPointerup();
    if (this.view.home) this.homeViewManager.onPointerup();
  }

  onWheel(ev: WheelEvent) {
    this.components.sky && this.sky.onWheel();
    this.components.water && this.water.onWheel();

    if (this.view.projects) this.projectsViewManager.onWheel(ev);
    if (this.view.projectDetail) this.projectDetailViewManager.onWheel(ev);
    if (this.view.about) this.aboutViewManager.onWheel(ev);
    if (this.view.home) this.homeViewManager.onWheel(ev);
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

    this.components.sky && this.sky.resize();
    this.components.water && this.water.resize();

    this.rotateAlert.onResize(this.width / this.height);

    this.projectsViewManager.resize();
    this.projectDetailViewManager.resize();
    this.aboutViewManager.onResize();
    this.homeViewManager.resize();
  }

  updateWorld() {
    this.updateParallax();
  }

  update() {
    this.updateWorld();
    this.components.sky && this.sky.update();
    this.components.water && this.water.update();

    if (this.view.projects) this.projectsViewManager.update();
    if (this.view.projectDetail) this.projectDetailViewManager.update();
    if (this.view.about) this.aboutViewManager.update();
    if (this.view.home) this.homeViewManager.update();
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
