import { damp } from "@/lib/math/damp";
import { clamp } from "@/lib/math/ease";
import { PMAX, ISLAND_DIRECTION_THRESHOLD } from "@/config/chapters";

/**
 * The single source of truth for scroll — a plain mutable object, never
 * React state (IMPLEMENTATION_PLAN.md §2.2: "Prohibido useState o context
 * que cambien con el scroll"). `useFrame` (R3F, from M5) and `MotionValue`
 * transforms (DOM) both read this directly every frame; nothing here ever
 * triggers a re-render on its own.
 *
 * Ported from the artifact's own fields (`docs/reference/artifact-a/Hero.dc.html`,
 * constructor around line 404: `this.p = 0; this.pt = 0; ...; this.vel = 0;
 * this.prevP = 0`), plus `t` (elapsed time, `this.t` in the artifact) and
 * `progress` (0..1, `p / PMAX`, for the island's ring-loader in M7).
 */
export interface ScrollStore {
  /** Raw target position, in screens — `scrollTop / innerHeight`, clamped to `[0, PMAX]`. Set directly from Lenis. */
  pt: number;
  /** Damped position, in screens — what every chapter/pose/camera actually reads. */
  p: number;
  /** `p` from the previous frame, used to derive `vel`. */
  prevP: number;
  /** Damped scroll velocity, in screens/second, clamped to `[-6, 6]`. */
  vel: number;
  /** Elapsed time, in seconds, paused along with everything else under reduced motion (runs at ×0.25 instead of stopping outright, matching the artifact). */
  t: number;
  /** `p / PMAX`, 0..1. */
  progress: number;
  /** Scroll direction: `1` down, `-1` up, `0` without enough accumulated movement yet to call it either way. */
  dir: 0 | 1 | -1;
  /** `true` under `prefers-reduced-motion: reduce` — damping/springs collapse to their target instead of easing (set by `useLenisBridge`). */
  reduced: boolean;
}

export const scrollStore: ScrollStore = {
  pt: 0,
  p: 0,
  prevP: 0,
  vel: 0,
  t: 0,
  progress: 0,
  dir: 0,
  reduced: false,
};

// Direction accumulator (artifact `_scrollDir`, line 459-466) — hysteresis so
// a single jittery wheel tick doesn't flip `dir` back and forth. Reset
// whenever the accumulated sign reverses, same as the artifact.
let dirAccum = 0;

function updateDirection(deltaPt: number): void {
  if (Math.sign(deltaPt) !== Math.sign(dirAccum)) dirAccum = 0;
  dirAccum += deltaPt;
  if (dirAccum > ISLAND_DIRECTION_THRESHOLD) {
    scrollStore.dir = 1;
    dirAccum = 0;
  } else if (dirAccum < -ISLAND_DIRECTION_THRESHOLD) {
    scrollStore.dir = -1;
    dirAccum = 0;
  }
}

/**
 * Advances the store by one frame of real elapsed time `dt` (seconds).
 * The only place `p`/`vel`/`t`/`progress` ever change — called from
 * `useLenisBridge`'s rAF fallback in M4/M5, and from the R3F `FrameDriver`
 * once M5 builds it (same function either way: "a single loop", plan §2.2).
 */
export function advanceScrollStore(dt: number): void {
  // Direction is updated in `setScrollTarget` (where `pt` actually changes,
  // with the real delta) — nothing to do with direction here, this function
  // only eases `p` toward `pt` and derives velocity/time from that.
  scrollStore.p = scrollStore.reduced ? scrollStore.pt : damp(scrollStore.p, scrollStore.pt, 7.5, dt);
  if (Math.abs(scrollStore.p - scrollStore.pt) < 1e-4) scrollStore.p = scrollStore.pt;

  const instantVel = (scrollStore.p - scrollStore.prevP) / Math.max(dt, 1e-3);
  scrollStore.prevP = scrollStore.p;
  scrollStore.vel = scrollStore.reduced ? 0 : damp(scrollStore.vel, clamp(instantVel, -6, 6), 6, dt);

  scrollStore.t += scrollStore.reduced ? dt * 0.25 : dt;
  scrollStore.progress = scrollStore.p / PMAX;
}

/** Sets the raw scroll target (screens), clamped to `[0, PMAX]` — called from `useLenisBridge` on every Lenis scroll event. */
export function setScrollTarget(screens: number): void {
  const next = clamp(screens, 0, PMAX);
  const delta = next - scrollStore.pt;
  scrollStore.pt = next;
  updateDirection(delta);
}
