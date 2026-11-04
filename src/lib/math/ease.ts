/**
 * Pure easing primitives, ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_c01`/`_ss`/`_win`, lines
 * 427-431). No React, no side effects — safe to call every frame from a
 * `useFrame`/rAF loop or a `MotionValue` transform without ever causing a
 * re-render.
 */

/** Clamp `x` to `[0, 1]`. */
export function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Clamp `x` to `[min, max]`. */
export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

/** Linear interpolation between `a` and `b` at `t`. */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Cubic smoothstep: 0 below `a`, 1 above `b`, `t²(3−2t)` between. */
export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Alias matching the artifact's own short name (`_ss`). */
export const ss = smoothstep;

/**
 * A window that fades in around `a` and out around `b`, each edge feathered
 * by `f`: `ss(a-f, a+f, p) · (1 - ss(b-f, b+f, p))`. Used for every chapter's
 * enter/exit range (artifact `_win`, line 431).
 */
export function win(p: number, a: number, b: number, f: number): number {
  return smoothstep(a - f, a + f, p) * (1 - smoothstep(b - f, b + f, p));
}
