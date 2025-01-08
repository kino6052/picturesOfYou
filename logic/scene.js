const video = document.createElement("video");
let videoready = false;

const dropletsConfig = {
  dropletQuantity: 100,
  speed: 0.01,
  rotationSpeed: 0.01,
  spread: 3000,
};

/* POST PROCESSING */

var renderbuffer;

/*
 * INITIALIZE LIGHTS
 * Description:
 * Pass direction, diffuse color, and material diffuse
 * to the GPU
 */
function initLightsWithContext(glContext, program) {
  glContext.uniform3fv(program.uLightDirection, [0.0, -1.0, -1.0]);
  glContext.uniform4fv(program.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
  glContext.uniform4fv(program.uMaterialDiffuse, [0.5, 0.5, 0.5, 1.0]);
}

function setupViewMatrix() {
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, -1.3, -3.0]);
  mat4.rotate(mvMatrix, (-3.14 * 29) / 180 + mouseY / 10000, [1, 0, 0]);
  mat4.rotate(mvMatrix, mouseX / 10000, [0, 1, 0]);
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

function setupBackgroundTransform() {
  mvPushMatrix();
  mat4.translate(mvMatrix, [0, 4, -4]);
  mat4.rotate(mvMatrix, (3.14 * 29) / 180, [1, 0, 0]);
  mat4.scale(mvMatrix, [20, 10, 10]);
}

function setupBackgroundTexture() {
  gl.uniform1i(prg.uIsTextureEnabled, true);
  gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    backgroundTexture.image
  );
}

function renderBackground() {
  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function cleanupBackground() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  mvPopMatrix();
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function drawBackground() {
  setupBackgroundTransform();

  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });

  setupBackgroundTexture();
  renderBackground();
  cleanupBackground();
}

function setupRainTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    texture.image
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_NEAREST
  );
  gl.generateMipmap(gl.TEXTURE_2D);
}

function applyTransformations(transformations) {
  mvPushMatrix();
  mat4.translate(mvMatrix, [
    transformations[3],
    transformations[4],
    transformations[5],
  ]);
  mat4.rotate(mvMatrix, transformations[0], [1, 0, 0]);
  mat4.rotate(mvMatrix, transformations[1], [0, 1, 0]);
  mat4.rotate(mvMatrix, transformations[2], [0, 0, 1]);
  mat4.scale(mvMatrix, [0.3, 0.3, 0.3]);
}

function setupRainDropletBuffers() {
  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });
}

function renderRainDroplet() {
  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function cleanupRainDroplet() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  mvPopMatrix();
}

function drawRainDroplets(startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    applyTransformations(affineTransformationsArray[i]);
    setupRainDropletBuffers();
    renderRainDroplet();
    cleanupRainDroplet();
  }
}

function drawRainEffect() {
  setupRainTexture(polaroidTexture00);
  drawRainDroplets(0, dropletsConfig.dropletQuantity / 4);
  gl.bindTexture(gl.TEXTURE_2D, null);

  setupRainTexture(polaroidTexture01);
  drawRainDroplets(
    dropletsConfig.dropletQuantity / 4,
    dropletsConfig.dropletQuantity / 2
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
}
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

function updateNormalMatrix() {
  mat4.set(mvMatrix, nMatrix);
  mat4.inverse(nMatrix);
  mat4.transpose(nMatrix);
  gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);
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
function setupPostProcessingState() {
  gl.useProgram(postPrg);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(100.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, c_width, c_height);
  gl.enableVertexAttribArray(postPrg.aTextureCoord);
}

function setupPostProcessingMatrices() {
  mat4.identity(postMatrix);
  gl.uniformMatrix4fv(postPrg.uMVMatrix, false, postMatrix);
  gl.uniformMatrix4fv(postPrg.uPMatrix, false, pMatrix);
  gl.uniform1f(postPrg.uTime, time);
}

function setupPostProcessingBuffers() {
  gl.bindBuffer(gl.ARRAY_BUFFER, screenVerticesBuffer);
  gl.vertexAttribPointer(postPrg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, screenNormalsBuffer);
  gl.vertexAttribPointer(postPrg.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, screenTextureCoordBuffer);
  gl.vertexAttribPointer(postPrg.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
}

function setupPostProcessingTextures() {
  gl.uniform1i(postPrg.uIsTextureEnabled, true);
  gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);
  gl.uniformMatrix4fv(postPrg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(postPrg.uPMatrix, false, pMatrix);
}

function renderPostProcessing() {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function cleanupPostProcessing() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.flush();
}

function applyPostProcessing() {
  setupPostProcessingState();
  setupPostProcessingMatrices();
  setupPostProcessingBuffers();
  setupPostProcessingTextures();
  renderPostProcessing();
  cleanupPostProcessing();
}

/**
 * Main rendering function. Called every 500ms according to WebGLStart function
 */
function drawScene() {
  try {
    initializeFramebuffer();
    setupViewMatrix();

    drawVideoScreen();
    drawBackground();
    drawRainEffect();
    drawTVModel();
    applyPostProcessing();
  } catch (err) {
    alert(err);
  }

  updateAffineTransformationsArray(
    affineTransformationsArray,
    dropletsConfig.rotationSpeed,
    dropletsConfig.speed
  );
}
