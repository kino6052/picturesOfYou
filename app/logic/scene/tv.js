const video = document.createElement("video");
let videoready = false;

function setupTVModelTransformations() {
  mvPushMatrix();
  mat4.translate(mvMatrix, [0, 0, 0]);
  mat4.rotate(mvMatrix, (3.14 * 30) / 180, [0, 1, 0]);
  mat4.scale(mvMatrix, [0.6, 0.6, 0.6]);
}

function setupTVModelBuffers() {
  gl.disableVertexAttribArray(prg.aTextureCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, tvNormalsBuffer);
  gl.vertexAttribPointer(prg.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
}

function setupTVModelUniforms() {
  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);
  gl.uniform1i(prg.uIsTextureEnabled, false);
}

function renderTVModel() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.drawElements(gl.TRIANGLES, tv.indices.length, gl.UNSIGNED_SHORT, 0);
}

function cleanupTVModel() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function setupVideoScreenTransform() {
  mvPushMatrix();
  mat4.translate(mvMatrix, [-0.0, 0.65, 0.49]);
  mat4.rotate(mvMatrix, (3.14 * 30) / 180, [0, 1, 0]);
  mat4.scale(mvMatrix, [1.4, 0.95, 0.0]);
}

function setupVideoTexture() {
  gl.uniform1i(prg.uIsTextureEnabled, true);

  if (videoTexture) {
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  }

  if (videoready) {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    } catch (e) {}
  }
}

function renderVideoScreen() {
  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function cleanupVideoScreen() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  mvPopMatrix();
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function drawVideoScreen() {
  setupVideoScreenTransform();

  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });

  setupVideoTexture();
  renderVideoScreen();
  cleanupVideoScreen();
}

function drawTVModel() {
  setupTVModelTransformations();
  setupTVModelBuffers();
  setupTVModelUniforms();
  renderTVModel();
  cleanupTVModel();
  updateNormalMatrix();

  gl.flush();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function setupVideoElement() {
  video.autoplay = true;
  video.loop = true;
  video.src = "app/assets/pictures.mp4";
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  video.oncanplay = () => (videoready = true);
  video.onerror = handleVideoError;

  video.play();
}

function handleVideoError() {
  const errorMessages = {
    1: "Video loading aborted",
    2: "Network loading error",
    3: "Video decoding failed / corrupted data or unsupported codec",
    4: "Video not supported",
  };
  const err = errorMessages[video.error.code] || "Unknown error";
  log(`Error: ${err} (errorcode=${video.error.code})`, "color:red;");
}

function createScreenBuffers(glContext, program, buffers) {
  screenVerticesBuffer = createBuffer(glContext, buffers.screenVertices);
  screenNormalsBuffer = createBuffer(glContext, buffers.screenNormals);
  screenIndicesBuffer = createElementBuffer(glContext, buffers.screenIndices);
  screenTextureCoordBuffer = createBuffer(glContext, buffers.textureCoords);

  // Setup texture coordinates
  glContext.enableVertexAttribArray(program.aTextureCoord);
  glContext.uniform1i(program.samplerUniform, 0);
}

function createTVModelBuffers(glContext, tvModel, buffers) {
  verticesBuffer = createBuffer(glContext, tvModel.vertices);
  tvNormalsBuffer = createBuffer(glContext, buffers.normals);
  indicesBuffer = createElementBuffer(glContext, tvModel.indices);
}
