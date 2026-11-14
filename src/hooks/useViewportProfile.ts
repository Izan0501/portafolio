"use client";

import { useSyncExternalStore } from "react";

/**
 * Viewport size/aspect/"compact" state — ported from the artifact's own
 * `_layout()` (`docs/reference/artifact-a/Hero.dc.html`, lines 528-555):
 * `this._compact = (w / hh) < 0.95 || w <= 1024`. The artifact measures its
 * own `<canvas>` root element's `clientWidth`/`clientHeight`; this project's
 * `Stage` always fills the viewport (`ExperienceShell`'s `sticky top-0
 * h-dvh w-full`), so `window.innerWidth`/`innerHeight` is the same
 * quantity here.
 *
 * Exposed two ways from the same mutable `viewportStore`:
 *  - `useViewportProfile()` (this file's hook) for DOM components that
 *    should re-render on resize (rare event, a normal re-render is fine).
 *  - `viewportStore` read directly, with no hook, from `CameraDirector`'s
 *    `useFrame` — same reasoning as `scrollStore`: a per-frame read must
 *    never go through React state.
 */
export interface ViewportProfile {
  width: number;
  height: number;
  aspect: number;
  /** Artifact `this._compact` — vertical or ≤1024px wide: only the Mac is framed, the iPhone hides. */
  compact: boolean;
  /**
   * Artifact's own separate `narrow` (`_fitCam`, line 1210: `const a =
   * this.aspect || 1.6, narrow = a < 0.95, compact = this._compact`) —
   * a *different* condition from `compact`, used for a different
   * decision: whether the text column becomes a bottom sheet (plan M13).
   * `compact` alone (`width <= 1024` even at a wide aspect, e.g.
   * 1024×768) is *not* narrow — that size keeps the side-column layout,
   * just a thinner one (`globals.css`'s own `(min-aspect-ratio:19/20)
   * and (max-width:1024px)` rule). Conflating the two here would have
   * made `CameraDirector` read a meaningless `sheetTop` at that exact
   * size instead of the real `copyFraction` — confirmed as a real bug
   * introduced in M8, caught while building M13 against the real
   * 1024×768 reference size.
   */
  narrow: boolean;
}

/** Artifact `_layout`, line 543: `(w / hh) < 0.95 || w <= 1024`. Exported so the condition itself has a unit test independent of `window`. */
export function isCompact(width: number, height: number): boolean {
  return width / height < 0.95 || width <= 1024;
}

/** Artifact `_fitCam`, line 1210: `a < 0.95` — aspect alone, no width term. */
export function isNarrow(width: number, height: number): boolean {
  return width / height < 0.95;
}

function computeProfile(): ViewportProfile {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  const aspect = width / height;
  return { width, height, aspect, compact: isCompact(width, height), narrow: isNarrow(width, height) };
}

/** Mutated in place — the stable reference `CameraDirector`'s `useFrame` reads directly, same pattern as `scrollStore`. */
export const viewportStore: ViewportProfile = typeof window === "undefined" ? { width: 1280, height: 800, aspect: 1.6, compact: false, narrow: false } : computeProfile();

/**
 * A fresh object each time something actually changes — `useSyncExternalStore`
 * compares snapshots with `Object.is`, so a snapshot getter that always
 * returns the same (mutated-in-place) reference would never be seen as
 * having changed, and React would never re-render on resize.
 */
let snapshot: ViewportProfile = { ...viewportStore };

const listeners = new Set<() => void>();

function handleResize(): void {
  const next = computeProfile();
  if (next.width === viewportStore.width && next.height === viewportStore.height) return;
  Object.assign(viewportStore, next);
  snapshot = { ...viewportStore };
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("resize", handleResize);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("resize", handleResize);
  };
}

function getSnapshot(): ViewportProfile {
  return snapshot;
}

function getServerSnapshot(): ViewportProfile {
  return snapshot;
}

export function useViewportProfile(): ViewportProfile {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
