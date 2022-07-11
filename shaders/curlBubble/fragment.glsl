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
  varying vec3 vLightPos;

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
    // lPos = vLightPos;
    vec3 lDir = normalize(lPos);
    
    // p += rayDir * delta;
    for (float t = 0.; t < uSteps; t++) {
      float d = sample1(p + 0.5);

       if ( d > 0. ) {
      vec3 n = vNormal;
      // diffuse = .5;
      float diffuse = .5 + .5 * dot(lDir, n);
      vec3 e = normalize(-p);
      vec3 h = normalize(lDir + e);
      float specular = pow(max(dot(n, h), 0.), 10.);
      // lines.rgba += vec4(uColor, 1.) * (diffuse + specular)/30. * d;
      lines.rgb += uColor * (diffuse + specular)/10. * d;
      lines.a += uColorStrength * d; //uColorStrengthAlpha
      lines.a /= pow(length(p-lPos) * 2., uColorIntensity);

      float ee = length(vec2(dFdx(d), dFdy(d)));
      // ee = abs(d-uCut);
      float ff = abs(d-uCut);
      if(ff<ee) {
      // if(ff<0.01) {
        // lines.rgb = vec3(1.);
        // vec3 lineColor = normalize(vec3(0.1, 1., 0.15)) * 1.2;
        vec3 lineColor = uColor * 1.5;
        lines.rgb = lineColor;
        // lines.rgb = vec3(1., 0., 0.);
        // lines.rgb += uColor;
        // lines.a += .2 * length(p);
        lines.a += .1;
      }

      if (lines.a > 1.) break;
    }

      // float dS = sdSphere(p);
      // if (abs(dS) < 0.05) {
      //   lines = vec4(uColor * 1.2, 1.);
      //   lines.a = 0.;
      //   }

      p += rayDir * delta;
    }

    gl_FragColor = lines;

    // // // postprocess
    gl_FragColor.rgb = pow( gl_FragColor.rgb, vec3(1.5,1.2,1.0) );    
    gl_FragColor.rgb *= clamp(1.0-0.3*length(vPosition), 0.0, 1.0 );

    // gl_FragColor = vec4(uLightPosition, 1.);
  }