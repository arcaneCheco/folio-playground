import * as THREE from "three";
import { SocialIcons, Nav, Footer } from ".";

export class Overlay {
  socialIcons = new SocialIcons();
  footer = new Footer();
  nav = new Nav();
  group = new THREE.Group();
  constructor() {
    this.group.add(this.socialIcons.group);
    this.group.add(this.footer.group);
    this.group.add(this.nav.group);
  }

  onPreloaded({
    twitterIcon,
    githubIcon,
    linkedinIcon,
    cvIcon,
    pinIcon,
    emailIcon,
    font,
  }) {
    this.socialIcons.onPreloaded({ twitterIcon, githubIcon, linkedinIcon });
    this.nav.onPreloaded(font);
    this.footer.onPreloaded({ font, cvIcon, pinIcon, emailIcon });
  }

  onResize() {
    this.nav.onResize();
    this.socialIcons.onResize();
    this.footer.onResize();
  }
}
