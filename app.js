import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import Sky from "./Sky";
import CurlBubble from "./CurlBubble";
import Water from "./Water";
import ProjectScreen from "./ProjectScreen";
import ProjectsViewManager from "./ProjectsViewManager";
import ProjectTitles from "./ProjectTitles";

//******ADD CAMERA SHAKE FROM ALIEN */

export class World {
  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.splitScreen = false;
    this.post = false;
    this.init();

    this.sky = new Sky();
    this.curlBubble = new CurlBubble();
    this.water = new Water();
    this.projectScreen = new ProjectScreen();
    this.projectTitles = new ProjectTitles();
    this.projectsViewManager = new ProjectsViewManager();

    this.post && this.setPost();
    this.components = {
      sky: true,
      curlBubble: true,
      water: true,
      projectScreen: true,
    }; // for debug purposes
    this.view = {
      home: false,
      projects: false,
    };
    /****
     *
     */
    this.water.mesh.renderOrder = -1;
    /***
     *
     */
    this.setDebug();
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
    window.addEventListener("pointerup", this.onPointerup.bind(this));
    window.addEventListener("pointerdown", this.onPointerdown.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
    this.resize();
    this.render();
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
      0.1,
      900
    );
    // this.camera.position.set(0, 0.2196, 0.9749);
    // this.camera.rotation.set(-0.2216, 0.0384, 0.0087);
    this.camera.position.set(0.0331, 0.1395, 1.097);
    this.camera.rotation.set(-0.0578, 0.0286, 0.0017);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
      antialias: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x333333);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    this.raycaster = new THREE.Raycaster();
    this.setParallax();
    this.textureLoader = new THREE.TextureLoader();
  }

  worldDebug() {
    this.debug = this.pane.addFolder({ title: "world", expanded: true });

    this.debug
      .addBlade({
        view: "list",
        options: [
          { text: "home", value: "home" },
          { text: "projects", value: "projects" },
        ],
        value: "view",
      })
      .on("change", ({ value }) => {
        Object.keys(this.view).map((key) => (this.view[key] = false));
        this.view[value] = true;
        console.log(this.view);
        if (value === "home") {
          this.projectsViewManager.hide();
        }
        if (value === "projects") {
          this.projectsViewManager.show();
        }
      });

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
  }

  setDebug() {
    this.pane = new Pane();
    // this.pane.addButton({ title: "show/hide" }).on("click", () => {
    //   this.debug.hidden = !this.debug.hidden;
    // });
    this.worldDebug();
    this.sky.setDebug();
    this.curlBubble.setDebug();
    this.water.setDebug();
    this.projectScreen.setDebug();
    this.projectTitles.setDebug();
    this.projectsViewManager.setDebug();
  }

  setPost() {
    this.sky.setPost();
  }

  mouseNDC(e) {
    this.mouse.x = (2 * e.clientX) / this.width - 1;
    this.mouse.y = (-2 * e.clientY) / this.height + 1;
  }

  updateParallaxTarget() {
    if (!this.parallax.enabled) return;
    this.parallax.target.y = -this.mouse.x * this.parallax.magX;
    this.parallax.target.x = this.mouse.y * this.parallax.magY;
  }

  onPointermove(e) {
    // world updates
    this.mouseNDC(e);
    this.updateParallaxTarget();

    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.components.sky && this.sky.onPointermove();
    this.components.curlBubble && this.curlBubble.onPointermove();
    this.components.water && this.water.onPointermove();

    if (this.view.projects) this.projectsViewManager.onPointermove();
  }

  onPointerdown() {
    this.components.sky && this.sky.onPointerdown();
    this.components.curlBubble && this.curlBubble.onPointerdown();
    this.components.water && this.water.onPointerdown();

    if (this.view.projects) this.projectsViewManager.onPointerdown();
  }

  onPointerup() {
    this.components.sky && this.sky.onPointerup();
    this.components.curlBubble && this.curlBubble.onPointerup();
    this.components.water && this.water.onPointerup();

    if (this.view.projects) this.projectsViewManager.onPointerup();
  }

  onWheel(ev) {
    this.components.sky && this.sky.onWheel();
    this.components.curlBubble && this.curlBubble.onWheel();
    this.components.water && this.water.onWheel();

    if (this.view.projects) this.projectsViewManager.onWheel(ev);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.components.sky && this.sky.resize();
    this.components.curlBubble && this.curlBubble.resize();
    this.components.water && this.water.resize();

    if (this.view.projects) this.projectsViewManager.resize();
  }

  setParallax() {
    this.parallax = {
      lerp: 0.1,
      magX: 0.1,
      magY: 0.2,
      enabled: false,
      target: new THREE.Vector2(),
    };
  }

  updateParallax() {
    if (this.parallax.enabled) {
      this.camera.rotation.x +=
        (this.parallax.target.x - this.camera.rotation.x) * this.parallax.lerp;
      this.camera.rotation.y +=
        (this.parallax.target.y - this.camera.rotation.y) * this.parallax.lerp;
    }
  }

  updateWorld() {
    this.updateParallax();
  }

  update() {
    this.updateWorld();
    this.components.sky && this.sky.update();
    this.components.curlBubble && this.curlBubble.update();
    this.components.water && this.water.update();

    if (this.view.projects) this.projectsViewManager.update();
  }

  render() {
    this.time += 0.01633;
    this.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
