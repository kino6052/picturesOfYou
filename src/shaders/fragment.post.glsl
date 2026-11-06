/*
 * Post-processing fragment shader: every effect in one pass.
 * An effect at 0 is skipped, and all of them start at 0, so by default this is a single
 * texture read. uEffects follows EFFECTS in src/settings.ts; fog and motion echo work earlier on.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

uniform float uEffects[13];
uniform float uPulse;
uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uRoundness; // turns screen coordinates into ones where circles are round

#define WAVE uEffects[2]
#define BLUR uEffects[3]
#define MONO uEffects[4]
#define GRAIN uEffects[5]
#define ABERRATION uEffects[6]
#define BLOOM uEffects[7]
#define VIGNETTE uEffects[8]
#define SCANLINES uEffects[9]
#define VHS uEffects[10]
#define KALEIDOSCOPE uEffects[11]

const float TAU = 6.2831853;

varying vec2 vTextureCoord;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

// Mirrors at the edges, so anything that moves the picture has something to show there.
vec2 mirrored(vec2 coord) {
  return 1.0 - abs(1.0 - mod(coord, 2.0));
}

// Blur grows with the distance from the center. The center sample counts double;
// the ring samples all sit on the radius, so each one weighs exp(-1).
vec3 blurred(vec2 coord, float radius) {
  const int SAMPLES = 16;
  const float RING_WEIGHT = 0.36787944;
  vec3 sum = texture2D(uSampler, coord).rgb * 2.0;
  for (int i = 0; i < SAMPLES; i++) {
    float a = float(i) * TAU / float(SAMPLES);
    sum += texture2D(uSampler, coord + vec2(cos(a), sin(a)) * radius / uRoundness).rgb * RING_WEIGHT;
  }
  return sum / (2.0 + float(SAMPLES) * RING_WEIGHT);
}

vec3 picture(vec2 coord, float radius) {
  return radius > 0.0 ? blurred(coord, radius) : texture2D(uSampler, coord).rgb;
}

// What's bright enough to glow, gathered from two rings around a point.
vec3 glow(vec2 coord) {
  vec3 sum = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * TAU / 8.0;
    vec2 direction = vec2(cos(a), sin(a)) / uRoundness;
    sum += max(texture2D(uSampler, coord + direction * 0.009).rgb - 0.6, 0.0);
    sum += max(texture2D(uSampler, coord + direction * 0.022).rgb - 0.6, 0.0) * 0.7;
  }
  return sum / 8.0;
}

void main(void) {
  vec2 center = vec2(0.5, 0.5);
  vec2 coord = vTextureCoord;

  // The beat pushes the whole picture towards the viewer.
  coord = center + (coord - center) * (1.0 - 0.05 * uPulse);

  if (KALEIDOSCOPE > 0.0) {
    vec2 round = (coord - center) * uRoundness;
    float segment = TAU / (2.0 * floor(mix(2.0, 7.0, KALEIDOSCOPE)));
    float angle = mod(atan(round.y, round.x) + uTime * 0.04, segment);
    angle = abs(angle - segment * 0.5);
    coord = mirrored(center + length(round) * vec2(cos(angle), sin(angle)) / uRoundness);
  }

  // Tracking errors: a shaky picture, and a torn band rolling up it.
  float band = 0.0;
  if (VHS > 0.0) {
    float line = floor(vTextureCoord.y * 260.0);
    float beat = floor(uTime * 7.0);
    band = smoothstep(0.07, 0.0, abs(vTextureCoord.y - fract(uTime * 0.05 + 0.2)));
    coord.x += (rand(vec2(line, beat)) - 0.5) * 0.007 * VHS;
    coord.x += band * sin(vTextureCoord.y * 120.0 + uTime * 11.0) * 0.04 * VHS;
    coord = mirrored(coord);
  }

  vec2 toCenter = coord - center;
  float dist = length(toCenter * uRoundness);

  // Radial wave distortion: expanding circles around the center of the screen
  if (WAVE > 0.0) {
    float wave = sin(dist * 20.0 - uTime * 2.0) * 0.03 * WAVE;
    coord = mirrored(center + toCenter * (1.0 + wave));
  }

  float blurRadius = dist * BLUR * 0.06;
  vec3 color = picture(coord, blurRadius);

  // Red and blue drift apart towards the edges, or sideways on a worn tape.
  if (ABERRATION > 0.0 || VHS > 0.0) {
    vec2 split = toCenter * ABERRATION * 0.035 + vec2(0.0035 * VHS, 0.0);
    color.r = picture(mirrored(coord + split), blurRadius).r;
    color.b = picture(mirrored(coord - split), blurRadius).b;
  }

  float glowAmount = BLOOM + uPulse * 0.5;
  if (glowAmount > 0.0) {
    color += glow(coord) * glowAmount * 1.6;
  }

  color *= 1.0 + uPulse * 0.14;

  if (MONO > 0.0) {
    color = mix(color, vec3(color.r), MONO);
  }

  if (VHS > 0.0) {
    color += band * VHS * rand(vec2(gl_FragCoord.y, uTime)) * 0.3;
  }

  if (SCANLINES > 0.0) {
    float scan = sin(gl_FragCoord.y * 3.14159 / (1.5 * uPixelRatio));
    color *= 1.0 - SCANLINES * 0.55 * scan * scan;
  }

  if (VIGNETTE > 0.0) {
    color *= 1.0 - VIGNETTE * 0.9 * smoothstep(0.2, 0.72, length((vTextureCoord - center) * uRoundness));
  }

  if (GRAIN > 0.0) {
    color += (rand(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * GRAIN * 0.28;
  }

  gl_FragColor = vec4(color, 1.0);
}
