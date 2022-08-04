uniform sampler2D uFlowmap;
uniform sampler2D uTextImage;
varying vec2 vUv;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 getRGB(sampler2D image, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture2D(image, uv + offset);
    vec4 g = texture2D(image, uv);
	// g.rgb *= vec3(183./255., 84./255., 255./255.);
    vec4 b = texture2D(image, uv - offset);

	vec3 col = vec3(r.r, g.g, b.b);
	col = rgb2hsv(col);
	col.z += 0.4;
	col.x += 0.4;
	col = hsv2rgb(col);
    return vec4(col, g.a);
	
    // return vec4(g.g, r.r, b.b, g.a);
    // return vec4(r.r * 183./255., g.g * 84./255., b.b * 255./255., g.a) * 2.;
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

	// nUv += 0.15;
	// nUv *= 1.5;


	nUv += flow.rg * -0.05;


	float angle = length(vUv - 0.5);

	float amount = length(flow.rg) * 0.029;

	vec4 final = getRGB(uTextImage, nUv, angle, amount).rgba;
	gl_FragColor = final;

	vec3 col = final.rgb;

	float tvN = tvNoise(nUv);
	
	col = mix(col, vec3(0.4,0.1,0.8), tvN * 0.3);
	// col = mix(col, vec3(183./255., 84./255., 255./255.), tvN * 0.3);
	// col = mix(col, vec3(0.8, 0.2, 0.1), tvN * 0.3);
	// col = mix(vec3(1.), col, tvN * 0.3);

	gl_FragColor = vec4(col, final.a) + 0.;


	// gl_FragColor = vec4(1.);
	// gl_FragColor = getRGB(uTextImage, vUv, angle, 1.).rgba;

	// gl_FragColor = vec4(flow, 1.);
	// gl_FragColor = texture2D(uTextImage, vUv);
	// gl_FragColor = texture2D(uFlowmap, vUv) + 0.5;
	// gl_FragColor.a = 1.;
}