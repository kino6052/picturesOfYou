let blurAmount = 1.0;
let waveAmount = 1.0;
let bw = 0;

/**
 * Sets up post-processing effects.
 */
function setupPostProcessing() {
  gl.useProgram(postPrg);
  gl.uniform1f(postPrg.uBlurAmount, blurAmount);
  gl.uniform1f(postPrg.uWaveAmount, waveAmount);
  gl.uniform1i(postPrg.uBW, 0);
}
