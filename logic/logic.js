var gl = null; // WebGL context
var prg = null; // The program (shaders)
var postPrg = null;
var c_width = 0; // Variable to store the width of the canvas
var c_height = 0; // Variable to store the height of the canvas

var mvMatrix = mat4.create(); // The Model-View matrix
var postMatrix = mat4.create(); // Model-view matrix for post processing
var pMatrix = mat4.create(); // The projection matrix

/*-----------------------------------------------------*/
var nMatrix = mat4.create(); // The normal matrix
/*-----------------------------------------------------*/

var verticesBuffer;
var indicesBuffer;
var screenVerticesBuffer;
var screenIndicesBuffer;
var screenNormalsBuffer;

/*-----------------------------------------------------*/
var tvNormalsBuffer; //VBO for Normals
/*-----------------------------------------------------*/
var screenTextureCoordBuffer;

var vertices;
var indices;
/*-----------------------------------------------------*/
var normals; //JavaScript Array for Normals
/*-----------------------------------------------------*/
var textureCoords;
var affineTransformationsArray = [];

var time = 0;
var timeIncrement = 0.05;
/* MOUSE INTERACTION */
var mouseX = 0;
var mouseY = 0;

/* VIDEO TEXTURE */
var video = document.createElement("video");
var videoready = false;

/* POST PROCESSING */
var framebuffer;
var renderbuffer;
var blurAmount = 1.0;
var waveAmount = 1.0;
var bw = 0;

// droplets
var dropletQuantity = 100;
var speed = 0.01;
var rotationSpeed = 0.01;
var spread = 3000;

/* TEXTURE OPERATIONS */
var videoTexture;
var backgroundTexture;
var polaroidTexture00;
var polaroidTexture01;
var polaroidTexture02;
var polaroidTexture03;
var framebufferTexture;

/* MATRIX OPERATIONS */
var mvMatrixStack = [];



/*
 * INITIALIZE LIGHTS
 * Description:
 * Pass direction, diffuse color, and material diffuse
 * to the GPU
 */
function initLightsWithContext(glContext, program) {
  glContext.uniform3fv(program.uLightDirection, [0.0, -1.0, -1.0]);
  glContext.uniform4fv(program.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
  glContext.uniform4fv(program.uMaterialDiffuse, [0.5, 0.5, 0.5, 1.0]);
}

/**
 * This function generates SPHERE data and creates the buffers
 */
function initBuffersWithContext(glContext, program, tvModel) {
  const buffers = {
    screenVertices: [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0],
    screenIndices: [0, 2, 1, 1, 2, 3],
    textureCoords: [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  };

  buffers.screenNormals = utils.calculateNormals(buffers.screenVertices, buffers.screenIndices);
  buffers.normals = utils.calculateNormals(tvModel.vertices, tvModel.indices);

  // Vertex Buffer for the Plane with Video Texture
  screenVerticesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenVerticesBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.screenVertices),
    glContext.STATIC_DRAW
  );

  // Normals Buffer for the Plane with Video Texture
  screenNormalsBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenNormalsBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.screenNormals),
    glContext.STATIC_DRAW
  );

  // Index Buffer for the Plane with Video Texture
  screenIndicesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  glContext.bufferData(
    glContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(buffers.screenIndices),
    glContext.STATIC_DRAW
  );

  // Texture Coordinates Buffer for the Plane with Video Texture
  screenTextureCoordBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, screenTextureCoordBuffer);
  glContext.bufferData(
    glContext.ARRAY_BUFFER,
    new Float32Array(buffers.textureCoords),
    glContext.STATIC_DRAW
  );
  glContext.enableVertexAttribArray(program.aTextureCoord);
  glContext.uniform1i(program.samplerUniform, 0);

  // Vertex Buffer for the TV Object
  verticesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, verticesBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(tvModel.vertices), glContext.STATIC_DRAW);

  // Normals Buffer for the TV Object
  tvNormalsBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ARRAY_BUFFER, tvNormalsBuffer);
  glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array(buffers.normals), glContext.STATIC_DRAW);

  // Indices Buffer for the TV Object
  indicesBuffer = glContext.createBuffer();
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  glContext.bufferData(
    glContext.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(tvModel.indices),
    glContext.STATIC_DRAW
  );

  return buffers;
}


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

/**
 * Render Loop
 */
function renderLoopWithDeps(drawSceneFn, animFrameFn, timeState) {
  animFrameFn(() => renderLoopWithDeps(drawSceneFn, animFrameFn, timeState));
  drawSceneFn();
  timeState.time += timeState.timeIncrement;
}

function initProgram() {
  const programs = initProgramWithContext(gl);
  prg = programs.prg;
  postPrg = programs.postPrg;
}

function initLights() {
  initLightsWithContext(gl, prg);
}

function initBuffers() {
  initBuffersWithContext(gl, prg, tv);
}

function renderLoop() {
  renderLoopWithDeps(
    drawScene,
    utils.requestAnimFrame,
    { time, timeIncrement }
  );
}
