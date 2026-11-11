import { describe, expect, it } from "vitest";
import { easeInOutCubic, scrollTravelDurationMs } from "./scrollTo";

describe("easeInOutCubic", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it("passes through the midpoint", () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });

  it("is monotonically increasing", () => {
    let prev = -Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const value = easeInOutCubic(t);
      expect(value).toBeGreaterThanOrEqual(prev);
      prev = value;
    }
  });
});

describe("scrollTravelDurationMs", () => {
  it("is 520ms for zero distance", () => {
    expect(scrollTravelDurationMs(0)).toBe(520);
  });

  it("caps at 1700ms for a large distance", () => {
    expect(scrollTravelDurationMs(1000)).toBe(1700);
  });

  it("increases with distance, but less than linearly (sqrt growth)", () => {
    const short = scrollTravelDurationMs(1);
    const long = scrollTravelDurationMs(4);
    expect(long).toBeGreaterThan(short);
    // sqrt(4)/sqrt(1) = 2, so the 300·sqrt term should exactly double.
    expect(long - 520).toBeCloseTo((short - 520) * 2, 5);
  });
});
