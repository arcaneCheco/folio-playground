import { Texture, TextureLoader, VideoTexture } from "three";
import { Font, Project, _Resources } from "@types";
import { World } from "@src/app";

export class Resources implements _Resources {
  world = new World();
  textureLoader = new TextureLoader();
  assetsLoaded = 0;
  progress = 0;
  preloader = this.world.preloader;
  projects: Array<Project> = [];
  numAssets =
    window.PROJECTS.length +
    Object.keys(window.ASSETS).length +
    Object.keys(window.FONTS).length;
  fonts: Record<string, Font>;
  assets: Record<string, Texture>;

  onAssetLoaded() {
    this.assetsLoaded++;
    this.progress = this.assetsLoaded / this.numAssets;
    this.preloader.onAssetLoaded(this.progress);
  }

  async loadProjects() {
    const videoContainer = document.querySelector(".vids")!;

    return new Promise<void>((resolve) => {
      this.projects = window.PROJECTS.map((entry) => {
        const element = document.createElement("video");
        videoContainer.appendChild(element);
        element.muted = true;
        element.src = entry.source;
        element.autoplay = true;
        element.playsInline = true;
        element.crossOrigin = "anonymous";
        element.width = 500;
        element.height = 500;
        element.loop = true;
        element.style.objectFit = "contain";
        element.play();

        const texture = new VideoTexture(element);

        this.onAssetLoaded();

        return {
          ...entry,
          texture,
        };
      }).sort((a, b) => a.index - b.index);
      resolve();
    });
  }

  async loadFonts() {
    this.fonts = {};
    let numFonts = Object.keys(window.FONTS).length;
    let fontsLoaded = 0;
    return new Promise<void>((resolve) => {
      Object.entries(window.FONTS).map(([name, { map, data }]) => {
        this.textureLoader.load(map, (texture) => {
          this.fonts[name] = {
            data: data,
            map: texture,
          };
          this.onAssetLoaded();
          fontsLoaded++;
          if (fontsLoaded === numFonts) {
            resolve();
          }
        });
      });
    });
  }

  async loadAssets() {
    this.assets = {};
    let numAssets = Object.keys(window.ASSETS).length;
    let assetsLoaded = 0;
    return new Promise<void>((resolve) => {
      Object.entries(window.ASSETS).map(([name, url]) => {
        this.textureLoader.load(url, (texture) => {
          this.assets[name] = texture;
          this.onAssetLoaded();
          assetsLoaded++;
          if (assetsLoaded === numAssets) {
            resolve();
          }
        });
      });
    });
  }

  async load() {
    await Promise.all([
      this.loadProjects(),
      this.loadAssets(),
      this.loadFonts(),
    ]);
  }
}
