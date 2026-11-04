import { clamp01 } from "./ease";

/**
 * Monotone cubic Hermite interpolation (Fritsch–Carlson), ported 1:1 from
 * the artifact (`docs/reference/artifact-a/Hero.dc.html`):
 *
 *   - `_keyTangents` (lines 1095-1109) + `_poseAt` (lines 1124-1145): the
 *     multi-channel track used for the 21-channel Mac/iPhone/camera/target/
 *     lid/power pose (see `features/choreography/poses.ts`).
 *   - `_mono` (lines 1112-1122): the same algorithm collapsed into one
 *     function for small single-channel curves (used inline for the hero's
 *     cenital camera path).
 *
 * Why monotone: a plain Catmull-Rom/cubic spline can overshoot past a
 * keyframe's value between two samples (e.g. a camera `y` that dips below
 * both neighbors) — Fritsch–Carlson clamps each segment's tangent so the
 * curve never exceeds the range its two endpoints define, and two equal
 * consecutive keys (a held pose) stay perfectly flat instead of drifting.
 */

/**
 * Fritsch–Carlson tangents for one channel, given its sample times `X` and
 * values `Y` (must be the same length, `X` strictly increasing).
 */
export function monotoneTangents(X: readonly number[], Y: readonly number[]): number[] {
  const n = X.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((Y[i + 1] - Y[i]) / (X[i + 1] - X[i]));

  const m = new Array<number>(n).fill(0);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;

  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const alpha = m[i] / d[i];
    const beta = m[i + 1] / d[i];
    const q = alpha * alpha + beta * beta;
    if (q > 9) {
      const tau = 3 / Math.sqrt(q);
      m[i] = tau * alpha * d[i];
      m[i + 1] = tau * beta * d[i];
    }
  }
  return m;
}

/** Evaluates a single-channel monotone cubic at `x`, clamped at the ends (artifact `_mono`). */
export function monotoneCubicAt(X: readonly number[], Y: readonly number[], x: number): number {
  const n = X.length;
  if (x <= X[0]) return Y[0];
  if (x >= X[n - 1]) return Y[n - 1];

  const m = monotoneTangents(X, Y);
  let i = 0;
  while (i < n - 2 && x > X[i + 1]) i++;

  const h = X[i + 1] - X[i];
  const t = (x - X[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * Y[i] + h10 * h * m[i] + h01 * Y[i + 1] + h11 * h * m[i + 1];
}

/** One sample of a multi-channel track: a time `p` and the value of every channel at that time. */
export interface KeyframeSample {
  p: number;
  values: readonly number[];
}

export interface KeyframeTrack {
  /** Number of channels every sample carries. */
  readonly channelCount: number;
  /** Evaluates every channel at `p`, clamped to the track's first/last key. */
  at(p: number): number[];
}

/**
 * Precomputes Fritsch–Carlson tangents once for every channel (artifact
 * `_keyTangents`) and returns a track whose `.at(p)` does only the O(channels)
 * Hermite evaluation per call (artifact `_poseAt`'s hot path) — safe to call
 * every frame from `useFrame` without re-deriving tangents.
 */
export function createKeyframeTrack(samples: readonly KeyframeSample[]): KeyframeTrack {
  const n = samples.length;
  const channelCount = samples[0]?.values.length ?? 0;
  const X = samples.map((s) => s.p);
  const Y = samples.map((s) => s.values);

  // Tangents per channel, same Fritsch–Carlson pass as monotoneTangents but
  // run once for all channels together (artifact keeps them in one matrix `M`).
  const M: number[][] = Array.from({ length: n }, () => new Array(channelCount).fill(0));
  for (let c = 0; c < channelCount; c++) {
    const d: number[] = [];
    for (let i = 0; i < n - 1; i++) d.push((Y[i + 1][c] - Y[i][c]) / Math.max(1e-6, X[i + 1] - X[i]));
    M[0][c] = d[0];
    M[n - 1][c] = d[n - 2];
    for (let i = 1; i < n - 1; i++) M[i][c] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (Math.abs(d[i]) < 1e-9) {
        M[i][c] = 0;
        M[i + 1][c] = 0;
        continue;
      }
      const alpha = M[i][c] / d[i];
      const beta = M[i + 1][c] / d[i];
      const q = alpha * alpha + beta * beta;
      if (q > 9) {
        const tau = 3 / Math.sqrt(q);
        M[i][c] = tau * alpha * d[i];
        M[i + 1][c] = tau * beta * d[i];
      }
    }
  }

  const out = new Array<number>(channelCount);

  return {
    channelCount,
    at(p: number): number[] {
      let i = 0;
      while (i < n - 2 && p > X[i + 1]) i++;
      const A = X[i];
      const B = X[i + 1];
      const h = B - A;
      const t = clamp01((p - A) / h);
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      const y0 = Y[i];
      const y1 = Y[i + 1];
      const m0 = M[i];
      const m1 = M[i + 1];
      for (let c = 0; c < channelCount; c++) {
        out[c] = h00 * y0[c] + h10 * h * m0[c] + h01 * y1[c] + h11 * h * m1[c];
      }
      return out.slice();
    },
  };
}
