varying vec2 vUv;

void main() {
gl_Position = vec4(position, 1.);
vUv = uv;
}