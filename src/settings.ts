/**
 * The effects, in the order of `uEffects` in fragment.post.glsl. Only fog starts switched on,
 * so the default view is the plain, sharp scene.
 */
export const EFFECTS = [
  { label: "Fog", amount: 0.28, on: true },
  { label: "Motion echo", amount: 0.5 },
  { label: "Wave", amount: 0.5 },
  { label: "Blur", amount: 0.3 },
  { label: "Black and white", amount: 1 },
  { label: "Film grain", amount: 0.4 },
  { label: "Chromatic aberration", amount: 0.4 },
  { label: "Bloom", amount: 0.5 },
  { label: "Vignette", amount: 0.6 },
  { label: "CRT scanlines", amount: 0.5 },
  { label: "VHS tracking", amount: 0.5 },
  { label: "Kaleidoscope", amount: 0.4 },
  { label: "Audio pulse", amount: 0.6 },
] as const;

export const FOG = 0;
export const MOTION_ECHO = 1;
export const AUDIO_PULSE = EFFECTS.length - 1;

/** What the HUD changes. The renderer reads it every frame. */
export const settings = {
  lightDirection: [0, -1, -1],
  lightDiffuse: 1,
  materialDiffuse: [0.5, 0.5, 0.5],
  /** Per effect: how strong it is, 0 when switched off. */
  effects: new Float32Array(EFFECTS.length),
  /** How hard the bass is hitting, already scaled by the audio pulse's amount. */
  pulse: 0,
};
