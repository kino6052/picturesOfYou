export interface Player {
  /** Starts downloading. Called once the page is up, so the video doesn't compete with it. */
  load(): void;
  play(): void;
  pause(): void;
  /** Tab hidden: stops the video and remembers whether to carry on. */
  suspend(): void;
  /** Tab visible again. */
  resume(): void;
}

/**
 * Browsers block video with sound until the user acts, so playback always starts from the
 * start button. The button doesn't wait for the download: iOS doesn't buffer until play().
 */
export function createPlayer(
  video: HTMLVideoElement,
  url: string,
  start: HTMLElement,
  setStatus: (text: string | null, busy?: boolean) => void,
): Player {
  let resumeWhenVisible = false;

  const bufferedPercent = () => {
    const { buffered, duration } = video;
    return buffered.length && duration ? Math.round((buffered.end(buffered.length - 1) / duration) * 100) : 0;
  };

  video.addEventListener("progress", () => {
    if (video.readyState < video.HAVE_FUTURE_DATA) setStatus(`Loading video… ${bufferedPercent()}%`, true);
  });
  video.addEventListener("canplay", () => setStatus(null));
  video.addEventListener("waiting", () => setStatus("Loading video…", true));
  video.addEventListener("playing", () => {
    start.hidden = true;
    setStatus(null);
  });
  video.addEventListener("error", () => {
    start.hidden = true;
    setStatus("The video could not be loaded. Reload the page to try again.");
  });

  const play = () => {
    video.play().catch((error: Error) => {
      // AbortError: a pause() cut it short, which is fine. Anything else needs the button back.
      if (error.name !== "AbortError" && !video.error) {
        start.hidden = false;
        setStatus(null);
      }
    });
  };

  start.addEventListener("click", () => {
    start.hidden = true;
    if (video.readyState < video.HAVE_FUTURE_DATA) setStatus("Loading video…", true);
    play();
  });

  return {
    load() {
      setStatus("Loading video…", true);
      start.hidden = false;
      video.src = url;
      video.preload = "auto";
      video.load();
    },
    play,
    pause: () => video.pause(),
    suspend() {
      resumeWhenVisible = !video.paused;
      video.pause();
    },
    resume() {
      if (resumeWhenVisible) play();
    },
  };
}
