import { describe, expect, it } from "vitest";
import { roundedRectShape } from "./roundedRectShape";

describe("roundedRectShape", () => {
  it("stays within the width/height bounding box, centered on the origin", () => {
    const shape = roundedRectShape(3, 2, 0.13);
    const points = shape.getPoints(32);
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) {
      expect(Math.abs(point.x)).toBeLessThanOrEqual(1.5 + 1e-6);
      expect(Math.abs(point.y)).toBeLessThanOrEqual(1.0 + 1e-6);
    }
  });

  it("keeps every point farther from the exact bounding-box corner than a sharp (radius 0) rectangle would", () => {
    const exactCorner = { x: 1.5, y: 1.0 };
    const closestOnSharp = Math.min(
      ...roundedRectShape(3, 2, 0).getPoints(64).map((p) => Math.hypot(p.x - exactCorner.x, p.y - exactCorner.y)),
    );
    const closestOnRounded = Math.min(
      ...roundedRectShape(3, 2, 0.13).getPoints(64).map((p) => Math.hypot(p.x - exactCorner.x, p.y - exactCorner.y)),
    );
    expect(closestOnSharp).toBeCloseTo(0, 6);
    expect(closestOnRounded).toBeGreaterThan(closestOnSharp + 0.02);
  });

  it("degenerates to a sharp rectangle when radius is 0", () => {
    const shape = roundedRectShape(3, 2, 0);
    const points = shape.getPoints(8);
    const hasExactCorner = points.some((p) => Math.abs(p.x) > 1.49 && Math.abs(p.y) > 0.99);
    expect(hasExactCorner).toBe(true);
  });
});
