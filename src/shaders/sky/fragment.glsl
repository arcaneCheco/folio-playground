/*********/
// float spike( float x ) { // spike(0)=0, spike(0.5)=1, spike(1)=0
//     return 0.5 * abs( mod( 4. * x - 2., 4. ) - 2. );
// }
// float trees0( float x ) {
//     float f0 = spike( x + .7 ) - .8;
//     float f1 = spike( 2. * x + .2 ) - .68;
//     float f2 = spike( 3. * x + .55 ) - .73;
//     float f3 = spike( 2. * x + .4 ) - .76;
//     float f4 = spike( 3. * x + .85 ) - .79;
//     float f5 = spike( 2. * x + .55 ) - .79;
//     float f6 = spike( 3. * x + .3 ) - .82;
//     return .5 * max( 0., max( f0, max( f1, max( f2, max( f3, max( f4, max( f5, f6 ) ) ) ) ) ) );
// }
// float yTree = trees0(vUv.x * 3.);
// if (yTree > y) {
//   gl_FragColor.rbg =  vec3( 0.);
/*********/

#define PI 3.1415
#define PI2 3.1415 * 0.5
#define PI34 3.1415 * 1.5
#define TAU 2. * PI

uniform float uTime;
varying vec3 vWorldPosition;

// sky
uniform vec3 uSkyColor;
uniform float uSkyBrightness;
// horizon
uniform float uHorizonBrightness;
uniform float uHorizonIntensity;
uniform float uHorizonHeight;
// mountain
uniform float uMountain1Height;
uniform vec3 uMountain1Color;
uniform float uMountain2Height;
uniform vec3 uMountain2Color;
// coulds
uniform vec3 uCloudColor;
uniform float uCloudsLowerBound;
uniform float uCloudsGradient;
uniform float uCloudSpeed;
uniform float uCloudHardEdges;
uniform float uCloudHardEdgeDensity;
uniform float uCloudHardEdgeCut;
// moon
uniform float uMoonSize;
uniform vec3 uMoonPosition;
uniform float uMoonHaloSize;
uniform float uMoonHaloGradient;
uniform vec3 uMoonColor;
uniform float uMoonGradient;


varying vec2 vUv;
varying vec3 vOrigin;

vec2 rotUv(vec2 uv, float a) {
    float c = cos(a);
    float s = sin(a);
    mat2 m = mat2(c,s,-s,c);
    return m * uv;
}

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

float mapProjX(vec2 uv) {
	// x
	float arc = uv.x * TAU;
	float projX;
	if (uv.x < 0.25) {
		return -(PI2 - arc);
	}
	if (uv.x < 0.5) {
		return arc - PI2;
	}
	if (uv.x < 0.75) {
		return PI34  - arc;
	}
	return PI34 - arc;
}

// #pragma glslify: snoise = require(./partials/simplex3d.glsl)
#pragma glslify: value_noise = require(../partials/valueNoise.glsl)

/// grayny stuff /////
vec2 hash22( vec2 x ){
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float hsh(vec2 p){
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// float perlin(vec2 p){
//     vec2 i = floor(p);
//     vec2 f = fract(p);
    
//     float a = hsh(i);
//     float b = hsh(i+vec2(1., .0));
//     float c = hsh(i+vec2(0. ,1 ));
//     float d = hsh(i+vec2(1., 1. ));
    
//     vec2 u = smoothstep(0., 1., f);
    
//     return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
// }

// float octnse(vec2 p, int oct, float t){
//     float a = 1.;
//     float n = 0.;
    
//     for(int i = 0; i < oct; i++){
//         p.x += t;
//      	n += perlin(p) * a;	
//         p*=2.;
//         a *= .5;
//     }
    
//     return n;
// }

/// grayny stuff /////


void skyStuff(inout vec3 col) {
	vec3 sky = uSkyColor * uSkyBrightness;
	col = sky;
}

void horizonStuff(inout vec3 col, vec2 p) {
	col += uHorizonBrightness*pow(clamp(1. + uHorizonHeight -abs(p.y),0.0,1.0),uHorizonIntensity);
}

float trigFBM(vec2 pos, float x) {
	return (1. - uMountain1Height) + 
		0.09*sin(x*10.)*sin(x*10.) + 
		sin(x*50.618+53.)*.015 + 
		sin(x*123.618+12.)*.005 + 
		sin(x*54.)*sin(x*54.)*0.01;
}
float trigFBM2(vec2 pos, float x) {
	return (1. - uMountain2Height) + 
	0.09*sin(x*6.+0.5)*sin(x*6.+0.5) + 
	sin(x*50.618+25.)*.015 + 
	sin(x*123.618+12.)*.005;
}

float terrain(float x) {
	// https://www.shadertoy.com/view/Xlf3Rj
	float w=0.;
	float a=1.;
	x*=10.;
	w+=sin(x*.20521)*8.;
	for (int i=0; i<5; i++) {
		x*=1.53562;
		x+=7.56248;
		w+=sin(x)*a;		
		a*=.5;
	}
	return .7+w*.015;	
}
float terrain2(float x) {
	// https://www.shadertoy.com/view/Xlf3Rj
	float w=0.;
	float a=1.;
	x*=20.;
	w+=sin(x*.20521)*5.;
	for (int i=0; i<5; i++) {
		x*=1.53562;
		x+=7.56248;
		w+=sin(x)*a;		
		a*=.5;
	}
	return .7+w*.015;	
}


uniform sampler2D uGreyNoise;

float noiseG(vec2 p) {
	return texture2D(uGreyNoise, p).x;
}

float tree(vec2 p, float tx) {
	float noisev=noiseG(p.xx*.1+.552121)*.25;
	p.x=mod(p.x,.5)-.1;
	p*=15.+noiseG(vec2(tx*1.72561))*10.;
	float ot=1000.;
	float a=radians(-60.+noiseG(vec2(tx))*30.);
	for (int i=0; i<7; i++) {
		ot=min(ot,length(max(vec2(0.),abs(p)-vec2(-a*.15,.9))));
		float s=(sign(p.x)+1.)*.25;
		p.x=abs(p.x);
		p=p*1.3-vec2(0.,1.+noisev);		
		a*=.8;
		a-=(noiseG(vec2(float(i+2)*.55170275+tx,s))-.5)*.2;
		mat2 rot=mat2(cos(a),sin(a),-sin(a),cos(a));
		p*=rot;
	}
	return step(0.05,ot);
}

float bird(vec2 p) {
	p.x+=uTime*.05;
	float t=uTime*.05+noiseG(vec2(floor(p.x/.4-.2)*.7213548))*.7;
	p.x=mod(p.x,.4)-.2;
	p*=2.-mod(t,1.)*2.;
	p.y+=.6-mod(t,1.);
	p.y+=pow(abs(p.x),2.)*20.*(.2+sin(uTime*20.));
	float s=step(0.003-abs(p.x)*.1,abs(p.y));	
	return min(s,step(0.005,length(p+vec2(0.,.0015))));
}

void mountains(inout vec3 col, vec2 pos) {
	// https://www.shadertoy.com/view/sdB3Dz
	float val = vUv.x * TAU;
	float mount1 = trigFBM(pos, val);
	mount1 = terrain(val);
	float m1ss = (smoothstep(mount1,mount1 + 0.003, 1.-pos.y));
	col = mix(col, uMountain1Color, m1ss);

	// tree
	float tr = tree(vec2(val, pos.y + mount1 - 1.0) * 2., 5.);
	float tr1ss = smoothstep(tr,tr + 0.003, 1.-pos.y);
	col = mix(col, uMountain1Color, tr1ss);
	// mount1 = s;
	/////



	// border
	// float bound1 = (smoothstep(mount1,mount1 + 0.003, 1.005-pos.y)) - m1ss;
	// col = mix(col, vec3(1.), bound1);

	float mount2 = trigFBM2(pos, val);
	mount2 = terrain2(val);
	float m2ss = (smoothstep(mount2,mount2+0.002, 1.-pos.y));
	col = mix(col, uMountain2Color, m2ss);

	// border
	// float bound2 = (smoothstep(mount2,mount2 + 0.003, 1.005-pos.y)) - m2ss;
	// col = mix(col, vec3(1.), bound2);

	float bi = bird(pos * 0.2);
	float bi1ss = smoothstep(bi,bi + 0.003, 1.-pos.y);
	col = mix(col, vec3(1.), bi1ss);
}

void cloudStuff(inout vec3 col, vec2 pos) {
	// colors
	vec3 cloudcolor = uCloudColor;
    // vec3 cloudcol = vec3(1.);
    // vec3 suncol1 = vec3(1.) * 1.;
    // cloudcolor = mix(cloudcol, suncol1, (1.-pos.y+0.));

	// actual clouds
	float valY = max(vUv.y * 2. - 1., 0.);
	float clouds = smoothstep(1. - uCloudsLowerBound, 1. - uCloudsGradient, 1. - valY);
  
    float speed = uTime * uCloudSpeed;

	float val = vUv.x * TAU;
	vec2 p = vec2(val, valY);
    float cloud_val1 = (value_noise(p*vec2(1.,7.)+vec2(1.,0.)*-speed*0.010));
	float cloud_val2 = (value_noise(p*vec2(2.,8.)+vec2(2.,.2)*-(speed)*0.02));
    float cloud_val3 = (value_noise(p*vec2(1.,5.)+vec2(1.,0.)*-(speed)*0.005));
    float cloud_val = sqrt(cloud_val2*cloud_val1);
    cloud_val = sqrt(cloud_val3*cloud_val);
	// cloud_val = cloud_val1;


    // Hard(er)-edged clouds
	float hardEdges = smoothstep(uCloudHardEdgeDensity - uCloudHardEdgeCut,uCloudHardEdgeDensity,cloud_val);
	cloud_val = mix(cloud_val, hardEdges, uCloudHardEdges);

	col = mix(col, cloudcolor, cloud_val*clouds);
}

void moonStuff(inout vec3 col) {
    vec3 pos = uMoonPosition;
    vec3 target = vec3(-0., 0., 0.);
    vec3 vSunDirection = normalize(pos - target);
	vec3 direction = normalize(vWorldPosition);
    float cosTheta = dot( direction, vSunDirection );
    float moonSize = 1. - uMoonSize;

	float uGradient = uMoonGradient;
	// // post only
	// uGradient = 1.;
	// ////////

    float moonDisc = smoothstep(moonSize, moonSize * uGradient, cosTheta);
	vec3 moonColor = uMoonColor;

	// // post only
	// float s = 0.001;
	// float moonDisc2 = smoothstep(moonSize + s, moonSize + s, cosTheta);
	// moonDisc -= moonDisc2;
	// ////////

	// halo
	float size = moonSize * (1. - uMoonHaloSize);
	float moonClouds = smoothstep(size, size * uMoonHaloGradient, cosTheta);
	vec3 haloColor = mix(uCloudColor, moonColor, 0.5);

	// add halo
	// col = mix(col, haloColor, moonClouds);

	// add disc
    col = mix( col, moonColor, moonDisc);
}

void main() {
	vec3 col = vec3(0.);

	vec2 p = vWorldPosition.xy; // range -1 to 1

	// sky
	skyStuff(col);

    // moon
	moonStuff(col);

	// horizon
	horizonStuff(col, p);

  	// mountains
    mountains(col, p);

    // clouds
	cloudStuff(col, p);


	// // postprocess
    col = pow( col, vec3(1.5,1.2,1.0) );    
    col *= clamp(1.0-0.3*length(p), 0.0, 1.0 );

	// noise grain
	// vec2 ttt = hash22(p);
	// col -= .18*clamp(hsh(p * 20. + uTime), .5, .9);

	gl_FragColor = vec4(col ,1.);
}