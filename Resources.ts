import { World } from "./app";
import data from "./data.json";
import * as THREE from "three";

export default class Resources {
  world = new World();
  textureLoader = new THREE.TextureLoader();
  rawData = data;
  numAssets = this.rawData.projects.length;
  assetsLoaded = 0;
  projects: any[] = [];
  progress: any;
  constructor() {}

  async load() {
    return new Promise((finish) => {
      this.rawData.projects.map((entry) => {
        return new Promise<void>((resolve) => {
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
