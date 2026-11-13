import { describe, expect, it } from "vitest";
import { certvScreenKey } from "./certv";

describe("certvScreenKey", () => {
  it("is stable for the same inputs", () => {
    expect(certvScreenKey(0, 0.5, true, "es")).toBe(certvScreenKey(0, 0.5, true, "es"));
  });

  it("changes with the active index, locale, image state, and progress", () => {
    const base = certvScreenKey(0, 0.5, true, "es");
    expect(certvScreenKey(1, 0.5, true, "es")).not.toBe(base);
    expect(certvScreenKey(0, 0.5, true, "en")).not.toBe(base);
    expect(certvScreenKey(0, 0.5, false, "es")).not.toBe(base);
    expect(certvScreenKey(0, 0.9, true, "es")).not.toBe(base);
  });
});
