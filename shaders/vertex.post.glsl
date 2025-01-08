/*
  *  VERTEX SHADER (POST)
  *  Many thanks to the "WebGL: Beginner's Guide" Book
  *  This shader implements Goraud shading and Lambert Lighting.
  */
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uLightDirection;   //light direction
uniform vec4 uLightDiffuse;     //light color
uniform vec4 uMaterialDiffuse;  //object color

uniform bool uIsTextureEnabled;
varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  //Transformed normal position
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));

  //Normalize light to calculate lambertTerm
  vec3 L = normalize(uLightDirection);

  //Lambert's cosine law
  float lambertTerm = dot(N,-L);

  //Final Color
  vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vFinalColor = Id;

  if (uIsTextureEnabled) {
      vFinalColor.a = 1.0;
      vTextureCoord = aTextureCoord;
  }
  if (!uIsTextureEnabled) {
      vFinalColor.a = 1.0;
  }

  //Transformed vertex position
  gl_Position = vec4(-aVertexPosition * 2.1, 1.0);

}