uniform sampler2D uBuffer;
uniform vec2 uResolution;
uniform vec2 uMouse;

// temp
uniform float uTime;

varying vec2 vUv;

vec4 waves() {
    vec2 cellSize = 1.0 / uResolution;
    // cellSize = vec2(0.001);
    vec3 e = vec3(cellSize, 0.);
    vec2 mouse = vUv - uMouse;
    float ratio = uResolution.x / uResolution.y;
    // mouse.x *= ratio;

    vec4 value = texture2D(uBuffer, vUv);

    float t = texture2D(uBuffer, vUv-e.zy, 1.).x;
    float r = texture2D(uBuffer, vUv-e.xz, 1.).x;
    float b = texture2D(uBuffer, vUv+e.xz, 1.).x;
    float l = texture2D(uBuffer, vUv+e.zy, 1.).x;
    float shade = 0.;
    shade = smoothstep(.02 + abs(sin(uTime*10.) * .006), .0, length(mouse)*1.5); 

    vec4 texcol = value;

    float d = shade * 2.;

    d += -(texcol.y - .5) * 2. + (t + r + b + l - 2.);
    d *= .99;
    d = d * .5 + .5;

     value = vec4(d, texcol.x, 0., 0.);
    return value;
}

void main() {
    vec4 t = waves();
    gl_FragColor = t;
}