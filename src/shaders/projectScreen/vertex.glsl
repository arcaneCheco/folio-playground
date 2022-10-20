uniform float uAspect;
uniform float uIsCurved;
uniform vec2 uvRate;

varying vec2 vUv;
varying vec2 vUv1;

void main() {
    vec3 newPos = position;
    newPos.z -= sin(uv.x * 3.1415) * (0.1 + uAspect * 0.1) * uIsCurved;
    newPos.y += 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
    vUv = uv;

    // vec2 uvRate = vec2(1., (16./9.) / uAspect);

    vec2 _uv = uv - 0.5;
    vUv1 = _uv;
    vUv1 *= uvRate;
    vUv1 += 0.5;
}