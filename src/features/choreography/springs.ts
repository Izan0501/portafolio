/**
 * Per-element spring constants, ported 1:1 from IMPLEMENTATION_PLAN.md §2.2
 * (cross-checked against the artifact's own inline hinge spring,
 * `docs/reference/artifact-a/Hero.dc.html` line 1175: `L.v += (-140*(L.x-o.lid)
 * - 16*L.v)*st`, which matches the hinge row exactly). Each is `{K, C}` for
 * `stepSpring`/`createSpring` from `@/lib/math/spring` — nothing here owns
 * state; every consumer creates its own `SpringState` and calls `stepSpring`
 * each frame with the constants it needs.
 *
 * Briefcase and latches (M10) don't exist until that module builds the
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
  /** Hanging ID badge's vertical drop (artifact `bY`) — despite the name, not the pendulum swing itself. */
  badge: { K: 55, C: 6.5 },
  /** Hanging ID badge's pendulum swing (artifact `bSw`) — target tracks lean + the drop's own velocity, clamped ±0.35 rad. */
  badgeSway: { K: 16, C: 1.6 },
  /** Hanging ID badge's 180° flip (artifact `bFl`) — target is `π · smoothstep(0.68, 0.8, k)`, a late trigger within the chapter, not continuous with scroll. */
  badgeFlip: { K: 42, C: 6.5 },
} as const;

export type SpringName = keyof typeof SPRING;

export { createSpring, stepSpring, type SpringState } from "@/lib/math/spring";
