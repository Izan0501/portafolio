import { describe, expect, it } from "vitest";
import { PIPELINE_STAGE_COUNT, pipelineStageAt } from "./pipelineProgress";

describe("pipelineStageAt", () => {
  it("starts at stage 0 with no progress", () => {
    expect(pipelineStageAt(0)).toEqual({ activeIndex: 0, stageProgress: 0 });
  });

  it("reaches the last stage before the chapter itself ends (the *1.15 head start)", () => {
    const atChapterEnd = pipelineStageAt(1);
    expect(atChapterEnd.activeIndex).toBe(PIPELINE_STAGE_COUNT - 1);
    expect(atChapterEnd.stageProgress).toBeCloseTo(1, 5);

    // prog hits 4 (the last stage's own start) at k = 0.8/1.15 ≈ 0.6957 —
    // just before that, the last stage hasn't started yet.
    const justBefore = pipelineStageAt(0.6);
    expect(justBefore.activeIndex).toBeLessThan(PIPELINE_STAGE_COUNT - 1);
  });

  it("advances through all 5 stages in order", () => {
    const seen = new Set<number>();
    for (let k = 0; k <= 1; k += 0.01) seen.add(pipelineStageAt(k).activeIndex);
    expect([...seen].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });
});
