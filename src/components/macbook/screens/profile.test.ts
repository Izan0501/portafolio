import { describe, expect, it } from "vitest";
import { profileScreenKey } from "./profile";

describe("profileScreenKey (Mac)", () => {
  it("is stable for the same inputs", () => {
    expect(profileScreenKey(0.3, 1.0, "es")).toBe(profileScreenKey(0.3, 1.0, "es"));
  });

  it("changes when the locale changes", () => {
    expect(profileScreenKey(0.3, 1.0, "es")).not.toBe(profileScreenKey(0.3, 1.0, "en"));
  });

  it("changes as chapter progress advances", () => {
    expect(profileScreenKey(0.1, 1.0, "es")).not.toBe(profileScreenKey(0.9, 1.0, "es"));
  });

  it("changes roughly 8 times per second of elapsed time (the pulsing availability dot)", () => {
    const a = profileScreenKey(0.3, 0.0, "es");
    const b = profileScreenKey(0.3, 1 / 8 + 0.001, "es");
    expect(a).not.toBe(b);
  });
});
