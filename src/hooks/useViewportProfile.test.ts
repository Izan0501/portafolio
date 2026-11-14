import { describe, expect, it } from "vitest";
import { isCompact, isNarrow } from "./useViewportProfile";

describe("isCompact", () => {
  it("is compact for a narrow phone", () => {
    expect(isCompact(375, 812)).toBe(true);
  });

  it("is compact for anything ≤1024px wide, even if not tall/narrow", () => {
    expect(isCompact(1024, 700)).toBe(true);
  });

  it("is not compact for a wide desktop above the width floor", () => {
    expect(isCompact(1920, 1080)).toBe(false);
  });

  it("the aspect check alone can trigger compact even above the width floor", () => {
    expect(isCompact(1400, 1400)).toBe(false); // aspect 1.0, width > 1024 — not compact
    expect(isCompact(1400, 1480)).toBe(true); // aspect just under 0.95
  });
});

describe("isNarrow", () => {
  it("is narrow for a portrait phone", () => {
    expect(isNarrow(375, 812)).toBe(true);
  });

  it("is NOT narrow at 1024×768 — compact (≤1024 wide) but a wide aspect (M13 fix: this size is compact-but-not-narrow, the exact case a real M8 bug conflated)", () => {
    expect(isCompact(1024, 768)).toBe(true);
    expect(isNarrow(1024, 768)).toBe(false);
  });

  it("is not narrow for a wide desktop", () => {
    expect(isNarrow(1920, 1080)).toBe(false);
  });
});
