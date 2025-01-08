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
