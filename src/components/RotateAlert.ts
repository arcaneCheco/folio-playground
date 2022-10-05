export class RotateAlert {
  container = document.querySelector(".portraitAlert")!;
  animateWrapper = document.querySelector(".rotate_device_container")!;
  isActive: any;
  constructor() {}

  onResize(aspect) {
    aspect < 1 ? this.activate() : this.deactivate();
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;
    this.container.classList.add("visible");
    this.animateWrapper.classList.add("active");
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.container.classList.remove("visible");
    this.animateWrapper.classList.remove("active");
  }
}
