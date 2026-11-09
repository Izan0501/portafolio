import { describe, expect, it } from "vitest";
import { smoothstep } from "@/lib/math/ease";
import { screenPower } from "./screenPower";

describe("screenPower", () => {
  it("is off while the lid is closed, regardless of pose power", () => {
    expect(screenPower(1, 0, 3)).toBe(0);
    expect(screenPower(1, 40, 3)).toBe(0);
  });

  it("reaches full pose power once the lid is open past the ramp, away from the dive window", () => {
    expect(screenPower(1, 100, 3)).toBeCloseTo(1, 5);
    expect(screenPower(0.5, 112, 3)).toBeCloseTo(0.5, 5);
  });

  it("dims near the screen-dive transition (p ≈ 6.85) even with the lid fully open", () => {
    const atDive = screenPower(1, 100, 6.85);
    const farFromDive = screenPower(1, 100, 3);
    expect(atDive).toBeLessThan(farFromDive);
  });

  it("flickers down slightly while the lid crosses 62°-70°, relative to the ramp alone", () => {
    // Away from the dive window (dive(3) = 0), so the ramp-only reference
    // isolates exactly what the flick term subtracts.
    const rampOnly = smoothstep(45, 100, 66);
    const withFlick = screenPower(1, 66, 3);
    expect(withFlick).toBeLessThan(rampOnly);
  });

  it("never goes negative across the lid-angle range", () => {
    for (let angle = 0; angle <= 112; angle += 4) {
      expect(screenPower(1, angle, 3)).toBeGreaterThanOrEqual(0);
    }
  });
});
