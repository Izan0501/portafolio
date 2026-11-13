import { clamp01 } from "@/lib/math/ease";

/** Total real stages in the artifact's `deploy.sh` pipeline (Garantías). */
export const PIPELINE_STAGE_COUNT = 5;

export interface PipelineStage {
  /** Index of the stage currently "in progress", -1 before the chapter starts. */
  activeIndex: number;
  /** 0..1 progress *within* the active stage (artifact `prog - act`) — drives its inner progress bar. */
  stageProgress: number;
}

/**
 * The deploy pipeline's stage progress (artifact `_drawMac`'s `'pipe'`
 * mode, line 1665: `const prog = this._c01(st.k * 1.15) * 5, act =
 * Math.min(4, Math.floor(prog));`). `chapterLocalK` is the chapter's own
 * 0..1 progress (`chapterProgressAt`) — the `*1.15` means the last stage
 * reaches 100% slightly before the chapter itself ends.
 */
export function pipelineStageAt(chapterLocalK: number): PipelineStage {
  const prog = clamp01(chapterLocalK * 1.15) * PIPELINE_STAGE_COUNT;
  const activeIndex = Math.min(PIPELINE_STAGE_COUNT - 1, Math.floor(prog));
  return { activeIndex, stageProgress: prog - activeIndex };
}
