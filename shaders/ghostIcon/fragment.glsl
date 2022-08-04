uniform sampler2D uMap;

varying vec2 vUv;
varying float vProgress;

void main() {
    vec2 nUv = vUv;
    nUv.x = mix(nUv.x, 1. - nUv.x, step(vProgress, 0.49));
    float fill = texture2D(uMap, nUv).a;
    gl_FragColor = vec4(vec3(1.), fill +0. );
}