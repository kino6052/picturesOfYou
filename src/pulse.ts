const BASS_BINS = 5;
const QUIET = 0.5; // bass below this doesn't count as a beat
const RELEASE = 2.8; // how fast a beat dies away, per second

/**
 * Follows the bass of the video's sound. The sound can't be untangled from an AudioContext once
 * it's connected, and a context can only start from a user's action, so `enable` waits for the
 * viewer to switch the effect on: everyone else keeps the plain video element.
 */
export function createPulse(video: HTMLVideoElement) {
  let context: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let bins = new Uint8Array(0);
  let level = 0;

  return {
    enable(): void {
      context ??= new AudioContext();
      if (!analyser) {
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.5;
        bins = new Uint8Array(analyser.frequencyBinCount);
        context.createMediaElementSource(video).connect(analyser);
        analyser.connect(context.destination);
      }
      void context.resume();
    },

    /** The current beat, from 0 to 1. */
    read(seconds: number): number {
      if (!analyser) return 0;
      analyser.getByteFrequencyData(bins);
      let bass = 0;
      for (let i = 0; i < BASS_BINS; i++) bass += bins[i];
      const beat = Math.max(bass / (BASS_BINS * 255) - QUIET, 0) / (1 - QUIET);
      level = Math.max(beat, level - RELEASE * seconds);
      return level;
    },
  };
}
