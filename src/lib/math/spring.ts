/**
 * Sub-stepped critically-ish-damped spring, ported 1:1 from the artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_sp`, lines 1368-1372 — the
 * same integrator drives the hinge directly inline at line 1175).
 *
 * Why sub-stepped: `v += (-K·x - C·v)·dt` is only stable for `dt` below a
 * bound set by `K`/`C`. A dropped frame (`dt` up to the real-`dt` cap below)
 * would blow up a stiff spring (hinge K=140) if integrated in one step, so
 * the real elapsed time is walked forward in fixed ≤ 1/240 s slices instead
 * — same physical result, independent of display frame rate.
 */

export interface SpringState {
  /** Current value. */
  x: number;
  /** Current velocity. */
  v: number;
}

export function createSpring(x0 = 0): SpringState {
  return { x: x0, v: 0 };
}

const SUB_STEP = 1 / 240;
/** Real elapsed time is capped here before sub-stepping — a tab coming back
 * from the background can report a multi-second `dt`; walking that forward
 * in 1/240 s slices would be thousands of steps for one visual frame. */
const MAX_DT = 0.5;

/**
 * Advances `state` one frame toward `target` and returns its new value.
 * `K` (stiffness) and `C` (damping) are per-call, not baked into the spring
 * — the same integrator drives every spring in the recorrido (hinge K140/C16,
 * island K380/C26, briefcase K70/C8.5, latches K260/C14, badge K55/C6.5 —
 * plan §2.2), each with its own constants.
 *
 * With `reduced: true` (prefers-reduced-motion), the spring snaps straight
 * to `target` with zero velocity instead of oscillating — matches the
 * artifact's own `reduced` branch.
 */
export function stepSpring(state: SpringState, target: number, K: number, C: number, dt: number, reduced = false): number {
  if (reduced) {
    state.x = target;
    state.v = 0;
    return state.x;
  }

  let remaining = Math.min(dt, MAX_DT);
  while (remaining > 1e-6) {
    const step = Math.min(remaining, SUB_STEP);
    remaining -= step;
    state.v += (-K * (state.x - target) - C * state.v) * step;
    state.x += state.v * step;
  }
  return state.x;
}
