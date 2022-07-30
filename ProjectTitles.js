import * as THREE from "three";
import { World } from "./app";
import vertexShader from "./shaders/projectTitle/vertex.glsl";
import fragmentShader from "./shaders/projectTitle/fragment.glsl";
import { clamp } from "three/src/math/MathUtils";
import GSAP from "gsap";
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
    this.gap = 0.2;
    this.active = 0;
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
  }

  meshHelper(mesh) {
    // const box = new THREE.BoxHelper(mesh, 0xff0000);
    // mesh.add(box);
    // console.log(box);
    const t = new THREE.Mesh(
      new THREE.PlaneGeometry(
        mesh.geometry.worldWidth,
        mesh.geometry.worldHeight
      ),
      new THREE.MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      })
    );
    mesh.add(t);
    console.log(mesh);
  }

  setTextGeometry(text) {
    const textG = new TextGeometry();
    textG.setText({
      font: this.fontData,
      text: text,
      align: "center",
      lineWidth: 1,
      lineHeight: 1,
    });

    // scale text mesh
    const s = this.baseWidth / textG.text.width;
    const dummy = new THREE.Matrix4().makeScale(s, s, 1);
    textG.applyMatrix4(dummy);

    textG.computeBoundingBox();
    textG.worldWidth = textG.boundingBox.max.x - textG.boundingBox.min.x;
    textG.worldHeight = textG.boundingBox.max.y - textG.boundingBox.min.y;

    // center text mesh on yAxis
    const offset = textG.worldHeight / 2 - textG.boundingBox.max.y;
    const dummy3 = new THREE.Matrix4().makeTranslation(0, offset, 0);
    textG.applyMatrix4(dummy3);

    // bounding uv's
    const count = textG.attributes.uv.count;
    const bUvArray = new Float32Array(count * 2);
    const positions = textG.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const posX = positions[i * 3];
      bUvArray[i * 2] = posX / textG.worldWidth + 0.5;

      //
      const posY = positions[i * 3 + 1];
      bUvArray[i * 2 + 1] = posY / textG.worldHeight + 0.5;
    }
    textG.setAttribute("boundingUv", new THREE.BufferAttribute(bUvArray, 2));
    // console.log({
    //   worldWidth: textG.worldWidth,
    //   worldHeight: textG.worldHeight,
    //   uvs: textG.attributes.uv.array,
    //   pos: textG.attributes.position.array,
    // });

    return textG;
  }

  setMeshes2() {
    this.group = new THREE.Group();
    this.outerGroup = new THREE.Group();
    this.outerGroup.add(this.group);
    this.meshes = [];

    this.baseWidth = 3.5; // wolrd units
    this.fontData = fontData;
    this.fontTexture = this.world.textureLoader.load(
      "fonts/audiowide/Audiowide-Regular.ttf.png"
    );

    this.uniforms = {
      uColor: { value: new THREE.Vector3() },
      uActive: { value: false },
      uMap: { value: this.fontTexture },
      uStroke: { value: 0.1 },
      uPadding: { value: 0.1 },
      uTime: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.titles.map(({ title, category, color }, index) => {
      const mat = material.clone();
      const geometry = this.setTextGeometry(title);
      const mesh = new THREE.Mesh(geometry, mat);
      mat.uniforms.uColor.value = color;
      mesh.userData.index = index;
      mesh.userData.category = category;
      this.meshes.push(mesh);
      // this.meshHelper(mesh);
    });
  }

  setPositionsWithinGroup() {
    let currentOffset = 0;
    let limitOffset = 0;
    this.group.children.map((mesh, i) => {
      if (i === 0) {
        mesh.position.y = 0;
        mesh.userData.scrollPosition = 0;
        currentOffset = mesh.geometry.worldHeight / 2 + this.gap;
      } else {
        mesh.position.y = -(currentOffset + mesh.geometry.worldHeight / 2);
        mesh.userData.scrollPosition = mesh.position.y;
        limitOffset = -mesh.position.y; // only need position of last item in list
        currentOffset += mesh.geometry.worldHeight + this.gap;
      }
    });

    this.scroll.limitBottom = limitOffset;
    this.onActiveChange(this.group.children[0].userData.index);
    this.group.position.y = 0;
  }

  setGroupPosition() {
    this.outerGroup.scale.setScalar(0.2);
    this.outerGroup.rotateY(Math.PI / 8);
    this.outerGroup.rotateX(-Math.PI / 6);

    // this.outerGroup.rotateY(Math.PI / 6);
    // this.outerGroup.rotateX(-Math.PI / 8);
    // this.outerGroup.rotation.set(
    //   -0.4461313914223183,
    //   0.4801810588538978,
    //   0.21744900405528222
    // ); // equivalent of above two lines
    // this.outerGroup.rotation.y = 0.5235987755982988;
    /////

    this.outerGroup.position.y = 0.2;
    this.outerGroup.position.z = 0.5;
    this.group.position.x = -1;
  }

  onActiveChange(activeProject) {
    // this.group.position.y = -this.meshes[activeProject].userData.scrollPosition;
    this.meshes[this.active].material.uniforms.uActive.value = false;
    this.meshes[activeProject].material.uniforms.uActive.value = true;
    this.active = activeProject;
  }

  onWheel(deltaY) {
    // console.log(deltaY);
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

  update() {
    this.group.children.map(
      (mesh) => (mesh.material.uniforms.uTime.value = this.world.time)
    );
    // this.uniforms.uTime.value = this.world.time;
  }
}
