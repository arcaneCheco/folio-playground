import { Group, Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { World } from "@src/app";
import { _AboutFooter } from "@types";
import TextGeometry from "@utils/TextGeometry";
import vertexShader from "@shaders/aboutFooter/text/vertex.glsl";
import fragmentShader from "@shaders/aboutFooter/text/fragment.glsl";
import vertexIcons from "@shaders/aboutFooter/icons/vertex.glsl";
import fragmentIcons from "@shaders/aboutFooter/icons/fragment.glsl";
import vertexLine from "@shaders/aboutFooter/line/vertex.glsl";
import fragmentLine from "@shaders/aboutFooter/line/fragment.glsl";

export class Footer implements _AboutFooter {
  world = new World();
  font = this.world.resources.fonts.audiowideRegular;
  group = new Group();
  textMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tMap: { value: this.font.map },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  iconGeometry = new PlaneGeometry(1, 1);
  iconMaterial = new ShaderMaterial({
    vertexShader: vertexIcons,
    fragmentShader: fragmentIcons,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    uniforms: {
      uMap: { value: null },
    },
  });
  locationGroup = new Group();
  location = new Mesh(new TextGeometry(), this.textMaterial);
  locationIcon = new Mesh(this.iconGeometry, this.iconMaterial.clone());
  cvGroup = new Group();
  cv = new Mesh(new TextGeometry(), this.textMaterial);
  cvIcon = new Mesh(this.iconGeometry, this.iconMaterial.clone());
  emailGroup = new Group();
  email = new Mesh(new TextGeometry(), this.textMaterial);
  emailIcon = new Mesh(this.iconGeometry, this.iconMaterial.clone());
  line: Mesh;
  constructor() {
    this.group.renderOrder = 6001;

    this.group.add(this.locationGroup);
    this.group.add(this.cvGroup);
    this.group.add(this.emailGroup);

    this.locationGroup.add(this.location);
    this.locationGroup.add(this.locationIcon);

    this.cvGroup.add(this.cv);
    this.cvGroup.add(this.cvIcon);

    this.emailGroup.add(this.email);
    this.emailGroup.add(this.emailIcon);

    const { pinIcon, cvIcon, emailIcon } = this.world.resources.assets;

    this.location.geometry.setText({
      fontData: this.font.data,
      text: "London, UK",
    });
    this.locationIcon.material.uniforms.uMap.value = pinIcon;

    this.cv.geometry.setText({
      fontData: this.font.data,
      text: "curriculum vitae",
    });
    this.cvIcon.material.uniforms.uMap.value = cvIcon;
    this.cv.name = "cv";
    this.cvIcon.name = "cv";

    this.email.geometry.setText({
      fontData: this.font.data,
      text: "sergio@azizi.dev",
    });
    this.emailIcon.material.uniforms.uMap.value = emailIcon;
    this.email.name = "email";
    this.emailIcon.name = "email";

    this.line = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: vertexLine,
        fragmentShader: fragmentLine,
      })
    );
    this.group.add(this.line);
  }

  onResize() {
    let aspect = window.innerWidth / window.innerHeight;

    let groupScaleX = 30 / window.innerWidth;
    let groupScaleY = groupScaleX * aspect;
    this.group.scale.set(groupScaleX, groupScaleY, 1);
    this.group.position.y = -1 + groupScaleY / 2 + 50 / window.innerHeight;

    let iconScale = 2;
    this.cvIcon.position.x = -0.7 * iconScale;
    this.cvIcon.scale.set(iconScale, iconScale, 1);
    this.cvGroup.position.x = -10;
    this.cvGroup.position.y = 0.25 * iconScale;

    this.line.position.y = 0.25 * iconScale;
    this.line.scale.set(0.2, 2, 1);

    this.emailIcon.position.x = -0.7 * iconScale;
    this.emailIcon.scale.set(iconScale, iconScale, 1);
    this.emailGroup.position.x = 3;
    this.emailGroup.position.y = 0.25 * iconScale;

    this.locationIcon.position.x = -0.7 * iconScale;
    this.locationIcon.scale.set(iconScale, iconScale, 1);
    this.locationGroup.position.x = Math.min(window.innerWidth / 50, 30);
    // this.locationGroup.position.x = 15 + aspect * 2.5;
    this.locationGroup.scale.set(0.7, 0.7, 1);
    // this.cvGroup.position.y = 0.25 * iconScale;

    // this.locationGroup.position.x = 8;

    // this.locationIcon.position.x = -7;
    // this.locationIcon.scale.multiplyScalar(2);

    // this.cvGroup.position.x = -8;

    // this.cvIcon.position.x = -7;
    // this.cvIcon.scale.multiplyScalar(2);
  }
}
