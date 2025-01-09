let mvMatrix = mat4.create(); // The Model-View matrix
let postMatrix = mat4.create(); // Model-view matrix for post processing
let pMatrix = mat4.create(); // The projection matrix
let mvMatrixStack = [];
let nMatrix = mat4.create(); // The normal matrix

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

function setupViewMatrix() {
  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, [0.0, -1.3, -3.0]);
  mat4.rotate(mvMatrix, (-3.14 * 15) / 180 - mouseY / 2000, [1, 0, 0]);
  mat4.rotate(mvMatrix, (-500 + mouseX) / 1000, [0, 1, 0]);
}

function applyTransformations(transformations) {
  mvPushMatrix();
  mat4.translate(mvMatrix, [
    transformations[3],
    transformations[4],
    transformations[5],
  ]);
  mat4.rotate(mvMatrix, transformations[0], [1, 0, 0]);
  mat4.rotate(mvMatrix, transformations[1], [0, 1, 0]);
  mat4.rotate(mvMatrix, transformations[2], [0, 0, 1]);
  mat4.scale(mvMatrix, [0.3, 0.3, 0.3]);
}

function updateNormalMatrix() {
  mat4.set(mvMatrix, nMatrix);
  mat4.inverse(nMatrix);
  mat4.transpose(nMatrix);
  gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);
}
