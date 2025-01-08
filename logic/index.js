/**
 * Entry point. This function is invoked when the page is loaded.
 */
function runWebGLApp() {
  initDropletPositions(
    affineTransformationsArray,
    dropletsConfig.dropletQuantity,
    dropletsConfig.spread
  );
  initializeWebGLContext();
  initProgram();
  initBuffers();
  initLights();
  setupVideoElement();
  intializeTextures();
  initFramebuffer(gl);
  setupPostProcessing();
  startRenderingLoop();
  setupEventHandlers();
}

/**
 * Initializes WebGL context and related transformations.
 */
function initializeWebGLContext() {
  gl = utils.getGLContext("canvas-element-id");
}

/**
 * Starts the rendering loop.
 */
function startRenderingLoop() {
  renderLoop();
}
