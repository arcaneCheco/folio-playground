// https://www.shadertoy.com/view/sdB3Dz
float random2f(in vec2 q)
{
    return fract(cos(dot(q,vec2(143.543,56.32131)))*46231.56432);
}

float noise(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random2f(i);
    float b = random2f(i + vec2(1.,0.));
    float c = random2f(i + vec2(0., 1.));
    float d = random2f(i + vec2(1., 1.));
    
    vec2 u = f * f * (3. - 2. * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// iq
float value_noise(in vec2 uv)
{
    float f = 0.;
    uv *= 8.0;
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f  = 0.5000*noise( uv );
    uv = m*uv;
    f += 0.2500*noise( uv );
    uv = m*uv;
    f += 0.1250*noise( uv ); 
    uv = m*uv;
    f += 0.0625*noise( uv ); 
    uv = m*uv;
    return f;
}
/********/
#pragma glslify: export(value_noise)