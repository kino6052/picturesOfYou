/**
 * Main entry point for the WebGL application. This function initializes all required components
 * in the following order:
 * 1. Sets up rain droplet positions and transformations
 * 2. Initializes WebGL context and core rendering pipeline
 * 3. Sets up video playback and texture resources
 * 4. Configures post-processing effects
 * 5. Starts the render loop and event handling
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
  intializeTextures();
  setupVideoElement();
  initFramebuffer(gl);
  setupPostProcessing();
  startRenderingLoop();
  setupEventHandlers();
}

/**
 * Initializes the WebGL rendering context by obtaining it from the canvas element.
 * The context is stored in the global 'gl' variable which is used throughout the application
 * for all WebGL operations and state management.
 */
function initializeWebGLContext() {
  gl = utils.getGLContext("canvas-element-id");
}

/**
 * Begins the main render loop of the application. This creates an animation loop
 * that continuously updates and renders the scene, including the rain effect,
 * video playback, and post-processing effects. The loop runs indefinitely until
 * the page is closed or the application is stopped.
 */
function startRenderingLoop() {
  renderLoop();
}
