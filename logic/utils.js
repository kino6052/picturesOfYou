
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