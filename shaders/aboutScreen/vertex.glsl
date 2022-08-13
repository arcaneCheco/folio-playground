varying vec2 vUv;

void main() {
    vec3 newPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
    vUv = uv;
}