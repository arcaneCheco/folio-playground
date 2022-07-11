uniform vec2 uResolution;

// waves
uniform sampler2D uHeightMap;
uniform float uAmplitude;
uniform float uOffset;

varying vec2 vUv;

void main() {
    // float heightValue = texture2D(uHeightMap, uv + uOffset).x * uAmplitude - uAmplitude;
    // heightValue *= n;
    // vec3 newPos = position;
    // newPos.z = heightValue;
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    // gl_Position = vec4(position, 1.);

    vUv = uv;
}