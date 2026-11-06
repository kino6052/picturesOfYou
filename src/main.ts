import { bindControls, settings } from "./controls";
import { loadModel } from "./model";
import { createPlayer } from "./player";
import { createDroplets, updateDroplets } from "./rain";
import { createRenderer, type Assets } from "./renderer";
import backgroundUrl from "./assets/textures/bg.jpg";
import polaroid1Url from "./assets/textures/polaroid04.jpg";
import polaroid2Url from "./assets/textures/polaroid.jpg";
import modelUrl from "./assets/tv.bin?url";
import videoUrl from "./assets/pictures.mp4";

const DROPLETS = 50;
const MAX_PIXEL_RATIO = 2;

// One animation step is 1/60 s, whatever the display's refresh rate.
const STEP_MS = 1000 / 60;
const MAX_STEPS_PER_FRAME = 6;
const TIME_PER_STEP = 0.05;

// The camera was tuned on raw mouse pixels: pageX and screen.height - pageY, for an 800x450
// canvas at (24, 105) on a 1080p screen. Pointer positions are mapped back to those numbers.
const CAMERA_AREA = { left: 24, top: 105, width: 800, height: 450, screenHeight: 1080 };

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const video = document.getElementById("video") as HTMLVideoElement;
const start = document.getElementById("start") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;
const controls = document.getElementById("controls") as HTMLFormElement;

function setStatus(text: string | null, busy = false): void {
  status.hidden = text === null;
  status.textContent = text;
  status.classList.toggle("busy", busy);
}

function showError(text: string): void {
  stopLoop();
  start.hidden = true;
  controls.hidden = true;
  setStatus(text);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  return image.decode().then(() => image);
}

async function loadAssets(): Promise<Assets> {
  const [model, background, ...polaroids] = await Promise.all([
    loadModel(modelUrl),
    loadImage(backgroundUrl),
    loadImage(polaroid1Url),
    loadImage(polaroid2Url),
  ]);
  return { model, background, polaroids };
}

const droplets = createDroplets(DROPLETS);
const pointer = { x: 0, y: 0 };
let draw: ReturnType<typeof createRenderer> | undefined;
let time = 0;
let lastFrame = 0;
let frameRequest = 0;

function fitCanvas(): void {
  const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function frame(now: number): void {
  frameRequest = requestAnimationFrame(frame);
  const steps = Math.min(Math.max(now - lastFrame, 0) / STEP_MS, MAX_STEPS_PER_FRAME);
  lastFrame = now;

  time += TIME_PER_STEP * steps;
  updateDroplets(droplets, steps);
  fitCanvas();
  draw?.({ pointer, time, droplets, video, settings });
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
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false });
  if (!gl) {
    showError(
      "This visualization needs WebGL, which this browser or device doesn't provide. " +
        "Try a current version of Chrome, Firefox, Safari or Edge with hardware acceleration turned on.",
    );
    return;
  }

  const player = createPlayer(video, videoUrl, start, setStatus);
  bindControls(player);

  canvas.addEventListener("pointermove", (event) => {
    const box = canvas.getBoundingClientRect();
    const { left, top, width, height, screenHeight } = CAMERA_AREA;
    pointer.x = left + ((event.clientX - box.left) / box.width) * width;
    pointer.y = screenHeight - (top + ((event.clientY - box.top) / box.height) * height);
  });

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
    draw = createRenderer(gl, assets);
    if (!document.hidden) startLoop();
  });

  fitCanvas();
  draw = createRenderer(gl, assets);
  if (!document.hidden) startLoop();
  setStatus(null);
  player.load();
}

boot().catch((error: unknown) => {
  console.error(error);
  showError("The visualization could not start. Reload the page to try again.");
});
