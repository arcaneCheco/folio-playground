import { World } from "./app";
import data from "./data.json";
import * as THREE from "three";

export default class Resources {
  constructor() {
    this.world = new World();
    this.textureLoader = new THREE.TextureLoader();
    this.rawData = data;
    this.numAssets = this.rawData.projects.length;
    this.assetsLoaded = 0;
    this.projects = [];
  }

  async load() {
    return new Promise((finish) => {
      this.rawData.projects.map((entry) => {
        return new Promise((resolve) => {
          const path = "/projects-".concat(
            entry.title.toLowerCase().split(" ").join("-").replaceAll(".", "")
          );
          this.textureLoader.load(entry.src, (texture) => {
            this.assetsLoaded++;
            this.progress = this.assetsLoaded / this.numAssets;
            this.projects.push({
              ...entry,
              texture,
              path,
            });
            resolve();
            if (this.progress === 1) {
              finish(null);
            }
          });
        });
      });
    });
  }
}
