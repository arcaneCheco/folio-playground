uniform sampler2D uHeightMap;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

float mySample(vec2 st) {
    return texture2D(uHeightMap, st).x;
}


vec3 getNormal() {
    vec2 cellSize = 1. / vec2(RESOLUTION);
    vec3 e = vec3(cellSize, 0.);

    float unitResolution = RESOLUTION / BOUNDS;
    // unitResolution = 2. / RESOLUTION;

    return  normalize(vec3(
					(mySample(uv - e.xz) - mySample(uv + e.xz)) * unitResolution,
					SCALE,
					(mySample(uv - e.yz) - mySample(uv + e.yz)) * unitResolution));
}

void main() {
    vec3 objectNormal = getNormal();

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(modelMatrix * vec4(objectNormal, 0.0)).xyz;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    // vViewDirection = normalize(vec3(1., 1.74, -0.9) - worldPosition.xyz);

    float heightValue = texture2D(uHeightMap, uv).x * SCALE;
    vec3 newPos = vec3(position.x, heightValue, position.z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);

    vUv = uv;
}