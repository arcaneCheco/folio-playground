uniform sampler2D uScreen;
uniform float uProgress;

varying vec2 vUv;

void main() {
    vec3 base = texture2D(uScreen, vUv).rgb;
    vec3 final = mix(base, vec3(0.), uProgress);
    gl_FragColor = vec4(final, 1.);
}