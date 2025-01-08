// Main WebGL rendering context used for all graphics operations
let gl = null;

// Main shader program used for rendering the scene
let prg = null;

// Secondary shader program used for post-processing effects like blur and waves
let postPrg = null;

// Current width of the canvas in pixels - used for viewport and calculations
let c_width = 0;

// Current height of the canvas in pixels - used for viewport and calculations
let c_height = 0;

// Array storing transformation matrices for each rain droplet's position/rotation
let affineTransformationsArray = [];
