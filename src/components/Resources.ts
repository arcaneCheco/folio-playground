import { World } from "../app";
import * as THREE from "three";

interface FontChar {
  char: string;
  chnl: number;
  height: number;
  id: number;
  index: number;
  page: number;
  width: number;
  x: number;
  xadvance: number;
  xoffset: number;
  y: number;
  yoffset: number;
}

interface FontCommon {
  alphaChnl: number;
  base: number;
  blueChnl: number;
  greenChnl: number;
  lineHeight: number;
  packed: number;
  pages: number;
  redChnl: number;
  scaleH: number;
  scaleW: number;
}

interface FontInfo {
  aa: number;
  bold: number;
  charset: Array<string>;
  face: string;
  italic: number;
  padding: Array<number>;
  size: number;
  smooth: number;
  spacing: Array<number>;
  stretchH: number;
  unicode: number;
}

interface FontKerning {
  first: number;
  second: number;
  amount: number;
}

export interface FontData {
  chars: Array<FontChar>;
  common: FontCommon;
  distanceFiled: {
    distanceRange: number;
    fieldType: string;
  };
  info: FontInfo;
  kernings: Array<FontKerning>;
  pages: Array<string>;
}

export class Resources {
  world = new World();
  textureLoader = new THREE.TextureLoader();
  numAssets = 0;
  assetsLoaded = 0;
  projects: {
    category: string;
    demo: string;
    path: string;
    source: string;
    texture: THREE.VideoTexture;
    title: string;
  }[] = [];
  progress: number;
  fonts: { [name: string]: { map: THREE.Texture; data: any } };
  assets: { [name: string]: THREE.Texture };
  constructor() {
    this.numAssets =
      window.PROJECTS.length +
      Object.keys(window.ASSETS).length +
      Object.keys(window.FONTS).length;
  }

  onAssetLoaded() {
    this.assetsLoaded++;
    this.progress = this.assetsLoaded / this.numAssets;
    console.log({ progress: this.progress });
  }

  async loadProjects() {
    const videoContainer = document.querySelector(".vids")!;

    return new Promise<void>((resolve) => {
      this.projects = window.PROJECTS.map((entry) => {
        const path = "/projects/".concat(
          entry.title.toLowerCase().split(" ").join("-").replaceAll(".", "")
        );
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

        const texture = new THREE.VideoTexture(element);

        this.onAssetLoaded();

        return {
          ...entry,
          texture,
          path,
        };
      });
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
