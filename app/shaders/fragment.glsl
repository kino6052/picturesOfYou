/*
 * Primary fragment shader for texture mapping
 * Handles both textured and untextured rendering
 */
#ifdef GL_ES
precision highp float;
#endif

// Texture sampler and control flag
uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;

// Interpolated values from vertex shader
varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  // Use texture color if texturing is enabled
  if (uIsTextureEnabled) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
  // Otherwise use the computed vertex color
  if (!uIsTextureEnabled) {
    gl_FragColor = vFinalColor;
  }
}