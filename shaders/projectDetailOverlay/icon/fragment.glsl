uniform sampler2D uIcon;

varying vec2 vUv;

void main() {
    vec4 icon = texture2D(uIcon, vUv);
    gl_FragColor = icon;
}