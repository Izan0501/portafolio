import { smoothstep, mix } from "@/lib/math/ease";
import { createKeyframeTrack, monotoneCubicAt } from "@/lib/math/hermite";
import { POSE_KEYS, HERO_CAMERA_PATH, HERO_OVERLAY_END_P } from "./poses";

/**
 * The 21-channel pose evaluated at a scroll position, ported 1:1 from the
 * approved artifact (`docs/reference/artifact-a/Hero.dc.html`, `_poseAt`,
 * lines 1124-1145 for the main track; lines 1134-1143 for the hero overlay).
 *
 * Channel meaning, verified against where the artifact actually *applies*
 * each one to the real Three.js objects (lines 1180, 1187-1188 — not
 * guessed from the numbers alone):
 *   - `mac`: [posX, posY, posZ, rotY (yaw), rotX (pitch), scale]
 *   - `ph`:  [posX, posY, posZ, rotY (yaw), rotX (pitch), rotZ (roll), scale]
 *   - `cam`: [x, y, z] — camera position
 *   - `tgt`: [x, y, z] — camera look-at target
 *   - `lid`: lid hinge angle, in degrees (a spring *target* — see `springs.ts`,
 *     the lid's own position comes from damping toward this, not snapping to it)
 *   - `pow`: screen power/brightness, 0..1
 */
export interface Pose {
  mac: [number, number, number, number, number, number];
  ph: [number, number, number, number, number, number, number];
  cam: [number, number, number];
  tgt: [number, number, number];
  lid: number;
  pow: number;
}

/** Inverse of `poses.ts`'s private `flattenPose` — rebuilds a typed Pose from the track's flat channel output. */
function unflattenPose(values: readonly number[]): Pose {
  return {
    mac: values.slice(0, 6) as Pose["mac"],
    ph: values.slice(6, 13) as Pose["ph"],
    cam: values.slice(13, 16) as Pose["cam"],
    tgt: values.slice(16, 19) as Pose["tgt"],
    lid: values[19],
    pow: values[20],
  };
}

const track = createKeyframeTrack(POSE_KEYS);
const heroT = HERO_CAMERA_PATH.map((h) => h.t);

/**
 * Evaluates the full 21-channel pose at scroll position `p` (screens).
 * Below `HERO_OVERLAY_END_P` (1.55 screens), `cam`/`tgt`/`lid`/`mac`'s yaw
 * are replaced by the hero cenital overlay instead of the main track — the
 * Mac spins from `π` (lid facing the viewer) to its track yaw while the lid
 * eases open on its own smoothstep curve, and the camera flies its own
 * 4-point monotone path from directly overhead down into the working frame.
 */
export function poseAt(p: number): Pose {
  const pose = unflattenPose(track.at(p));

  if (p < HERO_OVERLAY_END_P) {
    const hk = p / HERO_OVERLAY_END_P;
    const s = smoothstep(0.2, 1.0, hk);
    pose.lid = 105 * s * (0.35 + 0.65 * s);
    pose.mac[3] = mix(Math.PI, pose.mac[3], smoothstep(0.22, 0.95, hk));
    for (let j = 0; j < 3; j++) {
      pose.cam[j] = monotoneCubicAt(
        heroT,
        HERO_CAMERA_PATH.map((h) => h.cam[j]),
        hk,
      );
      pose.tgt[j] = monotoneCubicAt(
        heroT,
        HERO_CAMERA_PATH.map((h) => h.tgt[j]),
        hk,
      );
    }
  }

  return pose;
}
