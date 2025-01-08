let time = 0;
let timeIncrement = 0.05;

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
