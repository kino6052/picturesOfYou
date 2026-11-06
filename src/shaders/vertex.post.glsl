/*
 * Post-processing vertex shader: the quad covers the viewport exactly, one texel per pixel
 */

attribute vec3 aVertexPosition;

varying vec2 vTextureCoord;

void main(void) {
  vTextureCoord = aVertexPosition.xy + 0.5;
  gl_Position = vec4(aVertexPosition.xy * 2.0, 0.0, 1.0);
}
