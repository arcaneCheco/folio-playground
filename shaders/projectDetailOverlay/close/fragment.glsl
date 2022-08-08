uniform float uSize;
uniform float uBorderThickness;
uniform float uBorderStrength;
uniform float uCrossThickness;
uniform float uCrossSize;
uniform float uBackgroundStrength;

varying vec2 vUv;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main() {
    float strength;

    vec2 nUv = vUv - 0.5;
    nUv = rotate(nUv, 3.1415 * 0.25);
    
    vec2 sUv = nUv * uSize;
    strength = step(abs(sUv.y), uCrossThickness) + step(abs(sUv.x), uCrossThickness);

    float l = length(sUv);

    strength *= step(l, uCrossSize);

    float border = step(l, 0.5 * uSize);

    float innerBorder = step(l, 0.5 * uSize - 2. * uBorderThickness);
    border -= innerBorder;

    border *= smoothstep(uBorderStrength, 0., abs(vUv.y - 0.5));

    strength += border;

    gl_FragColor = vec4(vec3(1.), strength);

    float bgStrength = innerBorder * uBackgroundStrength;
    vec4 bg = vec4(vec3(0.), bgStrength) * uBorderStrength;

    gl_FragColor = mix(bg, gl_FragColor, strength);
}