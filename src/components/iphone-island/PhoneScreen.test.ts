import { describe, expect, it } from "vitest";
import { phoneScreenKey } from "./PhoneScreen";

describe("phoneScreenKey", () => {
  it("is stable for the same inputs", () => {
    expect(phoneScreenKey(0.4, "es")).toBe(phoneScreenKey(0.4, "es"));
  });

  it("changes when the locale changes", () => {
    expect(phoneScreenKey(0.4, "es")).not.toBe(phoneScreenKey(0.4, "en"));
  });

  it("changes as chapter progress advances", () => {
    expect(phoneScreenKey(0.1, "es")).not.toBe(phoneScreenKey(0.9, "es"));
  });
});
