import { describe, expect, it } from "vitest";
import { KEYBOARD_ROWS, KEYBOARD_WIDTH, KEY_COUNT, KEY_GAP } from "./dimensions";

describe("MacBook keyboard layout", () => {
  it("has 77 keys total — the artifact's real row arrays, not the plan's rounded '79'", () => {
    expect(KEY_COUNT).toBe(77);
  });

  it("every row's units × its own unit size, plus gaps, fill exactly KEYBOARD_WIDTH", () => {
    for (const row of KEYBOARD_ROWS) {
      const units = row.u.reduce((sum, u) => sum + u, 0);
      const unit = (KEYBOARD_WIDTH - KEY_GAP * (row.u.length - 1)) / units;
      const rowWidth = units * unit + KEY_GAP * (row.u.length - 1);
      expect(rowWidth).toBeCloseTo(KEYBOARD_WIDTH, 10);
    }
  });
});
