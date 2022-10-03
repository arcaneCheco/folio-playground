varying vec2 vUv;

void main() {
    vec3 newPos = position;
    newPos.x += 0.5;
    gl_Position = modelMatrix * vec4(newPos, 1.);
    vUv = uv;
}