import { mat4 } from "gl-matrix";
import type { Camera } from "./camera";
import type { Model } from "./model";
import { ATLAS_COLUMNS, ATLAS_ROWS, CEILING, GROUND, type Rain } from "./rain";
import { FOG, MOTION_ECHO, type settings } from "./settings";
import fogSource from "./shaders/fog.glsl?raw";
import vertexSource from "./shaders/vertex.glsl?raw";
import fragmentSource from "./shaders/fragment.glsl?raw";
import rainVertexSource from "./shaders/vertex.rain.glsl?raw";
import rainFragmentSource from "./shaders/fragment.rain.glsl?raw";
import skyVertexSource from "./shaders/vertex.sky.glsl?raw";
import skyFragmentSource from "./shaders/fragment.sky.glsl?raw";
import postVertexSource from "./shaders/vertex.post.glsl?raw";
import postFragmentSource from "./shaders/fragment.post.glsl?raw";
import echoFragmentSource from "./shaders/fragment.echo.glsl?raw";

export interface Assets {
  model: Model;
  /** Faces in the order +x, -x, +y, -y, +z, -z. */
  sky: HTMLImageElement[];
  atlas: HTMLImageElement;
}

export interface Frame {
  camera: Camera;
  seconds: number;
  time: number;
  pixelRatio: number;
  video: HTMLVideoElement;
  settings: typeof settings;
}

// Every program uses these slots, so one set of buffers serves them all.
const POSITION = 0;
const NORMAL = 1;
const TEXTURE_COORD = 2;
const INSTANCE_POSITION = 3;
const INSTANCE_TURN = 4;
const INSTANCE_LOOK = 5;
const ATTRIBUTES = {
  aVertexPosition: POSITION,
  aVertexNormal: NORMAL,
  aTextureCoord: TEXTURE_COORD,
  aInstancePosition: INSTANCE_POSITION,
  aInstanceTurn: INSTANCE_TURN,
  aInstanceLook: INSTANCE_LOOK,
};

const QUAD_VERTICES = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];
const QUAD_TEXTURE_COORDS = [0, 1, 1, 1, 0, 0, 1, 0];
const QUAD_INDICES = [0, 2, 1, 1, 2, 3];

// The TV stands on the ground in front of the viewer, facing them.
const TV_PLACE: [number, number, number] = [0, GROUND, -4.4];
const TV_SIZE: [number, number, number] = [1.25, 1.25, 1.25];
const TV_TURN = -0.16;
const TV_BODY_SCALE: [number, number, number] = [0.6, 0.6, 0.6];
const TV_SCREEN_PLACE: [number, number, number] = [-0.245, 0.65, 0.424];
const TV_SCREEN_SCALE: [number, number, number] = [1.4, 0.95, 0];

// A fog amount of 1 is this dense, and thins the sky out with height at this rate.
const FOG_DENSITY = 0.16;
const FOG_HEIGHT = 2.5;

// Motion echo: how long a trail takes to fade to about a third, from the slider's low end to
// its high end, in seconds. Without float buffers rounding stops long trails from fading out.
const ECHO_SHORTEST = 0.02;
const ECHO_LONGEST = 1.6;
const MAX_PERSISTENCE_IN_8_BITS = 0.92;

const NEAR = 0.1;
const FAR = 200;
const MAX_SAMPLES = 4;
const DEPTH_ONLY = [WebGL2RenderingContext.DEPTH_ATTACHMENT];

function createProgram<U extends string>(
  gl: WebGL2RenderingContext,
  vertexShader: string,
  fragmentShader: string,
  uniformNames: U[],
) {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertexShader],
    [gl.FRAGMENT_SHADER, fragmentShader],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      throw new Error(`Shader error: ${gl.getShaderInfoLog(shader)}`);
    }
  }
  for (const [name, slot] of Object.entries(ATTRIBUTES)) gl.bindAttribLocation(program, slot, name);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
    throw new Error(`Program error: ${gl.getProgramInfoLog(program)}`);
  }

  const uniforms = Object.fromEntries(uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]));
  return { program, uniforms: uniforms as Record<U, WebGLUniformLocation | null> };
}

function createBuffer(gl: WebGL2RenderingContext, target: GLenum, data: BufferSource) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  return buffer;
}

function attribute(gl: WebGL2RenderingContext, slot: number, size: number, buffer: WebGLBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(slot, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(slot);
}

function createTexture(gl: WebGL2RenderingContext, target: GLenum = gl.TEXTURE_2D) {
  const texture = gl.createTexture();
  gl.bindTexture(target, texture);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function createAtlasTexture(gl: WebGL2RenderingContext, atlas: HTMLImageElement) {
  const texture = createTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  // Keeps photos readable while they're tilted away from the viewer.
  const anisotropic = gl.getExtension("EXT_texture_filter_anisotropic");
  if (anisotropic) gl.texParameterf(gl.TEXTURE_2D, anisotropic.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  return texture;
}

function createCubeTexture(gl: WebGL2RenderingContext, faces: HTMLImageElement[]) {
  const texture = createTexture(gl, gl.TEXTURE_CUBE_MAP);
  faces.forEach((face, index) =>
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, face),
  );
  return texture;
}

/**
 * The offscreen picture the scene is drawn into before post-processing. Polaroids turning edge-on
 * would shimmer without antialiasing, and a canvas's own antialiasing doesn't reach offscreen, so
 * the scene goes to multisampled buffers and is resolved into a texture for the post pass.
 */
function createTarget(gl: WebGL2RenderingContext, width: number, height: number) {
  const samples = Math.min(MAX_SAMPLES, gl.getParameter(gl.MAX_SAMPLES));
  const color = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, color);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, width, height);
  const depth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, width, height);

  const scene = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, scene);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, color);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);

  const texture = createTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  const resolved = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, resolved);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && !gl.isContextLost()) {
    throw new Error("Could not create the offscreen framebuffer");
  }
  return { width, height, color, depth, scene, texture, resolved };
}

/** Two screen-sized buffers that take turns being the motion echo's history and its result. */
function createEcho(gl: WebGL2RenderingContext, width: number, height: number) {
  const float = gl.getExtension("EXT_color_buffer_float") !== null;
  const buffers = [0, 1].map(() => {
    const texture = createTexture(gl);
    if (float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, framebuffer };
  });
  return { float, buffers, latest: 0 };
}

/** Builds everything that lives on the GPU. Called again after a lost context comes back. */
export function createRenderer(gl: WebGL2RenderingContext, { model, sky, atlas }: Assets, rain: Rain) {
  const tvProgram = createProgram(gl, vertexSource, fogSource + fragmentSource, [
    "uFogDensity",
    "uPMatrix",
    "uMVMatrix",
    "uNMatrix",
    "uMaterialDiffuse",
    "uLightDiffuse",
    "uLightDirection",
    "uIsTextureEnabled",
  ]);
  const rainProgram = createProgram(gl, rainVertexSource, fogSource + rainFragmentSource, [
    "uFogDensity",
    "uViewProjection",
    "uEye",
    "uLightDirection",
    "uLightDiffuse",
    "uAtlasGrid",
    "uFallRange",
  ]);
  const skyProgram = createProgram(gl, skyVertexSource, fogSource + skyFragmentSource, [
    "uFogDensity",
    "uFogHeight",
    "uInverseViewProjection",
  ]);
  const echoProgram = createProgram(gl, postVertexSource, echoFragmentSource, [
    "uCurrent",
    "uHistory",
    "uPersistence",
  ]);
  const post = createProgram(gl, postVertexSource, postFragmentSource, [
    "uEffects",
    "uPulse",
    "uTime",
    "uPixelRatio",
    "uRoundness",
  ]);

  const quad = gl.createVertexArray();
  gl.bindVertexArray(quad);
  const quadVertices = createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTICES));
  attribute(gl, POSITION, 3, quadVertices);
  attribute(gl, TEXTURE_COORD, 2, createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(QUAD_TEXTURE_COORDS)));
  const quadIndices = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(QUAD_INDICES));

  const pictures = gl.createVertexArray();
  gl.bindVertexArray(pictures);
  attribute(gl, POSITION, 3, quadVertices);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndices);
  const instances = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instances);
  gl.bufferData(gl.ARRAY_BUFFER, rain.instances.byteLength, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(INSTANCE_POSITION, 3, gl.FLOAT, false, 24, 0);
  gl.vertexAttribPointer(INSTANCE_TURN, 3, gl.FLOAT, false, 24, 12);
  gl.enableVertexAttribArray(INSTANCE_POSITION);
  gl.enableVertexAttribArray(INSTANCE_TURN);
  attribute(gl, INSTANCE_LOOK, 2, createBuffer(gl, gl.ARRAY_BUFFER, rain.looks));
  for (const slot of [INSTANCE_POSITION, INSTANCE_TURN, INSTANCE_LOOK]) gl.vertexAttribDivisor(slot, 1);

  const tv = gl.createVertexArray();
  gl.bindVertexArray(tv);
  attribute(gl, POSITION, 3, createBuffer(gl, gl.ARRAY_BUFFER, model.vertices));
  attribute(gl, NORMAL, 3, createBuffer(gl, gl.ARRAY_BUFFER, model.normals));
  createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices);
  gl.bindVertexArray(null);

  const skyTexture = createCubeTexture(gl, sky);
  const atlasTexture = createAtlasTexture(gl, atlas);

  // Black until the first video frame arrives.
  const videoTexture = createTexture(gl);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  let videoFrameTime = -1;

  let target = createTarget(gl, gl.drawingBufferWidth, gl.drawingBufferHeight);
  let echo: ReturnType<typeof createEcho> | undefined;
  let echoIsFresh = true; // nothing worth blending with yet

  gl.useProgram(echoProgram.program);
  gl.uniform1i(echoProgram.uniforms.uCurrent, 0);
  gl.uniform1i(echoProgram.uniforms.uHistory, 1);

  const projection = mat4.create();
  const turn = mat4.create();
  const view = mat4.create();
  const viewProjection = mat4.create();
  const inverseSky = mat4.create();
  const tvPlace = mat4.create();
  const tvModel = mat4.create();
  const modelView = mat4.create();
  const normalMatrix = mat4.create();
  const eye: [number, number, number] = [0, 0, 0];

  mat4.fromTranslation(tvPlace, TV_PLACE);
  mat4.rotateY(tvPlace, tvPlace, TV_TURN);
  mat4.scale(tvPlace, tvPlace, TV_SIZE);

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const resizeTarget = () => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    if (width === target.width && height === target.height) return false;
    gl.deleteTexture(target.texture);
    gl.deleteRenderbuffer(target.color);
    gl.deleteRenderbuffer(target.depth);
    gl.deleteFramebuffer(target.scene);
    gl.deleteFramebuffer(target.resolved);
    target = createTarget(gl, width, height);

    for (const buffer of echo?.buffers ?? []) {
      gl.deleteTexture(buffer.texture);
      gl.deleteFramebuffer(buffer.framebuffer);
    }
    echo = undefined;
    return true;
  };

  const drawTV = (video: HTMLVideoElement, frameSettings: typeof settings, fogDensity: number) => {
    const { uniforms } = tvProgram;
    const diffuse = frameSettings.lightDiffuse;
    const material = frameSettings.materialDiffuse;
    gl.useProgram(tvProgram.program);
    gl.uniform1f(uniforms.uFogDensity, fogDensity);
    gl.uniformMatrix4fv(uniforms.uPMatrix, false, projection);
    gl.uniform3fv(uniforms.uLightDirection, frameSettings.lightDirection);
    gl.uniform4f(uniforms.uLightDiffuse, diffuse, diffuse, diffuse, 1);
    gl.uniform4f(uniforms.uMaterialDiffuse, material[0], material[1], material[2], 1);

    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    if (video.readyState >= video.HAVE_CURRENT_DATA && video.currentTime !== videoFrameTime) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      videoFrameTime = video.currentTime;
    }
    mat4.translate(modelView, tvPlace, TV_SCREEN_PLACE);
    mat4.scale(modelView, modelView, TV_SCREEN_SCALE);
    mat4.multiply(modelView, view, modelView);
    gl.uniformMatrix4fv(uniforms.uMVMatrix, false, modelView);
    gl.uniform1i(uniforms.uIsTextureEnabled, 1);
    gl.bindVertexArray(quad);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);

    mat4.scale(tvModel, tvPlace, TV_BODY_SCALE);
    mat4.invert(normalMatrix, tvModel);
    mat4.transpose(normalMatrix, normalMatrix);
    mat4.multiply(modelView, view, tvModel);
    gl.uniformMatrix4fv(uniforms.uMVMatrix, false, modelView);
    gl.uniformMatrix4fv(uniforms.uNMatrix, false, normalMatrix);
    gl.uniform1i(uniforms.uIsTextureEnabled, 0);
    gl.bindVertexArray(tv);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  };

  /** All the pictures, in one draw call. */
  const drawRain = (camera: Camera, frameSettings: typeof settings, fogDensity: number) => {
    const { uniforms } = rainProgram;
    gl.useProgram(rainProgram.program);
    gl.uniform1f(uniforms.uFogDensity, fogDensity);
    mat4.multiply(viewProjection, projection, view);
    gl.uniformMatrix4fv(uniforms.uViewProjection, false, viewProjection);
    gl.uniform3f(uniforms.uEye, camera.eyeX, camera.eyeY, camera.eyeZ);
    gl.uniform3fv(uniforms.uLightDirection, frameSettings.lightDirection);
    gl.uniform1f(uniforms.uLightDiffuse, Math.max(frameSettings.lightDiffuse, 0));
    gl.uniform2f(uniforms.uAtlasGrid, ATLAS_COLUMNS, ATLAS_ROWS);
    gl.uniform2f(uniforms.uFallRange, GROUND, CEILING);

    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, rain.instances);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.bindVertexArray(pictures);
    gl.drawElementsInstanced(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0, rain.count);
  };

  /** Last, so the sky only fills the pixels nothing else covered. */
  const drawSky = (fogDensity: number, fog: number) => {
    gl.useProgram(skyProgram.program);
    gl.uniform1f(skyProgram.uniforms.uFogDensity, fogDensity);
    gl.uniform1f(skyProgram.uniforms.uFogHeight, FOG_HEIGHT / Math.max(fog, 0.01));
    mat4.multiply(inverseSky, projection, turn);
    mat4.invert(inverseSky, inverseSky);
    gl.uniformMatrix4fv(skyProgram.uniforms.uInverseViewProjection, false, inverseSky);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyTexture);
    gl.bindVertexArray(quad);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);
  };

  /** Blends the resolved scene with the history, and returns the texture holding the result. */
  const applyEcho = (amount: number, seconds: number) => {
    echo ??= createEcho(gl, target.width, target.height);
    const history = echo.buffers[echo.latest];
    echo.latest = 1 - echo.latest;
    const result = echo.buffers[echo.latest];

    const fadeTime = ECHO_SHORTEST * (ECHO_LONGEST / ECHO_SHORTEST) ** amount;
    const persistence = Math.exp(-seconds / fadeTime);
    const limit = echo.float ? 1 : MAX_PERSISTENCE_IN_8_BITS;

    gl.bindFramebuffer(gl.FRAMEBUFFER, result.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(echoProgram.program);
    gl.uniform1f(echoProgram.uniforms.uPersistence, echoIsFresh ? 0 : Math.min(persistence, limit));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, history.texture);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.bindVertexArray(quad);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);
    echoIsFresh = false;
    return result.texture;
  };

  return function draw({ camera, seconds, time, pixelRatio, video, settings: frameSettings }: Frame): void {
    if (resizeTarget()) echoIsFresh = true;

    const fog = frameSettings.effects[FOG];
    const fogDensity = fog * FOG_DENSITY;

    mat4.perspective(projection, camera.fov, camera.aspect, NEAR, FAR);
    mat4.fromXRotation(turn, -camera.pitch);
    mat4.rotateY(turn, turn, -camera.yaw);
    eye[0] = -camera.eyeX;
    eye[1] = -camera.eyeY;
    eye[2] = -camera.eyeZ;
    mat4.translate(view, turn, eye);

    // Pass 1: the scene, into the multisampled buffers, then resolved into the texture.
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.scene);
    gl.viewport(0, 0, target.width, target.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawTV(video, frameSettings, fogDensity);
    drawRain(camera, frameSettings, fogDensity);
    drawSky(fogDensity, fog);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, target.scene);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target.resolved);
    gl.blitFramebuffer(
      0,
      0,
      target.width,
      target.height,
      0,
      0,
      target.width,
      target.height,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST,
    );
    gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, DEPTH_ONLY);

    const echoAmount = frameSettings.effects[MOTION_ECHO];
    const picture = echoAmount > 0 ? applyEcho(echoAmount, seconds) : target.texture;
    echoIsFresh ||= echoAmount === 0;

    // Pass 2: the picture, through the effects, onto the canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, target.width, target.height);
    gl.useProgram(post.program);
    const diagonal = Math.hypot(camera.aspect, 1) / Math.SQRT2;
    gl.uniform2f(post.uniforms.uRoundness, camera.aspect / diagonal, 1 / diagonal);
    gl.uniform1fv(post.uniforms.uEffects, frameSettings.effects);
    gl.uniform1f(post.uniforms.uPulse, frameSettings.pulse);
    gl.uniform1f(post.uniforms.uTime, time);
    gl.uniform1f(post.uniforms.uPixelRatio, pixelRatio);
    gl.bindTexture(gl.TEXTURE_2D, picture);
    gl.bindVertexArray(quad);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);
  };
}
