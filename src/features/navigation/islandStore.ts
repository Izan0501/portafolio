import { scrollStore } from "@/features/scroll/scrollStore";
import { ISLAND_AUTO_OPEN_P } from "@/config/chapters";

/**
 * `DynamicIslandNav`'s open/closed state — a plain mutable object, not
 * React state (same reasoning as `scrollStore`: this is read and written
 * from a per-frame tick, and the artifact's own field is exactly this
 * shape: `this.isl = {..., auto, forced, hov, focus, lockHov}`, lines
 * 404-410). `DynamicIslandNav.tsx` writes `hov`/`focus`/`forced` from real
 * DOM events; `advanceIslandSpring` (in `islandSpring.ts`) reads scroll
 * direction/position every tick to drive `auto`.
 */
export interface IslandStore {
  /** Open automatically based on scroll direction/position, unless overridden below. */
  auto: boolean;
  /** Explicit open(true)/closed(false) override — a click or Escape; `null` defers to `auto`/`hov`/`focus`. */
  forced: boolean | null;
  hov: boolean;
  focus: boolean;
  /** Suppresses hover re-opening right after an explicit close (artifact: set alongside `forced=false`/click-to-navigate, cleared on the next real pointer leave). */
  lockHov: boolean;
}

export const islandStore: IslandStore = {
  auto: true,
  forced: null,
  hov: false,
  focus: false,
  lockHov: false,
};

/**
 * Artifact `_islOpen`, line 416. `isNavigating` is read fresh from
 * `lenis.isScrolling === 'smooth'` by the caller rather than tracked as
 * stored state here — Lenis can cancel a `scrollTo` early (real user
 * scroll input interrupts it), and a manually-set flag would then never
 * get cleared; reading Lenis's own live state can't go stale like that.
 */
export function islandIsOpen(isNavigating: boolean): boolean {
  if (islandStore.forced !== null) return islandStore.forced;
  return islandStore.hov || islandStore.focus || (islandStore.auto && !isNavigating);
}

let lastDir: -1 | 0 | 1 = 0;

/**
 * Updates `auto`/`forced` from the current scroll direction/position —
 * called once per tick from `advanceIslandSpring`, reading state
 * `scrollStore` already updated this tick (artifact `_scrollDir`, lines
 * 458-468, collapsed into a level-check plus an edge-triggered direction
 * change instead of the artifact's own accumulator — `scrollStore.dir`
 * already debounces direction with the same `ISLAND_DIRECTION_THRESHOLD`
 * this file would otherwise have to re-implement, see `scrollStore.ts`).
 */
export function syncIslandAutoState(): void {
  if (scrollStore.pt < ISLAND_AUTO_OPEN_P) {
    if (!islandStore.auto) {
      islandStore.auto = true;
      islandStore.forced = null;
    }
    return;
  }

  if (scrollStore.dir !== lastDir) {
    lastDir = scrollStore.dir;
    if (scrollStore.dir === 1 && (islandStore.auto || islandStore.forced !== null)) {
      // Scrolling down — fold.
      islandStore.auto = false;
      islandStore.forced = null;
    } else if (scrollStore.dir === -1 && !islandStore.auto) {
      // Scrolling up — unfold.
      islandStore.auto = true;
      islandStore.forced = null;
    }
  }
}
