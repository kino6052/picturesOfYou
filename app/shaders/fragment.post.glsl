/*
 * Post-processing fragment shader
 * Applies blur, wave distortion, and black & white effects
 */
#ifdef GL_ES
precision highp float;
#endif

// Texture sampler and control flag
uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

// Effect selector (0=None, 1=B&W, 2=Wave, 3=Blur)
uniform int uFX;

// Effect parameters
uniform float uBlurAmount;
uniform float uWaveAmount; 
uniform float uTime;
uniform bool uBW;

// Interpolated values from vertex shader
varying vec2 vTextureCoord;
varying vec4 vFinalColor;

// Helper function to sample texture with offset
vec4 offsetLookup(float xOff, float yOff) {
    return texture2D(uSampler, vec2(vTextureCoord.x + xOff*0.01, vTextureCoord.y + yOff*0.01));
}

// Random noise function
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
    // Apply radial wave distortion
    vec2 texcoord = vTextureCoord;
    vec2 center = vec2(0.5, 0.5); // Center of the screen
    vec2 toCenter = texcoord - center;
    float dist = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);
    
    // Create expanding circular waves
    float wave = sin(dist * 20.0 * uWaveAmount - uTime * 2.0) * 0.02;
    
    // Apply distortion along the radial direction
    texcoord = center + toCenter * (1.0 + wave);

    // Apply blur based on distance from center
    vec4 blurredColor = vec4(0.0);
    float totalWeight = 0.0;
    float blurRadius = dist * uBlurAmount * 0.02; // Blur increases with distance
    
    // Sample in a circular pattern with more samples for smoother blur
    const int SAMPLES = 16;
    vec4 centerColor = texture2D(uSampler, texcoord);
    
    // Add center sample with highest weight
    blurredColor += centerColor * 2.0;
    totalWeight += 2.0;
    
    // Sample surrounding pixels in concentric circles
    for(int i = 0; i < SAMPLES; i++) {
        float a = float(i) * (2.0 * 3.14159) / float(SAMPLES);
        vec2 offset = vec2(cos(a), sin(a)) * blurRadius;
        
        // Gaussian-like weight falloff
        float weight = exp(-length(offset) * length(offset) / (blurRadius * blurRadius));
        blurredColor += texture2D(uSampler, texcoord + offset) * weight;
        totalWeight += weight;
    }
    
    // Normalize by total weight for proper averaging
    vec4 fragment = blurredColor / totalWeight;
    // Output either B&W or color
    if (uBW) {
        gl_FragColor = vec4(fragment.r, fragment.r, fragment.r, 1.0);
    }
    if (!uBW) {
        gl_FragColor = fragment;
    }
}