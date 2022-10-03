uniform sampler2D uScreen;
uniform float uProgress;
uniform float uSize;
uniform float uZoom;
uniform float uColorSeparation;
varying vec2 vUv;

void main() {

    float inv = 1.0 - uProgress;
    vec2 disp = uSize * vec2(cos(uZoom * vUv.x), sin(uZoom * vUv.y));
    vec4 texTo = texture2D(uScreen, vUv + inv * disp);
    vec4 texFrom = vec4(
        texture2D(uScreen, vUv + uProgress * disp * (1.0 - uColorSeparation)).r,
        texture2D(uScreen, vUv + uProgress * disp).g,
        texture2D(uScreen, vUv + uProgress * disp * (1.0 + uColorSeparation)).b,
        1.0
    );
    gl_FragColor = texTo * uProgress + texFrom * inv;

    // vec4 base = texture2D(uScreen, vUv);
    // gl_FragColor = base;
}