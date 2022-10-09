import { Color } from "three";
import { clamp } from "three/src/math/MathUtils";
import { Palette } from "./palettes";

const mix = (x: number, y: number, r: number) => {
  return r * x + (1 - r) * y;
};

class GradientLinear {
  colors: Array<Color>;
  constructor(colors: Palette) {
    this.colors = colors.map((c) => new Color(c));
  }
  getAt(t: number) {
    t = clamp(t, 0, 1);
    const from = Math.floor(t * this.colors.length * 0.9999);
    const to = clamp(from + 1, 0, this.colors.length - 1);
    const fc = this.colors[from];
    const ft = this.colors[to];
    const p = (t - from / this.colors.length) / (1 / this.colors.length);
    const res = new Color();
    res.r = mix(fc.r, ft.r, p);
    res.g = mix(fc.g, ft.g, p);
    res.b = mix(fc.b, ft.b, p);
    return res;
  }
}

export { GradientLinear };
