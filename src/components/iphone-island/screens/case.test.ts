import { describe, expect, it } from "vitest";
import { caseScreenKey, caseCredentialScreenKey } from "./case";

describe("caseScreenKey", () => {
  it("is stable for the same inputs and changes with progress/locale", () => {
    expect(caseScreenKey(0.3, "es")).toBe(caseScreenKey(0.3, "es"));
    expect(caseScreenKey(0.3, "es")).not.toBe(caseScreenKey(0.3, "en"));
    expect(caseScreenKey(0.3, "es")).not.toBe(caseScreenKey(0.9, "es"));
  });
});

describe("caseCredentialScreenKey", () => {
  it("is stable for the same inputs and changes with index/progress/image/locale", () => {
    const base = caseCredentialScreenKey(0, 0.5, true, "es");
    expect(caseCredentialScreenKey(0, 0.5, true, "es")).toBe(base);
    expect(caseCredentialScreenKey(1, 0.5, true, "es")).not.toBe(base);
    expect(caseCredentialScreenKey(0, 0.9, true, "es")).not.toBe(base);
    expect(caseCredentialScreenKey(0, 0.5, false, "es")).not.toBe(base);
    expect(caseCredentialScreenKey(0, 0.5, true, "en")).not.toBe(base);
  });
});
