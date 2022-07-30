varying vec2 vUv;
varying vec3 vColor;

void main() {
    gl_Position = modelMatrix * instanceMatrix * vec4(position, 1.);
    vUv = uv;
    vColor = instanceColor.xyz;
}