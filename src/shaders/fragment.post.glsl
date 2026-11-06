/*
 * Post-processing fragment shader
 * Applies wave distortion, blur, and the black and white effect
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

uniform float uBlurAmount;
uniform float uWaveAmount;
uniform float uTime;
uniform bool uBW;

varying vec2 vTextureCoord;

void main(void) {
  // Radial wave distortion: expanding circles around the center of the screen
  vec2 center = vec2(0.5, 0.5);
  vec2 toCenter = vTextureCoord - center;
  float dist = length(toCenter);
  float wave = sin(dist * 20.0 * uWaveAmount - uTime * 2.0) * 0.02;
  vec2 texcoord = center + toCenter * (1.0 + wave);

  // Blur grows with the distance from the center. The center sample counts double;
  // the ring samples all sit on blurRadius, so each one weighs exp(-1).
  const int SAMPLES = 16;
  const float RING_WEIGHT = 0.36787944;
  float blurRadius = dist * uBlurAmount * 0.02;
  vec4 blurredColor = texture2D(uSampler, texcoord) * 2.0;

  for (int i = 0; i < SAMPLES; i++) {
    float a = float(i) * (2.0 * 3.14159) / float(SAMPLES);
    vec2 offset = vec2(cos(a), sin(a)) * blurRadius;
    blurredColor += texture2D(uSampler, texcoord + offset) * RING_WEIGHT;
  }

  vec4 fragment = blurredColor / (2.0 + float(SAMPLES) * RING_WEIGHT);
  gl_FragColor = uBW ? vec4(fragment.rrr, 1.0) : fragment;
}
