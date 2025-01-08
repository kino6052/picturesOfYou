/* TEXTURE OPERATIONS */
var videoTexture;
var backgroundTexture;
var polaroidTexture00;
var polaroidTexture01;
var polaroidTexture02;
var polaroidTexture03;

function handleLoadedTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function loadImageTexture(gl, object, textureName, imagePath) {
  object[textureName] = gl.createTexture();
  object[textureName].image = new Image();
  object[textureName].image.onload = function () {
    handleLoadedTexture(gl, object[textureName]);
  };
  object[textureName].image.src = imagePath;
}
function intializeTextures() {
  const texturePaths = {
    videoTexture: "textures/polaroid.jpg",
    backgroundTexture: "textures/bg.jpg",
    polaroidTexture00: "textures/polaroid04.jpg",
    polaroidTexture01: "textures/polaroid.jpg",
    polaroidTexture02: "textures/polaroid02.png",
    polaroidTexture03: "textures/polaroid03.jpg",
  };

  Object.entries(texturePaths).forEach(([textureName, path]) => {
    loadImageTexture(gl, window, textureName, path);
  });
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
