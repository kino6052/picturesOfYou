/**
 * Entry point. This function is invoked when the page is loaded.
 */
function runWebGLApp() {
  initializeWebGLContext();
  initializeProgramAndBuffers();
  initializeLighting();
  setupVideoElement();
  initializeTexturesAndFramebuffers();
  setupPostProcessing();
  startRenderingLoop();
  setupEventHandlers();
}

/**
 * Initializes WebGL context and related transformations.
 */
function initializeWebGLContext() {
  initAffineTransformationsArray(
    affineTransformationsArray,
    dropletsConfig.dropletQuantity,
    dropletsConfig.spread
  );
  gl = utils.getGLContext("canvas-element-id");
}

/**
 * Initializes the shaders, program, and buffers.
 */
function initializeProgramAndBuffers() {
  initProgram();
  initBuffers();
}

/**
 * Sets up lighting for the scene.
 */
function initializeLighting() {
  initLights();
}

/**
 * Sets up the video element, including event handlers and playback settings.
 */
function setupVideoElement() {
  video.autoplay = true;
  video.loop = true;
  video.src = "video/pictures.mp4";
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  video.oncanplay = () => (videoready = true);
  video.onerror = handleVideoError;

  video.play();
}

/**
 * Handles video playback errors with specific error messages.
 */
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

/**
 * Initializes all required textures and framebuffers.
 */
function initializeTexturesAndFramebuffers() {
  initTexture(gl, window);
  initBackgroundTexture(gl, window);
  initPolaroidTexture00(gl, window);
  initPolaroidTexture01(gl, window);
  initPolaroidTexture02(gl, window);
  initPolaroidTexture03(gl, window);
  initFramebuffer(gl);
}

/**
 * Starts the rendering loop.
 */
function startRenderingLoop() {
  renderLoop();
}
