class MatrixStack {
  constructor() {
    this.stack = [];
    this.currentMatrix = null; // or initialize with identity matrix
  }

  push(matrix) {
    this.stack.push(matrix);
  }

  pop() {
    if (this.stack.length === 0) {
      throw new Error("Invalid popMatrix: Stack is empty");
    }
    this.currentMatrix = this.stack.pop();
    return this.currentMatrix;
  }

  getCurrentMatrix() {
    return this.currentMatrix;
  }
}
