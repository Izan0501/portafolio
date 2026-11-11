import type { ChapterRange } from "@/types/content";

/**
 * Target width/height for the on-screen 3D island, by chapter (artifact
 * `_screens`, lines 1505-1508: `let tg = [100, 30]; if (st.shot || id ===
 * 'cert' || id === 'prof') tg = [218, 32]; if (id === 'cta') tg = [312,
 * 72];`). `st.shot` (project showcase screenshots) doesn't exist until
 * M11 — only the plain chapter-id branches are reachable today.
 */
export function islandTargetSize(chapterId: ChapterRange["id"]): readonly [number, number] {
  if (chapterId === "cta") return [312, 72];
  if (chapterId === "cert" || chapterId === "prof") return [218, 32];
  return [100, 30];
}
