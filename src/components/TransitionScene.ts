import {
  IUniform,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
} from "three";
import vertexShader from "@shaders/post/vertex.glsl";
import { _TransitionScene } from "@types";

interface Props {
  geometry: PlaneGeometry;
  shader: string;
  options?: Record<string, any>;
}

export class TransitionScene extends Scene implements _TransitionScene {
  uniforms: Record<string, IUniform> = {
    uScreen: { value: null },
    uProgress: { value: 0 },
  };

  constructor({ geometry, shader, options }: Props) {
    super();

    options &&
      Object.entries(options).map(([name, value]) => {
        this.uniforms[name] = { value };
      });

    let material = new ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: shader,
    });

    let mesh = new Mesh(geometry, material);

    this.add(mesh);
  }

  updateScreen(texture: Texture) {
    this.uniforms.uScreen.value = texture;
  }
}
