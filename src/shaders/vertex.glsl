/*
 * Vertex shader implementing Gouraud shading with Lambert lighting
 */

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uLightDirection;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialDiffuse;

varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
  vec3 L = normalize(uLightDirection);

  // Lambert term: dot product of the normal and the light direction
  float lambertTerm = dot(N, -L);

  vFinalColor = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vFinalColor.a = 1.0;
  vTextureCoord = aTextureCoord;

  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
