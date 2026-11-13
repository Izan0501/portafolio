import { describe, expect, it } from "vitest";
import { cursorOpacityAt, cursorPositionAt, shotTransitionEaseAt, shotWindowAt } from "./projectShots";

describe("shotWindowAt", () => {
  it("splits chapter progress into 3 equal shot windows", () => {
    expect(shotWindowAt(0)).toEqual({ index: 0, progress: 0 });
    expect(shotWindowAt(0.5)).toEqual({ index: 1, progress: 0.5 });
    expect(shotWindowAt(0.99).index).toBe(2);
  });

  it("clamps the last shot's index at the very end of the chapter", () => {
    expect(shotWindowAt(1).index).toBe(2);
  });
});

describe("cursorPositionAt", () => {
  it("holds at the fixed start position when a shot has no hotspots", () => {
    expect(cursorPositionAt(0.5, [])).toEqual({ x: 1040, y: 700 });
  });

  it("travels gradually toward hotspot 0 — not instantly at l=0", () => {
    const atStart = cursorPositionAt(0, [{ x: 100, y: 200 }]);
    expect(atStart.x).toBeCloseTo(1040, 0);
  });

  it("with 2 hotspots, stays on the first leg's gradual path before hotspot 1's window opens (the bug this file fixed)", () => {
    const hotspots = [{ x: 100, y: 200 }, { x: 500, y: 600 }];
    // l=0.2 is inside hotspot 0's window (0.16-0.4) but well before hotspot
    // 1's (0.55-0.76) — the cursor must be partway toward hotspot 0, not
    // already snapped onto it.
    const mid = cursorPositionAt(0.2, hotspots);
    expect(mid.x).toBeGreaterThan(100);
    expect(mid.x).toBeLessThan(1040);
  });

  it("reaches hotspot 1 once its own window completes", () => {
    const hotspots = [{ x: 100, y: 200 }, { x: 500, y: 600 }];
    const end = cursorPositionAt(0.76, hotspots);
    expect(end.x).toBeCloseTo(500, 0);
    expect(end.y).toBeCloseTo(600, 0);
  });
});

describe("cursorOpacityAt / shotTransitionEaseAt", () => {
  it("cursor fades out only near the very end of the shot", () => {
    expect(cursorOpacityAt(0.5)).toBe(1);
    expect(cursorOpacityAt(0.96)).toBe(0);
  });

  it("transition ease is 0 at the shot's start and 1 past its own window", () => {
    expect(shotTransitionEaseAt(0)).toBe(0);
    expect(shotTransitionEaseAt(0.16)).toBe(1);
  });
});
