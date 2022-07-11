
// uniform vec3 uCameraPos;
// varying vec3 vOrigin;
// varying vec3 vDirection;
varying vec3 vWorldPosition;
varying vec2 vUv;
void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    // gl_Position.z = gl_Position.w; // set z to camera.far;
    vUv = uv;// - vec2(0.5);

    // vPosition = position;
    // vOrigin = vec3(inverse(modelMatrix) * vec4(uCameraPos, 1.)).xyz;
    // vDirection = position - vOrigin;
}