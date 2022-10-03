uniform sampler2D uTextMap;
uniform sampler2D uDummy;
uniform vec2 uMouse;
uniform float uAspect;
uniform float uDistortion;
uniform float uInfluence;
uniform float uTest;
uniform float uProgress;

varying vec2 vUv;

const float e = 2.7182818284590452353602874713527;

float tvNoise(vec2 texCoord)
{
    float G = e + ((40.) * 2.1);
    vec2 r = (G * sin(G * texCoord.xy));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

void main() {
    vec2 dist = uMouse - vUv;
    vec2 dist2 = dist * vec2(uAspect, 1.);
    float len = length(dist2);
    float influence = clamp(uDistortion - pow(1. / uInfluence * len, 5.) , 0., 1.);
    vec2 lensUv = vUv + dist * influence;

    float influence2 = influence - clamp(uDistortion - pow(10. / (uInfluence * 0.9) * len, 5.) , 0., 4.);
    float influence3 = influence - clamp(uDistortion - pow(10. / (uInfluence * 0.85) * len, 5.) , 0., 4.);

    vec4 text = texture2D(uTextMap, lensUv);
    vec4 bg = vec4(vec3(tvNoise(vUv) * (1.3 - uProgress)), 0.5 + (1. - uProgress));
    gl_FragColor = mix(bg, text, text.a);

    float yDist = abs(vUv.y - 0.5) * 2.;
    float border = smoothstep(uProgress - 0.04 / uProgress, uProgress, yDist);
    gl_FragColor = mix(gl_FragColor, vec4(1.), border);

    gl_FragColor *= step(yDist, uProgress);

}