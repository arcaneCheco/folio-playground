uniform float uTime;

varying vec2 vUv;
varying float vProgress;

void main() {
    vec3 pos = position;
    pos.x += 0.2;

    float amp = .4;
    float duration = 3.;
    float p = mod(uTime, duration) / duration;

    // linear
    // float progress = min(2. * p, 2. * (1. - p));

    float progress = pow(sin(p * 3.1415), 2.);
    progress = max(progress, 0.);
    pos.x += amp * progress;
    gl_Position = modelMatrix * vec4(pos, 1.);
    vUv = uv;

    vProgress = p;
}