  precision highp float;
  precision highp sampler3D;
  uniform sampler3D uShape;
  uniform sampler3D uNoise;
  uniform float uTime;
  uniform float uSteps;
  uniform float uCut;
  uniform vec3 uColor;
  uniform float uRotationSpeed;
  uniform float uColorStrength;
  uniform float uColorIntensity;
  uniform vec3 uLightPosition;

  varying vec3 vPosition;
  varying vec3 vDirection;
  varying vec3 vNormal;

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

  vec2 rotate(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
  }

  float sample1( vec3 p ) {
    float t = uTime * uRotationSpeed;
    vec3 pr = p - 0.5;
    pr.xy = rotate(pr.xy, t/2.);
    pr += 0.5;
    float s = texture(uShape, pr).r;
    
    pr = p - 0.5;
    pr.xy = rotate(pr.xy, t/3.);
    pr += 0.5;
    float n = texture(uNoise, pr).r;
    return min(s,  n);
  }

  float sdSphere(vec3 p) {
    return 0.1 -length(p);
  }

  void main(){
    vec3 rayDir = normalize(vDirection);
    vec3 p = vPosition;
    float delta = 1. / uSteps;

    vec4 lines = vec4(0.);
    
    // vec3 lPos = vec3(1, 1.74, -0.9);
    vec3 lPos = vec3(0.);
    lPos = uLightPosition;
    vec3 lDir = normalize(lPos);
    
    // p += rayDir * delta;
    for (float t = 0.; t < uSteps; t++) {
      float d = sample1(p + 0.5);

       if ( d > 0. ) {
      vec3 n = vNormal;
      float diffuse = .5 + .5 * dot(lDir, n);
      vec3 e = normalize(-p);
      vec3 h = normalize(lDir + e);
      float specular = pow(max(dot(n, h), 0.), .5);
      lines.rgb += uColor * (diffuse + specular)/10. * d;
      lines.a += uColorStrength * d; //uColorStrengthAlpha
      lines.a /= pow(length(p-lPos) * 2., uColorIntensity);

      float ee = length(vec2(dFdx(d), dFdy(d)));
      float ff = abs(d-uCut);
      float lineThickness = .3;
      if(ff<ee * lineThickness && length(p) < 0.48) {
        vec3 lineColor = uColor + length(p) * 2.;
        lines.rgb = lineColor;
      }

      if (lines.a > 1.) break;
    }

      p += rayDir * delta;
    }

    gl_FragColor = lines;

    // // // postprocess
    gl_FragColor.rgb = pow( gl_FragColor.rgb, vec3(1.5,1.2,1.0) );    
    gl_FragColor.rgb *= clamp(1.0-0.3*length(vPosition), 0.0, 1.0 );
  }