let videoTexture;
let backgroundTexture;
let polaroidTexture00;
let polaroidTexture01;
let polaroidTexture02;
let polaroidTexture03;

function setTextureParameters(gl) {
  const params = [
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
    [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
  ];

  params.forEach(([param, value]) => {
    gl.texParameteri(gl.TEXTURE_2D, param, value);
  });
}

function configureLoadedTexture(gl, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  setTextureParameters(gl);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function loadImageTexture(gl, imagePath) {
  const texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = () => configureLoadedTexture(gl, texture);
  texture.image.src = imagePath;
  return texture;
}

function intializeTextures() {
  const texturePaths = {
    video: "textures/polaroid.jpg",
    background: "textures/bg.jpg",
    polaroid00: "textures/polaroid04.jpg",
    polaroid01: "textures/polaroid.jpg",
    polaroid02: "textures/polaroid02.png",
    polaroid03: "textures/polaroid03.jpg",
  };

  videoTexture = loadImageTexture(gl, texturePaths.video);
  backgroundTexture = loadImageTexture(gl, texturePaths.background);
  polaroidTexture00 = loadImageTexture(gl, texturePaths.polaroid00);
  polaroidTexture01 = loadImageTexture(gl, texturePaths.polaroid01);
  polaroidTexture02 = loadImageTexture(gl, texturePaths.polaroid02);
  polaroidTexture03 = loadImageTexture(gl, texturePaths.polaroid03);
}

function createTexture(gl, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const params = [
    [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
    [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
  ];

  params.forEach(([param, value]) => {
    gl.texParameteri(gl.TEXTURE_2D, param, value);
  });

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
}
