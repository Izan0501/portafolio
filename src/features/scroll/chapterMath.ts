import type { ChapterRange } from "@/types/content";
import { smoothstep } from "@/lib/math/ease";

/** The chapter index whose `[a, b)` range contains `p` (clamped to the last chapter for `p` at/after its end). */
export function chapterIndexAt(p: number, chapters: readonly ChapterRange[]): number {
  for (let i = 0; i < chapters.length; i++) {
    if (p < chapters[i].b || i === chapters.length - 1) return i;
  }
  return chapters.length - 1;
}

export interface ChapterFadeWindow {
  /** Entry curve: 0 before the chapter, 1 once fully entered. */
  fin: number;
  /** Exit curve: 0 while still fully present, 1 once fully exited. */
  fout: number;
  /** `fin · (1 − fout)` — the copy's opacity/translate progress for this chapter at `p`. */
  opacity: number;
}

/**
 * A chapter's entry/exit fade windows at scroll position `p`, ported 1:1
 * from IMPLEMENTATION_PLAN.md §2.2: `fin = ss(a−0.05, a+min(0.3,0.22·span))`,
 * `fout = ss(b−min(0.3,0.22·span), b+0.02)` — asymmetric feathers (a tight
 * 0.05-screen entry edge, a softer exit that scales with the chapter's own
 * length, capped at 0.3 screens so a very long chapter doesn't fade out for
 * an implausibly long stretch).
 */
export function chapterFadeWindow(chapter: ChapterRange, p: number): ChapterFadeWindow {
  const span = chapter.b - chapter.a;
  const feather = Math.min(0.3, 0.22 * span);
  const fin = smoothstep(chapter.a - 0.05, chapter.a + feather, p);
  const fout = smoothstep(chapter.b - feather, chapter.b + 0.02, p);
  return { fin, fout, opacity: fin * (1 - fout) };
}
