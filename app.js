import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import Sky from "./Sky";
import CurlBubble from "./CurlBubble";
import Water from "./Water";

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

    this.post && this.setPost();
    this.setDebug();
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
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
      200
    );
    this.camera.position.z = 1;
    this.camera.position.set(0, 0.2196, 0.9749);
    this.camera.rotation.set(-0.2216, 0.0384, 0.0087);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x333333);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.raycaster = new THREE.Raycaster();
    this.setParallax();
    this.textureLoader = new THREE.TextureLoader();
  }

  worldDebug() {
    this.debug = this.pane.addFolder({ title: "world", expanded: false });
    this.debugCamera();
    this.debugComponents();

    this.debug.addButton({ title: "toggle autoclear" }).on("click", () => {
      this.renderer.autoClear = !this.renderer.autoClear;
    });
  }

  debugComponents() {
    this.components = {
      sky: true,
      curlBubble: true,
      water: true,
    };
    const components = this.debug.addFolder({
      title: " toggle components",
      expanded: false,
    });
    components.addButton({ title: "sky" }).on("click", () => {
      if (this.components.sky) {
        this.components.sky = false;
        this.scene.remove(this.sky.mesh);
      } else {
        this.components.sky = true;
        this.scene.add(this.sky.mesh);
      }
    });
    components.addButton({ title: "curlBubble" }).on("click", () => {
      if (this.components.curlBubble) {
        this.components.curlBubble = false;
        this.scene.remove(this.curlBubble.mesh);
      } else {
        this.components.curlBubble = true;
        this.scene.add(this.curlBubble.mesh);
      }
    });
    components.addButton({ title: "water" }).on("click", () => {
      if (this.components.water) {
        this.components.water = false;
        this.scene.remove(this.water.mesh);
      } else {
        this.components.water = true;
        this.scene.add(this.water.mesh);
      }
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
  }

  setDebug() {
    this.pane = new Pane();
    this.worldDebug();
    this.sky.setDebug();
    this.curlBubble.setDebug();
    this.water.setDebug();
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
  }

  onPointerdown() {
    this.components.sky && this.sky.onPointerdown();
    this.components.curlBubble && this.curlBubble.onPointerdown();
    this.components.water && this.water.onPointerdown();
  }

  onPointerup() {
    this.components.sky && this.sky.onPointerup();
    this.components.curlBubble && this.curlBubble.onPointerup();
    this.components.water && this.water.onPointerup();
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
  }

  render() {
    this.time += 0.01633;
    this.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
