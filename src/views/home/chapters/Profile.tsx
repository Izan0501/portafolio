"use client";

import { m, useTransform } from "motion/react";
import type { ChapterRange, NarrativeChapterCopy } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { scrollPMotionValue } from "@/features/scroll/scrollMotionValue";
import { chapterFadeWindow, chapterProgressAt } from "@/features/scroll/chapterMath";
import { Sheet } from "@/components/ui/Sheet";

/**
 * The Perfil chapter's copy — a dedicated component (plan M9) rather than
 * `NarrativeChapter`, for one real behavioral difference: the 4 `facts`
 * count up instead of appearing static, mirroring the artifact's own
 * `_phProf` (`cnt = smoothstep(0.08, 0.42, k)`, the iPhone screen's own
 * count-up) so the DOM and the 3D screens agree instead of one animating
 * and the other not.
 *
 * `timeline` (the real 2023-2027 milestones, same ones `macbook/screens/
 * profile.ts` draws on the Mac's screen) renders here as a real ordered
 * list — CLAUDE.md: "el 3D va aria-hidden", so anything the canvas shows
 * that's actually factual content needs a DOM twin to stay indexable.
 *
 * M13: `facts` (already compact) stay always-visible in the sheet; the
 * longer pieces (`timeline`, the stack `detail` paragraph, `team`) move
 * into `moreContent` — same split the artifact's own `t2` uses for its
 * stack/team paragraphs, extended here to `timeline` too (the artifact
 * has no DOM timeline at all — M9's own addition, so M13 had to decide
 * where it goes; grouping it with the other "more" content keeps the
 * collapsed sheet from running long on a short phone screen).
 */

function AnimatedFact({ value, label, chapter }: { value: string; label: string; chapter: ChapterRange }) {
  const numericValue = Number(value);
  const display = useTransform(scrollPMotionValue, (p) => {
    if (!Number.isFinite(numericValue)) return value;
    const k = chapterProgressAt(p, chapter);
    const countUp = Math.min(1, Math.max(0, (k - 0.08) / 0.34));
    const eased = countUp * countUp * (3 - 2 * countUp);
    return String(Math.round(numericValue * eased));
  });

  return (
    <div className="rounded-panel bg-carbon px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-linea)]">
      <m.dt className="text-[30px] font-extrabold leading-none text-limon tabular-nums">{display}</m.dt>
      <dd className="mt-1 font-mono text-[11px] text-texto-2">{label}</dd>
    </div>
  );
}

export function Profile({ chapter, copy, locale }: { chapter: ChapterRange; copy: NarrativeChapterCopy; locale: Locale }) {
  const opacity = useTransform(scrollPMotionValue, (p) => chapterFadeWindow(chapter, p).opacity);
  const y = useTransform(opacity, (o) => (1 - o) * 16);
  const willChange = useTransform(opacity, (o) => (o > 0.01 && o < 0.99 ? "transform, opacity" : "auto"));
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const moreContent = (
    <>
      {copy.timeline && (
        <ol className="flex flex-col gap-2 list-none p-0" aria-label={locale === "es" ? "Trayectoria" : "Timeline"}>
          {copy.timeline.map((milestone) => (
            <li key={milestone.year} className="grid grid-cols-[52px_minmax(0,1fr)] gap-2 text-[14px] leading-[1.45] text-texto-2">
              <span className="font-mono text-[11px] text-limon pt-0.5 tabular-nums">{milestone.year}</span>
              <div>
                <strong className="text-hueso font-semibold">{milestone.title[locale]}</strong> · {milestone.detail[locale]}
              </div>
            </li>
          ))}
        </ol>
      )}
      {copy.detail?.map((paragraph, i) => (
        <p key={i} className="text-[16px] leading-[1.55] text-texto-2 mt-3.5 first:mt-0">
          {paragraph[locale]}
        </p>
      ))}
      {copy.team && <p className="text-[16px] leading-[1.55] text-texto-2 mt-3.5">{copy.team[locale]}</p>}
    </>
  );

  return (
    <Sheet chapter={chapter} style={{ opacity, y, willChange, pointerEvents }} locale={locale} moreContent={moreContent}>
      <p className="iz-eyebrow font-mono text-[12px] uppercase tracking-[0.04em] text-piedra mb-[18px]">
        <b className="text-limon font-semibold">{copy.eyebrowIndex}</b> · {copy.eyebrowLabel[locale]}
      </p>
      <h2 id={`heading-${chapter.id}`} className="text-h2 font-extrabold tracking-[-0.03em] leading-[1.02] text-hueso mb-3.5">
        {copy.heading[locale]}
      </h2>
      <p className="iz-lead text-lead leading-[1.55] text-texto-2">{copy.lead[locale]}</p>

      {copy.facts && (
        <dl className="mt-3.5 grid grid-cols-2 gap-2">
          {copy.facts.map((fact) => (
            <AnimatedFact key={fact.label[locale]} value={fact.value} label={fact.label[locale]} chapter={chapter} />
          ))}
        </dl>
      )}
    </Sheet>
  );
}

export default Profile;
