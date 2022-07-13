uniform sampler2D uHeightMap;

uniform vec3 uBaseColor;
uniform vec3 uFresnelColor;
uniform float uFresnelPower;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

void main() {
    vec4 i = texture2D(uHeightMap, vUv);
    gl_FragColor = vec4(0., 0., i.r, 1.);

    gl_FragColor = vec4(vWorldNormal, 1.);
    
    float fresnelFactor = abs(dot(vViewDirection, vWorldNormal));
    float inversefresnelFactor = 1.0 - fresnelFactor;

    fresnelFactor = pow(fresnelFactor, uFresnelPower);
    inversefresnelFactor = pow(inversefresnelFactor, uFresnelPower);
    gl_FragColor = vec4(fresnelFactor * uBaseColor + inversefresnelFactor * uFresnelColor, 1.);
}