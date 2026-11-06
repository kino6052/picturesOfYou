/*
 * Polaroid vertex shader. Every picture is one instance of the same quad:
 * its position and turn change each frame, its tile and size never do.
 */

attribute vec3 aVertexPosition;
attribute vec3 aInstancePosition;
attribute vec3 aInstanceTurn;
attribute vec2 aInstanceLook;

uniform mat4 uViewProjection;
uniform vec3 uEye;
uniform vec3 uLightDirection;
uniform float uLightDiffuse;
uniform vec2 uAtlasGrid;
uniform vec2 uFallRange;

varying vec2 vTextureCoord;
varying float vShade;
varying vec3 vFromEye;

mat3 turnMatrix(vec3 turn) {
  vec3 s = sin(turn);
  vec3 c = cos(turn);
  return mat3(
    c.y * c.z, c.x * s.z + s.x * s.y * c.z, s.x * s.z - c.x * s.y * c.z,
    -c.y * s.z, c.x * c.z - s.x * s.y * s.z, s.x * c.z + c.x * s.y * s.z,
    s.y, -s.x * c.y, c.x * c.y
  );
}

void main(void) {
  mat3 turn = turnMatrix(aInstanceTurn);

  // Pictures shrink away at the ground and grow in at the top, rather than pop.
  float y = aInstancePosition.y;
  float size = aInstanceLook.y * smoothstep(uFallRange.x, uFallRange.x + 0.35, y)
    * smoothstep(uFallRange.y, uFallRange.y - 0.9, y);

  // A polaroid is a little taller than it is wide.
  vec3 corner = vec3(aVertexPosition.xy * vec2(0.8333, 1.0) * size, 0.0);
  vec3 world = aInstancePosition + turn * corner;

  float tile = aInstanceLook.x;
  vec2 cell = vec2(mod(tile, uAtlasGrid.x), floor(tile / uAtlasGrid.x));
  vTextureCoord = (cell + vec2(aVertexPosition.x + 0.5, 0.5 - aVertexPosition.y)) / uAtlasGrid;

  // Paper catches the light as it turns, whichever side faces up.
  float facing = abs(dot(turn[2], normalize(uLightDirection)));
  vShade = (0.62 + 0.5 * facing) * uLightDiffuse;
  vFromEye = world - uEye;

  gl_Position = uViewProjection * vec4(world, 1.0);
}
