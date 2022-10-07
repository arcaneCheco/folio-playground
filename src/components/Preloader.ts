import { World } from "@src/app";

export class Preloader {
  world: World;
  percent: HTMLDivElement;
  container: HTMLDivElement;
  bar: HTMLHRElement;
  constructor() {
    this.world = new World();
    this.percent = document.querySelector(".preloader__percent")!;
    this.bar = document.querySelector(".preloader__progress__front")!;
    this.container = document.querySelector(".preloader")!;
  }

  onAssetLoaded(progress: number) {
    const val = `${Math.round(progress * 100)}%`;
    this.percent.innerText = val;
    this.bar.style.width = val;
    if (progress === 1) {
      this.destroy();
    }
  }

  destroy() {
    this.container.style.opacity = "0";
    window.setTimeout(() => {
      this.container.remove();
    }, 1000);
  }
}
