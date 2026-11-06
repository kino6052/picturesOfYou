/*
 * Post-processing vertex shader: stretches the unit quad over the whole viewport
 */

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main(void) {
  vTextureCoord = aTextureCoord;
  gl_Position = vec4(-aVertexPosition * 2.1, 1.0);
}
