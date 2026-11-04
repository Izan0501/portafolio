import type { KeyframeSample } from "@/lib/math/hermite";
import type { Pose } from "./keyframes";

/**
 * The 26 real keyframes (plus the hero camera overlay), ported 1:1 from the
 * approved artifact (`docs/reference/artifact-a/Hero.dc.html`, `_keys()`,
 * lines 1058-1091). Every number below is copied from that source — the
 * per-keyframe merge (`k(p, o) => {...P, ...o}`, defaulting unset channels
 * to the artifact's base pose `P`) was resolved by hand while porting, not
 * re-derived. `keyframes.ts` turns this into the evaluable `poseAt(p)`.
 *
 * Nothing reads this data yet — no component exists to pose until M6
 * (MacBook) / M7 (iPhone) / M8 (camera). M4's job is making sure the engine
 * (`lib/math/hermite.ts`) and this data are both correct, provable with the
 * continuity tests in `keyframes.test.ts`.
 */

// Base pose `P` the artifact merges every keyframe against.
const P: Pose = { mac: [0.75, 0, 0, -0.24, 0, 1], lid: 105, pow: 1, ph: [2.95, 0.78, 0.65, -0.45, 0, 0, 1], cam: [1.1, 2.0, 7.6], tgt: [1.75, 0.8, 0] };
const OFF: Pose["ph"] = [4.8, 0.95, 1.4, -0.95, 0.12, 0.3, 1];
const PROF = { mac: [0.2, 0, -0.2, -0.1, 0, 1] as Pose["mac"], ph: [3.25, 0.78, 0.15, -0.5, 0, 0, 1] as Pose["ph"], cam: [1.35, 2.3, 8.4] as Pose["cam"], tgt: [1.85, 1.22, 0] as Pose["tgt"] };
const CERT = { mac: [0.3, 0, -0.55, -0.08, 0, 1] as Pose["mac"], ph: [3.7, 0.78, 1.0, -0.48, 0, 0, 1] as Pose["ph"], cam: [1.65, 3.15, 9.3] as Pose["cam"], tgt: [1.75, 0.95, 0.35] as Pose["tgt"] };
const DIVE = { mac: [0.5, 0, 0, -0.06, 0, 1] as Pose["mac"], ph: [3.4, 0.78, 0.3, -0.38, 0, 0, 1] as Pose["ph"], cam: [0.62, 1.12, 1.0] as Pose["cam"], tgt: [0.5, 1.1, -1.3] as Pose["tgt"] };
const VEE1 = { mac: [0.7, 0, 0, -0.3, 0, 1] as Pose["mac"], ph: [2.95, 0.8, 0.8, -0.42, 0, 0, 1] as Pose["ph"], cam: [1.0, 2.0, 7.7] as Pose["cam"], tgt: [1.75, 0.82, 0] as Pose["tgt"] };
const VEE3 = { mac: [0.55, 0, 0.25, -0.5, 0, 0.92] as Pose["mac"], ph: [3.05, 0.82, 1.05, -0.3, 0, 0, 1] as Pose["ph"], cam: [1.2, 2.6, 9.2] as Pose["cam"], tgt: [1.75, 1.6, -0.3] as Pose["tgt"] };
const EST = { mac: [0.8, 0, 0, -0.08, 0, 1] as Pose["mac"], ph: [2.95, 0.78, 0.85, -0.25, 0, 0, 1] as Pose["ph"], cam: [1.2, 2.1, 7.7] as Pose["cam"], tgt: [1.8, 0.8, 0.2] as Pose["tgt"] };
const EST3 = { mac: [0.8, 0, 0, -0.08, 0, 1] as Pose["mac"], ph: [2.95, 0.78, 0.85, -0.25, 0, 0, 1] as Pose["ph"], cam: [1.2, 2.5, 8.4] as Pose["cam"], tgt: [1.8, 0.62, 0.6] as Pose["tgt"] };
const MEL = { mac: [0.1, 0, -1.9, -0.32, 0, 1] as Pose["mac"], lid: 100, pow: 0.32, ph: [1.6, 0.97, 1.45, -0.14, 0, 0, 1.25] as Pose["ph"], cam: [1.0, 1.65, 7.2] as Pose["cam"], tgt: [1.25, 0.9, 0] as Pose["tgt"] };
const CON = { mac: [0.75, 0, 0, -0.3, 0, 1] as Pose["mac"], ph: [2.95, 0.78, 0.85, -0.55, 0, 0, 1] as Pose["ph"] };
const PIPE = { mac: [0.7, 0, 0, 0.0, 0, 1] as Pose["mac"], ph: [2.85, 0.78, 0.7, -0.25, 0, 0, 1] as Pose["ph"], cam: [1.2, 2.4, 7.8] as Pose["cam"], tgt: [1.75, 0.66, 0] as Pose["tgt"] };
const CTA = { mac: [0.35, 0, -0.45, 0.3, 0, 1] as Pose["mac"], lid: 98, ph: [1.8, 0.97, 1.5, 0.04, 0, 0, 1.25] as Pose["ph"], cam: [1.0, 1.7, 7.4] as Pose["cam"], tgt: [1.3, 0.9, 0] as Pose["tgt"] };

function flattenPose(pose: Pose): number[] {
  return [...pose.mac, ...pose.ph, ...pose.cam, ...pose.tgt, pose.lid, pose.pow];
}

function key(p: number, overrides: Partial<Pose> = {}): KeyframeSample {
  return { p, values: flattenPose({ ...P, ...overrides }) };
}

/** The 26 real keyframes, in scroll order (`p` in screens, `PMAX` = 16.7). */
export const POSE_KEYS: readonly KeyframeSample[] = [
  key(0.0, { mac: [0.8, 0, 0, -0.66, 0, 1], lid: 0, pow: 0, ph: OFF, cam: [0.3, 2.7, 6.6], tgt: [0.85, 0.3, 0] }),
  key(0.3, { mac: [0.8, 0, 0, -0.6, 0, 1], lid: 6, pow: 0, ph: OFF, cam: [0.3, 2.6, 6.7], tgt: [0.85, 0.34, 0] }),
  key(1.55, { mac: [0.8, 0, 0, -0.2, 0, 1], lid: 105, pow: 1, ph: [4.6, 0.9, 1.1, -0.8, 0.05, 0.15, 1], cam: [0.45, 2.05, 7.6], tgt: [0.85, 0.8, 0] }),
  key(2.25, PROF),
  key(3.15, PROF),
  key(3.6, CERT),
  key(6.35, CERT),
  key(6.85, DIVE),
  key(7.2),
  key(8.45),
  key(8.75, VEE1),
  key(9.55, VEE1),
  key(9.75, VEE3),
  key(10.0, VEE3),
  key(10.25, EST),
  key(11.1, EST),
  key(11.3, EST3),
  key(11.5, EST3),
  key(11.75, MEL),
  key(12.95, MEL),
  key(13.25, CON),
  key(14.45, CON),
  key(14.75, PIPE),
  key(15.65, PIPE),
  key(16.15, CTA),
  key(16.7, CTA),
];

/**
 * Hero cenital camera overlay (artifact lines 1134-1143): below `p = 1.55`
 * the camera doesn't follow `POSE_KEYS` at all — it flies this separate
 * 4-point monotone path from directly overhead (reading the IZ monogram)
 * down into the working frame. `t` is `p / 1.55`, normalized to `[0, 1]`.
 */
export const HERO_CAMERA_PATH: readonly { t: number; cam: readonly [number, number, number]; tgt: readonly [number, number, number] }[] = [
  { t: 0, cam: [0.8, 9.0, 0.7], tgt: [0.8, 0, 0] },
  { t: 0.25, cam: [0.8, 8.8, 0.9], tgt: [0.8, 0, 0] },
  { t: 0.62, cam: [0.2, 5.0, 5.2], tgt: [0.6, 0.35, 0] },
  { t: 1, cam: [0.45, 2.05, 7.6], tgt: [0.85, 0.8, 0] },
];

/** Scroll position (screens) below which the hero camera overlay applies. */
export const HERO_OVERLAY_END_P = 1.55;
