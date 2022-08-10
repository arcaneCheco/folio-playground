uniform sampler2D uIcon;

varying vec2 vUv;

void main() {
    vec4 icon = texture2D(uIcon, vUv);
    gl_FragColor = icon;

    // vec4 shadow = texture2D(uIcon, (vUv - vec2(0.05,-0.05)) * 1.1);

    // shadow = vec4 (vec3(0., 1., 0.), shadow.r);

    // gl_FragColor += shadow;
}