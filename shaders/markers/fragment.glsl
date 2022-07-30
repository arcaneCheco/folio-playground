varying vec2 vUv;
varying vec3 vColor;

void main() {
	float strength = distance(vUv, vec2(0.5));
	strength = 1. - strength;
	strength = smoothstep(0.48, 0.59, strength);
	// vec3 color = mix(vec3(0., 1., 0.), vColor, strength);
	// strength = step(strength, 0.5);
	// vec3 
	gl_FragColor = vec4(vColor, strength);
	// gl_FragColor = vec4(1., 1.,1.,1.);
}