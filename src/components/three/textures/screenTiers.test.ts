import { describe, expect, it } from "vitest";
import { resolveScreenTier } from "./screenTiers";

describe("resolveScreenTier", () => {
  it("upgrades a high-GPU-tier M floor to L on a wide, non-compact viewport", () => {
    expect(resolveScreenTier("M", 1920, false)).toBe("L");
  });

  it("never upgrades below the 1440px width threshold", () => {
    expect(resolveScreenTier("M", 1439, false)).toBe("M");
  });

  it("never upgrades a compact viewport, even if wide (e.g. a short landscape phone)", () => {
    expect(resolveScreenTier("M", 1920, true)).toBe("M");
  });

  it("passes an already-L floor through unchanged", () => {
    expect(resolveScreenTier("L", 320, true)).toBe("L");
  });
});
