import type { Player } from "./player";
import type { createPulse } from "./pulse";
import { AUDIO_PULSE, EFFECTS, settings } from "./settings";

const IDLE_MS = 3000;

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const clock = (seconds: number) => {
  const whole = Math.floor(seconds || 0);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/** The filled part of a slider's track is drawn by CSS, which can't read the value itself. */
function showFill(slider: HTMLInputElement): void {
  const [min, max] = [Number(slider.min), Number(slider.max)];
  slider.style.setProperty("--fill", `${((slider.valueAsNumber - min) / (max - min || 1)) * 100}%`);
}

function bindSlider(id: string, apply: (value: number) => void): void {
  const slider = byId<HTMLInputElement>(id);
  const output = slider.previousElementSibling as HTMLOutputElement;
  const update = () => {
    apply(slider.valueAsNumber);
    output.value = slider.valueAsNumber.toFixed(2);
    showFill(slider);
  };
  slider.addEventListener("input", update);
  update();
}

function bindLight(): void {
  ["light-x", "light-y", "light-z"].forEach((id, axis) =>
    bindSlider(id, (value) => (settings.lightDirection[axis] = value)),
  );
  bindSlider("light-diffuse", (value) => (settings.lightDiffuse = value));
  byId<HTMLInputElement>("material").addEventListener("input", (event) => {
    const hex = (event.target as HTMLInputElement).value;
    settings.materialDiffuse = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  });
}

function buildEffects(pulse: ReturnType<typeof createPulse>): void {
  const list = byId("effects");
  EFFECTS.forEach((effect, index) => {
    const { label, amount } = effect;
    const row = document.createElement("div");
    row.className = "effect";
    row.innerHTML = `
      <label><input type="checkbox" role="switch" /><span>${label}</span></label>
      <input type="range" min="0" max="1" step="0.01" value="${amount}" aria-label="${label} amount" disabled />`;
    list.append(row);

    const toggle = row.querySelector<HTMLInputElement>("[role=switch]")!;
    const slider = row.querySelector<HTMLInputElement>("[type=range]")!;
    toggle.checked = "on" in effect;
    const update = () => {
      settings.effects[index] = toggle.checked ? slider.valueAsNumber : 0;
      slider.disabled = !toggle.checked;
      showFill(slider);
    };
    toggle.addEventListener("change", () => {
      if (index === AUDIO_PULSE && toggle.checked) pulse.enable();
      update();
    });
    slider.addEventListener("input", update);
    update();
  });
}

function bindTransport(video: HTMLVideoElement, player: Player): void {
  const play = byId<HTMLButtonElement>("play");
  const mute = byId<HTMLButtonElement>("mute");
  const seek = byId<HTMLInputElement>("seek");
  const volume = byId<HTMLInputElement>("volume");
  const elapsed = byId("elapsed");
  const duration = byId("duration");

  const showTime = () => {
    seek.value = String(video.currentTime);
    seek.setAttribute("aria-valuetext", clock(video.currentTime));
    elapsed.textContent = clock(video.currentTime);
    showFill(seek);
  };
  const showPlaying = () => {
    play.classList.toggle("on", !video.paused);
    play.setAttribute("aria-label", video.paused ? "Play" : "Pause");
  };
  const showVolume = () => {
    const silent = video.muted || video.volume === 0;
    mute.classList.toggle("on", silent);
    mute.setAttribute("aria-label", silent ? "Unmute" : "Mute");
    volume.value = String(video.muted ? 0 : video.volume);
    showFill(volume);
  };

  video.addEventListener("durationchange", () => {
    seek.max = String(video.duration);
    duration.textContent = clock(video.duration);
  });
  video.addEventListener("timeupdate", showTime);
  video.addEventListener("play", showPlaying);
  video.addEventListener("pause", showPlaying);
  video.addEventListener("volumechange", showVolume);
  video.addEventListener("progress", () => {
    const { buffered } = video;
    const end = buffered.length ? buffered.end(buffered.length - 1) : 0;
    seek.style.setProperty("--buffered", `${(end / (video.duration || 1)) * 100}%`);
  });

  play.addEventListener("click", player.toggle);
  mute.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  });
  seek.addEventListener("input", () => {
    video.currentTime = seek.valueAsNumber;
    showTime();
  });
  volume.addEventListener("input", () => {
    video.volume = volume.valueAsNumber;
    video.muted = video.volume === 0;
  });
  showVolume();
}

/** Everything fades away while nothing is happening, and comes back on any input. */
function bindIdleFade(video: HTMLVideoElement, hud: HTMLElement): void {
  const { body } = document;
  const canHover = window.matchMedia("(hover: hover)");
  let timer = 0;

  const rest = () => {
    const inUse = video.paused || hud.querySelector(":focus-visible") || (canHover.matches && hud.querySelector(":hover"));
    if (inUse) wake();
    else body.classList.add("idle");
  };
  const wake = () => {
    body.classList.remove("idle");
    clearTimeout(timer);
    timer = window.setTimeout(rest, IDLE_MS);
  };

  for (const event of ["pointermove", "pointerdown", "keydown", "focusin"]) window.addEventListener(event, wake);
  video.addEventListener("pause", wake);
  wake();
}

export function bindHud(
  video: HTMLVideoElement,
  player: Player,
  pulse: ReturnType<typeof createPulse>,
  canvas: HTMLCanvasElement,
): void {
  const hud = byId("hud");
  const panel = byId<HTMLDetailsElement>("panel");

  bindLight();
  buildEffects(pulse);
  bindTransport(video, player);
  bindIdleFade(video, hud);

  video.addEventListener(
    "playing",
    () => {
      document.body.classList.add("started");
      hud.hidden = false;
      canvas.focus({ preventScroll: true });
    },
    { once: true },
  );

  window.addEventListener("keydown", (event) => {
    const onControl = event.target instanceof HTMLElement && event.target.closest("button, input, summary");
    if (event.key === "Escape") panel.open = false;
    if (onControl || hud.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === " ") {
      event.preventDefault();
      player.toggle();
    } else if (event.key === "m") {
      video.muted = !video.muted;
    }
  });
}
