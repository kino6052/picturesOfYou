import { createCamera } from "./camera";
import { bindHud } from "./hud";
import { bindInput, pointer } from "./input";
import { loadModel } from "./model";
import { createPlayer } from "./player";
import { createPulse } from "./pulse";
import { createRain } from "./rain";
import { createRenderer, type Assets, type Frame } from "./renderer";
import { AUDIO_PULSE, settings } from "./settings";
import atlasUrl from "./assets/textures/atlas.jpg";
import skyPositiveX from "./assets/textures/sky/px.jpg";
import skyNegativeX from "./assets/textures/sky/nx.jpg";
import skyPositiveY from "./assets/textures/sky/py.jpg";
import skyNegativeY from "./assets/textures/sky/ny.jpg";
import skyPositiveZ from "./assets/textures/sky/pz.jpg";
import skyNegativeZ from "./assets/textures/sky/nz.jpg";
import modelUrl from "./assets/tv.bin?url";
import videoUrl from "./assets/pictures.mp4";

const SKY_FACES = [skyPositiveX, skyNegativeX, skyPositiveY, skyNegativeY, skyPositiveZ, skyNegativeZ];

const phone = window.matchMedia("(pointer: coarse), (max-width: 700px)").matches;
const PICTURE_COUNT = phone ? 320 : 900;
const MAX_PIXEL_RATIO = 2;
// The post pass runs on every pixel, so very large windows and phones get a budget.
const MAX_PIXELS = phone ? 1_300_000 : 2_600_000;

// Under prefers-reduced-motion everything that moves by itself runs at this speed.
const REDUCED_MOTION_SPEED = 0.1;

const TIME_PER_SECOND = 3;
const MAX_FRAME_SECONDS = 0.1;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const video = document.getElementById("video") as HTMLVideoElement;
const start = document.getElementById("start") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setStatus(text: string | null, busy = false): void {
  status.hidden = text === null;
  status.textContent = text;
  status.classList.toggle("busy", busy);
}

function showError(text: string): void {
  stopLoop();
  start.hidden = true;
  setStatus(text);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

async function loadAssets(): Promise<Assets> {
  const [model, sky, atlas] = await Promise.all([
    loadModel(modelUrl),
    Promise.all(SKY_FACES.map(loadImage)),
    loadImage(atlasUrl),
  ]);
  return { model, sky, atlas };
}

const camera = createCamera(reducedMotion);
const rain = createRain(PICTURE_COUNT);
const pointerRay = new Float32Array(6);
const pulse = createPulse(video);
const frameState: Frame = { camera, seconds: 0, time: 0, pixelRatio: 1, video, settings };
let draw: ReturnType<typeof createRenderer> | undefined;
let lastFrame = 0;
let frameRequest = 0;

function fitCanvas(): void {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const budget = Math.sqrt(MAX_PIXELS / Math.max(cssWidth * cssHeight, 1));
  const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO, budget);
  frameState.pixelRatio = ratio;
  const width = Math.round(cssWidth * ratio);
  const height = Math.round(cssHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function frame(now: number): void {
  frameRequest = requestAnimationFrame(frame);
  const seconds = Math.min(Math.max(now - lastFrame, 0) / 1000, MAX_FRAME_SECONDS);
  lastFrame = now;

  frameState.seconds = seconds;
  fitCanvas();
  camera.update(seconds, canvas.width, canvas.height);
  camera.ray(pointer.x, pointer.y, pointerRay);
  const motion = reducedMotion.matches ? REDUCED_MOTION_SPEED : 1;
  rain.update(seconds, motion, pointerRay, pointer.active);
  frameState.time += TIME_PER_SECOND * seconds * motion;
  settings.pulse = settings.effects[AUDIO_PULSE] * pulse.read(seconds);
  draw?.(frameState);
}

function startLoop(): void {
  if (frameRequest || !draw) return;
  lastFrame = performance.now();
  frameRequest = requestAnimationFrame(frame);
}

function stopLoop(): void {
  cancelAnimationFrame(frameRequest);
  frameRequest = 0;
}

async function boot(): Promise<void> {
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false });
  if (!gl) {
    showError(
      "This visualization needs WebGL 2, which this browser or device doesn't provide. " +
        "Try a current version of Chrome, Firefox, Safari or Edge with hardware acceleration turned on.",
    );
    return;
  }

  const player = createPlayer(video, videoUrl, start, setStatus);
  bindHud(video, player, pulse, canvas);
  bindInput(canvas, camera);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
      player.suspend();
    } else {
      startLoop();
      player.resume();
    }
  });

  const assets = await loadAssets();

  // Phones drop the GPU context when memory is short. Everything on it can be rebuilt.
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stopLoop();
    draw = undefined;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    draw = createRenderer(gl, assets, rain);
    if (!document.hidden) startLoop();
  });

  fitCanvas();
  draw = createRenderer(gl, assets, rain);
  if (!document.hidden) startLoop();
  setStatus(null);
  player.load();
}

boot().catch((error: unknown) => {
  console.error(error);
  showError("The visualization could not start. Reload the page to try again.");
});
