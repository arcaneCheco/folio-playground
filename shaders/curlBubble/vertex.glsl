#define TAU 6.28

precision highp sampler3D;
uniform float uTime;
uniform sampler3D uNoise;

attribute vec3 position2;
uniform float uBubblePos;

// distortion
uniform float uVertexDistortionSpeed;
uniform float uVertexDistortionAmplitude;

varying vec3 vPosition;
varying vec3 vDirection;
varying vec3 vNormal;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

vec3 rotateY(vec3 v, float angle) {
  return rotate(v, vec3(0., 1., 0.), angle);
}

void main() {
  vec3 bubblePos = mix(position, position2, uBubblePos);
  vPosition = bubblePos;
  vec3 origin = vec3(inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;
  vDirection = bubblePos - origin;
  vNormal = normal;

  float t = uTime * uVertexDistortionSpeed;
  float distortion = texture(uNoise, 
                              vec3(
                                  bubblePos.x + sin(t) * 0.5 + 0.5, 
                                  bubblePos.y + sin(2. * t) * 0.5 + 0.5, 
                                  0.4)
                              ).r 
                      * uVertexDistortionAmplitude;
  vec3 newPos = bubblePos + normal * distortion;  

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
}