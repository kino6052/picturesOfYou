/*
*  FRAGMENT SHADER (POST PROCESS)
*  Many thanks to the "WebGL: Beginner's Guide" Book
*  This shader is responsible for the blur and black&white effects.
*/
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;
uniform int uFX; // integer representing a post processing effect to be applied
/*
*  0 - No Effect
*  1 - Black and White
*  2 - Wave
*  3 - Blur
*/
// POST PROCESSING PARAMETERS
uniform float uBlurAmount;
uniform float uWaveAmount;
uniform float uTime;
uniform bool uBW;

varying vec2 vTextureCoord;
varying vec4  vFinalColor;

vec4 offsetLookup(float xOff, float yOff) {
    return texture2D(uSampler, vec2(vTextureCoord.x + xOff*0.01, vTextureCoord.y + yOff*0.01));
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void)  {
  vec4 frameColor = offsetLookup(-4.0, 0.0) * 0.05 * uBlurAmount;
    frameColor += offsetLookup(-3.0, 0.0) * 0.09 * uBlurAmount;
    frameColor += offsetLookup(-2.0, 0.0) * 0.12 * uBlurAmount;
    frameColor += offsetLookup(-1.0, 0.0) * 0.15 * uBlurAmount;
    frameColor += offsetLookup(0.0, 0.0) * 0.16 * uBlurAmount;
    frameColor += offsetLookup(1.0, 0.0) * 0.15 * uBlurAmount;
    frameColor += offsetLookup(2.0, 0.0) * 0.12 * uBlurAmount;
    frameColor += offsetLookup(3.0, 0.0) * 0.09 * uBlurAmount;
    frameColor += offsetLookup(4.0, 0.0) * 0.05 * uBlurAmount;

  vec2 texcoord = vTextureCoord;
  texcoord.x += sin(texcoord.y * 4.0 * 2.0 * 3.14159 * uWaveAmount + uTime) / 100.0;
  vec4 fragment = (texture2D(uSampler, texcoord) + frameColor)/2.0 + rand(vTextureCoord + mod(uTime, 10.0))/5.0;
  if (uBW){
      gl_FragColor = vec4(fragment.r, fragment.r, fragment.r, 1.0);
  }
  if (!uBW){
      gl_FragColor = fragment;
  }
}