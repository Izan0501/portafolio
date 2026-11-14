import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { computeFreeArea, fitCamera } from "./cameraFit";

/**
 * Plan M8 quality gate: "barrido automático de los 13 tamaños × p ∈ [0,
 * 16.7], sin superposición texto-modelo". The 13 reference sizes are the
 * plan's own matrix (Anexo/M13 §: 320×568 … 2560×1440).
 *
 * What this can actually verify without a browser (no Playwright/real DOM
 * available in this environment, same limitation documented since M0):
 * that `computeFreeArea`/`fitCamera` never degrade into a collapsed or
 * numerically broken frame for any of the 13 sizes — not that real text
 * and the real 3D model never visually overlap, which needs a mounted
 * page. `assertExclusion`'s own dev-time check covers the live case this
 * test can't reach.
 */
const REFERENCE_SIZES: ReadonlyArray<readonly [number, number]> = [
  [320, 568],
  [375, 812],
  [414, 896],
  [700, 900],
  [768, 1024],
  [844, 390],
  [1024, 768],
  [1280, 720],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
];

/** Artifact `_fitCam` line 1210: `a < 0.95` — aspect alone, no width term (M13 fix: this used to also be `|| width <= 1024`, which made this sweep validate the very bug it should have caught — see `useViewportProfile.ts`'s own `isNarrow`). */
function isNarrow(width: number, height: number): boolean {
  return width / height < 0.95;
}

describe("camera fit sweep — 13 reference sizes", () => {
  for (const [width, height] of REFERENCE_SIZES) {
    it(`${width}×${height}: free area never collapses`, () => {
      const narrow = isNarrow(width, height);
      const area = computeFreeArea({ narrow, copyFraction: 0.365, sheetTop: height * 0.55, viewportWidth: width, viewportHeight: height });
      expect(area.x1 - area.x0).toBeGreaterThan(40);
      expect(area.y1 - area.y0).toBeGreaterThan(40);
    });

    it(`${width}×${height}: fitCamera returns a finite, positive distance for a representative point cloud`, () => {
      const narrow = isNarrow(width, height);
      const area = computeFreeArea({ narrow, copyFraction: 0.365, sheetTop: height * 0.55, viewportWidth: width, viewportHeight: height });
      // A representative Mac-sized cloud (base + lid corners), independent of any real scene.
      const points = [
        new THREE.Vector3(-1.5, 0, -1.04),
        new THREE.Vector3(1.5, 0, -1.04),
        new THREE.Vector3(-1.5, 0, 1.04),
        new THREE.Vector3(1.5, 0, 1.04),
        new THREE.Vector3(-1.5, 2.04, 0),
        new THREE.Vector3(1.5, 2.04, 0),
      ];
      const result = fitCamera({
        points,
        direction: new THREE.Vector3(0.1, 0.3, 1).normalize(),
        up: new THREE.Vector3(0, 1, 0),
        fovDegrees: 45,
        aspect: width / height,
        freeArea: area,
        viewportWidth: width,
        viewportHeight: height,
        marginFactor: narrow ? 0.92 : 0.94,
      });
      expect(Number.isFinite(result.distance)).toBe(true);
      expect(result.distance).toBeGreaterThan(0);
      expect(Number.isFinite(result.center.x)).toBe(true);
    });
  }
});
