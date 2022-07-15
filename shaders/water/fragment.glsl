uniform sampler2D uHeightMap;
uniform sampler2D uMirrorMap;

uniform vec3 uBaseColor;
uniform vec3 uFresnelColor;
uniform float uFresnelPower;

varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

float blendOverlay( float base, float blend ) {
    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

void main() {
    vec4 i = texture2D(uHeightMap, vUv);
    gl_FragColor = vec4(0., 0., i.r, 1.);

    gl_FragColor = vec4(vWorldNormal, 1.);
    
    float fresnelFactor = abs(dot(vViewDirection, vWorldNormal));
    float inversefresnelFactor = 1.0 - fresnelFactor;

    fresnelFactor = pow(fresnelFactor, uFresnelPower);
    inversefresnelFactor = pow(inversefresnelFactor, uFresnelPower);

    vec3 fresnel = fresnelFactor * uBaseColor + inversefresnelFactor * uFresnelColor;
    vec3 mirror = texture2D(uMirrorMap, vUv).xyz;

    vec3 color = mirror;
    gl_FragColor = vec4(color, 1.);

    // gl_FragColor = mix( gl_FragColor, vec4( texR.rgba), 0.4 );
}