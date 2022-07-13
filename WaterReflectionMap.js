import { Reflector } from "three/examples/jsm/objects/Reflector";

export default class WaterReflectionMap extends Reflector {
  constructor(geometry) {
    super(geometry, {
      textureHeight: 128,
      textureWidth: 128,
      // color,
      // shader,
      // multisample
    });

    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }
}
