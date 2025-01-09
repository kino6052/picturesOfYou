/* 
 * Vertex shader implementing Gouraud shading with Lambert lighting
 * Handles both textured and untextured rendering
 */

// Vertex attributes
attribute vec3 aVertexPosition;  // Position of vertex
attribute vec3 aVertexNormal;    // Normal vector at vertex  
attribute vec2 aTextureCoord;    // Texture coordinates

// Transformation matrices
uniform mat4 uMVMatrix;    // Model-view matrix
uniform mat4 uPMatrix;     // Projection matrix  
uniform mat4 uNMatrix;     // Normal matrix

// Lighting parameters
uniform vec3 uLightDirection;    // Direction of light source
uniform vec4 uLightDiffuse;      // Color of light
uniform vec4 uMaterialDiffuse;   // Color of object

// Texture control
uniform bool uIsTextureEnabled;

// Values passed to fragment shader
varying vec2 vTextureCoord;
varying vec4 vFinalColor;

void main(void) {
  // Transform and normalize surface normal
  vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal, 1.0)));
  
  // Normalize light direction vector
  vec3 L = normalize(uLightDirection);
  
  // Calculate Lambert term (dot product of normal and light direction)
  float lambertTerm = dot(N, -L);
  
  // Calculate diffuse lighting color
  vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vFinalColor = Id;
  
  // Handle texture coordinates if enabled
  if (uIsTextureEnabled) {
    vFinalColor.a = 1.0;
    vTextureCoord = aTextureCoord;
  }
  if (!uIsTextureEnabled) {
    vFinalColor.a = 1.0;
  }
  
  // Transform vertex position to clip space
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}