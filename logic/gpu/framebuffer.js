// Global framebuffer state
// Stores the WebGL framebuffer object that we render our scene into
// Example: A WebGLFramebuffer object that acts as an offscreen rendering target
let framebuffer;

// Stores the texture that the framebuffer renders to
// Example: A WebGLTexture containing RGBA pixel data [r, g, b, a] for each pixel
// rendered by the framebuffer
let framebufferTexture;

// Stores the renderbuffer object used for depth information
// Example: A WebGLRenderbuffer containing depth values [z1, z2, ...] for each pixel,
// used for depth testing during rendering
let renderbuffer;

// Helper function to create and configure a renderbuffer
const createRenderbuffer = (gl, width, height) => {
  const renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  return renderbuffer;
};

// Helper function to create and configure a framebuffer
const createFramebuffer = (gl, texture, renderbuffer) => {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // Attach color and depth buffers
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    renderbuffer
  );

  return framebuffer;
};

// Helper function to check framebuffer completeness
const checkFramebufferComplete = (gl) => {
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer is incomplete: ${status}`);
  }
};

// Initialize framebuffer state and settings
function initializeFramebufferState() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.useProgram(prg);

  // Set clear colors and depth
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(100.0);

  // Configure depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // Set viewport and clear buffers
  gl.viewport(0, 0, 2048, 2048);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set perspective matrix
  mat4.perspective(45, 1.0, 0.1, 10000.0, pMatrix);
}

// Main function to initialize the framebuffer
function initFramebuffer(gl, width = 2048, height = 2048) {
  if (!gl) {
    throw new Error("WebGL context is required");
  }

  // Create and initialize components
  framebufferTexture = createTexture(gl, width, height);
  renderbuffer = createRenderbuffer(gl, width, height);
  framebuffer = createFramebuffer(gl, framebufferTexture, renderbuffer);

  // Verify framebuffer is complete
  checkFramebufferComplete(gl);

  // Clean up bindings
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return true;
}
