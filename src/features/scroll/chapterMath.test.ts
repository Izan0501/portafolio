import { describe, expect, it } from "vitest";
import { chapterProgressAt } from "./chapterMath";
import { CH } from "@/config/chapters";

describe("chapterProgressAt", () => {
  const hero = CH[0]; // { a: 0.0, b: 0.8 }

  it("is 0 at the chapter's start and 1 at its end", () => {
    expect(chapterProgressAt(hero.a, hero)).toBe(0);
    expect(chapterProgressAt(hero.b, hero)).toBe(1);
  });

  it("is 0.5 at the midpoint", () => {
    expect(chapterProgressAt((hero.a + hero.b) / 2, hero)).toBeCloseTo(0.5, 5);
  });

  it("clamps outside the chapter's own range", () => {
    expect(chapterProgressAt(hero.a - 10, hero)).toBe(0);
    expect(chapterProgressAt(hero.b + 10, hero)).toBe(1);
  });
});
