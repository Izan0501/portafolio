import { clamp01 } from "@/lib/math/ease";

/**
 * A degree's real time-based progress, 0..1 — computed from its real
 * start/end dates and the current date, not copied from the artifact's
 * own fixed "62%" (confirmed with Ivo: the artifact's number has no
 * visible formula deriving it from real dates, and computing it today
 * from the same UTN dates already gives ~91%, not 62% — it was stale the
 * moment it would have been ported literally). `now` is a parameter
 * (not `new Date()` inline) so this stays a pure, testable function.
 */
export function programProgress(startISO: string, endISO: string, now: Date): number {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return clamp01((now.getTime() - start) / (end - start));
}
