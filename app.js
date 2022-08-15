import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import Sky from "./Sky";
import CurlBubble from "./CurlBubble";
import Water from "./Water";
import ProjectScreen from "./ProjectScreen";
import ProjectsViewManager from "./ProjectsViewManager";
import ProjectTitles from "./ProjectTitles";
import HomeViewManager from "./HomeViewManager";
import ProjectDetailViewManager from "./ProjectDetailViewManager";
import HomeTitle from "./HomeTitle";
import HomeContact from "./HomeContact";
import HomeNav from "./HomeNav";
import ProjectsFilters from "./ProjectFilters";
import ProjectsNav from "./ProjectsNav";
import ProjectDetailOverlay from "./ProjectDetailOverlay";
import AboutViewManager from "./AboutViewManager";
import AboutScreen from "./AboutScreen";
import AboutGreeting from "./AboutGreeting";
import AboutSocialIcons from "./AboutSocialIcons";
import AboutFooter from "./AboutFooter";
import AboutNav from "./AboutNav";
import AboutOverlay from "./AboutOverlay";
import RotateAlert from "./RotateAlert";
import Post from "./Post";

// add preloader => preloader maessage: This website has been designed for desktop

const debounce = (func, timeout = 50) => {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export class World {
  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.splitScreen = false;
    this.usePost = true;
    // screen.orientation.lock("landscape");
    this.init();

    this.activeProjectState = {
      active: 0,
      progress: 0,
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
    this.time = 0;
    this.mouse = new THREE.Vector2();
    this.container = document.querySelector("#canvas");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.width / this.height,
      0.01,
      // 0.0001,
      10
    );
    this.initialHeight = 0.14;
    this.camera.position.set(0, this.initialHeight, 1);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
      antialias: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.autoClear = false;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = true;
    this.raycaster = new THREE.Raycaster();
    this.setParallax();
    this.textureLoader = new THREE.TextureLoader();
  }

  async setWorld() {
    this.setComponents();

    this.setViewManagers();

    this.setData();

    this.onDataLoaded();

    this.water && (this.water.mesh.renderOrder = -1);
    // this.sky.mesh.renderOrder = 0;

    this.setDebug();

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

  setComponents() {
    this.post = new Post();
    this.sky = new Sky();
    this.curlBubble = new CurlBubble();
    this.projectTitles = new ProjectTitles();
    this.projectScreen = new ProjectScreen();
    this.water = new Water();
    this.homeTitle = new HomeTitle();
    this.homeContact = new HomeContact();
    this.homeNav = new HomeNav();
    this.projectFilters = new ProjectsFilters();
    this.projectsNav = new ProjectsNav();
    this.projectDetailOverlay = new ProjectDetailOverlay();
    this.aboutScreen = new AboutScreen();
    this.aboutGreeting = new AboutGreeting();
    this.aboutSocialIcons = new AboutSocialIcons();
    this.aboutFooter = new AboutFooter();
    this.aboutNav = new AboutNav();
    this.aboutOverlay = new AboutOverlay();
    this.rotateAlert = new RotateAlert();
  }

  setViewManagers() {
    this.projectsViewManager = new ProjectsViewManager();
    this.projectDetailViewManager = new ProjectDetailViewManager();
    this.aboutViewManager = new AboutViewManager();
    this.homeViewManager = new HomeViewManager();
  }

  onDataLoaded() {
    this.projectScreen.data = this.data;
    this.projectTitles.data = this.data;
    this.projectTitles.setMeshes2();
    this.projectsViewManager.filterAll();

    const location = window.location.pathname;

    this.pathViewMap = {
      "/": "home",
      "/projects": "projects",
      "/about": "about",
    };

    this.dataCount = this.data.length;

    for (let i = 0; i < this.dataCount; i++) {
      const key = this.data[i].path;
      this.pathViewMap[key] = "projectDetail";
    }

    const view = this.pathViewMap[location];

    if (view === "projectDetail") {
      for (let i = 0; i < this.dataCount; i++) {
        const dataPath = this.data[i].path;
        if (location === dataPath) {
          this.activeProjectState.active = i;
          break;
        }
      }
    }

    this.projectScreen.uniforms.uImage1.value =
      this.data[this.activeProjectState.active].texture;
    this.projectScreen.uniforms.uImage2.value =
      this.data[
        Math.min(
          this.activeProjectState.active + 1,
          this.activeProjectState.max
        )
      ].texture;

    this.changeView(view);
  }

  async setData() {
    const rawData = [
      {
        title: "Elastic Mesh",
        color: new THREE.Color("#ff0000"),
        category: "site",
        imageUrl: "images/t1.jpeg",
        link: "http://goggle.com/elasticMesh",
      },
      {
        title: "Mandelbrot Explorer",
        color: new THREE.Color("#00ff00"),
        category: "sketch",
        imageUrl: "images/t2.jpeg",
        link: "http://goggle.com/Mandelbrot",
      },
      {
        title: "A.P.O.D. Snippets",
        color: new THREE.Color("#0000ff"),
        category: "sketch",
        imageUrl: "images/t3.jpeg",
        link: "https://apod-snippets.vercel.app/",
      },
      {
        title: "Infinite Tunnel",
        color: new THREE.Color("#ff00ff"),
        category: "publication",
        imageUrl: "images/t4.jpeg",
        link: "http://goggle.com/Infinite",
      },
      {
        title: "Elastic Mesh 4",
        color: new THREE.Color("#ffff00"),
        category: "publication",
        imageUrl: "images/t5.jpeg",
        link: "http://goggle.com/Elastic4",
      },
      {
        title: "Elastic Mesh 5",
        color: new THREE.Color("#00ffff"),
        category: "publication",
        imageUrl: "images/t6.jpeg",
        link: "http://goggle.com/Mesh5",
      },
    ];

    // const loadData = async () => {
    //   return new Promise((resolve) => {
    //     const loadedData = rawData.map(async (entry) => {
    //       const tex = await new Promise((resolve) => {
    //         this.textureLoader.load(entry.imageUrl, (text) => {
    //           resolve(text);
    //         });
    //       });

    //       return {
    //         ...entry,
    //         texture: tex,
    //         path: "/projects-".concat(
    //           entry.title.toLowerCase().split(" ").join("-").replaceAll(".", "")
    //         ),
    //       };
    //     });

    //     Promise.all(loadedData).then((dat) => {
    //       this.data = dat;
    //       resolve();
    //     });
    //   });
    // };

    // await loadData();

    this.data = rawData.map((entry) => {
      return {
        ...entry,
        texture: this.textureLoader.load(entry.imageUrl),
        path: "/projects-".concat(
          entry.title.toLowerCase().split(" ").join("-").replaceAll(".", "")
        ),
      };
    });
  }

  changeView(view) {
    Object.keys(this.view).map((key) => (this.view[key] = false));
    this.view[view] = true;

    if (view === "home") {
      this.projectsViewManager.hide();
      this.projectDetailViewManager.hide();
      this.aboutViewManager.hide();
      this.homeViewManager.show();
      window.history.pushState({}, "", "/");
    }
    if (view === "projects") {
      this.projectDetailViewManager.hide();
      this.homeViewManager.hide();
      this.aboutViewManager.hide();
      this.projectsViewManager.show();
      window.history.pushState({}, "", "/projects");
    }
    if (view === "projectDetail") {
      this.projectsViewManager.hide();
      this.homeViewManager.hide();
      this.aboutViewManager.hide();
      this.projectDetailViewManager.show();
      const path = this.data[this.activeProjectState.active].path;
      window.history.pushState({}, "", path);
    }
    if (view === "about") {
      this.projectsViewManager.hide();
      this.homeViewManager.hide();
      this.projectDetailViewManager.hide();
      this.aboutViewManager.show();
      window.history.pushState({}, "", "/about");
    }
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
      .on("change", ({ value }) => this.changeView(value));

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
    const toggleComponent = (component) => {
      if (this.components[component]) {
        this.components[component] = false;
        this.scene.remove(this[component].mesh);
      } else {
        this.components[component] = true;
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
    // components.addButton({ title: "projectScreen" }).on("click", () => {
    //   toggleComponent("projectScreen");
    // });

    // temp
    // this.components.curlBubble = false;
    // this.scene.remove(this.curlBubble.mesh);
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
    this.pane = this.paneContainer.addFolder({ title: "", expanded: true });
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
  }

  mouseNDC(e) {
    this.mouse.x = (2 * e.clientX) / this.width - 1;
    this.mouse.y = (-2 * e.clientY) / this.height + 1;
  }

  updateParallaxTarget() {
    if (!this.parallax.enabled) return;
    this.parallax.target.y = this.mouse.y * this.parallax.magY;
    this.parallax.target.x = this.mouse.x * this.parallax.magX;
  }

  setParallax() {
    this.parallax = {
      lerp: 0.01,
      magX: 0.18,
      magY: 0.3,
      enabled: false,
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

      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }

  onPointermove(e) {
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

  onWheel(ev) {
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

new World();
