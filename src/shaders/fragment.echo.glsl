/*
 * Motion echo: this frame over what's left of the frames before it. The result is the next
 * frame's history, so anything that moves leaves a trail fading away behind it.
 */
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uCurrent;
uniform sampler2D uHistory;
uniform float uPersistence;

varying vec2 vTextureCoord;

void main(void) {
  vec3 now = texture2D(uCurrent, vTextureCoord).rgb;
  vec3 before = texture2D(uHistory, vTextureCoord).rgb;
  gl_FragColor = vec4(mix(now, before, uPersistence), 1.0);
}
