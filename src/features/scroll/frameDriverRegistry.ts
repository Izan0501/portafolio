/**
 * Coordination between `useLenisBridge`'s own rAF fallback (outside the
 * Canvas, M4) and `components/three/FrameDriver.tsx` (inside the Canvas,
 * M5) — exactly one of them may call `lenis.raf()` / `advanceScrollStore()`
 * on a given tick, or Lenis advances twice per visual frame and the whole
 * site's scroll stutters.
 *
 * Plan §2.2: "Un solo bucle: Lenis... avanzado desde un FrameDriver
 * (useFrame(..., -1)) mientras el canvas está activo. Si el canvas está
 * pausado, un rAF de respaldo mantiene vivo a Lenis."
 *
 * A heartbeat timestamp, not a plain boolean a mount effect flips: R3F's
 * `useFrame` simply never runs while `frameloop: 'never'` (the stage
 * paused by `useVisibilityPause`) — a boolean set `true` on mount would
 * stay `true` through a pause with nothing left to flip it back. Instead
 * `FrameDriver` stamps `lastTickAt` every frame it actually runs; the rAF
 * fallback treats anything older than `STALE_AFTER_MS` as "not currently
 * driving" and resumes — covering both an unmounted Stage and a paused one
 * the same way, with no explicit mount/pause signalling between them.
 */
export const frameDriverRegistry = { lastTickAt: 0 };

/** How long without a FrameDriver tick before the rAF fallback assumes it isn't running and takes back over. Comfortably above one frame at even a slow 30fps (~33ms), tight enough that a real pause/unmount hands off within a couple of frames. */
export const FRAME_DRIVER_STALE_AFTER_MS = 100;

export function isFrameDriverActive(now: number): boolean {
  return now - frameDriverRegistry.lastTickAt < FRAME_DRIVER_STALE_AFTER_MS;
}
