/*
  *  FRAGMENT SHADER (PRIMARY)
  *  Many thanks to the "WebGL: Beginner's Guide" Book
  *  This shader is responsible for texture mapping.
  */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform bool uIsTextureEnabled;
varying vec2 vTextureCoord;
varying vec4  vFinalColor;

void main(void)  {

  if (uIsTextureEnabled) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
  if (!uIsTextureEnabled) {
      gl_FragColor = vFinalColor; //texture2D(uSampler, vTextureCoord);
  }
}