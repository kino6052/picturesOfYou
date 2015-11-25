function initTransforms() { // Defines the initial values for the transformation matrices
	
}

function updateTransforms() {
	
}

function setMatrixUniforms() {
	
}

function configure() {
	
}

function load() {
	
}

function draw() {
	
}

function runWebGLApp() {
	app = new WebGLApp("canvas-element-id");
	app.configureGLHook = configure;
	app.loadSceneHook = load;
	app.drawSceneHook = draw;
	app.run();
}