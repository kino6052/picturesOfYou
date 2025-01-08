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

/* VIDEO TEXTURE */
var video = document.createElement("video");
var videoready = false;

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

var time = 0;
var timeIncrement = 0.05;
/* MOUSE INTERACTION */
var mouseX = 0;
var mouseY = 0;

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
  renderLoopWithDeps(drawScene, utils.requestAnimFrame, {
    time,
    timeIncrement,
  });
}
