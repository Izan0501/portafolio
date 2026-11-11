import { describe, expect, it } from "vitest";
import { islandTargetSize } from "./islandTargetSize";

describe("islandTargetSize", () => {
  it("is the default pill for hero/open (the only chapters with geometry so far)", () => {
    expect(islandTargetSize("hero")).toEqual([100, 30]);
    expect(islandTargetSize("open")).toEqual([100, 30]);
  });

  it("widens for cert/prof", () => {
    expect(islandTargetSize("cert")).toEqual([218, 32]);
    expect(islandTargetSize("prof")).toEqual([218, 32]);
  });

  it("is largest for cta", () => {
    expect(islandTargetSize("cta")).toEqual([312, 72]);
  });
});
