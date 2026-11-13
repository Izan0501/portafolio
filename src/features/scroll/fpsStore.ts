/**
 * Real, measured frame rate — mirrors the artifact's own `this.fps.val`
 * (confirmed by M11's research pass: Mel's "fps · en vivo" island label
 * and the `gal` phone screen show a real measurement, not an invented
 * number). Updated once per frame from `FrameDriver` (the same place
 * `scrollStore` advances, M4) — a plain mutable object, not React state,
 * read directly wherever a screen needs to display it (same pattern as
 * `scrollStore`/`viewportStore`).
 */
export const fpsStore = { value: 60 };

const SMOOTHING = 0.1;

/** `delta` is the real elapsed seconds between frames (`useFrame`'s own second argument). */
export function updateFpsStore(delta: number): void {
  if (delta <= 0) return;
  const instantFps = 1 / delta;
  fpsStore.value += (instantFps - fpsStore.value) * SMOOTHING;
}
