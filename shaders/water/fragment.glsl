uniform sampler2D uHeightMap;

varying vec2 vUv;

void main() {
    // gl_FragColor = vec4(1., 1., 1., 1.);
    // float t = texture2D(uHeightMap, vUv).r;
    // // gl_FragColor = vec4(t, 0., 0., 1.);
    vec4 i = texture2D(uHeightMap, vUv);
    gl_FragColor = vec4(i.r, 0., 0., 1.);
}