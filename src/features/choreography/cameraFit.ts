import * as THREE from "three";

/**
 * The camera auto-fit algorithm, ported from the artifact's `_fitCam`
 * (`docs/reference/artifact-a/Hero.dc.html`, lines 1241-1310). Pure and
 * stateless — every smoothing the artifact does (direction, free-area
 * rect, the resulting distance/center, each with its own exponential
 * damping and, for distance, an asymmetric rate depending on whether it's
 * growing or shrinking) lives in `CameraDirector.tsx`'s own refs, calling
 * `fitCamera` fresh each frame with already-smoothed inputs. That split is
 * what makes the actual projection math here testable without a mounted
 * Canvas or any per-frame state.
 *
 * `_fitCam` collects world-space points from `this.mac`/`this.lid`/`this.ph`
 * directly (via `localToWorld`) — that collection needs real `THREE.Object3D`
 * matrices and stays in `CameraDirector.tsx`. This file only takes the
 * resulting point list.
 */

export interface FreeAreaRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Artifact lines 1248-1249: the plain average of the always-on base points, used only to anchor `blendTowardCentroid` — not the bounding-box center `fitCamera` pivots on. */
export function centroidOf(points: readonly THREE.Vector3[]): THREE.Vector3 {
  const sum = new THREE.Vector3();
  for (const point of points) sum.add(point);
  return points.length > 0 ? sum.multiplyScalar(1 / points.length) : sum;
}

/**
 * The artifact's anti-pop trick for an optional point whose relevance
 * fades in/out with scroll (`addW`, line 1251): at `weight = 0` it sits
 * exactly on `centroid` (no effect on the bounding box, no popping in/out
 * of frame), and eases linearly to its real position as `weight → 1`.
 */
export function blendTowardCentroid(point: THREE.Vector3, centroid: THREE.Vector3, weight: number): THREE.Vector3 {
  return centroid.clone().add(point.clone().sub(centroid).multiplyScalar(weight));
}

export interface CameraFitInput {
  /** World-space points to fit — fixed points plus any already-blended optional ones. Must be non-empty. */
  points: readonly THREE.Vector3[];
  /** Normalized, pointing from the look-at target toward the camera (already damped by the caller). */
  direction: THREE.Vector3;
  up: THREE.Vector3;
  fovDegrees: number;
  aspect: number;
  /** The on-screen free area, in CSS pixels (already damped by the caller). */
  freeArea: FreeAreaRect;
  viewportWidth: number;
  viewportHeight: number;
  /** Shrinks the usable frustum slightly so fitted content never touches the free area's own edge (artifact: 0.92 narrow / 0.94 wide). */
  marginFactor: number;
}

export interface CameraFitResult {
  /** Distance from `center` to the camera, along `direction` — the caller still has to damp this itself (asymmetric rate: artifact grows at rate 9, shrinks at rate 3.5). */
  distance: number;
  /** The fitted points' bounding-box center — what the camera should look at. */
  center: THREE.Vector3;
  /** `setViewOffset` arguments (artifact line 1224: `cam.setViewOffset(vw, vh, ox, oy, vw, vh)`) — the full-frame offset that re-centers the view on `freeArea` instead of the full viewport. */
  offsetX: number;
  offsetY: number;
}

const BOUNDS_SENTINEL = 1e9;

/**
 * Finds the camera distance (along `direction`, pivoting on the points'
 * bounding-box center) that fits every point inside the frustum's
 * `freeArea` fraction — the maximum over all points of `_fitCam`'s own
 * per-point bound (line 1301): `|xc|/tx + zc` and `|yc|/ty + zc`, where
 * `xc/yc/zc` are each point's offset from `center` projected onto the
 * camera's local right/up/direction axes.
 */
export function fitCamera(input: CameraFitInput): CameraFitResult {
  const { points, direction, up, fovDegrees, aspect, freeArea, viewportWidth, viewportHeight, marginFactor } = input;
  if (points.length === 0) throw new Error("fitCamera: points must be non-empty");

  const min = new THREE.Vector3(BOUNDS_SENTINEL, BOUNDS_SENTINEL, BOUNDS_SENTINEL);
  const max = new THREE.Vector3(-BOUNDS_SENTINEL, -BOUNDS_SENTINEL, -BOUNDS_SENTINEL);
  for (const point of points) {
    min.min(point);
    max.max(point);
  }
  const center = min.add(max).multiplyScalar(0.5);

  const forward = direction.clone().negate();
  const right = forward.clone().cross(up).normalize();
  const trueUp = right.clone().cross(forward).normalize();

  const halfFovTan = Math.tan((fovDegrees * Math.PI) / 360);
  const tx = halfFovTan * aspect * ((freeArea.x1 - freeArea.x0) / viewportWidth) * marginFactor;
  const ty = halfFovTan * ((freeArea.y1 - freeArea.y0) / viewportHeight) * marginFactor;

  let distance = 0;
  const rel = new THREE.Vector3();
  for (const point of points) {
    rel.subVectors(point, center);
    const xc = rel.dot(right);
    const yc = rel.dot(trueUp);
    const zc = rel.dot(direction);
    distance = Math.max(distance, Math.abs(xc) / tx + zc, Math.abs(yc) / ty + zc);
  }

  return {
    distance,
    center,
    offsetX: viewportWidth / 2 - (freeArea.x0 + freeArea.x1) / 2,
    offsetY: viewportHeight / 2 - (freeArea.y0 + freeArea.y1) / 2,
  };
}

export interface FreeAreaParams {
  /**
   * Artifact `narrow` (`_fitCam` line 1210: `a < 0.95`, aspect alone) —
   * *not* the broader `compact` (`useViewportProfile.ts`'s own, `width
   * <= 1024` even at a wide aspect). Conflating the two here was a real
   * M8 bug: at e.g. 1024×768 (wide, `compact` true, `narrow` false),
   * the artifact still uses the side-column `copyFraction` branch below,
   * not `sheetTop` — confirmed fixed in M13.
   */
  narrow: boolean;
  /** Fraction of viewport width the text column occupies (artifact `_copyFrac`, measured from the real DOM — `CameraDirector` passes it in instead of this file touching the DOM). */
  copyFraction: number;
  /** Narrow-mode only: the top edge of the active chapter's text sheet, in CSS pixels from the viewport top (artifact `_sheetTop`, read from `Sheet.tsx`/`sheetStore.ts`, M13). */
  sheetTop: number;
  viewportWidth: number;
  viewportHeight: number;
}

/** The raw (un-damped) free-area rect for the current layout (artifact lines 1286-1291). */
export function computeFreeArea({ narrow, copyFraction, sheetTop, viewportWidth, viewportHeight }: FreeAreaParams): FreeAreaRect {
  if (narrow) {
    const y0 = 62;
    return { x0: 10, x1: viewportWidth - 10, y0, y1: Math.max(y0 + 120, sheetTop - 10) };
  }
  return { x0: copyFraction * viewportWidth + 24, x1: viewportWidth - 20, y0: 62, y1: viewportHeight - 18 };
}

/**
 * Development-only sanity check with no artifact precedent (confirmed:
 * no `assertExclusion`/`console.assert`/exclusion-related text anywhere
 * in the source) — the plan asks for it, this is new, not ported.
 *
 * Catches the two ways this algorithm can quietly produce a nonsense
 * frame instead of a visibly broken one: a free area collapsed by a
 * layout bug (division by a near-zero `tx`/`ty` in `fitCamera` would
 * otherwise just blow the fitted distance up silently), and a fitted
 * distance so small the camera would end up inside its own near plane.
 * `console.warn`, never a thrown error — a dev-time signal, not something
 * that should ever crash the real experience.
 */
export function assertExclusion(freeArea: FreeAreaRect, result: CameraFitResult, cameraNear: number): void {
  if (process.env.NODE_ENV !== "development") return;

  const width = freeArea.x1 - freeArea.x0;
  const height = freeArea.y1 - freeArea.y0;
  if (width < 40 || height < 40) {
    console.warn(`[cameraFit] free area collapsed to ${width.toFixed(0)}×${height.toFixed(0)}px — text and the 3D model are likely overlapping.`);
  }
  if (result.distance <= cameraNear) {
    console.warn(`[cameraFit] fitted distance (${result.distance.toFixed(3)}) is inside the camera's near plane (${cameraNear}) — the model may clip.`);
  }
}
