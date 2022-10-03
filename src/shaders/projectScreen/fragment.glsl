uniform float uTime;
uniform float uTransition;
uniform float uTransitionStart;
uniform float uTransitionDuration;
uniform vec3 uColor;
uniform float uOpacity;

uniform sampler2D uImage1;
uniform sampler2D uImage2;
uniform float uProgress;
uniform sampler2D uAbstract;
uniform float uVignetteIntensity;
uniform float uVignetteInfluence;

varying vec2 vUv;

const float e = 2.7182818284590452353602874713527;

float tvNoise(vec2 texCoord)
{
    float G = e + ((uTime + 10.) * 2.1);
    vec2 r = (G * sin(G * texCoord.xy));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}

float getTransition(float progress) {
    return max(min(2. * progress, -2. * (progress - 1.)), 0.);
}

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

float dBorder(float t, vec2 st) {
    vec2 p1 = vec2(t);
    vec2 p2 = vec2(1. - t);
    vec2 p3 = vec2(t, 1. - t);
    vec2 p4 = vec2(1. - t, t);
    float d1 = step(p1.x,st.x) * step(st.x,p4.x) * abs(st.y-p1.y) + step(st.x,p1.x) * distance(st,p1) + step(p4.x,st.x) * distance(st,p4);
    d1 = min(step(p3.x,st.x) * step(st.x,p2.x)  *abs(st.y-p2.y) + step(st.x,p3.x) * distance(st,p3) + step(p2.x,st.x) * distance(st,p2), d1);
    d1 = min(step(p1.y,st.y)*step(st.y,p3.y)*abs(st.x-p1.x)+ step(st.y,p1.y)*distance(st,p1)+step(p3.y,st.y)*distance(st,p3),d1);
    d1 = min(step(p4.y,st.y)*step(st.y,p2.y)*abs(st.x-p2.x)+ step(st.y,p4.y)*distance(st,p4)+step(p2.y,st.y)*distance(st,p2),d1);

    return d1;
}


void main() {

    vec3 image1 = texture2D(uImage1, vUv).rgb;
    vec3 image2 = texture2D(uImage2, vUv).rgb;


    vec3 final = image1;


    if (uTransition > 0.5) {
        vec3 image = mix(image1, image2, uProgress);
        vec3 staticSample = vec3(tvNoise(vUv));
        float staticRatio = getTransition(uProgress);

        final = mix(image, staticSample, staticRatio);
    }

    // border shape
    vec2 angleUV = vUv - vec2(0.5);
    angleUV.x *= 2.;
    float angle = atan(angleUV.x,angleUV.y) / 6.28 + 0.5;
    float angleDist = 0.05 + sin(uTime) * 0.04;
    float angleSpeed = 0.1;
    float angleS = smoothstep(1. - angleDist, 1., fract(angle + uTime * angleSpeed));
    angleS += smoothstep(angleDist, 0., fract(angle + uTime * angleSpeed));
    angleS += smoothstep(1. - angleDist, 1., fract(angle + 0.5 + uTime * angleSpeed * 2.));
    angleS += smoothstep(angleDist, 0., fract(angle + 0.5 + uTime * angleSpeed * 2.));

    float d1 = dBorder(0.01, vUv);
    float nos = texture2D(uAbstract, vUv + vec2(cos(uTime * angleSpeed), sin(uTime * angleSpeed))).r / 50.;
    float f1 = .01 / abs(d1 + nos);
    angleS *= f1;


    vec3 borderColor = uColor;
    borderColor = rgb2hsv(borderColor);

    borderColor.z -= 0.4;
    borderColor.z += angleS * 2.;
    borderColor.g -= angleS;
    borderColor.r -= 0.08 * sin(uTime * 5.) * f1;

    borderColor = hsv2rgb(borderColor);


    // vignette
    vec2 vigUv = vUv * (1.0 - vUv.yx);
    
    float vig = vigUv.x*vigUv.y * uVignetteIntensity;
    
    vig = pow(vig, uVignetteInfluence);
    vig = clamp(vig, 0., 1.);
    final *= vec3(vig);

    final += borderColor * f1;

    final = pow( final, vec3(1.5,1.2,1.0) );    
    final *= clamp(1.0-0.3*length(vUv), 0.0, 1.0 );


    gl_FragColor = vec4(final, 1.) * uOpacity;
}