import { describe, expect, it } from "vitest";
import { profileScreenKey } from "./profile";

describe("profileScreenKey (iPhone)", () => {
  it("is stable for the same inputs", () => {
    expect(profileScreenKey(0.3, "es")).toBe(profileScreenKey(0.3, "es"));
  });

  it("changes when the locale changes", () => {
    expect(profileScreenKey(0.3, "es")).not.toBe(profileScreenKey(0.3, "en"));
  });

  it("changes as chapter progress advances (the count-up figures)", () => {
    expect(profileScreenKey(0.1, "es")).not.toBe(profileScreenKey(0.9, "es"));
  });
});
