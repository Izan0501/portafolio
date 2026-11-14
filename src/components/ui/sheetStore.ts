import type { ChapterId } from "@/types/content";

/**
 * Real, measured top edge (CSS px from the viewport top) of each
 * chapter's `<Sheet>` — ported from the artifact's own `_sheetTop[i]`
 * (`_layout`, `Hero.dc.html` line 546: `hh - bt - el.offsetHeight`) and
 * `_xTop` (the "Ver detalle" expand override, lines 484-487). Every
 * chapter's `<Sheet>` is always mounted (same reasoning as every other
 * chapter component — JS-off readability), so each one registers its own
 * rect here; `CameraDirector` reads only the *active* chapter's entry,
 * every frame, outside React (same pattern as `viewportStore`).
 *
 * `top` is only real (desktop vertical centering gives a meaningless
 * number here) in compact/narrow mode — callers check `viewportStore.compact` before trusting it.
 */
const sheetTops = new Map<ChapterId, number>();

/** `expandedChapterId`/`expandedTop` mirror the artifact's `_xTop`: set only while *this* chapter's "Ver detalle" is open, cleared the instant another chapter becomes active (`Sheet.tsx`'s own chapter-change effect). */
let expandedChapterId: ChapterId | null = null;
let expandedTop = 0;

export function setSheetTop(chapterId: ChapterId, top: number): void {
  sheetTops.set(chapterId, top);
}

export function setExpandedSheetTop(chapterId: ChapterId | null, top: number): void {
  expandedChapterId = chapterId;
  expandedTop = top;
}

/** Artifact line 1289-1290: the active chapter's sheet top, overridden to the (necessarily higher, i.e. smaller) expanded value when *that same* chapter is the one currently expanded. */
export function sheetTopFor(chapterId: ChapterId, fallback: number): number {
  const measured = sheetTops.get(chapterId) ?? fallback;
  if (expandedChapterId === chapterId) return Math.min(measured, expandedTop);
  return measured;
}
