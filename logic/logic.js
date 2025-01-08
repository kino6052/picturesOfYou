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
function initProgram() {
  var fragmentShader = utils.getShader(gl, "shader-fs");
  var vertexShader = utils.getShader(gl, "shader-vs");
  var postVertexShader = utils.getShader(gl, "shader-post-vs");
  var postShader = utils.getShader(gl, "shader-post-fs");

  postPrg = gl.createProgram();
  gl.attachShader(postPrg, postVertexShader);
  gl.attachShader(postPrg, postShader);
  gl.linkProgram(postPrg);

  if (!gl.getProgramParameter(postPrg, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  // Locations of Various Resources that "prg" will be Using
  postPrg.aVertexPosition = gl.getAttribLocation(postPrg, "aVertexPosition");
  postPrg.aVertexNormal = gl.getAttribLocation(postPrg, "aVertexNormal");
  postPrg.aTextureCoord = gl.getAttribLocation(postPrg, "aTextureCoord");

  postPrg.uPMatrix = gl.getUniformLocation(postPrg, "uPMatrix");
  postPrg.uMVMatrix = gl.getUniformLocation(postPrg, "uMVMatrix");
  postPrg.uNMatrix = gl.getUniformLocation(postPrg, "uNMatrix");

  postPrg.uMaterialDiffuse = gl.getUniformLocation(postPrg, "uMaterialDiffuse");
  postPrg.uLightDiffuse = gl.getUniformLocation(postPrg, "uLightDiffuse");
  postPrg.uLightDirection = gl.getUniformLocation(postPrg, "uLightDirection");

  postPrg.uIsTextureEnabled = gl.getUniformLocation(
    postPrg,
    "uIsTextureEnabled"
  );
  postPrg.samplerUniform = gl.getUniformLocation(postPrg, "uSampler");

  postPrg.uWaveAmount = gl.getUniformLocation(postPrg, "uWaveAmount");
  postPrg.uBlurAmount = gl.getUniformLocation(postPrg, "uBlurAmount");
  postPrg.uTime = gl.getUniformLocation(postPrg, "uTime");
  postPrg.uBW = gl.getUniformLocation(postPrg, "uBW");

  prg = gl.createProgram();
  gl.attachShader(prg, vertexShader);
  gl.attachShader(prg, fragmentShader);
  gl.linkProgram(prg);

  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(prg);

  // Locations of Various Resources that "prg" will be Using
  prg.aVertexPosition = gl.getAttribLocation(prg, "aVertexPosition");
  prg.aVertexNormal = gl.getAttribLocation(prg, "aVertexNormal");
  prg.aTextureCoord = gl.getAttribLocation(prg, "aTextureCoord");

  prg.uPMatrix = gl.getUniformLocation(prg, "uPMatrix");
  prg.uMVMatrix = gl.getUniformLocation(prg, "uMVMatrix");
  prg.uNMatrix = gl.getUniformLocation(prg, "uNMatrix");

  prg.uMaterialDiffuse = gl.getUniformLocation(prg, "uMaterialDiffuse");
  prg.uLightDiffuse = gl.getUniformLocation(prg, "uLightDiffuse");
  prg.uLightDirection = gl.getUniformLocation(prg, "uLightDirection");

  prg.uIsTextureEnabled = gl.getUniformLocation(prg, "uIsTextureEnabled");
  prg.samplerUniform = gl.getUniformLocation(prg, "uSampler");
}

/*
 * INITIALIZE LIGHTS
 * Description:
 * Pass direction, diffuse color, and material diffuse
 * to the GPU
 */
function initLights() {
  gl.uniform3fv(prg.uLightDirection, [0.0, -1.0, -1.0]);
  gl.uniform4fv(prg.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
  gl.uniform4fv(prg.uMaterialDiffuse, [0.5, 0.5, 0.5, 1.0]);
}

/**
 * This function generates SPHERE data and creates the buffers
 */
function initBuffers() {
  // Data Necessary to Draw a Plane with Video Texture
  screenVertices = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];
  screenIndices = [0, 2, 1, 1, 2, 3];
  screenNormals = utils.calculateNormals(screenVertices, screenIndices);
  textureCoords = [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0];

  // Data Necessary to Draw a TV object
  // (Note: the vertex and index array are located in the "models" folder)
  normals = utils.calculateNormals(tv.vertices, tv.indices);

  // Vertex Buffer for the Plane with Video Texture
  screenVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, screenVerticesBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(screenVertices),
    gl.STATIC_DRAW
  );

  // Normals Buffer for the Plane with Video Texture
  screenNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, screenNormalsBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(screenNormals),
    gl.STATIC_DRAW
  );

  // Index Buffer for the Plane with Video Texture
  screenIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(screenIndices),
    gl.STATIC_DRAW
  );

  // Texture Coordinates Buffer for the Plane with Video Texture
  screenTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, screenTextureCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(textureCoords),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(prg.aTextureCoord);
  gl.uniform1i(prg.samplerUniform, 0);

  // Vertex Buffer for the TV Object
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv.vertices), gl.STATIC_DRAW);

  // Normals Buffer for the TV Object
  tvNormalsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tvNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // Indices Buffer for the TV Object
  indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(tv.indices),
    gl.STATIC_DRAW
  );
}

/* MATRIX OPERATIONS */
var mvMatrixStack = [];

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
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
function renderLoop() {
  utils.requestAnimFrame(renderLoop);
  drawScene();
  time += timeIncrement;
}
