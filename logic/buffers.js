
/**
 * This function generates SPHERE data and creates the buffers
 */
function initBuffersWithContext(glContext, program, tvModel) {
  const buffers = {
    screenVertices: [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0],
    screenIndices: [0, 2, 1, 1, 2, 3],
    textureCoords: [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  };

  buffers.screenNormals = utils.calculateNormals(buffers.screenVertices, buffers.screenIndices);
  buffers.normals = utils.calculateNormals(tvModel.vertices, tvModel.indices);

  // Vertex Buffer for the Plane with Video Texture
  screenVerticesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenVerticesBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.screenVertices),
    glContext.STATIC_DRAW
  );

  // Normals Buffer for the Plane with Video Texture
  screenNormalsBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenNormalsBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.screenNormals),
    glContext.STATIC_DRAW
  );

  // Index Buffer for the Plane with Video Texture
  screenIndicesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  glContext.bufferData(
    glContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(buffers.screenIndices),
    glContext.STATIC_DRAW
  );

  // Texture Coordinates Buffer for the Plane with Video Texture
  screenTextureCoordBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenTextureCoordBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.textureCoords),
    glContext.STATIC_DRAW
  );
  glContext.enableVertexAttribArray(program.aTextureCoord);
  glContext.uniform1i(program.samplerUniform, 0);

  // Vertex Buffer for the TV Object
  verticesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, verticesBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(tvModel.vertices), glContext.STATIC_DRAW);

  // Normals Buffer for the TV Object
  tvNormalsBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, tvNormalsBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(buffers.normals), glContext.STATIC_DRAW);

  // Indices Buffer for the TV Object
  indicesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  glContext.bufferData(
    glContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(tvModel.indices),
    glContext.STATIC_DRAW
  );

  return buffers;
}

