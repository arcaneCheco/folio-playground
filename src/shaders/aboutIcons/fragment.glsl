uniform sampler2D uMap;

varying vec2 vUv;

void main() {
    vec4 icon = texture2D(uMap, vUv);
    gl_FragColor = icon;
}