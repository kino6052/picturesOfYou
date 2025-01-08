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
