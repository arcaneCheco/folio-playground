uniform sampler2D uBuffer;
uniform vec2 uMouse;
uniform float uAddWave;
uniform float uViscosity;
uniform float uMouseSize;
uniform float uAmplitude;

varying vec2 vUv;

vec4 waves2() {
    vec2 cellSize = 1.0 /vec2(RESOLUTION);
    vec3 e = vec3(cellSize, 0.);

    vec4 heightmapValue = texture2D(uBuffer, vUv);

    float t = texture2D(uBuffer, vUv-e.zy).x;
    float r = texture2D(uBuffer, vUv-e.xz).x;
    float b = texture2D(uBuffer, vUv+e.xz).x;
    float l = texture2D(uBuffer, vUv+e.zy).x;

    float newHeight = ( ( t + b + r +l ) * 0.5 - heightmapValue.y ) * uViscosity;

    float mouseSize = uMouseSize / BOUNDS;
    float mousePhase = clamp( length( vUv - uMouse ) * PI / mouseSize, 0.0, PI );

    newHeight += uAddWave * (( cos( mousePhase ) + 1.0 )) * uAmplitude;

    heightmapValue.y = heightmapValue.x;
    heightmapValue.x = newHeight;

    return heightmapValue;
}

void main() {
    gl_FragColor = waves2();
}



// uniform sampler2D uBuffer;
// uniform vec2 uMouse;
// uniform vec2 uResolution;
// uniform float uAddWave;
// uniform float uViscosity;
// uniform float uDisipation;
// uniform float uMouseSize;
// uniform float uWaveGradient;
// uniform float uFrequency;
// uniform float uMinWaveSize;
// uniform float uTransitionTime;
// uniform float uTransitionSpeed;
// uniform float uWaveMagnitude;
// uniform float uMouseSize;

// // temp
// uniform float uTime;

// varying vec2 vUv;

// vec4 waves() {
//     vec2 cellSize = 1.0 / vec2(128.);
//     vec3 e = vec3(cellSize, 0.);
//     vec2 mouse = vUv - uMouse;

//     vec4 heightmapValue = texture2D(uBuffer, vUv);

//     float t = texture2D(uBuffer, vUv-e.zy).x;
//     float r = texture2D(uBuffer, vUv-e.xz).x;
//     float b = texture2D(uBuffer, vUv+e.xz).x;
//     float l = texture2D(uBuffer, vUv+e.zy).x;

//     float newHeight = uViscosity * ((t + r + b + l) * 0.5 - heightmapValue.y);

//     float mouseSize = uMouseSize;
//     float mousePhase = uAddWave * smoothstep(uMinWaveSize + abs(sin(uTime*uFrequency) * uWaveGradient), .0, length(mouse) / mouseSize) * uWaveMagnitude; 
//     // float mousePhase = mix(0., uAddWave, smoothstep(0., uTransitionTime + 2., + uTime*uTransitionSpeed)) * smoothstep(uMinWaveSize + abs(cos(uTime*uFrequency + 1.) * uWaveGradient), .0, length(mouse) / uMouseSize) * uWaveMagnitude; 
//     // float mousePhase = uAddWave * min(((uTime - uTransitionTime) * uTransitionSpeed), 1.) * smoothstep(uMinWaveSize + abs(cos(uTime*uFrequency + 1.) * uWaveGradient), .0, length(mouse) / uMouseSize) * uWaveMagnitude; 
//     // make add wave a transtion
//     // maybe somthing like
//     // smoothstep()

//     // // mode2
//     // mousePhase = clamp( length( mouse ) * PI / uMouseSize, 0.0, PI * 5. );
//     // mousePhase = ( cos( mousePhase ) + 1.0 ) * 0.38 * uAddWave;

//     float amp = 1.;
//     newHeight += mousePhase * amp;

//     heightmapValue.y = heightmapValue.x;
//     heightmapValue.x = newHeight;

//     return heightmapValue;
// }