import * as THREE from "three";
import { World } from "./app";

export default class AboutOverlay {
  constructor() {
    this.world = new World();
    this.aboutSocialIcons = this.world.aboutSocialIcons;
    this.aboutFooter = this.world.aboutFooter;
    this.aboutNav = this.world.aboutNav;
    this.group = new THREE.Group();
    this.group.add(this.aboutSocialIcons.group);
    this.group.add(this.aboutFooter.group);
    this.group.add(this.aboutNav.group);
  }
}
