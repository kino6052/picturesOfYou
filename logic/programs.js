
/**
 * Creates and initializes WebGL shader programs.
 * Sets up attribute and uniform locations for both post-processing and main programs.
 */
function createPrograms(glContext, shaders) {
  const programs = {
    postPrg: initShaderProgram(glContext, shaders.postVertexShader, shaders.postShader),
    prg: initShaderProgram(glContext, shaders.vertexShader, shaders.fragmentShader)
  };

  // Set up attribute and uniform locations for both programs
  const attributes = ['aVertexPosition', 'aVertexNormal', 'aTextureCoord'];
  const uniforms = [
    'uPMatrix', 'uMVMatrix', 'uNMatrix',
    'uMaterialDiffuse', 'uLightDiffuse', 'uLightDirection',
    'uIsTextureEnabled', 'samplerUniform'
  ];

  // Additional uniforms for post-processing program
  const postUniforms = ['uWaveAmount', 'uBlurAmount', 'uTime', 'uBW'];

  // Set up locations for both programs
  for (const program of [programs.postPrg, programs.prg]) {
    // Set attribute locations
    attributes.forEach(attr => {
      program[attr] = glContext.getAttribLocation(program, attr);
    });

    // Set uniform locations
    uniforms.forEach(uniform => {
      program[uniform] = glContext.getUniformLocation(program, uniform);
    });
  }

  // Set additional post-processing uniforms
  postUniforms.forEach(uniform => {
    programs.postPrg[uniform] = glContext.getUniformLocation(programs.postPrg, uniform);
  });

  // Set main program as active
  glContext.useProgram(programs.prg);

  return programs;
}

/**
 * Helper function to create and link a shader program
 */
function initShaderProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Failed to initialize shader program');
  }

  return program;
}

/**
 * The program contains a series of instructions that tell the Graphic Processing Unit (GPU)
 * what to do with every vertex and fragment that we pass it.
 * The vertex shader and the fragment shader together are called the program.
 */
function initProgramWithContext(glContext) {
  const shaders = {
    fragmentShader: utils.getShader(glContext, "shader-fs"),
    vertexShader: utils.getShader(glContext, "shader-vs"),
    postVertexShader: utils.getShader(glContext, "shader-post-vs"),
    postShader: utils.getShader(glContext, "shader-post-fs")
  };

  return createPrograms(glContext, shaders);
}