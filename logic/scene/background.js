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
