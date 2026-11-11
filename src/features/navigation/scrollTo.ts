import type Lenis from "lenis";

/**
 * The island's click-to-navigate travel: ported from the artifact's own
 * `_scrollTo` (lines 434-445) — same duration curve (520-1700ms, scaling
 * with `sqrt(distance in screens)`) and easing (a real `easeInOutCubic`,
 * not Lenis's default) — but built on `lenis.scrollTo()` rather than the
 * artifact's hand-rolled rAF loop. The artifact has its own scroller (no
 * Lenis); this project already uses Lenis for everything else, and
 * `scrollTo()` is its real, cancelable-by-user-input API for exactly this
 * (verified in `node_modules/lenis/dist/lenis.d.ts`) — reimplementing a
 * second manual rAF loop alongside it would fight Lenis for control of the
 * same scroll position instead of asking it to do this directly.
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** The travel's duration, in ms, for a given distance in screens (artifact line 439: `Math.min(1700, 520 + 300 * Math.sqrt(dp))`) — extracted so the curve has a unit test independent of a real Lenis instance. */
export function scrollTravelDurationMs(distanceInScreens: number): number {
  return Math.min(1700, 520 + 300 * Math.sqrt(distanceInScreens));
}

/** Scrolls to a position expressed in screens (artifact unit: `scrollTop / innerHeight`), animated or instant under reduced motion. */
export function scrollToScreens(lenis: Lenis, screens: number, reduced: boolean): void {
  const viewportHeight = window.innerHeight || 1;
  const target = Math.min(screens * viewportHeight, lenis.limit);

  if (reduced) {
    lenis.scrollTo(target, { immediate: true });
    return;
  }

  const distanceInScreens = Math.abs(target - lenis.scroll) / viewportHeight;
  const durationMs = scrollTravelDurationMs(distanceInScreens);

  lenis.scrollTo(target, {
    duration: durationMs / 1000,
    easing: easeInOutCubic,
  });
}
