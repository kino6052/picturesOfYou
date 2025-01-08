function setupViewMatrix() {
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, -1.3, -3.0]);
  mat4.rotate(mvMatrix, (-3.14 * 29) / 180 + mouseY / 10000, [1, 0, 0]);
  mat4.rotate(mvMatrix, mouseX / 10000, [0, 1, 0]);
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

function updateNormalMatrix() {
  mat4.set(mvMatrix, nMatrix);
  mat4.inverse(nMatrix);
  mat4.transpose(nMatrix);
  gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);
}

function drawScene() {
  try {
    initializeFramebufferState();
    setupViewMatrix();

    drawVideoScreen();
    drawBackground();
    drawRainEffect();
    drawTVModel();
    applyPostProcessing();
  } catch (err) {
    alert(err);
  }

  updateDropletPositions(
    affineTransformationsArray,
    dropletsConfig.rotationSpeed,
    dropletsConfig.speed
  );
}
