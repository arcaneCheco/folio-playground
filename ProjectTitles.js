import * as THREE from "three";
import { World } from "./app";
import vertexShader from "./shaders/projectTitle/vertex.glsl";
import fragmentShader from "./shaders/projectTitle/fragment.glsl";
import { clamp } from "three/src/math/MathUtils";
import TextGeometry from "./TextGeometry";
import fontData from "./data/fonts/audiowide/Audiowide-Regular.json";

/**
 * not sure if to show titles-reflection yet
 */

export default class ProjectTitles {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.scroll = {
      current: 0,
      target: 0,
      active: false,
      limitTop: 0,
      limitBottom: 0,
    };
    this.gap = 0.5;
    this.active = 0;

    this.baseWidth = 5; // wolrd units

    this.group = new THREE.Group();
    this.outerGroup = new THREE.Group();
    this.outerGroup.add(this.group);
    this.group.renderOrder = 1000;
    this.initialScrollOffset = 1.5;
    // this.scroll.limitTop = -this.initialScrollOffset;

    this.outerGroup.rotation.y = Math.PI;
    // this.outerGroup.rotation.y = (Math.PI * 13) / 12;
    this.outerGroup.position.z = 0.3;

    this.meshes = [];

    this.fontData = fontData;
    this.fontTexture = this.world.textureLoader.load(
      "fonts/audiowide/Audiowide-Regular.ttf.png"
    );

    this.setMaterial();
  }

  setMaterial() {
    this.uniforms = {
      uColor: { value: new THREE.Vector3() },
      uProgress: { value: 0 },
      uMap: { value: this.fontTexture },
      uStroke: { value: 0.1 },
      uPadding: { value: 0.1 },
      uTime: { value: 0 },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
  }

  setDebug() {
    this.debug = this.world.pane.addFolder({
      title: "project titles",
      expanded: false,
    });
    this.stroke = 0.1;
    this.debug
      .addInput(this, "stroke", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "stroke",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uStroke.value = this.stroke)
        )
      );
    this.progress = 0;
    this.debug
      .addInput(this, "progress", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "progress",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uProgress.value = this.progress)
        )
      );
    this.padding = 0.1;
    this.debug
      .addInput(this, "padding", {
        min: 0,
        max: 1,
        step: 0.001,
        label: "padding",
      })
      .on("change", () =>
        this.meshes.map(
          (mesh) => (mesh.material.uniforms.uPadding.value = this.padding)
        )
      );

    this.debug
      .addInput(this, "gap", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", () => {
        this.setPositionsWithinGroup();
      });
    this.debug.addInput(this.outerGroup.position, "y", {
      min: 0,
      max: 1,
      step: 0.001,
      label: "outerGroup - posY",
    });
    this.debug.addInput(this.group.position, "x", {
      min: -4,
      max: 0,
      step: 0.001,
      label: "group - posX",
    });
  }

  setTextBoundingUv(textGeometry) {
    const count = textGeometry.attributes.uv.count;
    const bUvArray = new Float32Array(count * 2);
    const positions = textGeometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const posX = positions[i * 3];
      bUvArray[i * 2] = posX / this.baseWidth + 0.5;
      const posY = positions[i * 3 + 1];
      bUvArray[i * 2 + 1] = posY / textGeometry.height + 0.5;
    }
    textGeometry.setAttribute(
      "boundingUv",
      new THREE.BufferAttribute(bUvArray, 2)
    );
  }

  setTextGeometry(text) {
    const textG = new TextGeometry();
    textG.setText({
      font: this.fontData,
      text: text,
      align: "center",
      lineWidth: 5,
      lineHeight: 1,
    });

    textG.computeBoundingBox();

    const width = textG.boundingBox.max.x - textG.boundingBox.min.x;
    const height = textG.boundingBox.max.y - textG.boundingBox.min.y;
    const aspect = height / width;

    // center text mesh on yAxis
    const offset = height * 0.5 - textG.boundingBox.max.y;
    const offsetMatrix = new THREE.Matrix4().makeTranslation(0, offset, 0);
    textG.applyMatrix4(offsetMatrix);
    // make width uniform
    const scale = this.baseWidth / width;
    const scaleMatrix = new THREE.Matrix4().makeScale(scale, scale, 1);
    textG.applyMatrix4(scaleMatrix);

    textG.height = this.baseWidth * aspect;

    this.setTextBoundingUv(textG);

    return textG;
  }

  setMeshes2() {
    this.data.map(({ title, category }, index) => {
      const mat = this.material.clone();
      const geometry = this.setTextGeometry(title);
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.userData.index = index;
      mesh.userData.category = category;
      this.meshes.push(mesh);

      // const m = new THREE.Mesh(
      //   new THREE.PlaneGeometry(this.baseWidth, geometry.height),
      //   new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 })
      // );
      // mesh.add(m);
    });
  }

  setPositionsWithinGroup() {
    let currentOffset = 0;
    let limitOffset = 0;
    this.group.children.map((mesh, i) => {
      if (i === 0) {
        mesh.position.y = this.initialScrollOffset;
        mesh.userData.scrollPosition = mesh.position.y;
        currentOffset += mesh.geometry.height / 2 + this.gap;
      } else {
        mesh.position.y =
          -(currentOffset + mesh.geometry.height / 2) +
          this.initialScrollOffset;
        mesh.userData.scrollPosition = mesh.position.y;
        limitOffset = -mesh.position.y; // only need position of last item in list
        currentOffset += mesh.geometry.height + this.gap;
      }
    });

    // this.scroll.limitBottom = limitOffset - this.initialScrollOffset;
    this.scroll.limitBottom = limitOffset;
    this.group.position.y = 0;
  }

  onWheel(deltaY) {
    let newPosition = this.group.position.y + deltaY * 0.01;
    newPosition = clamp(
      newPosition,
      this.scroll.limitTop,
      this.scroll.limitBottom
    );

    const diff = Math.abs(newPosition - this.group.position.y);
    // this.outerGroup.rotation.x = -3 * Math.sqrt(diff) * 0.44613;
    // this.outerGroup.rotation.z = 3 * Math.sqrt(diff) * 0.217449;
    // if (Math.abs(diff) < 0.012) {
    //   this.scroll.active = false;
    //   GSAP.to(this.outerGroup.rotation, {
    //     x: 0,
    //     y: 0.5235987755982988,
    //     z: 0,
    //     duration: 1,
    //   });
    //   return;
    // }
    // if (!this.scroll.active) {
    //   GSAP.to(this.outerGroup.rotation, {
    //     x: -0.4461313914223183,
    //     y: 0.4801810588538978,
    //     z: 0.21744900405528222,
    //     duration: 1,
    //   });
    // }
    this.group.position.y = newPosition;
  }

  onResize(sizes) {
    this.outerGroup.scale.set(sizes.scale, sizes.scale, 1);
    this.group.position.x = sizes.posX;
  }

  update() {
    this.group.children.map(
      (mesh) => (mesh.material.uniforms.uTime.value = this.world.time)
    );
  }
}
