import { describe, expect, it } from "vitest";
import { poseAt } from "./keyframes";
import { POSE_KEYS, HERO_OVERLAY_END_P } from "./poses";

/**
 * Plan M4 quality gate: "tests de vitest sobre la monotonía y la
 * continuidad C¹ de los keyframes (barrido cada 0,01 de p...)".
 *
 * The artifact's own "max camera acceleration dropped from 5.49 to 0.27"
 * figure (IMPLEMENTATION_PLAN.md §2.2) is a cameraFit (M8) measurement, not
 * a property of the raw keyframe track alone — it isn't re-checked here to
 * avoid asserting a number this module doesn't actually produce.
 */

const PMAX = 16.7;
const STEP = 0.01;

function sweep(): number[] {
  const ps: number[] = [];
  for (let p = 0; p <= PMAX + 1e-9; p += STEP) ps.push(Math.min(p, PMAX));
  return ps;
}

/** Every numeric leaf of a Pose, flattened in a stable order for comparison. */
function poseChannels(pose: ReturnType<typeof poseAt>): number[] {
  return [...pose.mac, ...pose.ph, ...pose.cam, ...pose.tgt, pose.lid, pose.pow];
}

describe("features/choreography/keyframes — poseAt", () => {
  it("is defined and finite across the full scroll range, swept every 0.01", () => {
    for (const p of sweep()) {
      const channels = poseChannels(poseAt(p));
      for (const v of channels) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });

  it("holds a channel perfectly flat between two consecutive keyframes with equal values (a held pose)", () => {
    for (let i = 0; i < POSE_KEYS.length - 1; i++) {
      const a = POSE_KEYS[i];
      const b = POSE_KEYS[i + 1];
      if (a.p < HERO_OVERLAY_END_P) continue; // the hero overlay replaces cam/tgt/lid/mac-yaw below 1.55

      for (let c = 0; c < a.values.length; c++) {
        if (a.values[c] !== b.values[c]) continue; // not a held channel on this segment
        // Sample the middle of the segment — a flat Fritsch–Carlson tangent
        // (d[i] == 0) forces the whole span flat, not just the endpoints.
        const mid = (a.p + b.p) / 2;
        const pose = poseAt(mid);
        const channels = poseChannels(pose);
        expect(channels[c]).toBeCloseTo(a.values[c], 6);
      }
    }
  });

  it("never overshoots past the range its two neighboring keyframes define (monotone, no ringing)", () => {
    for (let i = 0; i < POSE_KEYS.length - 1; i++) {
      const a = POSE_KEYS[i];
      const b = POSE_KEYS[i + 1];
      if (b.p <= HERO_OVERLAY_END_P) continue; // hero overlay has its own path, checked separately below

      const from = Math.max(a.p, HERO_OVERLAY_END_P);
      const steps = Math.max(2, Math.round((b.p - from) / STEP));
      for (let s = 0; s <= steps; s++) {
        const p = from + ((b.p - from) * s) / steps;
        const channels = poseChannels(poseAt(p));
        for (let c = 0; c < a.values.length; c++) {
          const lo = Math.min(a.values[c], b.values[c]) - 1e-6;
          const hi = Math.max(a.values[c], b.values[c]) + 1e-6;
          expect(channels[c]).toBeGreaterThanOrEqual(lo);
          expect(channels[c]).toBeLessThanOrEqual(hi);
        }
      }
    }
  });

  it("has no large discontinuity (C⁰) step to step across the full sweep, including the hero-overlay handoff at p=1.55", () => {
    // Bounded per-channel, not by one fixed number for all 21 — `lid` is in
    // degrees (0-105), `mac`/`ph` positions are in metres, yaw/pitch/roll in
    // radians, `pow` in [0,1]. A flat "<1" bound is meaningless across that
    // mix (it originally false-flagged `lid` moving ~1.2°/step while easing
    // open — smooth, by design, just on a bigger scale than a position in
    // metres). Each channel's own total excursion across every keyframe sets
    // its bound instead: no single 0.01-p step should cover more than 15% of
    // a channel's entire range — real discontinuities (a teleport) blow past
    // that by a wide margin, while normal easing never approaches it.
    const channelCount = poseChannels(poseAt(0)).length;
    const ranges = new Array(channelCount).fill(0).map((_, c) => {
      const values = POSE_KEYS.map((k) => k.values[c]);
      return Math.max(...values) - Math.min(...values) || 1; // avoid a zero bound on a never-varying channel
    });

    const ps = sweep();
    let prev = poseChannels(poseAt(ps[0]));
    for (let i = 1; i < ps.length; i++) {
      const cur = poseChannels(poseAt(ps[i]));
      for (let c = 0; c < cur.length; c++) {
        expect(Math.abs(cur[c] - prev[c])).toBeLessThan(ranges[c] * 0.15);
      }
      prev = cur;
    }
  });

  it("the hero camera overlay ends where the main track continues from, within a small tolerance", () => {
    const just_below = poseAt(HERO_OVERLAY_END_P - 0.001);
    const just_above = poseAt(HERO_OVERLAY_END_P + 0.001);
    for (let j = 0; j < 3; j++) {
      expect(Math.abs(just_below.cam[j] - just_above.cam[j])).toBeLessThan(0.05);
      expect(Math.abs(just_below.tgt[j] - just_above.tgt[j])).toBeLessThan(0.05);
    }
  });
});
