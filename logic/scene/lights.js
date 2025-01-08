function initLightsWithContext(glContext, program) {
  glContext.uniform3fv(program.uLightDirection, [0.0, -1.0, -1.0]);
  glContext.uniform4fv(program.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
  glContext.uniform4fv(program.uMaterialDiffuse, [0.5, 0.5, 0.5, 1.0]);
}

function initLights() {
  initLightsWithContext(gl, prg);
}
