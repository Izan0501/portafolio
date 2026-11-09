import { describe, expect, it } from "vitest";
import { bootScreenKey } from "./boot";

describe("bootScreenKey", () => {
  it("is stable for the same inputs", () => {
    expect(bootScreenKey(1.2, 3.456, "es")).toBe(bootScreenKey(1.2, 3.456, "es"));
  });

  it("changes when the locale changes, with everything else held fixed", () => {
    expect(bootScreenKey(1.2, 3.456, "es")).not.toBe(bootScreenKey(1.2, 3.456, "en"));
  });

  it("changes roughly 12 times per second of elapsed time (the cursor-blink/typewriter throttle)", () => {
    const a = bootScreenKey(1.2, 0.0, "es");
    const b = bootScreenKey(1.2, 1 / 12 + 0.001, "es");
    expect(a).not.toBe(b);
  });

  it("does not change for a sub-threshold time delta", () => {
    const a = bootScreenKey(1.2, 1.0, "es");
    const b = bootScreenKey(1.2, 1.0 + 1 / 240, "es");
    expect(a).toBe(b);
  });
});
