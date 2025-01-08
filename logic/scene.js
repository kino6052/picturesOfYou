/**
 * Helper function to bind buffers and set up attributes.
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

function initializeFramebuffer() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.useProgram(prg);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(100.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.viewport(0, 0, 2048, 2048);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  mat4.perspective(45, 2048 / 2048, 0.1, 10000.0, pMatrix);
}

function setupViewMatrix() {
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, -1.3, -3.0]);
  mat4.rotate(mvMatrix, (-3.14 * 29) / 180 + mouseY / 10000, [1, 0, 0]);
  mat4.rotate(mvMatrix, mouseX / 10000, [0, 1, 0]);
}

function drawVideoScreen() {
  mvPushMatrix();
  mat4.translate(mvMatrix, [-0.0, 0.65, 0.49]);
  mat4.rotate(mvMatrix, (3.14 * 30) / 180, [0, 1, 0]);
  mat4.scale(mvMatrix, [1.4, 0.95, 0.0]);

  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });

  gl.uniform1i(prg.uIsTextureEnabled, true);

  if (videoTexture) {
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
  }

  if (videoready) {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    } catch (e) {}
  }

  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  mvPopMatrix();
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function drawBackground() {
  mvPushMatrix();
  mat4.translate(mvMatrix, [0, 4, -4]);
  mat4.rotate(mvMatrix, (3.14 * 29) / 180, [1, 0, 0]);
  mat4.scale(mvMatrix, [20, 10, 10]);

  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });

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

  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  mvPopMatrix();
  gl.bindTexture(gl.TEXTURE_2D, null);
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

function drawRainDroplets(startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    mvPushMatrix();
    mat4.translate(mvMatrix, [
      affineTransformationsArray[i][3],
      affineTransformationsArray[i][4],
      affineTransformationsArray[i][5],
    ]);
    mat4.rotate(mvMatrix, affineTransformationsArray[i][0], [1, 0, 0]);
    mat4.rotate(mvMatrix, affineTransformationsArray[i][1], [0, 1, 0]);
    mat4.rotate(mvMatrix, affineTransformationsArray[i][2], [0, 0, 1]);
    mat4.scale(mvMatrix, [0.3, 0.3, 0.3]);

    bindBuffersAndAttributes({
      positionBuffer: screenVerticesBuffer,
      normalBuffer: screenNormalsBuffer,
      textureCoordBuffer: screenTextureCoordBuffer,
      program: prg,
    });

    gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    mvPopMatrix();
  }
}

function drawRainEffect() {
  setupRainTexture(polaroidTexture00);
  drawRainDroplets(0, dropletQuantity / 4);
  gl.bindTexture(gl.TEXTURE_2D, null);

  setupRainTexture(polaroidTexture01);
  drawRainDroplets(dropletQuantity / 4, dropletQuantity / 2);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function drawTVModel() {
  gl.disableVertexAttribArray(prg.aTextureCoord);
  mvPushMatrix();
  mat4.translate(mvMatrix, [0, 0, 0]);
  mat4.rotate(mvMatrix, (3.14 * 30) / 180, [0, 1, 0]);
  mat4.scale(mvMatrix, [0.6, 0.6, 0.6]);

  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, tvNormalsBuffer);
  gl.vertexAttribPointer(prg.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.uniform1i(prg.uIsTextureEnabled, false);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.drawElements(gl.TRIANGLES, tv.indices.length, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  mat4.set(mvMatrix, nMatrix);
  mat4.inverse(nMatrix);
  mat4.transpose(nMatrix);

  gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);
  gl.flush();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function applyPostProcessing() {
  gl.useProgram(postPrg);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(100.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, c_width, c_height);
  gl.enableVertexAttribArray(postPrg.aTextureCoord);

  mat4.identity(postMatrix);

  gl.uniformMatrix4fv(postPrg.uMVMatrix, false, postMatrix);
  gl.uniformMatrix4fv(postPrg.uPMatrix, false, pMatrix);
  gl.uniform1f(postPrg.uTime, time);

  gl.bindBuffer(gl.ARRAY_BUFFER, screenVerticesBuffer);
  gl.vertexAttribPointer(postPrg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, screenNormalsBuffer);
  gl.vertexAttribPointer(postPrg.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

  gl.uniform1i(postPrg.uIsTextureEnabled, true);

  gl.bindBuffer(gl.ARRAY_BUFFER, screenTextureCoordBuffer);
  gl.vertexAttribPointer(postPrg.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);

  gl.uniformMatrix4fv(postPrg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(postPrg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.flush();
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

  updateAffineTransformationsArray();
}
