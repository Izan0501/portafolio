import { describe, expect, it } from "vitest";
import { programProgress } from "./programProgress";

describe("programProgress", () => {
  it("is 0 at the start date and 1 at the end date", () => {
    expect(programProgress("2024-04-01", "2027-02-28", new Date("2024-04-01"))).toBe(0);
    expect(programProgress("2024-04-01", "2027-02-28", new Date("2027-02-28"))).toBe(1);
  });

  it("clamps before the start and after the end", () => {
    expect(programProgress("2024-04-01", "2027-02-28", new Date("2020-01-01"))).toBe(0);
    expect(programProgress("2024-04-01", "2027-02-28", new Date("2030-01-01"))).toBe(1);
  });

  it("is roughly 91% in November 2026, not the artifact's stale fixed 62%", () => {
    const progress = programProgress("2024-04-01", "2027-02-28", new Date("2026-11-12"));
    expect(progress).toBeGreaterThan(0.85);
    expect(progress).toBeLessThan(0.95);
  });
});
