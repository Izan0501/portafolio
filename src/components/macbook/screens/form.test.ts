import { describe, expect, it } from "vitest";
import { formScreenKey } from "./form";

describe("formScreenKey", () => {
  it("is stable for the same inputs", () => {
    const now = new Date("2026-11-13");
    expect(formScreenKey(2, "es", now)).toBe(formScreenKey(2, "es", now));
  });

  it("changes with verified count, locale, and date", () => {
    const now = new Date("2026-11-13");
    const base = formScreenKey(2, "es", now);
    expect(formScreenKey(3, "es", now)).not.toBe(base);
    expect(formScreenKey(2, "en", now)).not.toBe(base);
    expect(formScreenKey(2, "es", new Date("2026-11-14"))).not.toBe(base);
  });
});
