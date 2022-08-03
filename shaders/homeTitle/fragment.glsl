uniform sampler2D uFlowmap;
uniform sampler2D uTextImage;
varying vec2 vUv;

vec4 getRGB(sampler2D image, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture2D(image, uv + offset);
    vec4 g = texture2D(image, uv);
    vec4 b = texture2D(image, uv - offset);
    return vec4(g.g, r.r, b.b, g.a);
    // return vec4(r.r, g.g, b.b, g.a);
}

const float e = 2.7182818284590452353602874713527;

float tvNoise(vec2 texCoord)
{
    float G = e + ((40.) * 2.1);
    vec2 r = (G * sin(G * texCoord.xy));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

void main() {

	vec3 flow = texture2D(uFlowmap, vUv).rgb;

	vec2 nUv = vUv;
	nUv += flow.rg * -0.05;


	float angle = length(vUv - 0.5);

	float amount = length(flow.rg) * 0.025;

	vec4 final = getRGB(uTextImage, nUv, angle, amount).rgba;
	gl_FragColor = final;

	vec3 col = final.rgb;

	float tvN = tvNoise(nUv);
	
	col = mix(col, vec3(0.8, 0.2, 0.1), tvN * 0.3);

	gl_FragColor = vec4(col, final.a);

	gl_FragColor.rgb += flow;

	// gl_FragColor = vec4(1.);
	// gl_FragColor = getRGB(uTextImage, vUv, angle, 1.).rgba;

	// gl_FragColor = vec4(flow, 1.);
	// gl_FragColor = texture2D(uTextImage, vUv);
	// gl_FragColor = texture2D(uFlowmap, vUv) + 0.5;
	// gl_FragColor.a = 1.;
}