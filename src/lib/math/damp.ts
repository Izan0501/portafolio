/**
 * Framerate-independent exponential damping, ported 1:1 from the artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_damp`, line 430):
 * `a + (b−a)·(1−e^(−λ·dt))`.
 *
 * Unlike a fixed-fraction lerp (`a + (b-a)*0.1`), this converges to the same
 * curve regardless of frame rate — a dropped frame (large `dt`) still lands
 * at the mathematically correct position instead of under- or over-shooting.
 */
export function damp(a: number, b: number, lambda: number, dt: number): number {
  return a + (b - a) * (1 - Math.exp(-lambda * dt));
}
