uniform mat4 uMirrorMatrix;

varying vec4 vMirrorCoord;

void main() {
    vMirrorCoord = uMirrorMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}