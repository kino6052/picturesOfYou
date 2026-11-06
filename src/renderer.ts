import { mat4 } from "gl-matrix";
import type { Model } from "./model";
import type { Droplet } from "./rain";
import type { settings } from "./controls";
import vertexSource from "./shaders/vertex.glsl?raw";
import fragmentSource from "./shaders/fragment.glsl?raw";
import postVertexSource from "./shaders/vertex.post.glsl?raw";
import postFragmentSource from "./shaders/fragment.post.glsl?raw";

export interface Assets {
  model: Model;
  background: HTMLImageElement;
  polaroids: HTMLImageElement[];
}

export interface Frame {
  /** Pointer position in the camera's units, see main.ts. */
  pointer: { x: number; y: number };
  time: number;
  droplets: Droplet[];
  video: HTMLVideoElement;
  settings: typeof settings;
}

// Both programs share these slots, so the quad's buffers work for either of them.
const POSITION = 0;
const NORMAL = 1;
const TEXTURE_COORD = 2;
const ATTRIBUTES = { aVertexPosition: POSITION, aVertexNormal: NORMAL, aTextureCoord: TEXTURE_COORD };

const QUAD_VERTICES = [-0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0];
const QUAD_TEXTURE_COORDS = [0, 1, 1, 1, 0, 0, 1, 0];
const QUAD_INDICES = [0, 2, 1, 1, 2, 3];

const MAX_TARGET_SIZE = 2048;
const MIN_TARGET_SIZE = 512;

const radians = (degrees: number) => (3.14 * degrees) / 180;

function createProgram<U extends string>(
  gl: WebGLRenderingContext,
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

function createBuffer(gl: WebGLRenderingContext, target: GLenum, data: BufferSource) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  return buffer;
}

function createTexture(gl: WebGLRenderingContext, minFilter: GLenum, magFilter: GLenum = gl.LINEAR) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  return texture;
}

function createImageTexture(gl: WebGLRenderingContext, image: HTMLImageElement, mipmaps: boolean) {
  const texture = createTexture(gl, mipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  if (mipmaps) gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

/** The offscreen square the scene is drawn into before post-processing. */
function createTarget(gl: WebGLRenderingContext, size: number) {
  const texture = createTexture(gl, gl.NEAREST, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const depth = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && !gl.isContextLost()) {
    throw new Error("Could not create the offscreen framebuffer");
  }
  return { size, texture, depth, framebuffer };
}

/** Builds everything that lives on the GPU. Called again after a lost context comes back. */
export function createRenderer(gl: WebGLRenderingContext, { model, background, polaroids }: Assets) {
  const scene = createProgram(gl, vertexSource, fragmentSource, [
    "uPMatrix",
    "uMVMatrix",
    "uNMatrix",
    "uMaterialDiffuse",
    "uLightDiffuse",
    "uLightDirection",
    "uIsTextureEnabled",
  ]);
  const post = createProgram(gl, postVertexSource, postFragmentSource, ["uWaveAmount", "uBlurAmount", "uTime", "uBW"]);

  const quad = {
    vertices: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(QUAD_VERTICES)),
    textureCoords: createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(QUAD_TEXTURE_COORDS)),
    indices: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(QUAD_INDICES)),
  };
  const tv = {
    vertices: createBuffer(gl, gl.ARRAY_BUFFER, model.vertices),
    normals: createBuffer(gl, gl.ARRAY_BUFFER, model.normals),
    indices: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, model.indices),
  };

  const backgroundTexture = createImageTexture(gl, background, false);
  const polaroidTextures = polaroids.map((image) => createImageTexture(gl, image, true));

  // Black until the first video frame arrives.
  const videoTexture = createTexture(gl, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  let videoFrameTime = -1;

  // Enough pixels for the canvas, without paying for 2048x2048 on a phone.
  const maxTargetSize = Math.min(MAX_TARGET_SIZE, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const targetSize = () => {
    const needed = Math.max(gl.drawingBufferWidth, gl.drawingBufferHeight);
    return Math.min(maxTargetSize, Math.max(MIN_TARGET_SIZE, 2 ** Math.ceil(Math.log2(needed))));
  };
  let target = createTarget(gl, targetSize());

  const projection = mat4.perspective(mat4.create(), (45 * Math.PI) / 180, 1, 0.1, 10000);
  const view = mat4.create();
  const modelView = mat4.create();
  const normalMatrix = mat4.create();

  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.useProgram(scene.program);
  gl.uniformMatrix4fv(scene.uniforms.uPMatrix, false, projection);

  const useQuad = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.vertices);
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(POSITION);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.textureCoords);
    gl.vertexAttribPointer(TEXTURE_COORD, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(TEXTURE_COORD);
    gl.disableVertexAttribArray(NORMAL);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.indices);
  };

  const useTV = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, tv.vertices);
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, tv.normals);
    gl.vertexAttribPointer(NORMAL, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(NORMAL);
    gl.disableVertexAttribArray(TEXTURE_COORD);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tv.indices);
  };

  const drawQuad = () => {
    gl.uniformMatrix4fv(scene.uniforms.uMVMatrix, false, modelView);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);
  };

  const drawVideoScreen = (video: HTMLVideoElement) => {
    gl.bindTexture(gl.TEXTURE_2D, videoTexture);
    if (video.readyState >= video.HAVE_CURRENT_DATA && video.currentTime !== videoFrameTime) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      videoFrameTime = video.currentTime;
    }
    mat4.translate(modelView, view, [0, 0.65, 0.49]);
    mat4.rotate(modelView, modelView, radians(30), [0, 1, 0]);
    mat4.scale(modelView, modelView, [1.4, 0.95, 0]);
    drawQuad();
  };

  const drawBackground = () => {
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    mat4.translate(modelView, view, [0, 4, -4]);
    mat4.rotate(modelView, modelView, radians(29), [1, 0, 0]);
    mat4.scale(modelView, modelView, [20, 10, 10]);
    drawQuad();
  };

  const drawRain = (droplets: Droplet[]) => {
    const perTexture = droplets.length / polaroidTextures.length;
    droplets.forEach(({ rotation, position }, index) => {
      if (index % perTexture === 0) gl.bindTexture(gl.TEXTURE_2D, polaroidTextures[index / perTexture]);
      mat4.translate(modelView, view, position);
      mat4.rotate(modelView, modelView, rotation[0], [1, 0, 0]);
      mat4.rotate(modelView, modelView, rotation[1], [0, 1, 0]);
      mat4.rotate(modelView, modelView, rotation[2], [0, 0, 1]);
      mat4.scale(modelView, modelView, [0.3, 0.3, 0.3]);
      drawQuad();
    });
  };

  const drawTV = () => {
    mat4.rotate(modelView, view, radians(30), [0, 1, 0]);
    mat4.scale(modelView, modelView, [0.6, 0.6, 0.6]);
    mat4.invert(normalMatrix, modelView);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(scene.uniforms.uMVMatrix, false, modelView);
    gl.uniformMatrix4fv(scene.uniforms.uNMatrix, false, normalMatrix);
    gl.uniform1i(scene.uniforms.uIsTextureEnabled, 0);
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  };

  const resizeTarget = () => {
    const size = targetSize();
    if (size === target.size) return;
    gl.deleteTexture(target.texture);
    gl.deleteRenderbuffer(target.depth);
    gl.deleteFramebuffer(target.framebuffer);
    target = createTarget(gl, size);
  };

  return function draw({ pointer, time, droplets, video, settings }: Frame): void {
    resizeTarget();

    // Pass 1: the scene, into the offscreen square.
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.size, target.size);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(scene.program);
    gl.uniform3fv(scene.uniforms.uLightDirection, settings.lightDirection);
    gl.uniform4f(scene.uniforms.uLightDiffuse, settings.lightDiffuse, settings.lightDiffuse, settings.lightDiffuse, 1);
    gl.uniform4f(scene.uniforms.uMaterialDiffuse, ...(settings.materialDiffuse as [number, number, number]), 1);
    gl.uniform1i(scene.uniforms.uIsTextureEnabled, 1);

    mat4.fromTranslation(view, [0, -1.3, -3]);
    mat4.rotate(view, view, radians(-15) - pointer.y / 2000, [1, 0, 0]);
    mat4.rotate(view, view, (-500 + pointer.x) / 1000, [0, 1, 0]);

    useQuad();
    drawVideoScreen(video);
    drawBackground();
    drawRain(droplets);
    useTV();
    drawTV();

    // Pass 2: the square, through the effects, onto the canvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(post.program);
    gl.uniform1f(post.uniforms.uWaveAmount, settings.wave);
    gl.uniform1f(post.uniforms.uBlurAmount, settings.blur);
    gl.uniform1f(post.uniforms.uTime, time);
    gl.uniform1i(post.uniforms.uBW, settings.blackAndWhite ? 1 : 0);
    useQuad();
    gl.bindTexture(gl.TEXTURE_2D, target.texture);
    gl.drawElements(gl.TRIANGLES, QUAD_INDICES.length, gl.UNSIGNED_SHORT, 0);
  };
}
