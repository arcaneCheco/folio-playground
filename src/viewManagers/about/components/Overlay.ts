import { Group } from "three";
import { SocialIcons, Nav, Footer } from ".";
import { _AboutOverlay } from "@types";

export class Overlay implements _AboutOverlay {
  // @ts-ignore 
  socialIcons = new SocialIcons();
  footer = new Footer();
  nav = new Nav();
  group = new Group();
  constructor() {
    this.group.add(this.socialIcons.group);
    this.group.add(this.footer.group);
    this.group.add(this.nav.group);
  }

  onResize() {
    this.nav.onResize();
    this.socialIcons.onResize();
    this.footer.onResize();
  }
}
