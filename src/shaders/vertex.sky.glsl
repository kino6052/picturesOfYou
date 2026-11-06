/*
 * Skybox vertex shader: a full-screen quad on the far plane. Each corner works out
 * which way it looks, so the sky turns with the camera and never gets closer.
 */

attribute vec3 aVertexPosition;

uniform mat4 uInverseViewProjection;

varying vec3 vDirection;

void main(void) {
  vec4 corner = vec4(aVertexPosition.xy * 2.0, 1.0, 1.0);
  vDirection = (uInverseViewProjection * corner).xyz;
  gl_Position = corner;
}
