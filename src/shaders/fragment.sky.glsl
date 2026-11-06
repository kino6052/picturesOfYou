/*
 * Skybox fragment shader. The ground in the cube map gets the same fog as everything else, as
 * if it were a plane under the viewer. It reaches full fog at the horizon, and the sky starts
 * from full fog there and clears with height, so the two meet with no line between them.
 */

uniform samplerCube uSky;
uniform float uFogHeight;

varying vec3 vDirection;

const float EYE_HEIGHT = 1.6;

void main(void) {
  vec3 direction = normalize(vDirection);
  float fog = direction.y < 0.0
    ? fogAmount(EYE_HEIGHT / max(-direction.y, 0.001))
    : exp(-direction.y * uFogHeight);
  if (uFogDensity <= 0.0) fog = 0.0;
  gl_FragColor = vec4(mix(textureCube(uSky, direction).rgb, fogColor(direction), fog), 1.0);
}
