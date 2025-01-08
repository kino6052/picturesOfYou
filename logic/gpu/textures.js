/* TEXTURE OPERATIONS */
var videoTexture;
var backgroundTexture;
var polaroidTexture00;
var polaroidTexture01;
var polaroidTexture02;
var polaroidTexture03;

function intializeTextures() {
  initTexture(gl, window);
  initBackgroundTexture(gl, window);
  initPolaroidTexture00(gl, window);
  initPolaroidTexture01(gl, window);
  initPolaroidTexture02(gl, window);
  initPolaroidTexture03(gl, window);
}

function handleLoadedTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function initBackgroundTexture(gl, object) {
  object.backgroundTexture = gl.createTexture();
  object.backgroundTexture.image = new Image();
  object.backgroundTexture.image.onload = function () {
    handleLoadedTexture(gl, object.backgroundTexture);
  };
  object.backgroundTexture.image.src = "textures/bg.jpg";
}

function initPolaroidTexture00(gl, object) {
  object.polaroidTexture00 = gl.createTexture();
  object.polaroidTexture00.image = new Image();
  object.polaroidTexture00.image.onload = function () {
    handleLoadedTexture(gl, object.polaroidTexture00);
  };
  object.polaroidTexture00.image.src = "textures/polaroid04.jpg";
}

function initPolaroidTexture01(gl, object) {
  object.polaroidTexture01 = gl.createTexture();
  object.polaroidTexture01.image = new Image();
  object.polaroidTexture01.image.onload = function () {
    handleLoadedTexture(gl, object.polaroidTexture01);
  };
  object.polaroidTexture01.image.src = "textures/polaroid.jpg";
}

function initPolaroidTexture02(gl, object) {
  object.polaroidTexture02 = gl.createTexture();
  object.polaroidTexture02.image = new Image();
  object.polaroidTexture02.image.onload = function () {
    handleLoadedTexture(gl, object.polaroidTexture02);
  };
  object.polaroidTexture02.image.src = "textures/polaroid02.png";
}

function initPolaroidTexture03(gl, object) {
  object.polaroidTexture03 = gl.createTexture();
  object.polaroidTexture03.image = new Image();
  object.polaroidTexture03.image.onload = function () {
    handleLoadedTexture(gl, object.polaroidTexture03);
  };
  object.polaroidTexture03.image.src = "textures/polaroid03.jpg";
}

function initTexture(gl, object) {
  object.videoTexture = gl.createTexture();
  object.videoTexture.image = new Image();
  object.videoTexture.image.onload = function () {
    console.log("loaded video texture");
    handleLoadedTexture(gl, object.videoTexture);
  };

  object.videoTexture.image.src = "textures/polaroid.jpg";
}

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