"use client";

import { useRef } from "react";
import { m, useAnimationFrame, useTransform } from "motion/react";
import type { ChapterRange, NarrativeChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow, chapterProgressAt } from "@/features/scroll/chapterMath";
import { scrollStore } from "@/features/scroll/scrollStore";
import { pipelineStageAt } from "@/features/chapters/pipelineProgress";

/**
 * The Garantías chapter's copy — a dedicated component (plan M12), same
 * reason `Formation.tsx` (M10) got one: the 5 real pipeline stages render
 * as an accessible list, each marked `data-on="true"` while it's the
 * stage actively "in progress" in the 3D `deploy.sh` screen (artifact's
 * own stage highlight, `pipelineStageAt`'s `activeIndex`). Written
 * imperatively (`useAnimationFrame`) because the active index changes
 * with scroll — never React state, same pattern as `Formation.tsx`.
 */

function useActiveStageRefs(chapter: ChapterRange, stepCount: number) {
  const itemRefs = useRef<Array<HTMLLIElement | null>>(Array(stepCount).fill(null));
  const lastActive = useRef<number>(-2);

  useAnimationFrame(() => {
    const p = scrollStore.p;
    const isPipeChapter = p >= chapter.a && p < chapter.b;
    const active = isPipeChapter ? pipelineStageAt(chapterProgressAt(p, chapter)).activeIndex : -1;
    if (active === lastActive.current) return;
    lastActive.current = active;
    itemRefs.current.forEach((item, i) => {
      item?.setAttribute("data-on", i === active ? "true" : "false");
    });
  });

  return itemRefs;
}

export function Guarantees({ chapter, copy, locale }: { chapter: ChapterRange; copy: NarrativeChapterCopy; locale: Locale }) {
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const steps = copy.steps ?? [];
  const itemRefs = useActiveStageRefs(chapter, steps.length);

  return (
    <m.div
      data-chapter-id={chapter.id}
      style={{ opacity, y, willChange, pointerEvents }}
      className="absolute left-[clamp(20px,6vw,96px)] top-1/2 w-[min(440px,36vw)] max-w-[calc(100vw-40px)] -translate-y-1/2 transform-gpu"
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {copy.eyebrowLabel[locale]}
      </p>
      <h2 className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">{copy.heading[locale]}</h2>
      <p className="text-lead leading-[1.55] text-texto-2">{copy.lead[locale]}</p>

      <ol className="mt-4 flex flex-col gap-2 list-none p-0" aria-label={locale === "es" ? "Etapas del proceso" : "Process stages"}>
        {steps.map((step, i) => (
          <li
            key={step.index}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            data-on="false"
            className="rounded-panel bg-carbon px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-linea)] text-[13px] text-texto-2 data-[on=true]:shadow-[inset_0_0_0_1px_var(--color-limon)] data-[on=true]:text-hueso"
          >
            <span className="font-mono text-[11px] text-limon pr-1.5">{step.index}</span>
            <strong className="text-hueso font-semibold">{step.title[locale]}</strong>
            <em className="not-italic"> · {step.detail[locale]}</em>
          </li>
        ))}
      </ol>
    </m.div>
  );
}

export default Guarantees;
