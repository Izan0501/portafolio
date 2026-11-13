import { describe, expect, it } from "vitest";
import { stackTileTransform } from "./stackTileTransform";

describe("stackTileTransform", () => {
  it("is invisible before its own emergence window starts", () => {
    expect(stackTileTransform(0, 0, false).visible).toBe(false);
  });

  it("docks into a floating row above the lid, in desktop mode", () => {
    // Tile 0's dock window is [0.225, 0.27] — well inside it, past the
    // "pop" overshoot (sin(π·dd) peaks near dd=0.5, so dd=1 settles flat).
    const t = stackTileTransform(0, 0.27, false);
    expect(t.visible).toBe(true);
    expect(t.position[0]).toBeCloseTo(-1.17, 1); // dockX for index 0
    expect(t.position[1]).toBeCloseTo(2.5, 1); // dockY, desktop
  });

  it("docks back onto the screen's own position, in compact mode", () => {
    // Compact dock target is (0, 1.06, 0.02) — the screen's own spot — but
    // right at dd=1 compact also starts hiding it (`dd > 0.98`), so check
    // a point just inside the dock window instead of fully settled.
    const midDock = stackTileTransform(0, 0.25, true);
    expect(midDock.position[1]).toBeCloseTo(1.06, 0);
  });

  it("hides once fully docked in compact mode (dd > 0.98)", () => {
    expect(stackTileTransform(0, 0.27, true).visible).toBe(false);
  });

  it("returns in reverse order — tile 3 is back (invisible) before tile 0 is", () => {
    // Tile 3's return window is [0.82, 0.87]; tile 0's is [0.895, 0.945].
    const k = 0.9;
    expect(stackTileTransform(3, k, false).visible).toBe(false);
    expect(stackTileTransform(0, k, false).visible).toBe(true);
  });

  it("every tile has fully returned by the end of the chapter", () => {
    for (let i = 0; i < 4; i++) {
      expect(stackTileTransform(i, 1, false).visible).toBe(false);
    }
  });
});
