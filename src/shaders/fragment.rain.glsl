/*
 * Polaroid fragment shader. The photo shows on both sides: blank backs read as litter.
 */

uniform sampler2D uAtlas;

varying vec2 vTextureCoord;
varying float vShade;
varying vec3 vFromEye;

void main(void) {
  // The bias keeps small photos crisp.
  vec3 color = texture2D(uAtlas, vTextureCoord, -0.5).rgb * vShade;
  float distance = length(vFromEye);
  gl_FragColor = vec4(mix(color, fogColor(vFromEye / distance), fogAmount(distance)), 1.0);
}
