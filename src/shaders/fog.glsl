/*
 * Distance fog, put in front of each scene fragment shader. Its colors are measured from the
 * sky: the band just above the horizon, and higher up.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform float uFogDensity;

const vec3 FOG_HORIZON = vec3(0.38, 0.52, 0.64);
const vec3 FOG_HIGH = vec3(0.56, 0.65, 0.74);

vec3 fogColor(vec3 direction) {
  return mix(FOG_HORIZON, FOG_HIGH, clamp(direction.y * 1.6, 0.0, 1.0));
}

float fogAmount(float distance) {
  float depth = distance * uFogDensity;
  return 1.0 - exp(-depth * depth);
}
