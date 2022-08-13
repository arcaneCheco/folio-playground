export default class RotateAlert {
  constructor() {
    this.container = document.querySelector(".portraitAlert");
    this.animateWrapper = document.querySelector(".rotate_device_container");
  }

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
