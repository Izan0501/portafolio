import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { certFlightState, certLocalProgress, certRectToLidLocal, certScreenRect, formationProgress, type CertFlightPoints } from "./certFlight";

describe("certScreenRect", () => {
  it("fits a wider-than-panel image to the panel's own width", () => {
    const rect = certScreenRect(4); // very wide image
    expect(rect.width).toBeCloseTo(780, 5);
    expect(rect.height).toBeLessThan(560);
  });

  it("fits a taller-than-panel image to the panel's own height", () => {
    const rect = certScreenRect(0.3); // very tall image
    expect(rect.height).toBeCloseTo(560, 5);
    expect(rect.width).toBeLessThan(780);
  });

  it("centers the fitted rect inside the panel", () => {
    const rect = certScreenRect(4);
    const panelCenterX = 72 + 780 / 2;
    expect(rect.x + rect.width / 2).toBeCloseTo(panelCenterX, 5);
  });
});

describe("certRectToLidLocal", () => {
  it("maps the canvas's own center to the lid-local X=0 axis", () => {
    const centeredRect = { x: 640 - 1, y: 400 - 1, width: 2, height: 2 }; // centered on the 1280×800 canvas
    const point = certRectToLidLocal(centeredRect, 0.62);
    expect(point.x).toBeCloseTo(0, 5);
    expect(point.z).toBe(0.62);
  });
});

describe("formationProgress / certLocalProgress", () => {
  it("formationProgress matches the plan's Anexo A formula", () => {
    expect(formationProgress(0.17)).toBeCloseTo(0, 10);
    expect(formationProgress(0.17 + 0.15)).toBeCloseTo(1, 10);
  });

  it("certLocalProgress offsets by index", () => {
    expect(certLocalProgress(2.5, 2)).toBeCloseTo(0.5, 10);
  });
});

describe("certFlightState", () => {
  const points: CertFlightPoints = {
    stack: new THREE.Vector3(0, 0.1, 0.02),
    up: new THREE.Vector3(-0.1, 0.95, 0.1),
    show: new THREE.Vector3(1, 1.06, 0.62),
    screen: new THREE.Vector3(1, 1.06, 0.03),
    screenWorldWidth: 1.2,
  };

  it("rests in the stack before its turn (u ≤ 0)", () => {
    const state = certFlightState(-0.2, points, 0, false);
    expect(state.visible).toBe(true);
    expect(state.position.equals(points.stack)).toBe(true);
    expect(state.scale).toBeCloseTo(0.72, 5);
  });

  it("is invisible once fully absorbed (u ≥ 0.95)", () => {
    expect(certFlightState(0.96, points, 0, false).visible).toBe(false);
  });

  it("is between stack and up during 'subida' (u < 0.28)", () => {
    const state = certFlightState(0.1, points, 0, false);
    expect(state.position.y).toBeGreaterThan(points.stack.y);
    expect(state.position.y).toBeLessThan(points.up.y);
  });

  it("rises above both up and show during the arc (Bézier control point lift)", () => {
    const state = certFlightState(0.42, points, 0, true); // reduced=true removes the float bob for a clean comparison
    expect(state.position.y).toBeGreaterThan(points.up.y);
    expect(state.position.y).toBeGreaterThan(points.show.y);
  });

  it("settles near 'show' while floating (u in [0.55, 0.78))", () => {
    const state = certFlightState(0.65, points, 0, true);
    expect(state.position.x).toBeCloseTo(points.show.x, 1);
    expect(state.position.z).toBeCloseTo(points.show.z, 1);
  });

  it("is between show and screen while absorbing (u in [0.78, 0.95))", () => {
    const state = certFlightState(0.86, points, 0, false);
    expect(state.position.z).toBeGreaterThan(points.screen.z);
    expect(state.position.z).toBeLessThan(points.show.z);
  });

  it("flashes briefly mid-arc and never outside that window", () => {
    expect(certFlightState(0.55, points, 0, false).frameFlash).toBeGreaterThan(0);
    expect(certFlightState(0.1, points, 0, false).frameFlash).toBe(0);
    expect(certFlightState(0.95 - 0.001, points, 0, false).frameFlash).toBeLessThan(0.01);
  });
});
