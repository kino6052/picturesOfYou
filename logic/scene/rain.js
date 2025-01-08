const dropletsConfig = {
  dropletQuantity: 100,
  speed: 0.01,
  rotationSpeed: 0.01,
  spread: 3000,
};

const createDropletTransform = (spread) => [
  generateRandomAngle(),
  generateRandomAngle(),
  generateRandomAngle(),
  calculateRandomPosition(spread),
  generateRandomVerticalPosition(),
  calculateRandomPosition(spread),
];

function setupRainDropletBuffers() {
  bindBuffersAndAttributes({
    positionBuffer: screenVerticesBuffer,
    normalBuffer: screenNormalsBuffer,
    textureCoordBuffer: screenTextureCoordBuffer,
    program: prg,
  });
}

const createDropletTransforms = (quantity, spread) =>
  Array.from({ length: quantity }, () => createDropletTransform(spread));

const updateDropletTransform = (transform, rotationSpeed, speed) => {
  const updatedAngle = transform[1] - rotationSpeed;
  let updatedPositionY = transform[4] - speed;

  if (updatedPositionY < -5) {
    updatedPositionY = 5;
  }

  return [
    transform[0],
    updatedAngle,
    transform[2],
    transform[3],
    updatedPositionY,
    transform[5],
  ];
};

function setupRainTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    texture.image
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_NEAREST
  );
  gl.generateMipmap(gl.TEXTURE_2D);
}

function renderRainDroplet() {
  gl.uniformMatrix4fv(prg.uMVMatrix, false, mvMatrix);
  gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, screenIndicesBuffer);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function cleanupRainDroplet() {
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  mvPopMatrix();
}

function drawRainDroplets(startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    applyTransformations(affineTransformationsArray[i]);
    setupRainDropletBuffers();
    renderRainDroplet();
    cleanupRainDroplet();
  }
}

function drawRainEffect() {
  setupRainTexture(polaroidTexture00);
  drawRainDroplets(0, dropletsConfig.dropletQuantity / 4);
  gl.bindTexture(gl.TEXTURE_2D, null);

  setupRainTexture(polaroidTexture01);
  drawRainDroplets(
    dropletsConfig.dropletQuantity / 4,
    dropletsConfig.dropletQuantity / 2
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
}

const initDropletPositions = (
  affineTransformationsArray,
  dropletQuantity,
  spread
) => {
  const transforms = createDropletTransforms(dropletQuantity, spread);
  replaceArrayContents(affineTransformationsArray, transforms);
};

const updateDropletPositions = (
  affineTransformationsArray,
  rotationSpeed,
  speed
) => {
  const updatedTransforms = affineTransformationsArray.map((transform) =>
    updateDropletTransform(transform, rotationSpeed, speed)
  );
  replaceArrayContents(affineTransformationsArray, updatedTransforms);
};
