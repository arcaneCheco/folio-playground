import { World } from "@src/app";
import fragmentShader from "@shaders/curlBubble/fragment.glsl";
import vertexShader from "@shaders/curlBubble/vertex.glsl";
import { randFloat, clamp } from "three/src/math/MathUtils";
import { perlin3 } from "@utils/perlin";
import { CurlSeed, Shape, _CurlBubble } from "@types";
import {
  BufferGeometry,
  Color,
  Data3DTexture,
  FloatType,
  IUniform,
  LinearFilter,
  Mesh,
  RedFormat,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { FolderApi } from "tweakpane";
export class CurlBubble implements _CurlBubble {
  world = new World();
  scene = this.world.scene;
  size = 128;
  shapeArray: Float32Array;
  noiseArray: Float32Array;
  shape: Data3DTexture;
  noise: Data3DTexture;
  geometry: SphereGeometry;
  material: ShaderMaterial;
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  shapeType: Shape;
  noiseSeed: CurlSeed;
  debug: FolderApi;
  uniforms: Record<string, IUniform>;
  scale: number;
  constructor() {
    const n = Math.pow(this.size, 3);
    this.shapeArray = new Float32Array(n);
    this.noiseArray = new Float32Array(n);

    this.shape = new Data3DTexture(
      this.shapeArray,
      this.size,
      this.size,
      this.size
    );
    this.shape.format = RedFormat;
    this.shape.type = FloatType;
    this.shape.minFilter = LinearFilter;
    this.shape.magFilter = LinearFilter;
    this.shape.unpackAlignment = 1;

    this.noise = new Data3DTexture(
      this.noiseArray,
      this.size,
      this.size,
      this.size
    );
    this.noise.format = RedFormat;
    this.noise.type = FloatType;
    this.noise.minFilter = LinearFilter;
    this.noise.magFilter = LinearFilter;
    this.noise.unpackAlignment = 1;

    this.geometry = new SphereGeometry(0.5, 30, 30);
    const geometry2 = new SphereGeometry(2, 30, 30);
    this.geometry.setAttribute("position2", geometry2.attributes.position);

    this.material = new ShaderMaterial({
      uniforms: {
        uShape: { value: this.shape },
        uNoise: { value: this.noise },
        uTime: { value: 0.0 },
        uColor: { value: new Color("#5676ff") },
        uSteps: { value: 90 },
        // vertex-distortion
        uVertexDistortionSpeed: { value: 0.9 },
        uVertexDistortionAmplitude: { value: 0.06 },
        // lines
        uCut: { value: 0.5 },
        uRotationSpeed: { value: 1 },
        uColorStrength: { value: 0.03 },
        uColorIntensity: { value: 0.0082 },
        uLightPosition: {
          value: new Vector3(0.0000001, 0.001, 0.0000001),
        },
        uBubblePos: { value: 0.12 },
      },
      transparent: true,
      vertexShader,
      fragmentShader,
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.scale.set(0.28, 0.28, 0.28);
    this.mesh.position.set(0, 0.22, 0);

    this.shapeType = Shape.Sphere;

    this.generateShape(this.shapeType);

    this.noiseSeed = {
      s: 4.2315197456339115,
      ox: 43.745944838361396,
      oy: -52.33405246736149,
      oz: -70.8000496386397,
    };
    this.noiseSeed = {
      s: 7.404537184903421,
      ox: 6.195020470368192,
      oy: 27.17863608024014,
      oz: -42.06134238725863,
    };
    this.generateNoise();
  }

  setDebug() {
    this.uniforms = this.material.uniforms;
    this.debug = this.world.pane.addFolder({
      title: "curlBubble",
      expanded: false,
    });
    this.debugScale();
    this.debugPosition();
    this.debugVertexDistortion();
    this.debugLines();
    this.debugShapeData();

    this.debug
      .addInput(this.uniforms.uColor, "value", {
        view: "color",
        label: "color",
      })
      .on("change", () => this.uniforms.uColor.value.multiplyScalar(1 / 255));
    this.debug.addInput(this.uniforms.uSteps, "value", {
      min: 0,
      max: 250,
      step: 1,
      label: "steps",
    });
    this.debug.addInput(this.uniforms.uRotationSpeed, "value", {
      min: 0,
      max: 2,
      step: 0.001,
      label: "rotation speed",
    });
    this.debug.addInput(this.uniforms.uColorStrength, "value", {
      min: 0,
      max: 0.1,
      step: 0.00001,
      label: "color strength",
    });
    this.debug.addInput(this.uniforms.uColorIntensity, "value", {
      min: 0,
      max: 0.05,
      step: 0.0001,
      label: "color intensity",
    });
    this.debug.addInput(this.uniforms.uLightPosition.value, "x", {
      min: -0.5,
      max: 0.5,
      step: 0.0001,
      //   label: "color intensity",
    });
    this.debug.addInput(this.uniforms.uLightPosition.value, "y", {
      min: -1,
      max: 1,
      step: 0.0001,
    });
    this.debug.addInput(this.uniforms.uLightPosition.value, "z", {
      min: -1,
      max: 1,
      step: 0.0001,
    });
    // this.debug.addInput(this.mesh.rotation, "y", {
    //   min: 0,
    //   max: 6,
    //   step: 0.001,
    // });
  }

  projectsState() {
    this.mesh.position.set(-0.5, 0.2, 0.09);
  }

  debugShapeData() {
    const shape = this.debug.addFolder({
      title: "lines shape",
      expanded: true,
    });
    shape
      .addBlade({
        view: "list",
        options: [
          { text: "sphere", value: "sphere" },
          { text: "blob", value: "blob" },
          { text: "goursat", value: "goursat" },
          { text: "torus", value: "torus" },
          { text: "hyperelliptic", value: "hyperelliptic" },
          { text: "torusKnot", value: "torusKnot" },
        ],
        value: "sphere",
      })
      // @ts-ignore
      .on("change", ({ value }) => {
        this.shapeType = value;
        this.generateShape(this.shapeType);
      });
    const noise = shape.addFolder({ title: "curl noise", expanded: false });
    noise
      .addButton({ title: "re-compute noise" })
      .on("click", () => this.generateNoise());
    noise.addButton({ title: "set random seed" }).on("click", () => {
      this.noiseSeed.s = randFloat(3, 9);
      this.noiseSeed.ox = randFloat(-100, 100);
      this.noiseSeed.oy = randFloat(-100, 100);
      this.noiseSeed.oz = randFloat(-100, 100);
      console.log(
        this.noiseSeed.s,
        this.noiseSeed.ox,
        this.noiseSeed.oy,
        this.noiseSeed.oz
      );
      this.world.paneContainer.refresh();
    });
    noise.addInput(this.noiseSeed, "s", {
      min: 3,
      max: 9,
      step: 0.001,
      label: "seed-s",
    });
    noise.addInput(this.noiseSeed, "ox", {
      min: -100,
      max: 100,
      step: 0.01,
      label: "seed-ox",
    });
    noise.addInput(this.noiseSeed, "oy", {
      min: -100,
      max: 100,
      step: 0.01,
      label: "seed-ox",
    });
    noise.addInput(this.noiseSeed, "oz", {
      min: -100,
      max: 100,
      step: 0.01,
      label: "seed-ox",
    });
  }

  debugLines() {
    const lines = this.debug.addFolder({ title: "lines", expanded: true });
    lines.addInput(this.uniforms.uCut, "value", {
      min: 0,
      max: 1,
      step: 0.0001,
      label: "cutoff",
    });
  }

  debugScale() {
    const scale = this.debug.addFolder({ title: "scale", expanded: false });
    this.scale = 1;
    scale
      .addInput(this, "scale", {
        min: 0,
        max: 5,
        step: 0.001,
        label: "uniform",
      })
      .on("change", () => this.mesh.scale.setScalar(this.scale));
    scale.addInput(this.mesh.scale, "x", {
      min: 0,
      max: 5,
      step: 0.001,
    });
    scale.addInput(this.mesh.scale, "y", {
      min: 0,
      max: 5,
      step: 0.001,
    });
    scale.addInput(this.mesh.scale, "z", {
      min: 0,
      max: 5,
      step: 0.001,
    });
  }

  debugPosition() {
    const position = this.debug.addFolder({
      title: "position",
      expanded: false,
    });
    position.addInput(this.mesh.position, "x", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    position.addInput(this.mesh.position, "y", {
      min: -2,
      max: 2,
      step: 0.001,
    });
    position.addInput(this.mesh.position, "z", {
      min: -2,
      max: 2,
      step: 0.001,
    });
  }

  debugVertexDistortion() {
    const vertexDistortion = this.debug.addFolder({
      title: "vertex distortion",
      expanded: true,
    });
    vertexDistortion.addInput(this.uniforms.uVertexDistortionSpeed, "value", {
      min: 0,
      max: 1.5,
      step: 0.001,
      label: "speed",
    });
    vertexDistortion.addInput(
      this.uniforms.uVertexDistortionAmplitude,
      "value",
      {
        min: 0,
        max: 0.5,
        step: 0.001,
        label: "amplitude",
      }
    );
    vertexDistortion.addInput(this.uniforms.uBubblePos, "value", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "bubblePos",
    });
  }

  mapData(data, fn) {
    let ptr = 0;
    const p = new Vector3();
    for (let z = 0; z < this.size; z++) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          p.set(x / this.size - 0.5, y / this.size - 0.5, z / this.size - 0.5);
          data[ptr] = fn(p);
          ptr++;
        }
      }
    }
  }

  generateShape(shape) {
    switch (shape) {
      case "sphere":
        this.generateSphere();
        break;
      case "blob":
        this.generateBlob();
        break;
      case "goursat":
        this.generateGoursat();
        break;
      case "torus":
        this.generateTorus();
        break;
      case "hyperelliptic":
        this.generateHyperelliptic();
        break;
      case "torusKnot":
        this.generateTorusKnot();
        break;
      default:
        this.generateSphere();
        break;
    }
    this.shape.needsUpdate = true;
  }

  generateSphere() {
    this.mapData(this.shapeArray, (p) => {
      //   return 0.95 - p.length();
      return (0.9 - (1.25 * p.length() - 0.05)) * 1;
      // return 0.9 - (1.25 * p.length() - 0.05);
    });
  }

  generateBlob() {
    const r = 0.2;
    const spheres: any[] = [];

    const sdSphere = (p, r) => {
      return r - p.length();
    };

    const blur3d = (
      field,
      width = this.size,
      height = this.size,
      depth = this.size,
      intensity = 1
    ) => {
      const fieldCopy = field.slice();
      const size = width;
      const size2 = width * height;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          for (let z = 0; z < depth; z++) {
            const index = size2 * z + size * y + x;
            let val = fieldCopy[index];
            let count = 1;

            for (let x2 = -1; x2 <= 1; x2 += 2) {
              const x3 = x2 + x;
              if (x3 < 0 || x3 >= size) continue;

              for (let y2 = -1; y2 <= 1; y2 += 2) {
                const y3 = y2 + y;
                if (y3 < 0 || y3 >= size) continue;

                for (let z2 = -1; z2 <= 1; z2 += 2) {
                  const z3 = z2 + z;
                  if (z3 < 0 || z3 >= size) continue;

                  const index2 = size2 * z3 + size * y3 + x3;
                  const val2 = fieldCopy[index2];

                  count++;
                  val += (intensity * (val2 - val)) / count;
                }
              }
            }

            field[index] = val;
          }
        }
      }
    };

    for (let i = 0; i < 3; i++) {
      spheres.push({
        position: new Vector3(
          randFloat(-r, r),
          randFloat(-r, r),
          randFloat(-r, r)
        ),
        radius: randFloat(0.6, 0.7),
      });
    }
    this.mapData(this.shapeArray, (p) => {
      let res = 0;
      for (const sphere of spheres) {
        res = Math.max(
          res,
          sdSphere(p.clone().sub(sphere.position), sphere.radius)
        );
      }
      return res;
    });
    blur3d(this.shapeArray);
    blur3d(this.shapeArray);
    blur3d(this.shapeArray);
  }

  generateGoursat() {
    const Goursat = (p) => {
      return (
        Math.pow(p.x, 4) +
        Math.pow(p.y, 4) +
        Math.pow(p.z, 4) -
        1.5 * (p.x * p.x + p.y * p.y + p.z * p.z) +
        1
      );
    };
    this.mapData(this.shapeArray, (p) => {
      p.multiplyScalar(3.5);
      return 0.5 - Goursat(p);
    });
  }

  generateNoise() {
    const perlin = (x, y, z) => {
      return (0.5 + 0.5 * perlin3(x, y, z)) * 1;
      // return 0.5 + 0.5 * perlin3(x, y, z);
    };

    this.mapData(this.noiseArray, (p) => {
      p.multiplyScalar(this.noiseSeed.s);
      return perlin(
        p.x + this.noiseSeed.ox,
        p.y + this.noiseSeed.oy,
        p.z + this.noiseSeed.oz
      );
    });

    this.noise.needsUpdate = true;
  }

  generateTorus() {
    const sdTorus = (p, t) => {
      const pp = new Vector2(p.x, p.z);
      const q = new Vector2(pp.length() - t.x, p.y);
      return q.length() - t.y;
    };

    const t = new Vector2(3, 0.5);
    this.mapData(this.shapeArray, (p) => {
      p.multiplyScalar(10);
      return 1 - sdTorus(p, t);
    });
  }

  generateHyperelliptic() {
    const f = 6 * ~~randFloat(1, 10);

    const hyperelliptic = (p, f) => {
      return (
        Math.pow(
          Math.pow(p.x, f) + Math.pow(p.y, f) + Math.pow(p.z, f),
          1.0 / 6
        ) - 1.0
      );
    };
    this.mapData(this.shapeArray, (p) => {
      return 0.1 - hyperelliptic(p.multiplyScalar(3), f);
    });
  }

  generateTorusKnot() {
    const r1 = randFloat(1, 1.4);
    const r2 = randFloat(0.1, 0.6);
    const pf = Math.round(Math.random() * 4 * 2) / 2;
    const oy = Math.random() * 0.5;
    const s = Math.sign(randFloat(-1, 1));

    const rot2d = (v, a) => {
      const c = Math.cos(a);
      const s = Math.sin(a);
      return new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
    };

    const sdCircle = (p, r) => {
      return p.length() - r;
    };

    let shapeFn = (p) => sdCircle(p, r2);
    this.mapData(this.shapeArray, (p) => {
      p.multiplyScalar(5.2);
      const pp = new Vector2(p.x, p.z);
      const cp = new Vector2(pp.length() - r1, p.y);
      const a = s * Math.atan2(p.x, p.z);
      cp.copy(rot2d(cp, a * pf));
      cp.y = Math.abs(cp.y) - oy;
      let d = shapeFn(cp);
      return clamp(0.6 - d, 0, 1);
    });
  }

  onPointermove(mouse) {
    this.material.uniforms.uLightPosition.value.x = mouse.x;
    this.material.uniforms.uLightPosition.value.y = mouse.y - 0.22;
  }

  onPointerdown() {}

  onPointerup() {}

  onWheel() {}

  onResize() {}

  update() {
    this.mesh.material.uniforms.uTime.value = this.world.time;
  }
}
