import {
  BackSide,
  Color,
  IUniform,
  Matrix4,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import fragmentShader from "@shaders/sky/fragment.glsl";
import vertexShader from "@shaders/sky/vertex.glsl";
import { World } from "@src/app";
import { _Sky } from "@types";
import { FolderApi } from "tweakpane";

/**********ADD DIFFUSE LIGHTING TO SHADER */
/***********add rgb shift to moon */
/*********ADD OPTION TO REMOVE BORDER FROM MOUNTAINS */

export class Sky implements _Sky {
  world = new World();
  scene = this.world.scene;
  debug: FolderApi;
  uniforms: Record<string, IUniform> = {
    uTime: { value: 0 },
    // sky
    uSkyColor: { value: new Color("#b754ff") },
    uSkyBrightness: { value: 0.6 },
    // horizon
    uHorizonBrightness: { value: 0.55 },
    uHorizonIntensity: { value: 8 },
    uHorizonHeight: { value: 0.2 },
    // mountain
    uMountain1Height: { value: 0.3 },
    uMountain1Color: { value: new Color("#4C3326") },
    uMountain2Height: { value: 0.2 },
    // uMountain2Color: { value: new Color("#7f6d1d") },
    uMountain2Color: { value: new Color("#010101") },
    // clouds
    // uCloudColor: { value: new Color("#010101") },
    uCloudColor: { value: new Color("#33012a") },
    uCloudsLowerBound: { value: 0 },
    uCloudsGradient: { value: 0.3 },
    uCloudSpeed: { value: 3 },
    uCloudHardEdges: { value: true },
    uCloudHardEdgeDensity: { value: 0.6 },
    uCloudHardEdgeCut: { value: 0.3 },
    // moon
    uMoonSize: { value: 0.139 },
    // uMoonPosition: { value: new Vector3(0, 0, -1) },
    uMoonPosition: { value: new Vector3(2.39, 1.52, -0.43) },
    uMoonHaloSize: { value: 0.3 },
    uMoonHaloGradient: { value: 1.9 },
    uMoonColor: { value: new Color("#ffffff") },
    uMoonGradient: { value: 1.0111 },
    // uGreyNoise
    uGreyNoise: {
      value: null,
    },
  };
  material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: this.uniforms,
    side: BackSide,
    depthWrite: false,
  });
  geometry = new SphereGeometry(1);
  mesh = new Mesh(this.geometry, this.material);
  constructor() {
    this.geometry.applyMatrix4(new Matrix4().makeRotationY(Math.PI / 2));
    this.scene.add(this.mesh);
  }

  skyDebug() {
    const sky = this.debug.addFolder({ title: "sky", expanded: false });
    sky
      .addInput(this.uniforms.uSkyColor, "value", {
        view: "color",
        label: "skyColor",
      })
      .on("change", () =>
        this.uniforms.uSkyColor.value.multiplyScalar(1 / 255)
      );
    sky.addInput(this.uniforms.uSkyBrightness, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "skyBrightness",
    });
  }

  horizonDebug() {
    const horizon = this.debug.addFolder({ title: "horizon", expanded: false });
    horizon.addInput(this.uniforms.uHorizonBrightness, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "horizonBrightness",
    });
    horizon.addInput(this.uniforms.uHorizonIntensity, "value", {
      min: 1,
      max: 10,
      step: 0.001,
      label: "horizonIntensity",
    });
    horizon.addInput(this.uniforms.uHorizonHeight, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height",
    });
  }

  mountainDebug() {
    const mountain = this.debug.addFolder({
      title: "mountain",
      expanded: false,
    });
    mountain
      .addInput(this.uniforms.uMountain1Color, "value", {
        view: "color",
        label: "color-1",
      })
      .on("change", () =>
        this.uniforms.uMountain1Color.value.multiplyScalar(1 / 255)
      );
    mountain.addInput(this.uniforms.uMountain1Height, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height-1",
    });
    mountain
      .addInput(this.uniforms.uMountain2Color, "value", {
        view: "color",
        label: "color-2",
      })
      .on("change", () =>
        this.uniforms.uMountain2Color.value.multiplyScalar(1 / 255)
      );
    mountain.addInput(this.uniforms.uMountain2Height, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "height-2",
    });
  }

  cloudsDebug() {
    const clouds = this.debug.addFolder({ title: "clouds", expanded: false });
    clouds
      .addInput(this.uniforms.uCloudColor, "value", {
        view: "color",
        label: "color",
      })
      .on("change", () =>
        this.uniforms.uCloudColor.value.multiplyScalar(1 / 255)
      );
    clouds.addInput(this.uniforms.uCloudsLowerBound, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "lower bound",
    });
    clouds.addInput(this.uniforms.uCloudsGradient, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "gradient",
    });
    clouds.addInput(this.uniforms.uCloudSpeed, "value", {
      min: 0,
      max: 6,
      step: 0.001,
      label: "speed",
    });
    const edges = clouds.addFolder({ title: "harder edges" });
    edges
      .addButton({ title: "hard edges" })
      .on(
        "click",
        () =>
          (this.uniforms.uCloudHardEdges.value =
            !this.uniforms.uCloudHardEdges.value)
      );
    edges.addInput(this.uniforms.uCloudHardEdgeDensity, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "density",
    });
    edges.addInput(this.uniforms.uCloudHardEdgeCut, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "cut",
    });
  }

  moonDebug() {
    const moon = this.debug.addFolder({ title: "moon", expanded: false });
    moon.addInput(this.uniforms.uMoonSize, "value", {
      min: 0,
      max: 0.2,
      step: 0.00001,
      label: "size",
    });
    const position = moon.addFolder({ title: "position" });
    position.addInput(this.uniforms.uMoonPosition.value, "x", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    position.addInput(this.uniforms.uMoonPosition.value, "y", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    position.addInput(this.uniforms.uMoonPosition.value, "z", {
      min: -5,
      max: 5,
      step: 0.01,
    });
    moon.addInput(this.uniforms.uMoonHaloSize, "value", {
      min: 0,
      max: 0.35,
      step: 0.0001,
      label: "halo size",
    });
    moon.addInput(this.uniforms.uMoonHaloGradient, "value", {
      min: 1,
      max: 2.5,
      step: 0.0001,
      label: "halo gradient",
    });
    moon
      .addInput(this.uniforms.uMoonColor, "value", {
        view: "color",
        label: "color",
      })
      .on("change", () =>
        this.uniforms.uMoonColor.value.multiplyScalar(1 / 255)
      );
    moon.addInput(this.uniforms.uMoonGradient, "value", {
      min: 1,
      max: 1.1,
      step: 0.0001,
      label: "disc gradient",
    });
  }

  setDebug() {
    this.uniforms = this.material.uniforms;
    this.debug = this.world.pane.addFolder({
      title: "skybox",
      expanded: false,
    });
    this.skyDebug();
    this.horizonDebug();
    this.mountainDebug();
    this.cloudsDebug();
    this.moonDebug();

    this.debug.addInput(this.mesh.scale, "x", {
      min: 1,
      max: 3,
      step: 0.001,
      label: "xscale",
    });
  }

  onPreloaded() {
    this.uniforms.uGreyNoise.value = this.world.resources.assets.greyNoise;
  }

  // setPost() {
  //   this.rt = new WebGLRenderTarget(this.width, this.height, {
  //     minFilter: LinearFilter,
  //     magFilter: LinearFilter,
  //     format: RGBAFormat,
  //   });
  //   this.materialPost = new ShaderMaterial({
  //     // vertexShader: vertexPost,
  //     // fragmentShader: fragmentPost,
  //     uniforms: {
  //       uMap: { value: this.rt.texture },
  //     },
  //   });
  //   const mesh = new THREE.Mesh(
  //     new THREE.PlaneGeometry(2, 2),
  //     this.materialPost
  //   );
  //   this.postScene = new THREE.Scene();
  //   this.postScene.add(mesh);
  // }

  onPointermove() {}

  onPointerdown() {}

  onPointerup() {}

  onWheel() {}

  onResize() {}

  update() {
    this.uniforms.uTime.value = this.world.time;
  }
}
