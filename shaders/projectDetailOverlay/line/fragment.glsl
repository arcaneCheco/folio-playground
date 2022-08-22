uniform float uLineThickness;
uniform float uLengthBottom;
uniform float uLengthCorner;
uniform float uCenterGap;
uniform float uLengthTop;
uniform vec2 uResolution;
uniform float uScale;

varying vec2 vUv;

void main() {
    vec2 halfSize = 0.5 * uResolution;

    vec2 st = (vUv) * uResolution;

    vec2 nt = (vUv - 0.5) * uResolution;

    float strength = step(halfSize.x - uLengthBottom, abs(nt.x)) * step(st.y, uLineThickness);

    float corner = step(halfSize.x - uLengthCorner, abs(nt.x)) * step(uResolution.y - uLineThickness, st.y);
    corner += step(halfSize.x - uLineThickness, abs(nt.x)) * step(uResolution.y - uLengthCorner, st.y);
    strength += corner;

    float topLine = step(uCenterGap, abs(nt.x)) * step(abs(nt.x), uCenterGap + uLengthTop) * step(uResolution.y - uLineThickness, st.y);

    strength += topLine;

    vec3 col = vec3 (1.);

    gl_FragColor = vec4(col, strength);
    // gl_FragColor.a += 0.5;
}