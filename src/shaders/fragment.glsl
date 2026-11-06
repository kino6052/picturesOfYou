/*
 * Primary fragment shader: a texture, or the lit color from the vertex shader
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  gl_FragColor = uIsTextureEnabled ? texture2D(uSampler, vTextureCoord) : vFinalColor;
}
