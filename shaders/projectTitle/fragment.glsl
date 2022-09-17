uniform vec3 uColor;
uniform float uActive;
uniform sampler2D uMap;
uniform float uStroke;
uniform float uProgress;
uniform float uPadding;
uniform float uTime;

varying vec2 vUv;
varying vec2 bUv;

float msdf(sampler2D tMap, vec2 uv) {
    vec3 tex = texture2D(tMap, uv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;

    // TODO: fallback for fwidth for webgl1 (need to enable ext)
    float d = fwidth(signedDist);
    float alpha = smoothstep(-d, d, signedDist);
    if (alpha < 0.01) discard;
    return alpha;
}

float strokemsdf(sampler2D tMap, vec2 uv, float stroke, float padding) {
    vec3 tex = texture2D(tMap, uv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
    float t = stroke;
    float alpha = smoothstep(-t, -t + padding, signedDist) * smoothstep(t, t - padding, signedDist);
    return alpha;
}

const float e = 2.7182818284590452353602874713527;

float tvNoise(vec2 texCoord)
{
    float G = e + ((uTime + 10.) * 2.1);
    vec2 r = (G * sin(G * texCoord.xy));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

void main() {
    float fill = msdf(uMap, vUv);
    float stroke = strokemsdf(uMap, vUv, uStroke, uPadding);

    float alpha = mix(stroke, fill, uProgress);
    alpha = fill + stroke;
    alpha = fill * 0.2 + uProgress * 0.4 + stroke * 0.5 + stroke * uProgress;

    float tvNoiseMag = min(2. * uProgress, 2. - 2. * uProgress);

    float tvN = tvNoise(bUv);
    alpha -= tvN * tvNoiseMag;

    gl_FragColor = vec4(uColor, alpha);
}