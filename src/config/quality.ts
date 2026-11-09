/**
 * GPU quality tiers (plan §2.3, §3.1). Two tiers, not three: `useDetectGPU().tier`
 * (from `detect-gpu`, 0-3) collapses to `low` at `tier <= 1`, `high` otherwise —
 * the plan only ever branches render settings (DPR/antialias) on that one
 * boundary, never on a finer split.
 *
 * NOTE — unresolved inconsistency in IMPLEMENTATION_PLAN.md §2.3, flagged
 * here rather than guessed past: one sentence says low tier keeps "el DPR
 * ... fijo en 1" while the very next paragraph's Renderer row says low tier
 * is "antialias: false + DPR 1,5". This file takes the more conservative
 * reading — DPR 1, no antialias, least possible GPU work — since it's the
 * plainer of the two statements and a safe default for weak hardware either
 * way. Flagged in the M5 report for Ivo to confirm or correct; changing it
 * later is a one-line edit to `QUALITY_TIERS.low.dpr`.
 */
export type QualityTierName = "low" | "high";

export interface QualityTier {
  /** Target pixel ratio passed to the Canvas — a single number (fixed) or `[min, max]` for `PerformanceMonitor` to adjust within. */
  dpr: number | [number, number];
  antialias: boolean;
  /** Which screen-texture resolution tier (plan §3.1: S/M/L) this render tier uses — low tier always uses M, never the sharper L, regardless of viewport width. */
  screenTextureTier: "S" | "M" | "L";
}

export const QUALITY_TIERS: Record<QualityTierName, QualityTier> = {
  low: { dpr: 1, antialias: false, screenTextureTier: "M" },
  high: { dpr: [1, 1.5], antialias: true, screenTextureTier: "M" }, // screenTextureTier here is a floor; useViewportProfile (M8+) raises it to L on a wide/high-DPR desktop
};

/** `useDetectGPU().tier <= 1` is "low" (plan §2.3) — everything else is "high" and gets the adaptive DPR range + PerformanceMonitor. */
export function qualityTierForGPU(gpuTier: number): QualityTierName {
  return gpuTier <= 1 ? "low" : "high";
}
