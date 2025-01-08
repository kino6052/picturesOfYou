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

/**
 * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
 * what to do with every vertex and fragment that we pass it.
 * The vertex shader and the fragment shader together are called the program.
 */
function initProgramWithContext(glContext) {
  var fragmentShader = utils.getShader(glContext, "shader-fs");
  var vertexShader = utils.getShader(glContext, "shader-vs");
  var postVertexShader = utils.getShader(glContext, "shader-post-vs");
  var postShader = utils.getShader(glContext, "shader-post-fs");

  const programs = {
    postPrg: glContext.createProgram(),
    prg: glContext.createProgram()
  };

  // Initialize post program
  glContext.attachShader(programs.postPrg, postVertexShader);
  glContext.attachShader(programs.postPrg, postShader);
  glContext.linkProgram(programs.postPrg);

  if (!glContext.getProgramParameter(programs.postPrg, glContext.LINK_STATUS)) {
    throw new Error("Could not initialise post shaders");
  }

  // Locations of Various Resources that "prg" will be Using
  programs.postPrg.aVertexPosition = glContext.getAttribLocation(programs.postPrg, "aVertexPosition");
  programs.postPrg.aVertexNormal = glContext.getAttribLocation(programs.postPrg, "aVertexNormal");
  programs.postPrg.aTextureCoord = glContext.getAttribLocation(programs.postPrg, "aTextureCoord");

  programs.postPrg.uPMatrix = glContext.getUniformLocation(programs.postPrg, "uPMatrix");
  programs.postPrg.uMVMatrix = glContext.getUniformLocation(programs.postPrg, "uMVMatrix");
  programs.postPrg.uNMatrix = glContext.getUniformLocation(programs.postPrg, "uNMatrix");

  programs.postPrg.uMaterialDiffuse = glContext.getUniformLocation(programs.postPrg, "uMaterialDiffuse");
  programs.postPrg.uLightDiffuse = glContext.getUniformLocation(programs.postPrg, "uLightDiffuse");
  programs.postPrg.uLightDirection = glContext.getUniformLocation(programs.postPrg, "uLightDirection");

  programs.postPrg.uIsTextureEnabled = glContext.getUniformLocation(
    programs.postPrg,
    "uIsTextureEnabled"
  );
  programs.postPrg.samplerUniform = glContext.getUniformLocation(programs.postPrg, "uSampler");

  programs.postPrg.uWaveAmount = glContext.getUniformLocation(programs.postPrg, "uWaveAmount");
  programs.postPrg.uBlurAmount = glContext.getUniformLocation(programs.postPrg, "uBlurAmount");
  programs.postPrg.uTime = glContext.getUniformLocation(programs.postPrg, "uTime");
  programs.postPrg.uBW = glContext.getUniformLocation(programs.postPrg, "uBW");

  // Initialize main program
  glContext.attachShader(programs.prg, vertexShader);
  glContext.attachShader(programs.prg, fragmentShader);
  glContext.linkProgram(programs.prg);

  if (!glContext.getProgramParameter(programs.prg, glContext.LINK_STATUS)) {
    throw new Error("Could not initialise main shaders");
  }

  glContext.useProgram(programs.prg);

  // Locations of Various Resources that "prg" will be Using
  programs.prg.aVertexPosition = glContext.getAttribLocation(programs.prg, "aVertexPosition");
  programs.prg.aVertexNormal = glContext.getAttribLocation(programs.prg, "aVertexNormal");
  programs.prg.aTextureCoord = glContext.getAttribLocation(programs.prg, "aTextureCoord");

  programs.prg.uPMatrix = glContext.getUniformLocation(programs.prg, "uPMatrix");
  programs.prg.uMVMatrix = glContext.getUniformLocation(programs.prg, "uMVMatrix");
  programs.prg.uNMatrix = glContext.getUniformLocation(programs.prg, "uNMatrix");

  programs.prg.uMaterialDiffuse = glContext.getUniformLocation(programs.prg, "uMaterialDiffuse");
  programs.prg.uLightDiffuse = glContext.getUniformLocation(programs.prg, "uLightDiffuse");
  programs.prg.uLightDirection = glContext.getUniformLocation(programs.prg, "uLightDirection");

  programs.prg.uIsTextureEnabled = glContext.getUniformLocation(programs.prg, "uIsTextureEnabled");
  programs.prg.samplerUniform = glContext.getUniformLocation(programs.prg, "uSampler");

  return programs;
}

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

/* MATRIX OPERATIONS */
var mvMatrixStack = [];

function mvPushMatrix() {
  mvMatrixStack.push(mvPushMatrixWithState(mvMatrix));
}

function mvPopMatrix() {
  mvMatrix = mvPopMatrixWithStack(mvMatrixStack);
}

function mvPushMatrixWithState(matrix) {
  var copy = mat4.create();
  mat4.set(matrix, copy);
  return copy;
}

function mvPopMatrixWithStack(stack) {
  if (stack.length == 0) {
    throw "Invalid popMatrix!";
  }
  return stack.pop();
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
