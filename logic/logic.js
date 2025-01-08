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

/* DROPLET PROPERTIES (AFFINE TRANSFORMATIONS)
 *
 *  Project Location: modules/affine-transformations.js)
 *  Description: an array is created that holds information about
 *  rotation and position of particles
 */
var dropletQuantity = 100;
var speed = 0.01;
var rotationSpeed = 0.01;
var spread = 3000;

/*
 * AFFINE TRANSFORMATIONS
 */
function initAffineTransformationsArray() {
  affineTransformationsArray = []; // start with an empty array
  for (var i = 0; i < dropletQuantity; i++) {
    affineTransformationsArray[i] = new Array(0, 0, 0, 0, 0, 0);
    // Random Angles
    affineTransformationsArray[i][0] = (Math.random() * 1000) % 360;
    affineTransformationsArray[i][1] = (Math.random() * 1000) % 360;
    affineTransformationsArray[i][2] = (Math.random() * 1000) % 360;
    // Random Positions
    affineTransformationsArray[i][3] =
      (((Math.random() * 10000) % spread) - spread / 2) / 1000;
    affineTransformationsArray[i][4] =
      10 - ((Math.random() * 10000) % 10000) / 1000;
    affineTransformationsArray[i][5] =
      (((Math.random() * 10000) % spread) - spread / 2) / 1000;
  }
}

function updateAffineTransformationsArray() {
  for (var i = 0; i < dropletQuantity; i++) {
    // Update Angles
    affineTransformationsArray[i][1] -= rotationSpeed;
    affineTransformationsArray[i][1] = affineTransformationsArray[i][1] % 360; // fall
    // Update Verticeal Position
    affineTransformationsArray[i][4] -= speed;
    if (affineTransformationsArray[i][4] < -5) {
      affineTransformationsArray[i][4] = 5;
    }
  }
}

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

/* TEXTURE OPERATIONS */
function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

var videoTexture;
var backgroundTexture;
var polaroidTexture00;
var polaroidTexture01;
var polaroidTexture02;
var polaroidTexture03;
var framebufferTexture;

function initBackgroundTexture() {
  backgroundTexture = gl.createTexture();
  backgroundTexture.image = new Image();
  backgroundTexture.image.onload = function () {
    handleLoadedTexture(backgroundTexture);
  };
  backgroundTexture.image.src = "textures/bg.jpg";
}

function initPolaroidTexture00() {
  polaroidTexture00 = gl.createTexture();
  polaroidTexture00.image = new Image();
  polaroidTexture00.image.onload = function () {
    handleLoadedTexture(polaroidTexture00);
  };
  polaroidTexture00.image.src = "textures/polaroid04.jpg";
}

function initPolaroidTexture01() {
  polaroidTexture01 = gl.createTexture();
  polaroidTexture01.image = new Image();
  polaroidTexture01.image.onload = function () {
    handleLoadedTexture(polaroidTexture01);
  };
  polaroidTexture01.image.src = "textures/polaroid.jpg";
}

function initPolaroidTexture02() {
  polaroidTexture02 = gl.createTexture();
  polaroidTexture02.image = new Image();
  polaroidTexture02.image.onload = function () {
    handleLoadedTexture(polaroidTexture02);
  };
  polaroidTexture02.image.src = "textures/polaroid02.png";
}

function initPolaroidTexture03() {
  polaroidTexture03 = gl.createTexture();
  polaroidTexture03.image = new Image();
  polaroidTexture03.image.onload = function () {
    handleLoadedTexture(polaroidTexture03);
  };
  polaroidTexture03.image.src = "textures/polaroid03.jpg";
}

function initTexture() {
  videoTexture = gl.createTexture();
  videoTexture.image = new Image();
  videoTexture.image.onload = function () {
    console.log("loaded video texture");
    handleLoadedTexture(videoTexture);
  };

  videoTexture.image.src = "textures/polaroid.jpg";
}

/**
 * Initializes a WebGL framebuffer with color and depth attachments
 * @param {WebGLRenderingContext} gl - The WebGL context
 * @param {number} [width=2048] - The width of the framebuffer
 * @param {number} [height=2048] - The height of the framebuffer
 * @returns {boolean} - Returns true if initialization was successful
 * @throws {Error} - Throws if framebuffer is not complete
 */
function initFramebuffer(gl, width = 2048, height = 2048) {
  if (!gl) {
    throw new Error("WebGL context is required");
  }

  // 1. Initialize Color Texture
  framebufferTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, framebufferTexture);

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

  // 2. Initialize Render Buffer (Depth Buffer)
  renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

  // 3. Initialize and Set Up Frame Buffer
  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // Attach color and depth buffers
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    framebufferTexture,
    0
  );

  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    renderbuffer
  );

  // Check framebuffer completeness
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Framebuffer is incomplete: ${status}`);
  }

  // Clean up bindings
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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
