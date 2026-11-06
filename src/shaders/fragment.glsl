/*
 * Primary fragment shader: a texture, or the lit color from the vertex shader
 */

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;
varying float vDistance;

void main(void) {
  vec4 color = uIsTextureEnabled ? texture2D(uSampler, vTextureCoord) : vFinalColor;
  gl_FragColor = vec4(mix(color.rgb, FOG_HORIZON, fogAmount(vDistance)), 1.0);
}
