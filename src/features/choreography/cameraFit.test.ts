import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { blendTowardCentroid, centroidOf, computeFreeArea, fitCamera } from "./cameraFit";

describe("centroidOf", () => {
  it("averages the points", () => {
    const c = centroidOf([new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 4, 6)]);
    expect(c.x).toBeCloseTo(1, 10);
    expect(c.y).toBeCloseTo(2, 10);
    expect(c.z).toBeCloseTo(3, 10);
  });

  it("is the origin for an empty list", () => {
    const c = centroidOf([]);
    expect(c.x).toBe(0);
    expect(c.y).toBe(0);
    expect(c.z).toBe(0);
  });
});

describe("blendTowardCentroid", () => {
  const centroid = new THREE.Vector3(1, 1, 1);
  const point = new THREE.Vector3(5, 1, 1);

  it("sits exactly on the centroid at weight 0 — the anti-pop guarantee", () => {
    const blended = blendTowardCentroid(point, centroid, 0);
    expect(blended.x).toBeCloseTo(1, 10);
  });

  it("is the real point at weight 1", () => {
    const blended = blendTowardCentroid(point, centroid, 1);
    expect(blended.x).toBeCloseTo(5, 10);
  });

  it("is the midpoint at weight 0.5", () => {
    const blended = blendTowardCentroid(point, centroid, 0.5);
    expect(blended.x).toBeCloseTo(3, 10);
  });
});

describe("fitCamera", () => {
  // direction=(0,0,1): the camera sits on +Z looking toward -Z, a 90° FOV
  // (tan(45°) = 1) so the free-area/margin factors collapse to simple
  // fractions and the expected distance is hand-computable.
  const baseInput = {
    direction: new THREE.Vector3(0, 0, 1),
    up: new THREE.Vector3(0, 1, 0),
    fovDegrees: 90,
    aspect: 1,
    freeArea: { x0: 0, x1: 100, y0: 0, y1: 100 },
    viewportWidth: 100,
    viewportHeight: 100,
    marginFactor: 1,
  };

  it("needs distance 1 to fit two points ±1 apart on the right axis, at a 90° FOV with no margin loss", () => {
    const result = fitCamera({ ...baseInput, points: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)] });
    expect(result.distance).toBeCloseTo(1, 10);
    expect(result.center.x).toBeCloseTo(0, 10);
  });

  it("a point further toward the camera (positive zc) demands more distance than the same offset further away", () => {
    const closer = fitCamera({ ...baseInput, points: [new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(0, 0, -0.5)] });
    expect(closer.distance).toBeCloseTo(0.5, 10);
  });

  it("halving marginFactor doubles the required distance", () => {
    const full = fitCamera({ ...baseInput, points: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)] });
    const halved = fitCamera({ ...baseInput, marginFactor: 0.5, points: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)] });
    expect(halved.distance).toBeCloseTo(full.distance * 2, 10);
  });

  it("a narrower free area demands more distance for the same points", () => {
    const wide = fitCamera({ ...baseInput, points: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)] });
    const narrow = fitCamera({
      ...baseInput,
      freeArea: { x0: 0, x1: 50, y0: 0, y1: 100 },
      points: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
    });
    expect(narrow.distance).toBeGreaterThan(wide.distance);
  });

  it("offsets re-center the view on the free area's own midpoint, not the viewport's", () => {
    const result = fitCamera({
      ...baseInput,
      freeArea: { x0: 20, x1: 100, y0: 0, y1: 100 },
      points: [new THREE.Vector3(0, 0, 0)],
    });
    // Free area midpoint x = 60; viewport midpoint x = 50 → offset = 50 - 60 = -10.
    expect(result.offsetX).toBeCloseTo(-10, 10);
    expect(result.offsetY).toBeCloseTo(0, 10);
  });

  it("throws on an empty point list rather than silently returning a meaningless fit", () => {
    expect(() => fitCamera({ ...baseInput, points: [] })).toThrow();
  });
});

describe("computeFreeArea", () => {
  it("wide mode: starts past the measured copy column, ends near the viewport's right edge", () => {
    const area = computeFreeArea({ compact: false, copyFraction: 0.365, sheetTop: 0, viewportWidth: 1000, viewportHeight: 800 });
    expect(area.x0).toBeCloseTo(365 + 24, 5);
    expect(area.x1).toBe(980);
    expect(area.y0).toBe(62);
    expect(area.y1).toBe(782);
  });

  it("compact mode: spans nearly the full width, bounded above by the text sheet", () => {
    const area = computeFreeArea({ compact: true, copyFraction: 0.365, sheetTop: 500, viewportWidth: 400, viewportHeight: 800 });
    expect(area.x0).toBe(10);
    expect(area.x1).toBe(390);
    expect(area.y1).toBe(490);
  });

  it("compact mode: never collapses below a 120px-tall floor even with a very high sheet", () => {
    const area = computeFreeArea({ compact: true, copyFraction: 0.365, sheetTop: 70, viewportWidth: 400, viewportHeight: 800 });
    expect(area.y1 - area.y0).toBeGreaterThanOrEqual(120);
  });
});
