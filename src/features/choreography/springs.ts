/**
 * Per-element spring constants, ported 1:1 from IMPLEMENTATION_PLAN.md §2.2
 * (cross-checked against the artifact's own inline hinge spring,
 * `docs/reference/artifact-a/Hero.dc.html` line 1175: `L.v += (-140*(L.x-o.lid)
 * - 16*L.v)*st`, which matches the hinge row exactly). Each is `{K, C}` for
 * `stepSpring`/`createSpring` from `@/lib/math/spring` — nothing here owns
 * state; every consumer creates its own `SpringState` and calls `stepSpring`
 * each frame with the constants it needs.
 *
 * No component uses these yet — the hinge (M6), island (M7), briefcase and
 * latches (M10), and badge (M9) don't exist until those modules build the
 * geometry the springs move.
 */
export const SPRING = {
  /** Lid hinge — ζ ≈ 0.68 (slightly underdamped, a small settle-in at the end). */
  hinge: { K: 140, C: 16 },
  /** Dynamic Island width/height resort on chapter change. */
  island: { K: 380, C: 26 },
  /** Briefcase lid. */
  briefcase: { K: 70, C: 8.5 },
  /** Briefcase latches. */
  latches: { K: 260, C: 14 },
  /** Hanging ID badge (pendulum swing). */
  badge: { K: 55, C: 6.5 },
} as const;

export type SpringName = keyof typeof SPRING;

export { createSpring, stepSpring, type SpringState } from "@/lib/math/spring";
