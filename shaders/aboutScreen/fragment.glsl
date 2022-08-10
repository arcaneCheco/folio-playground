uniform sampler2D uTextMap;

varying vec2 vUv;

void main() {
    vec4 text = texture2D(uTextMap, vUv);
    gl_FragColor = text;
}