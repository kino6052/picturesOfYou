let time = 0;
let timeIncrement = 0.05;

function renderLoopWithDeps(drawSceneFn, animFrameFn, timeState) {
  animFrameFn(() => renderLoopWithDeps(drawSceneFn, animFrameFn, timeState));
  drawSceneFn();
  time += timeIncrement;
}

function renderLoop() {
  renderLoopWithDeps(drawScene, utils.requestAnimFrame, {
    time,
    timeIncrement,
  });
}
