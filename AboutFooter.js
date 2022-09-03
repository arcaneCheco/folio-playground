import * as THREE from "three";
import TextGeometry from "./TextGeometry";
import font from "./data/fonts/audiowide/Audiowide-Regular.json";
import fontMap from "./data/fonts/audiowide/Audiowide-Regular.ttf.png";
import vertexShader from "./shaders/aboutFooter/text/vertex.glsl";
import fragmentShader from "./shaders/aboutFooter/text/fragment.glsl";
import pinSrc from "./data/images/icons/pin.png";
import cvSrc from "./data/images/icons/cv.png";
import emailSrc from "./data/images/icons/email.png";

export default class AboutFooter {
  constructor() {
    this.group = new THREE.Group();
    this.group.renderOrder = 6001;

    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: new THREE.TextureLoader().load(fontMap) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    this.loader = new THREE.TextureLoader();

    this.iconGeometry = new THREE.PlaneGeometry(1, 1);
    this.iconMaterial = new THREE.ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;

      void main() {
        gl_Position = modelMatrix * vec4(position, 1.);
        vUv = uv;
      }`,
      fragmentShader: `
      uniform sampler2D uMap;
      varying vec2 vUv;

      void main() {
        vec4 icon = texture2D(uMap, vUv);
        gl_FragColor = icon;
      }`,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      uniforms: {
        uMap: { value: null },
      },
    });

    this.locationGroup = new THREE.Group();
    this.group.add(this.locationGroup);

    let locationGeometry = new TextGeometry();
    locationGeometry.setText({
      font,
      text: "London, UK",
      align: "left",
    });

    this.location = new THREE.Mesh(locationGeometry, this.textMaterial);
    this.locationGroup.add(this.location);

    this.locationIcon = new THREE.Mesh(
      this.iconGeometry,
      this.iconMaterial.clone()
    );
    this.locationIcon.material.uniforms.uMap.value = this.loader.load(pinSrc);
    this.locationGroup.add(this.locationIcon);

    this.cvGroup = new THREE.Group();
    this.group.add(this.cvGroup);

    let cvGeometry = new TextGeometry();
    cvGeometry.setText({
      font,
      text: "curriculum vitae",
      align: "left",
    });

    this.cv = new THREE.Mesh(cvGeometry, this.textMaterial);
    this.cv.name = "cv";
    this.cvGroup.add(this.cv);

    this.cvIcon = new THREE.Mesh(this.iconGeometry, this.iconMaterial.clone());
    this.cvIcon.material.uniforms.uMap.value = this.loader.load(cvSrc);
    this.cvIcon.name = "cv";
    this.cvGroup.add(this.cvIcon);

    this.emailGroup = new THREE.Group();
    this.group.add(this.emailGroup);

    let emailGeometry = new TextGeometry();
    emailGeometry.setText({
      font,
      text: "sergio@azizi.dev",
      align: "left",
    });

    this.email = new THREE.Mesh(emailGeometry, this.textMaterial);
    this.email.name = "email";
    this.emailGroup.add(this.email);

    this.emailIcon = new THREE.Mesh(
      this.iconGeometry,
      this.iconMaterial.clone()
    );
    this.emailIcon.material.uniforms.uMap.value = this.loader.load(emailSrc);
    this.emailIcon.name = "email";
    this.emailGroup.add(this.emailIcon);

    this.lineG = new THREE.PlaneGeometry(1, 1);
    this.lineM = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = modelMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1.);
        }
      `,
    });
    this.line = new THREE.Mesh(this.lineG, this.lineM);
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
