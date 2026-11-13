import { smoothstep } from "@/lib/math/ease";

/**
 * Per-shot progress and the simulated cursor path — ported from the
 * artifact's `'shot'` draw mode (`_drawMac`, lines 1684-1741) and
 * `_cursorAt` (line 1541). Each project chapter is split into 3 equal
 * shot windows; `shotProgress` is the progress *within* the active one
 * (artifact `st.l`).
 */

export interface ShotWindow {
  index: number;
  /** Progress within this shot, 0..1 (artifact `st.l`). */
  progress: number;
}

/** `chapterProgress` is 0..1 within the chapter (same unit `chapterProgressAt` returns). */
export function shotWindowAt(chapterProgress: number, shotCount = 3): ShotWindow {
  const scaled = chapterProgress * shotCount;
  const index = Math.min(shotCount - 1, Math.floor(scaled));
  return { index, progress: scaled - index };
}

export interface CursorPoint {
  x: number;
  y: number;
}

const CURSOR_START: CursorPoint = { x: 1040, y: 700 };

/**
 * The cursor's position at shot-local progress `l`, visiting up to 2
 * hotspots in sequence (artifact: hotspot 0 window `ss(0.16,0.4,l)`,
 * hotspot 1 window `ss(0.55,0.76,l)`, each with a `-sin(m·π)*40` arc).
 * Hotspot-less shots simply hold the cursor at its start position.
 */
export function cursorPositionAt(l: number, hotspots: readonly CursorPoint[]): CursorPoint {
  if (hotspots.length === 0) return CURSOR_START;

  const first = hotspots[0];
  const m0 = smoothstep(0.16, 0.4, l);
  let x = CURSOR_START.x + (first.x - CURSOR_START.x) * m0;
  let y = CURSOR_START.y + (first.y - CURSOR_START.y) * m0 - Math.sin(m0 * Math.PI) * 40;

  if (hotspots.length > 1) {
    const second = hotspots[1];
    const m1 = smoothstep(0.55, 0.76, l);
    // Only takes over once its own window actually starts (`m1 > 0`) —
    // otherwise this would overwrite the first leg's gradual position
    // with `first`'s fixed point for the entire time before hotspot 1's
    // window opens, making the cursor jump there instantly instead of
    // traveling from `CURSOR_START`.
    if (m1 > 0) {
      x = first.x + (second.x - first.x) * m1;
      y = first.y + (second.y - first.y) * m1 - Math.sin(m1 * Math.PI) * 40;
    }
  }
  return { x, y };
}

/** 0..1 — hover-settle radius shrink at each hotspot's own arrival window. */
export function hoverSettleAt(l: number, hotspotIndex: 0 | 1): number {
  const window = hotspotIndex === 0 ? smoothstep(0.16, 0.4, l) : smoothstep(0.55, 0.76, l);
  return window;
}

/** Cursor fades out at the very end of the shot (artifact `hideC = ss(0.88, 0.96, l)`, inverted to an opacity multiplier). */
export function cursorOpacityAt(l: number): number {
  return 1 - smoothstep(0.88, 0.96, l);
}

/** The outgoing/incoming slide transition's ease, 0..1 within its own window (artifact: driven by `st.prev`/`st.l` in `[0, 0.16]`). */
export function shotTransitionEaseAt(l: number): number {
  return smoothstep(0, 0.16, l);
}
