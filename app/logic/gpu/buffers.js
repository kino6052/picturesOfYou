// Buffer to store the 3D coordinates of the TV model vertices
// Example: [x1,y1,z1, x2,y2,z2, x3,y3,z3, ...] for vertices like (-1,0,0), (1,0,0), (0,1,0)
let verticesBuffer;

// Buffer to store the indices that define how vertices connect to form triangles in the TV model
// Example: [0,1,2, 1,2,3, ...] where each triplet defines a triangle using vertex indices
let indicesBuffer;

// Buffer to store the 3D coordinates of the screen/display vertices
// Example: [x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4] for a quad like (-0.5,-0.5,0), (0.5,-0.5,0), (-0.5,0.5,0), (0.5,0.5,0)
let screenVerticesBuffer;

// Buffer to store the indices that define how vertices connect to form triangles in the screen
// Example: [0,1,2, 1,2,3] to create two triangles forming a quad
let screenIndicesBuffer;

// Buffer to store the normal vectors for the screen surface (used for lighting calculations)
// Example: [nx1,ny1,nz1, nx2,ny2,nz2, ...] where each triplet is a normal vector like (0,0,1)
let screenNormalsBuffer;

// Buffer to store the 2D texture coordinates for mapping images onto surfaces
// Example: [u1,v1, u2,v2, ...] with UV coordinates like (0,0), (1,0), (0,1), (1,1)
let textureCoords;

// Buffer to store the normal vectors for the TV model surface (used for lighting calculations)
// Example: [nx1,ny1,nz1, nx2,ny2,nz2, ...] where each triplet is a normal vector like (0,1,0)
let tvNormalsBuffer;

// Buffer to store the texture coordinates specifically for the screen display
// Example: [u1,v1, u2,v2, u3,v3, u4,v4] like (0,1), (1,1), (0,0), (1,0)
let screenTextureCoordBuffer;

// This function initializes all the WebGL buffers needed to render the TV and screen
// It takes the WebGL context, shader program, and TV model data as inputs
// First it creates basic screen buffers (vertices, indices etc)
// Then calculates normal vectors for both the screen and TV model for lighting
// Finally sets up all the WebGL buffers for both the screen and TV model
// Returns the created buffers for use in rendering
function initBuffersWithContext(glContext, program, tvModel) {
  const buffers = createInitialBuffers();
  buffers.screenNormals = utils.calculateNormals(
    buffers.screenVertices,
    buffers.screenIndices
  );
  buffers.normals = utils.calculateNormals(tvModel.vertices, tvModel.indices);

  createScreenBuffers(glContext, program, buffers);
  createTVModelBuffers(glContext, tvModel, buffers);

  return buffers;
}

function createInitialBuffers() {
  return {
    screenVertices: [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0],
    screenIndices: [0, 2, 1, 1, 2, 3],
    textureCoords: [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0],
  };
}

function createBuffer(glContext, data) {
  const buffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(data),
    glContext.STATIC_DRAW
  );
  return buffer;
}

function createElementBuffer(glContext, data) {
  const buffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, buffer);
  glContext.bufferData(
    glContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(data),
    glContext.STATIC_DRAW
  );
  return buffer;
}

function initBuffers() {
  initBuffersWithContext(gl, prg, tv);
}

/**
 * Transfers geometry data from JavaScript arrays to GPU memory buffers for rendering.
 *
 * Binding is the process of telling the GPU which buffer to use as the current data source.
 * The GPU stores data in array-like structures called buffers. Before we can send data to
 * these buffers or read from them, we need to "bind" them to make them the active target.
 *
 * This function binds three types of data:
 * 1. Vertex positions: The 3D coordinates of each vertex
 * 2. Vertex normals: Direction vectors used for lighting calculations
 * 3. Texture coordinates: 2D coordinates for mapping images onto surfaces
 *
 * Each buffer is bound, then its data format is specified via vertexAttribPointer,
 * and finally enabled for use in the vertex shader.
 */
function bindBuffersAndAttributes({
  positionBuffer,
  normalBuffer,
  textureCoordBuffer,
  program,
}) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexNormal);

  if (textureCoordBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(program.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.aTextureCoord);
  }
}
