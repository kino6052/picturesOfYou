// Helper function to create and configure a texture
const createTexture = (gl, width, height) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  const textureParams = [
    [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ];

  textureParams.forEach(([param, value]) => {
    gl.texParameteri(gl.TEXTURE_2D, param, value);
  });

  // Allocate texture storage
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );

  return texture;
};

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


// Main function to initialize the framebuffer and assign global variables
function initFramebuffer(gl, width = 2048, height = 2048) {
  if (!gl) {
    throw new Error("WebGL context is required");
  }

  // 1. Initialize Color Texture
  framebufferTexture = createTexture(gl, width, height);

  // 2. Initialize Render Buffer (Depth Buffer)
  renderbuffer = createRenderbuffer(gl, width, height);

  // 3. Initialize and Set Up Frame Buffer
  framebuffer = createFramebuffer(gl, framebufferTexture, renderbuffer);

  // 4. Check if framebuffer is complete
  checkFramebufferComplete(gl);

  // Clean up bindings
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Assign to global variables
  framebufferTexture = framebufferTexture;
  renderbuffer = renderbuffer;
  framebuffer = framebuffer;

  return true;
}