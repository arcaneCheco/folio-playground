uniform float uAspect;

varying vec2 vUv;

void main() {
    vec3 newPos = position;
    newPos.z -= sin(uv.x * 3.1415) * (0.1 + uAspect * 0.1);
    newPos.y += 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
    vUv = uv;
}