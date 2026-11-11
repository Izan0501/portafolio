import { beforeEach, describe, expect, it } from "vitest";
import { islandStore, islandIsOpen, syncIslandAutoState } from "./islandStore";
import { scrollStore } from "@/features/scroll/scrollStore";

/**
 * `syncIslandAutoState` is edge-triggered on `scrollStore.dir` changing
 * (not its raw value) — every direction-based case below first drives
 * `dir` through 0 to align the module-private `lastDir` before asserting,
 * so each test is independent of whatever the previous one left behind.
 */
function resetDirectionEdge() {
  scrollStore.dir = 0;
  syncIslandAutoState();
}

describe("islandIsOpen", () => {
  beforeEach(() => {
    islandStore.auto = true;
    islandStore.forced = null;
    islandStore.hov = false;
    islandStore.focus = false;
    islandStore.lockHov = false;
  });

  it("an explicit forced state wins over everything else", () => {
    islandStore.forced = true;
    islandStore.auto = false;
    expect(islandIsOpen(true)).toBe(true);

    islandStore.forced = false;
    islandStore.hov = true;
    expect(islandIsOpen(false)).toBe(false);
  });

  it("hover or focus opens it even while auto is false", () => {
    islandStore.auto = false;
    islandStore.hov = true;
    expect(islandIsOpen(false)).toBe(true);

    islandStore.hov = false;
    islandStore.focus = true;
    expect(islandIsOpen(false)).toBe(true);
  });

  it("auto opens it unless a click-to-navigate travel is in flight", () => {
    islandStore.auto = true;
    expect(islandIsOpen(false)).toBe(true);
    expect(islandIsOpen(true)).toBe(false);
  });

  it("is closed when nothing is forcing/hovering/focusing/auto-opening it", () => {
    islandStore.auto = false;
    expect(islandIsOpen(false)).toBe(false);
  });
});

describe("syncIslandAutoState", () => {
  beforeEach(() => {
    islandStore.auto = true;
    islandStore.forced = null;
    scrollStore.pt = 0.5;
    scrollStore.dir = 0;
  });

  it("forces auto-open near the very start of the scroll, regardless of direction", () => {
    islandStore.auto = false;
    islandStore.forced = true;
    scrollStore.pt = 0.05;
    syncIslandAutoState();
    expect(islandStore.auto).toBe(true);
    expect(islandStore.forced).toBeNull();
  });

  it("folds on a scroll-down edge, past the auto-open zone", () => {
    scrollStore.pt = 0.5;
    resetDirectionEdge();
    scrollStore.dir = 1;
    syncIslandAutoState();
    expect(islandStore.auto).toBe(false);
  });

  it("unfolds on a scroll-up edge", () => {
    islandStore.auto = false;
    scrollStore.pt = 0.5;
    resetDirectionEdge();
    scrollStore.dir = -1;
    syncIslandAutoState();
    expect(islandStore.auto).toBe(true);
  });

  it("does not re-trigger while direction stays the same across calls", () => {
    scrollStore.pt = 0.5;
    resetDirectionEdge();
    scrollStore.dir = 1;
    syncIslandAutoState();
    expect(islandStore.auto).toBe(false);

    islandStore.auto = true; // force it back open to prove the next call leaves it alone
    syncIslandAutoState();
    expect(islandStore.auto).toBe(true);
  });
});
