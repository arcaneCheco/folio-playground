uniform sampler2D uHeightMap;
uniform mat4 uTextureMatrix;

varying vec4 vMirrorCoord;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

float heightSample(vec2 st) {
    return texture2D(uHeightMap, st).x;
}

vec3 getNormal() {
    vec2 cellSize = 1. / vec2(RESOLUTION);
    vec3 e = vec3(cellSize, 0.);
    float unitResolution = RESOLUTION / BOUNDS;
    return  normalize(vec3(
					(heightSample(uv - e.xz) - heightSample(uv + e.xz)) * unitResolution,
                    (heightSample(uv - e.yz) - heightSample(uv + e.yz)) * unitResolution,
					SCALE));
}

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    vMirrorCoord = uTextureMatrix * worldPosition;

    vec3 objectNormal = getNormal();

    vWorldNormal = normalize(modelMatrix * vec4(objectNormal, 0.0)).xyz;
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    // vViewDirection = normalize(vec3(1., 1.74, -0.9) - worldPosition.xyz);

    float heightValue = heightSample(uv) * SCALE;
    vec3 newPos = vec3(position.x, position.y, heightValue);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
}