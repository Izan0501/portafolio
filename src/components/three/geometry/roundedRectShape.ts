import * as THREE from "three";

/**
 * A rounded-rectangle `THREE.Shape`, centered on the origin, ported 1:1
 * from the artifact's own helper (`docs/reference/artifact-a/Hero.dc.html`,
 * `_rr`, lines 564-571). Quadratic-curve corners, not arcs — matches the
 * artifact exactly rather than approximating with `THREE.Shape`'s own
 * `absarc`.
 *
 * Used everywhere the artifact uses `_rr`: the MacBook chassis/lid/trackpad
 * (M6), and — as later modules port them — the iPhone body, briefcase
 * panels, cert plates and badge.
 */
export function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = radius;

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}
