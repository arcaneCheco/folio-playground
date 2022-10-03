import * as THREE from "three";
import { World } from "../app";

export default class AboutOverlay {
  world = new World();
  aboutSocialIcons = this.world.aboutSocialIcons;
  aboutFooter = this.world.aboutFooter;
  aboutNav = this.world.aboutNav;
  group = new THREE.Group();
  constructor() {
    this.group.add(this.aboutSocialIcons.group);
    this.group.add(this.aboutFooter.group);
    this.group.add(this.aboutNav.group);
  }

  onResize() {
    this.aboutNav.onResize();
    this.aboutSocialIcons.onResize();
    this.aboutFooter.onResize();
  }
}
