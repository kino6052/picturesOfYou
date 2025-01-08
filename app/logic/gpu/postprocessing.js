let blurAmount = 1.0;
let waveAmount = 1.0;
let bw = 0;

function setupPostProcessing() {
  gl.useProgram(postPrg);
  gl.uniform1f(postPrg.uBlurAmount, blurAmount);
  gl.uniform1f(postPrg.uWaveAmount, waveAmount);
  gl.uniform1i(postPrg.uBW, 0);
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
