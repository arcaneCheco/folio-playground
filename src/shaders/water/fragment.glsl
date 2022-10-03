uniform sampler2D uMirrorMap;
uniform vec3 uBaseColor;
uniform vec3 uFresnelColor;
uniform float uFresnelPower;

varying vec4 vMirrorCoord;
varying vec3 vWorldNormal;
varying vec3 vViewDirection;

// void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
//     vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
//     float direction = max( 0.0, dot( eyeDirection, reflection ) );
//     specularColor += pow( direction, shiny ) * sunColor * spec;
//     diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
// }

float blendOverlay( float base, float blend ) {
    return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
    return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

void main() {
    vec3 mirrorSample = vec3( texture2D( uMirrorMap, vMirrorCoord.xy / vMirrorCoord.w ) );

    float fresnelFactor = abs(dot(vViewDirection, vWorldNormal));
    float inversefresnelFactor = 1.0 - fresnelFactor;

    fresnelFactor = pow(fresnelFactor, uFresnelPower);
    inversefresnelFactor = pow(inversefresnelFactor, uFresnelPower);

    vec3 fresnel = fresnelFactor * uBaseColor + inversefresnelFactor * uFresnelColor;

    vec3 color = blendOverlay(fresnel, mirrorSample);

    gl_FragColor = vec4(color, 1.);
}