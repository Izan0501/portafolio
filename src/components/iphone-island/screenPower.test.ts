import { describe, expect, it } from "vitest";
import { phoneScreenPower } from "./screenPower";

describe("phoneScreenPower", () => {
  it("is off before the hero ramp starts", () => {
    expect(phoneScreenPower(0)).toBe(0);
    expect(phoneScreenPower(1.0)).toBe(0);
  });

  it("reaches full power once past the ramp, away from the dive window", () => {
    expect(phoneScreenPower(2.3)).toBeCloseTo(1, 5);
    expect(phoneScreenPower(5)).toBeCloseTo(1, 5);
  });

  it("dims near the screen-dive transition (p ≈ 6.85)", () => {
    expect(phoneScreenPower(6.85)).toBeLessThan(phoneScreenPower(5));
  });

  it("never goes negative", () => {
    for (let p = 0; p <= 10; p += 0.5) {
      expect(phoneScreenPower(p)).toBeGreaterThanOrEqual(0);
    }
  });
});
